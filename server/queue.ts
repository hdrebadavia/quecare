import { randomUUID } from 'node:crypto';
import { one, dayInManila, type DB } from './db.js';
import { ensure } from './domain.js';
import { audit, queueAccess, type User, token } from './auth.js';
export async function issueVisit(db: DB, user: User, input: { patientId: string; sessionId: string; queueId: string; requestId?: string; bookingId?: string; priority?: boolean; reason?: string; reconstructed?: boolean; arrivedAt?: string }) {
  let q = await queueAccess(db,user,input.queueId);
  const session = await one(db, 'SELECT * FROM daily_sessions WHERE id=$1 FOR UPDATE', [input.sessionId]);
  ensure(session && session.facility_id === q.facility_id && session.status === 'open' && String(session.day).slice(0,10) === dayInManila(),'The daily session is closed or expired.');
  q = await queueAccess(db,user,input.queueId);
  ensure(q.status === 'open','This queue is not open.');
  const existing = await one(db, 'SELECT id,number,tracking_token FROM visits WHERE session_id=$1 AND patient_id=$2', [input.sessionId,input.patientId]);
  if (existing) return existing;
  const time = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
  if (time < String(q.opens_at).slice(0,5) || time >= String(q.cutoff).slice(0,5)) ensure(input.reason?.trim(),'Outside queue hours. Enter an override reason.');
  if (input.priority) ensure(input.reason?.trim(),'A validated priority reason is required.');
  const arrived = input.arrivedAt ? new Date(input.arrivedAt) : new Date();
  ensure(!input.arrivedAt || input.reconstructed,'An original arrival override must be marked as an outage reconstruction.');
  ensure(!isNaN(arrived.getTime()) && arrived <= new Date(),'Arrival time must not be in the future.');
  ensure(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).format(arrived)===dayInManila(),'Arrival must be today.');
  const visit = await one(db, 'INSERT INTO visits(session_id,patient_id,request_id,booking_id,number,tracking_token,reconstructed,arrived_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,number,tracking_token', [input.sessionId,input.patientId,input.requestId || null,input.bookingId || null,session.next_number,token(),!!input.reconstructed,arrived]);
  await db.query('UPDATE daily_sessions SET next_number=next_number+1 WHERE id=$1',[session.id]);
  await db.query('INSERT INTO queue_entries(visit_id,queue_id,priority,priority_reason,entered_at) VALUES($1,$2,$3,$4,$5)',[visit.id,q.id,!!input.priority,input.reason || '',arrived]);
  if(input.requestId) await db.query("UPDATE registration_requests SET status='checked_in' WHERE id=$1",[input.requestId]);
  if(input.bookingId) await db.query("UPDATE bookings SET status='checked_in',checked_in_at=now() WHERE id=$1",[input.bookingId]);
  await audit(db,user,'visit.check_in',visit.id,q.facility_id,{reason:input.reason || '',reconstructed:!!input.reconstructed});
  return visit;
}
export async function queueAction(db: DB, user: User, queueId: string, action: string, input: { entryId?: string; destinationId?: string; reason?: string }) {
  let queue = await queueAccess(db,user,queueId);
  const session = await one(db,"SELECT id FROM daily_sessions WHERE facility_id=$1 AND day=$2 AND status='open' FOR UPDATE",[queue.facility_id,dayInManila()]);
  ensure(session,'Open today’s session first.');
  queue = await queueAccess(db,user,queueId);
  ensure(queue.status !== 'archived' && queue.status !== 'closed','Queue is closed.');
  let entry;
  if(action === 'call') {
    ensure(queue.status === 'open','Resume the queue before calling.');
    ensure(!await one(db,"SELECT 1 FROM queue_entries WHERE queue_id=$1 AND status IN ('called','serving')",[queueId]),'Complete or skip the current number first.');
    entry = await one(db,"SELECT e.* FROM queue_entries e JOIN visits v ON v.id=e.visit_id WHERE e.queue_id=$1 AND v.session_id=$2 AND e.status='waiting' ORDER BY e.priority DESC,e.entered_at,e.id LIMIT 1 FOR UPDATE OF e",[queueId,session.id]);
    ensure(entry,'No patients waiting.');
    await db.query("UPDATE queue_entries SET status='called',called_at=now() WHERE id=$1",[entry.id]);
  } else {
    ensure(input.entryId,'Choose a queue entry.');
    entry = await one(db,'SELECT e.* FROM queue_entries e JOIN visits v ON v.id=e.visit_id WHERE e.id=$1 AND e.queue_id=$2 AND v.session_id=$3 FOR UPDATE OF e',[input.entryId,queueId,session.id]);
    ensure(entry,'Queue entry not found.',404);
    if(action==='recall') ensure(entry.status==='called','Only a called number can be recalled.');
    else if(action==='start') { ensure(entry.status==='called','Call the patient first.'); await db.query("UPDATE queue_entries SET status='serving',started_at=now() WHERE id=$1",[entry.id]); }
    else if(action==='skip') { ensure(['called','serving'].includes(entry.status),'Only the current number can be skipped.'); ensure(!entry.started_at,'A service already started must be completed or canceled.'); await db.query("UPDATE queue_entries SET status='skipped' WHERE id=$1",[entry.id]); }
    else if(action==='return') { ensure(entry.status==='skipped','Only skipped patients can return.'); await db.query("UPDATE queue_entries SET status='waiting',entered_at=now(),called_at=null WHERE id=$1",[entry.id]); }
    else if(action==='complete') { ensure(entry.status==='serving','Start service before completing it.'); await db.query("UPDATE queue_entries SET status='completed',ended_at=now() WHERE id=$1",[entry.id]); }
    else if(action==='finish') { ensure(entry.status==='completed','Complete this station first.'); ensure(!await one(db,"SELECT 1 FROM queue_entries WHERE visit_id=$1 AND status IN ('waiting','called','serving','skipped')",[entry.visit_id]),'Patient is still active at another station.'); await db.query("UPDATE visits SET status='completed',completed_at=now() WHERE id=$1",[entry.visit_id]); }
    else if(action==='transfer') {
      ensure(['serving','completed'].includes(entry.status),'Start service before transferring.'); ensure(input.destinationId && input.destinationId!==queueId,'Select a different queue.');
      const dest = await one(db,'SELECT * FROM queues WHERE id=$1',[input.destinationId]); ensure(dest && dest.facility_id===queue.facility_id && dest.status==='open','Destination must be an open queue in this facility.');
      ensure(!await one(db,"SELECT 1 FROM queue_entries WHERE visit_id=$1 AND status IN ('waiting','called','serving','skipped') AND id<>$2",[entry.visit_id,entry.id]),'Visit already transferred.');
      const visit = await one(db,'SELECT status FROM visits WHERE id=$1',[entry.visit_id]); ensure(visit.status==='active','Visit is no longer active.');
      await db.query("UPDATE queue_entries SET status='transferred',ended_at=coalesce(ended_at,now()) WHERE id=$1",[entry.id]);
      await db.query('INSERT INTO queue_entries(id,visit_id,queue_id,priority,priority_reason) VALUES($1,$2,$3,$4,$5)',[randomUUID(),entry.visit_id,dest.id,entry.priority,entry.priority_reason]);
    } else if(action==='cancel') { ensure(input.reason?.trim(),'Enter a cancellation reason.'); ensure(['waiting','called','serving','skipped','completed'].includes(entry.status),'Entry cannot be canceled.'); await db.query("UPDATE queue_entries SET status='canceled',ended_at=now() WHERE id=$1",[entry.id]); await db.query("UPDATE visits SET status='canceled',completed_at=now() WHERE id=$1",[entry.visit_id]); }
    else ensure(false,'Unknown queue action.');
  }
  await db.query('INSERT INTO queue_events(visit_id,queue_id,actor_id,action,detail) VALUES($1,$2,$3,$4,$5)',[entry.visit_id,queueId,user.id,action,JSON.stringify(input)]);
  await audit(db,user,`queue.${action}`,entry.visit_id,queue.facility_id);
  return { success: true };
}
