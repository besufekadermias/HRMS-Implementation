import { useRef, useState } from 'react'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { validateJobGrade } from '../../utils/validation/validators.js'
import formatCurrency from '../../utils/formatters/formatCurrency.js'

export default function GradeModal({
  grade,
  grades,
  employees,
  onSave,
  onClose,
  onDirtyChange,
}) {
  const [values, setValues] = useState({ name: '', salary: '', ...grade })
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const [dirty, setDirty] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const formRef = useRef(null)
  const staffCount = employees.filter(
    (employee) => employee.grade === grade?.name,
  ).length

  function changeField(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSaveError('')
    setDirty(true)
    onDirtyChange(true)
  }
  function close() {
    if (dirty) setConfirmDiscard(true)
    else onClose()
  }
  function submit(event) {
    event.preventDefault()
    const nextErrors = validateJobGrade(values, grades)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      formRef.current
        .querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)
        ?.focus()
      return
    }
    try {
      onSave(values)
    } catch (error) {
      setSaveError(error.message || 'The grade could not be saved.')
    }
  }

  if (confirmDiscard)
    return (
      <ConfirmationModal
        title="Discard grade changes?"
        confirmLabel="Discard changes"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={onClose}
      >
        <p>
          Your changes have not been saved. Close this form and discard them?
        </p>
      </ConfirmationModal>
    )

  return (
    <Modal
      title={grade ? 'Edit Job Grade' : 'Add New Job Grade'}
      subtitle="Set the grade title and its base salary in Ethiopian Birr"
      onClose={close}
    >
      <form onSubmit={submit} ref={formRef} noValidate>
        {grade && (
          <p className="grade-form-id">
            Grade ID <strong>#{grade.id}</strong>
          </p>
        )}
        <div className="employee-fields-grid grade-fields-grid">
          <label>
            Grade title <span>*</span>
            <input
              name="name"
              value={values.name}
              onChange={(event) => changeField('name', event.target.value)}
              placeholder="e.g. Grade V"
              maxLength={80}
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'grade-name-error' : undefined}
            />
            {errors.name && (
              <small className="field-error" id="grade-name-error">
                {errors.name}
              </small>
            )}
          </label>
          <label>
            Base salary (ETB) <span>*</span>
            <input
              name="salary"
              type="number"
              inputMode="decimal"
              min="0.01"
              max="999999999.99"
              step="0.01"
              value={values.salary}
              onChange={(event) => changeField('salary', event.target.value)}
              placeholder="e.g. 24000.00"
              required
              aria-invalid={!!errors.salary}
              aria-describedby={
                errors.salary ? 'grade-salary-error' : 'grade-salary-hint'
              }
            />
            {errors.salary ? (
              <small className="field-error" id="grade-salary-error">
                {errors.salary}
              </small>
            ) : (
              <small className="field-hint" id="grade-salary-hint">
                Base salary only; allowances and deductions are handled
                separately.
              </small>
            )}
          </label>
        </div>
        {staffCount > 0 && (
          <div className="notice grade-impact-note">
            <Icon name="info" size={19} />
            <p>
              This grade is assigned to{' '}
              <strong>
                {staffCount} employee{staffCount === 1 ? '' : 's'}
              </strong>
              . Saving updates their grade title and base salary together.
              Current base salary:{' '}
              {formatCurrency(grade.salary, { minimumFractionDigits: 2 })}.
            </p>
          </div>
        )}
        {saveError && (
          <p className="form-error" role="alert">
            {saveError}
          </p>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={close}
          >
            Cancel
          </button>
          <button type="submit" className="button button-primary">
            <Icon name={grade ? 'check' : 'plus'} size={17} />
            {grade ? 'Save Changes' : 'Add Job Grade'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
