import Button from '../common/Button.jsx'
import { FormInput, FormSelect, FormTextarea } from '../common/FormFields.jsx'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal, { ModalActions } from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { validateDepartmentRules } from '../../utils/validation/validators.js'
import { departmentSchema } from '../../utils/validation/workforceSchemas.js'
import { canAssignDepartmentHead } from '../../utils/helpers/accountIdentity.js'

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
    (employee) => employee.department === department?.name && canAssignDepartmentHead(employee),
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
        <div className="employee-fields-grid department-fields-grid tw:grid-cols-2 tw:gap-[18px] tw:max-[640px]:grid-cols-[minmax(0,_1fr)]
          tw:[&_textarea]:h-auto tw:[&_textarea]:min-h-[90px] tw:[&_textarea]:resize-y
          tw:max-[640px]:[&_input]:text-[16px] tw:max-[640px]:[&_select]:text-[16px]
          tw:max-[640px]:[&_textarea]:text-[16px] tw:shared-base:grid
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
          <label className="full-width tw:shared-base:col-[1_/_-1]">
            Department name <span>*</span>
            <FormInput variant="employee"
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
              <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id="department-name-error">
                {errors.name.message}
              </small>
            )}
          </label>
          <label>
            Department code <span>*</span>
            <FormInput variant="employee"
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
              <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id="department-code-error">
                {errors.code.message}
              </small>
            )}
          </label>
          <label>
            Status <span>*</span>
            <FormSelect variant="employee"
              {...register('status')}
              required
              disabled={isSubmitting}
              aria-invalid={!!errors.status}
            >
              <option>Active</option>
              <option>Inactive</option>
            </FormSelect>
            {errors.status && (
              <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]">{errors.status.message}</small>
            )}
          </label>
          <label className="full-width tw:shared-base:col-[1_/_-1]">
            Department head
            <FormSelect variant="employee"
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
            </FormSelect>
            <small className="field-hint tw:shared-base:block tw:shared-base:text-[10px] tw:shared-base:font-normal
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:mt-[7px]" id="department-head-hint">
              {staff.length
                ? 'Choose active staff with a registered email. Saving also updates their portal role.'
                : 'Add active staff with a registered email to this department before choosing a head.'}
            </small>
            {errors.headId && (
              <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]">{errors.headId.message}</small>
            )}
          </label>
          <label className="full-width tw:shared-base:col-[1_/_-1]">
            Description
            <FormTextarea variant="employee"
              {...register('description')}
              placeholder="Describe this department’s responsibilities"
              maxLength={300}
              rows={3}
              disabled={isSubmitting}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]">{errors.description.message}</small>
            )}
          </label>
        </div>
        {status === 'Inactive' && (
          <p className="department-form-note tw:flex tw:gap-[9px] tw:p-[13px] tw:rounded-[7px] tw:mt-[18px] tw:bg-[#fff7e8]
          tw:text-[#805f23] tw:text-[12px] tw:leading-[1.6]">
            <Icon name="info" size={17} />
            Existing staff stay assigned. New employees cannot be placed in an
            inactive department.
          </p>
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
            <Icon name={department ? 'check' : 'plus'} size={17} />
            {isSubmitting ? 'Saving…' : department ? 'Save Changes' : 'Add Department'}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
