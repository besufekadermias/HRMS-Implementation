import { z } from 'zod'
export const PAYROLL_STATUS_LABELS = {
  GENERATED: 'Generated',
  FORWARDED_TO_FINANCE: 'Forwarded to Finance',
  PAID: 'Paid',
}
export const payrollIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,100}$/)
export const payrollMonthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
  .refine((value) => value >= '1900-01' && value <= '2100-12')
const text = z.string().trim().min(1).max(200)
export function payrollCents(value) {
  return Math.round(value * 100)
}
const money = z
  .number()
  .nonnegative()
  .refine(
    (value) =>
      Number.isSafeInteger(payrollCents(value)) &&
      Math.abs(value * 100 - payrollCents(value)) < 0.00001,
    'Use a valid amount with at most two decimal places.',
  )
export const payrollRecordSchema = z
  .object({
    id: payrollIdSchema,
    month: payrollMonthSchema,
    status: z.enum(['GENERATED', 'FORWARDED_TO_FINANCE', 'PAID']),
    employee: z.object({
      id: text,
      serialNumber: z.string().max(100),
      fullName: text,
      department: z.string().max(500),
    }),
    gross: money,
    incomeTax: money,
    pension: money,
    employerPension: money,
    otherDeductions: money,
    net: money,
    incomeTaxLabel: text,
    pensionLabel: text,
    deductionItems: z
      .array(
        z.object({
          id: text,
          name: text,
          amount: money,
        }),
      )
      .max(100),
    generatedAt: z.iso.datetime().nullable(),
    forwardedAt: z.iso.datetime().nullable(),
    canDownload: z.boolean(),
  })
  .superRefine((record, context) => {
    const fail = (message) =>
      context.addIssue({
        code: 'custom',
        message,
      })
    if (
      payrollCents(record.gross) !==
      payrollCents(record.incomeTax) +
        payrollCents(record.pension) +
        payrollCents(record.otherDeductions) +
        payrollCents(record.net)
    ) {
      fail('Payroll totals do not reconcile.')
    }
    if (
      record.deductionItems.reduce((sum, item) => sum + payrollCents(item.amount), 0) !==
      payrollCents(record.otherDeductions)
    ) {
      fail('Other deductions do not match their total.')
    }
    if (
      new Set(record.deductionItems.map((item) => item.id)).size !== record.deductionItems.length
    ) {
      fail('Deduction IDs must be unique.')
    }
  })
export const payrollResponseSchema = z
  .object({
    employeeId: text,
    records: z.array(payrollRecordSchema).max(120),
  })
  .refine((data) => {
    return (
      data.records.every((record) => record.employee.id === data.employeeId) &&
      new Set(data.records.map((record) => record.id)).size === data.records.length &&
      new Set(data.records.map((record) => record.month)).size === data.records.length
    )
  }, 'Return unique monthly payroll records for the authenticated employee.')
export const payslipResponseSchema = z
  .object({
    employeeId: text,
    record: payrollRecordSchema,
  })
  .refine(
    (data) => data.employeeId === data.record.employee.id,
    'Return the authenticated employee’s payslip.',
  )
