import { beforeAll,afterAll,beforeEach,describe,it,expect } from 'vitest';
import request from 'supertest';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { randomUUID,randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import type { Express } from 'express';
const suite=process.env.RUN_DB_TESTS==='1'?describe:describe.skip;
suite('PostgreSQL-backed application workflows',()=>{
  let app:Express,db:pg.Pool,root:pg.Pool,schema:string,f:any,q:any,q2:any,s:any,admin:any,officer:any,provider:any,patient:any,patient2:any,p:any,p2:any;
  const csrf=new WeakMap<object,string>();
  async function login(email:string){const a=request.agent(app);await a.post('/api/auth/login').send({email,password:'TestPassword123!'}).expect(200);const me=await a.get('/api/auth/me').expect(200);csrf.set(a,me.body.csrf);return a;}
  function post(a:any,url:string,body:any={}){return a.post('/api'+url).set('X-CSRF-Token',csrf.get(a)!).send(body);}
  async function makePatient(name='Test patient'){return(await db.query("INSERT INTO patients(name,birth_date) VALUES($1,'1990-01-01') RETURNING *",[name])).rows[0];}
  async function checkin(pid:string,queueId=q.id){return post(officer,'/visits/check-in',{patientId:pid,queueId,sessionId:s.id});}
  async function action(kind:string,entryId?:string,key=randomUUID(),extra={}){return officer.post(`/api/queues/${q.id}/actions`).set('X-CSRF-Token',csrf.get(officer)!).set('Idempotency-Key',key).send({action:kind,entryId,...extra});}
  beforeAll(async()=>{
    process.env.NODE_ENV='test';root=new pg.Pool({connectionString:process.env.DATABASE_URL||'postgresql://localhost:55432/quecare'});schema='test_'+randomBytes(6).toString('hex');await root.query(`CREATE SCHEMA ${schema}`);
    const url=new URL(process.env.DATABASE_URL||'postgresql://localhost:55432/quecare');url.searchParams.set('options',`-c search_path=${schema}`);process.env.DATABASE_URL=url.toString();
    db=(await import('../server/db')).pool;app=(await import('../server/app')).app;await db.query(await readFile(new URL('../server/schema.sql',import.meta.url),'utf8'));
  });
  afterAll(async()=>{if(db)await db.end();if(root){if(schema)await root.query(`DROP SCHEMA ${schema} CASCADE`);await root.end();}});
  beforeEach(async()=>{
    f=(await db.query('INSERT INTO facilities(name) VALUES($1) RETURNING *',['Test RHU '+randomUUID()])).rows[0];
    q=(await db.query("INSERT INTO queues(facility_id,name,opens_at,cutoff) VALUES($1,'Triage','00:00','23:59') RETURNING *",[f.id])).rows[0];q2=(await db.query("INSERT INTO queues(facility_id,name,opens_at,cutoff) VALUES($1,'Nurse','00:00','23:59') RETURNING *",[f.id])).rows[0];
    s=(await db.query("INSERT INTO daily_sessions(facility_id,day,token) VALUES($1,(now() AT TIME ZONE 'Asia/Manila')::date,$2) RETURNING *",[f.id,randomBytes(24).toString('hex')])).rows[0];
    const hash=await bcrypt.hash('TestPassword123!',4);const users:any={};
    for(const role of ['facility_admin','queue_officer','provider','patient','patient2']){const email=randomUUID()+'@test.local';const u=(await db.query('INSERT INTO users(name,email,password_hash,role,facility_id,can_manage_activities) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[role,email,hash,role==='patient2'?'patient':role,role.startsWith('patient')?null:f.id,role==='provider'])).rows[0];users[role]=u;}
    await db.query('INSERT INTO queue_assignments(user_id,queue_id) VALUES($1,$2)',[users.queue_officer.id,q.id]);
    for(const name of ['patient','patient2'])await db.query("INSERT INTO patients(user_id,name,birth_date) VALUES($1,$2,'1990-01-01')",[users[name].id,name]);
    admin=await login(users.facility_admin.email);officer=await login(users.queue_officer.email);provider=await login(users.provider.email);patient=await login(users.patient.email);patient2=await login(users.patient2.email);p=(await db.query('SELECT * FROM patients WHERE user_id=$1',[users.patient.id])).rows[0];p2=(await db.query('SELECT * FROM patients WHERE user_id=$1',[users.patient2.id])).rows[0];
  });
  it('keeps QR registrations pending until staff confirms physical arrival',async()=>{
    const joined=await post(patient,`/join/${s.token}`,{queueId:q.id,consent:true}).expect(200);expect(joined.body.tracking_token).toHaveLength(48);
    let live=await request(app).get(`/api/public/queues/${f.id}`);expect(live.body.queues[0].waiting).toHaveLength(0);
    const pending=(await db.query('SELECT * FROM registration_requests WHERE session_id=$1',[s.id])).rows[0];
    const confirmed=await post(officer,`/arrivals/${pending.id}/check-in`).expect(200);expect(confirmed.body.number).toBe(1);
    const again=await post(officer,`/arrivals/${pending.id}/check-in`).expect(200);expect(again.body.number).toBe(1);
    live=await request(app).get(`/api/public/queues/${f.id}`);expect(live.body.queues.find((x:any)=>x.id===q.id).waiting).toEqual([{number:1}]);
    const tracking=await request(app).get(`/api/tracking/${joined.body.tracking_token}`).expect(200);expect(tracking.body.number).toBe(1);expect(tracking.body.position).toBe(1);
  });
  it('serializes simultaneous number issuance and repeated check-in',async()=>{
    const a=await makePatient('First'),b=await makePatient('Second');const results=await Promise.all([checkin(a.id),checkin(b.id),checkin(a.id)]);results.forEach(r=>expect(r.status).toBe(200));expect(new Set(results.map(r=>r.body.number)).size).toBe(2);expect((await db.query('SELECT * FROM visits WHERE session_id=$1',[s.id])).rowCount).toBe(2);
  });
  it('allows only one current serving number and retries safely with the same key',async()=>{
    await checkin((await makePatient()).id);await checkin((await makePatient()).id);
    const key=randomUUID();const calls=await Promise.all([action('call',undefined,key),action('call',undefined,key)]);calls.forEach(r=>expect(r.status).toBe(200));await action('call').then(r=>expect(r.status).toBe(400));expect((await db.query("SELECT * FROM queue_entries WHERE queue_id=$1 AND status='called'",[q.id])).rowCount).toBe(1);
  });
  it('transfers a visit while retaining its number and station timestamps',async()=>{
    const v=await checkin((await makePatient()).id);await action('call');const e=(await db.query('SELECT id FROM queue_entries WHERE visit_id=$1',[v.body.id])).rows[0];await action('start',e.id).then(r=>expect(r.status).toBe(200));await action('transfer',e.id,undefined,{destinationId:q2.id}).then(r=>expect(r.status).toBe(200));const live=await request(app).get(`/api/public/queues/${f.id}`);expect(live.body.queues.find((x:any)=>x.id===q2.id).waiting[0].number).toBe(v.body.number);expect((await db.query('SELECT status,started_at,ended_at FROM queue_entries WHERE id=$1',[e.id])).rows[0].status).toBe('transferred');
  });
  it('limits officers to assigned queues and denies clinical access to administrators',async()=>{
    await checkin((await makePatient()).id,q2.id).then(r=>expect(r.status).toBe(403));await admin.get(`/api/records?patientId=${p.id}`).expect(403);await patient.get(`/api/staff/dashboard?facility=${f.id}`).expect(403);
  });
  it('never exposes names, priority reasons, or tracking secrets in public snapshots',async()=>{
    await checkin((await makePatient('Highly Private Patient')).id);const live=await request(app).get(`/api/public/queues/${f.id}`).expect(200);const serialized=JSON.stringify(live.body);expect(serialized).not.toMatch(/Highly Private|patient_name|birth_date|priority_reason|tracking_token/);
  });
  it('requires CSRF for authenticated mutations',async()=>{await officer.post('/api/visits/check-in').send({patientId:p.id,queueId:q.id,sessionId:s.id}).expect(403);});
  it('expires the daily QR and marks remaining visits unserved on closure',async()=>{
    const v=await checkin((await makePatient()).id);await post(admin,`/sessions/${s.id}/close`).expect(200);await request(app).get(`/api/join/${s.token}`).expect(410);expect((await db.query('SELECT status FROM visits WHERE id=$1',[v.body.id])).rows[0].status).toBe('unserved');
  });
  it('expires an unclosed prior day before opening or returning today’s session',async()=>{
    const old=(await db.query("INSERT INTO daily_sessions(facility_id,day,token) VALUES($1,(now() AT TIME ZONE 'Asia/Manila')::date-1,$2) RETURNING id",[f.id,randomBytes(24).toString('hex')])).rows[0];const oldPatient=await makePatient();const v=(await db.query('INSERT INTO visits(session_id,patient_id,number,tracking_token) VALUES($1,$2,1,$3) RETURNING id',[old.id,oldPatient.id,randomBytes(24).toString('hex')])).rows[0];await db.query("INSERT INTO queue_entries(visit_id,queue_id,status) VALUES($1,$2,'called')",[v.id,q.id]);
    await post(admin,'/sessions/open',{facilityId:f.id}).expect(200);expect((await db.query('SELECT status FROM visits WHERE id=$1',[v.id])).rows[0].status).toBe('unserved');await checkin((await makePatient()).id);await action('call').then(r=>expect(r.status).toBe(200));
  });
  async function activity(capacity=1){const d=new Date(Date.now()+86400000*3).toLocaleDateString('en-CA',{timeZone:'Asia/Manila'});const a=await post(provider,'/activities',{facilityId:f.id,queueId:q.id,title:'Vaccination day',category:'Vaccination',venue:'Test RHU',activityDate:d,bookingOpens:new Date(Date.now()-60000).toISOString(),bookingCloses:new Date(`${d}T07:00:00+08:00`).toISOString(),status:'published',slots:[{startsAt:new Date(`${d}T08:00:00+08:00`).toISOString(),endsAt:new Date(`${d}T09:00:00+08:00`).toISOString(),capacity}]}).expect(200);return {id:a.body.id,slot:(await db.query('SELECT * FROM activity_slots WHERE activity_id=$1',[a.body.id])).rows[0]};}
  it('prevents overbooking when patients compete for the last place',async()=>{
    const a=await activity();const results=await Promise.all([post(patient,'/bookings',{slotId:a.slot.id}),post(patient2,'/bookings',{slotId:a.slot.id})]);expect(results.map(r=>r.status).sort()).toEqual([200,400]);expect((await db.query("SELECT count(*)::int AS n FROM bookings WHERE activity_id=$1 AND status='confirmed'",[a.id])).rows[0].n).toBe(1);
  });
  it('releases canceled capacity and rejects early appointment check-in',async()=>{
    const a=await activity();const b=await post(patient,'/bookings',{slotId:a.slot.id}).expect(200);await post(officer,`/bookings/${b.body.id}/check-in`).expect(400);await post(patient,`/bookings/${b.body.id}/cancel`).expect(200);await post(patient2,'/bookings',{slotId:a.slot.id}).expect(200);
  });
  it('rejects capacity reductions below existing reservations',async()=>{
    const a=await activity(2);await post(patient,'/bookings',{slotId:a.slot.id});await post(patient2,'/bookings',{slotId:a.slot.id});const record=(await db.query('SELECT * FROM activities WHERE id=$1',[a.id])).rows[0];await provider.put(`/api/activities/${a.id}`).set('X-CSRF-Token',csrf.get(provider)!).send({facilityId:f.id,queueId:q.id,title:record.title,category:record.category,venue:record.venue,activityDate:record.activity_date,bookingOpens:record.booking_opens.toISOString(),bookingCloses:record.booking_closes.toISOString(),status:'published',slots:[{id:a.slot.id,startsAt:a.slot.starts_at.toISOString(),endsAt:a.slot.ends_at.toISOString(),capacity:1}]}).expect(400);
  });
  it('requires guardian details for guest minors',async()=>{
    await request(app).post(`/api/join/${s.token}`).send({name:'Child Example',birthDate:'2020-01-01',queueId:q.id,consent:true}).expect(400);
  });
  it('links an in-person-verified guest to a matching unused patient account',async()=>{
    const guest=await makePatient('patient');await checkin(guest.id).then(r=>expect(r.status).toBe(200));const email=(await patient.get('/api/auth/me')).body.user.email;
    await post(officer,`/patients/${guest.id}/link-account`,{email,identityVerified:true,verificationNote:'Verified patient identity and account ownership in person.'}).expect(200);
    const records=await patient.get('/api/records').expect(200);expect(records.body.patient.id).toBe(guest.id);expect((await db.query('SELECT 1 FROM patients WHERE id=$1',[p.id])).rowCount).toBe(0);
  });
  it('refuses to link a guest who has no encounter at the officer’s facility',async()=>{
    const guest=await makePatient('patient');const email=(await patient.get('/api/auth/me')).body.user.email;await post(officer,`/patients/${guest.id}/link-account`,{email,identityVerified:true,verificationNote:'Verified identity in person.'}).expect(403);
  });
  it('invalidates existing sessions when a password is reset',async()=>{
    const user=(await patient.get('/api/auth/me')).body.user;const raw=randomBytes(24).toString('hex');const {hash}=await import('../server/auth');await db.query("INSERT INTO reset_tokens(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '30 minutes')",[hash(raw),user.id]);
    await request(app).post('/api/auth/reset').send({token:raw,password:'ReplacementPassword123!'}).expect(200);expect((await patient.get('/api/auth/me')).body.user).toBeNull();await request(app).post('/api/auth/login').send({email:user.email,password:'TestPassword123!'}).expect(401);await request(app).post('/api/auth/reset').send({token:raw,password:'AnotherPassword123!'}).expect(400);
  });
  it('keeps cross-RHU notes private until selected-record consent is approved',async()=>{
    const other=(await db.query('INSERT INTO facilities(name) VALUES($1) RETURNING id',['Other '+randomUUID()])).rows[0];const uid=(await provider.get('/api/auth/me')).body.user.id;
    const record=(await db.query("INSERT INTO clinical_records(patient_id,facility_id,author_id,summary) VALUES($1,$2,$3,'Private outside note') RETURNING id",[p.id,other.id,uid])).rows[0];
    const records=await provider.get(`/api/records?patientId=${p.id}`).expect(200);expect(records.body.records).toHaveLength(0);
    const grant=await post(patient,'/sharing',{destinationId:f.id,recordIds:[record.id],consentNote:'I consent to sharing this selected note.'}).expect(200);
    expect((await provider.get(`/api/records?patientId=${p.id}`)).body.records).toHaveLength(0);await post(provider,`/sharing/${grant.body.id}/approve`,{consentVerified:true}).expect(200);expect((await provider.get(`/api/records?patientId=${p.id}`)).body.records).toHaveLength(1);
    await post(patient,`/sharing/${grant.body.id}/revoke`).expect(200);expect((await provider.get(`/api/records?patientId=${p.id}`)).body.records).toHaveLength(0);
  });
  it('returns approved information without an AI key and refuses clinical requests',async()=>{
    await db.query("INSERT INTO information(facility_id,kind,title,content,approved) VALUES($1,'faq','Queue registration','Scan the daily QR and confirm arrival with staff.',true)",[f.id]);const r=await request(app).post('/api/assistant').send({facilityId:f.id,question:'How does queue registration work?'}).expect(200);expect(r.body.answer).toContain('confirm arrival');const clinical=await request(app).post('/api/assistant').send({facilityId:f.id,question:'What treatment should I take?'});expect(clinical.body.mode).toBe('safety');
  });
  it('exports aggregate research data without patient identities',async()=>{
    await checkin((await makePatient('Private research identity')).id);const result=await admin.get(`/api/reports?facility=${f.id}&format=csv`).expect(200);expect(result.text).toContain('waiting_minutes');expect(result.text).not.toContain('Private research identity');
  });
});
