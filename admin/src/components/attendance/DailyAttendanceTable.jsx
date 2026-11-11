import { formatAttendanceTime } from '../../services/operations/attendanceService.js'

function Verification({ label, value }) {
  const tone = value === 'Verified' ? 'verified' : value === 'Unverified' ? 'unverified' : 'unknown'
  return (
    <span className={`attendance-verification verification-${tone}`}>
      <span>{label}:</span> {value || '—'}
    </span>
  )
}

export default function DailyAttendanceTable({ rows }) {
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Daily employee and HOD attendance">
      <table className="employee-table daily-attendance-table" id="attendance-table">
        <caption className="sr-only">
          Daily attendance. Times use East Africa Time.
        </caption>
        <thead>
          <tr>
            {['Employee / Role', 'Department', 'Check-In', 'Check-Out', 'Attendance', 'IP Address', 'IP Verification'].map((label) => (
              <th key={label} scope="col">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
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
              <td className="attendance-time">
                {row.checkIn ? <time dateTime={row.checkIn}>{formatAttendanceTime(row.checkIn)}</time> : '—'}
              </td>
              <td className="attendance-time">
                {row.checkOut ? <time dateTime={row.checkOut}>{formatAttendanceTime(row.checkOut)}</time> : '—'}
                {row.checkIn && !row.checkOut && <small>Not recorded</small>}
              </td>
              <td>
                <span className={`attendance-status attendance-status-${row.attendanceStatus.toLowerCase().replaceAll(' ', '-')}`}>
                  {row.attendanceStatus}
                </span>
              </td>
              <td>
                <div className="attendance-ip"><span>In:</span><code>{row.checkInIp || '—'}</code></div>
                <div className="attendance-ip"><span>Out:</span><code>{row.checkOutIp || '—'}</code></div>
              </td>
              <td>
                <Verification label="In" value={row.checkInVerification} />
                <Verification label="Out" value={row.checkOutVerification} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
