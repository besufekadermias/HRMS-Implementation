import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
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
    <div className="recruitment-page-heading tw:flex tw:items-center tw:flex-wrap tw:gap-[13px] tw:mb-[23px] tw:[&>div]:min-w-0
           tw:[&>div]:flex-1 tw:[&>.recruitment-heading-actions]:flex-[0_0_auto] tw:[&_h1]:text-[27px]
           tw:[&_h1]:tracking-[-0.6px] tw:[&_p]:text-[var(--text-muted)] tw:[&_p]:text-[12px]
           tw:[&_p]:leading-[1.7] tw:[&_p]:mt-[4px] tw:[&>.button]:shrink-0 tw:[@media(width<768px)]:gap-[11px]
           tw:[@media(560px<=width<768px)]:[&_h1]:text-[24px] tw:[@media(width<768px)]:[&_p]:text-[11px]
           tw:[@media(width<768px)]:[&>.button]:ml-auto tw:[@media(width<560px)]:[&_h1]:text-[22px]">
      <span className="recruitment-heading-icon tw:inline-flex tw:items-center tw:justify-center tw:shrink-0 tw:rounded-full tw:w-[49px]
          tw:h-[49px] tw:bg-[#d8f8ee] tw:text-[#05695c]"><Icon name="briefcase" size={27} /></span>
      <div><h1>Job Postings &amp; Vacancies</h1><p>Create, edit, and close vacancies. Keep every application in one place.</p></div>
      <div className="recruitment-heading-actions tw:flex tw:flex-wrap tw:gap-[10px] tw:ml-auto tw:[@media(width<=700px)]:w-full
          tw:[@media(width<=700px)]:ml-0">
        <Button variant="secondary" type="button" onClick={() => onNavigate('applicants')}>Applications</Button>
        <Button type="button" onClick={() => setEditing({})}><Icon name="plus" size={18} />Post New Vacancy</Button>
      </div>
    </div>
    <Card as="div" className="recruitment-filters tw:flex tw:flex-wrap tw:items-center tw:gap-[12px] tw:p-[18px] tw:mb-[24px]
          tw:[&>label]:min-w-0 tw:[&_select]:min-h-[42px] tw:[&_select]:max-w-[235px] tw:[&_select]:p-[8px_12px]
          tw:[&_select]:[border:1px_solid_var(--border)] tw:[&_select]:rounded-[8px] tw:[&_select]:bg-surface
          tw:[&_select]:text-text-primary tw:[&_select]:text-[12px]
          tw:[@media(width<=700px)]:[&>label]:flex-[1_1_100%] tw:[@media(width<=700px)]:[&_select]:w-full
          tw:[@media(width<=700px)]:[&_select]:max-w-none">
      <label className="recruitment-search tw:flex tw:items-center tw:gap-[10px] tw:flex-[1_1_280px] tw:[border:1px_solid_var(--border)]
          tw:rounded-[8px] tw:p-[0_12px] tw:text-[var(--text-muted)]
          tw:focus-within:[outline:2px_solid_var(--primary)] tw:focus-within:outline-offset-[2px]
          tw:[&_input]:[border:0] tw:[&_input]:[outline:0] tw:[&_input]:w-full tw:[&_input]:min-w-0
          tw:[&_input]:p-[12px_0] tw:[&_input]:bg-transparent tw:[&_input]:text-text-primary"><Icon name="search" size={19} /><span className="tw:sr-only">Search job postings</span>
        <input type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search by job title or department…" aria-controls="job-postings-table" />
      </label>
      <label><span className="tw:sr-only">Vacancy status</span><select value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="">All Vacancy Statuses</option>{JOB_STATUSES.map((value) => <option key={value}>{value}</option>)}
      </select></label>
      {filtered && <Button variant="secondary" type="button" onClick={() => { onSearch(''); setStatus('') }}>Clear filters</Button>}
    </Card>
    {error && <p className="recruitment-form-error tw:mt-[16px] tw:text-[13px] tw:rounded-[5px] tw:p-[10px_12px] tw:leading-[1.6]
          tw:text-[#b42344] tw:bg-[#fff0f3]" role="alert">{error}</p>}
    <Card className="recruitment-card tw:p-0 tw:overflow-hidden" aria-label="Job postings">
      <JobOpeningsTable jobs={rows} onEdit={setEditing} onToggleStatus={toggleStatus} onViewApplicants={(id) => onNavigate('applicants', id)} />
      {!rows.length && <div className="recruitment-empty-state tw:flex tw:items-center tw:justify-center tw:flex-col tw:gap-[13px] tw:p-[35px_20px]
          tw:text-center tw:text-[var(--text-muted)] tw:[&_h3]:text-[17px] tw:[&_h3]:text-text-primary
          tw:[&_p]:text-[13px] tw:[&_p]:max-w-[470px] tw:[&_p]:leading-[1.8]"><Icon name="briefcase" size={32} />
        <h3>{filtered ? 'No matching vacancies' : 'No vacancies yet'}</h3>
        <p>{filtered ? 'Try another title, department, or status.' : 'Post your first vacancy to start recruiting.'}</p>
      </div>}
      <div className="recruitment-table-footer tw:p-[14px_20px] tw:[border-top:1px_solid_var(--border)] tw:text-[var(--text-muted)]
          tw:text-[11px]" role="status">{rows.length} of {data.jobs.length} vacancies</div>
    </Card>
    {editing && <PostJobForm job={editing.id ? editing : null} departments={departments} onSave={async (values) => { await onSave(values); setError(''); onSearch(''); setStatus('') }}
      onClose={closeForm} onDirtyChange={onDirtyChange} />}
  </div>
}
