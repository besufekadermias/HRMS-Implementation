import { TextButton } from '../common/Button.jsx'
import { FormInput, FormSelect } from '../common/FormFields.jsx'
import { useEffect, useRef, useState } from 'react'
import Icon from '../common/Icon.jsx'
import { todayInNairobi } from '../../utils/validation/validators.js'

export default function PersonalInfoForm({
  register,
  photo,
  errors,
  onChangeUpload,
  onPhotoBusy,
}) {
  const readerRef = useRef(null)
  const [photoError, setPhotoError] = useState('')
  useEffect(() => () => readerRef.current?.abort(), [])

  function selectPhoto(file) {
    if (!file) return
    readerRef.current?.abort()
    onPhotoBusy(false)
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setPhotoError('Choose a JPG, PNG, or WEBP image smaller than 5 MB.')
      return
    }
    setPhotoError('')
    onPhotoBusy(true)
    const reader = new FileReader()
    readerRef.current = reader
    reader.onload = () => {
      onChangeUpload('photo', { name: file.name, dataUrl: reader.result })
      onPhotoBusy(false)
    }
    reader.onerror = () => {
      setPhotoError('This image could not be read. Choose another file.')
      onPhotoBusy(false)
    }
    reader.readAsDataURL(file)
  }

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
          <Icon name="users" size={20} />
        </span>
        <span>
          <small>STEP 01</small>Employee Identity & Demographics
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
          Employee ID No <span>*</span>
          <FormInput variant="employee"
            {...register('id')}
            placeholder="e.g. HD-IT-002"
            maxLength={30}
            required
            aria-invalid={!!errors.id}
            aria-describedby={errors.id ? 'id-error' : undefined}
          />
          {errors.id && (
            <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id="id-error">
              {errors.id.message}
            </small>
          )}
        </label>
        <label className="span-two">
          Full name (first, father, grandfather) <span>*</span>
          <FormInput variant="employee"
            {...register('name')}
            placeholder="e.g. Yohannes Solomon Haile"
            maxLength={100}
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id="name-error">
              {errors.name.message}
            </small>
          )}
        </label>
        <div className="span-two">
          <span className="field-label tw:block tw:text-[#48655f] tw:text-[11px] tw:font-[650] tw:leading-[1.5] tw:[&>span]:text-[#b65265]">Employee photo</span>
          <label
            className="file-dropzone photo-dropzone tw:relative tw:flex tw:items-center tw:gap-[13px] tw:[border:1.5px_dashed_#c8ddd5]
          tw:rounded-[8px] tw:bg-[#f9fcfa] tw:text-primary tw:cursor-pointer tw:min-w-0 tw:hover:border-primary
          tw:hover:bg-[#f1faf5] tw:focus-within:[outline:2px_solid_var(--primary)]
          tw:focus-within:outline-offset-[3px] tw:[&>input]:absolute tw:[&>input]:w-[1px] tw:[&>input]:h-[1px]
          tw:[&>input]:opacity-0 tw:[&>input]:p-0 tw:[&>input]:m-0 tw:[&>span]:min-w-0 tw:[&_strong]:block
          tw:[&_strong]:text-text-secondary tw:[&_strong]:text-[12px] tw:[&_strong]:leading-[1.5]
          tw:[&_strong]:font-[550] tw:[&_strong]:[overflow-wrap:anywhere] tw:[&_small]:block tw:[&_small]:mt-[4px]
          tw:[&_small]:text-[#8ba398] tw:[&_small]:text-[10px] tw:[&_small]:font-normal tw:justify-start
          tw:min-h-[85px] tw:mt-[8px] tw:p-[14px]"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              selectPhoto(event.dataTransfer.files[0])
            }}
          >
            <FormInput variant="employee-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-label="Select employee photo"
              onChange={(event) => {
                selectPhoto(event.target.files[0])
                event.target.value = ''
              }}
            />
            {photo ? (
              <img className="tw:w-[50px] tw:h-[50px] tw:object-cover tw:rounded-[8px] tw:shrink-0" src={photo.dataUrl} alt="Employee photo preview" />
            ) : (
              <span className="icon-circle tone-green tw:shared-base:w-[46px] tw:shared-base:h-[46px] tw:shared-base:shrink-0
          tw:shared-base:rounded-[50%] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:[:where(&.tone-green)]:[color:#0b8972]
          tw:[:where(&.tone-green)]:[background:#e3f5f0]">
                <Icon name="image" size={23} />
              </span>
            )}
            <span>
              <strong>
                {photo?.name || 'Click to upload an employee photo'}
              </strong>
              <small>JPG, PNG, WEBP · Up to 5 MB</small>
            </span>
          </label>
          {photo && (
            <TextButton
              type="button"
              onClick={() => onChangeUpload('photo', null)}
            >
              Remove photo
            </TextButton>
          )}
          {photoError && (
            <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" role="alert">
              {photoError}
            </small>
          )}
        </div>
        <label>
          Gender <span>*</span>
          <FormSelect variant="employee"
            {...register('gender')}
            required
            aria-invalid={!!errors.gender}
          >
            <option value="">Select gender</option>
            {['Male', 'Female', 'Other'].map((gender) => (
              <option key={gender}>{gender}</option>
            ))}
          </FormSelect>
          {errors.gender && (
            <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]">{errors.gender.message}</small>
          )}
        </label>
        <label>
          Birth date <span>*</span>
          <FormInput variant="employee"
            {...register('birthDate')}
            type="date"
            min="1900-01-01"
            max={todayInNairobi()}
            required
            aria-invalid={!!errors.birthDate}
          />
          {errors.birthDate && (
            <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]">{errors.birthDate.message}</small>
          )}
        </label>
        <label className="span-two">
          Highest qualification
          <FormInput variant="employee"
            {...register('qualification')}
            placeholder="e.g. BSc in Information Technology"
            maxLength={160}
          />
        </label>
      </div>
    </fieldset>
  )
}
