ALTER TABLE facilities ADD COLUMN allow_multiple_daily_sessions boolean NOT NULL DEFAULT false;

ALTER TABLE daily_sessions DROP CONSTRAINT daily_sessions_facility_id_day_key;
CREATE INDEX daily_sessions_facility_day ON daily_sessions (facility_id, day, opened_at DESC);
CREATE UNIQUE INDEX one_open_session_per_facility_day ON daily_sessions (facility_id, day) WHERE status = 'open';
