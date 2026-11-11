import formatDate from '../../utils/formatters/formatDate.js'
import { formatAttendanceTimestamp, formatLateMinutes } from '../../services/operations/attendanceService.js'

export default function LateArrivalsTable({ rows }) {
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Late arrival records">
      <table className="employee-table daily-attendance-table late-arrivals-table" id="late-arrivals-table">
        <caption className="sr-only">Late arrivals, one record per employee per attendance day.</caption>
        <thead>
          <tr>
            {['Employee / Role', 'Department', 'Attendance Date', 'Scheduled Start', 'Check-In', 'Delay', 'Check-In IP / Verification'].map((label) => (
              <th key={label} scope="col">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.id}:${row.attendanceDate}`}>
              <td>
                <div className="attendance-person">
                  <strong>{row.name}</strong>
                  <small className="employee-id">{row.id}</small>
                  <span className={`attendance-role${row.isHead ? ' attendance-role-head' : ''}`}>
                    {row.isHead ? 'Head of Department' : 'Employee'}
                  </span>
                </div>
              </td>
              <td><span className="department-tag">{row.department}</span></td>
              <td>{formatDate(row.attendanceDate)}</td>
              <td>
                {row.expectedStart
                  ? <time dateTime={row.expectedStart}>{formatAttendanceTimestamp(row.expectedStart)}</time>
                  : <span className="muted-note">Unavailable</span>}
              </td>
              <td>
                {row.checkIn
                  ? <time dateTime={row.checkIn}>{formatAttendanceTimestamp(row.checkIn)}</time>
                  : <span className="muted-note">Not recorded</span>}
              </td>
              <td>
                <span className={`attendance-status ${row.lateMinutes === null ? 'attendance-status-no-data' : 'attendance-status-late'}`}>
                  {row.lateMinutes === null ? 'Unavailable' : formatLateMinutes(row.lateMinutes)}
                </span>
              </td>
              <td>
                <div className="attendance-record-ip">
                  <code>{row.checkInIp || '—'}</code>
                  <small className={row.checkInVerification === 'Verified' ? 'verification-verified' : row.checkInVerification === 'Unverified' ? 'verification-unverified' : 'verification-unknown'}>
                    {row.checkInVerification || 'Unavailable'}
                  </small>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
