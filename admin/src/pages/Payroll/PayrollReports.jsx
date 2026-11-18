import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import Icon from '../../components/common/Icon.jsx'
import PayrollHeading from '../../components/payroll/PayrollHeading.jsx'
import PayrollStatus from '../../components/payroll/PayrollStatus.jsx'
import PayrollSummaryCards from '../../components/payroll/PayrollSummaryCards.jsx'
import PayrollReportDetails from '../../components/payroll/PayrollReportDetails.jsx'
import {
  monthLabel,
  summarizePayroll,
} from '../../services/operations/payrollCalculations.js'
import formatCurrency from '../../utils/formatters/formatCurrency.js'

export default function PayrollReports({
  data,
  month,
  months,
  onMonthChange,
  search,
  onSearch,
  reportId,
  onReport,
  onExport,
  onPayslip,
  exporting,
  busy,
}) {
  const selected = data.runs.find((run) => run.id === reportId)
  if (selected)
    return (
      <PayrollReportDetails
        run={selected}
        search={search}
        onSearch={onSearch}
        onBack={() => {
          onReport(null)
          onSearch('')
        }}
        onExport={onExport}
        onPayslip={onPayslip}
        exporting={exporting}
      />
    )
  const run = data.runs.find((item) => item.month === month)
  const query = search.trim().toLowerCase()
  const reports = data.runs.filter((item) =>
    `${monthLabel(item.month)} ${item.id} ${item.status}`
      .toLowerCase()
      .includes(query),
  )
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
      <PayrollHeading
        title="Payroll Reports"
        icon="file"
        description="Review saved payrolls and prepare reports for Finance."
        month={month}
        months={months}
        onMonthChange={onMonthChange}
        disabled={busy}
      />
      <PayrollSummaryCards totals={summarizePayroll(run)} mode="report" />
      <Card className="payroll-records tw:[&_.payroll-search]:max-w-[320px]">
        <div className="payroll-section-heading tw:flex tw:justify-between tw:items-start tw:[&_h2]:flex tw:[&_h2]:items-center
          tw:[&_h2]:gap-[9px] tw:[&_p]:leading-[1.5]">
          <div>
            <h2>
              <Icon name="file" /> Monthly Payroll Reports
            </h2>
            <p>All recorded months. Summary cards show {monthLabel(month)}.</p>
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
              placeholder="Search month, report ID, or status…"
              aria-label="Search payroll reports"
            />
          </label>
        </div>
        <div className="payroll-table-scroll tw:overflow-x-auto tw:[scrollbar-width:thin] tw:[scrollbar-color:#c5dbd6_#f5f9f9]">
          <table className="payroll-data-table tw:w-full tw:border-collapse tw:text-left tw:text-[11px] tw:[&_th]:tracking-[0.6px]
          tw:[&_th]:font-[650] tw:[&_th]:whitespace-nowrap tw:[&_th]:[border-bottom:1px_solid_#e6eff2]
          tw:[&_th:first-child]:rounded-[5px_0_0_5px] tw:[&_th:last-child]:rounded-[0_5px_5px_0]
          tw:[&_td]:[border-bottom:1px_solid_#f0f4f6] tw:[&_td]:text-text-secondary
          tw:[&_tbody_tr:hover]:bg-[#f9fcfb] tw:[&_tbody_tr:last-child_td]:border-b-0 tw:[&_th]:text-[9px]
          tw:[&_th]:text-[#5c768a] tw:[&_th]:bg-[#f6f9fb] tw:[&_th]:p-[13px_12px] tw:[&_td]:leading-[1.6]
          payroll-reports-table tw:min-w-[850px] tw:[&_td]:p-[23px_18px] tw:[&_td]:text-[12px] tw:[&_small]:block
          tw:[&_small]:text-[#829ba8] tw:[&_small]:mt-[5px] tw:[&_small]:text-[11px]">
            <thead>
              <tr>
                {[
                  'Report / Month',
                  'Employees',
                  'Gross Payroll',
                  'Deductions',
                  'Net Pay',
                  'Status',
                  'Actions',
                ].map((label) => (
                  <th key={label} scope="col">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((item) => {
                const totals = summarizePayroll(item)
                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{monthLabel(item.month)}</strong>
                      <small>{item.id}</small>
                    </td>
                    <td>{totals.employees}</td>
                    <td>{formatCurrency(totals.gross)}</td>
                    <td>{formatCurrency(totals.totalDeductions)}</td>
                    <td className="payroll-net tw:text-[#078573] tw:font-bold">
                      {formatCurrency(totals.net)}
                    </td>
                    <td>
                      <PayrollStatus status={item.status} />
                    </td>
                    <td>
                      <Button variant="secondary"
                        onClick={() => {
                          onSearch('')
                          onReport(item.id)
                        }}
                      >
                        <Icon name="eye" size={16} />
                        View Report
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!reports.length && (
          <div className="payroll-empty-state tw:flex tw:items-center tw:justify-center tw:flex-col tw:gap-[13px] tw:p-[35px_20px]
          tw:text-center tw:text-[var(--text-muted)] tw:[&_h3]:text-[17px] tw:[&_h3]:text-text-primary
          tw:[&_p]:text-[13px] tw:[&_p]:max-w-[470px] tw:[&_p]:leading-[1.8]">
            <Icon name="file" size={30} />
            <h3>
              {data.runs.length
                ? 'No matching reports'
                : 'No payroll reports yet'}
            </h3>
            <p>
              {data.runs.length
                ? 'Try a different month or report ID.'
                : 'Generate payroll from the Overview to create a report.'}
            </p>
          </div>
        )}
        {!!reports.length && (
          <p className="payroll-table-note tw:p-[18px_22px] tw:text-[#7795a1] tw:text-[12px] tw:leading-[1.7]">
            {reports.length} reports · Saved payroll amounts are preserved
            independently of current employee salaries.
          </p>
        )}
      </Card>
    </div>
  )
}
