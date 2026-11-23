import { payrollMoney } from '../../utils/formatters/payrollFormat.js'

export default function DeductionBreakdown({ record }) {
  const rows = [
    ['Gross salary', record.gross],
    [record.incomeTaxLabel, record.incomeTax],
    [record.pensionLabel, record.pension],
    ...record.deductionItems.map((item) => [item.name, item.amount]),
    ['Other deductions total', record.otherDeductions],
    ['Net pay', record.net],
  ]
  return (
    <>
      <dl
        className={String.raw`payslip-amounts employee-base:[border-top:1px_solid_var(--border)] employee-base:[&_>_div]:flex
    employee-base:[&_>_div]:justify-between employee-base:[&_>_div]:gap-[20px]
    employee-base:[&_>_div]:p-[15px_10px] employee-base:[&_>_div]:[border-bottom:1px_solid_var(--border)]
    employee-base:[&_>_div]:text-[length:13px] employee-base:[&_>_div]:leading-[1.7]
    employee-base:[&_dt]:text-[color:var(--text-secondary)] employee-base:[&_dt]:[overflow-wrap:anywhere]
    employee-base:[&_dd]:font-[600] employee-base:[&_dd]:whitespace-nowrap
    employee-base:[&_.payslip-net]:[background:#edf8f3]
    employee-base:[&_.payslip-net]:text-[color:var(--primary)] employee-base:[&_.payslip-net]:font-[700]
    employee-page:screen-max-480:[&_>_div]:text-[length:12px] employee-page:screen-max-480:[&_>_div]:pl-[0]
    employee-page:screen-max-480:[&_>_div]:pr-[0] employee-page:screen-max-480:[&_>_div]:gap-[12px]`}
      >
        {rows.map(([label, amount], index) => (
          <div
            key={`${index}:${label}`}
            className={
              index === rows.length - 1
                ? String.raw`payslip-net employee-base:[&_dd]:text-[length:17px]`
                : ''
            }
          >
            <dt>{label}</dt>
            <dd>{payrollMoney(amount)}</dd>
          </div>
        ))}
      </dl>
      <p
        className={String.raw`info-notice mt-5 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#d7ece4]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#166c5b] employee-base:[border-color:#d7ece4] employee-base:[background:#f0faf5]`}
      >
        Employer pension: <strong>{payrollMoney(record.employerPension)}</strong>. This amount is
        separate from employee deductions and does not reduce your net pay.
      </p>
    </>
  )
}
