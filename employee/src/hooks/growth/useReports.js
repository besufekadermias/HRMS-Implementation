import { useCallback, useEffect, useRef, useState } from 'react'
import {
  loadReports,
  matchesReportSubmission,
  submitReport,
} from '../../services/growth/reportService.js'
import { useEmployeeStore } from '../../store/index.js'
export default function useReports() {
  const employeeId = useEmployeeStore((state) => state.user?.employeeId)
  const userId = useEmployeeStore((state) => state.user?.id)
  const owner = `${employeeId}:${userId}`
  const [result, setResult] = useState({
    owner: null,
    data: null,
    error: '',
  })
  const [loading, setLoading] = useState(true)
  const controllerRef = useRef(null)
  const mountedRef = useRef(false)
  const savingRef = useRef(false)
  const currentDataRef = useRef(null)
  const refresh = useCallback(async () => {
    if (savingRef.current || useEmployeeStore.getState().reportBusy) {
      return
    }
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setLoading(true)
    try {
      const data = await loadReports(employeeId, userId, controller.signal)
      if (!controller.signal.aborted && mountedRef.current) {
        currentDataRef.current = data
        setResult({
          owner,
          data,
          error: '',
        })
      }
    } catch (error) {
      if (!controller.signal.aborted && mountedRef.current) {
        setResult((state) => ({
          owner,
          data: state.owner === owner ? state.data : null,
          error: error.message,
        }))
      }
    } finally {
      if (!controller.signal.aborted && mountedRef.current) {
        setLoading(false)
      }
    }
  }, [employeeId, userId, owner])
  useEffect(() => {
    mountedRef.current = true
    const initial = window.setTimeout(refresh, 0)
    const onFocus = () => {
      if (document.visibilityState === 'visible') {
        void refresh()
      }
    }
    const poll = window.setInterval(onFocus, 60000)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      mountedRef.current = false
      controllerRef.current?.abort()
      window.clearTimeout(initial)
      window.clearInterval(poll)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [refresh])
  async function save(values, key) {
    if (savingRef.current || useEmployeeStore.getState().reportBusy) {
      throw new Error('A report is already being submitted.')
    }
    if (
      currentDataRef.current?.employeeId !== employeeId ||
      currentDataRef.current?.userId !== userId ||
      !currentDataRef.current?.canSubmit
    ) {
      throw new Error(currentDataRef.current?.message || 'Refresh your reports before submitting.')
    }
    savingRef.current = true
    controllerRef.current?.abort()
    useEmployeeStore.getState().setReportBusy(true)
    try {
      let saved
      try {
        saved = await submitReport(values, key, employeeId, userId)
      } catch (failure) {
        try {
          const data = await loadReports(employeeId, userId)
          if (mountedRef.current) {
            currentDataRef.current = data
            setResult({
              owner,
              data,
              error: '',
            })
          }
          const record = data.records.find((record) => matchesReportSubmission(record, values, key))
          if (record) {
            saved = {
              data,
              record,
            }
          }
        } catch {
          /* Keep the original failure and draft when the receipt cannot be verified. */
        }
        if (!saved) {
          throw failure
        }
      }
      const user = useEmployeeStore.getState().user
      if (user?.id !== userId || user?.employeeId !== employeeId) {
        throw new Error('Your session changed. Sign in again before continuing.')
      }
      if (mountedRef.current) {
        currentDataRef.current = saved.data
        setResult({
          owner,
          data: saved.data,
          error: '',
        })
      }
      return saved.record
    } finally {
      savingRef.current = false
      useEmployeeStore.getState().setReportBusy(false)
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }
  return {
    data: result.owner === owner ? result.data : null,
    error: result.owner === owner ? result.error : '',
    loading,
    refresh,
    save,
  }
}
