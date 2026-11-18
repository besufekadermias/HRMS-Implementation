import Card from '../../components/common/Card.jsx'
import Button, { TextButton, IconButton } from '../../components/common/Button.jsx'
import Icon from '../../components/common/Icon.jsx'
import PayrollHeading from '../../components/payroll/PayrollHeading.jsx'
import PayrollSummaryCards from '../../components/payroll/PayrollSummaryCards.jsx'
import PayrollTable from '../../components/payroll/PayrollTable.jsx'
import PayrollStatus from '../../components/payroll/PayrollStatus.jsx'
import PayrollLockNotice from '../../components/payroll/PayrollLockNotice.jsx'
import {
  PayrollTrend,
  PayrollBreakdown,
} from '../../components/payroll/PayrollCharts.jsx'
import {
  departmentPayroll,
  monthLabel,
  summarizePayroll,
} from '../../services/operations/payrollCalculations.js'
import formatCurrency from '../../utils/formatters/formatCurrency.js'

export default function PayrollOverview({
  data,
  month,
  currentMonth,
  months,
  onMonthChange,
  search,
  onSearch,
  onGenerate,
  onExport,
  onReport,
  onPayslip,
  onNavigate,
  busy,
  exporting,
}) {
  const run = data.runs.find((item) => item.month === month)
  const totals = summarizePayroll(run)
  const locked = run && run.status !== 'GENERATED'
  let generateLabel = run ? 'Regenerate Payroll' : 'Generate Payroll'
  if (locked) generateLabel = 'Payroll Locked'
  if (busy) generateLabel = 'Saving…'
  return (
    <div className="payroll-page payroll-overview tw:grid tw:gap-[22px] tw:text-[#153a48] tw:[@media(width<=650px)]:gap-[16px]
           tw:[&_h1]:text-[#075c53] tw:[&_.card]:overflow-hidden tw:[&_.card]:border-[#dfeef2]
           tw:[&_.payroll-section-heading]:p-[20px_22px] tw:[&_.payroll-section-heading]:m-0
           tw:[&_.payroll-section-heading]:min-h-[81px]
           tw:[&_.payroll-section-heading]:[border-bottom:1px_solid_#edf4f6]
           tw:[&_.payroll-section-heading]:gap-[15px] tw:[&_.payroll-section-heading_h2]:text-[#075b53]
           tw:[&_.payroll-section-heading_h2]:text-[18px] tw:[&_.payroll-section-heading_h2_svg]:text-[#039482]
           tw:[&_.payroll-section-heading_p]:text-[#69909e] tw:[&_.payroll-section-heading_p]:text-[12px]
           tw:[&_.payroll-section-heading_p]:mt-[6px]
           tw:[@media(width<=650px)]:[&_.payroll-section-heading]:p-[17px]
           tw:[@media(width<=650px)]:[&_.payroll-section-heading]:flex-wrap
           tw:[@media(width<=650px)]:[&_.payroll-search]:max-w-full
           tw:[@media(width<=650px)]:[&_.payroll-search]:w-full">
      <PayrollHeading
        title="Payroll Overview"
        description="Monthly salaries, deductions, and Excel export for Finance."
        month={month}
        months={months}
        onMonthChange={onMonthChange}
        disabled={busy}
      >
        <Button variant="secondary"
          disabled={busy || locked}
          aria-describedby={locked ? 'payroll-lock-message' : undefined}
          onClick={onGenerate}
        >
          <Icon name="plus" size={17} />
          {generateLabel}
        </Button>
        <Button
          disabled={!run || busy || exporting}
          onClick={() => onExport(run)}
        >
          <Icon name="download" size={17} />
          {exporting ? 'Preparing Excel…' : 'Export for Finance'}
        </Button>
      </PayrollHeading>
      <PayrollLockNotice
        run={run}
        currentMonth={currentMonth}
        onMonthChange={onMonthChange}
      />
      <PayrollSummaryCards totals={totals} />
      <div className="payroll-two-columns tw:grid tw:grid-cols-[minmax(0,_1.8fr)_minmax(290px,_1fr)] tw:gap-[20px] tw:[align-items:start]
          tw:min-[1550px]:grid-cols-[minmax(0,_1.8fr)_minmax(400px,_1fr)]
          tw:[@media(width<=1250px)]:grid-cols-[minmax(0,_1fr)]">
        <PayrollTrend runs={data.runs} month={month} />
        <PayrollBreakdown items={departmentPayroll(run)} total={totals.gross} />
      </div>
      <Card className="payroll-records tw:[&_.payroll-search]:max-w-[320px]">
        <div className="payroll-section-heading tw:flex tw:justify-between tw:items-start tw:[&_h2]:flex tw:[&_h2]:items-center
          tw:[&_h2]:gap-[9px] tw:[&_p]:leading-[1.5]">
          <div>
            <h2>
              <Icon name="file" /> Employee Payroll
            </h2>
            <p>
              {monthLabel(month)} · Gross, deductions, and net salary in ETB.
            </p>
          </div>
          <label className="payroll-search tw:flex tw:items-center tw:gap-[8px] tw:min-w-[190px] tw:flex-[1_1_240px] tw:border tw:border-solid
          tw:border-border tw:rounded-[6px] tw:p-[9px_10px] tw:text-[#658da0] tw:h-[38px]
          tw:focus-within:[outline:2px_solid_var(--primary)] tw:focus-within:outline-offset-[2px]
          tw:[&_input]:w-full tw:[&_input]:min-w-0 tw:[&_input]:[border:0] tw:[&_input]:[outline:0]
          tw:[&_input]:text-[10px] tw:[&_input]:text-text-primary tw:[&_input]:bg-transparent
          tw:[&_input::placeholder]:text-[#628097] tw:[@media(width<768px)]:basis-full">
            <Icon name="search" size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search employee name, ID, or department…"
              aria-label="Search payroll employees"
            />
          </label>
        </div>
        <PayrollTable
          run={run}
          search={search}
          onPayslip={(employee) => onPayslip(run, employee)}
        />
      </Card>
      <div className="payroll-two-columns tw:grid tw:grid-cols-[minmax(0,_1.8fr)_minmax(290px,_1fr)] tw:gap-[20px] tw:[align-items:start]
          tw:min-[1550px]:grid-cols-[minmax(0,_1.8fr)_minmax(400px,_1fr)]
          tw:[@media(width<=1250px)]:grid-cols-[minmax(0,_1fr)]">
        <Card className="payroll-recent tw:[&_.payroll-data-table]:min-w-[600px] tw:[&_td]:text-[12px]">
          <div className="payroll-section-heading tw:flex tw:justify-between tw:items-start tw:[&_h2]:flex tw:[&_h2]:items-center
          tw:[&_h2]:gap-[9px] tw:[&_p]:leading-[1.5]">
            <div>
              <h2>
                <Icon name="clock" /> Recent Payrolls
              </h2>
              <p>Saved monthly payroll records.</p>
            </div>
            <TextButton
              onClick={() => onNavigate('payroll-reports')}
            >
              View all <Icon name="arrow" size={15} />
            </TextButton>
          </div>
          {!data.runs.length ? (
            <div className="payroll-empty-state tw:flex tw:items-center tw:justify-center tw:flex-col tw:gap-[13px] tw:p-[35px_20px]
          tw:text-center tw:text-[var(--text-muted)] tw:[&_h3]:text-[17px] tw:[&_h3]:text-text-primary
          tw:[&_p]:text-[13px] tw:[&_p]:max-w-[470px] tw:[&_p]:leading-[1.8]">
              <p>No payrolls generated yet.</p>
            </div>
          ) : (
            <div className="payroll-table-scroll tw:overflow-x-auto tw:[scrollbar-width:thin] tw:[scrollbar-color:#c5dbd6_#f5f9f9]">
              <table className="payroll-data-table tw:w-full tw:border-collapse tw:text-left tw:text-[11px] tw:[&_th]:tracking-[0.6px]
          tw:[&_th]:font-[650] tw:[&_th]:whitespace-nowrap tw:[&_th]:[border-bottom:1px_solid_#e6eff2]
          tw:[&_th:first-child]:rounded-[5px_0_0_5px] tw:[&_th:last-child]:rounded-[0_5px_5px_0]
          tw:[&_td]:[border-bottom:1px_solid_#f0f4f6] tw:[&_td]:text-text-secondary
          tw:[&_tbody_tr:hover]:bg-[#f9fcfb] tw:[&_tbody_tr:last-child_td]:border-b-0 tw:[&_th]:text-[9px]
          tw:[&_th]:text-[#5c768a] tw:[&_th]:bg-[#f6f9fb] tw:[&_th]:p-[13px_12px] tw:[&_td]:leading-[1.6]
          tw:[&_td]:p-[12px]">
                <thead>
                  <tr>
                    {['Month', 'Gross Payroll', 'Status', 'Report'].map(
                      (label) => (
                        <th key={label} scope="col">
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.runs.slice(0, 5).map((item) => (
                    <tr key={item.id}>
                      <td>{monthLabel(item.month)}</td>
                      <td>{formatCurrency(summarizePayroll(item).gross)}</td>
                      <td>
                        <PayrollStatus status={item.status} />
                      </td>
                      <td>
                        <IconButton
                          aria-label={`View ${monthLabel(item.month)} report`}
                          onClick={() => onReport(item.id)}
                        >
                          <Icon name="eye" size={18} />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card className="payroll-deduction-summary tw:pb-[20px]">
          <div className="payroll-section-heading tw:flex tw:justify-between tw:items-start tw:[&_h2]:flex tw:[&_h2]:items-center
          tw:[&_h2]:gap-[9px] tw:[&_p]:leading-[1.5]">
            <div>
              <h2>
                <Icon name="shield" /> Deductions Summary
              </h2>
              <p>Employee deductions for {monthLabel(month)}.</p>
            </div>
          </div>
          <strong className="payroll-summary-total tw:block tw:text-[26px] tw:text-[#153d4d] tw:m-[20px_22px_10px] tw:tracking-[-0.7px]">
            {formatCurrency(totals.totalDeductions)}
          </strong>
          <dl className="payroll-summary-list tw:m-0 tw:p-[10px_22px] tw:[&>div]:flex tw:[&>div]:justify-between tw:[&>div]:gap-[16px]
          tw:[&>div]:p-[15px_0] tw:[&>div]:[border-bottom:1px_solid_#eaf2f4] tw:[&_dt]:text-[#587c8a]
          tw:[&_dt]:text-[12px] tw:[&_dd]:m-0 tw:[&_dd]:text-[#234f60] tw:[&_dd]:font-[600] tw:[&_dd]:tabular-nums
          tw:[&_dd]:text-right">
            {[
              ['Income tax', totals.incomeTax],
              ['Pension', totals.pension],
              ['Other deductions', totals.otherDeductions],
            ].map(([label, amount]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{formatCurrency(amount)}</dd>
              </div>
            ))}
          </dl>
          <TextButton
            className="tw:m-[10px_22px_0]"
            onClick={() => onNavigate('payroll-deductions')}
          >
            Manage Deductions <Icon name="arrow" size={15} />
          </TextButton>
        </Card>
      </div>
      <div className="payroll-info tw:flex tw:items-start tw:gap-[12px] tw:p-[18px_22px] tw:bg-[#e8f8f4] tw:[border:1px_solid_#d2eee8]
          tw:rounded-[10px] tw:text-[#517f8c] tw:text-[12px] tw:leading-[1.7] tw:[&>svg]:text-[#079b87]
          tw:[&>svg]:mt-[2px]">
        <Icon name="info" size={20} />
        <p>
          Download the Excel workbook and send it to Finance manually. Exporting
          a file does not change payment or forwarding status.
        </p>
      </div>
    </div>
  )
}
