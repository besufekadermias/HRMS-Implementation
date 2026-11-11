import Icon from '../common/Icon.jsx'
import LeaveBalanceCard from './LeaveBalanceCard.jsx'
import formatDate from '../../utils/formatters/formatDate.js'

export default function LeaveRequestsTable({ rows, onAction, onEdit, maxBalance }) {
  return (
    <div className="table-scroll" role="region" aria-label="Leave request records" tabIndex={0}>
      <table className="employee-table leave-table" id="leave-requests-table">
        <caption className="sr-only">Employee leave requests, current entitlement balances, and HR decisions</caption>
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
              <td><strong className="leave-employee-name">{row.name}</strong><small className="leave-employee-id">{row.employeeId}</small></td>
              <td>{row.department}</td>
              <td className="leave-window"><time dateTime={row.startDate}>{formatDate(row.startDate)}</time><small>to <time dateTime={row.endDate}>{formatDate(row.endDate)}</time></small></td>
              <td><strong className="leave-days">{row.daysRequested} {row.daysRequested === 1 ? 'day' : 'days'}</strong></td>
              <td><LeaveBalanceCard balance={row.balance} maxBalance={maxBalance} /></td>
              <td>{row.reason || 'No reason provided'}</td>
              <td><span className={`leave-status leave-status-${row.status.toLowerCase()}`}>{row.status}</span></td>
              <td>{row.status === 'PENDING' ? (
                <div className="leave-row-actions">
                  <button className="button button-primary" onClick={() => onAction(row.id, 'APPROVED')}
                    aria-label={`Approve leave for ${row.name}, ${row.employeeId}`}><Icon name="check" size={14} />Approve</button>
                  <button className="button button-danger-outline" onClick={() => onAction(row.id, 'REJECTED')}
                    aria-label={`Reject leave for ${row.name}, ${row.employeeId}`}><Icon name="close" size={14} />Reject</button>
                  <button className="text-button" onClick={() => onEdit(row)}
                    aria-label={`Edit leave for ${row.name}, ${row.employeeId}`}><Icon name="edit" size={14} />Edit</button>
                </div>
              ) : <button className="button button-secondary leave-manage-button" onClick={() => onAction(row.id, 'PENDING')}
                aria-label={`Review and reopen leave for ${row.name}, ${row.employeeId}`}><Icon name="eye" size={14} />Manage</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
