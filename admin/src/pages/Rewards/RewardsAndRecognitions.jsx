import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import GrantRecognitionModal from '../../components/rewards/GrantRecognitionModal.jsx'
import { rewardRows } from '../../services/growth/rewardService.js'
import formatDate from '../../utils/formatters/formatDate.js'

export default function RewardsAndRecognitions({ rewards, employees, search, onSearch, onSave, onDelete, onDirtyChange }) {
  const [granting, setGranting] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const rows = rewardRows(rewards, employees, search)

  function closeForm() {
    setGranting(false)
    onDirtyChange(false)
  }
  function confirmDelete() {
    try {
      onDelete(removing.id)
      setRemoving(null)
      setDeleteError('')
    } catch (error) {
      setDeleteError(error.message || 'The recognition could not be deleted.')
    }
  }

  return (
    <div className="rewards-page">
      <div className="employee-page-heading">
        <span className="icon-circle directory-heading-icon rewards-heading-icon"><Icon name="award" size={27} /></span>
        <div>
          <h1>Rewards &amp; Recognitions</h1>
          <p>Institutional honors (Excellence, Innovation, Long Service, Punctuality) for outstanding IT staff.</p>
        </div>
        <button type="button" className="button button-primary" onClick={() => setGranting(true)}>
          <Icon name="plus" size={18} /> Grant Staff Recognition
        </button>
      </div>
      {search.trim() && <div className="rewards-search-result" role="status">
        <span>{rows.length} recognition{rows.length === 1 ? '' : 's'} matching “{search}”</span>
        <button type="button" className="button button-secondary" onClick={() => onSearch('')}>Clear search</button>
      </div>}
      <section className="card rewards-card" aria-label="Staff recognitions">
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Recognition table">
          <table className="employee-table rewards-table" id="rewards-table">
            <caption className="sr-only">Staff awards and recognitions, newest award date first</caption>
            <thead><tr>
              <th scope="col">Employee</th><th scope="col">Department</th><th scope="col">Award title</th>
              <th scope="col">Category</th><th scope="col">Award date</th><th scope="col">Description</th><th scope="col">Delete</th>
            </tr></thead>
            <tbody>
              {rows.map((reward) => <tr key={reward.id}>
                <td><strong className="recognition-employee">{reward.employeeName}</strong><span className="recognition-employee-id">{reward.employeeId}</span></td>
                <td>{reward.department}</td>
                <td><strong>{reward.title}</strong></td>
                <td><span className={`recognition-category recognition-category-${reward.category.toLowerCase()}`}>{reward.categoryLabel}</span></td>
                <td className="recognition-date"><time dateTime={reward.awardDate}>{formatDate(reward.awardDate, { month: '2-digit', day: '2-digit' })}</time></td>
                <td className="recognition-description">{reward.description || '—'}</td>
                <td><button type="button" className="icon-button recognition-delete"
                  aria-label={`Delete ${reward.title} for ${reward.employeeName} (${reward.employeeId})`}
                  onClick={() => { setRemoving(reward); setDeleteError('') }}><Icon name="trash" size={18} /></button></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        {!rows.length && <div className="empty-state">
          <Icon name="award" size={32} />
          <h3>{search.trim() ? 'No matching recognitions' : 'No recognitions yet'}</h3>
          <p>{search.trim() ? 'Try another employee, award title, department, or category.' : 'Celebrate a staff member’s contribution with their first award.'}</p>
          <button type="button" className="button button-secondary" onClick={() => search.trim() ? onSearch('') : setGranting(true)}>
            {search.trim() ? 'Clear search' : 'Grant Staff Recognition'}
          </button>
        </div>}
      </section>
      {granting && <GrantRecognitionModal employees={employees} onSave={onSave} onClose={closeForm} onDirtyChange={onDirtyChange} />}
      {removing && <ConfirmationModal title="Delete recognition?" destructive confirmLabel="Delete Recognition"
        onCancel={() => setRemoving(null)} onConfirm={confirmDelete}>
        <p>Delete <strong>{removing.title}</strong> for <strong>{removing.employeeName}</strong> ({removing.employeeId})? This cannot be undone.</p>
        {deleteError && <p className="form-error" role="alert">{deleteError}</p>}
      </ConfirmationModal>}
    </div>
  )
}
