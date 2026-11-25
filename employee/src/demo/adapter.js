import {
  DEMO_LOGIN,
  DEMO_EMPLOYEE,
  DEMO_ACCOUNTS,
  DEMO_PROFILE,
  DEMO_ATTENDANCE_SCHEDULE,
  DEMO_ATTENDANCE_HISTORY,
  DEMO_ANNOUNCEMENTS,
  createDemoPayrollRecords,
  createDemoLeaveState,
  createDemoCareerRecords,
  createDemoReport,
  createDemoReports,
  createDemoRewards,
} from './data.js'
import axios from 'axios'
import { createDemoDepartmentStore } from './departmentData.js'
import { passwordChangeRequestSchema } from '../utils/validation/passwordSchemas.js'
import { validatePhoto } from '../utils/validation/profileSchemas.js'
import { reportInputSchema, reportKeySchema } from '../utils/validation/reportSchemas.js'
import { countLeaveDays, getLeaveYear } from '../utils/helpers/leaveRules.js'
import {
  createLeaveRequestSchema,
  leaveInputSchema,
  leaveKeySchema,
} from '../utils/validation/leaveSchemas.js'

// Private in-memory demo credentials only. Entered passwords are never persisted.
async function derive(password, salt) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  return new Uint8Array(
    await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      256,
    ),
  )
}
async function createCredential(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return {
    salt,
    hash: await derive(password, salt),
  }
}
async function matchesCredential(password, credential) {
  const hash = await derive(password, credential.salt)
  return hash.every((value, index) => value === credential.hash[index])
}

// Local frontend preview, following the same response contract as the future API.
// No HTTP request, IP lookup, attendance authorization, or persistent session occurs here.
export function createDemoAdapter({
  now = () => new Date(),
  initialUser = DEMO_EMPLOYEE,
  initialPassword = DEMO_LOGIN.password,
  initialProfile = DEMO_PROFILE,
  initialLeave,
  initialCareer,
  initialRewards,
  initialReports,
  initialPayroll,
  initialAttendanceHistory,
  departmentStore = createDemoDepartmentStore(),
  registerEmployeeAccount = () => {},
  canSubmitReports = true,
} = {}) {
  let signedIn = false
  let user = structuredClone(initialUser)
  const loginIdentifiers = [initialUser.email, initialUser.login]
    .filter(Boolean).map(value => value.trim().toLowerCase())
  let profile = structuredClone(initialProfile)
  const payroll = structuredClone(initialPayroll ?? createDemoPayrollRecords(user))
  const attendanceHistory = structuredClone(initialAttendanceHistory ?? DEMO_ATTENDANCE_HISTORY)
  const career = structuredClone(initialCareer ?? createDemoCareerRecords(user.employeeId))
  const rewards = structuredClone(initialRewards ?? createDemoRewards(user.employeeId))
  let reports = structuredClone(initialReports ?? createDemoReports(user))
  const reportReceipts = new Map()
  const getReportState = () => ({
    employeeId: user.employeeId,
    userId: user.id,
    records: reports,
    canSubmit: canSubmitReports,
    message: canSubmitReports ? null : 'Report submission is unavailable. Contact HR.',
  })
  let changingPhoto = false
  let credentialPromise
  let passwordChanged = false
  let changingPassword = false
  let sessionVersion = 0
  function getCredentialPromise() {
    if (!credentialPromise) {
      credentialPromise = createCredential(initialPassword)
    }
    return credentialPromise
  }
  let leave = structuredClone(
    initialLeave || createDemoLeaveState(user.employeeId, getAttendanceState().date),
  )
  const leaveReceipts = new Map()
  function getLeaveState() {
    const today = getAttendanceState().date
    const period = getLeaveYear(today)
    // Simulate the backend's annual renewal in this tab only.
    if (leave.balance && leave.balance.yearStart < period.start) {
      const entitlement = Number(leave.settings.defaultEntitlement)
      leave.balance = {
        employeeId: user.employeeId,
        yearStart: period.start,
        accrued: entitlement,
        used: 0,
        remaining: entitlement,
      }
    }
    return {
      ...leave,
      today,
      period,
    }
  }
  function getAttendanceState() {
    const current = now()
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: 'Africa/Addis_Ababa',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(current)
    const get = (name) => parts.find((part) => part.type === name).value
    const date = `${get('year')}-${get('month')}-${get('day')}`
    return {
      date,
      serverTime: current.toISOString(),
      timeZone: 'Africa/Addis_Ababa',
      schedule: {
        ...DEMO_ATTENDANCE_SCHEDULE,
      },
      ipAddress: null,
      configured: false,
      ipAuthorized: false,
      record: null,
      checkoutAt: new Date(`${date}T${DEMO_ATTENDANCE_SCHEDULE.endTime}:00+03:00`).toISOString(),
      code: 'IP_CONFIGURATION_REQUIRED',
      message: 'Attendance is blocked until HR’s saved office IP configuration is connected.',
      canCheckIn: false,
      canCheckOut: false,
    }
  }
  const adapter = async (config) => {
    const fail = (status, code, message, fields) => {
      throw new axios.AxiosError(message, code, config, null, {
        status,
        config,
        headers: {},
        data: {
          error: {
            code,
            message,
            ...(fields
              ? {
                  fields,
                }
              : {}),
          },
        },
      })
    }
    const method = (config.method || 'get').toLowerCase()
    let data
    let status = 200
    let headers = {}
    if (method === 'post' && config.url === '/auth/login') {
      const values = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
      const savedCredential = await getCredentialPromise()
      const matches =
        typeof values?.password === 'string' &&
        (await matchesCredential(values.password, savedCredential))
      if (
        !loginIdentifiers.includes(values?.identifier?.trim().toLowerCase()) ||
        !matches ||
        values.portal !== 'employee' ||
        (await getCredentialPromise()) !== savedCredential
      ) {
        fail(
          401,
          'INVALID_CREDENTIALS',
          'Username/email or password is incorrect. Enter the current demo account password.',
        )
      }
      signedIn = true
      sessionVersion++
      data = {
        user,
        signedInAt: now().toISOString(),
      }
    } else if (method === 'post' && config.url === '/auth/logout') {
      signedIn = false
      sessionVersion++
      status = 204
      data = null
    } else {
      if (!signedIn) {
        fail(401, 'SESSION_REQUIRED', 'Sign in to continue.')
      }
      // All employee services require completed first-login password setup.
      if (user.mustChangePassword && config.url?.startsWith('/employee/')) {
        fail(
          403,
          'PASSWORD_CHANGE_REQUIRED',
          'Change your initial password before accessing employee services.',
        )
      }
      if (config.url?.startsWith('/department-head/')) {
        if (user.mustChangePassword) fail(403, 'PASSWORD_CHANGE_REQUIRED', 'Complete password setup first.')
        const today = getAttendanceState().date
        const department = departmentStore.getData(user, today)
        if (!department) fail(403, 'DEPARTMENT_ACCESS_DENIED', 'This workspace is reserved for the assigned department head.')
        if (method === 'get' && config.url === '/department-head/employees/options') {
          return { data: structuredClone(departmentStore.getOptions(user, today)), status: 200, config, headers: {} }
        }
        if (method === 'post' && config.url === '/department-head/employees') {
          let values = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
          if (values instanceof FormData) {
            const fields = values.get('employee')
            try {
              values = { ...JSON.parse(fields), photo: values.get('photo'), educationDocument: values.get('educationDocument') }
            } catch {
              fail(422, 'INVALID_EMPLOYEE', 'Employee details could not be read.')
            }
          }
          const version = sessionVersion
          const key = config.headers?.get?.('Idempotency-Key') || config.headers?.['Idempotency-Key']
          const created = await departmentStore.createEmployee(user, values, key, today, fail, registerEmployeeAccount, () => {
            if (!signedIn || version !== sessionVersion) fail(401, 'SESSION_EXPIRED', 'Your session changed. Sign in again.')
          })
          return { data: structuredClone(created), status: 201, config, headers: {} }
        }
        if (method !== 'get') fail(405, 'READ_ONLY', 'Team attendance changes are managed by HR.')
        if (config.url === '/department-head/team') {
          return { data: structuredClone({ department: department.department, employees: department.employees }), status: 200, config, headers: {} }
        }
        if (config.url === '/department-head/attendance') {
          return { data: structuredClone(department), status: 200, config, headers: {} }
        }
        fail(404, 'NOT_FOUND', 'This department feature is unavailable.')
      }
      if (method === 'get' && config.url === '/auth/session') {
        data = {
          user,
        }
      } else if (method === 'post' && config.url === '/auth/change-password') {
        if (changingPassword) {
          fail(409, 'CHANGE_IN_PROGRESS', 'A password change is already being saved.')
        }
        changingPassword = true
        const version = sessionVersion
        try {
          const values = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
          const parsed = passwordChangeRequestSchema.safeParse(values)
          if (!parsed.success) {
            const fields = Object.fromEntries(
              parsed.error.issues.map((issue) => [issue.path[0], issue.message]),
            )
            fail(422, 'INVALID_PASSWORD', 'Correct the password fields.', fields)
          }
          if (
            !(await matchesCredential(parsed.data.currentPassword, await getCredentialPromise()))
          ) {
            fail(422, 'CURRENT_PASSWORD_INCORRECT', 'Your current password is incorrect.', {
              currentPassword: 'Your current password is incorrect.',
            })
          }
          const nextCredential = await createCredential(parsed.data.newPassword)
          if (!signedIn || version !== sessionVersion) {
            fail(401, 'SESSION_EXPIRED', 'Your session changed. Sign in again.')
          }
          credentialPromise = Promise.resolve(nextCredential)
          user = {
            ...user,
            mustChangePassword: false,
            passwordChangedAt: now().toISOString(),
          }
          passwordChanged = true
          data = {
            user,
          }
        } finally {
          changingPassword = false
        }
      } else if (config.url === '/employee/rewards') {
        if (method !== 'get') {
          fail(405, 'REWARDS_READ_ONLY', 'Recognitions are granted and managed by HR.')
        }
        data = {
          employeeId: user.employeeId,
          records: rewards,
        }
      } else if (config.url === '/employee/reports') {
        if (method === 'get') {
          data = getReportState()
        } else if (method === 'post') {
          const values = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
          const parsed = reportInputSchema.safeParse(values)
          const key = reportKeySchema.safeParse(
            config.headers.get?.('Idempotency-Key') || config.headers['Idempotency-Key'],
          )
          if (!parsed.success) {
            fail(
              422,
              'INVALID_REPORT',
              'Correct the report fields.',
              Object.fromEntries(
                parsed.error.issues.map((issue) => [issue.path[0], issue.message]),
              ),
            )
          }
          if (!key.success) {
            fail(422, 'INVALID_REPORT_KEY', 'A valid submission receipt key is required.')
          }
          const payload = JSON.stringify(parsed.data)
          const receipt = reportReceipts.get(key.data)
          if (receipt) {
            if (receipt.payload !== payload) {
              fail(
                409,
                'REPORT_KEY_REUSED',
                'This receipt key belongs to another report. Start a new submission.',
              )
            }
            data = {
              ...getReportState(),
              submittedReportId: receipt.id,
            }
          } else {
            if (!canSubmitReports) {
              fail(403, 'REPORTS_UNAVAILABLE', getReportState().message)
            }
            if (reports.length >= 200) {
              fail(
                409,
                'REPORT_HISTORY_LIMIT',
                'Contact HR to archive older reports before submitting more.',
              )
            }
            const record = createDemoReport(user, parsed.data, key.data, now())
            reports = [record, ...reports]
            reportReceipts.set(key.data, {
              payload,
              id: record.id,
            })
            data = {
              ...getReportState(),
              submittedReportId: record.id,
            }
            status = 201
          }
        } else {
          fail(
            405,
            'REPORTS_READ_ONLY',
            'Submitted reports cannot be edited or deleted from the employee portal.',
          )
        }
      } else if (config.url === '/employee/career') {
        if (method !== 'get') {
          fail(405, 'CAREER_READ_ONLY', 'Career milestones are managed by HR.')
        }
        data = {
          employeeId: user.employeeId,
          today: getAttendanceState().date,
          timeZone: 'Africa/Addis_Ababa',
          records: career,
        }
      } else if (config.url === '/employee/leave' || config.url === '/employee/leave/requests') {
        if (method === 'get' && config.url === '/employee/leave') {
          data = getLeaveState()
        } else if (method === 'post' && config.url === '/employee/leave/requests') {
          const values = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
          const key = leaveKeySchema.safeParse(
            config.headers.get?.('Idempotency-Key') || config.headers['Idempotency-Key'],
          )
          const input = leaveInputSchema.safeParse(values)
          if (!key.success || !input.success) {
            fail(422, 'INVALID_LEAVE_REQUEST', 'Correct the leave dates and reason.')
          }
          const payload = JSON.stringify(input.data)
          const receipt = leaveReceipts.get(key.data)
          if (receipt) {
            if (receipt.payload !== payload) {
              fail(
                409,
                'REQUEST_KEY_REUSED',
                'This submission key belongs to another request. Start a new submission.',
              )
            }
            data = {
              ...getLeaveState(),
              submittedRequestId: receipt.id,
            }
          } else {
            const valid = createLeaveRequestSchema(getLeaveState()).safeParse(input.data)
            if (!valid.success) {
              fail(
                422,
                'INVALID_LEAVE_REQUEST',
                'Correct the leave dates and reason.',
                Object.fromEntries(
                  valid.error.issues.map((issue) => [issue.path[0], issue.message]),
                ),
              )
            }
            if (leave.requests.length >= 200) {
              fail(
                409,
                'HISTORY_LIMIT',
                'Contact HR to archive older requests before submitting more.',
              )
            }
            const record = {
              ...valid.data,
              id: `DEMO-LEAVE-${crypto.randomUUID()}`,
              employeeId: user.employeeId,
              daysRequested: countLeaveDays(
                valid.data.startDate,
                valid.data.endDate,
                leave.settings.dayCounting,
              ),
              dayCounting: leave.settings.dayCounting,
              status: 'PENDING',
              createdAt: now().toISOString(),
              decidedAt: null,
              decisionNote: '',
              clientRequestId: key.data,
            }
            leave.requests = [record, ...leave.requests]
            leaveReceipts.set(key.data, {
              payload,
              id: record.id,
            })
            data = {
              ...getLeaveState(),
              submittedRequestId: record.id,
            }
            status = 201
          }
        } else {
          fail(
            405,
            'LEAVE_OPERATION_UNAVAILABLE',
            'Employee leave decisions and balances are managed by HR.',
          )
        }
      } else if (
        config.url === '/employee/payroll' ||
        config.url?.startsWith('/employee/payroll/')
      ) {
        if (method !== 'get') {
          fail(405, 'READ_ONLY', 'Employee payroll is read-only.')
        }
        if (config.url === '/employee/payroll') {
          data = {
            employeeId: user.employeeId,
            records: payroll,
          }
        } else {
          const match = config.url.match(/^\/employee\/payroll\/([^/]+)(\/payslip)?$/)
          const record = payroll.find((record) => record.id === match?.[1])
          if (!record) {
            fail(
              404,
              'PAYSLIP_NOT_FOUND',
              'This payslip is not available. Return to My Payroll and refresh.',
            )
          }
          if (match[2]) {
            if (!record.canDownload) {
              fail(
                403,
                'DOWNLOAD_UNAVAILABLE',
                'This payslip is currently unavailable for download.',
              )
            }
            const { createDemoPayslipPdf } = await import('./payslip.js')
            data = createDemoPayslipPdf(record)
            headers = {
              'content-type': 'application/pdf',
            }
          } else {
            data = {
              employeeId: user.employeeId,
              record,
            }
          }
        }
      } else if (config.url === '/employee/profile' || config.url === '/employee/profile/photo') {
        if (method === 'get' && config.url === '/employee/profile') {
          data = {
            user,
            profile,
          }
        } else if (['put', 'delete'].includes(method) && config.url === '/employee/profile/photo') {
          if (changingPhoto) {
            fail(409, 'CHANGE_IN_PROGRESS', 'A photo change is already being saved.')
          }
          changingPhoto = true
          const version = sessionVersion
          try {
            let photoUrl = null
            if (method === 'put') {
              const file = config.data?.get?.('photo')
              try {
                validatePhoto(file)
              } catch (error) {
                fail(422, 'INVALID_PHOTO', error.message, {
                  photo: error.message,
                })
              }
              photoUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result)
                reader.onerror = () =>
                  reject(new Error('Your photo could not be read. Choose another image.'))
                reader.readAsDataURL(file)
              })
            }
            if (!signedIn || version !== sessionVersion) {
              fail(401, 'SESSION_EXPIRED', 'Your session changed. Sign in again.')
            }
            profile = {
              ...profile,
              photoUrl,
            }
            data = {
              user,
              profile,
            }
          } finally {
            changingPhoto = false
          }
        } else {
          fail(404, 'NOT_FOUND', 'Profile operation not available.')
        }
      } else if (method === 'get' && config.url === '/employee/dashboard') {
        data = {
          user,
          attendance: getAttendanceState(),
          leaveBalance: getLeaveState().balance?.remaining ?? null,
          announcements: DEMO_ANNOUNCEMENTS,
        }
      } else if (config.url?.startsWith('/employee/attendance/')) {
        if (method === 'get' && config.url === '/employee/attendance/status') {
          data = getAttendanceState()
        } else if (method === 'get' && config.url === '/employee/attendance/history') {
          data = {
            employeeId: user.employeeId,
            timeZone: 'Africa/Addis_Ababa',
            records: attendanceHistory.filter(
              (record) => record.date < getAttendanceState().date,
            ).slice(0, 30),
          }
        } else if (
          method === 'post' &&
          ['/employee/attendance/check-in', '/employee/attendance/check-out'].includes(config.url)
        ) {
          fail(403, 'IP_CONFIGURATION_REQUIRED', getAttendanceState().message)
        } else {
          fail(404, 'NOT_FOUND', 'This attendance feature is unavailable.')
        }
      } else {
        fail(404, 'NOT_FOUND', 'This feature is not available in the frontend demo.')
      }
    }
    return {
      data: structuredClone(data),
      status,
      config,
      headers,
    }
  }
  adapter.getLoginSuggestion = () => ({
    identifier: user.email,
    password: passwordChanged ? '' : initialPassword,
  })
  adapter.matchesIdentifier = identifier => typeof identifier === 'string' &&
    loginIdentifiers.includes(identifier.trim().toLowerCase())
  return adapter
}

// One active portal session, with separate in-memory data/passwords for each demo account.
export function createDemoPortalAdapter() {
  const departmentStore = createDemoDepartmentStore()
  const accounts = []
  function registerEmployeeAccount(user, password, profile) {
    accounts.push({ role: 'EMPLOYEE', adapter: createDemoAdapter({
      initialUser: user, initialPassword: password, initialProfile: profile, departmentStore,
      initialPayroll: [], initialAttendanceHistory: [], initialCareer: [], initialRewards: [], initialReports: [],
      initialLeave: { ...createDemoLeaveState(user.employeeId), balance: null, requests: [], canRequest: false,
        message: 'HR has not assigned a leave entitlement.' },
    }) })
  }
  accounts.push(...DEMO_ACCOUNTS.map(account => ({
    role: account.user.role,
    adapter: createDemoAdapter({ initialUser: account.user,
      initialPassword: account.password, initialProfile: account.profile, departmentStore, registerEmployeeAccount }),
  })))
  let activeAdapter = null
  async function adapter(config) {
    const method = (config.method || 'get').toLowerCase()
    if (method === 'post' && config.url === '/auth/login') {
      const credentials = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
      const selected = accounts.find(account => account.adapter.matchesIdentifier(credentials?.identifier))
      const nextAdapter = selected?.adapter || accounts[0].adapter
      const response = await nextAdapter(config)
      if (activeAdapter && activeAdapter !== nextAdapter) {
        await activeAdapter({ ...config, method: 'post', url: '/auth/logout', data: undefined })
      }
      activeAdapter = nextAdapter
      return response
    }
    const response = await (activeAdapter || accounts[0].adapter)(config)
    if (method === 'post' && config.url === '/auth/logout') activeAdapter = null
    return response
  }
  adapter.getLoginSuggestion = (role = 'EMPLOYEE') =>
    accounts.find(account => account.role === role)?.adapter.getLoginSuggestion() ?? null
  return adapter
}
