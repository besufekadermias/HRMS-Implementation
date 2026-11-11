import StatCard from '../common/StatCard.jsx'

export default function AttendanceStats({ summary }) {
  return (
    <section className="attendance-stats" aria-label="Organization attendance totals for the selected date">
      <StatCard label="Total Staff" value={summary.total} icon="users" detail="One person per day" />
      <StatCard label="Present" value={summary.Present} icon="check-circle" detail="Excludes late arrivals" />
      <StatCard label="Late" value={summary.Late} icon="timer" tone="amber" detail="Supplied daily status" />
      <StatCard label="Absent" value={summary.Absent} icon="user-minus" tone="rose" detail="Explicit absence records" />
      <StatCard label="On Leave" value={summary['On Leave']} icon="calendar" tone="lavender" detail="Supplied leave status" />
      <StatCard label="No Data" value={summary['No data']} icon="info" tone="blue" detail="Status not available" />
    </section>
  )
}
