import { readFile } from 'node:fs/promises';
import { pool, transaction } from '../server/db.js';

try {
  await transaction(async db => {
    await db.query('SELECT pg_advisory_xact_lock(727010)');
    const roles = await db.query("SELECT to_regrole('anon') AS anon, to_regrole('authenticated') AS authenticated");
    if (!roles.rows[0].anon || !roles.rows[0].authenticated) {
      throw new Error('This command requires a Supabase database. Run db:migrate first using the project owner connection.');
    }
    await db.query(await readFile(new URL('../deploy/supabase/secure-tables.sql', import.meta.url), 'utf8'));
    await db.query("INSERT INTO schema_migrations(version) VALUES ('002-supabase-security') ON CONFLICT DO NOTHING");
  });
  console.log('Supabase application tables secured. Client API roles have no table access; Express retains owner access.');
} finally {
  await pool.end();
}
