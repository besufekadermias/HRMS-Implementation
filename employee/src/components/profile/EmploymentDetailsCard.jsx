import { BriefcaseBusiness } from 'lucide-react'
import { formatEmploymentLabel, formatProfileDate } from '../../utils/formatters/profileDate.js'

export default function EmploymentDetailsCard({ user, profile }) {
  return (
    <section
      className={String.raw`surface content-card employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:p-[22px_23px]
    employee-page:screen-max-768:p-[20px_17px]`}
      aria-labelledby="employment-details-title"
    >
      <div
        className={String.raw`section-heading employee-base:flex employee-base:items-start employee-base:justify-between
    employee-base:gap-[12px] employee-base:mb-[20px] employee-base:[&_h2]:flex
    employee-base:[&_h2]:items-center employee-base:[&_h2]:gap-[9px]
    employee-base:[&_h2_svg]:text-[color:var(--primary)] employee-base:[&_p]:mt-[6px]
    employee-base:[&_p]:text-[color:var(--text-muted)] employee-base:[&_p]:text-[length:12px]
    employee-base:[&_p]:leading-[1.5] employee-page:screen-max-768:[&_h2]:text-[length:15px]`}
      >
        <div>
          <h2 id="employment-details-title">
            <BriefcaseBusiness size={19} />
            Employment Details
          </h2>
          <p>Your official department and civil service record.</p>
        </div>
      </div>
      <dl
        className={String.raw`detail-grid employee-base:grid employee-base:grid-cols-[repeat(2,_minmax(0,_1fr))] employee-base:gap-[22px]
    employee-base:mt-[22px] employee-base:[&_dt]:text-[length:11px]
    employee-base:[&_dt]:text-[color:var(--text-muted)] employee-base:[&_dd]:mt-[7px]
    employee-base:[&_dd]:text-[length:13px] employee-base:[&_dd]:font-[600]
    employee-base:[&_dd]:[overflow-wrap:anywhere] employee-page:screen-max-480:grid-cols-[minmax(0,_1fr)]
    employee-page:screen-max-480:gap-[19px]`}
      >
        <div>
          <dt>Employee ID</dt>
          <dd>{user.serialNumber || 'Not assigned'}</dd>
        </div>
        <div>
          <dt>Civil department</dt>
          <dd>{user.department || 'Not assigned'}</dd>
        </div>
        <div>
          <dt>Job grade &amp; salary scale</dt>
          <dd>
            {user.grade || 'Not assigned'}
            <span className="mt-1 block text-[12px] font-normal text-text-secondary">
              {user.baseSalary == null
                ? 'Salary scale not assigned'
                : new Intl.NumberFormat('en-ET', {
                    style: 'currency',
                    currency: 'ETB',
                    maximumFractionDigits: 2,
                  }).format(user.baseSalary)}
            </span>
          </dd>
        </div>
        <div>
          <dt>Employment type</dt>
          <dd>{formatEmploymentLabel(user.employmentType)}</dd>
        </div>
        <div>
          <dt>Official hired date</dt>
          <dd>{formatProfileDate(profile.hiredDate)}</dd>
        </div>
        <div>
          <dt>Employment status</dt>
          <dd>{formatEmploymentLabel(user.employmentStatus)}</dd>
        </div>
        <div>
          <dt>Portal role</dt>
          <dd>{formatEmploymentLabel(user.role)}</dd>
        </div>
      </dl>
    </section>
  )
}
