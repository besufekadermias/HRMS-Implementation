import Button from '../common/Button.jsx'
import { FormInput, FormSelect, FormTextarea } from '../common/FormFields.jsx'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { announcementSchema } from '../../utils/validation/communicationsSchemas.js'
import Modal, { ModalActions } from '../common/Modal.jsx'
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
    return errors[name] && <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id={`announcement-${name}-error`}>{errors[name].message}</small>
  }

  if (discarding) return <ConfirmationModal title="Discard announcement?" confirmLabel="Discard changes"
    onCancel={() => setDiscarding(false)} onConfirm={onClose}>
    <p>Your announcement has not been saved. Close this form and discard your changes?</p>
  </ConfirmationModal>

  return <Modal size="medium" className="announcement-modal tw:[&_.modal-heading]:[border:0] tw:[&_.modal-heading]:pb-[0] tw:[&_.modal-heading_h2]:flex
          tw:[&_.modal-heading_h2]:items-center tw:[&_.modal-heading_h2]:gap-[12px]
          tw:[&_.modal-heading_h2_svg]:shrink-0 tw:[&_.modal-heading_h2_svg]:[color:#d9a426]
          tw:[@media(width<=700px)]:[&_.modal-heading_h2]:text-[19px]" title={<><Icon name="megaphone" size={25} />Post New Announcement</>} onClose={close}>
    <form onSubmit={(event) => handleSubmit(submit)(event)} noValidate aria-busy={saving}>
      <div className="form-grid announcement-fields tw:shared-base:grid tw:shared-base:grid-cols-[repeat(2,_minmax(0,_1fr))]
          tw:shared-base:gap-[20px] tw:shared-base:[&_label]:block tw:shared-base:[&_label]:text-[12px]
          tw:shared-base:[&_label]:font-semibold tw:shared-base:[&_label]:[color:var(--text-secondary)]
          tw:shared-base:[&_label_>_span]:[color:#c75560]
          tw:max-[480px]:shared-base:grid-cols-[minmax(0,_1fr)]
          tw:max-[480px]:shared-base:gap-[17px] tw:grid-cols-[minmax(0,_1fr)] tw:gap-[24px]
          tw:[&_label]:uppercase tw:[&_label]:tracking-[.6px] tw:[&_input]:normal-case
          tw:[&_input]:tracking-[normal] tw:[&_input]:rounded-[10px] tw:[&_input]:min-h-[44px]
          tw:[&_select]:normal-case tw:[&_select]:tracking-[normal] tw:[&_select]:rounded-[10px]
          tw:[&_select]:min-h-[44px] tw:[&_textarea]:normal-case tw:[&_textarea]:tracking-[normal]
          tw:[&_textarea]:rounded-[10px] tw:[&_textarea]:min-h-[44px] tw:[&_textarea]:min-h-[150px]
          tw:[&_textarea]:resize-y tw:[&_.field-error]:normal-case tw:[&_.field-error]:tracking-[normal]
          tw:[&_[aria-invalid='true']]:[border-color:#b42344]">
        <label>Announcement title <span>*</span>
          <FormInput {...fieldProps('title')} placeholder="e.g. Annual IT Systems Maintenance Schedule" maxLength={150} required />
          {fieldError('title')}
        </label>
        <label>Target audience <span>*</span>
          <FormSelect {...fieldProps('targetAudience')} required>
            {ANNOUNCEMENT_AUDIENCES.map((audience) => <option key={audience.value} value={audience.value}>{audience.label}</option>)}
          </FormSelect>
          {fieldError('targetAudience')}
        </label>
        <label>Announcement body <span>*</span>
          <FormTextarea {...fieldProps('content')} placeholder="Official notice details…" rows={5} maxLength={5000} required />
          {fieldError('content')}
        </label>
      </div>
      {saveError && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{saveError}</p>}
      <ModalActions >
        <Button variant="secondary" type="button" onClick={close} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>Broadcast Notice</Button>
      </ModalActions>
    </form>
  </Modal>
}
