import bcrypt from 'bcryptjs';
import { pool,transaction,one,dayInManila } from './db.js';
import { token } from './auth.js';
if(process.env.NODE_ENV==='production')throw new Error('Demo seed is disabled in production.');
const password=await bcrypt.hash('QueCareDemo2026!',12);
await transaction(async db=>{
  for(const n of [2,4,5,6,7,9,10])await db.query("INSERT INTO facilities(name,address,announcement) VALUES($1,$2,$3) ON CONFLICT(name) DO NOTHING",[`Meycauayan City Health Unit ${n}`,`Meycauayan City, Bulacan · RHU ${n}`,'Please have your identification and appointment reference ready. Thank you for your patience.']);
  const f=await one(db,"SELECT * FROM facilities WHERE name='Meycauayan City Health Unit 2'");
  for(const [email,name,role] of [['admin@quecare.local','Daniel Santos','system_admin'],['facility@quecare.local','Maria Reyes','facility_admin'],['officer@quecare.local','Ana Cruz','queue_officer'],['nurse@quecare.local','Nurse Isabel Garcia','provider'],['patient@quecare.local','Andrea Mendoza','patient']])await db.query('INSERT INTO users(email,name,password_hash,role,facility_id,can_manage_activities) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(email) DO NOTHING',[email,name,password,role,role==='patient'?null:f.id,role==='provider']);
  const officer=await one(db,"SELECT * FROM users WHERE email='officer@quecare.local'");const provider=await one(db,"SELECT * FROM users WHERE email='nurse@quecare.local'");const admin=await one(db,"SELECT * FROM users WHERE email='admin@quecare.local'");const patientUser=await one(db,"SELECT * FROM users WHERE email='patient@quecare.local'");
  const fs=(await db.query('SELECT id FROM facilities')).rows;
  for(const facility of fs){for(const [i,name,desc] of [[0,'Triage','Initial assessment and vital signs'],[1,'Consultation','General primary care consultation'],[2,'Nurse Station','Nursing care and follow-up'],[3,'Vaccination','Scheduled immunization services']] as const)await db.query("INSERT INTO queues(facility_id,name,description,sort_order,opens_at,cutoff) VALUES($1,$2,$3,$4,'07:00','18:00') ON CONFLICT(facility_id,name) DO NOTHING",[facility.id,name,desc,i]);}
  const queues=(await db.query('SELECT * FROM queues WHERE facility_id=$1 ORDER BY sort_order',[f.id])).rows;
  for(const q of queues){for(const u of [officer,provider])await db.query('INSERT INTO queue_assignments(user_id,queue_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[u.id,q.id]);}
  if(!await one(db,'SELECT id FROM patients WHERE user_id=$1',[patientUser.id]))await db.query("INSERT INTO patients(user_id,name,birth_date,barangay,phone) VALUES($1,$2,'1996-04-12','Calvario','')",[patientUser.id,patientUser.name]);
  const existing=await one(db,'SELECT id FROM daily_sessions WHERE facility_id=$1 AND day=$2',[f.id,dayInManila()]);
  if(!existing){
    const session=await one(db,'INSERT INTO daily_sessions(facility_id,day,token,next_number) VALUES($1,$2,$3,17) RETURNING *',[f.id,dayInManila(),token()]);
    const names=['Rafael Dela Cruz','Sofia Ramos','Miguel Torres','Elena Santos','Carlo Bautista','Lia Navarro','Gabriel Flores','Mia Villanueva','Paolo Reyes','Isabella Cruz','Luis Aquino','Camila Garcia','Noah Santiago','Julia Lopez','Marco Mendoza','Ava Castillo'];
    for(let i=0;i<names.length;i++){
      const p=await one(db,"INSERT INTO patients(name,birth_date,barangay) VALUES($1,'1990-06-15','Calvario') RETURNING id",[names[i]]);
      const completed=i<8;const qi=completed?i%4:i<11?0:i<14?1:i===14?2:3;
      const age=completed?90-i*5:28-(i-8)*2;const entered=new Date(Date.now()-age*60000);
      const v=await one(db,'INSERT INTO visits(session_id,patient_id,number,tracking_token,arrived_at,status,completed_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',[session.id,p.id,i+1,token(),entered,completed?'completed':'active',completed?new Date(entered.getTime()+15*60000):null]);
      const current=[8,11,14,15].includes(i);await db.query('INSERT INTO queue_entries(visit_id,queue_id,status,entered_at,called_at,started_at,ended_at) VALUES($1,$2,$3,$4,$5,$6,$7)',[v.id,queues[qi].id,completed?'completed':current?'serving':'waiting',entered,completed||current?new Date(entered.getTime()+8*60000):null,completed||current?new Date(entered.getTime()+10*60000):null,completed?new Date(entered.getTime()+15*60000):null]);
    }
    for(const name of ['Patricia Lim','Joseph Tan']){const p=await one(db,"INSERT INTO patients(name,birth_date,barangay) VALUES($1,'1988-03-22','Malhacan') RETURNING id",[name]);await db.query('INSERT INTO registration_requests(session_id,patient_id,queue_id,tracking_token) VALUES($1,$2,$3,$4)',[session.id,p.id,queues[0].id,token()]);}
  }
  if(!await one(db,'SELECT id FROM activities LIMIT 1')){
    const date=new Date(Date.now()+86400000*3).toLocaleDateString('en-CA',{timeZone:'Asia/Manila'});
    for(const [title,category,qid,desc] of [['Community Vaccination Drive','Vaccination',queues[3].id,'A healthier community starts with prevention. Book your vaccination appointment with our RHU team.'],['General Medical Consultation','Consultation',queues[0].id,'Primary care consultations for residents. Please bring your previous prescriptions and any relevant records.']]){
      const a=await one(db,"INSERT INTO activities(facility_id,queue_id,title,category,description,venue,requirements,activity_date,booking_opens,booking_closes,status,created_by) VALUES($1,$2,$3,$4,$5,'RHU 2 · Community health hall','Valid ID and previous health records',$6,now()-interval '1 day',$7,'published',$8) RETURNING id",[f.id,qid,title,category,desc,date,`${date}T07:00:00+08:00`,admin.id]);
      for(const hour of [8,9,10])await db.query('INSERT INTO activity_slots(activity_id,starts_at,ends_at,capacity) VALUES($1,$2,$3,10)',[a.id,`${date}T${String(hour).padStart(2,'0')}:00:00+08:00`,`${date}T${String(hour+1).padStart(2,'0')}:00:00+08:00`]);
    }
  }
  if(!await one(db,'SELECT id FROM information LIMIT 1'))for(const [kind,title,content,requirements] of [
    ['service','General consultation','Consultations are available at participating RHUs. Staff confirm arrival before adding patients to the live queue.','Bring a valid ID and previous prescriptions.'],
    ['service','Immunization and vaccination','Check published activities for available vaccination drives and book a timeslot. Eligibility is assessed by qualified healthcare staff.','Bring your vaccination card, if available.'],
    ['service','Maternal and child health','Ask the RHU team about available maternal and child health services and their schedules.','Bring your maternal or child health booklet.'],
    ['faq','How to get a queue number','Scan today’s QR code at the RHU, sign in or continue as a guest, and visit the front desk to confirm arrival. A Queue Officer will issue your number.',''],
    ['faq','How to book an appointment','Sign in to your patient account, open Activities, choose an available timeslot, and confirm. Patients without accounts may ask staff to book for them.',''],
    ['faq','Opening hours','Demo hours are 7:00 AM to 6:00 PM. These are sample hours; confirm actual schedules with the facility before live deployment.','']
  ])await db.query('INSERT INTO information(kind,title,content,requirements,approved,source) VALUES($1,$2,$3,$4,true,$5)',[kind,title,content,requirements,'QueCare demonstration content — requires RHU verification']);
  const p=await one(db,'SELECT id FROM patients WHERE user_id=$1',[patientUser.id]);
  if(!await one(db,'SELECT id FROM clinical_records WHERE patient_id=$1',[p.id]))await db.query("INSERT INTO clinical_records(patient_id,facility_id,author_id,summary,allergies,flags) VALUES($1,$2,$3,'Sample record for demonstration only. Routine primary care follow-up documented.','No known allergies documented','Demo data — not a clinical record')",[p.id,f.id,provider.id]);
});
await pool.end();console.log('Demo data ready. Accounts: admin, facility, officer, nurse, patient @quecare.local. Password: QueCareDemo2026!');
