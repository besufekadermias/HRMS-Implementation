import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  login: z.string(),
  role: z.enum(['EMPLOYEE', 'DEPARTMENT_HEAD']),
  department: z.string(),
  employeeId: z.string(),
  serialNumber: z.string(),
  mustChangePassword: z.boolean(),
  passwordChangedAt: z.string().nullable(),
  grade: z.string(),
  baseSalary: z.number().nullable(),
  employmentStatus: z.string(),
  employmentType: z.string(),
})
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Enter your username or email.')
    .max(100)
    .refine((value) => !/\s/.test(value), 'Use a username or email without spaces.'),
  password: z.string().min(1, 'Enter your password.'),
})
