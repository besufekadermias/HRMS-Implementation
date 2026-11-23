import { z } from 'zod'
export const MILESTONE_TYPES = [
  {
    value: 'PROMOTION',
    label: 'Promotion',
  },
  {
    value: 'STEP_INCREMENT',
    label: 'Step Increment',
  },
  {
    value: 'GRADE_CHANGE',
    label: 'Grade Change',
  },
  {
    value: 'AWARD_MILESTONE',
    label: 'Award Milestone',
  },
]
export const CAREER_STATUS_LABELS = {
  APPLIED: 'Applied',
  RECORDED: 'Recorded',
  SCHEDULED: 'Scheduled',
  HISTORICAL: 'History only',
  NEEDS_REVIEW: 'Needs review',
  CANCELLED: 'Cancelled',
}
export const CAREER_STATUS_DESCRIPTIONS = {
  APPLIED: 'This grade or salary change was applied to your employee record.',
  RECORDED: 'Recorded as an achievement without a grade or salary change.',
  SCHEDULED:
    'Planned for the effective date. Admin automatically checks due plans before applying any grade or salary change.',
  HISTORICAL: 'A historical entry that does not replace your current grade or salary.',
  NEEDS_REVIEW:
    'This plan has not been applied. HR must review a changed or unavailable employee, grade, or salary record.',
  CANCELLED:
    'This plan was cancelled and remains in your history. It did not change your grade or salary.',
}
const owner = z
  .string()
  .min(1)
  .max(100)
  .refine((value) => value.trim().length > 0)
const recordId = z
  .union([owner, z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)])
  .transform(String)
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`)
    return (
      value >= '1900-01-01' &&
      value <= '2100-12-31' &&
      Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    )
  })
const grade = z
  .string()
  .trim()
  .max(200)
  .nullable()
  .default('')
  .transform((value) => value || '')
const money = z
  .number()
  .nonnegative()
  .max(999999999.99)
  .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.00001)
export const careerRecordSchema = z
  .object({
    id: recordId,
    employeeId: owner,
    milestoneType: z.enum(MILESTONE_TYPES.map((type) => type.value)),
    effectiveDate: date,
    status: z.enum(Object.keys(CAREER_STATUS_LABELS)),
    previousGradeName: grade,
    newGradeName: grade,
    previousSalary: money.nullable().default(null),
    newSalary: money.positive().nullable().default(null),
    description: z.string().trim().min(1).max(5000),
    reviewReason: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .default('')
      .transform((value) => value || ''),
  })
  .superRefine((record, context) => {
    const hasGrade = Boolean(record.newGradeName)
    if (
      hasGrade !== (record.newSalary != null) ||
      (!hasGrade &&
        (record.milestoneType !== 'AWARD_MILESTONE' ||
          ['APPLIED', 'HISTORICAL'].includes(record.status)))
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Return the saved target grade and salary for this change.',
      })
    }
    if (record.status === 'RECORDED' && hasGrade) {
      context.addIssue({
        code: 'custom',
        message: 'Recorded achievements must not claim an applied grade change.',
      })
    }
  })
export const careerResponseSchema = z
  .object({
    employeeId: owner,
    today: date,
    timeZone: z.enum(['Africa/Addis_Ababa', 'Africa/Nairobi']),
    records: z.array(careerRecordSchema).max(200),
  })
  .superRefine((data, context) => {
    if (
      data.records.some((record) => record.employeeId !== data.employeeId) ||
      new Set(data.records.map((record) => record.id)).size !== data.records.length
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Return unique career milestones for this employee only.',
      })
    }
    if (
      data.records.some(
        (record) =>
          ['APPLIED', 'RECORDED', 'HISTORICAL'].includes(record.status) &&
          record.effectiveDate > data.today,
      )
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Future milestones must retain their authoritative planned status.',
      })
    }
  })
