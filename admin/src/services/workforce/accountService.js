import { canAssignDepartmentHead, isAccountEmail, normalizeAccountLogin } from '../../utils/helpers/accountIdentity.js'

// The department assignment is authoritative; a role label alone grants no team access.
export function synchronizeDepartmentAccounts(departments, employees) {
  const emails = new Set()
  for (const employee of employees) {
    const email = normalizeAccountLogin(employee.email)
    if (!isAccountEmail(email)) continue
    if (emails.has(email)) throw new Error(`This email is already assigned to another employee: ${email}`)
    emails.add(email)
  }
  const nextDepartments = departments.map((department) => {
    const head = employees.find((employee) => employee.id === department.headId)
    const validHead = department.status === 'Active' && head &&
      head.department === department.name && canAssignDepartmentHead(head)
    return { ...department, headId: validHead ? head.id : '' }
  })
  const headIds = new Set(nextDepartments.map((department) => department.headId).filter(Boolean))
  const nextEmployees = employees.map((employee) => ({
    ...employee,
    email: normalizeAccountLogin(employee.email),
    portalRole: headIds.has(employee.id)
      ? 'Head of Department'
      : employee.portalRole === 'Head of Department' ? 'Employee' : employee.portalRole,
  }))
  return { departments: nextDepartments, employees: nextEmployees }
}

// Used by the employee editor. Replacing an existing head is an explicit department action.
export function saveEmployeeAccount(departments, employees, employee, originalId) {
  if (originalId && !employees.some((item) => item.id === originalId)) {
    throw new Error('Employee not found.')
  }
  const account = { ...employee, email: normalizeAccountLogin(employee.email) }
  const nextEmployees = originalId
    ? employees.map((item) => item.id === originalId ? account : item)
    : [account, ...employees]
  let nextDepartments = departments.map((department) => ({
    ...department,
    headId: department.headId && department.headId === originalId ? account.id : department.headId,
  }))

  if (account.portalRole === 'Head of Department') {
    if (!canAssignDepartmentHead(account)) {
      throw new Error('A department head needs a registered email and an Active or On Leave employment status.')
    }
    const department = nextDepartments.find((item) => item.name === account.department)
    if (!department || department.status !== 'Active') {
      throw new Error('Choose an active department for this head.')
    }
    if (department.headId && department.headId !== account.id) {
      throw new Error('This department already has a head. Replace the head from Departments.')
    }
    nextDepartments = nextDepartments.map((item) => ({
      ...item,
      headId: item.id === department.id ? account.id : item.headId === account.id ? '' : item.headId,
    }))
  } else {
    nextDepartments = nextDepartments.map((department) => ({
      ...department,
      headId: department.headId === account.id ? '' : department.headId,
    }))
  }
  return synchronizeDepartmentAccounts(nextDepartments, nextEmployees)
}
