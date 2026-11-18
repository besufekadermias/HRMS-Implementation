import { IconButton } from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import formatDate from '../../utils/formatters/formatDate.js'
import { serviceTypeLabel } from '../../services/communications/publicServiceService.js'

export default function ServicesTable({ services, onPreview, onEdit, onDelete }) {
  return <div className="table-scroll tw:shared-base:overflow-x-auto tw:shared-base:[scrollbar-width:thin]
          tw:shared-base:[scrollbar-color:#c5dbd6_#f5f9f9]" tabIndex={0} role="region" aria-label="Public services and training table">
    <table className="employee-table services-table tw:shared-base:w-full tw:shared-base:border-collapse tw:shared-base:text-left
          tw:shared-base:text-[11px] tw:shared-base:[&_th]:text-[9px] tw:shared-base:[&_th]:tracking-[0.6px]
          tw:shared-base:[&_th]:font-[650] tw:shared-base:[&_th]:[color:#5c768a]
          tw:shared-base:[&_th]:[background:#f6f9fb] tw:shared-base:[&_th]:p-[13px_12px]
          tw:shared-base:[&_th]:whitespace-nowrap tw:shared-base:[&_th]:[border-bottom:1px_solid_#e6eff2]
          tw:shared-base:[&_th:first-child]:rounded-[5px_0_0_5px]
          tw:shared-base:[&_th:last-child]:rounded-[0_5px_5px_0] tw:shared-base:[&_td]:p-[12px]
          tw:shared-base:[&_td]:[border-bottom:1px_solid_#f0f4f6]
          tw:shared-base:[&_td]:[color:var(--text-secondary)] tw:shared-base:[&_td]:leading-[1.6]
          tw:shared-base:[&_tbody_tr:hover]:[background:#f9fcfb]
          tw:shared-base:[&_tbody_tr:last-child_td]:[border-bottom:0]
          tw:max-[768px]:shared-base:min-w-[870px] tw:w-full tw:min-w-[760px] tw:table-fixed
          tw:[&_th]:p-[22px_16px] tw:[&_td]:p-[22px_16px] tw:[&_th]:uppercase tw:[&_th]:text-[10px]
          tw:[&_th]:tracking-[.6px] tw:[&_th]:whitespace-normal tw:[&_th:first-child]:w-[36%]
          tw:[&_th:nth-child(2)]:w-[18%] tw:[&_th:nth-child(3)]:w-[14%] tw:[&_th:nth-child(4)]:w-[14%]
          tw:[&_th:last-child]:w-[18%] tw:[&_td]:whitespace-normal tw:[&_td]:[overflow-wrap:anywhere]
          tw:[&_td]:leading-[1.7] tw:[&_td]:[color:var(--text-secondary)]
          tw:[&_td_strong]:[color:var(--text-primary)] tw:[&_td_strong]:text-[13px]" id="services-table">
      <thead><tr><th scope="col">Service / training</th><th scope="col">Type</th><th scope="col">Status</th><th scope="col">Updated</th><th scope="col">Actions</th></tr></thead>
      <tbody>{services.map((service) => <tr key={service.id}>
        <td><strong>{service.title}</strong><p className="service-table-description tw:[display:-webkit-box] tw:[-webkit-line-clamp:2] tw:[-webkit-box-orient:vertical]
          tw:overflow-hidden tw:text-[12px] tw:m-[4px_0_0]">{service.description || 'Add a description before publishing.'}</p>
          {service.type === 'TRAINING' && service.schedule && <small className="service-table-schedule tw:flex tw:items-center tw:gap-[6px] tw:mt-[8px] tw:text-[11px] tw:[&_svg]:shrink-0"><Icon name="calendar" size={14} />{service.schedule}</small>}
        </td>
        <td><span className="service-type tw:[&_svg]:shrink-0 tw:inline-flex tw:items-center tw:gap-[7px] tw:[color:#245a91] tw:text-[12px]"><Icon name={service.type === 'TRAINING' ? 'graduation' : 'globe'} size={16} />{serviceTypeLabel(service.type)}</span></td>
        <td><span className={`service-status service-status-${service.status.toLowerCase()} tw:inline-block tw:p-[3px_10px] tw:rounded-[20px] tw:text-[11px] tw:font-[650]
          tw:[&.service-status-published]:[color:#087348] tw:[&.service-status-published]:[background:#ddf8e8]
          tw:[&.service-status-draft]:[color:#805a13] tw:[&.service-status-draft]:[background:#fff4d6] `}>{service.status === 'PUBLISHED' ? 'Published' : 'Draft'}</span></td>
        <td>{formatDate(service.updatedAt)}</td>
        <td><div className="service-row-actions tw:flex tw:gap-[3px]">
          <IconButton type="button"  title="Public preview" aria-label={`Preview ${service.title}`} onClick={() => onPreview(service)}><Icon name="eye" size={18} /></IconButton>
          <IconButton type="button"  title="Edit service" aria-label={`Edit ${service.title}`} onClick={() => onEdit(service)}><Icon name="edit" size={18} /></IconButton>
          <IconButton variant="delete" type="button"  title="Delete service" aria-label={`Delete ${service.title}`} onClick={() => onDelete(service)}><Icon name="trash" size={18} /></IconButton>
        </div></td>
      </tr>)}</tbody>
    </table>
  </div>
}
