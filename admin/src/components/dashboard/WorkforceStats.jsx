import StatCard from '../common/StatCard.jsx'
import { SNAPSHOT } from '../../utils/constants/constants.js'
import formatCurrency from '../../utils/formatters/formatCurrency.js'

export default function WorkforceStats({ employeeCount }) {
  return (
    <section className="workforce-stats" aria-label="Workforce statistics">
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
