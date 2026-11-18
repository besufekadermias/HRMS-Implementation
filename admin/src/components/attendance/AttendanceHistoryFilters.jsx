import { TextButton } from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'

// The two history pages share date, person, department, and role filters.
// Children supply only the controls specific to each page.
export default function AttendanceHistoryFilters({
  filters, onChange, search, onSearch, departments, onClear, tableId, children,
}) {
  const invalidRange = filters.startDate && filters.endDate && filters.startDate > filters.endDate
  return (
    <>
      <div className="attendance-history-range tw:flex tw:items-end tw:flex-wrap tw:gap-[12px] tw:pb-[16px] tw:[&_label]:grid
          tw:[&_label]:gap-[6px] tw:[&_label]:text-text-secondary tw:[&_label]:text-[11px] tw:[&_input]:h-[38px]
          tw:[&_input]:[border:1px_solid_var(--border)] tw:[&_input]:rounded-[6px] tw:[&_input]:p-[7px_10px]
          tw:[&_input]:text-text-primary tw:[&_input]:bg-white tw:[&_input]:[font:inherit]
          tw:[&_input[aria-invalid=true]]:border-[#b7405a] tw:[&>span]:pb-[10px] tw:[&>span]:text-[11px]
          tw:[&>span]:text-[var(--text-muted)] tw:max-[768px]:[&_label]:flex-[1_1_140px]
          tw:max-[768px]:[&_label]:min-w-0 tw:max-[768px]:[&_input]:w-full tw:max-[768px]:[&_input]:min-w-0
          tw:max-[768px]:[&_input]:text-[16px]">
        <label>
          From
          <input type="date" value={filters.startDate}
            aria-invalid={!!invalidRange} aria-describedby={invalidRange ? `${tableId}-date-error` : undefined}
            onChange={(event) => onChange('startDate', event.target.value)} />
        </label>
        <label>
          To
          <input type="date" value={filters.endDate}
            aria-invalid={!!invalidRange} aria-describedby={invalidRange ? `${tableId}-date-error` : undefined}
            onChange={(event) => onChange('endDate', event.target.value)} />
        </label>
        <span>Attendance dates · East Africa Time (UTC+3)</span>
      </div>
      {invalidRange && (
        <p className="field-error attendance-range-error tw:mb-[14px] tw:shared-base:block tw:shared-base:text-[11px]
          tw:shared-base:font-normal tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px]
          tw:shared-base:leading-[1.6]" role="alert" id={`${tableId}-date-error`}>
          The start date must be on or before the end date.
        </p>
      )}
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
            placeholder="Search name, ID, or department…"
            aria-label="Search attendance records" aria-controls={tableId} />
        </label>
        <select value={filters.department} onChange={(event) => onChange('department', event.target.value)}
          aria-label="Filter attendance by department">
          <option value="">All Departments</option>
          {departments.map((name) => <option key={name}>{name}</option>)}
        </select>
        <select value={filters.role} onChange={(event) => onChange('role', event.target.value)}
          aria-label="Filter attendance by role">
          <option value="">Employees &amp; HODs</option>
          <option value="employee">Employees</option>
          <option value="hod">Heads of Departments</option>
        </select>
        {children}
        <TextButton onClick={onClear}>Clear Filters</TextButton>
      </div>
    </>
  )
}
