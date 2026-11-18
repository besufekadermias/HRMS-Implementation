import Button from '../common/Button.jsx'
import { FormInput, FormSelect, FormTextarea } from '../common/FormFields.jsx'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getServiceSchema } from '../../utils/validation/communicationsSchemas.js'
import { showFormErrors } from '../../utils/validation/formErrors.js'
import Modal, { ModalActions } from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { EMPTY_SERVICE, SERVICE_TYPES, validateServiceRules } from '../../services/communications/publicServiceService.js'

export default function ServiceFormModal({ service, onSave, onClose, onDirtyChange }) {
  const [initial] = useState(() => ({ ...EMPTY_SERVICE, ...service }))
  const { register, control, handleSubmit, setError, clearErrors,
    formState: { errors, isDirty, isSubmitting: saving },
  } = useForm({
    defaultValues: initial,
    resolver: (values, context, options) => zodResolver(getServiceSchema(values.type), undefined, { raw: true })(values, context, options),
    shouldFocusError: false,
  })
  const values = useWatch({ control })
  const [saveError, setSaveError] = useState('')
  const [discarding, setDiscarding] = useState(false)
  const savingRef = useRef(false)
  const formRef = useRef(null)
  const dirty = isDirty

  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])

  function focusField(name) {
    const field = formRef.current?.querySelector(`[name="${name}"]`)
    const details = field?.closest('details')
    if (details) details.open = true
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
    if (showFormErrors(validateServiceRules(values), setError, focusField)) return
    savingRef.current = true
    try {
      await onSave(values)
      onClose()
    } catch (error) {
      setSaveError(error.message || 'The service could not be saved. Please try again.')
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
      'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `service-${name}-error` : undefined,
    }
  }
  function fieldError(name) {
    return errors[name] && <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id={`service-${name}-error`}>{errors[name].message}</small>
  }

  return <><Modal size="service" className="service-modal tw:[&_.modal-heading_h2]:flex tw:[&_.modal-heading_h2]:items-center
          tw:[&_.modal-heading_h2]:gap-[10px] tw:[&_.modal-heading_h2_svg]:[color:var(--primary)]" title={<><Icon name="globe" size={24} />{service ? 'Edit Service' : 'Add Service'}</>} onClose={close}>
    <form ref={formRef} onSubmit={(event) => handleSubmit(submit, invalid)(event)} noValidate aria-busy={saving}>
      <div className="form-grid service-fields tw:shared-base:grid tw:shared-base:grid-cols-[repeat(2,_minmax(0,_1fr))]
          tw:shared-base:gap-[20px] tw:shared-base:[&_label]:block tw:shared-base:[&_label]:text-[12px]
          tw:shared-base:[&_label]:font-semibold tw:shared-base:[&_label]:[color:var(--text-secondary)]
          tw:shared-base:[&_label_>_span]:[color:#c75560]
          tw:max-[480px]:shared-base:grid-cols-[minmax(0,_1fr)]
          tw:max-[480px]:shared-base:gap-[17px] tw:gap-[18px] tw:[&_input]:min-h-[42px]
          tw:[&_select]:min-h-[42px] tw:[&_textarea]:min-h-[80px]
          tw:[&_[aria-invalid='true']]:[border-color:#b42344]
          tw:[@media(width<=600px)]:grid-cols-[minmax(0,_1fr)]
          tw:[@media(width<=600px)]:[&_input]:text-[16px]
          tw:[@media(width<=600px)]:[&_select]:text-[16px]
          tw:[@media(width<=600px)]:[&_textarea]:text-[16px]">
        <label className="full-width tw:shared-base:col-[1_/_-1]">Service name <span>*</span>
          <FormInput {...fieldProps('title')} maxLength={150} placeholder="e.g. Digital skills training" required />
          {fieldError('title')}
        </label>
        <label>Type <span>*</span>
          <FormSelect {...fieldProps('type')}>{SERVICE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</FormSelect>
          {fieldError('type')}
        </label>
        <label>Publication status <span>*</span>
          <FormSelect {...fieldProps('status')}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></FormSelect>
          {fieldError('status')}
        </label>
        <p className="service-form-help full-width tw:shared-base:col-[1_/_-1] tw:m-[-7px_0_0] tw:[color:var(--text-muted)]
          tw:text-[12px] tw:leading-[1.6]">Drafts stay in HR management. Published services are included in the public catalog.</p>
        <label className="full-width tw:shared-base:col-[1_/_-1]">Description {values.status === 'PUBLISHED' && <span>*</span>}
          <FormTextarea {...fieldProps('description')} rows={3} maxLength={2000} placeholder="Explain the service or what participants will learn." />
          {fieldError('description')}
        </label>
        <label className="full-width tw:shared-base:col-[1_/_-1]">How to access or register {values.status === 'PUBLISHED' && <span>*</span>}
          <FormTextarea {...fieldProps('howToAccess')} rows={2} maxLength={1000} placeholder="Explain where to apply, who to contact, or how to register." />
          {fieldError('howToAccess')}
        </label>
      </div>
      <details className="service-extra-fields tw:mt-[20px] tw:[border-top:1px_solid_var(--border)] tw:[&_summary]:p-[16px_0]
          tw:[&_summary]:text-[13px] tw:[&_summary]:font-semibold tw:[&_summary]:[color:var(--text-secondary)]
          tw:[&_summary]:cursor-pointer">
        <summary>Additional details (optional)</summary>
        <div className="form-grid service-fields tw:shared-base:grid tw:shared-base:grid-cols-[repeat(2,_minmax(0,_1fr))]
          tw:shared-base:gap-[20px] tw:shared-base:[&_label]:block tw:shared-base:[&_label]:text-[12px]
          tw:shared-base:[&_label]:font-semibold tw:shared-base:[&_label]:[color:var(--text-secondary)]
          tw:shared-base:[&_label_>_span]:[color:#c75560]
          tw:max-[480px]:shared-base:grid-cols-[minmax(0,_1fr)]
          tw:max-[480px]:shared-base:gap-[17px] tw:gap-[18px] tw:[&_input]:min-h-[42px]
          tw:[&_select]:min-h-[42px] tw:[&_textarea]:min-h-[80px]
          tw:[&_[aria-invalid='true']]:[border-color:#b42344]
          tw:[@media(width<=600px)]:grid-cols-[minmax(0,_1fr)]
          tw:[@media(width<=600px)]:[&_input]:text-[16px]
          tw:[@media(width<=600px)]:[&_select]:text-[16px]
          tw:[@media(width<=600px)]:[&_textarea]:text-[16px]">
          <label className="full-width tw:shared-base:col-[1_/_-1]">Eligibility &amp; requirements
            <FormTextarea {...fieldProps('requirements')} rows={2} maxLength={1000} placeholder="Who can apply and what they should bring." />
            {fieldError('requirements')}
          </label>
          <label>Location
            <FormInput {...fieldProps('location')} maxLength={200} placeholder="Office, training venue, or online" />
            {fieldError('location')}
          </label>
          <label>Fees
            <FormInput {...fieldProps('fees')} maxLength={200} placeholder="e.g. Free, or the approved fee in ETB" />
            {fieldError('fees')}
          </label>
          {values.type === 'TRAINING' && <label className="full-width tw:shared-base:col-[1_/_-1]">Training schedule / duration
            <FormInput {...fieldProps('schedule')} maxLength={200} placeholder="Dates, meeting times, or course duration" />
            {fieldError('schedule')}
          </label>}
          <label className="full-width tw:shared-base:col-[1_/_-1]">Registration / service link
            <FormInput {...fieldProps('registrationUrl')} type="url" maxLength={2048} placeholder="https://…" />
            {fieldError('registrationUrl')}
          </label>
        </div>
      </details>
      {saveError && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{saveError}</p>}
      <ModalActions >
        <Button variant="secondary" type="button" onClick={close} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>{values.status === 'DRAFT' ? 'Save Draft' : 'Save & Publish'}</Button>
      </ModalActions>
    </form>
  </Modal>
    {discarding && <ConfirmationModal title="Discard service changes?" confirmLabel="Discard changes" onCancel={() => setDiscarding(false)} onConfirm={onClose}>
      <p>Your changes have not been saved. Close this form and discard them?</p>
    </ConfirmationModal>}
  </>
}
