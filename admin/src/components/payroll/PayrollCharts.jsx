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
    <section className="card payroll-trend">
      <div className="section-heading">
        <div>
          <h2>
            <Icon name="trend" /> Payroll Overview
          </h2>
          <p>Gross salary and net pay by month.</p>
        </div>
        <div className="payroll-range" aria-label="Trend period">
          {[6, 12].map((count) => (
            <button
              key={count}
              aria-pressed={length === count}
              onClick={() => setLength(count)}
            >
              {count === 6 ? '6 Months' : '1 Year'}
            </button>
          ))}
        </div>
      </div>
      <div className="payroll-chart-legend">
        <span>
          <i />
          Gross payroll
        </span>
        <span>
          <i />
          Net pay
        </span>
      </div>
      <div
        className="payroll-bars"
        role="img"
        aria-label={`Payroll trend for ${length} months ending ${monthLabel(month)}`}
      >
        {points.map((point) => (
          <div
            className="payroll-bar-column"
            key={point.month}
            title={
              point.run
                ? `${monthLabel(point.month)} · Gross ${formatCurrency(point.gross)} · Net ${formatCurrency(point.net)}`
                : `${monthLabel(point.month)} · No payroll recorded`
            }
          >
            <div className="payroll-bar-space">
              {point.run ? (
                <>
                  <div
                    className="payroll-gross-bar"
                    style={{ height: `${(point.gross / max) * 85}%` }}
                  />
                  <div
                    className="payroll-net-marker"
                    style={{ bottom: `${(point.net / max) * 85}%` }}
                  />
                  <small>{formatCurrency(point.gross)}</small>
                </>
              ) : (
                <span className="payroll-no-point">—</span>
              )}
            </div>
            <span>{monthLabel(point.month, true)}</span>
          </div>
        ))}
      </div>
      <p className="field-hint">
        Months without a recorded payroll are shown as —.
      </p>
    </section>
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
    <section className="card payroll-breakdown">
      <div className="section-heading">
        <div>
          <h2>
            <Icon name="pie" /> {title}
          </h2>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="payroll-breakdown-body">
        <div
          className="payroll-donut"
          style={{
            background: segments.length
              ? `conic-gradient(${segments.join(',')})`
              : '#e7f1f3',
          }}
          role="img"
          aria-label={`${title}: ${formatCurrency(total)}`}
        >
          <div>
            <small>ETB</small>
            <strong>
              {total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </strong>
            <small>Total</small>
          </div>
        </div>
        <ul>
          {visible.map((item, index) => (
            <li key={item.name}>
              <i style={{ background: colors[index % colors.length] }} />
              <span>{item.name}</span>
              <strong>{((item.amount / total) * 100).toFixed(1)}%</strong>
            </li>
          ))}
        </ul>
        {!visible.length && (
          <p className="field-hint">No amounts recorded for this month.</p>
        )}
      </div>
    </section>
  )
}
