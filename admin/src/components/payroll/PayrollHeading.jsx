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
    <div className="payroll-page-heading">
      <div className="payroll-heading-title">
        <span className="icon-circle">
          <Icon name={icon} size={28} />
        </span>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <div className="payroll-heading-controls">
        <label className="payroll-month">
          <Icon name="calendar" size={18} />
          <span className="sr-only">Payroll month</span>
          <select
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
