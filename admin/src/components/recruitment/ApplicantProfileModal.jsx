import Modal from '../common/Modal.jsx'
import Icon from '../common/Icon.jsx'
import ApplicationStatusBadge from './ApplicationStatusBadge.jsx'
import { credentialLink } from '../../services/recruitment/recruitmentService.js'

export default function ApplicantProfileModal({ application, onClose }) {
  const url = credentialLink(application.credentialsUrl)
  return <Modal title="Candidate Credentials" subtitle={application.fullName} className="recruitment-modal" onClose={onClose}>
    <dl className="recruitment-profile">
      <div><dt>Applied position</dt><dd>{application.jobTitle}</dd></div>
      <div><dt>Department</dt><dd>{application.department}</dd></div>
      <div><dt>National ID</dt><dd>{application.nationalId || 'Not supplied'}</dd></div>
      <div><dt>Email</dt><dd>{application.email}</dd></div>
      <div><dt>Phone</dt><dd>{application.phone}</dd></div>
      <div><dt>Application status</dt><dd><ApplicationStatusBadge status={application.status} /></dd></div>
    </dl>
    {url ? <a className="button button-secondary" href={url} target="_blank" rel="noopener noreferrer"><Icon name="file" size={18} />Open CV / Certificate</a>
      : <div className="recruitment-missing-document"><Icon name="file" size={24} /><div><strong>No credential file available</strong><p>This application does not have an accessible CV or certificate attached.</p></div></div>}
    <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Close</button></div>
  </Modal>
}
