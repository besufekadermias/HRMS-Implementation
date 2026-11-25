// Email is the account lookup key. Existing demo/import login IDs remain readable.
export function normalizeAccountLogin(value) {
  const login = typeof value === 'string' ? value.trim() : ''
  return login.includes('@') ? login.toLowerCase() : login
}

export function isAccountEmail(value) {
  return typeof value === 'string' && value.length <= 100 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)
}

export function canAssignDepartmentHead(employee) {
  return isAccountEmail(normalizeAccountLogin(employee.email)) &&
    ['Active', 'On Leave'].includes(employee.status) &&
    employee.portalRole !== 'HR Manager'
}
