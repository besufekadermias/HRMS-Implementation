import { useCallback, useEffect, useRef, useState } from 'react'
import {
  loadLeave,
  matchesLeaveSubmission,
  submitLeaveRequest,
} from '../../services/work/leaveService.js'
import { useEmployeeStore } from '../../store/index.js'
export default function useLeave() {
  const employeeId = useEmployeeStore((state) => state.user?.employeeId)
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
    if (savingRef.current || useEmployeeStore.getState().leaveBusy) {
      return
    }
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setLoading(true)
    try {
      const data = await loadLeave(employeeId, controller.signal)
      if (!controller.signal.aborted && mountedRef.current) {
        currentDataRef.current = data
        setResult({
          owner: employeeId,
          data,
          error: '',
        })
      }
    } catch (error) {
      if (!controller.signal.aborted && mountedRef.current) {
        setResult((state) => ({
          owner: employeeId,
          data: state.owner === employeeId ? state.data : null,
          error: error.message,
        }))
      }
    } finally {
      if (!controller.signal.aborted && mountedRef.current) {
        setLoading(false)
      }
    }
  }, [employeeId])
  useEffect(() => {
    mountedRef.current = true
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
      mountedRef.current = false
      controllerRef.current?.abort()
      window.clearTimeout(timer)
      window.clearInterval(poll)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [refresh])
  async function save(values, key) {
    if (savingRef.current || useEmployeeStore.getState().leaveBusy) {
      throw new Error('A leave request is already being submitted.')
    }
    if (!currentDataRef.current || currentDataRef.current.employeeId !== employeeId) {
      throw new Error('Refresh your leave data before submitting.')
    }
    savingRef.current = true
    controllerRef.current?.abort()
    useEmployeeStore.getState().setLeaveBusy(true)
    try {
      let saved
      try {
        saved = await submitLeaveRequest(values, key, employeeId, currentDataRef.current)
      } catch (failure) {
        // A lost response can follow a persisted request. The receipt key confirms the exact submission.
        try {
          const refreshed = await loadLeave(employeeId)
          if (mountedRef.current) {
            currentDataRef.current = refreshed
            setResult({
              owner: employeeId,
              data: refreshed,
              error: '',
            })
          }
          const found = refreshed.requests.find(
            (record) =>
              record.status === 'PENDING' &&
              record.dayCounting &&
              matchesLeaveSubmission(record, values, key),
          )
          if (found) {
            saved = {
              data: refreshed,
              record: found,
            }
          }
        } catch {
          /* Retain the original submission failure and form values. */
        }
        if (!saved) {
          throw failure
        }
      }
      if (useEmployeeStore.getState().user?.employeeId !== employeeId) {
        throw new Error('Your session changed. Sign in again before continuing.')
      }
      if (mountedRef.current) {
        currentDataRef.current = saved.data
        setResult({
          owner: employeeId,
          data: saved.data,
          error: '',
        })
      }
      return saved.record
    } finally {
      savingRef.current = false
      useEmployeeStore.getState().setLeaveBusy(false)
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }
  return {
    data: result.owner === employeeId ? result.data : null,
    error: result.owner === employeeId ? result.error : '',
    loading,
    refresh,
    save,
  }
}
