import { z } from 'zod'

export const AWARD_CATEGORIES = [
  { value: 'EXCELLENCE', label: 'Excellence' },
  { value: 'INNOVATION', label: 'Innovation' },
  { value: 'LONG_SERVICE', label: 'Long Service' },
  { value: 'PUNCTUALITY', label: 'Punctuality' },
]
export const workDateSchema = z
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
  })
export const publicOwnerSchema = z
  .string()
  .min(1)
  .max(100)
  .refine((value) => value.trim().length > 0)
export const publicRecordIdSchema = z
  .union([publicOwnerSchema, z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)])
  .transform(String)
export const rewardRecordSchema = z.object({
  id: publicRecordIdSchema,
  employeeId: publicOwnerSchema,
  title: z.string().trim().min(1).max(150),
  category: z.enum(AWARD_CATEGORIES.map((item) => item.value)),
  awardDate: workDateSchema,
  description: z
    .string()
    .max(5000)
    .nullable()
    .default('')
    .transform((value) => value || ''),
})
export const rewardsResponseSchema = z
  .object({ employeeId: publicOwnerSchema, records: z.array(rewardRecordSchema).max(200) })
  .refine(
    (data) =>
      data.records.every((record) => record.employeeId === data.employeeId) &&
      new Set(data.records.map((record) => record.id)).size === data.records.length,
    'Return unique recognitions for this employee only.',
  )
