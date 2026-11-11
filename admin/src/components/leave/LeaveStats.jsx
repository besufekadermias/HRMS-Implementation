import StatCard from '../common/StatCard.jsx'
import formatDate from '../../utils/formatters/formatDate.js'

export default function LeaveStats({ summary, today }) {
  return (
    <section className="leave-stats" aria-label="Leave request totals">
      <StatCard label="Pending HR Action" value={summary.pending} icon="clock" tone="amber"
        detail="Requests awaiting approval" />
      <StatCard label="Staff Currently on Leave" value={summary.onLeave} icon="calendar-check" tone="lavender"
        detail={`Active approved leaves · ${formatDate(today)}`} />
      <StatCard label="Approved Leave Requests" value={summary.approved} icon="check-circle"
        detail="Total approved requests" />
    </section>
  )
}
