import { useState } from 'react'
import { FileText, Plus, RefreshCw } from 'lucide-react'
import useReports from '../../hooks/growth/useReports.js'
import ReportSubmissionForm from '../../components/reports/ReportSubmissionForm.jsx'
import ReportDetailsModal from '../../components/reports/ReportDetailsModal.jsx'
import ReportHistoryTable from '../../components/reports/ReportHistoryTable.jsx'
import { useEmployeeStore } from '../../store/index.js'

export default function MyReports() {
  const { data, error, loading, refresh, save } = useReports()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [success, setSuccess] = useState('')
  const busy = useEmployeeStore(
    (state) =>
      state.reportBusy ||
      state.securityBusy ||
      state.profileBusy ||
      state.attendanceBusy ||
      state.leaveBusy,
  )
  async function submit(values, key) {
    const record = await save(values, key)
    setSuccess(`Report ${record.id} submitted to HR management and saved in your history.`)
  }
  const viewed = data?.records.find((record) => record.id === selected)
  return (
    <>
      <section
        className={String.raw`career-intro employee-page:flex employee-page:items-center employee-page:gap-[14px] employee-page:mb-[26px]
    employee-page:[&_>_div]:[flex:1] employee-page:[&_>_div]:min-w-[0]
    employee-page:[&_>_.icon-circle]:w-[49px] employee-page:[&_>_.icon-circle]:h-[49px]
    employee-page:[&_h1]:text-[length:clamp(23px,_1.85vw,_29px)] employee-page:[&_>_button]:[flex-shrink:0]
    employee-page:screen-max-700:flex-wrap employee-page:screen-max-700:items-start
    employee-page:screen-max-700:[&_>_button]:ml-[auto]
    employee-page:screen-max-700:[&_>_.icon-circle]:w-[40px]
    employee-page:screen-max-700:[&_>_.icon-circle]:h-[40px]
    employee-page:screen-max-700:[&_>_div]:[flex:1_1_calc(100%_-_54px)]`}
      >
        <span
          className={String.raw`icon-circle tone-blue employee-base:w-[46px] employee-base:h-[46px] employee-base:inline-flex
    employee-base:items-center employee-base:justify-center employee-base:rounded-[50%]
    employee-base:[flex-shrink:0] employee-base:text-[color:#4b8397] employee-base:[background:#eaf2f7]`}
        >
          <FileText size={26} />
        </span>
        <div>
          <p
            className={String.raw`eyebrow mb-2 employee-base:text-[length:10px] employee-base:font-[700] employee-base:tracking-[1.4px]
    employee-base:uppercase employee-base:text-[color:var(--primary)]
    employee-page:screen-max-480:text-[length:9px] employee-page:screen-max-480:tracking-[1.1px]`}
          >
            EMPLOYEE SERVICES
          </p>
          <h1>Submit Reports to HR</h1>
          <p
            className={String.raw`intro-description employee-base:mt-[9px] employee-base:text-[length:12px] employee-base:leading-[1.8]
    employee-base:text-[color:var(--text-secondary)]`}
          >
            Send findings, recommendations, and document links to HR management.
          </p>
        </div>
        <button
          className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
          disabled={loading || busy}
          onClick={refresh}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
        <button
          className={String.raw`primary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
          disabled={!data?.canSubmit || busy}
          onClick={() => {
            setSuccess('')
            setOpen(true)
          }}
        >
          <Plus size={17} />
          New Report
        </button>
      </section>
      {error && (
        <p
          role="alert"
          className={String.raw`error-notice mb-5 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#b42344] employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
        >
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          className={String.raw`info-notice mb-5 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#d7ece4]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#166c5b] employee-base:[border-color:#d7ece4] employee-base:[background:#f0faf5]`}
        >
          {success}
        </p>
      )}
      {data?.message && (
        <p
          className={String.raw`info-notice mb-5 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#d7ece4]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#166c5b] employee-base:[border-color:#d7ece4] employee-base:[background:#f0faf5]`}
        >
          {data.message}
        </p>
      )}
      {data ? (
        <ReportHistoryTable
          records={data.records}
          onView={(record) => setSelected(record.id)}
        />
      ) : (
        <section
          className={String.raw`surface career-empty employee-page:flex employee-page:min-h-[300px] employee-page:p-[48px_24px]
    employee-page:flex-col employee-page:justify-center employee-page:items-center employee-page:gap-[18px]
    employee-page:text-center employee-page:[&_>_svg]:text-[color:#a5b9c4]
    employee-page:[&_h2]:text-[length:17px] employee-page:[&_h2]:text-[color:var(--text-secondary)]
    employee-page:[&_p]:text-[color:var(--text-muted)] employee-page:[&_p]:text-[length:12px]
    employee-page:[&_p]:leading-[1.8] employee-page:[&_>_.reward-empty-icon]:text-[color:#d7b16a]
    employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)]`}
        >
          <FileText size={40} />
          <p role="status">{loading ? 'Loading your reports…' : 'Your reports are unavailable.'}</p>
          {!loading && (
            <button
              className={String.raw`primary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
              onClick={refresh}
            >
              Try Again
            </button>
          )}
        </section>
      )}
      {open && data && (
        <ReportSubmissionForm
          data={data}
          onSave={submit}
          onClose={() => setOpen(false)}
        />
      )}
      {!open && viewed && (
        <ReportDetailsModal
          record={viewed}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
