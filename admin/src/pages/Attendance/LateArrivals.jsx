import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import LateArrivalsTable from '../../components/attendance/LateArrivalsTable.jsx'
import AttendanceHistoryFilters from '../../components/attendance/AttendanceHistoryFilters.jsx'
import {
  buildAttendanceHistory, filterAttendanceHistory, sortLateArrivals,
  summarizeLateArrivals, formatLateMinutes,
} from '../../services/operations/attendanceService.js'

const initialFilters = {
  startDate: '', endDate: '',
  department: '', role: '',
}

export default function LateArrivals({ employees, departments, records, fallbackHeads, search, onSearch }) {
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState('newest')
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState({ key: '', page: 1 })
  const history = buildAttendanceHistory(employees, departments, records, fallbackHeads)
  // Use the recorded daily status to select late arrivals.
  const late = history.filter((row) => row.attendanceStatus === 'Late')
  const filtered = sortLateArrivals(filterAttendanceHistory(late, { ...filters, search }), sort)
  const summary = summarizeLateArrivals(filtered)
  const invalidRange = filters.startDate && filters.endDate && filters.startDate > filters.endDate
  const filterKey = JSON.stringify([filters, search, sort, pageSize])
  const page = pagination.key === filterKey
    ? Math.min(pagination.page, Math.max(1, Math.ceil(filtered.length / pageSize))) : 1
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const departmentNames = [...new Set([...departments.map((item) => item.name), ...late.map((row) => row.department)])]

  function changeFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }
  function clearFilters() {
    setFilters(initialFilters)
    setSort('newest')
    onSearch('')
  }

  return (
    <div className="attendance-page">
      <div className="employee-page-heading">
        <span className="icon-circle directory-heading-icon"><Icon name="timer" size={28} /></span>
        <div>
          <h1>Late Arrivals</h1>
          <p>Review late attendance days for employees and Heads of Departments.</p>
        </div>
        <span className="attendance-access"><Icon name="shield" size={16} /> HR Manager view</span>
      </div>
      <p className="attendance-filter-summary">Totals reflect the current date range and all filters.</p>
      <section className="attendance-stats attendance-history-stats" aria-label="Filtered late arrival statistics">
        <StatCard label="Late Records" value={summary.occurrences} icon="timer" tone="amber" detail="One per employee per day" />
        <StatCard label="Employees Affected" value={summary.employees} icon="users" detail="Distinct employees and HODs" />
        <StatCard label="Average Delay" value={formatLateMinutes(summary.averageDelay)} icon="clock" tone="amber" detail="Known delays only" />
        <StatCard label="Longest Delay" value={formatLateMinutes(summary.longestDelay)} icon="trend" tone="amber" detail="Known delays only" />
      </section>
      <section className="card attendance-main" aria-label="Late arrival history">
        <div className="section-heading">
          <div>
            <h2><Icon name="timer" size={18} /> Late Attendance Records</h2>
            <p>Daily late status · One record per employee per day</p>
          </div>
          <span className="attendance-result-count" role="status">{filtered.length} late records</span>
        </div>
        <AttendanceHistoryFilters filters={filters} onChange={changeFilter}
          search={search} onSearch={onSearch} departments={departmentNames}
          onClear={clearFilters} tableId="late-arrivals-table">
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort late arrivals">
            <option value="newest">Newest first</option>
            <option value="delay">Largest delay first</option>
          </select>
        </AttendanceHistoryFilters>
        <LateArrivalsTable rows={visible} />
        {!filtered.length && (
          <div className="empty-state">
            <Icon name="timer" size={30} />
            <h3>{invalidRange ? 'Choose a valid date range' : 'No late arrivals found'}</h3>
            <p>{invalidRange ? 'Correct the dates above to view late arrivals.' : 'No recorded late attendance days match your filters.'}</p>
            <button className="button button-secondary" onClick={clearFilters}>Clear Filters</button>
          </div>
        )}
        <Pagination page={page} pageSize={pageSize} total={filtered.length} itemLabel="late records"
          onPageChange={(next) => setPagination({ key: filterKey, page: next })} onPageSizeChange={setPageSize} />
        <p className="attendance-table-note">
          {summary.unknownDelays} matching record{summary.unknownDelays === 1 ? ' has' : 's have'} an unavailable delay.
          Averages exclude unavailable delays.
        </p>
      </section>
      <footer className="dashboard-footer attendance-footer">
        <span>Uses the current employee roster and department assignments.</span>
        <span>Hadiya Science · IT Department</span>
      </footer>
    </div>
  )
}
