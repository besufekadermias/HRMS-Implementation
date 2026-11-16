import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { announcementSchema } from '../../utils/validation/communicationsSchemas.js'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { ANNOUNCEMENT_AUDIENCES } from '../../services/communications/announcementService.js'

const EMPTY_ANNOUNCEMENT = { title: '', targetAudience: 'ALL', content: '' }

export default function PostAnnouncementModal({ onSave, onClose, onDirtyChange }) {
  const { register, handleSubmit, clearErrors,
    formState: { errors, isDirty, isSubmitting: saving },
  } = useForm({
    defaultValues: EMPTY_ANNOUNCEMENT,
    resolver: zodResolver(announcementSchema, undefined, { raw: true }),
  })
  const [saveError, setSaveError] = useState('')
  const [discarding, setDiscarding] = useState(false)
  const savingRef = useRef(false)
  const dirty = isDirty

  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])

  function close() {
    if (saving || savingRef.current) return
    if (dirty) setDiscarding(true)
    else onClose()
  }

  async function submit(values) {
    if (savingRef.current) return
    setSaveError('')
    savingRef.current = true
    try {
      await onSave(values)
      onClose()
    } catch (error) {
      setSaveError(error.message || 'The announcement could not be saved. Please try again.')
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
      'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `announcement-${name}-error` : undefined,
    }
  }
  function fieldError(name) {
    return errors[name] && <small className="field-error" id={`announcement-${name}-error`}>{errors[name].message}</small>
  }

  if (discarding) return <ConfirmationModal title="Discard announcement?" confirmLabel="Discard changes"
    onCancel={() => setDiscarding(false)} onConfirm={onClose}>
    <p>Your announcement has not been saved. Close this form and discard your changes?</p>
  </ConfirmationModal>

  return <Modal className="announcement-modal" title={<><Icon name="megaphone" size={25} />Post New Announcement</>} onClose={close}>
    <form onSubmit={(event) => handleSubmit(submit)(event)} noValidate aria-busy={saving}>
      <div className="form-grid announcement-fields">
        <label>Announcement title <span>*</span>
          <input {...fieldProps('title')} placeholder="e.g. Annual IT Systems Maintenance Schedule" maxLength={150} required />
          {fieldError('title')}
        </label>
        <label>Target audience <span>*</span>
          <select {...fieldProps('targetAudience')} required>
            {ANNOUNCEMENT_AUDIENCES.map((audience) => <option key={audience.value} value={audience.value}>{audience.label}</option>)}
          </select>
          {fieldError('targetAudience')}
        </label>
        <label>Announcement body <span>*</span>
          <textarea {...fieldProps('content')} placeholder="Official notice details…" rows={5} maxLength={5000} required />
          {fieldError('content')}
        </label>
      </div>
      {saveError && <p className="form-error" role="alert">{saveError}</p>}
      <div className="modal-actions">
        <button type="button" className="button button-secondary" onClick={close} disabled={saving}>Cancel</button>
        <button type="submit" className="button button-primary" disabled={saving}>Broadcast Notice</button>
      </div>
    </form>
  </Modal>
}
