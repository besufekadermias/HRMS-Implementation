import AttendanceTimecard from '../../components/attendance/AttendanceTimecard.jsx'
import AttendanceHistory from '../../components/attendance/AttendanceHistory.jsx'
import useAttendance from '../../hooks/work/useAttendance.js'
import useAttendanceHistory from '../../hooks/work/useAttendanceHistory.js'

export default function MyAttendance() {
  const attendance = useAttendance()
  const record = attendance.state?.record
  const history = useAttendanceHistory(
    JSON.stringify([
      attendance.revision,
      attendance.state?.date,
      record?.id,
      record?.checkIn,
      record?.checkOut,
      record?.status,
    ]),
  )
  return (
    <div className="max-w-[1240px]">
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
          <h1>Attendance Check-In &amp; Check-Out</h1>
          <p
            className={String.raw`intro-description employee-base:mt-[9px] employee-base:text-[length:12px] employee-base:leading-[1.8]
    employee-base:text-[color:var(--text-secondary)]`}
          >
            Record your daily presence and review your recent attendance history.
          </p>
        </div>
      </div>
      <AttendanceTimecard attendance={attendance} />
      <AttendanceHistory history={history} />
    </div>
  )
}
