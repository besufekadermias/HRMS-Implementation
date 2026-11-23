import { ATTENDANCE_STATUS_LABELS } from '../../utils/validation/attendanceSchemas.js'
import {
  formatAttendanceDate,
  formatAttendanceTimestamp,
} from '../../utils/formatters/attendanceTime.js'

const statusTone = {
  PRESENT: String.raw`tone-green employee-base:text-[color:#0b8972] employee-base:[background:#e3f5f0]`,
  LATE: String.raw`tone-amber employee-base:text-[color:#a36b0d] employee-base:[background:#fff5dd]`,
  ABSENT: String.raw`tone-rose employee-base:text-[color:#a73955] employee-base:[background:#fdeaf0]`,
  ON_LEAVE: String.raw`tone-lavender employee-base:text-[color:#7566ba] employee-base:[background:#f0edfb]`,
}
const verificationLabels = {
  VERIFIED: 'Verified',
  UNVERIFIED: 'Unverified',
  UNAVAILABLE: 'Unavailable',
}
export default function AttendanceLogTable({ records, timeZone }) {
  return (
    <div
      className={String.raw`attendance-table-scroll employee-base:max-w-[100%] employee-base:overflow-x-auto`}
      role="region"
      aria-label="Recent attendance records"
      tabIndex={0}
    >
      <table
        className={String.raw`attendance-history-table employee-base:w-[100%] employee-base:min-w-[760px] employee-base:border-collapse
    employee-base:text-left employee-base:[&_thead]:[background:#f6faf9] employee-base:[&_th]:p-[16px_22px]
    employee-base:[&_th]:[border-top:1px_solid_var(--border)] employee-base:[&_th]:align-middle
    employee-base:[&_th]:text-[length:12px] employee-base:[&_td]:p-[16px_22px]
    employee-base:[&_td]:[border-top:1px_solid_var(--border)] employee-base:[&_td]:align-middle
    employee-base:[&_td]:text-[length:12px] employee-base:[&_thead_th]:text-[color:var(--text-secondary)]
    employee-base:[&_thead_th]:text-[length:10px] employee-base:[&_thead_th]:font-[600]
    employee-base:[&_thead_th]:uppercase employee-base:[&_thead_th]:tracking-[0.5px]
    employee-base:[&_tbody_th]:font-[600] employee-base:[&_tbody_th]:whitespace-nowrap
    employee-base:[&_td_>_time]:block employee-base:[&_td_>_time]:min-w-[130px]
    employee-base:[&_td_>_time]:text-[color:var(--text-secondary)]
    employee-base:[&_tbody_tr:hover]:[background:#f9fcfb] employee-page:screen-max-480:[&_th]:p-[14px_17px]
    employee-page:screen-max-480:[&_td]:p-[14px_17px]`}
        id="attendance-history-table"
      >
        <caption className="sr-only">
          Your daily attendance dates, check-in and check-out timestamps, status, IP addresses, and
          verification results.
        </caption>
        <thead>
          <tr>
            {['Date', 'Check-in', 'Check-out', 'Status', 'IP Address & Verification'].map(
              (label) => (
                <th
                  key={label}
                  scope="col"
                >
                  {label}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <th scope="row">
                <time dateTime={record.date}>{formatAttendanceDate(record.date)}</time>
              </th>
              <td>
                <time dateTime={record.checkIn || undefined}>
                  {formatAttendanceTimestamp(record.checkIn, timeZone)}
                </time>
              </td>
              <td>
                <time dateTime={record.checkOut || undefined}>
                  {formatAttendanceTimestamp(record.checkOut, timeZone)}
                </time>
              </td>
              <td>
                <span
                  className={String.raw`attendance-status-badge employee-base:inline-block employee-base:rounded-[5px] employee-base:p-[5px_9px]
    employee-base:whitespace-nowrap employee-base:text-[length:10px] employee-base:font-[600] ${statusTone[record.status]}`}
                >
                  {ATTENDANCE_STATUS_LABELS[record.status]}
                </span>
              </td>
              <td>
                <div
                  className={String.raw`attendance-ip-pair employee-base:grid employee-base:gap-[7px] employee-base:min-w-[140px]
    employee-base:[&_small]:block employee-base:[&_small]:mt-[2px] employee-base:[&_small]:text-[length:9px]
    employee-base:[&_code]:[overflow-wrap:anywhere] employee-base:[&_code]:text-[length:10px]`}
                >
                  {['In', 'Out'].map((label) => {
                    const key = label === 'In' ? 'checkIn' : 'checkOut'
                    const verification = record[`${key}Verification`]
                    return (
                      <div key={label}>
                        <span>
                          {label}: <code>{record[`${key}Ip`] || '—'}</code>
                        </span>
                        <small
                          className={
                            verification === 'VERIFIED'
                              ? 'text-primary'
                              : verification === 'UNVERIFIED'
                                ? 'text-[#a73955]'
                                : 'text-muted'
                          }
                        >
                          {record[key]
                            ? verificationLabels[verification] || 'Unavailable'
                            : 'Not recorded'}
                        </small>
                      </div>
                    )
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
