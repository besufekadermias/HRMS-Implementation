import Button from '../common/Button.jsx'
import { FormSelect, FormInput, FormTextarea } from '../common/FormFields.jsx'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { disciplinaryActionFormSchema } from '../../utils/validation/growthSchemas.js'
import { showFormErrors } from '../../utils/validation/formErrors.js'
import Modal, { ModalActions } from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { SANCTIONS, validateDisciplinaryActionRules } from '../../services/growth/disciplineService.js'
import { todayInNairobi } from '../../utils/validation/validators.js'

export default function RecordDisciplinaryActionModal({ employees, onSave, onClose, onDirtyChange }) {
  const [initial] = useState(() => ({
    employeeId: '', incidentDate: todayInNairobi(), violationType: '', penaltyAction: 'WARNING', description: '',
  }))
  const { register, handleSubmit, setError, setFocus, clearErrors,
    formState: { errors, isDirty, isSubmitting: saving },
  } = useForm({
    defaultValues: initial,
    resolver: zodResolver(disciplinaryActionFormSchema, undefined, { raw: true }),
  })
  const [saveError, setSaveError] = useState('')
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const savingRef = useRef(false)
  const dirty = isDirty

  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])

  function close() {
    if (saving || savingRef.current) return
    if (dirty) setConfirmDiscard(true)
    else onClose()
  }

  async function submit(values) {
    if (savingRef.current) return
    setSaveError('')
    if (showFormErrors(validateDisciplinaryActionRules(values, employees), setError, setFocus)) return
    savingRef.current = true
    try {
      await onSave(values)
      onClose()
    } catch (error) {
      setSaveError(error.message || 'The record could not be saved. Please try again.')
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
      'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `discipline-${name}-error` : undefined,
    }
  }
  function fieldError(name) {
    return errors[name] && <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id={`discipline-${name}-error`}>{errors[name].message}</small>
  }

  if (confirmDiscard) return (
    <ConfirmationModal title="Discard disciplinary record?" confirmLabel="Discard changes"
      onCancel={() => setConfirmDiscard(false)} onConfirm={onClose}>
      <p>Your record has not been saved. Close this form and discard your changes?</p>
    </ConfirmationModal>
  )

  return (
    <Modal size="small" className="discipline-modal tw:[&_.modal-heading]:[border-bottom:0] tw:[&_.modal-heading]:pb-[0] tw:[&_.modal-heading_h2]:flex
          tw:[&_.modal-heading_h2]:items-center tw:[&_.modal-heading_h2]:gap-[10px]
          tw:[&_.modal-heading_h2_svg]:[color:#df0015]
          tw:[@media(width<=700px)]:[&_.modal-heading_h2]:text-[19px]" onClose={close}
      title={<><Icon name="alert-triangle" size={25} /> Record Disciplinary Action</>}>
      <form onSubmit={(event) => handleSubmit(submit)(event)} noValidate aria-busy={saving}>
        <fieldset className="discipline-fields form-grid tw:shared-base:grid tw:shared-base:grid-cols-[repeat(2,_minmax(0,_1fr))]
          tw:shared-base:gap-[20px] tw:shared-base:[&_label]:block tw:shared-base:[&_label]:text-[12px]
          tw:shared-base:[&_label]:font-semibold tw:shared-base:[&_label]:[color:var(--text-secondary)]
          tw:shared-base:[&_label_>_span]:[color:#c75560]
          tw:max-[480px]:shared-base:grid-cols-[minmax(0,_1fr)]
          tw:max-[480px]:shared-base:gap-[17px] tw:grid-cols-[minmax(0,_1fr)] tw:gap-[20px]
          tw:[border:0] tw:p-[0] tw:m-[0] tw:min-w-0 tw:[&_label]:uppercase tw:[&_label]:tracking-[.6px]
          tw:[&_input]:normal-case tw:[&_input]:tracking-[normal] tw:[&_input]:rounded-[10px]
          tw:[&_input]:min-h-[44px] tw:[&_select]:normal-case tw:[&_select]:tracking-[normal]
          tw:[&_select]:rounded-[10px] tw:[&_select]:min-h-[44px] tw:[&_textarea]:normal-case
          tw:[&_textarea]:tracking-[normal] tw:[&_textarea]:rounded-[10px] tw:[&_textarea]:min-h-[44px]
          tw:[&_textarea]:min-h-[100px] tw:[&_.field-error]:normal-case tw:[&_.field-error]:tracking-[normal]
          tw:[&_[aria-invalid='true']]:[border-color:#b42344]" disabled={saving}>
          <legend className="sr-only tw:sr-only">Disciplinary action details</legend>
          <label>Employee <span>*</span>
            <FormSelect {...fieldProps('employeeId')} required>
              <option value="">Select Employee</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>
                {employee.name} · {employee.id} · {employee.department}
              </option>)}
            </FormSelect>
            {fieldError('employeeId')}
          </label>
          <label>Incident date <span>*</span>
            <FormInput {...fieldProps('incidentDate')} type="date" min="1900-01-01" max={todayInNairobi()} required />
            {fieldError('incidentDate')}
          </label>
          <label>Violation type <span>*</span>
            <FormInput {...fieldProps('violationType')} placeholder="e.g. Unauthorized Absence or IT Security Breach" maxLength={100} required />
            {fieldError('violationType')}
          </label>
          <label>Sanction / Penalty action <span>*</span>
            <FormSelect {...fieldProps('penaltyAction')} required>
              {SANCTIONS.map((sanction) => <option key={sanction.value} value={sanction.value}>{sanction.label.toUpperCase()}</option>)}
            </FormSelect>
            {fieldError('penaltyAction')}
          </label>
          <label>Details / Explanation
            <FormTextarea {...fieldProps('description')} placeholder="Official memorandum notes…" rows={4} maxLength={5000} />
            {fieldError('description')}
          </label>
        </fieldset>
        {saveError && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{saveError}</p>}
        {!employees.length && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">Add an employee before recording a disciplinary action.</p>}
        <ModalActions >
          <Button variant="secondary" type="button" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="discipline" type="submit" disabled={saving || !employees.length}>
            {saving ? 'Saving Record…' : 'Save Record'}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
