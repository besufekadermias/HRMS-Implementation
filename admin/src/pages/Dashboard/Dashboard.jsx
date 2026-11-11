import Icon from '../../components/common/Icon.jsx'
import WorkforceStats from '../../components/dashboard/WorkforceStats.jsx'
import AttendanceSummaryChart from '../../components/dashboard/AttendanceSummaryChart.jsx'
import DepartmentDistributionChart from '../../components/dashboard/DepartmentDistributionChart.jsx'
import QuickActions from '../../components/dashboard/QuickActions.jsx'
import EmployeeTable from '../../components/employees/EmployeeTable.jsx'
import { SNAPSHOT_DATE } from '../../utils/constants/constants.js'
import formatDate from '../../utils/formatters/formatDate.js'

export default function Dashboard({ employees, search, onSearch, onNavigate, leaveSummary }) {
  return (
    <>
      <div className="dashboard-intro">
        <div>
          <div className="intro-eyebrow">
            <span className="eyebrow">HR COMMAND CENTER</span>
            <span className="intro-divider" />
            <span>HR Manager Portal</span>
          </div>
          <h1>Hadiya Science And Technology HR Management</h1>
          <p>
            Manage personnel, review leave approvals, process payroll, and
            publish institutional announcements.
          </p>
        </div>
        <div className="intro-actions">
          <div className="snapshot-date">
            <Icon name="calendar" size={16} />
            <span>
              {formatDate(SNAPSHOT_DATE, { weekday: 'short' })}
              <small>As of</small>
            </span>
          </div>
          <button
            className="button button-primary"
            onClick={() => onNavigate('add-employee')}
          >
            <Icon name="plus" size={18} />
            Add New Employee
          </button>
        </div>
      </div>
      <WorkforceStats employeeCount={employees.length} />
      <div className="dashboard-middle">
        <AttendanceSummaryChart onViewLog={() => onNavigate('attendance')} />
        <DepartmentDistributionChart />
        <QuickActions onAction={onNavigate} leaveSummary={leaveSummary} />
      </div>
      <section
        className="card roster-card"
        id="personnel-roster"
        aria-labelledby="roster-title"
      >
        <div className="section-heading">
          <div>
            <h2 id="roster-title">
              Personnel Roster
              <span className="count-badge">{employees.length}</span>
            </h2>
            <p>Recently registered employees in Hadiya Science IT Department</p>
          </div>
          <button
            className="text-button"
            onClick={() => onNavigate('employees')}
          >
            View All
            <Icon name="arrow" size={17} />
          </button>
        </div>
        <EmployeeTable
          employees={employees}
          search={search}
          onClearSearch={() => onSearch('')}
          onSelect={(employee) => onNavigate('employee', employee.id)}
        />
      </section>
      <footer className="dashboard-footer">
        <span>© 2026 Hadiya Science · IT Department</span>
        <span>
          <span className="status-dot tone-green" />
          HR Management
        </span>
      </footer>
    </>
  )
}
