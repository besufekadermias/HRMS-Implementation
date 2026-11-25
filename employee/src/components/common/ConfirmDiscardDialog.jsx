import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function ConfirmDiscardDialog({
  onCancel,
  onConfirm,
  profile = false,
  leave = false,
  report = false,
  employee = false,
}) {
  const dialogRef = useRef(null)
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
  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="discard-password-title"
      aria-describedby="discard-password-description"
      className="m-auto w-[min(420px,calc(100vw-32px))] rounded-[15px] border border-border bg-white p-6 text-text-primary shadow-[0_20px_90px_#052e2b30] backdrop:bg-[#082d3670] backdrop:backdrop-blur-[3px]"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
    >
      <h2
        id="discard-password-title"
        className="text-[19px]"
      >
        {employee
          ? 'Discard this employee form?'
          : report
          ? 'Discard this report?'
          : leave
            ? 'Discard this leave request?'
            : profile
              ? 'Discard unsaved photo changes?'
              : 'Discard unsaved password changes?'}
      </h2>
      <p
        id="discard-password-description"
        className="mt-3 text-[13px] leading-[1.8] text-text-secondary"
      >
        {employee
          ? 'This employee has not been saved. Keep editing or leave this page.'
          : report
          ? 'Your report has not been submitted. Keep editing or leave this page.'
          : leave
            ? 'Your leave request has not been submitted. Keep editing or leave this page.'
            : profile
              ? 'Your profile photo change has not been saved. Keep editing or leave this page.'
              : 'Your entered password fields have not been saved. Keep editing or leave this page.'}
      </p>
      <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-border pt-5">
        <button
          type="button"
          className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
          onClick={onCancel}
        >
          Keep Editing
        </button>
        <button
          type="button"
          className={String.raw`primary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
          onClick={onConfirm}
        >
          Discard and Continue
        </button>
      </div>
    </dialog>,
    document.body,
  )
}
