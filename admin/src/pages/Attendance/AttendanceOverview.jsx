import Card from '../../components/common/Card.jsx'
import Button, { TextButton } from '../../components/common/Button.jsx'
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
          <h1>Attendance Overview</h1>
          <p>Monitor employees and Heads of Departments across Hadiya Science.</p>
        </div>
        <span className="attendance-access tw:flex tw:items-center tw:gap-[9px] tw:text-primary tw:bg-[#e0f5ef] tw:p-[9px_12px]
          tw:rounded-[7px] tw:text-[11px] tw:whitespace-nowrap tw:max-[768px]:ml-[62px] tw:max-[400px]:ml-0"><Icon name="shield" size={16} /> HR Manager view</span>
      </div>

      <Card className="attendance-date-bar tw:flex tw:items-center tw:flex-wrap tw:gap-[12px] tw:p-[15px_18px] tw:mb-[23px] tw:text-[11px]
          tw:text-text-secondary tw:[&>label]:flex tw:[&>label]:items-center tw:[&>label]:gap-[9px]
          tw:[&>label]:font-[600] tw:[&_input]:min-w-[150px] tw:[&_input]:min-h-[38px] tw:[&_input]:p-[7px_10px]
          tw:[&_input]:[border:1px_solid_var(--border)] tw:[&_input]:rounded-[6px] tw:[&_input]:[font:inherit]
          tw:[&_input]:text-text-primary tw:[&_input]:bg-white tw:max-[768px]:[&_input]:text-[16px]" aria-label="Attendance date">
        <label htmlFor="attendance-date"><Icon name="calendar" size={19} /> Attendance date</label>
        <input id="attendance-date" type="date" value={date}
          onChange={(event) => setDate(event.target.value)} />
        <span>All times in East Africa Time (UTC+3)</span>
        <div className="attendance-recent-dates tw:flex tw:items-center tw:gap-[9px] tw:ml-auto tw:flex-wrap
          tw:[&_.text-button]:p-[5px_7px] tw:[&_.text-button]:text-[11px] tw:[&_[aria-pressed=true]]:bg-[#e0f5ef]
          tw:[&_[aria-pressed=true]]:rounded-[5px] tw:max-[768px]:ml-0 tw:max-[768px]:w-full">
          Recent dates:
          {recentDates.slice(0, 5).map((recentDate) => (
            <TextButton key={recentDate} onClick={() => setDate(recentDate)}
              aria-pressed={date === recentDate}>{formatDate(recentDate, { year: undefined })}</TextButton>
          ))}
        </div>
      </Card>

      <div className="section-heading attendance-summary-heading tw:mb-[13px] tw:shared-base:flex tw:shared-base:justify-between
          tw:shared-base:items-start tw:shared-base:gap-[12px] tw:shared-base:mb-[20px] tw:shared-base:[&_h2]:flex
          tw:shared-base:[&_h2]:items-center tw:shared-base:[&_h2]:gap-[9px]
          tw:shared-base:[&_h2_>_svg]:[color:var(--primary)] tw:shared-base:[&_p]:[color:var(--text-muted)]
          tw:shared-base:[&_p]:text-[12px] tw:shared-base:[&_p]:mt-[6px] tw:shared-base:[&_p]:leading-[1.5]
          tw:max-[768px]:shared-base:[&_h2]:text-[15px]
          tw:max-[768px]:shared-base:gap-[8px] tw:max-[768px]:shared-base:[&_p]:text-[11px]">
        <div>
          <h2>Organization Summary</h2>
          <p>{formatDate(date)} · All departments · Table filters do not change these totals</p>
        </div>
      </div>
      <AttendanceStats summary={summary} />

      <div className="attendance-head-summary tw:flex tw:items-center tw:flex-wrap tw:gap-[12px_22px] tw:p-[14px_18px] tw:mb-[19px]
          tw:[border:1px_solid_#d8eae7] tw:rounded-[8px] tw:bg-[#edf7f4] tw:text-[#315d55] tw:text-[11px]
          tw:[&>span]:flex tw:[&>span]:items-center tw:[&>span]:gap-[9px] tw:[&>.text-button]:ml-auto
          tw:[&>.text-button]:text-[11px] tw:max-[400px]:[&>.text-button]:ml-0" aria-label="Head of Department attendance summary">
        <span><Icon name="building" size={18} /><strong>Department Heads</strong></span>
        <span><b>{summary.heads}</b> total</span>
        <span><b>{summary.headsCheckedIn}</b> with a check-in</span>
        <span><b>{summary.heads - summary.headsCheckedIn}</b> without a check-in</span>
        <TextButton onClick={() => { clearFilters(); setRole('hod') }}>View HODs</TextButton>
      </div>

      <Card className="attendance-main tw:p-[19px_18px] tw:mb-[20px] tw:[&>.section-heading]:mb-[18px] tw:max-[768px]:p-[16px_12px]" aria-label="Daily attendance records">
        <div className="section-heading tw:shared-base:flex tw:shared-base:justify-between tw:shared-base:items-start
          tw:shared-base:gap-[12px] tw:shared-base:mb-[20px] tw:shared-base:[&_h2]:flex
          tw:shared-base:[&_h2]:items-center tw:shared-base:[&_h2]:gap-[9px]
          tw:shared-base:[&_h2_>_svg]:[color:var(--primary)] tw:shared-base:[&_p]:[color:var(--text-muted)]
          tw:shared-base:[&_p]:text-[12px] tw:shared-base:[&_p]:mt-[6px] tw:shared-base:[&_p]:leading-[1.5]
          tw:max-[768px]:shared-base:[&_h2]:text-[15px]
          tw:max-[768px]:shared-base:gap-[8px] tw:max-[768px]:shared-base:[&_p]:text-[11px]">
          <div>
            <h2><Icon name="users" size={18} /> Daily Attendance</h2>
            <p>One record per employee per day · Check-in and checkout</p>
          </div>
          <span className="attendance-result-count tw:text-[var(--text-muted)] tw:text-[11px] tw:whitespace-nowrap" role="status">{filtered.length} of {rows.length} staff</span>
        </div>
        <div className="employee-filters attendance-filters tw:flex tw:items-center tw:flex-wrap tw:gap-[9px] tw:pb-[17px]
          tw:[&_.directory-search]:basis-[240px] tw:[&>select]:flex-[1_1_150px] tw:[&>select]:min-w-0
          tw:[&>select]:max-w-[245px] tw:[&>select]:h-[38px] tw:[&>select]:p-[8px_25px_8px_10px]
          tw:[&>select]:[border:1px_solid_var(--border)] tw:[&>select]:rounded-[6px]
          tw:[&>select]:text-text-secondary tw:[&>select]:bg-white tw:[&>select]:text-ellipsis
          tw:[&_.directory-search_input]:text-[11px] tw:[&>select]:text-[11px] tw:[&>.text-button]:text-[11px]
          tw:[&>.text-button]:p-[6px] tw:max-[768px]:gap-[8px] tw:max-[768px]:[&_.directory-search]:basis-full
          tw:max-[768px]:[&>select]:max-w-none tw:max-[768px]:[&>select]:text-[16px]
          tw:max-[768px]:[&_input]:text-[16px]">
          <label className="directory-search tw:shared-base:flex tw:shared-base:items-center tw:shared-base:gap-[8px]
          tw:shared-base:min-w-[190px] tw:shared-base:[flex:1_1_240px]
          tw:shared-base:[border:1px_solid_var(--border)] tw:shared-base:rounded-[6px] tw:shared-base:p-[9px_10px]
          tw:shared-base:[color:#658da0] tw:shared-base:h-[38px]
          tw:[:where(&):focus-within]:[outline:2px_solid_var(--primary)]
          tw:[:where(&):focus-within]:[outline-offset:2px] tw:shared-base:[&_input]:w-full
          tw:shared-base:[&_input]:min-w-0 tw:shared-base:[&_input]:[border:0] tw:shared-base:[&_input]:[outline:0]
          tw:shared-base:[&_input]:text-[10px] tw:shared-base:[&_input]:[color:var(--text-primary)]
          tw:shared-base:[&_input]:[background:transparent] tw:shared-base:[&_input::placeholder]:[color:#628097]
          tw:max-[768px]:shared-base:[flex-basis:100%]">
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
          <TextButton onClick={clearFilters}>Clear Filters</TextButton>
        </div>
        <DailyAttendanceTable rows={visible} />
        {!filtered.length && (
          <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]">
            <Icon name="calendar" size={30} />
            <h3>{rows.length ? 'No matching attendance' : 'No staff for this date'}</h3>
            <p>{rows.length ? 'Change or clear your table filters to see more staff.' : 'The current roster has no employees hired by the selected date.'}</p>
            <Button variant="secondary" onClick={rows.length ? clearFilters : () => setDate('')}>
              {rows.length ? 'Clear Filters' : 'Reset Date'}
            </Button>
          </div>
        )}
        <Pagination page={page} pageSize={pageSize} total={filtered.length} itemLabel="staff"
          onPageChange={(next) => setPagination({ key: filterKey, page: next })} onPageSizeChange={setPageSize} />
        <p className="attendance-table-note tw:pt-[11px] tw:[border-top:1px_solid_var(--divider)] tw:text-[10px] tw:leading-[1.7]
          tw:text-[var(--text-muted)]">Missing records show “No data.” A missing check-out is not automatically marked as missed. Verification is shown separately for check-in and check-out.</p>
      </Card>

      <Card className="attendance-departments tw:p-[19px_18px] tw:mb-[20px] tw:max-[768px]:p-[16px_12px]" aria-label="Department attendance monitoring">
        <div className="section-heading tw:shared-base:flex tw:shared-base:justify-between tw:shared-base:items-start
          tw:shared-base:gap-[12px] tw:shared-base:mb-[20px] tw:shared-base:[&_h2]:flex
          tw:shared-base:[&_h2]:items-center tw:shared-base:[&_h2]:gap-[9px]
          tw:shared-base:[&_h2_>_svg]:[color:var(--primary)] tw:shared-base:[&_p]:[color:var(--text-muted)]
          tw:shared-base:[&_p]:text-[12px] tw:shared-base:[&_p]:mt-[6px] tw:shared-base:[&_p]:leading-[1.5]
          tw:max-[768px]:shared-base:[&_h2]:text-[15px]
          tw:max-[768px]:shared-base:gap-[8px] tw:max-[768px]:shared-base:[&_p]:text-[11px]">
          <div>
            <h2><Icon name="building" size={18} /> Department Monitoring</h2>
            <p>{formatDate(date)} · Select a department to filter the daily table</p>
          </div>
        </div>
        <div className="attendance-department-grid tw:grid tw:grid-cols-[repeat(auto-fit,_minmax(185px,_1fr))] tw:gap-[12px]
          tw:max-[400px]:grid-cols-1">
          {departmentSummaries.map((item) => (
            <button key={item.name} className="attendance-department tw:flex tw:flex-col tw:items-stretch tw:gap-[9px] tw:p-[16px]
          tw:[border:1px_solid_var(--border)] tw:rounded-[8px] tw:text-text-secondary tw:bg-white tw:text-left
          tw:hover:border-[#8abdb2] tw:hover:bg-[#f7fbf9] tw:aria-pressed:border-primary
          tw:aria-pressed:bg-[#eff9f5] tw:[&>strong]:text-[11px] tw:[&>strong]:leading-[1.6]
          tw:[&>strong]:text-text-primary tw:[&>strong]:min-h-[35px]" aria-pressed={department === item.name}
              onClick={() => viewDepartment(item.name)} aria-label={`View attendance for ${item.name}`}>
              <strong>{item.name}</strong>
              <span className="attendance-department-count tw:text-[11px] tw:mt-auto tw:[&_b]:text-[24px] tw:[&_b]:text-primary tw:[&_b]:mr-[4px]"><b>{item.checkedIn}</b> / {item.total} checked in</span>
              <span className="attendance-progress tw:h-[5px] tw:overflow-hidden tw:rounded-[4px] tw:bg-[#e6efec] tw:[&>span]:block
          tw:[&>span]:h-full tw:[&>span]:rounded-[inherit] tw:[&>span]:bg-[#13aa83]" aria-hidden="true"><span style={{ width: `${item.total ? item.checkedIn / item.total * 100 : 0}%` }} /></span>
              <span className="attendance-department-details tw:text-[9px] tw:leading-[1.5]">{item.Present} present · {item.Late} late · {item.Absent} absent</span>
              <span className="attendance-department-details tw:text-[9px] tw:leading-[1.5]">{item['On Leave']} on leave · {item['No data']} no data</span>
              <span className="attendance-department-heads tw:text-[10px] tw:pt-[8px] tw:[border-top:1px_solid_var(--divider)] tw:text-[#386c60]">HODs: {item.headsCheckedIn} / {item.heads} checked in</span>
            </button>
          ))}
        </div>
        {!departmentSummaries.length && <p className="muted-note tw:shared-base:block tw:shared-base:[color:var(--text-muted)] tw:shared-base:text-[12px]
          tw:shared-base:leading-[1.8] tw:shared-base:mt-[17px]">No departments to display.</p>}
      </Card>
      <footer className={`dashboard-footer attendance-footer tw:gap-[12px] tw:flex-wrap tw:leading-[1.7] tw:shared-footer:flex
          tw:shared-footer:justify-between tw:shared-footer:items-center tw:shared-footer:gap-[15px]
          tw:shared-footer:text-[#74909b] tw:shared-footer:p-[20px_0] tw:shared-footer:text-[10px]
          tw:max-[768px]:shared-footer:flex-wrap tw:max-[768px]:shared-footer:gap-[8px]
          tw:max-[768px]:shared-footer:text-[9px] `}>
        <span>Uses the current roster and department assignments. Each employee is counted once per date.</span>
        <span className="tw:inline-flex tw:items-center tw:gap-[6px]">Hadiya Science · IT Department</span>
      </footer>
    </div>
  )
}
