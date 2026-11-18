import Button from '../common/Button.jsx'
import { FormSelect, FormInput, FormTextarea } from '../common/FormFields.jsx'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { careerMilestoneFormSchema } from '../../utils/validation/growthSchemas.js'
import { showFormErrors } from '../../utils/validation/formErrors.js'
import Modal, { ModalActions } from '../common/Modal.jsx'
import ConfirmationModal from '../common/ConfirmationModal.jsx'
import Icon from '../common/Icon.jsx'
import { MILESTONE_TYPES, careerChangeContext, validateCareerMilestoneRules } from '../../services/growth/careerService.js'
import { todayInNairobi } from '../../utils/validation/validators.js'
import formatCurrency from '../../utils/formatters/formatCurrency.js'
import formatDate from '../../utils/formatters/formatDate.js'

export default function CareerMilestoneModal({ milestones, employees, grades, onSave, onClose, onDirtyChange }) {
  const [initial] = useState(() => ({
    employeeId: '', milestoneType: 'PROMOTION', effectiveDate: todayInNairobi(),
    previousGradeId: '', newGradeId: '', description: '',
    expectedEmployeeGrade: null, expectedEmployeeSalary: null, expectedNewSalary: null,
  }))
  const { register, control, handleSubmit, setValue, setError, setFocus, clearErrors,
    formState: { errors, isDirty, isSubmitting: saving },
  } = useForm({
    defaultValues: initial,
    resolver: zodResolver(careerMilestoneFormSchema, undefined, { raw: true }),
  })
  const values = useWatch({ control })
  const [saveError, setSaveError] = useState('')
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const savingRef = useRef(false)
  const dirty = isDirty

  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])
  const { employee, previousGrade, newGrade, historical, scheduled } = careerChangeContext(values, milestones, employees, grades)
  const needsGrade = values.milestoneType !== 'AWARD_MILESTONE'
  const submitLabel = scheduled ? 'Schedule Milestone' : historical ? 'Record Historical Milestone' : newGrade || needsGrade ? 'Confirm & Update Employee' : 'Record Milestone'

  function updateSelection(event) {
    const { name, value } = event.target
    if (name === 'employeeId') {
      const selected = employees.find((item) => item.id === value)
      setValue('previousGradeId', String(grades.find((grade) => grade.name === selected?.grade)?.id ?? ''), { shouldDirty: true })
      setValue('newGradeId', '', { shouldDirty: true })
      setValue('expectedEmployeeGrade', selected?.grade ?? null)
      setValue('expectedEmployeeSalary', selected?.basicSalary ?? null)
      setValue('expectedNewSalary', null)
      clearErrors()
    } else if (name === 'newGradeId') {
      setValue('expectedNewSalary', grades.find((grade) => String(grade.id) === value)?.salary ?? null)
    }
  }

  function close() {
    if (saving || savingRef.current) return
    if (dirty) setConfirmDiscard(true)
    else onClose()
  }

  async function submit(values) {
    if (savingRef.current) return
    setSaveError('')
    if (showFormErrors(validateCareerMilestoneRules(values, milestones, employees, grades), setError, setFocus)) return
    savingRef.current = true
    try {
      await onSave(values)
      onClose()
    } catch (error) {
      setSaveError(error.message || 'The milestone could not be saved. Please try again.')
    } finally {
      savingRef.current = false
    }
  }

  function fieldProps(name) {
    return { ...register(name, { onChange: (event) => {
        clearErrors(name)
        setSaveError('')
        updateSelection(event)
      } }), disabled: saving,
      'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `career-${name}-error` : undefined }
  }
  function fieldError(name) {
    return errors[name] && <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id={`career-${name}-error`}>{errors[name].message}</small>
  }

  if (confirmDiscard) return <ConfirmationModal title="Discard career milestone?" confirmLabel="Discard changes"
    onCancel={() => setConfirmDiscard(false)} onConfirm={onClose}>
    <p>Your milestone has not been saved. Close this form and discard your changes?</p>
  </ConfirmationModal>

  return (
    <Modal size="medium" className="career-modal tw:[&_.modal-heading]:[border-bottom:0] tw:[&_.modal-heading]:pb-[0] tw:[&_.modal-heading_h2]:flex
          tw:[&_.modal-heading_h2]:items-center tw:[&_.modal-heading_h2]:gap-[10px]
          tw:[&_.modal-heading_h2_svg]:[color:#d9a426]
          tw:[@media(width<=700px)]:[&_.modal-heading_h2]:text-[19px]
          tw:[@media(width<=700px)]:[&_.modal-heading_h2]:items-start
          tw:[@media(width<=480px)]:[&_.modal-actions]:flex-wrap
          tw:[@media(width<=480px)]:[&_.modal-actions_.button-primary]:flex-1" onClose={close} title={<><Icon name="star" size={25} /> Record Promotion or Career Milestone</>}>
      <form onSubmit={(event) => handleSubmit(submit)(event)} noValidate aria-busy={saving}>
        <fieldset className="career-fields form-grid tw:shared-base:grid tw:shared-base:grid-cols-[repeat(2,_minmax(0,_1fr))]
          tw:shared-base:gap-[20px] tw:shared-base:[&_label]:block tw:shared-base:[&_label]:text-[12px]
          tw:shared-base:[&_label]:font-semibold tw:shared-base:[&_label]:[color:var(--text-secondary)]
          tw:shared-base:[&_label_>_span]:[color:#c75560]
          tw:max-[480px]:shared-base:grid-cols-[minmax(0,_1fr)]
          tw:max-[480px]:shared-base:gap-[17px] tw:gap-[20px] tw:[border:0] tw:p-[0] tw:m-[0]
          tw:min-w-0 tw:[&_label]:uppercase tw:[&_label]:tracking-[.6px] tw:[&_input]:normal-case
          tw:[&_input]:tracking-[normal] tw:[&_input]:rounded-[10px] tw:[&_input]:min-h-[44px]
          tw:[&_select]:normal-case tw:[&_select]:tracking-[normal] tw:[&_select]:rounded-[10px]
          tw:[&_select]:min-h-[44px] tw:[&_textarea]:normal-case tw:[&_textarea]:tracking-[normal]
          tw:[&_textarea]:rounded-[10px] tw:[&_textarea]:min-h-[44px]
          tw:[&_select.career-new-grade]:[color:#087c42] tw:[&_select.career-new-grade]:font-semibold
          tw:[&_textarea]:min-h-[100px] tw:[&_.field-error]:normal-case tw:[&_.field-error]:tracking-[normal]
          tw:[&_[aria-invalid='true']]:[border-color:#b42344]
          tw:[@media(width<=480px)]:grid-cols-[minmax(0,_1fr)]" disabled={saving}>
          <legend className="sr-only tw:sr-only">Career milestone details</legend>
          <label className="full-width tw:shared-base:col-[1_/_-1]">Employee <span>*</span>
            <FormSelect {...fieldProps('employeeId')} required><option value="">Select Employee</option>
              {employees.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.id} · {item.department}</option>)}
            </FormSelect>{fieldError('employeeId')}
          </label>
          <label>Milestone type <span>*</span>
            <FormSelect {...fieldProps('milestoneType')} required>{MILESTONE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label.toUpperCase()}</option>)}</FormSelect>
            {fieldError('milestoneType')}
          </label>
          <label>Effective date <span>*</span>
            <FormInput {...fieldProps('effectiveDate')} type="date" min="1900-01-01" max="2100-12-31" required />{fieldError('effectiveDate')}
          </label>
          <label>Previous grade
            <FormSelect {...fieldProps('previousGradeId')}><option value="">None / Unchanged</option>
              {grades.map((grade) => <option key={grade.id} value={String(grade.id)}>{grade.name}</option>)}
            </FormSelect>{fieldError('previousGradeId')}
          </label>
          <label>New promoted grade {needsGrade && <span>*</span>}
            <FormSelect className="career-new-grade" {...fieldProps('newGradeId')} required={needsGrade}>
              <option value="">{needsGrade ? 'Select New Grade' : 'None / Unchanged'}</option>
              {grades.map((grade) => <option key={grade.id} value={String(grade.id)}>{grade.name} · {formatCurrency(grade.salary)}</option>)}
            </FormSelect>{fieldError('newGradeId')}
          </label>
          <label className="full-width tw:shared-base:col-[1_/_-1]">Justification / Description <span>*</span>
            <FormTextarea {...fieldProps('description')} placeholder="Civil service committee approval notes…" rows={4} maxLength={5000} required />{fieldError('description')}
          </label>
        </fieldset>
        {employee && <div className="career-impact tw:mt-[18px] tw:p-[14px_16px] tw:[border:1px_solid_#d6ebe3] tw:rounded-[10px] tw:[background:#f1faf6]
          tw:[color:#34685a] tw:text-[12px] tw:leading-[1.6] tw:[&_>_strong]:[color:#145c44] tw:[&_p]:mt-[4px]" role="status">
          {newGrade ? <>
            <strong>{historical ? 'Historical grade change' : scheduled ? 'Scheduled employee update' : 'Employee update'}</strong>
            <div className="career-impact-grades tw:flex tw:items-center tw:flex-wrap tw:gap-[9px] tw:mt-[6px]"><span>{historical ? previousGrade?.name || 'Not recorded' : employee.grade || 'No grade'}</span><Icon name="arrow" size={16} /><strong>{newGrade.name}</strong></div>
            <p>Base salary: {historical && !previousGrade ? 'Not recorded' : formatCurrency(historical ? previousGrade.salary : employee.basicSalary)} → <strong>{formatCurrency(newGrade.salary)}</strong></p>
            <p>{historical ? 'This entry adds history. The employee’s current grade and salary stay unchanged.'
              : scheduled ? `The change takes effect on ${formatDate(values.effectiveDate)}. Current pay stays unchanged until then.`
                : 'Confirming updates this employee’s grade and base salary. Existing payroll runs keep their saved amounts.'}</p>
          </> : <p>{needsGrade ? 'Select a new grade to preview the configured base salary.' : 'This milestone records an achievement without changing grade or pay.'}</p>}
          {values.milestoneType === 'STEP_INCREMENT' && <p>Step increments use the selected Grades &amp; Scales salary.</p>}
        </div>}
        {!employees.length && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">Add an employee before recording a career milestone.</p>}
        {!grades.length && needsGrade && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">Add a grade and its salary in Grades &amp; Scales first.</p>}
        {saveError && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{saveError}</p>}
        <ModalActions >
          <Button variant="secondary" type="button" onClick={close} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving || !employees.length || (needsGrade && !grades.length)}>{saving ? 'Saving Milestone…' : submitLabel}</Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
