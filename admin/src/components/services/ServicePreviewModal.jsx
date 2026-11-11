import Modal from '../common/Modal.jsx'
import Icon from '../common/Icon.jsx'
import { publicServiceRecord, serviceTypeLabel } from '../../services/communications/publicServiceService.js'

export default function ServicePreviewModal({ service, onClose }) {
  const record = publicServiceRecord(service)
  return <Modal className="service-preview-modal" title="Public Service Preview" subtitle={service.status === 'DRAFT' ? 'Draft preview — this service is not included in the public catalog.' : 'Content included in the public catalog.'} onClose={onClose}>
    <article className="service-public-preview">
      <span className="service-type"><Icon name={record.type === 'TRAINING' ? 'graduation' : 'globe'} size={17} />{serviceTypeLabel(record.type)}</span>
      <h3>{record.title}</h3>
      <p className="service-preview-description">{record.description || 'No description added yet.'}</p>
      <dl>
        {[
          ['Eligibility & requirements', record.requirements], ['Location', record.location],
          ['Training schedule / duration', record.schedule], ['Fees', record.fees],
          ['How to access or register', record.howToAccess],
        ].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      {record.registrationUrl && <a className="button button-primary" href={record.registrationUrl} target="_blank" rel="noopener noreferrer">
        Open service link<Icon name="external-link" size={16} /><span className="sr-only"> (opens in a new tab)</span>
      </a>}
    </article>
    <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Close preview</button></div>
  </Modal>
}
