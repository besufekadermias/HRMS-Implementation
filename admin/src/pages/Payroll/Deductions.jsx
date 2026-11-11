import { useRef, useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import Modal from '../../components/common/Modal.jsx'
import PayrollHeading from '../../components/payroll/PayrollHeading.jsx'
import PayrollLockNotice from '../../components/payroll/PayrollLockNotice.jsx'
import PayrollSummaryCards from '../../components/payroll/PayrollSummaryCards.jsx'
import DeductionsTable from '../../components/payroll/DeductionsTable.jsx'
import AddDeductionModal from '../../components/payroll/AddDeductionModal.jsx'
import { PayrollBreakdown } from '../../components/payroll/PayrollCharts.jsx'
import {
  summarizePayroll,
  monthLabel,
  getPayrollPolicy,
  getPolicyDeduction,
} from '../../services/operations/payrollCalculations.js'

export default function Deductions({
  data,
  month,
  currentMonth,
  months,
  onMonthChange,
  employees,
  onSave,
  onDelete,
  onPolicyChange,
  busy,
  search,
  onSearch,
  onDirtyChange,
}) {
  const [editor, setEditor] = useState(null)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const deletingRef = useRef(false)
  const run = data.runs.find((item) => item.month === month)
  const policy = getPayrollPolicy(data, month)
  const locked = !!run && run.status !== 'GENERATED'
  const totals = summarizePayroll(run)
  const deductions = data.deductions.filter((item) => item.month === month)
  const policyDeductions = ['incomeTax', 'pension']
    .map((type) => ({ ...getPolicyDeduction(policy, type), month }))
    .filter((item) => item.status !== 'deleted')
  const availableEmployees = [...employees]
  for (const row of run?.rows || []) {
    if (
      !availableEmployees.some((employee) => employee.id === row.employeeId)
    ) {
      availableEmployees.push({ id: row.employeeId, name: row.employeeName })
    }
  }
  const query = search.trim().toLowerCase()
  const filtered = [...policyDeductions, ...deductions].filter((item) =>
    `${item.name} ${item.description}`.toLowerCase().includes(query),
  )
  const customActivity = deductions.flatMap((item) =>
    (item.history || []).map((entry) => ({
      ...entry,
      name: item.name,
      id: item.id,
    })),
  )
  const policyActivity = (
    data.monthlyPolicies.find((item) => item.month === month)?.history || []
  ).map((entry) => ({ ...entry, name: entry.note, id: entry.action }))
  const activity = [...customActivity, ...policyActivity]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5)
  function close() {
    setEditor(null)
    onDirtyChange(false)
  }
  async function saveEditor(values) {
    if (editor.deduction?.type) {
      await onPolicyChange({
        ...values,
        type: editor.deduction.type,
        action: 'edit',
      })
    } else {
      await onSave(values)
    }
  }
  async function toggle(item) {
    setError('')
    try {
      if (item.type) {
        await onPolicyChange({
          month,
          type: item.type,
          action: item.active ? 'deactivate' : 'reactivate',
        })
        return
      }
      await onSave({
        id: item.id,
        month,
        name: item.name,
        description: item.description,
        kind: item.kind,
        value: item.value,
        appliesTo: item.appliesTo,
        employeeIds: item.employeeIds,
        active: !item.active,
      })
    } catch (failure) {
      setError(failure?.message || 'The deduction could not be updated.')
    }
  }
  function requestDelete(item) {
    setDeleteError('')
    setDeleteTarget(item)
  }
  function cancelDelete() {
    if (!deletingRef.current) setDeleteTarget(null)
  }
  async function confirmDelete() {
    if (deletingRef.current) return
    deletingRef.current = true
    setDeleting(true)
    setDeleteError('')
    try {
      if (deleteTarget.type) {
        await onPolicyChange({
          type: deleteTarget.type,
          month: deleteTarget.month,
          action: 'delete',
        })
      } else {
        await onDelete({ id: deleteTarget.id, month: deleteTarget.month })
      }
      setDeleteTarget(null)
    } catch (failure) {
      setDeleteError(failure?.message || 'The deduction could not be deleted.')
    } finally {
      deletingRef.current = false
      setDeleting(false)
    }
  }
  return (
    <div className="payroll-page">
      <PayrollHeading
        title="Deductions"
        icon="calculator"
        description="Income tax, pension, and other employee deductions."
        month={month}
        months={months}
        onMonthChange={onMonthChange}
        disabled={busy}
      />
      <PayrollLockNotice
        run={run}
        currentMonth={currentMonth}
        onMonthChange={onMonthChange}
      />
      <PayrollSummaryCards totals={totals} mode="deductions" />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="payroll-two-columns">
        <section className="card payroll-deductions">
          <div className="section-heading">
            <div>
              <h2>
                <Icon name="calculator" /> Deductions List
              </h2>
              <p>Edit or manage deductions for {monthLabel(month)}.</p>
            </div>
            <button
              className="button button-primary"
              disabled={busy || locked}
              aria-describedby={locked ? 'payroll-lock-message' : undefined}
              onClick={() => setEditor({})}
            >
              <Icon name="plus" size={17} />
              Add Deduction
            </button>
          </div>
          <label className="directory-search payroll-deduction-search">
            <Icon name="search" size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search deductions…"
              aria-label="Search deductions"
            />
          </label>
          <DeductionsTable
            deductions={filtered}
            locked={locked}
            busy={busy}
            onEdit={(item) => setEditor({ deduction: item })}
            onToggle={toggle}
            onDelete={requestDelete}
          />
          <p className="payroll-table-note">
            {filtered.length} deductions shown for {monthLabel(month)}.
          </p>
        </section>
        <div className="payroll-aside-stack">
          <PayrollBreakdown
            title="Deduction Summary"
            subtitle="Amounts in this month’s recorded payroll"
            total={totals.totalDeductions}
            items={[
              { name: 'Income tax', amount: totals.incomeTax },
              { name: 'Pension', amount: totals.pension },
              { name: 'Other', amount: totals.otherDeductions },
            ]}
          />
          <section className="card payroll-activity">
            <div className="section-heading">
              <h2>
                <Icon name="clock" /> Recent Activity
              </h2>
            </div>
            {activity.length ? (
              <ol>
                {activity.map((entry, index) => (
                  <li key={`${entry.id}:${index}`}>
                    <span className="icon-circle">
                      <Icon name="check" size={16} />
                    </span>
                    <div>
                      <strong>{entry.name}</strong>
                      <p>{activityLabel(entry.action)}</p>
                      <small>
                        {new Date(entry.at).toLocaleString('en-GB', {
                          timeZone: 'Africa/Addis_Ababa',
                        })}{' '}
                        EAT
                      </small>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="payroll-table-note">
                No deduction changes recorded this month.
              </p>
            )}
          </section>
        </div>
      </div>
      <div className="payroll-info">
        <Icon name="info" />
        <p>
          {run
            ? 'Amounts above come from the saved payroll. Deduction changes update this month’s generated payroll.'
            : 'Deduction amounts will be calculated when you generate payroll.'}{' '}
          Employer pension ({policy.employerPensionRate}%) is an employer cost
          and does not reduce net pay.
        </p>
      </div>
      {editor && (
        <AddDeductionModal
          deduction={editor.deduction}
          month={month}
          employees={availableEmployees}
          onSave={saveEditor}
          onClose={close}
          onDirtyChange={onDirtyChange}
        />
      )}
      {deleteTarget && (
        <Modal
          title="Delete deduction?"
          onClose={cancelDelete}
          className="payroll-deduction-modal"
        >
          <p>
            Delete <strong>{deleteTarget.name}</strong> from{' '}
            {monthLabel(deleteTarget.month)}?
          </p>
          <p className="field-hint">
            Any generated payroll will be updated. Use Deactivate instead if you
            want to apply this deduction again later.
          </p>
          {deleteError && (
            <p className="form-error" role="alert">
              {deleteError}
            </p>
          )}
          <div className="modal-actions">
            <button
              type="button"
              className="button button-secondary"
              disabled={deleting}
              onClick={cancelDelete}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button button-danger"
              disabled={deleting}
              onClick={confirmDelete}
            >
              <Icon name="trash" size={16} />
              {deleting ? 'Deleting…' : 'Delete Deduction'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function activityLabel(action) {
  const labels = {
    CREATED: 'Deduction added',
    UPDATED: 'Deduction updated',
    POLICY_DEDUCTION_EDIT: 'Deduction edited',
    POLICY_DEDUCTION_DELETE: 'Deduction deleted',
    POLICY_DEDUCTION_DEACTIVATE: 'Deduction deactivated',
    POLICY_DEDUCTION_REACTIVATE: 'Deduction reactivated',
  }
  return labels[action] || 'Deduction updated'
}
