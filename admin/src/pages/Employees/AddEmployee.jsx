import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Icon from '../../components/common/Icon.jsx'
import PersonalInfoForm from '../../components/employees/PersonalInfoForm.jsx'
import JobDetailsForm from '../../components/employees/JobDetailsForm.jsx'
import {
  JOB_GRADES,
  PORTAL_ROLES,
  INITIAL_DEPARTMENTS,
} from '../../utils/constants/constants.js'
import { validateEmployeeRules } from '../../utils/validation/validators.js'
import { getEmployeeSchema } from '../../utils/validation/workforceSchemas.js'

export default function AddEmployee({
  employee,
  employees,
  departments = INITIAL_DEPARTMENTS,
  grades = JOB_GRADES,
  onSave,
  onCancel,
  onDirtyChange,
}) {
  const {
    register, control, handleSubmit, setValue, setError, setFocus,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    defaultValues: {
      id: '',
      name: '',
      email: '',
      gender: '',
      birthDate: '',
      qualification: '',
      department: '',
      grade: '',
      employmentType: 'Permanent',
      hiredDate: '',
      portalRole: 'Employee',
      photo: null,
      educationDocument: null,
      status: 'Active',
      ...employee,
      temporaryPassword: '',
    },
    // Keep upload objects and optional fields intact; normalize on save below.
    resolver: zodResolver(getEmployeeSchema({ originalId: employee?.id }), undefined, { raw: true }),
    shouldFocusError: false,
  })
  const [grade, photo, educationDocument] = useWatch({
    control, name: ['grade', 'photo', 'educationDocument'],
  })
  const [showPassword, setShowPassword] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  // File contents cannot be compared by React Hook Form's dirty tracking.
  const [uploadsDirty, setUploadsDirty] = useState(false)
  const editing = Boolean(employee)
  const departmentOptions = departments
    .filter(
      (department) =>
        department.status === 'Active' ||
        department.name === employee?.department,
    )
    .map((department) => department.name)

  useEffect(() => {
    onDirtyChange(isDirty || uploadsDirty)
  }, [isDirty, uploadsDirty, onDirtyChange])

  function changeUpload(name, value) {
    setValue(name, value, { shouldDirty: true })
    setUploadsDirty(true)
  }

  async function submit(values) {
    if (photoBusy) return
    const nextErrors = validateEmployeeRules(values, employees, employee?.id, {
      departments: departmentOptions,
      grades,
    })
    if (Object.keys(nextErrors).length) {
      for (const [name, message] of Object.entries(nextErrors)) {
        setError(name, { type: 'business', message })
      }
      setFocus(Object.keys(nextErrors)[0])
      return
    }
    // Keep the temporary password transient; no credentials are saved or exported.
    const record = {
      id: values.id.trim(),
      name: values.name.trim(),
      email: values.email.trim(),
      gender: values.gender,
      birthDate: values.birthDate,
      qualification: values.qualification.trim(),
      department: values.department,
      grade: values.grade,
      employmentType: values.employmentType,
      hiredDate: values.hiredDate,
      portalRole: values.portalRole,
      photo: values.photo,
      educationDocument: values.educationDocument,
      status: values.status,
      basicSalary:
        grades.find((grade) => grade.name === values.grade)?.salary || 0,
    }
    try {
      await onSave(record, employee?.id)
    } catch (error) {
      setError('root', { type: 'server', message: error.message || 'Employee could not be saved. Please try again.' })
    }
  }

  return (
    <div className="employee-editor">
      <div className="employee-page-heading">
        <button
          className="back-button"
          onClick={onCancel}
          aria-label="Back to employee directory"
        >
          <Icon name="arrow-left" />
        </button>
        <div>
          <h1>{editing ? 'Edit Employee' : 'Add New Department Employee'}</h1>
          <p>
            {editing
              ? 'Review and update this employee’s information.'
              : 'Create an official staff record with identity, placement, and portal details.'}
          </p>
        </div>
      </div>
      <form
        className="card employee-registration-form"
        onSubmit={handleSubmit(submit, errors => setFocus(Object.keys(errors)[0]))}
        noValidate
        aria-busy={isSubmitting}
      >
        <PersonalInfoForm
          register={register}
          photo={photo}
          errors={errors}
          onChangeUpload={changeUpload}
          onPhotoBusy={setPhotoBusy}
        />
        <JobDetailsForm
          departments={departmentOptions}
          grades={grades}
          register={register}
          grade={grade}
          educationDocument={educationDocument}
          errors={errors}
          onChangeUpload={changeUpload}
          editing={editing}
        />
        <fieldset className="employee-form-section portal-account-section">
          <legend>
            <span className="form-section-icon">
              <Icon name="key" size={20} />
            </span>
            <span>
              <small>STEP 03</small>Portal Login Account & Role Assignment
            </span>
          </legend>
          <p>
            Configure the requested portal role
            {editing ? '.' : ' and temporary initial password.'}
          </p>
          <div className="employee-fields-grid">
            <label>
              Official email / Portal login ID <span>*</span>
              <input
                {...register('email')}
                placeholder="e.g. yohannes@hadiya.gov.et"
                maxLength={120}
                autoComplete="off"
                required
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <small className="field-error">{errors.email.message}</small>
              )}
            </label>
            <label>
              Portal role <span>*</span>
              <select
                {...register('portalRole')}
                required
                aria-invalid={!!errors.portalRole}
              >
                {PORTAL_ROLES.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
              {errors.portalRole && (
                <small className="field-error">{errors.portalRole.message}</small>
              )}
            </label>
            {!editing ? (
              <label>
                Temporary initial password <span>*</span>
                <span className="password-field">
                  <input
                    {...register('temporaryPassword')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    required
                    maxLength={128}
                    aria-invalid={!!errors.temporaryPassword}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
                  </button>
                </span>
                {errors.temporaryPassword && (
                  <small className="field-error">
                    {errors.temporaryPassword.message}
                  </small>
                )}
              </label>
            ) : null}
          </div>
        </fieldset>
        {errors.root && <p className="form-error" role="alert">{errors.root.message}</p>}
        <div className="registration-footer">
          <p>
            <Icon name="info" size={16} />
            Review the employee details before saving.
          </p>
          <div>
            <button
              type="button"
              className="button button-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={photoBusy || isSubmitting}
            >
              <Icon name={editing ? 'check' : 'users'} size={18} />
              {photoBusy
                ? 'Reading photo…'
                : isSubmitting
                  ? 'Saving…'
                  : editing
                    ? 'Save Changes'
                    : 'Register Employee'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
