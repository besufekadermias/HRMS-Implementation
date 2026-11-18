import Button from '../common/Button.jsx'
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
    <div className="payroll-info payroll-lock-notice tw:flex tw:flex-wrap tw:items-center tw:gap-[12px] tw:p-[18px_22px]
           tw:bg-[#e8f8f4] tw:[border:1px_solid_#d2eee8] tw:rounded-[10px] tw:text-[#517f8c] tw:text-[12px]
           tw:leading-[1.7] tw:[&>svg]:text-[#079b87] tw:[&>svg]:mt-[2px]">
      <Icon name="shield" size={20} />
      <p className="tw:flex-[1_1_250px]" id="payroll-lock-message">
        {monthLabel(run.month)} has already been {reason}. This payroll is
        locked: you cannot regenerate it or change its deductions. Select
        another month to prepare payroll.
      </p>
      {currentMonth !== run.month && (
        <Button variant="secondary"
          onClick={() => onMonthChange(currentMonth)}
        >
          Go to {monthLabel(currentMonth)}
        </Button>
      )}
    </div>
  )
}
