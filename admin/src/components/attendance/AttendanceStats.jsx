import StatCard from '../common/StatCard.jsx'

export default function AttendanceStats({ summary }) {
  return (
    <section className="attendance-stats tw:grid tw:grid-cols-3 tw:gap-[13px] tw:mb-[17px] tw:[&_.stat-card]:min-h-[115px]
          tw:[&_.stat-card]:p-[17px] tw:[&_.stat-card]:gap-[13px] tw:[&_.stat-card_.stat-value]:text-[28px]
          tw:[&_.stat-card:last-child_.stat-value]:text-[28px] tw:[&_.icon-circle]:w-[39px]
          tw:[&_.icon-circle]:h-[39px] tw:[&_.tone-rose]:text-[#b7405a] tw:[&_.tone-rose]:bg-[#fdeaf0]
          tw:min-[1600px]:grid-cols-6 tw:min-[1600px]:[&_.stat-card]:p-[16px_12px]
          tw:min-[1600px]:[&_.stat-card]:gap-[9px] tw:min-[1600px]:[&_.stat-detail]:text-[9px]
          tw:max-[768px]:grid-cols-2 tw:max-[768px]:gap-[10px] tw:max-[768px]:[&_.stat-card]:p-[14px_11px]
          tw:max-[768px]:[&_.stat-card]:gap-[9px] tw:max-[768px]:[&_.stat-detail]:text-[9px]
          tw:max-[400px]:[&_.stat-card]:flex-col tw:max-[400px]:[&_.stat-content_h2]:text-[11px]" aria-label="Organization attendance totals for the selected date">
      <StatCard label="Total Staff" value={summary.total} icon="users" detail="One person per day" />
      <StatCard label="Present" value={summary.Present} icon="check-circle" detail="Excludes late arrivals" />
      <StatCard label="Late" value={summary.Late} icon="timer" tone="amber" detail="Supplied daily status" />
      <StatCard label="Absent" value={summary.Absent} icon="user-minus" tone="rose" detail="Explicit absence records" />
      <StatCard label="On Leave" value={summary['On Leave']} icon="calendar" tone="lavender" detail="Supplied leave status" />
      <StatCard label="No Data" value={summary['No data']} icon="info" tone="blue" detail="Status not available" />
    </section>
  )
}
