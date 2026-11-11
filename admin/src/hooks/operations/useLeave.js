import { useEffect, useRef, useState } from 'react'
import leaveApi, { validateLeaveResponse } from '../../services/operations/leaveApi.js'
import { getLeaveYear, needsLeaveRefresh } from '../../services/operations/leaveYear.js'

// Pages receive data and save callbacks. Only the data service knows how to load/save.
export default function useLeave(employees, { enabled = true, api = leaveApi } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadVersion, setLoadVersion] = useState(0)
  const currentData = useRef(null)
  const savingRef = useRef(false)
  const employeeRenames = useRef([])

  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    async function load() {
      try {
        let next = validateLeaveResponse(await api.load())
        if (cancelled) return
        for (const [oldId, newId] of employeeRenames.current) {
          next = remapEmployeeReferences(next, oldId, newId)
        }
        employeeRenames.current = []
        currentData.current = next
        setData(next)
        setLoadError('')
      } catch (error) {
        if (!cancelled) setLoadError(error?.message || 'Leave data could not be loaded. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [api, enabled, loadVersion])

  useEffect(() => {
    if (!enabled || loading) return undefined
    let cancelled = false
    let refreshing = false
    let timer
    async function refreshYear() {
      const previous = currentData.current
      if (!cancelled && needsLeaveRefresh(previous, employees) && !savingRef.current && !refreshing) {
        refreshing = true
        try {
          const next = validateLeaveResponse(await api.refresh({ data: previous, employees }))
          // Ignore a background response if a save, rename, or reload has intervened.
          if (!cancelled && !savingRef.current && currentData.current === previous) {
            currentData.current = next
            setData(next)
            setLoadError('')
          }
        } catch (error) {
          if (!cancelled && !savingRef.current && currentData.current === previous) {
            setLoadError(error?.message || 'Leave balances could not be refreshed. Please try again.')
          }
        } finally {
          refreshing = false
        }
      }
    }
    async function tick() {
      await refreshYear()
      if (cancelled) return
      // Wake at Ethiopian midnight on Meskerem 1, with a minute fallback for
      // suspended tabs, clock changes, and a save in progress at the boundary.
      const untilNewYear = Date.parse(`${getLeaveYear().nextStart}T00:00:00+03:00`) - Date.now()
      timer = window.setTimeout(tick, Math.max(1, Math.min(60000, untilNewYear)))
    }
    tick()
    window.addEventListener('focus', refreshYear)
    document.addEventListener('visibilitychange', refreshYear)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      window.removeEventListener('focus', refreshYear)
      document.removeEventListener('visibilitychange', refreshYear)
    }
  }, [api, enabled, employees, loading])

  async function save(method, input) {
    if (savingRef.current) throw new Error('A leave change is already being saved.')
    if (!currentData.current) throw new Error('Wait for leave data to load before saving.')
    savingRef.current = true
    setSaving(true)
    try {
      // Ordinary saves need only the mutation response. Refresh first only when
      // the year/roster changed, so a rejected stale form keeps the renewed year.
      if (method !== 'refresh' && needsLeaveRefresh(currentData.current, employees)) {
        const renewed = validateLeaveResponse(await api.refresh({ data: currentData.current, employees }))
        currentData.current = renewed
        setData(renewed)
        setLoadError('')
      }
      const context = { data: currentData.current, employees }
      const result = method === 'refresh' ? await api.refresh(context) : await api[method](input, context)
      const next = validateLeaveResponse(result)
      // Never deduct again locally after the API has returned an updated balance.
      currentData.current = next
      setData(next)
      setLoadError('')
      return next
    } catch (error) {
      if (method === 'refresh') setLoadError(error?.message || 'Leave balances could not be refreshed. Please try again.')
      throw error
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  function reload() {
    if (savingRef.current) return
    currentData.current = null
    setData(null)
    setLoadError('')
    setLoading(true)
    setLoadVersion((version) => version + 1)
  }

  function remapEmployeeId(oldId, newId) {
    // Local roster edits use serial numbers. Live integration should use stable IDs.
    if (currentData.current) {
      const next = remapEmployeeReferences(currentData.current, oldId, newId)
      currentData.current = next
      setData(next)
    } else employeeRenames.current.push([oldId, newId])
  }

  return {
    data,
    loading,
    loadError,
    saving,
    isSaving: () => savingRef.current,
    reload,
    async retryRefresh() {
      try { await save('refresh') } catch { /* Keep saved data; the refresh error is shown above the page. */ }
    },
    reset() {
      employeeRenames.current = []
      reload()
    },
    remapEmployeeId,
    saveRequest: (input) => save('saveRequest', input),
    decideRequest: (input) => save('decideRequest', input),
    saveSettings: (input) => save('saveSettings', input),
    saveEntitlement: (input) => save('saveEntitlement', input),
  }
}

function remapEmployeeReferences(data, oldId, newId) {
  return {
    ...data,
    requests: data.requests.map((request) => request.employeeId === oldId ? { ...request, employeeId: newId } : request),
    balances: data.balances.map((balance) => balance.employeeId === oldId ? { ...balance, employeeId: newId } : balance),
  }
}
