CREATE TABLE IF NOT EXISTS facilities (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE, address text NOT NULL DEFAULT '', announcement text NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, email text NOT NULL UNIQUE,
 password_hash text NOT NULL, role text NOT NULL CHECK(role IN ('system_admin','facility_admin','queue_officer','provider','patient')),
 facility_id uuid REFERENCES facilities(id), can_manage_activities boolean NOT NULL DEFAULT false,
 disabled boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS patients (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid UNIQUE REFERENCES users(id),
 name text NOT NULL, birth_date date NOT NULL, barangay text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '',
 guardian_name text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS auth_sessions (
 token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 csrf text NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS reset_tokens (
 token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id), expires_at timestamptz NOT NULL, used_at timestamptz
);
CREATE TABLE IF NOT EXISTS queues (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), facility_id uuid NOT NULL REFERENCES facilities(id),
 name text NOT NULL, description text NOT NULL DEFAULT '', sort_order int NOT NULL DEFAULT 0,
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','paused','closed','archived')),
 opens_at time NOT NULL DEFAULT '08:00', cutoff time NOT NULL DEFAULT '16:00',
 UNIQUE(facility_id,name)
);
CREATE TABLE IF NOT EXISTS queue_assignments (
 user_id uuid NOT NULL REFERENCES users(id), queue_id uuid NOT NULL REFERENCES queues(id), PRIMARY KEY(user_id,queue_id)
);
CREATE TABLE IF NOT EXISTS daily_sessions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), facility_id uuid NOT NULL REFERENCES facilities(id),
 day date NOT NULL, token text NOT NULL UNIQUE, status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed')),
 next_number int NOT NULL DEFAULT 1, opened_at timestamptz NOT NULL DEFAULT now(), closed_at timestamptz,
 UNIQUE(facility_id, day)
);
CREATE TABLE IF NOT EXISTS registration_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES daily_sessions(id),
 patient_id uuid NOT NULL REFERENCES patients(id), queue_id uuid NOT NULL REFERENCES queues(id),
 tracking_token text NOT NULL UNIQUE, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','checked_in','expired')),
 consent_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(session_id,patient_id)
);
CREATE TABLE IF NOT EXISTS activities (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), facility_id uuid NOT NULL REFERENCES facilities(id),
 queue_id uuid NOT NULL REFERENCES queues(id), title text NOT NULL, description text NOT NULL DEFAULT '',
 category text NOT NULL DEFAULT 'Consultation', venue text NOT NULL, requirements text NOT NULL DEFAULT '',
 activity_date date NOT NULL, booking_opens timestamptz NOT NULL, booking_closes timestamptz NOT NULL,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','canceled')),
 created_by uuid NOT NULL REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(booking_opens < booking_closes)
);
CREATE TABLE IF NOT EXISTS activity_slots (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), activity_id uuid NOT NULL REFERENCES activities(id),
 starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL, capacity int NOT NULL CHECK(capacity>0), CHECK(starts_at<ends_at)
);
CREATE TABLE IF NOT EXISTS bookings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), activity_id uuid NOT NULL REFERENCES activities(id),
 slot_id uuid NOT NULL REFERENCES activity_slots(id), patient_id uuid NOT NULL REFERENCES patients(id),
 reference text NOT NULL UNIQUE, status text NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed','checked_in','canceled','no_show')),
 created_at timestamptz NOT NULL DEFAULT now(), checked_in_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_booking ON bookings(activity_id,patient_id) WHERE status IN ('confirmed','checked_in');
CREATE TABLE IF NOT EXISTS visits (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES daily_sessions(id),
 patient_id uuid NOT NULL REFERENCES patients(id), request_id uuid UNIQUE REFERENCES registration_requests(id),
 booking_id uuid UNIQUE REFERENCES bookings(id), number int NOT NULL, tracking_token text NOT NULL UNIQUE,
 arrived_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','canceled','unserved')),
 reconstructed boolean NOT NULL DEFAULT false, UNIQUE(session_id,number), UNIQUE(session_id,patient_id)
);
CREATE TABLE IF NOT EXISTS queue_entries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), visit_id uuid NOT NULL REFERENCES visits(id), queue_id uuid NOT NULL REFERENCES queues(id),
 status text NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting','called','serving','skipped','completed','transferred','canceled','unserved')),
 priority boolean NOT NULL DEFAULT false, priority_reason text NOT NULL DEFAULT '',
 entered_at timestamptz NOT NULL DEFAULT now(), called_at timestamptz, started_at timestamptz, ended_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS one_current_entry ON queue_entries(visit_id) WHERE status IN ('waiting','called','serving','skipped');
CREATE UNIQUE INDEX IF NOT EXISTS one_serving_per_queue ON queue_entries(queue_id) WHERE status IN ('called','serving');
CREATE INDEX IF NOT EXISTS queue_order ON queue_entries(queue_id, priority DESC, entered_at);
CREATE TABLE IF NOT EXISTS queue_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), visit_id uuid REFERENCES visits(id), queue_id uuid REFERENCES queues(id),
 actor_id uuid REFERENCES users(id), action text NOT NULL, detail jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS clinical_records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), patient_id uuid NOT NULL REFERENCES patients(id),
 facility_id uuid NOT NULL REFERENCES facilities(id), visit_id uuid REFERENCES visits(id), author_id uuid NOT NULL REFERENCES users(id),
 summary text NOT NULL, allergies text NOT NULL DEFAULT '', flags text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sharing_grants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), patient_id uuid NOT NULL REFERENCES patients(id),
 destination_id uuid NOT NULL REFERENCES facilities(id), record_ids uuid[] NOT NULL,
 requested_by uuid NOT NULL REFERENCES users(id), verified_by uuid REFERENCES users(id),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','revoked')),
 consent_note text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), verified_at timestamptz
);
CREATE TABLE IF NOT EXISTS attachments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), record_id uuid NOT NULL REFERENCES clinical_records(id),
 storage_key text NOT NULL, filename text NOT NULL, content_type text NOT NULL, size int NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS information (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), facility_id uuid REFERENCES facilities(id),
 kind text NOT NULL CHECK(kind IN ('service','faq','cost')), title text NOT NULL, content text NOT NULL,
 requirements text NOT NULL DEFAULT '', source text NOT NULL DEFAULT '', cost_min numeric, cost_max numeric,
 approved boolean NOT NULL DEFAULT false, updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(cost_min IS NULL OR cost_min>=0), CHECK(cost_max IS NULL OR cost_max>=cost_min)
);
CREATE TABLE IF NOT EXISTS audit_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid REFERENCES users(id), facility_id uuid REFERENCES facilities(id),
 action text NOT NULL, target_id text, detail jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS baseline_metrics (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), facility_id uuid NOT NULL REFERENCES facilities(id), day date NOT NULL,
 waiting_minutes numeric NOT NULL CHECK(waiting_minutes>=0), service_minutes numeric NOT NULL CHECK(service_minutes>=0),
 volume int NOT NULL CHECK(volume>=0), source text NOT NULL, UNIQUE(facility_id,day)
);
CREATE TABLE IF NOT EXISTS idempotency_keys (
 user_id uuid NOT NULL REFERENCES users(id), key text NOT NULL, route text NOT NULL, response jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,key)
);
