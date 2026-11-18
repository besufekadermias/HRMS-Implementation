import Button from '../common/Button.jsx'
import Modal, { ModalActions } from '../common/Modal.jsx'
import Icon from '../common/Icon.jsx'
import { publicServiceRecord, serviceTypeLabel } from '../../services/communications/publicServiceService.js'

export default function ServicePreviewModal({ service, onClose }) {
  const record = publicServiceRecord(service)
  return <Modal size="service" className="service-preview-modal" title="Public Service Preview" subtitle={service.status === 'DRAFT' ? 'Draft preview — this service is not included in the public catalog.' : 'Content included in the public catalog.'} onClose={onClose}>
    <article className="service-public-preview tw:p-[24px] tw:[border:1px_solid_var(--border)] tw:[border-top:4px_solid_var(--primary)]
          tw:rounded-[10px] tw:[background:#f9fcfb] tw:[overflow-wrap:anywhere] tw:[&_h3]:m-[13px_0_10px]
          tw:[&_h3]:text-[23px] tw:[&_h3]:leading-[1.4] tw:[&_dd]:whitespace-pre-wrap tw:[&_dd]:leading-[1.8]
          tw:[&_dd]:[color:var(--text-secondary)] tw:[&_dd]:text-[13px] tw:[&_dl]:grid tw:[&_dl]:gap-[17px]
          tw:[&_dl]:m-[20px_0] tw:[&_dt]:text-[12px] tw:[&_dt]:font-[650] tw:[&_dt]:mb-[4px] tw:[&_dd]:m-[0]
          tw:[@media(width<=600px)]:p-[18px]">
      <span className="service-type tw:[&_svg]:shrink-0 tw:inline-flex tw:items-center tw:gap-[7px] tw:[color:#245a91] tw:text-[12px]"><Icon name={record.type === 'TRAINING' ? 'graduation' : 'globe'} size={17} />{serviceTypeLabel(record.type)}</span>
      <h3>{record.title}</h3>
      <p className="service-preview-description tw:whitespace-pre-wrap tw:leading-[1.8] tw:[color:var(--text-secondary)] tw:text-[13px]">{record.description || 'No description added yet.'}</p>
      <dl>
        {[
          ['Eligibility & requirements', record.requirements], ['Location', record.location],
          ['Training schedule / duration', record.schedule], ['Fees', record.fees],
          ['How to access or register', record.howToAccess],
        ].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      {record.registrationUrl && <Button as="a" href={record.registrationUrl} target="_blank" rel="noopener noreferrer">
        Open service link<Icon name="external-link" size={16} /><span className="sr-only tw:sr-only"> (opens in a new tab)</span>
      </Button>}
    </article>
    <ModalActions ><Button variant="secondary" type="button" onClick={onClose}>Close preview</Button></ModalActions>
  </Modal>
}
