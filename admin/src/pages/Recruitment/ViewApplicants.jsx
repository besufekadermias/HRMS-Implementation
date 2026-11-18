import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
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
    <div className="recruitment-page-heading tw:flex tw:items-center tw:flex-wrap tw:gap-[13px] tw:mb-[23px] tw:[&>div]:min-w-0
           tw:[&>div]:flex-1 tw:[&>.recruitment-heading-actions]:flex-[0_0_auto] tw:[&_h1]:text-[27px]
           tw:[&_h1]:tracking-[-0.6px] tw:[&_p]:text-[var(--text-muted)] tw:[&_p]:text-[12px]
           tw:[&_p]:leading-[1.7] tw:[&_p]:mt-[4px] tw:[&>.button]:shrink-0 tw:[@media(width<768px)]:gap-[11px]
           tw:[@media(560px<=width<768px)]:[&_h1]:text-[24px] tw:[@media(width<768px)]:[&_p]:text-[11px]
           tw:[@media(width<768px)]:[&>.button]:ml-auto tw:[@media(width<560px)]:[&_h1]:text-[22px]">
      <span className="recruitment-heading-icon tw:inline-flex tw:items-center tw:justify-center tw:shrink-0 tw:rounded-full tw:w-[49px]
          tw:h-[49px] tw:bg-[#d8f8ee] tw:text-[#05695c]"><Icon name="file" size={27} /></span>
      <div><h1>Candidate Applications</h1><p>Review candidate details and credentials, then shortlist suitable applicants for interview.</p></div>
      <Button variant="secondary" type="button" onClick={() => onNavigate('recruitment')}><Icon name="briefcase" size={18} />Job Postings</Button>
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
          tw:[&_input]:p-[12px_0] tw:[&_input]:bg-transparent tw:[&_input]:text-text-primary"><Icon name="search" size={19} /><span className="tw:sr-only">Search candidate applications</span>
        <input type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search by candidate name, national ID, or position…" aria-controls="applications-table" />
      </label>
      <label><span className="tw:sr-only">Applied vacancy</span><select value={jobId} onChange={(event) => setJobId(event.target.value)}>
        <option value="">All Vacancies</option>
        {jobId && !data.jobs.some((job) => job.id === jobId) && <option value={jobId}>Vacancy unavailable</option>}
        {data.jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
      </select></label>
      <label><span className="tw:sr-only">Application status</span><select value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="">All Application Statuses</option>{APPLICATION_STATUSES.map((value) => <option key={value}>{value}</option>)}
      </select></label>
      {filtered && <Button variant="secondary" type="button" onClick={() => { onSearch(''); setStatus(''); setJobId('') }}>Clear filters</Button>}
    </Card>
    <Card className="recruitment-card tw:p-0 tw:overflow-hidden" aria-label="Candidate applications">
      <ApplicantsTable applications={rows} onView={setViewing} onDecide={(application, nextStatus) => { setDecision({ application, status: nextStatus }); setError('') }} />
      {!rows.length && <div className="recruitment-empty-state tw:flex tw:items-center tw:justify-center tw:flex-col tw:gap-[13px] tw:p-[35px_20px]
          tw:text-center tw:text-[var(--text-muted)] tw:[&_h3]:text-[17px] tw:[&_h3]:text-text-primary
          tw:[&_p]:text-[13px] tw:[&_p]:max-w-[470px] tw:[&_p]:leading-[1.8]"><Icon name="users" size={32} />
        <h3>{filtered ? 'No matching applications' : 'No applications yet'}</h3>
        <p>{filtered ? 'Try a different candidate, vacancy, or status.' : 'Candidate applications will appear here when received.'}</p>
      </div>}
      <div className="recruitment-table-footer tw:p-[14px_20px] tw:[border-top:1px_solid_var(--border)] tw:text-[var(--text-muted)]
          tw:text-[11px]" role="status">{rows.length} of {data.applications.length} applications</div>
    </Card>
    {viewing && <ApplicantProfileModal application={viewing} onClose={() => setViewing(null)} />}
    {decision && <ConfirmationModal title={decision.status === 'SHORTLISTED' ? 'Shortlist Candidate for Interview?' : 'Reject Application?'}
      confirmLabel={decision.status === 'SHORTLISTED' ? 'Shortlist for Interview' : 'Reject Application'} onCancel={() => setDecision(null)} onConfirm={confirmDecision}>
      <p>{decision.status === 'SHORTLISTED' ? 'Shortlist' : 'Reject'} <strong>{decision.application.fullName}</strong> for <strong>{decision.application.jobTitle}</strong>{decision.status === 'SHORTLISTED' ? ' for an interview' : ''}?</p>
      {decision.status === 'SHORTLISTED' && <p>Arrange the interview separately. Shortlisting does not confirm employment or send an invitation.</p>}
      {error && <p className="recruitment-form-error tw:mt-[16px] tw:text-[13px] tw:rounded-[5px] tw:p-[10px_12px] tw:leading-[1.6]
          tw:text-[#b42344] tw:bg-[#fff0f3]" role="alert">{error}</p>}
    </ConfirmationModal>}
  </div>
}
