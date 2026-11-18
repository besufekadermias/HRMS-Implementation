import Card from '../common/Card.jsx'
import Button, { TextButton } from '../common/Button.jsx'
import { FormInput, FormSelect } from '../common/FormFields.jsx'
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
    return errors[name] && <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" id={`leave-${name}-error`}>{errors[name].message}</small>
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
  return <Card as="form" className="leave-settings-form tw:p-[24px] tw:max-[768px]:p-[16px]" onSubmit={(event) => handleSubmit(submit)(event)} noValidate aria-busy={saving}>
    <div className="section-heading tw:shared-base:flex tw:shared-base:justify-between tw:shared-base:items-start
           tw:shared-base:gap-[12px] tw:shared-base:mb-[20px] tw:shared-base:[&_h2]:flex
           tw:shared-base:[&_h2]:items-center tw:shared-base:[&_h2]:gap-[9px]
           tw:shared-base:[&_h2_>_svg]:[color:var(--primary)] tw:shared-base:[&_p]:[color:var(--text-muted)]
           tw:shared-base:[&_p]:text-[12px] tw:shared-base:[&_p]:mt-[6px] tw:shared-base:[&_p]:leading-[1.5]
           tw:max-[768px]:shared-base:[&_h2]:text-[15px]
           tw:max-[768px]:shared-base:gap-[8px]
           tw:max-[768px]:shared-base:[&_p]:text-[11px]"><div><h2><Icon name="shield" size={18} /> Leave Policy</h2><p>Set the annual entitlement and balance limit. Unused days expire at Ethiopian year-end.</p></div></div>
    <fieldset className="leave-form-fieldset tw:[border:0] tw:p-0 tw:m-0 tw:min-w-0" disabled={saving}>
      <div className="employee-fields-grid tw:my-[16px] tw:grid-cols-2 tw:[&_select]:w-full tw:[&_textarea]:w-full tw:[&_textarea]:h-auto
          tw:[&_textarea]:min-h-[95px] tw:[&_textarea]:resize-y tw:max-[768px]:grid-cols-1
          tw:max-[768px]:[&_input]:text-[16px] tw:max-[768px]:[&_select]:text-[16px]
          tw:max-[768px]:[&_textarea]:text-[16px] tw:shared-base:grid
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
        {[
          ['defaultEntitlement', 'Annual entitlement (days)', 1, MAX_LEAVE_BALANCE, 'Default: 90 days. Granted to new employees and on Meskerem 1. Changing this does not adjust existing balances.'],
          ['maxBalance', 'Maximum annual balance (days)', 1, MAX_LEAVE_BALANCE, `Default: 90 days. Choose 1–${MAX_LEAVE_BALANCE} days; the cap cannot be lower than an existing remaining balance. No carryover.`],
          ['noticeDays', 'Minimum notice (calendar days)', 0, 365, 'Applies to new requests and changes to requested dates. Zero allows requests starting today.'],
        ].map(([name, label, min, max, hint]) => <label key={name}>{label} <span>*</span>
          <FormInput variant="employee" {...fieldProps(name)} type="number" min={min} max={max} step="1" required
            aria-invalid={!!errors[name]} aria-describedby={`leave-setting-${name}`} />
          <small id={`leave-setting-${name}`} className={errors[name] ? "field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" : "field-hint tw:shared-base:block tw:shared-base:text-[10px] tw:shared-base:font-normal tw:shared-base:[color:var(--text-muted)] tw:shared-base:mt-[7px]"}>{errors[name]?.message || hint}</small>
        </label>)}
        <label>Count requested days <span>*</span>
          <FormSelect variant="employee" {...fieldProps('dayCounting')}>
            <option value="calendar">Calendar days (include weekends)</option><option value="weekdays">Working days (Monday–Friday)</option>
          </FormSelect>{fieldError('dayCounting')}<small className="field-hint tw:shared-base:block tw:shared-base:text-[10px] tw:shared-base:font-normal
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:mt-[7px]">Used when creating or editing requests. Public holidays are not excluded.</small>
        </label>
      </div>
      <label className="leave-policy-toggle tw:flex tw:items-start tw:gap-[10px] tw:p-[16px_0] tw:text-[12px]"><input className="tw:accent-primary tw:mt-[3px]" type="checkbox" {...fieldProps('requireRejectionReason')} />
        <span><strong>Require a reason when rejecting leave</strong><small className="tw:block tw:mt-[5px] tw:text-[var(--text-muted)] tw:leading-[1.6]">Reopening a decision and adjusting an entitlement always require a reason.</small></span>
      </label>
    </fieldset>
    {saveError && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{saveError}</p>}
    <div className="attendance-settings-actions tw:flex tw:flex-wrap tw:items-center tw:gap-[10px] tw:m-[24px_0_18px]
           tw:[&>.muted-note]:flex-[1_1_100%] tw:[&>.muted-note]:text-[11px] tw:[&>.text-button]:mr-auto
           tw:[&>.text-button]:text-[11px] tw:max-[640px]:[&>.button]:flex-[1_1_auto]"><span className="muted-note tw:shared-base:block tw:shared-base:[color:var(--text-muted)] tw:shared-base:text-[12px]
          tw:shared-base:leading-[1.8] tw:shared-base:mt-[17px]" role="status">{dirty ? 'Unsaved changes' : 'No unsaved changes'}</span>
      <TextButton type="button" disabled={saving} onClick={() => { reset(INITIAL_LEAVE_SETTINGS, { keepDefaultValues: true }); setSaveError('') }}>Restore Defaults</TextButton>
      <Button variant="secondary" type="button" disabled={!dirty || saving} onClick={() => { reset(); setSaveError('') }}>Reset Changes</Button>
      <Button type="submit" disabled={!dirty || saving}><Icon name="check" size={17} />{saving ? 'Saving…' : 'Save Settings'}</Button>
    </div>
  </Card>
}
