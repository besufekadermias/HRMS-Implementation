import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
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

  return <div className="documents-page tw:[&_.employee-page-heading]:flex-wrap tw:[&_.employee-page-heading]:items-start
          tw:[&_.documents-heading-icon]:shrink-0 tw:[&_.documents-heading-icon]:[color:#245a91]
          tw:[&_.documents-heading-icon]:[background:#e3efff]
          tw:[&_.employee-page-heading_>_.button_svg]:[color:#f5d37a]
          tw:[@media(width<=700px)]:[&_.employee-page-heading_h1]:text-[23px]
          tw:[@media(width<=700px)]:[&_.employee-page-heading_>_.button]:ml-[62px]
          tw:[@media(width<=420px)]:[&_.employee-page-heading_>_.button]:w-full
          tw:[@media(width<=420px)]:[&_.employee-page-heading_>_.button]:ml-[0]">
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
      <span className="icon-circle directory-heading-icon documents-heading-icon tw:shared-base:w-[46px] tw:shared-base:h-[46px]
          tw:shared-base:shrink-0 tw:shared-base:rounded-[50%] tw:shared-base:inline-flex
          tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:w-[49px] tw:shared-base:h-[49px]
          tw:shared-base:[background:#d8f8ee] tw:shared-base:[color:#05695c]"><Icon name="folder" size={27} /></span>
      <div><h1>Institutional Documents &amp; Directives</h1><p>Manage guidelines, policies, and regulations for the public and employees.</p></div>
      <Button type="button" onClick={() => setPublishing(true)}><Icon name="plus" size={18} />Publish New Document</Button>
    </div>
    {downloadError && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{downloadError}</p>}
    <Card className="documents-card tw:p-[0] tw:overflow-hidden tw:[&_.empty-state]:p-[48px_20px]" aria-label="Institutional documents">
      <div className="documents-toolbar tw:flex tw:items-center tw:flex-wrap tw:gap-[12px] tw:p-[16px_20px]
          tw:[border-bottom:1px_solid_var(--border)] tw:[&_>_span]:flex-1 tw:[&_>_span]:min-w-[110px]
          tw:[&_>_span]:[color:var(--text-muted)] tw:[&_>_span]:text-[12px] tw:[&_select]:min-h-[38px]
          tw:[&_select]:max-w-[100%] tw:[&_select]:p-[8px_12px] tw:[&_select]:[font:inherit]
          tw:[&_select]:text-[12px] tw:[&_select]:[color:var(--text-secondary)]
          tw:[&_select]:[border:1px_solid_var(--border)] tw:[&_select]:rounded-[7px]
          tw:[&_select]:[background:var(--surface)] tw:[&_.button]:min-h-[38px] tw:[&_.button]:p-[8px_12px]
          tw:[&_.button]:text-[12px] tw:[@media(width<=420px)]:[&_>_span]:[flex-basis:100%]">
        <span role="status">{rows.length} of {documents.length} document{documents.length === 1 ? '' : 's'}</span>
        <label><span className="sr-only tw:sr-only">Document audience</span>
          <select value={audience} onChange={(event) => setAudience(event.target.value)} aria-controls="documents-table">
            <option value="">All audiences</option><option value="PUBLIC">Public only</option>
            <option value="EMPLOYEES">Employees only</option><option value="ALL">Both</option>
          </select>
        </label>
        {filtered && <Button variant="secondary" type="button" onClick={clearFilters}>Clear filters</Button>}
      </div>
      <DocumentsTable documents={rows} onDownload={download} onDelete={(record) => { setRemoving(record); setDeleteError('') }} />
      {!rows.length && <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]"><Icon name="folder" size={32} />
        <h3>{filtered ? 'No matching documents' : 'No documents yet'}</h3>
        <p>{filtered ? 'Try another title, file name, or audience.' : 'Upload a file or share a link to your first document.'}</p>
        <Button variant="secondary" type="button" onClick={() => filtered ? clearFilters() : setPublishing(true)}>
          {filtered ? 'Clear filters' : 'Publish New Document'}
        </Button>
      </div>}
    </Card>
    {publishing && <PublishDocumentModal onSave={save} onClose={closeForm} onDirtyChange={onDirtyChange} />}
    {removing && <ConfirmationModal title="Delete document?" confirmLabel="Delete Document" destructive
      onCancel={() => setRemoving(null)} onConfirm={confirmDelete}>
      <p>Remove <strong>{removing.title}</strong> from the document list? This does not delete the original file on your device or the linked website.</p>
      {deleteError && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{deleteError}</p>}
    </ConfirmationModal>}
  </div>
}
