import express, { Request, Response } from 'express';
import { query, execute } from '../database.js';
import { RowDataPacket } from 'mysql2/promise';

const router = express.Router();

// GET /api/drivers
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await query<RowDataPacket[]>(
      `SELECT d.id, d.name, d.nationality, d.team_id, d.number, d.image_url, t.name as team_name 
       FROM drivers d LEFT JOIN teams t ON d.team_id = t.id`
    );
    res.json(rows.map(r => ({
      id: r.id,
      name: r.name,
      nationality: r.nationality,
      teamId: r.team_id,
      teamName: r.team_name || 'Unknown',
      number: r.number,
      imageUrl: r.image_url
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drivers
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, nationality, teamId, number, imageUrl } = req.body;
    const id = name.toLowerCase().replace(/\s/g, '');
    await execute(
      `INSERT INTO drivers (id, name, nationality, team_id, number, image_url) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, nationality, teamId, number, imageUrl]
    );
    const teamRows = await query<RowDataPacket[]>(`SELECT name FROM teams WHERE id = ?`, [teamId]);
    res.json({ id, name, nationality, teamId, teamName: teamRows[0]?.name || 'Unknown', number, imageUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/drivers/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, nationality, teamId, number, imageUrl } = req.body;
    await execute(
      `UPDATE drivers SET name = ?, nationality = ?, team_id = ?, number = ?, image_url = ? WHERE id = ?`,
      [name, nationality, teamId, number, imageUrl, req.params.id]
    );
    const teamRows = await query<RowDataPacket[]>(`SELECT name FROM teams WHERE id = ?`, [teamId]);
    res.json({ id: req.params.id, name, nationality, teamId, teamName: teamRows[0]?.name || 'Unknown', number, imageUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/drivers/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await execute(`DELETE FROM drivers WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
