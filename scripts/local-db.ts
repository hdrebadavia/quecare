import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve('.local'); mkdirSync(root, { recursive: true });
if (!existsSync('.env')) copyFileSync('.env.example', '.env');
const bin = process.env.POSTGRES_BIN || (existsSync('/Applications/Postgres.app/Contents/Versions/latest/bin/initdb') ? '/Applications/Postgres.app/Contents/Versions/latest/bin/' : '');
function run(exe: string, args: string[], allowFailure = false) {
  const p = spawnSync(bin + exe, args, { stdio: 'inherit' });
  if (p.status !== 0 && !allowFailure) throw new Error(`${exe} failed. Install PostgreSQL or set DATABASE_URL to your own database.`);
  return p.status;
}
if (!existsSync(resolve(root, 'postgres/PG_VERSION'))) run('initdb', ['-D', resolve(root, 'postgres'), '-A', 'trust', '--no-locale', '-E', 'UTF8']);
const ready = spawnSync(bin + 'pg_isready', ['-h', '127.0.0.1', '-p', '55432'], { stdio: 'ignore' });
if (ready.status !== 0) run('pg_ctl', ['-D', resolve(root, 'postgres'), '-l', resolve(root, 'postgres.log'), '-o', `-p 55432 -h 127.0.0.1 -k ${root}`, '-w', 'start']);
const existingDatabase=spawnSync(bin+'psql',['-h','127.0.0.1','-p','55432','-d','postgres','-tAc',"SELECT 1 FROM pg_database WHERE datname='quecare'"],{encoding:'utf8'});
if(existingDatabase.stdout.trim()!=='1')run('createdb', ['-h', '127.0.0.1', '-p', '55432', 'quecare']);
console.log('Local PostgreSQL: postgresql://localhost:55432/quecare');
