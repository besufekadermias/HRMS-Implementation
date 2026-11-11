import Icon from '../common/Icon.jsx'
import formatCurrency from '../../utils/formatters/formatCurrency.js'

export default function PayrollSummaryCards({ totals, mode = 'overview' }) {
  const cardGroups = {
    overview: [
      {
        label: 'Total Gross Salary',
        value: totals.gross,
        icon: 'wallet',
        tone: 'green',
        detail: `${totals.employees} employees included`,
      },
      {
        label: 'Income Tax (ERCA)',
        value: totals.incomeTax,
        icon: 'percent',
        tone: 'blue',
        detail: 'Employee income tax',
      },
      {
        label: 'Employee Pension',
        value: totals.pension,
        icon: 'shield',
        tone: 'lavender',
        detail: 'Deducted from gross salary',
      },
      {
        label: 'Disbursable Net Salary',
        value: totals.net,
        icon: 'building',
        tone: 'green',
        detail: 'Amount for Finance to disburse',
      },
    ],
    deductions: [
      {
        label: 'Total Deductions',
        value: totals.totalDeductions,
        icon: 'wallet',
        tone: 'green',
        detail: 'Employee deductions',
      },
      {
        label: 'Income Tax',
        value: totals.incomeTax,
        icon: 'percent',
        tone: 'blue',
        detail: 'Progressive income tax',
      },
      {
        label: 'Pension Deductions',
        value: totals.pension,
        icon: 'shield',
        tone: 'lavender',
        detail: 'Employee pension contribution',
      },
      {
        label: 'Other Deductions',
        value: totals.otherDeductions,
        icon: 'users',
        tone: 'amber',
        detail: 'Additional contributions',
      },
    ],
    report: [
      {
        label: 'Gross Payroll',
        value: totals.gross,
        icon: 'wallet',
        tone: 'green',
        detail: 'Monthly salary total',
      },
      {
        label: 'Total Deductions',
        value: totals.totalDeductions,
        icon: 'shield',
        tone: 'blue',
        detail: 'Tax, pension, and other deductions',
      },
      {
        label: 'Net Pay',
        value: totals.net,
        icon: 'building',
        tone: 'lavender',
        detail: 'After employee deductions',
      },
      {
        label: 'Employees Included',
        value: totals.employees,
        icon: 'users',
        tone: 'amber',
        detail: 'Records in this payroll',
        isCount: true,
      },
    ],
  }
  const cards = cardGroups[mode] || cardGroups.overview

  return (
    <section className="payroll-stats" aria-label="Payroll totals">
      {cards.map((card) => (
        <article className="card payroll-stat" key={card.label}>
          <span className={`icon-circle tone-${card.tone}`}>
            <Icon name={card.icon} size={25} />
          </span>
          <div>
            <h2>{card.label}</h2>
            <strong>
              {card.isCount
                ? card.value
                : formatCurrency(card.value, { minimumFractionDigits: 2 })}
            </strong>
            <small>{card.detail}</small>
          </div>
        </article>
      ))}
    </section>
  )
}
