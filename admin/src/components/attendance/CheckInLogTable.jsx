import formatDate from '../../utils/formatters/formatDate.js'
import { formatAttendanceTimestamp } from '../../services/operations/attendanceService.js'

export default function CheckInLogTable({ rows }) {
  return (
    <div className="table-scroll tw:shared-base:overflow-x-auto tw:shared-base:[scrollbar-width:thin]
           tw:shared-base:[scrollbar-color:#c5dbd6_#f5f9f9]" tabIndex={0} role="region" aria-label="Daily check-in and check-out records">
      <table className="employee-table daily-attendance-table attendance-log-table tw:min-w-[1040px] tw:text-[11px] tw:[&_th]:text-[9px]
          tw:[&_th]:p-[13px_10px] tw:[&_th]:whitespace-normal tw:[&_td]:p-[15px_10px] tw:[&_td]:align-middle
          tw:[&_td:first-child]:min-w-[175px] tw:[&_td:nth-child(2)]:max-w-[195px]
          tw:[&_td:nth-child(2)]:min-w-[155px] tw:[&_.department-tag]:text-[10px]
          tw:[&_td:nth-child(4)]:min-w-[135px] tw:[&_td:nth-child(4)]:max-w-[155px]
          tw:[&_td:nth-child(5)]:min-w-[135px] tw:[&_td:nth-child(5)]:max-w-[155px] tw:shared-base:w-full
          tw:shared-base:border-collapse tw:shared-base:text-left tw:shared-base:text-[11px]
          tw:shared-base:[&_th]:text-[9px] tw:shared-base:[&_th]:tracking-[0.6px] tw:shared-base:[&_th]:font-[650]
          tw:shared-base:[&_th]:[color:#5c768a] tw:shared-base:[&_th]:[background:#f6f9fb]
          tw:shared-base:[&_th]:p-[13px_12px] tw:shared-base:[&_th]:whitespace-nowrap
          tw:shared-base:[&_th]:[border-bottom:1px_solid_#e6eff2]
          tw:shared-base:[&_th:first-child]:rounded-[5px_0_0_5px]
          tw:shared-base:[&_th:last-child]:rounded-[0_5px_5px_0] tw:shared-base:[&_td]:p-[12px]
          tw:shared-base:[&_td]:[border-bottom:1px_solid_#f0f4f6]
          tw:shared-base:[&_td]:[color:var(--text-secondary)] tw:shared-base:[&_td]:leading-[1.6]
          tw:shared-base:[&_tbody_tr:hover]:[background:#f9fcfb]
          tw:shared-base:[&_tbody_tr:last-child_td]:[border-bottom:0]
          tw:max-[768px]:shared-base:min-w-[870px]" id="check-in-logs-table">
        <caption className="sr-only tw:sr-only">Daily attendance records. All timestamps use East Africa Time.</caption>
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
                <div className="attendance-person tw:flex tw:flex-col tw:[align-items:flex-start] tw:gap-[4px] tw:[&_strong]:text-[12px]
          tw:[&_strong]:leading-[1.5] tw:[&_small]:text-[10px]">
                  <strong>{row.name}</strong>
                  <small className="employee-id tw:shared-base:[font-family:'SFMono-Regular',_Consolas,_monospace] tw:shared-base:text-[10px]
          tw:shared-base:font-semibold tw:shared-base:[color:#547082] tw:shared-base:whitespace-nowrap">{row.id}</small>
                  <span className={`attendance-role${row.isHead ? " attendance-role-head" : ""} tw:text-[9px] tw:text-[var(--text-muted)] tw:[&.attendance-role-head]:text-[#087565]
          tw:[&.attendance-role-head]:bg-[#e0f5ef] tw:[&.attendance-role-head]:p-[3px_5px]
          tw:[&.attendance-role-head]:rounded-[4px] `}>
                    {row.isHead ? 'Head of Department' : 'Employee'}
                  </span>
                </div>
              </td>
              <td><span className="department-tag tw:shared-base:inline-block tw:shared-base:p-[4px_7px] tw:shared-base:rounded-[6px]
          tw:shared-base:text-[9px] tw:shared-base:leading-[1.5] tw:shared-base:[background:#e2f7f0]
          tw:shared-base:[color:#187568]">{row.department}</span></td>
              <td>{formatDate(row.attendanceDate)}</td>
              <td><time dateTime={row.checkIn || undefined}>{formatAttendanceTimestamp(row.checkIn)}</time></td>
              <td>
                {row.checkOut
                  ? <time dateTime={row.checkOut}>{formatAttendanceTimestamp(row.checkOut)}</time>
                  : <span className="muted-note tw:shared-base:block tw:shared-base:[color:var(--text-muted)] tw:shared-base:text-[12px]
          tw:shared-base:leading-[1.8] tw:shared-base:mt-[17px]">Not recorded</span>}
              </td>
              <td>
                <span className={`attendance-status attendance-status-${row.attendanceStatus.toLowerCase().replaceAll(" ", "-")} tw:inline-block tw:p-[5px_8px] tw:rounded-[5px] tw:whitespace-nowrap tw:text-[10px] tw:font-[600]
          tw:[&.attendance-status-present]:text-[#08704c] tw:[&.attendance-status-present]:bg-[#e0f7ec]
          tw:[&.attendance-status-late]:text-[#895b16] tw:[&.attendance-status-late]:bg-[#fff2d9]
          tw:[&.attendance-status-absent]:text-[#a73955] tw:[&.attendance-status-absent]:bg-[#fdeaf0]
          tw:[&.attendance-status-on-leave]:text-[#69539b] tw:[&.attendance-status-on-leave]:bg-[#efeafb]
          tw:[&.attendance-status-no-data]:text-[#536978] tw:[&.attendance-status-no-data]:bg-[#edf2f5] `}>
                  {row.attendanceStatus}
                </span>
              </td>
              <td>
                {['In', 'Out'].map((label) => {
                  const prefix = label === 'In' ? 'checkIn' : 'checkOut'
                  const verification = row[`${prefix}Verification`]
                  return (
                    <div key={label} className="attendance-record-ip tw:flex tw:flex-col tw:gap-[2px] tw:text-[10px] tw:[&+.attendance-record-ip]:mt-[7px]
          tw:[&_small]:text-[9px]">
                      <span>{label}: <code>{row[`${prefix}Ip`] || '—'}</code></span>
                      <small className={verification === "Verified" ? "verification-verified tw:text-[#08704c]" : verification === "Unverified" ? "verification-unverified tw:text-[#a73955]" : "verification-unknown tw:text-[var(--text-muted)]"}>
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
