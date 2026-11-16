import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { validateJobGradeRules } from '../../utils/validation/validators.js'
import { jobGradeSchema } from '../../utils/validation/workforceSchemas.js'
import formatCurrency from '../../utils/formatters/formatCurrency.js'

export default function GradeModal({
  grade,
  grades,
  employees,
  onSave,
  onClose,
  onDirtyChange,
}) {
  const {
    register, handleSubmit, setError, setFocus,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    defaultValues: { name: '', ...grade, salary: String(grade?.salary ?? '') },
    // Preserve the grade ID; the save service normalizes the title and salary.
    resolver: zodResolver(jobGradeSchema, undefined, { raw: true }),
  })
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const staffCount = employees.filter(
    (employee) => employee.grade === grade?.name,
  ).length

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  function close() {
    if (isSubmitting) return
    if (isDirty) setConfirmDiscard(true)
    else onClose()
  }
  async function submit(values) {
    const nextErrors = validateJobGradeRules(values, grades)
    if (Object.keys(nextErrors).length) {
      for (const [name, message] of Object.entries(nextErrors)) {
        setError(name, { type: 'business', message })
      }
      setFocus(Object.keys(nextErrors)[0])
      return
    }
    try {
      await onSave(values)
    } catch (error) {
      setError('root', { type: 'server', message: error.message || 'The grade could not be saved.' })
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
      <form onSubmit={handleSubmit(submit)} noValidate aria-busy={isSubmitting}>
        {grade && (
          <p className="grade-form-id">
            Grade ID <strong>#{grade.id}</strong>
          </p>
        )}
        <div className="employee-fields-grid grade-fields-grid">
          <label>
            Grade title <span>*</span>
            <input
              {...register('name')}
              placeholder="e.g. Grade V"
              maxLength={80}
              required
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'grade-name-error' : undefined}
            />
            {errors.name && (
              <small className="field-error" id="grade-name-error">
                {errors.name.message}
              </small>
            )}
          </label>
          <label>
            Base salary (ETB) <span>*</span>
            <input
              {...register('salary')}
              type="number"
              inputMode="decimal"
              min="0.01"
              max="999999999.99"
              step="0.01"
              placeholder="e.g. 24000.00"
              required
              disabled={isSubmitting}
              aria-invalid={!!errors.salary}
              aria-describedby={
                errors.salary ? 'grade-salary-error' : 'grade-salary-hint'
              }
            />
            {errors.salary ? (
              <small className="field-error" id="grade-salary-error">
                {errors.salary.message}
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
        {errors.root && (
          <p className="form-error" role="alert">
            {errors.root.message}
          </p>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={close}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="button button-primary" disabled={isSubmitting}>
            <Icon name={grade ? 'check' : 'plus'} size={17} />
            {isSubmitting ? 'Saving…' : grade ? 'Save Changes' : 'Add Job Grade'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
