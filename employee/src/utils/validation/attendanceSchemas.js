import { z } from 'zod'
import { userSchema } from './authSchemas.js'
export const attendanceDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`)
    return (
      value >= '1900-01-01' &&
      value <= '2100-12-31' &&
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    )
  }, 'Use a valid attendance date.')
export const attendanceTimeZoneSchema = z.enum(['Africa/Addis_Ababa', 'Africa/Nairobi'])
export const ATTENDANCE_STATUS_LABELS = {
  PRESENT: 'Present',
  LATE: 'Late',
  ABSENT: 'Absent',
  ON_LEAVE: 'On Leave',
}
const verification = z.enum(['VERIFIED', 'UNVERIFIED', 'UNAVAILABLE']).nullable().default(null)
export const attendanceRecordSchema = z
  .object({
    id: z.string().min(1),
    date: attendanceDateSchema,
    checkIn: z.iso.datetime().nullable(),
    checkOut: z.iso.datetime().nullable(),
    checkInIp: z.string().nullable(),
    checkOutIp: z.string().nullable(),
    checkInVerification: verification,
    checkOutVerification: verification,
    status: z.enum(['PRESENT', 'LATE', 'ABSENT', 'ON_LEAVE']),
  })
  .refine(
    (record) =>
      !record.checkOut ||
      (record.checkIn && Date.parse(record.checkOut) >= Date.parse(record.checkIn)),
    'Check-out must follow check-in.',
  )
  .transform((record) => ({
    ...record,
    checkInVerification: record.checkIn ? record.checkInVerification || 'UNAVAILABLE' : null,
    checkOutVerification: record.checkOut ? record.checkOutVerification || 'UNAVAILABLE' : null,
  }))
const scheduleSchema = z
  .object({
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    gracePeriod: z
      .string()
      .regex(/^\d+$/)
      .refine((value) => Number(value) <= 1439),
  })
  .refine((schedule) => {
    const minutes = (value) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3))
    return (
      schedule.endTime > schedule.startTime &&
      Number(schedule.gracePeriod) < minutes(schedule.endTime) - minutes(schedule.startTime)
    )
  }, 'Use the saved admin daily schedule.')
export const attendanceSchema = z
  .object({
    date: attendanceDateSchema,
    serverTime: z.iso.datetime(),
    timeZone: attendanceTimeZoneSchema,
    schedule: scheduleSchema,
    ipAddress: z.string().nullable(),
    ipAuthorized: z.boolean(),
    configured: z.boolean(),
    record: attendanceRecordSchema.nullable(),
    checkoutAt: z.iso.datetime(),
    code: z.string().nullable(),
    message: z.string(),
    canCheckIn: z.boolean(),
    canCheckOut: z.boolean(),
  })
  .refine((state) => {
    if (state.record && state.record.date !== state.date) {
      return false
    }
    if (!state.configured && state.ipAuthorized) {
      return false
    }
    if ((!state.configured || !state.ipAuthorized) && (state.canCheckIn || state.canCheckOut)) {
      return false
    }
    if (state.canCheckIn && (state.canCheckOut || state.record?.checkIn)) {
      return false
    }
    if (state.canCheckOut && (!state.record?.checkIn || state.record.checkOut)) {
      return false
    }
    return true
  }, 'The attendance permissions do not match the workday record.')
export const attendanceHistorySchema = z
  .object({
    employeeId: z.string().min(1),
    timeZone: attendanceTimeZoneSchema,
    records: z.array(attendanceRecordSchema).max(30),
  })
  .refine(
    (data) =>
      new Set(data.records.map((record) => record.date)).size === data.records.length &&
      new Set(data.records.map((record) => record.id)).size === data.records.length,
    'Return one unique attendance record per workday.',
  )
export const dashboardSchema = z.object({
  user: userSchema,
  attendance: attendanceSchema,
  leaveBalance: z.number().nullable(),
  announcements: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      createdAt: z.iso.datetime(),
    }),
  ),
})
