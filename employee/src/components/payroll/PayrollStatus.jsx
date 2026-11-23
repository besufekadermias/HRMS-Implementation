import { PAYROLL_STATUS_LABELS } from '../../utils/validation/payrollSchemas.js'

export default function PayrollStatus({ status }) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1.5 text-[10px] font-semibold ${status === 'GENERATED' ? String.raw`tone-blue employee-base:text-[color:#4b8397] employee-base:[background:#eaf2f7]` : String.raw`tone-green employee-base:text-[color:#0b8972] employee-base:[background:#e3f5f0]`}`}
    >
      {PAYROLL_STATUS_LABELS[status]}
    </span>
  )
}
