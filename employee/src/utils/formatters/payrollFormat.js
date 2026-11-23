export function payrollMoney(value) {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
export function payrollMonthLabel(value) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}-01T12:00:00Z`))
}
export function payrollDateTime(value) {
  return value
    ? new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Addis_Ababa',
      }).format(new Date(value))
    : 'Not provided'
}
export function payslipFilename(record) {
  const serial = record.employee.serialNumber.replace(/[^A-Za-z0-9_-]/g, '_') || 'employee'
  return `payslip-${record.month}-${serial}.pdf`
}
