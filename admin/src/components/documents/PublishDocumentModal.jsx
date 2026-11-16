import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { documentSchema } from '../../utils/validation/communicationsSchemas.js'
import { showFormErrors } from '../../utils/validation/formErrors.js'
import Modal from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { DOCUMENT_ACCEPT, DOCUMENT_AUDIENCES, documentFileSize, validateDocumentRules } from '../../services/communications/documentService.js'

const EMPTY_DOCUMENT = { title: '', targetAudience: 'EMPLOYEES', source: 'FILE', file: null, url: '' }

export default function PublishDocumentModal({ onSave, onClose, onDirtyChange }) {
  const { register, control, handleSubmit, setValue, setError, clearErrors,
    formState: { errors, isDirty, isSubmitting: saving },
  } = useForm({
    defaultValues: EMPTY_DOCUMENT,
    resolver: zodResolver(documentSchema, undefined, { raw: true }),
    shouldFocusError: false,
  })
  const values = useWatch({ control })
  const [saveError, setSaveError] = useState('')
  const [discarding, setDiscarding] = useState(false)
  const savingRef = useRef(false)
  const formRef = useRef(null)
  const fileRef = useRef(null)
  // RHF cannot compare File contents, so track the selected upload explicitly.
  const dirty = isDirty || !!values.file

  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])

  function changeFile(file) {
    setValue('file', file, { shouldDirty: true })
    clearErrors('file')
    setSaveError('')
  }

  function focusField(name) {
    const field = formRef.current?.querySelector(`[name="${name}"]`)
    field?.focus()
  }
  function invalid(nextErrors) {
    focusField(Object.keys(nextErrors)[0])
  }

  function close() {
    if (saving || savingRef.current) return
    if (dirty) setDiscarding(true)
    else onClose()
  }

  async function submit(values) {
    if (savingRef.current) return
    setSaveError('')
    if (showFormErrors(validateDocumentRules(values), setError, focusField)) return
    savingRef.current = true
    try {
      await onSave(values)
      onClose()
    } catch (error) {
      setSaveError(error.message || 'The document could not be saved. Please try again.')
    } finally {
      savingRef.current = false
    }
  }

  function fieldProps(name) {
    return {
      ...register(name, { onChange: () => {
        clearErrors(name === 'source' ? ['source', 'file', 'url'] : name)
        setSaveError('')
      } }), disabled: saving,
      'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `document-${name}-error` : undefined,
    }
  }
  function fieldError(name) {
    return errors[name] && <small className="field-error" id={`document-${name}-error`}>{errors[name].message}</small>
  }

  return <><Modal className="document-modal" title={<><Icon name="folder" size={25} />Publish Institutional Document</>} onClose={close}>
    <form ref={formRef} onSubmit={(event) => handleSubmit(submit, invalid)(event)} noValidate aria-busy={saving}>
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
              <input type="radio" value="FILE" {...fieldProps('source')} />
              <Icon name="upload" size={18} />Upload a file
            </label>
            <label className={values.source === 'URL' ? 'selected' : ''}>
              <input type="radio" value="URL" {...fieldProps('source')} />
              <Icon name="external-link" size={18} />Use a URL
            </label>
          </div>
          {fieldError('source')}
        </fieldset>
        <div className="document-upload-field" hidden={values.source !== 'FILE'}>
          <label htmlFor="document-file">Document file <span>*</span></label>
          <input ref={fileRef} id="document-file" name="file" type="file" disabled={saving} accept={DOCUMENT_ACCEPT}
            aria-invalid={!!errors.file} aria-describedby={`document-file-help${errors.file ? ' document-file-error' : ''}`}
            onChange={(event) => changeFile(event.target.files[0] ?? null)} />
          <small id="document-file-help" className="document-help">PDF, Word, Excel, PowerPoint, text, CSV, JPG, or PNG. Maximum 10 MB.</small>
          {values.file && <div className="document-selected-file" role="status">
            <Icon name="file" size={21} />
            <span><strong>{values.file.name}</strong><small>{documentFileSize(values.file.size)}</small></span>
            <button type="button" className="icon-button" aria-label="Remove selected file" disabled={saving} onClick={() => {
              changeFile(null)
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
        <button type="button" className="button button-secondary" onClick={close} disabled={saving}>Cancel</button>
        <button type="submit" className="button button-primary" disabled={saving}>Publish Document</button>
      </div>
    </form>
  </Modal>
    {discarding && <ConfirmationModal title="Discard document?" confirmLabel="Discard changes"
      onCancel={() => setDiscarding(false)} onConfirm={onClose}>
      <p>Your document has not been saved. Close this form and discard your changes?</p>
    </ConfirmationModal>}
  </>
}
