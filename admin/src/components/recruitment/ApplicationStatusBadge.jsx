export default function ApplicationStatusBadge({ status }) {
  return <span className={`recruitment-status recruitment-status-${status.toLowerCase()}`}>{status}</span>
}
