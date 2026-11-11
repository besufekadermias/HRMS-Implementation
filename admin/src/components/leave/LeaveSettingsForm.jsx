import { useRef, useState } from 'react'
import Icon from '../common/Icon.jsx'
import { INITIAL_LEAVE_SETTINGS, MAX_LEAVE_BALANCE } from '../../utils/constants/constants.js'
import { normalizeLeaveSettings, validateLeaveSettings } from '../../services/operations/leaveService.js'

export default function LeaveSettingsForm({ settings, balances, onSave, onDirtyChange }) {
  const [values, setValues] = useState(settings)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const formRef = useRef(null)
  const submitting = useRef(false)
  const dirty = Object.keys(settings).some((key) => values[key] !== settings[key])
  function update(next) {
    setValues(next)
    setErrors({})
    setSaveError('')
    onDirtyChange(Object.keys(settings).some((key) => next[key] !== settings[key]))
  }
  async function submit(event) {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = validateLeaveSettings(values, balances)
    setErrors(nextErrors)
    setSaveError('')
    if (Object.keys(nextErrors).length) {
      formRef.current.querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus()
      return
    }
    submitting.current = true
    setSaving(true)
    const normalized = normalizeLeaveSettings(values)
    try {
      const savedSettings = await onSave(normalized)
      setValues(savedSettings)
      onDirtyChange(false)
    } catch (error) {
      setSaveError(error?.message || 'Leave settings could not be saved.')
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }
  return <form ref={formRef} className="card leave-settings-form" onSubmit={submit} noValidate aria-busy={saving}>
    <div className="section-heading"><div><h2><Icon name="shield" size={18} /> Leave Policy</h2><p>Set the annual entitlement and balance limit. Unused days expire at Ethiopian year-end.</p></div></div>
    <fieldset className="leave-form-fieldset" disabled={saving}>
      <div className="employee-fields-grid leave-form-grid">
        {[
          ['defaultEntitlement', 'Annual entitlement (days)', 1, MAX_LEAVE_BALANCE, 'Default: 90 days. Granted to new employees and on Meskerem 1. Changing this does not adjust existing balances.'],
          ['maxBalance', 'Maximum annual balance (days)', 1, MAX_LEAVE_BALANCE, `Default: 90 days. Choose 1–${MAX_LEAVE_BALANCE} days; the cap cannot be lower than an existing remaining balance. No carryover.`],
          ['noticeDays', 'Minimum notice (calendar days)', 0, 365, 'Applies to new requests and changes to requested dates. Zero allows requests starting today.'],
        ].map(([name, label, min, max, hint]) => <label key={name}>{label} <span>*</span>
          <input name={name} type="number" min={min} max={max} step="1" value={values[name]} required
            onChange={(event) => update({ ...values, [name]: event.target.value })}
            aria-invalid={!!errors[name]} aria-describedby={`leave-setting-${name}`} />
          <small id={`leave-setting-${name}`} className={errors[name] ? 'field-error' : 'field-hint'}>{errors[name] || hint}</small>
        </label>)}
        <label>Count requested days <span>*</span>
          <select name="dayCounting" value={values.dayCounting} onChange={(event) => update({ ...values, dayCounting: event.target.value })}>
            <option value="calendar">Calendar days (include weekends)</option><option value="weekdays">Working days (Monday–Friday)</option>
          </select><small className="field-hint">Used when creating or editing requests. Public holidays are not excluded.</small>
        </label>
      </div>
      <label className="leave-policy-toggle"><input type="checkbox" name="requireRejectionReason" checked={values.requireRejectionReason}
        onChange={(event) => update({ ...values, requireRejectionReason: event.target.checked })} />
        <span><strong>Require a reason when rejecting leave</strong><small>Reopening a decision and adjusting an entitlement always require a reason.</small></span>
      </label>
    </fieldset>
    {saveError && <p className="form-error" role="alert">{saveError}</p>}
    <div className="attendance-settings-actions"><span className="muted-note" role="status">{dirty ? 'Unsaved changes' : 'No unsaved changes'}</span>
      <button type="button" className="text-button" disabled={saving} onClick={() => update(INITIAL_LEAVE_SETTINGS)}>Restore Defaults</button>
      <button type="button" className="button button-secondary" disabled={!dirty || saving} onClick={() => update(settings)}>Reset Changes</button>
      <button type="submit" className="button button-primary" disabled={!dirty || saving}><Icon name="check" size={17} />{saving ? 'Saving…' : 'Save Settings'}</button>
    </div>
  </form>
}
