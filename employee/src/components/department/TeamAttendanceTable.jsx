import { ATTENDANCE_STATUS_LABELS } from '../../utils/validation/attendanceSchemas.js'
import { formatAttendanceDate, formatTime } from '../../utils/formatters/attendanceTime.js'

export default function TeamAttendanceTable({ records, employees, timeZone }) {
  const members = new Map(employees.map(employee => [employee.id, employee]))
  return <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Team attendance table">
    <table className="w-full min-w-[850px] border-collapse text-left text-[12px] [&_th]:bg-[#f6f9fb] [&_th]:p-4 [&_th]:text-[10px] [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted [&_td]:border-t [&_td]:border-border [&_td]:p-4 [&_td]:text-text-secondary">
      <caption className="sr-only">Saved attendance for employees in your department</caption>
      <thead><tr>{['Employee', 'Work date', 'Check-in', 'Check-out', 'Status', 'IP verification'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
      <tbody>{records.map(record => <tr key={record.id} className="hover:bg-[#f9fcfb]">
        <td><strong className="block text-text-primary">{members.get(record.employeeId).fullName}</strong><small className="text-muted">{members.get(record.employeeId).serialNumber}</small></td>
        <td>{formatAttendanceDate(record.date)}</td>
        <td>{formatTime(record.checkIn, timeZone)}</td><td>{formatTime(record.checkOut, timeZone)}</td>
        <td><span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-semibold ${record.status === 'ABSENT' ? 'bg-[#fff0f3] text-[#b42344]' : record.status === 'LATE' ? 'bg-[#fff7e8] text-[#805f23]' : 'bg-[#e3f5f0] text-primary'}`}>{ATTENDANCE_STATUS_LABELS[record.status]}</span></td>
        <td className="text-[11px]">In: {record.checkInVerification || 'Not recorded'}<br />Out: {record.checkOutVerification || 'Not recorded'}</td>
      </tr>)}</tbody>
    </table>
    {!records.length && <p className="p-6 text-[13px] text-muted">No saved attendance matches these filters. A missing record is not an absence.</p>}
  </div>
}
