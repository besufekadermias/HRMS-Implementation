import { useRef, useState } from 'react'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { validateDepartment } from '../../utils/validation/validators.js'

export default function DepartmentModal({
  department,
  departments,
  employees,
  onSave,
  onClose,
  onDirtyChange,
}) {
  const [values, setValues] = useState({
    name: '',
    code: '',
    description: '',
    headId: '',
    status: 'Active',
    ...department,
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [dirty, setDirty] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const formRef = useRef(null)
  const staff = employees.filter(
    (employee) => employee.department === department?.name,
  )

  function changeField(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setFormError('')
    setDirty(true)
    onDirtyChange(true)
  }
  function close() {
    if (dirty) setConfirmDiscard(true)
    else onClose()
  }
  function submit(event) {
    event.preventDefault()
    const nextErrors = validateDepartment(values, departments, employees)
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
      setFormError(error.message || 'The department could not be saved.')
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
        onSubmit={submit}
        ref={formRef}
        noValidate
      >
        <div className="employee-fields-grid department-fields-grid">
          <label className="full-width">
            Department name <span>*</span>
            <input
              name="name"
              value={values.name}
              onChange={(event) => changeField('name', event.target.value)}
              placeholder="e.g. Network & Infrastructure"
              maxLength={120}
              required
              aria-invalid={!!errors.name}
              aria-describedby={
                errors.name ? 'department-name-error' : undefined
              }
            />
            {errors.name && (
              <small className="field-error" id="department-name-error">
                {errors.name}
              </small>
            )}
          </label>
          <label>
            Department code <span>*</span>
            <input
              name="code"
              value={values.code}
              onChange={(event) =>
                changeField('code', event.target.value.toUpperCase())
              }
              placeholder="e.g. NET"
              maxLength={12}
              required
              aria-invalid={!!errors.code}
              aria-describedby={
                errors.code ? 'department-code-error' : undefined
              }
            />
            {errors.code && (
              <small className="field-error" id="department-code-error">
                {errors.code}
              </small>
            )}
          </label>
          <label>
            Status <span>*</span>
            <select
              name="status"
              value={values.status}
              onChange={(event) => changeField('status', event.target.value)}
              required
              aria-invalid={!!errors.status}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
            {errors.status && (
              <small className="field-error">{errors.status}</small>
            )}
          </label>
          <label className="full-width">
            Department head
            <select
              name="headId"
              value={values.headId}
              onChange={(event) => changeField('headId', event.target.value)}
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
              <small className="field-error">{errors.headId}</small>
            )}
          </label>
          <label className="full-width">
            Description
            <textarea
              name="description"
              value={values.description}
              onChange={(event) =>
                changeField('description', event.target.value)
              }
              placeholder="Describe this department’s responsibilities"
              maxLength={300}
              rows={3}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <small className="field-error">{errors.description}</small>
            )}
          </label>
        </div>
        {values.status === 'Inactive' && (
          <p className="department-form-note">
            <Icon name="info" size={17} />
            Existing staff stay assigned. New employees cannot be placed in an
            inactive department.
          </p>
        )}
        {formError && (
          <p className="form-error" role="alert">
            {formError}
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
            <Icon name={department ? 'check' : 'plus'} size={17} />
            {department ? 'Save Changes' : 'Add Department'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
