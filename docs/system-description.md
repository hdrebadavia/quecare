# QueCare — revised system description

## Purpose and boundaries

QueCare coordinates primary-care patient services for Meycauayan City Health Units 2, 4, 5, 6, 7, 9, and 10. It integrates live queueing, activity-based appointments, basic patient/visit records, and approved service/cost information. Barangay medical or vaccination drives belong to one of these RHUs, even when their venue is elsewhere.

The capstone's objectives remain the governing requirements: understand service-delivery factors, measure waiting-time changes against the manual process, and evaluate suitability, usability, reliability, and performance. Clinical diagnosis, emergency workflows, hospital care, claims, prescriptions, and national EMR integration remain excluded.

## Roles

| Role | Access |
| --- | --- |
| CHO/System Administrator | Seven-RHU setup, staff provisioning, operational reports, content approval, audit review; no routine clinical-note access |
| Facility Administrator | Own RHU's queues, daily sessions, staff assignments, activities, announcements, reports; no clinical-note access |
| Queue Officer | Assigned queues, identity lookup, assisted registration, verified arrival, calling and transfers; no clinical notes |
| Healthcare Provider | Own-RHU clinical notes and explicitly shared records; assigned queue operation if delegated |
| Patient | Own profile/account, appointments, tracking, records, selected sharing requests |
| Guest patient | Minimal registration and private visit tracking; account optional |

Activity publishing is a separate permission that can be assigned to nurses and other authorized staff. A separate DPO account/UI is deferred; institutional oversight remains an operational responsibility, not an implied privilege to read every clinical record.

## Queue journey

An administrator opens a facility's daily session and generates its expiring registration QR/link. The URL is not proof of presence. Registration creates a pending arrival reference. Staff verifies physical arrival and identity before issuing an active number. Staff can register and check in people without phones.

A visit retains one facility/day number across station transfers. Each station has its own queue entry and timestamps. A patient has at most one current station entry, and each queue serves at most one number at a time. Priority is staff validated and remains private. Within priority groups, order follows station entry time. Skipped patients return to their group's tail when staff confirms their return.

Calling, starting service, completing a station, transferring, canceling, and finishing the visit are distinct actions. Session closure expires the QR and pending arrivals and marks remaining visits unserved. Opening today's session also expires any unclosed prior-day sessions so old serving numbers cannot block a station. Queues with history are archived instead of deleted. Printers are a future integration; staff provide handwritten numbers initially.

The administrator monitor displays multiple queues, current and waiting numbers, queue states, announcements, and today's average waits. The mobile patient screen adds private visit status, position, and station history. Neither exposes other patients' names. Polling runs every five seconds while visible; failed updates show stale status.

## Waiting measurements

Queue waiting is service-start time minus station-entry time. The live arithmetic mean requires at least three valid same-day observations in that queue and includes a sample count. It is labeled as a historical average, not a guaranteed personal wait. Call time is recorded separately. Outage-reconstructed visits and unstarted entries do not contribute to timing averages. Reports distinguish waiting, service duration, and completed-visit turnaround.

## Activities and appointments

Activities describe consultations, vaccination drives, medical drives, and other primary-care events using common fields: title, category, description, owning RHU, venue, date, requirements, entry queue, booking window, and slots. Each slot has a start/end time and independent capacity.

Patients need an account to self-book. Staff can book for patients without accounts. One active reservation per patient/activity is permitted. Capacity is checked transactionally; canceled bookings release space and rescheduling swaps capacity atomically. Reserved slots cannot be moved or reduced below reservation counts. Cancellation retains history and a private contact roster for manual follow-up.

An appointment is an arrival window rather than a promise of an exact service-start time. Staff confirms arrival before queue issuance, rejects early entry, and records a reason for late exceptions. Confirmed patients use the same validated-priority/arrival ordering as walk-ins. There is no percentage-based walk-in/appointment policy engine in this release.

## Identity, clinical records, and sharing

Patient identity is separate from login identity. Name and birth date support staff duplicate checks; guardian/representative details support assisted registration. Optional contact details and barangay support operations. Guest-to-account linking requires in-person verification, matching identity, and an otherwise unused account profile. Automatic merging of historical records is excluded.

Providers document basic facility-attributed summaries and clinical flags for existing visits. Attachments are private PDFs, PNGs, or JPEGs up to 5 MB. Patients can request sharing of selected records with a destination RHU; destination providers verify consent before access. Providers can also record patient-verified consent for assisted workflows. Revocation removes future shared access. Unselected notes remain private; attachments follow their note's authorization.

Paper intake is limited to manual encoding and attachment after consent verification. Bulk migration and OCR are excluded.

## Information and AI

Facility service/FAQ entries and third-party cost ranges require CHO approval before public publication. Cost entries include a source and update date; no provider price is guaranteed. The assistant matches approved directory content. Optional AI summarizes public non-cost content; cost ranges are returned directly. The original free-text question and patient records are not sent to AI. Unsupported/clinical requests receive an informational boundary response or referral to RHU staff. Searchable approved content remains available without AI.

## Research, security, and outages

Operational timestamps and baseline observations support aggregate CSV analysis in Excel/Minitab. Surveys and qualitative/statistical analysis remain external. Baseline periods and survey dimensions must be aligned with the capstone's stated three objectives before evaluation; software does not assume proof of improvement.

Role/facility/queue authorization, password hashing, secure-cookie sessions, CSRF/origin checks, private storage, and audit events protect the application. Patient names never enter public monitor snapshots. Real patient deployment additionally requires institutional review of consent, hosting, access practices, retention, and backup/restore processes.

Internet connectivity is required. During outages, staff use paper procedures; the app disables normal live queue controls when updates fail and warns that cached displays are stale. Reconciled registrations retain an outage marker. Local digital queue operation, offline synchronization, SMS, multiple counters per queue, advanced scheduling policies, dependent self-booking, cross-RHU waitlists, payments, and printer integration are deferred.
