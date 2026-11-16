import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leaveSettingsSchema } from '../../utils/validation/operationsSchemas.js'
import { showFormErrors } from '../../utils/validation/formErrors.js'
import Icon from '../common/Icon.jsx'
import { INITIAL_LEAVE_SETTINGS, MAX_LEAVE_BALANCE } from '../../utils/constants/constants.js'
import { normalizeLeaveSettings, validateLeaveSettingsRules } from '../../services/operations/leaveService.js'

export default function LeaveSettingsForm({ settings, balances, onSave, onDirtyChange }) {
  const { register, handleSubmit, reset, setError, setFocus, clearErrors,
    formState: { errors, isDirty: dirty, isSubmitting: saving },
  } = useForm({
    defaultValues: settings,
    resolver: zodResolver(leaveSettingsSchema, undefined, { raw: true }),
  })
  const [saveError, setSaveError] = useState('')
  const submitting = useRef(false)

  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])

  function fieldProps(name) {
    return { ...register(name, { onChange: () => { clearErrors(name); setSaveError('') } }),
      'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `leave-${name}-error` : undefined }
  }
  function fieldError(name) {
    return errors[name] && <small className="field-error" id={`leave-${name}-error`}>{errors[name].message}</small>
  }

  async function submit(values) {
    if (submitting.current) return
    setSaveError('')
    if (showFormErrors(validateLeaveSettingsRules(values, balances), setError, setFocus)) return
    submitting.current = true
    try {
      const savedSettings = await onSave(normalizeLeaveSettings(values))
      reset(savedSettings)
    } catch (error) {
      setSaveError(error?.message || 'Leave settings could not be saved.')
    } finally {
      submitting.current = false
    }
  }
  return <form className="card leave-settings-form" onSubmit={(event) => handleSubmit(submit)(event)} noValidate aria-busy={saving}>
    <div className="section-heading"><div><h2><Icon name="shield" size={18} /> Leave Policy</h2><p>Set the annual entitlement and balance limit. Unused days expire at Ethiopian year-end.</p></div></div>
    <fieldset className="leave-form-fieldset" disabled={saving}>
      <div className="employee-fields-grid leave-form-grid">
        {[
          ['defaultEntitlement', 'Annual entitlement (days)', 1, MAX_LEAVE_BALANCE, 'Default: 90 days. Granted to new employees and on Meskerem 1. Changing this does not adjust existing balances.'],
          ['maxBalance', 'Maximum annual balance (days)', 1, MAX_LEAVE_BALANCE, `Default: 90 days. Choose 1–${MAX_LEAVE_BALANCE} days; the cap cannot be lower than an existing remaining balance. No carryover.`],
          ['noticeDays', 'Minimum notice (calendar days)', 0, 365, 'Applies to new requests and changes to requested dates. Zero allows requests starting today.'],
        ].map(([name, label, min, max, hint]) => <label key={name}>{label} <span>*</span>
          <input {...fieldProps(name)} type="number" min={min} max={max} step="1" required
            aria-invalid={!!errors[name]} aria-describedby={`leave-setting-${name}`} />
          <small id={`leave-setting-${name}`} className={errors[name] ? 'field-error' : 'field-hint'}>{errors[name]?.message || hint}</small>
        </label>)}
        <label>Count requested days <span>*</span>
          <select {...fieldProps('dayCounting')}>
            <option value="calendar">Calendar days (include weekends)</option><option value="weekdays">Working days (Monday–Friday)</option>
          </select>{fieldError('dayCounting')}<small className="field-hint">Used when creating or editing requests. Public holidays are not excluded.</small>
        </label>
      </div>
      <label className="leave-policy-toggle"><input type="checkbox" {...fieldProps('requireRejectionReason')} />
        <span><strong>Require a reason when rejecting leave</strong><small>Reopening a decision and adjusting an entitlement always require a reason.</small></span>
      </label>
    </fieldset>
    {saveError && <p className="form-error" role="alert">{saveError}</p>}
    <div className="attendance-settings-actions"><span className="muted-note" role="status">{dirty ? 'Unsaved changes' : 'No unsaved changes'}</span>
      <button type="button" className="text-button" disabled={saving} onClick={() => { reset(INITIAL_LEAVE_SETTINGS, { keepDefaultValues: true }); setSaveError('') }}>Restore Defaults</button>
      <button type="button" className="button button-secondary" disabled={!dirty || saving} onClick={() => { reset(); setSaveError('') }}>Reset Changes</button>
      <button type="submit" className="button button-primary" disabled={!dirty || saving}><Icon name="check" size={17} />{saving ? 'Saving…' : 'Save Settings'}</button>
    </div>
  </form>
}
