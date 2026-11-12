import type { Request, Response, NextFunction } from 'express';
import { randomBytes, createHash } from 'node:crypto';
import { pool, one, type DB } from './db.js';
import { ensure } from './domain.js';
export type User = { id: string; name: string; email: string; role: string; facility_id: string | null; can_manage_activities: boolean };
declare global { namespace Express { interface Request { user?: User; csrf?: string } } }
export const token = () => randomBytes(24).toString('hex');
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export const isAdmin = (u: User) => ['system_admin','facility_admin'].includes(u.role);
export function facilityAccess(user: User, facility: string) { ensure(user.role === 'system_admin' || user.facility_id === facility, 'This facility is outside your assignment.', 403); }
export function requireRole(user: User | undefined, roles: string[]) { ensure(user, 'Please sign in.', 401); ensure(roles.includes(user.role), 'You do not have permission for this action.', 403); return user; }
export async function queueAccess(db: DB, user: User, id: string) {
  const queue = await one(db, 'SELECT * FROM queues WHERE id=$1', [id]); ensure(queue, 'Queue not found.', 404); facilityAccess(user, queue.facility_id);
  if (!isAdmin(user)) ensure(await one(db, 'SELECT 1 FROM queue_assignments WHERE user_id=$1 AND queue_id=$2', [user.id,id]), 'This queue is not assigned to you.', 403);
  return queue;
}
export async function audit(db: DB, user: User | undefined, action: string, target: string | null, facility: string | null = null, detail = {}) {
  await db.query('INSERT INTO audit_events(actor_id,facility_id,action,target_id,detail) VALUES($1,$2,$3,$4,$5)', [user?.id || null, facility, action, target, JSON.stringify(detail)]);
}
export async function createSession(db: DB, res: Response, user: User) {
  const raw = token(), csrf = token();
  await db.query("INSERT INTO auth_sessions(token_hash,user_id,csrf,expires_at) VALUES($1,$2,$3,now()+interval '12 hours')", [hash(raw),user.id,csrf]);
  res.cookie('quecare_session', raw, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 43200000, path: '/' });
  return csrf;
}
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    if (req.cookies.quecare_session) {
      const session = await one(pool, 'SELECT u.id,u.name,u.email,u.role,u.facility_id,u.can_manage_activities,s.csrf FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND NOT u.disabled', [hash(req.cookies.quecare_session)]);
      if (session) { const { csrf, ...user } = session; req.user = user; req.csrf = csrf; }
    }
    if (req.user && !['GET','HEAD','OPTIONS'].includes(req.method)) ensure(req.headers['x-csrf-token'] === req.csrf, 'Session security check failed. Refresh and try again.', 403);
    const origin = req.get('origin');
    if (!['GET','HEAD','OPTIONS'].includes(req.method) && origin) {
      const allowed = new URL(process.env.APP_URL || 'http://localhost:5173').origin;
      ensure(origin === allowed || (process.env.NODE_ENV !== 'production' && ['http://127.0.0.1:5173','http://localhost:5173'].includes(origin)), 'Request origin rejected.', 403);
    }
    next();
  } catch(error) { next(error); }
}
