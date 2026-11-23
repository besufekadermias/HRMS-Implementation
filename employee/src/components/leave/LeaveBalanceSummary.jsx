import { CalendarCheck2, CalendarDays, Clock3 } from 'lucide-react'
import { leaveDateLabel } from '../../utils/helpers/leaveRules.js'

export default function LeaveBalanceSummary({ data }) {
  const { balance, period, settings } = data
  const cards = [
    {
      label: 'Total accrued days',
      value: balance?.accrued,
      detail: 'Entitlement assigned by HR this year',
      Icon: CalendarDays,
      tone: 'blue',
    },
    {
      label: 'Days used this cycle',
      value: balance?.used,
      detail: 'Deducted only upon HR approval',
      Icon: Clock3,
      tone: 'amber',
    },
    {
      label: 'Remaining available balance',
      value: balance?.remaining,
      detail: `Configured balance cap: ${settings.maxBalance} days`,
      Icon: CalendarCheck2,
      tone: 'green',
      featured: true,
    },
  ]
  return (
    <>
      <section
        className={String.raw`leave-balances employee-page:grid employee-page:grid-cols-[repeat(3,_minmax(0,_1fr))] employee-page:gap-[18px]
    employee-page:screen-max-700:grid-cols-[1fr] employee-page:screen-max-700:gap-[12px]`}
        aria-label="Leave balance"
      >
        {cards.map(({ label, value, detail, Icon, tone, featured }) => (
          <article
            key={label}
            className={String.raw`surface leave-balance employee-page:p-[24px] employee-page:[&_h2]:text-[length:11px]
    employee-page:[&_h2]:tracking-[0.5px] employee-page:[&_h2]:uppercase
    employee-page:[&_h2]:text-[color:var(--text-muted)] employee-page:[&_.icon-circle]:w-[38px]
    employee-page:[&_.icon-circle]:h-[38px] employee-page:screen-max-1100:p-[18px]
    employee-page:screen-max-1100:[&_h2]:text-[length:10px] employee-base:min-w-[0]
    employee-base:[border:1px_solid_var(--border)] employee-base:[background:var(--surface)]
    employee-base:rounded-[var(--card-radius)] employee-base:[box-shadow:var(--card-shadow)] ${
      featured
        ? String.raw`leave-balance-featured
    employee-page:[&.leave-balance-featured]:[background:linear-gradient(125deg,_#075e53,_#073e42)]
    employee-page:[&.leave-balance-featured]:[border-color:#07584f]
    employee-page:[&.leave-balance-featured]:text-[color:white]
    employee-page:[&.leave-balance-featured_h2]:text-[color:#a9ddd0]
    employee-page:[&.leave-balance-featured_.leave-caption]:text-[color:#bfdbd7]
    employee-page:[&.leave-balance-featured_.leave-balance-value_span]:text-[color:#bfdbd7]
    employee-page:[&.leave-balance-featured_.icon-circle]:[background:#ffffff15]
    employee-page:[&.leave-balance-featured_.icon-circle]:text-[color:#b8e8ce]`
        : ''
    }`}
          >
            <div className="flex items-center justify-between gap-3">
              <h2>{label}</h2>
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
            </div>
            <p
              className={String.raw`leave-balance-value employee-page:m-[15px_0_9px] employee-page:text-[length:34px] employee-page:font-[700]
    employee-page:leading-[1.2] employee-page:tracking-[-1px] employee-page:[&_span]:text-[length:13px]
    employee-page:[&_span]:font-[500] employee-page:[&_span]:tracking-[0]
    employee-page:screen-max-700:mt-[8px]`}
            >
              {value ?? '—'} <span>{value == null ? 'Not assigned' : 'days'}</span>
            </p>
            <p
              className={String.raw`leave-caption employee-page:text-[color:var(--text-muted)] employee-page:text-[length:11px]
    employee-page:leading-[1.8]`}
            >
              {detail}
            </p>
          </article>
        ))}
      </section>
      <p
        className={String.raw`leave-cycle employee-page:m-[15px_2px_24px] employee-page:text-[length:11px] employee-page:leading-[1.9]
    employee-page:text-[color:var(--text-muted)]`}
      >
        Leave year {period.year} E.C. · {leaveDateLabel(period.start)} –{' '}
        {leaveDateLabel(period.end)}. Unused days expire; renewal on{' '}
        {leaveDateLabel(period.nextStart)} uses HR’s saved entitlement with no carryover.
      </p>
    </>
  )
}
