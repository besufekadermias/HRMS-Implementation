import Icon from '../common/Icon.jsx'
import formatCurrency from '../../utils/formatters/formatCurrency.js'

export default function DeductionsTable({
  deductions,
  locked,
  busy,
  onEdit,
  onToggle,
  onDelete,
}) {
  return (
    <div
      className="table-scroll"
      role="region"
      tabIndex={0}
      aria-label="Payroll deductions"
    >
      <table className="employee-table payroll-deductions-table">
        <thead>
          <tr>
            {[
              'Deduction Type',
              'Description',
              'Amount / Rate',
              'Applies To',
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
          {deductions.map((item) => (
            <tr key={item.id}>
              <td>
                <span className="payroll-deduction-name">
                  <span className="icon-circle tone-amber">
                    <Icon name={item.icon || 'wallet'} size={20} />
                  </span>
                  <strong>{item.name}</strong>
                </span>
              </td>
              <td>{item.description}</td>
              <td>
                {item.kind === 'automatic'
                  ? 'Payroll calculation'
                  : item.kind === 'percent'
                    ? `${item.value}% of gross salary`
                    : formatCurrency(item.value, { minimumFractionDigits: 2 })}
              </td>
              <td>
                {item.appliesTo === 'all'
                  ? 'All employees'
                  : `${item.employeeIds.length} selected employees`}
              </td>
              <td>
                <span
                  className={`payroll-status ${item.active ? 'payroll-status-paid' : 'payroll-status-inactive'}`}
                >
                  {item.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div
                  className="payroll-row-actions"
                  role="group"
                  aria-label={`Actions for ${item.name}`}
                >
                  <button
                    type="button"
                    className="text-button"
                    disabled={locked || busy}
                    onClick={() => onEdit(item)}
                    aria-label={`Edit ${item.name}`}
                  >
                    <Icon name="edit" size={17} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-button payroll-delete-button"
                    disabled={locked || busy}
                    onClick={() => onDelete(item)}
                    aria-label={`Delete ${item.name}`}
                  >
                    <Icon name="trash" size={16} />
                    Delete
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    disabled={locked || busy}
                    onClick={() => onToggle(item)}
                    aria-label={`${item.active ? 'Deactivate' : 'Reactivate'} ${item.name}`}
                  >
                    {item.active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
