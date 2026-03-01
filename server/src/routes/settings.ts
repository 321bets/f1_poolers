import express, { Request, Response } from 'express';
import { query, execute } from '../database.js';
import { RowDataPacket } from 'mysql2/promise';

const router = express.Router();

// GET /api/settings/coin-packs
router.get('/coin-packs', async (_req: Request, res: Response) => {
  try {
    const rows = await query<RowDataPacket[]>(`SELECT * FROM coin_packs`);
    res.json(rows.map(r => ({
      id: r.id, name: r.name, coins: r.coins, price: parseFloat(r.price), currency: r.currency
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/coin-packs
router.post('/coin-packs', async (req: Request, res: Response) => {
  try {
    const { name, coins, price, currency } = req.body;
    const id = `pack-${Date.now()}`;
    await execute(`INSERT INTO coin_packs (id, name, coins, price, currency) VALUES (?, ?, ?, ?, ?)`, [id, name, coins, price, currency || 'USD']);
    res.json({ id, name, coins, price, currency: currency || 'USD' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings/coin-packs/:id
router.put('/coin-packs/:id', async (req: Request, res: Response) => {
  try {
    const { name, coins, price, currency } = req.body;
    await execute(`UPDATE coin_packs SET name = ?, coins = ?, price = ?, currency = ? WHERE id = ?`, [name, coins, price, currency, req.params.id]);
    res.json({ id: req.params.id, name, coins, price, currency });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/settings/coin-packs/:id
router.delete('/coin-packs/:id', async (req: Request, res: Response) => {
  try {
    await execute(`DELETE FROM coin_packs WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings/ad-settings
router.get('/ad-settings', async (_req: Request, res: Response) => {
  try {
    const rows = await query<RowDataPacket[]>(`SELECT * FROM ad_settings WHERE id = 1`);
    if (rows.length === 0) {
      return res.json({ googleAdClientId: '', rewardAmount: 0, isEnabled: false });
    }
    res.json({
      googleAdClientId: rows[0].google_ad_client_id,
      rewardAmount: rows[0].reward_amount,
      isEnabled: !!rows[0].is_enabled
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings/ad-settings
router.put('/ad-settings', async (req: Request, res: Response) => {
  try {
    const { googleAdClientId, rewardAmount, isEnabled } = req.body;
    await execute(
      `INSERT INTO ad_settings (id, google_ad_client_id, reward_amount, is_enabled) VALUES (1, ?, ?, ?) ON DUPLICATE KEY UPDATE google_ad_client_id = ?, reward_amount = ?, is_enabled = ?`,
      [googleAdClientId, rewardAmount, isEnabled ? 1 : 0, googleAdClientId, rewardAmount, isEnabled ? 1 : 0]
    );
    res.json({ googleAdClientId, rewardAmount, isEnabled });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/ad-reward
router.post('/ad-reward', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const adRows = await query<RowDataPacket[]>(`SELECT reward_amount FROM ad_settings WHERE id = 1`);
    const reward = adRows[0]?.reward_amount || 25;
    await execute(`UPDATE users SET balance = balance + ? WHERE id = ?`, [reward, userId]);
    const userRows = await query<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [userId]);
    const { buildUser } = await import('./auth.js');
    const user = await buildUser(userRows[0]);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/purchase-pack
router.post('/purchase-pack', async (req: Request, res: Response) => {
  try {
    const { userId, packId } = req.body;
    const packRows = await query<RowDataPacket[]>(`SELECT * FROM coin_packs WHERE id = ?`, [packId]);
    if (packRows.length === 0) return res.status(404).json({ error: 'Pack not found' });
    await execute(`UPDATE users SET balance = balance + ? WHERE id = ?`, [packRows[0].coins, userId]);
    const userRows = await query<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [userId]);
    const { buildUser } = await import('./auth.js');
    const user = await buildUser(userRows[0]);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings/system
router.get('/system', async (_req: Request, res: Response) => {
  try {
    const rows = await query<RowDataPacket[]>(`SELECT * FROM system_settings LIMIT 1`);
    if (rows.length === 0) {
      return res.json({ theme: 'original', termsContent: { en: '', pt: '', es: '' } });
    }
    res.json({
      theme: rows[0].theme,
      termsContent: {
        en: rows[0].terms_content_en || '',
        pt: rows[0].terms_content_pt || '',
        es: rows[0].terms_content_es || ''
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings/system
router.put('/system', async (req: Request, res: Response) => {
  try {
    const { theme, termsContent } = req.body;
    await execute(
      `UPDATE system_settings SET theme = ?, terms_content_en = ?, terms_content_pt = ?, terms_content_es = ? WHERE id = 1`,
      [theme || 'original', termsContent?.en || '', termsContent?.pt || '', termsContent?.es || '']
    );
    res.json({ theme, termsContent });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
