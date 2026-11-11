import Modal from '../common/Modal.jsx'
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
      <div className="payroll-slip-person">
        <span className="icon-circle">
          <Icon name="users" size={25} />
        </span>
        <div>
          <h3>{employee.employeeName}</h3>
          <p>{employee.department}</p>
        </div>
        <PayrollStatus status={run.status} />
      </div>
      <dl className="payroll-summary-list">
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
      <p className="field-hint">
        Employer pension: {formatCurrency(employee.employerPension)}. This is
        separate from employee deductions.
      </p>
      <div className="modal-actions">
        <button className="button button-secondary" onClick={onClose}>
          Close
        </button>
        <button
          className="button button-primary"
          onClick={() => printPayroll(run, employee)}
        >
          <Icon name="print" size={17} />
          Print / Save PDF
        </button>
      </div>
    </Modal>
  )
}
