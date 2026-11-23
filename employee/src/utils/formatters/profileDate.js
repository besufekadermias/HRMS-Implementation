export function formatProfileDate(value) {
  return value
    ? new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(`${value}T00:00:00Z`))
    : 'Not provided'
}
export function formatEmploymentLabel(value) {
  const labels = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    ON_LEAVE: 'On Leave',
    ONBOARDING: 'Onboarding',
    PERMANENT: 'Permanent',
    CONTRACT: 'Contract',
    TEMPORARY: 'Temporary',
    EMPLOYEE: 'Employee',
    DEPARTMENT_HEAD: 'Head of Department',
  }
  return labels[value] || value || 'Not assigned'
}
