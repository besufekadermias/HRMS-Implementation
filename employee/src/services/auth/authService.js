import api from '../api/api.js'
import { loginSchema, userSchema } from '../../utils/validation/authSchemas.js'
import { passwordChangeSchema } from '../../utils/validation/passwordSchemas.js'
export { getDemoLogin } from '../api/api.js'
function readUser(value) {
  const parsed = userSchema.safeParse(value)
  if (!parsed.success) {
    throw new Error('The service returned an invalid employee account.')
  }
  return parsed.data
}
export async function signIn(values) {
  const { data } = await api.post('/auth/login', {
    ...loginSchema.parse(values),
    portal: 'employee',
  })
  return readUser(data.user)
}
export async function restoreSession(signal) {
  try {
    const { data } = await api.get('/auth/session', {
      signal,
    })
    return readUser(data.user)
  } catch (error) {
    if (error.response?.status === 401) {
      return null
    }
    throw error
  }
}
export async function signOut() {
  try {
    await api.post('/auth/logout')
  } catch (error) {
    if (error.response?.status !== 401) {
      throw error
    }
  }
}
export async function changePassword(values) {
  const { currentPassword, newPassword } = passwordChangeSchema.parse(values)
  const { data } = await api.post('/auth/change-password', {
    currentPassword,
    newPassword,
  })
  const user = readUser(data.user)
  if (user.mustChangePassword || !user.passwordChangedAt) {
    throw new Error('The password change was not confirmed. Please try again.')
  }
  return user
}
