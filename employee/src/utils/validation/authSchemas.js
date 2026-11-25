import { z } from 'zod'

const emailSchema = z.string().trim().toLowerCase().max(100)
  .refine(value => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value), 'Enter your registered email address.')

export const userSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  login: z.string(),
  email: emailSchema,
  role: z.enum(['EMPLOYEE', 'DEPARTMENT_HEAD']),
  department: z.string(),
  departmentId: z.string().min(1).max(100).nullable(),
  employeeId: z.string(),
  serialNumber: z.string(),
  mustChangePassword: z.boolean(),
  passwordChangedAt: z.string().nullable(),
  grade: z.string(),
  baseSalary: z.number().nullable(),
  employmentStatus: z.string(),
  employmentType: z.string(),
}).superRefine((user, context) => {
  if (user.role === 'DEPARTMENT_HEAD' && !user.departmentId) {
    context.addIssue({
      code: 'custom', path: ['departmentId'],
      message: 'The department head account has no assigned department.',
    })
  }
})
export const loginSchema = z.object({
  identifier: emailSchema,
  password: z.string().min(1, 'Enter your password.'),
})

// The API and preview use the same email policy.
export const emailLoginSchema = loginSchema

export function readLoginUser(value, identifier) {
  const user = userSchema.parse(value)
  if (identifier.includes('@') && user.email !== identifier.trim().toLowerCase()) {
    throw new Error('The login response belongs to a different email account.')
  }
  return user
}
