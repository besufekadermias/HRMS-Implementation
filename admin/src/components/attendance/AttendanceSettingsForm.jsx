import { useRef, useState } from 'react'
import Icon from '../common/Icon.jsx'
import { INITIAL_ATTENDANCE_SETTINGS } from '../../utils/constants/constants.js'
import {
  validateAttendanceSettings,
  normalizeAttendanceSettings,
} from '../../services/operations/attendanceService.js'

export default function AttendanceSettingsForm({ settings, onSave, onDirtyChange }) {
  const [values, setValues] = useState(settings)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const formRef = useRef(null)
  const dirty = Object.keys(settings).some((key) => values[key] !== settings[key])

  function updateValues(next) {
    setValues(next)
    setErrors({})
    setSaveError('')
    onDirtyChange(Object.keys(settings).some((key) => next[key] !== settings[key]))
  }

  function changeField(name, value) {
    updateValues({ ...values, [name]: value })
  }

  async function submit(event) {
    event.preventDefault()
    if (saving) return
    setSaveError('')
    const nextErrors = validateAttendanceSettings(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      formRef.current.querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus()
      return
    }
    const normalized = normalizeAttendanceSettings(values)
    setSaving(true)
    try {
      await onSave(normalized)
      setValues(normalized)
      onDirtyChange(false)
    } catch {
      setSaveError('Attendance settings could not be saved. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form id="attendance-settings-form" className="card attendance-settings-form"
      onSubmit={submit} ref={formRef} aria-busy={saving} noValidate>
      <div className="section-heading">
        <div>
          <h2><Icon name="clock" size={18} /> Working Hours</h2>
          <p>Set the daily start, end, and grace period in East Africa Time (UTC+3).</p>
        </div>
      </div>
      <div className="employee-fields-grid attendance-settings-fields">
        <label>
          Start time <span>*</span>
          <input name="startTime" type="time" value={values.startTime} required disabled={saving}
            onChange={(event) => changeField('startTime', event.target.value)}
            aria-invalid={!!errors.startTime} aria-describedby={errors.startTime ? 'attendance-start-error' : undefined} />
          {errors.startTime && <small className="field-error" id="attendance-start-error">{errors.startTime}</small>}
        </label>
        <label>
          End time <span>*</span>
          <input name="endTime" type="time" value={values.endTime} required disabled={saving}
            onChange={(event) => changeField('endTime', event.target.value)}
            aria-invalid={!!errors.endTime} aria-describedby={errors.endTime ? 'attendance-end-error' : undefined} />
          {errors.endTime && <small className="field-error" id="attendance-end-error">{errors.endTime}</small>}
        </label>
        <label className="full-width">
          Grace period (minutes) <span>*</span>
          <input name="gracePeriod" type="number" min="0" max="1439" step="1"
            value={values.gracePeriod} required disabled={saving}
            onChange={(event) => changeField('gracePeriod', event.target.value)}
            aria-invalid={!!errors.gracePeriod}
            aria-describedby={errors.gracePeriod ? 'attendance-grace-error' : 'attendance-grace-hint'} />
          {errors.gracePeriod
            ? <small className="field-error" id="attendance-grace-error">{errors.gracePeriod}</small>
            : <small className="field-hint" id="attendance-grace-hint">Extra minutes allowed after the scheduled start before an arrival is considered late.</small>}
        </label>
      </div>

      <div className="section-heading attendance-settings-network-heading">
        <div>
          <h2><Icon name="shield" size={18} /> Approved Attendance IPs</h2>
          <p>List the office network addresses intended for employee check-in and checkout.</p>
        </div>
      </div>
      <div className="employee-fields-grid attendance-settings-fields">
        <label className="full-width">
          IP addresses (optional)
          <textarea name="allowedIps" rows={5} value={values.allowedIps} disabled={saving}
            onChange={(event) => changeField('allowedIps', event.target.value)}
            placeholder={'192.0.2.10\n2001:db8::10'} spellCheck={false}
            aria-invalid={!!errors.allowedIps}
            aria-describedby={errors.allowedIps ? 'attendance-ips-error' : 'attendance-ips-hint'} />
          {errors.allowedIps
            ? <small className="field-error" id="attendance-ips-error">{errors.allowedIps}</small>
            : <small className="field-hint" id="attendance-ips-hint">Enter one IPv4 or IPv6 address per line, or separate them with commas. A blank list means no addresses are configured.</small>}
        </label>
      </div>
      {saveError && <p className="form-error" role="alert">{saveError}</p>}
      <div className="attendance-settings-actions">
        <span className="muted-note" role="status">{dirty ? 'Unsaved changes' : 'No unsaved changes'}</span>
        <button type="button" className="text-button" disabled={saving} onClick={() => updateValues(INITIAL_ATTENDANCE_SETTINGS)}>
          Restore Defaults
        </button>
        <button type="button" className="button button-secondary" disabled={!dirty || saving}
          onClick={() => updateValues(settings)}>Reset Changes</button>
        <button type="submit" className="button button-primary" disabled={!dirty || saving}>
          <Icon name="check" size={17} /> {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}
