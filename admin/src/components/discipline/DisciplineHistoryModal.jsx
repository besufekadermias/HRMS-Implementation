import Modal from '../common/Modal.jsx'
import Icon from '../common/Icon.jsx'
import formatDate from '../../utils/formatters/formatDate.js'

const eventTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Nairobi', dateStyle: 'medium', timeStyle: 'short',
})

export default function DisciplineHistoryModal({ history, onClose }) {
  return (
    <Modal title="Disciplinary Activity History" subtitle="Recorded and deleted entries in this workspace session. Times shown in Nairobi time." onClose={onClose}>
      {history.length ? <ol className="discipline-history">
        {history.map((entry) => <li key={entry.id}>
          <span className={`discipline-history-icon${entry.action === 'Deleted' ? ' is-deleted' : ''}`}>
            <Icon name={entry.action === 'Deleted' ? 'trash' : 'file'} size={18} />
          </span>
          <div>
            <div className="discipline-history-heading"><strong>{entry.action}</strong><time dateTime={entry.at}>{eventTime.format(new Date(entry.at))}</time></div>
            <p><strong>{entry.record.employeeName}</strong> · {entry.record.employeeId}</p>
            <p>{entry.record.violationType} · {entry.record.penaltyAction} · Incident {formatDate(entry.record.incidentDate)}</p>
            <p>{entry.record.department}</p>
            {entry.record.description && <p className="discipline-history-description">{entry.record.description}</p>}
            {entry.reason && <small>{entry.reason}</small>}
          </div>
        </li>)}
      </ol> : <div className="empty-state"><Icon name="clock" size={30} /><h3>No activity yet</h3><p>New records and deletions will appear here.</p></div>}
      <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  )
}
