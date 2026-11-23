import { z } from 'zod'

const passwordFields = {
  currentPassword: z.string().min(1, 'Enter your current password.'),
  newPassword: z
    .string()
    .min(12, 'Use at least 12 characters.')
    .max(128, 'Use 128 characters or fewer.'),
}
function differentPassword(values, context) {
  if (values.newPassword === values.currentPassword) {
    context.addIssue({
      code: 'custom',
      path: ['newPassword'],
      message: 'Choose a password different from your current password.',
    })
  }
}
export const passwordChangeRequestSchema = z.object(passwordFields).superRefine(differentPassword)
export const passwordChangeSchema = z
  .object({
    ...passwordFields,
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .superRefine((values, context) => {
    differentPassword(values, context)
    if (values.confirmPassword && values.newPassword !== values.confirmPassword) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'The new passwords do not match.',
      })
    }
  })
