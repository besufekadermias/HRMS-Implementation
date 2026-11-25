import { getLeaveYear } from '../utils/helpers/leaveRules.js'
import { INITIAL_EMPLOYEES, INITIAL_DEPARTMENTS } from '../../../admin/src/demo/workforce.js'

// Synthetic samples only. All live records must come from the backend.

// Account, profile, payroll, attendance, and announcements

// One source for demo people: admin's separate roster. No duplicate names or assignments.
export const DEMO_ROSTER = INITIAL_EMPLOYEES.map(record => {
  const department = INITIAL_DEPARTMENTS.find(item => item.name === record.department)
  if (!department) throw new Error(`Admin demo department is missing for ${record.id}.`)
  return {
    id: `DEMO-USER-${record.id}`, employeeId: `DEMO-EMPLOYEE-${record.id}`,
    serialNumber: record.id, fullName: record.name,
    email: record.email.includes('@') ? record.email.trim().toLowerCase() : null,
    login: record.email, department: department.name, departmentId: String(department.id),
    role: department.headId === record.id ? 'DEPARTMENT_HEAD' : record.portalRole === 'HR Manager' ? 'HR_MANAGER' : 'EMPLOYEE',
    grade: record.grade, baseSalary: record.basicSalary,
    employmentStatus: ['Active', 'On Leave'].includes(record.status) ? 'ACTIVE' : record.status.toUpperCase().replaceAll(' ', '_'),
    employmentType: 'PERMANENT', mustChangePassword: false,
    passwordChangedAt: '2026-11-01T06:00:00.000Z',
  }
})

function demoAccount(serialNumber) {
  const user = DEMO_ROSTER.find(employee => employee.serialNumber === serialNumber)
  if (!user?.email) throw new Error(`Admin demo employee ${serialNumber} needs a registered email.`)
  return { ...user, login: user.email }
}

function demoProfile(serialNumber) {
  const record = INITIAL_EMPLOYEES.find(employee => employee.id === serialNumber)
  return { qualification: record.qualification || null, gender: record.gender || null,
    birthDate: record.birthDate || null, hiredDate: record.hiredDate || null, photoUrl: null }
}

export const DEMO_EMPLOYEE = demoAccount('T2323')
const headDepartment = INITIAL_DEPARTMENTS.find(department => department.id === 5)
export const DEMO_HEAD = demoAccount(headDepartment.headId)
export const DEMO_LOGIN = { identifier: DEMO_EMPLOYEE.email, password: 'HRMS-demo-2026' }
export const DEMO_HEAD_LOGIN = { identifier: DEMO_HEAD.email, password: 'HRMS-head-2026' }
export const DEMO_PROFILE = demoProfile(DEMO_EMPLOYEE.serialNumber)
export const DEMO_ACCOUNTS = [
  { user: DEMO_EMPLOYEE, password: DEMO_LOGIN.password, profile: DEMO_PROFILE },
  { user: DEMO_HEAD, password: DEMO_HEAD_LOGIN.password,
    profile: demoProfile(DEMO_HEAD.serialNumber) },
]

export const DEMO_ATTENDANCE_SCHEDULE = { startTime: '08:00', endTime: '17:00', gracePeriod: '15' }
// Historical sample payroll amounts, independent of the current salary/policy.
export function createDemoPayrollRecords(employee = DEMO_EMPLOYEE) {
  return [
    { id: 'PR-2026-10', month: '2026-10', status: 'FORWARDED_TO_FINANCE' },
    { id: 'PR-2026-09', month: '2026-09', status: 'GENERATED' },
  ].map((run) => ({
    ...run,
    employee: {
      id: employee.employeeId,
      serialNumber: employee.serialNumber,
      fullName: employee.fullName,
      department: employee.department,
    },
    gross: 11200,
    incomeTax: 2420,
    pension: 784,
    employerPension: 1232,
    otherDeductions: 0,
    net: 7996,
    deductionItems: [],
    incomeTaxLabel: 'Income Tax',
    pensionLabel: 'Pension Contribution (7%)',
    generatedAt: null,
    forwardedAt: null,
    canDownload: true,
  }))
}
// Illustrative past records only; these do not authorize today's attendance.
export const DEMO_ATTENDANCE_HISTORY = Array.from({ length: 18 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 10, 21 - index)).toISOString().slice(0, 10)
  const status = ['PRESENT', 'LATE', 'PRESENT', 'ON_LEAVE', 'ABSENT', 'PRESENT'][index % 6]
  const attended = status === 'PRESENT' || status === 'LATE'
  const complete = attended && index !== 1
  return {
    id: `DEMO-ATTENDANCE-${index + 1}`,
    date,
    status,
    checkIn: attended ? `${date}T${status === 'LATE' ? '06:12' : '04:55'}:00.000Z` : null,
    checkOut: complete ? `${date}T14:04:00.000Z` : null,
    checkInIp: attended ? '192.0.2.10' : null,
    checkOutIp: complete ? (index === 2 ? '198.51.100.20' : '192.0.2.10') : null,
    checkInVerification: attended ? (index === 5 ? 'UNAVAILABLE' : 'VERIFIED') : null,
    checkOutVerification: complete ? (index === 2 ? 'UNVERIFIED' : 'VERIFIED') : null,
  }
})
export const DEMO_ANNOUNCEMENTS = [
  {
    id: 'DEMO-ANNOUNCEMENT-001',
    title: 'Welcome to Hadiya Science & IT Department HRMS',
    content:
      'Welcome to your employee portal. View your employment details and department announcements here.',
    createdAt: '2026-10-22T06:00:00.000Z',
  },
]

// Leave balance and request history

// Isolated preview matching admin's sample entitlement; live balances come from the backend.
export function createDemoLeaveState(employeeId, today = '2026-11-22') {
  const period = getLeaveYear(today)
  const sampleYear = period.start === getLeaveYear('2026-10-29').start
  return {
    employeeId,
    today,
    timeZone: 'Africa/Addis_Ababa',
    period,
    settings: {
      defaultEntitlement: '90',
      maxBalance: '90',
      dayCounting: 'calendar',
      noticeDays: '0',
      requireRejectionReason: true,
    },
    balance: {
      employeeId,
      yearStart: period.start,
      accrued: 90,
      used: sampleYear ? 30 : 0,
      remaining: sampleYear ? 60 : 90,
    },
    requests: [
      {
        id: 'DEMO-LEAVE-4',
        employeeId,
        startDate: '2026-10-29',
        endDate: '2026-11-27',
        daysRequested: 30,
        dayCounting: 'calendar',
        reason: 'Annual leave',
        status: 'APPROVED',
        createdAt: null,
        decidedAt: null,
        decisionNote: '',
        clientRequestId: null,
      },
    ],
    canRequest: true,
    message: null,
  }
}

// Career milestones

// Sample snapshots only; these do not update admin records or the employee's current salary.
export function createDemoCareerRecords(employeeId) {
  const base = {
    employeeId,
    previousGradeName: 'Grade II (Associate)',
    newGradeName: 'Grade III',
    previousSalary: 11200,
    newSalary: 15000,
    description: 'Official career milestone recorded by HR.',
    reviewReason: '',
  }
  return [
    {
      ...base,
      id: 'CM-PROMOTION',
      milestoneType: 'PROMOTION',
      effectiveDate: '2026-10-27',
      status: 'APPLIED',
      previousGradeName: 'Grade I',
      previousSalary: 10000,
      newGradeName: 'Grade II (Associate)',
      newSalary: 11200,
      description: 'Promotion approved after the annual performance review.',
    },
    {
      ...base,
      id: 'CM-STEP',
      milestoneType: 'STEP_INCREMENT',
      effectiveDate: '2027-01-01',
      status: 'SCHEDULED',
      newGradeName: 'Grade II · Step 2',
      newSalary: 12000,
      description: 'Step increment scheduled for the next service cycle.',
    },
    {
      ...base,
      id: 'CM-HISTORY',
      milestoneType: 'GRADE_CHANGE',
      effectiveDate: '2026-10-24',
      status: 'HISTORICAL',
      previousGradeName: '',
      previousSalary: null,
      newGradeName: 'Grade I',
      newSalary: 10000,
      description: 'Historical grade assignment added to the personnel record.',
    },
    {
      ...base,
      id: 'CM-AWARD',
      milestoneType: 'AWARD_MILESTONE',
      effectiveDate: '2026-11-15',
      status: 'RECORDED',
      newGradeName: '',
      newSalary: null,
      description: 'Recognized for completing the department professional training programme.',
    },
    {
      ...base,
      id: 'CM-CANCELLED',
      milestoneType: 'STEP_INCREMENT',
      effectiveDate: '2026-12-01',
      status: 'CANCELLED',
      newGradeName: 'Grade II · Step 2',
      newSalary: 12000,
      description: 'Previous increment plan cancelled before application.',
    },
    {
      ...base,
      id: 'CM-REVIEW',
      milestoneType: 'PROMOTION',
      effectiveDate: '2026-11-01',
      status: 'NEEDS_REVIEW',
      description: 'Planned promotion awaiting HR review.',
      reviewReason: 'The configured grade salary changed after this plan was recorded.',
    },
  ]
}

// Rewards and employee report history

export function createDemoRewards(employeeId) {
  return [
    {
      id: 'DEMO-REWARD-1',
      employeeId,
      title: 'Service Excellence Recognition',
      category: 'EXCELLENCE',
      awardDate: '2026-11-18',
      description: 'Sample recognition for dependable support and high-quality department service.',
    },
    {
      id: 'DEMO-REWARD-2',
      employeeId,
      title: 'Technical Innovation Award',
      category: 'INNOVATION',
      awardDate: '2026-11-12',
      description:
        'Sample recognition for proposing an improvement to the team’s technical workflow.',
    },
  ]
}
export function createDemoReport(user, input, key, now) {
  return {
    ...input,
    id: `DEMO-REPORT-${crypto.randomUUID()}`,
    employeeId: user.employeeId,
    submittedByUserId: user.id,
    submittedBy: user.fullName,
    submittedRole: user.role,
    category: 'EMPLOYEE_SUBMISSION',
    createdAt: now.toISOString(),
    date: new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Addis_Ababa',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now),
    clientRequestId: key,
  }
}
// Synthetic history for the local preview; no reports are sent to HR.
export function createDemoReports(user) {
  return [
    {
      title: 'Weekly Network Infrastructure Report',
      content:
        'Demo report: All department network services were available during the review period. Routine checks found two workstations requiring software updates.\n\nRecommendation: Schedule the updates after office hours and continue weekly connectivity checks.',
      attachmentUrl: 'https://example.com/demo-network-report.pdf',
      createdAt: '2026-11-20T06:30:00.000Z',
    },
    {
      title: 'Cybersecurity Awareness Session Summary',
      content:
        'Demo report: The team reviewed phishing examples, password practices, and the process for reporting suspicious messages. Participants requested a short reference guide.\n\nRecommendation: Share a one-page checklist and arrange a follow-up session next month.',
      attachmentUrl: '',
      createdAt: '2026-11-17T08:15:00.000Z',
    },
    {
      title: 'IT Equipment Maintenance Findings',
      content:
        'Demo report: Routine maintenance identified a printer needing servicing and three computers due for storage cleanup. No interruption to department services was recorded.\n\nRecommendation: Arrange printer servicing and complete the cleanup during the next maintenance window.',
      attachmentUrl: '',
      createdAt: '2026-11-12T07:00:00.000Z',
    },
  ].map(({ createdAt, ...input }, index) => ({
    ...createDemoReport(user, input, `demo-history-${index + 1}`, new Date(createdAt)),
    id: `DEMO-REPORT-${index + 1}`,
  }))
}
