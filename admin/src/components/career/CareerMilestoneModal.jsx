import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { careerMilestoneFormSchema } from '../../utils/validation/growthSchemas.js'
import { showFormErrors } from '../../utils/validation/formErrors.js'
import Modal from '../common/Modal.jsx'
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
    return errors[name] && <small className="field-error" id={`career-${name}-error`}>{errors[name].message}</small>
  }

  if (confirmDiscard) return <ConfirmationModal title="Discard career milestone?" confirmLabel="Discard changes"
    onCancel={() => setConfirmDiscard(false)} onConfirm={onClose}>
    <p>Your milestone has not been saved. Close this form and discard your changes?</p>
  </ConfirmationModal>

  return (
    <Modal className="career-modal" onClose={close} title={<><Icon name="star" size={25} /> Record Promotion or Career Milestone</>}>
      <form onSubmit={(event) => handleSubmit(submit)(event)} noValidate aria-busy={saving}>
        <fieldset className="career-fields form-grid" disabled={saving}>
          <legend className="sr-only">Career milestone details</legend>
          <label className="full-width">Employee <span>*</span>
            <select {...fieldProps('employeeId')} required><option value="">Select Employee</option>
              {employees.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.id} · {item.department}</option>)}
            </select>{fieldError('employeeId')}
          </label>
          <label>Milestone type <span>*</span>
            <select {...fieldProps('milestoneType')} required>{MILESTONE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label.toUpperCase()}</option>)}</select>
            {fieldError('milestoneType')}
          </label>
          <label>Effective date <span>*</span>
            <input {...fieldProps('effectiveDate')} type="date" min="1900-01-01" max="2100-12-31" required />{fieldError('effectiveDate')}
          </label>
          <label>Previous grade
            <select {...fieldProps('previousGradeId')}><option value="">None / Unchanged</option>
              {grades.map((grade) => <option key={grade.id} value={String(grade.id)}>{grade.name}</option>)}
            </select>{fieldError('previousGradeId')}
          </label>
          <label>New promoted grade {needsGrade && <span>*</span>}
            <select className="career-new-grade" {...fieldProps('newGradeId')} required={needsGrade}>
              <option value="">{needsGrade ? 'Select New Grade' : 'None / Unchanged'}</option>
              {grades.map((grade) => <option key={grade.id} value={String(grade.id)}>{grade.name} · {formatCurrency(grade.salary)}</option>)}
            </select>{fieldError('newGradeId')}
          </label>
          <label className="full-width">Justification / Description <span>*</span>
            <textarea {...fieldProps('description')} placeholder="Civil service committee approval notes…" rows={4} maxLength={5000} required />{fieldError('description')}
          </label>
        </fieldset>
        {employee && <div className="career-impact" role="status">
          {newGrade ? <>
            <strong>{historical ? 'Historical grade change' : scheduled ? 'Scheduled employee update' : 'Employee update'}</strong>
            <div className="career-impact-grades"><span>{historical ? previousGrade?.name || 'Not recorded' : employee.grade || 'No grade'}</span><Icon name="arrow" size={16} /><strong>{newGrade.name}</strong></div>
            <p>Base salary: {historical && !previousGrade ? 'Not recorded' : formatCurrency(historical ? previousGrade.salary : employee.basicSalary)} → <strong>{formatCurrency(newGrade.salary)}</strong></p>
            <p>{historical ? 'This entry adds history. The employee’s current grade and salary stay unchanged.'
              : scheduled ? `The change takes effect on ${formatDate(values.effectiveDate)}. Current pay stays unchanged until then.`
                : 'Confirming updates this employee’s grade and base salary. Existing payroll runs keep their saved amounts.'}</p>
          </> : <p>{needsGrade ? 'Select a new grade to preview the configured base salary.' : 'This milestone records an achievement without changing grade or pay.'}</p>}
          {values.milestoneType === 'STEP_INCREMENT' && <p>Step increments use the selected Grades &amp; Scales salary.</p>}
        </div>}
        {!employees.length && <p className="form-error" role="alert">Add an employee before recording a career milestone.</p>}
        {!grades.length && needsGrade && <p className="form-error" role="alert">Add a grade and its salary in Grades &amp; Scales first.</p>}
        {saveError && <p className="form-error" role="alert">{saveError}</p>}
        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={close} disabled={saving}>Cancel</button>
          <button type="submit" className="button button-primary" disabled={saving || !employees.length || (needsGrade && !grades.length)}>{saving ? 'Saving Milestone…' : submitLabel}</button>
        </div>
      </form>
    </Modal>
  )
}
