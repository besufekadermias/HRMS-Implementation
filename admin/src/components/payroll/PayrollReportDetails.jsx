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
    <div className="payroll-page">
      <div className="payroll-breadcrumb">
        <button className="text-button" onClick={onBack}>
          <Icon name="arrow-left" size={16} />
          Payroll Reports
        </button>
        <Icon name="chevron" size={14} />
        <span>Report Details</span>
      </div>
      <div className="payroll-page-heading">
        <div>
          <div className="payroll-report-title">
            <h1>{monthLabel(run.month)} Payroll Summary</h1>
            <PayrollStatus status={run.status} />
          </div>
          <p>Report ID: {run.id} · Amounts in Ethiopian Birr</p>
        </div>
        <div className="payroll-heading-controls">
          <button
            className="button button-secondary"
            onClick={() => printPayroll(run)}
          >
            <Icon name="print" size={17} />
            Print / Save PDF
          </button>
          <button
            className="button button-primary"
            disabled={exporting}
            onClick={() => onExport(run)}
          >
            <Icon name="download" size={17} />
            {exporting ? 'Preparing Excel…' : 'Export Excel'}
          </button>
        </div>
      </div>
      <PayrollSummaryCards totals={totals} mode="report" />
      <dl className="card payroll-report-meta">
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
      </dl>
      <div className="payroll-report-grid">
        <section className="card payroll-records">
          <div className="section-heading">
            <div>
              <h2>
                <Icon name="users" /> Employee Payroll Breakdown
              </h2>
              <p>Saved salary and deduction amounts for each employee.</p>
            </div>
            <label className="directory-search">
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
        </section>
        <aside className="payroll-aside-stack">
          <section className="card payroll-report-summary">
            <div className="section-heading">
              <div>
                <h2>
                  <Icon name="file" /> Report Summary
                </h2>
                <p>{totals.employees} employees · ETB</p>
              </div>
            </div>
            <dl className="payroll-summary-list">
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
          </section>
          <section className="card payroll-report-summary">
            <div className="section-heading">
              <div>
                <h2>
                  <Icon name="shield" /> Employer Contribution
                </h2>
                <p>Pension at {run.policy.employerPensionRate}%</p>
              </div>
            </div>
            <strong className="payroll-summary-total">
              {formatCurrency(totals.employerPension)}
            </strong>
            <p className="payroll-table-note">
              An employer cost, separate from employee net pay.
            </p>
          </section>
        </aside>
      </div>
      <div className="payroll-info">
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
