import express, { Request, Response } from 'express';
import { query, execute, getPool } from '../database.js';
import { RowDataPacket } from 'mysql2/promise';

const router = express.Router();

// Helper: Build full league object
async function buildLeague(row: any) {
  const members = await query<RowDataPacket[]>(
    `SELECT user_id, status FROM league_members WHERE league_id = ?`, [row.id]
  );
  const memberIds = members.map(m => m.user_id);
  const memberStatus: Record<string, string> = {};
  members.forEach(m => { memberStatus[m.user_id] = m.status; });

  // Messages with reactions (last 10 days)
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
  const messages = await query<RowDataPacket[]>(
    `SELECT * FROM league_messages WHERE league_id = ? AND timestamp > ? ORDER BY timestamp`,
    [row.id, tenDaysAgo]
  );

  const fullMessages = await Promise.all(messages.map(async (msg) => {
    const likes = await query<RowDataPacket[]>(
      `SELECT user_id FROM message_reactions WHERE message_id = ? AND type = 'like'`, [msg.id]
    );
    const dislikes = await query<RowDataPacket[]>(
      `SELECT user_id FROM message_reactions WHERE message_id = ? AND type = 'dislike'`, [msg.id]
    );
    return {
      id: msg.id,
      userId: msg.user_id,
      username: msg.username,
      avatarUrl: msg.avatar_url,
      globalRank: msg.global_rank,
      message: msg.message,
      timestamp: new Date(msg.timestamp),
      likes: likes.map(l => l.user_id),
      dislikes: dislikes.map(d => d.user_id)
    };
  }));

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    adminId: row.admin_id,
    isPrivate: !!row.is_private,
    inviteCode: row.invite_code,
    members: memberIds,
    createdAt: new Date(row.created_at),
    hasChat: !!row.has_chat,
    prize: row.prize_title ? { title: row.prize_title, imageUrl: row.prize_image_url || '', rules: row.prize_rules || '' } : undefined,
    messages: fullMessages,
    memberStatus
  };
}

// GET /api/leagues
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await query<RowDataPacket[]>(`SELECT * FROM leagues`);
    const leagues = await Promise.all(rows.map(r => buildLeague(r)));
    res.json(leagues);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leagues
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, name, description, isPrivate, hasChat, prize } = req.body;
    const id = `league-${Date.now()}`;
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    await execute(
      `INSERT INTO leagues (id, name, description, admin_id, is_private, invite_code, created_at, has_chat, prize_title, prize_image_url, prize_rules) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [id, name, description, userId, isPrivate ? 1 : 0, inviteCode, hasChat ? 1 : 0, prize?.title || null, prize?.imageUrl || null, prize?.rules || null]
    );

    await execute(`INSERT INTO league_members (league_id, user_id, status) VALUES (?, ?, 'active')`, [id, userId]);

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/leagues/:id/settings
router.put('/:id/settings', async (req: Request, res: Response) => {
  try {
    const { hasChat, prize } = req.body;
    const sets: string[] = [];
    const params: any[] = [];
    if (hasChat !== undefined) { sets.push('has_chat = ?'); params.push(hasChat ? 1 : 0); }
    if (prize !== undefined) {
      sets.push('prize_title = ?'); params.push(prize.title || null);
      sets.push('prize_image_url = ?'); params.push(prize.imageUrl || null);
      sets.push('prize_rules = ?'); params.push(prize.rules || null);
    }
    if (sets.length > 0) {
      params.push(req.params.id);
      await execute(`UPDATE leagues SET ${sets.join(', ')} WHERE id = ?`, params);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leagues/:id/join
router.post('/:id/join', async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;
    const leagueRows = await query<RowDataPacket[]>(`SELECT * FROM leagues WHERE id = ?`, [req.params.id]);
    if (leagueRows.length === 0) return res.status(404).json({ error: 'League not found' });
    const league = leagueRows[0];

    const existing = await query<RowDataPacket[]>(
      `SELECT user_id FROM league_members WHERE league_id = ? AND user_id = ?`, [req.params.id, userId]
    );
    if (existing.length > 0) return res.status(400).json({ error: 'Already a member' });

    if (league.is_private && code !== league.invite_code) {
      return res.status(400).json({ error: 'Invalid invite code for private league' });
    }

    await execute(`INSERT INTO league_members (league_id, user_id, status) VALUES (?, ?, 'active')`, [req.params.id, userId]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leagues/:id/leave
router.post('/:id/leave', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    await execute(`DELETE FROM league_members WHERE league_id = ? AND user_id = ?`, [req.params.id, userId]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leagues/:id/invite
router.post('/:id/invite', async (req: Request, res: Response) => {
  try {
    const { adminId, targetUsername } = req.body;
    const leagueRows = await query<RowDataPacket[]>(`SELECT * FROM leagues WHERE id = ?`, [req.params.id]);
    if (leagueRows.length === 0) return res.status(404).json({ error: 'League not found' });
    const league = leagueRows[0];
    if (league.admin_id !== adminId) return res.status(403).json({ error: 'Only admin can invite' });

    const targetRows = await query<RowDataPacket[]>(`SELECT * FROM users WHERE username = ?`, [targetUsername]);
    if (targetRows.length === 0) return res.status(404).json({ error: 'User not found' });
    const target = targetRows[0];

    const existing = await query<RowDataPacket[]>(
      `SELECT user_id FROM league_members WHERE league_id = ? AND user_id = ?`, [req.params.id, target.id]
    );
    if (existing.length > 0) return res.status(400).json({ error: 'User already in league' });

    const notifId = `invite-${Date.now()}`;
    await execute(
      `INSERT INTO notifications (id, user_id, message, timestamp, is_read, sender, type, meta_league_id, meta_league_name) VALUES (?, ?, ?, NOW(), 0, 'League Admin', 'invite', ?, ?)`,
      [notifId, target.id, `You have been invited to join the league "${league.name}".`, league.id, league.name]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leagues/:id/messages
router.post('/:id/messages', async (req: Request, res: Response) => {
  try {
    const { userId, message } = req.body;
    const leagueRows = await query<RowDataPacket[]>(`SELECT * FROM leagues WHERE id = ?`, [req.params.id]);
    if (leagueRows.length === 0) return res.status(404).json({ error: 'League not found' });
    const league = leagueRows[0];
    if (!league.has_chat) return res.status(400).json({ error: 'Chat is disabled for this league' });

    const userRows = await query<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [userId]);
    if (userRows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userRows[0];

    // Check member status
    const memberRows = await query<RowDataPacket[]>(
      `SELECT status FROM league_members WHERE league_id = ? AND user_id = ?`, [req.params.id, userId]
    );
    if (memberRows.length > 0) {
      if (memberRows[0].status === 'banned') return res.status(403).json({ error: 'You are banned from this league.' });
      if (memberRows[0].status === 'suspended') return res.status(403).json({ error: 'You are suspended from chatting.' });
    }

    // Calculate global rank
    const rankRows = await query<RowDataPacket[]>(
      `SELECT COUNT(*) as rank_pos FROM users WHERE points > (SELECT points FROM users WHERE id = ?)`, [userId]
    );
    const globalRank = (rankRows[0]?.rank_pos || 0) + 1;

    const msgId = `msg-${Date.now()}`;
    await execute(
      `INSERT INTO league_messages (id, league_id, user_id, username, avatar_url, global_rank, message, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [msgId, req.params.id, userId, user.username, user.avatar_url, globalRank, message]
    );
    res.json({ success: true, id: msgId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leagues/:id/messages/:msgId/react
router.post('/:id/messages/:msgId/react', async (req: Request, res: Response) => {
  try {
    const { userId, type } = req.body; // type: 'like' | 'dislike'
    
    // Check if reaction exists
    const existing = await query<RowDataPacket[]>(
      `SELECT type FROM message_reactions WHERE message_id = ? AND user_id = ?`,
      [req.params.msgId, userId]
    );

    if (existing.length > 0) {
      if (existing[0].type === type) {
        // Toggle off
        await execute(`DELETE FROM message_reactions WHERE message_id = ? AND user_id = ?`, [req.params.msgId, userId]);
      } else {
        // Switch reaction
        await execute(`UPDATE message_reactions SET type = ? WHERE message_id = ? AND user_id = ?`, [type, req.params.msgId, userId]);
      }
    } else {
      await execute(`INSERT INTO message_reactions (message_id, user_id, type) VALUES (?, ?, ?)`, [req.params.msgId, userId, type]);
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leagues/:id/moderate
router.post('/:id/moderate', async (req: Request, res: Response) => {
  try {
    const { adminId, targetUserId, action } = req.body;
    const leagueRows = await query<RowDataPacket[]>(`SELECT * FROM leagues WHERE id = ?`, [req.params.id]);
    if (leagueRows.length === 0) return res.status(404).json({ error: 'League not found' });
    if (leagueRows[0].admin_id !== adminId) return res.status(403).json({ error: 'Only admin can moderate' });
    if (adminId === targetUserId) return res.status(400).json({ error: 'Cannot moderate yourself' });

    const newStatus = action === 'unsuspend' ? 'active' : action;
    await execute(
      `UPDATE league_members SET status = ? WHERE league_id = ? AND user_id = ?`,
      [newStatus, req.params.id, targetUserId]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
