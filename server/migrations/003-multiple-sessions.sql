-- Existing records become Session 1. Expire stale sessions before adding the active-session constraint.
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS allow_multiple_sessions boolean NOT NULL DEFAULT false;
ALTER TABLE daily_sessions ADD COLUMN IF NOT EXISTS session_number integer NOT NULL DEFAULT 1;
ALTER TABLE daily_sessions DROP CONSTRAINT IF EXISTS daily_sessions_facility_id_day_key;
ALTER TABLE daily_sessions ADD CONSTRAINT daily_sessions_facility_day_number_key UNIQUE(facility_id,day,session_number);
UPDATE queue_entries SET status='unserved',ended_at=now() WHERE status IN ('waiting','called','serving','skipped') AND visit_id IN (SELECT v.id FROM visits v JOIN daily_sessions s ON s.id=v.session_id WHERE s.status='open' AND s.day < (now() AT TIME ZONE 'Asia/Manila')::date);
UPDATE visits SET status='unserved',completed_at=now() WHERE status='active' AND session_id IN (SELECT id FROM daily_sessions WHERE status='open' AND day < (now() AT TIME ZONE 'Asia/Manila')::date);
UPDATE registration_requests SET status='expired' WHERE status='pending' AND session_id IN (SELECT id FROM daily_sessions WHERE status='open' AND day < (now() AT TIME ZONE 'Asia/Manila')::date);
UPDATE daily_sessions SET status='closed',closed_at=now() WHERE status='open' AND day < (now() AT TIME ZONE 'Asia/Manila')::date;
CREATE UNIQUE INDEX IF NOT EXISTS one_open_session_per_facility ON daily_sessions(facility_id) WHERE status='open';
