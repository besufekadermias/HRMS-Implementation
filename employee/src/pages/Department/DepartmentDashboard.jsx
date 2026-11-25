import { Link } from 'react-router-dom'
import { Users, Clock3, CheckCircle2, AlertCircle, Building2, CalendarDays, RefreshCw, ArrowUpRight, ArrowRight } from 'lucide-react'
import { useEmployeeStore } from '../../store/index.js'
import useDepartmentData from '../../hooks/department/useDepartmentData.js'
import { loadDepartmentAttendance } from '../../services/department/departmentService.js'
import DepartmentPage from '../../components/department/DepartmentPage.jsx'
import DepartmentStatCard from '../../components/department/DepartmentStatCard.jsx'
import DepartmentAttendanceTrend from '../../components/department/DepartmentAttendanceTrend.jsx'
import { formatAttendanceDate, formatTime } from '../../utils/formatters/attendanceTime.js'
import { ATTENDANCE_STATUS_LABELS } from '../../utils/validation/attendanceSchemas.js'

const statusColors = {
  PRESENT: 'bg-[#e5f5ed] text-[#168574]', LATE: 'bg-[#fff4df] text-[#a87422]',
  ABSENT: 'bg-[#fcebf0] text-[#b5536c]', ON_LEAVE: 'bg-[#eaf1fc] text-[#5278af]',
}
const initials = name => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('')

export default function DepartmentDashboard() {
  const user = useEmployeeStore(state => state.user)
  const resource = useDepartmentData(loadDepartmentAttendance)
  const data = resource.data
  const employees = data?.employees || []
  const records = data?.records || []
  const date = records[0]?.date
  const latest = records.filter(record => record.date === date)
  const members = new Map(employees.map(employee => [employee.id, employee]))
  const cards = [
    { label: 'Team members', value: employees.length, detail: 'Including your employee record', icon: Users, tone: 'blue' },
    { label: 'Present', value: latest.filter(record => record.status === 'PRESENT').length, detail: 'On the latest saved workday', icon: CheckCircle2, tone: 'teal' },
    { label: 'Late arrivals', value: latest.filter(record => record.status === 'LATE').length, detail: 'On the latest saved workday', icon: Clock3, tone: 'amber' },
    { label: 'Absent', value: latest.filter(record => record.status === 'ABSENT').length, detail: 'Recorded absences only', icon: AlertCircle, tone: 'rose' },
  ]
  const header = <section className="relative overflow-hidden rounded-[18px] border border-[#dce9e3] bg-[radial-gradient(ellipse_at_top_right,_#e4f4eb,_white_65%)] p-6 sm:p-7">
    <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:flex-wrap">
      <div className="w-full min-w-0 flex-1 sm:w-auto">
        <div className="mb-4 flex flex-wrap items-center gap-2.5 text-[11px]">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e5f4ec] px-3 py-1.5 font-semibold text-primary"><Building2 size={14} />Department overview</span>
          <span className="text-muted">Head of Department</span>
        </div>
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.7px] sm:text-[32px]">Department Dashboard</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">Welcome back, {user.fullName.split(' ')[0]}. Here is your team’s latest recorded activity.</p>
        <p className="mt-3 text-[12px] font-semibold text-primary">{data?.department.name || user.department}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-end">
        <button type="button" onClick={resource.refresh} disabled={resource.loading} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d8e5df] bg-white px-3.5 text-[12px] font-semibold text-text-secondary hover:bg-page disabled:opacity-50"><RefreshCw size={14} className={resource.loading ? 'animate-spin' : ''} />Refresh</button>
        <Link to="/department/attendance" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-[12px] font-semibold text-white shadow-[0_3px_8px_#087f6d16] hover:bg-primary-hover">Team Attendance<ArrowUpRight size={15} /></Link>
      </div>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#e2ece6] pt-4 text-[11px] text-muted">
      <span className="inline-flex items-center gap-2"><CalendarDays size={14} className="text-primary" />Attendance snapshot: <strong className="font-medium text-text-secondary">{date ? formatAttendanceDate(date) : 'No saved workdays yet'}</strong></span>
      <span>Your department only · East Africa Time</span>
    </div>
  </section>

  return <DepartmentPage resource={resource} header={header}>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card => <DepartmentStatCard key={card.label} {...card} />)}</div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,_1.35fr)_minmax(0,_1fr)]">
      <DepartmentAttendanceTrend records={records} />
      <section className="min-w-0 rounded-[14px] border border-border bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="flex items-center gap-2 text-[16px] font-semibold"><Users size={19} className="text-primary" />Your team</h2><p className="mt-1.5 text-[12px] text-muted">People assigned to your department</p></div>
          <span className="rounded-full bg-[#eef6f3] px-2.5 py-1 text-[11px] font-semibold text-primary">{employees.length} members</span>
        </div>
        <div className="mt-5 divide-y divide-[#edf2f3]">{employees.slice(0, 5).map(employee => <div key={employee.id} className="flex items-center gap-3 py-3 first:pt-0">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f3ee] text-[12px] font-semibold text-primary">{initials(employee.fullName)}</span>
          <div className="min-w-0 flex-1"><strong className="block truncate text-[12px] font-semibold">{employee.fullName}</strong><small className="mt-1 block truncate text-[11px] text-muted">{employee.serialNumber} · {employee.email || 'Email not provided'}</small></div>
          <span className="shrink-0 rounded-md bg-[#f3f7f8] px-2 py-1 text-[10px] text-text-secondary">{employee.id === user.employeeId ? 'You · Head' : employee.role === 'HR_MANAGER' ? 'HR Manager' : 'Employee'}</span>
        </div>)}</div>
        <Link to="/department/team" className="mt-4 inline-flex items-center gap-2 text-[12px] font-semibold text-primary hover:underline">View all team members<ArrowRight size={14} /></Link>
      </section>
    </div>
    <section className="overflow-hidden rounded-[14px] border border-border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf2f3] px-5 py-5 sm:px-6">
        <div><h2 className="flex items-center gap-2 text-[16px] font-semibold"><Clock3 size={19} className="text-primary" />Latest attendance</h2><p className="mt-1.5 text-[12px] text-muted">Most recent saved entries from your team</p></div>
        <Link to="/department/attendance" className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline">View all records<ArrowUpRight size={14} /></Link>
      </div>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Latest department attendance">
        <table className="w-full min-w-[600px] border-collapse text-left text-[12px] [&_th]:bg-[#f7fafb] [&_th]:px-6 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted [&_td]:border-t [&_td]:border-[#edf2f3] [&_td]:px-6 [&_td]:py-3.5 [&_td]:text-text-secondary">
          <caption className="sr-only">Latest saved attendance for department employees</caption>
          <thead><tr>{['Employee', 'Workday', 'Check-in', 'Status'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
          <tbody>{records.slice(0, 5).map(record => <tr key={record.id} className="hover:bg-[#fbfdfc]">
            <td><span className="font-semibold text-text-primary">{members.get(record.employeeId).fullName}</span><small className="ml-2 text-[10px] text-muted">{members.get(record.employeeId).serialNumber}</small></td>
            <td>{formatAttendanceDate(record.date, { weekday: undefined })}</td><td>{formatTime(record.checkIn, data.timeZone)}</td>
            <td><span className={'inline-flex rounded-md px-2 py-1 text-[10px] font-semibold ' + statusColors[record.status]}>{ATTENDANCE_STATUS_LABELS[record.status]}</span></td>
          </tr>)}</tbody>
        </table>
        {!records.length && <p className="p-6 text-[13px] text-muted">No saved attendance records yet.</p>}
      </div>
    </section>
    <p className="px-1 text-[11px] leading-relaxed text-muted">Official attendance corrections and employee-record changes remain with HR.</p>
  </DepartmentPage>
}
