import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import Modal from '../../components/common/Modal.jsx'
import PayrollOverview from './PayrollOverview.jsx'
import Deductions from './Deductions.jsx'
import PayrollReports from './PayrollReports.jsx'
import PayslipModal from '../../components/payroll/PayslipModal.jsx'
import {
  monthLabel,
  payrollMonths,
} from '../../services/operations/payrollCalculations.js'
import { exportPayrollExcel } from '../../services/operations/payrollExport.js'
import { todayInNairobi } from '../../utils/validation/validators.js'

export default function PayrollWorkspace({
  payroll,
  employees,
  page,
  search,
  onSearch,
  onNavigate,
  onDirtyChange,
  today = todayInNairobi(),
}) {
  const currentMonth = today.slice(0, 7)
  const [month, setMonth] = useState(currentMonth)
  const [reportId, setReportId] = useState(null)
  const [slip, setSlip] = useState(null)
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [exporting, setExporting] = useState(false)
  const [generating, setGenerating] = useState(false)
  const run = payroll.data.runs.find((item) => item.month === month)
  function changeMonth(value) {
    setMonth(value)
    setError('')
    setNotice('')
    onSearch('')
  }
  function openReport(id) {
    setReportId(id)
    onSearch('')
    onNavigate('payroll-reports')
  }
  function openGenerateDialog() {
    setError('')
    setConfirm(true)
  }
  function closeGenerateDialog() {
    if (!generating) setConfirm(false)
  }
  async function generate() {
    if (generating) return
    setGenerating(true)
    setError('')
    try {
      await payroll.generate({ month, regenerate: !!run })
      setConfirm(false)
      setNotice(`Payroll for ${monthLabel(month)} generated successfully.`)
    } catch (failure) {
      setError(failure?.message || 'Payroll could not be generated.')
    } finally {
      setGenerating(false)
    }
  }
  async function exportRun(item) {
    if (exporting) return
    setExporting(true)
    setError('')
    setNotice('')
    try {
      await exportPayrollExcel(item)
      setNotice('Excel workbook downloaded. Send it to Finance manually.')
    } catch {
      setError('The Excel file could not be prepared. Please try again.')
    } finally {
      setExporting(false)
    }
  }
  const pageProps = {
    data: payroll.data,
    month,
    currentMonth,
    months: payrollMonths(payroll.data.runs, today),
    onMonthChange: changeMonth,
    search,
    onSearch,
    busy: payroll.saving,
    exporting,
    onExport: exportRun,
    onReport: openReport,
    onPayslip: (item, employee) => setSlip({ run: item, employee }),
  }
  let content
  if (page === 'payroll-deductions') {
    content = (
      <Deductions
        {...pageProps}
        employees={employees}
        onSave={payroll.saveDeduction}
        onDelete={payroll.deleteDeduction}
        onPolicyChange={payroll.changePolicyDeduction}
        onDirtyChange={onDirtyChange}
      />
    )
  } else if (page === 'payroll-reports') {
    content = <PayrollReports {...pageProps} reportId={reportId} />
  } else {
    content = (
      <PayrollOverview
        {...pageProps}
        onNavigate={onNavigate}
        onGenerate={openGenerateDialog}
      />
    )
  }
  return (
    <>
      {!confirm && error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <div className="payroll-success" role="status">
          <Icon name="check-circle" size={18} />
          {notice}
          <button
            className="icon-button"
            aria-label="Dismiss payroll message"
            onClick={() => setNotice('')}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {content}
      {slip && <PayslipModal {...slip} onClose={() => setSlip(null)} />}
      {confirm && (
        <Modal
          title={run ? 'Regenerate Payroll?' : 'Generate Payroll?'}
          subtitle={monthLabel(month)}
          onClose={closeGenerateDialog}
        >
          <p className="dialog-intro">
            Calculate payroll for active employees and employees on leave who
            were hired by the end of this month. The calculation uses their
            current basic salaries, income tax, pension, and this month’s active
            deductions.
          </p>
          <p className="field-hint">
            {run
              ? 'This replaces the generated payroll for this month. Forwarded or paid payroll cannot be changed.'
              : 'This creates a generated payroll and report. Finance handles payment separately.'}
          </p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button
              className="button button-secondary"
              disabled={generating}
              onClick={closeGenerateDialog}
            >
              Cancel
            </button>
            <button
              className="button button-primary"
              disabled={generating}
              onClick={generate}
            >
              <Icon name="check" size={17} />
              {generating ? 'Generating…' : 'Confirm Generation'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
