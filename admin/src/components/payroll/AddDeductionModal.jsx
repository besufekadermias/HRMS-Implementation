import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getDeductionFormSchema } from '../../utils/validation/operationsSchemas.js'
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
  const { register, control, handleSubmit, setValue, clearErrors,
    formState: { errors, isDirty: dirty, isSubmitting: saving },
  } = useForm({
    defaultValues: {
      name: deduction?.name ?? '', description: deduction?.description ?? '',
      kind: deduction?.kind ?? 'fixed', value: deduction?.value ?? '',
      appliesTo: deduction?.appliesTo ?? 'all', employeeIds: [...(deduction?.employeeIds ?? [])],
      active: deduction?.active ?? true,
    },
    resolver: zodResolver(getDeductionFormSchema(deduction?.type === 'incomeTax'), undefined, { raw: true }),
    shouldFocusError: false,
  })
  const values = useWatch({ control })
  const [discard, setDiscard] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const formRef = useRef(null)

  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])

  function fieldProps(name) {
    return { ...register(name, { onChange: () => { clearErrors(name); setError('') } }),
      'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `deduction-${name}-error` : undefined }
  }
  function fieldError(name) {
    return errors[name] && <small className="field-error" id={`deduction-${name}-error`}>{errors[name].message}</small>
  }
  function invalid(nextErrors) {
    formRef.current?.querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus()
  }
  function close() {
    if (saving || submitting.current) return
    if (dirty) setDiscard(true)
    else onClose()
  }
  function selectEmployee(employeeId, selected) {
    setValue('employeeIds', selected
      ? [...values.employeeIds, employeeId]
      : values.employeeIds.filter((id) => id !== employeeId), { shouldDirty: true })
    clearErrors('employeeIds')
    setError('')
  }
  function changeCalculation(event) {
    const kind = event.target.value
    if (kind === 'automatic' || values.kind === 'automatic') {
      setValue('value', kind === 'automatic' ? null : '', { shouldDirty: true })
      clearErrors('value')
    }
    clearErrors('kind')
    setError('')
  }
  async function submit(values) {
    if (submitting.current) return
    submitting.current = true
    setError('')
    try {
      // Saved identity comes from the current deduction, never editable inputs.
      await onSave({ ...values, id: deduction?.id, month })
      onClose()
    } catch (failure) {
      setError(failure?.message || 'The deduction could not be saved.')
    } finally {
      submitting.current = false
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
      <form ref={formRef} onSubmit={(event) => handleSubmit(submit, invalid)(event)} noValidate aria-busy={saving}>
        <fieldset className="leave-form-fieldset" disabled={saving}>
          <div className="employee-fields-grid leave-form-grid">
            <label className="full-width">
              Deduction name <span>*</span>
              <input
                {...fieldProps('name')}
                maxLength={80}
                required
                placeholder="e.g. Loan repayment"
              />{fieldError('name')}
            </label>
            <label className="full-width">
              Description <span>*</span>
              <textarea
                {...fieldProps('description')}
                maxLength={300}
                rows={2}
                required
              />{fieldError('description')}
            </label>
            <label>
              Calculation{' '}
              <select
                {...register('kind', { onChange: changeCalculation })}
                aria-invalid={!!errors.kind}
              >
                {deduction?.type === 'incomeTax' && (
                  <option value="automatic">Payroll calculation</option>
                )}
                <option value="fixed">Fixed amount (ETB)</option>
                <option value="percent">Percentage of gross salary</option>
              </select>{fieldError('kind')}
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
                  {...fieldProps('value')}
                  required
                />{fieldError('value')}
              </label>
            )}
            <label className="full-width">
              Applies to{' '}
              <select
                {...fieldProps('appliesTo')}
              >
                <option value="all">All employees in this payroll</option>
                <option value="selected">Selected employees</option>
              </select>{fieldError('appliesTo')}
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
                      name="employeeIds"
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
                {fieldError('employeeIds')}
              </fieldset>
            )}
            <label className="payroll-active-checkbox full-width">
              <input
                type="checkbox"
                {...fieldProps('active')}
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
