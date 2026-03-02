import express, { Request, Response } from 'express';
import { query, execute, getPool } from '../database.js';
import { RowDataPacket } from 'mysql2/promise';

const router = express.Router();

// Helper: Build full bet object from DB
async function buildBet(row: any) {
  // Get driver predictions
  const driverPreds = await query<RowDataPacket[]>(
    `SELECT bp.position, d.id, d.name, d.nationality, d.team_id, d.number, d.image_url, t.name as team_name
     FROM bet_predictions bp 
     JOIN drivers d ON bp.driver_id = d.id 
     LEFT JOIN teams t ON d.team_id = t.id
     WHERE bp.bet_id = ? ORDER BY bp.position`,
    [row.id]
  );
  // Get team predictions
  const teamPreds = await query<RowDataPacket[]>(
    `SELECT btp.position, t.id, t.name, t.nationality, t.logo_url
     FROM bet_team_predictions btp 
     JOIN teams t ON btp.team_id = t.id
     WHERE btp.bet_id = ? ORDER BY btp.position`,
    [row.id]
  );

  return {
    id: row.id,
    userId: row.user_id,
    eventId: row.event_id,
    predictions: driverPreds.map(d => ({
      id: d.id, name: d.name, nationality: d.nationality, teamId: d.team_id,
      teamName: d.team_name || 'Unknown', number: d.number, imageUrl: d.image_url
    })),
    teamPredictions: teamPreds.map(t => ({
      id: t.id, name: t.name, nationality: t.nationality, logoUrl: t.logo_url
    })),
    timestamp: new Date(row.timestamp),
    status: row.status,
    lockedMultiplier: row.locked_multiplier
  };
}

// GET /api/bets
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    let sql = 'SELECT * FROM bets';
    const params: any[] = [];
    if (userId) { sql += ' WHERE user_id = ?'; params.push(userId); }
    sql += ' ORDER BY timestamp DESC';
    
    const rows = await query<RowDataPacket[]>(sql, params);
    const bets = await Promise.all(rows.map(r => buildBet(r)));
    res.json(bets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bets
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, eventId, predictions, teamPredictions } = req.body;
    
    // Get user
    const userRows = await query<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [userId]);
    if (userRows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userRows[0];

    // Get event
    const eventRows = await query<RowDataPacket[]>(`SELECT * FROM events WHERE id = ?`, [eventId]);
    if (eventRows.length === 0) return res.status(404).json({ error: 'Event not found' });
    const event = eventRows[0];

    if (user.balance < event.bet_value) return res.status(400).json({ error: 'Insufficient balance' });
    if (event.status !== 'Upcoming') return res.status(400).json({ error: 'Betting is closed for this event.' });

    // Max 4 active bets per event per user
    const activeBets = await query<RowDataPacket[]>(
      `SELECT COUNT(*) as cnt FROM bets WHERE user_id = ? AND event_id = ? AND status = 'Active'`,
      [userId, eventId]
    );
    if (activeBets[0].cnt >= 4) return res.status(400).json({ error: 'Maximum of 4 active bets per event allowed.' });

    // Calculate multiplier
    const now = Date.now();
    const eventTime = new Date(event.date).getTime();
    const secondsRemaining = (eventTime - now) / 1000;
    let multiplier = 1.0;
    if (secondsRemaining > 432000) multiplier = 5.0;
    else if (secondsRemaining > 259200) multiplier = 3.0;
    else if (secondsRemaining > 86400) multiplier = 1.5;

    // Generate unique bet ID using timestamp
    const betId = `bet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Deduct balance
      await conn.query(`UPDATE users SET balance = balance - ? WHERE id = ?`, [event.bet_value, userId]);
      // Add to pool
      await conn.query(`UPDATE events SET pool_prize = pool_prize + ? WHERE id = ?`, [event.bet_value, eventId]);
      // Create bet
      await conn.query(
        `INSERT INTO bets (id, user_id, event_id, timestamp, status, locked_multiplier) VALUES (?, ?, ?, NOW(), 'Active', ?)`,
        [betId, userId, eventId, multiplier]
      );
      // Insert driver predictions
      if (predictions && predictions.length > 0) {
        for (let i = 0; i < predictions.length; i++) {
          await conn.query(
            `INSERT INTO bet_predictions (bet_id, position, driver_id) VALUES (?, ?, ?)`,
            [betId, i, predictions[i].id]
          );
        }
      }
      // Insert team predictions
      if (teamPredictions && teamPredictions.length > 0) {
        for (let i = 0; i < teamPredictions.length; i++) {
          await conn.query(
            `INSERT INTO bet_team_predictions (bet_id, position, team_id) VALUES (?, ?, ?)`,
            [betId, i, teamPredictions[i].id]
          );
        }
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    // Return updated user and event
    const updatedUserRows = await query<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [userId]);
    const updatedEventRows = await query<RowDataPacket[]>(`SELECT * FROM events WHERE id = ?`, [eventId]);
    const { buildUser } = await import('./auth.js');
    const updatedUser = await buildUser(updatedUserRows[0]);
    const updatedEvent = {
      id: updatedEventRows[0].id,
      roundId: updatedEventRows[0].round_id,
      type: updatedEventRows[0].type,
      date: new Date(updatedEventRows[0].date),
      status: updatedEventRows[0].status,
      betValue: updatedEventRows[0].bet_value,
      poolPrize: updatedEventRows[0].pool_prize
    };

    res.json({ updatedUser, updatedEvent });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/bets/:id (cancel)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const betRows = await query<RowDataPacket[]>(`SELECT * FROM bets WHERE id = ?`, [req.params.id]);
    if (betRows.length === 0) return res.status(404).json({ error: 'Bet not found' });
    const bet = betRows[0];
    if (bet.status !== 'Active') return res.status(400).json({ error: 'Can only cancel active bets' });

    const eventRows = await query<RowDataPacket[]>(`SELECT * FROM events WHERE id = ?`, [bet.event_id]);
    if (eventRows.length === 0) return res.status(400).json({ error: 'Event not found' });
    const event = eventRows[0];

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(`UPDATE users SET balance = balance + ? WHERE id = ?`, [event.bet_value, bet.user_id]);
      await conn.query(`UPDATE events SET pool_prize = pool_prize - ? WHERE id = ?`, [event.bet_value, bet.event_id]);
      await conn.query(`UPDATE bets SET status = 'Cancelled' WHERE id = ?`, [req.params.id]);
      
      // Notification
      const notifId = `notif-${Date.now()}`;
      await conn.query(
        `INSERT INTO notifications (id, user_id, message, timestamp, is_read, sender, type) VALUES (?, ?, ?, NOW(), 0, 'System', 'general')`,
        [notifId, bet.user_id, `Your bet for ${event.type} has been cancelled. ${event.bet_value} Fun-Coins have been refunded to your balance.`]
      );
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
