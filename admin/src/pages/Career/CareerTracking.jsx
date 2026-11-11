import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import CareerMilestoneModal from '../../components/career/CareerMilestoneModal.jsx'
import { careerRows } from '../../services/growth/careerService.js'
import formatDate from '../../utils/formatters/formatDate.js'

const statusLabels = { SCHEDULED: 'Scheduled', NEEDS_REVIEW: 'Needs review', CANCELLED: 'Cancelled', HISTORICAL: 'History only' }

export default function CareerTracking({ milestones, employees, grades, search, onSearch, onSave, onCancelScheduled, onDirtyChange }) {
  const [recording, setRecording] = useState(false)
  const [cancelling, setCancelling] = useState(null)
  const [cancelError, setCancelError] = useState('')
  const rows = careerRows(milestones, employees, search)
  function closeForm() { setRecording(false); onDirtyChange(false) }
  function cancelPlan() {
    try { onCancelScheduled(cancelling.id); setCancelling(null) }
    catch (error) { setCancelError(error.message || 'The scheduled change could not be cancelled.') }
  }

  return <div className="career-page">
    <div className="employee-page-heading">
      <span className="icon-circle directory-heading-icon career-heading-icon"><Icon name="trend" size={27} /></span>
      <div><h1>Career Milestones &amp; Promotions</h1><p>Track promotions, grade changes, and step increments with automatic salary adjustment.</p></div>
      <button type="button" className="button button-primary" onClick={() => setRecording(true)}><Icon name="plus" size={18} /> Record Promotion / Step</button>
    </div>
    {search.trim() && <div className="career-search-result" role="status"><span>{rows.length} milestone{rows.length === 1 ? '' : 's'} matching “{search}”</span>
      <button type="button" className="button button-secondary" onClick={() => onSearch('')}>Clear search</button></div>}
    <section className="card career-card" aria-label="Career milestones">
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Career milestone table">
        <table className="employee-table career-table" id="career-table">
          <caption className="sr-only">Career milestones and promotions, newest effective date first</caption>
          <thead><tr><th scope="col">Employee</th><th scope="col">Milestone type</th><th scope="col">Previous<br />grade</th><th scope="col">New<br />grade</th><th scope="col">Effective<br />date</th><th scope="col">Description</th></tr></thead>
          <tbody>{rows.map((item) => <tr key={item.id}>
            <td><strong className="career-employee">{item.employeeName}</strong><span className="career-employee-id">{item.employeeId}</span></td>
            <td><span className={`career-type career-type-${item.milestoneType.toLowerCase()}`}>{item.typeLabel}</span></td>
            <td>{item.previousGradeName || 'N/A'}</td>
            <td><strong className="career-promoted-grade">{item.newGradeName || 'Unchanged'}</strong></td>
            <td className="career-effective-date"><time dateTime={item.effectiveDate}>{formatDate(item.effectiveDate, { month: '2-digit', day: '2-digit' })}</time>
              {statusLabels[item.status] && <span className={`career-status career-status-${item.status.toLowerCase()}`}>{statusLabels[item.status]}</span>}
              {['SCHEDULED', 'NEEDS_REVIEW'].includes(item.status) && <button type="button" className="career-cancel-plan" aria-label={`Cancel scheduled change for ${item.employeeName} (${item.employeeId}) on ${item.effectiveDate}`}
                onClick={() => { setCancelling(item); setCancelError('') }}>Cancel plan</button>}
            </td>
            <td className="career-description">{item.description}{item.reviewReason && <p className="career-review-reason">{item.reviewReason}</p>}</td>
          </tr>)}</tbody>
        </table>
      </div>
      {!rows.length && <div className="empty-state"><Icon name="trend" size={32} /><h3>{search.trim() ? 'No matching career milestones' : 'No career milestones yet'}</h3>
        <p>{search.trim() ? 'Try another employee, milestone type, or grade.' : 'Record a promotion, step increment, grade change, or achievement.'}</p>
        <button type="button" className="button button-secondary" onClick={() => search.trim() ? onSearch('') : setRecording(true)}>{search.trim() ? 'Clear search' : 'Record Promotion / Step'}</button>
      </div>}
    </section>
    {recording && <CareerMilestoneModal milestones={milestones} employees={employees} grades={grades} onSave={onSave} onClose={closeForm} onDirtyChange={onDirtyChange} />}
    {cancelling && <ConfirmationModal title="Cancel scheduled milestone?" confirmLabel="Cancel Plan" onCancel={() => setCancelling(null)} onConfirm={cancelPlan}>
      <p>Cancel the planned change for <strong>{cancelling.employeeName}</strong> on {formatDate(cancelling.effectiveDate)}? The cancelled milestone will remain in history, and their current grade and salary will stay unchanged.</p>
      {cancelError && <p className="form-error" role="alert">{cancelError}</p>}
    </ConfirmationModal>}
  </div>
}
