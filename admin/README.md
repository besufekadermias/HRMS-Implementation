# Hadiya Science HRMS — Admin

## Shared data with Zustand

`src/store/index.js` holds the shared records for employees, departments, grades,
attendance, leave, payroll, recruitment, career, rewards, discipline,
announcements, reports, documents, and public services. It also holds the current
workspace status and toast message. `App.jsx` passes these records to the pages.

Form inputs, dialogs, filters, navigation, loading errors, and save locks stay in
their existing components or hooks. The store has no browser persistence.
Reloading or signing out restores the demo data until backend persistence is connected.

Use a selector when a component needs one part of the store:

```js
import { useAdminStore } from '../../store/index.js'

const employees = useAdminStore(state => state.employees)
const setEmployees = useAdminStore(state => state.setEmployees)
```

Outside a component, use `useAdminStore.getState()` to inspect records or call an
action. Setters accept a value or a function of the latest value, like React's
state setters. Each record setter validates its input before changing the store.
Use `setWorkforce(result)` for employee/department/grade changes and
`setCareerState(result)` for career/salary changes that must happen together.
`reset()` restores all shared demo data and closes the workspace.

## Validation with Zod

`src/utils/validation` contains the schemas, grouped by feature. Dropdown values
and their validation share the same constants. Existing service validators still
return `{ fieldName: message }`. Forms use Zod resolvers for field errors, then
`showFormErrors()` attaches any business-rule messages to the matching inputs.

Schemas handle field types and simple constraints. Duplicate checks, department
assignments, leave-year boundaries, balance limits, payroll reconciliation, and
salary calculations remain in the existing validators and service functions.
Leave and payroll hooks validate returned data before putting it in the store.
File objects stay intact in memory; passwords are kept in the login form.

When integrating a backend, call Axios from the relevant service, validate the
response, then update the store through its named action. Keep backend authorization
and business validation on the server as well. Axios URL setup is described in
the repository README.

For debugging, store validation errors name the dataset and field path and keep
the original Zod error in `error.cause`. Avoid logging credentials or full HR records.

## Workforce forms with React Hook Form

Add/Edit Employee uses `react-hook-form` for field values, errors, dirty state,
and submission state. `@hookform/resolvers/zod` connects it to
`getEmployeeSchema()` in `src/utils/validation/workforceSchemas.js`.
The schema requires an initial password for new employees only.

`validateEmployeeRules()` still checks duplicate IDs/logins, available departments
and grades, and birth/hire date rules. CSV imports use the same schema selection
and business checks through `validateEmployee()`.

The resolver uses `raw: true` to preserve optional fields and uploaded File
objects. Only the save handler builds the employee record and trims text; the
temporary password stays in the form. Upload changes have a separate dirty flag
because React Hook Form cannot compare File contents. Save failures display a
form error and retain the entered values.

Add/Edit Department and Job Grade use the same direct `useForm` and Zod resolver
pattern. Their business checks live in `validateDepartmentRules()` and
`validateJobGradeRules()`. The resolver keeps IDs and head assignments with
`raw: true`; existing services normalize values and update employee assignments
and salaries. Grade title spacing is normalized before schema validation.
The forms await saving, retain values on failure, and confirm closing dirty forms.
All other implemented admin forms now use this same pattern.

## Attendance Settings with React Hook Form

Attendance Settings uses the same `useForm` and Zod resolver pattern. Field
validation uses `attendanceSettingsSchema`; `validateAttendanceSettingsRules()`
keeps working-day ordering, grace-period limits, IP parsing, and duplicate-IP
checks in the attendance service. Inputs remain local until saving succeeds.

After a successful save, `reset(normalized)` establishes the new saved baseline.
Reset Changes restores saved settings. Restore Defaults keeps the saved baseline,
so different defaults are shown as unsaved changes. Failed saves retain the inputs
and display the existing error message.

## All implemented admin forms

All 17 implemented forms use React Hook Form and Zod: login, employee,
department, grade, attendance settings, leave request, leave policy,
leave entitlement, leave decision, payroll deduction, vacancy, recognition,
disciplinary action, career milestone, announcement, document, and service.
Add/edit screens share their form component.

Each form uses `useForm()` directly and `register()` for native inputs.
`useWatch()` is used only where values drive previews or conditional fields.
Form values and credentials stay local. Zustand holds shared saved records.
The resolver uses `raw: true` so IDs, selected employee arrays, booleans,
salary snapshots, and uploaded File objects survive validation. Services still
normalize submitted values and enforce roster, date, balance, and payroll rules.

Save handlers and their page wrappers await saving before closing the form.
Failures keep the entered values and display an error; pending saves disable
the controls and retain the existing duplicate-submit locks. Dirty forms keep
their discard confirmation. Leave policy uses the same saved-baseline reset
behavior as attendance settings; numeric policy values remain normalized strings.

Leave decisions require notes according to the policy; entitlement adjustments
always require a reason. Payroll retains automatic income tax and manual fixed
or percentage calculations, selected employee IDs, and the active checkbox.
Career selection captures employee/grade salary snapshots so service checks can
detect changes made after selection. Document uploads use `setValue('file', file)`
to keep a File rather than a FileList; file changes also count as dirty.
Service validation opens collapsed additional details before focusing an error.

## Checks

```sh
npm test
npm run lint
npm run build
```

The tests cover the current validation contracts, resolver output, conditional
fields, employee arrays, salary snapshots, related-record updates,
invalid-update rejection, uploaded files, and logout reset. Empty placeholder
pages do not gain new screens or backend endpoints from these packages.
