import express, { Request, Response } from 'express';
import { query, execute } from '../database.js';
import { RowDataPacket } from 'mysql2/promise';

const router = express.Router();

// GET /api/rounds
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await query<RowDataPacket[]>(`SELECT * FROM rounds ORDER BY number`);
    res.json(rows.map(r => ({
      id: r.id,
      number: r.number,
      name: r.name,
      location: r.location,
      circuit: r.circuit
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rounds
router.post('/', async (req: Request, res: Response) => {
  try {
    const { number, name, location, circuit } = req.body;
    
    if (!name || number === undefined || number === null) {
      return res.status(400).json({ error: 'Missing required fields: number, name' });
    }

    // Generate unique round ID using timestamp
    const id = `round-${Date.now()}`;
    
    await execute(
      `INSERT INTO rounds (id, number, name, location, circuit) VALUES (?, ?, ?, ?, ?)`,
      [id, number, name, location || '', circuit || '']
    );

    console.log(`Round created: ${id} - ${name}`);

    // Give 50 coins to every user + notification (non-blocking: don't fail round creation)
    try {
      const users = await query<RowDataPacket[]>(`SELECT id FROM users`);
      await execute(`UPDATE users SET balance = balance + 50`);
      
      for (const u of users) {
        const nid = `notif-roundbonus-${id}-${u.id}-${Date.now()}`;
        await execute(
          `INSERT INTO notifications (id, user_id, message, timestamp, is_read, sender, type) VALUES (?, ?, ?, NOW(), 0, 'System', 'general')`,
          [nid, u.id, `New Round Created: ${name}! You received 50 Fun-Coins.`]
        );
      }
    } catch (bonusErr: any) {
      console.error(`Round bonus/notification failed (round still saved):`, bonusErr.message);
    }

    res.json({ id, number, name, location, circuit });
  } catch (err: any) {
    console.error(`Round creation failed:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/rounds/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { number, name, location, circuit } = req.body;
    await execute(
      `UPDATE rounds SET number = ?, name = ?, location = ?, circuit = ? WHERE id = ?`,
      [number, name, location, circuit, req.params.id]
    );
    res.json({ id: req.params.id, number, name, location, circuit });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/rounds/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const events = await query<RowDataPacket[]>(`SELECT id FROM events WHERE round_id = ?`, [req.params.id]);
    if (events.length > 0) {
      return res.status(400).json({ error: 'Cannot delete round with existing events. Delete events first.' });
    }
    await execute(`DELETE FROM rounds WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
