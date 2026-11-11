import formatDate from '../../utils/formatters/formatDate.js'
import { formatAttendanceTimestamp } from '../../services/operations/attendanceService.js'

export default function CheckInLogTable({ rows }) {
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Daily check-in and check-out records">
      <table className="employee-table daily-attendance-table attendance-log-table" id="check-in-logs-table">
        <caption className="sr-only">Daily attendance records. All timestamps use East Africa Time.</caption>
        <thead>
          <tr>
            {['Employee / Role', 'Department', 'Attendance Date', 'Check-In', 'Check-Out', 'Attendance', 'IP / Verification'].map((label) => (
              <th key={label} scope="col">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.logId}>
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
              <td><time dateTime={row.checkIn || undefined}>{formatAttendanceTimestamp(row.checkIn)}</time></td>
              <td>
                {row.checkOut
                  ? <time dateTime={row.checkOut}>{formatAttendanceTimestamp(row.checkOut)}</time>
                  : <span className="muted-note">Not recorded</span>}
              </td>
              <td>
                <span className={`attendance-status attendance-status-${row.attendanceStatus.toLowerCase().replaceAll(' ', '-')}`}>
                  {row.attendanceStatus}
                </span>
              </td>
              <td>
                {['In', 'Out'].map((label) => {
                  const prefix = label === 'In' ? 'checkIn' : 'checkOut'
                  const verification = row[`${prefix}Verification`]
                  return (
                    <div key={label} className="attendance-record-ip">
                      <span>{label}: <code>{row[`${prefix}Ip`] || '—'}</code></span>
                      <small className={verification === 'Verified' ? 'verification-verified' : verification === 'Unverified' ? 'verification-unverified' : 'verification-unknown'}>
                        {verification || '—'}
                      </small>
                    </div>
                  )
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
