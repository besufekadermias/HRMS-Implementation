import Icon from '../common/Icon.jsx'
import { monthLabel } from '../../services/operations/payrollCalculations.js'

export default function PayrollLockNotice({
  run,
  currentMonth,
  onMonthChange,
}) {
  if (!run || run.status === 'GENERATED') return null

  const reason = run.status === 'PAID' ? 'paid' : 'forwarded to Finance'
  return (
    <div className="payroll-info payroll-lock-notice">
      <Icon name="shield" size={20} />
      <p id="payroll-lock-message">
        {monthLabel(run.month)} has already been {reason}. This payroll is
        locked: you cannot regenerate it or change its deductions. Select
        another month to prepare payroll.
      </p>
      {currentMonth !== run.month && (
        <button
          className="button button-secondary"
          onClick={() => onMonthChange(currentMonth)}
        >
          Go to {monthLabel(currentMonth)}
        </button>
      )}
    </div>
  )
}
