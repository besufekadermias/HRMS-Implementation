import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getLeaveEntitlementSchema } from '../../utils/validation/operationsSchemas.js'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { getLeaveYear } from '../../services/operations/leaveYear.js'

export default function LeaveEntitlementModal({ employee, balance, settings, onSave, onClose, onDirtyChange }) {
  const [yearStart] = useState(balance?.yearStart || getLeaveYear().start)
  const used = balance?.used || 0
  const { register, control, handleSubmit, clearErrors,
    formState: { errors, isDirty: dirty, isSubmitting: saving },
  } = useForm({
    defaultValues: { accrued: String(balance?.accrued ?? settings.defaultEntitlement), note: '' },
    resolver: zodResolver(getLeaveEntitlementSchema(used, settings.maxBalance), undefined, { raw: true }),
  })
  const accrued = useWatch({ control, name: 'accrued' })
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
      await onSave({ employeeId: employee.id, yearStart, accrued: values.accrued, note: values.note })
      onClose()
    } catch (error) {
      setErrorMessage(error?.message || 'The entitlement could not be saved.')
    } finally {
      submitting.current = false
    }
  }
  if (discard) return <ConfirmationModal title="Discard entitlement changes?" confirmLabel="Discard Changes"
    onCancel={() => setDiscard(false)} onConfirm={onClose}><p>Your entitlement changes have not been saved.</p></ConfirmationModal>
  return <Modal title={balance ? 'Adjust Leave Entitlement' : 'Set Leave Entitlement'} subtitle={`${employee.name} · ${employee.id}`} onClose={close}>
    <form onSubmit={(event) => handleSubmit(submit)(event)} noValidate aria-busy={saving}>
      <p className="field-hint">{getLeaveYear(yearStart).year} E.C. entitlement. Unused days expire at year-end; renewal uses the saved annual entitlement, currently {settings.defaultEntitlement} days.</p>
      <label className="leave-note-field">This year’s entitlement (days)
        <input type="number" min={used} max={used + Number(settings.maxBalance)} step="1" {...fieldProps('accrued')} disabled={saving} />{fieldError('accrued')}
      </label>
      <div className="leave-request-preview" role="status"><span>Used leave: {used} days (maintained by decisions)</span>
        <strong>Remaining after save: {accrued !== '' ? Number(accrued) - used : '—'} days</strong>
        <span>Allowed remaining balance: 0–{settings.maxBalance} days</span>
      </div>
      <label className="leave-note-field">Adjustment reason (required)<textarea rows={3} maxLength={1000} {...fieldProps('note')} disabled={saving} />{fieldError('note')}</label>
      {!!balance?.adjustments?.length && <details className="leave-history"><summary>Entitlement adjustment history</summary><ol>
        {balance.adjustments.map((entry, index) => <li key={`${entry.at}:${index}`}><strong>{entry.previousAccrued ?? 'Not set'} → {entry.accrued} accrued days</strong><p>{entry.note}</p><small>{new Date(entry.at).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' })} EAT</small></li>)}
      </ol></details>}
      {!!balance?.annualHistory?.length && <details className="leave-history"><summary>Previous leave years</summary><ol>
        {balance.annualHistory.map((entry) => <li key={entry.yearStart}>
          <strong>{getLeaveYear(entry.yearStart).year} E.C.</strong>
          <p>{entry.accrued} days granted · {entry.used} used · {entry.expiredDays} unused days expired</p>
        </li>)}
      </ol></details>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions"><button type="button" className="button button-secondary" disabled={saving} onClick={close}>Cancel</button>
        <button type="submit" className="button button-primary" disabled={saving}><Icon name="check" size={17} />{saving ? 'Saving…' : 'Save Entitlement'}</button>
      </div>
    </form>
  </Modal>
}
