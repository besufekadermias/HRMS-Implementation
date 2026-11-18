import StatCard from '../common/StatCard.jsx'
import { SNAPSHOT } from '../../utils/constants/constants.js'
import formatCurrency from '../../utils/formatters/formatCurrency.js'

export default function WorkforceStats({ employeeCount }) {
  return (
    <section className={`workforce-stats tw:grid tw:grid-cols-[repeat(4,_minmax(0,_1fr))] tw:gap-[15px] tw:mb-[20px]
          tw:min-[1024px]:max-[1280px]:grid-cols-[repeat(2,_minmax(0,_1fr))]
          tw:max-[1024px]:grid-cols-[repeat(2,_minmax(0,_1fr))] tw:max-[768px]:gap-[12px] tw:max-[768px]:mb-[16px]
          tw:max-[480px]:grid-cols-[minmax(0,_1fr)] tw:max-[480px]:gap-[10px] `} aria-label="Workforce statistics">
      <StatCard
        label="Total Employees"
        value={employeeCount}
        icon="users"
        detail="Across all departments"
      />
      <StatCard
        label="Pending Leave Approvals"
        value={SNAPSHOT.pendingLeaves}
        icon="calendar"
        tone="amber"
        detail="All requests reviewed"
      />
      <StatCard
        label="Active Job Postings"
        value={SNAPSHOT.openVacancies}
        icon="briefcase"
        tone="blue"
        detail="Open opportunities"
      />
      <StatCard
        label="Processed Net Payroll"
        value={formatCurrency(SNAPSHOT.netPayroll)}
        icon="wallet"
        detail="Payroll summary"
      />
    </section>
  )
}
