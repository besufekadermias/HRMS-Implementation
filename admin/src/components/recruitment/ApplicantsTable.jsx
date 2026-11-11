import Icon from '../common/Icon.jsx'
import ApplicationStatusBadge from './ApplicationStatusBadge.jsx'
import formatDate from '../../utils/formatters/formatDate.js'

export default function ApplicantsTable({ applications, onView, onDecide }) {
  return <div className="table-scroll" tabIndex={0} role="region" aria-label="Candidate applications table">
    <table className="employee-table recruitment-table applicants-table" id="applications-table">
      <caption className="sr-only">Candidate applications and HR review decisions, most recent first</caption>
      <thead><tr>
        <th scope="col">Applicant full name</th><th scope="col">National ID</th><th scope="col">Applied job title</th>
        <th scope="col">Contact info</th><th scope="col">Credentials</th><th scope="col">Status</th><th scope="col">HR review decision</th>
      </tr></thead>
      <tbody>{applications.map((application) => <tr key={application.id}>
        <td><strong>{application.fullName}</strong><small className="recruitment-detail">Applied {formatDate(application.appliedDate)}</small></td>
        <td>{application.nationalId || 'Not supplied'}</td>
        <td><strong>{application.jobTitle}</strong><small className="recruitment-detail">{application.department}</small></td>
        <td><span className="recruitment-contact"><Icon name="mail" size={15} />{application.email}</span><span className="recruitment-detail">{application.phone}</span></td>
        <td><button type="button" className="recruitment-document" onClick={() => onView(application)} aria-label={`View credentials for ${application.fullName}, ${application.jobTitle}`}>
          <Icon name="file" size={16} />View CV / Cert</button></td>
        <td><ApplicationStatusBadge status={application.status} /></td>
        <td>{['PENDING', 'SHORTLISTED'].includes(application.status) ? <div className="recruitment-decisions">
          {application.status === 'PENDING' ? <button type="button" className="button button-primary" onClick={() => onDecide(application, 'SHORTLISTED')} aria-label={`Shortlist ${application.fullName} for interview for ${application.jobTitle}`}>
            <Icon name="users" size={16} />Shortlist for Interview</button>
            : <small className="recruitment-interview-note">Awaiting interview</small>}
          <button type="button" className="button recruitment-reject" onClick={() => onDecide(application, 'REJECTED')} aria-label={`Reject ${application.fullName} for ${application.jobTitle}`}>
            <Icon name="close" size={16} />Reject</button>
        </div> : <small className="recruitment-detail">Decision recorded</small>}</td>
      </tr>)}</tbody>
    </table>
  </div>
}
