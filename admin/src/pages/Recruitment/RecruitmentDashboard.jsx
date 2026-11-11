import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import PostJobForm from '../../components/recruitment/PostJobForm.jsx'
import JobOpeningsTable from '../../components/recruitment/JobOpeningsTable.jsx'
import { JOB_STATUSES, jobRows } from '../../services/recruitment/recruitmentService.js'

export default function RecruitmentDashboard({ data, departments, search, onSearch, onSave, onToggleStatus, onNavigate, onDirtyChange }) {
  const [editing, setEditing] = useState(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const rows = jobRows(data, departments, search, status)
  const filtered = !!(search.trim() || status)

  function closeForm() {
    setEditing(null)
    onDirtyChange(false)
  }
  function toggleStatus(job) {
    try {
      onToggleStatus(job.id)
      setError('')
    } catch (failure) {
      setError(`${job.title}: ${failure.message} Edit the vacancy to update its details.`)
    }
  }

  return <div className="recruitment-page">
    <div className="employee-page-heading">
      <span className="icon-circle directory-heading-icon"><Icon name="briefcase" size={27} /></span>
      <div><h1>Job Postings &amp; Vacancies</h1><p>Create, edit, and close vacancies. Keep every application in one place.</p></div>
      <div className="recruitment-heading-actions">
        <button type="button" className="button button-secondary" onClick={() => onNavigate('applicants')}>Applications</button>
        <button type="button" className="button button-primary" onClick={() => setEditing({})}><Icon name="plus" size={18} />Post New Vacancy</button>
      </div>
    </div>
    <div className="card recruitment-filters">
      <label className="recruitment-search"><Icon name="search" size={19} /><span className="sr-only">Search job postings</span>
        <input type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search by job title or department…" aria-controls="job-postings-table" />
      </label>
      <label><span className="sr-only">Vacancy status</span><select value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="">All Vacancy Statuses</option>{JOB_STATUSES.map((value) => <option key={value}>{value}</option>)}
      </select></label>
      {filtered && <button type="button" className="button button-secondary" onClick={() => { onSearch(''); setStatus('') }}>Clear filters</button>}
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <section className="card recruitment-card" aria-label="Job postings">
      <JobOpeningsTable jobs={rows} onEdit={setEditing} onToggleStatus={toggleStatus} onViewApplicants={(id) => onNavigate('applicants', id)} />
      {!rows.length && <div className="empty-state"><Icon name="briefcase" size={32} />
        <h3>{filtered ? 'No matching vacancies' : 'No vacancies yet'}</h3>
        <p>{filtered ? 'Try another title, department, or status.' : 'Post your first vacancy to start recruiting.'}</p>
      </div>}
      <div className="recruitment-table-footer" role="status">{rows.length} of {data.jobs.length} vacancies</div>
    </section>
    {editing && <PostJobForm job={editing.id ? editing : null} departments={departments} onSave={(values) => { onSave(values); setError(''); onSearch(''); setStatus('') }}
      onClose={closeForm} onDirtyChange={onDirtyChange} />}
  </div>
}
