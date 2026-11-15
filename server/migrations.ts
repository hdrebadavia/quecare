import { readFile } from 'node:fs/promises';
import type { DB } from './db.js';
export async function applyMigrations(db: DB) {
  await db.query('BEGIN');
  try {
    await db.query('SELECT pg_advisory_xact_lock(727010)');
    await db.query('CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
    for (const [version,path] of [['001','./schema.sql'],['002','./migrations/002-patient-information.sql']]) {
      if (!(await db.query('SELECT 1 FROM schema_migrations WHERE version=$1',[version])).rowCount) {
        await db.query(await readFile(new URL(path, import.meta.url), 'utf8'));
        await db.query('INSERT INTO schema_migrations(version) VALUES ($1)',[version]);
      }
    }
    await db.query('COMMIT');
  } catch(error) { await db.query('ROLLBACK'); throw error; }
}
