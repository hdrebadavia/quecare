import { Router } from 'express';
import { z } from 'zod';
import { pool, one, transaction, type DB } from './db.js';
import { audit, requireRole } from './auth.js';
import { ensure, HttpError } from './domain.js';

export const facilitiesAdmin = Router();
const fields = z.object({
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().max(1000).default(''),
  announcement: z.string().max(500).default(''),
});
// All non-audit references to facilities. Indirect patient history is protected
// through these parents and the existing foreign keys; nothing is cascaded.
const references = [
  ['users', 'facility_id', 'Assigned users (including disabled accounts)'],
  ['queues', 'facility_id', 'Queue stations'],
  ['daily_sessions', 'facility_id', 'Daily sessions'],
  ['activities', 'facility_id', 'Activities'],
  ['clinical_records', 'facility_id', 'Clinical records'],
  ['sharing_grants', 'destination_id', 'Sharing authorizations'],
  ['information', 'facility_id', 'Directory information'],
  ['baseline_metrics', 'facility_id', 'Baseline metrics'],
] as const;
async function usage(db: DB, id: string) {
  const counts = await one(db, `SELECT ${references.map(([table, column], i) =>
    `(SELECT count(*)::int FROM ${table} WHERE ${column}=$1) AS n${i}`).join(',')}`, [id]);
  const deletionBlockers = references.flatMap(([, , label], i) =>
    counts[`n${i}`] ? [{ label, count: counts[`n${i}`] as number }] : []);
  return { assignedUserCount: counts.n0 as number, deletionBlockers, canDelete: deletionBlockers.length === 0 };
}
facilitiesAdmin.use((req, _res, next) => { requireRole(req.user, ['system_admin']); next(); });
facilitiesAdmin.get('/', async (_req, res) => {
  const rows = (await pool.query('SELECT * FROM facilities ORDER BY length(name),name')).rows;
  res.json(await Promise.all(rows.map(async f => ({ ...f, ...await usage(pool, f.id) }))));
});
facilitiesAdmin.post('/', async (req, res) => {
  const d = fields.parse(req.body);
  const created = await transaction(async db => {
    const f = await one(db, 'INSERT INTO facilities(name,address,announcement) VALUES($1,$2,$3) RETURNING *', [d.name, d.address, d.announcement]);
    await audit(db, req.user, 'facility.create', f.id, f.id, { facilityId: f.id, facilityName: f.name, before: null, after: f });
    return f;
  });
  res.json(created);
});
facilitiesAdmin.put('/:id', async (req, res) => {
  const id = z.uuid().parse(req.params.id), d = fields.parse(req.body);
  const updated = await transaction(async db => {
    const before = await one(db, 'SELECT * FROM facilities WHERE id=$1 FOR UPDATE', [id]);
    ensure(before, 'Health Unit not found.', 404);
    const after = await one(db, 'UPDATE facilities SET name=$1,address=$2,announcement=$3 WHERE id=$4 RETURNING *', [d.name, d.address, d.announcement, id]);
    await audit(db, req.user, 'facility.update', id, id, { facilityId: id, facilityName: after.name, before, after });
    return after;
  });
  res.json(updated);
});
facilitiesAdmin.delete('/:id', async (req, res) => {
  const id = z.uuid().parse(req.params.id);
  try {
    await transaction(async db => {
      // FOR UPDATE conflicts with the key-share lock taken by new FK references.
      const before = await one(db, 'SELECT * FROM facilities WHERE id=$1 FOR UPDATE', [id]);
      ensure(before, 'Health Unit not found.', 404);
      const { deletionBlockers } = await usage(db, id);
      ensure(!deletionBlockers.length, `Cannot delete this Health Unit: ${deletionBlockers.map(b => `${b.label}: ${b.count}`).join('; ')}.`, 409);
      await db.query(`UPDATE audit_events SET facility_id=NULL,
        detail=detail || jsonb_build_object('deletedFacilityId',$1::text,'deletedFacilityName',$2::text)
        WHERE facility_id=$1::uuid`, [id, before.name]);
      await db.query('DELETE FROM facilities WHERE id=$1', [id]);
      await audit(db, req.user, 'facility.delete', id, null, { facilityId: id, facilityName: before.name, before, after: null });
    });
  } catch (error) {
    if ((error as { code?: string }).code === '23503') throw new HttpError(409, 'This Health Unit is still in use. Refresh to review its linked data.');
    throw error;
  }
  res.json({ success: true });
});
