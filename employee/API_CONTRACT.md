# Employee frontend API contract

These are proposed integration endpoints for the backend developer. They are not implemented by this frontend delivery. The existing admin UI and server source are unchanged.

Current frontend scope is Login, Dashboard, Change Password, My Profile, My Attendance, My Payroll, My Leave, Career Milestones, Rewards, and Submit Report. First-login accounts remain blocked from protected employee pages until a successful response confirms the password change. The backend endpoints themselves are still the backend developer's responsibility.

The API root is configured with VITE_API_URL, defaulting to http://localhost:3000/api. Responses use JSON, cookie-based sessions, and UTC ISO timestamps. The backend should allow the chosen frontend origin with credentials. Return only public account fields, never password hashes or session secrets.

The current frontend defaults to local demo mode. To use these endpoints, set VITE_API_MODE=api and restart Vite. The mode and API URL are configured in src/config/api.js. All demo code is isolated in three files under src/demo/: data.js, adapter.js, and payslip.js. The shared client in src/services/api/api.js loads the demo adapter only in demo mode. Real API errors do not switch the app back to demo mode. See BACKEND_HANDOFF.md for connection, debugging, and demo-removal instructions.

## Endpoints

| Method | Path relative to API root | Request | Response |
| --- | --- | --- | --- |
| POST | /auth/login | { identifier, password, portal: 'employee' } | { user, signedInAt } |
| GET | /auth/session | No body | { user } |
| POST | /auth/change-password | { currentPassword, newPassword } | { user } |
| POST | /auth/logout | No body | 204 |
| GET | /employee/dashboard | No body | { user, attendance, leaveBalance, announcements } |
| GET | /employee/attendance/status | No body | attendance |
| GET | /employee/attendance/history?limit=30 | No body; limit only | { employeeId, timeZone, records } |
| POST | /employee/attendance/check-in | No body | Updated attendance |
| POST | /employee/attendance/check-out | No body | Updated attendance |
| GET | /employee/profile | No body | { user, profile } |
| PUT | /employee/profile/photo | multipart/form-data with one photo file | { user, profile } |
| DELETE | /employee/profile/photo | No body | { user, profile }, with profile.photoUrl: null |
| GET | /employee/payroll | No body | { employeeId, records } |
| GET | /employee/payroll/:runId | No body | { employeeId, record } |
| GET | /employee/payroll/:runId/payslip | No body | PDF binary, application/pdf |
| GET | /employee/leave | No body | Employee leave state described below |
| POST | /employee/leave/requests | { startDate, endDate, reason }; Idempotency-Key header | Updated state plus submittedRequestId |
| GET | /employee/career | No body or employee ID | { employeeId, today, timeZone, records } |
| GET | /employee/rewards | No body or employee ID | { employeeId, records } |
| GET | /employee/reports | No body or account ID | { employeeId, userId, records, canSubmit, message } |
| POST | /employee/reports | { title, content, attachmentUrl }; Idempotency-Key header | Updated report state plus submittedReportId |

The authenticated session determines the employee ID. Attendance requests contain no employee ID, timestamp, IP address, schedule, or permission flags. The backend must derive these values itself.

## Public user

```js
{
  id: '2',
  fullName: 'Employee Name',
  login: 'employee@example.test',
  role: 'EMPLOYEE', // Or DEPARTMENT_HEAD.
  department: 'Department name',
  employeeId: '1', // Database ID, distinct from the serial number.
  serialNumber: 'HD-IT-001',
  mustChangePassword: true,
  passwordChangedAt: null, // Or an ISO UTC timestamp.
  grade: 'Grade II',
  baseSalary: 11200, // Number, or null when unassigned.
  employmentStatus: 'ACTIVE',
  employmentType: 'PERMANENT',
}
```

The flag must be set when HR creates an account with an initial password. Login and session restoration must return its authoritative value. The password-change endpoint must verify the current password and update the flag only after successful persistence. The employee frontend follows the existing admin form's 12–128-character policy and rejects reuse of the current password. Password confirmation is validated locally and omitted from the request. Return the same employee's public user object with mustChangePassword: false and an ISO UTC passwordChangedAt timestamp; an unconfirmed response must not unlock Dashboard.

Protected employee endpoints must reject initial-password sessions with PASSWORD_CHANGE_REQUIRED. The React guard supplies the expected navigation, while the backend prevents API bypass. Session revocation and account activation checks are backend responsibilities.

## Attendance response

```js
{
  date: '2026-11-20', // Work date in East Africa Time.
  serverTime: '2026-11-20T06:00:00.000Z',
  timeZone: 'Africa/Addis_Ababa', // EAT, UTC+3.
  schedule: {
    startTime: '08:30',
    endTime: '16:30',
    gracePeriod: '20',
  },
  ipAddress: '192.0.2.10', // Actual server-observed peer, or null.
  configured: true, // False if the approved office IP list is empty.
  ipAuthorized: true,
  record: null, // Or the record below.
  checkoutAt: '2026-11-20T13:30:00.000Z',
  code: null, // Or a blocking reason.
  message: 'You can check in for today.',
  canCheckIn: true,
  canCheckOut: false,
}

// A recorded workday:
{
  id: '42',
  date: '2026-11-20',
  checkIn: '2026-11-20T06:00:00.000Z', // Or null for a saved absence/leave record.
  checkOut: null,
  checkInIp: '192.0.2.10', // Or null if not recorded or unavailable.
  checkOutIp: null,
  checkInVerification: 'VERIFIED', // VERIFIED, UNVERIFIED, UNAVAILABLE, or null.
  checkOutVerification: null,
  status: 'PRESENT', // PRESENT, LATE, ABSENT, or ON_LEAVE.
}
```

The values above are example payloads, not dashboard defaults or attendance rules. The backend must read the saved admin settings on each attendance action. Status responses should reflect the same configuration.

The existing admin settings form uses { startTime, endTime, gracePeriod, allowedIps }, where allowedIps is a string of exact IPv4/IPv6 addresses separated by new lines or commas. Its initial implementation stores these locally in Zustand; the backend developer needs to replace that save/load boundary with persistence. Preserve the form's validation, submission lock, failure retention, and dirty-state behavior.

Recommended admin endpoints are GET and PUT /admin/attendance/settings, returning the same validated settings shape. Connect them in an admin service and await successful saving before updating the existing store. These admin endpoints are a handoff proposal; this delivery does not change the admin callbacks.

Do not use a second employee-only allowlist or schedule. An empty approved-IP list must produce configured: false, ipAuthorized: false, both action flags false, and IP_CONFIGURATION_REQUIRED. The employee message must direct the user to HR, and the admin must be informed that IP configuration is required. The backend developer should add that admin configuration notice when wiring persistence.

The backend must reject unauthorized IPs, duplicate check-ins, check-out without check-in, early check-out, and duplicate check-outs. It must enforce the scheduled end time using its own clock, record separate check-in/check-out IPs, and handle concurrent requests atomically. Trust forwarded IP headers only from explicitly configured proxies.

## Dashboard-only fields

leaveBalance is a number or null. announcements is an array of { id, title, content, createdAt }, with string IDs and ISO UTC creation timestamps. Missing leave data should remain null, and missing announcements should return an empty array.

## Attendance history and admin compatibility

`GET /employee/attendance/history?limit=30` returns `{ employeeId, timeZone, records }`. `employeeId` is the authenticated user's database employee ID, not their displayed serial number. The frontend checks it against the session account. The server must authorize/filter records from that session and cap results at 30 unique workdays, newest first. Return an empty records array when no attendance is recorded. The frontend supplies no employee/department IDs or permission fields and never requests other employees' history.

Each history item uses the recorded-workday shape above, with a nonempty unique string ID, a real YYYY-MM-DD work date, nullable UTC ISO check-in/out timestamps, nullable separate IPs, server-provided status, and per-action verification. Check-out must follow check-in. Absence/leave records can contain null timestamps; absence must be recorded authoritatively by the server, not inferred from missing check-ins. Do not create history rows from today's browser date or recalculate past status from current settings. Missing verification for a recorded action displays as Unavailable. Dates, schedules, and state/permission consistency are validated before rendering. Use Africa/Addis_Ababa to match the admin portal; Africa/Nairobi is also accepted as an equivalent EAT zone.

The admin and employee views must use the same saved attendance records and settings:

| Existing admin record | Employee response | Mapping |
| --- | --- | --- |
| employeeId (display ID) | response.employeeId (database ID) | Resolve the same employee and authorize using the session. Keep the serial number mapping at the backend boundary. |
| date | record.date | Work date in East Africa Time; one record per employee/workday. |
| checkIn / checkOut | Same record fields | Convert admin's offset ISO timestamps to UTC ISO; preserve nulls. |
| status | record.status | Present → PRESENT, Late → LATE, Absent → ABSENT, On Leave → ON_LEAVE. Admin's No data denotes a missing record and is not a fabricated history status. |
| checkInIp / checkOutIp | Same record fields | Keep separate server-observed IPs, including different check-in and check-out addresses. |
| checkInVerification / checkOutVerification | Same record fields | Verified → VERIFIED, Unverified → UNVERIFIED, Unavailable → UNAVAILABLE; null for unrecorded actions. |
| saved startTime / endTime / gracePeriod | attendance.schedule | Use the saved admin daily schedule. Match its HH:MM times, end-after-start rule, and whole-minute grace period shorter than the shift. |

UI filters operate on the latest loaded 30 records and do not claim to search the employee's complete history. Completion filtering distinguishes check-in-only and checked-out records. Verification matches either recorded action, just as admin's Check-In Logs filters do. Newest-first pagination shows 10 records per page. Status/history failures never fall back to demo records in API mode.

Dashboard and My Attendance call the same status/check-in/check-out service functions. Both use server-supplied permissions and perform a status refresh after successful or failed writes; My Attendance also refreshes history so an interrupted response cannot silently hide a persisted record. Preserve backend atomic duplicate protection, schedule/IP enforcement, and session authorization when integrating these endpoints. The frontend demo retains disabled attendance permissions and supplies clearly isolated sample history; it does not implement real IP verification or attendance persistence.

## Employee profile and admin compatibility

The profile routes are proposed frontend integration points, not implemented backend routes. The authenticated session identifies the employee. Do not accept an employee ID, name, department, grade, salary, role, status, date, or photo URL from the photo request. Profile reads and photo changes require an authenticated account that has completed first-login password setup.

```js
{
  user, // The public user above, belonging to this authenticated employee.
  profile: {
    qualification: 'BSc in Computer Science', // String, or null when not provided.
    gender: 'Female', // Male, Female, Other, or null; matches admin options.
    birthDate: '1992-07-25', // YYYY-MM-DD calendar date, or null.
    hiredDate: '2026-10-24', // YYYY-MM-DD calendar date, or null.
    photoUrl: '/uploads/employee/photo.png', // Accessible image URL, or null.
  },
}
```

Date-only values must represent real Gregorian dates in admin's supported 1900–2100 range. Return null for missing profile fields, including absent dates and photos, rather than fabricated fixture values. The frontend formats dates in UTC to avoid changing the day with the browser's timezone. Admin's birth-date and hired-date rules still belong to the HR editing workflow; this page does not offer record edits.

Both read and photo responses return the complete current profile plus public user. The frontend validates these fields and checks the account/employee IDs before showing profile details or committing a photo save. An upload response must contain a non-null photoUrl; deletion must confirm null. Return only public fields, and never include credentials, education-document contents, or other employees' records.

The existing admin editor and employee page refer to the same employee record when integrated. Map their fields at the service boundary:

| Existing admin record | Employee response | Notes |
| --- | --- | --- |
| id | user.serialNumber | Displayed Employee ID; keep database employeeId separate. |
| name | user.fullName | Current HR-maintained name. |
| email | user.login | Email or login ID, not necessarily an email address. |
| department / grade | user.department / user.grade | Saved department and job-grade labels. |
| basicSalary | user.baseSalary | Authoritative salary for the saved grade, as a number or null. |
| status | user.employmentStatus | Active → ACTIVE, Inactive → INACTIVE, On Leave → ON_LEAVE, Onboarding → ONBOARDING. The profile displays admin's labels. |
| employmentType | user.employmentType | Permanent → PERMANENT, Contract → CONTRACT, Temporary → TEMPORARY. |
| portalRole | user.role | Employee → EMPLOYEE, Head of Department → DEPARTMENT_HEAD. HR Manager belongs to the admin portal. |
| gender / birthDate / qualification / hiredDate | Same properties inside profile | Preserve saved values; normalize missing fields to null. |
| photo: { name, dataUrl } | profile.photoUrl | The admin currently stores a demo upload object; replace it with the same durable employee photo used by this portal. |

The frontend demos remain independent; a demo photo change does not update the admin's local Zustand records. Connect both portals to the same backend employee/photo storage. The employee demo data is a preview fixture, not a lookup into the admin's fixture list.

Photo upload validation matches admin: JPG, PNG, or WebP, maximum 5 MB. The employee also rejects empty or unreadable files before sending. The backend must independently verify the file contents, size, ownership, and allowed format, then store the image and return its accessible URL. Let Axios/browser set the multipart boundary. For API mode, return an HTTP(S) or root-relative image URL; root-relative URLs are resolved against the configured API origin so uploads work when the frontend and API use different hosts or ports. Demo mode uses a raster data URL held only in memory. Photo removal must remove the authenticated employee's photo and return profile.photoUrl: null. Leave other HR-managed fields unchanged, preserve submitted input on failures, and return per-file errors as error.fields.photo when available.

## Employee payroll and admin compatibility

These read-only routes are frontend handoff proposals. Authorize them from the cookie session and enforce first-login password completion. Employees and department heads can retrieve only their own payroll; do not return the complete admin payroll run/employee roster. `employeeId` is the authenticated database employee ID, distinct from the displayed serial number. The frontend validates the response owner and every record owner, rejects mismatched run IDs, and sends only the payroll run ID in the detail/PDF path. IDs must contain 1–100 letters, numbers, underscores, or hyphens. No employee ID, salary, deduction, tax rate, or permission is sent as a request body.

The list returns up to 120 unique monthly records, newest first. Details return the same public saved snapshot:

```js
{
  employeeId: '1',
  records: [{
    id: 'PR-2026-10', month: '2026-10', status: 'FORWARDED_TO_FINANCE',
    employee: { id: '1', serialNumber: 'T2323', fullName: 'Employee Name', department: 'Department name' },
    gross: 11200, incomeTax: 2420, pension: 784, employerPension: 1232,
    otherDeductions: 0, net: 7996, deductionItems: [],
    incomeTaxLabel: 'Income Tax', pensionLabel: 'Pension Contribution (7%)',
    generatedAt: null, forwardedAt: null, canDownload: true,
  }],
}
```

Amounts are finite nonnegative ETB numbers with at most two decimal places, not numeric strings. Validate them in cents: gross = incomeTax + pension + otherDeductions + net. `deductionItems` contains unique `{ id, name, amount }` entries whose sum is exactly otherDeductions. Employer pension remains separate. Month is YYYY-MM in the supported 1900–2100 range. Return nullable UTC ISO audit timestamps; unknown timestamps stay null. Return only GENERATED, FORWARDED_TO_FINANCE, or PAID. Payroll generation/forwarding does not establish payment; the backend/Finance workflow supplies an authoritative PAID status.

| Existing admin data | Employee record | Required mapping |
| --- | --- | --- |
| run.id / run.month / run.status | id / month / status | Same saved run and status; employee cannot generate, regenerate, forward, or mark paid. |
| row.employeeId (serial/display ID) | employee.id and employee.serialNumber | Resolve the database employee ID using the same employee relation and preserve the serial number separately. |
| row.employeeName / row.department | employee.fullName / employee.department | Preserve the names stored in the payroll snapshot, including historical names. |
| row.gross / incomeTax / pension / otherDeductions / net / employerPension | Same fields | Return validated saved amounts. Do not rebuild past payroll from the current employee salary or current payroll policy. |
| row.deductionItems | deductionItems | Return this employee's applied saved deductions, preserving labels and amounts. |
| getPolicyDeduction(run.policy, 'incomeTax').name | incomeTaxLabel | Label from the saved month's policy, including edited names. |
| getPolicyDeduction(run.policy, 'pension') | pensionLabel | Saved deduction name plus percentage when applicable; avoid a hardcoded 7% label across months. |
| run.generatedAt / run.forwardedAt | Same fields | Convert offset ISO timestamps to UTC; preserve nulls. |
| Authorized PDF availability | canDownload | Server permission/availability, independent of a browser-derived status assumption. |

The frontend offers no payroll mutation APIs and does not compute tax bands, employee/employer pension rates, or deductions. Month and status filters apply to the loaded saved records; the summary identifies the latest saved month. Connect both portals to the same saved payroll snapshots and preserve the admin's regeneration/forwarded-run locks and financial workflow.

The PDF route must verify the session employee belongs to the requested run, check export permission, and return that employee's saved amounts and labels as `application/pdf` (maximum 10 MB). Include only the authorized employee, preserve Unicode names, and render long deduction lists across pages. The frontend checks MIME type and the PDF signature before starting a download, sanitizes filenames, cancels abandoned requests, and never substitutes demo PDFs for API failures. Return PDF-request errors as normal JSON `{ error: { code, message } }` with the appropriate HTTP status; the API client decodes JSON binary errors and applies session/first-login handling. A failed download keeps the records visible with an error and retry controls.

Demo amounts are isolated sample snapshots from the functionality reference, with null audit dates where unknown. The demos do not synchronize with admin's local store. Demo PDFs are marked Demo preview and do not constitute payment confirmation or implement backend storage/disbursement.

## Employee leave and admin compatibility

The routes above are frontend handoff proposals. Authenticate by the cookie session, resolve the database employee ID, and return only that employee's requests/balance. Enforce first-login password completion. No employee ID, status, daysRequested, balance, or policy is accepted from the employee form. Both portals must use the same persisted leave settings, balances, requests, approval transactions, and annual renewal.

```js
{
  employeeId: '1', today: '2026-11-22', timeZone: 'Africa/Addis_Ababa',
  period: { year: 2019, start: '2026-09-11', end: '2027-09-11', nextStart: '2027-09-12' },
  settings: { defaultEntitlement: '90', maxBalance: '90', dayCounting: 'calendar', noticeDays: '0', requireRejectionReason: true },
  balance: { employeeId: '1', yearStart: '2026-09-11', accrued: 90, used: 30, remaining: 60 }, // or null if unassigned
  requests: [{
    id: 'leave-4', employeeId: '1', startDate: '2026-10-29', endDate: '2026-11-27',
    daysRequested: 30, dayCounting: 'calendar', reason: 'Annual leave', status: 'APPROVED',
    createdAt: null, decidedAt: null, decisionNote: '', clientRequestId: null,
  }],
  canRequest: true, message: null,
  // POST additionally returns submittedRequestId: 'new-request-id'
}
```

| Admin data | Employee state | Mapping |
| --- | --- | --- |
| employees[].id; requests[].employeeId; balances[].employeeId | employeeId | Same database relation. The display serial T2323 remains separate. |
| settings | settings | Saved entitlement/cap (whole numbers 1–90, entitlement ≤ cap), noticeDays (0–365), counting mode, rejection-note rule. Numeric policy values are normalized to strings. |
| balances[].accrued / used / yearStart | balance | Current Ethiopian-year balance only, with remaining = accrued − used. Missing assignment is null. Accrued may exceed cap; remaining must be between 0 and maxBalance. |
| requests[].id / dates / daysRequested / reason / status / dayCounting | requests | Own saved records, unique IDs; PENDING, APPROVED, or REJECTED only. Historical unknown counting mode is null. |
| request.history CREATED/EDITED timestamps; decidedAt / decisionNote | createdAt / decidedAt / decisionNote | Map saved audit timestamps to UTC ISO; keep unknown dates null. Do not fabricate audit dates. |
| Server EAT date and getLeaveYear(today) | today / period / timeZone | Authoritative work date and actual Ethiopic year calculation, including Pagume 6. Never hardcode September 11. |
| Backend permission/configuration | canRequest / message | Employee-specific availability and explanatory text. Zero/missing balance alone does not prohibit a valid pending submission. |
| Persisted idempotency receipt | clientRequestId | Exact Idempotency-Key of the original request; null on historical records without a receipt. |

POST validates trimmed reason (1–1,000 characters), valid Gregorian ISO dates, positive inclusive calendar or Monday–Friday count, configured cap, notice period against server today, no overlap with pending/approved requests, and no crossing Ethiopian New Year. Weekday mode excludes weekends only, not public holidays. Rejected requests do not block dates. A future-year request may be submitted, but HR must wait until that year's Meskerem 1 to approve. Submit creates PENDING without deducting or reserving balance; HR approval checks entitlement and updates used in a transaction. Entitlement adjustment, rejection/reopening, approval, and renewal remain admin/backend actions. Annual renewal expires unused days and grants saved entitlement with no carryover; return renewed authoritative state on GET/POST and the same remaining value in Dashboard.

GET returns at most 200 requests (IDs: 1–100 letters, numbers, underscores, hyphens). The current frontend filters and paginates this complete bounded history locally; do not silently truncate records used for overlap checks. If a history exceeds this bound, introduce server pagination plus authoritative overlap checking and document that contract before integration. The client validates owner, unique IDs, year, balance reconciliation, and known day-count snapshots. It refreshes on focus and every 60 seconds while visible, retains last loaded records on refresh failures, and never falls back to demo data in API mode.

Allow `Idempotency-Key` in CORS request headers alongside credentials. Scope the key by session employee; atomically persist a unique receipt with the request. Replaying the same key/normalized payload must return current state and the same submittedRequestId without another insert, even if retry dates now overlap that request. Reusing a key with a different payload returns 409. The POST response must include the exact PENDING request and receipt. After a lost response, the client refreshes history and confirms only a matching PENDING receipt/dates/reason; otherwise it keeps the form and the same retry key. Repeat business validation and concurrency/overlap checks on the server. Return date/reason errors as error.fields.startDate, endDate, or reason.

The isolated demo uses 90 accrued / 30 used / 60 remaining for 2019 E.C., matching admin's sample and providing a positive balance for manual testing. Demo leave values can be adjusted in src/demo/data.js. The demos do not synchronize their local state. Demo pending history/receipts survive logout/relogin within the same tab and reset on reload. Its annual renewal is a local backend simulation. No employee approval controls or production persistence are implemented.

## Employee career milestones and admin compatibility

`GET /employee/career` is a proposed read-only integration endpoint. Authorize it from the cookie session and first-login password state. Resolve the same employee database relation used by admin career tracking and return only that employee's public records; the displayed serial number is not a substitute for database ownership. Department heads also see only their own career record on this employee page. No employee create, edit, apply, cancel, grade assignment, salary calculation, or career mutation endpoint is exposed.

```js
{
  employeeId: '1', today: '2026-11-22', timeZone: 'Africa/Addis_Ababa',
  records: [{
    id: 'CM-001', employeeId: '1', milestoneType: 'PROMOTION',
    effectiveDate: '2026-10-27', status: 'APPLIED',
    previousGradeName: 'Grade I', newGradeName: 'Grade II (Associate)',
    previousSalary: 10000, newSalary: 11200,
    description: 'Promotion approved after the annual performance review.', reviewReason: '',
  }],
}
```

| Admin field/workflow | Employee record | Mapping |
| --- | --- | --- |
| careerMilestones[].employeeId | employeeId | Same authenticated database employee relation; filter on the server before returning data. |
| id | id | Preserve the saved ID. Nonempty string IDs (max 100) or nonnegative safe integer legacy IDs are accepted and normalized to strings; IDs must remain unique after normalization. |
| milestoneType | milestoneType | PROMOTION, STEP_INCREMENT, GRADE_CHANGE, AWARD_MILESTONE; the exact admin labels are retained. |
| effectiveDate | effectiveDate | Valid Gregorian YYYY-MM-DD date from 1900 through 2100. Date-only formatting preserves the saved day. |
| previousGradeName / newGradeName | Same fields | Saved names, not names rebuilt from today's grade catalogue. Missing prior grade remains unknown; no target grade on an award means Unchanged. |
| previousSalary / newSalary | Same fields | Saved base-salary snapshots in ETB, at most two decimal places and maximum 999999999.99. Unknown previous salary is null; zero is displayed as zero. Target salary is positive or null for an achievement without a grade change. Do not recalculate past records from current grade scales. |
| status | status | Exact persisted APPLIED, RECORDED, SCHEDULED, HISTORICAL, NEEDS_REVIEW, or CANCELLED status. |
| description / reviewReason | Same fields | Employee-visible HR description (1–5,000 trimmed characters) and optional public review explanation (up to 5,000). Do not expose private HR notes or internal approval data. |
| Server EAT date | today / timeZone | Authoritative Gregorian work date; Africa/Addis_Ababa or equivalent Africa/Nairobi. |

APPLIED means HR updated the employee grade/salary. RECORDED is an achievement without a grade/salary update. HISTORICAL means a past entry that does not overwrite the current roster. SCHEDULED is a planned change; NEEDS_REVIEW waits for HR review after a saved grade/salary/roster conflict or an unavailable employee; CANCELLED remains in history without applying the plan. Award milestones can include a configured grade change, in which case preserve that target and its actual workflow status. An award without a target grade can also become NEEDS_REVIEW when its employee is unavailable. A future entry cannot claim APPLIED, RECORDED, or HISTORICAL. A due SCHEDULED entry can remain scheduled until the authoritative workflow processes it; the employee frontend never changes status merely because a date has arrived.

Status cross-check: admin's recordCareerMilestone assigns future dates SCHEDULED, older grade entries HISTORICAL, current grade changes APPLIED, and achievements without a grade change RECORDED. The active admin useCareer hook checks due plans on initial load, focus/visibility, and every minute. applyDueCareerMilestones returns APPLIED after valid snapshot checks, NEEDS_REVIEW for changed/unavailable records, HISTORICAL when superseded by a later applied grade change, or RECORDED for a due award without a grade change. cancelCareerMilestone accepts only SCHEDULED or NEEDS_REVIEW and returns CANCELLED. The admin table visibly labels Scheduled, Needs review, Cancelled, and History only; APPLIED and RECORDED still exist in its stored records and are explicitly labelled in the employee view. All six employee status values are therefore sourced from admin's existing workflow.

The backend must apply due changes through the same admin workflow, rechecking the approved grade name/salary and expected employee grade/salary, marking conflicts NEEDS_REVIEW, and atomically updating the milestone and roster when applied. Cancellation remains an HR action. Return the saved outcome on refresh and align current profile/dashboard salary with the same employee record; do not alter historical payroll snapshots. Internal expectedEmployeeGrade/expectedEmployeeSalary, grade IDs, other employees, and credentials are not part of the employee response projection and are stripped by the frontend schema.

Return up to 200 records without silently truncating the requested history; expand the contract with server pagination if needed. Missing history is an empty array, not an error. The client validates owners, duplicate IDs, date/status validity, and grade/salary snapshot consistency, sorts newest effective date first, and provides local search/type/status filters, pagination, and expandable saved details. Unknown prior salary stays null. Target grade and salary must be paired; non-award grade changes need both. Refresh failures retain the last valid records with an error. Focus/visibility refresh and a visible-minute poll keep authoritative outcomes current. API errors never fall back to demo records.

The normal demo displays six synthetic milestones across all types/statuses for manual preview. Its applied promotion ends at the current demo Grade II salary of 11200, and the historical entry starts on the demo hire date. Planned/review/cancelled snapshots do not change the current salary. Demo milestones can be adjusted in src/demo/data.js. Demo records do not synchronize with admin or constitute actual HR records. This frontend work does not implement backend career transactions or production persistence.

## Rewards and employee reports: admin compatibility

Rewards are read-only on the employee portal. Authenticate by the cookie session and enforce initial-password completion. GET returns only awards belonging to the authenticated employee database ID, with up to 200 unique records. Each record has `{ id, employeeId, title, category, awardDate, description }`. Title is 1–150 trimmed characters; description is optional (maximum 5,000), normalized to an empty string when absent. Dates are valid Gregorian YYYY-MM-DD from 1900–2100. IDs accept nonempty strings up to 100 characters or nonnegative safe legacy integers and normalize to strings. The four categories and labels exactly match admin: EXCELLENCE / Excellence, INNOVATION / Innovation, LONG_SERVICE / Long Service, PUNCTUALITY / Punctuality. Preserve saved dates/descriptions. No approval status, prize amount, certificate download, or employee grant/delete action is invented. Do not derive rewards from career AWARD_MILESTONE entries; these are distinct admin collections. HR grants/removes rewards through its existing workflow; the employee view refreshes authoritative records and retains valid records on refresh failures. The default demo has two synthetic awards for preview; rewards-empty preserves the supplied reference's empty state.

Reports use admin's existing EMPLOYEE_SUBMISSION category and field names, not the other system report categories. POST accepts only title, content, and optional attachmentUrl. Trim title (required 1–150 characters) and findings/recommendations content (required 1–5,000); normalize blank attachmentUrl to an empty string. Accept only full HTTP(S) URLs without embedded credentials, using admin's reportAttachmentUrl rules. Normalized URLs must fit the existing file_data VARCHAR(255) column. This is a link field, not a file upload. Do not fetch the URL during submission or imply that its access permissions were verified. Input limits are employee/frontend handoff rules following the shared communications text limits; admin Reports currently has no creation form/schema to reuse.

The report state contains `{ employeeId, userId, records, canSubmit, message }`. Records contain `{ id, employeeId, submittedByUserId, submittedBy, submittedRole, category: 'EMPLOYEE_SUBMISSION', title, content, attachmentUrl, date, createdAt, clientRequestId }`. Return at most 200 unique own submissions, expanding the contract with server pagination if needed instead of silently truncating. The session determines both user/account and employee IDs. Every record must match both owners; do not return the whole admin report collection. submittedBy is the saved public name (up to 200 characters), submittedRole is EMPLOYEE or DEPARTMENT_HEAD, date is Gregorian EAT submission date, and createdAt is nullable UTC ISO for legacy records. Known timestamps must agree with date in EAT. New confirmed submissions require a known timestamp and exact receipt key. Unknown historical timestamps remain null. No read/approval status is shown because admin stores none.

| Existing storage/admin field | Employee report mapping |
| --- | --- |
| system_reports.report_id | id; unique string or normalized legacy integer |
| report_type | category = EMPLOYEE_SUBMISSION, assigned by server |
| generated_by_user_id | userId / submittedByUserId; resolve name/role and employee relation from this account |
| report_parameters TEXT | Persist title/content as a documented structured payload, then project admin's title/content fields |
| file_data VARCHAR(255) | attachmentUrl; normalize existing N/A or missing attachment to empty string |
| created_at | UTC createdAt plus EAT date for both portals |
| Admin report rows | Same category, submittedBy, submittedRole, title, content, attachmentUrl, date |

GET/POST must authorize the owner, role, and canSubmit permission from the backend. Route submissions into HR management's report view using the same persisted collection. The browser sends no recipient name/email, role, ownership, category, date, or delivery flag. A successful receipt confirms storage/submission, not that HR has opened, approved, or replied. No email or external messaging is sent by this frontend. Reports are read-only after submission; no employee edit/delete endpoint is exposed.

POST returns the updated authoritative state plus submittedReportId. Allow Idempotency-Key in credentialed CORS request headers. Persist an employee/account-scoped receipt atomically with the report. Replays with the same normalized payload return the same report ID without another insert; a changed payload with the same key returns 409. Include the original key as clientRequestId on the persisted record so GET can recover a lost response. The UI confirms only an exact matching key/title/content/link and known submission timestamp, preserves failed form input, reuses its retry key, and locks duplicate submission/navigation/logout while saving. Permission denial and input errors return appropriate HTTP status and error.fields.title/content/attachmentUrl. The existing SQL has no receipt column/table; backend work must add durable receipt storage and serialization/ownership/HR routing. No migrations or backend changes were made here.

Both demos are isolated in-memory previews. Reports persist across logout/relogin in the same tab and reset on reload; they do not update admin's independent local store. API mode never falls back to sample awards or reports after a failure. Employee navigation/dashboard quick operations and password protection are wired for both features. The dedicated report dialog handles cancel/reset/discard, and history includes full details and safe new-tab attachment links.

## Standard error payload

```js
{
  error: {
    code: 'CHECKOUT_TOO_EARLY',
    message: 'Check-out is blocked until the scheduled end time.',
    fields: { currentPassword: 'Your current password is incorrect.' }, // Optional form errors.
  },
}
```

Use 401 for unauthenticated or expired sessions; the frontend returns to login. Use 403 with PASSWORD_CHANGE_REQUIRED for an initial-password session; the frontend redirects to Change Password. Return password field failures in error.fields, for example { currentPassword: 'Your current password is incorrect.' }; the form retains inputs and displays/focuses the corresponding field. Suggested attendance codes are IP_CONFIGURATION_REQUIRED, UNAUTHORIZED_IP, ALREADY_CHECKED_IN, NOT_CHECKED_IN, CHECKOUT_TOO_EARLY, and ALREADY_CHECKED_OUT. Use 409 for duplicate/state conflicts and 422 for invalid form inputs. The UI shows failures instead of substituting fixture data.
