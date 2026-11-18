import { TextButton } from '../common/Button.jsx'
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
      className="payroll-table-scroll tw:overflow-x-auto tw:[scrollbar-width:thin] tw:[scrollbar-color:#c5dbd6_#f5f9f9]"
      role="region"
      tabIndex={0}
      aria-label="Payroll deductions"
    >
      <table className="payroll-data-table tw:w-full tw:border-collapse tw:text-left tw:text-[11px] tw:[&_th]:tracking-[0.6px]
          tw:[&_th]:font-[650] tw:[&_th]:whitespace-nowrap tw:[&_th]:[border-bottom:1px_solid_#e6eff2]
          tw:[&_th:first-child]:rounded-[5px_0_0_5px] tw:[&_th:last-child]:rounded-[0_5px_5px_0]
          tw:[&_td]:[border-bottom:1px_solid_#f0f4f6] tw:[&_td]:text-text-secondary
          tw:[&_tbody_tr:hover]:bg-[#f9fcfb] tw:[&_tbody_tr:last-child_td]:border-b-0 tw:[&_th]:text-[#5c768a]
          tw:[&_th]:p-[13px_12px] payroll-deductions-table tw:min-w-[780px] tw:[&_td]:text-[12px]
          tw:[&_td]:leading-[1.5] tw:[&_td]:p-[19px_15px] tw:[&_th]:bg-[#f1fafc] tw:[&_th]:text-[11px]">
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
                <span className="payroll-deduction-name tw:flex tw:items-center tw:gap-[9px] tw:min-w-[120px] tw:[&_.payroll-icon]:w-[35px]
          tw:[&_.payroll-icon]:h-[35px] tw:[&_.payroll-icon]:flex-[0_0_35px]">
                  <span className="payroll-icon tw:inline-flex tw:items-center tw:justify-center tw:shrink-0 tw:rounded-full tw:w-[46px] tw:h-[46px]
          payroll-tone-amber tw:[&.payroll-tone-green]:text-[#0b8972] tw:[&.payroll-tone-green]:bg-[#e3f5f0]
          tw:[&.payroll-tone-amber]:text-[#a36b0d] tw:[&.payroll-tone-amber]:bg-[#fff5dd]
          tw:[&.payroll-tone-blue]:text-[#4b8397] tw:[&.payroll-tone-blue]:bg-[#eaf2f7]
          tw:[&.payroll-tone-lavender]:text-[#7566ba] tw:[&.payroll-tone-lavender]:bg-[#f0edfb]">
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
                  className={`payroll-status ${item.active ? "payroll-status-paid" : "payroll-status-inactive"} tw:inline-block tw:text-[10px] tw:font-[600] tw:rounded-[30px] tw:p-[7px_10px] tw:whitespace-nowrap
          tw:tracking-[0.05px] tw:[&.payroll-status-paid]:bg-[#c9fae9] tw:[&.payroll-status-paid]:text-[#087b67]
          tw:[&.payroll-status-inactive]:bg-[#edf1f3] tw:[&.payroll-status-inactive]:text-[#6f818d] `}
                >
                  {item.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div
                  className="payroll-row-actions tw:flex tw:items-center tw:flex-wrap tw:gap-[4px_12px] tw:min-w-[210px]
          tw:[&_.text-button]:inline-flex tw:[&_.text-button]:items-center tw:[&_.text-button]:gap-[5px]
          tw:[&_.text-button]:min-h-[32px] tw:[&_.text-button]:text-[11px]
          tw:[&_.payroll-delete-button]:text-[#ba3b53]"
                  role="group"
                  aria-label={`Actions for ${item.name}`}
                >
                  <TextButton
                    type="button"
                    disabled={locked || busy}
                    onClick={() => onEdit(item)}
                    aria-label={`Edit ${item.name}`}
                  >
                    <Icon name="edit" size={17} />
                    Edit
                  </TextButton>
                  <TextButton
                    type="button"
                    className="payroll-delete-button"
                    disabled={locked || busy}
                    onClick={() => onDelete(item)}
                    aria-label={`Delete ${item.name}`}
                  >
                    <Icon name="trash" size={16} />
                    Delete
                  </TextButton>
                  <TextButton
                    type="button"
                    disabled={locked || busy}
                    onClick={() => onToggle(item)}
                    aria-label={`${item.active ? 'Deactivate' : 'Reactivate'} ${item.name}`}
                  >
                    {item.active ? 'Deactivate' : 'Reactivate'}
                  </TextButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
