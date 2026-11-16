import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { useAdminStore } from '../src/store/index.js'
import { saveDepartment } from '../src/services/workforce/departmentService.js'
import { saveJobGrade } from '../src/services/workforce/gradeService.js'
import { publishDocument } from '../src/services/communications/documentService.js'

beforeEach(() => useAdminStore.getState().reset())

test('all shared datasets accept the existing records', () => {
  const state = useAdminStore.getState()
  for (const key of ['employees', 'departments', 'grades', 'rewards', 'recruitment', 'discipline', 'careerMilestones', 'announcements', 'documents', 'services', 'reports', 'attendance', 'attendanceHeads', 'attendanceSettings', 'departmentChanges', 'leaveData', 'payrollData']) {
    const action = `set${key[0].toUpperCase()}${key.slice(1)}`
    assert.doesNotThrow(() => state[action](state[key]), key)
  }
})

test('functional updates use the latest shared state', () => {
  const { setEmployees } = useAdminStore.getState()
  setEmployees(current => current.map((employee, index) => index ? employee : { ...employee, status: 'Inactive' }))
  setEmployees(current => current.map((employee, index) => index ? employee : { ...employee, name: 'Updated employee' }))
  const employee = useAdminStore.getState().employees[0]
  assert.equal(employee.status, 'Inactive')
  assert.equal(employee.name, 'Updated employee')
})

test('invalid updates preserve records and include the original Zod cause', () => {
  const state = useAdminStore.getState()
  assert.throws(() => state.setEmployees([{ id: 'invalid' }]), error => error.cause?.name === 'ZodError')
  assert.equal(useAdminStore.getState().employees, state.employees)
  assert.throws(() => state.setWorkforce({ employees: [], grades: [{ id: 1 }] }), /Grades/)
  assert.equal(useAdminStore.getState().employees, state.employees)
})

test('department renames update assignments in one store notification', () => {
  const state = useAdminStore.getState()
  const department = state.departments.find(item => state.employees.some(employee => employee.department === item.name))
  let notifications = 0
  const unsubscribe = useAdminStore.subscribe(next => {
    notifications++
    assert.ok(next.departments.some(item => item.name === 'Renamed department'))
    assert.ok(next.employees.some(employee => employee.department === 'Renamed department'))
  })
  try {
    state.setWorkforce(saveDepartment(state.departments, state.employees, { ...department, name: 'Renamed department' }))
    assert.equal(notifications, 1)
  } finally { unsubscribe() }
})

test('grade and salary updates reach the shared roster together', () => {
  const state = useAdminStore.getState()
  const grade = state.grades.find(item => state.employees.some(employee => employee.grade === item.name))
  state.setWorkforce(saveJobGrade(state.grades, state.employees, { ...grade, name: 'Updated grade', salary: '12345.67' }))
  const updated = useAdminStore.getState()
  assert.equal(updated.grades.find(item => item.id === grade.id).salary, 12345.67)
  assert.ok(updated.employees.filter(employee => employee.grade === 'Updated grade').every(employee => employee.basicSalary === 12345.67))
})

test('the store keeps uploaded files intact in memory', () => {
  const state = useAdminStore.getState()
  const file = new File(['Policy'], 'policy.pdf', { type: 'application/pdf' })
  const documents = publishDocument(state.documents, { title: 'Policy', targetAudience: 'ALL', source: 'FILE', file })
  state.setDocuments(documents)
  assert.equal(useAdminStore.getState().documents[0].file, file)
})

test('logout reset clears all shared changes without mutating demo seeds', () => {
  const state = useAdminStore.getState()
  const originalName = state.employees[0].name
  state.setEmployees(current => current.map((employee, index) => index ? employee : { ...employee, name: 'Changed name' }))
  state.setToast('Saved')
  state.setWorkspaceClosed(false)
  state.reset()
  const reset = useAdminStore.getState()
  assert.equal(reset.employees[0].name, originalName)
  assert.equal(reset.workspaceClosed, true)
  assert.equal(reset.toast, '')
  assert.equal(reset.leaveData, null)
  assert.equal(reset.payrollData, null)
  assert.notEqual(reset.employees, state.employees)
})
