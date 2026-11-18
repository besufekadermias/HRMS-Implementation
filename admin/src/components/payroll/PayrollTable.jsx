import Button from '../common/Button.jsx'
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
        className="payroll-table-scroll tw:overflow-x-auto tw:[scrollbar-width:thin] tw:[scrollbar-color:#c5dbd6_#f5f9f9]"
        role="region"
        tabIndex={0}
        aria-label="Employee payroll breakdown"
      >
        <table className="payroll-data-table tw:w-full tw:border-collapse tw:text-left tw:text-[11px] tw:[&_th]:tracking-[0.6px]
          tw:[&_th]:font-[650] tw:[&_th]:whitespace-nowrap tw:[&_th]:[border-bottom:1px_solid_#e6eff2]
          tw:[&_th:first-child]:rounded-[5px_0_0_5px] tw:[&_th:last-child]:rounded-[0_5px_5px_0]
          tw:[&_td]:[border-bottom:1px_solid_#f0f4f6] tw:[&_td]:text-text-secondary
          tw:[&_tbody_tr:hover]:bg-[#f9fcfb] tw:[&_tbody_tr:last-child_td]:border-b-0 tw:[&_td]:leading-[1.6]
          payroll-table tw:min-w-[1110px] tw:w-full tw:[&_td]:p-[19px_17px] tw:[&_td]:align-middle
          tw:[&_td]:text-[12px] tw:[&_th]:p-[17px] tw:[&_th]:text-[11px] tw:[&_th]:normal-case
          tw:[&_th]:bg-[#f1fafc] tw:[&_th]:text-[#325c71] tw:[&_td:first-child]:min-w-[155px]
          tw:[&_td:nth-child(2)]:max-w-[205px] tw:[&_td:nth-child(2)]:min-w-[140px]
          tw:[&_td:nth-child(2)]:leading-[1.65] tw:[&_small]:block tw:[&_small]:text-[#829ba8]
          tw:[&_small]:mt-[5px] tw:[&_small]:text-[11px]">
          <caption className="tw:sr-only">
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
                <td className="money tw:tabular-nums tw:whitespace-nowrap tw:text-right">{money(row.gross)}</td>
                <td className="money payroll-tax tw:tabular-nums tw:whitespace-nowrap tw:text-right tw:text-[#d86070]">{money(row.incomeTax)}</td>
                <td className="money payroll-pension tw:tabular-nums tw:whitespace-nowrap tw:text-right tw:text-[#ba8a24]">{money(row.pension)}</td>
                <td className="money tw:tabular-nums tw:whitespace-nowrap tw:text-right">{money(row.otherDeductions)}</td>
                <td className="money payroll-net tw:tabular-nums tw:whitespace-nowrap tw:text-right tw:text-[#078573] tw:font-bold">{money(row.net)}</td>
                <td>
                  <PayrollStatus status={run.status} />
                </td>
                <td>
                  <Button variant="secondary" size="payslip"
                    onClick={() => onPayslip(row)}
                    aria-label={`View payslip for ${row.employeeName}, ${row.employeeId}`}
                  >
                    <Icon name="file" size={15} />
                    Payslip
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <div className="payroll-empty-state tw:flex tw:items-center tw:justify-center tw:flex-col tw:gap-[13px] tw:p-[35px_20px]
          tw:text-center tw:text-[var(--text-muted)] tw:[&_h3]:text-[17px] tw:[&_h3]:text-text-primary
          tw:[&_p]:text-[13px] tw:[&_p]:max-w-[470px] tw:[&_p]:leading-[1.8]">
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
