import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useOutletContext } from 'react-router-dom'
import { useEmployeeStore } from './store/index.js'
import { restoreSession } from './services/auth/authService.js'
import Login from './pages/Auth/Login.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import ChangePassword from './pages/Profile/ChangePassword.jsx'
import EmployeeLayout from './layouts/main/EmployeeLayout.jsx'

const MyProfile = lazy(() => import('./pages/Profile/MyProfile.jsx'))
const MyAttendance = lazy(() => import('./pages/Attendance/MyAttendance.jsx'))
const MyPayroll = lazy(() => import('./pages/Payroll/MyPayroll.jsx'))
const PayslipDetails = lazy(() => import('./pages/Payroll/PayslipDetails.jsx'))
const MyLeave = lazy(() => import('./pages/Leave/MyLeave.jsx'))
const LeaveRequest = lazy(() => import('./pages/Leave/LeaveRequest.jsx'))
const CareerMilestones = lazy(() => import('./pages/Career/CareerMilestones.jsx'))
const Rewards = lazy(() => import('./pages/Rewards/RewardsAndRecognition.jsx'))
const SubmitReport = lazy(() => import('./pages/Reports/SubmitReport.jsx'))
const MyReports = lazy(() => import('./pages/Reports/MyReports.jsx'))

function ProtectedRoutes() {
  const user = useEmployeeStore((state) => state.user)
  const context = useOutletContext()
  if (!user)
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  if (user.mustChangePassword)
    return (
      <Navigate
        to="/change-password"
        replace
      />
    )
  return <Outlet context={context} />
}
function SessionRoutes() {
  const user = useEmployeeStore((state) => state.user)
  return user ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      replace
    />
  )
}
export default function App() {
  const { phase, sessionError, setUser, setSessionError } = useEmployeeStore()
  useEffect(() => {
    const controller = new AbortController()
    restoreSession(controller.signal)
      .then((user) => {
        if (!controller.signal.aborted) setUser(user)
      })
      .catch((error) => {
        if (!controller.signal.aborted) setSessionError(error.message)
      })
    return () => controller.abort()
  }, [setUser, setSessionError])
  if (phase === 'loading')
    return (
      <main className="grid min-h-screen place-content-center text-center">
        <p role="status">Loading your employee portal…</p>
      </main>
    )
  if (phase === 'error')
    return (
      <main
        className={String.raw`auth-screen employee-base:min-h-[100dvh] employee-base:flex employee-base:items-center
    employee-base:justify-center employee-base:p-[24px] employee-base:[background:var(--page-bg)]
    employee-page:screen-max-480:p-[16px]`}
      >
        <section
          className={String.raw`auth-card employee-base:w-[100%] employee-base:max-w-[420px] employee-base:p-[36px]
    employee-base:[border:1px_solid_var(--border)] employee-base:rounded-[12px]
    employee-base:[background:white] employee-base:[box-shadow:0_8px_30px_#092a3208]
    employee-page:screen-max-480:p-[24px]`}
        >
          <h1>Unable to load your session</h1>
          <p
            role="alert"
            className="my-4 text-[13px] leading-[1.7] text-text-secondary"
          >
            {sessionError}
          </p>
          <button
            className={String.raw`primary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </section>
      </main>
    )
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />
      <Route element={<SessionRoutes />}>
        <Route element={<EmployeeLayout />}>
          <Route
            path="/change-password"
            element={<ChangePassword />}
          />
          <Route
            path="/security"
            element={
              <Navigate
                to="/change-password"
                replace
              />
            }
          />
          <Route element={<ProtectedRoutes />}>
            <Route
              index
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />
            <Route
              path="/profile"
              element={
                <Suspense fallback={<p role="status">Loading your profile…</p>}>
                  <MyProfile />
                </Suspense>
              }
            />
            <Route
              path="/attendance"
              element={
                <Suspense fallback={<p role="status">Loading your attendance…</p>}>
                  <MyAttendance />
                </Suspense>
              }
            />
            <Route
              path="/payroll"
              element={
                <Suspense fallback={<p role="status">Loading your payroll…</p>}>
                  <MyPayroll />
                </Suspense>
              }
            />
            <Route
              path="/payroll/:runId"
              element={
                <Suspense fallback={<p role="status">Loading your payslip…</p>}>
                  <PayslipDetails />
                </Suspense>
              }
            />
            <Route
              path="/leave"
              element={
                <Suspense fallback={<p role="status">Loading your leave…</p>}>
                  <MyLeave />
                </Suspense>
              }
            />
            <Route
              path="/leave/request"
              element={
                <Suspense fallback={<p role="status">Loading your leave…</p>}>
                  <LeaveRequest />
                </Suspense>
              }
            />
            <Route
              path="/milestones"
              element={
                <Suspense fallback={<p role="status">Loading your career milestones…</p>}>
                  <CareerMilestones />
                </Suspense>
              }
            />
            <Route
              path="/rewards"
              element={
                <Suspense fallback={<p role="status">Loading your recognitions…</p>}>
                  <Rewards />
                </Suspense>
              }
            />
            <Route
              path="/reports"
              element={
                <Suspense fallback={<p role="status">Loading your reports…</p>}>
                  <SubmitReport />
                </Suspense>
              }
            />
            <Route
              path="/reports/history"
              element={
                <Suspense fallback={<p role="status">Loading your reports…</p>}>
                  <MyReports />
                </Suspense>
              }
            />
            <Route
              path="*"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
