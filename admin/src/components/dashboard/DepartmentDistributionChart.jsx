import Card from '../common/Card.jsx'
import { useId, useState } from 'react'

// Initial dashboard distribution; callers can supply department totals.
const initialDepartments = [
  { name: 'Development', count: 18, color: '#257c70' },
  { name: 'Marketing', count: 8, color: '#39aa97' },
  { name: 'Design', count: 7, color: '#ffc447' },
  { name: 'HR', count: 5, color: '#648194' },
  { name: 'Finance', count: 5, color: '#9a9eea' },
  { name: 'Others', count: 5, color: '#c5d8e2' },
]
export default function DepartmentDistributionChart({
  data = initialDepartments,
  title = 'Employee Distribution',
}) {
  const departments = data.filter((department) => department.count > 0)
  const total = departments.reduce(
    (sum, department) => sum + department.count,
    0,
  )
  const titleId = useId()
  const [activeDepartment, setActiveDepartment] = useState(null)
  const selected =
    activeDepartment !== null ? departments[activeDepartment] : null

  return (
    <Card
      className={`department-card employee-distribution-card tw:[.dashboard-middle>&]:p-[18px_16px] tw:flex tw:flex-col
        tw:[.directory-aside>&]:p-[15px_13px] tw:p-[22px_23px_0] tw:min-[1024px]:max-[1280px]:px-[17px]
        tw:max-[768px]:p-[20px_18px_0] `}
      aria-labelledby={titleId}
    >
      <div className="section-heading tw:[.department-aside_&]:mb-[15px] tw:[.department-aside_&_h2]:text-[12px]
          tw:[.department-aside_&_p]:hidden tw:[.directory-aside_&]:mb-[8px] tw:[.directory-aside_&_h2]:text-[12px]
          tw:[.directory-aside_&_p]:hidden tw:shared-base:flex tw:shared-base:justify-between
          tw:shared-base:items-start tw:shared-base:gap-[12px] tw:shared-base:mb-[20px] tw:shared-base:[&_h2]:flex
          tw:shared-base:[&_h2]:items-center tw:shared-base:[&_h2]:gap-[9px]
          tw:shared-base:[&_h2_>_svg]:[color:var(--primary)] tw:shared-base:[&_p]:[color:var(--text-muted)]
          tw:shared-base:[&_p]:text-[12px] tw:shared-base:[&_p]:mt-[6px] tw:shared-base:[&_p]:leading-[1.5]
          tw:max-[768px]:shared-base:[&_h2]:text-[15px]
          tw:max-[768px]:shared-base:gap-[8px] tw:max-[768px]:shared-base:[&_p]:text-[11px]">
        <div>
          <h2 id={titleId}>{title}</h2>
          <p>
            By Department{' '}
          </p>
        </div>
      </div>
      <div className={`employee-distribution-content tw:[.department-aside_&]:grid
          tw:[.department-aside_&]:grid-cols-[minmax(100px,_0.85fr)_minmax(0,_1.15fr)]
          tw:[.department-aside_&]:gap-[10px] tw:[.department-aside_&]:min-h-0 tw:[.department-aside_&]:p-0
          tw:max-[1440px]:[.department-aside_&]:grid-cols-[minmax(0,_1fr)]
          tw:max-[640px]:[.department-aside_&]:grid-cols-[minmax(100px,_0.85fr)_minmax(0,_1.15fr)]
          tw:[.directory-aside_&]:grid tw:[.directory-aside_&]:grid-cols-[minmax(0,_0.8fr)_minmax(0,_1.2fr)]
          tw:[.directory-aside_&]:gap-[9px] tw:[.directory-aside_&]:min-h-0 tw:[.directory-aside_&]:p-[9px_0]
          tw:[.dashboard-middle_&]:grid tw:[.dashboard-middle_&]:grid-cols-[minmax(0,_0.9fr)_minmax(0,_1.1fr)]
          tw:[.dashboard-middle_&]:gap-[12px] tw:[.dashboard-middle_&]:min-h-[0]
          tw:[.dashboard-middle_&]:p-[16px_0] tw:[.dashboard-middle_&]:content-center tw:flex tw:items-center
          tw:justify-center tw:flex-wrap tw:gap-[18px_24px] tw:flex-[1] tw:min-h-[285px] tw:p-[15px_0_30px]
          tw:max-[480px]:gap-[14px] tw:max-[480px]:[.dashboard-middle_&]:grid-cols-[minmax(0,_1fr)] `}>
        <div
          className={`distribution-donut tw:[.department-aside_&]:w-full tw:[.department-aside_&]:max-w-[160px]
            tw:[.department-aside_&]:min-w-0 tw:[.department-aside_&]:justify-self-center
            tw:[.directory-aside_&]:w-full tw:[.directory-aside_&]:min-w-0
            tw:max-[560px]:[.directory-aside_&]:max-w-[145px]
            tw:max-[560px]:[.directory-aside_&]:justify-self-center tw:[.dashboard-middle_&]:w-[100%]
            tw:[.dashboard-middle_&]:max-w-[170px] tw:[.dashboard-middle_&]:justify-self-center tw:relative
            tw:flex-[0_1_200px] tw:w-[200px] tw:max-w-[100%] tw:aspect-[1] tw:max-[480px]:basis-[180px]
            tw:max-[480px]:w-[180px] tw:max-[480px]:[.dashboard-middle_&]:max-w-[180px] `}
          onMouseLeave={() => setActiveDepartment(null)}
        >
          <svg className="tw:block tw:w-[100%] tw:h-[100%]" viewBox="0 0 200 200" aria-hidden="true">
            {total === 0 && (
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="#e4eeeb"
                strokeWidth="32"
              />
            )}
            {departments.map((department, index) => {
              const percentage = (department.count / total) * 100
              const offset =
                (departments
                  .slice(0, index)
                  .reduce((sum, item) => sum + item.count, 0) /
                  total) *
                100
              return (
                <circle
                  key={department.name}
                  cx="100"
                  cy="100"
                  r="78"
                  fill="none"
                  stroke={department.color}
                  strokeWidth="32"
                  pathLength="100"
                  strokeDasharray={`${Math.max(0, percentage - 0.4)} ${100 - Math.max(0, percentage - 0.4)}`}
                  strokeDashoffset={-offset - 0.2}
                  transform="rotate(-90 100 100)"
                  className={`distribution-slice tw:[transition:opacity_0.15s] tw:[&.muted-slice]:opacity-[0.45] ${selected && activeDepartment !== index ? "muted-slice" : ""}`}
                  onMouseEnter={() => setActiveDepartment(index)}
                >
                  <title>
                    {`${department.name}: ${department.count} (${percentage.toFixed(1)}%)`}
                  </title>
                </circle>
              )
            })}
          </svg>
          <div className="distribution-center tw:absolute tw:[inset:0] tw:flex tw:items-center tw:justify-center tw:flex-col tw:gap-[5px]
          tw:pointer-events-none" aria-hidden="true">
            <strong className="tw:[.department-aside_&]:text-[22px] tw:text-[25px] tw:font-[650] tw:[.directory-aside_&]:text-[18px]
          tw:max-[560px]:[.directory-aside_&]:text-[22px]">{total}</strong>
            <span className="tw:[.department-aside_&]:text-[9px] tw:text-[12px] tw:text-[var(--text-secondary)]
          tw:[.directory-aside_&]:text-[9px]">Total</span>
          </div>
          {selected && (
            <div className={`distribution-tooltip tw:[.department-aside_&]:w-[180px] tw:[.department-aside_&]:max-w-[220%]
          tw:[.department-aside_&]:whitespace-normal tw:[.department-aside_&]:text-center
          tw:[.directory-aside_&]:whitespace-normal tw:[.directory-aside_&]:w-[170px]
          tw:[.directory-aside_&]:max-w-[250%] tw:[.directory-aside_&]:text-[10px]
          tw:[.directory-aside_&]:text-center tw:absolute tw:bottom-[0] tw:left-[50%]
          tw:[transform:translateX(-50%)] tw:p-[8px_11px] tw:rounded-[6px] tw:text-[white] tw:bg-[#123f3b]
          tw:shadow-[0_3px_10px_#123f3b20] tw:text-[11px] tw:whitespace-nowrap tw:pointer-events-none `} role="tooltip">
              {selected.name}: {selected.count} (
              {((selected.count / total) * 100).toFixed(1)}%)
            </div>
          )}
        </div>
        <ul
          className={`distribution-legend tw:[.dashboard-middle_&]:w-[100%] tw:[.dashboard-middle_&]:justify-self-center
            tw:flex-[1_1_210px] tw:max-w-[300px] tw:p-[0] tw:m-[0] tw:list-none `}
          aria-label={`Employee distribution: ${total} employees`}
        >
          {total === 0 && (
            <li className="muted-note tw:shared-base:block tw:shared-base:[color:var(--text-muted)] tw:shared-base:text-[12px]
          tw:shared-base:leading-[1.8] tw:shared-base:mt-[17px]">No employees to display.</li>
          )}
          {departments.map((department, index) => (
            <li key={department.name}>
              <button
                type="button"
                className={`distribution-row tw:[.department-aside_&]:p-[5px_0] tw:[.department-aside_&]:gap-[5px]
          tw:[.department-aside_&]:text-[9px] tw:[.directory-aside_&]:text-[8px] tw:[.directory-aside_&]:gap-[5px]
          tw:[.directory-aside_&]:p-[4px_0] tw:[.directory-aside_&]:items-start
          tw:max-[560px]:[.directory-aside_&]:text-[10px] tw:flex tw:items-center tw:gap-[10px] tw:w-full
          tw:min-h-[34px] tw:p-[7px_5px] tw:[border:0] tw:rounded-[5px] tw:bg-[transparent] tw:text-[11px]
          tw:text-left tw:hover:bg-[#f3f9f7] tw:[&.selected]:bg-[#f3f9f7] tw:[.dashboard-middle_&]:gap-[6px]
          tw:[.dashboard-middle_&]:px-[0] ${activeDepartment === index ? "selected" : ""}`}
                onMouseEnter={() => setActiveDepartment(index)}
                onMouseLeave={() => setActiveDepartment(null)}
                onFocus={() => setActiveDepartment(index)}
                onBlur={() => setActiveDepartment(null)}
                onClick={() => setActiveDepartment(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setActiveDepartment(null)
                }}
                aria-label={`${department.name}: ${department.count} employees, ${((department.count / total) * 100).toFixed(1)} percent`}
              >
                <i className="tw:[.department-aside_&]:w-[5px] tw:[.department-aside_&]:h-[5px] tw:w-[7px] tw:h-[7px]
          tw:[.directory-aside_&]:w-[5px] tw:[.directory-aside_&]:h-[5px] tw:[.directory-aside_&]:mt-[4px]
          tw:shrink-[0] tw:rounded-[50%]" style={{ background: department.color }} />
                <span className="distribution-name tw:[.department-aside_&]:min-w-0 tw:[.department-aside_&]:[overflow-wrap:anywhere]
          tw:[.department-aside_&]:leading-[1.6] tw:[.directory-aside_&]:min-w-0
          tw:[.directory-aside_&]:[overflow-wrap:anywhere] tw:[.directory-aside_&]:leading-[1.5]
          tw:[.dashboard-middle_&]:min-w-[0] tw:[.dashboard-middle_&]:[overflow-wrap:anywhere] tw:flex-[1]">{department.name}</span>
                <span className="distribution-count tw:[.department-aside_&]:w-[12px] tw:[.department-aside_&]:shrink-0
          tw:[.directory-aside_&]:w-[12px] tw:[.directory-aside_&]:shrink-0
          tw:max-[560px]:[.directory-aside_&]:w-[16px] tw:[.dashboard-middle_&]:shrink-[0]
          tw:[.dashboard-middle_&]:w-[18px] tw:w-[20px] tw:text-right tw:text-[var(--text-secondary)]">{department.count}</span>
                <span className="distribution-percentage tw:[.department-aside_&]:w-[31px] tw:[.department-aside_&]:shrink-0
          tw:[.directory-aside_&]:w-[30px] tw:[.directory-aside_&]:shrink-0
          tw:max-[560px]:[.directory-aside_&]:w-[36px] tw:[.dashboard-middle_&]:shrink-[0]
          tw:[.dashboard-middle_&]:w-[38px] tw:w-[43px] tw:text-right tw:text-[var(--text-secondary)]">
                  {((department.count / total) * 100).toFixed(1)}%
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
