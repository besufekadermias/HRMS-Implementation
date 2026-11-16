import assert from 'node:assert/strict'
import test from 'node:test'
import { zodResolver } from '@hookform/resolvers/zod'
import { INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES, JOB_GRADES } from '../src/utils/constants/constants.js'
import { departmentSchema, jobGradeSchema } from '../src/utils/validation/workforceSchemas.js'
import { validateDepartmentRules, validateJobGradeRules } from '../src/utils/validation/validators.js'
import { saveDepartment } from '../src/services/workforce/departmentService.js'
import { saveJobGrade } from '../src/services/workforce/gradeService.js'

const resolverOptions = { fields: {}, shouldUseNativeValidation: false }
const resolveDepartment = zodResolver(departmentSchema, undefined, { raw: true })
const resolveGrade = zodResolver(jobGradeSchema, undefined, { raw: true })

test('department form responses preserve IDs and heads when renaming assigned departments', async () => {
  const employee = INITIAL_EMPLOYEES[0]
  const department = INITIAL_DEPARTMENTS.find(item => item.name === employee.department)
  const values = { ...department, name: ' Renamed Department ', headId: employee.id }
  const response = await resolveDepartment(values, {}, resolverOptions)
  assert.deepEqual(response.errors, {})
  assert.equal(response.values.id, department.id)
  assert.equal(response.values.headId, employee.id)
  const saved = saveDepartment(INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES, response.values)
  assert.equal(saved.departments.length, INITIAL_DEPARTMENTS.length)
  assert.equal(saved.department.headId, employee.id)
  assert.equal(saved.employees.find(item => item.id === employee.id).department, 'Renamed Department')
})

test('department fields and business rules retain duplicate and roster restrictions', async () => {
  const invalid = await resolveDepartment({ name: '', code: '?', status: 'Active' }, {}, resolverOptions)
  assert.match(invalid.errors.name.message, /department name/)
  assert.match(invalid.errors.code.message, /2–12/)
  const original = INITIAL_DEPARTMENTS[0]
  assert.deepEqual(validateDepartmentRules({ ...original, headId: '' }, INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES), {})
  const duplicate = validateDepartmentRules({ ...original, id: null, name: original.name.toLowerCase(), code: original.code.toLowerCase(), headId: 'missing' }, INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES)
  assert.match(duplicate.name, /already exists/)
  assert.match(duplicate.code, /already in use/)
  assert.match(duplicate.headId, /assigned/)
})

test('grade form responses preserve identity and update assigned employee salaries', async () => {
  const employee = INITIAL_EMPLOYEES[0]
  const grade = JOB_GRADES.find(item => item.name === employee.grade)
  const values = { ...grade, name: 'Updated   Grade', salary: '12500.25' }
  const response = await resolveGrade(values, {}, resolverOptions)
  assert.deepEqual(response.errors, {})
  assert.equal(response.values.id, grade.id)
  assert.equal(response.values.salary, '12500.25')
  const saved = saveJobGrade(JOB_GRADES, INITIAL_EMPLOYEES, response.values)
  assert.equal(saved.grades.length, JOB_GRADES.length)
  assert.equal(saved.grade.name, 'Updated Grade')
  const updatedEmployee = saved.employees.find(item => item.id === employee.id)
  assert.equal(updatedEmployee.grade, 'Updated Grade')
  assert.equal(updatedEmployee.basicSalary, 12500.25)
})

test('grade forms normalize spacing before validation and reject invalid salaries and duplicate titles', async () => {
  const grade = JOB_GRADES[0]
  const duplicateTitle = grade.name.replace(/ /g, '   ')
  assert.deepEqual(validateJobGradeRules({ ...grade, name: duplicateTitle }, JOB_GRADES), {})
  assert.match(validateJobGradeRules({ ...grade, id: null, name: duplicateTitle }, JOB_GRADES).name, /already exists/)
  const spaced = await resolveGrade({ name: `New${' '.repeat(100)}Grade`, salary: '12.50' }, {}, resolverOptions)
  assert.deepEqual(spaced.errors, {})
  for (const salary of ['0', '12.501', '-1', '1000000000']) {
    const invalid = await resolveGrade({ name: 'New Grade', salary }, {}, resolverOptions)
    assert.match(invalid.errors.salary.message, /salary/)
  }
})
