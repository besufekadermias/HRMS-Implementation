const labels = {
  GENERATED: 'Generated',
  FORWARDED_TO_FINANCE: 'Forwarded to Finance',
  PAID: 'Paid',
}
export default function PayrollStatus({ status }) {
  return (
    <span className={String.raw`payroll-status payroll-status-${status.toLowerCase()} tw:inline-block tw:text-[10px] tw:font-[600] tw:rounded-[30px] tw:p-[7px_10px] tw:whitespace-nowrap
            tw:tracking-[0.05px] tw:[&.payroll-status-generated]:bg-[#fff2d1]
            tw:[&.payroll-status-generated]:text-[#8a641c]
            tw:[&.payroll-status-forwarded\_to\_finance]:bg-[#e1efff]
            tw:[&.payroll-status-forwarded\_to\_finance]:text-[#3268a7] tw:[&.payroll-status-paid]:bg-[#c9fae9]
            tw:[&.payroll-status-paid]:text-[#087b67] tw:[&.payroll-status-inactive]:bg-[#edf1f3]
            tw:[&.payroll-status-inactive]:text-[#6f818d] `}>
      {labels[status] || status}
    </span>
  )
}
