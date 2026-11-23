import api from '../api/api.js'
import {
  attendanceSchema,
  attendanceHistorySchema,
  dashboardSchema,
} from '../../utils/validation/attendanceSchemas.js'
function read(schema, data) {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error('The service returned invalid attendance data.')
  }
  return result.data
}
export async function loadDashboard(signal) {
  return read(
    dashboardSchema,
    (
      await api.get('/employee/dashboard', {
        signal,
      })
    ).data,
  )
}
export async function loadAttendance(signal) {
  return read(
    attendanceSchema,
    (
      await api.get('/employee/attendance/status', {
        signal,
      })
    ).data,
  )
}
export async function recordAttendance(action) {
  if (!['check-in', 'check-out'].includes(action)) {
    throw new Error('Choose check-in or check-out.')
  }
  return read(attendanceSchema, (await api.post(`/employee/attendance/${action}`)).data)
}
export async function loadAttendanceHistory(signal) {
  const data = read(
    attendanceHistorySchema,
    (
      await api.get('/employee/attendance/history', {
        params: {
          limit: 30,
        },
        signal,
      })
    ).data,
  )
  return {
    ...data,
    records: [...data.records].sort((a, b) => b.date.localeCompare(a.date)),
  }
}
