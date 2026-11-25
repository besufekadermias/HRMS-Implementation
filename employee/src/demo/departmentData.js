import { DEMO_ATTENDANCE_HISTORY, DEMO_ROSTER, DEMO_HEAD } from './data.js'
import { JOB_GRADES } from '../../../admin/src/demo/workforce.js'
import { createDepartmentEmployeeSchema, employeeRequestKeySchema } from '../utils/validation/departmentEmployeeSchemas.js'

// This store belongs to one preview tab. Live services never read these fixtures.
export function createDemoDepartmentStore() {
  const employees = structuredClone(DEMO_ROSTER)
  const originalIds = new Set(employees.map(employee => employee.employeeId))
  const receipts = new Map()
  const grades = JOB_GRADES.map(grade => ({ ...grade, id: String(grade.id) }))

  function getData(user, today) {
    if (user.role !== 'DEPARTMENT_HEAD' || user.departmentId !== DEMO_HEAD.departmentId ||
      user.employeeId !== DEMO_HEAD.employeeId || user.employmentStatus !== 'ACTIVE') return null
    const members = employees.filter(employee => employee.departmentId === user.departmentId)
      .map(employee => ({
        id: employee.employeeId, serialNumber: employee.serialNumber,
        fullName: employee.fullName, email: employee.email, departmentId: employee.departmentId,
        role: employee.role, employmentStatus: employee.employmentStatus,
        clientRequestId: employee.clientRequestId || null,
      }))
    return {
      department: { id: user.departmentId, name: user.department, headEmployeeId: user.employeeId },
      employees: members, today, timeZone: 'Africa/Addis_Ababa',
      records: members.filter(employee => originalIds.has(employee.id)).flatMap(employee =>
        DEMO_ATTENDANCE_HISTORY.filter(record => record.date < today)
          .map(record => ({ ...record, id: `${employee.id}-${record.id}`, employeeId: employee.id }))),
    }
  }

  function getOptions(user, today) {
    const data = getData(user, today)
    return data && { department: data.department, today, timeZone: data.timeZone,
      grades, canCreateEmployee: data.employees.length < 500, message: data.employees.length < 500 ? null : 'This department has reached the current team limit.' }
  }

  async function createEmployee(user, values, key, today, fail, registerAccount, assertSession) {
    const options = getOptions(user, today)
    if (!options) fail(403, 'DEPARTMENT_ACCESS_DENIED', 'Only the assigned department head can add employees.')
    const parsed = createDepartmentEmployeeSchema(today, grades).safeParse(values)
    if (!parsed.success) fail(422, 'INVALID_EMPLOYEE', 'Correct the employee fields.',
      Object.fromEntries(parsed.error.issues.map(issue => [issue.path[0], issue.message])))
    if (!employeeRequestKeySchema.safeParse(key).success) fail(422, 'INVALID_RECEIPT', 'An employee request key is required.')
    const input = parsed.data
    const attachments = await Promise.all([input.photo, input.educationDocument].map(async file => {
      if (!file) return null
      const bytes = new Uint8Array(await file.arrayBuffer())
      const digest = await crypto.subtle.digest('SHA-256', bytes)
      return { file, bytes, digest: Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('') }
    }))
    const attachmentIdentity = attachment => attachment && ({ name: attachment.file.name,
      type: attachment.file.type, size: attachment.file.size, digest: attachment.digest })
    const fingerprintInput = { ...input, photo: attachmentIdentity(attachments[0]), educationDocument: attachmentIdentity(attachments[1]) }
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(fingerprintInput)))
    const fingerprint = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
    assertSession()
    const receiptId = `${user.id}:${key}`
    const previous = receipts.get(receiptId)
    if (previous) {
      if (previous.fingerprint !== fingerprint) fail(409, 'REQUEST_KEY_REUSED', 'This request key was already used for different employee details.')
      return { ...getData(user, today), createdEmployeeId: previous.employeeId, clientRequestId: key }
    }
    if (employees.filter(employee => employee.departmentId === user.departmentId).length >= 500) fail(403, 'TEAM_LIMIT', 'This department has reached the current team limit.')
    if (employees.some(employee => employee.serialNumber.toLowerCase() === input.serialNumber.toLowerCase())) {
      fail(409, 'DUPLICATE_EMPLOYEE_ID', 'This employee ID is already in use.', { serialNumber: 'This employee ID is already in use.' })
    }
    if (employees.some(employee => employee.email?.toLowerCase() === input.email)) {
      fail(409, 'DUPLICATE_EMAIL', 'This email is already in use.', { email: 'This email is already in use.' })
    }
    const grade = grades.find(item => item.id === input.gradeId)
    const employeeId = `DEMO-EMPLOYEE-${input.serialNumber}`
    const account = {
      id: `DEMO-USER-${input.serialNumber}`, employeeId,
      serialNumber: input.serialNumber, fullName: input.fullName, email: input.email, login: input.email,
      departmentId: user.departmentId, department: user.department,
      role: 'EMPLOYEE', employmentStatus: 'ACTIVE', employmentType: input.employmentType.toUpperCase(),
      grade: grade.name, baseSalary: grade.salary, mustChangePassword: true, passwordChangedAt: null,
    }
    let photoUrl = null
    if (attachments[0]) {
      const { file, bytes } = attachments[0]
      let binary = ''
      for (let index = 0; index < bytes.length; index += 32768) binary += String.fromCharCode(...bytes.subarray(index, index + 32768))
      photoUrl = `data:${file.type};base64,${btoa(binary)}`
    }
    const profile = { gender: input.gender, birthDate: input.birthDate, hiredDate: input.hiredDate,
      qualification: input.qualification || null, photoUrl }
    registerAccount(account, input.temporaryPassword, profile)
    employees.push({ ...account, clientRequestId: key,
      educationDocument: attachmentIdentity(attachments[1]) })
    receipts.set(receiptId, { employeeId, fingerprint })
    return { ...getData(user, today), createdEmployeeId: employeeId, clientRequestId: key }
  }
  return { getData, getOptions, createEmployee }
}
