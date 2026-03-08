import express, { Request, Response } from 'express';
import { query, execute } from '../database.js';
import { RowDataPacket } from 'mysql2/promise';

const router = express.Router();

// GET /api/events
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await query<RowDataPacket[]>(`SELECT * FROM events ORDER BY date`);
    res.json(rows.map(r => ({
      id: r.id,
      roundId: r.round_id,
      type: r.type,
      date: new Date(r.date),
      status: r.status,
      betValue: r.bet_value,
      poolPrize: r.pool_prize
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events
router.post('/', async (req: Request, res: Response) => {
  try {
    const { roundId, type, date, betValue } = req.body;
    // Generate unique event ID using timestamp + counter
    const id = `event-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const bv = betValue || 10;

    await execute(
      `INSERT INTO events (id, round_id, type, date, status, bet_value, pool_prize) VALUES (?, ?, ?, ?, 'Upcoming', ?, 0)`,
      [id, roundId, type, new Date(date), bv]
    );

    // Check for pending rollovers of the same event type
    let poolPrize = 0;
    try {
      const pendingRows = await query<RowDataPacket[]>(
        `SELECT * FROM pending_rollovers WHERE event_type = ?`, [type]
      );
      if (pendingRows.length > 0) {
        const totalRollover = pendingRows.reduce((sum: number, r: any) => sum + r.amount, 0);
        if (totalRollover > 0) {
          await execute(`UPDATE events SET pool_prize = pool_prize + ? WHERE id = ?`, [totalRollover, id]);
          poolPrize = totalRollover;
          // Delete applied rollovers
          for (const pr of pendingRows) {
            await execute(`DELETE FROM pending_rollovers WHERE id = ?`, [pr.id]);
          }
          console.log(`[ROLLOVER APPLIED] ${totalRollover} Fun-Coins applied to new ${type} event from pending rollovers`);
        }
      }
    } catch (rolloverErr) {
      // pending_rollovers table might not exist yet, silently continue
      console.log('[ROLLOVER] pending_rollovers table not available yet');
    }

    res.json({ id, roundId, type, date: new Date(date), status: 'Upcoming', betValue: bv, poolPrize });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { roundId, type, date, status, betValue, poolPrize } = req.body;
    await execute(
      `UPDATE events SET round_id = ?, type = ?, date = ?, status = ?, bet_value = ?, pool_prize = ? WHERE id = ?`,
      [roundId, type, new Date(date), status, betValue, poolPrize || 0, req.params.id]
    );
    res.json({ id: req.params.id, roundId, type, date: new Date(date), status, betValue, poolPrize: poolPrize || 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const bets = await query<RowDataPacket[]>(`SELECT id FROM bets WHERE event_id = ?`, [req.params.id]);
    if (bets.length > 0) {
      return res.status(400).json({ error: 'Cannot delete event with existing bets.' });
    }
    const results = await query<RowDataPacket[]>(`SELECT event_id FROM results WHERE event_id = ?`, [req.params.id]);
    if (results.length > 0) {
      return res.status(400).json({ error: 'Cannot delete event with existing results.' });
    }
    await execute(`DELETE FROM events WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
