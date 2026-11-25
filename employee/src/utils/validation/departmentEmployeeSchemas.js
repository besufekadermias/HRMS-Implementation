import { z } from 'zod'
import { attendanceDateSchema, attendanceTimeZoneSchema } from './attendanceSchemas.js'
import { departmentTeamSchema } from './departmentSchemas.js'
import { isDepartmentHead } from '../helpers/portalAccess.js'

export const EMPLOYMENT_TYPES = ['Permanent', 'Contract', 'Temporary']
export const employeeRequestKeySchema = z.string().regex(/^[A-Za-z0-9_-]{1,100}$/)
const employeeDate = z.string().refine(value => attendanceDateSchema.safeParse(value).success, 'Enter a valid date from 1900 through 2100.')
export const employeePhotoSchema = z.custom(value => typeof File === 'function' && value instanceof File &&
  value.size > 0 && value.size <= 5 * 1024 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(value.type),
  'Choose a nonempty JPG, PNG, or WEBP image up to 5 MB.').nullable().optional().default(null)
export const employeeDocumentSchema = z.custom(value => typeof File === 'function' && value instanceof File &&
  value.size > 0 && value.size <= 10 * 1024 * 1024 && /\.(pdf|doc|docx|jpe?g|png)$/i.test(value.name),
  'Choose a nonempty PDF, DOC, DOCX, JPG, or PNG file up to 10 MB.').nullable().optional().default(null)

// Match admin's identity fields. Department, role, status, and salary are server-owned.
export const departmentEmployeeInputSchema = z.object({
  serialNumber: z.string().trim().regex(/^[A-Za-z0-9_-]{1,30}$/, 'Use 1–30 letters, numbers, hyphens, or underscores.'),
  fullName: z.string().trim().min(2, 'Enter a full name of 2–100 characters.').max(100),
  email: z.string().trim().toLowerCase().max(100)
    .refine(value => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value), 'Enter a registered email address.'),
  gender: z.enum(['Male', 'Female', 'Other'], { error: 'Select a gender.' }),
  birthDate: employeeDate,
  hiredDate: employeeDate,
  qualification: z.string().trim().max(160, 'Keep the qualification to 160 characters or fewer.'),
  gradeId: z.string().min(1, 'Select a civil job grade.').max(100),
  employmentType: z.enum(EMPLOYMENT_TYPES, { error: 'Select an employment type.' }),
  temporaryPassword: z.string().min(8, 'Use at least 8 characters.').max(128, 'Use 128 characters or fewer.'),
  photo: employeePhotoSchema,
  educationDocument: employeeDocumentSchema,
}).strict()

export function createDepartmentEmployeeSchema(today, grades) {
  return departmentEmployeeInputSchema.superRefine((values, context) => {
    if (values.birthDate > today) context.addIssue({ code: 'custom', path: ['birthDate'], message: 'Birth date cannot be in the future.' })
    if (values.hiredDate < values.birthDate) context.addIssue({ code: 'custom', path: ['hiredDate'], message: 'Hired date cannot be before birth date.' })
    if (!grades.some(grade => grade.id === values.gradeId)) context.addIssue({ code: 'custom', path: ['gradeId'], message: 'Select an available civil job grade.' })
  })
}

// The form uses admin labels/names; the service uses database-oriented request fields.
export function createEmployeeRegistrationSchema(options) {
  const input = departmentEmployeeInputSchema.shape
  return z.object({
    id: input.serialNumber, name: input.fullName, email: input.email,
    gender: input.gender, birthDate: input.birthDate, hiredDate: input.hiredDate,
    qualification: input.qualification, employmentType: input.employmentType,
    grade: z.string().min(1, 'Select a civil job grade.'),
    department: z.literal(options.department.name), portalRole: z.literal('Employee'),
    photo: z.custom(value => value === null || Boolean(value?.file) && employeePhotoSchema.safeParse(value.file).success, 'Choose a JPG, PNG, or WEBP image up to 5 MB.').nullable(),
    educationDocument: z.custom(value => value === null || Boolean(value?.file) && employeeDocumentSchema.safeParse(value.file).success, 'Choose a supported education document up to 10 MB.').nullable(),
    temporaryPassword: input.temporaryPassword,
  }).superRefine((values, context) => {
    if (values.birthDate > options.today) context.addIssue({ code: 'custom', path: ['birthDate'], message: 'Birth date cannot be in the future.' })
    if (values.hiredDate < values.birthDate) context.addIssue({ code: 'custom', path: ['hiredDate'], message: 'Hired date cannot be before birth date.' })
    if (!options.grades.some(grade => grade.name === values.grade)) context.addIssue({ code: 'custom', path: ['grade'], message: 'Select an available civil job grade.' })
  })
}

export function registrationToEmployeeInput(values, options) {
  return departmentEmployeeInputSchema.parse({
    serialNumber: values.id, fullName: values.name, email: values.email,
    gender: values.gender, birthDate: values.birthDate, hiredDate: values.hiredDate,
    qualification: values.qualification, employmentType: values.employmentType,
    gradeId: options.grades.find(grade => grade.name === values.grade)?.id || '',
    temporaryPassword: values.temporaryPassword,
    photo: values.photo?.file || null, educationDocument: values.educationDocument?.file || null,
  })
}

export const departmentEmployeeOptionsSchema = z.object({
  department: departmentTeamSchema.shape.department,
  today: attendanceDateSchema,
  timeZone: attendanceTimeZoneSchema,
  canCreateEmployee: z.boolean(),
  message: z.string().max(500).nullable(),
  grades: z.array(z.object({
    id: z.string().min(1).max(100), name: z.string().min(1).max(80),
    salary: z.number().positive().max(999999999.99).refine(value => Math.abs(value * 100 - Math.round(value * 100)) < 0.00001),
  })).max(200),
}).refine(data => new Set(data.grades.map(grade => grade.id)).size === data.grades.length, 'Duplicate job grades.')
  .refine(data => new Set(data.grades.map(grade => grade.name.trim().toLowerCase())).size === data.grades.length, 'Duplicate job grade names.')

export function readDepartmentEmployeeOptions(value, user) {
  if (!isDepartmentHead(user) || user.mustChangePassword) throw new Error('Only the assigned department head can add employees.')
  const result = departmentEmployeeOptionsSchema.safeParse(value)
  if (!result.success) throw new Error('Employee form settings are invalid. Refresh or contact HR.')
  const data = result.data
  if (data.department.id !== user.departmentId || data.department.headEmployeeId !== user.employeeId) {
    throw new Error('Your department assignment changed. Sign in again.')
  }
  return data
}

export const departmentEmployeeCreatedSchema = departmentTeamSchema.extend({
  createdEmployeeId: z.string().min(1).max(100), clientRequestId: employeeRequestKeySchema,
})

export function matchesCreatedEmployee(employee, values, key) {
  const input = departmentEmployeeInputSchema.parse(values)
  return employee.clientRequestId === key && employee.serialNumber === input.serialNumber &&
    employee.fullName === input.fullName && employee.email === input.email &&
    employee.role === 'EMPLOYEE' && employee.employmentStatus === 'ACTIVE'
}
