import 'dotenv/config';
import pg from 'pg';
pg.types.setTypeParser(1082, value => value);
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://localhost:55432/quecare', max: 10 });
export type DB = Pick<pg.PoolClient, 'query'>;
export async function transaction<T>(fn: (db: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try { await client.query('BEGIN'); const value = await fn(client); await client.query('COMMIT'); return value; }
  catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
export async function one(db: DB, sql: string, values: unknown[] = []) { return (await db.query(sql, values)).rows[0]; }
export const dayInManila = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
