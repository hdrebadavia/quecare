import { pool } from './db.js';
import { applyMigrations } from './migrations.js';
const client=await pool.connect();
try { await applyMigrations(client); } finally { client.release(); await pool.end(); }
console.log('Database migrations applied.');
