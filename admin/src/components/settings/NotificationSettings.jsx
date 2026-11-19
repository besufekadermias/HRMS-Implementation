import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Card from '../common/Card.jsx'
import Button from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import { notificationSettingsSchema } from '../../utils/validation/settingsSchemas.js'
import { INITIAL_NOTIFICATION_SETTINGS, NOTIFICATION_DESCRIPTIONS } from '../../utils/constants/settingsConstants.js'
import { NOTIFICATION_CATEGORIES } from '../../utils/constants/notificationConstants.js'

export default function NotificationSettings({ settings, onSave, onDirtyChange, busy = false }) {
  const { register, control, handleSubmit, clearErrors, setError, setFocus, reset,
    formState: { errors, isDirty: dirty, isSubmitting: saving },
  } = useForm({ defaultValues: settings, resolver: zodResolver(notificationSettingsSchema, undefined, { raw: true }), shouldFocusError: false })
  const [enabled, categories] = useWatch({ control, name: ['enabled', 'categories'] })
  const chosen = NOTIFICATION_CATEGORIES.filter(item => categories?.[item.value])
  const locked = busy || saving
  const savingRef = useRef(false)

  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])

  async function submit(values) {
    if (savingRef.current || busy) return
    savingRef.current = true
    clearErrors('root')
    try {
      const saved = await onSave(values)
      reset(saved)
    } catch (error) {
      setError('root', { type: 'save', message: error.message || 'Notification settings could not be saved. Please try again.' })
    } finally {
      savingRef.current = false
    }
  }

  function checkboxProps(name) {
    const parts = name.split('.')
    const error = parts.length === 1 ? errors[name] : errors[parts[0]]?.[parts[1]]
    return {
      ...register(name, { onChange: () => clearErrors([name, 'root']) }),
      type: 'checkbox',
      'aria-invalid': !!error,
      'aria-describedby': error ? `notification-settings-${parts.at(-1)}-error` : undefined,
      className: 'tw:size-[18px] tw:shrink-0 tw:mt-[2px] tw:accent-primary tw:cursor-pointer tw:disabled:cursor-default',
    }
  }

  function fieldError(name) {
    const error = name === 'enabled' ? errors.enabled : errors.categories?.[name]
    return error && <p id={`notification-settings-${name}-error`} role="alert" className="tw:mt-[7px] tw:text-[11px] tw:text-[#b33450]">{error.message}</p>
  }

  return <Card as="form" id="notification-settings-form" className="tw:p-[24px] tw:max-[640px]:p-[17px]" noValidate aria-busy={saving}
    onReset={event => { event.preventDefault(); if (!locked) reset(settings) }}
    onSubmit={event => handleSubmit(submit, nextErrors => setFocus(nextErrors.enabled ? 'enabled' : `categories.${Object.keys(nextErrors.categories || {})[0]}`))(event)}>
    <h2 className="tw:flex tw:items-center tw:gap-[9px]"><Icon name="bell" size={20} className="tw:text-primary" /> Notification Settings</h2>
    <p className="tw:mt-[6px] tw:text-[12px] tw:text-[var(--text-muted)] tw:leading-[1.7]">Choose which updates appear on the notification page and in the header bell. Changes apply after saving.</p>
    <fieldset disabled={locked} className="tw:m-0 tw:p-0 tw:border-0 tw:min-w-0">
      <label className="tw:flex tw:items-start tw:gap-[12px] tw:mt-[22px] tw:p-[16px] tw:rounded-[9px] tw:bg-icon-bg tw:cursor-pointer">
        <input {...checkboxProps('enabled')} role="switch" />
        <span className="tw:min-w-0"><strong className="tw:block tw:text-[13px] tw:text-text-primary">Show in-app notifications</strong>
          <span className="tw:block tw:mt-[5px] tw:text-[12px] tw:text-text-secondary tw:leading-[1.7]">Turn this off to pause notifications in this workspace. Your category choices and read status are kept.</span>
          {fieldError('enabled')}
        </span>
      </label>
      <fieldset disabled={!enabled} className="tw:m-0 tw:p-0 tw:border-0 tw:min-w-0 tw:mt-[22px] tw:disabled:opacity-60">
        <legend className="tw:text-[12px] tw:font-semibold tw:text-text-primary tw:mb-[12px]">Notification categories</legend>
        <div className="tw:grid tw:grid-cols-2 tw:gap-[12px] tw:max-[640px]:grid-cols-1">
          {NOTIFICATION_CATEGORIES.map(item => <label key={item.value} className="tw:flex tw:items-start tw:gap-[11px] tw:p-[16px] tw:border tw:border-solid tw:border-border tw:rounded-[9px] tw:cursor-pointer">
            <input {...checkboxProps(`categories.${item.value}`)} />
            <span className="tw:min-w-0">
              <strong className="tw:flex tw:items-center tw:gap-[7px] tw:text-[12px] tw:text-text-primary"><Icon name={item.icon} size={16} className="tw:text-primary tw:shrink-0" />{item.label}</strong>
              <span className="tw:block tw:mt-[6px] tw:text-[11px] tw:text-[var(--text-muted)] tw:leading-[1.8]">{NOTIFICATION_DESCRIPTIONS[item.value]}</span>
              {fieldError(item.value)}
            </span>
          </label>)}
        </div>
      </fieldset>
      <p role="status" className="tw:mt-[17px] tw:p-[12px_14px] tw:rounded-[7px] tw:bg-icon-bg tw:text-[12px] tw:text-primary tw:leading-[1.8]">
        After saving: {enabled && chosen.length ? `${chosen.length} of ${NOTIFICATION_CATEGORIES.length} categories enabled — ${chosen.map(item => item.label).join(', ')}.` : 'Notifications will be turned off.'}
      </p>
      <p className="tw:mt-[12px] tw:text-[11px] tw:text-[var(--text-muted)] tw:leading-[1.8]">Turning off a category hides its updates. Requests remain available in their own sections, and no decisions are changed.</p>
      {errors.root && <p role="alert" className="tw:mt-[16px] tw:p-[10px_12px] tw:rounded-[5px] tw:bg-[#fff0f3] tw:text-[#b42344] tw:text-[12px] tw:leading-[1.7]">{errors.root.message}</p>}
      <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-[10px] tw:mt-[24px] tw:pt-[20px] tw:border-0 tw:border-t tw:border-solid tw:border-border tw:max-[640px]:[&>.button]:flex-1">
        <span role="status" className="tw:mr-auto tw:text-[11px] tw:text-[var(--text-muted)] tw:max-[640px]:basis-full">{dirty ? 'Unsaved changes' : 'No unsaved changes'}</span>
        <Button variant="secondary" type="button" disabled={locked || !dirty} onClick={() => reset(settings)}>Reset Changes</Button>
        <Button variant="secondary" type="button" disabled={locked} onClick={() => reset(structuredClone(INITIAL_NOTIFICATION_SETTINGS), { keepDefaultValues: true })}>Restore Defaults</Button>
        <Button type="submit" disabled={locked || !dirty}><Icon name="check" size={17} />{saving ? 'Saving…' : 'Save Notifications'}</Button>
      </div>
    </fieldset>
  </Card>
}
