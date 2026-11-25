import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, FormInput, Icon } from './EmployeeFormPrimitives.jsx'
import PersonalInfoForm from './EmployeeIdentityFields.jsx'
import JobDetailsForm from './EmployeeJobFields.jsx'
import { createEmployeeRegistrationSchema, registrationToEmployeeInput } from '../../utils/validation/departmentEmployeeSchemas.js'
import { useEmployeeStore } from '../../store/index.js'

export default function DepartmentEmployeeForm({ options, onSave, onCancel }) {
  const defaults = { id: '', name: '', email: '', gender: '', birthDate: '', qualification: '',
    department: options.department.name, grade: '', employmentType: 'Permanent', hiredDate: '',
    portalRole: 'Employee', photo: null, educationDocument: null, temporaryPassword: '' }
  const { register, control, handleSubmit, setValue, setError, setFocus, reset,
    formState: { errors, isDirty, isSubmitting } } = useForm({
    defaultValues: defaults, resolver: zodResolver(createEmployeeRegistrationSchema(options), undefined, { raw: true }), shouldFocusError: false,
  })
  const [grade, photo, educationDocument] = useWatch({ control, name: ['grade', 'photo', 'educationDocument'] })
  const [showPassword, setShowPassword] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [uploadsDirty, setUploadsDirty] = useState(false)
  const busy = useEmployeeStore(state => state.employeeBusy)
  const request = useRef(null)
  const saving = useRef(false)
  const editing = false
  const locked = busy || photoBusy || isSubmitting
  const available = options.canCreateEmployee && options.grades.length > 0
  const departmentOptions = [options.department.name]
  const grades = options.grades
  const setDirty = useEmployeeStore(state => state.setEmployeeDirty)
  useEffect(() => { setDirty(isDirty || uploadsDirty); return () => setDirty(false) }, [isDirty, uploadsDirty, setDirty])
  useEffect(() => () => useEmployeeStore.getState().setEmployeeBusy(false), [])
  useEffect(() => {
    if (!isDirty && !uploadsDirty && !locked) return
    const warn = event => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty, uploadsDirty, locked])
  function changePhotoBusy(value) { setPhotoBusy(value); useEmployeeStore.getState().setEmployeeBusy(value) }
  function changeUpload(name, value) {
    if (saving.current) return
    request.current = null
    setValue(name, value, { shouldDirty: true, shouldValidate: true })
    setUploadsDirty(true)
  }
  async function submit(values) {
    if (busy || photoBusy || saving.current || !available) return
    saving.current = true
    const payload = JSON.stringify(values, (name, value) => name === 'file' ? undefined : value)
    if (request.current?.payload !== payload) request.current = { payload, key: crypto.randomUUID() }
    try {
      await onSave(registrationToEmployeeInput(values, options), request.current.key)
      request.current = null
      reset(defaults)
      setUploadsDirty(false)
      setDirty(false)
    } catch (error) {
      setError('root', { type: 'server', message: error.message || 'Employee could not be saved. Please try again.' })
      const names = { serialNumber: 'id', fullName: 'name', gradeId: 'grade' }
      const fields = Object.entries(error.fields || {}).map(([name, message]) => [names[name] || name, message])
      for (const [name, message] of fields) if (name in defaults) setError(name, { type: 'server', message })
      if (fields.length && fields[0][0] in defaults) setFocus(fields[0][0])
    } finally { saving.current = false }
  }
  return (
    <div className="employee-editor max-w-[1200px] m-[0_auto_28px]">
      <div
        className="employee-page-heading flex items-center gap-[13px] mb-[23px] [&>div]:min-w-0 [&>div]:flex-1
          [&>.button]:shrink-0 max-[768px]:flex-wrap max-[768px]:gap-[11px]
          max-[768px]:[&>.button]:ml-auto [&_h1]:text-[27px] [&_h1]:tracking-[-0.6px]
          max-[768px]:[&_h1]:text-[24px] max-[560px]:[&_h1]:text-[22px] [&_p]:text-[var(--text-muted)]
          [&_p]:text-[12px] [&_p]:leading-[1.7] [&_p]:mt-[4px] max-[768px]:[&_p]:text-[11px]
          employee-base:flex employee-base:items-center employee-base:gap-[13px] employee-base:mb-[23px]
          employee-base:[&_>_div]:min-w-0 employee-base:[&_>_div]:flex-1 employee-base:[&_h1]:text-[27px]
          employee-base:[&_h1]:tracking-[-0.6px] employee-base:[&_p]:[color:var(--text-muted)]
          employee-base:[&_p]:text-[12px] employee-base:[&_p]:leading-[1.7] employee-base:[&_p]:mt-[4px]
          employee-base:[&_>_.button]:shrink-0 max-[768px]:employee-base:flex-wrap
          max-[768px]:employee-base:gap-[11px]
          max-[768px]:employee-base:[&_h1]:text-[24px]
          max-[768px]:employee-base:[&_p]:text-[11px]
          max-[768px]:employee-base:[&_>_.button]:ml-[auto]
          max-[560px]:employee-base:[&_h1]:text-[22px]"
      >
        <button
          className="back-button inline-flex items-center justify-center w-[40px] h-[40px] p-[9px] shrink-0
            bg-white [border:1px_solid_var(--border)] rounded-[9px] text-text-secondary
            hover:border-[#a0cec1] hover:text-primary"
          onClick={onCancel} disabled={locked}
          aria-label="Back to My Team"
        >
          <Icon name="arrow-left" />
        </button>
        <div>
          <h1>{editing ? "Edit Employee" : "Add New Department Employee"}</h1>
          <p>
            {editing
              ? "Review and update this employee’s information."
              : "Create an official staff record with identity, placement, and portal details."}
          </p>
        </div>
      </div>
      <Card
        as="form"
        className="employee-registration-form p-[29px_30px] max-[1100px]:p-[24px] max-[768px]:p-[22px_18px]"
        onSubmit={(event) => void handleSubmit(submit, (errors) => setFocus(Object.keys(errors)[0]))(event)}
        noValidate
        aria-busy={isSubmitting}
      >
        <fieldset disabled={locked || !available} className="m-0 min-w-0 border-0 p-0">
        <PersonalInfoForm
          locked={locked}
          register={register}
          photo={photo}
          errors={errors}
          onChangeUpload={changeUpload}
          onPhotoBusy={changePhotoBusy}
          today={options.today}
        />
        <JobDetailsForm
          locked={locked}
          departments={departmentOptions}
          grades={grades}
          register={register}
          grade={grade}
          educationDocument={educationDocument}
          errors={errors}
          onChangeUpload={changeUpload}
          editing={editing}
        />
        <fieldset
          className="employee-form-section portal-account-section [border:0] m-[0_0_30px] p-0 min-w-0 [&>legend]:flex
          [&>legend]:items-center [&>legend]:gap-[11px] [&>legend]:w-full [&>legend]:p-[0_0_16px]
          [&>legend]:mb-[22px] [&>legend]:[border-bottom:1px_solid_#e4eee9] [&>legend]:text-[14px]
          [&>legend]:font-[650] [&>legend]:text-[#154d44] [&>legend_small]:block
          [&>legend_small]:text-[8px] [&>legend_small]:tracking-[1.3px] [&>legend_small]:text-[#71928a]
          [&>legend_small]:mb-[4px] [&>legend_small]:font-[600] max-[768px]:[&>legend]:text-[13px]
          max-[560px]:[&>legend]:leading-[1.6] max-[560px]:[&>legend]:items-start
          [&.portal-account-section]:bg-[#f2faf6] [&.portal-account-section]:[border:1px_solid_#dbeee3]
          [&.portal-account-section]:rounded-[10px] [&.portal-account-section]:p-[21px]
          [&.portal-account-section]:m-[36px_0_0] max-[768px]:[&.portal-account-section]:p-[17px]
          [&.portal-account-section>legend]:float-left [&.portal-account-section>legend]:[border:0]
          [&.portal-account-section>legend]:p-0 [&.portal-account-section>legend]:m-[0_0_12px]
          [&>p]:clear-both [&>p]:m-[0_0_22px] [&>p]:text-[var(--text-muted)] [&>p]:text-[12px]
          [&>p]:leading-[1.7]"
        >
          <legend>
            <span
              className="form-section-icon inline-flex items-center justify-center w-[36px] h-[36px] rounded-[8px]
          bg-[#e9f7f1] text-primary shrink-0"
            >
              <Icon name="key" size={20} />
            </span>
            <span>
              <small>STEP 03</small>Portal Login Account & Role Assignment
            </span>
          </legend>
          <p>
            Configure the Employee account and temporary initial password.
          </p>
          <div
            className="employee-fields-grid grid grid-cols-3 gap-[23px_22px] max-[1100px]:gap-[20px_17px]
          max-[768px]:grid-cols-2 max-[560px]:grid-cols-[minmax(0,_1fr)] [&>label]:block
          [&>label]:text-[#48655f] [&>label]:text-[11px] [&>label]:font-[650] [&>label]:leading-[1.5]
          [&>label>span:not(.password-field)]:text-[#b65265] [&_.span-two]:[grid-column:span_2]
          max-[768px]:[&_.span-two]:col-span-full max-[560px]:[&_.span-two]:col-auto employee-base:grid
          employee-base:grid-cols-[repeat(3,_minmax(0,_1fr))] employee-base:gap-[23px_22px]
          employee-base:[&_>_label]:block employee-base:[&_>_label]:[color:#48655f]
          employee-base:[&_>_label]:text-[11px] employee-base:[&_>_label]:font-[650]
          employee-base:[&_>_label]:leading-[1.5]
          employee-base:[&_>_label_>_span:not(.password-field)]:[color:#b65265]
          employee-base:[&_.span-two]:col-[span_2] max-[1100px]:employee-base:gap-[20px_17px]
          max-[768px]:employee-base:grid-cols-[repeat(2,_minmax(0,_1fr))]
          max-[768px]:employee-base:[&_.span-two]:col-[1_/_-1]
          max-[560px]:employee-base:grid-cols-[minmax(0,_1fr)]
          max-[560px]:employee-base:[&_.span-two]:col-[auto]
          max-[560px]:employee-base:[&_>_label]:text-[11px]"
          >
            <label>
              {editing
                ? "Official email / Existing login ID"
                : "Registered email"}{" "}
              <span>*</span>
              <FormInput
                variant="employee"
                {...register("email")}
                placeholder="e.g. yohannes@hadiya.gov.et"
                maxLength={100}
                autoComplete="off"
                required
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <small
                  className="field-error employee-base:block employee-base:text-[11px] employee-base:font-normal
          employee-base:[color:#b33450] employee-base:mt-[7px] employee-base:leading-[1.6]"
                >
                  {errors.email.message}
                </small>
              )}
            </label>
            <label>
              Portal role <span>*</span>
              <FormInput variant="employee" {...register("portalRole")} value="Employee" readOnly aria-label="Portal role" />
              <small className="mt-[7px] block text-[10px] font-normal text-[var(--text-muted)]">
                New employees always receive the Employee role.
              </small>
              {errors.portalRole && (
                <small
                  className="field-error employee-base:block employee-base:text-[11px] employee-base:font-normal
          employee-base:[color:#b33450] employee-base:mt-[7px] employee-base:leading-[1.6]"
                >
                  {errors.portalRole.message}
                </small>
              )}
            </label>
            {!editing ? (
              <label>
                Temporary initial password <span>*</span>
                <span className="password-field block relative [&_input]:pr-[43px]!">
                  <FormInput
                    variant="employee"
                    {...register("temporaryPassword")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    required
                    maxLength={128}
                    aria-invalid={!!errors.temporaryPassword}
                  />
                  <button
                    className="absolute right-[5px] top-[5px] inline-flex items-center justify-center w-[35px] h-[35px]
          [border:0] rounded-[5px] text-[#79958b] bg-transparent hover:bg-[#edf7f0]
          hover:text-primary"
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
                  </button>
                </span>
                {errors.temporaryPassword && (
                  <small
                    className="field-error employee-base:block employee-base:text-[11px] employee-base:font-normal
          employee-base:[color:#b33450] employee-base:mt-[7px] employee-base:leading-[1.6]"
                  >
                    {errors.temporaryPassword.message}
                  </small>
                )}
              </label>
            ) : null}
          </div>
        </fieldset>
        </fieldset>
        {errors.root && (
          <p
            className="form-error employee-base:mt-[16px] employee-base:text-[13px] employee-base:rounded-[5px]
          employee-base:p-[10px_12px] employee-base:leading-[1.6] employee-base:[color:#b42344]
          employee-base:[background:#fff0f3]"
            role="alert"
          >
            {errors.root.message}
          </p>
        )}
        <div
          className="registration-footer flex items-center justify-between gap-[20px]
          [border-top:1px_solid_var(--divider)] mt-[30px] pt-[23px] [&>p]:flex [&>p]:items-start
          [&>p]:gap-[8px] [&>p]:max-w-[500px] [&>p]:text-[10px] [&>p]:leading-[1.8]
          [&>p]:text-[var(--text-muted)] [&>p_svg]:mt-[1px] [&>div]:flex [&>div]:items-center
          [&>div]:gap-[10px] [&>div]:shrink-0 max-[1100px]:items-start max-[1100px]:flex-col
          max-[1100px]:[&>div]:self-end max-[560px]:[&>div]:w-full max-[560px]:[&>div>.button]:flex-1
          max-[560px]:[&>div>.button]:px-[10px]"
        >
          <p>
            <Icon name="info" size={16} />
            Review the employee details before saving.
          </p>
          <div>
            <Button variant="secondary" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={locked || !available}>
              <Icon name={editing ? "check" : "users"} size={18} />
              {photoBusy
                ? "Reading photo…"
                : isSubmitting
                  ? "Saving…"
                  : editing
                    ? "Save Changes"
                    : "Register Employee"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
