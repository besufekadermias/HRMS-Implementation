import { IconButton } from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import ApplicationStatusBadge from './ApplicationStatusBadge.jsx'
import formatDate from '../../utils/formatters/formatDate.js'
import { todayInNairobi } from '../../utils/validation/validators.js'

export default function JobOpeningsTable({ jobs, onEdit, onToggleStatus, onViewApplicants }) {
  const today = todayInNairobi()
  return <div className="recruitment-table-scroll tw:overflow-x-auto tw:[scrollbar-width:thin] tw:[scrollbar-color:#c5dbd6_#f5f9f9]" tabIndex={0} role="region" aria-label="Job postings table">
    <table className="recruitment-table tw:w-full tw:table-fixed tw:border-collapse tw:text-left tw:text-[11px] tw:[&_th]:p-[22px_16px]
          tw:[&_th]:uppercase tw:[&_th]:text-[10px] tw:[&_th]:tracking-[0.6px] tw:[&_th]:whitespace-normal
          tw:[&_th]:font-[650] tw:[&_th]:text-[#5c768a] tw:[&_th]:bg-[#f6f9fb]
          tw:[&_th]:[border-bottom:1px_solid_#e6eff2] tw:[&_th:first-child]:rounded-[5px_0_0_5px]
          tw:[&_th:last-child]:rounded-[0_5px_5px_0] tw:[&_td]:p-[22px_16px] tw:[&_td]:whitespace-normal
          tw:[&_td]:[overflow-wrap:anywhere] tw:[&_td]:leading-[1.6] tw:[&_td]:text-text-secondary
          tw:[&_td]:[border-bottom:1px_solid_#f0f4f6] tw:[&_tbody_tr:hover]:bg-[#f9fcfb]
          tw:[&_tbody_tr:last-child_td]:border-b-0 tw:[&_strong]:block tw:[&_strong]:text-text-primary
          tw:[&_strong]:font-[650] jobs-table tw:min-w-[780px] tw:[&_th:first-child]:w-[29%]
          tw:[&_th:nth-child(2)]:w-[21%] tw:[&_th:nth-child(3)]:w-[15%] tw:[&_th:nth-child(4)]:w-[12%]
          tw:[&_th:nth-child(5)]:w-[13%] tw:[&_th:last-child]:w-[10%]" id="job-postings-table">
      <caption className="tw:sr-only">Job postings, departments, application deadlines, and applicant counts</caption>
      <thead><tr>
        <th scope="col">Title</th><th scope="col">Department</th><th scope="col">Deadline</th>
        <th scope="col">Applicants</th><th scope="col">Status</th><th scope="col">Actions</th>
      </tr></thead>
      <tbody>{jobs.map((job) => <tr key={job.id}>
        <td><strong>{job.title}</strong><span className="recruitment-description tw:line-clamp-1 tw:text-[var(--text-muted)] tw:text-[12px]">{job.description}</span></td>
        <td>{job.department}</td>
        <td><time dateTime={job.deadline}>{formatDate(job.deadline)}</time>
          {job.status === 'OPEN' && job.deadline < today && <small className="recruitment-overdue tw:block tw:text-[#95620b] tw:text-[11px]">Deadline passed</small>}
        </td>
        <td><button type="button" className="recruitment-count tw:[border:0] tw:rounded-[5px] tw:p-[5px_9px] tw:text-[#21598c] tw:bg-[#edf5ff] tw:text-[12px]
          tw:font-[650] tw:cursor-pointer tw:hover:bg-[#ddeefe]" onClick={() => onViewApplicants(job.id)}
          aria-label={`View ${job.applicantCount} applications for ${job.title}`}>{job.applicantCount} applied</button></td>
        <td><button type="button" className="recruitment-status-toggle tw:[border:0] tw:p-0 tw:bg-transparent tw:cursor-pointer tw:[&_small]:block
          tw:[&_small]:mt-[4px] tw:[&_small]:text-[var(--text-muted)] tw:[&_small]:text-[10px]" onClick={() => onToggleStatus(job)}
          aria-label={`${job.status === 'OPEN' ? 'Close' : 'Reopen'} ${job.title}`}>
          <ApplicationStatusBadge status={job.status} /><small>{job.status === 'OPEN' ? 'Close vacancy' : 'Reopen vacancy'}</small>
        </button></td>
        <td><IconButton variant="edit" type="button" onClick={() => onEdit(job)} aria-label={`Edit ${job.title}`}>
          <Icon name="edit" size={18} /></IconButton></td>
      </tr>)}</tbody>
    </table>
  </div>
}
