import express, { Request, Response } from 'express';
import { query, execute } from '../database.js';
import { RowDataPacket } from 'mysql2/promise';

const router = express.Router();

// GET /api/teams
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await query<RowDataPacket[]>(`SELECT * FROM teams`);
    res.json(rows.map(r => ({
      id: r.id,
      name: r.name,
      nationality: r.nationality,
      logoUrl: r.logo_url
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, nationality, logoUrl } = req.body;
    const id = name.toLowerCase().replace(/\s/g, '');
    await execute(
      `INSERT INTO teams (id, name, nationality, logo_url) VALUES (?, ?, ?, ?)`,
      [id, name, nationality, logoUrl]
    );
    res.json({ id, name, nationality, logoUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/teams/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, nationality, logoUrl } = req.body;
    await execute(
      `UPDATE teams SET name = ?, nationality = ?, logo_url = ? WHERE id = ?`,
      [name, nationality, logoUrl, req.params.id]
    );
    res.json({ id: req.params.id, name, nationality, logoUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/teams/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // Check for assigned drivers
    const drivers = await query<RowDataPacket[]>(`SELECT id FROM drivers WHERE team_id = ?`, [req.params.id]);
    if (drivers.length > 0) {
      return res.status(400).json({ error: 'Cannot delete team with assigned drivers.' });
    }
    await execute(`DELETE FROM teams WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
