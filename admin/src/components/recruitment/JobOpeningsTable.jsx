import Icon from '../common/Icon.jsx'
import ApplicationStatusBadge from './ApplicationStatusBadge.jsx'
import formatDate from '../../utils/formatters/formatDate.js'
import { todayInNairobi } from '../../utils/validation/validators.js'

export default function JobOpeningsTable({ jobs, onEdit, onToggleStatus, onViewApplicants }) {
  const today = todayInNairobi()
  return <div className="table-scroll" tabIndex={0} role="region" aria-label="Job postings table">
    <table className="employee-table recruitment-table jobs-table" id="job-postings-table">
      <caption className="sr-only">Job postings, departments, application deadlines, and applicant counts</caption>
      <thead><tr>
        <th scope="col">Title</th><th scope="col">Department</th><th scope="col">Deadline</th>
        <th scope="col">Applicants</th><th scope="col">Status</th><th scope="col">Actions</th>
      </tr></thead>
      <tbody>{jobs.map((job) => <tr key={job.id}>
        <td><strong>{job.title}</strong><span className="recruitment-description">{job.description}</span></td>
        <td>{job.department}</td>
        <td><time dateTime={job.deadline}>{formatDate(job.deadline)}</time>
          {job.status === 'OPEN' && job.deadline < today && <small className="recruitment-overdue">Deadline passed</small>}
        </td>
        <td><button type="button" className="recruitment-count" onClick={() => onViewApplicants(job.id)}
          aria-label={`View ${job.applicantCount} applications for ${job.title}`}>{job.applicantCount} applied</button></td>
        <td><button type="button" className="recruitment-status-toggle" onClick={() => onToggleStatus(job)}
          aria-label={`${job.status === 'OPEN' ? 'Close' : 'Reopen'} ${job.title}`}>
          <ApplicationStatusBadge status={job.status} /><small>{job.status === 'OPEN' ? 'Close vacancy' : 'Reopen vacancy'}</small>
        </button></td>
        <td><button type="button" className="icon-button recruitment-edit" onClick={() => onEdit(job)} aria-label={`Edit ${job.title}`}>
          <Icon name="edit" size={18} /></button></td>
      </tr>)}</tbody>
    </table>
  </div>
}
