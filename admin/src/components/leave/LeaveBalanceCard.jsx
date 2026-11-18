import { MAX_LEAVE_BALANCE } from '../../utils/constants/constants.js'
import { getLeaveYear } from '../../services/operations/leaveYear.js'
import formatDate from '../../utils/formatters/formatDate.js'

export default function LeaveBalanceCard({ balance, maxBalance = MAX_LEAVE_BALANCE }) {
  if (!balance) return <span className="leave-balance-unavailable tw:text-[11px] tw:text-[var(--text-muted)]">Balance unavailable</span>
  const overCap = balance.remaining > Number(maxBalance)
  const period = balance.yearStart ? getLeaveYear(balance.yearStart) : null
  return (
    <div className="leave-balance tw:grid tw:gap-[6px] tw:[&_small]:text-[var(--text-muted)] tw:[&_small]:text-[10px]
           tw:[&_small.field-error]:text-[#b52b45]">
      <strong className={`leave-balance-value tw:inline-block tw:justify-self-start tw:p-[5px_10px] tw:bg-[#cef6e3] tw:text-[#05644a]
          tw:rounded-[6px] tw:leading-[1.5] tw:[&.exhausted]:text-[#ad233c] tw:[&.exhausted]:bg-[#ffe3e8]
          tw:[&.over-cap]:text-[#94590b] tw:[&.over-cap]:bg-[#fff0cc] ${balance.remaining === 0 ? " exhausted" : overCap ? " over-cap" : ""}`}>
        {balance.remaining} {balance.remaining === 1 ? 'day' : 'days'} remaining
      </strong>
      <small>Entitlement: {balance.accrued} | Used: {balance.used}</small>
      {period && <small>{period.year} E.C. · Renews {formatDate(period.nextStart)}</small>}
      {overCap && <small className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]">Exceeds the {maxBalance}-day limit</small>}
    </div>
  )
}
