import { useRef, useState } from 'react'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { AWARD_CATEGORIES, validateReward } from '../../services/growth/rewardService.js'
import { todayInNairobi } from '../../utils/validation/validators.js'

export default function GrantRecognitionModal({ employees, onSave, onClose, onDirtyChange }) {
  const [initial] = useState(() => ({
    employeeId: '', title: '', category: 'EXCELLENCE', awardDate: todayInNairobi(), description: '',
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
    const nextErrors = validateReward(values, employees)
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
      setSaveError(error.message || 'The award could not be granted. Please try again.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  function fieldProps(name) {
    return {
      name, value: values[name], onChange: (event) => change(name, event.target.value),
      'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `recognition-${name}-error` : undefined,
    }
  }
  function fieldError(name) {
    return errors[name] && <small className="field-error" id={`recognition-${name}-error`}>{errors[name]}</small>
  }

  if (confirmDiscard) return (
    <ConfirmationModal title="Discard recognition?" confirmLabel="Discard changes"
      onCancel={() => setConfirmDiscard(false)} onConfirm={onClose}>
      <p>Your recognition has not been saved. Close this form and discard your changes?</p>
    </ConfirmationModal>
  )

  return (
    <Modal className="recognition-modal" onClose={close}
      title={<><Icon name="award" size={25} /> Grant Staff Recognition</>}>
      <form ref={formRef} onSubmit={submit} noValidate aria-busy={saving}>
        <fieldset className="recognition-fields form-grid" disabled={saving}>
          <legend className="sr-only">Recognition details</legend>
          <label>Employee <span>*</span>
            <select {...fieldProps('employeeId')} required>
              <option value="">Select Employee</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>
                {employee.name} · {employee.id} · {employee.department}
              </option>)}
            </select>
            {fieldError('employeeId')}
          </label>
          <label>Award title <span>*</span>
            <input {...fieldProps('title')} placeholder={`e.g. Innovator of the Year ${initial.awardDate.slice(0, 4)}`} maxLength={150} required />
            {fieldError('title')}
          </label>
          <label>Award category <span>*</span>
            <select {...fieldProps('category')} required>
              {AWARD_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label.toUpperCase()}</option>)}
            </select>
            {fieldError('category')}
          </label>
          <label>Award date <span>*</span>
            <input {...fieldProps('awardDate')} type="date" min="1900-01-01" max="2100-12-31" required />
            {fieldError('awardDate')}
          </label>
          <label>Description / Citations
            <textarea {...fieldProps('description')} placeholder="Accomplishments and justification…" rows={4} maxLength={5000} />
            {fieldError('description')}
          </label>
        </fieldset>
        {saveError && <p className="form-error" role="alert">{saveError}</p>}
        {!employees.length && <p className="form-error" role="alert">Add an employee before granting recognition.</p>}
        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={close} disabled={saving}>Cancel</button>
          <button type="submit" className="button button-primary" disabled={saving || !employees.length}>
            {saving ? 'Granting Award…' : 'Grant Award'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
