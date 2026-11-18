import Card from '../common/Card.jsx'
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
    <section className="payroll-stats tw:grid tw:grid-cols-4 tw:gap-[16px] tw:[@media(width<=1250px)]:grid-cols-[repeat(2,_1fr)]
          tw:[@media(width<=650px)]:gap-[10px]" aria-label="Payroll totals">
      {cards.map((card) => (
        <Card as="article" className="payroll-stat tw:flex tw:items-center tw:gap-[14px] tw:min-w-0 tw:p-[24px_20px] tw:border-[#dcedf1]
          tw:[background:linear-gradient(125deg,_#fff,_#f8ffff)] tw:[@media(1251px<=width<=1450px)]:p-[20px_14px]
          tw:[@media(1251px<=width<=1450px)]:gap-[9px] tw:[@media(width<=650px)]:p-[16px_10px]
          tw:[@media(width<=650px)]:block" key={card.label}>
          <span className={`payroll-icon tw:inline-flex tw:items-center tw:justify-center tw:shrink-0 tw:rounded-full
          tw:[&.payroll-tone-green]:text-[#0b8972] tw:[&.payroll-tone-green]:bg-[#e3f5f0]
          tw:[&.payroll-tone-amber]:text-[#a36b0d] tw:[&.payroll-tone-amber]:bg-[#fff5dd]
          tw:[&.payroll-tone-blue]:text-[#4b8397] tw:[&.payroll-tone-blue]:bg-[#eaf2f7]
          tw:[&.payroll-tone-lavender]:text-[#7566ba] tw:[&.payroll-tone-lavender]:bg-[#f0edfb] payroll-tone-${card.tone} tw:w-[51px] tw:h-[51px] tw:flex-[0_0_51px] tw:[@media(1251px<=width<=1450px)]:w-[36px]
          tw:[@media(1251px<=width<=1450px)]:h-[36px] tw:[@media(1251px<=width<=1450px)]:basis-[36px]
          tw:[@media(width<=650px)]:w-[35px] tw:[@media(width<=650px)]:h-[35px] tw:[@media(width<=650px)]:mb-[12px] `}>
            <Icon name={card.icon} size={25} />
          </span>
          <div>
            <h2 className="tw:text-[13px] tw:font-[500] tw:text-[#35647a] tw:tracking-[0] tw:[@media(width<=650px)]:text-[11px]">{card.label}</h2>
            <strong className="tw:block tw:m-[8px_0] tw:text-[clamp(17px,_1.6vw,_25px)] tw:tracking-[-0.6px] tw:font-[720] tw:text-[#102f43]
          tw:tabular-nums tw:whitespace-nowrap tw:[@media(1251px<=width<=1450px)]:text-[18px]
          tw:[@media(width<=650px)]:text-[17px]">
              {card.isCount
                ? card.value
                : formatCurrency(card.value, { minimumFractionDigits: 2 })}
            </strong>
            <small className="tw:text-[#6d92a0] tw:text-[11px] tw:[@media(width<=650px)]:text-[10px]">{card.detail}</small>
          </div>
        </Card>
      ))}
    </section>
  )
}
