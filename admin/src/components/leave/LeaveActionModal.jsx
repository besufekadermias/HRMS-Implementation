import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getLeaveDecisionSchema } from '../../utils/validation/operationsSchemas.js'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import LeaveBalanceCard from './LeaveBalanceCard.jsx'
import formatDate from '../../utils/formatters/formatDate.js'
import { getRequestYearError } from '../../services/operations/leaveService.js'

export default function LeaveActionModal({ request, status, settings, approvalError, onDecide, onClose, onDirtyChange }) {
  const approving = status === 'APPROVED'
  const reopening = status === 'PENDING'
  const noteRequired = reopening || (status === 'REJECTED' && settings.requireRejectionReason)
  const blocked = approving ? approvalError : reopening && request.status === 'APPROVED' ? getRequestYearError(request, request.balance) : ''
  const { register, handleSubmit, clearErrors,
    formState: { errors, isDirty: dirty, isSubmitting: saving },
  } = useForm({
    defaultValues: { note: '' },
    resolver: zodResolver(getLeaveDecisionSchema(noteRequired), undefined, { raw: true }),
  })
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
    if (submitting.current || blocked) return
    setErrorMessage('')
    submitting.current = true
    try {
      await onDecide({ requestId: request.id, status, note: values.note })
      onClose()
    } catch (error) {
      setErrorMessage(error?.message || 'The decision could not be saved.')
    } finally {
      submitting.current = false
    }
  }
  if (discard) return <ConfirmationModal title="Discard your note?" confirmLabel="Discard Note"
    onCancel={() => setDiscard(false)} onConfirm={onClose}><p>The action has not been saved.</p></ConfirmationModal>

  return (
    <Modal title={reopening ? 'Review & Reopen Request' : approving ? 'Approve leave request?' : 'Reject leave request?'}
      subtitle={`${request.name} · ${request.employeeId}`} onClose={close}>
      <form onSubmit={(event) => handleSubmit(submit)(event)} aria-busy={saving} noValidate>
        <dl className="leave-review-details">
          <div><dt>Current status</dt><dd><span className={`leave-status leave-status-${request.status.toLowerCase()}`}>{request.status}</span></dd></div>
          <div><dt>Department</dt><dd>{request.department}</dd></div>
          <div><dt>Leave window</dt><dd>{formatDate(request.startDate)} – {formatDate(request.endDate)}</dd></div>
          <div><dt>Days requested</dt><dd>{request.daysRequested} days</dd></div>
          <div><dt>Reason</dt><dd>{request.reason || 'No reason provided'}</dd></div>
        </dl>
        <div className="leave-review-balance"><LeaveBalanceCard balance={request.balance} maxBalance={settings.maxBalance} /></div>
        {blocked ? <p className="form-error" role="alert">{blocked}</p> : (
          <p className="leave-decision-note">{reopening
            ? request.status === 'APPROVED'
              ? `Reopening reverses this approval, restores ${request.daysRequested} used days to the balance, and returns the request to Pending for editing or a new decision.`
              : 'Reopening returns this request to Pending for editing or a new decision. The balance does not change.'
            : approving
            ? `Approving deducts ${request.daysRequested} days and leaves ${request.balance.remaining - request.daysRequested} days available.`
            : 'Rejecting this request leaves the employee’s balance unchanged.'}</p>
        )}
        <label className="leave-note-field">HR note {noteRequired ? '(required)' : '(optional)'}
          <textarea {...fieldProps('note')} rows={3} maxLength={1000} disabled={saving} required={noteRequired}
            placeholder={reopening ? 'Explain why this decision needs to be reviewed…' : 'Add the reason for your decision…'} />{fieldError('note')}
        </label>
        {!!request.history?.length && <details className="leave-history"><summary>Request history ({request.history.length})</summary>
          <ol>{request.history.map((entry, index) => <li key={`${entry.at}:${index}`}>
            <strong>{entry.action}{entry.previousStatus ? ` (was ${entry.previousStatus})` : ''}</strong>
            <small>{new Date(entry.at).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' })} EAT</small>
            {entry.note && <p>{entry.note}</p>}
          </li>)}</ol>
        </details>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="button button-secondary" disabled={saving} onClick={close}>Cancel</button>
          <button type="submit" className={`button ${approving || reopening ? 'button-primary' : 'button-danger'}`} disabled={saving || !!blocked}>
            <Icon name={approving ? 'check' : 'close'} size={17} />
            {saving ? 'Saving…' : reopening ? 'Reopen Request' : approving ? 'Approve Leave' : 'Reject Leave'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
