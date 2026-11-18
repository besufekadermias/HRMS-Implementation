import Card from '../common/Card.jsx'
import Button, { TextButton } from '../common/Button.jsx'
import { FormInput, FormTextarea } from '../common/FormFields.jsx'
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
    <Card as="form" id="attendance-settings-form" className="attendance-settings-form tw:p-[22px] tw:max-[640px]:p-[17px]"
      onSubmit={handleSubmit(submit)} aria-busy={isSubmitting} noValidate>
      <div className="section-heading tw:shared-base:flex tw:shared-base:justify-between tw:shared-base:items-start
          tw:shared-base:gap-[12px] tw:shared-base:mb-[20px] tw:shared-base:[&_h2]:flex
          tw:shared-base:[&_h2]:items-center tw:shared-base:[&_h2]:gap-[9px]
          tw:shared-base:[&_h2_>_svg]:[color:var(--primary)] tw:shared-base:[&_p]:[color:var(--text-muted)]
          tw:shared-base:[&_p]:text-[12px] tw:shared-base:[&_p]:mt-[6px] tw:shared-base:[&_p]:leading-[1.5]
          tw:max-[768px]:shared-base:[&_h2]:text-[15px]
          tw:max-[768px]:shared-base:gap-[8px] tw:max-[768px]:shared-base:[&_p]:text-[11px]">
        <div>
          <h2><Icon name="clock" size={18} /> Working Hours</h2>
          <p>Set the daily start, end, and grace period in East Africa Time (UTC+3).</p>
        </div>
      </div>
      <div className="employee-fields-grid attendance-settings-fields tw:grid-cols-2 tw:[&_textarea]:h-auto tw:[&_textarea]:min-h-[140px]
          tw:[&_textarea]:resize-y tw:[&_textarea]:[font-family:Consolas,monospace] tw:[&_textarea]:leading-[1.7]
          tw:[&_textarea[aria-invalid=true]]:border-[#d87589] tw:[&_textarea[aria-invalid=true]]:bg-[#fffafb]
          tw:max-[640px]:grid-cols-1 tw:max-[640px]:gap-[18px] tw:max-[640px]:[&_input]:text-[16px]
          tw:max-[640px]:[&_textarea]:text-[16px] tw:shared-base:grid
          tw:shared-base:grid-cols-[repeat(3,_minmax(0,_1fr))] tw:shared-base:gap-[23px_22px]
          tw:shared-base:[&_>_label]:block tw:shared-base:[&_>_label]:[color:#48655f]
          tw:shared-base:[&_>_label]:text-[11px] tw:shared-base:[&_>_label]:font-[650]
          tw:shared-base:[&_>_label]:leading-[1.5]
          tw:shared-base:[&_>_label_>_span:not(.password-field)]:[color:#b65265]
          tw:shared-base:[&_.span-two]:col-[span_2] tw:max-[1100px]:shared-base:gap-[20px_17px]
          tw:max-[768px]:shared-base:grid-cols-[repeat(2,_minmax(0,_1fr))]
          tw:max-[768px]:shared-base:[&_.span-two]:col-[1_/_-1]
          tw:max-[560px]:shared-base:grid-cols-[minmax(0,_1fr)]
          tw:max-[560px]:shared-base:[&_.span-two]:col-[auto]
          tw:max-[560px]:shared-base:[&_>_label]:text-[11px]">
        <label>
          Start time <span>*</span>
          <FormInput variant="employee" {...register('startTime')} type="time" required disabled={isSubmitting}
            aria-invalid={!!errors.startTime} aria-describedby={errors.startTime ? 'attendance-start-error' : undefined} />
          {errors.startTime && <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id="attendance-start-error">{errors.startTime.message}</small>}
        </label>
        <label>
          End time <span>*</span>
          <FormInput variant="employee" {...register('endTime')} type="time" required disabled={isSubmitting}
            aria-invalid={!!errors.endTime} aria-describedby={errors.endTime ? 'attendance-end-error' : undefined} />
          {errors.endTime && <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id="attendance-end-error">{errors.endTime.message}</small>}
        </label>
        <label className="full-width tw:shared-base:col-[1_/_-1]">
          Grace period (minutes) <span>*</span>
          <FormInput variant="employee" {...register('gracePeriod')} type="number" min="0" max="1439" step="1"
            required disabled={isSubmitting}
            aria-invalid={!!errors.gracePeriod}
            aria-describedby={errors.gracePeriod ? 'attendance-grace-error' : 'attendance-grace-hint'} />
          {errors.gracePeriod
            ? <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id="attendance-grace-error">{errors.gracePeriod.message}</small>
            : <small className="field-hint tw:shared-base:block tw:shared-base:text-[10px] tw:shared-base:font-normal
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:mt-[7px]" id="attendance-grace-hint">Extra minutes allowed after the scheduled start before an arrival is considered late.</small>}
        </label>
      </div>

      <div className="section-heading attendance-settings-network-heading tw:mt-[26px] tw:pt-[24px]
          tw:[border-top:1px_solid_var(--border)] tw:shared-base:flex tw:shared-base:justify-between
          tw:shared-base:items-start tw:shared-base:gap-[12px] tw:shared-base:mb-[20px] tw:shared-base:[&_h2]:flex
          tw:shared-base:[&_h2]:items-center tw:shared-base:[&_h2]:gap-[9px]
          tw:shared-base:[&_h2_>_svg]:[color:var(--primary)] tw:shared-base:[&_p]:[color:var(--text-muted)]
          tw:shared-base:[&_p]:text-[12px] tw:shared-base:[&_p]:mt-[6px] tw:shared-base:[&_p]:leading-[1.5]
          tw:max-[768px]:shared-base:[&_h2]:text-[15px]
          tw:max-[768px]:shared-base:gap-[8px] tw:max-[768px]:shared-base:[&_p]:text-[11px]">
        <div>
          <h2><Icon name="shield" size={18} /> Approved Attendance IPs</h2>
          <p>List the office network addresses intended for employee check-in and checkout.</p>
        </div>
      </div>
      <div className="employee-fields-grid attendance-settings-fields tw:grid-cols-2 tw:[&_textarea]:h-auto tw:[&_textarea]:min-h-[140px]
          tw:[&_textarea]:resize-y tw:[&_textarea]:[font-family:Consolas,monospace] tw:[&_textarea]:leading-[1.7]
          tw:[&_textarea[aria-invalid=true]]:border-[#d87589] tw:[&_textarea[aria-invalid=true]]:bg-[#fffafb]
          tw:max-[640px]:grid-cols-1 tw:max-[640px]:gap-[18px] tw:max-[640px]:[&_input]:text-[16px]
          tw:max-[640px]:[&_textarea]:text-[16px] tw:shared-base:grid
          tw:shared-base:grid-cols-[repeat(3,_minmax(0,_1fr))] tw:shared-base:gap-[23px_22px]
          tw:shared-base:[&_>_label]:block tw:shared-base:[&_>_label]:[color:#48655f]
          tw:shared-base:[&_>_label]:text-[11px] tw:shared-base:[&_>_label]:font-[650]
          tw:shared-base:[&_>_label]:leading-[1.5]
          tw:shared-base:[&_>_label_>_span:not(.password-field)]:[color:#b65265]
          tw:shared-base:[&_.span-two]:col-[span_2] tw:max-[1100px]:shared-base:gap-[20px_17px]
          tw:max-[768px]:shared-base:grid-cols-[repeat(2,_minmax(0,_1fr))]
          tw:max-[768px]:shared-base:[&_.span-two]:col-[1_/_-1]
          tw:max-[560px]:shared-base:grid-cols-[minmax(0,_1fr)]
          tw:max-[560px]:shared-base:[&_.span-two]:col-[auto]
          tw:max-[560px]:shared-base:[&_>_label]:text-[11px]">
        <label className="full-width tw:shared-base:col-[1_/_-1]">
          IP addresses (optional)
          <FormTextarea variant="employee" {...register('allowedIps')} rows={5} disabled={isSubmitting}
            placeholder={'192.0.2.10\n2001:db8::10'} spellCheck={false}
            aria-invalid={!!errors.allowedIps}
            aria-describedby={errors.allowedIps ? 'attendance-ips-error' : 'attendance-ips-hint'} />
          {errors.allowedIps
            ? <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id="attendance-ips-error">{errors.allowedIps.message}</small>
            : <small className="field-hint tw:shared-base:block tw:shared-base:text-[10px] tw:shared-base:font-normal
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:mt-[7px]" id="attendance-ips-hint">Enter one IPv4 or IPv6 address per line, or separate them with commas. A blank list means no addresses are configured.</small>}
        </label>
      </div>
      {errors.root && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{errors.root.message}</p>}
      <div className="attendance-settings-actions tw:flex tw:flex-wrap tw:items-center tw:gap-[10px] tw:m-[24px_0_18px]
          tw:[&>.muted-note]:flex-[1_1_100%] tw:[&>.muted-note]:text-[11px] tw:[&>.text-button]:mr-auto
          tw:[&>.text-button]:text-[11px] tw:max-[640px]:[&>.button]:flex-[1_1_auto]">
        <span className="muted-note tw:shared-base:block tw:shared-base:[color:var(--text-muted)] tw:shared-base:text-[12px]
          tw:shared-base:leading-[1.8] tw:shared-base:mt-[17px]" role="status">{isDirty ? 'Unsaved changes' : 'No unsaved changes'}</span>
        <TextButton type="button" disabled={isSubmitting}
          onClick={() => reset(INITIAL_ATTENDANCE_SETTINGS, { keepDefaultValues: true })}>
          Restore Defaults
        </TextButton>
        <Button variant="secondary" type="button" disabled={!isDirty || isSubmitting}
          onClick={() => reset(settings)}>Reset Changes</Button>
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          <Icon name="check" size={17} /> {isSubmitting ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>
    </Card>
  )
}
