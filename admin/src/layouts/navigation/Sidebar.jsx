import { Fragment, useId, useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import { NAVIGATION, ATTENDANCE_PAGES, PAYROLL_PAGES, RECRUITMENT_PAGES } from '../../utils/constants/constants.js'

export default function Sidebar({
  onNavigate,
  mobile = false,
  activePage = 'dashboard',
}) {
  const employeesActive = [
    'employees',
    'employee',
    'add-employee',
    'edit-employee',
  ].includes(activePage)
  const attendanceActive = ATTENDANCE_PAGES.some((item) => item.id === activePage)
  const leaveActive = ['leave', 'leave-settings'].includes(activePage)
  const payrollActive = PAYROLL_PAGES.some((item) => item.id === activePage)
  const recruitmentActive = RECRUITMENT_PAGES.some((item) => item.id === activePage)
  const activeSection = payrollActive ? 'payroll' : leaveActive ? 'leave' : attendanceActive ? 'attendance' : employeesActive ? 'employees' : activePage
  const submenuId = useId()
  const attendanceSubmenuId = useId()
  const leaveSubmenuId = useId()
  const payrollSubmenuId = useId()
  const recruitmentSubmenuId = useId()
  const [employeeMenu, setEmployeeMenu] = useState({
    page: activePage,
    open: employeesActive,
  })
  // Open the group on employee routes unless it was toggled on this page.
  const employeesOpen =
    employeeMenu.page === activePage ? employeeMenu.open : employeesActive
  const [attendanceMenu, setAttendanceMenu] = useState({ page: activePage, open: attendanceActive })
  const attendanceOpen = attendanceMenu.page === activePage ? attendanceMenu.open : attendanceActive
  const [leaveMenu, setLeaveMenu] = useState({ page: activePage, open: leaveActive })
  const leaveOpen = leaveMenu.page === activePage ? leaveMenu.open : leaveActive
  const [payrollMenu, setPayrollMenu] = useState({ page: activePage, open: payrollActive })
  const payrollOpen = payrollMenu.page === activePage ? payrollMenu.open : payrollActive
  const [recruitmentMenu, setRecruitmentMenu] = useState({ page: activePage, open: recruitmentActive })
  const recruitmentOpen = recruitmentMenu.page === activePage ? recruitmentMenu.open : recruitmentActive
  return (
    <aside
      className={`sidebar${mobile ? ' sidebar-mobile' : ''}`}
      aria-label="HR Manager navigation"
    >
      <a
        className="brand"
        href="#dashboard"
        onClick={(event) => {
          event.preventDefault()
          onNavigate('dashboard')
        }}
        aria-label="HRMS dashboard"
      >
        <svg
          className="brand-mark"
          width="35"
          height="39"
          viewBox="0 0 35 39"
          aria-hidden="true"
        >
          <path
            fill="#10ba91"
            d="M15 3h13a6 6 0 0 1 6 6v22a6 6 0 0 1-10 4L11 22V9a6 6 0 0 1 4-6"
          />
          <path fill="#079d7a" d="m16 12 12 13-11 11a6 6 0 0 1-9-4V20z" />
          <path
            fill="#19c59b"
            d="M7 20h3l8 8-8 8H7a6 6 0 0 1-6-6v-4a6 6 0 0 1 6-6"
          />
        </svg>
        <span>
          <strong>HRMS</strong>
          <small>People · Process · Progress</small>
        </span>
      </a>
      <div className="sidebar-label">WORKSPACE</div>
      <nav className="sidebar-nav">
        {NAVIGATION.map((item) => (
          <Fragment key={item.id}>
            {item.id === 'employees' ? (
              <button
                type="button"
                className={`nav-item employee-nav-toggle${employeesActive ? ' active' : ''}`}
                aria-expanded={employeesOpen}
                aria-controls={submenuId}
                onClick={() =>
                  setEmployeeMenu({ page: activePage, open: !employeesOpen })
                }
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                <Icon
                  name="chevron-down"
                  className="employee-nav-chevron"
                  size={15}
                />
              </button>
            ) : item.id === 'attendance' ? (
              <button type="button"
                className={`nav-item employee-nav-toggle${attendanceActive ? ' active' : ''}`}
                aria-expanded={attendanceOpen} aria-controls={attendanceSubmenuId}
                onClick={() => setAttendanceMenu({ page: activePage, open: !attendanceOpen })}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
                <Icon name="chevron-down" className="employee-nav-chevron" size={15} />
              </button>
            ) : item.id === 'leave' ? (
              <button
                type="button"
                className={`nav-item employee-nav-toggle${leaveActive ? ' active' : ''}`}
                aria-expanded={leaveOpen}
                aria-controls={leaveSubmenuId}
                onClick={() => setLeaveMenu({ page: activePage, open: !leaveOpen })}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                <Icon name="chevron-down" className="employee-nav-chevron" size={15} />
              </button>
            ) : item.id === 'recruitment' ? (
              <button type="button" className={`nav-item employee-nav-toggle${recruitmentActive ? ' active' : ''}`}
                aria-expanded={recruitmentOpen} aria-controls={recruitmentSubmenuId}
                onClick={() => setRecruitmentMenu({ page: activePage, open: !recruitmentOpen })}>
                <Icon name={item.icon} /><span>{item.label}</span><Icon name="chevron-down" className="employee-nav-chevron" size={15} />
              </button>
            ) : item.id === 'payroll' ? (
              <button type="button" className={`nav-item employee-nav-toggle${payrollActive ? ' active' : ''}`}
                aria-expanded={payrollOpen} aria-controls={payrollSubmenuId} onClick={() => setPayrollMenu({ page: activePage, open: !payrollOpen })}>
                <Icon name={item.icon} /><span>{item.label}</span><Icon name="chevron-down" className="employee-nav-chevron" size={15} />
              </button>
            ) : (
              <a
                className={`nav-item${item.id === activeSection ? ' active' : ''}`}
                href={`#${item.id}`}
                aria-current={item.id === activeSection ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  onNavigate(item.id)
                }}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {item.id === activeSection && (
                  <span className="nav-active-dot" />
                )}
              </a>
            )}
            {item.id === 'recruitment' && <div className="employee-subnav" id={recruitmentSubmenuId} hidden={!recruitmentOpen}>
              {RECRUITMENT_PAGES.map((page) => <a key={page.id} href={page.href} className={activePage === page.id ? 'selected' : ''}
                aria-current={activePage === page.id ? 'page' : undefined}
                onClick={(event) => { event.preventDefault(); onNavigate(page.id) }}><span />{page.label}</a>)}
            </div>}
            {item.id === 'payroll' && <div className="employee-subnav" id={payrollSubmenuId} hidden={!payrollOpen}>
              {PAYROLL_PAGES.map((page) => <a key={page.id} href={page.href} className={activePage === page.id ? 'selected' : ''}
                aria-current={activePage === page.id ? 'page' : undefined} onClick={(event) => { event.preventDefault(); onNavigate(page.id) }}><span />{page.label}</a>)}
            </div>}
            {item.id === 'attendance' && (
              <div className="employee-subnav" id={attendanceSubmenuId} hidden={!attendanceOpen}>
                {ATTENDANCE_PAGES.map((page) => (
                  <a key={page.id} href={page.href}
                    className={activePage === page.id ? 'selected' : ''}
                    aria-current={activePage === page.id ? 'page' : undefined}
                    onClick={(event) => { event.preventDefault(); onNavigate(page.id) }}>
                    <span />{page.label}
                  </a>
                ))}
              </div>
            )}
            {item.id === 'leave' && <div className="employee-subnav" id={leaveSubmenuId} hidden={!leaveOpen}>
              {[['leave', 'Requests', '#/leave'], ['leave-settings', 'Settings & Entitlements', '#/leave/settings']].map(([page, label, href]) =>
                <a key={page} href={href} className={activePage === page ? 'selected' : ''} aria-current={activePage === page ? 'page' : undefined}
                  onClick={(event) => { event.preventDefault(); onNavigate(page) }}><span />{label}</a>,
              )}
            </div>}
            {item.id === 'employees' && (
              <div
                className="employee-subnav"
                id={submenuId}
                hidden={!employeesOpen}
              >
                {[
                  ['employees', 'Employee Directory'],
                  ['add-employee', 'Add Employee'],
                ].map(([page, label]) => (
                  <a
                    key={page}
                    href={
                      page === 'employees' ? '#/employees' : '#/employees/new'
                    }
                    className={activePage === page ? 'selected' : ''}
                    aria-current={activePage === page ? 'page' : undefined}
                    onClick={(event) => {
                      event.preventDefault()
                      onNavigate(page)
                    }}
                  >
                    <span />
                    {label}
                  </a>
                ))}
              </div>
            )}
          </Fragment>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-landscape" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="sidebar-slogan">
          Great teams
          <br />
          build great things
          <span />
        </div>
        <div className="sidebar-profile">
          <span className="avatar sidebar-avatar">B</span>
          <div>
            <strong>HR Manager</strong>
            <span>Besufekad Ermias</span>
          </div>
          <button
            className="icon-button"
            aria-label="Log out"
            onClick={() => onNavigate('logout')}
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}
