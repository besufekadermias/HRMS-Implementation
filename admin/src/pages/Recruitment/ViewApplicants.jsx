import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import ApplicantsTable from '../../components/recruitment/ApplicantsTable.jsx'
import ApplicantProfileModal from '../../components/recruitment/ApplicantProfileModal.jsx'
import { APPLICATION_STATUSES, applicationRows } from '../../services/recruitment/recruitmentService.js'

export default function ViewApplicants({ data, departments, search, onSearch, initialJobId = '', onDecide, onNavigate }) {
  const [status, setStatus] = useState('')
  const [jobId, setJobId] = useState(initialJobId)
  const [viewing, setViewing] = useState(null)
  const [decision, setDecision] = useState(null)
  const [error, setError] = useState('')
  const rows = applicationRows(data, departments, search, status, jobId)
  const filtered = !!(search.trim() || status || jobId)

  function confirmDecision() {
    try {
      onDecide(decision.application.id, decision.status)
      setDecision(null)
      setError('')
    } catch (failure) {
      setError(failure.message || 'The decision could not be saved.')
    }
  }

  return <div className="recruitment-page">
    <div className="employee-page-heading">
      <span className="icon-circle directory-heading-icon"><Icon name="file" size={27} /></span>
      <div><h1>Candidate Applications</h1><p>Review candidate details and credentials, then shortlist suitable applicants for interview.</p></div>
      <button type="button" className="button button-secondary" onClick={() => onNavigate('recruitment')}><Icon name="briefcase" size={18} />Job Postings</button>
    </div>
    <div className="card recruitment-filters">
      <label className="recruitment-search"><Icon name="search" size={19} /><span className="sr-only">Search candidate applications</span>
        <input type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search by candidate name, national ID, or position…" aria-controls="applications-table" />
      </label>
      <label><span className="sr-only">Applied vacancy</span><select value={jobId} onChange={(event) => setJobId(event.target.value)}>
        <option value="">All Vacancies</option>
        {jobId && !data.jobs.some((job) => job.id === jobId) && <option value={jobId}>Vacancy unavailable</option>}
        {data.jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
      </select></label>
      <label><span className="sr-only">Application status</span><select value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="">All Application Statuses</option>{APPLICATION_STATUSES.map((value) => <option key={value}>{value}</option>)}
      </select></label>
      {filtered && <button type="button" className="button button-secondary" onClick={() => { onSearch(''); setStatus(''); setJobId('') }}>Clear filters</button>}
    </div>
    <section className="card recruitment-card" aria-label="Candidate applications">
      <ApplicantsTable applications={rows} onView={setViewing} onDecide={(application, nextStatus) => { setDecision({ application, status: nextStatus }); setError('') }} />
      {!rows.length && <div className="empty-state"><Icon name="users" size={32} />
        <h3>{filtered ? 'No matching applications' : 'No applications yet'}</h3>
        <p>{filtered ? 'Try a different candidate, vacancy, or status.' : 'Candidate applications will appear here when received.'}</p>
      </div>}
      <div className="recruitment-table-footer" role="status">{rows.length} of {data.applications.length} applications</div>
    </section>
    {viewing && <ApplicantProfileModal application={viewing} onClose={() => setViewing(null)} />}
    {decision && <ConfirmationModal title={decision.status === 'SHORTLISTED' ? 'Shortlist Candidate for Interview?' : 'Reject Application?'}
      confirmLabel={decision.status === 'SHORTLISTED' ? 'Shortlist for Interview' : 'Reject Application'} onCancel={() => setDecision(null)} onConfirm={confirmDecision}>
      <p>{decision.status === 'SHORTLISTED' ? 'Shortlist' : 'Reject'} <strong>{decision.application.fullName}</strong> for <strong>{decision.application.jobTitle}</strong>{decision.status === 'SHORTLISTED' ? ' for an interview' : ''}?</p>
      {decision.status === 'SHORTLISTED' && <p>Arrange the interview separately. Shortlisting does not confirm employment or send an invitation.</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </ConfirmationModal>}
  </div>
}
