import axios from 'axios'
import { useEmployeeStore } from '../../store/index.js'
import { API_BASE_URL } from '../../config/api.js'
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const body = error.response?.data
    if (body instanceof Blob && body.size <= 65536 && body.type.includes('json')) {
      try {
        error.response.data = JSON.parse(await body.text())
      } catch {
        /* Keep an unreadable binary error generic. */
      }
    }
    const failure = error.response?.data?.error
    error.message =
      failure?.message || 'Unable to reach the service. Check your connection and try again.'
    error.code = failure?.code || error.code
    error.fields = failure?.fields
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      useEmployeeStore.getState().setUser(null)
    }
    if (error.code === 'PASSWORD_CHANGE_REQUIRED') {
      useEmployeeStore.getState().requirePasswordChange()
    }
    return Promise.reject(error)
  },
)
export default api
