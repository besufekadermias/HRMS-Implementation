import Button from '../common/Button.jsx'
import { FormInput } from '../common/FormFields.jsx'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal, { ModalActions } from '../common/Modal.jsx'
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
          <p className="grade-form-id tw:text-[12px] tw:text-[var(--text-muted)] tw:mb-[18px]">
            Grade ID <strong className="tw:text-primary tw:pl-[5px]">#{grade.id}</strong>
          </p>
        )}
        <div className="employee-fields-grid grade-fields-grid tw:grid-cols-[minmax(0,_1fr)] tw:gap-[19px]
          tw:max-[768px]:[&_input]:text-[16px] tw:shared-base:grid
          tw:shared-base:grid-cols-[repeat(3,_minmax(0,_1fr))] tw:shared-base:gap-[23px_22px]
          tw:shared-base:[&_>_label]:block tw:shared-base:[&_>_label]:[color:#48655f]
          tw:shared-base:[&_>_label]:text-[11px] tw:shared-base:[&_>_label]:font-[650]
          tw:shared-base:[&_>_label]:leading-[1.5]
          tw:shared-base:[&_>_label_>_span:not(.password-field)]:[color:#b65265]
          tw:shared-base:[&_.span-two]:col-[span_2] tw:max-[1100px]:shared-base:gap-[20px_17px]
          tw:max-[768px]:shared-base:grid-cols-[repeat(2,_minmax(0,_1fr))]
          tw:max-[768px]:shared-base:[&_.span-two]:col-[1_/_-1]
          tw:max-[560px]:shared-base:grid-cols-[minmax(0,_1fr)]
          tw:max-[560px]:shared-base:[&_.span-two]:col-[auto]
          tw:max-[560px]:shared-base:[&_>_label]:text-[11px]">
          <label>
            Grade title <span>*</span>
            <FormInput variant="employee"
              {...register('name')}
              placeholder="e.g. Grade V"
              maxLength={80}
              required
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'grade-name-error' : undefined}
            />
            {errors.name && (
              <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id="grade-name-error">
                {errors.name.message}
              </small>
            )}
          </label>
          <label>
            Base salary (ETB) <span>*</span>
            <FormInput variant="employee"
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
              <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id="grade-salary-error">
                {errors.salary.message}
              </small>
            ) : (
              <small className="field-hint tw:shared-base:block tw:shared-base:text-[10px] tw:shared-base:font-normal
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:mt-[7px]" id="grade-salary-hint">
                Base salary only; allowances and deductions are handled
                separately.
              </small>
            )}
          </label>
        </div>
        {staffCount > 0 && (
          <div className="notice grade-impact-note tw:mt-[20px] tw:mb-0 tw:shared-base:flex tw:shared-base:items-start
          tw:shared-base:gap-[11px] tw:shared-base:[background:#f0f8f6] tw:shared-base:[border:1px_solid_#daeee6]
          tw:shared-base:[color:#46756c] tw:shared-base:p-[13px_14px] tw:shared-base:rounded-[7px]
          tw:shared-base:m-[18px_0] tw:shared-base:text-[12px] tw:shared-base:leading-[1.7]
          tw:shared-base:[&_>_svg]:mt-[2px] tw:shared-base:[&_>_svg]:w-[18px]">
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
          <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">
            {errors.root.message}
          </p>
        )}
        <ModalActions >
          <Button variant="secondary"
            type="button"
            onClick={close}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Icon name={grade ? 'check' : 'plus'} size={17} />
            {isSubmitting ? 'Saving…' : grade ? 'Save Changes' : 'Add Job Grade'}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
