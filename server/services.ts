import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
const storageRoot = resolve(process.env.STORAGE_DIR || '.local/uploads');
export async function sendEmail(to: string, subject: string, text: string) {
  if (process.env.EMAIL_PROVIDER === 'resend') {
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error('Email service not configured');
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', signal: AbortSignal.timeout(15000), headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, text }) });
    if (!response.ok) throw new Error('Email delivery failed');
  } else {
    await mkdir('.local/emails', { recursive: true, mode: 0o700 });
    await writeFile(`.local/emails/${Date.now()}-${randomUUID()}.json`, JSON.stringify({ to, subject, text }, null, 2), { mode: 0o600 });
  }
}
export async function putFile(key: string, data: Buffer, type: string) {
  if (process.env.STORAGE_PROVIDER === 'supabase') {
    const response = await fetch(`${process.env.SUPABASE_URL}/storage/v1/object/${process.env.SUPABASE_STORAGE_BUCKET}/${key}`, { method: 'POST', signal: AbortSignal.timeout(20000), headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': type }, body: new Uint8Array(data) });
    if (!response.ok) throw new Error('File storage unavailable');
  } else { await mkdir(storageRoot, { recursive: true, mode: 0o700 }); await writeFile(resolve(storageRoot, key), data, { mode: 0o600 }); }
}
export async function getFile(key: string) {
  if (process.env.STORAGE_PROVIDER === 'supabase') {
    const response = await fetch(`${process.env.SUPABASE_URL}/storage/v1/object/authenticated/${process.env.SUPABASE_STORAGE_BUCKET}/${key}`, { signal: AbortSignal.timeout(20000), headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` } });
    if (!response.ok) throw new Error('File unavailable'); return Buffer.from(await response.arrayBuffer());
  }
  return readFile(resolve(storageRoot, key));
}
