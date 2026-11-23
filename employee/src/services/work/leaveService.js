import api from '../api/api.js'
import {
  createLeaveRequestSchema,
  leaveInputSchema,
  leaveKeySchema,
  leaveMutationSchema,
  leaveStateSchema,
} from '../../utils/validation/leaveSchemas.js'
const newestFirst = (requests) =>
  [...requests].sort(
    (a, b) =>
      (Date.parse(b.createdAt || '') || 0) - (Date.parse(a.createdAt || '') || 0) ||
      b.startDate.localeCompare(a.startDate),
  )
function read(schema, value, employeeId) {
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    throw new Error('Leave records are incomplete or inconsistent. Please retry or contact HR.')
  }
  if (parsed.data.employeeId !== employeeId) {
    throw new Error('The service returned another employee’s leave records. Contact HR.')
  }
  return parsed.data
}
export async function loadLeave(employeeId, signal) {
  const data = read(
    leaveStateSchema,
    (
      await api.get('/employee/leave', {
        signal,
      })
    ).data,
    employeeId,
  )
  return {
    ...data,
    requests: newestFirst(data.requests),
  }
}
export function matchesLeaveSubmission(record, values, key) {
  const input = leaveInputSchema.parse(values)
  return (
    record.clientRequestId === key &&
    record.startDate === input.startDate &&
    record.endDate === input.endDate &&
    record.reason === input.reason
  )
}
export async function submitLeaveRequest(values, key, employeeId, context) {
  const input = createLeaveRequestSchema(context).parse(values)
  const requestKey = leaveKeySchema.parse(key)
  const { data } = await api.post('/employee/leave/requests', input, {
    headers: {
      'Idempotency-Key': requestKey,
    },
  })
  const result = read(leaveMutationSchema, data, employeeId)
  const record = result.requests.find((record) => record.id === result.submittedRequestId)
  if (
    !record ||
    !record.dayCounting ||
    record.status !== 'PENDING' ||
    !matchesLeaveSubmission(record, input, requestKey)
  ) {
    throw new Error(
      'The leave submission was not confirmed. Refresh your history before trying again.',
    )
  }
  return {
    data: {
      ...leaveStateSchema.parse(result),
      requests: newestFirst(result.requests),
    },
    record,
  }
}
