import { LEAVE_STATUS_LABELS } from '../../utils/validation/leaveSchemas.js'

export default function LeaveStatusBadge({ status }) {
  return (
    <span
      className={String.raw`employee-page:inline-block employee-page:rounded-[20px] employee-page:p-[4px_10px]
    employee-page:text-[length:10px] employee-page:font-[650]
    employee-page:[&.leave-status-pending]:text-[color:#9c6711]
    employee-page:[&.leave-status-pending]:[background:#fff5d8]
    employee-page:[&.leave-status-approved]:text-[color:#087a58]
    employee-page:[&.leave-status-approved]:[background:#e0f5e9]
    employee-page:[&.leave-status-rejected]:text-[color:#b14c60]
    employee-page:[&.leave-status-rejected]:[background:#fcebef]
    employee-page:screen-max-700:[justify-self:start] leave-status leave-status-${status.toLowerCase()}`}
    >
      {LEAVE_STATUS_LABELS[status]}
    </span>
  )
}
