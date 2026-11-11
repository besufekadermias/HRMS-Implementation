import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import ServiceFormModal from '../../components/services/ServiceFormModal.jsx'
import ServicePreviewModal from '../../components/services/ServicePreviewModal.jsx'
import ServicesTable from '../../components/services/ServicesTable.jsx'
import { SERVICE_TYPES, publicServiceCatalog, serviceRows } from '../../services/communications/publicServiceService.js'
import { downloadBlob } from '../../services/workforce/employeeService.js'

export default function Services({ services, search, onSearch, onSave, onDelete, onDirtyChange }) {
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState(null)
  const [preview, setPreview] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [exportMessage, setExportMessage] = useState('')
  const rows = serviceRows(services, search, type, status)
  const published = publicServiceCatalog(services)
  const filtered = !!(search.trim() || type || status)

  function clearFilters() { onSearch(''); setType(''); setStatus('') }
  function closeForm() { setEditing(null); onDirtyChange(false) }
  function save(values) { onSave(values); clearFilters(); setExportMessage('') }

  function confirmDelete() {
    try {
      onDelete(removing.id)
      setRemoving(null)
      setDeleteError('')
      setExportMessage('')
    } catch (error) {
      setDeleteError(error.message || 'The service could not be deleted.')
    }
  }

  function exportCatalog() {
    try {
      const catalog = { version: 1, services: published }
      downloadBlob(new Blob([JSON.stringify(catalog, null, 2)], { type: 'application/json' }), 'public-services.json')
      setExportMessage('Public catalog downloaded. Only published services are included.')
    } catch {
      setExportMessage('The catalog could not be downloaded. Please try again.')
    }
  }

  return <div className="services-page">
    <div className="employee-page-heading">
      <span className="icon-circle directory-heading-icon"><Icon name="globe" size={27} /></span>
      <div><h1>Public Services &amp; Training</h1><p>Manage the services and training opportunities offered to the public.</p></div>
      <button type="button" className="button button-primary" onClick={() => setEditing({})}><Icon name="plus" size={18} />Add Service</button>
    </div>
    <div className="services-stats">
      <StatCard label="All offerings" value={services.length} icon="globe" detail="Services and training" />
      <StatCard label="Training programs" value={services.filter((item) => item.type === 'TRAINING').length} icon="graduation" tone="blue" detail="Courses and workshops" />
      <StatCard label="Published" value={published.length} icon="check-circle" detail="Included in the public catalog" />
    </div>
    <section className="card services-card" aria-label="Services catalog">
      <div className="services-toolbar">
        <span role="status">{rows.length} of {services.length} offering{services.length === 1 ? '' : 's'}</span>
        <label><span className="sr-only">Service type filter</span><select value={type} onChange={(event) => setType(event.target.value)} aria-controls="services-table">
          <option value="">All types</option>{SERVICE_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select></label>
        <label><span className="sr-only">Publication status filter</span><select value={status} onChange={(event) => setStatus(event.target.value)} aria-controls="services-table">
          <option value="">All statuses</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option>
        </select></label>
        {filtered && <button type="button" className="button button-secondary" onClick={clearFilters}>Clear filters</button>}
        <button type="button" className="button button-secondary" disabled={!published.length} onClick={exportCatalog}><Icon name="download" size={16} />Export public catalog</button>
      </div>
      <ServicesTable services={rows} onEdit={setEditing} onPreview={setPreview} onDelete={(service) => { setRemoving(service); setDeleteError('') }} />
      {!rows.length && <div className="empty-state">
        <span className="icon-circle tone-green"><Icon name="globe" size={30} /></span>
        <h3>{filtered ? 'No matching services' : 'Add your first service or training'}</h3>
        <p>{filtered ? 'Try another keyword, type, or publication status.' : 'Start with a draft, add the details, and publish when it is ready for the public.'}</p>
        <button type="button" className="button button-secondary" onClick={() => filtered ? clearFilters() : setEditing({})}>{filtered ? 'Clear filters' : 'Add Service'}</button>
      </div>}
    </section>
    {exportMessage && <p className="service-export-message" role="status">{exportMessage}</p>}
    {editing && <ServiceFormModal service={editing.id ? editing : undefined} onSave={save} onClose={closeForm} onDirtyChange={onDirtyChange} />}
    {preview && <ServicePreviewModal service={preview} onClose={() => setPreview(null)} />}
    {removing && <ConfirmationModal title="Delete service?" confirmLabel="Delete Service" destructive onCancel={() => setRemoving(null)} onConfirm={confirmDelete}>
      <p>Remove <strong>{removing.title}</strong> from the services catalog?</p>
      {removing.status === 'PUBLISHED' && <p>This service will also be removed from future public catalog exports.</p>}
      {deleteError && <p className="form-error" role="alert">{deleteError}</p>}
    </ConfirmationModal>}
  </div>
}
