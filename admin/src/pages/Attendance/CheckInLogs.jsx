import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
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
      <div className="employee-page-heading tw:shared-base:flex tw:shared-base:items-center tw:shared-base:gap-[13px]
          tw:shared-base:mb-[23px] tw:shared-base:[&_>_div]:min-w-0 tw:shared-base:[&_>_div]:flex-1
          tw:shared-base:[&_h1]:text-[27px] tw:shared-base:[&_h1]:tracking-[-0.6px]
          tw:shared-base:[&_p]:[color:var(--text-muted)] tw:shared-base:[&_p]:text-[12px]
          tw:shared-base:[&_p]:leading-[1.7] tw:shared-base:[&_p]:mt-[4px] tw:shared-base:[&_>_.button]:shrink-0
          tw:max-[768px]:shared-base:flex-wrap tw:max-[768px]:shared-base:gap-[11px]
          tw:max-[768px]:shared-base:[&_h1]:text-[24px]
          tw:max-[768px]:shared-base:[&_p]:text-[11px]
          tw:max-[768px]:shared-base:[&_>_.button]:ml-[auto]
          tw:max-[560px]:shared-base:[&_h1]:text-[22px]">
        <span className="icon-circle directory-heading-icon tw:shared-base:w-[46px] tw:shared-base:h-[46px] tw:shared-base:shrink-0
          tw:shared-base:rounded-[50%] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:shared-base:w-[49px] tw:shared-base:h-[49px]
          tw:shared-base:[background:#d8f8ee] tw:shared-base:[color:#05695c]"><Icon name="clock" size={28} /></span>
        <div>
          <h1>Check-In Logs</h1>
          <p>Review daily check-in and checkout records across all departments.</p>
        </div>
        <span className="attendance-access tw:flex tw:items-center tw:gap-[9px] tw:text-primary tw:bg-[#e0f5ef] tw:p-[9px_12px]
          tw:rounded-[7px] tw:text-[11px] tw:whitespace-nowrap tw:max-[768px]:ml-[62px] tw:max-[400px]:ml-0"><Icon name="shield" size={16} /> HR Manager view</span>
      </div>
      <p className="attendance-filter-summary tw:mb-[12px] tw:text-[var(--text-muted)] tw:text-[11px] tw:leading-[1.6]">Daily record totals reflect the current date range and all filters.</p>
      <section className="attendance-stats attendance-history-stats tw:grid tw:grid-cols-4 tw:gap-[13px] tw:mb-[17px]
          tw:[&_.stat-card]:min-h-[115px] tw:[&_.stat-card]:p-[17px] tw:[&_.stat-card]:gap-[13px]
          tw:[&_.stat-card_.stat-value]:text-[28px] tw:[&_.stat-card:last-child_.stat-value]:text-[28px]
          tw:[&_.icon-circle]:w-[39px] tw:[&_.icon-circle]:h-[39px] tw:[&_.tone-rose]:text-[#b7405a]
          tw:[&_.tone-rose]:bg-[#fdeaf0] tw:min-[1600px]:[&_.stat-card]:p-[16px_12px]
          tw:min-[1600px]:[&_.stat-card]:gap-[9px] tw:min-[1600px]:[&_.stat-detail]:text-[9px]
          tw:max-[768px]:grid-cols-2 tw:max-[768px]:gap-[10px] tw:max-[768px]:[&_.stat-card]:p-[14px_11px]
          tw:max-[768px]:[&_.stat-card]:gap-[9px] tw:max-[768px]:[&_.stat-detail]:text-[9px]
          tw:max-[400px]:[&_.stat-card]:flex-col tw:max-[400px]:[&_.stat-content_h2]:text-[11px]
          tw:[&_.stat-card]:flex-col tw:max-[1100px]:grid-cols-2" aria-label="Filtered check-in statistics">
        <StatCard label="Daily Records" value={filtered.length} icon="clock" detail="One per employee per day" />
        <StatCard label="Employees" value={new Set(filtered.map((row) => row.id)).size} icon="users" detail="Distinct employees and HODs" />
        <StatCard label="Checked Out" value={complete} icon="check-circle" detail="Check-out recorded" />
        <StatCard label="No Check-Out" value={filtered.length - complete} icon="timer" tone="amber" detail="Check-in recorded only" />
      </section>
      <Card className="attendance-main tw:p-[19px_18px] tw:mb-[20px] tw:[&>.section-heading]:mb-[18px] tw:max-[768px]:p-[16px_12px]" aria-label="Daily attendance history">
        <div className="section-heading tw:shared-base:flex tw:shared-base:justify-between tw:shared-base:items-start
          tw:shared-base:gap-[12px] tw:shared-base:mb-[20px] tw:shared-base:[&_h2]:flex
          tw:shared-base:[&_h2]:items-center tw:shared-base:[&_h2]:gap-[9px]
          tw:shared-base:[&_h2_>_svg]:[color:var(--primary)] tw:shared-base:[&_p]:[color:var(--text-muted)]
          tw:shared-base:[&_p]:text-[12px] tw:shared-base:[&_p]:mt-[6px] tw:shared-base:[&_p]:leading-[1.5]
          tw:max-[768px]:shared-base:[&_h2]:text-[15px]
          tw:max-[768px]:shared-base:gap-[8px] tw:max-[768px]:shared-base:[&_p]:text-[11px]">
          <div>
            <h2><Icon name="file" size={18} /> Attendance History</h2>
            <p>Newest check-in first · One record per employee per day</p>
          </div>
          <span className="attendance-result-count tw:text-[var(--text-muted)] tw:text-[11px] tw:whitespace-nowrap" role="status">{filtered.length} daily records</span>
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
          <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]">
            <Icon name="clock" size={30} />
            <h3>{invalidRange ? 'Choose a valid date range' : 'No check-in records found'}</h3>
            <p>{invalidRange ? 'Correct the dates above to view attendance records.' : 'No recorded check-ins match your filters. Missing records do not imply absence.'}</p>
            <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
        <Pagination page={page} pageSize={pageSize} total={filtered.length} itemLabel="daily records"
          onPageChange={(next) => setPagination({ key: filterKey, page: next })} onPageSizeChange={setPageSize} />
        <p className="attendance-table-note tw:pt-[11px] tw:[border-top:1px_solid_var(--divider)] tw:text-[10px] tw:leading-[1.7]
          tw:text-[var(--text-muted)]">
          Each employee has one check-in and checkout per attendance day. IP filters match either event.
          An unrecorded checkout does not establish that someone is still working.
        </p>
      </Card>
      <footer className={`dashboard-footer attendance-footer tw:gap-[12px] tw:flex-wrap tw:leading-[1.7] tw:shared-footer:flex
          tw:shared-footer:justify-between tw:shared-footer:items-center tw:shared-footer:gap-[15px]
          tw:shared-footer:text-[#74909b] tw:shared-footer:p-[20px_0] tw:shared-footer:text-[10px]
          tw:max-[768px]:shared-footer:flex-wrap tw:max-[768px]:shared-footer:gap-[8px]
          tw:max-[768px]:shared-footer:text-[9px] `}>
        <span>Uses the current employee roster and department assignments.</span>
        <span className="tw:inline-flex tw:items-center tw:gap-[6px]">Hadiya Science · IT Department</span>
      </footer>
    </div>
  )
}
