import { Router } from 'express';
import { z } from 'zod';
import { patientFields, patientKeys, validatePatient, displayName, type PatientInput, type PatientProfile } from '../shared/patient.js';
import { resolveAddress, geography, addressMetadata } from './geography.js';
import { pool, one, transaction, type DB } from './db.js';
import { requireRole, audit, type User } from './auth.js';
import { ensure } from './domain.js';

export const profileSchema = patientFields.extend({consent:z.literal(true)});
export const column = (key:string) => key.replace(/[A-Z]/g, c => '_'+c.toLowerCase());
export function patientProfile(row: Record<string, any>): PatientProfile {
  return {...Object.fromEntries(patientKeys.map(k => [k,row[column(k)]])),id:row.id,name:row.name,
    barangay:row.barangay,region:row.region,province:row.province,city:row.city,addressRelease:row.address_release} as PatientProfile;
}
export async function createPatient(db: DB, data: z.infer<typeof profileSchema>, userId: string | null = null) {
  const p = validatePatient(data,true), address=resolveAddress(p);
  const fields:Record<string,unknown> = {user_id:userId,name:displayName(p),...Object.fromEntries(patientKeys.map(k=>[column(k),p[k]])),...address};
  delete fields.addressRelease; fields.address_release = address.addressRelease;
  const keys = Object.keys(fields);
  return one(db,`INSERT INTO patients(${keys.join(',')}) VALUES(${keys.map((_,i)=>'$'+(i+1)).join(',')}) RETURNING *`,Object.values(fields));
}
async function authorizedPatient(db:DB, u:User, id:string, lock=false) {
  const p=await one(db,`SELECT * FROM patients WHERE id=$1${lock?' FOR UPDATE':''}`,[id]);ensure(p,'Patient not found.',404);
  if(u.role==='patient') ensure(p.user_id===u.id,'This is not your patient profile.',403);
  else if(u.role!=='system_admin') {
    const linked=await one(db,`SELECT 1 FROM visits v JOIN daily_sessions s ON s.id=v.session_id WHERE v.patient_id=$1 AND s.facility_id=$2
      UNION ALL SELECT 1 FROM registration_requests r JOIN daily_sessions s ON s.id=r.session_id WHERE r.patient_id=$1 AND s.facility_id=$2
      UNION ALL SELECT 1 FROM bookings b JOIN activities a ON a.id=b.activity_id WHERE b.patient_id=$1 AND a.facility_id=$2
      UNION ALL SELECT 1 FROM audit_events WHERE target_id=$1::text AND facility_id=$2 AND action='patient.create' LIMIT 1`,[id,u.facility_id]);
    ensure(linked,'This patient has no registration or care relationship with your Health Unit.',403);
  }
  return p;
}
const roles=['patient','system_admin','facility_admin','queue_officer','provider'];
export const patientsRouter=Router();
// Specific routes precede the patient-id routes. Existing search/create routes remain in app.ts.
patientsRouter.get('/me', async(req,res)=>{
  const u=requireRole(req.user,['patient']); const p=await one(pool,'SELECT * FROM patients WHERE user_id=$1',[u.id]);ensure(p,'Patient profile not found.',404);
  await audit(pool,u,'patient.read',p.id);res.set('Cache-Control','no-store').json(patientProfile(p));
});
async function update(db:DB,u:User,id:string,raw:unknown) {
  const submitted=z.record(z.string(),z.unknown()).parse(raw);
  const parsed=patientFields.partial().strict().parse(submitted);
  // Zod defaults also run inside partial schemas; retain only submitted keys.
  const changes=Object.fromEntries(Object.keys(submitted).map(k=>[k,parsed[k as keyof PatientInput]])) as Partial<PatientInput>;
  ensure(Object.keys(changes).length>0,'Submit at least one patient field.');
  const current=await authorizedPatient(db,u,id,true), previous=patientProfile(current);
  const merged={...previous,...changes};
  // A structured identity cannot be erased to silently fall back to an obsolete full name.
  if(previous.firstName || previous.lastName || ['firstName','lastName','middleName','suffix'].some(k=>k in changes)) {
    if(!merged.firstName || !merged.lastName) throw new z.ZodError([{code:'custom',path:[!merged.firstName?'firstName':'lastName'],message:'First and last name are required to update the patient name.'}]);
  }
  if(previous.sex && !merged.sex) throw new z.ZodError([{code:'custom',path:['sex'],message:'Sex is required.'}]);
  const p=validatePatient(merged,false);
  const fields: Record<string,unknown>={};
  // Persist only submitted fields and dependent values changed by normalization.
  for(const k of patientKeys) if(k in changes || p[k]!==previous[k]) fields[column(k)]=p[k];
  if(['regionCode','provinceCode','cityCode','barangayCode'].some(k=>k in changes)) {
    const address=resolveAddress(p);
    Object.assign(fields,{region:address.region,province:address.province,city:address.city,barangay:address.barangay,address_release:address.addressRelease});
  }
  if(p.firstName && p.lastName) fields.name=displayName(p);
  const keys=Object.keys(fields);
  const updated=await one(db,`UPDATE patients SET ${keys.map((k,i)=>`${k}=$${i+1}`).join(',')} WHERE id=$${keys.length+1} RETURNING *`,[...Object.values(fields),id]);
  if(updated.user_id && updated.name!==current.name) await db.query('UPDATE users SET name=$1 WHERE id=$2',[updated.name,updated.user_id]);
  await audit(db,u,'patient.update',id,u.facility_id,{fields:Object.keys(changes)});
  return patientProfile(updated);
}
patientsRouter.patch('/me',async(req,res)=>{
  const u=requireRole(req.user,['patient']);const p=await one(pool,'SELECT id FROM patients WHERE user_id=$1',[u.id]);ensure(p,'Patient profile not found.',404);
  res.json(await transaction(db=>update(db,u,p.id,req.body)));
});
patientsRouter.get('/:id',async(req,res)=>{
  const u=requireRole(req.user,roles);const p=await authorizedPatient(pool,u,z.uuid().parse(req.params.id));
  await audit(pool,u,'patient.read',p.id,u.facility_id);res.set('Cache-Control','no-store').json(patientProfile(p));
});
patientsRouter.patch('/:id',async(req,res)=>{
  const u=requireRole(req.user,roles);res.json(await transaction(db=>update(db,u,z.uuid().parse(req.params.id),req.body)));
});
export const geographyRouter=Router();
geographyRouter.get('/',(req,res)=>{
  const parent=z.string().max(10).parse(req.query.parent || '');
  res.set('Cache-Control','public, max-age=86400').json({...addressMetadata,places:geography.filter(p=>p.parent===parent)});
});
