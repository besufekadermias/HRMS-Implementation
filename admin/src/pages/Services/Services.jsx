import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
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
  async function save(values) { await onSave(values); clearFilters(); setExportMessage('') }

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

  return <div className="services-page tw:[&_.employee-page-heading]:flex-wrap
          tw:[@media(width<=600px)]:[&_.employee-page-heading_h1]:text-[23px]
          tw:[@media(width<=600px)]:[&_.employee-page-heading_>_.button]:ml-[62px]">
    <div className="employee-page-heading tw:shared-base:flex tw:shared-base:items-center tw:shared-base:gap-[13px]
           tw:shared-base:mb-[23px] tw:shared-base:[&_>_div]:min-w-0 tw:shared-base:[&_>_div]:flex-1
           tw:shared-base:[&_h1]:text-[27px] tw:shared-base:[&_h1]:tracking-[-0.6px]
           tw:shared-base:[&_p]:[color:var(--text-muted)] tw:shared-base:[&_p]:text-[12px]
           tw:shared-base:[&_p]:leading-[1.7] tw:shared-base:[&_p]:mt-[4px] tw:shared-base:[&_>_.button]:shrink-0
           tw:max-[768px]:shared-base:flex-wrap tw:max-[768px]:shared-base:gap-[11px]
           tw:max-[768px]:shared-base:[&_h1]:text-[24px]
           tw:max-[768px]:shared-base:[&_p]:text-[11px]
           tw:max-[768px]:shared-base:[&_>_.button]:ml-[auto]
           tw:max-[560px]:shared-base:[&_h1]:text-[22px]">
      <span className="icon-circle directory-heading-icon tw:shared-base:w-[46px] tw:shared-base:h-[46px] tw:shared-base:shrink-0
          tw:shared-base:rounded-[50%] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:shared-base:w-[49px] tw:shared-base:h-[49px]
          tw:shared-base:[background:#d8f8ee] tw:shared-base:[color:#05695c]"><Icon name="globe" size={27} /></span>
      <div><h1>Public Services &amp; Training</h1><p>Manage the services and training opportunities offered to the public.</p></div>
      <Button type="button" onClick={() => setEditing({})}><Icon name="plus" size={18} />Add Service</Button>
    </div>
    <div className="services-stats tw:grid tw:grid-cols-[repeat(3,_minmax(0,_1fr))] tw:gap-[16px] tw:mb-[24px]
           tw:[@media(width<=850px)]:grid-cols-[minmax(0,_1fr)] tw:[@media(width<=850px)]:gap-[10px]">
      <StatCard label="All offerings" value={services.length} icon="globe" detail="Services and training" />
      <StatCard label="Training programs" value={services.filter((item) => item.type === 'TRAINING').length} icon="graduation" tone="blue" detail="Courses and workshops" />
      <StatCard label="Published" value={published.length} icon="check-circle" detail="Included in the public catalog" />
    </div>
    <Card className="services-card tw:p-[0] tw:overflow-hidden tw:[&_.empty-state]:p-[48px_24px]
            tw:[&_.empty-state_.icon-circle]:[margin-inline:auto]" aria-label="Services catalog">
      <div className="services-toolbar tw:flex tw:items-center tw:flex-wrap tw:gap-[12px] tw:p-[16px_20px]
          tw:[border-bottom:1px_solid_var(--border)] tw:[&_>_span]:flex-1 tw:[&_>_span]:min-w-[95px]
          tw:[&_>_span]:[color:var(--text-muted)] tw:[&_>_span]:text-[12px] tw:[&_select]:max-w-[100%]
          tw:[&_select]:min-h-[38px] tw:[&_select]:p-[8px_12px] tw:[&_select]:[font:inherit]
          tw:[&_select]:text-[12px] tw:[&_select]:[color:var(--text-secondary)]
          tw:[&_select]:[border:1px_solid_var(--border)] tw:[&_select]:rounded-[7px]
          tw:[&_select]:[background:var(--surface)] tw:[&_.button]:min-h-[38px] tw:[&_.button]:p-[8px_12px]
          tw:[&_.button]:text-[12px] tw:[@media(width<=600px)]:[&_>_span]:[flex-basis:100%]
          tw:[@media(width<=600px)]:[&_>_label]:flex-1 tw:[@media(width<=600px)]:[&_>_label]:min-w-0
          tw:[@media(width<=600px)]:[&_select]:w-full">
        <span role="status">{rows.length} of {services.length} offering{services.length === 1 ? '' : 's'}</span>
        <label><span className="sr-only tw:sr-only">Service type filter</span><select value={type} onChange={(event) => setType(event.target.value)} aria-controls="services-table">
          <option value="">All types</option>{SERVICE_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select></label>
        <label><span className="sr-only tw:sr-only">Publication status filter</span><select value={status} onChange={(event) => setStatus(event.target.value)} aria-controls="services-table">
          <option value="">All statuses</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option>
        </select></label>
        {filtered && <Button variant="secondary" type="button" onClick={clearFilters}>Clear filters</Button>}
        <Button variant="secondary" type="button" disabled={!published.length} onClick={exportCatalog}><Icon name="download" size={16} />Export public catalog</Button>
      </div>
      <ServicesTable services={rows} onEdit={setEditing} onPreview={setPreview} onDelete={(service) => { setRemoving(service); setDeleteError('') }} />
      {!rows.length && <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]">
        <span className="icon-circle tone-green tw:shared-base:w-[46px] tw:shared-base:h-[46px] tw:shared-base:shrink-0
          tw:shared-base:rounded-[50%] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:[:where(&.tone-green)]:[color:#0b8972]
          tw:[:where(&.tone-green)]:[background:#e3f5f0]"><Icon name="globe" size={30} /></span>
        <h3>{filtered ? 'No matching services' : 'Add your first service or training'}</h3>
        <p>{filtered ? 'Try another keyword, type, or publication status.' : 'Start with a draft, add the details, and publish when it is ready for the public.'}</p>
        <Button variant="secondary" type="button" onClick={() => filtered ? clearFilters() : setEditing({})}>{filtered ? 'Clear filters' : 'Add Service'}</Button>
      </div>}
    </Card>
    {exportMessage && <p className="service-export-message tw:[color:var(--text-secondary)] tw:text-[12px] tw:mt-[15px]" role="status">{exportMessage}</p>}
    {editing && <ServiceFormModal service={editing.id ? editing : undefined} onSave={save} onClose={closeForm} onDirtyChange={onDirtyChange} />}
    {preview && <ServicePreviewModal service={preview} onClose={() => setPreview(null)} />}
    {removing && <ConfirmationModal title="Delete service?" confirmLabel="Delete Service" destructive onCancel={() => setRemoving(null)} onConfirm={confirmDelete}>
      <p>Remove <strong>{removing.title}</strong> from the services catalog?</p>
      {removing.status === 'PUBLISHED' && <p>This service will also be removed from future public catalog exports.</p>}
      {deleteError && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{deleteError}</p>}
    </ConfirmationModal>}
  </div>
}
