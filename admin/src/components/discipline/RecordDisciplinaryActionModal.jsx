import { useRef, useState } from 'react'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { SANCTIONS, validateDisciplinaryAction } from '../../services/growth/disciplineService.js'
import { todayInNairobi } from '../../utils/validation/validators.js'

export default function RecordDisciplinaryActionModal({ employees, onSave, onClose, onDirtyChange }) {
  const [initial] = useState(() => ({
    employeeId: '', incidentDate: todayInNairobi(), violationType: '', penaltyAction: 'WARNING', description: '',
  }))
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const formRef = useRef(null)
  const savingRef = useRef(false)
  const dirty = Object.keys(initial).some((key) => values[key] !== initial[key])

  function change(name, value) {
    const next = { ...values, [name]: value }
    setValues(next)
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSaveError('')
    onDirtyChange(Object.keys(initial).some((key) => next[key] !== initial[key]))
  }

  function close() {
    if (savingRef.current) return
    if (dirty) setConfirmDiscard(true)
    else onClose()
  }

  async function submit(event) {
    event.preventDefault()
    if (savingRef.current) return
    const nextErrors = validateDisciplinaryAction(values, employees)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      formRef.current.elements.namedItem(Object.keys(nextErrors)[0])?.focus()
      return
    }
    savingRef.current = true
    setSaving(true)
    setSaveError('')
    try {
      await onSave(values)
      onClose()
    } catch (error) {
      setSaveError(error.message || 'The record could not be saved. Please try again.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  function fieldProps(name) {
    return {
      name, value: values[name], onChange: (event) => change(name, event.target.value),
      'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `discipline-${name}-error` : undefined,
    }
  }
  function fieldError(name) {
    return errors[name] && <small className="field-error" id={`discipline-${name}-error`}>{errors[name]}</small>
  }

  if (confirmDiscard) return (
    <ConfirmationModal title="Discard disciplinary record?" confirmLabel="Discard changes"
      onCancel={() => setConfirmDiscard(false)} onConfirm={onClose}>
      <p>Your record has not been saved. Close this form and discard your changes?</p>
    </ConfirmationModal>
  )

  return (
    <Modal className="discipline-modal" onClose={close}
      title={<><Icon name="alert-triangle" size={25} /> Record Disciplinary Action</>}>
      <form ref={formRef} onSubmit={submit} noValidate aria-busy={saving}>
        <fieldset className="discipline-fields form-grid" disabled={saving}>
          <legend className="sr-only">Disciplinary action details</legend>
          <label>Employee <span>*</span>
            <select {...fieldProps('employeeId')} required>
              <option value="">Select Employee</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>
                {employee.name} · {employee.id} · {employee.department}
              </option>)}
            </select>
            {fieldError('employeeId')}
          </label>
          <label>Incident date <span>*</span>
            <input {...fieldProps('incidentDate')} type="date" min="1900-01-01" max={todayInNairobi()} required />
            {fieldError('incidentDate')}
          </label>
          <label>Violation type <span>*</span>
            <input {...fieldProps('violationType')} placeholder="e.g. Unauthorized Absence or IT Security Breach" maxLength={100} required />
            {fieldError('violationType')}
          </label>
          <label>Sanction / Penalty action <span>*</span>
            <select {...fieldProps('penaltyAction')} required>
              {SANCTIONS.map((sanction) => <option key={sanction.value} value={sanction.value}>{sanction.label.toUpperCase()}</option>)}
            </select>
            {fieldError('penaltyAction')}
          </label>
          <label>Details / Explanation
            <textarea {...fieldProps('description')} placeholder="Official memorandum notes…" rows={4} maxLength={5000} />
            {fieldError('description')}
          </label>
        </fieldset>
        {saveError && <p className="form-error" role="alert">{saveError}</p>}
        {!employees.length && <p className="form-error" role="alert">Add an employee before recording a disciplinary action.</p>}
        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={close} disabled={saving}>Cancel</button>
          <button type="submit" className="button button-discipline" disabled={saving || !employees.length}>
            {saving ? 'Saving Record…' : 'Save Record'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
