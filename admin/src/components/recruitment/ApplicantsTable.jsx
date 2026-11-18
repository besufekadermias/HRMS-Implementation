import Button from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import ApplicationStatusBadge from './ApplicationStatusBadge.jsx'
import formatDate from '../../utils/formatters/formatDate.js'

export default function ApplicantsTable({ applications, onView, onDecide }) {
  return <div className="recruitment-table-scroll tw:overflow-x-auto tw:[scrollbar-width:thin] tw:[scrollbar-color:#c5dbd6_#f5f9f9]" tabIndex={0} role="region" aria-label="Candidate applications table">
    <table className="recruitment-table tw:w-full tw:table-fixed tw:border-collapse tw:text-left tw:text-[11px] tw:[&_th]:p-[22px_16px]
          tw:[&_th]:uppercase tw:[&_th]:text-[10px] tw:[&_th]:tracking-[0.6px] tw:[&_th]:whitespace-normal
          tw:[&_th]:font-[650] tw:[&_th]:text-[#5c768a] tw:[&_th]:bg-[#f6f9fb]
          tw:[&_th]:[border-bottom:1px_solid_#e6eff2] tw:[&_th:first-child]:rounded-[5px_0_0_5px]
          tw:[&_th:last-child]:rounded-[0_5px_5px_0] tw:[&_td]:p-[22px_16px] tw:[&_td]:whitespace-normal
          tw:[&_td]:[overflow-wrap:anywhere] tw:[&_td]:leading-[1.6] tw:[&_td]:text-text-secondary
          tw:[&_td]:[border-bottom:1px_solid_#f0f4f6] tw:[&_tbody_tr:hover]:bg-[#f9fcfb]
          tw:[&_tbody_tr:last-child_td]:border-b-0 tw:[&_strong]:block tw:[&_strong]:text-text-primary
          tw:[&_strong]:font-[650] applicants-table tw:min-w-[1120px] tw:[&_th:nth-child(1)]:w-[14%]
          tw:[&_th:nth-child(2)]:w-[8%] tw:[&_th:nth-child(3)]:w-[18%] tw:[&_th:nth-child(4)]:w-[18%]
          tw:[&_th:nth-child(5)]:w-[12%] tw:[&_th:nth-child(6)]:w-[10%] tw:[&_th:nth-child(7)]:w-[20%]" id="applications-table">
      <caption className="tw:sr-only">Candidate applications and HR review decisions, most recent first</caption>
      <thead><tr>
        <th scope="col">Applicant full name</th><th scope="col">National ID</th><th scope="col">Applied job title</th>
        <th scope="col">Contact info</th><th scope="col">Credentials</th><th scope="col">Status</th><th scope="col">HR review decision</th>
      </tr></thead>
      <tbody>{applications.map((application) => <tr key={application.id}>
        <td><strong>{application.fullName}</strong><small className="recruitment-detail tw:block tw:text-[var(--text-muted)] tw:text-[11px] tw:leading-[1.6]">Applied {formatDate(application.appliedDate)}</small></td>
        <td>{application.nationalId || 'Not supplied'}</td>
        <td><strong>{application.jobTitle}</strong><small className="recruitment-detail tw:block tw:text-[var(--text-muted)] tw:text-[11px] tw:leading-[1.6]">{application.department}</small></td>
        <td><span className="recruitment-contact tw:flex tw:items-start tw:gap-[7px] tw:[&_svg]:shrink-0 tw:[&_svg]:mt-[4px]"><Icon name="mail" size={15} />{application.email}</span><span className="recruitment-detail tw:block tw:text-[var(--text-muted)] tw:text-[11px] tw:leading-[1.6]">{application.phone}</span></td>
        <td><button type="button" className="recruitment-document tw:[border:0] tw:rounded-[5px] tw:p-[5px_9px] tw:text-[#21598c] tw:bg-[#edf5ff] tw:text-[12px]
          tw:font-[650] tw:cursor-pointer tw:hover:bg-[#ddeefe] tw:inline-flex tw:items-center tw:gap-[6px]
          tw:[&_svg]:shrink-0" onClick={() => onView(application)} aria-label={`View credentials for ${application.fullName}, ${application.jobTitle}`}>
          <Icon name="file" size={16} />View CV / Cert</button></td>
        <td><ApplicationStatusBadge status={application.status} /></td>
        <td>{['PENDING', 'SHORTLISTED'].includes(application.status) ? <div className="recruitment-decisions tw:flex tw:flex-wrap tw:gap-[7px] tw:[&_.button]:min-h-[30px] tw:[&_.button]:p-[5px_9px]
          tw:[&_.button]:text-[11px] tw:[&_.button]:gap-[5px] tw:[&_.button]:whitespace-nowrap">
          {application.status === 'PENDING' ? <Button type="button" onClick={() => onDecide(application, 'SHORTLISTED')} aria-label={`Shortlist ${application.fullName} for interview for ${application.jobTitle}`}>
            <Icon name="users" size={16} />Shortlist for Interview</Button>
            : <small className="recruitment-interview-note tw:basis-full tw:text-text-secondary tw:text-[11px]">Awaiting interview</small>}
          <Button variant="reject" type="button" onClick={() => onDecide(application, 'REJECTED')} aria-label={`Reject ${application.fullName} for ${application.jobTitle}`}>
            <Icon name="close" size={16} />Reject</Button>
        </div> : <small className="recruitment-detail tw:block tw:text-[var(--text-muted)] tw:text-[11px] tw:leading-[1.6]">Decision recorded</small>}</td>
      </tr>)}</tbody>
    </table>
  </div>
}
