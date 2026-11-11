import { MAX_LEAVE_BALANCE } from '../../utils/constants/constants.js'
import { getLeaveYear } from '../../services/operations/leaveYear.js'
import formatDate from '../../utils/formatters/formatDate.js'

export default function LeaveBalanceCard({ balance, maxBalance = MAX_LEAVE_BALANCE }) {
  if (!balance) return <span className="leave-balance-unavailable">Balance unavailable</span>
  const overCap = balance.remaining > Number(maxBalance)
  const period = balance.yearStart ? getLeaveYear(balance.yearStart) : null
  return (
    <div className="leave-balance">
      <strong className={`leave-balance-value${balance.remaining === 0 ? ' exhausted' : overCap ? ' over-cap' : ''}`}>
        {balance.remaining} {balance.remaining === 1 ? 'day' : 'days'} remaining
      </strong>
      <small>Entitlement: {balance.accrued} | Used: {balance.used}</small>
      {period && <small>{period.year} E.C. · Renews {formatDate(period.nextStart)}</small>}
      {overCap && <small className="field-error">Exceeds the {maxBalance}-day limit</small>}
    </div>
  )
}
