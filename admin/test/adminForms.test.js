import assert from 'node:assert/strict'
import test from 'node:test'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../src/utils/validation/authSchema.js'
import { leaveRequestFormSchema, leaveSettingsSchema, getLeaveDecisionSchema, getLeaveEntitlementSchema, getDeductionFormSchema } from '../src/utils/validation/operationsSchemas.js'
import { rewardFormSchema, disciplinaryActionFormSchema, careerMilestoneFormSchema } from '../src/utils/validation/growthSchemas.js'
import { jobFormSchema } from '../src/utils/validation/recruitmentSchema.js'
import { announcementSchema, documentSchema, getServiceSchema } from '../src/utils/validation/communicationsSchemas.js'
import { INITIAL_EMPLOYEES, INITIAL_DEPARTMENTS, JOB_GRADES, INITIAL_LEAVE_SETTINGS } from '../src/utils/constants/constants.js'
import { validateLeaveSettingsRules, normalizeLeaveSettings, saveLeaveRequest } from '../src/services/operations/leaveService.js'
import { normalizeDeductionFields } from '../src/services/operations/payrollDeductionFields.js'
import { validateCareerMilestoneRules, recordCareerMilestone } from '../src/services/growth/careerService.js'
import { validateDisciplinaryActionRules } from '../src/services/growth/disciplineService.js'
import { validateJobRules } from '../src/services/recruitment/recruitmentService.js'
import { validateDocumentRules, publishDocument } from '../src/services/communications/documentService.js'
import { validateServiceRules, saveService, EMPTY_SERVICE } from '../src/services/communications/publicServiceService.js'
import { showFormErrors } from '../src/utils/validation/formErrors.js'

const options = { fields: {}, shouldUseNativeValidation: false }
const resolve = (schema, values) => zodResolver(schema, undefined, { raw: true })(values, {}, options)
const employee = INITIAL_EMPLOYEES[0]
const today = '2026-11-16'

test('login resolver reports both missing credentials and preserves password text', async () => {
  const invalid = await resolve(loginSchema, { email: '', password: '' })
  assert.ok(invalid.errors.email)
  assert.ok(invalid.errors.password)
  const valid = await resolve(loginSchema, { email: 'admin@example.com', password: '  password  ' })
  assert.equal(valid.values.password, '  password  ')
})

test('leave form preserves edited identity and service overlap checks', async () => {
  const values = { employeeId: employee.id, startDate: '2026-11-17', endDate: '2026-11-18', reason: ' Personal leave ' }
  const result = await resolve(leaveRequestFormSchema, values)
  assert.deepEqual(result.errors, {})
  const state = { requests: [], balances: [], settings: INITIAL_LEAVE_SETTINGS }
  const saved = saveLeaveRequest(state, [employee], result.values, state.settings, today)
  const edited = await resolve(leaveRequestFormSchema, { ...values, id: saved.requests[0].id, reason: 'Updated reason' })
  const updated = saveLeaveRequest(saved, [employee], edited.values, state.settings, today)
  assert.equal(updated.requests.length, 1)
  assert.equal(updated.requests[0].id, saved.requests[0].id)
  assert.throws(() => saveLeaveRequest(saved, [employee], values, state.settings, today), /overlaps/)
  assert.ok((await resolve(leaveRequestFormSchema, { ...values, employeeId: '' })).errors.employeeId)
})

test('leave decisions enforce conditional reasons, length and entitlement limits', async () => {
  assert.deepEqual((await resolve(getLeaveDecisionSchema(false), { note: '' })).errors, {})
  assert.ok((await resolve(getLeaveDecisionSchema(true), { note: '   ' })).errors.note)
  assert.ok((await resolve(getLeaveDecisionSchema(false), { note: 'a'.repeat(1001) })).errors.note)
  for (const accrued of ['9', '101', '10.5', '']) {
    assert.ok((await resolve(getLeaveEntitlementSchema(10, 90), { accrued, note: 'Annual adjustment' })).errors.accrued)
  }
  for (const accrued of ['10', '100']) {
    assert.deepEqual((await resolve(getLeaveEntitlementSchema(10, 90), { accrued, note: 'Annual adjustment' })).errors, {})
  }
})

test('leave settings keep booleans and normalize numeric text only when saving', async () => {
  const result = await resolve(leaveSettingsSchema, { ...INITIAL_LEAVE_SETTINGS, noticeDays: '03', requireRejectionReason: false })
  assert.deepEqual(result.errors, {})
  assert.equal(result.values.noticeDays, '03')
  assert.equal(normalizeLeaveSettings(result.values).noticeDays, '3')
  assert.equal(result.values.requireRejectionReason, false)
  assert.ok(validateLeaveSettingsRules({ ...result.values, defaultEntitlement: '5', maxBalance: '10' }, [{ accrued: 15, used: 0 }]).maxBalance)
})

test('deduction form keeps employee arrays, active flags, month and identity', async () => {
  const values = { id: 'DEDUCTION-1', month: '2026-11', name: 'Loan', description: 'Monthly repayment', kind: 'fixed', value: '12.50', appliesTo: 'selected', employeeIds: [employee.id], active: false }
  const result = await resolve(getDeductionFormSchema(), values)
  assert.deepEqual(result.errors, {})
  assert.equal(result.values.id, values.id)
  assert.equal(result.values.month, values.month)
  assert.deepEqual(result.values.employeeIds, [employee.id])
  assert.equal(result.values.active, false)
  assert.equal(normalizeDeductionFields(result.values, [employee]).value, 12.5)
  assert.ok((await resolve(getDeductionFormSchema(), { ...values, employeeIds: [] })).errors.employeeIds)
  for (const value of ['0', '-1', '12.501', '101']) {
    assert.ok((await resolve(getDeductionFormSchema(), { ...values, kind: 'percent', value })).errors.value)
  }
})

test('automatic deductions are available only for the existing income-tax editor', async () => {
  const values = { name: 'Tax', description: 'Income tax', kind: 'automatic', value: null, appliesTo: 'all', employeeIds: [], active: true }
  assert.ok((await resolve(getDeductionFormSchema(), values)).errors.kind)
  const result = await resolve(getDeductionFormSchema(true), values)
  assert.deepEqual(result.errors, {})
  assert.equal(result.values.value, null)
})

test('recruitment form retains vacancy IDs and active-department and deadline rules', async () => {
  const department = INITIAL_DEPARTMENTS.find(item => item.status === 'Active')
  const values = { id: 'JOB-1', title: 'Engineer', departmentId: String(department.id), deadline: '2026-11-17', status: 'OPEN', description: 'Maintain systems' }
  const result = await resolve(jobFormSchema, values)
  assert.deepEqual(result.errors, {})
  assert.equal(result.values.id, 'JOB-1')
  assert.deepEqual(validateJobRules(result.values, [department], today), {})
  assert.ok(validateJobRules(result.values, [{ ...department, status: 'Inactive' }], today).departmentId)
  assert.ok(validateJobRules({ ...result.values, deadline: '2026-11-15' }, [department], today).deadline)
})

test('recognition and discipline require employee selection and keep future incident checks', async () => {
  const reward = { employeeId: '', title: 'Excellent work', category: 'EXCELLENCE', awardDate: today, description: '' }
  assert.ok((await resolve(rewardFormSchema, reward)).errors.employeeId)
  assert.deepEqual((await resolve(rewardFormSchema, { ...reward, employeeId: employee.id })).errors, {})
  const discipline = { employeeId: employee.id, incidentDate: '2026-11-17', violationType: 'Absence', penaltyAction: 'WARNING', description: '' }
  assert.deepEqual((await resolve(disciplinaryActionFormSchema, discipline)).errors, {})
  assert.ok(validateDisciplinaryActionRules(discipline, [employee], today).incidentDate)
})

test('career form preserves salary snapshots and rejects changes made after selection', async () => {
  const grade = JOB_GRADES.find(item => item.name !== employee.grade && item.salary > employee.basicSalary)
  assert.ok(grade)
  const values = { employeeId: employee.id, milestoneType: 'PROMOTION', effectiveDate: today, previousGradeId: String(JOB_GRADES.find(item => item.name === employee.grade)?.id ?? ''), newGradeId: String(grade.id), description: 'Committee approved promotion', expectedEmployeeGrade: employee.grade, expectedEmployeeSalary: employee.basicSalary, expectedNewSalary: grade.salary }
  const result = await resolve(careerMilestoneFormSchema, values)
  assert.deepEqual(result.errors, {})
  assert.equal(result.values.expectedNewSalary, grade.salary)
  const saved = recordCareerMilestone([], [employee], JOB_GRADES, result.values, today)
  assert.equal(saved.employees[0].basicSalary, grade.salary)
  assert.ok(validateCareerMilestoneRules(result.values, [], [{ ...employee, basicSalary: employee.basicSalary + 1 }], JOB_GRADES, today).employeeId)
  assert.ok(validateCareerMilestoneRules(result.values, [], [employee], JOB_GRADES.map(item => item.id === grade.id ? { ...item, salary: item.salary + 1 } : item), today).newGradeId)
})

test('announcement and document resolvers preserve selected audiences and File objects', async () => {
  const announcement = await resolve(announcementSchema, { title: 'Maintenance', content: 'Office systems maintenance', targetAudience: 'ALL' })
  assert.deepEqual(announcement.errors, {})
  const file = new File(['Policy text'], 'policy.txt', { type: 'text/plain' })
  const result = await resolve(documentSchema, { title: 'Policy', targetAudience: 'EMPLOYEES', source: 'FILE', file, url: 'https://example.com/policy' })
  assert.deepEqual(result.errors, {})
  assert.equal(result.values.file, file)
  assert.deepEqual(validateDocumentRules(result.values), {})
  assert.equal(publishDocument([], result.values)[0].file, file)
  const urlValues = { ...result.values, source: 'URL', file: null }
  assert.deepEqual(validateDocumentRules(urlValues), {})
  assert.equal(publishDocument([], urlValues)[0].file, null)
  assert.ok(validateDocumentRules({ ...urlValues, url: 'javascript:alert(1)' }).url)
})

test('service forms keep draft/publication constraints and conditional training fields', async () => {
  const values = { ...EMPTY_SERVICE, id: 'SERVICE-1', title: 'Public support', schedule: 'x'.repeat(201) }
  const draft = await resolve(getServiceSchema(values.type), values)
  assert.deepEqual(draft.errors, {})
  assert.equal(draft.values.id, 'SERVICE-1')
  assert.deepEqual(validateServiceRules(draft.values), {})
  assert.ok(validateServiceRules({ ...draft.values, status: 'PUBLISHED' }).howToAccess)
  assert.ok((await resolve(getServiceSchema('TRAINING'), { ...values, type: 'TRAINING' })).errors.schedule)
  const published = { ...values, status: 'PUBLISHED', description: 'Support for residents', howToAccess: 'Visit the office', registrationUrl: 'https://example.com/apply' }
  assert.equal(saveService([{ ...EMPTY_SERVICE, id: values.id, createdAt: today }], published)[0].schedule, '')
  assert.ok(validateServiceRules({ ...published, registrationUrl: 'invalid' }).registrationUrl)
})

test('business errors attach readable messages and focus the first field', () => {
  const calls = []
  let focused
  assert.equal(showFormErrors({ employeeId: 'Reselect employee', newGradeId: 'Salary changed' }, (...args) => calls.push(args), name => { focused = name }), true)
  assert.equal(focused, 'employeeId')
  assert.deepEqual(calls[1], ['newGradeId', { type: 'business', message: 'Salary changed' }])
  assert.equal(showFormErrors({}, () => assert.fail(), () => assert.fail()), false)
})
