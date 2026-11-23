import api from '../api/api.js'
import {
  payrollIdSchema,
  payrollResponseSchema,
  payslipResponseSchema,
} from '../../utils/validation/payrollSchemas.js'
function read(schema, value, employeeId) {
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    throw new Error('Payroll records are incomplete or inconsistent. Please retry or contact HR.')
  }
  if (parsed.data.employeeId !== employeeId) {
    throw new Error('The service returned a different employee’s payroll. Contact HR.')
  }
  return parsed.data
}
function readId(value) {
  const parsed = payrollIdSchema.safeParse(value)
  if (!parsed.success) {
    throw new Error('This payslip link is invalid. Return to My Payroll.')
  }
  return parsed.data
}
export async function loadPayroll(employeeId, signal) {
  const result = read(
    payrollResponseSchema,
    (
      await api.get('/employee/payroll', {
        signal,
      })
    ).data,
    employeeId,
  )
  return {
    ...result,
    records: [...result.records].sort((a, b) => b.month.localeCompare(a.month)),
  }
}
export async function loadPayslip(id, employeeId, signal) {
  const recordId = readId(id)
  const result = read(
    payslipResponseSchema,
    (
      await api.get(`/employee/payroll/${encodeURIComponent(recordId)}`, {
        signal,
      })
    ).data,
    employeeId,
  )
  if (result.record.id !== recordId) {
    throw new Error('The service returned a different payslip. Please retry or contact HR.')
  }
  return result.record
}
export async function loadPayslipPdf(id, signal) {
  const recordId = readId(id)
  const { data } = await api.get(`/employee/payroll/${encodeURIComponent(recordId)}/payslip`, {
    responseType: 'blob',
    signal,
  })
  if (
    !(data instanceof Blob) ||
    data.type.split(';')[0].toLowerCase() !== 'application/pdf' ||
    data.size < 8 ||
    data.size > 10 * 1024 * 1024 ||
    (await data.slice(0, 5).text()) !== '%PDF-'
  ) {
    throw new Error('The service did not return a valid PDF payslip. Please retry or contact HR.')
  }
  return data
}
