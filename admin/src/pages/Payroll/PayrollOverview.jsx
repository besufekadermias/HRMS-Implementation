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
    <div className="payroll-page">
      <PayrollHeading
        title="Payroll Overview"
        description="Monthly salaries, deductions, and Excel export for Finance."
        month={month}
        months={months}
        onMonthChange={onMonthChange}
        disabled={busy}
      >
        <button
          className="button button-secondary"
          disabled={busy || locked}
          aria-describedby={locked ? 'payroll-lock-message' : undefined}
          onClick={onGenerate}
        >
          <Icon name="plus" size={17} />
          {generateLabel}
        </button>
        <button
          className="button button-primary"
          disabled={!run || busy || exporting}
          onClick={() => onExport(run)}
        >
          <Icon name="download" size={17} />
          {exporting ? 'Preparing Excel…' : 'Export for Finance'}
        </button>
      </PayrollHeading>
      <PayrollLockNotice
        run={run}
        currentMonth={currentMonth}
        onMonthChange={onMonthChange}
      />
      <PayrollSummaryCards totals={totals} />
      <div className="payroll-two-columns">
        <PayrollTrend runs={data.runs} month={month} />
        <PayrollBreakdown items={departmentPayroll(run)} total={totals.gross} />
      </div>
      <section className="card payroll-records">
        <div className="section-heading">
          <div>
            <h2>
              <Icon name="file" /> Employee Payroll
            </h2>
            <p>
              {monthLabel(month)} · Gross, deductions, and net salary in ETB.
            </p>
          </div>
          <label className="directory-search">
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
      </section>
      <div className="payroll-two-columns">
        <section className="card payroll-recent">
          <div className="section-heading">
            <div>
              <h2>
                <Icon name="clock" /> Recent Payrolls
              </h2>
              <p>Saved monthly payroll records.</p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate('payroll-reports')}
            >
              View all <Icon name="arrow" size={15} />
            </button>
          </div>
          {!data.runs.length ? (
            <div className="empty-state">
              <p>No payrolls generated yet.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="employee-table">
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
                        <button
                          className="icon-button"
                          aria-label={`View ${monthLabel(item.month)} report`}
                          onClick={() => onReport(item.id)}
                        >
                          <Icon name="eye" size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="card payroll-deduction-summary">
          <div className="section-heading">
            <div>
              <h2>
                <Icon name="shield" /> Deductions Summary
              </h2>
              <p>Employee deductions for {monthLabel(month)}.</p>
            </div>
          </div>
          <strong className="payroll-summary-total">
            {formatCurrency(totals.totalDeductions)}
          </strong>
          <dl className="payroll-summary-list">
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
          <button
            className="text-button"
            onClick={() => onNavigate('payroll-deductions')}
          >
            Manage Deductions <Icon name="arrow" size={15} />
          </button>
        </section>
      </div>
      <div className="payroll-info">
        <Icon name="info" size={20} />
        <p>
          Download the Excel workbook and send it to Finance manually. Exporting
          a file does not change payment or forwarding status.
        </p>
      </div>
    </div>
  )
}
