import Card from '../../components/common/Card.jsx'
import Button, { TextButton } from '../../components/common/Button.jsx'
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
      <div className={`dashboard-intro tw:flex tw:items-center tw:justify-between tw:gap-[22px] tw:mb-[25px]
          tw:min-[1024px]:max-[1280px]:items-start tw:max-[768px]:block tw:max-[768px]:mb-[22px] `}>
        <div className="tw:max-w-[780px]">
          <div className="intro-eyebrow tw:flex tw:items-center tw:gap-[11px] tw:mb-[10px] tw:text-[var(--text-muted)] tw:text-[10px]
          tw:max-[480px]:gap-[8px] tw:max-[480px]:text-[9px]">
            <span className="eyebrow tw:shared-base:text-[10px] tw:shared-base:font-bold tw:shared-base:tracking-[1.4px]
          tw:shared-base:[color:var(--primary)] tw:max-[480px]:shared-base:text-[9px]
          tw:max-[480px]:shared-base:tracking-[1.1px]">HR COMMAND CENTER</span>
            <span className="intro-divider tw:w-[1px] tw:h-[10px] tw:bg-[#ccdddf] tw:min-[1024px]:max-[1280px]:hidden" />
            <span className="tw:min-[1024px]:max-[1280px]:hidden">HR Manager Portal</span>
          </div>
          <h1 className="tw:max-[768px]:text-[26px] tw:max-[768px]:max-w-[470px] tw:max-[480px]:text-[25px]">Hadiya Science And Technology HR Management</h1>
          <p className="tw:text-[12px] tw:leading-[1.8] tw:text-[var(--text-secondary)] tw:mt-[9px] tw:max-w-[630px]
          tw:max-[768px]:max-w-[530px]">
            Manage personnel, review leave approvals, process payroll, and
            publish institutional announcements.
          </p>
        </div>
        <div className={`intro-actions tw:flex tw:flex-col tw:items-end tw:gap-[17px] tw:shrink-0 tw:min-[1024px]:max-[1280px]:gap-[14px]
          tw:max-[768px]:mt-[19px] tw:max-[768px]:flex-row-reverse tw:max-[768px]:items-center
          tw:max-[768px]:justify-between tw:max-[768px]:gap-[12px] `}>
          <div className="snapshot-date tw:flex tw:items-start tw:gap-[9px] tw:text-[var(--text-secondary)] tw:text-[11px]
          tw:max-[768px]:text-[10px]">
            <Icon name="calendar" size={16} />
            <span>
              {formatDate(SNAPSHOT_DATE, { weekday: 'short' })}
              <small className="tw:block tw:text-right tw:text-[var(--text-muted)] tw:text-[10px] tw:mt-[4px] tw:max-[768px]:text-[9px]">As of</small>
            </span>
          </div>
          <Button className="tw:min-[1024px]:max-[1280px]:[.intro-actions_&]:text-[11px]
          tw:min-[1024px]:max-[1280px]:[.intro-actions_&]:p-[10px_12px]
          tw:max-[768px]:[.intro-actions_&]:text-[12px]"
            onClick={() => onNavigate('add-employee')}
          >
            <Icon name="plus" size={18} />
            Add New Employee
          </Button>
        </div>
      </div>
      <WorkforceStats employeeCount={employees.length} />
      <div className="dashboard-middle tw:grid tw:grid-cols-[minmax(0,_44.8fr)_minmax(0,_32.2fr)_minmax(0,_23fr)] tw:gap-[15px]
          tw:mb-[20px] tw:min-[768px]:max-[1280px]:grid-cols-[minmax(0,_1.2fr)_minmax(0,_1fr)]
          tw:min-[1024px]:max-[1280px]:grid-cols-[minmax(0,_1.2fr)_minmax(0,_1fr)]
          tw:min-[1024px]:max-[1280px]:gap-[15px] tw:max-[1024px]:grid-cols-[minmax(0,_1.2fr)_minmax(0,_1fr)]
          tw:max-[768px]:grid-cols-[minmax(0,_1fr)] tw:max-[768px]:gap-[16px] tw:max-[768px]:mb-[16px]">
        <AttendanceSummaryChart onViewLog={() => onNavigate('attendance')} />
        <DepartmentDistributionChart />
        <QuickActions onAction={onNavigate} leaveSummary={leaveSummary} />
      </div>
      <Card
        className="roster-card tw:p-[22px_23px_0] tw:scroll-mt-[90px] tw:max-[768px]:p-[20px_17px_0]"
        id="personnel-roster"
        aria-labelledby="roster-title"
      >
        <div className="section-heading tw:[.roster-card_&]:mb-[16px] tw:shared-base:flex tw:shared-base:justify-between
          tw:shared-base:items-start tw:shared-base:gap-[12px] tw:shared-base:mb-[20px] tw:shared-base:[&_h2]:flex
          tw:shared-base:[&_h2]:items-center tw:shared-base:[&_h2]:gap-[9px]
          tw:shared-base:[&_h2_>_svg]:[color:var(--primary)] tw:shared-base:[&_p]:[color:var(--text-muted)]
          tw:shared-base:[&_p]:text-[12px] tw:shared-base:[&_p]:mt-[6px] tw:shared-base:[&_p]:leading-[1.5]
          tw:max-[768px]:shared-base:[&_h2]:text-[15px]
          tw:max-[768px]:shared-base:gap-[8px] tw:max-[768px]:shared-base:[&_p]:text-[11px]">
          <div>
            <h2 id="roster-title">
              Personnel Roster
              <span className="count-badge tw:shared-base:inline-flex tw:shared-base:items-center tw:shared-base:justify-center
          tw:shared-base:min-w-[23px] tw:shared-base:h-[20px] tw:shared-base:rounded-[5px]
          tw:shared-base:[color:var(--primary)] tw:shared-base:[background:#eaf6f1] tw:shared-base:text-[10px]
          tw:shared-base:font-semibold">{employees.length}</span>
            </h2>
            <p>Recently registered employees in Hadiya Science IT Department</p>
          </div>
          <TextButton
            onClick={() => onNavigate('employees')}
          >
            View All
            <Icon name="arrow" size={17} />
          </TextButton>
        </div>
        <EmployeeTable
          employees={employees}
          search={search}
          onClearSearch={() => onSearch('')}
          onSelect={(employee) => onNavigate('employee', employee.id)}
        />
      </Card>
      <footer className={`dashboard-footer tw:shared-footer:flex tw:shared-footer:justify-between tw:shared-footer:items-center
          tw:shared-footer:gap-[15px] tw:shared-footer:text-[#74909b] tw:shared-footer:p-[20px_0]
          tw:shared-footer:text-[10px] tw:max-[768px]:shared-footer:flex-wrap
          tw:max-[768px]:shared-footer:gap-[8px] tw:max-[768px]:shared-footer:text-[9px] `}>
        <span>© 2026 Hadiya Science · IT Department</span>
        <span className="tw:inline-flex tw:items-center tw:gap-[6px]">
          <span className="status-dot tone-green tw:[:where(&.tone-green)]:[color:#0b8972] tw:[:where(&.tone-green)]:[background:#e3f5f0]
          tw:[:where(&.status-dot)]:inline-block tw:[:where(&.status-dot)]:h-[6px]
          tw:[:where(&.status-dot)]:w-[6px] tw:[:where(&.status-dot)]:shrink-0
          tw:[:where(&.status-dot)]:rounded-[50%] tw:[:where(&.status-dot)]:[background:currentColor]" />
          HR Management
        </span>
      </footer>
    </>
  )
}
