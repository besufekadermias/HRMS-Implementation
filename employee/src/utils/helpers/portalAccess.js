export function isDepartmentHead(user) {
  return user?.role === 'DEPARTMENT_HEAD' && Boolean(user.departmentId) &&
    user.employmentStatus === 'ACTIVE'
}

export function getHomePath(user) {
  if (!user) return '/login'
  if (user.mustChangePassword) return '/change-password'
  return isDepartmentHead(user) ? '/department' : '/dashboard'
}

export function getPortalRoleLabel(user) {
  return user?.role === 'DEPARTMENT_HEAD' ? 'Head of Department' : 'Employee'
}
