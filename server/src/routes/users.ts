import express, { Request, Response } from 'express';
import { query, execute } from '../database.js';
import { RowDataPacket } from 'mysql2/promise';
import { buildUser } from './auth.js';

const router = express.Router();

// GET /api/users
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await query<RowDataPacket[]>(`SELECT * FROM users`);
    const users = await Promise.all(rows.map(r => buildUser(r)));
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const rows = await query<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = await buildUser(rows[0]);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/by-username/:username
router.get('/by-username/:username', async (req: Request, res: Response) => {
  try {
    const rows = await query<RowDataPacket[]>(`SELECT * FROM users WHERE username = ?`, [req.params.username]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = await buildUser(rows[0]);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const sets: string[] = [];
    const params: any[] = [];

    if (updates.username !== undefined) { sets.push('username = ?'); params.push(updates.username); }
    if (updates.avatarUrl !== undefined) { sets.push('avatar_url = ?'); params.push(updates.avatarUrl); }
    if (updates.balance !== undefined) { sets.push('balance = ?'); params.push(updates.balance); }
    if (updates.points !== undefined) { sets.push('points = ?'); params.push(updates.points); }
    if (updates.rank !== undefined) { sets.push('`rank` = ?'); params.push(updates.rank); }
    if (updates.isAdmin !== undefined) { sets.push('is_admin = ?'); params.push(updates.isAdmin ? 1 : 0); }
    if (updates.age !== undefined) { sets.push('age = ?'); params.push(updates.age); }
    if (updates.country !== undefined) { sets.push('country = ?'); params.push(updates.country); }
    if (updates.timezone !== undefined) { sets.push('timezone = ?'); params.push(updates.timezone); }
    if (updates.termsAccepted !== undefined) { sets.push('terms_accepted = ?'); params.push(updates.termsAccepted ? 1 : 0); }
    if (updates.email !== undefined) { sets.push('email = ?'); params.push(updates.email); }
    if (updates.phone !== undefined) { sets.push('phone = ?'); params.push(updates.phone); }
    if (updates.password !== undefined) { sets.push('password = ?'); params.push(updates.password); }
    if (updates.location) {
      sets.push('lat = ?'); params.push(updates.location.lat);
      sets.push('lng = ?'); params.push(updates.location.lng);
    }

    if (sets.length > 0) {
      params.push(req.params.id);
      await execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
    }

    const rows = await query<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = await buildUser(rows[0]);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:id/notifications
router.post('/:id/notifications', async (req: Request, res: Response) => {
  try {
    const { message, sender, type, meta } = req.body;
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    await execute(
      `INSERT INTO notifications (id, user_id, message, timestamp, is_read, sender, type, meta_league_id, meta_league_name) VALUES (?, ?, ?, NOW(), 0, ?, ?, ?, ?)`,
      [notifId, req.params.id, message, sender || 'System', type || 'general', meta?.leagueId || null, meta?.leagueName || null]
    );
    res.json({ success: true, id: notifId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/notifications/send
router.post('/notifications/send', async (req: Request, res: Response) => {
  try {
    const { target, message } = req.body;
    let userIds: string[] = [];

    if (target.type === 'all') {
      const rows = await query<RowDataPacket[]>(`SELECT id FROM users`);
      userIds = rows.map(r => r.id);
    } else if (target.type === 'user' && target.userId) {
      userIds = [target.userId];
    } else if (target.type === 'filter' && target.criteria) {
      let sql = 'SELECT id FROM users WHERE 1=1';
      const params: any[] = [];
      if (target.criteria.minAge) { sql += ' AND age >= ?'; params.push(target.criteria.minAge); }
      if (target.criteria.maxAge) { sql += ' AND age <= ?'; params.push(target.criteria.maxAge); }
      if (target.criteria.country) { sql += ' AND LOWER(country) = LOWER(?)'; params.push(target.criteria.country); }
      const rows = await query<RowDataPacket[]>(sql, params);
      userIds = rows.map(r => r.id);
    }

    for (const uid of userIds) {
      const notifId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      await execute(
        `INSERT INTO notifications (id, user_id, message, timestamp, is_read, sender, type) VALUES (?, ?, ?, NOW(), 0, 'Admin', 'general')`,
        [notifId, uid, message]
      );
    }

    res.json({ success: true, count: userIds.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:userId/notifications/:notifId/read
router.patch('/:userId/notifications/:notifId/read', async (req: Request, res: Response) => {
  try {
    await execute(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [req.params.notifId, req.params.userId]);
    const rows = await query<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [req.params.userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = await buildUser(rows[0]);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
