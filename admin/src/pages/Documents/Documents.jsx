import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import DocumentsTable from '../../components/documents/DocumentsTable.jsx'
import PublishDocumentModal from '../../components/documents/PublishDocumentModal.jsx'
import { documentRows } from '../../services/communications/documentService.js'
import { downloadBlob } from '../../services/workforce/employeeService.js'

export default function Documents({ documents, search, onSearch, onSave, onDelete, onDirtyChange }) {
  const [audience, setAudience] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [downloadError, setDownloadError] = useState('')
  const rows = documentRows(documents, search, audience)
  const filtered = !!(search.trim() || audience)

  function clearFilters() {
    onSearch('')
    setAudience('')
  }

  function closeForm() {
    setPublishing(false)
    onDirtyChange(false)
  }

  async function save(values) {
    await onSave(values)
    clearFilters()
  }

  function confirmDelete() {
    try {
      onDelete(removing.id)
      setRemoving(null)
      setDeleteError('')
    } catch (error) {
      setDeleteError(error.message || 'The document could not be deleted.')
    }
  }

  function download(record) {
    setDownloadError('')
    try {
      // The existing helper creates a temporary URL and revokes it after download.
      downloadBlob(record.file, record.file.name)
    } catch {
      setDownloadError('The file could not be downloaded. Please try again.')
    }
  }

  return <div className="documents-page">
    <div className="employee-page-heading">
      <span className="icon-circle directory-heading-icon documents-heading-icon"><Icon name="folder" size={27} /></span>
      <div><h1>Institutional Documents &amp; Directives</h1><p>Manage guidelines, policies, and regulations for the public and employees.</p></div>
      <button type="button" className="button button-primary" onClick={() => setPublishing(true)}><Icon name="plus" size={18} />Publish New Document</button>
    </div>
    {downloadError && <p className="form-error" role="alert">{downloadError}</p>}
    <section className="card documents-card" aria-label="Institutional documents">
      <div className="documents-toolbar">
        <span role="status">{rows.length} of {documents.length} document{documents.length === 1 ? '' : 's'}</span>
        <label><span className="sr-only">Document audience</span>
          <select value={audience} onChange={(event) => setAudience(event.target.value)} aria-controls="documents-table">
            <option value="">All audiences</option><option value="PUBLIC">Public only</option>
            <option value="EMPLOYEES">Employees only</option><option value="ALL">Both</option>
          </select>
        </label>
        {filtered && <button type="button" className="button button-secondary" onClick={clearFilters}>Clear filters</button>}
      </div>
      <DocumentsTable documents={rows} onDownload={download} onDelete={(record) => { setRemoving(record); setDeleteError('') }} />
      {!rows.length && <div className="empty-state"><Icon name="folder" size={32} />
        <h3>{filtered ? 'No matching documents' : 'No documents yet'}</h3>
        <p>{filtered ? 'Try another title, file name, or audience.' : 'Upload a file or share a link to your first document.'}</p>
        <button type="button" className="button button-secondary" onClick={() => filtered ? clearFilters() : setPublishing(true)}>
          {filtered ? 'Clear filters' : 'Publish New Document'}
        </button>
      </div>}
    </section>
    {publishing && <PublishDocumentModal onSave={save} onClose={closeForm} onDirtyChange={onDirtyChange} />}
    {removing && <ConfirmationModal title="Delete document?" confirmLabel="Delete Document" destructive
      onCancel={() => setRemoving(null)} onConfirm={confirmDelete}>
      <p>Remove <strong>{removing.title}</strong> from the document list? This does not delete the original file on your device or the linked website.</p>
      {deleteError && <p className="form-error" role="alert">{deleteError}</p>}
    </ConfirmationModal>}
  </div>
}
