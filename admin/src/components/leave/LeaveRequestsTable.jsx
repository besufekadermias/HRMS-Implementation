import Button, { TextButton } from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import LeaveBalanceCard from './LeaveBalanceCard.jsx'
import formatDate from '../../utils/formatters/formatDate.js'

export default function LeaveRequestsTable({ rows, onAction, onEdit, maxBalance }) {
  return (
    <div className="table-scroll tw:shared-base:overflow-x-auto tw:shared-base:[scrollbar-width:thin]
           tw:shared-base:[scrollbar-color:#c5dbd6_#f5f9f9]" role="region" aria-label="Leave request records" tabIndex={0}>
      <table className="employee-table leave-table tw:min-w-[1120px] tw:table-fixed tw:text-[12px] tw:[&_th]:p-[19px_16px]
          tw:[&_th]:text-[10px] tw:[&_th]:whitespace-normal tw:[&_th]:uppercase tw:[&_th]:leading-[1.6]
          tw:[&_td]:p-[23px_16px] tw:[&_td]:align-middle tw:[&_td]:[overflow-wrap:anywhere]
          tw:[&_th:nth-child(1)]:w-[14%] tw:[&_th:nth-child(2)]:w-[16%] tw:[&_th:nth-child(3)]:w-[12%]
          tw:[&_th:nth-child(4)]:w-[9%] tw:[&_th:nth-child(5)]:w-[15%] tw:[&_th:nth-child(5)]:bg-[#eaf5f1]
          tw:[&_th:nth-child(5)]:text-[#245e51] tw:[&_th:nth-child(6)]:w-[13%] tw:[&_th:nth-child(7)]:w-[10%]
          tw:[&_th:nth-child(8)]:w-[11%] tw:[&_td:nth-child(5)]:bg-[#f7fcfa] tw:[&_th:last-child]:text-right
          tw:[&_td:last-child]:text-right tw:shared-base:w-full tw:shared-base:border-collapse
          tw:shared-base:text-left tw:shared-base:text-[11px] tw:shared-base:[&_th]:text-[9px]
          tw:shared-base:[&_th]:tracking-[0.6px] tw:shared-base:[&_th]:font-[650]
          tw:shared-base:[&_th]:[color:#5c768a] tw:shared-base:[&_th]:[background:#f6f9fb]
          tw:shared-base:[&_th]:p-[13px_12px] tw:shared-base:[&_th]:whitespace-nowrap
          tw:shared-base:[&_th]:[border-bottom:1px_solid_#e6eff2]
          tw:shared-base:[&_th:first-child]:rounded-[5px_0_0_5px]
          tw:shared-base:[&_th:last-child]:rounded-[0_5px_5px_0] tw:shared-base:[&_td]:p-[12px]
          tw:shared-base:[&_td]:[border-bottom:1px_solid_#f0f4f6]
          tw:shared-base:[&_td]:[color:var(--text-secondary)] tw:shared-base:[&_td]:leading-[1.6]
          tw:shared-base:[&_tbody_tr:hover]:[background:#f9fcfb]
          tw:shared-base:[&_tbody_tr:last-child_td]:[border-bottom:0]
          tw:max-[768px]:shared-base:min-w-[870px]" id="leave-requests-table">
        <caption className="sr-only tw:sr-only">Employee leave requests, current entitlement balances, and HR decisions</caption>
        <thead>
          <tr>
            {['Employee', 'Department', 'Leave Window', 'Days Requested', 'Remaining Days Balance', 'Reason', 'Status', 'HR Action'].map((label) =>
              <th key={label} scope="col">{label}</th>,
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td><strong className="leave-employee-name tw:block tw:text-text-primary tw:text-[13px] tw:leading-[1.45]">{row.name}</strong><small className="leave-employee-id tw:block tw:mt-[2px] tw:[font:11px/1.5_Consolas,monospace]">{row.employeeId}</small></td>
              <td>{row.department}</td>
              <td className="leave-window tw:[&>time]:font-[600] tw:[&>time]:text-text-primary tw:[&_small]:block
          tw:[&_small]:text-[var(--text-muted)] tw:[&_small]:text-[11px]"><time dateTime={row.startDate}>{formatDate(row.startDate)}</time><small>to <time dateTime={row.endDate}>{formatDate(row.endDate)}</time></small></td>
              <td><strong className="leave-days tw:text-[15px] tw:text-text-primary">{row.daysRequested} {row.daysRequested === 1 ? 'day' : 'days'}</strong></td>
              <td><LeaveBalanceCard balance={row.balance} maxBalance={maxBalance} /></td>
              <td>{row.reason || 'No reason provided'}</td>
              <td><span className={`leave-status tw:inline-block tw:p-[3px_9px] tw:rounded-[20px] tw:text-[9px] tw:font-bold tw:whitespace-nowrap
          tw:[&.leave-status-approved]:bg-[#daf9e6] tw:[&.leave-status-approved]:text-[#08763d]
          tw:[&.leave-status-rejected]:bg-[#ffe3e8] tw:[&.leave-status-rejected]:text-[#b4213e]
          tw:[&.leave-status-pending]:bg-[#fff1d7] tw:[&.leave-status-pending]:text-[#916008] leave-status-${row.status.toLowerCase()}`}>{row.status}</span></td>
              <td>{row.status === 'PENDING' ? (
                <div className="leave-row-actions tw:flex tw:items-end tw:flex-col tw:gap-[6px] tw:[&_.button]:min-h-[32px]
          tw:[&_.button]:p-[5px_7px] tw:[&_.button]:gap-[4px] tw:[&_.button]:text-[10px]">
                  <Button onClick={() => onAction(row.id, 'APPROVED')}
                    aria-label={`Approve leave for ${row.name}, ${row.employeeId}`}><Icon name="check" size={14} />Approve</Button>
                  <Button variant="danger-outline" onClick={() => onAction(row.id, 'REJECTED')}
                    aria-label={`Reject leave for ${row.name}, ${row.employeeId}`}><Icon name="close" size={14} />Reject</Button>
                  <TextButton onClick={() => onEdit(row)}
                    aria-label={`Edit leave for ${row.name}, ${row.employeeId}`}><Icon name="edit" size={14} />Edit</TextButton>
                </div>
              ) : <Button variant="secondary" size="leave-manage" onClick={() => onAction(row.id, 'PENDING')}
                aria-label={`Review and reopen leave for ${row.name}, ${row.employeeId}`}><Icon name="eye" size={14} />Manage</Button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
