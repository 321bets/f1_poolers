import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { join } from 'path';

let pool: Pool;

export async function initDatabase() {
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    database: process.env.MYSQL_DATABASE || 'f1pooler',
    user: process.env.MYSQL_USER || 'f1pooler',
    password: process.env.MYSQL_PASSWORD || 'f1pooler',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: '+00:00'
  });

  // Test connection
  const conn = await pool.getConnection();
  console.log('✅ MySQL connected to f1pooler database');
  conn.release();

  // Check if tables exist, if not run schema
  const [tables] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = 'f1pooler' AND table_name = 'users'`
  );

  if (tables[0].cnt === 0) {
    console.log('📦 Running initial schema...');
    const schemaPath = join(process.cwd(), '..', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      try {
        await pool.query(stmt);
      } catch (err: any) {
        if (!err.message.includes('Unknown table')) {
          console.warn('Schema warning:', err.message.substring(0, 100));
        }
      }
    }
    console.log('✅ Schema initialized with seed data');
  }
}

export function getPool(): Pool {
  return pool;
}

export async function query<T extends RowDataPacket[]>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.query<T>(sql, params);
  return rows;
}

export async function execute(sql: string, params?: any[]): Promise<ResultSetHeader> {
  const [result] = await pool.query<ResultSetHeader>(sql, params);
  return result;
}
