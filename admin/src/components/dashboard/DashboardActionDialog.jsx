import Button from '../common/Button.jsx'
import Modal, { DialogIntro, ModalActions } from '../common/Modal.jsx'
import Icon from '../common/Icon.jsx'
import {
  ATTENDANCE,
  SNAPSHOT,
  SNAPSHOT_DATE,
} from '../../utils/constants/constants.js'
import formatDate from '../../utils/formatters/formatDate.js'

const titles = {
  departments: 'Departments',
  grades: 'Grades & Scales',
  attendance: 'Daily Attendance Log',
  applicants: 'Candidate Applications',
  profile: 'Manager Profile',
  logout: 'Leave this workspace?',
  rewards: 'Rewards & Recognition',
  discipline: 'Discipline',
  career: 'Career Tracking',
}

export default function DashboardActionDialog({
  action,
  employees,
  onClose,
  onLogout,
}) {
  let content

  if (action === 'attendance') {
    content = (
      <>
        <DialogIntro >
          {formatDate(SNAPSHOT_DATE, { weekday: 'long', month: 'long' })} ·{' '}
          {SNAPSHOT.activeStaff} active employees
        </DialogIntro>
        <div className="summary-list tw:shared-base:[&_>_div]:flex tw:shared-base:[&_>_div]:items-center
          tw:shared-base:[&_>_div]:justify-between tw:shared-base:[&_>_div]:gap-[15px]
          tw:shared-base:[&_>_div]:p-[15px_4px] tw:shared-base:[&_>_div]:[border-bottom:1px_solid_var(--divider)]
          tw:shared-base:[&_>_div]:text-[13px] tw:shared-base:[&_>_div]:[color:var(--text-secondary)]
          tw:shared-base:[&_>_div_>_span]:inline-flex tw:shared-base:[&_>_div_>_span]:items-center
          tw:shared-base:[&_>_div_>_span]:gap-[12px] tw:shared-base:[&_b]:[color:var(--primary)]
          tw:shared-base:[&_b]:text-[16px] tw:shared-base:[&_b]:whitespace-nowrap
          tw:shared-base:[&_b_>_small]:text-[11px] tw:shared-base:[&_b_>_small]:font-normal
          tw:shared-base:[&_b_>_small]:[color:var(--text-muted)]
          tw:max-[480px]:shared-base:[&_>_div]:text-[12px]
          tw:max-[480px]:shared-base:[&_b_>_small]:block">
          {ATTENDANCE.map((item) => (
            <div key={item.key}>
              <span>
                <Icon name={item.icon} />
                <strong>{item.label}</strong>
              </span>
              <b>{item.count}</b>
            </div>
          ))}
        </div>
        <div className="notice tw:shared-base:flex tw:shared-base:items-start tw:shared-base:gap-[11px] tw:shared-base:[background:#f0f8f6]
          tw:shared-base:[border:1px_solid_#daeee6] tw:shared-base:[color:#46756c] tw:shared-base:p-[13px_14px]
          tw:shared-base:rounded-[7px] tw:shared-base:m-[18px_0] tw:shared-base:text-[12px]
          tw:shared-base:leading-[1.7] tw:shared-base:[&_>_svg]:mt-[2px] tw:shared-base:[&_>_svg]:w-[18px]">
          <Icon name="info" />
          <p>
            No individual attendance records are available for this date.
          </p>
        </div>
      </>
    )
  } else if (action === 'departments' || action === 'grades') {
    const field = action === 'departments' ? 'department' : 'grade'
    const groups = employees.reduce(
      (result, employee) => ({
        ...result,
        [employee[field]]: (result[employee[field]] || 0) + 1,
      }),
      {},
    )
    content = (
      <>
        <DialogIntro >
          Employee counts from the current personnel roster.
        </DialogIntro>
        <div className="summary-list tw:shared-base:[&_>_div]:flex tw:shared-base:[&_>_div]:items-center
          tw:shared-base:[&_>_div]:justify-between tw:shared-base:[&_>_div]:gap-[15px]
          tw:shared-base:[&_>_div]:p-[15px_4px] tw:shared-base:[&_>_div]:[border-bottom:1px_solid_var(--divider)]
          tw:shared-base:[&_>_div]:text-[13px] tw:shared-base:[&_>_div]:[color:var(--text-secondary)]
          tw:shared-base:[&_>_div_>_span]:inline-flex tw:shared-base:[&_>_div_>_span]:items-center
          tw:shared-base:[&_>_div_>_span]:gap-[12px] tw:shared-base:[&_b]:[color:var(--primary)]
          tw:shared-base:[&_b]:text-[16px] tw:shared-base:[&_b]:whitespace-nowrap
          tw:shared-base:[&_b_>_small]:text-[11px] tw:shared-base:[&_b_>_small]:font-normal
          tw:shared-base:[&_b_>_small]:[color:var(--text-muted)]
          tw:max-[480px]:shared-base:[&_>_div]:text-[12px]
          tw:max-[480px]:shared-base:[&_b_>_small]:block">
          {Object.entries(groups).map(([label, count]) => (
            <div key={label}>
              <span>{label}</span>
              <b>
                {count} <small>{count === 1 ? 'employee' : 'employees'}</small>
              </b>
            </div>
          ))}
        </div>
      </>
    )
  } else if (action === 'applicants') {
    content = (
      <>
        <div className="feature-total tw:shared-base:flex tw:shared-base:items-center tw:shared-base:gap-[15px] tw:shared-base:p-[17px]
          tw:shared-base:[background:#f6faf9] tw:shared-base:[border:1px_solid_var(--border)]
          tw:shared-base:rounded-[8px] tw:shared-base:[&_>_strong]:text-[35px]
          tw:shared-base:[&_>_span:last-child]:text-[13px]
          tw:shared-base:[&_>_span:last-child]:[color:var(--text-secondary)]
          tw:max-[480px]:shared-base:flex-wrap">
          <span className="icon-circle tone-blue tw:shared-base:w-[46px] tw:shared-base:h-[46px] tw:shared-base:shrink-0
          tw:shared-base:rounded-[50%] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:[:where(&.tone-blue)]:[color:#4b8397]
          tw:[:where(&.tone-blue)]:[background:#eaf2f7]">
            <Icon name="briefcase" size={26} />
          </span>
          <strong>5</strong>
          <span>active job postings</span>
        </div>
        <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]">
          <h3>No candidate records available</h3>
          <p>
            Candidate applications will appear here.
          </p>
        </div>
      </>
    )
  } else if (action === 'profile') {
    content = (
      <>
        <div className="employee-detail-title tw:shared-base:flex tw:shared-base:items-center tw:shared-base:gap-[14px]
          tw:shared-base:[&_.avatar]:w-[54px] tw:shared-base:[&_.avatar]:h-[54px]
          tw:shared-base:[&_.avatar]:text-[21px] tw:shared-base:[&_p]:mt-[6px] tw:shared-base:[&_p]:text-[12px]
          tw:shared-base:[&_p]:[color:var(--text-muted)] tw:shared-base:[&_.status-pill]:ml-[auto]
          tw:max-[480px]:shared-base:flex-wrap
          tw:max-[480px]:shared-base:[&_.status-pill]:ml-[0]">
          <span className="avatar tw:shared-base:inline-flex tw:shared-base:shrink-0 tw:shared-base:items-center tw:shared-base:justify-center
          tw:shared-base:w-[39px] tw:shared-base:h-[39px] tw:shared-base:rounded-[50%]
          tw:shared-base:[color:#206c62] tw:shared-base:[background:linear-gradient(140deg,_#e3f4ee,_#c9e7e0)]
          tw:shared-base:[border:3px_solid_white] tw:shared-base:text-[16px] tw:shared-base:font-semibold">B</span>
          <div>
            <h3>Besufekad Ermias</h3>
            <p>HR Manager</p>
          </div>
        </div>
        <dl className="detail-list tw:shared-base:m-[18px_0] tw:shared-base:[&_>_div]:flex tw:shared-base:[&_>_div]:justify-between
          tw:shared-base:[&_>_div]:gap-[20px] tw:shared-base:[&_>_div]:p-[15px_0]
          tw:shared-base:[&_>_div]:[border-bottom:1px_solid_var(--divider)] tw:shared-base:[&_>_div]:text-[13px]
          tw:shared-base:[&_dt]:[color:var(--text-muted)] tw:shared-base:[&_dd]:[color:var(--text-primary)]
          tw:shared-base:[&_dd]:m-[0] tw:shared-base:[&_dd]:text-right tw:shared-base:[&_dd]:font-[500]
          tw:max-[480px]:shared-base:[&_>_div]:text-[12px]
          tw:max-[480px]:shared-base:[&_>_div]:gap-[12px]">
          <div>
            <dt>Organization</dt>
            <dd>Hadiya Science</dd>
          </div>
          <div>
            <dt>Workspace</dt>
            <dd>IT Department HRMS</dd>
          </div>
        </dl>
      </>
    )
  } else if (action === 'logout') {
    content = (
      <>
        <DialogIntro >
          Leaving will clear the current workspace changes.
        </DialogIntro>
        <ModalActions >
          <Button variant="secondary" onClick={onClose}>
            Stay here
          </Button>
          <Button onClick={onLogout}>
            Leave Workspace
          </Button>
        </ModalActions>
      </>
    )
  } else {
    content = (
      <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]">
        <span className="icon-circle tone-green tw:shared-base:w-[46px] tw:shared-base:h-[46px] tw:shared-base:shrink-0
          tw:shared-base:rounded-[50%] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:[:where(&.tone-green)]:[color:#0b8972]
          tw:[:where(&.tone-green)]:[background:#e3f5f0]">
          <Icon
            name={
              action === 'rewards'
                ? 'award'
                : action === 'career'
                  ? 'trend'
                  : 'shield'
            }
            size={27}
          />
        </span>
        <h3>No records available</h3>
      </div>
    )
  }

  return (
    <Modal
      title={titles[action] || 'Workspace'}
      subtitle="Hadiya Science · HR Management"
      onClose={onClose}
    >
      {content}
    </Modal>
  )
}
