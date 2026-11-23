import { z } from 'zod'
import {
  countLeaveDays,
  earliestLeaveDate,
  getLeaveYear,
  isValidLeaveDate,
} from '../helpers/leaveRules.js'
export const LEAVE_STATUS_LABELS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}
const date = z.string().refine(isValidLeaveDate, 'Choose a valid date.')
const id = z.string().regex(/^[A-Za-z0-9_-]{1,100}$/)
const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)
const policyNumber = (min, max) =>
  z
    .union([z.string(), z.number()])
    .refine((value) => /^\d+$/.test(String(value)) && Number(value) >= min && Number(value) <= max)
    .transform((value) => String(Number(value)))
const settings = z
  .object({
    defaultEntitlement: policyNumber(1, 90),
    maxBalance: policyNumber(1, 90),
    noticeDays: policyNumber(0, 365),
    dayCounting: z.enum(['calendar', 'weekdays']),
    requireRejectionReason: z.boolean(),
  })
  .refine(
    (value) => Number(value.defaultEntitlement) <= Number(value.maxBalance),
    'Entitlement cannot exceed the configured cap.',
  )
export const leaveInputSchema = z.object({
  startDate: date,
  endDate: date,
  reason: z
    .string()
    .trim()
    .min(1, 'Enter a leave reason.')
    .max(1000, 'Keep the reason to 1,000 characters or fewer.'),
})
export const leaveRequestRecordSchema = z
  .object({
    id,
    employeeId: z.string().min(1),
    startDate: date,
    endDate: date,
    daysRequested: z.number().int().positive(),
    dayCounting: z.enum(['calendar', 'weekdays']).nullable().default(null),
    reason: z
      .string()
      .max(1000)
      .nullable()
      .default('')
      .transform((value) => value || ''),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
    createdAt: z.iso.datetime().nullable(),
    decidedAt: z.iso.datetime().nullable(),
    decisionNote: z
      .string()
      .max(1000)
      .nullable()
      .default('')
      .transform((value) => value || ''),
    clientRequestId: id.nullable().default(null),
  })
  .refine((record) => {
    if (
      !isValidLeaveDate(record.startDate) ||
      !isValidLeaveDate(record.endDate) ||
      record.endDate < record.startDate
    ) {
      return false
    }
    const days = countLeaveDays(record.startDate, record.endDate, record.dayCounting || 'calendar')
    return record.dayCounting ? record.daysRequested === days : record.daysRequested <= days
  }, 'Saved leave days do not match the leave window.')
const stateShape = {
  employeeId: z.string().min(1),
  today: date,
  timeZone: z.enum(['Africa/Addis_Ababa', 'Africa/Nairobi']),
  period: z.object({
    year: z.number().int(),
    start: date,
    end: date,
    nextStart: date,
  }),
  settings,
  balance: z
    .object({
      employeeId: z.string().min(1),
      yearStart: date,
      accrued: count,
      used: count,
      remaining: count,
    })
    .nullable(),
  requests: z.array(leaveRequestRecordSchema).max(200),
  canRequest: z.boolean(),
  message: z.string().nullable(),
}
function validateState(data, context) {
  const fail = (message) =>
    context.addIssue({
      code: 'custom',
      message,
    })
  if (isValidLeaveDate(data.today)) {
    const expected = getLeaveYear(data.today)
    if (Object.keys(expected).some((key) => data.period[key] !== expected[key])) {
      fail('Return the current Ethiopian leave year.')
    }
  }
  if (
    data.balance &&
    (data.balance.employeeId !== data.employeeId ||
      data.balance.yearStart !== data.period.start ||
      data.balance.used > data.balance.accrued ||
      data.balance.remaining !== data.balance.accrued - data.balance.used ||
      data.balance.remaining > Number(data.settings.maxBalance))
  ) {
    fail('The leave balance is not reconciled for this employee and year.')
  }
  if (
    data.requests.some((request) => request.employeeId !== data.employeeId) ||
    new Set(data.requests.map((request) => request.id)).size !== data.requests.length
  ) {
    fail('Return unique requests for this employee only.')
  }
}
export const leaveStateSchema = z.object(stateShape).superRefine(validateState)
export const leaveMutationSchema = z
  .object({
    ...stateShape,
    submittedRequestId: id,
  })
  .superRefine(validateState)
export const leaveKeySchema = id
export function createLeaveRequestSchema(data) {
  return leaveInputSchema.superRefine((values, context) => {
    const fail = (field, message) =>
      context.addIssue({
        code: 'custom',
        path: [field],
        message,
      })
    if (!isValidLeaveDate(values.startDate) || !isValidLeaveDate(values.endDate)) {
      return
    }
    if (values.endDate < values.startDate) {
      fail('endDate', 'End date must be on or after the start date.')
      return
    }
    const days = countLeaveDays(values.startDate, values.endDate, data.settings.dayCounting)
    if (!days) {
      fail('endDate', 'Choose a leave window containing at least one chargeable day.')
    }
    if (days > Number(data.settings.maxBalance)) {
      fail('endDate', `A request cannot exceed ${data.settings.maxBalance} chargeable days.`)
    }
    if (values.endDate > getLeaveYear(values.startDate).end) {
      fail(
        'endDate',
        'Leave crosses Ethiopian New Year. Submit a separate request for each leave year.',
      )
    }
    if (values.startDate < earliestLeaveDate(data.today, data.settings.noticeDays)) {
      fail(
        'startDate',
        `The start date must be at least ${data.settings.noticeDays} days from today.`,
      )
    }
    if (
      data.requests.some(
        (request) =>
          ['PENDING', 'APPROVED'].includes(request.status) &&
          request.startDate <= values.endDate &&
          request.endDate >= values.startDate,
      )
    ) {
      fail('startDate', 'These dates overlap an existing pending or approved request.')
    }
    if (!data.canRequest) {
      fail('startDate', data.message || 'Leave requests are currently unavailable. Contact HR.')
    }
  })
}
