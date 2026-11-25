import { TextButton, FormSelect, FormInput, Icon } from './EmployeeFormPrimitives.jsx'
import { useState } from 'react'
import { EMPLOYMENT_TYPES } from '../../utils/validation/departmentEmployeeSchemas.js'
const EMPLOYEE_STATUSES = ['Active', 'On Leave', 'Inactive', 'Onboarding']
const formatCurrency = (value, options) => new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', ...options }).format(value)

export default function JobDetailsForm({
  register,
  grade,
  educationDocument,
  errors,
  onChangeUpload,
  editing,
  locked,
  departments = [],
  grades = [],
}) {
  const [documentError, setDocumentError] = useState('')
  function selectDocument(file) {
    if (!file || locked) return
    if (
      !/\.(pdf|doc|docx|jpe?g|png)$/i.test(file.name) ||
      !file.size || file.size > 10 * 1024 * 1024
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
    <fieldset className="employee-form-section [border:0] m-[0_0_30px] p-0 min-w-0 [&>legend]:flex [&>legend]:items-center
          [&>legend]:gap-[11px] [&>legend]:w-full [&>legend]:p-[0_0_16px] [&>legend]:mb-[22px]
          [&>legend]:[border-bottom:1px_solid_#e4eee9] [&>legend]:text-[14px] [&>legend]:font-[650]
          [&>legend]:text-[#154d44] [&>legend_small]:block [&>legend_small]:text-[8px]
          [&>legend_small]:tracking-[1.3px] [&>legend_small]:text-[#71928a] [&>legend_small]:mb-[4px]
          [&>legend_small]:font-[600] max-[768px]:[&>legend]:text-[13px]
          max-[560px]:[&>legend]:leading-[1.6] max-[560px]:[&>legend]:items-start">
      <legend>
        <span className="form-section-icon inline-flex items-center justify-center w-[36px] h-[36px] rounded-[8px]
          bg-[#e9f7f1] text-primary shrink-0">
          <Icon name="building" size={20} />
        </span>
        <span>
          <small>STEP 02</small>Department Placement, Grade & Education
        </span>
      </legend>
      <div className="employee-fields-grid grid grid-cols-3 gap-[23px_22px] max-[1100px]:gap-[20px_17px]
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
          max-[560px]:employee-base:[&_>_label]:text-[11px]">
        <label>
          Assigned department <span>*</span>
          <FormSelect variant="employee"
            {...register('department')}
            required
            aria-invalid={!!errors.department}
          >
            
            {departments.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </FormSelect>
          {errors.department && (
            <small className="field-error employee-base:block employee-base:text-[11px] employee-base:font-normal
          employee-base:[color:#b33450] employee-base:mt-[7px] employee-base:leading-[1.6]">{errors.department.message}</small>
          )}
        </label>
        <label>
          Civil job grade <span>*</span>
          <FormSelect variant="employee"
            {...register('grade')}
            required
            aria-invalid={!!errors.grade}
          >
            <option value="">Select grade</option>
            {grades.map(({ name }) => (
              <option key={name}>{name}</option>
            ))}
          </FormSelect>
          {errors.grade && (
            <small className="field-error employee-base:block employee-base:text-[11px] employee-base:font-normal
          employee-base:[color:#b33450] employee-base:mt-[7px] employee-base:leading-[1.6]">{errors.grade.message}</small>
          )}
          {!grades.length && (
            <small className="field-hint employee-base:block employee-base:text-[10px] employee-base:font-normal
          employee-base:[color:var(--text-muted)] employee-base:mt-[7px]">
              Add a job grade in Grades &amp; Scales before registering
              employees.
            </small>
          )}
          {salary && (
            <small className="field-hint employee-base:block employee-base:text-[10px] employee-base:font-normal
          employee-base:[color:var(--text-muted)] employee-base:mt-[7px]">
              Grade base salary:{' '}
              {formatCurrency(salary, { minimumFractionDigits: 2 })}
            </small>
          )}
        </label>
        <label>
          Employment type <span>*</span>
          <FormSelect variant="employee"
            {...register('employmentType')}
            required
            aria-invalid={!!errors.employmentType}
          >
            <option value="">Select type</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </FormSelect>
          {errors.employmentType && (
            <small className="field-error employee-base:block employee-base:text-[11px] employee-base:font-normal
          employee-base:[color:#b33450] employee-base:mt-[7px] employee-base:leading-[1.6]">{errors.employmentType.message}</small>
          )}
        </label>
        <label>
          Hired date <span>*</span>
          <FormInput variant="employee"
            {...register('hiredDate')}
            type="date"
            min="1900-01-01"
            max="2100-12-31"
            required
            aria-invalid={!!errors.hiredDate}
          />
          {errors.hiredDate && (
            <small className="field-error employee-base:block employee-base:text-[11px] employee-base:font-normal
          employee-base:[color:#b33450] employee-base:mt-[7px] employee-base:leading-[1.6]">{errors.hiredDate.message}</small>
          )}
        </label>
        {editing && (
          <label>
            Status
            <FormSelect variant="employee"
              {...register('status')}
            >
              {EMPLOYEE_STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </FormSelect>
          </label>
        )}
        <div className="full-width col-span-full employee-base:col-[1_/_-1]">
          <span className="field-label block text-[#48655f] text-[11px] font-[650] leading-[1.5] [&>span]:text-[#b65265]">Education document</span>
          <label
            className="file-dropzone document-dropzone relative flex items-center gap-[13px] [border:1.5px_dashed_#c8ddd5]
          rounded-[8px] bg-[#f9fcfa] text-primary cursor-pointer min-w-0 hover:border-primary
          hover:bg-[#f1faf5] focus-within:[outline:2px_solid_var(--primary)]
          focus-within:outline-offset-[3px] [&>input]:absolute [&>input]:w-[1px] [&>input]:h-[1px]
          [&>input]:opacity-0 [&>input]:p-0 [&>input]:m-0 [&>span]:min-w-0 [&_strong]:block
          [&_strong]:text-text-secondary [&_strong]:text-[12px] [&_strong]:leading-[1.5]
          [&_strong]:font-[550] [&_strong]:[overflow-wrap:anywhere] [&_small]:block [&_small]:mt-[4px]
          [&_small]:text-[#8ba398] [&_small]:text-[10px] [&_small]:font-normal justify-center
          p-[18px] mt-[8px] min-h-[88px] text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              selectDocument(event.dataTransfer.files[0])
            }}
          >
            <FormInput variant="employee-file"
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
            <TextButton
              type="button"
              onClick={() => onChangeUpload('educationDocument', null)}
            >
              Remove document
            </TextButton>
          )}
          {documentError && (
            <small className="field-error employee-base:block employee-base:text-[11px] employee-base:font-normal
          employee-base:[color:#b33450] employee-base:mt-[7px] employee-base:leading-[1.6]" role="alert">
              {documentError}
            </small>
          )}
        </div>
      </div>
    </fieldset>
  )
}
