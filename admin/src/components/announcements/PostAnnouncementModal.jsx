import { useRef, useState } from 'react'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { ANNOUNCEMENT_AUDIENCES, validateAnnouncement } from '../../services/communications/announcementService.js'

const EMPTY_ANNOUNCEMENT = { title: '', targetAudience: 'ALL', content: '' }

export default function PostAnnouncementModal({ onSave, onClose, onDirtyChange }) {
  const [values, setValues] = useState(EMPTY_ANNOUNCEMENT)
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const [discarding, setDiscarding] = useState(false)
  const formRef = useRef(null)
  const dirty = Object.keys(values).some((key) => values[key] !== EMPTY_ANNOUNCEMENT[key])

  function change(name, value) {
    const next = { ...values, [name]: value }
    setValues(next)
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSaveError('')
    onDirtyChange(Object.keys(next).some((key) => next[key] !== EMPTY_ANNOUNCEMENT[key]))
  }

  function close() {
    if (dirty) setDiscarding(true)
    else onClose()
  }

  function submit(event) {
    event.preventDefault()
    const nextErrors = validateAnnouncement(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      formRef.current.elements.namedItem(Object.keys(nextErrors)[0])?.focus()
      return
    }
    try {
      onSave(values)
      onClose()
    } catch (error) {
      setSaveError(error.message || 'The announcement could not be saved. Please try again.')
    }
  }

  function fieldProps(name) {
    return {
      name, value: values[name], onChange: (event) => change(name, event.target.value),
      'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `announcement-${name}-error` : undefined,
    }
  }
  function fieldError(name) {
    return errors[name] && <small className="field-error" id={`announcement-${name}-error`}>{errors[name]}</small>
  }

  if (discarding) return <ConfirmationModal title="Discard announcement?" confirmLabel="Discard changes"
    onCancel={() => setDiscarding(false)} onConfirm={onClose}>
    <p>Your announcement has not been saved. Close this form and discard your changes?</p>
  </ConfirmationModal>

  return <Modal className="announcement-modal" title={<><Icon name="megaphone" size={25} />Post New Announcement</>} onClose={close}>
    <form ref={formRef} onSubmit={submit} noValidate>
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
        <button type="button" className="button button-secondary" onClick={close}>Cancel</button>
        <button type="submit" className="button button-primary">Broadcast Notice</button>
      </div>
    </form>
  </Modal>
}
