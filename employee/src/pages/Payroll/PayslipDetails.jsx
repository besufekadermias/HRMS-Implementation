import { ArrowLeft, Download, FileText, RefreshCw } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import usePayroll from '../../hooks/work/usePayroll.js'
import usePayslipDownload from '../../hooks/work/usePayslipDownload.js'
import PayrollStatus from '../../components/payroll/PayrollStatus.jsx'
import DeductionBreakdown from '../../components/payroll/DeductionBreakdown.jsx'
import { payrollDateTime, payrollMonthLabel } from '../../utils/formatters/payrollFormat.js'

export default function PayslipDetails() {
  const { runId } = useParams()
  const { data: record, loading, error, refresh } = usePayroll(runId)
  const downloads = usePayslipDownload()
  return (
    <div className="max-w-[820px]">
      <Link
        to="/payroll"
        className="mb-5 inline-flex items-center gap-2 text-[12px] font-semibold text-primary"
      >
        <ArrowLeft size={16} />
        Back to My Payroll
      </Link>
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
              MY PAYSLIP
            </span>
          </p>
          <h1>Employee Payslip</h1>
          <p
            className={String.raw`intro-description employee-base:mt-[9px] employee-base:text-[length:12px] employee-base:leading-[1.8]
    employee-base:text-[color:var(--text-secondary)]`}
          >
            {record ? payrollMonthLabel(record.month) : 'Your saved monthly payroll statement.'}
          </p>
        </div>
      </div>
      {error && (
        <div
          className={String.raw`error-notice mb-5 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#b42344] employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
          role="alert"
        >
          <p>{error}</p>
          {record && <p className="mt-1">The previously loaded payslip is shown below.</p>}
          <button
            type="button"
            className="mt-2 font-semibold underline"
            onClick={refresh}
            disabled={loading}
          >
            Try Again
          </button>
        </div>
      )}
      {!record && loading && (
        <section
          className={String.raw`surface content-card employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:p-[22px_23px]
    employee-page:screen-max-768:p-[20px_17px]`}
        >
          <p
            role="status"
            className="text-[12px] text-muted"
          >
            Loading your payslip…
          </p>
        </section>
      )}
      {record && (
        <section
          className={String.raw`surface content-card employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:p-[22px_23px]
    employee-page:screen-max-768:p-[20px_17px]`}
          aria-labelledby="payslip-person-title"
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
              <h2 id="payslip-person-title">
                <FileText size={19} />
                {record.employee.fullName}
              </h2>
              <p>
                {record.employee.department || 'Department not provided'} · ID:{' '}
                {record.employee.serialNumber || 'Not provided'}
              </p>
            </div>
            <PayrollStatus status={record.status} />
          </div>
          <DeductionBreakdown record={record} />
          <dl
            className={String.raw`detail-grid employee-base:grid employee-base:grid-cols-[repeat(2,_minmax(0,_1fr))] employee-base:gap-[22px]
    employee-base:mt-[22px] employee-base:[&_dt]:text-[length:11px]
    employee-base:[&_dt]:text-[color:var(--text-muted)] employee-base:[&_dd]:mt-[7px]
    employee-base:[&_dd]:text-[length:13px] employee-base:[&_dd]:font-[600]
    employee-base:[&_dd]:[overflow-wrap:anywhere] employee-page:screen-max-480:grid-cols-[minmax(0,_1fr)]
    employee-page:screen-max-480:gap-[19px]`}
          >
            <div>
              <dt>Payroll record</dt>
              <dd>{record.id}</dd>
            </div>
            <div>
              <dt>Payroll month</dt>
              <dd>{payrollMonthLabel(record.month)}</dd>
            </div>
            <div>
              <dt>Generated · EAT</dt>
              <dd>{payrollDateTime(record.generatedAt)}</dd>
            </div>
            <div>
              <dt>Forwarded to Finance · EAT</dt>
              <dd>{payrollDateTime(record.forwardedAt)}</dd>
            </div>
          </dl>
          {downloads.error && (
            <p
              className={String.raw`error-notice mt-5 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#b42344] employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
              role="alert"
            >
              {downloads.error}
            </p>
          )}
          {downloads.success && (
            <p
              className={String.raw`info-notice mt-5 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#d7ece4]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#166c5b] employee-base:[border-color:#d7ece4] employee-base:[background:#f0faf5]`}
              role="status"
            >
              {downloads.success}
            </p>
          )}
          {!record.canDownload && (
            <p
              className={String.raw`warning-notice mt-5 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f1e2bd]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#9b650e] employee-base:[border-color:#f1e2bd] employee-base:[background:#fff8e8]`}
            >
              This payslip is currently unavailable for download. Contact HR.
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-border pt-5">
            <button
              className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
              type="button"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh Payslip
            </button>
            <button
              className={String.raw`primary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
              type="button"
              onClick={() => downloads.download(record)}
              disabled={!!downloads.busyId || !record.canDownload}
            >
              <Download size={17} />
              {downloads.busyId ? 'Downloading…' : 'Download Payslip'}
            </button>
          </div>
        </section>
      )}
      {record && (
        <p className="mt-4 text-[11px] leading-[1.8] text-muted">
          This statement reflects the saved payroll record. Generated or forwarded payroll does not
          confirm payment.
        </p>
      )}
    </div>
  )
}
