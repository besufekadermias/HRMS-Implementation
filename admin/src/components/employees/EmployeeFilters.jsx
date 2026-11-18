import { TextButton } from '../common/Button.jsx'
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
    <div className="employee-filters tw:flex tw:items-center tw:flex-wrap tw:gap-[9px] tw:pb-[17px] tw:max-[768px]:gap-[8px]">
      <label className="directory-search tw:flex tw:items-center tw:gap-[8px] tw:min-w-[190px] tw:flex-[1_1_240px]
          tw:[border:1px_solid_var(--border)] tw:rounded-[6px] tw:p-[9px_10px] tw:text-[#658da0] tw:h-[38px]
          tw:focus-within:[outline:2px_solid_var(--primary)] tw:focus-within:outline-offset-[2px]
          tw:max-[768px]:basis-full tw:shared-base:flex tw:shared-base:items-center tw:shared-base:gap-[8px]
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
        <input
          className="tw:w-full tw:min-w-0 tw:border-0 tw:[outline:0] tw:text-[10px] tw:text-text-primary tw:bg-transparent
            tw:placeholder:text-[#628097]"
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search by name, email, or employee ID…"
          aria-label="Search employee directory"
        />
      </label>
      <select
        className="tw:flex-[1_1_115px] tw:min-w-0 tw:max-w-[190px] tw:h-[38px] tw:p-[8px_25px_8px_10px]
          tw:[border:1px_solid_var(--border)] tw:rounded-[6px] tw:text-text-secondary tw:bg-white tw:text-[10px]
          tw:text-ellipsis tw:max-[768px]:flex-[1_1_100px] tw:max-[768px]:max-w-none tw:max-[380px]:basis-full"
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
        className="tw:flex-[1_1_115px] tw:min-w-0 tw:max-w-[190px] tw:h-[38px] tw:p-[8px_25px_8px_10px]
          tw:[border:1px_solid_var(--border)] tw:rounded-[6px] tw:text-text-secondary tw:bg-white tw:text-[10px]
          tw:text-ellipsis tw:max-[768px]:flex-[1_1_100px] tw:max-[768px]:max-w-none tw:max-[380px]:basis-full"
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
        className="tw:flex-[1_1_115px] tw:min-w-0 tw:max-w-[190px] tw:h-[38px] tw:p-[8px_25px_8px_10px]
          tw:[border:1px_solid_var(--border)] tw:rounded-[6px] tw:text-text-secondary tw:bg-white tw:text-[10px]
          tw:text-ellipsis tw:max-[768px]:flex-[1_1_100px] tw:max-[768px]:max-w-none tw:max-[380px]:basis-full"
        aria-label="Filter by status"
        value={status}
        onChange={(event) => onFilter('status', event.target.value)}
      >
        <option value="">All Status</option>
        {EMPLOYEE_STATUSES.map((name) => (
          <option key={name}>{name}</option>
        ))}
      </select>
      <TextButton className="tw:[.employee-filters>&]:text-[10px] tw:[.employee-filters>&]:p-[6px]" type="button" onClick={onClear}>
        Clear All
      </TextButton>
    </div>
  )
}
