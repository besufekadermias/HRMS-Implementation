import assert from 'node:assert/strict'
import test from 'node:test'
import { INITIAL_EMPLOYEES, INITIAL_DEPARTMENTS, JOB_GRADES, INITIAL_LEAVE_SETTINGS } from '../src/utils/constants/constants.js'
import { validateEmployee, validateDepartment, validateJobGrade } from '../src/utils/validation/validators.js'
import { signIn, DEMO_LOGIN } from '../src/services/auth/authService.js'
import { validateAttendanceSettings } from '../src/services/operations/attendanceService.js'
import { validateLeaveSettings, saveLeaveRequest, saveLeaveEntitlement, decideLeave } from '../src/services/operations/leaveService.js'
import { createLeaveApi, validateLeaveResponse } from '../src/services/operations/leaveApi.js'
import { createPayrollApi } from '../src/services/operations/payrollApi.js'
import { validatePayrollResponse } from '../src/services/operations/payrollValidation.js'
import { validatePayrollMonth } from '../src/services/operations/payrollService.js'
import { normalizeDeductionFields } from '../src/services/operations/payrollDeductionFields.js'
import { validateJob } from '../src/services/recruitment/recruitmentService.js'
import { validateReward } from '../src/services/growth/rewardService.js'
import { validateDisciplinaryAction } from '../src/services/growth/disciplineService.js'
import { validateCareerMilestone } from '../src/services/growth/careerService.js'
import { validateAnnouncement } from '../src/services/communications/announcementService.js'
import { validateDocument, publishDocument } from '../src/services/communications/documentService.js'
import { validateService, EMPTY_SERVICE } from '../src/services/communications/publicServiceService.js'
import { isValidDate } from '../src/utils/validation/dates.js'

const employee = { ...INITIAL_EMPLOYEES[0], gender: 'Male', birthDate: '1990-01-01', employmentType: 'Permanent', portalRole: 'Employee' }
const employees = [employee]
const today = '2026-11-16'

test('employee edits and CSV imports preserve their different required fields', () => {
  assert.deepEqual(validateEmployee(employee, employees, employee.id), {})
  assert.deepEqual(validateEmployee({ ...employee, gender: '', birthDate: '', portalRole: '' }, [], null, { importMode: true }), {})
  assert.equal(validateEmployee(employee, [], null).temporaryPassword, 'Use at least 8 characters.')
  assert.equal(validateEmployee({ ...employee, temporaryPassword: 'valid-password' }, employees).id, 'This employee ID is already in use.')
})

test('employee validation catches malformed fields and hire dates before birth', () => {
  const errors = validateEmployee({ ...employee, id: 42, name: null, email: 'bad@', hiredDate: '1989-01-01' }, [], employee.id)
  assert.match(errors.id, /1–30/)
  assert.match(errors.name, /full name/)
  assert.match(errors.email, /email/)
  assert.equal(errors.hiredDate, 'Hired date cannot be before birth date.')
  assert.equal(isValidDate('2026-02-30'), false)
  assert.equal(isValidDate('2024-02-29'), true)
})

test('department names, codes, and head assignments remain constrained', () => {
  const department = INITIAL_DEPARTMENTS.find(item => item.name === employee.department)
  assert.deepEqual(validateDepartment({ ...department, description: '', headId: employee.id }, INITIAL_DEPARTMENTS, employees), {})
  const errors = validateDepartment({ ...department, id: null, code: department.code.toLowerCase(), headId: 'missing' }, INITIAL_DEPARTMENTS, employees)
  assert.match(errors.name, /already exists/)
  assert.match(errors.code, /already in use/)
  assert.match(errors.headId, /assigned/)
})

test('grade validation normalizes title spacing and rejects invalid salary precision', () => {
  assert.deepEqual(validateJobGrade({ name: 'New   grade', salary: '12.50' }, []), {})
  assert.match(validateJobGrade({ name: 'New grade', salary: '12.501' }, []).salary, /decimal places/)
  assert.match(validateJobGrade({ name: 'New grade', salary: Infinity }, []).salary, /salary/)
})

test('login validates input while retaining the existing demo authentication', () => {
  assert.doesNotThrow(() => signIn(DEMO_LOGIN))
  assert.throws(() => signIn({ email: 'invalid', password: '' }), /email/)
  assert.throws(() => signIn({ ...DEMO_LOGIN, password: 'wrong' }), /demo account/)
})

test('attendance keeps time ordering, grace-period and normalized IP checks', () => {
  const values = { startTime: '08:00', endTime: '17:00', gracePeriod: '15', allowedIps: '127.0.0.1\n::1' }
  assert.deepEqual(validateAttendanceSettings(values), {})
  assert.match(validateAttendanceSettings({ ...values, endTime: '07:00' }).endTime, /after start time/)
  assert.match(validateAttendanceSettings({ ...values, gracePeriod: '540' }).gracePeriod, /shorter/)
  assert.match(validateAttendanceSettings({ ...values, allowedIps: '::1,0:0:0:0:0:0:0:1' }).allowedIps, /duplicate/)
  assert.match(validateAttendanceSettings({ ...values, allowedIps: 'https://example.com' }).allowedIps, /IPv4 or IPv6/)
})

test('leave settings retain cap and existing-balance safeguards', () => {
  assert.deepEqual(validateLeaveSettings(INITIAL_LEAVE_SETTINGS), {})
  assert.match(validateLeaveSettings({ ...INITIAL_LEAVE_SETTINGS, maxBalance: '10' }).defaultEntitlement, /cannot exceed/)
  const errors = validateLeaveSettings({ ...INITIAL_LEAVE_SETTINGS, defaultEntitlement: '5', maxBalance: '10' }, [{ accrued: 15, used: 0 }])
  assert.match(errors.maxBalance, /existing balance/)
  assert.match(validateLeaveSettings({ ...INITIAL_LEAVE_SETTINGS, noticeDays: 1.5 }).noticeDays, /whole number/)
})

test('leave responses and approval/reopening keep request and balance consistent', async () => {
  const data = await createLeaveApi({ now: () => new Date('2026-11-16T09:00:00Z') }).load({ employees })
  assert.doesNotThrow(() => validateLeaveResponse(data))
  assert.throws(() => validateLeaveResponse({ ...data, requests: [{ id: 'bad' }] }), /Leave/)
  const state = { requests: [], balances: [{ employeeId: employee.id, yearStart: '2026-09-11', accrued: 30, used: 0 }], settings: INITIAL_LEAVE_SETTINGS }
  const values = { employeeId: employee.id, startDate: '2026-11-17', endDate: '2026-11-18', reason: 'Personal leave' }
  const saved = saveLeaveRequest(state, employees, values, state.settings, today)
  const requestId = saved.requests[0].id
  const approved = decideLeave(saved, employees, { requestId, status: 'APPROVED' })
  assert.equal(approved.balances[0].used, 2)
  const reopened = decideLeave(approved, employees, { requestId, status: 'PENDING', note: 'Review again' })
  assert.equal(reopened.balances[0].used, 0)
  assert.throws(() => saveLeaveRequest(saved, employees, values, state.settings, today), /overlaps/)
  assert.throws(() => saveLeaveEntitlement(state, employees, { employeeId: employee.id, accrued: 91, note: 'Adjustment' }), /remaining balance/)
})

test('payroll validates months and rejects inconsistent money in responses', async () => {
  assert.doesNotThrow(() => validatePayrollMonth('2026-11', today))
  assert.throws(() => validatePayrollMonth('2026-13', today), /valid payroll month/)
  assert.throws(() => validatePayrollMonth('2026-12', today), /current month/)
  const data = await createPayrollApi().load()
  assert.equal(validatePayrollResponse(data), data)
  const invalid = structuredClone(data)
  invalid.runs[0].rows[0].net += 1
  assert.throws(() => validatePayrollResponse(invalid), /inconsistent/)
})

test('deduction validation retains percentage and employee-selection rules', () => {
  const values = { name: 'Transport', description: 'Monthly deduction', kind: 'fixed', value: '12.50', appliesTo: 'selected', employeeIds: [employee.id], active: true }
  assert.equal(normalizeDeductionFields(values, employees).value, 12.5)
  assert.throws(() => normalizeDeductionFields({ ...values, kind: 'percent', value: '101' }, employees), /100%/)
  assert.throws(() => normalizeDeductionFields({ ...values, employeeIds: ['missing'] }, employees), /available employee/)
  assert.throws(() => normalizeDeductionFields({ ...values, active: 'yes' }, employees), /whether to apply/)
})

test('recruitment validates active departments and open-vacancy deadlines', () => {
  const values = { title: 'Engineer', departmentId: INITIAL_DEPARTMENTS[0].id, deadline: '2026-12-01', status: 'OPEN', description: 'Build software.' }
  assert.deepEqual(validateJob(values, [{ ...INITIAL_DEPARTMENTS[0], status: 'Active' }], today), {})
  assert.match(validateJob({ ...values, deadline: '2026-11-15' }, INITIAL_DEPARTMENTS, today).deadline, /today or later/)
  assert.match(validateJob(values, [], today).departmentId, /active department/)
})

test('recognition, discipline and career retain roster and configured-grade checks', () => {
  assert.deepEqual(validateReward({ employeeId: employee.id, title: 'Excellence', category: 'EXCELLENCE', awardDate: today, description: '' }, employees), {})
  assert.match(validateReward({ employeeId: 'missing', title: 12, awardDate: '2026-02-30' }, employees).employeeId, /staff list/)
  assert.match(validateDisciplinaryAction({ employeeId: employee.id, incidentDate: '2026-11-17', violationType: 'Absence', penaltyAction: 'WARNING' }, employees, today).incidentDate, /today/)
  const values = { employeeId: employee.id, milestoneType: 'AWARD_MILESTONE', effectiveDate: today, previousGradeId: '', newGradeId: '', description: 'Recognize service.' }
  assert.deepEqual(validateCareerMilestone(values, [], employees, JOB_GRADES, today), {})
  assert.match(validateCareerMilestone({ ...values, milestoneType: 'PROMOTION' }, [], employees, JOB_GRADES, today).newGradeId, /configured grade/)
})

test('announcements retain audience and content validation', () => {
  assert.deepEqual(validateAnnouncement({ title: 'Notice', content: 'Office update', targetAudience: 'ALL' }), {})
  assert.match(validateAnnouncement({ title: null, content: '', targetAudience: 'INVALID' }).title, /announcement title/)
  assert.match(validateAnnouncement({ title: 'Notice', content: 'Update', targetAudience: 'INVALID' }).targetAudience, /audience/)
})

test('documents validate uploads and URLs without losing File objects', () => {
  const values = { title: 'Policy', targetAudience: 'EMPLOYEES', source: 'URL', url: 'https://example.com/policy.pdf' }
  assert.deepEqual(validateDocument(values), {})
  assert.match(validateDocument({ ...values, url: 'https://user:password@example.com/policy.pdf' }).url, /embedded credentials/)
  const file = new File(['Policy text'], 'policy.pdf', { type: 'application/pdf' })
  assert.deepEqual(validateDocument({ ...values, source: 'FILE', file }), {})
  assert.equal(publishDocument([], { ...values, source: 'FILE', file })[0].file, file)
  assert.match(validateDocument({ ...values, source: 'FILE', file: new File([], 'empty.pdf') }).file, /empty/)
})

test('services distinguish drafts from published offerings and training schedules', () => {
  const values = { ...EMPTY_SERVICE, title: 'IT support' }
  assert.deepEqual(validateService(values), {})
  assert.deepEqual(validateService({ ...values, registrationUrl: '   ' }), {})
  assert.match(validateService({ ...values, status: 'PUBLISHED' }).description, /before publishing/)
  assert.match(validateService({ ...values, type: 'TRAINING', schedule: 'x'.repeat(201) }).schedule, /200/)
  assert.deepEqual(validateService({ ...values, schedule: 'x'.repeat(201) }), {})
})
