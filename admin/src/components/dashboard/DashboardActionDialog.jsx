import Modal from '../common/Modal.jsx'
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
        <p className="dialog-intro">
          {formatDate(SNAPSHOT_DATE, { weekday: 'long', month: 'long' })} ·{' '}
          {SNAPSHOT.activeStaff} active employees
        </p>
        <div className="summary-list">
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
        <div className="notice">
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
        <p className="dialog-intro">
          Employee counts from the current personnel roster.
        </p>
        <div className="summary-list">
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
        <div className="feature-total">
          <span className="icon-circle tone-blue">
            <Icon name="briefcase" size={26} />
          </span>
          <strong>5</strong>
          <span>active job postings</span>
        </div>
        <div className="empty-state">
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
        <div className="employee-detail-title">
          <span className="avatar">B</span>
          <div>
            <h3>Besufekad Ermias</h3>
            <p>HR Manager</p>
          </div>
        </div>
        <dl className="detail-list">
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
        <p className="dialog-intro">
          Leaving will clear the current workspace changes.
        </p>
        <div className="modal-actions">
          <button className="button button-secondary" onClick={onClose}>
            Stay here
          </button>
          <button className="button button-primary" onClick={onLogout}>
            Leave Workspace
          </button>
        </div>
      </>
    )
  } else {
    content = (
      <div className="empty-state">
        <span className="icon-circle tone-green">
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
