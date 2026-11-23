import { CalendarDays, Download, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import PayrollStatus from './PayrollStatus.jsx'
import { payrollMoney, payrollMonthLabel } from '../../utils/formatters/payrollFormat.js'

export default function PayslipTable({ records, downloads }) {
  return (
    <>
      <div
        className={String.raw`payroll-table-scroll employee-base:max-w-[100%] employee-base:overflow-x-auto
    employee-page:screen-max-768:hidden`}
        role="region"
        aria-label="Monthly payroll records"
        tabIndex={0}
      >
        <table
          className={String.raw`payroll-history-table employee-base:min-w-[1040px] employee-base:w-[100%] employee-base:border-collapse
    employee-base:text-left employee-base:[&_th]:p-[17px_12px]
    employee-base:[&_th]:[border-top:1px_solid_var(--border)] employee-base:[&_th]:text-[length:11px]
    employee-base:[&_th]:align-middle employee-base:[&_td]:p-[17px_12px]
    employee-base:[&_td]:[border-top:1px_solid_var(--border)] employee-base:[&_td]:text-[length:11px]
    employee-base:[&_td]:align-middle employee-base:[&_thead]:[background:#f6faf9]
    employee-base:[&_thead_th]:text-[length:10px]
    employee-base:[&_thead_th]:text-[color:var(--text-secondary)] employee-base:[&_thead_th]:uppercase
    employee-base:[&_thead_th]:tracking-[0.3px] employee-base:[&_tbody_th]:min-w-[120px]
    employee-base:[&_tbody_th]:font-[600] employee-base:[&_small]:block
    employee-base:[&_small]:text-[length:9px] employee-base:[&_small]:mt-[6px]
    employee-base:[&_small]:text-[color:var(--text-muted)] employee-base:[&_small]:font-[400]
    employee-base:[&_small]:leading-[1.5]`}
          id="payroll-history-table"
        >
          <caption className="sr-only">
            Your saved payroll months, earnings, deductions, net pay, statuses, and payslip actions.
          </caption>
          <thead>
            <tr>
              {[
                'Payroll Month',
                'Gross Salary',
                'Income Tax',
                'Employee Pension',
                'Other Deductions',
                'Net Salary',
                'Status',
                'Payslip',
              ].map((label) => (
                <th
                  key={label}
                  scope="col"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <th scope="row">
                  <span className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    <time dateTime={record.month}>{record.month}</time>
                  </span>
                  <small>{payrollMonthLabel(record.month)}</small>
                </th>
                <td>{payrollMoney(record.gross)}</td>
                <td className="text-[#a73955]">{payrollMoney(record.incomeTax)}</td>
                <td className="text-[#9b650e]">
                  {payrollMoney(record.pension)}
                  <small>{record.pensionLabel}</small>
                </td>
                <td>{payrollMoney(record.otherDeductions)}</td>
                <td
                  className={String.raw`payroll-net-cell employee-base:text-[color:var(--primary)] employee-base:font-[700]`}
                >
                  {payrollMoney(record.net)}
                </td>
                <td>
                  <PayrollStatus status={record.status} />
                </td>
                <td>
                  <div
                    className={String.raw`payroll-row-actions employee-base:flex employee-base:flex-col employee-base:gap-[6px]
    employee-base:min-w-[108px] employee-base:[&_>_a]:min-h-[33px] employee-base:[&_>_a]:p-[7px_9px]
    employee-base:[&_>_a]:text-[length:10px] employee-base:[&_>_button]:min-h-[33px]
    employee-base:[&_>_button]:p-[7px_9px] employee-base:[&_>_button]:text-[length:10px]`}
                  >
                    <Link
                      className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
                      to={`/payroll/${encodeURIComponent(record.id)}`}
                      aria-label={`View payslip for ${payrollMonthLabel(record.month)}`}
                    >
                      <Eye size={15} />
                      View
                    </Link>
                    <button
                      className={String.raw`primary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
                      type="button"
                      disabled={!!downloads.busyId || !record.canDownload}
                      onClick={() => downloads.download(record)}
                      aria-label={`Download payslip for ${payrollMonthLabel(record.month)}`}
                    >
                      <Download size={15} />
                      {downloads.busyId === record.id ? 'Downloading…' : 'Download'}
                    </button>
                  </div>
                  {!record.canDownload && <small>Download currently unavailable</small>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        className={String.raw`payroll-mobile-list employee-base:hidden employee-page:screen-max-768:block`}
        aria-label="Monthly payroll records"
      >
        {records.map((record) => (
          <article
            className={String.raw`payroll-mobile-card employee-base:p-[20px_17px] employee-base:[border-top:1px_solid_var(--border)]
    employee-page:screen-max-480:[&_.detail-grid]:grid-cols-[repeat(2,_minmax(0,_1fr))]`}
            key={record.id}
            aria-label={`Payroll for ${payrollMonthLabel(record.month)}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[15px]">{payrollMonthLabel(record.month)}</h3>
              <PayrollStatus status={record.status} />
            </div>
            <dl
              className={String.raw`detail-grid employee-base:grid employee-base:grid-cols-[repeat(2,_minmax(0,_1fr))] employee-base:gap-[22px]
    employee-base:mt-[22px] employee-base:[&_dt]:text-[length:11px]
    employee-base:[&_dt]:text-[color:var(--text-muted)] employee-base:[&_dd]:mt-[7px]
    employee-base:[&_dd]:text-[length:13px] employee-base:[&_dd]:font-[600]
    employee-base:[&_dd]:[overflow-wrap:anywhere] employee-page:screen-max-480:grid-cols-[minmax(0,_1fr)]
    employee-page:screen-max-480:gap-[19px]`}
            >
              {[
                ['Gross salary', record.gross],
                [record.incomeTaxLabel, record.incomeTax],
                [record.pensionLabel, record.pension],
                ['Other deductions', record.otherDeductions],
                ['Net pay', record.net],
                ['Employer pension', record.employerPension],
              ].map(([label, amount]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd className={label === 'Net pay' ? 'text-primary' : ''}>
                    {payrollMoney(amount)}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                className={String.raw`secondary-button flex-1 employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
                to={`/payroll/${encodeURIComponent(record.id)}`}
                aria-label={`View payslip for ${payrollMonthLabel(record.month)}`}
              >
                <Eye size={16} />
                View
              </Link>
              <button
                type="button"
                className={String.raw`primary-button flex-1 employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
                disabled={!!downloads.busyId || !record.canDownload}
                onClick={() => downloads.download(record)}
                aria-label={`Download payslip for ${payrollMonthLabel(record.month)}`}
              >
                <Download size={16} />
                {downloads.busyId === record.id ? 'Downloading…' : 'Download'}
              </button>
            </div>
            {!record.canDownload && (
              <p className="mt-2 text-[11px] text-muted">Download currently unavailable</p>
            )}
          </article>
        ))}
      </div>
    </>
  )
}
