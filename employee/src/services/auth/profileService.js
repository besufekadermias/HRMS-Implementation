import api from '../api/api.js'
import { profileResponseSchema, validatePhoto } from '../../utils/validation/profileSchemas.js'
function readProfile(data) {
  const result = profileResponseSchema.safeParse(data)
  if (!result.success) {
    throw new Error(
      'The service returned invalid employee profile data. Please try again or contact HR.',
    )
  }
  // Root-relative upload URLs belong to the configured API host, which may differ from Vite's host.
  if (result.data.profile.photoUrl?.startsWith('/')) {
    const apiRoot = new URL(api.defaults.baseURL, globalThis.location?.origin)
    result.data.profile.photoUrl = new URL(result.data.profile.photoUrl, apiRoot).href
  }
  return result.data
}
export async function loadProfile(signal) {
  return readProfile(
    (
      await api.get('/employee/profile', {
        signal,
      })
    ).data,
  )
}
export async function saveProfilePhoto(file) {
  const body = new FormData()
  body.append('photo', validatePhoto(file))
  return readProfile((await api.put('/employee/profile/photo', body)).data)
}
export async function removeProfilePhoto() {
  return readProfile((await api.delete('/employee/profile/photo')).data)
}
