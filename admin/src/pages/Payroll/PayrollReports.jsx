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
    <div className="payroll-page">
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
      <section className="card payroll-records">
        <div className="section-heading">
          <div>
            <h2>
              <Icon name="file" /> Monthly Payroll Reports
            </h2>
            <p>All recorded months. Summary cards show {monthLabel(month)}.</p>
          </div>
          <label className="directory-search">
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
        <div className="table-scroll">
          <table className="employee-table payroll-reports-table">
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
                    <td className="payroll-net">
                      {formatCurrency(totals.net)}
                    </td>
                    <td>
                      <PayrollStatus status={item.status} />
                    </td>
                    <td>
                      <button
                        className="button button-secondary"
                        onClick={() => {
                          onSearch('')
                          onReport(item.id)
                        }}
                      >
                        <Icon name="eye" size={16} />
                        View Report
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!reports.length && (
          <div className="empty-state">
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
          <p className="payroll-table-note">
            {reports.length} reports · Saved payroll amounts are preserved
            independently of current employee salaries.
          </p>
        )}
      </section>
    </div>
  )
}
