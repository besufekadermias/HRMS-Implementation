import { useEffect, useRef, useState } from 'react'
import { loadPayslipPdf } from '../../services/work/payrollService.js'
import { payslipFilename } from '../../utils/formatters/payrollFormat.js'
import { useEmployeeStore } from '../../store/index.js'
export default function usePayslipDownload() {
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const controllerRef = useRef(null)
  const mountedRef = useRef(false)
  const downloadLockRef = useRef(false)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      controllerRef.current?.abort()
    }
  }, [])
  async function download(record) {
    if (downloadLockRef.current || !record.canDownload) {
      return
    }
    const employeeId = useEmployeeStore.getState().user?.employeeId
    if (employeeId !== record.employee.id) {
      setError('Your session changed. Sign in again before downloading.')
      return
    }
    downloadLockRef.current = true
    const controller = new AbortController()
    controllerRef.current = controller
    setBusyId(record.id)
    setError('')
    setSuccess('')
    try {
      const blob = await loadPayslipPdf(record.id, controller.signal)
      if (!mountedRef.current || controller.signal.aborted) {
        return
      }
      if (useEmployeeStore.getState().user?.employeeId !== employeeId) {
        throw new Error('Your session changed. Sign in again before downloading.')
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = payslipFilename(record)
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 10000)
      setSuccess(`Payslip download started for ${record.month}.`)
    } catch (failure) {
      if (mountedRef.current && !controller.signal.aborted) {
        setError(failure.message || 'Your payslip could not be downloaded. Please try again.')
      }
    } finally {
      downloadLockRef.current = false
      if (mountedRef.current) {
        setBusyId(null)
      }
    }
  }
  return {
    busyId,
    error,
    success,
    download,
  }
}
