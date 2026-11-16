import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jobFormSchema } from '../../utils/validation/recruitmentSchema.js'
import { showFormErrors } from '../../utils/validation/formErrors.js'
import Modal from '../common/Modal.jsx'
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
    return errors[name] && <small className="field-error" id={`job-${name}-error`}>{errors[name].message}</small>
  }

  if (discarding) return <ConfirmationModal title="Discard vacancy changes?" confirmLabel="Discard changes"
    onCancel={() => setDiscarding(false)} onConfirm={onClose}>
    <p>Your vacancy has unsaved changes. Close this form and discard them?</p>
  </ConfirmationModal>

  return <Modal className="recruitment-modal" title={job ? 'Edit Job Vacancy' : 'Create New Job Vacancy'} onClose={close}>
    <form onSubmit={(event) => handleSubmit(submit)(event)} noValidate aria-busy={saving}>
      <div className="form-grid recruitment-fields">
        <label className="recruitment-wide">Job title <span>*</span>
          <input {...fieldProps('title')} placeholder="e.g. Senior Network Infrastructure Engineer" maxLength={100} required />
          {fieldError('title')}
        </label>
        <label className="recruitment-wide">Department <span>*</span>
          <select {...fieldProps('departmentId')} required>
            <option value="">Select Department</option>
            {initial.departmentId && !activeDepartments.some((item) => String(item.id) === initial.departmentId)
              && <option value={initial.departmentId} disabled>Department unavailable — choose an active department</option>}
            {activeDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
          </select>
          {fieldError('departmentId')}
        </label>
        <label>Application deadline <span>*</span>
          <input {...fieldProps('deadline')} type="date" min="1900-01-01" max="2100-12-31" required />
          {fieldError('deadline')}
        </label>
        <label>Status <span>*</span>
          <select {...fieldProps('status')} required>
            {JOB_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
          {fieldError('status')}
        </label>
        <label className="recruitment-wide">Job description &amp; responsibilities <span>*</span>
          <textarea {...fieldProps('description')} placeholder="Detailed requirements, duties, qualifications…" rows={5} maxLength={5000} required />
          {fieldError('description')}
        </label>
      </div>
      {saveError && <p className="form-error" role="alert">{saveError}</p>}
      {!activeDepartments.length && <p className="form-error" role="alert">Add an active department before posting a vacancy.</p>}
      <div className="modal-actions">
        <button type="button" className="button button-secondary" onClick={close} disabled={saving}>Cancel</button>
        <button type="submit" className="button button-primary" disabled={saving || !activeDepartments.length}>
          {job ? 'Save Changes' : values.status === 'CLOSED' ? 'Save Vacancy' : 'Publish Vacancy'}
        </button>
      </div>
    </form>
  </Modal>
}
