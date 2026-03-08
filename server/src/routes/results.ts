import express, { Request, Response } from 'express';
import { query, execute, getPool } from '../database.js';
import { RowDataPacket } from 'mysql2/promise';

const router = express.Router();

// Helper: Build result object from DB
async function buildResult(eventId: string) {
  // Get positions
  const posRows = await query<RowDataPacket[]>(
    `SELECT rp.position, d.id, d.name, d.nationality, d.team_id, d.number, d.image_url, t.name as team_name
     FROM result_positions rp
     JOIN drivers d ON rp.driver_id = d.id
     LEFT JOIN teams t ON d.team_id = t.id
     WHERE rp.event_id = ? ORDER BY rp.position`,
    [eventId]
  );
  // Get winners
  const winRows = await query<RowDataPacket[]>(
    `SELECT user_id, username, prize_amount, points_earned FROM result_winners WHERE event_id = ? ORDER BY prize_amount DESC, points_earned DESC`,
    [eventId]
  );
  const resRow = await query<RowDataPacket[]>(`SELECT * FROM results WHERE event_id = ?`, [eventId]);
  
  return {
    eventId,
    positions: posRows.map(d => ({
      id: d.id, name: d.name, nationality: d.nationality, teamId: d.team_id,
      teamName: d.team_name || 'Unknown', number: d.number, imageUrl: d.image_url
    })),
    winners: winRows.map(w => ({
      userId: w.user_id, username: w.username, prizeAmount: w.prize_amount, pointsEarned: w.points_earned
    })),
    totalPrizePool: resRow[0]?.total_prize_pool || 0
  };
}

// GET /api/results
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await query<RowDataPacket[]>(`SELECT event_id FROM results`);
    const results = await Promise.all(rows.map(r => buildResult(r.event_id)));
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/results - Add results with full grading logic
router.post('/', async (req: Request, res: Response) => {
  try {
    const { eventId, positions } = req.body; // positions = Driver[] ordered top 5

    // Get event
    const eventRows = await query<RowDataPacket[]>(`SELECT * FROM events WHERE id = ?`, [eventId]);
    if (eventRows.length === 0) return res.status(404).json({ error: 'Event not found' });
    const event = eventRows[0];

    // Points Configuration
    let pointConfig = { exact: [0, 0, 0, 0, 0], partial: 0 };
    if (event.type === 'Main Race') {
      pointConfig = { exact: [25, 18, 15, 12, 10], partial: 5 };
    } else if (event.type === 'Sprint Race') {
      pointConfig = { exact: [8, 7, 6, 5, 4], partial: 2 };
    } else if (event.type === 'Qualifying') {
      pointConfig = { exact: [18, 15, 12, 9, 6], partial: 3 };
    } else if (event.type === 'Sprint Qualifying') {
      pointConfig = { exact: [8, 7, 6, 5, 4], partial: 2 };
    } else {
      pointConfig = { exact: [5, 4, 3, 2, 1], partial: 1 };
    }

    // Get all active bets for this event with their predictions
    const betRows = await query<RowDataPacket[]>(
      `SELECT * FROM bets WHERE event_id = ? AND status = 'Active'`, [eventId]
    );

    // Build predictions for each bet
    const betsWithPreds = await Promise.all(betRows.map(async (bet) => {
      const dPreds = await query<RowDataPacket[]>(
        `SELECT bp.position, d.id, d.team_id FROM bet_predictions bp JOIN drivers d ON bp.driver_id = d.id WHERE bp.bet_id = ? ORDER BY bp.position`,
        [bet.id]
      );
      const tPreds = await query<RowDataPacket[]>(
        `SELECT btp.position, btp.team_id FROM bet_team_predictions btp WHERE btp.bet_id = ? ORDER BY btp.position`,
        [bet.id]
      );
      return { ...bet, driverPreds: dPreds, teamPreds: tPreds };
    }));

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Create result record
      await conn.query(
        `INSERT INTO results (event_id, total_prize_pool) VALUES (?, ?)`,
        [eventId, event.pool_prize]
      );

      // Insert result positions
      for (let i = 0; i < positions.length; i++) {
        await conn.query(
          `INSERT INTO result_positions (event_id, position, driver_id) VALUES (?, ?, ?)`,
          [eventId, i, positions[i].id]
        );
      }

      // --- GRADING LOGIC ---
      const potWinnerBetIds: string[] = [];
      const winnersInfo: { userId: string; username: string; points: number; betId: string }[] = [];

      for (const bet of betsWithPreds) {
        let rawDriverPoints = 0;
        let rawTeamPoints = 0;
        let isDriverPerfectMatch = bet.driverPreds && bet.driverPreds.length === 5;

        // Driver predictions
        if (bet.driverPreds && bet.driverPreds.length === 5) {
          for (let i = 0; i < 5; i++) {
            const predictedDriverId = bet.driverPreds[i]?.id;
            const actualDriverId = positions[i]?.id;
            if (!predictedDriverId || !actualDriverId) { isDriverPerfectMatch = false; continue; }
            if (predictedDriverId === actualDriverId) {
              rawDriverPoints += pointConfig.exact[i];
            } else {
              isDriverPerfectMatch = false;
              const inTop5 = positions.some((d: any) => d.id === predictedDriverId);
              if (inTop5) rawDriverPoints += pointConfig.partial;
            }
          }
        } else {
          isDriverPerfectMatch = false;
        }

        // Team predictions
        if (bet.teamPreds && bet.teamPreds.length === 5) {
          for (let i = 0; i < 5; i++) {
            const predictedTeamId = bet.teamPreds[i]?.team_id;
            const actualTeamId = positions[i]?.teamId;
            if (!predictedTeamId || !actualTeamId) continue;
            if (predictedTeamId === actualTeamId) {
              rawTeamPoints += (pointConfig.exact[i] / 2);
            } else {
              const top5Teams = positions.map((d: any) => d.teamId);
              if (top5Teams.includes(predictedTeamId)) {
                rawTeamPoints += (pointConfig.partial / 2);
              }
            }
          }
        }

        const totalRawPoints = rawDriverPoints + rawTeamPoints;
        const finalPoints = Math.round(totalRawPoints * bet.locked_multiplier);

        // Update user points
        if (finalPoints > 0) {
          await conn.query(`UPDATE users SET points = points + ? WHERE id = ?`, [finalPoints, bet.user_id]);
        }

        // Settle bet
        await conn.query(`UPDATE bets SET status = 'Settled' WHERE id = ?`, [bet.id]);

        if (isDriverPerfectMatch) {
          potWinnerBetIds.push(bet.id);
        }

        if (finalPoints > 0) {
          // Get username
          const uRows = await query<RowDataPacket[]>(`SELECT username FROM users WHERE id = ?`, [bet.user_id]);
          winnersInfo.push({ userId: bet.user_id, username: uRows[0]?.username || '', points: finalPoints, betId: bet.id });
        }
      }

      // --- POT DISTRIBUTION ---
      if (potWinnerBetIds.length > 0 && event.pool_prize > 0) {
        const prizePerWinner = Math.floor(event.pool_prize / potWinnerBetIds.length);
        for (const betId of potWinnerBetIds) {
          const bet = betsWithPreds.find(b => b.id === betId);
          if (bet) {
            await conn.query(`UPDATE users SET balance = balance + ? WHERE id = ?`, [prizePerWinner, bet.user_id]);
            const nid = `notif-${Date.now()}-${bet.user_id}`;
            await conn.query(
              `INSERT INTO notifications (id, user_id, message, timestamp, is_read, sender, type) VALUES (?, ?, ?, NOW(), 0, 'System', 'general')`,
              [nid, bet.user_id, `🏆 JACKPOT! You NAILED the result for ${event.type}! You won ${prizePerWinner} Fun-Coins!`]
            );
          }
        }
      }

      // --- JACKPOT ROLLOVER ---
      if (potWinnerBetIds.length === 0 && event.pool_prize > 0) {
        const roundRows = await query<RowDataPacket[]>(`SELECT * FROM rounds WHERE id = ?`, [event.round_id]);
        if (roundRows.length > 0) {
          const currentRound = roundRows[0];
          const nextRoundRows = await query<RowDataPacket[]>(
            `SELECT * FROM rounds WHERE number > ? ORDER BY number LIMIT 1`, [currentRound.number]
          );
          if (nextRoundRows.length > 0) {
            const nextRound = nextRoundRows[0];
            const nextEventRows = await query<RowDataPacket[]>(
              `SELECT * FROM events WHERE round_id = ? AND type = ? AND status != 'Finished' LIMIT 1`,
              [nextRound.id, event.type]
            );
            if (nextEventRows.length > 0) {
              await conn.query(
                `UPDATE events SET pool_prize = pool_prize + ? WHERE id = ?`,
                [event.pool_prize, nextEventRows[0].id]
              );
              console.log(`[JACKPOT ROLLOVER] ${event.pool_prize} Fun-Coins rolled over to ${nextRound.name} ${event.type}`);
            }
          }
        }
      }

      // Insert winner records
      for (const w of winnersInfo) {
        const prize = potWinnerBetIds.includes(w.betId) ? Math.floor(event.pool_prize / potWinnerBetIds.length) : 0;
        await conn.query(
          `INSERT INTO result_winners (event_id, user_id, username, prize_amount, points_earned) VALUES (?, ?, ?, ?, ?)`,
          [eventId, w.userId, w.username, prize, w.points]
        );
      }

      // Mark event finished
      await conn.query(`UPDATE events SET status = 'Finished' WHERE id = ?`, [eventId]);

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const result = await buildResult(eventId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
