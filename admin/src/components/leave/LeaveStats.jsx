import StatCard from '../common/StatCard.jsx'
import formatDate from '../../utils/formatters/formatDate.js'

export default function LeaveStats({ summary, today }) {
  return (
    <section className="leave-stats tw:grid tw:grid-cols-3 tw:gap-[18px] tw:mb-[24px] tw:[&_.stat-card]:flex-row-reverse
          tw:[&_.stat-card]:items-center tw:[&_.stat-card]:justify-between tw:[&_.stat-card]:min-h-[145px]
          tw:[&_.stat-card]:p-[24px] tw:[&_.stat-content_h2]:text-[11px] tw:[&_.stat-content_h2]:font-bold
          tw:[&_.stat-content_h2]:tracking-[0.65px] tw:[&_.stat-content_h2]:uppercase
          tw:[&_.stat-card_.stat-value]:text-[36px] tw:[&_.stat-card:last-child_.stat-value]:text-[36px]
          tw:[&_.stat-card:first-child_.stat-value]:text-[#bd6b08]
          tw:[&_.stat-card:nth-child(2)_.stat-value]:text-[#7351bd]
          tw:[&_.stat-card:last-child_.stat-value]:text-[#087b59] tw:[&_.stat-detail]:text-[11px]
          tw:[&_.stat-detail]:leading-[1.6] tw:[&_.stat-detail]:mt-[9px] tw:[&_.stat-detail_.status-dot]:hidden
          tw:[&_.icon-circle]:w-[52px] tw:[&_.icon-circle]:h-[52px] tw:[&_.icon-circle]:rounded-[16px]
          tw:max-[1200px]:gap-[12px] tw:max-[1200px]:[&_.stat-card]:p-[18px_15px]
          tw:max-[1200px]:[&_.stat-card]:gap-[9px] tw:max-[1200px]:[&_.icon-circle]:w-[40px]
          tw:max-[1200px]:[&_.icon-circle]:h-[40px] tw:max-[1200px]:[&_.icon-circle]:rounded-[12px]
          tw:max-[768px]:grid-cols-1 tw:max-[768px]:gap-[10px] tw:max-[768px]:[&_.stat-card]:min-h-[110px]
          tw:max-[768px]:[&_.stat-card]:p-[18px] tw:max-[768px]:[&_.stat-card_.stat-value]:text-[30px]
          tw:max-[768px]:[&_.stat-card:last-child_.stat-value]:text-[30px]" aria-label="Leave request totals">
      <StatCard label="Pending HR Action" value={summary.pending} icon="clock" tone="amber"
        detail="Requests awaiting approval" />
      <StatCard label="Staff Currently on Leave" value={summary.onLeave} icon="calendar-check" tone="lavender"
        detail={`Active approved leaves · ${formatDate(today)}`} />
      <StatCard label="Approved Leave Requests" value={summary.approved} icon="check-circle"
        detail="Total approved requests" />
    </section>
  )
}
