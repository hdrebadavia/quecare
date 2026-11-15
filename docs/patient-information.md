# Patient information implementation

The shared patient model and validation live in `shared/patient.ts`. New intake requires first/last name, birth date, sex and registration consent; guardian details remain required below age 18 using Manila's date. The form is shared by signup, guest QR and staff-assisted registration. Conditional details are normalized on both client and server. Membership answers are nullable booleans; identifiers are strings.

## Migration and release

Run `npm run db:migrate` against the intended database **before** starting the updated application. The runner pins one connection, takes the existing advisory lock, and applies 001 then 002 transactionally. Migration 002 adds patient columns and facility-access lookup indexes. Existing names, barangays, patient IDs, account links, visits, appointments, clinical notes and sharing grants remain intact. New values use empty text or null membership answers; no automatic identity/address inference occurs. Do not run demo seeds against production.

For rollback, stop the updated application and restore the earlier application version while retaining the additive columns. Do not drop the new columns as part of a routine application rollback. No deployment is performed by this change.

## Profile API

- `GET /api/patients/me` and `PATCH /api/patients/me`: signed-in patient's own profile.
- `GET /api/patients/:id` and `PATCH /api/patients/:id`: own profile for patients, all profiles for system admins, facility-connected profiles for care staff.
- Existing registration endpoints accept the shared camelCase fields, plus their existing signup/queue fields. Existing staff creation retains its database-shaped response for the queue workflow.
- New profile responses use camelCase and include `id`, derived `name`, resolved geographic names, and `addressRelease`. Legacy data is returned without guessing missing structured names or codes.
- PATCH rejects unknown fields and empty updates. It merges only submitted keys under a patient row lock, validates the resulting profile and persists changes plus required conditional cleanup. Name changes update the linked account in the same transaction. Supplying geographic codes triggers hierarchy validation and name resolution; unrelated edits preserve saved geographic data.
- Errors include `error` and, for field validation, `fieldErrors`. Reads and writes are audited without profile values in audit details. Search results retain their previous minimal field list; clinical-note permissions are unchanged.

Facility connections are established by a visit, pending or historical registration, activity booking, or `patient.create` audit event at that Health Unit. These checks apply independently of the minimal existing staff patient search. Anonymous users cannot view or edit profiles. Guest tracking tokens do not authorize profile access.

## Bundled nationwide addresses

Reference: Philippine Statistics Authority (PSA), Philippine Standard Geographic Code, **2026-Q3**, as of **30 September 2026**, released **12 October 2026**. Original publication:
https://psa.gov.ph/system/files/scd/PSGC-3Q-2026-Publication-Datafile.xlsx

PSA's website rejected scripted spreadsheet downloads (HTTP 403), so the publication workbook was retrieved from the public mirror recorded in `server/data/psgc.json`. The workbook metadata identifies PSA as originator and 30 September 2026 as its publication date. That file records the exact workbook SHA-256, original and mirror URLs, attribution, release dates, and totals. Only codes, names, geographic levels and parent relationships are retained. The workbook's stated use condition is acknowledgement of PSA as the source; attribution is included in the form and reference metadata.

The bundled reference contains 18 regions, 82 provinces, 1,642 cities/municipalities, and 42,010 barangays. Manila's sub-municipal district codes are mapped to City of Manila. Province-independent cities connect directly to their region. `GET /api/geography?parent=<code>` serves direct children from the local snapshot, or regions when parent is omitted. No external address API is called during patient use.

To reproduce this snapshot, download the workbook and run:

```sh
python3 scripts/import-psgc.py /path/to/PSGC-3Q-2026-Publication-Datafile.xlsx
```

Before a future reference update, revise the importer metadata and expected counts, review parent relationships and the publication's changes, and run geographic tests. Saved profiles keep their release and resolved names; this change does not silently remap retired codes.

## Verification

```sh
npm run build
npm test
npm run test:integration
npm run verify:patients
```

Database tests and focused Chrome checks use disposable schemas. Browser checks default to the local database on port 55432; `TEST_DATABASE_URL` selects another dedicated test database and `CHROME_PATH` selects a Chrome executable. Screenshots are written under `.local/screenshots/`. The checks cover all three intake flows, patient editing, staff viewing/editing, 360px layout, conditional clearing, address search/cascading and facility access. No real patient data is needed.
