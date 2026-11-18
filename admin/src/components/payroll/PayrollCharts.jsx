import Card from '../common/Card.jsx'
import { useState } from 'react'
import Icon from '../common/Icon.jsx'
import {
  monthLabel,
  summarizePayroll,
} from '../../services/operations/payrollCalculations.js'
import formatCurrency from '../../utils/formatters/formatCurrency.js'

export function PayrollTrend({ runs, month }) {
  const [length, setLength] = useState(6)
  const cursor = new Date(`${month}-01T12:00:00Z`)
  const points = []
  for (let index = 0; index < length; index++) {
    const period = cursor.toISOString().slice(0, 7)
    const run = runs.find((item) => item.month === period)
    points.unshift({ month: period, run, ...summarizePayroll(run) })
    cursor.setUTCMonth(cursor.getUTCMonth() - 1)
  }
  const max = Math.max(1, ...points.map((point) => point.gross))
  return (
    <Card className="payroll-trend tw:[&>.payroll-field-hint]:block tw:[&>.payroll-field-hint]:m-[0_24px_16px]">
      <div className="payroll-section-heading tw:flex tw:justify-between tw:items-start tw:[&_h2]:flex tw:[&_h2]:items-center
          tw:[&_h2]:gap-[9px] tw:[&_p]:leading-[1.5]">
        <div>
          <h2>
            <Icon name="trend" /> Payroll Overview
          </h2>
          <p>Gross salary and net pay by month.</p>
        </div>
        <div className="payroll-range tw:flex tw:p-[3px] tw:[border:1px_solid_#dcecf0] tw:rounded-[8px] tw:whitespace-nowrap" aria-label="Trend period">
          {[6, 12].map((count) => (
            <button
              className="tw:[border:0] tw:bg-transparent tw:p-[6px_10px] tw:text-[12px] tw:rounded-[5px] tw:aria-pressed:bg-[#078775]
          tw:aria-pressed:text-white tw:aria-pressed:[box-shadow:0_2px_4px_#08776625]"
              key={count}
              aria-pressed={length === count}
              onClick={() => setLength(count)}
            >
              {count === 6 ? '6 Months' : '1 Year'}
            </button>
          ))}
        </div>
      </div>
      <div className="payroll-chart-legend tw:flex tw:justify-end tw:gap-[17px] tw:p-[13px_25px_0] tw:text-[#638694] tw:text-[11px]
          tw:[@media(width<=650px)]:pr-[16px]">
        <span className="tw:flex tw:items-center tw:gap-[7px]">
          <i className="tw:w-[9px] tw:h-[9px] tw:rounded-full tw:bg-[#30ccb0]" />
          Gross payroll
        </span>
        <span className="tw:flex tw:items-center tw:gap-[7px]">
          <i className="tw:w-[9px] tw:h-[9px] tw:rounded-full tw:bg-[#075461]" />
          Net pay
        </span>
      </div>
      <div
        className="payroll-bars tw:flex tw:gap-[12px] tw:p-[8px_24px_15px] tw:h-[230px] tw:overflow-x-auto
          tw:[@media(width<=650px)]:px-[13px] tw:[@media(width<=650px)]:gap-[7px]"
        role="img"
        aria-label={`Payroll trend for ${length} months ending ${monthLabel(month)}`}
      >
        {points.map((point) => (
          <div
            className="payroll-bar-column tw:flex-1 tw:min-w-[46px] tw:flex tw:flex-col tw:text-center tw:[&>span]:text-[10px]
          tw:[&>span]:text-[#446c82] tw:[&>span]:pt-[11px] tw:[&>span]:whitespace-nowrap"
            key={point.month}
            title={
              point.run
                ? `${monthLabel(point.month)} · Gross ${formatCurrency(point.gross)} · Net ${formatCurrency(point.net)}`
                : `${monthLabel(point.month)} · No payroll recorded`
            }
          >
            <div className="payroll-bar-space tw:flex-1 tw:relative tw:flex tw:items-end tw:justify-center tw:[border-bottom:1px_solid_#dcebef]
          tw:[background:repeating-linear-gradient(to_top,_transparent_0,_transparent_42px,_#eef5f6_43px,_transparent_44px)]">
              {point.run ? (
                <>
                  <div
                    className="payroll-gross-bar tw:[background:linear-gradient(0deg,_#27c9ad,_#65e4d0)] tw:rounded-[5px_5px_0_0] tw:w-[64%]
          tw:min-h-[2px]"
                    style={{ height: `${(point.gross / max) * 85}%` }}
                  />
                  <div
                    className="payroll-net-marker tw:absolute tw:h-[3px] tw:w-[78%] tw:bg-[#075563] tw:rounded-[2px] tw:after:content-['']
          tw:after:block tw:after:w-[8px] tw:after:h-[8px] tw:after:bg-[#075563] tw:after:rounded-full
          tw:after:m-[-2px_auto]"
                    style={{ bottom: `${(point.net / max) * 85}%` }}
                  />
                  <small className="tw:absolute tw:top-0 tw:text-[10px] tw:text-[#315b68] tw:whitespace-nowrap">{formatCurrency(point.gross)}</small>
                </>
              ) : (
                <span className="payroll-no-point tw:self-center tw:text-[#a4bdc6]">—</span>
              )}
            </div>
            <span>{monthLabel(point.month, true)}</span>
          </div>
        ))}
      </div>
      <p className="payroll-field-hint tw:block tw:text-[10px] tw:font-normal tw:text-[var(--text-muted)] tw:mt-[7px]">
        Months without a recorded payroll are shown as —.
      </p>
    </Card>
  )
}

export function PayrollBreakdown({
  title = 'Payroll by Department',
  items,
  total,
  subtitle = 'Gross payroll across departments',
}) {
  const colors = [
    '#0dbba0',
    '#438ef5',
    '#b786ed',
    '#ffbd55',
    '#54c8d6',
    '#8a9bb3',
  ]
  const visible = items.filter((item) => item.amount > 0)
  const segments = visible.map((item, index) => {
    const preceding = visible
      .slice(0, index)
      .reduce((sum, entry) => sum + entry.amount, 0)
    const start = total ? (preceding / total) * 100 : 0
    const end = total ? ((preceding + item.amount) / total) * 100 : 0
    return `${colors[index % colors.length]} ${start}% ${end}%`
  })
  return (
    <Card className="payroll-breakdown">
      <div className="payroll-section-heading tw:flex tw:justify-between tw:items-start tw:[&_h2]:flex tw:[&_h2]:items-center
          tw:[&_h2]:gap-[9px] tw:[&_p]:leading-[1.5]">
        <div>
          <h2>
            <Icon name="pie" /> {title}
          </h2>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="payroll-breakdown-body tw:p-[24px_20px] tw:flex tw:gap-[21px] tw:items-center tw:flex-wrap
          tw:[@media(width<=1250px)]:justify-center">
        <div
          className="payroll-donut tw:w-[156px] tw:h-[156px] tw:p-[25px] tw:rounded-full tw:flex-[0_0_156px]"
          style={{
            background: segments.length
              ? `conic-gradient(${segments.join(',')})`
              : '#e7f1f3',
          }}
          role="img"
          aria-label={`${title}: ${formatCurrency(total)}`}
        >
          <div className="tw:bg-white tw:w-full tw:h-full tw:rounded-full tw:flex tw:items-center tw:justify-center tw:flex-col">
            <small className="tw:text-[11px] tw:text-[#507887]">ETB</small>
            <strong className="tw:text-[21px] tw:text-[#173e4e] tw:tracking-[-0.4px]">
              {total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </strong>
            <small className="tw:text-[11px] tw:text-[#507887]">Total</small>
          </div>
        </div>
        <ul className="tw:list-none tw:p-0 tw:m-0 tw:flex-1 tw:min-w-[135px] tw:grid tw:gap-[12px]
          tw:[@media(width<=1250px)]:max-w-[400px]">
          {visible.map((item, index) => (
            <li className="tw:flex tw:items-baseline tw:gap-[8px] tw:text-[11px] tw:leading-[1.45]" key={item.name}>
              <i className="tw:w-[8px] tw:h-[8px] tw:rounded-full tw:shrink-0" style={{ background: colors[index % colors.length] }} />
              <span className="tw:flex-1">{item.name}</span>
              <strong className="tw:font-[600] tw:whitespace-nowrap">{((item.amount / total) * 100).toFixed(1)}%</strong>
            </li>
          ))}
        </ul>
        {!visible.length && (
          <p className="payroll-field-hint tw:block tw:text-[10px] tw:font-normal tw:text-[var(--text-muted)] tw:mt-[7px]">No amounts recorded for this month.</p>
        )}
      </div>
    </Card>
  )
}
