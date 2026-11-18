import Button from '../common/Button.jsx'
import { FormInput, FormSelect, FormTextarea } from '../common/FormFields.jsx'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jobFormSchema } from '../../utils/validation/recruitmentSchema.js'
import { showFormErrors } from '../../utils/validation/formErrors.js'
import Modal, { ModalActions } from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import { JOB_STATUSES, validateJobRules } from '../../services/recruitment/recruitmentService.js'

export default function PostJobForm({ job, departments, onSave, onClose, onDirtyChange }) {
  const [initial] = useState(() => ({
    title: job?.title || '', departmentId: String(job?.departmentId || ''),
    deadline: job?.deadline || '', status: job?.status || 'OPEN', description: job?.description || '',
  }))
  const { register, control, handleSubmit, setError, setFocus, clearErrors,
    formState: { errors, isDirty, isSubmitting: saving },
  } = useForm({
    defaultValues: initial,
    resolver: zodResolver(jobFormSchema, undefined, { raw: true }),
  })
  const values = useWatch({ control })
  const [saveError, setSaveError] = useState('')
  const [discarding, setDiscarding] = useState(false)
  const savingRef = useRef(false)
  const dirty = isDirty

  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])
  const activeDepartments = departments.filter((department) => department.status === 'Active')

  function close() {
    if (saving || savingRef.current) return
    if (dirty) setDiscarding(true)
    else onClose()
  }

  async function submit(values) {
    if (savingRef.current) return
    setSaveError('')
    if (showFormErrors(validateJobRules(values, departments), setError, setFocus)) return
    savingRef.current = true
    try {
      await onSave({ ...values, id: job?.id })
      onClose()
    } catch (error) {
      setSaveError(error.message || 'The vacancy could not be saved. Please try again.')
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
      'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `job-${name}-error` : undefined,
    }
  }
  function fieldError(name) {
    return errors[name] && <small className="recruitment-field-error tw:block tw:text-[11px] tw:font-normal tw:text-[#b33450] tw:mt-[7px] tw:leading-[1.6]
          tw:normal-case tw:tracking-normal" id={`job-${name}-error`}>{errors[name].message}</small>
  }

  if (discarding) return <ConfirmationModal title="Discard vacancy changes?" confirmLabel="Discard changes"
    onCancel={() => setDiscarding(false)} onConfirm={onClose}>
    <p>Your vacancy has unsaved changes. Close this form and discard them?</p>
  </ConfirmationModal>

  return <Modal size="medium" className="recruitment-modal" title={job ? 'Edit Job Vacancy' : 'Create New Job Vacancy'} onClose={close}>
    <form onSubmit={(event) => handleSubmit(submit)(event)} noValidate aria-busy={saving}>
      <div className="recruitment-fields tw:grid tw:grid-cols-[repeat(2,minmax(0,1fr))] tw:gap-[22px_18px] tw:[&_label]:block
          tw:[&_label]:text-[12px] tw:[&_label]:font-[600] tw:[&_label]:text-text-secondary tw:[&_label]:uppercase
          tw:[&_label]:tracking-[0.5px] tw:[&_label>span]:text-[#c75560] tw:[&_input]:min-h-[44px]
          tw:[&_input]:rounded-[10px] tw:[&_input]:normal-case tw:[&_input]:tracking-normal
          tw:[&_select]:min-h-[44px] tw:[&_select]:rounded-[10px] tw:[&_select]:normal-case
          tw:[&_select]:tracking-normal tw:[&_textarea]:min-h-[140px] tw:[&_textarea]:rounded-[10px]
          tw:[&_textarea]:normal-case tw:[&_textarea]:tracking-normal tw:[&_textarea]:resize-y
          tw:[&_[aria-invalid=true]]:border-[#b42344] tw:[@media(width<=700px)]:grid-cols-[minmax(0,1fr)]">
        <label className="recruitment-wide tw:col-span-full">Job title <span>*</span>
          <FormInput {...fieldProps('title')} placeholder="e.g. Senior Network Infrastructure Engineer" maxLength={100} required />
          {fieldError('title')}
        </label>
        <label className="recruitment-wide tw:col-span-full">Department <span>*</span>
          <FormSelect {...fieldProps('departmentId')} required>
            <option value="">Select Department</option>
            {initial.departmentId && !activeDepartments.some((item) => String(item.id) === initial.departmentId)
              && <option value={initial.departmentId} disabled>Department unavailable — choose an active department</option>}
            {activeDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
          </FormSelect>
          {fieldError('departmentId')}
        </label>
        <label>Application deadline <span>*</span>
          <FormInput {...fieldProps('deadline')} type="date" min="1900-01-01" max="2100-12-31" required />
          {fieldError('deadline')}
        </label>
        <label>Status <span>*</span>
          <FormSelect {...fieldProps('status')} required>
            {JOB_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </FormSelect>
          {fieldError('status')}
        </label>
        <label className="recruitment-wide tw:col-span-full">Job description &amp; responsibilities <span>*</span>
          <FormTextarea {...fieldProps('description')} placeholder="Detailed requirements, duties, qualifications…" rows={5} maxLength={5000} required />
          {fieldError('description')}
        </label>
      </div>
      {saveError && <p className="recruitment-form-error tw:mt-[16px] tw:text-[13px] tw:rounded-[5px] tw:p-[10px_12px] tw:leading-[1.6]
          tw:text-[#b42344] tw:bg-[#fff0f3]" role="alert">{saveError}</p>}
      {!activeDepartments.length && <p className="recruitment-form-error tw:mt-[16px] tw:text-[13px] tw:rounded-[5px] tw:p-[10px_12px] tw:leading-[1.6]
          tw:text-[#b42344] tw:bg-[#fff0f3]" role="alert">Add an active department before posting a vacancy.</p>}
      <ModalActions >
        <Button variant="secondary" type="button" onClick={close} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving || !activeDepartments.length}>
          {job ? 'Save Changes' : values.status === 'CLOSED' ? 'Save Vacancy' : 'Publish Vacancy'}
        </Button>
      </ModalActions>
    </form>
  </Modal>
}
