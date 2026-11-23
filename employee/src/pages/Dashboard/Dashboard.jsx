import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  CalendarDays,
  Clock3,
  DollarSign,
  FileText,
  ShieldCheck,
  Star,
  ChevronRight,
  Megaphone,
} from 'lucide-react'
import { useEmployeeStore } from '../../store/index.js'
import { loadDashboard } from '../../services/work/attendanceService.js'
import useAttendance from '../../hooks/work/useAttendance.js'
import CheckInOutWidget from '../../components/attendance/CheckInOutWidget.jsx'
import { formatTime } from '../../utils/formatters/attendanceTime.js'

const operations = [
  {
    to: '/payroll',
    title: 'My Payroll & Payslips',
    description: 'View your salary, deductions, and payslips',
    Icon: DollarSign,
    tone: 'green',
  },
  {
    to: '/leave/request',
    title: 'Request Leave',
    description: 'Submit leave and follow approval status',
    Icon: CalendarDays,
    tone: 'amber',
  },
  {
    to: '/reports',
    title: 'Submit Report',
    description: 'Send findings and recommendations to HR',
    Icon: FileText,
    tone: 'blue',
  },
]

function DashboardContent({ data, search }) {
  const attendance = useAttendance(data.attendance)
  const portalBusy = useEmployeeStore(
    (state) =>
      state.securityBusy ||
      state.profileBusy ||
      state.attendanceBusy ||
      state.leaveBusy ||
      state.reportBusy,
  )
  const user = data.user
  const state = attendance.state
  const duty = state?.record?.checkOut
    ? 'Completed'
    : state?.record?.checkIn
      ? 'Checked In'
      : 'Pending'
  const announcements = data.announcements.filter((item) =>
    `${item.title} ${item.content}`.toLowerCase().includes(search.trim().toLowerCase()),
  )
  const statistics = [
    {
      label: 'Today’s Duty',
      value: state ? duty : 'Unavailable',
      detail: state?.record?.checkIn
        ? `Check-in: ${formatTime(state.record.checkIn, state.timeZone)}${state.record.status === 'LATE' ? ' · Late' : ''}`
        : 'Awaiting office check-in',
      Icon: Clock3,
      tone: state?.record?.checkIn ? 'green' : 'amber',
      text: true,
    },
    {
      label: 'Leave Balance',
      value: data.leaveBalance ?? '—',
      detail: data.leaveBalance == null ? 'No leave balance assigned' : 'Available days',
      Icon: CalendarDays,
      tone: 'green',
    },
    {
      label: 'Job Grade & Scale',
      value: user.grade || 'Unassigned',
      detail:
        user.baseSalary == null
          ? 'Salary scale unassigned'
          : `Base: ${new Intl.NumberFormat('en', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(user.baseSalary)}`,
      Icon: Star,
      tone: 'blue',
      text: true,
    },
    {
      label: 'Employment Status',
      value: user.employmentStatus || 'Unassigned',
      detail: user.employmentType || 'Employment details unassigned',
      Icon: ShieldCheck,
      tone: 'green',
      text: true,
    },
  ]

  return (
    <>
      <section
        className={String.raw`dashboard-intro employee-base:flex employee-base:items-center employee-base:justify-between
    employee-base:gap-[22px] employee-base:mb-[25px] employee-page:screen-max-768:block
    employee-page:screen-max-768:mb-[22px]`}
        aria-labelledby="dashboard-title"
      >
        <div>
          <p
            className={String.raw`intro-eyebrow employee-base:flex employee-base:items-center employee-base:gap-[11px] employee-base:mb-[10px]
    employee-base:text-[length:10px] employee-base:text-[color:var(--text-muted)]
    employee-page:screen-max-480:gap-[8px] employee-page:screen-max-480:text-[length:9px]`}
          >
            <span
              className={String.raw`eyebrow employee-base:text-[length:10px] employee-base:font-[700] employee-base:tracking-[1.4px]
    employee-base:uppercase employee-base:text-[color:var(--primary)]
    employee-page:screen-max-480:text-[length:9px] employee-page:screen-max-480:tracking-[1.1px]`}
            >
              EMPLOYEE WORKSPACE
            </span>
            <span
              className={String.raw`intro-divider employee-base:w-[1px] employee-base:h-[10px] employee-base:[background:#ccdddf]`}
            />
            <span>Employee Portal</span>
          </p>
          <h1 id="dashboard-title">Welcome back, {user.fullName}!</h1>
          <p
            className={String.raw`intro-description employee-base:mt-[9px] employee-base:text-[length:12px] employee-base:leading-[1.8]
    employee-base:text-[color:var(--text-secondary)]`}
          >
            {user.department || 'Department unassigned'} · Serial:{' '}
            <strong className="font-semibold">{user.serialNumber}</strong>
          </p>
          <p className="mt-1 text-[12px] leading-[1.8] text-text-secondary">
            Your attendance, employment details, and department updates in one place.
          </p>
        </div>
        <div
          className={String.raw`intro-actions employee-base:flex employee-base:flex-col employee-base:items-end employee-base:gap-[13px]
    employee-base:[flex-shrink:0] employee-base:max-w-[290px] employee-page:screen-max-768:mt-[19px]
    employee-page:screen-max-768:max-w-[none] employee-page:screen-max-768:items-start
    employee-page:screen-max-768:gap-[12px]`}
        >
          <div
            className={String.raw`snapshot-date employee-base:flex employee-base:gap-[9px] employee-base:text-[color:var(--text-secondary)]
    employee-base:text-[length:11px]`}
          >
            <CalendarDays size={16} />
            <time dateTime={data.attendance.date}>
              {new Intl.DateTimeFormat('en', {
                timeZone: data.attendance.timeZone,
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }).format(new Date(data.attendance.serverTime))}
            </time>
          </div>
          <CheckInOutWidget
            attendance={attendance}
            compact
          />
        </div>
      </section>
      {attendance.error && (
        <p
          role="alert"
          className={String.raw`error-notice mb-5 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#b42344] employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
        >
          {attendance.error}
        </p>
      )}
      <section
        className={String.raw`workforce-stats employee-base:grid employee-base:grid-cols-[repeat(4,_minmax(0,_1fr))]
    employee-base:gap-[15px] employee-base:mb-[20px]
    employee-page:screen-max-1280:grid-cols-[repeat(2,_minmax(0,_1fr))]
    employee-page:screen-max-768:gap-[12px] employee-page:screen-max-768:mb-[16px]
    employee-page:screen-max-480:grid-cols-[minmax(0,_1fr)] employee-page:screen-max-480:gap-[10px]`}
        aria-label="Employee summary"
      >
        {statistics.map(({ label, value, detail, Icon, tone, text }) => (
          <article
            key={label}
            className={String.raw`surface stat-card employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:flex employee-base:items-start
    employee-base:gap-[15px] employee-base:p-[23px_18px_20px] employee-base:min-h-[138px]
    employee-page:screen-compact:pl-[14px] employee-page:screen-compact:pr-[14px]
    employee-page:screen-compact:gap-[11px] employee-page:screen-compact:[&_.icon-circle]:w-[38px]
    employee-page:screen-compact:[&_.icon-circle]:h-[38px] employee-page:screen-max-1280:min-h-[125px]
    employee-page:screen-max-768:p-[17px_15px] employee-page:screen-max-768:gap-[12px]
    employee-page:screen-max-768:min-h-[127px] employee-page:screen-max-768:[&_.icon-circle]:w-[40px]
    employee-page:screen-max-768:[&_.icon-circle]:h-[40px] employee-page:screen-max-480:min-h-[110px]
    employee-page:screen-max-480:p-[18px_20px] employee-page:screen-max-480:gap-[17px]
    employee-page:screen-max-480:[&_.icon-circle]:w-[46px]
    employee-page:screen-max-480:[&_.icon-circle]:h-[46px]`}
          >
            <span
              className={String.raw`employee-base:w-[46px] employee-base:h-[46px] employee-base:inline-flex employee-base:items-center
    employee-base:justify-center employee-base:rounded-[50%] employee-base:[flex-shrink:0]
    employee-base:[&.tone-green]:text-[color:#0b8972] employee-base:[&.tone-green]:[background:#e3f5f0]
    employee-base:[&.tone-amber]:text-[color:#a36b0d] employee-base:[&.tone-amber]:[background:#fff5dd]
    employee-base:[&.tone-blue]:text-[color:#4b8397] employee-base:[&.tone-blue]:[background:#eaf2f7]
    employee-base:[&.tone-lavender]:text-[color:#7566ba] employee-base:[&.tone-lavender]:[background:#f0edfb]
    employee-base:[&.tone-rose]:text-[color:#a73955] employee-base:[&.tone-rose]:[background:#fdeaf0]
    icon-circle tone-${tone}`}
            >
              <Icon size={25} />
            </span>
            <div className="min-w-0">
              <h2
                className={String.raw`stat-label employee-base:m-[3px_0_9px] employee-base:text-[length:11px] employee-base:font-[400]
    employee-base:text-[color:var(--text-secondary)] employee-base:tracking-[0] employee-base:leading-[1.4]
    employee-page:screen-max-768:text-[length:10px] employee-page:screen-max-480:text-[length:11px]
    employee-page:screen-max-480:mt-[0] employee-page:screen-max-480:mb-[5px]`}
              >
                {label}
              </h2>
              <p
                className={String.raw`stat-value employee-base:text-[length:clamp(22px,_1.9vw,_31px)] employee-base:font-[650]
    employee-base:leading-[1.15] employee-base:tracking-[-0.7px]
    employee-page:screen-max-768:text-[length:27px] ${
      text
        ? String.raw`stat-value-text employee-base:[&.stat-value-text]:text-[length:20px]
    employee-base:[&.stat-value-text]:tracking-[-0.4px]
    employee-page:screen-max-768:[&.stat-value-text]:text-[length:19px]`
        : ''
    }`}
              >
                {value}
              </p>
              <p
                className={String.raw`stat-detail employee-base:flex employee-base:items-center employee-base:gap-[6px] employee-base:mt-[13px]
    employee-base:text-[length:10px] employee-base:leading-[1.4] employee-base:text-[color:var(--text-muted)]
    employee-page:screen-max-768:text-[length:9px] employee-page:screen-max-480:mt-[8px]
    employee-page:screen-max-480:text-[length:10px]`}
              >
                <span
                  className={String.raw`status-dot employee-base:w-[6px] employee-base:h-[6px] employee-base:rounded-[50%]
    employee-base:[flex-shrink:0] employee-base:[background:currentColor] ${tone === 'amber' ? 'text-[#a36b0d]' : tone === 'blue' ? 'text-[#4b8397]' : 'text-primary'}`}
                />
                {detail}
              </p>
            </div>
          </article>
        ))}
      </section>
      <div
        className={String.raw`dashboard-middle employee-base:grid employee-base:grid-cols-[minmax(0,_1.65fr)_minmax(260px,_1fr)]
    employee-base:gap-[20px] employee-base:mb-[20px] employee-page:screen-max-768:grid-cols-[minmax(0,_1fr)]
    employee-page:screen-max-768:gap-[16px] employee-page:screen-max-768:mb-[16px]`}
      >
        <CheckInOutWidget
          attendance={attendance}
          showAction={false}
        />
        <section
          className={String.raw`surface quick-actions employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:p-[22px_17px_18px]
    employee-page:screen-max-768:p-[20px_18px]`}
          aria-labelledby="quick-actions-title"
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
              <h2 id="quick-actions-title">Quick Operations</h2>
              <p>Your employee services</p>
            </div>
          </div>
          <div
            className={String.raw`operation-list employee-base:flex employee-base:flex-col employee-base:gap-[8px]`}
          >
            {operations.map(({ to, title, description, Icon, tone }) =>
              ['/payroll', '/leave/request', '/reports'].includes(to) ? (
                <Link
                  className={String.raw`operation text-left employee-base:flex employee-base:items-center employee-base:gap-[11px]
    employee-base:[border:1px_solid_var(--border)] employee-base:rounded-[9px]
    employee-base:[background:white] employee-base:p-[12px_11px] employee-base:min-h-[66px]
    employee-base:[transition:border-color_0.15s,_background_0.15s]
    employee-base:[&:hover]:[background:#f7fcfa] employee-base:[&:hover]:[border-color:#a5d7ca]
    employee-base:[&_.icon-circle]:w-[34px] employee-base:[&_.icon-circle]:h-[34px]
    employee-base:[&_strong]:block employee-base:[&_strong]:text-[length:11px]
    employee-base:[&_strong]:font-[600] employee-base:[&_strong]:leading-[1.5] employee-base:[&_small]:block
    employee-base:[&_small]:mt-[2px] employee-base:[&_small]:text-[length:10px]
    employee-base:[&_small]:leading-[1.4] employee-base:[&_small]:text-[color:var(--text-muted)]
    employee-page:screen-max-768:[&_strong]:text-[length:12px]
    employee-page:screen-max-768:[&_small]:text-[length:11px]`}
                  to={to}
                  key={to}
                  aria-disabled={portalBusy}
                  onClick={(event) => {
                    if (portalBusy) event.preventDefault()
                  }}
                >
                  <span
                    className={String.raw`employee-base:w-[46px] employee-base:h-[46px] employee-base:inline-flex employee-base:items-center
    employee-base:justify-center employee-base:rounded-[50%] employee-base:[flex-shrink:0]
    employee-base:[&.tone-green]:text-[color:#0b8972] employee-base:[&.tone-green]:[background:#e3f5f0]
    employee-base:[&.tone-amber]:text-[color:#a36b0d] employee-base:[&.tone-amber]:[background:#fff5dd]
    employee-base:[&.tone-blue]:text-[color:#4b8397] employee-base:[&.tone-blue]:[background:#eaf2f7]
    employee-base:[&.tone-lavender]:text-[color:#7566ba] employee-base:[&.tone-lavender]:[background:#f0edfb]
    employee-base:[&.tone-rose]:text-[color:#a73955] employee-base:[&.tone-rose]:[background:#fdeaf0]
    icon-circle tone-${tone}`}
                  >
                    <Icon size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-[#7b98a7]"
                  />
                </Link>
              ) : (
                <button
                  type="button"
                  className={String.raw`operation text-left employee-base:flex employee-base:items-center employee-base:gap-[11px]
    employee-base:[border:1px_solid_var(--border)] employee-base:rounded-[9px]
    employee-base:[background:white] employee-base:p-[12px_11px] employee-base:min-h-[66px]
    employee-base:[transition:border-color_0.15s,_background_0.15s]
    employee-base:[&:hover]:[background:#f7fcfa] employee-base:[&:hover]:[border-color:#a5d7ca]
    employee-base:[&_.icon-circle]:w-[34px] employee-base:[&_.icon-circle]:h-[34px]
    employee-base:[&_strong]:block employee-base:[&_strong]:text-[length:11px]
    employee-base:[&_strong]:font-[600] employee-base:[&_strong]:leading-[1.5] employee-base:[&_small]:block
    employee-base:[&_small]:mt-[2px] employee-base:[&_small]:text-[length:10px]
    employee-base:[&_small]:leading-[1.4] employee-base:[&_small]:text-[color:var(--text-muted)]
    employee-page:screen-max-768:[&_strong]:text-[length:12px]
    employee-page:screen-max-768:[&_small]:text-[length:11px]`}
                  disabled
                  key={to}
                  title="Available in a later update"
                >
                  <span
                    className={String.raw`employee-base:w-[46px] employee-base:h-[46px] employee-base:inline-flex employee-base:items-center
    employee-base:justify-center employee-base:rounded-[50%] employee-base:[flex-shrink:0]
    employee-base:[&.tone-green]:text-[color:#0b8972] employee-base:[&.tone-green]:[background:#e3f5f0]
    employee-base:[&.tone-amber]:text-[color:#a36b0d] employee-base:[&.tone-amber]:[background:#fff5dd]
    employee-base:[&.tone-blue]:text-[color:#4b8397] employee-base:[&.tone-blue]:[background:#eaf2f7]
    employee-base:[&.tone-lavender]:text-[color:#7566ba] employee-base:[&.tone-lavender]:[background:#f0edfb]
    employee-base:[&.tone-rose]:text-[color:#a73955] employee-base:[&.tone-rose]:[background:#fdeaf0]
    icon-circle tone-${tone}`}
                  >
                    <Icon size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong>{title}</strong>
                    <small>{description} · Coming soon</small>
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-[#7b98a7]"
                  />
                </button>
              ),
            )}
          </div>
        </section>
      </div>
      <section
        className={String.raw`surface content-card scroll-mt-24 employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:p-[22px_23px]
    employee-page:screen-max-768:p-[20px_17px]`}
        id="department-announcements"
        aria-labelledby="announcements-title"
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
            <h2 id="announcements-title">
              <Megaphone size={19} />
              Department Announcements
            </h2>
            <p>Latest updates from Hadiya Science IT Department</p>
          </div>
          <span className="rounded bg-[#eaf6f1] px-2 py-1 text-[10px] font-semibold text-primary">
            {announcements.length}
          </span>
        </div>
        {announcements.length ? (
          announcements.map((item) => (
            <article
              key={item.id}
              className={String.raw`announcement employee-base:p-[17px_0] employee-base:[border-top:1px_solid_var(--divider)]
    employee-base:[&:first-child]:[border-top:0] employee-base:[&:first-child]:pt-[0]
    employee-base:[&:last-child]:pb-[0] employee-base:[&_h3]:text-[length:13px]
    employee-base:[&_h3]:leading-[1.6] employee-base:[&_p]:mt-[6px]
    employee-base:[&_p]:text-[color:var(--text-secondary)] employee-base:[&_p]:text-[length:12px]
    employee-base:[&_p]:leading-[1.8] employee-base:[&_time]:text-[color:var(--text-muted)]
    employee-base:[&_time]:text-[length:10px] employee-base:[&_time]:whitespace-nowrap`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3>{item.title}</h3>
                <time dateTime={item.createdAt}>
                  {new Intl.DateTimeFormat('en', {
                    timeZone: data.attendance.timeZone,
                    dateStyle: 'medium',
                  }).format(new Date(item.createdAt))}
                </time>
              </div>
              <p>{item.content}</p>
            </article>
          ))
        ) : (
          <p className="py-4 text-[12px] text-muted">
            {search.trim()
              ? 'No announcements match your search.'
              : 'No department announcements at the moment.'}
          </p>
        )}
      </section>
    </>
  )
}

export default function Dashboard() {
  const { search } = useOutletContext()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    loadDashboard(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setData(data)
          setError('')
          useEmployeeStore.getState().setUser(data.user)
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message)
      })
    return () => controller.abort()
  }, [attempt])
  if (error)
    return (
      <section
        className={String.raw`surface content-card employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:p-[22px_23px]
    employee-page:screen-max-768:p-[20px_17px]`}
      >
        <h1>Dashboard unavailable</h1>
        <p
          role="alert"
          className={String.raw`error-notice my-5 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#b42344] employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
        >
          {error}
        </p>
        <button
          className={String.raw`primary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
          onClick={() => setAttempt((value) => value + 1)}
        >
          Try again
        </button>
      </section>
    )
  if (!data)
    return (
      <p
        role="status"
        className="py-12 text-center text-muted"
      >
        Loading your dashboard…
      </p>
    )
  return (
    <DashboardContent
      data={data}
      search={search}
    />
  )
}
