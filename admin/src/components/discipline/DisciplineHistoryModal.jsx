import Button from '../common/Button.jsx'
import Modal, { ModalActions } from '../common/Modal.jsx'
import Icon from '../common/Icon.jsx'
import formatDate from '../../utils/formatters/formatDate.js'

const eventTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Nairobi', dateStyle: 'medium', timeStyle: 'short',
})

export default function DisciplineHistoryModal({ history, onClose }) {
  return (
    <Modal title="Disciplinary Activity History" subtitle="Recorded and deleted entries in this workspace session. Times shown in Nairobi time." onClose={onClose}>
      {history.length ? <ol className="discipline-history tw:list-none tw:p-[0] tw:m-[0] tw:[&_li]:flex tw:[&_li]:items-start tw:[&_li]:gap-[12px]
          tw:[&_li]:p-[18px_0] tw:[&_li]:[border-bottom:1px_solid_var(--divider)] tw:[&_li:first-child]:pt-[0]
          tw:[&_li_>_div]:flex-1 tw:[&_li_>_div]:min-w-0 tw:[&_small]:text-[11px]
          tw:[&_small]:[color:var(--text-muted)] tw:[&_p]:text-[12px] tw:[&_p]:leading-[1.7]
          tw:[&_p]:[color:var(--text-secondary)] tw:[&_p]:[overflow-wrap:anywhere]
          tw:[&_.discipline-history-description]:whitespace-pre-wrap
          tw:[&_.discipline-history-description]:mt-[6px]">
        {history.map((entry) => <li key={entry.id}>
          <span className={`discipline-history-icon${entry.action === "Deleted" ? " is-deleted" : ""} tw:grid tw:place-items-center tw:w-[34px] tw:h-[34px] tw:rounded-[50%] tw:shrink-0 tw:[color:var(--primary)]
          tw:[background:#e0f5ed] tw:[&.is-deleted]:[color:#b42344] tw:[&.is-deleted]:[background:#ffe8ee] `}>
            <Icon name={entry.action === 'Deleted' ? 'trash' : 'file'} size={18} />
          </span>
          <div>
            <div className="discipline-history-heading tw:flex tw:gap-[10px] tw:flex-wrap tw:justify-between tw:mb-[6px]
          tw:[&_time]:text-[11px] tw:[&_time]:[color:var(--text-muted)]"><strong>{entry.action}</strong><time dateTime={entry.at}>{eventTime.format(new Date(entry.at))}</time></div>
            <p><strong>{entry.record.employeeName}</strong> · {entry.record.employeeId}</p>
            <p>{entry.record.violationType} · {entry.record.penaltyAction} · Incident {formatDate(entry.record.incidentDate)}</p>
            <p>{entry.record.department}</p>
            {entry.record.description && <p className="discipline-history-description">{entry.record.description}</p>}
            {entry.reason && <small>{entry.reason}</small>}
          </div>
        </li>)}
      </ol> : <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]"><Icon name="clock" size={30} /><h3>No activity yet</h3><p>New records and deletions will appear here.</p></div>}
      <ModalActions ><Button variant="secondary" type="button" onClick={onClose}>Close</Button></ModalActions>
    </Modal>
  )
}
