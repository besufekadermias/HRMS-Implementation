import { useRef, useState } from 'react'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { monthLabel } from '../../services/operations/payrollCalculations.js'

export default function AddDeductionModal({
  deduction,
  month,
  employees,
  onSave,
  onClose,
  onDirtyChange,
}) {
  // Form state holds editable fields; saved IDs and audit history stay outside it.
  const [values, setValues] = useState(() => ({
    name: deduction?.name ?? '',
    description: deduction?.description ?? '',
    kind: deduction?.kind ?? 'fixed',
    value: deduction?.value ?? '',
    appliesTo: deduction?.appliesTo ?? 'all',
    employeeIds: [...(deduction?.employeeIds ?? [])],
    active: deduction?.active ?? true,
  }))
  const [dirty, setDirty] = useState(false)
  const [discard, setDiscard] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  function change(key, value) {
    setValues((current) => ({ ...current, [key]: value }))
    setDirty(true)
    onDirtyChange(true)
    setError('')
  }
  function close() {
    if (submitting.current) return
    if (dirty) setDiscard(true)
    else onClose()
  }
  function selectEmployee(employeeId, selected) {
    const employeeIds = selected
      ? [...values.employeeIds, employeeId]
      : values.employeeIds.filter((id) => id !== employeeId)
    change('employeeIds', employeeIds)
  }
  function changeCalculation(kind) {
    change('kind', kind)
    if (kind === 'automatic' || values.kind === 'automatic') {
      setValues((current) => ({
        ...current,
        value: kind === 'automatic' ? null : '',
      }))
    }
  }
  async function submit(event) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setSaving(true)
    setError('')
    try {
      // Only editable fields cross the API boundary.
      await onSave({
        id: deduction?.id,
        month,
        name: values.name,
        description: values.description,
        kind: values.kind,
        value: values.value,
        appliesTo: values.appliesTo,
        employeeIds: values.employeeIds,
        active: values.active,
      })
      onClose()
    } catch (failure) {
      setError(failure?.message || 'The deduction could not be saved.')
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }
  if (discard)
    return (
      <ConfirmationModal
        title="Discard deduction changes?"
        confirmLabel="Discard Changes"
        onCancel={() => setDiscard(false)}
        onConfirm={onClose}
      >
        <p>Your deduction changes have not been saved.</p>
      </ConfirmationModal>
    )
  return (
    <Modal
      title={deduction ? 'Edit Deduction' : 'Add Deduction'}
      subtitle={monthLabel(month)}
      onClose={close}
      className="payroll-deduction-modal"
    >
      <form onSubmit={submit} noValidate aria-busy={saving}>
        <fieldset className="leave-form-fieldset" disabled={saving}>
          <div className="employee-fields-grid leave-form-grid">
            <label className="full-width">
              Deduction name <span>*</span>
              <input
                value={values.name}
                maxLength={80}
                required
                onChange={(event) => change('name', event.target.value)}
                placeholder="e.g. Loan repayment"
              />
            </label>
            <label className="full-width">
              Description <span>*</span>
              <textarea
                value={values.description}
                maxLength={300}
                rows={2}
                required
                onChange={(event) => change('description', event.target.value)}
              />
            </label>
            <label>
              Calculation{' '}
              <select
                value={values.kind}
                onChange={(event) => changeCalculation(event.target.value)}
              >
                {deduction?.type === 'incomeTax' && (
                  <option value="automatic">Payroll calculation</option>
                )}
                <option value="fixed">Fixed amount (ETB)</option>
                <option value="percent">Percentage of gross salary</option>
              </select>
            </label>
            {values.kind !== 'automatic' && (
              <label>
                {values.kind === 'fixed' ? 'Amount (ETB)' : 'Rate (%)'}{' '}
                <span>*</span>
                <input
                  type="number"
                  min="0.01"
                  max={values.kind === 'percent' ? 100 : undefined}
                  step="0.01"
                  value={values.value}
                  required
                  onChange={(event) => change('value', event.target.value)}
                />
              </label>
            )}
            <label className="full-width">
              Applies to{' '}
              <select
                value={values.appliesTo}
                onChange={(event) => change('appliesTo', event.target.value)}
              >
                <option value="all">All employees in this payroll</option>
                <option value="selected">Selected employees</option>
              </select>
            </label>
            {values.appliesTo === 'selected' && (
              <fieldset className="payroll-employee-picker full-width">
                <legend>
                  Select employees · {values.employeeIds.length} selected
                </legend>
                {employees.map((employee) => (
                  <label key={employee.id}>
                    <input
                      type="checkbox"
                      checked={values.employeeIds.includes(employee.id)}
                      onChange={(event) =>
                        selectEmployee(employee.id, event.target.checked)
                      }
                    />
                    <span>
                      {employee.name}
                      <small>{employee.id}</small>
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
            <label className="payroll-active-checkbox full-width">
              <input
                type="checkbox"
                checked={values.active}
                onChange={(event) => change('active', event.target.checked)}
              />
              Apply this deduction
            </label>
          </div>
        </fieldset>
        <p className="field-hint">
          Applies to {monthLabel(month)} only. Saving updates this month’s
          generated payroll.
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="button button-secondary"
            disabled={saving}
            onClick={close}
          >
            Cancel
          </button>
          <button className="button button-primary" disabled={saving}>
            <Icon name="check" size={17} />
            {saving ? 'Saving…' : 'Save Deduction'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
