import Button from '../common/Button.jsx'
import { FormSelect, FormInput, FormTextarea } from '../common/FormFields.jsx'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leaveRequestFormSchema } from '../../utils/validation/operationsSchemas.js'
import Modal, { ModalActions } from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { countLeaveDays, getLeaveBalance } from '../../services/operations/leaveService.js'

export default function LeaveRequestModal({ request, employees, balances, settings, onSave, onClose, onDirtyChange }) {
  const { register, control, handleSubmit, clearErrors,
    formState: { errors, isDirty: dirty, isSubmitting: saving },
  } = useForm({
    defaultValues: {
      employeeId: request?.employeeId || '', startDate: request?.startDate || '',
      endDate: request?.endDate || '', reason: request?.reason || '',
    },
    resolver: zodResolver(leaveRequestFormSchema, undefined, { raw: true }),
  })
  const values = useWatch({ control })
  const days = countLeaveDays(values.startDate, values.endDate, settings.dayCounting)
  const balance = getLeaveBalance(balances.find((item) => item.employeeId === values.employeeId))
  const [discard, setDiscard] = useState(false)
  const [error, setErrorMessage] = useState('')
  const submitting = useRef(false)

  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])

  function fieldProps(name) {
    return { ...register(name, { onChange: () => { clearErrors(name); setErrorMessage('') } }),
      'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `leave-${name}-error` : undefined }
  }
  function fieldError(name) {
    return errors[name] && <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id={`leave-${name}-error`}>{errors[name].message}</small>
  }

  function close() {
    if (saving || submitting.current) return
    if (dirty) setDiscard(true)
    else onClose()
  }
  async function submit(values) {
    if (submitting.current) return
    setErrorMessage('')
    submitting.current = true
    try {
      await onSave({ ...values, ...(request ? { id: request.id } : {}) })
      onClose()
    } catch (error) {
      setErrorMessage(error?.message || 'The request could not be saved.')
    } finally {
      submitting.current = false
    }
  }
  if (discard) return <ConfirmationModal title="Discard request changes?" confirmLabel="Discard Changes"
    onCancel={() => setDiscard(false)} onConfirm={onClose}><p>Your request changes have not been saved.</p></ConfirmationModal>

  return <Modal title={request ? 'Edit Leave Request' : 'New Leave Request'} subtitle="Record a request on behalf of an employee" onClose={close}>
    <form onSubmit={(event) => handleSubmit(submit)(event)} noValidate aria-busy={saving}>
      <fieldset className="leave-form-fieldset tw:[border:0] tw:p-0 tw:m-0 tw:min-w-0" disabled={saving}>
        <div className="employee-fields-grid tw:my-[16px] tw:grid-cols-2 tw:[&_select]:w-full tw:[&_textarea]:w-full tw:[&_textarea]:h-auto
          tw:[&_textarea]:min-h-[95px] tw:[&_textarea]:resize-y tw:max-[768px]:grid-cols-1
          tw:max-[768px]:[&_input]:text-[16px] tw:max-[768px]:[&_select]:text-[16px]
          tw:max-[768px]:[&_textarea]:text-[16px] tw:shared-base:grid
          tw:shared-base:grid-cols-[repeat(3,_minmax(0,_1fr))] tw:shared-base:gap-[23px_22px]
          tw:shared-base:[&_>_label]:block tw:shared-base:[&_>_label]:[color:#48655f]
          tw:shared-base:[&_>_label]:text-[11px] tw:shared-base:[&_>_label]:font-[650]
          tw:shared-base:[&_>_label]:leading-[1.5]
          tw:shared-base:[&_>_label_>_span:not(.password-field)]:[color:#b65265]
          tw:shared-base:[&_.span-two]:col-[span_2] tw:max-[1100px]:shared-base:gap-[20px_17px]
          tw:max-[768px]:shared-base:grid-cols-[repeat(2,_minmax(0,_1fr))]
          tw:max-[768px]:shared-base:[&_.span-two]:col-[1_/_-1]
          tw:max-[560px]:shared-base:grid-cols-[minmax(0,_1fr)]
          tw:max-[560px]:shared-base:[&_.span-two]:col-[auto]
          tw:max-[560px]:shared-base:[&_>_label]:text-[11px]">
          <label className="full-width tw:shared-base:col-[1_/_-1]">Employee <span>*</span>
            <FormSelect variant="employee" {...fieldProps('employeeId')} required disabled={!!request}>
              <option value="">Select an employee</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.id}</option>)}
            </FormSelect>{fieldError('employeeId')}
          </label>
          <label>Start date <span>*</span><FormInput variant="employee" type="date" {...fieldProps('startDate')} required />{fieldError('startDate')}</label>
          <label>End date <span>*</span><FormInput variant="employee" type="date" {...fieldProps('endDate')} required min={values.startDate || undefined} />{fieldError('endDate')}</label>
          <label className="full-width tw:shared-base:col-[1_/_-1]">Reason <span>*</span><FormTextarea variant="employee" rows={3} {...fieldProps('reason')} required maxLength={1000} />{fieldError('reason')}</label>
        </div>
      </fieldset>
      <div className="leave-request-preview tw:grid tw:gap-[7px] tw:p-[15px] tw:my-[16px] tw:bg-[#f1f8f5] tw:rounded-[8px] tw:text-[12px]
          tw:text-text-secondary tw:[&_strong]:text-[15px] tw:[&_strong]:text-text-primary" role="status">
        <strong>{days} {days === 1 ? 'day' : 'days'} requested</strong>
        <span>{settings.dayCounting === 'calendar' ? 'Calendar days, including weekends' : 'Monday–Friday only; public holidays are not excluded'}</span>
        <span>{balance ? `${balance.remaining} days currently available` : 'No entitlement set for this employee. Set it in Leave Settings before approval.'}</span>
        {balance && days > balance.remaining && <span className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]">This request will need an entitlement review before it can be approved.</span>}
      </div>
      <p className="field-hint tw:shared-base:block tw:shared-base:text-[10px] tw:shared-base:font-normal
           tw:shared-base:[color:var(--text-muted)] tw:shared-base:mt-[7px]">Notice period: {settings.noticeDays} days. Saving creates a pending request and does not deduct leave.</p>
      <p className="field-hint tw:shared-base:block tw:shared-base:text-[10px] tw:shared-base:font-normal
           tw:shared-base:[color:var(--text-muted)] tw:shared-base:mt-[7px]">Use a separate request for each Ethiopian year. Requests for the next year can be approved after Meskerem 1.</p>
      {error && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{error}</p>}
      <ModalActions ><Button variant="secondary" type="button" disabled={saving} onClick={close}>Cancel</Button>
        <Button type="submit" disabled={saving}><Icon name="check" size={17} />{saving ? 'Saving…' : request ? 'Save Changes' : 'Create Request'}</Button>
      </ModalActions>
    </form>
  </Modal>
}
