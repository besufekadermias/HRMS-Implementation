import { Clock3, LogIn, LogOut, RefreshCw, ShieldCheck } from 'lucide-react'
import {
  formatAttendanceDate,
  formatShiftTime,
  formatTime,
} from '../../utils/formatters/attendanceTime.js'
import { ATTENDANCE_STATUS_LABELS } from '../../utils/validation/attendanceSchemas.js'

export default function AttendanceTimecard({ attendance }) {
  const { state, loading, saving, error, success, refresh, submit } = attendance
  const checkedIn = !!state?.record?.checkIn
  const checkedOut = !!state?.record?.checkOut
  const allowed = !loading && !saving && state?.configured && state.ipAuthorized
  const title = loading
    ? 'Loading Today’s Timecard…'
    : !state
      ? 'Attendance Currently Unavailable'
      : checkedOut
        ? 'Attendance Completed Today'
        : checkedIn
          ? 'Checked In Today'
          : state.record
            ? ATTENDANCE_STATUS_LABELS[state.record.status]
            : 'Not Yet Checked In Today'
  return (
    <section
      className={String.raw`surface content-card mb-5 employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:p-[22px_23px]
    employee-page:screen-max-768:p-[20px_17px]`}
      aria-labelledby="today-timecard-title"
      aria-busy={saving || loading}
    >
      <div
        className={String.raw`attendance-timecard-top employee-base:flex employee-base:items-center employee-base:gap-[24px]
    employee-page:screen-max-1100:flex-wrap`}
      >
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-primary">
            <Clock3 size={18} />
            TODAY’S TIMECARD{' '}
            <span className="font-normal text-text-secondary">
              {formatAttendanceDate(state?.date, { weekday: 'long', month: 'long' })}
            </span>
          </p>
          <h2
            id="today-timecard-title"
            className="mt-3 text-[23px] leading-[1.4]"
          >
            {title}
          </h2>
          <p className="mt-2 text-[12px] leading-[1.8] text-text-secondary">
            {state
              ? `Standard shift: ${formatShiftTime(state.schedule.startTime)} to ${formatShiftTime(state.schedule.endTime)} · Grace period: ${state.schedule.gracePeriod} minutes.`
              : 'Refresh to check today’s attendance availability.'}
          </p>
          <p className="mt-1 text-[11px] leading-[1.8] text-muted">
            One check-in and one check-out per workday · East Africa Time (UTC+3)
          </p>
        </div>
        <div
          className={String.raw`attendance-timecard-actions employee-base:flex employee-base:flex-wrap employee-base:gap-[12px]
    employee-base:[flex-shrink:0] employee-base:[&_>_button]:min-w-[128px]
    employee-base:[&_>_button]:min-h-[46px] employee-page:screen-max-1100:w-[100%]
    employee-page:screen-max-480:[&_>_button]:[flex:1] employee-page:screen-max-480:[&_>_button]:min-w-[0]
    employee-page:screen-max-480:[&_>_button]:p-[10px]`}
        >
          <button
            type="button"
            className={String.raw`primary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
            onClick={() => submit('check-in')}
            disabled={!allowed || !state?.canCheckIn}
            aria-describedby="attendance-timecard-message"
          >
            <LogIn size={18} />
            {saving && !checkedIn ? 'Checking In…' : 'Check In'}
          </button>
          <button
            type="button"
            className={String.raw`secondary-button attendance-checkout employee-base:inline-flex employee-base:min-h-[42px]
    employee-base:items-center employee-base:justify-center employee-base:gap-[9px]
    employee-base:p-[10px_17px] employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px]
    employee-base:[background:white] employee-base:text-[color:var(--text-secondary)] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4] employee-base:[box-shadow:none]
    employee-base:[transition:background_0.15s] employee-base:[border-color:#d6e4e8]
    employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]
    employee-base:[&.attendance-checkout]:[background:#fff2f4]
    employee-base:[&.attendance-checkout]:text-[color:#a33b53]
    employee-base:[&.attendance-checkout]:[border-color:#efcdd6]
    employee-base:[&.attendance-checkout:hover:not(:disabled)]:[background:#fde3e9]`}
            onClick={() => submit('check-out')}
            disabled={!allowed || !state?.canCheckOut}
            aria-describedby="attendance-timecard-message"
          >
            <LogOut size={18} />
            {saving && checkedIn ? 'Checking Out…' : 'Check Out'}
          </button>
        </div>
      </div>
      <p
        id="attendance-timecard-message"
        className={`${
          error
            ? String.raw`error-notice employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc] employee-base:rounded-[7px]
    employee-base:text-[length:12px] employee-base:leading-[1.7] employee-base:text-[color:#b42344]
    employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`
            : state?.ipAuthorized
              ? String.raw`info-notice employee-base:p-[12px_14px] employee-base:[border:1px_solid_#d7ece4] employee-base:rounded-[7px]
    employee-base:text-[length:12px] employee-base:leading-[1.7] employee-base:text-[color:#166c5b]
    employee-base:[border-color:#d7ece4] employee-base:[background:#f0faf5]`
              : String.raw`warning-notice employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f1e2bd]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#9b650e] employee-base:[border-color:#f1e2bd] employee-base:[background:#fff8e8]`
        } mt-5`}
        role={error ? 'alert' : 'status'}
      >
        {error ||
          state?.message ||
          (loading
            ? 'Checking your attendance and office network…'
            : 'Your attendance status could not be loaded. Please try again.')}
      </p>
      {success && (
        <p
          className="mt-3 text-[12px] font-semibold text-primary"
          role="status"
        >
          {success}
        </p>
      )}
      <div
        className={String.raw`attendance-timecard-bottom employee-base:flex employee-base:flex-wrap employee-base:justify-between
    employee-base:items-center employee-base:gap-[20px] employee-base:mt-[20px] employee-base:pt-[18px]
    employee-base:[border-top:1px_solid_var(--border)]`}
      >
        <dl
          className={String.raw`attendance-timecard-details employee-base:flex employee-base:flex-wrap employee-base:gap-[20px_35px]
    employee-base:[&_dt]:text-[length:10px] employee-base:[&_dt]:text-[color:var(--text-muted)]
    employee-base:[&_dd]:mt-[7px] employee-base:[&_dd]:text-[length:12px] employee-base:[&_dd]:font-[600]
    employee-page:screen-max-480:gap-[20px]`}
        >
          <div>
            <dt>Check-in</dt>
            <dd>{formatTime(state?.record?.checkIn, state?.timeZone, { second: '2-digit' })}</dd>
          </div>
          <div>
            <dt>Check-out</dt>
            <dd>{formatTime(state?.record?.checkOut, state?.timeZone, { second: '2-digit' })}</dd>
          </div>
          <div>
            <dt>Current IP</dt>
            <dd className="break-all">{state?.ipAddress || 'Unavailable'}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <span
            className={`flex items-center gap-1.5 ${state?.ipAuthorized ? 'text-primary' : 'text-muted'}`}
          >
            <ShieldCheck size={15} />
            {state?.ipAuthorized ? 'Office network verified' : 'Office network required'}
          </span>
          <button
            type="button"
            className="flex items-center gap-1.5 font-semibold text-primary hover:underline"
            onClick={() => refresh()}
            disabled={saving || loading}
          >
            <RefreshCw size={14} />
            Refresh Status
          </button>
        </div>
      </div>
    </section>
  )
}
