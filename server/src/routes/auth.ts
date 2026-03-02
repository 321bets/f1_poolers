import express, { Request, Response } from 'express';
import { query, execute } from '../database.js';
import { RowDataPacket } from 'mysql2/promise';

const router = express.Router();

// Helper to get user notifications
async function getUserNotifications(userId: string) {
  const rows = await query<RowDataPacket[]>(
    `SELECT id, message, timestamp, is_read, sender, type, meta_league_id, meta_league_name FROM notifications WHERE user_id = ? ORDER BY timestamp DESC`,
    [userId]
  );
  return rows.map(r => ({
    id: r.id,
    message: r.message,
    timestamp: new Date(r.timestamp),
    read: !!r.is_read,
    sender: r.sender || 'System',
    type: r.type || 'general',
    ...(r.meta_league_id ? { meta: { leagueId: r.meta_league_id, leagueName: r.meta_league_name } } : {})
  }));
}

// Helper to get user joined leagues
async function getUserLeagues(userId: string) {
  const rows = await query<RowDataPacket[]>(
    `SELECT league_id FROM league_members WHERE user_id = ?`,
    [userId]
  );
  return rows.map(r => r.league_id);
}

// Helper to build full user object
async function buildUser(row: any, includePassword = false) {
  const notifs = await getUserNotifications(row.id);
  const leagues = await getUserLeagues(row.id);
  const user: any = {
    id: row.id,
    username: row.username,
    avatarUrl: row.avatar_url,
    balance: row.balance,
    points: row.points,
    rank: row.rank || 0,
    isAdmin: !!row.is_admin,
    age: row.age,
    country: row.country,
    location: row.lat != null ? { lat: row.lat, lng: row.lng } : undefined,
    timezone: row.timezone || 'America/New_York',
    termsAccepted: !!row.terms_accepted,
    email: row.email || undefined,
    phone: row.phone || undefined,
    notifications: notifs,
    joinedLeagues: leagues
  };
  if (includePassword) user.password = row.password;
  return user;
}

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const rows = await query<RowDataPacket[]>(
      `SELECT * FROM users WHERE username = ? AND password = ?`,
      [username, password]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = await buildUser(rows[0]);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, password, age, country, location, timezone } = req.body;
    
    const existing = await query<RowDataPacket[]>(`SELECT id FROM users WHERE username = ?`, [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Generate unique user ID using timestamp
    const userId = `user-${Date.now()}`;
    const avatarUrl = `https://picsum.photos/seed/${username}/100/100`;
    const lat = location?.lat || null;
    const lng = location?.lng || null;
    const tz = timezone || 'America/New_York';

    await execute(
      `INSERT INTO users (id, username, password, avatar_url, balance, points, \`rank\`, is_admin, age, country, lat, lng, timezone, terms_accepted) VALUES (?, ?, ?, ?, 100, 0, 0, 0, ?, ?, ?, ?, ?, 1)`,
      [userId, username, password, avatarUrl, age, country, lat, lng, tz]
    );

    // Welcome notification
    const notifId = `notif-${Date.now()}`;
    await execute(
      `INSERT INTO notifications (id, user_id, message, timestamp, is_read, sender, type) VALUES (?, ?, ?, NOW(), 0, 'System', 'general')`,
      [notifId, userId, `Welcome to F1™ Pool, ${username}! You've received 100 Fun-Coins. Good luck!`]
    );

    // Auto-join global league
    await execute(
      `INSERT INTO league_members (league_id, user_id, status) VALUES ('global-league', ?, 'active')`,
      [userId]
    );

    const userRows = await query<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [userId]);
    const user = await buildUser(userRows[0]);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
export { buildUser, getUserNotifications, getUserLeagues };
