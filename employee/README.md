# Employee frontend

The employee portal implements Login, Dashboard, My Profile, Change Password,
Attendance, Payroll/Payslips, Leave, Career Milestones, Rewards, and Submit Report.
The design, fields, validation, and workflows were cross-checked against admin.
Backend enforcement and persistence remain the backend developer's responsibility.

## Run

Use a Node.js version supported by Vite 8 (Node 24 was used for verification).
From this folder:

```powershell
npm ci
npm run dev
```

The scripts use Vite's native config loader so the same simple commands work on
this Windows host. Use `npm run lint` and `npm run build` for code/build checks.

## Demo and live API

The default is an in-memory demo. Click **Use demo account**, then **Sign in**.
All demo implementation lives in just three files under `src/demo/`: `data.js`,
`adapter.js`, and `payslip.js`. Reload resets the demo session and changes. Demo
attendance actions remain disabled until real office-IP validation is connected.
The employee and admin demos do not share edits or deliver real HR messages.

For backend integration, copy `.env.example` to `.env`, set `VITE_API_MODE=api`
and `VITE_API_URL` to the backend API root, then restart Vite. API mode uses cookie
sessions and never falls back to demo data when a real request fails.

- [BACKEND_HANDOFF.md](BACKEND_HANDOFF.md): connection steps, code map, debugging,
  and exact demo-removal instructions.
- [API_CONTRACT.md](API_CONTRACT.md): endpoints, request/response fields, errors,
  and mappings to the existing admin records.

## Code structure

Pages use feature hooks, which call feature services through one Axios client.
Validation stays in `src/utils/validation/`; session and form/navigation locks stay
in `src/store/index.js`. Routes live in `src/App.jsx`. Demo data is imported only
by the demo adapter, never by pages or production feature services.

The original empty scaffold files are preserved in their original locations.
They are placeholders; implemented screens use the imports and routes in src/App.jsx.
The original empty CSS files are retained, while the active stylesheet is tailwind.css.

All page/component styling uses Tailwind utilities in JSX. The single stylesheet,
`src/styles/tailwind.css`, contains Tailwind configuration and utility variants.
`employee-global` supplies native defaults, `employee-base` supplies shared styles,
and `employee-page` supplies explicit page styles. These layers preserve the admin
design; `screen-max-*` variants preserve its responsive breakpoints. See AGENTS.md
for the rules on future employee features.

## Important behavior

- Initial-password accounts stay on Change Password until the server confirms setup.
- Profile fields are maintained by HR. Photo changes are staged until Save Photo.
- Attendance uses server permissions, saved schedules, and East Africa Time.
- Payroll displays saved monthly amounts; employer pension does not reduce net pay.
- Leave submission creates Pending. Balance changes only after HR approval.
- Career statuses match admin. Employee reads never apply scheduled changes.
- Rewards are read-only and use admin's saved award categories.
- Submit Report opens history first. New Report opens the form. The demo includes
  three synthetic reports; the example.com attachment is illustrative.
- Forms retain input on failure, prevent duplicate saves, and protect unsaved edits.

Development test files and browser fixtures have been removed as requested after
verification. Run the final walkthrough in BACKEND_HANDOFF.md when connecting live data.
