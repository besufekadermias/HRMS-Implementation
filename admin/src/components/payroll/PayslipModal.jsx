import Button from '../common/Button.jsx'
import Modal, { ModalActions } from '../common/Modal.jsx'
import Icon from '../common/Icon.jsx'
import PayrollStatus from './PayrollStatus.jsx'
import {
  monthLabel,
  getPolicyDeduction,
} from '../../services/operations/payrollCalculations.js'
import { printPayroll } from '../../services/operations/payrollExport.js'
import formatCurrency from '../../utils/formatters/formatCurrency.js'

export default function PayslipModal({ run, employee, onClose }) {
  const tax = getPolicyDeduction(run.policy, 'incomeTax')
  const pension = getPolicyDeduction(run.policy, 'pension')
  return (
    <Modal
      title="Employee Payslip"
      subtitle={`${monthLabel(run.month)} · ${employee.employeeId}`}
      onClose={onClose}
    >
      <div className="payroll-slip-person tw:flex tw:items-center tw:gap-[14px] tw:p-[6px_0_20px] tw:flex-wrap tw:[&>div]:flex-1
          tw:[&_p]:mt-[5px] tw:[&_p]:text-[#6e8c99] tw:[&_p]:text-[12px]">
        <span className="payroll-icon tw:inline-flex tw:items-center tw:justify-center tw:shrink-0 tw:rounded-full tw:w-[46px] tw:h-[46px]">
          <Icon name="users" size={25} />
        </span>
        <div>
          <h3>{employee.employeeName}</h3>
          <p>{employee.department}</p>
        </div>
        <PayrollStatus status={run.status} />
      </div>
      <dl className="payroll-summary-list tw:m-0 tw:p-[10px_22px] tw:[&>div]:flex tw:[&>div]:justify-between tw:[&>div]:gap-[16px]
            tw:[&>div]:p-[15px_0] tw:[&>div]:[border-bottom:1px_solid_#eaf2f4] tw:[&_dt]:text-[#587c8a]
            tw:[&_dt]:text-[12px] tw:[&_dd]:m-0 tw:[&_dd]:text-[#234f60] tw:[&_dd]:font-[600]
            tw:[&_dd]:tabular-nums tw:[&_dd]:text-right">
        {[
          ['Gross salary', employee.gross],
          [tax.name, employee.incomeTax],
          [
            pension.active && pension.kind === 'percent'
              ? `${pension.name} (${pension.value}%)`
              : pension.name,
            employee.pension,
          ],
          ...employee.deductionItems.map((item) => [item.name, item.amount]),
          ['Other deductions total', employee.otherDeductions],
          ['Net pay', employee.net],
        ].map(([label, value], index) => (
          <div key={`${index}:${label}`}>
            <dt>{label}</dt>
            <dd>{formatCurrency(value, { minimumFractionDigits: 2 })}</dd>
          </div>
        ))}
      </dl>
      <p className="payroll-field-hint tw:block tw:text-[10px] tw:font-normal tw:text-[var(--text-muted)] tw:mt-[7px]">
        Employer pension: {formatCurrency(employee.employerPension)}. This is
        separate from employee deductions.
      </p>
      <ModalActions >
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button
          onClick={() => printPayroll(run, employee)}
        >
          <Icon name="print" size={17} />
          Print / Save PDF
        </Button>
      </ModalActions>
    </Modal>
  )
}
