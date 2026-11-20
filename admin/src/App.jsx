import Card from './components/common/Card.jsx'
import Button, { IconButton } from './components/common/Button.jsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAdminStore } from './store/index.js'
import AdminLayout from './layouts/main/AdminLayout.jsx'
import Login from './pages/Auth/Login.jsx'
import { signIn, signOut, saveAdminProfile, saveAccountSecurity } from './services/auth/authService.js'
import AdminAccount from './pages/Account/AdminAccount.jsx'
import { saveGeneralSettings, saveNotificationSettings } from './services/settings/settingsService.js'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import EmployeeDirectory from './pages/Employees/EmployeeDirectory.jsx'
import AddEmployee from './pages/Employees/AddEmployee.jsx'
import EmployeeDetails from './pages/Employees/EmployeeDetails.jsx'
import DepartmentList from './pages/Departments/DepartmentList.jsx'
import GradeList from './pages/Grades/GradeList.jsx'
import AttendanceOverview from './pages/Attendance/AttendanceOverview.jsx'
import CheckInLogs from './pages/Attendance/CheckInLogs.jsx'
import LateArrivals from './pages/Attendance/LateArrivals.jsx'
import AttendanceSettings from './pages/Attendance/AttendanceSettings.jsx'
import LeaveOverview from './pages/Leave/LeaveOverview.jsx'
import LeaveSettings from './pages/Leave/LeaveSettings.jsx'
import PayrollWorkspace from './pages/Payroll/PayrollWorkspace.jsx'
import RecruitmentDashboard from './pages/Recruitment/RecruitmentDashboard.jsx'
import ViewApplicants from './pages/Recruitment/ViewApplicants.jsx'
import RewardsAndRecognitions from './pages/Rewards/RewardsAndRecognitions.jsx'
import DisciplineAndPenalties from './pages/Discipline/DisciplineAndPenalties.jsx'
import CareerTracking from './pages/Career/CareerTracking.jsx'
import Announcements from './pages/Announcements/Announcements.jsx'
import Reports from './pages/Reports/Reports.jsx'
import Documents from './pages/Documents/Documents.jsx'
import Services from './pages/Services/Services.jsx'
import MainSettings from './pages/Settings/MainSettings.jsx'
import Notifications from './pages/Notifications/Notifications.jsx'
import NotificationDetails from './pages/Notifications/NotificationDetails.jsx'
import { buildWorkspaceNotifications, filterNotificationPreferences, notificationTarget, updateNotificationReceipts } from './services/communications/notificationService.js'
import PostAnnouncementModal from './components/announcements/PostAnnouncementModal.jsx'
import DashboardActionDialog from './components/dashboard/DashboardActionDialog.jsx'
import ConfirmationModal from './components/common/ConfirmationModal.jsx'
import Icon from './components/common/Icon.jsx'
import {
  ATTENDANCE_PAGES,
  PAYROLL_PAGES,
  RECRUITMENT_PAGES,
} from './utils/constants/constants.js'
import useLeave from './hooks/operations/useLeave.js'
import usePayroll from './hooks/operations/usePayroll.js'
import { saveJob, toggleJobStatus, decideApplication } from './services/recruitment/recruitmentService.js'
import useCareer from './hooks/growth/useCareer.js'
import { grantReward, deleteReward } from './services/growth/rewardService.js'
import { postAnnouncement, deleteAnnouncement } from './services/communications/announcementService.js'
import { publishDocument, deleteDocument } from './services/communications/documentService.js'
import { saveService, deleteService } from './services/communications/publicServiceService.js'
import { recordDisciplinaryAction, deleteDisciplinaryAction, remapDisciplineEmployee, removeEmployeeDiscipline } from './services/growth/disciplineService.js'
import { buildDashboardSummary } from './services/dashboard/dashboardService.js'
import {
  saveDepartment,
  deleteDepartment,
  reconcileDepartmentHeads,
} from './services/workforce/departmentService.js'
import {
  saveJobGrade,
  deleteJobGrade,
} from './services/workforce/gradeService.js'

function readRoute() {
  if (typeof window === 'undefined') return { page: 'dashboard' }
  try {
    const [pathname, query = ''] = window.location.hash.replace(/^#\/?/, '').split('?')
    const parts = pathname.split('/')
    const recordId = new URLSearchParams(query).get('record') || undefined
    if (parts[0] === 'notifications') return { page: 'notifications' }
    if (parts[0] === 'profile') return { page: 'profile', section: parts[1] === 'security' ? 'security' : 'profile' }
    if (parts[0] === 'settings') return { page: 'settings', section: parts[1] === 'notifications' ? 'notifications' : 'general' }
    if (parts[0] === 'services') return { page: 'services' }
    if (parts[0] === 'documents') return { page: 'documents' }
    if (parts[0] === 'reports') return { page: 'reports' }
    if (['announcements', 'announcement'].includes(parts[0])) return { page: 'announcements', recordId }
    if (parts[0] === 'recruitment') return parts[1] === 'applications'
      ? { page: 'applicants', id: parts[2] ? decodeURIComponent(parts[2]) : undefined, recordId } : { page: 'recruitment' }
    if (parts[0] === 'applicants') return { page: 'applicants', recordId }
    if (parts[0] === 'rewards') return { page: 'rewards' }
    if (parts[0] === 'discipline') return { page: 'discipline' }
    if (['career', 'career-tracking'].includes(parts[0])) return { page: 'career', recordId }
    if (parts[0] === 'payroll') return { page: PAYROLL_PAGES.find((item) => item.href === `#/${parts.join('/')}`)?.id || 'payroll' }
    if ((parts[0] === 'leave' && parts[1] === 'settings') || parts[0] === 'leave-settings') return { page: 'leave-settings' }
    if (['leave', 'pending-leave', 'approved-leave'].includes(parts[0])) {
      const status = parts[0] === 'pending-leave' ? 'PENDING' : parts[0] === 'approved-leave' ? 'APPROVED' : parts[1]?.toUpperCase()
      return { page: 'leave', status: ['PENDING', 'APPROVED', 'REJECTED'].includes(status) ? status : '', recordId }
    }
    if (parts[0] === 'attendance') {
      const attendancePage = ATTENDANCE_PAGES.find((item) => item.href === `#/${parts.join('/')}`)
      return { page: attendancePage?.id || 'attendance' }
    }
    if (parts[0] === 'grades') return { page: 'grades' }
    if (parts[0] === 'departments') return { page: 'departments' }
    if (parts[0] !== 'employees') return { page: 'dashboard' }
    if (parts[1] === 'new') return { page: 'add-employee' }
    if (['view', 'edit'].includes(parts[1]) && parts[2])
      return {
        page: parts[1] === 'edit' ? 'edit-employee' : 'employee',
        id: decodeURIComponent(parts[2]),
      }
    return { page: 'employees' }
  } catch {
    return { page: 'dashboard' }
  }
}

function routeHash(route) {
  const recordQuery = route.recordId ? `?record=${encodeURIComponent(route.recordId)}` : ''
  if (route.page === 'notifications') return '#/notifications'
  if (route.page === 'profile') return route.section === 'security' ? '#/profile/security' : '#/profile'
  if (route.page === 'settings') return route.section === 'notifications' ? '#/settings/notifications' : '#/settings'
  if (route.page === 'services') return '#/services'
  if (route.page === 'documents') return '#/documents'
  if (route.page === 'reports') return '#/reports'
  if (route.page === 'announcements') return `#/announcements${recordQuery}`
  if (route.page === 'recruitment') return '#/recruitment'
  if (route.page === 'applicants') return `#/recruitment/applications${route.id ? `/${encodeURIComponent(route.id)}` : ''}${recordQuery}`
  if (route.page === 'rewards') return '#/rewards'
  if (route.page === 'discipline') return '#/discipline'
  if (route.page === 'career') return `#/career${recordQuery}`
  const payrollPage = PAYROLL_PAGES.find((item) => item.id === route.page)
  if (payrollPage) return payrollPage.href
  if (route.page === 'leave-settings') return '#/leave/settings'
  if (route.page === 'leave') return `#/leave${route.status ? `/${route.status.toLowerCase()}` : ''}${recordQuery}`
  const attendancePage = ATTENDANCE_PAGES.find((item) => item.id === route.page)
  if (attendancePage) return attendancePage.href
  if (route.page === 'grades') return '#/grades'
  if (route.page === 'departments') return '#/departments'
  if (route.page === 'dashboard') return '#/dashboard'
  if (route.page === 'employees') return '#/employees'
  if (route.page === 'add-employee') return '#/employees/new'
  return `#/employees/${route.page === 'edit-employee' ? 'edit' : 'view'}/${encodeURIComponent(route.id)}`
}

export default function App() {
  const {
    employees, setEmployees, departments, setDepartments, grades, setGrades, setWorkforce,
    rewards, setRewards, recruitment, setRecruitment, discipline, setDiscipline,
    attendanceSettings, setAttendanceSettings, departmentChanges, setDepartmentChanges,
    announcements, setAnnouncements, documents, setDocuments, services, setServices,
    reports, attendance, attendanceHeads, toast, setToast,
    generalSettings, setGeneralSettings,
    notificationReceipts, setNotificationReceipts,
    notificationSettings, setNotificationSettings,
    adminAccount, setAdminAccount,
    workspaceClosed, setWorkspaceClosed, reset: resetAdmin,
  } = useAdminStore()
  const [route, setRoute] = useState(readRoute)
  const [search, setSearch] = useState('')
  const [action, setAction] = useState(null)
  const leave = useLeave(employees, { enabled: !workspaceClosed })
  const payroll = usePayroll(employees, { enabled: !workspaceClosed })
  const career = useCareer(employees, grades, !workspaceClosed)
  const notifications = useMemo(() => filterNotificationPreferences(buildWorkspaceNotifications({
    announcements, recruitment, leaveData: leave.data, careerMilestones: career.milestones, employees,
  }, notificationReceipts), notificationSettings), [announcements, recruitment, leave.data, career.milestones, employees, notificationReceipts, notificationSettings])
  const [sharedSaving, setSharedSaving] = useState(false)
  const sharedSavingRef = useRef(false)
  const operationSaving = leave.saving || payroll.saving || sharedSaving
  const [dirty, setDirty] = useState(false)
  const [pendingRoute, setPendingRoute] = useState(null)
  const [signedInAt, setSignedInAt] = useState(null)

  useEffect(() => {
    function syncRoute() {
      if (operationSaving || sharedSavingRef.current) {
        window.history.replaceState(null, '', routeHash(route))
        setToast('Please wait for the current change to finish saving.')
        return
      }
      const next = readRoute()
      const switchingSettingsSection = ['settings', 'profile'].includes(next.page) && next.page === route.page
      if (dirty && routeHash(next) !== routeHash(route) && !switchingSettingsSection) {
        window.history.replaceState(null, '', routeHash(route))
        setPendingRoute(next)
      } else {
        if (
          next.page !== route.page &&
          ['departments', 'grades', 'rewards', 'discipline', 'career', 'announcements', 'reports', 'documents', 'services', 'settings', 'notifications', 'profile', 'leave', 'leave-settings', ...RECRUITMENT_PAGES.map((item) => item.id), ...PAYROLL_PAGES.map((item) => item.id), ...ATTENDANCE_PAGES.map((item) => item.id)].some((page) =>
            [next.page, route.page].includes(page),
          )
        )
          setSearch('')
        setRoute(next)
        setAction(null)
      }
    }
    window.addEventListener('hashchange', syncRoute)
    window.addEventListener('popstate', syncRoute)
    return () => {
      window.removeEventListener('hashchange', syncRoute)
      window.removeEventListener('popstate', syncRoute)
    }
  }, [dirty, route, operationSaving, setToast])

  useEffect(() => {
    if (!dirty && !operationSaving) return undefined
    function warnBeforeLeaving(event) {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving)
  }, [dirty, operationSaving])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 5500)
    return () => window.clearTimeout(timer)
  }, [toast, setToast])

  function go(next) {
    if (leave.isSaving() || payroll.isSaving() || sharedSavingRef.current) return
    const { notificationId, ...destination } = next
    if (notificationId) {
      const notification = notifications.find(item => item.id === notificationId)
      if (notification) handleReadNotification(notification)
    }
    setDirty(false)
    setPendingRoute(null)
    setAction(null)
    if (destination.recordId) setSearch('')
    if (
      next.page !== route.page &&
      ['departments', 'grades', 'rewards', 'discipline', 'career', 'announcements', 'reports', 'documents', 'services', 'settings', 'notifications', 'profile', 'leave', 'leave-settings', ...RECRUITMENT_PAGES.map((item) => item.id), ...PAYROLL_PAGES.map((item) => item.id), ...ATTENDANCE_PAGES.map((item) => item.id)].some((page) =>
        [next.page, route.page].includes(page),
      )
    )
      setSearch('')
    setRoute(destination)
    window.history.pushState(null, '', routeHash(destination))
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function selectSettingsSection(section) {
    if (leave.isSaving() || payroll.isSaving() || sharedSavingRef.current) {
      setToast('Please wait for the current change to finish saving.')
      return
    }
    const next = { page: 'settings', section: section === 'notifications' ? 'notifications' : 'general' }
    if (routeHash(next) === routeHash(route)) return
    // Both panels remain mounted, so switching sections keeps their drafts.
    setRoute(next)
    window.history.pushState(null, '', routeHash(next))
  }

  function navigate(page, id) {
    if (leave.isSaving() || payroll.isSaving() || sharedSavingRef.current) {
      setToast('Please wait for the current change to finish saving.')
      return
    }
    if (page === 'settings' || page === 'notification-settings') {
      const section = page === 'notification-settings' ? 'notifications' : 'general'
      if (route.page === 'settings') selectSettingsSection(section)
      else if (dirty) setPendingRoute({ page: 'settings', section })
      else go({ page: 'settings', section })
      return
    }
    if (['pending-leave', 'approved-leave'].includes(page)) {
      const next = { page: 'leave', status: page === 'pending-leave' ? 'PENDING' : 'APPROVED' }
      if (dirty) setPendingRoute(next)
      else go(next)
      return
    }
    if (
      ![
        'dashboard',
        'employees',
        'add-employee',
        'edit-employee',
        'employee',
        'departments',
        'grades',
        'rewards',
        'discipline',
        'career',
        'announcements',
        'reports',
        'documents',
        'services',
        'settings',
        'notifications',
        'profile',
        'leave',
        'leave-settings',
        ...RECRUITMENT_PAGES.map((item) => item.id),
        ...PAYROLL_PAGES.map((item) => item.id),
        ...ATTENDANCE_PAGES.map((item) => item.id),
      ].includes(page)
    ) {
      setAction(page)
      return
    }
    const next = { page, ...(id ? { id } : {}) }
    if (dirty) setPendingRoute(next)
    else go(next)
  }

  function saveEmployee(employee, originalId) {
    const original = employees.find((item) => item.id === originalId)
    const next = originalId
      ? employees.map((item) => (item.id === originalId ? employee : item))
      : [employee, ...employees]
    setWorkforce({
      employees: next,
      departments: reconcileDepartmentHeads(departments, next, originalId, employee.id),
    })
    if (originalId && originalId !== employee.id) {
      leave.remapEmployeeId(originalId, employee.id)
      setRewards((current) => current.map((reward) => reward.employeeId === originalId
        ? { ...reward, employeeId: employee.id } : reward))
      setDiscipline((current) => remapDisciplineEmployee(current, originalId, employee.id))
      career.remapEmployeeId(originalId, employee.id)
    }
    if (!original)
      recordDepartmentChange(
        'Employee assigned',
        `${employee.name} · ${employee.department}`,
        'users',
      )
    else if (original.department !== employee.department)
      recordDepartmentChange(
        'Employee moved',
        `${employee.name} · ${original.department} → ${employee.department}`,
        'users',
      )
    setSearch('')
    setToast(
      originalId
        ? 'Employee updated.'
        : 'Employee registered.',
    )
    go({ page: 'employee', id: employee.id })
  }

  function removeEmployee(id) {
    const removed = employees.find((employee) => employee.id === id)
    const next = employees.filter((employee) => employee.id !== id)
    setWorkforce({ employees: next, departments: reconcileDepartmentHeads(departments, next) })
    // Match the rewards table's employee foreign key (ON DELETE CASCADE).
    setRewards((current) => current.filter((reward) => reward.employeeId !== id))
    setDiscipline((current) => removeEmployeeDiscipline(current, id))
    career.removeEmployee(id)
    if (removed)
      recordDepartmentChange(
        'Employee removed',
        `${removed.name} · ${removed.department}`,
        'user-minus',
      )
    setToast('Employee removed.')
    if (route.page === 'employee') go({ page: 'employees' })
  }

  function changeStatus(id, status) {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === id ? { ...employee, status } : employee,
      ),
    )
    setToast('Employee status updated.')
  }

  function importEmployees(records) {
    setEmployees((current) => [...records, ...current])
    recordDepartmentChange(
      'Employees imported',
      `${records.length} staff records added to their departments`,
      'upload',
    )
    setToast(
      `${records.length} employee${records.length === 1 ? '' : 's'} imported.`,
    )
  }

  function recordDepartmentChange(title, description, icon = 'building') {
    const change = {
      id: crypto.randomUUID(),
      time: new Date().toISOString(),
      title,
      description,
      icon,
    }
    setDepartmentChanges((current) => [change, ...current].slice(0, 50))
  }

  function handleSaveDepartment(values) {
    const result = saveDepartment(departments, employees, values)
    setWorkforce(result)
    recordDepartmentChange(
      values.id ? 'Department updated' : 'New department created',
      result.department.name,
    )
    setToast('Department saved.')
  }

  function handleDeleteDepartment(id) {
    if (recruitment.jobs.some((job) => job.departmentId === id))
      throw new Error('Move this department’s vacancies to another department before deleting it.')
    const removed = departments.find((department) => department.id === id)
    setDepartments(deleteDepartment(departments, employees, id))
    recordDepartmentChange('Department deleted', removed.name, 'trash')
    setToast('Department removed.')
  }

  function viewDepartmentEmployees(name) {
    go({ page: 'employees', department: name })
  }

  function handleSaveJobGrade(values) {
    const result = saveJobGrade(grades, employees, values)
    setWorkforce(result)
    setToast(
      'Job grade and assigned employee salaries updated.',
    )
  }

  function handleDeleteJobGrade(id) {
    setGrades(deleteJobGrade(grades, employees, id))
    setToast('Job grade removed.')
  }

  function viewGradeEmployees(name) {
    go({ page: 'employees', grade: name })
  }

  function handleSaveAttendanceSettings(values) {
    setAttendanceSettings(values)
    setToast('Attendance settings saved.')
  }

  async function handleSaveSharedData(values, save, commit, message) {
    if (sharedSavingRef.current) throw new Error('A change is already being saved.')
    sharedSavingRef.current = true
    setSharedSaving(true)
    try {
      const saved = await save(values)
      commit(saved)
      setToast(message)
      return saved
    } finally {
      sharedSavingRef.current = false
      setSharedSaving(false)
    }
  }

  function handleSaveGeneralSettings(values) {
    return handleSaveSharedData(values, saveGeneralSettings, setGeneralSettings, 'General settings saved.')
  }

  function handleSaveNotificationSettings(values) {
    return handleSaveSharedData(values, saveNotificationSettings, setNotificationSettings, 'Notification settings saved.')
  }

  function handleSaveProfile(values) {
    return handleSaveSharedData(values, saveAdminProfile, setAdminAccount, 'Profile saved.')
  }

  function handleSaveAccount(values) {
    return handleSaveSharedData(values, saveAccountSecurity, setAdminAccount, 'Account changes saved for this browser tab.')
  }

  function selectAccountSection(section) {
    if (operationSaving || sharedSavingRef.current) return
    const next = { page: 'profile', section: section === 'security' ? 'security' : 'profile' }
    if (routeHash(next) === routeHash(route)) return
    setRoute(next)
    window.history.pushState(null, '', routeHash(next))
  }

  function handleGrantReward(values) {
    setRewards(grantReward(rewards, employees, values))
    setSearch('')
    setToast('Staff recognition granted.')
  }

  function handleSaveJob(values) {
    setRecruitment(saveJob(recruitment, departments, values))
    setToast(values.id ? 'Vacancy updated.' : 'Vacancy saved.')
  }

  function handlePostAnnouncement(values) {
    setAnnouncements(postAnnouncement(announcements, values, adminAccount.profile.fullName))
    setSearch('')
    setToast('Announcement saved.')
    go({ page: 'announcements' })
  }

  function handleDeleteAnnouncement(id) {
    setAnnouncements(deleteAnnouncement(announcements, id))
    setToast('Announcement deleted.')
  }

  function handlePublishDocument(values) {
    setDocuments(publishDocument(documents, values))
    setToast('Document saved.')
  }

  function handleDeleteDocument(id) {
    setDocuments(deleteDocument(documents, id))
    setToast('Document deleted.')
  }

  function handleSaveService(values) {
    setServices(saveService(services, values))
    setToast(values.status === 'PUBLISHED' ? 'Service saved in the public catalog.' : 'Service saved as a draft.')
  }

  function handleDeleteService(id) {
    setServices(deleteService(services, id))
    setToast('Service deleted.')
  }

  function handleToggleJobStatus(id) {
    setRecruitment(toggleJobStatus(recruitment, departments, id))
    setToast('Vacancy status updated.')
  }

  function handleApplicationDecision(id, status) {
    setRecruitment(decideApplication(recruitment, id, status))
    setToast(status === 'SHORTLISTED' ? 'Candidate shortlisted for interview.' : 'Application rejected.')
  }

  function handleDeleteReward(id) {
    setRewards(deleteReward(rewards, id))
    setToast('Staff recognition deleted.')
  }

  function handleRecordDisciplinaryAction(values) {
    setDiscipline(recordDisciplinaryAction(discipline, employees, values))
    setSearch('')
    setToast('Disciplinary action recorded.')
  }

  function handleDeleteDisciplinaryAction(id) {
    setDiscipline(deleteDisciplinaryAction(discipline, id))
    setToast('Disciplinary record deleted. Activity history updated.')
  }

  function handleSaveCareerMilestone(values) {
    const milestone = career.save(values)
    setSearch('')
    setToast(milestone.status === 'SCHEDULED' ? 'Career milestone scheduled. Current grade and salary unchanged.'
      : milestone.status === 'HISTORICAL' ? 'Historical milestone recorded. Current grade and salary unchanged.'
        : milestone.status === 'APPLIED' ? 'Career milestone recorded. Employee grade and base salary updated.' : 'Career milestone recorded.')
  }

  function handleCancelCareerMilestone(id) {
    career.cancel(id)
    setToast('Scheduled milestone cancelled.')
  }

  async function handleLeaveDecision(decision) {
    await leave.decideRequest(decision)
    const { status } = decision
    setToast(status === 'PENDING' ? 'Request reopened for review. Balance reconciled.' : status === 'APPROVED' ? 'Leave approved. Remaining balance updated.' : 'Leave request rejected.')
  }

  async function handleSaveLeaveRequest(values) {
    await leave.saveRequest(values)
    setToast(values.id ? 'Leave request updated.' : 'Leave request created and awaiting HR approval.')
  }

  async function handleSaveLeaveSettings(values) {
    const saved = await leave.saveSettings(values)
    setToast('Leave settings saved.')
    return saved.settings
  }

  async function handleSaveLeaveEntitlement(values) {
    await leave.saveEntitlement(values)
    setToast('Leave entitlement updated.')
  }

  async function closeWorkspace() {
    if (leave.isSaving() || payroll.isSaving() || sharedSavingRef.current) return
    sharedSavingRef.current = true
    setSharedSaving(true)
    try {
      await signOut()
      leave.reset()
      payroll.reset()
      career.reset()
      resetAdmin()
      setSearch('')
      setDirty(false)
      setPendingRoute(null)
      setAction(null)
      setSignedInAt(null)
      setRoute({ page: 'dashboard' })
      window.history.replaceState(null, '', '#/login')
    } catch (error) {
      setToast(error.message || 'Unable to sign out. Please try again.')
    } finally {
      sharedSavingRef.current = false
      setSharedSaving(false)
    }
  }

  async function openWorkspace(values) {
    const session = await signIn(values)
    setAdminAccount(session.account)
    setSignedInAt(session.signedInAt)
    setWorkspaceClosed(false)
    window.history.replaceState(null, '', routeHash(route))
  }

  function handleReadNotification(notification, read = true) {
    setNotificationReceipts(current => updateNotificationReceipts(current, [notification], { read }))
  }

  function handleOpenNotification(notification) {
    if (leave.isSaving() || payroll.isSaving() || sharedSavingRef.current) {
      setToast('Please wait for the current change to finish saving.')
      return
    }
    const next = { ...notificationTarget(notification), notificationId: notification.id }
    if (dirty) setPendingRoute(next)
    else go(next)
  }

  function handleReadAllNotifications() {
    setNotificationReceipts(current => updateNotificationReceipts(current, notifications, { read: true }))
    setToast('All notifications marked as read.')
  }

  if (workspaceClosed) return <Login onSignIn={openWorkspace} />

  const employee = employees.find((item) => item.id === route.id)
  const dashboardSummary = route.page === 'dashboard' ? buildDashboardSummary({
    employees, departments, recruitment, leaveData: leave.data, payrollData: payroll.data,
    attendance, attendanceHeads,
  }) : null
  let content
  if (route.page === 'dashboard')
    content = (
      <Dashboard
        employees={employees}
        summary={dashboardSummary}
        search={search}
        onSearch={setSearch}
        onNavigate={navigate}
      />
    )
  else if (route.page === 'notifications')
    content = <Notifications notifications={notifications} search={search} onSearch={setSearch}
      notificationSettings={notificationSettings} onNavigate={navigate}
      onOpen={handleOpenNotification} onRead={handleReadNotification} onReadAll={handleReadAllNotifications}
      leaveLoading={leave.loading} leaveBusy={leave.loading || operationSaving} leaveError={leave.loadError} onRetryLeave={leave.data ? leave.retryRefresh : leave.reload} />
  else if (route.page === 'settings')
    content = <MainSettings settings={generalSettings} notificationSettings={notificationSettings} busy={operationSaving}
      section={route.section} onSectionChange={selectSettingsSection}
      onSave={handleSaveGeneralSettings} onSaveNotifications={handleSaveNotificationSettings} onDirtyChange={setDirty} />
  else if (route.page === 'profile')
    content = <AdminAccount account={adminAccount} companyName={generalSettings.companyName} signedInAt={signedInAt}
      section={route.section} onSectionChange={selectAccountSection} busy={operationSaving} onNavigate={navigate}
      onSaveProfile={handleSaveProfile} onSaveSecurity={handleSaveAccount} onDirtyChange={setDirty} />
  else if (route.page === 'reports')
    content = <Reports reports={reports} search={search} onSearch={setSearch} />
  else if (route.page === 'documents')
    content = <Documents documents={documents} search={search} onSearch={setSearch}
      onSave={handlePublishDocument} onDelete={handleDeleteDocument} onDirtyChange={setDirty} />
  else if (route.page === 'services')
    content = <Services services={services} search={search} onSearch={setSearch}
      onSave={handleSaveService} onDelete={handleDeleteService} onDirtyChange={setDirty} />
  else if (route.page === 'announcements')
    content = <Announcements announcements={announcements} search={search} onSearch={setSearch}
      onPost={() => setAction('announcement')} onDelete={handleDeleteAnnouncement} />
  else if (route.page === 'recruitment')
    content = <RecruitmentDashboard data={recruitment} departments={departments} search={search} onSearch={setSearch}
      onSave={handleSaveJob} onToggleStatus={handleToggleJobStatus} onNavigate={navigate} onDirtyChange={setDirty} />
  else if (route.page === 'applicants')
    content = <ViewApplicants key={route.id || 'all'} data={recruitment} departments={departments} search={search} onSearch={setSearch}
      initialJobId={route.id || ''} onDecide={handleApplicationDecision} onNavigate={navigate} />
  else if (route.page === 'rewards')
    content = <RewardsAndRecognitions rewards={rewards} employees={employees} search={search}
      onSearch={setSearch} onSave={handleGrantReward} onDelete={handleDeleteReward} onDirtyChange={setDirty} />
  else if (route.page === 'discipline')
    content = <DisciplineAndPenalties data={discipline} employees={employees} search={search}
      onSearch={setSearch} onSave={handleRecordDisciplinaryAction} onDelete={handleDeleteDisciplinaryAction} onDirtyChange={setDirty} />
  else if (route.page === 'career')
    content = <CareerTracking milestones={career.milestones} employees={employees} grades={grades} search={search}
      onSearch={setSearch} onSave={handleSaveCareerMilestone} onCancelScheduled={handleCancelCareerMilestone} onDirtyChange={setDirty} />
  else if (PAYROLL_PAGES.some((item) => item.id === route.page))
    content = payroll.data ? <PayrollWorkspace payroll={payroll} employees={employees} page={route.page}
      search={search} onSearch={setSearch} onNavigate={navigate} onDirtyChange={setDirty} /> : (
      <Card className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]" aria-busy={payroll.loading}><Icon name={payroll.loading ? 'clock' : 'info'} size={30} />
        <h1>{payroll.loading ? 'Loading payroll…' : 'Payroll unavailable'}</h1>
        {payroll.error && <p role="alert">{payroll.error}</p>}
        {!payroll.loading && <Button onClick={payroll.reset}>Try Again</Button>}
      </Card>
    )
  else if (['leave', 'leave-settings'].includes(route.page) && !leave.data)
    content = (
      <Card className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]" aria-busy={leave.loading}>
        <Icon name={leave.loading ? 'clock' : 'info'} size={30} />
        <h1>{leave.loading ? 'Loading leave data…' : 'Leave data unavailable'}</h1>
        {leave.loadError && <p role="alert">{leave.loadError}</p>}
        {!leave.loading && <Button onClick={leave.reload}>Try Again</Button>}
      </Card>
    )
  else if (route.page === 'leave')
    content = (
      <LeaveOverview key={route.status || 'all'} requests={leave.data.requests} balances={leave.data.balances}
        employees={employees} search={search} onSearch={setSearch} initialStatus={route.status || ''}
        settings={leave.data.settings} onDecide={handleLeaveDecision} onSaveRequest={handleSaveLeaveRequest}
        onNavigate={navigate} onDirtyChange={setDirty} />
    )
  else if (route.page === 'leave-settings')
    content = <LeaveSettings settings={leave.data.settings} balances={leave.data.balances} employees={employees} busy={operationSaving}
      onSave={handleSaveLeaveSettings} onSaveEntitlement={handleSaveLeaveEntitlement} onNavigate={navigate} onDirtyChange={setDirty} />
  else if (route.page === 'attendance')
    content = (
      <AttendanceOverview
        employees={employees}
        departments={departments}
        records={attendance}
        fallbackHeads={attendanceHeads}
        search={search}
        onSearch={setSearch}
      />
    )
  else if (route.page === 'check-in-logs')
    content = (
      <CheckInLogs employees={employees} departments={departments}
        records={attendance} fallbackHeads={attendanceHeads}
        search={search} onSearch={setSearch} />
    )
  else if (route.page === 'late-arrivals')
    content = (
      <LateArrivals employees={employees} departments={departments}
        records={attendance} fallbackHeads={attendanceHeads}
        search={search} onSearch={setSearch} />
    )
  else if (route.page === 'attendance-settings')
    content = (
      <AttendanceSettings settings={attendanceSettings} onDirtyChange={setDirty}
        onSave={handleSaveAttendanceSettings} />
    )
  else if (route.page === 'employees')
    content = (
      <EmployeeDirectory
        key={JSON.stringify([route.department, route.grade])}
        initialDepartment={route.department || ''}
        initialGrade={route.grade || ''}
        employees={employees}
        departments={departments}
        grades={grades}
        search={search}
        onSearch={setSearch}
        onNavigate={navigate}
        onDelete={removeEmployee}
        onStatusChange={changeStatus}
        onImport={importEmployees}
      />
    )
  else if (route.page === 'departments')
    content = (
      <DepartmentList
        departments={departments}
        employees={employees}
        changes={departmentChanges}
        search={search}
        onSearch={setSearch}
        onSave={handleSaveDepartment}
        onDelete={handleDeleteDepartment}
        onViewEmployees={viewDepartmentEmployees}
        onDirtyChange={setDirty}
      />
    )
  else if (route.page === 'grades')
    content = (
      <GradeList
        grades={grades}
        employees={employees}
        search={search}
        onSearch={setSearch}
        onSave={handleSaveJobGrade}
        onDelete={handleDeleteJobGrade}
        onViewEmployees={viewGradeEmployees}
        onDirtyChange={setDirty}
      />
    )
  else if (
    route.page === 'add-employee' ||
    (route.page === 'edit-employee' && employee)
  )
    content = (
      <AddEmployee
        key={route.id || 'new'}
        employee={employee}
        employees={employees}
        departments={departments}
        grades={grades}
        onSave={saveEmployee}
        onCancel={() => navigate('employees')}
        onDirtyChange={setDirty}
      />
    )
  else
    content = (
      <EmployeeDetails
        employee={employee}
        onBack={() => navigate('employees')}
        onEdit={() => navigate('edit-employee', route.id)}
        onDelete={removeEmployee}
      />
    )

  return (
    <AdminLayout
      search={search}
      onSearch={setSearch}
      onNavigate={navigate}
      activePage={route.page}
      account={adminAccount}
      notifications={notifications}
      notificationSettings={notificationSettings}
      onOpenNotification={handleOpenNotification}
    >
      {['leave', 'leave-settings'].includes(route.page) && leave.data && leave.loadError && (
        <Card className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">
          <p>{leave.loadError} The last loaded records are still shown.</p>
          <Button variant="secondary" type="button" disabled={operationSaving} onClick={leave.retryRefresh}>
            {operationSaving ? 'Please wait…' : 'Retry Refresh'}
          </Button>
        </Card>
      )}
      {content}
      {route.recordId && ['announcements', 'applicants', 'leave', 'career'].includes(route.page) && <NotificationDetails
        key={routeHash(route)} route={route} announcements={announcements} recruitment={recruitment} departments={departments}
        leaveData={leave.data} leaveLoading={leave.loading} leaveError={leave.loadError} onRetryLeave={leave.reload}
        milestones={career.milestones} employees={employees} busy={operationSaving}
        onClose={() => go({ ...route, recordId: undefined })} onDirtyChange={setDirty}
        onDeleteAnnouncement={handleDeleteAnnouncement} onDecideApplication={handleApplicationDecision}
        onDecideLeave={handleLeaveDecision} onCancelCareer={handleCancelCareerMilestone} />}
      {action === 'announcement' && <PostAnnouncementModal onSave={handlePostAnnouncement}
        onClose={() => { setAction(null); setDirty(false) }} onDirtyChange={setDirty} />}
      {action && action !== 'announcement' && (
        <DashboardActionDialog
          key={action}
          action={action}
          employees={employees}
          onClose={() => setAction(null)}
          onLogout={closeWorkspace}
          busy={operationSaving}
        />
      )}
      {pendingRoute && (
        <ConfirmationModal
          title="Discard unsaved changes?"
          confirmLabel="Discard changes"
          onCancel={() => setPendingRoute(null)}
          onConfirm={() => go(pendingRoute)}
        >
          <p>
            Your form has unsaved changes. Leave this page and discard them?
          </p>
        </ConfirmationModal>
      )}
      {toast && (
        <div className="toast tw:shared-base:[position:fixed] tw:shared-base:right-[25px] tw:shared-base:bottom-[24px]
          tw:shared-base:z-[45] tw:shared-base:flex tw:shared-base:items-center tw:shared-base:gap-[12px]
          tw:shared-base:max-w-[min(500px,_calc(100vw_-_32px))] tw:shared-base:[background:#0c5045]
          tw:shared-base:[color:white] tw:shared-base:[border:1px_solid_#377266]
          tw:shared-base:p-[10px_12px_10px_18px] tw:shared-base:rounded-[10px]
          tw:shared-base:[box-shadow:0_10px_30px_#0b383326] tw:shared-base:text-[13px]
          tw:shared-base:[&_.icon-button]:[color:#c3e5dc] tw:shared-base:[&_.icon-button]:w-[30px]
          tw:shared-base:[&_.icon-button]:h-[30px] tw:shared-base:[&_.icon-button:hover]:[background:#ffffff14]
          tw:max-[768px]:shared-base:right-[16px]
          tw:max-[768px]:shared-base:bottom-[16px]" role="status">
          <Icon name="check-circle" size={20} />
          <span>{toast}</span>
          <IconButton
            onClick={() => setToast('')}
            aria-label="Dismiss message"
          >
            <Icon name="close" size={16} />
          </IconButton>
        </div>
      )}
    </AdminLayout>
  )
}
