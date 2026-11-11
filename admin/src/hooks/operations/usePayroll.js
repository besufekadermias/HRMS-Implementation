import { useEffect, useRef, useState } from 'react'
import payrollApi from '../../services/operations/payrollApi.js'
import { validatePayrollResponse } from '../../services/operations/payrollValidation.js'

export default function usePayroll(
  employees,
  { enabled = true, api = payrollApi } = {},
) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [version, setVersion] = useState(0)
  const savingRef = useRef(false)
  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    async function load() {
      try {
        const next = validatePayrollResponse(await api.load())
        if (!cancelled) {
          setData(next)
          setError('')
        }
      } catch (failure) {
        if (!cancelled)
          setError(failure?.message || 'Payroll could not be loaded.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [api, enabled, version])

  async function save(method, input) {
    if (savingRef.current)
      throw new Error('A payroll change is already being saved.')
    if (!data) throw new Error('Wait for payroll to load before saving.')
    savingRef.current = true
    setSaving(true)
    try {
      const next = validatePayrollResponse(
        await api[method](input, { data, employees }),
      )
      setData(next)
      return next
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }
  function reset() {
    if (savingRef.current) return
    setData(null)
    setError('')
    setLoading(true)
    setVersion((value) => value + 1)
  }
  return {
    data,
    loading,
    error,
    saving,
    isSaving: () => savingRef.current,
    reset,
    generate: (input) => save('generate', input),
    saveDeduction: (input) => save('saveDeduction', input),
    deleteDeduction: (input) => save('deleteDeduction', input),
    changePolicyDeduction: (input) => save('changePolicyDeduction', input),
  }
}
