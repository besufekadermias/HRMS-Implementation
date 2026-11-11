import { useState } from 'react'
import Pagination from '../common/Pagination.jsx'
import Icon from '../common/Icon.jsx'
import PayrollStatus from './PayrollStatus.jsx'
import { filterPayrollRows } from '../../services/operations/payrollCalculations.js'

const money = (amount) =>
  amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
export default function PayrollTable({ run, search = '', onPayslip }) {
  const [pageSize, setPageSize] = useState(5)
  const [paging, setPaging] = useState({ key: '', page: 1 })
  const rows = filterPayrollRows(run?.rows || [], search)
  // A different month, search, or page size starts at the first page.
  const filterKey = `${run?.id}:${search}:${pageSize}`
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const page = paging.key === filterKey ? Math.min(paging.page, pageCount) : 1
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize)
  return (
    <>
      <div
        className="table-scroll"
        role="region"
        tabIndex={0}
        aria-label="Employee payroll breakdown"
      >
        <table className="employee-table payroll-table">
          <caption className="sr-only">
            Employee payroll amounts in Ethiopian Birr
          </caption>
          <thead>
            <tr>
              {[
                'Employee',
                'Department',
                'Gross (ETB)',
                'Income Tax',
                run
                  ? `Pension (${run.policy.pensionRate}%)`
                  : 'Employee Pension',
                'Other Deductions',
                'Net Salary',
                'Status',
                'Actions',
              ].map((label) => (
                <th scope="col" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.employeeId}>
                <td>
                  <strong>{row.employeeName}</strong>
                  <small>{row.employeeId}</small>
                </td>
                <td>{row.department}</td>
                <td className="money">{money(row.gross)}</td>
                <td className="money payroll-tax">{money(row.incomeTax)}</td>
                <td className="money payroll-pension">{money(row.pension)}</td>
                <td className="money">{money(row.otherDeductions)}</td>
                <td className="money payroll-net">{money(row.net)}</td>
                <td>
                  <PayrollStatus status={run.status} />
                </td>
                <td>
                  <button
                    className="button button-secondary payroll-payslip-button"
                    onClick={() => onPayslip(row)}
                    aria-label={`View payslip for ${row.employeeName}, ${row.employeeId}`}
                  >
                    <Icon name="file" size={15} />
                    Payslip
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <div className="empty-state">
          <Icon name="wallet" size={30} />
          <h3>
            {run ? 'No matching employees' : 'Payroll has not been generated'}
          </h3>
          <p>
            {run
              ? 'Try another name, ID, or department.'
              : 'Generate this month’s payroll to see salaries and deductions.'}
          </p>
        </div>
      )}
      {!!rows.length && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={rows.length}
          itemLabel="payroll records"
          onPageChange={(next) => setPaging({ key: filterKey, page: next })}
          onPageSizeChange={setPageSize}
        />
      )}
    </>
  )
}
