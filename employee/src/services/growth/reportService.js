import api from '../api/api.js'
import {
  reportInputSchema,
  reportKeySchema,
  reportMutationSchema,
  reportsResponseSchema,
} from '../../utils/validation/reportSchemas.js'
function read(schema, value, employeeId, userId) {
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    throw new Error('Report records are incomplete or inconsistent. Please retry or contact HR.')
  }
  if (parsed.data.employeeId !== employeeId || parsed.data.userId !== userId) {
    throw new Error('The service returned another account’s reports. Contact HR.')
  }
  return {
    ...parsed.data,
    records: [...parsed.data.records].sort(
      (a, b) =>
        (Date.parse(b.createdAt || '') || 0) - (Date.parse(a.createdAt || '') || 0) ||
        b.date.localeCompare(a.date),
    ),
  }
}
export async function loadReports(employeeId, userId, signal) {
  return read(
    reportsResponseSchema,
    (
      await api.get('/employee/reports', {
        signal,
      })
    ).data,
    employeeId,
    userId,
  )
}
export function matchesReportSubmission(record, values, key) {
  const input = reportInputSchema.parse(values)
  return (
    record.clientRequestId === key &&
    Boolean(record.createdAt) &&
    record.title === input.title &&
    record.content === input.content &&
    record.attachmentUrl === input.attachmentUrl
  )
}
export async function submitReport(values, key, employeeId, userId) {
  const input = reportInputSchema.parse(values)
  const receipt = reportKeySchema.parse(key)
  const data = read(
    reportMutationSchema,
    (
      await api.post('/employee/reports', input, {
        headers: {
          'Idempotency-Key': receipt,
        },
      })
    ).data,
    employeeId,
    userId,
  )
  const record = data.records.find((record) => record.id === data.submittedReportId)
  if (!record || !matchesReportSubmission(record, input, receipt)) {
    throw new Error(
      'The report submission was not confirmed. Refresh your history before retrying.',
    )
  }
  return {
    data: reportsResponseSchema.parse(data),
    record,
  }
}
