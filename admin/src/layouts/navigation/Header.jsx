import { useEffect, useRef, useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import AdminProfileDropdown from '../dropdowns/AdminProfileDropdown.jsx'
import NotificationsDropdown from '../dropdowns/NotificationsDropdown.jsx'
import { ATTENDANCE_PAGES } from '../../utils/constants/constants.js'

export default function Header({
  search,
  onSearch,
  onMenu,
  onNavigate,
  announcementCount,
  activePage = 'dashboard',
}) {
  const [menu, setMenu] = useState(null)
  const menuRef = useRef(null)
  const profileRef = useRef(null)
  const notificationRef = useRef(null)
  const attendanceActive = ATTENDANCE_PAGES.some((item) => item.id === activePage)
  const attendanceTableId = {
    attendance: 'attendance-table',
    'check-in-logs': 'check-in-logs-table',
    'late-arrivals': 'late-arrivals-table',
  }[activePage]

  useEffect(() => {
    if (!menu) return undefined
    function dismiss(event) {
      if (!menuRef.current?.contains(event.target)) setMenu(null)
    }
    function onKey(event) {
      if (event.key === 'Escape') {
        setMenu(null)
        const trigger = menu === 'profile' ? profileRef : notificationRef
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', onKey)
    }
  }, [menu])

  function navigate(action) {
    setMenu(null)
    onNavigate(action)
  }

  return (
    <header className="header">
      <button
        type="button"
        className="icon-button mobile-menu-button"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Icon name="menu" />
      </button>
      {['attendance-settings', 'leave-settings'].includes(activePage) ? (
        <div className="attendance-header-title"><Icon name="shield" size={19} /> {activePage === 'leave-settings' ? 'Leave Settings' : 'Attendance Settings'}</div>
      ) : <div className="search-box">
        <span className="search-icon">
          <Icon name="search" size={19} />
        </span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={
            activePage === 'services' ? 'Search services, training, or locations…'
              : activePage === 'documents' ? 'Search documents by title, file name, or audience…'
              : activePage === 'reports' ? 'Search reports by name, ID, category, or content…'
              : activePage === 'announcements' ? 'Search announcements by title, message, or audience…'
              : activePage === 'recruitment' ? 'Search job postings by title or department…'
              : activePage === 'applicants' ? 'Search candidates by name, national ID, or position…'
              : activePage === 'career' ? 'Search career milestones by employee, type, or grade…'
              : activePage === 'discipline' ? 'Search discipline by employee, violation, or sanction…'
              : activePage === 'rewards' ? 'Search recognitions by employee, award, or category…'
              : activePage === 'payroll-deductions' ? 'Search other deductions…'
              : activePage === 'payroll-reports' ? 'Search payroll reports or employees…'
              : activePage === 'payroll' ? 'Search payroll by employee name, ID, or department…'
              : activePage === 'leave'
              ? 'Search leave by name, serial number, or department…'
              : attendanceActive
              ? 'Search attendance by name, ID, or department…'
              : activePage === 'grades'
              ? 'Search job grades by title or ID…'
              : activePage === 'departments'
                ? 'Search departments by name, code, or head…'
                : 'Search employees, departments, or IDs…'
          }
          aria-label={
            activePage === 'services' ? 'Search services'
              : activePage === 'documents' ? 'Search documents'
              : activePage === 'reports' ? 'Search reports'
              : activePage === 'announcements' ? 'Search announcements'
              : activePage === 'recruitment' ? 'Search job postings'
              : activePage === 'applicants' ? 'Search candidate applications'
              : activePage === 'career' ? 'Search career milestones'
              : activePage === 'discipline' ? 'Search disciplinary records'
              : activePage === 'rewards' ? 'Search staff recognitions'
              : activePage === 'leave'
              ? 'Search leave by name, serial number, or department'
              : attendanceActive
              ? 'Search attendance by name, ID, or department'
              : activePage === 'grades'
              ? 'Search job grades by title or ID'
              : activePage === 'departments'
                ? 'Search departments by name, code, or head'
                : 'Search employees, departments, or IDs'
          }
          aria-controls={
            activePage === 'services' ? 'services-table'
              : activePage === 'documents' ? 'documents-table'
              : activePage === 'reports' ? 'system-reports-table'
              : activePage === 'announcements' ? 'announcements-table'
              : activePage === 'recruitment' ? 'job-postings-table'
              : activePage === 'applicants' ? 'applications-table'
              : activePage === 'career' ? 'career-table'
              : activePage === 'discipline' ? 'discipline-table'
              : activePage === 'rewards' ? 'rewards-table'
              : activePage === 'leave'
              ? 'leave-requests-table'
              : attendanceActive
              ? attendanceTableId
              : activePage === 'grades'
              ? 'grade-table'
              : activePage === 'departments'
                ? 'department-table'
                : activePage === 'employees'
                  ? 'employee-directory-table'
                  : activePage === 'dashboard'
                    ? 'personnel-roster'
                    : undefined
          }
        />
        <kbd>/</kbd>
      </div>}
      <div className="header-controls" ref={menuRef}>
        <div className="dropdown-anchor">
          <button
            type="button"
            ref={notificationRef}
            className="icon-button notification-button"
            aria-label="Notifications"
            aria-expanded={menu === 'notifications'}
            aria-controls="notification-dropdown"
            onClick={() =>
              setMenu(menu === 'notifications' ? null : 'notifications')
            }
          >
            <Icon name="bell" size={22} />
            {announcementCount > 0 && <span className="notification-dot" />}
          </button>
          {menu === 'notifications' && (
            <NotificationsDropdown
              count={announcementCount}
              onNavigate={navigate}
            />
          )}
        </div>
        <span className="header-divider" />
        <div className="dropdown-anchor">
          <button
            type="button"
            ref={profileRef}
            className="profile-button"
            aria-label="Open HR Manager profile"
            aria-expanded={menu === 'profile'}
            aria-controls="profile-dropdown"
            onClick={() => setMenu(menu === 'profile' ? null : 'profile')}
          >
            <span className="avatar">B</span>
            <span className="profile-text">
              <strong>Besufekad Ermias</strong>
              <small>HR Manager</small>
            </span>
            <Icon name="chevron-down" size={16} />
          </button>
          {menu === 'profile' && <AdminProfileDropdown onNavigate={navigate} />}
        </div>
      </div>
    </header>
  )
}
