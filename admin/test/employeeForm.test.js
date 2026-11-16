import assert from 'node:assert/strict'
import test from 'node:test'
import { zodResolver } from '@hookform/resolvers/zod'
import { INITIAL_EMPLOYEES, INITIAL_DEPARTMENTS, JOB_GRADES } from '../src/utils/constants/constants.js'
import { getEmployeeSchema } from '../src/utils/validation/workforceSchemas.js'
import { validateEmployeeRules } from '../src/utils/validation/validators.js'

const employee = {
  ...INITIAL_EMPLOYEES[0],
  gender: 'Male', birthDate: '1990-01-01', employmentType: 'Permanent', portalRole: 'Employee',
}
const resolverOptions = { fields: {}, shouldUseNativeValidation: false }

test('the employee resolver requires an initial password only when creating', async () => {
  const createResolver = zodResolver(getEmployeeSchema(), undefined, { raw: true })
  const create = await createResolver(employee, {}, resolverOptions)
  assert.equal(create.errors.temporaryPassword.message, 'Use at least 8 characters.')
  assert.deepEqual(create.values, {})

  const editResolver = zodResolver(getEmployeeSchema({ originalId: employee.id }), undefined, { raw: true })
  const edit = await editResolver(employee, {}, resolverOptions)
  assert.deepEqual(edit.errors, {})
  assert.equal(edit.values.id, employee.id)
})

test('the raw resolver keeps uploaded files, photo previews and optional fields', async () => {
  const file = new File(['Education record'], 'education.pdf', { type: 'application/pdf' })
  const values = {
    ...employee, name: ` ${employee.name} `, qualification: 'BSc',
    temporaryPassword: 'valid-password',
    photo: { name: 'photo.png', dataUrl: 'data:image/png;base64,AA==' },
    educationDocument: { name: file.name, size: file.size, file },
  }
  const resolve = zodResolver(getEmployeeSchema(), undefined, { raw: true })
  const result = await resolve(values, {}, resolverOptions)
  assert.deepEqual(result.errors, {})
  assert.equal(result.values.name, values.name)
  assert.equal(result.values.qualification, 'BSc')
  assert.equal(result.values.photo, values.photo)
  assert.equal(result.values.educationDocument.file, file)
})

test('business checks retain duplicate detection and allow an unchanged edit', () => {
  const options = { departments: INITIAL_DEPARTMENTS.map(item => item.name), grades: JOB_GRADES }
  assert.deepEqual(validateEmployeeRules(employee, [employee], employee.id, options), {})
  const duplicate = validateEmployeeRules({ ...employee, id: employee.id.toLowerCase(), email: employee.email.toUpperCase() }, [employee], null, options)
  assert.equal(duplicate.id, 'This employee ID is already in use.')
  assert.equal(duplicate.email, 'This email or login ID is already in use.')
})

test('business checks reject unavailable departments, grades and invalid date ordering', () => {
  const errors = validateEmployeeRules({ ...employee, hiredDate: '1989-01-01' }, [], employee.id, { departments: [], grades: [] })
  assert.equal(errors.department, 'Select a department.')
  assert.equal(errors.grade, 'Select a civil job grade.')
  assert.equal(errors.hiredDate, 'Hired date cannot be before birth date.')
})
