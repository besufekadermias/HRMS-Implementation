import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Check, Eye, EyeOff, KeyRound } from 'lucide-react'
import { passwordChangeSchema } from '../../utils/validation/passwordSchemas.js'
import { changePassword } from '../../services/auth/authService.js'
import { useEmployeeStore } from '../../store/index.js'

const emptyFields = { currentPassword: '', newPassword: '', confirmPassword: '' }
const fields = [
  {
    name: 'currentPassword',
    label: 'Current password',
    placeholder: 'Enter your current or HR temporary password',
    autocomplete: 'current-password',
  },
  {
    name: 'newPassword',
    label: 'New password',
    placeholder: 'Enter a new password',
    autocomplete: 'new-password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm new password',
    placeholder: 'Re-enter your new password',
    autocomplete: 'new-password',
  },
]

export default function ChangePassword() {
  const { user, securityBusy, setSecurityBusy, setPasswordDirty, setUser, setNotice } =
    useEmployeeStore()
  const navigate = useNavigate()
  const [visible, setVisible] = useState({})
  const [saved, setSaved] = useState(false)
  const [errorFocus, setErrorFocus] = useState(null)
  const savingRef = useRef(false)
  const mounted = useRef(false)
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    setFocus,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    defaultValues: emptyFields,
    resolver: zodResolver(passwordChangeSchema),
  })
  const forced = user.mustChangePassword
  const locked = securityBusy || isSubmitting

  useEffect(() => {
    if (!locked && errorFocus) setFocus(errorFocus)
  }, [locked, errorFocus, setFocus])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  useEffect(() => {
    setPasswordDirty(isDirty)
  }, [isDirty, setPasswordDirty])
  useEffect(() => () => setPasswordDirty(false), [setPasswordDirty])
  useEffect(() => {
    if (!isDirty && !securityBusy) return
    function warnBeforeLeaving(event) {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving)
  }, [isDirty, securityBusy])

  function resetFields() {
    if (locked || savingRef.current) return
    reset(emptyFields)
    setVisible({})
    setSaved(false)
    setErrorFocus(null)
  }
  async function submit(values) {
    if (savingRef.current || securityBusy) return
    savingRef.current = true
    setSecurityBusy(true)
    setSaved(false)
    clearErrors('root')
    setErrorFocus(null)
    try {
      const updated = await changePassword(values)
      if (updated.id !== user.id || useEmployeeStore.getState().user?.id !== user.id) {
        throw new Error('Your session changed. Sign in again before continuing.')
      }
      setUser(updated)
      if (mounted.current) {
        reset(emptyFields)
        setVisible({})
        setPasswordDirty(false)
        if (forced) {
          setNotice('Password changed successfully. Your employee workspace is ready.')
          navigate('/dashboard', { replace: true })
        } else setSaved(true)
      }
    } catch (error) {
      if (!mounted.current) return
      let firstField
      for (const [name, message] of Object.entries(error.fields || {})) {
        if (!Object.hasOwn(emptyFields, name)) continue
        setError(name, { type: 'server', message })
        firstField ||= name
      }
      if (firstField) setErrorFocus(firstField)
      else
        setError('root', {
          type: 'server',
          message: error.message || 'Your password could not be changed. Please try again.',
        })
    } finally {
      savingRef.current = false
      setSecurityBusy(false)
    }
  }

  return (
    <div className="max-w-[820px]">
      <div
        className={String.raw`dashboard-intro employee-base:flex employee-base:items-center employee-base:justify-between
    employee-base:gap-[22px] employee-base:mb-[25px] employee-page:screen-max-768:block
    employee-page:screen-max-768:mb-[22px]`}
      >
        <div>
          <p
            className={String.raw`intro-eyebrow employee-base:flex employee-base:items-center employee-base:gap-[11px] employee-base:mb-[10px]
    employee-base:text-[length:10px] employee-base:text-[color:var(--text-muted)]
    employee-page:screen-max-480:gap-[8px] employee-page:screen-max-480:text-[length:9px]`}
          >
            <span
              className={String.raw`eyebrow employee-base:text-[length:10px] employee-base:font-[700] employee-base:tracking-[1.4px]
    employee-base:uppercase employee-base:text-[color:var(--primary)]
    employee-page:screen-max-480:text-[length:9px] employee-page:screen-max-480:tracking-[1.1px]`}
            >
              ACCOUNT SECURITY
            </span>
          </p>
          <h1>Change Account Password</h1>
          <p
            className={String.raw`intro-description employee-base:mt-[9px] employee-base:text-[length:12px] employee-base:leading-[1.8]
    employee-base:text-[color:var(--text-secondary)]`}
          >
            {forced
              ? 'Replace the initial temporary password provided by HR with your own password.'
              : 'Keep your employee account secure by updating your password.'}
          </p>
        </div>
      </div>
      {forced && (
        <section
          className={String.raw`warning-notice mb-5 flex items-start gap-3 employee-base:p-[12px_14px]
    employee-base:[border:1px_solid_#f1e2bd] employee-base:rounded-[7px] employee-base:text-[length:12px]
    employee-base:leading-[1.7] employee-base:text-[color:#9b650e] employee-base:[border-color:#f1e2bd]
    employee-base:[background:#fff8e8]`}
          aria-labelledby="first-login-title"
        >
          <AlertCircle
            size={20}
            className="mt-0.5"
          />
          <div>
            <h2
              id="first-login-title"
              className="text-[13px]"
            >
              First-time setup required
            </h2>
            <p className="mt-1">
              You must change your HR temporary password before accessing the dashboard.
            </p>
          </div>
        </section>
      )}
      <section
        className={String.raw`surface content-card employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:p-[22px_23px]
    employee-page:screen-max-768:p-[20px_17px]`}
      >
        <div
          className={String.raw`section-heading employee-base:flex employee-base:items-start employee-base:justify-between
    employee-base:gap-[12px] employee-base:mb-[20px] employee-base:[&_h2]:flex
    employee-base:[&_h2]:items-center employee-base:[&_h2]:gap-[9px]
    employee-base:[&_h2_svg]:text-[color:var(--primary)] employee-base:[&_p]:mt-[6px]
    employee-base:[&_p]:text-[color:var(--text-muted)] employee-base:[&_p]:text-[length:12px]
    employee-base:[&_p]:leading-[1.5] employee-page:screen-max-768:[&_h2]:text-[length:15px]`}
        >
          <div>
            <h2>
              <KeyRound size={19} />
              Password Details
            </h2>
            <p>Your current password confirms this change.</p>
          </div>
        </div>
        <form
          onSubmit={(event) => handleSubmit(submit)(event)}
          onReset={(event) => {
            event.preventDefault()
            resetFields()
          }}
          noValidate
          aria-busy={locked}
        >
          <fieldset
            disabled={locked}
            className="m-0 min-w-0 border-0 p-0"
          >
            <div className="space-y-5">
              {fields.map((field) => (
                <div key={field.name}>
                  <label htmlFor={`password-${field.name}`}>
                    {field.label} <span className="text-[#b33450]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id={`password-${field.name}`}
                      {...register(field.name, {
                        onChange: () => {
                          clearErrors([field.name, 'root'])
                          setSaved(false)
                        },
                      })}
                      type={visible[field.name] ? 'text' : 'password'}
                      autoComplete={field.autocomplete}
                      placeholder={field.placeholder}
                      className="pr-12"
                      maxLength={field.name === 'currentPassword' ? undefined : 128}
                      required
                      aria-invalid={!!errors[field.name]}
                      aria-describedby={
                        [
                          field.name === 'newPassword' ? 'new-password-help' : '',
                          errors[field.name] ? `${field.name}-error` : '',
                        ]
                          .filter(Boolean)
                          .join(' ') || undefined
                      }
                    />
                    <button
                      type="button"
                      className={String.raw`password-toggle employee-base:absolute employee-base:[right:6px] employee-base:[top:50%]
    employee-base:[transform:translateY(-50%)] employee-base:p-[7px]
    employee-base:text-[color:var(--text-muted)] employee-base:rounded-[5px]
    employee-base:[&:hover]:[background:var(--search-bg)]`}
                      aria-label={`${visible[field.name] ? 'Hide' : 'Show'} ${field.label.toLowerCase()}`}
                      aria-pressed={!!visible[field.name]}
                      onClick={() =>
                        setVisible((state) => ({ ...state, [field.name]: !state[field.name] }))
                      }
                    >
                      {visible[field.name] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {field.name === 'newPassword' && (
                    <p
                      id="new-password-help"
                      className="mt-2 text-[11px] leading-[1.7] text-muted"
                    >
                      Use 12–128 characters and choose a password different from your current
                      password.
                    </p>
                  )}
                  {errors[field.name] && (
                    <p
                      id={`${field.name}-error`}
                      className={String.raw`field-error employee-base:mt-[8px] employee-base:text-[color:#b33450] employee-base:text-[length:12px]
    employee-base:leading-[1.7]`}
                      role="alert"
                    >
                      {errors[field.name].message}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {errors.root && (
              <p
                className={String.raw`error-notice mt-5 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#b42344] employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
                role="alert"
              >
                {errors.root.message}
              </p>
            )}
            {saved && (
              <p
                className={String.raw`info-notice mt-5 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#d7ece4]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#166c5b] employee-base:[border-color:#d7ece4] employee-base:[background:#f0faf5]`}
                role="status"
              >
                Your password was changed successfully.
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5 max-[480px]:[&>button]:flex-1">
              <span
                className="mr-auto text-[11px] text-muted max-[480px]:basis-full"
                role="status"
              >
                {locked
                  ? 'Saving your password…'
                  : isDirty
                    ? 'Unsaved changes'
                    : 'No unsaved changes'}
              </span>
              <button
                type="reset"
                className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
                disabled={locked || !isDirty}
              >
                Reset Fields
              </button>
              <button
                type="submit"
                className={String.raw`primary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
                disabled={locked || !isDirty}
              >
                <Check size={17} />
                {locked ? 'Saving…' : 'Save New Password'}
              </button>
            </div>
          </fieldset>
        </form>
      </section>
    </div>
  )
}
