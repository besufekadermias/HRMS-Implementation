import { UserRound } from 'lucide-react'
import { formatProfileDate } from '../../utils/formatters/profileDate.js'

export default function PersonalInfoCard({ user, profile }) {
  return (
    <section
      className={String.raw`surface content-card employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:p-[22px_23px]
    employee-page:screen-max-768:p-[20px_17px]`}
      aria-labelledby="personal-info-title"
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
          <h2 id="personal-info-title">
            <UserRound size={19} />
            Personal Information
          </h2>
          <p>Your personal details held by HR.</p>
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
          <dt>Full name</dt>
          <dd>{user.fullName || 'Not provided'}</dd>
        </div>
        <div>
          <dt>Gender</dt>
          <dd>{profile.gender || 'Not provided'}</dd>
        </div>
        <div>
          <dt>Date of birth</dt>
          <dd>{formatProfileDate(profile.birthDate)}</dd>
        </div>
        <div>
          <dt>Qualification</dt>
          <dd>{profile.qualification || 'Not provided'}</dd>
        </div>
        <div>
          <dt>Email / login ID</dt>
          <dd>{user.login || 'Not provided'}</dd>
        </div>
      </dl>
    </section>
  )
}
