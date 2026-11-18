export default function ApplicationStatusBadge({ status }) {
  return <span className={`recruitment-status recruitment-status-${status.toLowerCase()} tw:inline-block tw:rounded-[20px] tw:p-[3px_11px] tw:text-[10px] tw:font-[750] tw:whitespace-nowrap
          tw:[&.recruitment-status-open]:text-[#087348] tw:[&.recruitment-status-open]:bg-[#ddf8e8]
          tw:[&.recruitment-status-hired]:text-[#087348] tw:[&.recruitment-status-hired]:bg-[#ddf8e8]
          tw:[&.recruitment-status-closed]:text-[#556575] tw:[&.recruitment-status-closed]:bg-[#edf1f5]
          tw:[&.recruitment-status-pending]:text-[#935a05] tw:[&.recruitment-status-pending]:bg-[#fff4c2]
          tw:[&.recruitment-status-shortlisted]:text-[#21598c] tw:[&.recruitment-status-shortlisted]:bg-[#e3efff]
          tw:[&.recruitment-status-rejected]:text-[#b52f3f] tw:[&.recruitment-status-rejected]:bg-[#ffeaee] `}>{status}</span>
}
