import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { pool,transaction } from '../server/db.js';
const input=z.object({name:z.string().trim().min(2),email:z.email(),password:z.string().min(12).max(128)}).safeParse({name:process.env.INITIAL_ADMIN_NAME,email:process.env.INITIAL_ADMIN_EMAIL,password:process.env.INITIAL_ADMIN_PASSWORD});
if(!input.success){console.error('Set INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD (12+ characters) in the private .env file or provisioning environment.');await pool.end();process.exit(1);}
await transaction(async db=>{
  await db.query('SELECT pg_advisory_xact_lock(727011)');
  if((await db.query("SELECT 1 FROM users WHERE role='system_admin'")).rowCount)throw new Error('A system administrator already exists. Use normal staff administration.');
  for(const n of [2,4,5,6,7,9,10])await db.query('INSERT INTO facilities(name,address) VALUES($1,$2) ON CONFLICT(name) DO NOTHING',[`Meycauayan City Health Unit ${n}`,'Meycauayan City, Bulacan']);
  await db.query("INSERT INTO users(name,email,password_hash,role) VALUES($1,lower($2),$3,'system_admin')",[input.data.name,input.data.email,await bcrypt.hash(input.data.password,12)]);
});
await pool.end();console.log('Seven RHUs and initial CHO administrator provisioned. Remove INITIAL_ADMIN_PASSWORD from the provisioning environment. Configure queues and facility staff after signing in.');
