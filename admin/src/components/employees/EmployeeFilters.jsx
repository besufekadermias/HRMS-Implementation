import Icon from '../common/Icon.jsx'
import {
  DEPARTMENTS,
  JOB_GRADES,
  EMPLOYEE_STATUSES,
} from '../../utils/constants/constants.js'

export default function EmployeeFilters({
  search,
  onSearch,
  department,
  grade,
  status,
  onFilter,
  onClear,
  departments = DEPARTMENTS,
  grades = JOB_GRADES,
}) {
  return (
    <div className="employee-filters">
      <label className="directory-search">
        <Icon name="search" size={17} />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search by name, email, or employee ID…"
          aria-label="Search employee directory"
        />
      </label>
      <select
        aria-label="Filter by department"
        value={department}
        onChange={(event) => onFilter('department', event.target.value)}
      >
        <option value="">All Departments</option>
        {departments.map((name) => (
          <option key={name}>{name}</option>
        ))}
      </select>
      <select
        aria-label="Filter by job grade"
        value={grade}
        onChange={(event) => onFilter('grade', event.target.value)}
      >
        <option value="">All Job Grades</option>
        {grades.map(({ name }) => (
          <option key={name}>{name}</option>
        ))}
      </select>
      <select
        aria-label="Filter by status"
        value={status}
        onChange={(event) => onFilter('status', event.target.value)}
      >
        <option value="">All Status</option>
        {EMPLOYEE_STATUSES.map((name) => (
          <option key={name}>{name}</option>
        ))}
      </select>
      <button type="button" className="text-button" onClick={onClear}>
        Clear All
      </button>
    </div>
  )
}
