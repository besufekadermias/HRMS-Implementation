import { useCallback, useEffect, useRef, useState } from 'react'
import { loadCareer } from '../../services/growth/careerService.js'
import { useEmployeeStore } from '../../store/index.js'
export default function useCareer() {
  const employeeId = useEmployeeStore((state) => state.user?.employeeId)
  const [result, setResult] = useState({
    owner: null,
    data: null,
    error: '',
  })
  const [loading, setLoading] = useState(true)
  const controllerRef = useRef(null)
  const refresh = useCallback(async () => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setLoading(true)
    try {
      const data = await loadCareer(employeeId, controller.signal)
      if (!controller.signal.aborted) {
        setResult({
          owner: employeeId,
          data,
          error: '',
        })
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setResult((state) => ({
          owner: employeeId,
          data: state.owner === employeeId ? state.data : null,
          error: error.message,
        }))
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [employeeId])
  useEffect(() => {
    const timer = window.setTimeout(refresh, 0)
    const onFocus = () => {
      if (document.visibilityState === 'visible') {
        void refresh()
      }
    }
    const poll = window.setInterval(onFocus, 60000)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      controllerRef.current?.abort()
      window.clearTimeout(timer)
      window.clearInterval(poll)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [refresh])
  return {
    data: result.owner === employeeId ? result.data : null,
    error: result.owner === employeeId ? result.error : '',
    loading,
    refresh,
  }
}
