import Icon from '../common/Icon.jsx'
import formatDate from '../../utils/formatters/formatDate.js'
import { serviceTypeLabel } from '../../services/communications/publicServiceService.js'

export default function ServicesTable({ services, onPreview, onEdit, onDelete }) {
  return <div className="table-scroll" tabIndex={0} role="region" aria-label="Public services and training table">
    <table className="employee-table services-table" id="services-table">
      <thead><tr><th scope="col">Service / training</th><th scope="col">Type</th><th scope="col">Status</th><th scope="col">Updated</th><th scope="col">Actions</th></tr></thead>
      <tbody>{services.map((service) => <tr key={service.id}>
        <td><strong>{service.title}</strong><p className="service-table-description">{service.description || 'Add a description before publishing.'}</p>
          {service.type === 'TRAINING' && service.schedule && <small className="service-table-schedule"><Icon name="calendar" size={14} />{service.schedule}</small>}
        </td>
        <td><span className="service-type"><Icon name={service.type === 'TRAINING' ? 'graduation' : 'globe'} size={16} />{serviceTypeLabel(service.type)}</span></td>
        <td><span className={`service-status service-status-${service.status.toLowerCase()}`}>{service.status === 'PUBLISHED' ? 'Published' : 'Draft'}</span></td>
        <td>{formatDate(service.updatedAt)}</td>
        <td><div className="service-row-actions">
          <button type="button" className="icon-button" title="Public preview" aria-label={`Preview ${service.title}`} onClick={() => onPreview(service)}><Icon name="eye" size={18} /></button>
          <button type="button" className="icon-button" title="Edit service" aria-label={`Edit ${service.title}`} onClick={() => onEdit(service)}><Icon name="edit" size={18} /></button>
          <button type="button" className="icon-button service-delete" title="Delete service" aria-label={`Delete ${service.title}`} onClick={() => onDelete(service)}><Icon name="trash" size={18} /></button>
        </div></td>
      </tr>)}</tbody>
    </table>
  </div>
}
