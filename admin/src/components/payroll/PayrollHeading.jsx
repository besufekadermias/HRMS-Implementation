import Icon from '../common/Icon.jsx'
import { monthLabel } from '../../services/operations/payrollCalculations.js'

export default function PayrollHeading({
  title,
  description,
  icon = 'wallet',
  month,
  months,
  onMonthChange,
  disabled = false,
  children,
}) {
  return (
    <div className="payroll-page-heading tw:flex tw:items-center tw:justify-between tw:gap-[20px] tw:flex-wrap">
      <div className="payroll-heading-title tw:flex tw:items-center tw:gap-[17px]">
        <span className="payroll-icon tw:inline-flex tw:items-center tw:justify-center tw:shrink-0 tw:rounded-full tw:w-[62px] tw:h-[62px]
          tw:bg-[#d6f7ed] tw:text-[#008675] tw:[@media(width<=650px)]:w-[45px] tw:[@media(width<=650px)]:h-[45px]">
          <Icon name={icon} size={28} />
        </span>
        <div>
          <h1 className="tw:text-[#075c53]">{title}</h1>
          <p className="tw:text-[#658b9c] tw:mt-[6px] tw:leading-[1.6]">{description}</p>
        </div>
      </div>
      <div className="payroll-heading-controls tw:flex tw:items-center tw:gap-[10px] tw:flex-wrap tw:[@media(width<=650px)]:w-full
          tw:[@media(width<=650px)]:[&_.button]:flex-1">
        <label className="payroll-month tw:flex tw:items-center tw:gap-[9px] tw:bg-white tw:text-[#075f54] tw:[border:1px_solid_#d8eaf0]
          tw:p-[0_13px] tw:rounded-[9px] tw:[box-shadow:0_2px_4px_#123d4510]">
          <Icon name="calendar" size={18} />
          <span className="tw:sr-only">Payroll month</span>
          <select
            className="tw:[border:0] tw:bg-transparent tw:p-[12px_0] tw:text-inherit tw:font-[600] tw:max-w-[190px]"
            value={month}
            disabled={disabled}
            onChange={(event) => onMonthChange(event.target.value)}
          >
            {months.map((value) => (
              <option key={value} value={value}>
                {monthLabel(value)}
              </option>
            ))}
          </select>
        </label>
        {children}
      </div>
    </div>
  )
}
