# Employee backend handoff

Updated 23 November 2026. The employee frontend is implemented. Authentication,
database storage, attendance permission checks, and HR actions require the backend.
The admin and employee demos are independent; connect both to the same saved records.
Original empty scaffold files are preserved. The running frontend uses the routes
in src/App.jsx; those empty placeholders do not implement additional features.

## Connect the backend

1. Implement the endpoints and response fields in [API_CONTRACT.md](API_CONTRACT.md).
2. Copy `.env.example` to `.env` and set:

   ```dotenv
   VITE_API_MODE=api
   VITE_API_URL=http://localhost:3000/api
   ```

3. Restart with `npm run dev`. API mode sends real requests and hides demo login controls.
4. Configure cookie sessions and allow the frontend origin with credentials. Validate
   the authenticated employee on every endpoint. Keep passwords and session secrets
   out of responses. The frontend's first-login redirect also needs server enforcement.
5. Return saved admin fields using the mappings in the contract. Recheck profile,
   attendance, payroll, leave, career, rewards, and reports against shared database records.

## Where to work

| Folder/file | Responsibility |
| --- | --- |
| `src/config/api.js` | API URL and demo/API mode |
| `src/services/api/api.js` | Axios client, cookie requests, shared server errors/session expiry |
| `src/services/auth/` | Login, session, password, profile, and photo requests |
| `src/services/work/` | Attendance, leave, payroll, and server PDF requests |
| `src/services/growth/` | Career, rewards, and report requests |
| `src/utils/validation/` | Form and API response validation matching admin fields |
| `src/hooks/` | Loading, refresh, saving, cancellation, and recovery after a lost response |
| `src/pages/` and `src/components/` | Screen layout and form interaction, styled with Tailwind |
| `src/store/index.js` | Session and navigation/form locks |
| `src/App.jsx` | Protected routes and first-login routing |

Keep HTTP calls in services. A typical feature flows through:
`page → hook → feature service → shared API client → backend`.
The service validates the response before the hook updates the page.

## Debugging

- Use the browser Network panel to inspect the failing endpoint and its JSON response.
  The API client preserves `error.code`, `error.fields`, and the server's message.
- If the page says records are inconsistent, compare the response to that feature's
  schema and the examples in API_CONTRACT.md. Ownership, dates, enum values, and totals
  are validated. Fix the response mapping rather than removing validation.
- `401` clears the session. `PASSWORD_CHANGE_REQUIRED` redirects to password setup.
  Other request failures retain the form values and show an error.
- Report and leave submissions send an `Idempotency-Key` header. The backend must
  replay the same receipt without a second insert. This lets the frontend recover
  when a successful save's response is lost.
- Attendance permissions and timestamps come from the backend, including the office
  IP check. Saved payroll amounts and PDFs also come from the backend.

## Demo code and removal

All demo implementation is in exactly three files:

- `src/demo/data.js`: synthetic account and feature records.
- `src/demo/adapter.js`: in-memory Axios responses, demo password/photo changes,
  and leave/report receipts. Reload resets the demo session and edits.
- `src/demo/payslip.js`: synthetic PDF generation. Live mode downloads the server PDF.

Switching to API mode is sufficient to stop using demo data. After live integration
is verified, remove the demo permanently:

1. In `src/services/api/api.js`, remove the marked `demoAdapter` block, including its
   dynamic import. Replace `getDemoLogin()` with `return null` in its function body.
2. Keep `VITE_API_MODE=api`; then delete `src/demo/`. Pages, hooks, and feature services
   have no imports from that folder.
3. Remove the `optimizeDeps` entry for `jspdf` from `vite.config.js`, then run
   `npm uninstall jspdf`. The live PDF download needs no PDF-generation library.
4. Remove the demo-login section from Login and the demo footer label when desired.
   They are already hidden in API mode.
5. Run `npm run lint` and `npm run build`.

## Final integration walkthrough

Frontend checks on 23 November 2026: lint, demo build, API-mode build, dependency
installation consistency, and whitespace checks passed. All original tracked files
are present. The API-mode output excludes the demo records and sample PDF generator.
The 44 development checks passed before the requested test-file removal. A fresh
desktop/mobile visual walkthrough remains pending; live backend workflows also
require verification after the endpoints are implemented.

Check real sign-in/session restoration, initial password setup, logout, and photo
save/removal. Verify attendance against saved admin office-IP/shift settings, saved
payroll and PDF downloads, leave submission and HR approval/balance refresh, career
and rewards visibility, and reports arriving in admin with their attachment links.
Check mobile navigation, dialog cancel/discard, invalid input, request failure,
duplicate clicks, and session expiry. Test files and browser fixtures created during
frontend development were removed as requested; this walkthrough remains the handoff checklist.
