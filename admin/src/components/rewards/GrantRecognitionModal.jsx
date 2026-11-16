import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { rewardFormSchema } from '../../utils/validation/growthSchemas.js'
import { showFormErrors } from '../../utils/validation/formErrors.js'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { AWARD_CATEGORIES, validateRewardRules } from '../../services/growth/rewardService.js'
import { todayInNairobi } from '../../utils/validation/validators.js'

export default function GrantRecognitionModal({ employees, onSave, onClose, onDirtyChange }) {
  const [initial] = useState(() => ({
    employeeId: '', title: '', category: 'EXCELLENCE', awardDate: todayInNairobi(), description: '',
  }))
  const { register, handleSubmit, setError, setFocus, clearErrors,
    formState: { errors, isDirty, isSubmitting: saving },
  } = useForm({
    defaultValues: initial,
    resolver: zodResolver(rewardFormSchema, undefined, { raw: true }),
  })
  const [saveError, setSaveError] = useState('')
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const savingRef = useRef(false)
  const dirty = isDirty

  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])

  function close() {
    if (saving || savingRef.current) return
    if (dirty) setConfirmDiscard(true)
    else onClose()
  }

  async function submit(values) {
    if (savingRef.current) return
    setSaveError('')
    if (showFormErrors(validateRewardRules(values, employees), setError, setFocus)) return
    savingRef.current = true
    try {
      await onSave(values)
      onClose()
    } catch (error) {
      setSaveError(error.message || 'The award could not be granted. Please try again.')
    } finally {
      savingRef.current = false
    }
  }

  function fieldProps(name) {
    return {
      ...register(name, { onChange: () => {
        clearErrors(name)
        setSaveError('')
      } }), disabled: saving,
      'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `recognition-${name}-error` : undefined,
    }
  }
  function fieldError(name) {
    return errors[name] && <small className="field-error" id={`recognition-${name}-error`}>{errors[name].message}</small>
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
      <form onSubmit={(event) => handleSubmit(submit)(event)} noValidate aria-busy={saving}>
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
