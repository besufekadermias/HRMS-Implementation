import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import CheckInLogTable from '../../components/attendance/CheckInLogTable.jsx'
import AttendanceHistoryFilters from '../../components/attendance/AttendanceHistoryFilters.jsx'
import { ATTENDANCE_STATUSES } from '../../utils/constants/constants.js'
import {
  buildAttendanceHistory, buildCheckInLogs, filterAttendanceHistory,
} from '../../services/operations/attendanceService.js'

const initialFilters = {
  startDate: '', endDate: '',
  department: '', role: '', status: '', completion: '', verification: '',
}

export default function CheckInLogs({ employees, departments, records, fallbackHeads, search, onSearch }) {
  const [filters, setFilters] = useState(initialFilters)
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState({ key: '', page: 1 })
  const history = buildAttendanceHistory(employees, departments, records, fallbackHeads)
  const logs = buildCheckInLogs(history)
  const filtered = filterAttendanceHistory(logs, { ...filters, search })
  const invalidRange = filters.startDate && filters.endDate && filters.startDate > filters.endDate
  const filterKey = JSON.stringify([filters, search, pageSize])
  const page = pagination.key === filterKey
    ? Math.min(pagination.page, Math.max(1, Math.ceil(filtered.length / pageSize))) : 1
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const complete = filtered.filter((row) => row.checkOut).length
  const departmentNames = [...new Set([...departments.map((item) => item.name), ...logs.map((row) => row.department)])]

  function changeFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }
  function clearFilters() {
    setFilters(initialFilters)
    onSearch('')
  }

  return (
    <div className="attendance-page">
      <div className="employee-page-heading">
        <span className="icon-circle directory-heading-icon"><Icon name="clock" size={28} /></span>
        <div>
          <h1>Check-In Logs</h1>
          <p>Review daily check-in and checkout records across all departments.</p>
        </div>
        <span className="attendance-access"><Icon name="shield" size={16} /> HR Manager view</span>
      </div>
      <p className="attendance-filter-summary">Daily record totals reflect the current date range and all filters.</p>
      <section className="attendance-stats attendance-history-stats" aria-label="Filtered check-in statistics">
        <StatCard label="Daily Records" value={filtered.length} icon="clock" detail="One per employee per day" />
        <StatCard label="Employees" value={new Set(filtered.map((row) => row.id)).size} icon="users" detail="Distinct employees and HODs" />
        <StatCard label="Checked Out" value={complete} icon="check-circle" detail="Check-out recorded" />
        <StatCard label="No Check-Out" value={filtered.length - complete} icon="timer" tone="amber" detail="Check-in recorded only" />
      </section>
      <section className="card attendance-main" aria-label="Daily attendance history">
        <div className="section-heading">
          <div>
            <h2><Icon name="file" size={18} /> Attendance History</h2>
            <p>Newest check-in first · One record per employee per day</p>
          </div>
          <span className="attendance-result-count" role="status">{filtered.length} daily records</span>
        </div>
        <AttendanceHistoryFilters filters={filters} onChange={changeFilter}
          search={search} onSearch={onSearch} departments={departmentNames}
          onClear={clearFilters} tableId="check-in-logs-table">
          <select value={filters.status} onChange={(event) => changeFilter('status', event.target.value)}
            aria-label="Filter records by attendance status">
            <option value="">All Daily Statuses</option>
            {ATTENDANCE_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
          <select value={filters.completion} onChange={(event) => changeFilter('completion', event.target.value)}
            aria-label="Filter records by checkout">
            <option value="">All Check-Outs</option>
            <option value="checked-out">Checked Out</option>
            <option value="no-checkout">No Check-Out</option>
          </select>
          <select value={filters.verification} onChange={(event) => changeFilter('verification', event.target.value)}
            aria-label="Filter by IP verification at either event">
            <option value="">All IP Results</option>
            <option>Verified</option>
            <option>Unverified</option>
            <option>Unavailable</option>
          </select>
        </AttendanceHistoryFilters>
        <CheckInLogTable rows={visible} />
        {!filtered.length && (
          <div className="empty-state">
            <Icon name="clock" size={30} />
            <h3>{invalidRange ? 'Choose a valid date range' : 'No check-in records found'}</h3>
            <p>{invalidRange ? 'Correct the dates above to view attendance records.' : 'No recorded check-ins match your filters. Missing records do not imply absence.'}</p>
            <button className="button button-secondary" onClick={clearFilters}>Clear Filters</button>
          </div>
        )}
        <Pagination page={page} pageSize={pageSize} total={filtered.length} itemLabel="daily records"
          onPageChange={(next) => setPagination({ key: filterKey, page: next })} onPageSizeChange={setPageSize} />
        <p className="attendance-table-note">
          Each employee has one check-in and checkout per attendance day. IP filters match either event.
          An unrecorded checkout does not establish that someone is still working.
        </p>
      </section>
      <footer className="dashboard-footer attendance-footer">
        <span>Uses the current employee roster and department assignments.</span>
        <span>Hadiya Science · IT Department</span>
      </footer>
    </div>
  )
}
