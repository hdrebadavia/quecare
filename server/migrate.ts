import { readFile } from 'node:fs/promises';
import { pool, transaction } from './db.js';
await transaction(async db => {
  await db.query('SELECT pg_advisory_xact_lock(727010)');
  await db.query('CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  if (!(await db.query("SELECT 1 FROM schema_migrations WHERE version='001'")).rowCount) {
    await db.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
    await db.query("INSERT INTO schema_migrations(version) VALUES ('001')");
  }
});
await pool.end(); console.log('Database migrations applied.');
