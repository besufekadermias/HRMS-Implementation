import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Card from '../common/Card.jsx'
import Button from '../common/Button.jsx'
import { FormInput } from '../common/FormFields.jsx'
import Icon from '../common/Icon.jsx'
import { adminProfileSchema, accountSecuritySchema } from '../../utils/validation/accountSchemas.js'

const profileFields = [
  { name: 'fullName', label: 'Full name', autoComplete: 'name', maxLength: 120, required: true },
  { name: 'contactEmail', label: 'Contact email', type: 'email', autoComplete: 'email', maxLength: 120, required: true,
    help: 'Used for your profile contact details. Manage your sign-in email in Login & Security.' },
  { name: 'phoneNumber', label: 'Phone number', type: 'tel', autoComplete: 'tel', maxLength: 40,
    help: 'Optional. Include your country code, for example +251 911 123 456.' },
]
const securityFields = [
  { name: 'email', label: 'Sign-in email', type: 'email', autoComplete: 'username', maxLength: 120, required: true },
  { name: 'currentPassword', label: 'Current password', type: 'password', autoComplete: 'current-password', required: true,
    help: 'Required to change your sign-in email or password.' },
  { name: 'newPassword', label: 'New password', type: 'password', autoComplete: 'new-password', maxLength: 128,
    help: 'Use 12–128 characters. Leave blank to keep your current password.' },
  { name: 'confirmPassword', label: 'Confirm new password', type: 'password', autoComplete: 'new-password', maxLength: 128 },
]
const securityBaseline = account => ({ email: account.loginEmail, currentPassword: '', newPassword: '', confirmPassword: '' })

export default function AccountForm({ account, mode, onSave, onDirtyChange, busy }) {
  const security = mode === 'security'
  const baseline = security ? securityBaseline(account) : account.profile
  const { register, handleSubmit, reset, clearErrors, setError, setFocus,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({ defaultValues: baseline, resolver: zodResolver(security ? accountSecuritySchema : adminProfileSchema, undefined, { raw: true }) })
  const savingRef = useRef(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const locked = busy || isSubmitting
  useEffect(() => { onDirtyChange(isDirty) }, [isDirty, onDirtyChange])

  function resetChanges() {
    if (locked) return
    reset(baseline)
    setShowPasswords(false)
  }

  async function submit(values) {
    if (savingRef.current || busy || !isDirty) return
    savingRef.current = true
    clearErrors('root')
    try {
      const saved = await onSave(values)
      reset(security ? securityBaseline(saved) : saved.profile)
      setShowPasswords(false)
    } catch (error) {
      const field = error.field === 'currentPassword' ? 'currentPassword' : 'root'
      setError(field, { type: 'save', message: error.message || 'Your account could not be saved. Please try again.' })
      if (field !== 'root') setFocus(field)
    } finally { savingRef.current = false }
  }

  return <Card as="form" id={`account-${mode}-form`} className="tw:p-6 tw:max-[640px]:p-[17px]" noValidate aria-busy={locked}
    onSubmit={event => handleSubmit(submit)(event)} onReset={event => { event.preventDefault(); resetChanges() }}>
    <h2 className="tw:flex tw:items-center tw:gap-[9px]"><Icon name={security ? 'key' : 'users'} className="tw:text-primary" size={20} />{security ? 'Login & Security' : 'Personal Information'}</h2>
    <p className="tw:mt-2 tw:text-[12px] tw:leading-[1.7] tw:text-text-secondary">{security
      ? 'Update your sign-in email, password, or both. Your current password confirms the change.'
      : 'Keep your name and contact information up to date. Saved changes appear throughout your admin workspace.'}</p>
    <fieldset disabled={locked} className="tw:m-0 tw:min-w-0 tw:p-0 tw:border-0">
      <div className="tw:mt-6 tw:grid tw:grid-cols-2 tw:gap-5 tw:max-[640px]:grid-cols-1">
        {(security ? securityFields : profileFields).map(field => <div key={field.name} className={field.name === 'phoneNumber' ? 'tw:col-span-2 tw:max-[640px]:col-span-1' : ''}>
          <label htmlFor={`account-${field.name}`} className="tw:block tw:text-[12px] tw:font-semibold tw:text-text-secondary">
            {field.label}{field.required && <span className="tw:text-[#b33450]"> *</span>}
          </label>
          <FormInput id={`account-${field.name}`} {...register(field.name, { onChange: () => clearErrors([field.name, 'root']) })}
            type={field.type === 'password' && showPasswords ? 'text' : field.type || 'text'}
            autoComplete={field.autoComplete} maxLength={field.maxLength} required={field.required}
            aria-invalid={!!errors[field.name]} className="tw:aria-invalid:border-[#d87589]"
            aria-describedby={`${field.help ? `account-${field.name}-help ` : ''}${errors[field.name] ? `account-${field.name}-error` : ''}`.trim() || undefined} />
          {field.help && <p id={`account-${field.name}-help`} className="tw:mt-2 tw:text-[11px] tw:leading-[1.7] tw:text-[var(--text-muted)]">{field.help}</p>}
          {errors[field.name] && <p id={`account-${field.name}-error`} role="alert" className="tw:mt-2 tw:text-[12px] tw:text-[#b33450]">{errors[field.name].message}</p>}
        </div>)}
      </div>
      {security && <label className="tw:mt-5 tw:flex tw:items-center tw:gap-2 tw:text-[12px] tw:text-text-secondary">
        <input type="checkbox" checked={showPasswords} onChange={event => setShowPasswords(event.target.checked)} className="tw:accent-primary" />Show passwords
      </label>}
      {errors.root && <p role="alert" className="tw:mt-5 tw:rounded-md tw:bg-[#fff0f3] tw:p-3 tw:text-[12px] tw:leading-[1.7] tw:text-[#b42344]">{errors.root.message}</p>}
      <div className="tw:mt-6 tw:flex tw:flex-wrap tw:items-center tw:gap-[10px] tw:border-0 tw:border-t tw:border-solid tw:border-border tw:pt-5 tw:max-[640px]:[&>.button]:flex-1">
        <span role="status" className="tw:mr-auto tw:text-[11px] tw:text-[var(--text-muted)] tw:max-[640px]:basis-full">{isDirty ? 'Unsaved changes' : 'No unsaved changes'}</span>
        <Button variant="secondary" type="reset" disabled={locked || !isDirty}>Reset Changes</Button>
        <Button type="submit" disabled={locked || !isDirty}><Icon name="check" size={17} />{isSubmitting ? 'Saving…' : security ? 'Save Account Changes' : 'Save Profile'}</Button>
      </div>
    </fieldset>
  </Card>
}
