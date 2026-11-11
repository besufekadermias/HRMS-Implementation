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
    <section
      className="card department-card employee-distribution-card"
      aria-labelledby={titleId}
    >
      <div className="section-heading">
        <div>
          <h2 id={titleId}>{title}</h2>
          <p>
            By Department{' '}
          </p>
        </div>
      </div>
      <div className="employee-distribution-content">
        <div
          className="distribution-donut"
          onMouseLeave={() => setActiveDepartment(null)}
        >
          <svg viewBox="0 0 200 200" aria-hidden="true">
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
                  className={
                    selected && activeDepartment !== index
                      ? 'distribution-slice muted-slice'
                      : 'distribution-slice'
                  }
                  onMouseEnter={() => setActiveDepartment(index)}
                >
                  <title>
                    {`${department.name}: ${department.count} (${percentage.toFixed(1)}%)`}
                  </title>
                </circle>
              )
            })}
          </svg>
          <div className="distribution-center" aria-hidden="true">
            <strong>{total}</strong>
            <span>Total</span>
          </div>
          {selected && (
            <div className="distribution-tooltip" role="tooltip">
              {selected.name}: {selected.count} (
              {((selected.count / total) * 100).toFixed(1)}%)
            </div>
          )}
        </div>
        <ul
          className="distribution-legend"
          aria-label={`Employee distribution: ${total} employees`}
        >
          {total === 0 && (
            <li className="muted-note">No employees to display.</li>
          )}
          {departments.map((department, index) => (
            <li key={department.name}>
              <button
                type="button"
                className={
                  activeDepartment === index
                    ? 'distribution-row selected'
                    : 'distribution-row'
                }
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
                <i style={{ background: department.color }} />
                <span className="distribution-name">{department.name}</span>
                <span className="distribution-count">{department.count}</span>
                <span className="distribution-percentage">
                  {((department.count / total) * 100).toFixed(1)}%
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
