import { useCallback, useEffect, useRef, useState } from 'react'
import { loadPayroll, loadPayslip } from '../../services/work/payrollService.js'
import { useEmployeeStore } from '../../store/index.js'
export default function usePayroll(id = null) {
  const employeeId = useEmployeeStore((state) => state.user?.employeeId)
  const [result, setResult] = useState({
    key: null,
    data: null,
    error: '',
  })
  const [loading, setLoading] = useState(true)
  const controllerRef = useRef(null)
  const key = `${employeeId}:${id || 'list'}`
  const refresh = useCallback(async () => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setLoading(true)
    try {
      const data = await (id
        ? loadPayslip(id, employeeId, controller.signal)
        : loadPayroll(employeeId, controller.signal))
      if (!controller.signal.aborted) {
        setResult({
          key,
          data,
          error: '',
        })
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setResult((state) => ({
          key,
          data: state.key === key ? state.data : null,
          error: error.message,
        }))
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [employeeId, id, key])
  useEffect(() => {
    const timer = window.setTimeout(refresh, 0)
    function onFocus() {
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
  }, [refresh])
  return {
    data: result.key === key ? result.data : null,
    error: result.key === key ? result.error : '',
    loading,
    refresh,
  }
}
