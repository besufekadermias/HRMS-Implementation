import Button from '../common/Button.jsx'
import Modal, { ModalActions } from '../common/Modal.jsx'
import Icon from '../common/Icon.jsx'
import ApplicationStatusBadge from './ApplicationStatusBadge.jsx'
import { credentialLink } from '../../services/recruitment/recruitmentService.js'

export default function ApplicantProfileModal({ application, onClose }) {
  const url = credentialLink(application.credentialsUrl)
  return <Modal size="medium" title="Candidate Credentials" subtitle={application.fullName} className="recruitment-modal" onClose={onClose}>
    <dl className="recruitment-profile tw:grid tw:grid-cols-[repeat(2,minmax(0,1fr))] tw:gap-[20px] tw:m-[0_0_24px]
          tw:[&_dt]:text-[var(--text-muted)] tw:[&_dt]:text-[11px] tw:[&_dt]:mb-[5px] tw:[&_dd]:m-0
          tw:[&_dd]:[overflow-wrap:anywhere] tw:[@media(width<=700px)]:grid-cols-[minmax(0,1fr)]">
      <div><dt>Applied position</dt><dd>{application.jobTitle}</dd></div>
      <div><dt>Department</dt><dd>{application.department}</dd></div>
      <div><dt>National ID</dt><dd>{application.nationalId || 'Not supplied'}</dd></div>
      <div><dt>Email</dt><dd>{application.email}</dd></div>
      <div><dt>Phone</dt><dd>{application.phone}</dd></div>
      <div><dt>Application status</dt><dd><ApplicationStatusBadge status={application.status} /></dd></div>
    </dl>
    {url ? <Button variant="secondary" as="a" href={url} target="_blank" rel="noopener noreferrer"><Icon name="file" size={18} />Open CV / Certificate</Button>
      : <div className="recruitment-missing-document tw:flex tw:items-center tw:gap-[14px] tw:[border:1px_dashed_var(--border)]
          tw:rounded-[9px] tw:p-[20px] tw:text-text-secondary tw:[&_p]:m-[5px_0_0] tw:[&_p]:text-[12px]"><Icon name="file" size={24} /><div><strong>No credential file available</strong><p>This application does not have an accessible CV or certificate attached.</p></div></div>}
    <ModalActions ><Button variant="secondary" type="button" onClick={onClose}>Close</Button></ModalActions>
  </Modal>
}
