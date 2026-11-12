# Implementation notes

## What is implemented

The project is a full-stack local evaluation build, not a set of static mockups. All operational data lives in PostgreSQL. UI workflows call authenticated APIs and database constraints enforce invariants under concurrency. The four capstone modules are represented with the intentionally limited scope in the revised system description.

## Deliberate implementation decisions

- Direct `pg` and versioned SQL migrations replace Prisma so queue/session locks, capacity locks, and partial unique indexes are explicit. Migrations are tracked in `schema_migrations` and run under a PostgreSQL advisory lock.
- React and Express share one production origin. Secure-cookie authentication is implemented locally; Supabase Auth has not been substituted behind the application's sessions.
- Supabase-compatible private object storage and Resend/Groq adapters are optional and have not been exercised with live provider credentials. Local adapters are the default.
- The AI fallback is deterministic approved-content retrieval, not a simulated claim that an AI model ran. AI answers are explicitly labeled when a live Groq response is used. Cost data is never invented or model-generated.
- Clinical notes are appended rather than silently edited, providing basic provenance. Facility administrators manage operations without automatic access to those notes.
- Activity cancellation relies on staff roster follow-up. Individual booking confirmations, updates, cancellation, and password reset email use the email adapter. Delivery failures retain booking state.
- Reconstructed outage arrivals are supported, but there is no complete offline event replay or historical-service reconstruction tool.

## Deployment tasks still required

1. Create an empty production database; configure secure PostgreSQL transport and provider access. Apply migrations without running the demo seed.
2. Set `INITIAL_ADMIN_NAME`, `INITIAL_ADMIN_EMAIL`, and `INITIAL_ADMIN_PASSWORD` (12+ characters) in the private provisioning environment and run `npm run db:bootstrap`. It creates the seven RHUs and one CHO administrator without demo patients or accounts. Remove the provisioning password afterward. Configure queues and staff through Administration. Review the onboarding/password-reset process with the operator.
3. Configure the canonical `APP_URL`, HTTPS, and persistent private attachment storage. Do not store patient attachments on an ephemeral hosting filesystem.
4. Connect verified sender email and optional AI credentials. Review provider privacy/retention settings. Configure institution-approved backups and test database plus attachment recovery.
5. Replace demo schedules, service information, and consent wording with approved RHU information. Collect comparable manual baseline observations before introducing the system.
6. Review retention, account recovery, file handling, audit access, capacity/load, and privacy controls before real patient use. Automated malware scanning, a separate DPO interface, uptime alerting, survey embedding, and email-delivery retry queues are not included.

The local database helper uses trust authentication **on loopback only**, on port 55432. This is a convenience for fictional development data; it is not the production database configuration.
