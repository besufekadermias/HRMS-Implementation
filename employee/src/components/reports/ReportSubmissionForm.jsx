import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Send } from 'lucide-react'
import PortalDialog from '../common/PortalDialog.jsx'
import { reportInputSchema } from '../../utils/validation/reportSchemas.js'
import { useEmployeeStore } from '../../store/index.js'

const empty = { title: '', content: '', attachmentUrl: '' }
export default function ReportSubmissionForm({ data, onSave, onClose }) {
  const receipt = useRef(null)
  const saving = useRef(false)
  const [discard, setDiscard] = useState(false)
  const [error, setError] = useState('')
  const busy = useEmployeeStore(
    (state) =>
      state.reportBusy ||
      state.securityBusy ||
      state.profileBusy ||
      state.attendanceBusy ||
      state.leaveBusy,
  )
  const setDirty = useEmployeeStore((state) => state.setReportDirty)
  const {
    register,
    control,
    reset,
    handleSubmit,
    setError: fieldError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({ defaultValues: empty, resolver: zodResolver(reportInputSchema), mode: 'onTouched' })
  const values = useWatch({ control })
  const locked = busy || isSubmitting
  useEffect(() => {
    setDirty(isDirty)
    return () => setDirty(false)
  }, [isDirty, setDirty])
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
    if (locked || saving.current) return
    if (discard) setDiscard(false)
    else if (isDirty) setDiscard(true)
    else onClose()
  }
  async function submit(input) {
    if (busy || saving.current || !data.canSubmit) return
    saving.current = true
    setError('')
    const payload = JSON.stringify(input)
    if (receipt.current?.payload !== payload)
      receipt.current = { payload, key: crypto.randomUUID() }
    try {
      await onSave(input, receipt.current.key)
      reset(empty)
      setDirty(false)
      onClose()
    } catch (failure) {
      setError(failure.message || 'Your report could not be submitted. Please retry.')
      for (const [name, message] of Object.entries(failure.fields || {}))
        if (name in empty) fieldError(name, { type: 'server', message })
    } finally {
      saving.current = false
    }
  }
  function props(name) {
    return {
      ...register(name),
      'aria-invalid': Boolean(errors[name]),
      'aria-describedby': `report-${name}-hint${errors[name] ? ` report-${name}-error` : ''}`,
    }
  }
  return (
    <PortalDialog
      title="Submit Report to HR Manager"
      titleId="report-form-title"
      icon={<FileText size={24} />}
      locked={locked}
      onClose={close}
    >
      {discard ? (
        <div role="alert">
          <h3>Discard this report?</h3>
          <p
            className={String.raw`report-hint mt-3 employee-page:text-[color:var(--text-muted)] employee-page:text-[length:11px]
    employee-page:leading-[1.8]`}
          >
            Your report has not been submitted.
          </p>
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
              Discard Report
            </button>
          </div>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={(event) => {
            void handleSubmit(submit)(event)
          }}
          aria-busy={locked}
        >
          <p
            className={String.raw`report-hint mb-5 employee-page:text-[color:var(--text-muted)] employee-page:text-[length:11px]
    employee-page:leading-[1.8]`}
          >
            Send your findings and recommendations to HR. Fields marked * are required.
          </p>
          {!data.canSubmit && (
            <p
              role="alert"
              className={String.raw`error-notice mb-4 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#b42344] employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
            >
              {data.message || 'Report submission is unavailable. Contact HR.'}
            </p>
          )}
          <fieldset
            disabled={locked}
            className={String.raw`leave-fieldset employee-page:[border:0] employee-page:p-[0] employee-page:m-[0] employee-page:min-w-[0]`}
          >
            <label htmlFor="report-title">Report subject / title *</label>
            <input
              id="report-title"
              {...props('title')}
              maxLength={150}
              required
              placeholder="e.g. Monthly Network Infrastructure Status Report"
            />
            <p
              className={String.raw`report-hint employee-page:text-[color:var(--text-muted)] employee-page:text-[length:11px]
    employee-page:leading-[1.8]`}
              id="report-title-hint"
            >
              {values.title?.length || 0}/150 characters
            </p>
            {errors.title && (
              <p
                className={String.raw`leave-field-error employee-page:mt-[6px] employee-page:text-[color:#b04b5d] employee-page:text-[length:11px]
    employee-page:leading-[1.7]`}
                id="report-title-error"
                role="alert"
              >
                {errors.title.message}
              </p>
            )}
            <label
              className="mt-5"
              htmlFor="report-content"
            >
              Detailed findings &amp; recommendations *
            </label>
            <textarea
              id="report-content"
              {...props('content')}
              required
              rows={6}
              maxLength={5000}
              placeholder="Provide a breakdown, dates, metrics, actions taken, and recommendations…"
            />
            <p
              className={String.raw`report-hint employee-page:text-[color:var(--text-muted)] employee-page:text-[length:11px]
    employee-page:leading-[1.8]`}
              id="report-content-hint"
            >
              {values.content?.length || 0}/5,000 characters
            </p>
            {errors.content && (
              <p
                className={String.raw`leave-field-error employee-page:mt-[6px] employee-page:text-[color:#b04b5d] employee-page:text-[length:11px]
    employee-page:leading-[1.7]`}
                id="report-content-error"
                role="alert"
              >
                {errors.content.message}
              </p>
            )}
            <label
              className="mt-5"
              htmlFor="report-attachmentUrl"
            >
              Optional file link / attachment URL
            </label>
            <input
              id="report-attachmentUrl"
              {...props('attachmentUrl')}
              type="url"
              maxLength={255}
              placeholder="https://drive.google.com/… or a document link"
            />
            <p
              className={String.raw`report-hint employee-page:text-[color:var(--text-muted)] employee-page:text-[length:11px]
    employee-page:leading-[1.8]`}
              id="report-attachmentUrl-hint"
            >
              Link only, up to 255 characters. Ensure HR can access the document.
            </p>
            {errors.attachmentUrl && (
              <p
                className={String.raw`leave-field-error employee-page:mt-[6px] employee-page:text-[color:#b04b5d] employee-page:text-[length:11px]
    employee-page:leading-[1.7]`}
                id="report-attachmentUrl-error"
                role="alert"
              >
                {errors.attachmentUrl.message}
              </p>
            )}
          </fieldset>
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
              className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
              type="button"
              disabled={locked}
              onClick={() => {
                reset(empty)
                receipt.current = null
                setError('')
              }}
            >
              Reset
            </button>
            <button
              className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
              type="button"
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
              disabled={locked || !data.canSubmit}
            >
              <Send size={16} />
              {locked ? 'Submitting…' : 'Transmit Report'}
            </button>
          </div>
        </form>
      )}
    </PortalDialog>
  )
}
