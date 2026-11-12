# QueCare

A locally runnable patient service application for Meycauayan City Health Units **2, 4, 5, 6, 7, 9, and 10**. Includes queueing, activity-based appointments, basic clinical visit records, selected-record sharing, and an informational assistant.

## Start locally

Requirements: Node.js 22.14+ and PostgreSQL 15+. The local helper detects Postgres.app on macOS; on other systems put PostgreSQL binaries in PATH or set `POSTGRES_BIN` to their directory **including its trailing slash**.

```sh
npm install
npm run setup
npm run dev
```

Open **http://localhost:5173**. Setup creates `.env` from `.env.example` if needed, starts an isolated local PostgreSQL cluster on port **55432**, applies migrations, and seeds fictional demonstration data. It does not modify an existing PostgreSQL cluster on port 5432. If using an existing database instead, create `.env`, set `DATABASE_URL`, then run `npm run db:migrate` and (development only) `npm run db:seed` rather than `setup`.

The app starts in the public patient workspace. Click **Sign in / Register**, then choose a demo workspace. Demo shortcuts are shown only when `ALLOW_DEMO_LOGIN=true` and `NODE_ENV` is not `production`.

| Account | Email | Password |
| --- | --- | --- |
| CHO administrator | admin@quecare.local | QueCareDemo2026! |
| Facility administrator | facility@quecare.local | QueCareDemo2026! |
| Queue officer | officer@quecare.local | QueCareDemo2026! |
| Nurse/provider | nurse@quecare.local | QueCareDemo2026! |
| Patient | patient@quecare.local | QueCareDemo2026! |

All sample people, schedules, and notes are fictional. The initial daily session and queue data are seeded at RHU 2. Other RHUs have configurable queues and no fictional visits. Run `db:seed` again on a later day to create that day's RHU 2 demo session. Do not use demo accounts or this local trust-authenticated database in production.

## Workflows

- **Queue:** an administrator opens the daily session and displays its QR. Unclosed prior-day sessions automatically expire when today's session is opened. QR registration creates a pending arrival. Staff verifies presence, issues the number, calls, starts service, completes the station, transfers, and separately finishes the visit. Guests need no account. No-phone patients can receive a handwritten number.
- **Monitor:** administrators open the fullscreen display from Overview or Live queues. Public snapshots and patient screens contain numbers only. Each queue has one serving patient; multiple queues operate together.
- **Appointments:** authorized staff create RHU-owned activities, venues, and capacity-controlled slots. Patients with accounts book online; staff can reserve for existing patient profiles. Staff arrival confirmation converts appointments to live entries. Late check-in needs a reason; early check-in is rejected.
- **Records:** providers document a visit at their RHU. Administrators and Queue Officers cannot read clinical notes. Patients select individual records for sharing; destination providers verify consent before access. Guests can use provider-assisted verified consent. Sharing includes only the selected notes and their attachments and can be revoked.
- **Account linking:** Queue Officers/admins can link a verified guest profile to a matching, otherwise unused patient account through the registration dialog. Identity and account ownership must be verified in person. Automatic merging of profiles with existing care history is intentionally refused.
- **Directory and assistant:** facility admins submit service/FAQ/cost entries; CHO approves publication. Cost references require a range and source. The assistant returns matched approved information locally and can optionally summarize non-cost content through Groq. No fabricated healthcare price list is included.
- **Research:** baseline observations, per-station waiting/service metrics, daily outcomes, appointment counts, and aggregate CSV exports. Timing calculations exclude reconstructed outage registrations. Surveys and statistical analysis remain external.

## Architecture

- React + Vite + TypeScript; Express + TypeScript; PostgreSQL using `pg`.
- Secure-cookie sessions, bcrypt passwords, hashed session/reset tokens, CSRF checks, origin validation, request limits, facility/queue permissions, private attachments, and access/change auditing.
- Versioned **SQL migrations** in place of Prisma: explicit PostgreSQL locks and partial unique indexes make the concurrency guarantees visible and directly testable. This is a small implementation change from the original plan; the database remains standard PostgreSQL and can move to Supabase or Neon.
- Five-second polling while screens are visible; stale warnings after failed updates. Waiting averages appear after three valid service starts. Cached public snapshots are not treated as an offline operating mode.
- Locally bundled fonts; no external font request. No paid QR generation, Redis, SMS, or search service required.

## Optional services

The local app works without provider accounts. All keys belong in `.env` or hosting environment variables, never source code or frontend variables.

| Integration | Configuration |
| --- | --- |
| Supabase/Neon PostgreSQL | Set `DATABASE_URL` to the provider's PostgreSQL connection string, using its recommended SSL and pooling settings. Run migrations against that database. |
| Supabase private storage | Set `STORAGE_PROVIDER=supabase`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET`. Create a **private** bucket. The backend proxies authorized downloads. |
| Resend email | Set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and verified `EMAIL_FROM`. Otherwise messages are written to private `.local/emails/*.json`. |
| Groq | Set `AI_PROVIDER=groq`, `GROQ_API_KEY`, and optionally `GROQ_MODEL`. With no key, on limits, or on timeout, approved directory answers remain available. |
| Hosting | `npm ci`, `npm run build`, `npm run db:migrate`, then `npm start`. Set `NODE_ENV=production`, `APP_URL` to the canonical HTTPS origin, and `PORT` as supplied by the host. Frontend and backend share the same origin. |

For an empty production database, set `INITIAL_ADMIN_NAME`, `INITIAL_ADMIN_EMAIL`, and `INITIAL_ADMIN_PASSWORD` (12+ characters) in the private provisioning environment, then run `npm run db:bootstrap`. This creates the seven RHUs and a CHO administrator without demo data. Remove the provisioning password afterward and configure queues through Administration.

Authentication is currently provided by this application's backend. Connecting Supabase as the database/storage provider does **not** require Supabase Auth. Replacing the auth implementation is a separate future migration, not an environment switch.

Free Render hosting can demonstrate the app but sleeps when idle. Use an always-on backend and tested backups before routine RHU operations. Local uploaded files are unsuitable for ephemeral hosts; configure private external storage. Booking email failures do not roll back confirmed reservations; staff can follow up using the roster. Reset-email failures report a service error.

## Verification

```sh
npm run build             # TypeScript checks + production build
npm test                  # Domain tests; DB suite skipped by default
npm run test:integration  # Real PostgreSQL, isolated disposable test schema
npm run verify:browser    # Local servers running; installed Chrome required
npm run verify:production # Built app, production headers, no demo shortcuts
npm audit
```

Browser verification uses the installed Google Chrome on macOS, or `CHROME_PATH`. It covers desktop navigation, the public monitor, 360px guest registration, staff arrival confirmation, mobile ticket tracking, and the assistant. It creates fictional browser-demo registrations and writes screenshots to `.local/screenshots/`.

Integration tests cover concurrent issuance/calls, idempotency, queue transfers, last-place booking races, capacity edits, CSRF, queue assignments, clinical permissions, QR expiry, guardian handling, selected-record consent/revocation, public-data minimization, assistant fallback, and aggregate exports.

## Deployment setup

See [the deployment plan and runbook](docs/deployment.md) for Cloudflare Workers frontend hosting, the existing Express backend in Docker, Supabase PostgreSQL/private Storage, Resend, CI, provisioning and rollback. This setup preserves the current app, authentication and polling. Supabase Auth, Edge Functions, per-user RLS, Android and new integrations remain separate work.

## Documents

- [System walkthrough: presentation outline, feature scripts, and test accounts](docs/system-walkthrough.md)
- [User manual: step-by-step use cases for every user type](docs/user-manual.md)
- [Revised system description](docs/system-description.md)
- [Implementation decisions and remaining deployment work](docs/implementation.md)

This release is for local evaluation with fictional data. Institutional consent text, actual RHU schedules/service information, external-provider configuration, backup/restore procedures, and production security/privacy review must be finalized before real patient use. It does not claim comprehensive legal or healthcare regulatory compliance.
