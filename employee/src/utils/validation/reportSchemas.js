import { z } from 'zod'
import { publicOwnerSchema, publicRecordIdSchema, workDateSchema } from './rewardSchemas.js'
export function reportAttachmentUrl(value) {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : ''
  } catch {
    return ''
  }
}
const link = z
  .string()
  .trim()
  .max(255, 'Keep the file link to 255 characters or fewer.')
  .refine(
    (value) => !value || Boolean(reportAttachmentUrl(value)),
    'Use a full http:// or https:// link without a username or password.',
  )
  .transform((value) => (value ? reportAttachmentUrl(value) : ''))
  .refine((value) => value.length <= 255, 'Keep the file link to 255 characters or fewer.')
export const reportInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Enter a report subject or title.')
    .max(150, 'Keep the title to 150 characters or fewer.'),
  content: z
    .string()
    .trim()
    .min(1, 'Enter your detailed findings and recommendations.')
    .max(5000, 'Keep the report to 5,000 characters or fewer.'),
  attachmentUrl: link.default(''),
})
export const reportKeySchema = z.string().regex(/^[A-Za-z0-9_-]{1,100}$/)
export const reportRecordSchema = z
  .object({
    id: publicRecordIdSchema,
    employeeId: publicOwnerSchema,
    submittedByUserId: publicOwnerSchema,
    submittedBy: z.string().min(1).max(200),
    submittedRole: z.enum(['EMPLOYEE', 'DEPARTMENT_HEAD']),
    category: z.literal('EMPLOYEE_SUBMISSION'),
    date: workDateSchema,
    createdAt: z.iso.datetime().nullable(),
    title: reportInputSchema.shape.title,
    content: reportInputSchema.shape.content,
    attachmentUrl: z.preprocess((value) => (value == null || value === 'N/A' ? '' : value), link),
    clientRequestId: reportKeySchema.nullable().default(null),
  })
  .refine(
    (record) =>
      !record.createdAt ||
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Africa/Addis_Ababa',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(record.createdAt)) === record.date,
    'Report date and submission time must agree in East Africa Time.',
  )
const shape = {
  employeeId: publicOwnerSchema,
  userId: publicOwnerSchema,
  records: z.array(reportRecordSchema).max(200),
  canSubmit: z.boolean(),
  message: z.string().nullable(),
}
function validate(data, context) {
  if (
    data.records.some(
      (record) => record.employeeId !== data.employeeId || record.submittedByUserId !== data.userId,
    ) ||
    new Set(data.records.map((record) => record.id)).size !== data.records.length
  ) {
    context.addIssue({
      code: 'custom',
      message: 'Return unique submissions for this account only.',
    })
  }
}
export const reportsResponseSchema = z.object(shape).superRefine(validate)
export const reportMutationSchema = z
  .object({
    ...shape,
    submittedReportId: publicRecordIdSchema,
  })
  .superRefine(validate)
