import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import { useRef, useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import Modal, { ModalActions } from '../../components/common/Modal.jsx'
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
    <div className="payroll-page tw:grid tw:gap-[22px] tw:text-[#153a48] tw:[@media(width<=650px)]:gap-[16px] tw:[&_h1]:text-[#075c53]
           tw:[&_.card]:overflow-hidden tw:[&_.card]:border-[#dfeef2] tw:[&_.payroll-section-heading]:p-[20px_22px]
           tw:[&_.payroll-section-heading]:m-0 tw:[&_.payroll-section-heading]:min-h-[81px]
           tw:[&_.payroll-section-heading]:[border-bottom:1px_solid_#edf4f6]
           tw:[&_.payroll-section-heading]:gap-[15px] tw:[&_.payroll-section-heading_h2]:text-[#075b53]
           tw:[&_.payroll-section-heading_h2]:text-[18px] tw:[&_.payroll-section-heading_h2_svg]:text-[#039482]
           tw:[&_.payroll-section-heading_p]:text-[#69909e] tw:[&_.payroll-section-heading_p]:text-[12px]
           tw:[&_.payroll-section-heading_p]:mt-[6px]
           tw:[@media(width<=650px)]:[&_.payroll-section-heading]:p-[17px]
           tw:[@media(width<=650px)]:[&_.payroll-section-heading]:flex-wrap
           tw:[@media(width<=650px)]:[&_.payroll-search]:max-w-full
           tw:[@media(width<=650px)]:[&_.payroll-search]:w-full">
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
        <p className="payroll-form-error tw:mt-[16px] tw:text-[13px] tw:rounded-[5px] tw:p-[10px_12px] tw:leading-[1.6] tw:text-[#b42344]
          tw:bg-[#fff0f3]" role="alert">
          {error}
        </p>
      )}
      <div className="payroll-two-columns tw:grid tw:grid-cols-[minmax(0,_1.8fr)_minmax(290px,_1fr)] tw:gap-[20px] tw:[align-items:start]
          tw:min-[1550px]:grid-cols-[minmax(0,_1.8fr)_minmax(400px,_1fr)]
          tw:[@media(width<=1250px)]:grid-cols-[minmax(0,_1fr)]">
        <Card className="payroll-deductions">
          <div className="payroll-section-heading tw:flex tw:justify-between tw:items-start tw:[&_h2]:flex tw:[&_h2]:items-center
          tw:[&_h2]:gap-[9px] tw:[&_p]:leading-[1.5]">
            <div>
              <h2>
                <Icon name="calculator" /> Deductions List
              </h2>
              <p>Edit or manage deductions for {monthLabel(month)}.</p>
            </div>
            <Button
              disabled={busy || locked}
              aria-describedby={locked ? 'payroll-lock-message' : undefined}
              onClick={() => setEditor({})}
            >
              <Icon name="plus" size={17} />
              Add Deduction
            </Button>
          </div>
          <label className="payroll-search tw:flex tw:items-center tw:gap-[8px] tw:min-w-[190px] tw:flex-[1_1_240px] tw:border tw:border-solid
          tw:border-border tw:rounded-[6px] tw:p-[9px_10px] tw:text-[#658da0] tw:h-[38px]
          tw:focus-within:[outline:2px_solid_var(--primary)] tw:focus-within:outline-offset-[2px]
          tw:[&_input]:w-full tw:[&_input]:min-w-0 tw:[&_input]:[border:0] tw:[&_input]:[outline:0]
          tw:[&_input]:text-[10px] tw:[&_input]:text-text-primary tw:[&_input]:bg-transparent
          tw:[&_input::placeholder]:text-[#628097] tw:[@media(width<768px)]:basis-full payroll-deduction-search
          tw:m-[14px_22px] tw:max-w-[350px] tw:[@media(width<=650px)]:w-[calc(100%_-_34px)]!
          tw:[@media(width<=650px)]:m-[14px_17px]">
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
          <p className="payroll-table-note tw:p-[18px_22px] tw:text-[#7795a1] tw:text-[12px] tw:leading-[1.7]">
            {filtered.length} deductions shown for {monthLabel(month)}.
          </p>
        </Card>
        <div className="payroll-aside-stack tw:grid tw:gap-[20px] tw:min-w-0">
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
          <Card className="payroll-activity tw:[&_ol]:p-[0_22px] tw:[&_ol]:m-0 tw:[&_ol]:list-none tw:[&_li]:flex tw:[&_li]:gap-[12px]
          tw:[&_li]:p-[17px_0] tw:[&_li]:[border-bottom:1px_solid_#edf4f6] tw:[&_.payroll-icon]:w-[31px]
          tw:[&_.payroll-icon]:h-[31px] tw:[&_.payroll-icon]:flex-[0_0_31px] tw:[&_strong]:text-[12px]
          tw:[&_p]:text-[#7798a5] tw:[&_p]:text-[11px] tw:[&_p]:mt-[5px] tw:[&_p]:block tw:[&_small]:text-[#7798a5]
          tw:[&_small]:text-[11px] tw:[&_small]:mt-[5px] tw:[&_small]:block">
            <div className="payroll-section-heading tw:flex tw:justify-between tw:items-start tw:[&_h2]:flex tw:[&_h2]:items-center
          tw:[&_h2]:gap-[9px] tw:[&_p]:leading-[1.5]">
              <h2>
                <Icon name="clock" /> Recent Activity
              </h2>
            </div>
            {activity.length ? (
              <ol>
                {activity.map((entry, index) => (
                  <li key={`${entry.id}:${index}`}>
                    <span className="payroll-icon tw:inline-flex tw:items-center tw:justify-center tw:shrink-0 tw:rounded-full tw:w-[46px] tw:h-[46px]">
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
              <p className="payroll-table-note tw:p-[18px_22px] tw:text-[#7795a1] tw:text-[12px] tw:leading-[1.7]">
                No deduction changes recorded this month.
              </p>
            )}
          </Card>
        </div>
      </div>
      <div className="payroll-info tw:flex tw:items-start tw:gap-[12px] tw:p-[18px_22px] tw:bg-[#e8f8f4] tw:[border:1px_solid_#d2eee8]
          tw:rounded-[10px] tw:text-[#517f8c] tw:text-[12px] tw:leading-[1.7] tw:[&>svg]:text-[#079b87]
          tw:[&>svg]:mt-[2px]">
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
          className="payroll-deduction-modal tw:[&.modal]:w-[min(560px,calc(100vw-24px))] tw:[&.modal]:max-h-[calc(100dvh-32px)]
            tw:[&_.modal-inner]:p-[20px] tw:[&_.modal-heading]:pb-[12px] tw:[&_.modal-heading]:mb-[14px]
            tw:[&_.modal-heading_h2]:text-[19px] tw:[&_.modal-actions]:mt-[14px] tw:[&_.modal-actions]:pt-[14px]"
        >
          <p>
            Delete <strong>{deleteTarget.name}</strong> from{' '}
            {monthLabel(deleteTarget.month)}?
          </p>
          <p className="payroll-field-hint tw:block tw:text-[10px] tw:font-normal tw:text-[var(--text-muted)] tw:mt-[7px]">
            Any generated payroll will be updated. Use Deactivate instead if you
            want to apply this deduction again later.
          </p>
          {deleteError && (
            <p className="payroll-form-error tw:mt-[16px] tw:text-[13px] tw:rounded-[5px] tw:p-[10px_12px] tw:leading-[1.6] tw:text-[#b42344]
          tw:bg-[#fff0f3]" role="alert">
              {deleteError}
            </p>
          )}
          <ModalActions >
            <Button variant="secondary"
              type="button"
              disabled={deleting}
              onClick={cancelDelete}
            >
              Cancel
            </Button>
            <Button variant="danger"
              type="button"
              disabled={deleting}
              onClick={confirmDelete}
            >
              <Icon name="trash" size={16} />
              {deleting ? 'Deleting…' : 'Delete Deduction'}
            </Button>
          </ModalActions>
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
