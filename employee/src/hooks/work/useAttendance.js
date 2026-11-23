import { useCallback, useEffect, useRef, useState } from 'react'
import { loadAttendance, recordAttendance } from '../../services/work/attendanceService.js'
import { useEmployeeStore } from '../../store/index.js'
export default function useAttendance(initial = null) {
  const [state, setState] = useState(initial)
  const [loading, setLoading] = useState(!initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [revision, setRevision] = useState(0)
  const mountedRef = useRef(true)
  const submissionLockRef = useRef(false)
  const requestVersionRef = useRef(0)
  const refresh = useCallback(async (preserveError = false) => {
    if (submissionLockRef.current) {
      return
    }
    const version = ++requestVersionRef.current
    try {
      const updated = await loadAttendance()
      if (mountedRef.current && version === requestVersionRef.current) {
        setState(updated)
        if (preserveError !== true) {
          setError('')
        }
      }
    } catch (error) {
      if (mountedRef.current && version === requestVersionRef.current) {
        setError(error.message)
        setState(null)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [])
  useEffect(() => {
    mountedRef.current = true
    requestVersionRef.current++
    const initialRefresh = window.setTimeout(refresh, 0)
    // Revalidate the network, settings, and end-time eligibility on the server.
    const timer = window.setInterval(refresh, 15000)
    const onFocus = () => {
      if (document.visibilityState === 'visible') {
        void refresh()
      }
    }
    document.addEventListener('visibilitychange', onFocus)
    window.addEventListener('focus', onFocus)
    return () => {
      mountedRef.current = false
      window.clearTimeout(initialRefresh)
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onFocus)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])
  useEffect(() => {
    if (!state?.record?.checkIn || state.record.checkOut || state.canCheckOut) {
      return
    }
    const remaining = Date.parse(state.checkoutAt) - Date.parse(state.serverTime)
    if (remaining <= 0) {
      return
    }
    const timer = window.setTimeout(refresh, Math.min(remaining + 100, 2147483647))
    return () => window.clearTimeout(timer)
  }, [state, refresh])
  async function submit(requestedAction) {
    if (
      submissionLockRef.current ||
      useEmployeeStore.getState().attendanceBusy ||
      !state?.configured ||
      !state.ipAuthorized
    ) {
      return
    }
    const action =
      typeof requestedAction === 'string'
        ? requestedAction
        : state.canCheckIn
          ? 'check-in'
          : 'check-out'
    if (
      (action === 'check-in' && !state.canCheckIn) ||
      (action === 'check-out' && !state.canCheckOut) ||
      !['check-in', 'check-out'].includes(action)
    ) {
      return
    }
    submissionLockRef.current = true
    useEmployeeStore.getState().setAttendanceBusy(true)
    requestVersionRef.current++
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await recordAttendance(action)
      if (mountedRef.current) {
        setState(updated)
        setSuccess(
          action === 'check-in'
            ? 'Check-in recorded successfully.'
            : 'Check-out recorded successfully.',
        )
      }
    } catch (error) {
      if (mountedRef.current) {
        setError(error.message)
        setState(null)
      }
    } finally {
      submissionLockRef.current = false
      useEmployeeStore.getState().setAttendanceBusy(false)
      if (mountedRef.current) {
        setSaving(false)
        setRevision((value) => value + 1)
        void refresh(true)
      }
    }
  }
  return {
    state,
    loading,
    saving,
    error,
    success,
    revision,
    refresh,
    submit,
  }
}
