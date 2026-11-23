import { useState } from 'react'
import { CalendarDays, Plus, RefreshCw } from 'lucide-react'
import useLeave from '../../hooks/work/useLeave.js'
import LeaveBalanceSummary from '../../components/leave/LeaveBalanceSummary.jsx'
import LeaveHistoryTable from '../../components/leave/LeaveHistoryTable.jsx'
import LeaveRequestForm from '../../components/leave/LeaveRequestForm.jsx'
import { useEmployeeStore } from '../../store/index.js'

export default function MyLeave({ initiallyOpen = false }) {
  const { data, error, loading, refresh, save } = useLeave()
  const [open, setOpen] = useState(initiallyOpen)
  const [success, setSuccess] = useState('')
  const busy = useEmployeeStore(
    (state) => state.leaveBusy || state.securityBusy || state.profileBusy || state.attendanceBusy,
  )
  async function submit(values, key) {
    const record = await save(values, key)
    setSuccess(
      `Request ${record.id} submitted for ${record.daysRequested} ${record.daysRequested === 1 ? 'day' : 'days'}. Status: Pending. Your balance has not been deducted.`,
    )
  }
  return (
    <>
      <section
        className={String.raw`leave-intro employee-page:flex employee-page:items-center employee-page:justify-between
    employee-page:gap-[20px] employee-page:mb-[26px] employee-page:screen-max-700:items-start
    employee-page:screen-max-700:flex-col`}
      >
        <div>
          <p
            className={String.raw`eyebrow mb-2 employee-base:text-[length:10px] employee-base:font-[700] employee-base:tracking-[1.4px]
    employee-base:uppercase employee-base:text-[color:var(--primary)]
    employee-page:screen-max-480:text-[length:9px] employee-page:screen-max-480:tracking-[1.1px]`}
          >
            EMPLOYEE SERVICES
          </p>
          <h1>My Leave Management</h1>
          <p
            className={String.raw`intro-description employee-base:mt-[9px] employee-base:text-[length:12px] employee-base:leading-[1.8]
    employee-base:text-[color:var(--text-secondary)]`}
          >
            View your entitlement, request leave, and follow HR decisions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
            onClick={refresh}
            disabled={loading || busy}
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
            onClick={() => {
              setSuccess('')
              setOpen(true)
            }}
            disabled={!data || !data.canRequest || busy}
          >
            <Plus size={18} />
            Submit Leave Request
          </button>
        </div>
      </section>
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
      {!data ? (
        <section
          className={String.raw`surface content-card text-center employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:p-[22px_23px]
    employee-page:screen-max-768:p-[20px_17px]`}
        >
          <CalendarDays
            className="mx-auto mb-3 text-primary"
            size={28}
          />
          <p role="status">
            {loading
              ? 'Loading your leave balance and applications…'
              : 'Your leave records are unavailable.'}
          </p>
          {!loading && (
            <button
              className={String.raw`primary-button mt-4 employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
              onClick={refresh}
            >
              Try again
            </button>
          )}
        </section>
      ) : (
        <>
          {data.message && (
            <p
              className={`${
                data.canRequest
                  ? String.raw`info-notice employee-base:p-[12px_14px] employee-base:[border:1px_solid_#d7ece4] employee-base:rounded-[7px]
    employee-base:text-[length:12px] employee-base:leading-[1.7] employee-base:text-[color:#166c5b]
    employee-base:[border-color:#d7ece4] employee-base:[background:#f0faf5]`
                  : String.raw`error-notice employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc] employee-base:rounded-[7px]
    employee-base:text-[length:12px] employee-base:leading-[1.7] employee-base:text-[color:#b42344]
    employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`
              } mb-5`}
            >
              {data.message}
            </p>
          )}
          <LeaveBalanceSummary data={data} />
          <LeaveHistoryTable requests={data.requests} />
          {open && (
            <LeaveRequestForm
              data={data}
              onClose={() => setOpen(false)}
              onSave={submit}
            />
          )}
        </>
      )}
    </>
  )
}
