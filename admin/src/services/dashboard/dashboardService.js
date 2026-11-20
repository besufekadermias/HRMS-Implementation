import { summarizeLeave } from '../operations/leaveService.js'
import { buildDailyAttendance, summarizeAttendance } from '../operations/attendanceService.js'
import { summarizePayroll } from '../operations/payrollCalculations.js'
import { todayInNairobi } from '../../utils/validation/dates.js'

const departmentColors = ['#257c70', '#39aa97', '#ffc447', '#648194', '#9a9eea', '#c5d8e2']

// App supplies validated workspace records. This function only calculates values;
// it does not save records, fetch data, or change chart presentation.
export function buildDashboardSummary({
  employees, departments, recruitment, leaveData, payrollData, attendance, attendanceHeads,
}, date = todayInNairobi()) {
  const leave = leaveData
    ? summarizeLeave(leaveData.requests, date)
    : { pending: null, approved: null, onLeave: null }

  const departmentCounts = new Map()
  for (const employee of employees) {
    const name = employee.department || 'Unassigned'
    departmentCounts.set(name, (departmentCounts.get(name) || 0) + 1)
  }
  const departmentDistribution = Array.from(departmentCounts, ([name, count], index) => ({
    name, count, color: departmentColors[index % departmentColors.length],
  }))

  let latestPayroll = null
  for (const run of payrollData?.runs || []) {
    if (!latestPayroll || run.month > latestPayroll.month) latestPayroll = run
  }

  const attendanceDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(`${date}T12:00:00Z`)
    day.setUTCDate(day.getUTCDate() - 6 + index)
    const attendanceDate = day.toISOString().slice(0, 10)
    const rows = buildDailyAttendance(employees, departments, attendance, attendanceDate, attendanceHeads)
    const counts = summarizeAttendance(rows)
    return {
      date: attendanceDate,
      hasData: rows.some(row => row.hasAttendanceRecord && row.attendanceStatus !== 'No data'),
      present: counts.Present,
      absent: counts.Absent,
      late: counts.Late,
      checkedIn: counts.checkedIn,
    }
  })
  const todayAttendance = attendanceDays[6]

  return {
    date,
    employeeCount: employees.length,
    pendingLeaves: leave.pending,
    openVacancies: recruitment.jobs.filter(job => job.status === 'OPEN').length,
    netPayroll: payrollData ? summarizePayroll(latestPayroll).net : null,
    departmentDistribution,
    attendanceDays,
    leave,
    quickActionDescriptions: {
      'pending-leave': `${leave.pending ?? '—'} requests awaiting your review`,
      'approved-leave': `${leave.approved ?? '—'} approved leave requests`,
      attendance: todayAttendance.hasData
        ? `${todayAttendance.checkedIn} checked in / ${todayAttendance.absent} absent`
        : 'No attendance records for today',
    },
  }
}
