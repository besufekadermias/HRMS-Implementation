import { useState } from 'react'
import Icon from '../common/Icon.jsx'
import {
  DEPARTMENTS,
  JOB_GRADES,
  EMPLOYMENT_TYPES,
  EMPLOYEE_STATUSES,
} from '../../utils/constants/constants.js'
import formatCurrency from '../../utils/formatters/formatCurrency.js'

export default function JobDetailsForm({
  register,
  grade,
  educationDocument,
  errors,
  onChangeUpload,
  editing,
  departments = DEPARTMENTS,
  grades = JOB_GRADES,
}) {
  const [documentError, setDocumentError] = useState('')
  function selectDocument(file) {
    if (!file) return
    if (
      !/\.(pdf|doc|docx|jpe?g|png)$/i.test(file.name) ||
      file.size > 10 * 1024 * 1024
    ) {
      setDocumentError(
        'Choose a PDF, DOC, DOCX, JPG, or PNG file smaller than 10 MB.',
      )
      return
    }
    setDocumentError('')
    onChangeUpload('educationDocument', { name: file.name, size: file.size, file })
  }
  const salary = grades.find((item) => item.name === grade)?.salary
  return (
    <fieldset className="employee-form-section">
      <legend>
        <span className="form-section-icon">
          <Icon name="building" size={20} />
        </span>
        <span>
          <small>STEP 02</small>Department Placement, Grade & Education
        </span>
      </legend>
      <div className="employee-fields-grid">
        <label>
          Assigned department <span>*</span>
          <select
            {...register('department')}
            required
            aria-invalid={!!errors.department}
          >
            <option value="">Select department</option>
            {departments.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          {errors.department && (
            <small className="field-error">{errors.department.message}</small>
          )}
        </label>
        <label>
          Civil job grade <span>*</span>
          <select
            {...register('grade')}
            required
            aria-invalid={!!errors.grade}
          >
            <option value="">Select grade</option>
            {grades.map(({ name }) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          {errors.grade && (
            <small className="field-error">{errors.grade.message}</small>
          )}
          {!grades.length && (
            <small className="field-hint">
              Add a job grade in Grades &amp; Scales before registering
              employees.
            </small>
          )}
          {salary && (
            <small className="field-hint">
              Grade base salary:{' '}
              {formatCurrency(salary, { minimumFractionDigits: 2 })}
            </small>
          )}
        </label>
        <label>
          Employment type <span>*</span>
          <select
            {...register('employmentType')}
            required
            aria-invalid={!!errors.employmentType}
          >
            <option value="">Select type</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          {errors.employmentType && (
            <small className="field-error">{errors.employmentType.message}</small>
          )}
        </label>
        <label>
          Hired date <span>*</span>
          <input
            {...register('hiredDate')}
            type="date"
            min="1900-01-01"
            max="2100-12-31"
            required
            aria-invalid={!!errors.hiredDate}
          />
          {errors.hiredDate && (
            <small className="field-error">{errors.hiredDate.message}</small>
          )}
        </label>
        {editing && (
          <label>
            Status
            <select
              {...register('status')}
            >
              {EMPLOYEE_STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        )}
        <div className="full-width">
          <span className="field-label">Education document</span>
          <label
            className="file-dropzone document-dropzone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              selectDocument(event.dataTransfer.files[0])
            }}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              aria-label="Select education document"
              onChange={(event) => {
                selectDocument(event.target.files[0])
                event.target.value = ''
              }}
            />
            <Icon
              name={educationDocument ? 'file' : 'upload'}
              size={23}
            />
            <span>
              <strong>
                {educationDocument?.name ||
                  'Click to upload or drag and drop'}
              </strong>
              <small>PDF, DOC, DOCX, JPG, PNG · Up to 10 MB</small>
            </span>
          </label>
          {educationDocument && (
            <button
              className="text-button"
              type="button"
              onClick={() => onChangeUpload('educationDocument', null)}
            >
              Remove document
            </button>
          )}
          {documentError && (
            <small className="field-error" role="alert">
              {documentError}
            </small>
          )}
        </div>
      </div>
    </fieldset>
  )
}
