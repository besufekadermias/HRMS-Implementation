import StatCard from '../common/StatCard.jsx'
import formatCurrency from '../../utils/formatters/formatCurrency.js'

export default function WorkforceStats({ summary }) {
  return (
    <section className={`workforce-stats tw:grid tw:grid-cols-[repeat(4,_minmax(0,_1fr))] tw:gap-[15px] tw:mb-[20px]
          tw:min-[1024px]:max-[1280px]:grid-cols-[repeat(2,_minmax(0,_1fr))]
          tw:max-[1024px]:grid-cols-[repeat(2,_minmax(0,_1fr))] tw:max-[768px]:gap-[12px] tw:max-[768px]:mb-[16px]
          tw:max-[480px]:grid-cols-[minmax(0,_1fr)] tw:max-[480px]:gap-[10px] `} aria-label="Workforce statistics">
      <StatCard
        label="Total Employees"
        value={summary.employeeCount}
        icon="users"
        detail="Across all departments"
      />
      <StatCard
        label="Pending Leave Approvals"
        value={summary.pendingLeaves ?? '—'}
        icon="calendar"
        tone="amber"
        detail={summary.pendingLeaves === null ? 'Leave requests unavailable' : summary.pendingLeaves === 0 ? 'All requests reviewed' : 'Requests awaiting review'}
      />
      <StatCard
        label="Active Job Postings"
        value={summary.openVacancies}
        icon="briefcase"
        tone="blue"
        detail="Open opportunities"
      />
      <StatCard
        label="Processed Net Payroll"
        value={summary.netPayroll === null ? '—' : formatCurrency(summary.netPayroll)}
        icon="wallet"
        detail="Payroll summary"
      />
    </section>
  )
}
