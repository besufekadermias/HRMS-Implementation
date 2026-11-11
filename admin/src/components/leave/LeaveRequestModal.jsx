import { useRef, useState } from 'react'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { countLeaveDays, getLeaveBalance } from '../../services/operations/leaveService.js'

export default function LeaveRequestModal({ request, employees, balances, settings, onSave, onClose, onDirtyChange }) {
  // Submit only editable inputs, never joined employee data, balances or history.
  const [values, setValues] = useState({
    ...(request ? { id: request.id } : {}),
    employeeId: request?.employeeId || '',
    startDate: request?.startDate || '',
    endDate: request?.endDate || '',
    reason: request?.reason || '',
  })
  const [dirty, setDirty] = useState(false)
  const [discard, setDiscard] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const days = countLeaveDays(values.startDate, values.endDate, settings.dayCounting)
  const balance = getLeaveBalance(balances.find((item) => item.employeeId === values.employeeId))

  function change(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setError('')
    setDirty(true)
    onDirtyChange(true)
  }
  function close() {
    if (submitting.current) return
    if (dirty) setDiscard(true)
    else onClose()
  }
  async function submit(event) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setSaving(true)
    setError('')
    try {
      await onSave(values)
      onClose()
    } catch (error) {
      setError(error?.message || 'The request could not be saved.')
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }
  if (discard) return <ConfirmationModal title="Discard request changes?" confirmLabel="Discard Changes"
    onCancel={() => setDiscard(false)} onConfirm={onClose}><p>Your request changes have not been saved.</p></ConfirmationModal>

  return <Modal title={request ? 'Edit Leave Request' : 'New Leave Request'} subtitle="Record a request on behalf of an employee" onClose={close}>
    <form onSubmit={submit} noValidate aria-busy={saving}>
      <fieldset className="leave-form-fieldset" disabled={saving}>
        <div className="employee-fields-grid leave-form-grid">
          <label className="full-width">Employee <span>*</span>
            <select value={values.employeeId} required disabled={!!request} onChange={(event) => change('employeeId', event.target.value)}>
              <option value="">Select an employee</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.id}</option>)}
            </select>
          </label>
          <label>Start date <span>*</span><input type="date" value={values.startDate} required onChange={(event) => change('startDate', event.target.value)} /></label>
          <label>End date <span>*</span><input type="date" value={values.endDate} required min={values.startDate || undefined} onChange={(event) => change('endDate', event.target.value)} /></label>
          <label className="full-width">Reason <span>*</span><textarea rows={3} value={values.reason} required maxLength={1000} onChange={(event) => change('reason', event.target.value)} /></label>
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
