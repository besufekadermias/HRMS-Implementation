const labels = {
  GENERATED: 'Generated',
  FORWARDED_TO_FINANCE: 'Forwarded to Finance',
  PAID: 'Paid',
}
export default function PayrollStatus({ status }) {
  return (
    <span className={`payroll-status payroll-status-${status.toLowerCase()}`}>
      {labels[status] || status}
    </span>
  )
}
