// One switch for the local preview and the real backend. Vite values are public.
// Direct env fields let Vite exclude demo modules from API-mode builds.
export const USE_DEMO_API = (import.meta.env.VITE_API_MODE || 'demo') === 'demo'
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
