import api from '../api/api.js'
import { departmentAttendanceSchema, departmentTeamSchema, readDepartmentData } from '../../utils/validation/departmentSchemas.js'
import {
  departmentEmployeeCreatedSchema, departmentEmployeeInputSchema, employeeRequestKeySchema,
  matchesCreatedEmployee, readDepartmentEmployeeOptions,
} from '../../utils/validation/departmentEmployeeSchemas.js'

export async function loadDepartmentTeam(user, signal) {
  const { data } = await api.get('/department-head/team', { signal })
  return readDepartmentData(departmentTeamSchema, data, user)
}

export async function loadDepartmentAttendance(user, signal) {
  const { data } = await api.get('/department-head/attendance', { signal, params: { days: 30 } })
  const result = readDepartmentData(departmentAttendanceSchema, data, user)
  return { ...result, records: result.records.sort((a, b) => b.date.localeCompare(a.date) || a.employeeId.localeCompare(b.employeeId)) }
}

export async function loadDepartmentEmployeeOptions(user, signal) {
  const { data } = await api.get('/department-head/employees/options', { signal })
  return readDepartmentEmployeeOptions(data, user)
}

export async function createDepartmentEmployee(user, values, key) {
  const input = departmentEmployeeInputSchema.parse(values)
  const receipt = employeeRequestKeySchema.parse(key)
  const { photo, educationDocument, ...fields } = input
  let body = fields
  if (photo || educationDocument) {
    body = new FormData()
    body.append('employee', JSON.stringify(fields))
    if (photo) body.append('photo', photo)
    if (educationDocument) body.append('educationDocument', educationDocument)
  }
  const { data } = await api.post('/department-head/employees', body, {
    headers: { 'Idempotency-Key': receipt },
  })
  const result = readDepartmentData(departmentEmployeeCreatedSchema, data, user)
  const employee = result.employees.find(member => member.id === result.createdEmployeeId)
  if (result.clientRequestId !== receipt || !employee || !matchesCreatedEmployee(employee, input, receipt)) {
    throw new Error('The employee creation was not confirmed. Refresh your team before retrying.')
  }
  return employee
}
