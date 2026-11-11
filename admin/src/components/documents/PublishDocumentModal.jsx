import { useRef, useState } from 'react'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { DOCUMENT_ACCEPT, DOCUMENT_AUDIENCES, documentFileSize, validateDocument } from '../../services/communications/documentService.js'

const EMPTY_DOCUMENT = { title: '', targetAudience: 'EMPLOYEES', source: 'FILE', file: null, url: '' }

export default function PublishDocumentModal({ onSave, onClose, onDirtyChange }) {
  const [values, setValues] = useState(EMPTY_DOCUMENT)
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const [discarding, setDiscarding] = useState(false)
  const formRef = useRef(null)
  const fileRef = useRef(null)
  const dirty = Object.keys(values).some((key) => values[key] !== EMPTY_DOCUMENT[key])

  function change(name, value) {
    const next = { ...values, [name]: value }
    setValues(next)
    setErrors((current) => name === 'source' ? { ...current, source: undefined, file: undefined, url: undefined }
      : { ...current, [name]: undefined })
    setSaveError('')
    onDirtyChange(Object.keys(next).some((key) => next[key] !== EMPTY_DOCUMENT[key]))
  }

  function close() {
    if (dirty) setDiscarding(true)
    else onClose()
  }

  function submit(event) {
    event.preventDefault()
    const nextErrors = validateDocument(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      formRef.current.querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus()
      return
    }
    try {
      onSave(values)
      onClose()
    } catch (error) {
      setSaveError(error.message || 'The document could not be saved. Please try again.')
    }
  }

  function fieldProps(name) {
    return {
      name, value: values[name], onChange: (event) => change(name, event.target.value),
      'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `document-${name}-error` : undefined,
    }
  }
  function fieldError(name) {
    return errors[name] && <small className="field-error" id={`document-${name}-error`}>{errors[name]}</small>
  }

  return <><Modal className="document-modal" title={<><Icon name="folder" size={25} />Publish Institutional Document</>} onClose={close}>
    <form ref={formRef} onSubmit={submit} noValidate>
      <div className="form-grid document-fields">
        <label>Document title <span>*</span>
          <input {...fieldProps('title')} placeholder="e.g. Code of Conduct & IT Security Policy 2026" maxLength={150} required />
          {fieldError('title')}
        </label>
        <label>Target audience <span>*</span>
          <select {...fieldProps('targetAudience')} required>
            {DOCUMENT_AUDIENCES.map((audience) => <option key={audience.value} value={audience.value}>{audience.label}</option>)}
          </select>
          {fieldError('targetAudience')}
        </label>
        <fieldset className="document-source">
          <legend>Document source <span>*</span></legend>
          <div className="document-source-options">
            <label className={values.source === 'FILE' ? 'selected' : ''}>
              <input type="radio" name="source" value="FILE" checked={values.source === 'FILE'} onChange={() => change('source', 'FILE')} />
              <Icon name="upload" size={18} />Upload a file
            </label>
            <label className={values.source === 'URL' ? 'selected' : ''}>
              <input type="radio" name="source" value="URL" checked={values.source === 'URL'} onChange={() => change('source', 'URL')} />
              <Icon name="external-link" size={18} />Use a URL
            </label>
          </div>
          {fieldError('source')}
        </fieldset>
        <div className="document-upload-field" hidden={values.source !== 'FILE'}>
          <label htmlFor="document-file">Document file <span>*</span></label>
          <input ref={fileRef} id="document-file" name="file" type="file" accept={DOCUMENT_ACCEPT}
            aria-invalid={!!errors.file} aria-describedby={`document-file-help${errors.file ? ' document-file-error' : ''}`}
            onChange={(event) => { if (event.target.files[0]) change('file', event.target.files[0]) }} />
          <small id="document-file-help" className="document-help">PDF, Word, Excel, PowerPoint, text, CSV, JPG, or PNG. Maximum 10 MB.</small>
          {values.file && <div className="document-selected-file" role="status">
            <Icon name="file" size={21} />
            <span><strong>{values.file.name}</strong><small>{documentFileSize(values.file.size)}</small></span>
            <button type="button" className="icon-button" aria-label="Remove selected file" onClick={() => {
              change('file', null)
              if (fileRef.current) fileRef.current.value = ''
            }}><Icon name="close" size={17} /></button>
          </div>}
          {fieldError('file')}
        </div>
        <label hidden={values.source !== 'URL'}>File URL / cloud storage link <span>*</span>
          <input {...fieldProps('url')} type="url" placeholder="https://drive.google.com/file/… or a direct file link" maxLength={2048}
            aria-describedby={`document-url-help${errors.url ? ' document-url-error' : ''}`} required />
          <small id="document-url-help" className="document-help">Use a link that your selected audience can open. Sharing permissions are managed by the file owner.</small>
          {fieldError('url')}
        </label>
      </div>
      {saveError && <p className="form-error" role="alert">{saveError}</p>}
      <div className="modal-actions">
        <button type="button" className="button button-secondary" onClick={close}>Cancel</button>
        <button type="submit" className="button button-primary">Publish Document</button>
      </div>
    </form>
  </Modal>
    {discarding && <ConfirmationModal title="Discard document?" confirmLabel="Discard changes"
      onCancel={() => setDiscarding(false)} onConfirm={onClose}>
      <p>Your document has not been saved. Close this form and discard your changes?</p>
    </ConfirmationModal>}
  </>
}
