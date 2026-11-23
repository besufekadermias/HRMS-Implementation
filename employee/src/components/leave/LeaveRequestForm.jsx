import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, Clock3, X } from 'lucide-react'
import { createLeaveRequestSchema } from '../../utils/validation/leaveSchemas.js'
import {
  countLeaveDays,
  earliestLeaveDate,
  getLeaveYear,
  isValidLeaveDate,
  leaveDateLabel,
} from '../../utils/helpers/leaveRules.js'
import { useEmployeeStore } from '../../store/index.js'

const empty = { startDate: '', endDate: '', reason: '' }
export default function LeaveRequestForm({ data, onClose, onSave }) {
  const dialogRef = useRef(null)
  const receiptRef = useRef(null)
  const savingRef = useRef(false)
  const [discard, setDiscard] = useState(false)
  const [error, setError] = useState('')
  const busy = useEmployeeStore(
    (state) => state.leaveBusy || state.securityBusy || state.profileBusy || state.attendanceBusy,
  )
  const setLeaveDirty = useEmployeeStore((state) => state.setLeaveDirty)
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError: fieldError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    defaultValues: empty,
    resolver: zodResolver(createLeaveRequestSchema(data)),
    mode: 'onTouched',
  })
  const values = useWatch({ control })
  const days = countLeaveDays(values.startDate, values.endDate, data.settings.dayCounting)
  const locked = busy || isSubmitting
  const futureYear =
    isValidLeaveDate(values.startDate) && getLeaveYear(values.startDate).start > data.period.start
  const insufficient =
    data.balance == null || days > data.balance.remaining || data.balance.remaining === 0
  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const wasScrollLocked = document.body.classList.contains('overflow-hidden')
    document.body.classList.add('overflow-hidden')
    dialog.showModal()
    return () => {
      dialog.close()
      if (!wasScrollLocked) document.body.classList.remove('overflow-hidden')
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])
  useEffect(() => {
    setLeaveDirty(isDirty)
    return () => setLeaveDirty(false)
  }, [isDirty, setLeaveDirty])
  useEffect(() => {
    if (!isDirty && !locked) return
    const warn = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty, locked])
  function close() {
    if (locked || savingRef.current) return
    if (isDirty) setDiscard(true)
    else onClose()
  }
  function clear() {
    reset(empty)
    receiptRef.current = null
    setError('')
    setDiscard(false)
  }
  async function submit(input) {
    if (busy || savingRef.current) return
    savingRef.current = true
    setError('')
    const payload = JSON.stringify(input)
    if (receiptRef.current?.payload !== payload)
      receiptRef.current = { payload, key: crypto.randomUUID() }
    try {
      await onSave(input, receiptRef.current.key)
      reset(empty)
      setLeaveDirty(false)
      onClose()
    } catch (failure) {
      setError(failure.message || 'Your request could not be submitted. Try again.')
      for (const [field, message] of Object.entries(failure.fields || {}))
        if (field in empty) fieldError(field, { type: 'server', message })
    } finally {
      savingRef.current = false
    }
  }
  return createPortal(
    <dialog
      ref={dialogRef}
      className={String.raw`leave-dialog employee-page:m-[auto] employee-page:w-[min(620px,_calc(100vw_-_32px))]
    employee-page:max-h-[calc(100dvh_-_32px)] employee-page:overflow-y-auto employee-page:p-[28px]
    employee-page:[border:1px_solid_var(--border)] employee-page:rounded-[17px]
    employee-page:[background:white] employee-page:text-[color:var(--text-primary)]
    employee-page:[box-shadow:0_25px_90px_#052e2b40] employee-page:[&::backdrop]:[background:#082d3670]
    employee-page:[&::backdrop]:[backdrop-filter:blur(3px)] employee-page:[&_textarea]:w-[100%]
    employee-page:[&_textarea]:p-[12px] employee-page:[&_textarea]:[border:1px_solid_#d6e4e8]
    employee-page:[&_textarea]:rounded-[7px] employee-page:[&_textarea]:text-[length:13px]
    employee-page:[&_textarea]:[resize:vertical] employee-page:[&_textarea]:min-h-[90px]
    employee-page:[&_textarea]:max-h-[220px]
    employee-page:[&_textarea[aria-invalid='true']]:[border-color:#d87589]
    employee-page:screen-max-700:p-[20px]`}
      aria-labelledby="leave-request-title"
      onCancel={(event) => {
        event.preventDefault()
        if (discard && !locked) setDiscard(false)
        else close()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            close()
        }
      }}
    >
      <div
        className={String.raw`leave-dialog-heading employee-page:flex employee-page:items-center employee-page:gap-[12px]
    employee-page:mb-[22px] employee-page:[&_>_div]:[flex:1] employee-page:[&_h2]:text-[length:22px]
    employee-page:[&_p]:mt-[5px] employee-page:[&_p]:text-[length:12px]
    employee-page:[&_p]:text-[color:var(--text-muted)] employee-page:screen-max-700:[&_h2]:text-[length:19px]`}
      >
        <span
          className={String.raw`icon-circle tone-green employee-base:w-[46px] employee-base:h-[46px] employee-base:inline-flex
    employee-base:items-center employee-base:justify-center employee-base:rounded-[50%]
    employee-base:[flex-shrink:0] employee-base:text-[color:#0b8972] employee-base:[background:#e3f5f0]`}
        >
          <CalendarDays size={23} />
        </span>
        <div>
          <h2 id="leave-request-title">Apply for leave</h2>
          <p>Submit your dates and reason for HR review.</p>
        </div>
        <button
          type="button"
          className={String.raw`icon-button employee-base:inline-flex employee-base:items-center employee-base:justify-center
    employee-base:w-[40px] employee-base:h-[40px] employee-base:p-[8px] employee-base:rounded-[8px]
    employee-base:text-[color:var(--text-secondary)] employee-base:[&:hover]:[background:#edf6f5]
    employee-base:[&:hover]:text-[color:var(--primary)]`}
          aria-label="Close leave request"
          onClick={close}
          disabled={locked}
        >
          <X size={20} />
        </button>
      </div>
      {discard ? (
        <div
          className={String.raw`leave-discard employee-page:pt-[4px] employee-page:[&_p]:mt-[10px]
    employee-page:[&_p]:text-[color:var(--text-muted)] employee-page:[&_p]:text-[length:13px]`}
          role="alert"
        >
          <h3>Discard this leave request?</h3>
          <p>Your dates and reason have not been submitted.</p>
          <div
            className={String.raw`leave-form-actions employee-page:flex employee-page:justify-end employee-page:gap-[10px]
    employee-page:flex-wrap employee-page:mt-[22px] employee-page:pt-[20px]
    employee-page:[border-top:1px_solid_var(--border)] employee-page:screen-max-700:[&_button]:[flex:1]
    employee-page:screen-max-700:[&_button]:whitespace-nowrap`}
          >
            <button
              className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
              onClick={() => setDiscard(false)}
              autoFocus
            >
              Keep Editing
            </button>
            <button
              className={String.raw`primary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
              onClick={onClose}
            >
              Discard Request
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            void handleSubmit(submit)(event)
          }}
          noValidate
          aria-busy={locked}
        >
          {!data.canRequest && (
            <p
              role="alert"
              className={String.raw`error-notice mb-4 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#b42344] employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
            >
              {data.message || 'Leave requests are unavailable. Contact HR.'}
            </p>
          )}
          <div
            className={String.raw`leave-form-balance employee-page:flex employee-page:flex-wrap employee-page:items-center
    employee-page:justify-between employee-page:gap-[10px] employee-page:p-[16px] employee-page:mb-[22px]
    employee-page:[background:#eff8f5] employee-page:[border:1px_solid_#cce8df] employee-page:rounded-[9px]
    employee-page:text-[color:#36675d] employee-page:text-[length:12px] employee-page:[&_strong]:p-[3px_7px]
    employee-page:[&_strong]:rounded-[4px] employee-page:[&_strong]:[border:1px_solid_#cce8df]
    employee-page:[&_strong]:[background:white]`}
          >
            <span>Your remaining leave balance</span>
            <strong>
              {data.balance ? `${data.balance.remaining} days available` : 'Not assigned'}
            </strong>
          </div>
          <fieldset
            disabled={locked}
            className={String.raw`leave-fieldset employee-page:[border:0] employee-page:p-[0] employee-page:m-[0] employee-page:min-w-[0]`}
          >
            <div
              className={String.raw`leave-date-fields employee-page:grid employee-page:grid-cols-[repeat(2,_minmax(0,_1fr))]
    employee-page:gap-[18px] employee-page:mb-[8px] employee-page:[&_input]:min-h-[43px]
    employee-page:screen-max-700:grid-cols-[1fr] employee-page:screen-max-700:gap-[14px]`}
            >
              {[
                ['startDate', 'Start date'],
                ['endDate', 'End date'],
              ].map(([name, label]) => (
                <div key={name}>
                  <label htmlFor={`leave-${name}`}>
                    {label} <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={`leave-${name}`}
                    type="date"
                    {...register(name)}
                    min={
                      name === 'startDate'
                        ? earliestLeaveDate(data.today, data.settings.noticeDays)
                        : values.startDate ||
                          earliestLeaveDate(data.today, data.settings.noticeDays)
                    }
                    required
                    aria-invalid={Boolean(errors[name])}
                    aria-describedby={errors[name] ? `leave-${name}-error` : 'leave-date-guidance'}
                  />
                  {errors[name] && (
                    <p
                      id={`leave-${name}-error`}
                      className={String.raw`leave-field-error employee-page:mt-[6px] employee-page:text-[color:#b04b5d] employee-page:text-[length:11px]
    employee-page:leading-[1.7]`}
                      role="alert"
                    >
                      {errors[name].message}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p
              className={String.raw`leave-caption employee-page:text-[color:var(--text-muted)] employee-page:text-[length:11px]
    employee-page:leading-[1.8]`}
              id="leave-date-guidance"
            >
              Gregorian dates · Earliest start:{' '}
              {leaveDateLabel(earliestLeaveDate(data.today, data.settings.noticeDays))} (
              {data.settings.noticeDays}-day notice).
            </p>
            <div
              className={String.raw`leave-duration employee-page:[background:#f6f9fa] employee-page:[border:1px_solid_var(--border)]
    employee-page:rounded-[9px] employee-page:p-[16px] employee-page:m-[16px_0_6px]
    employee-page:[&_span]:inline-flex employee-page:[&_span]:items-center employee-page:[&_span]:gap-[7px]
    employee-page:[&_span]:text-[length:11px] employee-page:[&_span]:font-[600]
    employee-page:[&_small]:text-[length:10px] employee-page:[&_small]:text-[color:var(--text-muted)]
    employee-page:[&_p]:mt-[12px] employee-page:[&_p]:text-[length:12px]
    employee-page:[&_p]:text-[color:var(--text-secondary)] employee-page:[&_strong]:text-[length:27px]
    employee-page:[&_strong]:mr-[5px] employee-page:[&_strong]:text-[color:var(--text-primary)]
    employee-page:screen-max-700:[&_>_div]:flex-wrap`}
              aria-live="polite"
            >
              <div className="flex items-center justify-between gap-3">
                <span>
                  <Clock3 size={17} /> Duration, calculated automatically
                </span>
                <small>Max: {data.settings.maxBalance} days</small>
              </div>
              <p>
                <strong>{days}</strong>{' '}
                {data.settings.dayCounting === 'weekdays'
                  ? 'Monday–Friday days'
                  : 'calendar days (inclusive)'}
              </p>
            </div>
            <p
              className={String.raw`leave-caption mb-4 employee-page:text-[color:var(--text-muted)] employee-page:text-[length:11px]
    employee-page:leading-[1.8]`}
            >
              {data.settings.dayCounting === 'weekdays'
                ? 'Weekends are excluded; public holidays are counted.'
                : 'Weekends and public holidays are counted.'}{' '}
              Split requests at Ethiopian New Year.
            </p>
            <label htmlFor="leave-reason">
              Reason for absence <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="leave-reason"
              {...register('reason')}
              rows={3}
              maxLength={1000}
              required
              placeholder="e.g. Annual vacation, personal or family matters, medical…"
              aria-invalid={Boolean(errors.reason)}
              aria-describedby="leave-reason-guidance"
            />
            <p
              id="leave-reason-guidance"
              className={String.raw`leave-caption employee-page:text-[color:var(--text-muted)] employee-page:text-[length:11px]
    employee-page:leading-[1.8]`}
            >
              Required · {(values.reason || '').length}/1,000 characters
            </p>
            {errors.reason && (
              <p
                role="alert"
                className={String.raw`leave-field-error employee-page:mt-[6px] employee-page:text-[color:#b04b5d] employee-page:text-[length:11px]
    employee-page:leading-[1.7]`}
              >
                {errors.reason.message}
              </p>
            )}
          </fieldset>
          {insufficient && (
            <p
              className={String.raw`leave-warning employee-page:[background:#fff8e8] employee-page:[border:1px_solid_#f2dfad]
    employee-page:p-[12px_14px] employee-page:rounded-[7px] employee-page:mt-[16px]
    employee-page:text-[color:#88651e] employee-page:text-[length:11px] employee-page:leading-[1.8]`}
            >
              {data.balance == null
                ? 'HR has not assigned your balance.'
                : 'Your current balance is insufficient.'}{' '}
              You can submit a valid request; HR must review entitlement before approval.
            </p>
          )}
          {futureYear && (
            <p
              className={String.raw`info-notice mt-3 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#d7ece4]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#166c5b] employee-base:[border-color:#d7ece4] employee-base:[background:#f0faf5]`}
            >
              This request is for a future Ethiopian leave year. HR can approve it after that year
              begins on Meskerem 1.
            </p>
          )}
          <p
            className={String.raw`leave-caption mt-4 employee-page:text-[color:var(--text-muted)] employee-page:text-[length:11px]
    employee-page:leading-[1.8]`}
          >
            Submission creates a pending request. Your balance changes only after HR approval.
          </p>
          {error && (
            <p
              role="alert"
              className={String.raw`error-notice mt-4 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#b42344] employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
            >
              {error}
            </p>
          )}
          <div
            className={String.raw`leave-form-actions employee-page:flex employee-page:justify-end employee-page:gap-[10px]
    employee-page:flex-wrap employee-page:mt-[22px] employee-page:pt-[20px]
    employee-page:[border-top:1px_solid_var(--border)] employee-page:screen-max-700:[&_button]:[flex:1]
    employee-page:screen-max-700:[&_button]:whitespace-nowrap`}
          >
            <button
              type="button"
              className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
              disabled={locked}
              onClick={clear}
            >
              Reset
            </button>
            <button
              type="button"
              className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
              disabled={locked}
              onClick={close}
            >
              Cancel
            </button>
            <button
              className={String.raw`primary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
              disabled={locked || !days || !data.canRequest}
            >
              {locked ? 'Submitting…' : `Submit Request (${days} ${days === 1 ? 'day' : 'days'})`}
            </button>
          </div>
        </form>
      )}
    </dialog>,
    document.body,
  )
}
