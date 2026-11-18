import Button from '../common/Button.jsx'
import { FormInput, FormTextarea, FormSelect } from '../common/FormFields.jsx'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getDeductionFormSchema } from '../../utils/validation/operationsSchemas.js'
import Modal, { ModalActions } from '../common/Modal.jsx'
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
    return errors[name] && <small className="payroll-field-error tw:block tw:text-[11px] tw:font-normal tw:text-[#b33450] tw:mt-[7px] tw:leading-[1.6]" id={`deduction-${name}-error`}>{errors[name].message}</small>
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
      className="payroll-deduction-modal tw:[&.modal]:w-[min(560px,calc(100vw-24px))] tw:[&.modal]:max-h-[calc(100dvh-32px)]
        tw:[&_.modal-inner]:p-[20px] tw:[&_.modal-heading]:pb-[12px] tw:[&_.modal-heading]:mb-[14px]
        tw:[&_.modal-heading_h2]:text-[19px] tw:[&_.modal-actions]:mt-[14px] tw:[&_.modal-actions]:pt-[14px]"
    >
      <form ref={formRef} onSubmit={(event) => handleSubmit(submit, invalid)(event)} noValidate aria-busy={saving}>
        <fieldset className="leave-form-fieldset tw:[border:0] tw:p-0 tw:m-0 tw:min-w-0" disabled={saving}>
          <div className="payroll-fields-grid tw:grid tw:grid-cols-[repeat(2,minmax(0,1fr))] tw:[&>label]:block tw:[&>label]:text-[#48655f]
          tw:[&>label]:text-[11px] tw:[&>label]:font-[650] tw:[&>label]:leading-[1.5]
          tw:[&>label>span]:text-[#b65265] tw:gap-[12px_14px] tw:[margin-block:0_12px]
          tw:[@media(width<768px)]:grid-cols-1 tw:[@media(width<768px)]:[&_input]:text-[16px]
          tw:[@media(width<768px)]:[&_select]:text-[16px] tw:[@media(width<768px)]:[&_textarea]:text-[16px]
          tw:[&_input:not([type=checkbox])]:h-[38px] tw:[&_input:not([type=checkbox])]:mt-[5px]
          tw:[&_input:not([type=checkbox])]:p-[8px_10px] tw:[&_select]:w-full tw:[&_select]:h-[38px]
          tw:[&_select]:mt-[5px] tw:[&_select]:p-[8px_10px] tw:[&_textarea]:w-full tw:[&_textarea]:min-h-[60px]
          tw:[&_textarea]:h-[60px] tw:[&_textarea]:mt-[5px] tw:[&_textarea]:p-[8px_10px] tw:[&_textarea]:resize-y
          tw:[&_input[type=checkbox]]:inline-block tw:[&_input[type=checkbox]]:w-[16px]
          tw:[&_input[type=checkbox]]:h-[16px] tw:[&_input[type=checkbox]]:min-h-[16px]
          tw:[&_input[type=checkbox]]:min-w-[16px] tw:[&_input[type=checkbox]]:flex-[0_0_16px]
          tw:[&_input[type=checkbox]]:p-0 tw:[&_input[type=checkbox]]:m-0
          tw:[&_input[type=checkbox]]:accent-[#078775]">
            <label className="tw:col-span-full">
              Deduction name <span>*</span>
              <FormInput variant="employee"
                {...fieldProps('name')}
                maxLength={80}
                required
                placeholder="e.g. Loan repayment"
              />{fieldError('name')}
            </label>
            <label className="tw:col-span-full">
              Description <span>*</span>
              <FormTextarea variant="employee"
                {...fieldProps('description')}
                maxLength={300}
                rows={2}
                required
              />{fieldError('description')}
            </label>
            <label>
              Calculation{' '}
              <FormSelect variant="employee"
                {...register('kind', { onChange: changeCalculation })}
                aria-invalid={!!errors.kind}
              >
                {deduction?.type === 'incomeTax' && (
                  <option value="automatic">Payroll calculation</option>
                )}
                <option value="fixed">Fixed amount (ETB)</option>
                <option value="percent">Percentage of gross salary</option>
              </FormSelect>{fieldError('kind')}
            </label>
            {values.kind !== 'automatic' && (
              <label>
                {values.kind === 'fixed' ? 'Amount (ETB)' : 'Rate (%)'}{' '}
                <span>*</span>
                <FormInput variant="employee"
                  type="number"
                  min="0.01"
                  max={values.kind === 'percent' ? 100 : undefined}
                  step="0.01"
                  {...fieldProps('value')}
                  required
                />{fieldError('value')}
              </label>
            )}
            <label className="tw:col-span-full">
              Applies to{' '}
              <FormSelect variant="employee"
                {...fieldProps('appliesTo')}
              >
                <option value="all">All employees in this payroll</option>
                <option value="selected">Selected employees</option>
              </FormSelect>{fieldError('appliesTo')}
            </label>
            {values.appliesTo === 'selected' && (
              <fieldset className="payroll-employee-picker tw:col-span-full tw:max-h-[152px] tw:overflow-auto tw:[border:1px_solid_#dcebee]
          tw:rounded-[8px] tw:p-[8px_10px] tw:[&_legend]:text-[12px] tw:[&_legend]:text-[#587d8b] tw:[&_label]:flex
          tw:[&_label]:gap-[10px] tw:[&_label]:items-center tw:[&_label]:justify-start tw:[&_label]:min-h-[38px]
          tw:[&_label]:p-[5px_0] tw:[&_label]:text-[12px] tw:[&_label]:cursor-pointer tw:[&_small]:block
          tw:[&_small]:text-[#7694a1] tw:[&_small]:mt-[2px] tw:[&_small]:text-[10px]">
                <legend>
                  Select employees · {values.employeeIds.length} selected
                </legend>
                {employees.map((employee) => (
                  <label key={employee.id}>
                    <FormInput variant="employee"
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
            <label className="payroll-active-checkbox tw:col-span-full tw:flex! tw:flex-row! tw:items-center tw:gap-[10px]">
              <FormInput variant="employee"
                type="checkbox"
                {...fieldProps('active')}
              />
              Apply this deduction
            </label>
          </div>
        </fieldset>
        <p className="payroll-field-hint tw:block tw:text-[10px] tw:font-normal tw:text-[var(--text-muted)] tw:mt-[7px]">
          Applies to {monthLabel(month)} only. Saving updates this month’s
          generated payroll.
        </p>
        {error && (
          <p className="payroll-form-error tw:mt-[16px] tw:text-[13px] tw:rounded-[5px] tw:p-[10px_12px] tw:leading-[1.6] tw:text-[#b42344]
          tw:bg-[#fff0f3]" role="alert">
            {error}
          </p>
        )}
        <ModalActions >
          <Button variant="secondary"
            type="button"
            disabled={saving}
            onClick={close}
          >
            Cancel
          </Button>
          <Button disabled={saving}>
            <Icon name="check" size={17} />
            {saving ? 'Saving…' : 'Save Deduction'}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
