import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leaveRequestFormSchema } from '../../utils/validation/operationsSchemas.js'
import Modal from '../common/Modal.jsx'
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
    return errors[name] && <small className="field-error" id={`leave-${name}-error`}>{errors[name].message}</small>
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
      <fieldset className="leave-form-fieldset" disabled={saving}>
        <div className="employee-fields-grid leave-form-grid">
          <label className="full-width">Employee <span>*</span>
            <select {...fieldProps('employeeId')} required disabled={!!request}>
              <option value="">Select an employee</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.id}</option>)}
            </select>{fieldError('employeeId')}
          </label>
          <label>Start date <span>*</span><input type="date" {...fieldProps('startDate')} required />{fieldError('startDate')}</label>
          <label>End date <span>*</span><input type="date" {...fieldProps('endDate')} required min={values.startDate || undefined} />{fieldError('endDate')}</label>
          <label className="full-width">Reason <span>*</span><textarea rows={3} {...fieldProps('reason')} required maxLength={1000} />{fieldError('reason')}</label>
        </div>
      </fieldset>
      <div className="leave-request-preview" role="status">
        <strong>{days} {days === 1 ? 'day' : 'days'} requested</strong>
        <span>{settings.dayCounting === 'calendar' ? 'Calendar days, including weekends' : 'Monday–Friday only; public holidays are not excluded'}</span>
        <span>{balance ? `${balance.remaining} days currently available` : 'No entitlement set for this employee. Set it in Leave Settings before approval.'}</span>
        {balance && days > balance.remaining && <span className="field-error">This request will need an entitlement review before it can be approved.</span>}
      </div>
      <p className="field-hint">Notice period: {settings.noticeDays} days. Saving creates a pending request and does not deduct leave.</p>
      <p className="field-hint">Use a separate request for each Ethiopian year. Requests for the next year can be approved after Meskerem 1.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions"><button type="button" className="button button-secondary" disabled={saving} onClick={close}>Cancel</button>
        <button className="button button-primary" type="submit" disabled={saving}><Icon name="check" size={17} />{saving ? 'Saving…' : request ? 'Save Changes' : 'Create Request'}</button>
      </div>
    </form>
  </Modal>
}
