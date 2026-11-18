import { TextButton } from '../common/Button.jsx'
import { FormSelect, FormInput } from '../common/FormFields.jsx'
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
    <fieldset className="employee-form-section tw:[border:0] tw:m-[0_0_30px] tw:p-0 tw:min-w-0 tw:[&>legend]:flex tw:[&>legend]:items-center
          tw:[&>legend]:gap-[11px] tw:[&>legend]:w-full tw:[&>legend]:p-[0_0_16px] tw:[&>legend]:mb-[22px]
          tw:[&>legend]:[border-bottom:1px_solid_#e4eee9] tw:[&>legend]:text-[14px] tw:[&>legend]:font-[650]
          tw:[&>legend]:text-[#154d44] tw:[&>legend_small]:block tw:[&>legend_small]:text-[8px]
          tw:[&>legend_small]:tracking-[1.3px] tw:[&>legend_small]:text-[#71928a] tw:[&>legend_small]:mb-[4px]
          tw:[&>legend_small]:font-[600] tw:max-[768px]:[&>legend]:text-[13px]
          tw:max-[560px]:[&>legend]:leading-[1.6] tw:max-[560px]:[&>legend]:items-start">
      <legend>
        <span className="form-section-icon tw:inline-flex tw:items-center tw:justify-center tw:w-[36px] tw:h-[36px] tw:rounded-[8px]
          tw:bg-[#e9f7f1] tw:text-primary tw:shrink-0">
          <Icon name="building" size={20} />
        </span>
        <span>
          <small>STEP 02</small>Department Placement, Grade & Education
        </span>
      </legend>
      <div className="employee-fields-grid tw:grid tw:grid-cols-3 tw:gap-[23px_22px] tw:max-[1100px]:gap-[20px_17px]
          tw:max-[768px]:grid-cols-2 tw:max-[560px]:grid-cols-[minmax(0,_1fr)] tw:[&>label]:block
          tw:[&>label]:text-[#48655f] tw:[&>label]:text-[11px] tw:[&>label]:font-[650] tw:[&>label]:leading-[1.5]
          tw:[&>label>span:not(.password-field)]:text-[#b65265] tw:[&_.span-two]:[grid-column:span_2]
          tw:max-[768px]:[&_.span-two]:col-span-full tw:max-[560px]:[&_.span-two]:col-auto tw:shared-base:grid
          tw:shared-base:grid-cols-[repeat(3,_minmax(0,_1fr))] tw:shared-base:gap-[23px_22px]
          tw:shared-base:[&_>_label]:block tw:shared-base:[&_>_label]:[color:#48655f]
          tw:shared-base:[&_>_label]:text-[11px] tw:shared-base:[&_>_label]:font-[650]
          tw:shared-base:[&_>_label]:leading-[1.5]
          tw:shared-base:[&_>_label_>_span:not(.password-field)]:[color:#b65265]
          tw:shared-base:[&_.span-two]:col-[span_2] tw:max-[1100px]:shared-base:gap-[20px_17px]
          tw:max-[768px]:shared-base:grid-cols-[repeat(2,_minmax(0,_1fr))]
          tw:max-[768px]:shared-base:[&_.span-two]:col-[1_/_-1]
          tw:max-[560px]:shared-base:grid-cols-[minmax(0,_1fr)]
          tw:max-[560px]:shared-base:[&_.span-two]:col-[auto]
          tw:max-[560px]:shared-base:[&_>_label]:text-[11px]">
        <label>
          Assigned department <span>*</span>
          <FormSelect variant="employee"
            {...register('department')}
            required
            aria-invalid={!!errors.department}
          >
            <option value="">Select department</option>
            {departments.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </FormSelect>
          {errors.department && (
            <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]">{errors.department.message}</small>
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
            <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]">{errors.grade.message}</small>
          )}
          {!grades.length && (
            <small className="field-hint tw:shared-base:block tw:shared-base:text-[10px] tw:shared-base:font-normal
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:mt-[7px]">
              Add a job grade in Grades &amp; Scales before registering
              employees.
            </small>
          )}
          {salary && (
            <small className="field-hint tw:shared-base:block tw:shared-base:text-[10px] tw:shared-base:font-normal
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:mt-[7px]">
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
            <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]">{errors.employmentType.message}</small>
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
            <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]">{errors.hiredDate.message}</small>
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
        <div className="full-width tw:col-span-full tw:shared-base:col-[1_/_-1]">
          <span className="field-label tw:block tw:text-[#48655f] tw:text-[11px] tw:font-[650] tw:leading-[1.5] tw:[&>span]:text-[#b65265]">Education document</span>
          <label
            className="file-dropzone document-dropzone tw:relative tw:flex tw:items-center tw:gap-[13px] tw:[border:1.5px_dashed_#c8ddd5]
          tw:rounded-[8px] tw:bg-[#f9fcfa] tw:text-primary tw:cursor-pointer tw:min-w-0 tw:hover:border-primary
          tw:hover:bg-[#f1faf5] tw:focus-within:[outline:2px_solid_var(--primary)]
          tw:focus-within:outline-offset-[3px] tw:[&>input]:absolute tw:[&>input]:w-[1px] tw:[&>input]:h-[1px]
          tw:[&>input]:opacity-0 tw:[&>input]:p-0 tw:[&>input]:m-0 tw:[&>span]:min-w-0 tw:[&_strong]:block
          tw:[&_strong]:text-text-secondary tw:[&_strong]:text-[12px] tw:[&_strong]:leading-[1.5]
          tw:[&_strong]:font-[550] tw:[&_strong]:[overflow-wrap:anywhere] tw:[&_small]:block tw:[&_small]:mt-[4px]
          tw:[&_small]:text-[#8ba398] tw:[&_small]:text-[10px] tw:[&_small]:font-normal tw:justify-center
          tw:p-[18px] tw:mt-[8px] tw:min-h-[88px] tw:text-center"
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
            <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" role="alert">
              {documentError}
            </small>
          )}
        </div>
      </div>
    </fieldset>
  )
}
