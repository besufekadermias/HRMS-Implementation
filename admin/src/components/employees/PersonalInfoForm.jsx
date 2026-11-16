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
    <fieldset className="employee-form-section">
      <legend>
        <span className="form-section-icon">
          <Icon name="users" size={20} />
        </span>
        <span>
          <small>STEP 01</small>Employee Identity & Demographics
        </span>
      </legend>
      <div className="employee-fields-grid">
        <label>
          Employee ID No <span>*</span>
          <input
            {...register('id')}
            placeholder="e.g. HD-IT-002"
            maxLength={30}
            required
            aria-invalid={!!errors.id}
            aria-describedby={errors.id ? 'id-error' : undefined}
          />
          {errors.id && (
            <small className="field-error" id="id-error">
              {errors.id.message}
            </small>
          )}
        </label>
        <label className="span-two">
          Full name (first, father, grandfather) <span>*</span>
          <input
            {...register('name')}
            placeholder="e.g. Yohannes Solomon Haile"
            maxLength={100}
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <small className="field-error" id="name-error">
              {errors.name.message}
            </small>
          )}
        </label>
        <div className="span-two">
          <span className="field-label">Employee photo</span>
          <label
            className="file-dropzone photo-dropzone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              selectPhoto(event.dataTransfer.files[0])
            }}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-label="Select employee photo"
              onChange={(event) => {
                selectPhoto(event.target.files[0])
                event.target.value = ''
              }}
            />
            {photo ? (
              <img src={photo.dataUrl} alt="Employee photo preview" />
            ) : (
              <span className="icon-circle tone-green">
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
            <button
              type="button"
              className="text-button"
              onClick={() => onChangeUpload('photo', null)}
            >
              Remove photo
            </button>
          )}
          {photoError && (
            <small className="field-error" role="alert">
              {photoError}
            </small>
          )}
        </div>
        <label>
          Gender <span>*</span>
          <select
            {...register('gender')}
            required
            aria-invalid={!!errors.gender}
          >
            <option value="">Select gender</option>
            {['Male', 'Female', 'Other'].map((gender) => (
              <option key={gender}>{gender}</option>
            ))}
          </select>
          {errors.gender && (
            <small className="field-error">{errors.gender.message}</small>
          )}
        </label>
        <label>
          Birth date <span>*</span>
          <input
            {...register('birthDate')}
            type="date"
            min="1900-01-01"
            max={todayInNairobi()}
            required
            aria-invalid={!!errors.birthDate}
          />
          {errors.birthDate && (
            <small className="field-error">{errors.birthDate.message}</small>
          )}
        </label>
        <label className="span-two">
          Highest qualification
          <input
            {...register('qualification')}
            placeholder="e.g. BSc in Information Technology"
            maxLength={160}
          />
        </label>
      </div>
    </fieldset>
  )
}
