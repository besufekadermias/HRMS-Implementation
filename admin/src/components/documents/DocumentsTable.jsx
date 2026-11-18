import { IconButton } from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import formatDate from '../../utils/formatters/formatDate.js'
import { audienceLabel } from '../../services/communications/audiences.js'
import { documentFileSize, documentUrl } from '../../services/communications/documentService.js'

export default function DocumentsTable({ documents, onDownload, onDelete }) {
  return <div className="table-scroll tw:shared-base:overflow-x-auto tw:shared-base:[scrollbar-width:thin]
          tw:shared-base:[scrollbar-color:#c5dbd6_#f5f9f9]" tabIndex={0} role="region" aria-label="Documents table">
    <table className="employee-table documents-table tw:shared-base:w-full tw:shared-base:border-collapse tw:shared-base:text-left
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
          tw:max-[768px]:shared-base:min-w-[870px] tw:w-full tw:min-w-[780px] tw:table-fixed
          tw:[&_th]:p-[22px_16px] tw:[&_td]:p-[22px_16px] tw:[&_th]:uppercase tw:[&_th]:text-[10px]
          tw:[&_th]:tracking-[.6px] tw:[&_th]:whitespace-normal tw:[&_th:first-child]:w-[8%]
          tw:[&_th:nth-child(2)]:w-[31%] tw:[&_th:nth-child(3)]:w-[14%] tw:[&_th:nth-child(4)]:w-[25%]
          tw:[&_th:nth-child(5)]:w-[14%] tw:[&_th:last-child]:w-[8%] tw:[&_td]:whitespace-normal
          tw:[&_td]:[overflow-wrap:anywhere] tw:[&_td]:leading-[1.7] tw:[&_td]:[color:var(--text-secondary)]
          tw:[&_th:last-child]:text-center tw:[&_td:last-child]:text-center" id="documents-table">
      <thead><tr>
        <th scope="col">Doc ID</th><th scope="col">Document title</th><th scope="col">Audience</th>
        <th scope="col">File / URL</th><th scope="col">Uploaded date</th><th scope="col">Delete</th>
      </tr></thead>
      <tbody>{documents.map((record) => {
        const url = record.source === 'URL' ? documentUrl(record.url) : ''
        return <tr key={record.id}>
          <td><span className="document-id tw:[color:var(--text-muted)] tw:font-[650]">#{record.id}</span></td>
          <td><div className="document-title tw:flex tw:items-start tw:gap-[10px] tw:[color:var(--text-primary)] tw:[&_svg]:shrink-0
          tw:[&_svg]:mt-[2px] tw:[&_svg]:[color:#245a91] tw:[&_strong]:text-[13px] tw:[&_strong]:font-[650]"><Icon name="file" size={21} /><strong>{record.title}</strong></div></td>
          <td><span className={`document-audience document-audience-${record.targetAudience.toLowerCase()} tw:inline-block tw:rounded-[20px] tw:p-[3px_10px] tw:text-[10px] tw:font-bold tw:leading-[1.5]
          tw:[&.document-audience-all]:[color:#087348] tw:[&.document-audience-all]:[background:#ddf8e8]
          tw:[&.document-audience-employees]:[color:#245a91]
          tw:[&.document-audience-employees]:[background:#e3efff] tw:[&.document-audience-public]:[color:#935a05]
          tw:[&.document-audience-public]:[background:#fff4c2] `}>
            {audienceLabel(record.targetAudience)}
          </span></td>
          <td>{record.source === 'FILE' && record.file ? <>
            <button type="button" className="document-access tw:inline-flex tw:items-center tw:gap-[6px] tw:max-w-[100%] tw:p-[6px_9px] tw:[border:0]
          tw:rounded-[5px] tw:[background:#edf5ff] tw:[color:#245a91] tw:[font:inherit] tw:text-[12px]
          tw:font-[650] tw:cursor-pointer tw:[&_svg]:shrink-0 tw:[&:hover]:[color:var(--primary)]
          tw:[&:hover]:[background:#e3efff]" aria-label={`Download ${record.title}`} onClick={() => onDownload(record)}>
              <Icon name="download" size={16} />Download File
            </button>
            <small className="document-file-detail tw:block tw:mt-[5px] tw:text-[11px] tw:[color:var(--text-muted)]">{record.file.name} · {documentFileSize(record.file.size)}</small>
          </> : url ? <>
            <a className="document-access tw:inline-flex tw:items-center tw:gap-[6px] tw:max-w-[100%] tw:p-[6px_9px] tw:[border:0]
          tw:rounded-[5px] tw:[background:#edf5ff] tw:[color:#245a91] tw:[font:inherit] tw:text-[12px]
          tw:font-[650] tw:cursor-pointer tw:[&_svg]:shrink-0 tw:[&:hover]:[color:var(--primary)]
          tw:[&:hover]:[background:#e3efff]" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Access ${record.title} (opens in a new tab)`}>
              <Icon name="external-link" size={16} />Access Document
            </a>
            <small className="document-file-detail tw:block tw:mt-[5px] tw:text-[11px] tw:[color:var(--text-muted)]">{new URL(url).hostname}</small>
          </> : <span className="document-unavailable tw:[color:var(--text-muted)] tw:text-[12px]">{record.url ? 'Link unavailable' : 'No file provided'}</span>}</td>
          <td>{formatDate(record.date)}</td>
          <td><IconButton variant="muted-delete" type="button" aria-label={`Delete ${record.title}`} onClick={() => onDelete(record)}>
            <Icon name="trash" size={18} />
          </IconButton></td>
        </tr>
      })}</tbody>
    </table>
  </div>
}
