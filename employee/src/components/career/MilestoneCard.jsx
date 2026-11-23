import { CAREER_STATUS_DESCRIPTIONS } from '../../utils/validation/careerSchemas.js'
import { careerSalaryLabel } from '../../utils/formatters/careerFormat.js'

export default function MilestoneCard({ record }) {
  return (
    <details
      className={String.raw`career-details employee-page:mt-[10px] employee-page:text-[length:11px]
    employee-page:[&_summary]:cursor-pointer employee-page:[&_summary]:text-[color:var(--primary)]
    employee-page:[&_summary]:font-[600] employee-page:[&_>_div]:mt-[10px] employee-page:[&_>_div]:p-[13px]
    employee-page:[&_>_div]:rounded-[7px] employee-page:[&_>_div]:[background:#f6f9fa]
    employee-page:[&_>_div]:text-[color:var(--text-secondary)] employee-page:screen-max-700:[grid-column:2]`}
    >
      <summary>View milestone details</summary>
      <div>
        <p>{CAREER_STATUS_DESCRIPTIONS[record.status]}</p>
        <dl
          className={String.raw`career-salaries employee-page:grid employee-page:gap-[10px] employee-page:[margin-block:13px]
    employee-page:[&_dt]:text-[color:var(--text-muted)] employee-page:[&_dt]:text-[length:10px]
    employee-page:[&_dd]:font-[600]`}
        >
          <div>
            <dt>Previous base salary</dt>
            <dd>{careerSalaryLabel(record.previousSalary)}</dd>
          </div>
          <div>
            <dt>{record.newGradeName ? 'Saved target base salary' : 'Target base salary'}</dt>
            <dd>{record.newGradeName ? careerSalaryLabel(record.newSalary) : 'No change'}</dd>
          </div>
        </dl>
        <p
          className={String.raw`career-details-note employee-page:text-[length:10px] employee-page:text-[color:var(--text-muted)]`}
        >
          Salary values are saved milestone snapshots. Current salary and payroll amounts may
          differ.
        </p>
        <p
          className={String.raw`career-details-id employee-page:text-[length:10px] employee-page:text-[color:var(--text-muted)]
    employee-page:mt-[9px] employee-page:[overflow-wrap:anywhere]`}
        >
          Milestone ID: {record.id}
        </p>
      </div>
    </details>
  )
}
