import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import RecordDisciplinaryActionModal from '../../components/discipline/RecordDisciplinaryActionModal.jsx'
import DisciplineHistoryModal from '../../components/discipline/DisciplineHistoryModal.jsx'
import { disciplineRows } from '../../services/growth/disciplineService.js'
import formatDate from '../../utils/formatters/formatDate.js'

export default function DisciplineAndPenalties({ data, employees, search, onSearch, onSave, onDelete, onDirtyChange }) {
  const [recording, setRecording] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const rows = disciplineRows(data.records, employees, search)

  function closeForm() {
    setRecording(false)
    onDirtyChange(false)
  }
  function confirmDelete() {
    try {
      onDelete(removing.id)
      setRemoving(null)
      setDeleteError('')
    } catch (error) {
      setDeleteError(error.message || 'The record could not be deleted.')
    }
  }

  return (
    <div className="discipline-page">
      <div className="employee-page-heading">
        <span className="icon-circle directory-heading-icon discipline-heading-icon"><Icon name="alert-triangle" size={27} /></span>
        <div>
          <h1>Discipline &amp; Penalties Control</h1>
          <p>Official civil service sanctions (Warning, Fine, Suspension, Termination) with activity history.</p>
        </div>
        <button type="button" className="button button-discipline" onClick={() => setRecording(true)}>
          <Icon name="plus" size={18} /> Record Disciplinary Action
        </button>
      </div>
      {search.trim() && <div className="discipline-search-result" role="status">
        <span>{rows.length} record{rows.length === 1 ? '' : 's'} matching “{search}”</span>
        <button type="button" className="button button-secondary" onClick={() => onSearch('')}>Clear search</button>
      </div>}
      <section className="card discipline-card" aria-label="Disciplinary records">
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Disciplinary records table">
          <table className="employee-table discipline-table" id="discipline-table">
            <caption className="sr-only">Disciplinary records, newest incident date first</caption>
            <thead><tr>
              <th scope="col">Employee</th><th scope="col">Department</th><th scope="col">Incident<br />date</th>
              <th scope="col">Violation<br />type</th><th scope="col">Sanction<br />action</th><th scope="col">Description</th><th scope="col">Delete</th>
            </tr></thead>
            <tbody>
              {rows.map((record) => <tr key={record.id}>
                <td><strong className="discipline-employee">{record.employeeName}</strong><span className="discipline-employee-id">{record.employeeId}</span></td>
                <td>{record.department}</td>
                <td className="discipline-date"><time dateTime={record.incidentDate}>{formatDate(record.incidentDate, { month: '2-digit', day: '2-digit' })}</time></td>
                <td><strong>{record.violationType}</strong></td>
                <td><span className={`discipline-sanction discipline-sanction-${record.penaltyAction.toLowerCase()}`}>{record.sanctionLabel}</span></td>
                <td className="discipline-description">{record.description || '—'}</td>
                <td><button type="button" className="icon-button discipline-delete"
                  aria-label={`Delete ${record.violationType} for ${record.employeeName} (${record.employeeId})`}
                  onClick={() => { setRemoving(record); setDeleteError('') }}><Icon name="trash" size={18} /></button></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        {!rows.length && <div className="empty-state">
          <Icon name="shield" size={32} />
          <h3>{search.trim() ? 'No matching disciplinary records' : 'No disciplinary records'}</h3>
          <p>{search.trim() ? 'Try another employee, department, violation, or sanction.' : 'Recorded disciplinary actions will appear here.'}</p>
          <button type="button" className="button button-secondary" onClick={() => search.trim() ? onSearch('') : setRecording(true)}>
            {search.trim() ? 'Clear search' : 'Record Disciplinary Action'}
          </button>
        </div>}
      </section>
      <div className="discipline-history-action"><button type="button" className="button button-secondary" onClick={() => setShowHistory(true)}>
        <Icon name="clock" size={16} /> Activity History{data.history.length > 0 ? ` (${data.history.length})` : ''}
      </button></div>
      {recording && <RecordDisciplinaryActionModal employees={employees} onSave={onSave} onClose={closeForm} onDirtyChange={onDirtyChange} />}
      {removing && <ConfirmationModal title="Delete disciplinary record?" destructive confirmLabel="Delete Record"
        onCancel={() => setRemoving(null)} onConfirm={confirmDelete}>
        <p>Delete <strong>{removing.violationType}</strong> for <strong>{removing.employeeName}</strong> ({removing.employeeId})? The record will be removed from this list; its deletion will remain in activity history.</p>
        {deleteError && <p className="form-error" role="alert">{deleteError}</p>}
      </ConfirmationModal>}
      {showHistory && <DisciplineHistoryModal history={data.history} onClose={() => setShowHistory(false)} />}
    </div>
  )
}
