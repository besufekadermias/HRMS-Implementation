import { useRef, useState } from 'react'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { EMPTY_SERVICE, SERVICE_TYPES, validateService } from '../../services/communications/publicServiceService.js'

export default function ServiceFormModal({ service, onSave, onClose, onDirtyChange }) {
  const [initial] = useState(() => ({ ...EMPTY_SERVICE, ...service }))
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const [discarding, setDiscarding] = useState(false)
  const formRef = useRef(null)
  const dirty = Object.keys(EMPTY_SERVICE).some((key) => values[key] !== initial[key])

  function change(name, value) {
    const next = { ...values, [name]: value }
    setValues(next)
    setErrors({})
    setSaveError('')
    onDirtyChange(Object.keys(EMPTY_SERVICE).some((key) => next[key] !== initial[key]))
  }

  function close() {
    if (dirty) setDiscarding(true)
    else onClose()
  }

  function submit(event) {
    event.preventDefault()
    const nextErrors = validateService(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      const field = formRef.current.elements.namedItem(Object.keys(nextErrors)[0])
      const details = field?.closest('details')
      if (details) details.open = true
      field?.focus()
      return
    }
    try {
      onSave(values)
      onClose()
    } catch (error) {
      setSaveError(error.message || 'The service could not be saved. Please try again.')
    }
  }

  function fieldProps(name) {
    return {
      name, value: values[name], onChange: (event) => change(name, event.target.value),
      'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `service-${name}-error` : undefined,
    }
  }
  function fieldError(name) {
    return errors[name] && <small className="field-error" id={`service-${name}-error`}>{errors[name]}</small>
  }

  return <><Modal className="service-modal" title={<><Icon name="globe" size={24} />{service ? 'Edit Service' : 'Add Service'}</>} onClose={close}>
    <form ref={formRef} onSubmit={submit} noValidate>
      <div className="form-grid service-fields">
        <label className="full-width">Service name <span>*</span>
          <input {...fieldProps('title')} maxLength={150} placeholder="e.g. Digital skills training" required />
          {fieldError('title')}
        </label>
        <label>Type <span>*</span>
          <select {...fieldProps('type')}>{SERVICE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select>
          {fieldError('type')}
        </label>
        <label>Publication status <span>*</span>
          <select {...fieldProps('status')}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select>
          {fieldError('status')}
        </label>
        <p className="service-form-help full-width">Drafts stay in HR management. Published services are included in the public catalog.</p>
        <label className="full-width">Description {values.status === 'PUBLISHED' && <span>*</span>}
          <textarea {...fieldProps('description')} rows={3} maxLength={2000} placeholder="Explain the service or what participants will learn." />
          {fieldError('description')}
        </label>
        <label className="full-width">How to access or register {values.status === 'PUBLISHED' && <span>*</span>}
          <textarea {...fieldProps('howToAccess')} rows={2} maxLength={1000} placeholder="Explain where to apply, who to contact, or how to register." />
          {fieldError('howToAccess')}
        </label>
      </div>
      <details className="service-extra-fields">
        <summary>Additional details (optional)</summary>
        <div className="form-grid service-fields">
          <label className="full-width">Eligibility &amp; requirements
            <textarea {...fieldProps('requirements')} rows={2} maxLength={1000} placeholder="Who can apply and what they should bring." />
            {fieldError('requirements')}
          </label>
          <label>Location
            <input {...fieldProps('location')} maxLength={200} placeholder="Office, training venue, or online" />
            {fieldError('location')}
          </label>
          <label>Fees
            <input {...fieldProps('fees')} maxLength={200} placeholder="e.g. Free, or the approved fee in ETB" />
            {fieldError('fees')}
          </label>
          {values.type === 'TRAINING' && <label className="full-width">Training schedule / duration
            <input {...fieldProps('schedule')} maxLength={200} placeholder="Dates, meeting times, or course duration" />
            {fieldError('schedule')}
          </label>}
          <label className="full-width">Registration / service link
            <input {...fieldProps('registrationUrl')} type="url" maxLength={2048} placeholder="https://…" />
            {fieldError('registrationUrl')}
          </label>
        </div>
      </details>
      {saveError && <p className="form-error" role="alert">{saveError}</p>}
      <div className="modal-actions">
        <button type="button" className="button button-secondary" onClick={close}>Cancel</button>
        <button type="submit" className="button button-primary">{values.status === 'DRAFT' ? 'Save Draft' : 'Save & Publish'}</button>
      </div>
    </form>
  </Modal>
    {discarding && <ConfirmationModal title="Discard service changes?" confirmLabel="Discard changes" onCancel={() => setDiscarding(false)} onConfirm={onClose}>
      <p>Your changes have not been saved. Close this form and discard them?</p>
    </ConfirmationModal>}
  </>
}
