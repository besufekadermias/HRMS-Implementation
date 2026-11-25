import { z } from 'zod'
import { attendanceDateSchema, attendanceRecordSchema, attendanceTimeZoneSchema } from './attendanceSchemas.js'
import { isDepartmentHead } from '../helpers/portalAccess.js'

const id = z.string().min(1).max(100)
const department = z.object({ id, name: z.string().min(1).max(200), headEmployeeId: id })
const member = z.object({
  id, serialNumber: z.string().min(1).max(100), fullName: z.string().min(1).max(200),
  departmentId: id, email: z.string().max(150).nullable(),
  role: z.enum(['EMPLOYEE', 'DEPARTMENT_HEAD', 'HR_MANAGER']),
  employmentStatus: z.enum(['ACTIVE', 'ON_LEAVE', 'ONBOARDING', 'INACTIVE', 'TRANSFERRED', 'RETIRED', 'SUSPENDED', 'TERMINATED']),
  clientRequestId: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/).nullable().optional().default(null),
})
export const departmentTeamSchema = z.object({ department, employees: z.array(member).max(500) })
export const departmentAttendanceSchema = departmentTeamSchema.extend({
  today: attendanceDateSchema,
  timeZone: attendanceTimeZoneSchema,
  records: z.array(attendanceRecordSchema.and(z.object({ employeeId: id }))).max(15000),
})

// Reject an inconsistent response; pages never filter an organization-wide payload into a team.
export function readDepartmentData(schema, value, user) {
  if (!isDepartmentHead(user) || user.mustChangePassword) {
    throw new Error('Department access requires an assigned head who has completed password setup.')
  }
  const result = schema.safeParse(value)
  if (!result.success) throw new Error('The service returned invalid department data.', { cause: result.error })
  const data = result.data
  if (data.department.id !== user.departmentId || data.department.headEmployeeId !== user.employeeId) {
    throw new Error('Your department assignment has changed. Sign in again or contact HR.')
  }
  const members = new Set()
  for (const employee of data.employees) {
    if (employee.departmentId !== user.departmentId || members.has(employee.id) ||
      (employee.role === 'DEPARTMENT_HEAD' && employee.id !== user.employeeId) ||
      (employee.id === user.employeeId && employee.role !== 'DEPARTMENT_HEAD')) {
      throw new Error('The service returned inconsistent department members. Contact HR.')
    }
    members.add(employee.id)
  }
  if (!members.has(user.employeeId)) throw new Error('The department head is missing from the team. Contact HR.')
  const workdays = new Set()
  const recordIds = new Set()
  for (const record of data.records || []) {
    const key = `${record.employeeId}:${record.date}`
    if (!members.has(record.employeeId) || workdays.has(key) || recordIds.has(record.id) || record.date > data.today) {
      throw new Error('The service returned inconsistent team attendance. Contact HR.')
    }
    workdays.add(key)
    recordIds.add(record.id)
  }
  return data
}
