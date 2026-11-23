import { z } from 'zod'
import { userSchema } from './authSchemas.js'
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024
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
  .nullable()
const photoUrl = z
  .string()
  .refine((value) => {
    if (/^\/(?!\/)/.test(value)) {
      return !/[\\\s]/.test(value)
    }
    if (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) {
      return true
    }
    try {
      return ['https:', 'http:'].includes(new URL(value).protocol)
    } catch {
      return false
    }
  })
  .nullable()
export const profileDetailsSchema = z.object({
  qualification: z.string().nullable(),
  gender: z.enum(['Male', 'Female', 'Other']).nullable(),
  birthDate: date,
  hiredDate: date,
  photoUrl,
})
export const profileResponseSchema = z.object({
  user: userSchema,
  profile: profileDetailsSchema,
})
export function validatePhoto(file) {
  if (!(file instanceof File)) {
    throw new Error('Choose a profile photo.')
  }
  if (!PHOTO_TYPES.includes(file.type)) {
    throw new Error('Choose a JPG, PNG, or WebP image.')
  }
  if (!file.size || file.size > MAX_PHOTO_BYTES) {
    throw new Error('Choose a nonempty photo no larger than 5 MB.')
  }
  return file
}
