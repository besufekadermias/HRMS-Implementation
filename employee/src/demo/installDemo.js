import api from '../services/api/api.js'
import { createDemoPortalAdapter } from './adapter.js'

// Loaded by main.jsx only in demo mode, before React starts making requests.
const adapter = createDemoPortalAdapter()
api.defaults.adapter = adapter
export function getDemoLogin(role = 'EMPLOYEE') {
  return adapter.getLoginSuggestion(role)
}
