import { Banknote, CircleDollarSign, Landmark, Wallet } from 'lucide-react'
import { payrollMoney, payrollMonthLabel } from '../../utils/formatters/payrollFormat.js'

export default function SalarySummaryCard({ record }) {
  const values = [
    ['Gross salary', record.gross, Banknote, 'blue', 'Saved payroll earnings'],
    [
      'Employee deductions',
      record.gross - record.net,
      CircleDollarSign,
      'amber',
      'Tax, pension and other deductions',
    ],
    ['Net pay', record.net, Wallet, 'green', 'After employee deductions'],
    [
      'Employer pension',
      record.employerPension,
      Landmark,
      'lavender',
      'Separate from employee deductions',
    ],
  ]
  return (
    <section
      aria-label="Latest saved payroll summary"
      className="mb-5"
    >
      <p className="mb-3 text-[11px] text-muted">
        Latest saved payroll ·{' '}
        <strong className="font-semibold">{payrollMonthLabel(record.month)}</strong>
      </p>
      <div
        className={String.raw`payroll-summary-grid employee-base:grid employee-base:grid-cols-[repeat(4,_minmax(0,_1fr))]
    employee-base:gap-[15px] employee-page:screen-max-1200:grid-cols-[repeat(2,_minmax(0,_1fr))]
    employee-page:screen-max-480:gap-[10px]`}
      >
        {values.map(([label, value, Icon, tone, detail]) => (
          <div
            className={String.raw`surface payroll-summary-card employee-base:flex employee-base:items-start employee-base:gap-[12px]
    employee-base:p-[19px_16px] employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:[&_.icon-circle]:w-[36px]
    employee-base:[&_.icon-circle]:h-[36px] employee-page:screen-max-480:block
    employee-page:screen-max-480:p-[17px_13px] employee-page:screen-max-480:[&_.icon-circle]:mb-[10px]
    employee-page:screen-max-480:[&_.stat-label]:mb-[5px]`}
            key={label}
          >
            <span
              className={String.raw`employee-base:w-[46px] employee-base:h-[46px] employee-base:inline-flex employee-base:items-center
    employee-base:justify-center employee-base:rounded-[50%] employee-base:[flex-shrink:0]
    employee-base:[&.tone-green]:text-[color:#0b8972] employee-base:[&.tone-green]:[background:#e3f5f0]
    employee-base:[&.tone-amber]:text-[color:#a36b0d] employee-base:[&.tone-amber]:[background:#fff5dd]
    employee-base:[&.tone-blue]:text-[color:#4b8397] employee-base:[&.tone-blue]:[background:#eaf2f7]
    employee-base:[&.tone-lavender]:text-[color:#7566ba] employee-base:[&.tone-lavender]:[background:#f0edfb]
    employee-base:[&.tone-rose]:text-[color:#a73955] employee-base:[&.tone-rose]:[background:#fdeaf0]
    icon-circle tone-${tone}`}
            >
              <Icon size={21} />
            </span>
            <div className="min-w-0">
              <h2
                className={String.raw`stat-label employee-base:m-[3px_0_9px] employee-base:text-[length:11px] employee-base:font-[400]
    employee-base:text-[color:var(--text-secondary)] employee-base:tracking-[0] employee-base:leading-[1.4]
    employee-page:screen-max-768:text-[length:10px] employee-page:screen-max-480:text-[length:11px]
    employee-page:screen-max-480:mt-[0] employee-page:screen-max-480:mb-[5px]`}
              >
                {label}
              </h2>
              <p
                className={String.raw`payroll-summary-value employee-base:text-[length:clamp(16px,_1.25vw,_22px)] employee-base:leading-[1.5]
    employee-base:font-[650] employee-base:tracking-[-0.3px] employee-base:[overflow-wrap:anywhere]
    employee-page:screen-max-768:text-[length:18px] employee-page:screen-max-480:text-[length:16px]`}
              >
                {payrollMoney(value)}
              </p>
              <p className="mt-2 text-[10px] leading-[1.6] text-muted">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
