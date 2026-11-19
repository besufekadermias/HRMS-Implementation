import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Card from '../common/Card.jsx'
import Button from '../common/Button.jsx'
import { FormInput, FormSelect, FormTextarea } from '../common/FormFields.jsx'
import Icon from '../common/Icon.jsx'
import { COMPANY_LOGO_ACCEPT, DATE_DISPLAY_FORMATS, TIME_DISPLAY_FORMATS } from '../../utils/constants/settingsConstants.js'
import { companyLogoSchema, generalSettingsSchema } from '../../utils/validation/settingsSchemas.js'
import formatDate from '../../utils/formatters/formatDate.js'
import formatTime from '../../utils/formatters/formatTime.js'

export default function GeneralSettings({ settings, onSave, onDirtyChange, busy = false }) {
  const { register, control, handleSubmit, setValue, setError, clearErrors, setFocus, reset,
    formState: { errors, isDirty, isSubmitting: saving },
  } = useForm({
    defaultValues: settings,
    resolver: zodResolver(generalSettingsSchema, undefined, { raw: true }),
    shouldFocusError: false,
  })
  const logo = useWatch({ control, name: 'logo' })
  const [dateFormat, timeFormat] = useWatch({ control, name: ['dateFormat', 'timeFormat'] })
  const displayPreferences = { dateFormat, timeFormat }
  const validLogo = companyLogoSchema.safeParse(logo).success ? logo : null
  const [preview, setPreview] = useState(null)
  const fileRef = useRef(null)
  const savingRef = useRef(false)
  const locked = saving || busy
  // RHF cannot compare File contents; compare the selected file to the saved one.
  const dirty = isDirty || logo !== settings.logo
  const readingLogo = !!validLogo && preview?.file !== validLogo
  const logoError = preview?.file === validLogo ? preview?.error : ''

  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])

  useEffect(() => {
    if (!validLogo) return undefined
    let active = true
    const reader = new FileReader()
    const image = new Image()
    function fail() {
      if (!active) return
      const message = 'This image could not be opened. Choose another PNG or JPG.'
      setPreview({ file: validLogo, error: message })
      setError('logo', { type: 'file', message })
    }
    reader.onerror = fail
    reader.onload = () => { image.src = reader.result }
    image.onerror = fail
    image.onload = () => {
      if (active) setPreview({ file: validLogo, url: reader.result })
    }
    reader.readAsDataURL(validLogo)
    return () => {
      active = false
      image.onload = null
      image.onerror = null
      if (reader.readyState === FileReader.LOADING) reader.abort()
    }
  }, [validLogo, setError])

  function changeLogo(file) {
    clearErrors(['logo', 'root'])
    setValue('logo', file, { shouldDirty: true })
    const result = companyLogoSchema.safeParse(file)
    if (!result.success) setError('logo', { type: 'file', message: result.error.issues[0].message })
    if (fileRef.current) fileRef.current.value = ''
  }

  function focusField(name) {
    if (name === 'logo') fileRef.current?.focus()
    else setFocus(name)
  }

  async function submit(values) {
    if (savingRef.current || readingLogo || busy) return
    if (logoError) {
      setError('logo', { type: 'file', message: logoError })
      focusField('logo')
      return
    }
    savingRef.current = true
    clearErrors('root')
    try {
      const saved = await onSave(values)
      reset(saved)
    } catch (error) {
      setError('root', { type: 'save', message: error.message || 'General settings could not be saved. Please try again.' })
    } finally {
      savingRef.current = false
    }
  }

  function fieldProps(name) {
    return {
      ...register(name, { onChange: () => clearErrors([name, 'root']) }),
      disabled: locked,
      'aria-invalid': !!errors[name],
      'aria-describedby': errors[name] ? `settings-${name}-error` : undefined,
    }
  }

  function fieldError(name) {
    return errors[name] && <small id={`settings-${name}-error`} className="tw:block tw:mt-[7px] tw:text-[11px] tw:font-normal tw:text-[#b33450] tw:leading-[1.6]" role="alert">{errors[name].message}</small>
  }

  return <Card as="form" id="general-settings-form" className="tw:p-[24px] tw:max-[640px]:p-[17px]"
    onReset={event => { event.preventDefault(); if (!locked) { reset(settings); if (fileRef.current) fileRef.current.value = '' } }}
    onSubmit={event => handleSubmit(submit, nextErrors => focusField(Object.keys(nextErrors)[0]))(event)} noValidate aria-busy={saving}>
    <div className="tw:pb-[20px] tw:border-0 tw:border-b tw:border-solid tw:border-border">
      <h2 className="tw:flex tw:items-center tw:gap-[9px]"><Icon name="building" size={20} className="tw:text-primary" /> Company Profile</h2>
      <p className="tw:mt-[6px] tw:text-[12px] tw:text-[var(--text-muted)] tw:leading-[1.7]">Manage your company name and contact details.</p>
    </div>

    <div className="tw:flex tw:items-start tw:gap-[18px] tw:py-[24px] tw:max-[480px]:gap-[12px]">
      <div className="tw:flex tw:shrink-0 tw:items-center tw:justify-center tw:size-[88px] tw:rounded-[14px] tw:bg-icon-bg tw:text-primary tw:border tw:border-solid tw:border-border tw:overflow-hidden tw:max-[480px]:size-[68px]">
        {validLogo && preview?.file === validLogo && preview.url
          ? <img src={preview.url} alt="Company logo preview" className="tw:block tw:w-full tw:h-full tw:object-contain" />
          : <Icon name="building" size={32} />}
      </div>
      <div className="tw:flex-1 tw:min-w-0">
        <label htmlFor="settings-logo" className="tw:block tw:text-[12px] tw:font-semibold tw:text-text-secondary">Company logo <span className="tw:font-normal tw:text-[var(--text-muted)]">(optional)</span></label>
        <FormInput ref={fileRef} type="file" id="settings-logo" name="logo" accept={COMPANY_LOGO_ACCEPT} disabled={locked}
          className="tw:p-[8px] tw:text-[11px] tw:aria-invalid:border-[#d87589] tw:file:mr-[8px] tw:file:rounded-[4px] tw:file:border tw:file:border-solid tw:file:border-border tw:file:bg-icon-bg tw:file:text-primary tw:file:p-[5px_8px] tw:file:cursor-pointer"
          onChange={event => { const file = event.target.files[0]; if (file) changeLogo(file) }}
          aria-invalid={!!errors.logo} aria-describedby={`settings-logo-help${errors.logo ? ' settings-logo-error' : ''}`} />
        <p id="settings-logo-help" className="tw:mt-[7px] tw:text-[11px] tw:text-[var(--text-muted)]">PNG or JPG, up to 2 MB.</p>
        {logo && <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-[8px] tw:mt-[8px]">
          <span className="tw:min-w-0 tw:text-[11px] tw:text-text-secondary tw:[overflow-wrap:anywhere]">{logo.name}</span>
          <Button variant="secondary" size="leave-manage" type="button" disabled={locked} onClick={() => changeLogo(null)}>Remove logo</Button>
        </div>}
        {readingLogo && <p className="tw:mt-[7px] tw:text-[11px] tw:text-text-secondary" role="status">Preparing logo preview…</p>}
        {fieldError('logo')}
      </div>
    </div>

    <div className="tw:grid tw:grid-cols-2 tw:gap-[20px] tw:[&_label]:block tw:[&_label]:text-[12px] tw:[&_label]:font-semibold tw:[&_label]:text-text-secondary tw:[&_input]:aria-invalid:border-[#d87589] tw:[&_textarea]:aria-invalid:border-[#d87589] tw:max-[640px]:grid-cols-1">
      <label>Company name <span className="tw:text-[#b33450]">*</span>
        <FormInput {...fieldProps('companyName')} required maxLength={120} autoComplete="organization" placeholder="Company name" />
        {fieldError('companyName')}
      </label>
      <label>Work email <span className="tw:text-[#b33450]">*</span>
        <FormInput {...fieldProps('workEmail')} type="email" required maxLength={254} autoComplete="email" placeholder="hr@example.com" />
        {fieldError('workEmail')}
      </label>
      <label>Phone number <span className="tw:font-normal tw:text-[var(--text-muted)]">(optional)</span>
        <FormInput {...fieldProps('phoneNumber')} type="tel" maxLength={40} autoComplete="tel" placeholder="+251 911 123 456" />
        {fieldError('phoneNumber')}
      </label>
      <label>Website <span className="tw:font-normal tw:text-[var(--text-muted)]">(optional)</span>
        <FormInput {...fieldProps('website')} maxLength={2048} autoComplete="url" placeholder="www.example.com" spellCheck={false} />
        {fieldError('website')}
      </label>
      <label className="tw:col-span-full">Office address <span className="tw:font-normal tw:text-[var(--text-muted)]">(optional)</span>
        <FormTextarea {...fieldProps('officeAddress')} maxLength={500} rows={3} autoComplete="street-address" placeholder="Office location or postal address" className="tw:min-h-[88px]" />
        {fieldError('officeAddress')}
      </label>
    </div>

    <p className="tw:mt-[14px] tw:text-[11px] tw:text-[var(--text-muted)]">Fields marked * are required.</p>

    <section aria-labelledby="settings-display-heading" className="tw:mt-[24px] tw:pt-[22px] tw:border-0 tw:border-t tw:border-solid tw:border-border">
      <h2 id="settings-display-heading" className="tw:flex tw:items-center tw:gap-[9px]"><Icon name="clock" size={20} className="tw:text-primary" /> Display Preferences</h2>
      <p className="tw:mt-[6px] tw:text-[12px] tw:text-[var(--text-muted)] tw:leading-[1.7]">Choose how dates and times appear in the workspace. Your choices apply after saving.</p>
      <div className="tw:grid tw:grid-cols-2 tw:gap-[20px] tw:mt-[18px] tw:[&_label]:block tw:[&_label]:text-[12px] tw:[&_label]:font-semibold tw:[&_label]:text-text-secondary tw:[&_select]:aria-invalid:border-[#d87589] tw:max-[640px]:grid-cols-1">
        <label>Date display format
          <FormSelect {...fieldProps('dateFormat')}>
            {DATE_DISPLAY_FORMATS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </FormSelect>
          {fieldError('dateFormat')}
        </label>
        <label>Time display format
          <FormSelect {...fieldProps('timeFormat')}>
            {TIME_DISPLAY_FORMATS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </FormSelect>
          {fieldError('timeFormat')}
        </label>
      </div>
      <p className="tw:mt-[16px] tw:p-[12px_14px] tw:bg-icon-bg tw:rounded-[7px] tw:text-[12px] tw:text-primary tw:leading-[1.7]" role="status" aria-live="polite">
        Preview: <strong>{formatDate('2026-11-18', {}, displayPreferences)} · {formatTime('13:30', {}, displayPreferences)}</strong>
      </p>
    </section>

    {errors.root && <p className="tw:mt-[16px] tw:p-[10px_12px] tw:rounded-[5px] tw:bg-[#fff0f3] tw:text-[#b42344] tw:text-[12px] tw:leading-[1.6]" role="alert">{errors.root.message}</p>}
    <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-[10px] tw:mt-[24px] tw:pt-[20px] tw:border-0 tw:border-t tw:border-solid tw:border-border tw:max-[640px]:[&>.button]:flex-1">
      <span className="tw:mr-auto tw:text-[11px] tw:text-[var(--text-muted)] tw:max-[640px]:basis-full" role="status">{dirty ? 'Unsaved changes' : 'No unsaved changes'}</span>
      <Button variant="secondary" type="button" disabled={locked || (!dirty && !errors.logo)} onClick={() => {
        reset(settings)
        if (fileRef.current) fileRef.current.value = ''
      }}>Reset Changes</Button>
      <Button type="submit" disabled={!dirty || locked || readingLogo}>
        <Icon name="check" size={17} />{saving ? 'Saving…' : 'Save Changes'}
      </Button>
    </div>
  </Card>
}
