# QueCare System Walkthrough and Presenter Script

Prepared 7 November 2026 · Application version 0.1.0 · Local evaluation build

Use this guide for a system demonstration, training session, or capstone presentation. Each feature includes the account to use, actions to perform, suggested narration, and the result to show. All example patients, accounts, and observations are fictional. Dates and times throughout the app use **Asia/Manila (UTC+08:00)**.

## 1. Walkthrough outline

Allow approximately **45–60 minutes** for the main presentation. Use the additional scenarios in Section 5 for detailed feature review.

| Order | Feature / presentation segment | Presenter workspace | Approx. time |
| --- | --- | --- | --- |
| 1 | Introduction, Health Unit selection, and public care hub | Guest | 3 minutes |
| 2 | Sign-in and role-based workspaces | All roles | 3 minutes |
| 3 | Daily session, QR registration, and public monitor | Facility administrator | 4 minutes |
| 4 | Guest registration and staff arrival confirmation | Guest → Queue Officer | 5 minutes |
| 5 | Calling, service, station transfer, and visit completion | Queue Officer / provider | 6 minutes |
| 6 | Activity creation, booking, rescheduling, and check-in | Administrator → patient → Queue Officer | 8 minutes |
| 7 | Clinical notes, attachments, and patient access | Provider → patient | 4 minutes |
| 8 | Selected-record sharing, destination approval, and revocation | Patient → Health Unit 4 provider → patient | 5 minutes |
| 9 | Directory approval, announcements, and information assistant | Facility administrator → CHO → guest | 5 minutes |
| 10 | Staff permissions, queue configuration, and CHO oversight | Facility administrator / CHO | 4 minutes |
| 11 | Reports, baseline observations, CSV export, and audit trail | Facility administrator / CHO | 4 minutes |
| 12 | End-of-day closure and closing explanation | Facility administrator | 2 minutes |

**Opening script:** “QueCare supports patient services across Meycauayan Health Units 2, 4, 5, 6, 7, 9, and 10. We will follow a patient from registration through the queue, appointments, and basic visit documentation, then show how staff manage access, approved information, and operational reports.”

## 2. Test accounts

These accounts are defined in [server/seed.ts](../server/seed.ts). They are available after demo seeding; they are not production accounts. If an account was previously changed or disabled, its original credentials may no longer work. Rerunning the seed does not reset existing account passwords or permissions.

**Shared seeded password: `QueCareDemo2026!`**

| Role | Name | Email / username | Password | Initial scope and use |
| --- | --- | --- | --- | --- |
| CHO / System administrator | Daniel Santos | `admin@quecare.local` | `QueCareDemo2026!` | Can switch among all configured Health Units; appoint facility administrators and approve directory content. |
| Facility administrator | Maria Reyes | `facility@quecare.local` | `QueCareDemo2026!` | Health Unit 2 operations, daily sessions, staff, activities, reports, and monitor. |
| Queue Officer | Ana Cruz | `officer@quecare.local` | `QueCareDemo2026!` | Assigned to all four seeded Health Unit 2 queues; assisted registration and queue operation. |
| Healthcare provider / nurse | Nurse Isabel Garcia | `nurse@quecare.local` | `QueCareDemo2026!` | Health Unit 2 clinical documentation and all four queues; activity-management permission is enabled. |
| Registered patient | Andrea Mendoza | `patient@quecare.local` | `QueCareDemo2026!` | Own appointments, tracking, records, and sharing. Date of birth: **12 April 1996**. |
| Guest patient | Enter a fictional patient | No account | None | Daily QR registration and private tracking; no login required. |

**Additional account for the cross-Health Unit demonstration — create before presenting:**

| Role | Name | Email | Suggested test-only password | Creation steps |
| --- | --- | --- | --- | --- |
| Healthcare provider, Health Unit 4 | Demo Health Unit 4 Provider | `provider.rhu4@quecare.local` | `QueCareDemo2026!` | Sign in as CHO, select Health Unit 4, open **Administration → Staff & permissions → Add staff member**, choose **Healthcare Provider**, and save. |

The Health Unit 4 provider is **not seeded**. A CHO account cannot substitute for a clinical provider during record-sharing approval. Create any other optional accounts under clearly labeled demonstration names.

## 3. Preparation checklist

1. For a new local demo installation, follow the [README](../README.md): install dependencies with `npm install`, run `npm run setup`, then `npm run dev`. Open **http://localhost:5173**. Do not run setup or seeding against a real patient database.
2. If the app is already configured, start it with `npm run dev`. Check today's Health Unit 2 session. On a later demonstration day, the operator can run `npm run db:seed` against the demo database to add that day's sample queue session. Seeding preserves existing data; it does not provide a clean reset or reopen a closed session.
3. Use Health Unit 2 for the main story. Its seeded stations are **Triage**, **Consultation**, **Nurse Station**, and **Vaccination**, with sample hours of **07:00–18:00**. Check queue status and staff assignments. Outside hours, enter the required truthful demo override reason when issuing/checking in a number.
4. Keep separate browser profiles or separate browser applications for the administrator, Queue Officer, provider, patient, guest, and Health Unit 4 provider as needed. Tabs within one profile share the login. Keep the monitor in the administrator's profile. For fewer profiles, sign out and sign in between segments.
5. Open the base address `/` when switching from a registration or tracking link back to the workspace. Links containing `?join=`, `?track=`, or `?monitor=` open dedicated screens.
6. Prepare a fictional guest, for example **Demo Walkthrough Patient**, born **15 June 1990**, barangay **Calvario**, with no real contact details. Reuse that person's existing profile if repeating the demo.
7. Prepare a small PDF, PNG, or JPEG containing only fictional content, at most **5 MB**, for attachment upload.
8. Create the Health Unit 4 provider account from Section 2. Confirm that Andrea's seeded Health Unit 2 sample note appears when signed in as the patient. To create an additional note, Andrea must first have a visit at Health Unit 2; the seeded note alone does not establish a visit for her.
9. Prepare the appointment timing below. Seeded activities are initially scheduled three days after seeding and are created only if there are no activities; do not assume they are still bookable on presentation day.
10. Leave **Close session** until the final segment. A session closed today cannot be reopened today.

### Appointment timing for a live presentation

Create a demonstration activity for **today**, with booking already open, booking closing a few minutes before its first slot, and two non-overlapping slots. Choose a first-slot start approximately **15–20 minutes after rehearsal/setup**, leaving enough time to book and reschedule before booking closes. All slot dates must match today's activity date. If setup occurs near midnight, schedule this segment for a suitable daytime session instead.

For example, when preparing at 09:00 Manila time, use booking open 08:00, booking close 09:18, slot 1 **09:20–10:00**, and slot 2 **10:00–10:40**, each with capacity 2. Book Andrea into slot 2, then reschedule her to slot 1 before 09:18. Check her in at or after 09:20; use the other presentation segments while waiting. Adapt all times to the actual demonstration day.

Do not issue Andrea a separate walk-in number before appointment check-in. Check-in must create/link the appointment visit. You can document that visit afterward. Use the fictional guest for the earlier walk-in story.

## 4. Main walkthrough: feature actions and script

### Feature 1 — Public care hub and facility selection

**Account:** Guest, not signed in.

**Steps:**

1. Open the app and select **Health Unit 2** using **Health Unit**.
2. Show **My care hub**, the station cards, **Book your visit**, **Follow your number**, and **Know before you go**.
3. Select another Health Unit to show facility-specific information, then return to Health Unit 2.
4. On a narrow screen, show **Open navigation**.

**Say:** “Patients can view approved information and queue conditions without an account. They choose the Health Unit they intend to visit. A patient account adds self-booking and access to their own records.”

**Show as evidence:** The selected Health Unit changes. Queue cards display numbers and operational information without exposing patient names. An unavailable average means there are insufficient observations, rather than zero waiting time.

### Feature 2 — Authentication and role-based navigation

**Accounts:** Facility administrator, Queue Officer, provider, and patient in their respective profiles.

**Steps:**

1. Select **Sign in / Register**, enter the facility administrator credentials, and select **Sign in**.
2. Point out the name, role, Health Unit, and staff navigation.
3. Briefly switch to the Queue Officer, provider, and patient profiles to compare menus.
4. Show the **Sign out** icon. Demo workspace shortcuts, when enabled, are optional; manual sign-in demonstrates the actual credentials.

**Say:** “Access follows the account's role, Health Unit, and queue assignments. Providers can document care; administrators manage operations. Administrator status does not grant clinical-note access.”

**Show as evidence:** **Patient records** appears for providers and patients. **Administration** and **Reports & insights** appear for administrators. Facility staff stay within their assigned Health Unit.

### Feature 3 — Daily session, registration QR, and waiting-area monitor

**Account:** Facility administrator at Health Unit 2.

**Steps:**

1. Open **Overview → Open daily session**, or **Live queues → Open session**, if today's session is not already open.
2. Select **Show QR code** or **Daily QR**.
3. Show the Health Unit and date; use **Copy registration link** for the guest profile.
4. Select **Open live monitor** or **Monitor** and show its separate tab. Use **Enter fullscreen** if appropriate.

**Say:** “Each operating day has a registration session and QR. The QR starts a pending registration; staff still verify physical arrival. The waiting-area monitor displays multiple stations and numbers together.”

**Show as evidence:** Today's session is open, the QR is available, and the monitor shows numbers, station states, and the announcement. Only an authorized administrator can open the monitor.

### Feature 4 — Guest QR registration and private tracking

**Account:** Guest in a separate signed-out profile or on a phone.

**Steps:**

1. Scan today's QR or open the copied registration link.
2. Confirm Health Unit 2 and today's date; select **Continue as a guest**.
3. Enter the fictional patient's name, date of birth, and barangay. Complete consent; provide a guardian/representative when required, including for a minor.
4. Choose **Triage** under **Where do you need to go?**.
5. Select **Register for arrival confirmation**.
6. Keep the tracking page open and use **Copy my private tracking link** to retain it privately.

**Say:** “A guest can register without an account. This screen confirms registration, while the front desk confirms identity and presence before issuing the active number.”

**Show as evidence:** **You're registered** and a pending status appear, without an active queue number. The patient is not yet in the active line.

### Feature 5 — Arrival confirmation, number issuance, and priority

**Account:** Queue Officer at Health Unit 2.

**Steps:**

1. Open **Live queues → Confirm on-site arrivals**.
2. Find the fictional guest and verify their name and date of birth against the person present.
3. Select **Confirm arrival**. For an ordinary arrival, leave priority unchecked; explain that **Staff-validated priority** requires verification and a reason.
4. Enter an outside-hours reason if required; select **Confirm arrival & issue number**.
5. Return to the guest's tracking page and allow approximately five seconds for the visible screen to refresh.

**Say:** “Staff issue the number after checking that the patient is present. Validated priority is a staff decision, and its reason remains private. A patient keeps one number through the Health Unit visit.”

**Show as evidence:** The pending registration disappears, an active number appears in the entry queue, and private tracking shows the number, station, and position.

### Feature 6 — Calling, service, transfer, and visit completion

**Account:** Queue Officer or provider assigned to the relevant queues.

**Steps:**

1. Open the **Triage** tab in **Live queues**. Seeded queues initially contain serving patients; finish or transfer their station work before calling another patient. Follow the displayed order rather than selecting a specific waiting patient.
2. Select **Call next number** and announce the number and station.
3. Select **Start service** when that patient approaches.
4. Select **Complete station**, then **Transfer**. Choose an open destination such as **Consultation** and select **Transfer patient**.
5. In the destination queue, resolve any current serving patient and call patients in order. Show that the transferred patient retains their number.
6. At the last station, select **Start service → Complete station → Finish visit**.
7. Show the corresponding changes on private tracking and the monitor.

**Say:** “Calling and starting service are separate events, so waiting time ends when service actually starts. Completing one station leaves a decision: transfer to another station or finish the visit. Transfers retain the same number.”

**Show as evidence:** Waiting → called → serving → completed station → transfer or completed visit. Only one number can be called or served in a station at a time. With multiple seeded patients, use more than one patient to illustrate transitions if reaching the new guest would take too long.

### Feature 7 — Create, publish, and manage a capacity-controlled activity

**Account:** Facility administrator, CHO, or the seeded nurse with activity-management permission.

**Steps:**

1. Open **Activities & booking → Create activity**.
2. Enter **Demo Walkthrough Consultation**, category **Consultation**, today's date, a fictional venue, requirements, and **Triage** as **Arrival entry queue**.
3. Configure booking and slots using the timing plan in Section 3. Explicitly update each slot date when changing the activity date; check the booking-close value too.
4. Save as **Draft · staff only** and show it under **Manage activities**.
5. Use **Edit activity**, set **Published · patients can book during booking hours**, and select **Save activity**.
6. Show **Available to patients** and the independent capacity of each slot.

**Say:** “An activity belongs to one Health Unit even if the venue is outside the health unit. Staff set its requirements, booking period, arrival station, and capacity per slot. Publishing makes it available to patients during the booking period.”

**Show as evidence:** The draft is staff-only; the published activity is visible to patients. Booking close must follow booking open and be no later than the first slot start. Slots cannot overlap, and capacity is 1–1,000 per slot.

### Feature 8 — Patient booking, rescheduling, cancellation, and staff roster

**Accounts:** Patient Andrea, then activity manager.

**Steps:**

1. Sign in as `patient@quecare.local` and select Health Unit 2.
2. Open **Activities & booking**, find the demo activity, and select **Choose a timeslot**.
3. Choose slot 2 and select **Confirm booking**; show the reference in **Appointments**.
4. Before booking closes, select **Reschedule**, choose slot 1, and select **Update booking**.
5. In the manager profile, open the activity's **Patient roster** to show the reservation and updated slot.
6. Explain **Cancel → confirmation checkbox → Cancel appointment**. If demonstrating cancellation, use another activity or a separate fictional patient's booking so Andrea's check-in reservation remains available.

**Say:** “A reservation secures a place in an arrival window. Patients can reschedule within the same activity while booking is open, or cancel before their slot starts. Staff have a private roster for follow-up.”

**Show as evidence:** The reservation is **confirmed**, the reference is retained, and slot availability reflects the reservation. A canceled place becomes available again. Do not promise email delivery in the local build; the in-app booking remains the source of confirmation.

### Feature 9 — Appointment arrival confirmation and live queue entry

**Account:** Queue Officer at Health Unit 2.

**Steps:**

1. At or after slot 1 starts, open **Appointments** and locate Andrea's reservation.
2. Verify identity and presence, then select **Check in**.
3. If applicable, enter a late-arrival/outside-hours reason. Select **Check in & issue number**.
4. Open **Live queues**, identify Andrea's issued number, and show the configured arrival station.
5. Serve and finish the visit using Feature 6, or retain the visit for documentation in Feature 10.

**Say:** “Booking does not itself join the live queue. Staff check-in confirms arrival and issues the visit number at the activity's configured station. Early check-in is rejected, and late exceptions need a reason.”

**Show as evidence:** The appointment becomes **checked in** and is linked to today's visit. Do not create a second walk-in registration for this scenario. If the slot has not started, continue with directory or administration features and return when it starts.

### Feature 10 — Clinical visit notes and private attachments

**Account:** Nurse/provider at Health Unit 2.

**Steps:**

1. Open **Patient records**, search for **Andrea Mendoza**, and verify the date of birth before selecting her.
2. Confirm the Health Unit 2 visit from Feature 9 appears in the history.
3. Select **Document visit**. Enter a summary such as “Fictional walkthrough visit; demonstration only,” plus appropriate fictional allergies/flags.
4. Select **Save visit summary**.
5. On that Health Unit 2 note, select **Attach PDF or image** and upload the prepared fictional file.
6. Sign in as Andrea and open **Patient records** to view the note and download the attachment.

**Say:** “Providers add facility-attributed visit summaries and private attachments. The patient can read their own records. Notes are appended; this interface does not edit or delete a saved summary.”

**Show as evidence:** The note identifies the Health Unit, provider, and date. Its attachment is available to authorized readers. A new note requires an existing local visit and is associated with the latest visit at that provider's Health Unit.

### Feature 11 — Share selected records with another Health Unit and revoke access

**Accounts:** Andrea → additional Health Unit 4 provider → Andrea.

**Steps:**

1. As Andrea, open **Patient records → Share selected records**.
2. Choose **Health Unit 4**. Select only the newly documented note, leaving the seeded sample note unselected so the scope is clear.
3. Enter fictional consent/request details, tick the authorization statement, and select **Request record sharing**.
4. Show the **pending** authorization.
5. As `provider.rhu4@quecare.local`, open **Patient records** and review **Record sharing authorizations**.
6. After verifying the fictional patient's identity and consent for the selected record, select **Verify consent & approve** and confirm.
7. Search for Andrea and show the selected Health Unit 2 note and attachment. The unselected note should remain unavailable through this grant.
8. As Andrea, select **Revoke** for that authorization. Refresh the Health Unit 4 provider's record view and check that the grant no longer provides access.

**Say:** “Sharing is for specific records and a destination Health Unit. Patient requests require destination-provider verification. Approval does not unlock every note or automatically include future notes. Revocation ends access through this grant.”

**Show as evidence:** Pending → approved → revoked. For a clear revocation demonstration, ensure there is no other approved grant for the same note and destination. Revocation does not recall an attachment already downloaded.

### Feature 12 — Service directory submission and CHO approval

**Accounts:** Facility administrator → CHO → guest.

**Steps:**

1. As facility administrator at Health Unit 2, open **Service directory → Add information**.
2. Choose **Frequently asked question**. Use the title **Walkthrough: what should I bring?**, a fictional demo answer, and a source labeled **Demonstration content — not actual Health Unit policy**.
3. Select **Save information** and show **Awaiting CHO approval** under **Review content**.
4. As CHO, select Health Unit 2, open **Service directory → Review content**, and select **Approve & publish**.
5. As guest, open **Service directory** and show the newly published entry with its source and date.
6. Explain that CHO can use **Unpublish** to withdraw it, or **Remove** to delete it. Withdraw the temporary entry after the demonstration.

**Say:** “Facilities submit service information, but CHO approves it before public publication. Cost references require a minimum, maximum, and source; they are approximate references rather than treatment quotations.”

**Show as evidence:** The entry appears publicly only after approval. No actual healthcare price list is seeded; use the FAQ example for the main presentation.

### Feature 13 — Facility announcements and information assistant

**Accounts:** Facility administrator → guest.

**Steps:**

1. Open **Administration → Announcements**, enter “Demo announcement: please prepare your queue number,” and select **Update announcement**.
2. Show the message using **Facility announcements** and on the administrator's monitor.
3. As guest, open **Ask QueCare** and ask **How do I get a queue number?**
4. Expand **Information sources** and point out the source/update date.
5. Ask an unsupported or clinical question to demonstrate the information boundary.

**Say:** “Announcements communicate operational updates immediately. The assistant answers from approved information and shows its sources. Optional AI may summarize non-cost information; the local approved-directory mode works without an AI key. It does not diagnose or provide medical advice.”

**Show as evidence:** The announcement updates, the registration answer reflects staff arrival confirmation, and the answer is labeled **APPROVED DIRECTORY** or **AI SUMMARY** according to the active service.

### Feature 14 — Queue configuration and staff permissions

**Account:** Facility administrator at Health Unit 2.

**Steps:**

1. Open **Administration → Queue stations → Create queue**.
2. Create **Demo Information Station** with a description, opening time, later cutoff, status **Open**, and a display order.
3. Use **Edit** to set it to **Paused**, save, then return it to **Open**. Use this empty station so the main care queues remain available.
4. Open **Staff & permissions → Add staff member**. Create a clearly fictional Queue Officer using a unique demo email and a password of at least 10 characters; assign only the new station.
5. Show the activity-management permission. Sign in as the new staff member to demonstrate their assigned queue scope.
6. Return as administrator, use **Permissions**, tick **Disable account and revoke active sessions**, and save when that optional account is no longer needed.

**Say:** “Queue assignments control which stations a staff member operates. Activity management is an additional permission. Clinical access follows the provider role; assigning a Queue Officer to a station does not grant access to clinical notes.”

**Show as evidence:** The station status and staff assignments persist. Disabling the account revokes its sessions. A station with history is archived when retired; an unused one can be deleted after confirmation. Resolve active patients before closing or retiring a station.

### Feature 15 — CHO oversight across Health Units

**Account:** CHO / System administrator.

**Steps:**

1. Use **Health Unit** to switch from Health Unit 2 to Health Unit 4.
2. Show **Overview**, **Administration**, and **Reports & insights** for the selected Health Unit.
3. Open **Staff & permissions → Add staff member** to show the **Facility Administrator** role option. Use a unique fictional account if demonstrating creation.
4. Return to Health Unit 2 before the reporting and closure segments.

**Say:** “CHO can oversee all participating Health Units and appoint facility administrators. Each screen and export follows the selected Health Unit, so we verify the facility before making changes.”

**Show as evidence:** Health Unit-specific queues and reports change with the selector. Do not describe this as a combined all-Health Unit analytics dashboard. CHO still has no routine clinical-note access.

### Feature 16 — Reports, baseline observations, and CSV export

**Account:** Facility administrator or CHO at Health Unit 2.

**Steps:**

1. Open **Reports & insights** and set **From** and **To** to include today.
2. Show **Service flow by station**, **Daily visit outcomes**, and appointment check-in/no-show counts.
3. Select **Baseline observation**. For a demo-only example, enter today's date, waiting time **20 minutes**, service time **10 minutes**, volume **10**, and source **Fictional walkthrough example — not research evidence**.
4. Select **Save baseline**, then **Export aggregates**.
5. Open the CSV and show its aggregate values without patient names.

**Say:** “Queue waiting runs from confirmed arrival or station entry to service start. Service time runs from service start to completion or transfer. Baseline observations allow comparison with the manual process, but evaluation requires measured, comparable data. A demo baseline does not establish improvement.”

**Show as evidence:** The baseline appears, the export downloads, and reports distinguish timing and visit outcomes. Reconstructed outage arrivals are excluded from timing averages. Public queue averages require at least three valid service starts; empty averages are not zero.

### Feature 17 — Recent audit trail

**Account:** Facility administrator or CHO at Health Unit 2.

**Steps:**

1. Open **Administration → Audit trail**.
2. Identify recent actions from the demonstration, along with their actor and time.
3. Relate an event to the corresponding operation, such as a permission or queue change.

**Say:** “The audit trail makes recent access and changes reviewable by authorized administrators. This screen shows the latest 100 events available for the Health Unit.”

**Show as evidence:** Relevant events appear with staff identity and timestamp. This is a recent-event view, not a complete audit export.

### Feature 18 — End-of-day session closure

**Account:** Facility administrator at Health Unit 2. Perform only after every other live demonstration is complete.

**Steps:**

1. Review waiting, skipped, called, serving, and station-completed patients across the Health Unit. Finish intended care journeys.
2. Open **Live queues → Close session**.
3. Read the consequences, tick **I have checked the remaining patients**, and select **Close daily session**.
4. Show the closed state. In the guest profile, reopen today's QR link to demonstrate expiry.

**Say:** “Closing the day stops further registration through this QR. Remaining active visits become unserved and pending arrivals expire. Today's closed session cannot be reopened.”

**Show as evidence:** The session is closed and its registration link is no longer usable. If another presentation is scheduled today, explain this feature without submitting closure.

## 5. Additional feature scenarios

Use these when the audience needs a fuller review. Keep them separate from the main patient journey so cancellations and timing changes do not interrupt later steps.

| Feature | Account and steps | Suggested script | Result to verify |
| --- | --- | --- | --- |
| Patient account registration | Guest: **Sign in / Register → Create a patient account**. Enter unique fictional identity/email, consent, guardian if required, and a 10–128 character password; select **Create account**. | “Public registration creates a patient account. Staff accounts are provisioned by administrators.” | The new patient is signed in. Use a separate identity from the main guest unless testing account linking. |
| Signed-in QR registration | Patient: scan today's QR, sign in if needed, verify the displayed patient name, authorize today's registration, choose a station, and submit; Queue Officer confirms arrival. Use a patient without an appointment-check-in scenario that day. | “Registered patients use the same on-site verification before number issuance.” | Pending registration becomes an active ticket after staff confirmation. |
| Password recovery | On a separate optional account, select **Forgot password?**, enter its email, and select **Send reset link**. Operator retrieves the message from configured email or private `.local/emails/` in local mode. Open the link, set a new password of at least 10 characters, and sign in. | “Recovery uses a reset link. Local demonstrations may store email privately instead of delivering it.” | The new password works. Record the change; the shared seeded password no longer applies if a seeded account is reset. |
| No-phone assisted registration | Queue Officer: **Live queues → Issue number**. Search using at least two letters and verify birth date. If needed, select **Register a new patient**, enter fictional details/consent, and select **Create patient profile**. Select the entry station and **Confirm on-site arrival & issue number**; handwrite the result. | “A smartphone and patient account are optional for queue participation.” | One visit and station entry exist for the verified patient. |
| Recall, skip, and return | Assigned staff: call a number, use **Recall** and announce it; before service starts, select **Skip**. Under **Skipped numbers**, select **Return to line** when the patient returns. | “A returned patient rejoins at the tail of their priority group with a new station-entry time.” | Another patient can be called while the first is skipped. A serving patient cannot be skipped. |
| Cancel a visit | Assigned staff: use **Cancel** in the waiting list or **Cancel visit** for the current patient; enter a reason and confirm. | “Cancellation records a reason and ends this care journey without marking it completed.” | The visit becomes canceled and leaves the active line. |
| Staff-assisted booking | Staff: **Activities & booking → Choose a timeslot**. Search/select an existing fictional guest profile, select a slot, and **Confirm booking**. If a profile is missing, create it through **Issue number**, then close the dialog without issuing a walk-in visit. | “Patients without accounts can reserve through staff.” | A confirmed booking belongs to the guest profile. The profile-creation entry point currently requires an open daily session. |
| No-show appointment | Staff: after a separate confirmed booking's slot ends, open **Appointments** and select **No-show** only for a patient who did not attend. | “Nonattendance is recorded separately from cancellation and check-in.” | The booking becomes no-show. This option is time-dependent. |
| Activity edits and cancellation | Manager: edit a separate activity; demonstrate a permitted description/capacity change. Review **Patient roster**, then **Cancel**, tick **I will notify affected patients**, and **Cancel activity**. | “Reserved capacity cannot be reduced below existing reservations. Canceling an activity requires staff follow-up.” | Confirmed reservations are canceled with the activity. Automatic mass messaging is not included. Reserved slot times cannot be moved or deleted. |
| Guest-to-account linking | Prepare a fictional guest history and a separate patient account with matching name/birth date whose account profile has no care history. Queue Officer/admin: **Issue number**, select the guest, expand **Link this guest profile to a patient account**, verify identity/account ownership, enter email and a verification note of at least 10 characters, tick verification, then **Link verified account**. | “Verified linking connects a guest's existing history to an otherwise unused matching account.” | The account accesses the guest history. Do not use Andrea's seeded account: its existing clinical record makes it unsuitable. Historical profile merging is refused. |
| Provider-assisted sharing | Provider: select a verified fictional patient, open **Share selected records**, choose destination and exact notes, enter verified consent details, tick verification, then **Record verified sharing consent**. | “Provider-assisted consent supports guests without a login.” | An approved authorization is created directly. The provider can share only notes they are authorized to access. |
| Destination-provider revocation | Destination provider: find an authorization addressed to their Health Unit under **Patient records**, select **Revoke**, then refresh the record view. | “A destination provider can withdraw an authorization addressed to their Health Unit.” | The grant is revoked. The originating provider does not automatically control all outgoing grants. |
| Outage reconciliation | After connectivity is restored, Queue Officer: **Issue number**, verify the patient, choose station, expand **Reconcile a paper registration after an outage**, tick the outage statement, enter today's original nonfuture arrival in Manila time, and submit. | “Paper arrivals can be encoded after reconnection. This records the arrival rather than replaying the entire paper care journey.” | The visit is reconstructed and excluded from timing averages. Reconcile its system number with the paper log. |
| Connection interruption | In an isolated demo browser, temporarily disconnect networking and wait for polling to fail. Show the stale/connection warning, then reconnect and refresh. | “Live operation needs connectivity. During outages staff use the Health Unit's paper process and announcements.” | Stale warnings appear; normal queue controls are disabled when updates fail. Cached screens are not an offline operating mode. |
| Cost-reference validation | Administrator: **Service directory → Add information → Third-party cost reference**. Show the minimum/maximum PHP and source fields without publishing invented prices. If an institution-approved reference exists, submit it and use CHO review. | “Public cost information requires a sourced range and approval. The assistant does not invent prices.” | An unsourced reference cannot be accepted as a complete cost entry; only approved content is publicly available. |

## 6. Presentation completion checklist

- The audience saw both guest and registered-patient journeys.
- A pending registration became an issued number only after staff verification.
- Calling, service start, station completion, transfer, and visit completion were distinguished.
- A booking became a checked-in visit through appointment check-in.
- A provider saved a fictional note, and the patient accessed the note/attachment.
- Only selected records became available at Health Unit 4 after approval; revocation was demonstrated.
- Facility submission and CHO publication were shown separately.
- The assistant displayed approved sources and its information-only scope.
- Queue/staff access, Health Unit scope, reports, CSV export, and audit events were shown.
- Temporary accounts/content were disabled or withdrawn as appropriate. Keep demo data separate from research observations.
- Closure was performed only if no further same-day demonstration needs the session.

**Closing script:** “This walkthrough showed how QueCare connects verified arrivals, station queues, appointments, and basic visit records while keeping clinical access role-based and sharing specific to selected notes. Its reports support operational evaluation; research conclusions still require measured baselines and external analysis. This build uses fictional data for local evaluation.”

For detailed operating instructions, see the [user manual](user-manual.md). For technical setup, see the [README](../README.md); for implemented scope and deployment work, see the [system description](system-description.md) and [implementation notes](implementation.md).

### Demonstrate configurable Health Units

**Account:** CHO/system administrator. Use a new fictional unit for this demonstration.

1. Open **Administration → Health Units** and select **Add Health Unit**. Enter a unique fictional name, address, and announcement. Create it and show that it has zero assigned users.
2. Select **Edit**, change the name, and choose **Review changes**. Show the old/new values and the warning that assignments and records keep their links while historical displays use the new name. Close the dialog to demonstrate cancellation, then repeat and confirm the edit.
3. Show that the selector displays the configured name directly. New units need queue stations and staff configured before operation.
4. Show the deletion blockers for the populated demo unit, including its assigned users. Disabled users still block deletion.
5. Delete only the unused fictional unit: verify its name, acknowledge permanent deletion, and confirm. Show that it disappears from the selector and the selected unit falls back to another available unit.
6. Open **Announcements**, edit the message, and cancel the publication confirmation to demonstrate that the existing announcement stays saved.

**Say:** “Only CHO/system administrators manage Health Units. Deleting a unit with users or linked operational data is blocked by the server. Audit history remains after an unused unit is deleted.”
