import { useCallback, useEffect, useRef, useState } from 'react'
import { loadAttendanceHistory } from '../../services/work/attendanceService.js'
import { useEmployeeStore } from '../../store/index.js'
export default function useAttendanceHistory(revision) {
  const employeeId = useEmployeeStore((state) => state.user?.employeeId)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const controllerRef = useRef(null)
  const refresh = useCallback(async () => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setLoading(true)
    try {
      const updated = await loadAttendanceHistory(controller.signal)
      if (controller.signal.aborted) {
        return
      }
      if (updated.employeeId !== employeeId) {
        throw new Error(
          'The service returned a different employee’s attendance history. Contact HR.',
        )
      }
      setData(updated)
      setError('')
    } catch (failure) {
      if (!controller.signal.aborted) {
        setError(failure.message)
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
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      window.clearTimeout(timer)
      controllerRef.current?.abort()
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [refresh, revision])
  return {
    data,
    loading,
    error,
    refresh,
  }
}
