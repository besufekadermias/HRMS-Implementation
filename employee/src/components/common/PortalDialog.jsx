import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function PortalDialog({ title, titleId, icon, onClose, locked = false, children }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    const focus = document.activeElement
    const wasScrollLocked = document.body.classList.contains('overflow-hidden')
    document.body.classList.add('overflow-hidden')
    dialog.showModal()
    return () => {
      dialog.close()
      if (!wasScrollLocked) document.body.classList.remove('overflow-hidden')
      if (focus instanceof HTMLElement && focus.isConnected) focus.focus()
    }
  }, [])
  return createPortal(
    <dialog
      ref={ref}
      className={String.raw`leave-dialog report-dialog employee-page:m-[auto] employee-page:w-[min(690px,_calc(100vw_-_32px))]
    employee-page:max-h-[calc(100dvh_-_32px)] employee-page:overflow-y-auto employee-page:p-[28px]
    employee-page:[border:1px_solid_var(--border)] employee-page:rounded-[17px]
    employee-page:[background:white] employee-page:text-[color:var(--text-primary)]
    employee-page:[box-shadow:0_25px_90px_#052e2b40] employee-page:[&::backdrop]:[background:#082d3670]
    employee-page:[&::backdrop]:[backdrop-filter:blur(3px)] employee-page:[&_textarea]:w-[100%]
    employee-page:[&_textarea]:p-[12px] employee-page:[&_textarea]:[border:1px_solid_#d6e4e8]
    employee-page:[&_textarea]:rounded-[7px] employee-page:[&_textarea]:text-[length:13px]
    employee-page:[&_textarea]:[resize:vertical] employee-page:[&_textarea]:min-h-[150px]
    employee-page:[&_textarea]:max-h-[220px]
    employee-page:[&_textarea[aria-invalid='true']]:[border-color:#d87589]
    employee-page:screen-max-700:p-[20px] employee-page:[&_h2]:[overflow-wrap:anywhere]`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        if (!locked) onClose()
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || locked) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose()
      }}
    >
      <div
        className={String.raw`leave-dialog-heading employee-page:flex employee-page:items-center employee-page:gap-[12px]
    employee-page:mb-[22px] employee-page:[&_>_div]:[flex:1] employee-page:[&_h2]:text-[length:22px]
    employee-page:[&_p]:mt-[5px] employee-page:[&_p]:text-[length:12px]
    employee-page:[&_p]:text-[color:var(--text-muted)] employee-page:screen-max-700:[&_h2]:text-[length:19px]`}
      >
        <span
          className={String.raw`icon-circle tone-blue employee-base:w-[46px] employee-base:h-[46px] employee-base:inline-flex
    employee-base:items-center employee-base:justify-center employee-base:rounded-[50%]
    employee-base:[flex-shrink:0] employee-base:text-[color:#4b8397] employee-base:[background:#eaf2f7]`}
        >
          {icon}
        </span>
        <div>
          <h2 id={titleId}>{title}</h2>
        </div>
        <button
          className={String.raw`icon-button employee-base:inline-flex employee-base:items-center employee-base:justify-center
    employee-base:w-[40px] employee-base:h-[40px] employee-base:p-[8px] employee-base:rounded-[8px]
    employee-base:text-[color:var(--text-secondary)] employee-base:[&:hover]:[background:#edf6f5]
    employee-base:[&:hover]:text-[color:var(--primary)]`}
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
          disabled={locked}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>,
    document.body,
  )
}
