import { useId } from 'react'
import { Clock3, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react'
import { formatTime } from '../../utils/formatters/attendanceTime.js'

export default function CheckInOutWidget({ attendance, compact = false, showAction = true }) {
  const messageId = useId()
  const { state, saving, loading, error, success, submit, refresh } = attendance
  const checkedOut = Boolean(state?.record?.checkOut)
  const checkedIn = Boolean(state?.record?.checkIn)
  const enabled = Boolean(
    state?.configured &&
    state.ipAuthorized &&
    (state.canCheckIn || state.canCheckOut) &&
    !saving &&
    !loading,
  )
  const label = saving
    ? 'Recording…'
    : checkedOut
      ? 'Attendance Complete'
      : checkedIn
        ? 'Attendance Check-Out'
        : 'Attendance Check-In'
  const button = (
    <button
      className={String.raw`attendance-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
      disabled={!enabled}
      onClick={submit}
      aria-describedby={messageId}
    >
      {checkedOut ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
      {label}
    </button>
  )

  if (compact)
    return (
      <div
        className={String.raw`intro-attendance employee-base:text-right employee-page:screen-max-768:text-left`}
      >
        {button}
        <p
          id={messageId}
          className="mt-2 max-w-[290px] text-[10px] leading-[1.6] text-muted"
        >
          {error || (loading ? 'Checking attendance availability…' : state?.message)}
        </p>
        {success && (
          <p
            role="status"
            className="mt-2 text-[11px] text-primary"
          >
            {success}
          </p>
        )}
      </div>
    )

  return (
    <section
      className={String.raw`surface content-card employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:p-[22px_23px]
    employee-page:screen-max-768:p-[20px_17px]`}
      aria-label="Attendance check-in and check-out"
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
          <h2>
            <Clock3 size={19} />
            Today’s Attendance
          </h2>
          <p>{state?.date || 'Loading your attendance…'} · East Africa Time</p>
        </div>
        {showAction ? (
          button
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-semibold ${state?.ipAuthorized ? String.raw`tone-green employee-base:text-[color:#0b8972] employee-base:[background:#e3f5f0]` : String.raw`tone-amber employee-base:text-[color:#a36b0d] employee-base:[background:#fff5dd]`}`}
          >
            <ShieldCheck size={13} />
            {state?.ipAuthorized ? 'Office network verified' : 'Office network required'}
          </span>
        )}
      </div>
      <p
        id={messageId}
        className={
          state?.ipAuthorized
            ? String.raw`info-notice employee-base:p-[12px_14px] employee-base:[border:1px_solid_#d7ece4] employee-base:rounded-[7px]
    employee-base:text-[length:12px] employee-base:leading-[1.7] employee-base:text-[color:#166c5b]
    employee-base:[border-color:#d7ece4] employee-base:[background:#f0faf5]`
            : String.raw`warning-notice employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f1e2bd]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#9b650e] employee-base:[border-color:#f1e2bd] employee-base:[background:#fff8e8]`
        }
      >
        {error || state?.message || 'Checking your office network…'}
      </p>
      {showAction && success && (
        <p
          role="status"
          className="mt-3 text-[12px] font-semibold text-primary"
        >
          {success}
        </p>
      )}
      <dl
        className={String.raw`detail-grid employee-base:grid employee-base:grid-cols-[repeat(2,_minmax(0,_1fr))] employee-base:gap-[22px]
    employee-base:mt-[22px] employee-base:[&_dt]:text-[length:11px]
    employee-base:[&_dt]:text-[color:var(--text-muted)] employee-base:[&_dd]:mt-[7px]
    employee-base:[&_dd]:text-[length:13px] employee-base:[&_dd]:font-[600]
    employee-base:[&_dd]:[overflow-wrap:anywhere] employee-page:screen-max-480:grid-cols-[minmax(0,_1fr)]
    employee-page:screen-max-480:gap-[19px]`}
      >
        {[
          [
            'Working hours',
            state ? `${state.schedule.startTime}–${state.schedule.endTime} EAT` : '—',
          ],
          ['Grace period', state ? `${state.schedule.gracePeriod} minutes` : '—'],
          ['Check-in', formatTime(state?.record?.checkIn, state?.timeZone)],
          ['Check-out', formatTime(state?.record?.checkOut, state?.timeZone)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="break-all text-[10px] leading-[1.7] text-muted">
          Current IP: {state?.ipAddress || 'Unavailable'}
          {state?.record && (
            <>
              <br />
              Check-in IP: {state.record.checkInIp}
              {state.record.checkOutIp && <> · Check-out IP: {state.record.checkOutIp}</>}
            </>
          )}
        </p>
        <button
          className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
          onClick={() => refresh()}
          disabled={saving}
        >
          <RefreshCw size={14} />
          Refresh status
        </button>
      </div>
    </section>
  )
}
