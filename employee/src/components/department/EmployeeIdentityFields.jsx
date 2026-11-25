import { TextButton, FormInput, FormSelect, Icon } from './EmployeeFormPrimitives.jsx'
import { useEffect, useRef, useState } from 'react'

export default function PersonalInfoForm({
  register,
  photo,
  errors,
  onChangeUpload,
  onPhotoBusy,
  today,
  locked,
}) {
  const readerRef = useRef(null)
  const [photoError, setPhotoError] = useState('')
  useEffect(() => () => readerRef.current?.abort(), [])

  function selectPhoto(file) {
    if (!file || locked) return
    readerRef.current?.abort()
    onPhotoBusy(false)
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      !file.size || file.size > 5 * 1024 * 1024
    ) {
      setPhotoError('Choose a JPG, PNG, or WEBP image smaller than 5 MB.')
      return
    }
    setPhotoError('')
    onPhotoBusy(true)
    const reader = new FileReader()
    readerRef.current = reader
    reader.onload = () => {
      onChangeUpload('photo', { name: file.name, dataUrl: reader.result, file })
      onPhotoBusy(false)
    }
    reader.onerror = () => {
      setPhotoError('This image could not be read. Choose another file.')
      onPhotoBusy(false)
    }
    reader.readAsDataURL(file)
  }

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
          <Icon name="users" size={20} />
        </span>
        <span>
          <small>STEP 01</small>Employee Identity & Demographics
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
            <small className="field-error employee-base:block employee-base:text-[11px] employee-base:font-normal
          employee-base:[color:#b33450] employee-base:mt-[7px] employee-base:leading-[1.6]" id="id-error">
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
            <small className="field-error employee-base:block employee-base:text-[11px] employee-base:font-normal
          employee-base:[color:#b33450] employee-base:mt-[7px] employee-base:leading-[1.6]" id="name-error">
              {errors.name.message}
            </small>
          )}
        </label>
        <div className="span-two">
          <span className="field-label block text-[#48655f] text-[11px] font-[650] leading-[1.5] [&>span]:text-[#b65265]">Employee photo</span>
          <label
            className="file-dropzone photo-dropzone relative flex items-center gap-[13px] [border:1.5px_dashed_#c8ddd5]
          rounded-[8px] bg-[#f9fcfa] text-primary cursor-pointer min-w-0 hover:border-primary
          hover:bg-[#f1faf5] focus-within:[outline:2px_solid_var(--primary)]
          focus-within:outline-offset-[3px] [&>input]:absolute [&>input]:w-[1px] [&>input]:h-[1px]
          [&>input]:opacity-0 [&>input]:p-0 [&>input]:m-0 [&>span]:min-w-0 [&_strong]:block
          [&_strong]:text-text-secondary [&_strong]:text-[12px] [&_strong]:leading-[1.5]
          [&_strong]:font-[550] [&_strong]:[overflow-wrap:anywhere] [&_small]:block [&_small]:mt-[4px]
          [&_small]:text-[#8ba398] [&_small]:text-[10px] [&_small]:font-normal justify-start
          min-h-[85px] mt-[8px] p-[14px]"
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
              <img className="w-[50px] h-[50px] object-cover rounded-[8px] shrink-0" src={photo.dataUrl} alt="Employee photo preview" />
            ) : (
              <span className="icon-circle tone-green employee-base:w-[46px] employee-base:h-[46px] employee-base:shrink-0
          employee-base:rounded-[50%] employee-base:inline-flex employee-base:items-center
          employee-base:justify-center [:where(&.tone-green)]:[color:#0b8972]
          [:where(&.tone-green)]:[background:#e3f5f0]">
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
            <small className="field-error employee-base:block employee-base:text-[11px] employee-base:font-normal
          employee-base:[color:#b33450] employee-base:mt-[7px] employee-base:leading-[1.6]" role="alert">
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
            <small className="field-error employee-base:block employee-base:text-[11px] employee-base:font-normal
          employee-base:[color:#b33450] employee-base:mt-[7px] employee-base:leading-[1.6]">{errors.gender.message}</small>
          )}
        </label>
        <label>
          Birth date <span>*</span>
          <FormInput variant="employee"
            {...register('birthDate')}
            type="date"
            min="1900-01-01"
            max={today}
            required
            aria-invalid={!!errors.birthDate}
          />
          {errors.birthDate && (
            <small className="field-error employee-base:block employee-base:text-[11px] employee-base:font-normal
          employee-base:[color:#b33450] employee-base:mt-[7px] employee-base:leading-[1.6]">{errors.birthDate.message}</small>
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
