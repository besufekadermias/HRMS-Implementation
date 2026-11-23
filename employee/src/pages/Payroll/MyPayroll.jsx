import { useState } from 'react'
import { FileText, RefreshCw } from 'lucide-react'
import usePayroll from '../../hooks/work/usePayroll.js'
import usePayslipDownload from '../../hooks/work/usePayslipDownload.js'
import SalarySummaryCard from '../../components/payroll/SalarySummaryCard.jsx'
import PayslipTable from '../../components/payroll/PayslipTable.jsx'
import { PAYROLL_STATUS_LABELS } from '../../utils/validation/payrollSchemas.js'
import { payrollMonthLabel } from '../../utils/formatters/payrollFormat.js'

export default function MyPayroll() {
  const payroll = usePayroll()
  const downloads = usePayslipDownload()
  const [month, setMonth] = useState('')
  const [status, setStatus] = useState('')
  const records = payroll.data?.records || []
  const filtered = records.filter(
    (record) => (!month || record.month === month) && (!status || record.status === status),
  )
  return (
    <div className="max-w-[1300px]">
      <div
        className={String.raw`dashboard-intro employee-base:flex employee-base:items-center employee-base:justify-between
    employee-base:gap-[22px] employee-base:mb-[25px] employee-page:screen-max-768:block
    employee-page:screen-max-768:mb-[22px]`}
      >
        <div>
          <p
            className={String.raw`intro-eyebrow employee-base:flex employee-base:items-center employee-base:gap-[11px] employee-base:mb-[10px]
    employee-base:text-[length:10px] employee-base:text-[color:var(--text-muted)]
    employee-page:screen-max-480:gap-[8px] employee-page:screen-max-480:text-[length:9px]`}
          >
            <span
              className={String.raw`eyebrow employee-base:text-[length:10px] employee-base:font-[700] employee-base:tracking-[1.4px]
    employee-base:uppercase employee-base:text-[color:var(--primary)]
    employee-page:screen-max-480:text-[length:9px] employee-page:screen-max-480:tracking-[1.1px]`}
            >
              MY WORKSPACE
            </span>
          </p>
          <h1>My Compensation &amp; Payslips</h1>
          <p
            className={String.raw`intro-description employee-base:mt-[9px] employee-base:text-[length:12px] employee-base:leading-[1.8]
    employee-base:text-[color:var(--text-secondary)]`}
          >
            Review your saved gross earnings, employee deductions, net pay and digital payslips.
          </p>
        </div>
      </div>
      {payroll.error && (
        <div
          className={String.raw`error-notice mb-5 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#b42344] employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
          role="alert"
        >
          <p>{payroll.error}</p>
          {payroll.data && (
            <p className="mt-1">The previously loaded payroll records are shown below.</p>
          )}
          <button
            type="button"
            className="mt-2 font-semibold underline"
            onClick={payroll.refresh}
            disabled={payroll.loading}
          >
            Try Again
          </button>
        </div>
      )}
      {records[0] && <SalarySummaryCard record={records[0]} />}
      <section
        className={String.raw`surface employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)]`}
        aria-labelledby="payroll-history-title"
        aria-busy={payroll.loading}
      >
        <div
          className={String.raw`content-card pb-0 employee-base:p-[22px_23px] employee-page:screen-max-768:p-[20px_17px]`}
        >
          <div
            className={String.raw`section-heading employee-base:flex employee-base:items-start employee-base:justify-between
    employee-base:gap-[12px] employee-base:mb-[20px] employee-base:[&_h2]:flex
    employee-base:[&_h2]:items-center employee-base:[&_h2]:gap-[9px]
    employee-base:[&_h2_svg]:text-[color:var(--primary)] employee-base:[&_p]:mt-[6px]
    employee-base:[&_p]:text-[color:var(--text-muted)] employee-base:[&_p]:text-[length:12px]
    employee-base:[&_p]:leading-[1.5] employee-page:screen-max-768:[&_h2]:text-[length:15px]`}
          >
            <div>
              <h2 id="payroll-history-title">
                <FileText size={19} />
                Monthly Payroll History
              </h2>
              <p>Amounts and deduction labels reflect each saved payroll month.</p>
            </div>
            <button
              className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold text-primary hover:underline"
              type="button"
              onClick={payroll.refresh}
              disabled={payroll.loading}
            >
              <RefreshCw size={14} />
              {payroll.loading ? 'Loading…' : 'Refresh Payroll'}
            </button>
          </div>
          <div
            className={String.raw`payroll-filters employee-base:flex employee-base:flex-wrap employee-base:items-end employee-base:gap-[12px]
    employee-base:mb-[18px] employee-base:[&_>_label]:[flex:0_1_230px] employee-base:[&_>_label]:m-[0]
    employee-base:[&_>_label]:text-[length:11px] employee-base:[&_>_label]:min-w-[0]
    employee-base:[&_select]:block employee-base:[&_select]:mt-[7px] employee-base:[&_select]:min-w-[0]
    employee-base:[&_select]:w-[100%] employee-base:[&_select]:h-[40px]
    employee-base:[&_select]:[border:1px_solid_#d6e4e8] employee-base:[&_select]:rounded-[6px]
    employee-base:[&_select]:p-[9px] employee-base:[&_select]:[background:white]
    employee-base:[&_select]:text-[color:var(--text-secondary)] employee-base:[&_select]:text-[length:12px]
    employee-base:[&_button]:min-h-[40px] employee-base:[&_button]:text-[length:11px]
    employee-page:screen-max-768:[&_>_label]:[flex:1_1_140px]
    employee-page:screen-max-768:[&_select]:text-[length:16px]
    employee-page:screen-max-480:[&_>_button]:w-[100%]`}
          >
            <label htmlFor="payroll-month">
              Payroll month
              <select
                id="payroll-month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                aria-controls="payroll-history-table"
              >
                <option value="">All Months</option>
                {records.map((record) => (
                  <option
                    value={record.month}
                    key={record.id}
                  >
                    {payrollMonthLabel(record.month)}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="payroll-status">
              Status
              <select
                id="payroll-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                aria-controls="payroll-history-table"
              >
                <option value="">All Statuses</option>
                {Object.entries(PAYROLL_STATUS_LABELS).map(([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
              type="button"
              disabled={!month && !status}
              onClick={() => {
                setMonth('')
                setStatus('')
              }}
            >
              Clear Filters
            </button>
          </div>
          {downloads.error && (
            <p
              className={String.raw`error-notice mb-4 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#b42344] employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
              role="alert"
            >
              {downloads.error}
            </p>
          )}
          {downloads.success && (
            <p
              className={String.raw`info-notice mb-4 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#d7ece4]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#166c5b] employee-base:[border-color:#d7ece4] employee-base:[background:#f0faf5]`}
              role="status"
            >
              {downloads.success}
            </p>
          )}
          {payroll.data && (
            <p
              className="mb-4 text-[11px] text-muted"
              role="status"
            >
              {filtered.length} of {records.length} saved payroll records match.
            </p>
          )}
        </div>
        {!payroll.data && payroll.loading ? (
          <p
            className="px-6 pb-6 text-[12px] text-muted"
            role="status"
          >
            Loading your payroll records…
          </p>
        ) : payroll.data && filtered.length ? (
          <PayslipTable
            records={filtered}
            downloads={downloads}
          />
        ) : (
          payroll.data && (
            <p
              className="px-6 pb-6 text-[12px] text-muted"
              role="status"
            >
              {records.length
                ? 'No payroll records match these filters.'
                : 'No payroll records are available yet.'}
            </p>
          )
        )}
      </section>
      <p className="mt-5 text-[11px] leading-[1.8] text-muted">
        Payroll status is supplied by HR/Finance. Generated and Forwarded to Finance do not confirm
        that payment has been made.
      </p>
    </div>
  )
}
