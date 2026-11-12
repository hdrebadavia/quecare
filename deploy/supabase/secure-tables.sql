-- QueCare uses its Express backend and an owner PostgreSQL connection.
-- Browser clients must not access application tables through Supabase's Data API.
-- Table owners bypass RLS; deliberately do not FORCE RLS or add public policies.
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'facilities', 'users', 'patients', 'auth_sessions', 'reset_tokens',
    'queues', 'queue_assignments', 'daily_sessions', 'registration_requests',
    'activities', 'activity_slots', 'bookings', 'visits', 'queue_entries',
    'queue_events', 'clinical_records', 'sharing_grants', 'attachments',
    'information', 'audit_events', 'baseline_metrics', 'idempotency_keys',
    'schema_migrations'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', table_name);
  END LOOP;
END
$$;
