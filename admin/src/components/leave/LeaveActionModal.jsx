import Button from '../common/Button.jsx'
import { FormTextarea } from '../common/FormFields.jsx'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getLeaveDecisionSchema } from '../../utils/validation/operationsSchemas.js'
import Modal, { ModalActions } from '../common/Modal.jsx'
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
    return errors[name] && <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id={`leave-${name}-error`}>{errors[name].message}</small>
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
        <dl className="leave-review-details tw:grid tw:gap-[14px] tw:m-[0_0_20px] tw:[&>div]:grid
          tw:[&>div]:grid-cols-[115px_minmax(0,_1fr)] tw:[&>div]:gap-[12px] tw:[&_dt]:text-[var(--text-muted)]
          tw:[&_dt]:text-[12px] tw:[&_dd]:m-0 tw:[&_dd]:leading-[1.6] tw:[&_dd]:[overflow-wrap:anywhere]
          tw:max-[768px]:[&>div]:grid-cols-1 tw:max-[768px]:[&>div]:gap-[4px]">
          <div><dt>Current status</dt><dd><span className={`leave-status tw:inline-block tw:p-[3px_9px] tw:rounded-[20px] tw:text-[9px] tw:font-bold tw:whitespace-nowrap
          tw:[&.leave-status-approved]:bg-[#daf9e6] tw:[&.leave-status-approved]:text-[#08763d]
          tw:[&.leave-status-rejected]:bg-[#ffe3e8] tw:[&.leave-status-rejected]:text-[#b4213e]
          tw:[&.leave-status-pending]:bg-[#fff1d7] tw:[&.leave-status-pending]:text-[#916008] leave-status-${request.status.toLowerCase()}`}>{request.status}</span></dd></div>
          <div><dt>Department</dt><dd>{request.department}</dd></div>
          <div><dt>Leave window</dt><dd>{formatDate(request.startDate)} – {formatDate(request.endDate)}</dd></div>
          <div><dt>Days requested</dt><dd>{request.daysRequested} days</dd></div>
          <div><dt>Reason</dt><dd>{request.reason || 'No reason provided'}</dd></div>
        </dl>
        <div className="leave-review-balance tw:p-[16px] tw:bg-[#f3f9f6] tw:[border:1px_solid_var(--border)] tw:rounded-[9px]
          tw:[&_.leave-balance_small]:text-[12px]"><LeaveBalanceCard balance={request.balance} maxBalance={settings.maxBalance} /></div>
        {blocked ? <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{blocked}</p> : (
          <p className="leave-decision-note tw:mt-[16px] tw:text-text-secondary tw:leading-[1.7]">{reopening
            ? request.status === 'APPROVED'
              ? `Reopening reverses this approval, restores ${request.daysRequested} used days to the balance, and returns the request to Pending for editing or a new decision.`
              : 'Reopening returns this request to Pending for editing or a new decision. The balance does not change.'
            : approving
            ? `Approving deducts ${request.daysRequested} days and leaves ${request.balance.remaining - request.daysRequested} days available.`
            : 'Rejecting this request leaves the employee’s balance unchanged.'}</p>
        )}
        <label className="leave-note-field tw:grid tw:gap-[8px] tw:my-[18px] tw:text-[12px] tw:font-[600] tw:text-text-secondary">HR note {noteRequired ? '(required)' : '(optional)'}
          <FormTextarea variant="leave-note" {...fieldProps('note')} rows={3} maxLength={1000} disabled={saving} required={noteRequired}
            placeholder={reopening ? 'Explain why this decision needs to be reviewed…' : 'Add the reason for your decision…'} />{fieldError('note')}
        </label>
        {!!request.history?.length && <details className="leave-history tw:my-[18px] tw:text-[12px] tw:[&_summary]:text-primary tw:[&_summary]:cursor-pointer
          tw:[&_summary]:font-[600] tw:[&_ol]:pl-[20px] tw:[&_ol]:max-h-[190px] tw:[&_ol]:overflow-y-auto
          tw:[&_li]:py-[8px] tw:[&_li]:leading-[1.6] tw:[&_li]:[overflow-wrap:anywhere] tw:[&_small]:block
          tw:[&_small]:text-[var(--text-muted)]"><summary>Request history ({request.history.length})</summary>
          <ol>{request.history.map((entry, index) => <li key={`${entry.at}:${index}`}>
            <strong>{entry.action}{entry.previousStatus ? ` (was ${entry.previousStatus})` : ''}</strong>
            <small>{new Date(entry.at).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' })} EAT</small>
            {entry.note && <p>{entry.note}</p>}
          </li>)}</ol>
        </details>}
        {error && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{error}</p>}
        <ModalActions >
          <Button variant="secondary" type="button" disabled={saving} onClick={close}>Cancel</Button>
          <Button type="submit" variant={approving || reopening ? 'primary' : 'danger'} disabled={saving || !!blocked}>
            <Icon name={approving ? 'check' : 'close'} size={17} />
            {saving ? 'Saving…' : reopening ? 'Reopen Request' : approving ? 'Approve Leave' : 'Reject Leave'}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
