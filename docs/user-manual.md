# QueCare User Manual

**A practical guide for patients, guests, Queue Officers, healthcare providers, facility administrators, and CHO administrators**  
Version 1.0 · Prepared 30 October 2026 · Applies to application version 0.1.0

QueCare helps organize patient visits at configurable Health Units. The initial demo/bootstrap defaults are Meycauayan City Health Units **2, 4, 5, 6, 7, 9, and 10**. Use this manual to follow a complete task, from its starting requirements to the result you should see. Button and menu names in **bold** match the application.

This manual describes the current local evaluation build. Training must use fictional patient information. Actual facility schedules, published services, privacy notices, and deployment arrangements must be finalized by the institution before routine patient use.

## Contents

1. [Choose your user type](#1-choose-your-user-type)
2. [Getting started and shared tasks](#2-getting-started-and-shared-tasks)
3. [Guest patients and representatives](#3-guest-patients-and-representatives)
4. [Registered patients](#4-registered-patients)
5. [Queue Officers](#5-queue-officers)
6. [Healthcare providers and nurses](#6-healthcare-providers-and-nurses)
7. [Facility administrators](#7-facility-administrators)
8. [CHO or system administrators](#8-cho-or-system-administrators)
9. [Activity management for authorized staff](#9-activity-management-for-authorized-staff)
10. [Status and timing reference](#10-status-and-timing-reference)
11. [Troubleshooting](#11-troubleshooting)
12. [Practice walkthroughs](#12-practice-walkthroughs)

## 1. Choose your user type

| User type | Main tasks | Access boundaries |
| --- | --- | --- |
| Guest patient | Read published information, register through the daily QR, follow a private queue link | No account needed for queue registration. Ask staff for appointments and record sharing. |
| Registered patient | Book appointments, join the queue, view own records, request or revoke record sharing | Access is limited to the patient's own bookings and records. |
| Queue Officer | Verify arrivals, issue numbers, operate assigned queues, assist with bookings, link verified guest profiles to accounts | Assigned Health Unit and queues; no clinical-note access. |
| Healthcare provider / nurse | Operate assigned queues, document visits, attach files, read authorized records, verify sharing consent | Clinical records at their Health Unit and specifically authorized records from other Health Units. |
| Facility administrator | Manage daily sessions, queues, staff access, monitor, announcements, directory submissions, activities, and reports | Assigned Health Unit; cannot appoint or change administrator access or read clinical notes. |
| CHO / system administrator | Oversee all participating Health Units, appoint facility administrators, approve directory information, review operations | Can switch Health Units; administrator status does not grant clinical-note access. |

Queue Officers and providers can create and manage activities only when an administrator grants the activity-management permission. They can assist with individual bookings without that extra permission.

**Choose a starting point:** patients should use Sections 3–4; front-desk staff Section 5; clinical staff Section 6; administrators Sections 7–9.

## 2. Getting started and shared tasks

### G1. Open QueCare and select an Health Unit

**Before you start:** obtain the QueCare address from your facility. For a running local demonstration, use `http://localhost:5173`.

1. Open the address in your browser.
2. Check **YOUR HEALTH FACILITY** at the top of the page.
3. If available, use **Health Unit** to select the Health Unit you intend to visit or manage.
4. On a small screen, use **Open navigation** to access the menus.

**Expected result:** information and activities load for the selected Health Unit. Facility staff are restricted to their assigned Health Unit; CHO administrators can switch between facilities. QR registration and tracking links select their associated Health Unit automatically.

### G2. Sign in and sign out

1. Select **Sign in / Register**.
2. Enter your email address and password, then select **Sign in**.
3. Confirm your name and role in the top bar. On smaller screens, some top-bar details may be hidden.
4. When finished, use the **Sign out** icon in the top bar, especially on a shared computer.

**Expected result:** your role's workspace appears. Staff accounts are created by administrators; public registration creates patient accounts only.

### G3. Reset a forgotten password

1. Open **Sign in / Register**, then select **Forgot password?**
2. Enter your account email and select **Send reset link**.
3. Open the reset link from the email, enter a new password of at least 10 characters, and select **Reset password**.
4. Sign in with the new password.

**Expected result:** the application confirms the password update. In a local demonstration, email may be stored locally instead of delivered; ask the demonstration operator for help.

### G4. Find service information and announcements

1. Select the correct Health Unit, then open **Service directory**.
2. Read the service description, requirements, source, and update date.
3. Use the **Facility announcements** bell to read the Health Unit's current announcement.

**Expected result:** only approved directory entries appear publicly. A third-party cost reference is an approximate range with a source, not a quotation for your treatment.

### G5. Ask the information assistant

1. Select **Ask QueCare**.
2. Choose a suggested question or enter a question about registration, appointments, services, or published cost references.
3. Select **Send question** and review the answer.
4. Expand **Information sources**, when available, to check the source and update date.

**Expected result:** an approved-directory answer or a labeled AI summary appears. If no approved information is available, ask the Health Unit team. Do not enter patient names, clinical notes, or other personal information; the assistant provides information support and cannot provide medical advice.

## 3. Guest patients and representatives

### V1. Register through the daily QR without an account

**Before you start:** be at the correct Health Unit and obtain today's QR from staff. The daily session and your entry station must be open.

1. Scan the QR and check the displayed Health Unit and registration date.
2. Select **Continue as a guest**.
3. Enter the patient's full name and date of birth. Add barangay and optional mobile number as appropriate.
4. Enter a **Guardian / representative** for a patient under 18, or where applicable.
5. Read and acknowledge the registration privacy/consent statement.
6. Under **Where do you need to go?**, choose an entry station.
7. Select **Register for arrival confirmation**.
8. At the front desk, confirm the patient's name and date of birth with staff.

**Expected result:** the tracking page first shows **You're registered** and a pending status. Your active queue number appears only after staff confirms your arrival. Submitting the QR form alone does not put you in the active line.

### V2. Receive care without a phone

1. Go to the front desk and request staff-assisted registration.
2. Give the patient's name and date of birth so staff can find an existing profile.
3. If there is no profile, provide registration details and consent, including guardian details where required.
4. Receive the issued number from staff; it may be handwritten.
5. Watch the number display and listen for staff announcements.

**Expected result:** you join the appropriate queue without creating an account or using a phone.

### V3. Follow your number and move between stations

1. Keep the tracking page from registration open. Use **Copy my private tracking link** to save its address privately.
2. Check your number, current station, status, and position.
3. Approach the station when the status is **called** or staff announces your number.
4. If transferred, follow the new station shown on the tracking page. Your number stays the same.
5. If your number was skipped, ask the station staff to return you to the line.

**Expected result:** the page reflects your current station and visit progress. Visible tracking screens refresh approximately every five seconds. **Follow your number** in **My care hub** opens the last tracking reference saved on that browser; it is not a list of every family member's ticket.

Keep the tracking link private. Public monitors show numbers, while the tracking link provides access to your ticket's progress. An average wait is historical information, not a promised service time.

### V4. Request an appointment or share records as a guest

1. For an appointment, ask staff to reserve a published activity timeslot against your existing patient profile.
2. Keep the booking reference and arrival details staff provides.
3. For record sharing, ask a healthcare provider to review the specific records and destination Health Unit with you.
4. Complete identity and consent verification with the provider or appropriate representative.

**Expected result:** staff can assist with appointments and providers can record verified sharing consent without a patient login. A guardian name is a registration field; this build does not provide a separate guardian account with a dependent-management dashboard.

## 4. Registered patients

### P1. Create a patient account

1. Select **Sign in / Register**, then **Create a patient account**.
2. Complete the patient details, including guardian/representative details where required.
3. Acknowledge the privacy and registration consent statement.
4. Enter an email address and a password of 10–128 characters.
5. Select **Create account**.

**Expected result:** you are signed in as a patient. The account works across all participating Health Units. If you already have a guest care history, ask the front desk to link the verified profile before creating new visits or bookings on the new account; see Q7.

### P2. Join today's queue using your account

1. Scan the Health Unit's daily QR.
2. Select **Sign in or create an account** if you are not signed in.
3. Check the patient name displayed on the registration form.
4. Authorize registration for today's visit and choose the entry station.
5. Select **Register for arrival confirmation**.
6. Ask front-desk staff to confirm your identity and presence.

**Expected result:** the private tracking page changes from pending registration to an issued number after staff confirmation. Follow V3 to track your visit.

### P3. Book an activity timeslot

**Before you start:** sign in with a patient account. The activity must be published, its booking period open, and a slot available.

1. Select the intended Health Unit and open **Activities & booking** or **Find an activity**.
2. Review the activity date and venue, then select **Choose a timeslot**.
3. Read the requirements and select an available timeslot.
4. Select **Confirm booking**.
5. Open **Appointments** to check the reference, date, time, and **confirmed** status.
6. On the activity date, attend the listed venue and ask staff to check you in.

**Expected result:** you have a confirmed reservation. The timeslot is an arrival window; staff check-in is still required to issue a live queue number. Save the reference from the app even if an email does not arrive.

### P4. Reschedule or cancel an appointment

1. Open **Appointments** and locate the confirmed booking.
2. To change times, select **Reschedule**, choose an available slot within the same activity, and select **Update booking**.
3. To cancel, select **Cancel**, check the confirmation box, and select **Cancel appointment**.
4. Check the updated time or canceled status in the list.

**Expected result:** rescheduling moves the reservation and cancellation releases the place. Rescheduling requires the activity's booking period to remain open. Patients must cancel before the slot starts; contact the Health Unit if it has already started. Checked-in bookings cannot be changed through these controls.

### P5. Read your visit records and attachments

1. Open **Patient records**.
2. Review the visit history and documented summaries.
3. Check the Health Unit, date, and documenting provider to identify the correct note.
4. Select an attachment's filename to download it, if present.

**Expected result:** your own recorded summaries and attachments appear. An empty record list may mean a provider has not yet documented the visit. Ask the provider about missing information or corrections.

### P6. Request sharing of selected records

1. In **Patient records**, select **Share selected records**.
2. Choose the **Destination Health Unit**.
3. Tick only the records you want that Health Unit to receive.
4. Enter the consent/request details and confirm authorization for those selected records.
5. Select **Request record sharing**.
6. Contact a provider at the destination Health Unit for identity and consent verification.

**Expected result:** the authorization first appears as **pending**. After destination-provider approval, destination providers can access the selected notes and their attachments. Unselected notes remain outside that authorization; a later note requires a separate selection and authorization.

### P7. Revoke record sharing

1. Open **Patient records** and find **Record sharing authorizations**.
2. Identify the authorization by its destination and selected-record count.
3. Select **Revoke** and check that its status becomes **revoked**.

**Expected result:** that authorization no longer grants access. Revocation cannot recall previously downloaded copies, and another approved authorization for the same record may still permit access.

## 5. Queue Officers

**Start of shift:** sign in, check your Health Unit, open **Live queues**, and confirm the daily session is open and your queues are assigned. Ask an administrator to open the session or correct access when necessary.

### Q1. Confirm a QR registration and issue a number

1. Open **Live queues** and locate **Confirm on-site arrivals**.
2. Match the registration to the person present using their name and date of birth.
3. Select **Confirm arrival**.
4. If priority is justified, tick **Staff-validated priority** and enter the reason. Enter an override reason for issuance outside station hours when applicable.
5. Select **Confirm arrival & issue number**.
6. Tell the patient their number and next station.

**Expected result:** the registration leaves the pending list, a number is issued, and the tracking page updates. You must have access to the patient's entry queue.

### Q2. Register a walk-in or a patient without a phone

1. Select **Issue number** in **Live queues**, or **Issue a number** in **Overview**.
2. Search the patient's name using at least two letters. Verify date of birth before selecting an existing profile.
3. If there is no matching profile, select **Register a new patient**, complete the details and consent, and select **Create patient profile**.
4. Choose an open **Entry queue** that you can operate.
5. Record a priority or outside-hours reason if needed.
6. Select **Confirm on-site arrival & issue number**.
7. Write down the issued number for the patient and explain where to wait.

**Expected result:** an active visit and station entry are created. If the patient already has a visit in today's session, use their existing number rather than registering another visit.

### Q3. Call and serve a patient

1. Open the appropriate queue tab in **Live queues**.
2. Select **Call next number**. The system selects validated priority first, then arrival order.
3. Announce the number and station. When the patient arrives, select **Start service**.
4. When the station's work ends, select **Complete station**.
5. Under **Station complete · choose the next step**, choose **Transfer** if another station is needed, or **Finish visit** if the care journey is complete.

**Expected result:** the number moves through waiting, called, serving, and station completion. **Complete station** alone does not finish the visit. Only one patient can be called or served at a station at a time.

### Q4. Recall, skip, return, transfer, or cancel

| Situation | Steps | Expected result |
| --- | --- | --- |
| Called patient has not approached | Select **Recall** and announce the number again. | The same number remains called; announce it yourself. |
| Called patient is absent | Select **Skip** before starting service. | The number appears under **Skipped numbers**, allowing the next call. |
| Skipped patient returns | Find them under **Skipped numbers**, then select **Return to line**. | They rejoin with a new station-entry time within their priority group. |
| Another station is required | During service select **Transfer to another queue**, or select **Transfer** after station completion. Choose an open destination at the same Health Unit and select **Transfer patient**. | The number is retained and joins the destination line within its priority group. |
| Visit must end without completion | Use **Cancel** in the waiting list or **Cancel visit** for the current patient. Enter a reason and submit **Cancel visit**. | The visit becomes canceled and leaves the active line. |

A service that has already started cannot be skipped. Complete, transfer, or cancel it as appropriate. Queue transfer is within one Health Unit; cross-Health Unit record sharing is a separate task.

### Q5. Help with an appointment

**To reserve:** open **Activities & booking**, select **Choose a timeslot**, search for and select the existing patient, choose a slot, and select **Confirm booking**. If a profile is missing, create it through Q2 first; you may close the registration dialog after profile creation without issuing a walk-in number. The current profile-creation entry point requires an open daily session.

**To check in:** open **Appointments**, verify the person and booking, select **Check in**, enter a late-arrival or outside-hours reason if applicable, and select **Check in & issue number**. Use this booking check-in flow rather than issuing a separate walk-in visit first. Read the issued number from **Live queues** and give it to the patient.

**To change a booking:** use **Reschedule** or **Cancel** and verify the result. After the slot ends, use **No-show** only for a confirmed patient who did not attend.

**Expected result:** an appointment becomes **checked in** and enters its configured queue. Early check-in is rejected even with an override reason. An open daily session and access to the activity's entry queue are required.

### Q6. Reconcile a paper registration after an outage

**Before you start:** the connection is restored, today's session is open, and you have the paper registration details.

1. Open **Issue number**, search for and verify the patient, or create their profile.
2. Select the entry queue and expand **Reconcile a paper registration after an outage**.
3. Tick **This entry was recorded on paper during an outage**.
4. Enter the original on-site arrival in Manila time; it must be today and cannot be in the future.
5. Enter any required issuance reason and submit the form.
6. Record the system-issued number and reconcile it with the paper log so the patient follows the correct number.

**Expected result:** the visit is marked reconstructed and excluded from timing averages. This function records an arrival; it does not replay past station service or guarantee that the system number matches a paper number. QueCare does not provide full offline operation.

### Q7. Link an existing guest profile to a patient account

**Before you start:** the patient has an existing guest profile and a patient account with the same name and date of birth. The account's separate profile must have no care history.

1. Open **Issue number** and find the existing guest profile.
2. Verify the patient's identity and ownership of the account in person.
3. Expand **Link this guest profile to a patient account**.
4. Enter the account email and an identity-verification note of at least 10 characters.
5. Tick the verification statement and select **Link verified account**.

**Expected result:** the account is linked to the existing patient history. If the account already has visits, bookings, registration requests, clinical records, or sharing history, automatic merging is refused. Refer the case to an administrator; this manual does not assume a merge tool exists. Administrators can also perform this task; providers cannot.

## 6. Healthcare providers and nurses

Providers may use Q1–Q6 for assigned queues and appointment assistance. Clinical tasks below require the healthcare-provider role; queue or administrator permissions alone do not permit them.

### H1. Find authorized patient records

1. Open **Patient records**.
2. Use **Find an existing patient**, enter the name, select **Search**, and choose the verified patient from **Select patient**.
3. Review the patient header before opening notes or attachments.
4. Read local Health Unit notes and any specifically authorized notes from other Health Units.

**Expected result:** authorized summaries and visit history appear. Missing external notes require selected-record authorization; a visit at your Health Unit does not automatically unlock all external records.

### H2. Document a visit and attach supporting files

**Before you start:** the patient must have a visit recorded at your Health Unit. The current form associates the new summary with the latest recorded visit at your Health Unit, so verify the visit history before saving.

1. Find the patient using H1, then select **Document visit**.
2. Enter the **Visit summary**, **Allergies**, and **Clinical flags** as appropriate.
3. Select **Save visit summary** and review the saved note.
4. On a note belonging to your Health Unit, select **Attach PDF or image** and choose a PDF, PNG, or JPEG file up to 5 MB.
5. Confirm the attachment appears under the correct note.

**Expected result:** a new note shows the Health Unit, author, and creation date; attachments remain private to authorized readers. The interface appends notes and does not offer editing or deleting a saved summary. Follow the institution's correction process if an entry needs correction.

### H3. Approve a patient's sharing request at the destination Health Unit

1. In **Patient records**, review **Record sharing authorizations** for your destination Health Unit.
2. Identify the pending request and verify the patient or representative's identity and consent for the selected records.
3. Select **Verify consent & approve**, then confirm the verification prompt.
4. Find the patient and check that the selected external records are now accessible.

**Expected result:** the request becomes **approved**. Approval applies only to the selected records and their attachments. Request verification must occur before confirming the prompt.

### H4. Record provider-assisted consent for a guest or patient

1. Find the patient and open **Share selected records**.
2. Agree the destination Health Unit and exact records with the patient or verified representative.
3. Select the destination and the records you are authorized to access.
4. Enter verified consent details or a form reference.
5. Tick the identity/consent verification statement and select **Record verified sharing consent**.

**Expected result:** provider-recorded consent creates an approved authorization directly. This supports guests without a login. The provider can share only records they can already access.

### H5. Revoke an authorization as a destination provider

1. Open **Patient records** and locate the authorization addressed to your Health Unit.
2. Select **Revoke** and verify the new status.

**Expected result:** that authorization stops granting access. Providers may revoke authorizations addressed to their own Health Unit; a provider at the originating Health Unit does not automatically gain revocation access to every outgoing authorization.

## 7. Facility administrators

Administrators can also perform applicable queue and appointment tasks in Section 5. Administration does not include clinical-note access.

### F1. Open today's session and display its QR

1. Confirm your assigned Health Unit.
2. In **Overview**, select **Open daily session**, or in **Live queues**, select **Open session**.
3. Select **Show QR code** in Overview or **Daily QR** in Live queues.
4. Display the QR for patients or use **Copy registration link** to share today's registration URL through the facility's normal process.
5. If testing registration, select **Open registration**.

**Expected result:** today's session is open and patients can submit pending arrivals. Opening today's session expires unclosed prior-day sessions. The QR expires when its daily session closes; use a fresh daily QR for each operating day.

### F2. Open the waiting-area monitor

1. Select **Open live monitor** in **Overview**, or **Monitor** in **Live queues**.
2. In the new tab, select **Enter fullscreen** if needed.
3. Check the Health Unit, station names, numbers, and live/connection status before displaying it to patients.

**Expected result:** a numbers-only display shows the current called/serving number, upcoming numbers, averages, and announcement. Opening the monitor requires a CHO administrator or a facility administrator assigned to that Health Unit. A visible monitor button for another role does not grant access.

### F3. Create, change, pause, or retire a queue

1. Open **Administration → Queue stations**.
2. Select **Create queue**, or **Edit** beside an existing station.
3. Enter the station name, description, opening time, number-issuance cutoff, status, and display order.
4. Select **Create station** or **Save station**.
5. To temporarily stop new issuance and calls, set **Status** to **Paused**. Set it back to **Open** to resume.
6. Before setting a queue to **Closed**, resolve active patients. To retire it, use its delete icon, review the confirmation, and submit **Delete or archive station**.

**Expected result:** the queue configuration changes. Closing time must follow opening time. A queue with history is archived rather than erased; an unused queue can be deleted. Pausing a station is different from closing the whole daily session.

### F4. Add staff and manage access

1. Open **Administration → Staff & permissions** and select **Add staff member**.
2. Enter the staff member's name, email, initial password of at least 10 characters, and role: **Queue Officer** or **Healthcare Provider**.
3. Tick the queues they may operate.
4. If appropriate, enable **Can create, edit, and publish activities and appointments**.
5. Select **Save staff access**.
6. For later access changes, use **Permissions** beside the member, update assignments or permissions, and save.
7. To disable access, tick **Disable account and revoke active sessions** and save.

**Expected result:** the account receives the selected access. Queue assignments and clinical access are separate; assigning a queue does not turn a Queue Officer into a provider. You cannot change your own access or another administrator's access. Ask CHO to appoint or update a facility administrator. The existing-account form updates access; it does not change the member's role, name, email, or password.

### F5. Publish an announcement and submit directory information

**Announcement:** open **Administration → Announcements**, enter the facility message of up to 500 characters, and select **Update announcement**. Verify it through the bell and live monitor.

**Directory submission:** open **Service directory → Add information**. Select **Service**, **Frequently asked question**, or **Third-party cost reference**; enter the title, content, requirements, and source. For costs, provide minimum and maximum PHP amounts and a source. Select **Save information** and check **Review content**.

**Expected result:** announcements are available immediately. Facility directory submissions await CHO approval before public display. The current directory interface supports adding, reviewing, and removing entries; it does not offer an edit form for an existing entry.

### F6. Review reports, record a baseline, and export

1. Open **Reports & insights** and set **From** and **To**.
2. Review station waiting/service figures, daily outcomes, appointment counts, and reconstructed visits.
3. To add a measured manual-process baseline, select **Baseline observation**. Enter date, average waiting and service minutes, patient count, and measurement source; select **Save baseline**.
4. Select **Export aggregates** to download the aggregate CSV.

**Expected result:** reports describe the selected Health Unit and date range. Exports contain aggregate operational data without patient names. Reconstructed arrivals are excluded from timing averages. Survey collection and statistical analysis take place outside QueCare.

### F7. Review recent access and changes

1. Open **Administration → Audit trail**.
2. Review the listed action, staff member, and time.
3. Escalate unexpected activity using your institution's support process.

**Expected result:** the last 100 events available for your Health Unit appear. This screen is a recent-event view rather than a complete audit export.

### F8. Close the day

1. Check waiting, skipped, called, serving, and station-completed patients across the Health Unit.
2. Resolve care journeys where possible; ensure staff use **Finish visit** for completed visits.
3. In **Live queues**, select **Close session**.
4. Read the consequences, tick **I have checked the remaining patients**, and select **Close daily session**.

**Expected result:** remaining active visits become unserved, pending registrations expire, and today's QR stops working. **A closed daily session cannot be reopened on the same day.** Close it only when the day's registration and queue operation should end.

## 8. CHO or system administrators

### C1. Review and manage a selected Health Unit

1. Sign in with the CHO administrator account; the top bar labels this role **System administrator**.
2. Choose an Health Unit using **Health Unit**.
3. Review **Overview**, **Live queues**, **Reports & insights**, and **Administration** for that Health Unit.
4. Use F1–F8 for sessions, station setup, monitoring, staff access, announcements, and reporting.
5. Check the Health Unit selector again before saving a change or export.

**Expected result:** CHO can oversee each participating Health Unit. Reports are reviewed/exported for the selected facility; this manual does not assume a combined all-Health Unit dashboard.

### C2. Appoint a facility administrator

1. Select the intended Health Unit.
2. Open **Administration → Staff & permissions → Add staff member**.
3. Enter name, email, and initial password, then select **Facility Administrator** as the role.
4. Review the access configuration and select **Save staff access**.
5. Use **Permissions** to update or disable that account later when necessary.

**Expected result:** the new administrator is associated with the chosen Health Unit. Only the system administrator can create facility-administrator accounts or modify administrator access; you cannot modify your own access through this screen.

### C3. Approve or withdraw public directory information

1. Select the relevant Health Unit and open **Service directory → Review content**.
2. Review each entry's wording, requirements, source, and date. For cost references, verify the range and supporting source.
3. Select **Approve & publish** when ready.
4. Check **Public directory** to verify publication.
5. To withdraw a published entry, return to **Review content** and select **Unpublish**. Use **Remove** only when the entry should be deleted.

**Expected result:** approved information becomes publicly available and eligible for assistant retrieval. CHO can also create an entry through **Add information** and tick **CHO approved for public display** when appropriate.

## 9. Activity management for authorized staff

**Who can use this section:** CHO administrators, facility administrators, and Queue Officers/providers with the activity-management permission. A manager operates within their permitted Health Unit.

### A1. Create and publish an activity

1. Open **Activities & booking → Create activity**.
2. Enter the title, category, date, venue/barangay, description, and requirements.
3. Choose the **Arrival entry queue** that staff will use for check-in.
4. Set **Booking opens (Manila)** and **Booking closes (Manila)**.
5. Configure at least one slot with its start, end, and patient capacity. Use **Add slot** for additional slots.
6. Choose **Draft · staff only** to prepare privately, or **Published · patients can book during booking hours** to publish.
7. Select **Create activity**. Check **Manage activities** for draft entries and **Available to patients** for published entries.

**Expected result:** a draft remains staff-only; a published activity is bookable during its booking period when capacity remains. Choose today or a future activity date. Booking close must follow booking open and be no later than the first slot's start. Slots must start on the activity date, end after their start, and not overlap. Capacity is 1–1,000 patients per slot. Verify that check-in staff have access to the configured entry queue.

### A2. Change an activity or capacity

1. In **Manage activities**, locate the activity and select **Edit activity**.
2. Update the permitted details and select **Save activity**.
3. Verify the saved slots and availability.

**Expected result:** valid changes are saved. Activities with confirmed or checked-in reservations must keep their date, entry queue, and published status. Reserved slots cannot be moved or removed, and capacity cannot fall below confirmed/checked-in reservations. Slots with booking history cannot be removed even after cancellation. If the plan must change substantially, coordinate cancellation and replacement with the Health Unit team.

### A3. Review the roster and cancel an activity

1. Select **Patient roster** on the activity and review references, contacts, slots, and status.
2. Before cancellation, use the roster to prepare follow-up for affected patients through the institution's normal communication process.
3. Select **Cancel** on the activity, read the consequences, tick **I will notify affected patients**, and select **Cancel activity**.
4. Verify cancellation and complete patient follow-up.

**Expected result:** the activity and its confirmed reservations are canceled. Automatic mass messaging is not included. Individual booking emails are separate from activity-wide follow-up.

## 10. Status and timing reference

| Display or status | Meaning / next step |
| --- | --- |
| Pending registration | QR form submitted; staff must confirm on-site arrival before number issuance. |
| Waiting | Number issued and waiting at the current station. |
| Called | Approach the station; staff selects **Start service** when care begins. |
| Serving | Service has started at the current station. |
| Skipped | Patient missed a call; ask staff to use **Return to line**. |
| Completed station | This station is done. Staff must transfer the patient or finish the visit. |
| Completed visit | Staff has selected **Finish visit** after station completion. |
| Canceled visit | Staff ended the visit with a reason. |
| Unserved | The session ended before the active visit was finished. Contact the front desk. |
| Expired registration | The registration is no longer valid; request the current daily QR. |
| Confirmed appointment | A timeslot is reserved; it is not yet a live queue entry. |
| Checked-in appointment | Staff confirmed arrival and issued the visit number. |
| No-show appointment | Staff marked nonattendance after the slot ended. |
| Pending / approved / revoked sharing | Awaiting destination verification / access authorized / that grant withdrawn. |
| Collecting data / — | There are insufficient observations or no applicable measurement. This does not mean zero wait. |
| Updates interrupted / Connection interrupted | Display may be out of date; follow staff announcements. |

All queue hours, appointment slots, and original-arrival entry times use **Asia/Manila (UTC+08:00)**. Waiting time starts at confirmed arrival or entry to a station and ends at **Start service**. Service time runs from service start to station completion or transfer. Public waiting averages appear after at least three valid service starts and are not individual predictions.

## 11. Troubleshooting

| Problem | What to do |
| --- | --- |
| Today's QR does not open or is expired | Check the Health Unit/date with the front desk. An administrator must open the current daily session and display its QR. |
| Registration says pending and no number appears | Go to the front desk for identity and on-site arrival confirmation. Avoid submitting another profile. |
| Lost tracking link | Try **My care hub → Follow your number** on the same browser. Otherwise ask the front desk for help locating today's visit. |
| Another person's ticket opens on a shared device | The browser may have saved their last tracking reference. Use your own private link and keep links separate. |
| Session is closed | Ask the administrator about today's operating status. A session deliberately closed today cannot be reopened today. |
| No assigned queues / permission denied | Confirm the account and Health Unit. Ask the administrator to check queue assignment or activity-management permission. |
| Outside-hours or priority reason required | Authorized staff should verify the situation and enter a reason in the issuance/check-in form. |
| Cannot call the next patient | Check session and queue status, waiting count, connection, and whether a number is already called or serving. |
| Transfer destination missing | The destination must be a different open queue in the same Health Unit. Ask an administrator to check its status. |
| Slot full or booking not open | Refresh availability, choose another slot, or ask staff about booking dates. A published card alone does not guarantee booking is currently open. |
| Cannot check in an appointment | Confirm the slot has started, today's session is open, the entry queue is open and assigned, and any late/outside-hours reason is provided. Use the existing visit if the patient already has a number today. |
| Confirmation email missing | Check the booking status/reference in **Appointments** before trying again. A confirmed booking remains valid if email delivery fails. |
| Reset email missing | Check the email address and available delivery channel with the operator. Request a fresh link if needed. |
| External records missing | Check exact record selection, destination Health Unit, and approved authorization status. Ask the destination provider to verify consent if pending. |
| File upload rejected | Use a genuine PDF, PNG, or JPEG up to 5 MB on a note from your Health Unit. |
| Account linking refused | Check name/date-of-birth match and existing care history. Escalate for review rather than creating more duplicate profiles. |
| Connection or session security error | Keep track of unsaved work, restore connectivity, refresh, and sign in again if necessary. Verify the latest state before retrying an action. |
| Outage during operations | Follow the Health Unit's paper-registration process and staff announcements. After reconnection use Q6 for eligible same-day arrivals. Cached displays do not provide offline operation. |

For help, patients should contact the Health Unit front desk; staff should contact their facility administrator; administrators should use the institution's designated system support contact. Provide the Health Unit, time, screen, error message, and relevant queue/booking reference through an approved private channel. Never send a password or include unnecessary patient details in a general support message.

## 12. Practice walkthroughs

Use fictional people and a demonstration environment. These examples combine the role-specific tasks into complete journeys.

### Scenario 1: Guest walk-in with a phone

1. **Facility administrator:** open today's session and display its QR (F1).
2. **Guest:** scan, submit registration, and keep the pending tracking page (V1).
3. **Queue Officer:** verify arrival and issue the number (Q1).
4. **Assigned staff/provider:** call, start service, and complete the station (Q3).
5. **Assigned staff/provider:** transfer if needed, then complete the last station and finish the visit (Q3–Q4).
6. **Guest:** check the tracking page (V3).

**Successful outcome:** one number follows the guest through the Health Unit and the final visit status is completed.

### Scenario 2: Patient with an appointment

1. **Activity manager:** publish an activity with an available slot (A1).
2. **Patient:** sign in, reserve the slot, and save the booking reference (P3).
3. **Administrator:** open the activity day's session (F1).
4. **Queue Officer/provider:** at or after slot start, confirm the patient's arrival through **Appointments → Check in** (Q5).
5. **Assigned staff:** operate the queue and finish the visit (Q3).

**Successful outcome:** the booking is checked in and linked to the patient's visit; no separate walk-in visit was created first.

### Scenario 3: Selected records needed at another Health Unit

1. **Provider at Health Unit 2:** document a fictional patient's visit (H2).
2. **Patient:** select that record and request sharing to Health Unit 4 (P6).
3. **Provider at Health Unit 4:** verify identity and consent, approve, then find the patient (H3).
4. **Patient:** revoke the authorization when appropriate (P7).

**Successful outcome:** Health Unit 4 gains access to the selected note and attachments after approval. That grant stops providing access after revocation; unrelated notes remain outside it.

### Scenario 4: New staff member and published service information

1. **CHO administrator:** appoint the facility administrator for the selected Health Unit if needed (C2).
2. **Facility administrator:** create a Queue Officer account and assign its entry queue (F4).
3. **Queue Officer:** sign in and verify the assigned queue is available (Q3).
4. **Facility administrator:** submit fictional service information (F5).
5. **CHO administrator:** review and approve the entry (C3).
6. **Guest:** open the service directory and verify the published entry (G4).

**Successful outcome:** staff can operate their assigned queue and approved information is visible publicly.

---

**Document maintenance:** update this manual whenever screen labels, permissions, or workflows change. It was checked against the current interface and server rules; it does not replace the institution's operating, identity-verification, consent, or record-correction procedures. Technical setup is covered in the [project README](../README.md), with additional scope details in the [system description](system-description.md) and [implementation notes](implementation.md).

### C4. Add, edit, or delete Health Units

**Who can use this:** CHO/system administrators only.

1. Open **Administration → Health Units** to see all units, assigned-user counts, and deletion eligibility.
2. Select **Add Health Unit**, enter a unique name (up to 200 characters), address (up to 1,000 characters), and optional announcement (up to 500 characters), then select **Create Health Unit**.
3. Select the new unit in **Health Unit** and use Administration to configure queue stations and staff before opening a daily session.
4. To edit, select **Edit**, change the fields, then select **Review changes**. Read the before/after values and warning, check the acknowledgment, and select **Confirm and save changes**. **Back to editing** or closing the dialog leaves the saved unit unchanged. Renaming preserves assignments and records; historical displays use the new name.
5. To delete an unused unit, select **Delete**, verify its name, acknowledge permanent deletion, and select **Delete Health Unit permanently**. Closing the dialog cancels deletion.

**Deletion restrictions:** Any assigned account, including a disabled account, blocks deletion. Queues, daily sessions, activities, clinical records, sharing authorizations, directory information, and baseline metrics also block deletion. Read the reasons beside the disabled Delete control. The server checks again when deletion is submitted. No linked operational or clinical data is removed. Audit history is preserved. Archiving and transferring staff between units are not provided by this workflow.

**Announcements:** Existing announcement controls remain available to authorized facility administrators and system administrators. Confirm the publication prompt to publish the announcement to the unit’s monitor and notification bell.

**If there are no units:** Sign in as a system administrator from the empty screen, then use **Add Health Unit**. Other users see an explanation until a unit becomes available.
