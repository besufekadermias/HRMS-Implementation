import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { validateDepartmentRules } from '../../utils/validation/validators.js'
import { departmentSchema } from '../../utils/validation/workforceSchemas.js'

export default function DepartmentModal({
  department,
  departments,
  employees,
  onSave,
  onClose,
  onDirtyChange,
}) {
  const {
    register, control, handleSubmit, setValue, setError, setFocus, clearErrors,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '', code: '', description: '', headId: '', status: 'Active', ...department,
    },
    // Keep the department ID and head assignment for the existing save service.
    resolver: zodResolver(departmentSchema, undefined, { raw: true }),
  })
  const status = useWatch({ control, name: 'status' })
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const staff = employees.filter(
    (employee) => employee.department === department?.name,
  )

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  function changeCode(event) {
    setValue('code', event.target.value.toUpperCase(), { shouldDirty: true })
    clearErrors('code')
  }

  function close() {
    if (isSubmitting) return
    if (isDirty) setConfirmDiscard(true)
    else onClose()
  }
  async function submit(values) {
    const nextErrors = validateDepartmentRules(values, departments, employees)
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
      setError('root', { type: 'server', message: error.message || 'The department could not be saved.' })
    }
  }

  if (confirmDiscard)
    return (
      <ConfirmationModal
        title="Discard department changes?"
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
      title={department ? 'Edit Department' : 'Add Department'}
      subtitle="Organize your team and department details"
      onClose={close}
    >
      <form
        className="department-form"
        onSubmit={handleSubmit(submit)}
        noValidate
        aria-busy={isSubmitting}
      >
        <div className="employee-fields-grid department-fields-grid">
          <label className="full-width">
            Department name <span>*</span>
            <input
              {...register('name')}
              placeholder="e.g. Network & Infrastructure"
              maxLength={120}
              required
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              aria-describedby={
                errors.name ? 'department-name-error' : undefined
              }
            />
            {errors.name && (
              <small className="field-error" id="department-name-error">
                {errors.name.message}
              </small>
            )}
          </label>
          <label>
            Department code <span>*</span>
            <input
              {...register('code', { onChange: changeCode })}
              placeholder="e.g. NET"
              maxLength={12}
              required
              disabled={isSubmitting}
              aria-invalid={!!errors.code}
              aria-describedby={
                errors.code ? 'department-code-error' : undefined
              }
            />
            {errors.code && (
              <small className="field-error" id="department-code-error">
                {errors.code.message}
              </small>
            )}
          </label>
          <label>
            Status <span>*</span>
            <select
              {...register('status')}
              required
              disabled={isSubmitting}
              aria-invalid={!!errors.status}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
            {errors.status && (
              <small className="field-error">{errors.status.message}</small>
            )}
          </label>
          <label className="full-width">
            Department head
            <select
              {...register('headId')}
              disabled={isSubmitting}
              aria-invalid={!!errors.headId}
              aria-describedby="department-head-hint"
            >
              <option value="">Not assigned</option>
              {staff.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.id})
                </option>
              ))}
            </select>
            <small className="field-hint" id="department-head-hint">
              {staff.length
                ? 'Choose a staff member from this department.'
                : 'Assign employees to this department before choosing a head.'}
            </small>
            {errors.headId && (
              <small className="field-error">{errors.headId.message}</small>
            )}
          </label>
          <label className="full-width">
            Description
            <textarea
              {...register('description')}
              placeholder="Describe this department’s responsibilities"
              maxLength={300}
              rows={3}
              disabled={isSubmitting}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <small className="field-error">{errors.description.message}</small>
            )}
          </label>
        </div>
        {status === 'Inactive' && (
          <p className="department-form-note">
            <Icon name="info" size={17} />
            Existing staff stay assigned. New employees cannot be placed in an
            inactive department.
          </p>
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
            <Icon name={department ? 'check' : 'plus'} size={17} />
            {isSubmitting ? 'Saving…' : department ? 'Save Changes' : 'Add Department'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
