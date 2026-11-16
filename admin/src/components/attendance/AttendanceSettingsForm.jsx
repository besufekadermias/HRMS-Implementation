import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Icon from '../common/Icon.jsx'
import { INITIAL_ATTENDANCE_SETTINGS } from '../../utils/constants/constants.js'
import {
  validateAttendanceSettingsRules,
  normalizeAttendanceSettings,
} from '../../services/operations/attendanceService.js'
import { attendanceSettingsSchema } from '../../utils/validation/operationsSchemas.js'

export default function AttendanceSettingsForm({ settings, onSave, onDirtyChange }) {
  const {
    register, handleSubmit, setError, setFocus, reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    defaultValues: settings,
    resolver: zodResolver(attendanceSettingsSchema, undefined, { raw: true }),
  })

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  async function submit(values) {
    const nextErrors = validateAttendanceSettingsRules(values)
    if (Object.keys(nextErrors).length) {
      for (const [name, message] of Object.entries(nextErrors)) {
        setError(name, { type: 'business', message })
      }
      setFocus(Object.keys(nextErrors)[0])
      return
    }
    const normalized = normalizeAttendanceSettings(values)
    try {
      await onSave(normalized)
      // A successful save becomes the new baseline for dirty/reset checks.
      reset(normalized)
    } catch {
      setError('root', { type: 'server', message: 'Attendance settings could not be saved. Please try again.' })
    }
  }

  return (
    <form id="attendance-settings-form" className="card attendance-settings-form"
      onSubmit={handleSubmit(submit)} aria-busy={isSubmitting} noValidate>
      <div className="section-heading">
        <div>
          <h2><Icon name="clock" size={18} /> Working Hours</h2>
          <p>Set the daily start, end, and grace period in East Africa Time (UTC+3).</p>
        </div>
      </div>
      <div className="employee-fields-grid attendance-settings-fields">
        <label>
          Start time <span>*</span>
          <input {...register('startTime')} type="time" required disabled={isSubmitting}
            aria-invalid={!!errors.startTime} aria-describedby={errors.startTime ? 'attendance-start-error' : undefined} />
          {errors.startTime && <small className="field-error" id="attendance-start-error">{errors.startTime.message}</small>}
        </label>
        <label>
          End time <span>*</span>
          <input {...register('endTime')} type="time" required disabled={isSubmitting}
            aria-invalid={!!errors.endTime} aria-describedby={errors.endTime ? 'attendance-end-error' : undefined} />
          {errors.endTime && <small className="field-error" id="attendance-end-error">{errors.endTime.message}</small>}
        </label>
        <label className="full-width">
          Grace period (minutes) <span>*</span>
          <input {...register('gracePeriod')} type="number" min="0" max="1439" step="1"
            required disabled={isSubmitting}
            aria-invalid={!!errors.gracePeriod}
            aria-describedby={errors.gracePeriod ? 'attendance-grace-error' : 'attendance-grace-hint'} />
          {errors.gracePeriod
            ? <small className="field-error" id="attendance-grace-error">{errors.gracePeriod.message}</small>
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
          <textarea {...register('allowedIps')} rows={5} disabled={isSubmitting}
            placeholder={'192.0.2.10\n2001:db8::10'} spellCheck={false}
            aria-invalid={!!errors.allowedIps}
            aria-describedby={errors.allowedIps ? 'attendance-ips-error' : 'attendance-ips-hint'} />
          {errors.allowedIps
            ? <small className="field-error" id="attendance-ips-error">{errors.allowedIps.message}</small>
            : <small className="field-hint" id="attendance-ips-hint">Enter one IPv4 or IPv6 address per line, or separate them with commas. A blank list means no addresses are configured.</small>}
        </label>
      </div>
      {errors.root && <p className="form-error" role="alert">{errors.root.message}</p>}
      <div className="attendance-settings-actions">
        <span className="muted-note" role="status">{isDirty ? 'Unsaved changes' : 'No unsaved changes'}</span>
        <button type="button" className="text-button" disabled={isSubmitting}
          onClick={() => reset(INITIAL_ATTENDANCE_SETTINGS, { keepDefaultValues: true })}>
          Restore Defaults
        </button>
        <button type="button" className="button button-secondary" disabled={!isDirty || isSubmitting}
          onClick={() => reset(settings)}>Reset Changes</button>
        <button type="submit" className="button button-primary" disabled={!isDirty || isSubmitting}>
          <Icon name="check" size={17} /> {isSubmitting ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}
