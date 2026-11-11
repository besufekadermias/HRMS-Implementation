import { useRef, useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import PersonalInfoForm from '../../components/employees/PersonalInfoForm.jsx'
import JobDetailsForm from '../../components/employees/JobDetailsForm.jsx'
import {
  JOB_GRADES,
  PORTAL_ROLES,
  INITIAL_DEPARTMENTS,
} from '../../utils/constants/constants.js'
import { validateEmployee } from '../../utils/validation/validators.js'

export default function AddEmployee({
  employee,
  employees,
  departments = INITIAL_DEPARTMENTS,
  grades = JOB_GRADES,
  onSave,
  onCancel,
  onDirtyChange,
}) {
  const [values, setValues] = useState({
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
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const formRef = useRef(null)
  const editing = Boolean(employee)
  const departmentOptions = departments
    .filter(
      (department) =>
        department.status === 'Active' ||
        department.name === employee?.department,
    )
    .map((department) => department.name)

  function changeField(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    onDirtyChange(true)
  }

  function submit(event) {
    event.preventDefault()
    const nextErrors = validateEmployee(values, employees, employee?.id, {
      departments: departmentOptions,
      grades,
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      formRef.current
        .querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)
        ?.focus()
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
    onSave(record, employee?.id)
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
        onSubmit={submit}
        ref={formRef}
        noValidate
      >
        <PersonalInfoForm
          values={values}
          errors={errors}
          onChange={changeField}
          onPhotoBusy={setPhotoBusy}
        />
        <JobDetailsForm
          departments={departmentOptions}
          grades={grades}
          values={values}
          errors={errors}
          onChange={changeField}
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
                name="email"
                value={values.email}
                onChange={(event) => changeField('email', event.target.value)}
                placeholder="e.g. yohannes@hadiya.gov.et"
                maxLength={120}
                autoComplete="off"
                required
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <small className="field-error">{errors.email}</small>
              )}
            </label>
            <label>
              Portal role <span>*</span>
              <select
                name="portalRole"
                value={values.portalRole}
                onChange={(event) =>
                  changeField('portalRole', event.target.value)
                }
                required
              >
                {PORTAL_ROLES.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
              {errors.portalRole && (
                <small className="field-error">{errors.portalRole}</small>
              )}
            </label>
            {!editing ? (
              <label>
                Temporary initial password <span>*</span>
                <span className="password-field">
                  <input
                    name="temporaryPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={values.temporaryPassword}
                    onChange={(event) =>
                      changeField('temporaryPassword', event.target.value)
                    }
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
                    {errors.temporaryPassword}
                  </small>
                )}
              </label>
            ) : null}
          </div>
        </fieldset>
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
              disabled={photoBusy}
            >
              <Icon name={editing ? 'check' : 'users'} size={18} />
              {photoBusy
                ? 'Reading photo…'
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
