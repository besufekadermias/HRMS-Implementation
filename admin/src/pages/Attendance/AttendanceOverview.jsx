import { useState } from 'react'
import { todayInNairobi } from '../../utils/validation/validators.js'
import Icon from '../../components/common/Icon.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import AttendanceStats from '../../components/attendance/AttendanceStats.jsx'
import DailyAttendanceTable from '../../components/attendance/DailyAttendanceTable.jsx'
import formatDate from '../../utils/formatters/formatDate.js'
import { ATTENDANCE_STATUSES } from '../../utils/constants/constants.js'
import {
  buildDailyAttendance,
  filterAttendance,
  summarizeAttendance,
  summarizeDepartments,
} from '../../services/operations/attendanceService.js'

export default function AttendanceOverview({ employees, departments, records, fallbackHeads, search, onSearch }) {
  const [selectedDate, setDate] = useState('')
  const recentDates = [...new Set(records.map((record) => record.date))].sort().reverse()
  const date = selectedDate || recentDates[0] || todayInNairobi()
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [role, setRole] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState({ key: '', page: 1 })
  const rows = buildDailyAttendance(employees, departments, records, date, fallbackHeads)
  const summary = summarizeAttendance(rows)
  const departmentSummaries = summarizeDepartments(rows, departments)
  const filtered = filterAttendance(rows, { search, department, status, role })
  // Reset pagination when any filter changes; clamp it after roster updates.
  const filterKey = JSON.stringify([date, search, department, status, role, pageSize])
  const page = pagination.key === filterKey
    ? Math.min(pagination.page, Math.max(1, Math.ceil(filtered.length / pageSize)))
    : 1
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)

  function clearFilters() {
    onSearch('')
    setDepartment('')
    setStatus('')
    setRole('')
  }

  function viewDepartment(name) {
    onSearch('')
    setDepartment(name)
    setStatus('')
    setRole('')
  }

  return (
    <div className="attendance-page">
      <div className="employee-page-heading">
        <span className="icon-circle directory-heading-icon"><Icon name="clock" size={28} /></span>
        <div>
          <h1>Attendance Overview</h1>
          <p>Monitor employees and Heads of Departments across Hadiya Science.</p>
        </div>
        <span className="attendance-access"><Icon name="shield" size={16} /> HR Manager view</span>
      </div>

      <section className="card attendance-date-bar" aria-label="Attendance date">
        <label htmlFor="attendance-date"><Icon name="calendar" size={19} /> Attendance date</label>
        <input id="attendance-date" type="date" value={date}
          onChange={(event) => setDate(event.target.value)} />
        <span>All times in East Africa Time (UTC+3)</span>
        <div className="attendance-recent-dates">
          Recent dates:
          {recentDates.slice(0, 5).map((recentDate) => (
            <button key={recentDate} className="text-button" onClick={() => setDate(recentDate)}
              aria-pressed={date === recentDate}>{formatDate(recentDate, { year: undefined })}</button>
          ))}
        </div>
      </section>

      <div className="section-heading attendance-summary-heading">
        <div>
          <h2>Organization Summary</h2>
          <p>{formatDate(date)} · All departments · Table filters do not change these totals</p>
        </div>
      </div>
      <AttendanceStats summary={summary} />

      <div className="attendance-head-summary" aria-label="Head of Department attendance summary">
        <span><Icon name="building" size={18} /><strong>Department Heads</strong></span>
        <span><b>{summary.heads}</b> total</span>
        <span><b>{summary.headsCheckedIn}</b> with a check-in</span>
        <span><b>{summary.heads - summary.headsCheckedIn}</b> without a check-in</span>
        <button className="text-button" onClick={() => { clearFilters(); setRole('hod') }}>View HODs</button>
      </div>

      <section className="card attendance-main" aria-label="Daily attendance records">
        <div className="section-heading">
          <div>
            <h2><Icon name="users" size={18} /> Daily Attendance</h2>
            <p>One record per employee per day · Check-in and checkout</p>
          </div>
          <span className="attendance-result-count" role="status">{filtered.length} of {rows.length} staff</span>
        </div>
        <div className="employee-filters attendance-filters">
          <label className="directory-search">
            <Icon name="search" size={17} />
            <input type="search" value={search} onChange={(event) => onSearch(event.target.value)}
              placeholder="Search name, ID, or department…" aria-label="Search attendance" aria-controls="attendance-table" />
          </label>
          <select value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filter attendance by department">
            <option value="">All Departments</option>
            {departmentSummaries.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter attendance by status">
            <option value="">All Statuses</option>
            {ATTENDANCE_STATUSES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={role} onChange={(event) => setRole(event.target.value)} aria-label="Filter attendance by role">
            <option value="">Employees &amp; HODs</option>
            <option value="employee">Employees</option>
            <option value="hod">Heads of Departments</option>
          </select>
          <button className="text-button" onClick={clearFilters}>Clear Filters</button>
        </div>
        <DailyAttendanceTable rows={visible} />
        {!filtered.length && (
          <div className="empty-state">
            <Icon name="calendar" size={30} />
            <h3>{rows.length ? 'No matching attendance' : 'No staff for this date'}</h3>
            <p>{rows.length ? 'Change or clear your table filters to see more staff.' : 'The current roster has no employees hired by the selected date.'}</p>
            <button className="button button-secondary" onClick={rows.length ? clearFilters : () => setDate('')}>
              {rows.length ? 'Clear Filters' : 'Reset Date'}
            </button>
          </div>
        )}
        <Pagination page={page} pageSize={pageSize} total={filtered.length} itemLabel="staff"
          onPageChange={(next) => setPagination({ key: filterKey, page: next })} onPageSizeChange={setPageSize} />
        <p className="attendance-table-note">Missing records show “No data.” A missing check-out is not automatically marked as missed. Verification is shown separately for check-in and check-out.</p>
      </section>

      <section className="card attendance-departments" aria-label="Department attendance monitoring">
        <div className="section-heading">
          <div>
            <h2><Icon name="building" size={18} /> Department Monitoring</h2>
            <p>{formatDate(date)} · Select a department to filter the daily table</p>
          </div>
        </div>
        <div className="attendance-department-grid">
          {departmentSummaries.map((item) => (
            <button key={item.name} className="attendance-department" aria-pressed={department === item.name}
              onClick={() => viewDepartment(item.name)} aria-label={`View attendance for ${item.name}`}>
              <strong>{item.name}</strong>
              <span className="attendance-department-count"><b>{item.checkedIn}</b> / {item.total} checked in</span>
              <span className="attendance-progress" aria-hidden="true"><span style={{ width: `${item.total ? item.checkedIn / item.total * 100 : 0}%` }} /></span>
              <span className="attendance-department-details">{item.Present} present · {item.Late} late · {item.Absent} absent</span>
              <span className="attendance-department-details">{item['On Leave']} on leave · {item['No data']} no data</span>
              <span className="attendance-department-heads">HODs: {item.headsCheckedIn} / {item.heads} checked in</span>
            </button>
          ))}
        </div>
        {!departmentSummaries.length && <p className="muted-note">No departments to display.</p>}
      </section>
      <footer className="dashboard-footer attendance-footer">
        <span>Uses the current roster and department assignments. Each employee is counted once per date.</span>
        <span>Hadiya Science · IT Department</span>
      </footer>
    </div>
  )
}
