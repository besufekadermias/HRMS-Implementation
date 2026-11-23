import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  UserRound,
  Clock3,
  DollarSign,
  CalendarDays,
  Star,
  Award,
  FileText,
  KeyRound,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
} from 'lucide-react'
import BrandMark from '../../components/common/BrandMark.jsx'
import ConfirmDiscardDialog from '../../components/common/ConfirmDiscardDialog.jsx'
import { useEmployeeStore } from '../../store/index.js'
import { signOut } from '../../services/auth/authService.js'

const navigation = [
  ['/dashboard', 'Dashboard', LayoutDashboard],
  ['/profile', 'My Profile', UserRound],
  ['/attendance', 'Attendance', Clock3],
  ['/payroll', 'My Payroll', DollarSign],
  ['/leave', 'My Leave', CalendarDays],
  ['/milestones', 'Milestones', Star],
  ['/rewards', 'Rewards', Award],
  ['/reports', 'Submit Report', FileText],
  ['/change-password', 'Change Password', KeyRound],
]

export default function EmployeeLayout() {
  const {
    user,
    setUser,
    securityBusy: passwordBusy,
    passwordDirty,
    profileBusy,
    profileDirty,
    attendanceBusy,
    leaveBusy,
    leaveDirty,
    reportBusy,
    reportDirty,
    notice,
    setNotice,
  } = useEmployeeStore()
  const securityBusy = passwordBusy || profileBusy || attendanceBusy || leaveBusy || reportBusy
  const formDirty = passwordDirty || profileDirty || leaveDirty || reportDirty
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const sidebarRef = useRef(null)
  const menuRef = useRef(null)
  const profileRef = useRef(null)
  const profileButtonRef = useRef(null)
  const searchRef = useRef(null)
  const logoutLock = useRef(false)
  const initial = user.fullName.charAt(0).toUpperCase() || 'E'
  const dashboard = location.pathname === '/dashboard'
  const active = navigation.find(
    ([path]) =>
      path === location.pathname ||
      (['/payroll', '/leave', '/reports'].includes(path) &&
        location.pathname.startsWith(`${path}/`)),
  )
  const PageIcon = active?.[2] || LayoutDashboard

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1025px)')
    const closeOnDesktop = (event) => {
      if (event.matches) setOpen(false)
    }
    function focusSearch(event) {
      if (
        event.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) &&
        searchRef.current
      ) {
        event.preventDefault()
        searchRef.current.focus()
      }
    }
    desktop.addEventListener('change', closeOnDesktop)
    document.addEventListener('keydown', focusSearch)
    return () => {
      desktop.removeEventListener('change', closeOnDesktop)
      document.removeEventListener('keydown', focusSearch)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const sidebar = sidebarRef.current
    const menuButton = menuRef.current
    const wasScrollLocked = document.body.classList.contains('overflow-hidden')
    document.body.classList.add('overflow-hidden')
    sidebar.querySelector('a, button')?.focus()
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false)
      if (event.key !== 'Tab') return
      const focusable = [...sidebar.querySelectorAll('a, button:not(:disabled)')].filter(
        (element) => element.getClientRects().length,
      )
      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      if (!wasScrollLocked) document.body.classList.remove('overflow-hidden')
      document.removeEventListener('keydown', onKey)
      menuButton?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!profileOpen) return
    function dismiss(event) {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false)
    }
    function escape(event) {
      if (event.key === 'Escape') {
        setProfileOpen(false)
        profileButtonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
    }
  }, [profileOpen])

  function closeNavigation() {
    setOpen(false)
    setProfileOpen(false)
  }
  function followRoute(event, destination) {
    if (securityBusy || (user.mustChangePassword && destination !== '/change-password')) {
      event.preventDefault()
      return
    }
    if (location.pathname !== destination && formDirty) {
      event.preventDefault()
      closeNavigation()
      setPendingAction({ type: 'navigate', destination })
      return
    }
    closeNavigation()
  }
  async function logout(discard = false) {
    if (logoutLock.current || securityBusy) return
    if (formDirty && discard !== true) {
      closeNavigation()
      setPendingAction({ type: 'logout' })
      return
    }
    logoutLock.current = true
    setBusy(true)
    setError('')
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      setError(error.message)
    } finally {
      logoutLock.current = false
      setBusy(false)
    }
  }

  function discardAndContinue() {
    const action = pendingAction
    setPendingAction(null)
    if (action?.type === 'logout') void logout(true)
    else if (action?.type === 'navigate') navigate(action.destination)
  }
  return (
    <div className={String.raw`portal-shell employee-base:min-h-[100dvh]`}>
      {pendingAction && (
        <ConfirmDiscardDialog
          profile={profileDirty}
          leave={leaveDirty}
          report={reportDirty}
          onCancel={() => setPendingAction(null)}
          onConfirm={discardAndContinue}
        />
      )}
      <a
        className={String.raw`skip-link employee-base:fixed employee-base:[top:8px] employee-base:[left:8px] employee-base:z-[100]
    employee-base:p-[12px] employee-base:[border:2px_solid_var(--primary)] employee-base:rounded-[6px]
    employee-base:[background:white] employee-base:[transform:translateY(-180%)]
    employee-base:[&:focus]:[transform:translateY(0)]`}
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to main content
      </a>
      {open && (
        <button
          className={String.raw`sidebar-backdrop employee-base:fixed employee-base:[inset:0] employee-base:[background:#163d3980]
    employee-base:z-[25]`}
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={String.raw`sidebar employee-base:fixed employee-base:[inset:0_auto_0_0] employee-base:w-[var(--sidebar-width)]
    employee-base:flex employee-base:flex-col
    employee-base:[background:linear-gradient(_160deg,_#0b3432_0%,_#0c3534_55%,_var(--sidebar-bottom)_100%_)]
    employee-base:text-[color:var(--sidebar-text)] employee-base:z-[30] employee-base:overflow-y-auto
    employee-base:[scrollbar-width:thin] employee-base:[scrollbar-color:#31635c_transparent]
    employee-page:screen-max-1024:w-[280px] employee-page:screen-max-1024:[transform:translateX(-100%)]
    employee-page:screen-max-1024:[transition:transform_0.18s_ease] employee-page:screen-max-1024:invisible ${
      open
        ? String.raw`sidebar-open employee-page:screen-max-1024:[&.sidebar-open]:[transform:translateX(0)]
    employee-page:screen-max-1024:[&.sidebar-open]:visible`
        : ''
    }`}
        ref={sidebarRef}
        aria-label="Employee navigation"
        role={open ? 'dialog' : undefined}
        aria-modal={open || undefined}
      >
        <Link
          to={user.mustChangePassword ? '/change-password' : '/dashboard'}
          className={String.raw`sidebar-brand employee-base:flex employee-base:items-center employee-base:gap-[13px]
    employee-base:p-[25px_25px_28px] employee-base:[flex-shrink:0] employee-page:screen-compact:pl-[20px]
    employee-page:screen-compact:pr-[20px]`}
          aria-label="HRMS employee portal"
          aria-disabled={securityBusy}
          onClick={(event) =>
            followRoute(event, user.mustChangePassword ? '/change-password' : '/dashboard')
          }
        >
          <BrandMark />
          <span>
            <strong
              className={String.raw`brand-name employee-base:block employee-base:text-[color:#f4ffff] employee-base:text-[length:24px]
    employee-base:font-[650] employee-base:tracking-[0.4px] employee-base:leading-[1.2]`}
            >
              HRMS
            </strong>
            <small
              className={String.raw`brand-tagline employee-base:block employee-base:mt-[3px] employee-base:text-[color:#c7dbdc]
    employee-base:text-[length:9px] employee-base:tracking-[0.1px] employee-base:whitespace-nowrap
    employee-page:screen-compact:text-[length:8px]`}
            >
              People · Process · Progress
            </small>
          </span>
        </Link>
        <button
          className={String.raw`sidebar-close icon-button absolute right-2 top-2 text-[#9cb9bd] employee-base:hidden
    employee-base:items-center employee-base:justify-center employee-base:w-[40px] employee-base:h-[40px]
    employee-base:p-[8px] employee-base:rounded-[8px] employee-base:text-[color:var(--text-secondary)]
    employee-base:[&:hover]:[background:#edf6f5] employee-base:[&:hover]:text-[color:var(--primary)]
    employee-page:screen-max-1024:inline-flex`}
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        >
          <X size={18} />
        </button>
        <p
          className={String.raw`sidebar-label employee-base:p-[7px_31px_13px] employee-base:text-[color:#749d99]
    employee-base:text-[length:9px] employee-base:tracking-[1.6px] employee-base:font-[600]`}
        >
          EMPLOYEE WORKSPACE
        </p>
        <nav
          className={String.raw`sidebar-nav employee-base:p-[0_16px] employee-base:flex employee-base:flex-col employee-base:gap-[5px]`}
        >
          {navigation.map(([path, label, Icon]) =>
            ([
              '/dashboard',
              '/profile',
              '/attendance',
              '/payroll',
              '/leave',
              '/milestones',
              '/rewards',
              '/reports',
            ].includes(path) &&
              !user.mustChangePassword) ||
            path === '/change-password' ? (
              <NavLink
                key={path}
                to={path}
                className={({
                  isActive,
                }) => String.raw`nav-link employee-base:flex employee-base:items-center employee-base:gap-[16px] employee-base:min-h-[46px]
    employee-base:p-[12px_16px] employee-base:rounded-[8px] employee-base:text-[length:13px]
    employee-base:[transition:background_0.15s] employee-base:[&_>_svg]:text-[color:#bfd5d4]
    employee-base:[&:hover]:[background:#ffffff0a] employee-page:screen-compact:gap-[13px]
    employee-page:screen-compact:pl-[13px] employee-page:screen-compact:pr-[13px]
    employee-page:screen-compact:text-[length:12px] ${
      isActive
        ? String.raw`nav-active employee-base:[&.nav-active]:[background:linear-gradient(100deg,_#207469,_#19594f)]
    employee-base:[&.nav-active]:[box-shadow:inset_0_1px_0_#ffffff08,_0_3px_12px_#042c2910]
    employee-base:[&.nav-active]:text-[color:white] employee-base:[&.nav-active]:font-[600]
    employee-base:[&.nav-active_>_svg]:text-[color:#e1f9f2]`
        : ''
    }`}
                aria-disabled={securityBusy}
                tabIndex={securityBusy ? -1 : undefined}
                onClick={(event) => followRoute(event, path)}
              >
                <Icon size={20} />
                <span>{label}</span>
                {location.pathname === path && (
                  <span
                    className={String.raw`nav-active-dot employee-base:w-[5px] employee-base:h-[5px] employee-base:ml-[auto] employee-base:rounded-[50%]
    employee-base:[background:#63ceb2]`}
                  />
                )}
              </NavLink>
            ) : (
              <span
                key={path}
                className={String.raw`nav-link opacity-60 employee-base:flex employee-base:items-center employee-base:gap-[16px]
    employee-base:min-h-[46px] employee-base:p-[12px_16px] employee-base:rounded-[8px]
    employee-base:text-[length:13px] employee-base:[transition:background_0.15s]
    employee-base:[&_>_svg]:text-[color:#bfd5d4] employee-base:[&:hover]:[background:#ffffff0a]
    employee-page:screen-compact:gap-[13px] employee-page:screen-compact:pl-[13px]
    employee-page:screen-compact:pr-[13px] employee-page:screen-compact:text-[length:12px]`}
                aria-disabled="true"
                title="Available in a later update"
              >
                <Icon size={20} />
                <span>{label}</span>
              </span>
            ),
          )}
        </nav>
        <div
          className={String.raw`sidebar-bottom employee-base:relative employee-base:mt-[auto] employee-base:pt-[115px]
    employee-base:min-h-[260px] employee-base:[flex-shrink:0] employee-page:screen-max-1024:min-h-[180px]
    employee-page:screen-max-1024:pt-[40px]`}
        >
          <div
            className={String.raw`sidebar-landscape employee-base:absolute employee-base:[inset:17px_0_70px] employee-base:overflow-hidden
    employee-base:opacity-[0.45] employee-base:pointer-events-none employee-base:[&_span]:absolute
    employee-base:[&_span]:[inset:0]
    employee-base:[&_span]:[clip-path:polygon(_0_70%,_14%_57%,_24%_64%,_43%_43%,_52%_48%,_72%_26%,_100%_57%,_100%_100%,_0_100%_)]
    employee-base:[&_span]:[background:#164d48] employee-base:[&_span:nth-child(2)]:[background:#0e403d]
    employee-base:[&_span:nth-child(2)]:[transform:translateY(27px)]
    employee-base:[&_span:nth-child(2)]:[clip-path:polygon(_0_65%,_22%_40%,_40%_63%,_54%_47%,_72%_57%,_85%_40%,_100%_50%,_100%_100%,_0_100%_)]
    employee-base:[&_span:nth-child(3)]:[background:#082f2e]
    employee-base:[&_span:nth-child(3)]:[transform:translateY(58px)] employee-page:screen-max-1024:hidden`}
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
          </div>
          <p
            className={String.raw`sidebar-slogan employee-base:relative employee-base:p-[0_32px_26px] employee-base:text-[color:#a0bdbb]
    employee-base:text-[length:13px] employee-base:leading-[1.5] employee-base:[&::after]:block
    employee-base:[&::after]:[content:''] employee-base:[&::after]:mt-[15px] employee-base:[&::after]:w-[28px]
    employee-base:[&::after]:h-[2px] employee-base:[&::after]:[background:#21af90]
    employee-page:screen-max-1024:hidden`}
          >
            Great teams
            <br />
            build great things
          </p>
          <div
            className={String.raw`sidebar-profile employee-base:relative employee-base:flex employee-base:items-center
    employee-base:p-[17px_20px] employee-base:gap-[10px] employee-base:[border-top:1px_solid_#ffffff0d]
    employee-base:[background:#062a291f]`}
          >
            <span
              className={String.raw`avatar sidebar-avatar employee-base:w-[34px] employee-base:h-[34px] employee-base:rounded-[50%]
    employee-base:inline-flex employee-base:items-center employee-base:justify-center
    employee-base:text-[color:#b6ebda] employee-base:[background:#1d5c53]
    employee-base:[border:1px_solid_#3c78694d] employee-base:text-[length:13px] employee-base:font-[600]
    employee-base:[flex-shrink:0] employee-page:screen-max-768:w-[35px] employee-page:screen-max-768:h-[35px]`}
            >
              {initial}
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-[11px] font-semibold text-[#e2eeec]">Employee</strong>
              <span className="mt-1 block truncate text-[10px] text-[#91b0ad]">
                {user.fullName}
              </span>
            </span>
            <button
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#9bbdb7] hover:bg-[#ffffff12]"
              aria-label="Logout"
              onClick={logout}
              disabled={busy || securityBusy}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div
        className={String.raw`portal-body employee-base:ml-[var(--sidebar-width)] employee-base:min-w-[0]
    employee-page:screen-max-1024:ml-[0]`}
      >
        <header
          className={String.raw`portal-header employee-base:h-[var(--header-height)] employee-base:flex employee-base:justify-between
    employee-base:items-center employee-base:gap-[20px] employee-base:p-[0_30px]
    employee-base:[background:white] employee-base:[border-bottom:1px_solid_var(--border)]
    employee-base:sticky employee-base:[top:0] employee-base:z-[20] employee-page:screen-max-1280:p-[0_22px]
    employee-page:screen-max-1024:gap-[12px] employee-page:screen-max-768:p-[0_15px]
    employee-page:screen-max-768:gap-[8px]`}
        >
          <button
            className={String.raw`mobile-menu-button icon-button shrink-0 employee-base:hidden employee-base:items-center
    employee-base:justify-center employee-base:w-[40px] employee-base:h-[40px] employee-base:p-[8px]
    employee-base:rounded-[8px] employee-base:text-[color:var(--text-secondary)]
    employee-base:[&:hover]:[background:#edf6f5] employee-base:[&:hover]:text-[color:var(--primary)]
    employee-page:screen-max-1024:inline-flex`}
            ref={menuRef}
            aria-label="Open navigation"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>
          {dashboard ? (
            <div
              className={String.raw`header-search employee-base:flex employee-base:items-center employee-base:w-[min(48%,_532px)]
    employee-base:h-[41px] employee-base:rounded-[24px] employee-base:[background:var(--search-bg)]
    employee-base:[border:1px_solid_#eff4f8] employee-base:gap-[10px] employee-base:p-[4px_14px_4px_5px]
    employee-base:[&:focus-within]:[border-color:#a3d2c8]
    employee-base:[&:focus-within]:[box-shadow:0_0_0_3px_#dff2ed80] employee-base:[&_input]:[border:0]
    employee-base:[&_input]:[background:transparent] employee-base:[&_input]:p-[0]
    employee-base:[&_input]:[outline:none] employee-base:[&_input]:text-[length:11px]
    employee-base:[&_kbd]:p-[1px_5px] employee-base:[&_kbd]:text-[length:10px]
    employee-base:[&_kbd]:[border:1px_solid_#e0e9f0] employee-base:[&_kbd]:rounded-[4px]
    employee-base:[&_kbd]:text-[color:#7891a2] employee-base:[&_kbd]:[background:#fff9]
    employee-page:screen-max-1024:mr-[auto] employee-page:screen-max-1024:w-[min(50%,_532px)]
    employee-page:screen-max-768:w-[100%] employee-page:screen-max-768:gap-[5px]
    employee-page:screen-max-768:pr-[8px] employee-page:screen-max-768:[&_kbd]:hidden
    employee-page:screen-max-768:[&_input]:text-[length:12px]
    employee-page:screen-max-480:[&_input]:text-[length:12px]`}
            >
              <span
                className={String.raw`search-icon employee-base:inline-flex employee-base:items-center employee-base:justify-center
    employee-base:w-[31px] employee-base:h-[31px] employee-base:[background:white]
    employee-base:text-[color:#7091a3] employee-base:rounded-[50%] employee-base:[flex-shrink:0]
    employee-page:screen-max-768:w-[27px] employee-page:screen-max-768:h-[27px]`}
              >
                <Search size={19} />
              </span>
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search department announcements…"
                aria-label="Search department announcements"
                aria-controls="department-announcements"
              />
              <kbd aria-hidden="true">/</kbd>
            </div>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-[9px] text-[13px] font-semibold text-text-secondary">
              <PageIcon size={19} />
              <span className="truncate">{active?.[1] || 'Employee Portal'}</span>
            </div>
          )}
          <div
            className={String.raw`header-controls employee-base:flex employee-base:items-center employee-base:gap-[16px]
    employee-base:[flex-shrink:0] employee-page:screen-max-768:gap-[6px]`}
          >
            <button
              className={String.raw`icon-button employee-base:inline-flex employee-base:items-center employee-base:justify-center
    employee-base:w-[40px] employee-base:h-[40px] employee-base:p-[8px] employee-base:rounded-[8px]
    employee-base:text-[color:var(--text-secondary)] employee-base:[&:hover]:[background:#edf6f5]
    employee-base:[&:hover]:text-[color:var(--primary)]`}
              aria-label="Logout"
              onClick={logout}
              disabled={busy || securityBusy}
            >
              <LogOut size={20} />
            </button>
            <span
              className={String.raw`header-divider employee-base:w-[1px] employee-base:h-[28px] employee-base:[background:var(--divider)]
    employee-page:screen-max-768:hidden`}
            />
            <div
              className="relative"
              ref={profileRef}
            >
              <button
                className={String.raw`profile-button employee-base:flex employee-base:items-center employee-base:gap-[10px] employee-base:p-[4px_0]
    employee-base:rounded-[6px] employee-page:screen-max-768:[&_>_svg]:hidden
    employee-page:screen-max-768:gap-[3px]`}
                ref={profileButtonRef}
                aria-label={`Open ${user.fullName}'s account options`}
                aria-expanded={profileOpen}
                aria-controls="employee-profile-dropdown"
                onClick={() => setProfileOpen(!profileOpen)}
                disabled={securityBusy}
              >
                <span
                  className={String.raw`avatar employee-base:w-[39px] employee-base:h-[39px] employee-base:rounded-[50%] employee-base:inline-flex
    employee-base:items-center employee-base:justify-center employee-base:text-[color:#206c62]
    employee-base:[background:linear-gradient(140deg,_#e3f4ee,_#c9e7e0)]
    employee-base:[border:3px_solid_white] employee-base:text-[length:16px] employee-base:font-[600]
    employee-base:[flex-shrink:0] employee-page:screen-max-768:w-[35px] employee-page:screen-max-768:h-[35px]`}
                >
                  {initial}
                </span>
                <span
                  className={String.raw`profile-text employee-base:text-left employee-base:mr-[13px] employee-base:[&_strong]:block
    employee-base:[&_strong]:max-w-[160px] employee-base:[&_strong]:overflow-hidden
    employee-base:[&_strong]:[text-overflow:ellipsis] employee-base:[&_strong]:whitespace-nowrap
    employee-base:[&_strong]:text-[length:11px] employee-base:[&_strong]:font-[600]
    employee-base:[&_small]:block employee-base:[&_small]:mt-[4px]
    employee-base:[&_small]:text-[color:var(--text-secondary)] employee-base:[&_small]:text-[length:11px]
    employee-page:screen-max-768:hidden`}
                >
                  <strong>{user.fullName}</strong>
                  <small>Employee</small>
                </span>
                <ChevronDown
                  size={16}
                  className="text-muted"
                />
              </button>
              {profileOpen && (
                <div
                  className={String.raw`header-dropdown employee-base:absolute employee-base:[right:0] employee-base:[top:calc(100%_+_15px)]
    employee-base:w-[266px] employee-base:[border:1px_solid_var(--border)] employee-base:[background:white]
    employee-base:[box-shadow:0_12px_35px_#163d3920] employee-base:p-[8px] employee-base:rounded-[10px]`}
                  id="employee-profile-dropdown"
                  aria-label="Profile options"
                >
                  <div className="mb-1 border-b border-border px-2.5 py-3">
                    <strong className="block break-words text-[13px]">{user.fullName}</strong>
                    <small className="mt-1 block break-words text-[11px] text-muted">
                      {user.login}
                    </small>
                  </div>
                  {user.mustChangePassword ? (
                    <span
                      className={String.raw`dropdown-item opacity-50 employee-base:flex employee-base:items-center employee-base:gap-[10px]
    employee-base:min-h-[42px] employee-base:w-[100%] employee-base:p-[10px] employee-base:rounded-[6px]
    employee-base:text-[color:var(--text-secondary)] employee-base:text-[length:12px] employee-base:text-left
    employee-base:[&:hover]:text-[color:var(--primary)] employee-base:[&:hover]:[background:#f0f8f5]`}
                      aria-disabled="true"
                    >
                      <UserRound size={18} />
                      My Profile
                    </span>
                  ) : (
                    <Link
                      className={String.raw`dropdown-item employee-base:flex employee-base:items-center employee-base:gap-[10px]
    employee-base:min-h-[42px] employee-base:w-[100%] employee-base:p-[10px] employee-base:rounded-[6px]
    employee-base:text-[color:var(--text-secondary)] employee-base:text-[length:12px] employee-base:text-left
    employee-base:[&:hover]:text-[color:var(--primary)] employee-base:[&:hover]:[background:#f0f8f5]`}
                      to="/profile"
                      aria-disabled={securityBusy}
                      onClick={(event) => followRoute(event, '/profile')}
                    >
                      <UserRound size={18} />
                      My Profile
                    </Link>
                  )}
                  <Link
                    className={String.raw`dropdown-item employee-base:flex employee-base:items-center employee-base:gap-[10px]
    employee-base:min-h-[42px] employee-base:w-[100%] employee-base:p-[10px] employee-base:rounded-[6px]
    employee-base:text-[color:var(--text-secondary)] employee-base:text-[length:12px] employee-base:text-left
    employee-base:[&:hover]:text-[color:var(--primary)] employee-base:[&:hover]:[background:#f0f8f5]`}
                    to="/change-password"
                    aria-disabled={securityBusy}
                    onClick={(event) => followRoute(event, '/change-password')}
                  >
                    <KeyRound size={18} />
                    Change Password
                  </Link>
                  <button
                    className={String.raw`dropdown-item employee-base:flex employee-base:items-center employee-base:gap-[10px]
    employee-base:min-h-[42px] employee-base:w-[100%] employee-base:p-[10px] employee-base:rounded-[6px]
    employee-base:text-[color:var(--text-secondary)] employee-base:text-[length:12px] employee-base:text-left
    employee-base:[&:hover]:text-[color:var(--primary)] employee-base:[&:hover]:[background:#f0f8f5]`}
                    onClick={logout}
                    disabled={busy || securityBusy}
                  >
                    <LogOut size={18} />
                    {busy ? 'Signing out…' : 'Log out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main
          id="main-content"
          className={String.raw`portal-main focus:outline-none employee-base:p-[28px_30px_0] employee-base:max-w-[1660px]
    employee-base:m-[auto] employee-page:screen-max-1280:p-[24px_22px_0]
    employee-page:screen-max-1024:p-[25px_22px_0] employee-page:screen-max-768:p-[22px_18px_0]
    employee-page:screen-max-480:pl-[15px] employee-page:screen-max-480:pr-[15px]`}
          tabIndex={-1}
        >
          {error && (
            <p
              role="alert"
              className={String.raw`error-notice mb-5 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#b42344] employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
            >
              {error}
            </p>
          )}
          {notice && (
            <div
              className={String.raw`info-notice mb-5 flex items-center justify-between gap-3 employee-base:p-[12px_14px]
    employee-base:[border:1px_solid_#d7ece4] employee-base:rounded-[7px] employee-base:text-[length:12px]
    employee-base:leading-[1.7] employee-base:text-[color:#166c5b] employee-base:[border-color:#d7ece4]
    employee-base:[background:#f0faf5]`}
            >
              <p role="status">{notice}</p>
              <button
                className="shrink-0 rounded p-1"
                aria-label="Dismiss account message"
                onClick={() => setNotice('')}
              >
                <X size={16} />
              </button>
            </div>
          )}
          <Outlet context={{ search }} />
          <footer
            className={String.raw`portal-footer employee-base:flex employee-base:items-center employee-base:justify-between
    employee-base:gap-[15px] employee-base:p-[20px_0] employee-base:text-[color:#74909b]
    employee-base:text-[length:10px] employee-page:screen-max-768:flex-wrap
    employee-page:screen-max-768:text-[length:9px] employee-page:screen-max-768:gap-[8px]`}
          >
            <span>© {new Date().getFullYear()} Hadiya Science · IT Department</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
