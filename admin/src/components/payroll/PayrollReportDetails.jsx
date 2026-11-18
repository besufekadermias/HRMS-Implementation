import Card from '../common/Card.jsx'
import Button, { TextButton } from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import PayrollSummaryCards from './PayrollSummaryCards.jsx'
import PayrollStatus from './PayrollStatus.jsx'
import PayrollTable from './PayrollTable.jsx'
import {
  monthLabel,
  summarizePayroll,
} from '../../services/operations/payrollCalculations.js'
import { printPayroll } from '../../services/operations/payrollExport.js'
import formatCurrency from '../../utils/formatters/formatCurrency.js'

export default function PayrollReportDetails({
  run,
  search,
  onSearch,
  onBack,
  onExport,
  onPayslip,
  exporting,
}) {
  const totals = summarizePayroll(run)
  const lastDay = new Date(
    Number(run.month.slice(0, 4)),
    Number(run.month.slice(5)),
    0,
  ).getDate()
  return (
    <div className="payroll-page tw:grid tw:gap-[22px] tw:text-[#153a48] tw:[@media(width<=650px)]:gap-[16px] tw:[&_h1]:text-[#075c53]
           tw:[&_.card]:overflow-hidden tw:[&_.card]:border-[#dfeef2] tw:[&_.payroll-section-heading]:p-[20px_22px]
           tw:[&_.payroll-section-heading]:m-0 tw:[&_.payroll-section-heading]:min-h-[81px]
           tw:[&_.payroll-section-heading]:[border-bottom:1px_solid_#edf4f6]
           tw:[&_.payroll-section-heading]:gap-[15px] tw:[&_.payroll-section-heading_h2]:text-[#075b53]
           tw:[&_.payroll-section-heading_h2]:text-[18px] tw:[&_.payroll-section-heading_h2_svg]:text-[#039482]
           tw:[&_.payroll-section-heading_p]:text-[#69909e] tw:[&_.payroll-section-heading_p]:text-[12px]
           tw:[&_.payroll-section-heading_p]:mt-[6px]
           tw:[@media(width<=650px)]:[&_.payroll-section-heading]:p-[17px]
           tw:[@media(width<=650px)]:[&_.payroll-section-heading]:flex-wrap
           tw:[@media(width<=650px)]:[&_.payroll-search]:max-w-full
           tw:[@media(width<=650px)]:[&_.payroll-search]:w-full">
      <div className="payroll-breadcrumb tw:flex tw:items-center tw:gap-[10px] tw:text-[#7a9bab] tw:text-[12px]">
        <TextButton onClick={onBack}>
          <Icon name="arrow-left" size={16} />
          Payroll Reports
        </TextButton>
        <Icon name="chevron" size={14} />
        <span>Report Details</span>
      </div>
      <div className="payroll-page-heading tw:flex tw:items-center tw:justify-between tw:gap-[20px] tw:flex-wrap tw:[&_p]:text-[#658b9c]
          tw:[&_p]:mt-[6px] tw:[&_p]:leading-[1.6]">
        <div>
          <div className="payroll-report-title tw:flex tw:gap-[16px] tw:items-center tw:flex-wrap">
            <h1>{monthLabel(run.month)} Payroll Summary</h1>
            <PayrollStatus status={run.status} />
          </div>
          <p>Report ID: {run.id} · Amounts in Ethiopian Birr</p>
        </div>
        <div className="payroll-heading-controls tw:flex tw:items-center tw:gap-[10px] tw:flex-wrap tw:[@media(width<=650px)]:w-full
          tw:[@media(width<=650px)]:[&_.button]:flex-1">
          <Button variant="secondary"
            onClick={() => printPayroll(run)}
          >
            <Icon name="print" size={17} />
            Print / Save PDF
          </Button>
          <Button
            disabled={exporting}
            onClick={() => onExport(run)}
          >
            <Icon name="download" size={17} />
            {exporting ? 'Preparing Excel…' : 'Export Excel'}
          </Button>
        </div>
      </div>
      <PayrollSummaryCards totals={totals} mode="report" />
      <Card as="dl" className="payroll-report-meta tw:grid tw:grid-cols-4 tw:m-0 tw:p-[23px_8px] tw:[&>div]:p-[0_20px]
          tw:[&>div]:[border-right:1px_solid_#e4eff2] tw:[&>div:last-child]:[border:0] tw:[&_dt]:text-[12px]
          tw:[&_dt]:text-[#7b9aa7] tw:[&_dt]:mb-[12px] tw:[&_dd]:m-0 tw:[&_dd]:font-[600] tw:[&_dd]:text-[13px]
          tw:[&_dd]:leading-[1.5] tw:[@media(width<=650px)]:grid-cols-2 tw:[@media(width<=650px)]:gap-[20px_0]">
        <div>
          <dt>Payroll period</dt>
          <dd>
            1–{lastDay} {monthLabel(run.month)}
          </dd>
        </div>
        <div>
          <dt>Department</dt>
          <dd>All included departments</dd>
        </div>
        <div>
          <dt>Generated on</dt>
          <dd>
            {run.generatedAt
              ? new Date(run.generatedAt).toLocaleString('en-GB', {
                  timeZone: 'Africa/Addis_Ababa',
                })
              : 'Not recorded'}
          </dd>
        </div>
        <div>
          <dt>Prepared by</dt>
          <dd>{run.preparedBy || 'Not recorded'}</dd>
        </div>
      </Card>
      <div className="payroll-report-grid tw:grid tw:grid-cols-[minmax(0,_2.6fr)_minmax(265px,_1fr)] tw:gap-[22px] tw:[align-items:start]
          tw:[@media(width<=1250px)]:grid-cols-[minmax(0,_1fr)]">
        <Card className="payroll-records tw:[&_.payroll-search]:max-w-[320px]">
          <div className="payroll-section-heading tw:flex tw:justify-between tw:items-start tw:[&_h2]:flex tw:[&_h2]:items-center
          tw:[&_h2]:gap-[9px] tw:[&_p]:leading-[1.5]">
            <div>
              <h2>
                <Icon name="users" /> Employee Payroll Breakdown
              </h2>
              <p>Saved salary and deduction amounts for each employee.</p>
            </div>
            <label className="payroll-search tw:flex tw:items-center tw:gap-[8px] tw:min-w-[190px] tw:flex-[1_1_240px] tw:border tw:border-solid
          tw:border-border tw:rounded-[6px] tw:p-[9px_10px] tw:text-[#658da0] tw:h-[38px]
          tw:focus-within:[outline:2px_solid_var(--primary)] tw:focus-within:outline-offset-[2px]
          tw:[&_input]:w-full tw:[&_input]:min-w-0 tw:[&_input]:[border:0] tw:[&_input]:[outline:0]
          tw:[&_input]:text-[10px] tw:[&_input]:text-text-primary tw:[&_input]:bg-transparent
          tw:[&_input::placeholder]:text-[#628097] tw:[@media(width<768px)]:basis-full">
              <Icon name="search" size={16} />
              <input
                type="search"
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="Search employees…"
                aria-label="Search report employees"
              />
            </label>
          </div>
          <PayrollTable
            run={run}
            search={search}
            onPayslip={(employee) => onPayslip(run, employee)}
          />
        </Card>
        <aside className="payroll-aside-stack tw:grid tw:gap-[20px] tw:min-w-0">
          <Card className="payroll-report-summary">
            <div className="payroll-section-heading tw:flex tw:justify-between tw:items-start tw:[&_h2]:flex tw:[&_h2]:items-center
          tw:[&_h2]:gap-[9px] tw:[&_p]:leading-[1.5]">
              <div>
                <h2>
                  <Icon name="file" /> Report Summary
                </h2>
                <p>{totals.employees} employees · ETB</p>
              </div>
            </div>
            <dl className="payroll-summary-list tw:m-0 tw:p-[10px_22px] tw:[&>div]:flex tw:[&>div]:justify-between tw:[&>div]:gap-[16px]
          tw:[&>div]:p-[15px_0] tw:[&>div]:[border-bottom:1px_solid_#eaf2f4] tw:[&_dt]:text-[#587c8a]
          tw:[&_dt]:text-[12px] tw:[&_dd]:m-0 tw:[&_dd]:text-[#234f60] tw:[&_dd]:font-[600] tw:[&_dd]:tabular-nums
          tw:[&_dd]:text-right tw:[&>div:last-child]:bg-[#e2f8f0] tw:[&>div:last-child]:m-[10px_-8px_8px]
          tw:[&>div:last-child]:p-[22px_10px] tw:[&>div:last-child]:rounded-[8px]
          tw:[&>div:last-child]:items-center tw:[&>div:last-child_dd]:text-[#058370]
          tw:[&>div:last-child_dd]:text-[20px]">
              {[
                ['Gross salaries', totals.gross],
                ['Income tax', totals.incomeTax],
                ['Employee pension', totals.pension],
                ['Other deductions', totals.otherDeductions],
                ['Total deductions', totals.totalDeductions],
                ['Total net pay', totals.net],
              ].map(([label, amount]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>
                    {formatCurrency(amount, { minimumFractionDigits: 2 })}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card className="payroll-report-summary">
            <div className="payroll-section-heading tw:flex tw:justify-between tw:items-start tw:[&_h2]:flex tw:[&_h2]:items-center
          tw:[&_h2]:gap-[9px] tw:[&_p]:leading-[1.5]">
              <div>
                <h2>
                  <Icon name="shield" /> Employer Contribution
                </h2>
                <p>Pension at {run.policy.employerPensionRate}%</p>
              </div>
            </div>
            <strong className="payroll-summary-total tw:block tw:text-[26px] tw:text-[#153d4d] tw:m-[20px_22px_10px] tw:tracking-[-0.7px]">
              {formatCurrency(totals.employerPension)}
            </strong>
            <p className="payroll-table-note tw:p-[18px_22px] tw:text-[#7795a1] tw:text-[12px] tw:leading-[1.7]">
              An employer cost, separate from employee net pay.
            </p>
          </Card>
        </aside>
      </div>
      <div className="payroll-info tw:flex tw:items-start tw:gap-[12px] tw:p-[18px_22px] tw:bg-[#e8f8f4] tw:[border:1px_solid_#d2eee8]
          tw:rounded-[10px] tw:text-[#517f8c] tw:text-[12px] tw:leading-[1.7] tw:[&>svg]:text-[#079b87]
          tw:[&>svg]:mt-[2px]">
        <Icon name="info" />
        <p>
          {run.status === 'PAID'
            ? 'Finance has recorded this payroll as paid.'
            : 'This report shows the saved payroll. Generation and Excel export do not confirm employee payment.'}{' '}
          Report totals include all employees, regardless of the search filter.
        </p>
      </div>
    </div>
  )
}
