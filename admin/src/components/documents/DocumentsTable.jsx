import Icon from '../common/Icon.jsx'
import formatDate from '../../utils/formatters/formatDate.js'
import { audienceLabel } from '../../services/communications/audiences.js'
import { documentFileSize, documentUrl } from '../../services/communications/documentService.js'

export default function DocumentsTable({ documents, onDownload, onDelete }) {
  return <div className="table-scroll" tabIndex={0} role="region" aria-label="Documents table">
    <table className="employee-table documents-table" id="documents-table">
      <thead><tr>
        <th scope="col">Doc ID</th><th scope="col">Document title</th><th scope="col">Audience</th>
        <th scope="col">File / URL</th><th scope="col">Uploaded date</th><th scope="col">Delete</th>
      </tr></thead>
      <tbody>{documents.map((record) => {
        const url = record.source === 'URL' ? documentUrl(record.url) : ''
        return <tr key={record.id}>
          <td><span className="document-id">#{record.id}</span></td>
          <td><div className="document-title"><Icon name="file" size={21} /><strong>{record.title}</strong></div></td>
          <td><span className={`document-audience document-audience-${record.targetAudience.toLowerCase()}`}>
            {audienceLabel(record.targetAudience)}
          </span></td>
          <td>{record.source === 'FILE' && record.file ? <>
            <button type="button" className="document-access" aria-label={`Download ${record.title}`} onClick={() => onDownload(record)}>
              <Icon name="download" size={16} />Download File
            </button>
            <small className="document-file-detail">{record.file.name} · {documentFileSize(record.file.size)}</small>
          </> : url ? <>
            <a className="document-access" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Access ${record.title} (opens in a new tab)`}>
              <Icon name="external-link" size={16} />Access Document
            </a>
            <small className="document-file-detail">{new URL(url).hostname}</small>
          </> : <span className="document-unavailable">{record.url ? 'Link unavailable' : 'No file provided'}</span>}</td>
          <td>{formatDate(record.date)}</td>
          <td><button type="button" className="icon-button document-delete" aria-label={`Delete ${record.title}`} onClick={() => onDelete(record)}>
            <Icon name="trash" size={18} />
          </button></td>
        </tr>
      })}</tbody>
    </table>
  </div>
}
