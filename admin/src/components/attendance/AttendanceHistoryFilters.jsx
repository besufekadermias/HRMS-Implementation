import Icon from '../common/Icon.jsx'

// The two history pages share date, person, department, and role filters.
// Children supply only the controls specific to each page.
export default function AttendanceHistoryFilters({
  filters, onChange, search, onSearch, departments, onClear, tableId, children,
}) {
  const invalidRange = filters.startDate && filters.endDate && filters.startDate > filters.endDate
  return (
    <>
      <div className="attendance-history-range">
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
        <p className="field-error attendance-range-error" role="alert" id={`${tableId}-date-error`}>
          The start date must be on or before the end date.
        </p>
      )}
      <div className="employee-filters attendance-filters">
        <label className="directory-search">
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
        <button className="text-button" onClick={onClear}>Clear Filters</button>
      </div>
    </>
  )
}
