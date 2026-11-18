import Button, { IconButton } from '../common/Button.jsx'
import { FormInput, FormSelect } from '../common/FormFields.jsx'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { documentSchema } from '../../utils/validation/communicationsSchemas.js'
import { showFormErrors } from '../../utils/validation/formErrors.js'
import Modal, { ModalActions } from '../common/Modal.jsx'
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
    return errors[name] && <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id={`document-${name}-error`}>{errors[name].message}</small>
  }

  return <><Modal size="medium" className="document-modal tw:[&_.modal-heading_h2]:flex tw:[&_.modal-heading_h2]:items-center
          tw:[&_.modal-heading_h2]:gap-[12px] tw:[&_.modal-heading_h2_svg]:shrink-0
          tw:[&_.modal-heading_h2_svg]:[color:#245a91]
          tw:[@media(width<=700px)]:[&_.modal-heading_h2]:text-[19px]" title={<><Icon name="folder" size={25} />Publish Institutional Document</>} onClose={close}>
    <form ref={formRef} onSubmit={(event) => handleSubmit(submit, invalid)(event)} noValidate aria-busy={saving}>
      <div className="form-grid document-fields tw:shared-base:grid tw:shared-base:grid-cols-[repeat(2,_minmax(0,_1fr))]
          tw:shared-base:gap-[20px] tw:shared-base:[&_label]:block tw:shared-base:[&_label]:text-[12px]
          tw:shared-base:[&_label]:font-semibold tw:shared-base:[&_label]:[color:var(--text-secondary)]
          tw:shared-base:[&_label_>_span]:[color:#c75560]
          tw:max-[480px]:shared-base:grid-cols-[minmax(0,_1fr)]
          tw:max-[480px]:shared-base:gap-[17px] tw:grid-cols-[minmax(0,_1fr)] tw:gap-[22px]
          tw:[&_>_[hidden]]:hidden tw:[&_input]:min-w-0 tw:[&_input]:w-full tw:[&_input]:rounded-[9px]
          tw:[&_input]:min-h-[44px] tw:[&_select]:min-w-0 tw:[&_select]:w-full tw:[&_select]:rounded-[9px]
          tw:[&_select]:min-h-[44px] tw:[&_[aria-invalid='true']]:[border-color:#b42344]
          tw:[@media(width<=700px)]:[&_input]:text-[16px]
          tw:[@media(width<=700px)]:[&_select]:text-[16px]">
        <label>Document title <span>*</span>
          <FormInput {...fieldProps('title')} placeholder="e.g. Code of Conduct & IT Security Policy 2026" maxLength={150} required />
          {fieldError('title')}
        </label>
        <label>Target audience <span>*</span>
          <FormSelect {...fieldProps('targetAudience')} required>
            {DOCUMENT_AUDIENCES.map((audience) => <option key={audience.value} value={audience.value}>{audience.label}</option>)}
          </FormSelect>
          {fieldError('targetAudience')}
        </label>
        <fieldset className="document-source tw:p-[0] tw:m-[0] tw:[border:0] tw:min-w-0 tw:[&_legend]:mb-[10px] tw:[&_legend]:text-[12px]
          tw:[&_legend]:font-semibold tw:[&_legend]:[color:var(--text-secondary)]
          tw:[&_legend_>_span]:[color:#b42344]">
          <legend>Document source <span>*</span></legend>
          <div className="document-source-options tw:flex tw:gap-[12px] tw:[&_label]:flex tw:[&_label]:flex-1 tw:[&_label]:items-center
          tw:[&_label]:gap-[9px] tw:[&_label]:p-[12px] tw:[&_label]:[border:1px_solid_var(--border)]
          tw:[&_label]:rounded-[9px] tw:[&_label]:cursor-pointer tw:[&_label.selected]:[border-color:#245a91]
          tw:[&_label.selected]:[color:#245a91] tw:[&_label.selected]:[background:#f1f7ff] tw:[&_input]:w-[16px]
          tw:[&_input]:h-[16px] tw:[&_input]:min-h-[0] tw:[&_input]:m-[0]
          tw:[&_input]:[accent-color:var(--primary)] tw:[@media(width<=420px)]:flex-col">
            <label className={values.source === "FILE" ? "selected" : ""}>
              <FormInput type="radio" value="FILE" {...fieldProps('source')} />
              <Icon name="upload" size={18} />Upload a file
            </label>
            <label className={values.source === "URL" ? "selected" : ""}>
              <FormInput type="radio" value="URL" {...fieldProps('source')} />
              <Icon name="external-link" size={18} />Use a URL
            </label>
          </div>
          {fieldError('source')}
        </fieldset>
        <div className="document-upload-field tw:grid tw:gap-[9px] tw:[&_input[type='file']]:h-[auto] tw:[&_input[type='file']]:p-[9px]
          tw:[&_input[type='file']]:[background:#f8fafc] tw:[&_input::file-selector-button]:p-[7px_10px]
          tw:[&_input::file-selector-button]:mr-[10px]
          tw:[&_input::file-selector-button]:[border:1px_solid_var(--border)]
          tw:[&_input::file-selector-button]:rounded-[5px]
          tw:[&_input::file-selector-button]:[background:var(--surface)]
          tw:[&_input::file-selector-button]:[color:var(--text-primary)]
          tw:[&_input::file-selector-button]:[font:inherit] tw:[&_input::file-selector-button]:cursor-pointer" hidden={values.source !== 'FILE'}>
          <label htmlFor="document-file">Document file <span>*</span></label>
          <FormInput ref={fileRef} id="document-file" name="file" type="file" disabled={saving} accept={DOCUMENT_ACCEPT}
            aria-invalid={!!errors.file} aria-describedby={`document-file-help${errors.file ? ' document-file-error' : ''}`}
            onChange={(event) => changeFile(event.target.files[0] ?? null)} />
          <small id="document-file-help" className="document-help tw:block tw:[color:var(--text-muted)] tw:font-normal tw:text-[12px] tw:leading-[1.6]">PDF, Word, Excel, PowerPoint, text, CSV, JPG, or PNG. Maximum 10 MB.</small>
          {values.file && <div className="document-selected-file tw:flex tw:items-center tw:gap-[12px] tw:p-[12px] tw:rounded-[9px] tw:[background:#f1f7ff]
          tw:[color:#245a91] tw:[&_>_svg]:shrink-0 tw:[&_>_span]:flex-1 tw:[&_>_span]:min-w-0 tw:[&_strong]:block
          tw:[&_strong]:[overflow-wrap:anywhere] tw:[&_strong]:text-[12px] tw:[&_small]:block tw:[&_small]:mt-[3px]
          tw:[&_small]:[color:var(--text-muted)]" role="status">
            <Icon name="file" size={21} />
            <span><strong>{values.file.name}</strong><small>{documentFileSize(values.file.size)}</small></span>
            <IconButton type="button" aria-label="Remove selected file" disabled={saving} onClick={() => {
              changeFile(null)
              if (fileRef.current) fileRef.current.value = ''
            }}><Icon name="close" size={17} /></IconButton>
          </div>}
          {fieldError('file')}
        </div>
        <label hidden={values.source !== 'URL'}>File URL / cloud storage link <span>*</span>
          <FormInput {...fieldProps('url')} type="url" placeholder="https://drive.google.com/file/… or a direct file link" maxLength={2048}
            aria-describedby={`document-url-help${errors.url ? ' document-url-error' : ''}`} required />
          <small id="document-url-help" className="document-help tw:block tw:[color:var(--text-muted)] tw:font-normal tw:text-[12px] tw:leading-[1.6]">Use a link that your selected audience can open. Sharing permissions are managed by the file owner.</small>
          {fieldError('url')}
        </label>
      </div>
      {saveError && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{saveError}</p>}
      <ModalActions >
        <Button variant="secondary" type="button" onClick={close} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>Publish Document</Button>
      </ModalActions>
    </form>
  </Modal>
    {discarding && <ConfirmationModal title="Discard document?" confirmLabel="Discard changes"
      onCancel={() => setDiscarding(false)} onConfirm={onClose}>
      <p>Your document has not been saved. Close this form and discard your changes?</p>
    </ConfirmationModal>}
  </>
}
