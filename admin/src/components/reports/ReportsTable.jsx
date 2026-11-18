import Icon from '../common/Icon.jsx'
import formatDate from '../../utils/formatters/formatDate.js'
import { reportAttachmentUrl, reportCategoryLabel } from '../../services/communications/reportService.js'

export default function ReportsTable({ reports }) {
  return <div className="table-scroll tw:shared-base:overflow-x-auto tw:shared-base:[scrollbar-width:thin]
          tw:shared-base:[scrollbar-color:#c5dbd6_#f5f9f9]" tabIndex={0} role="region" aria-label="System reports table">
    <table className="employee-table reports-table tw:shared-base:w-full tw:shared-base:border-collapse tw:shared-base:text-left
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
          tw:max-[768px]:shared-base:min-w-[870px] tw:w-full tw:min-w-[880px] tw:table-fixed
          tw:[&_th]:p-[22px_16px] tw:[&_td]:p-[22px_16px] tw:[&_th]:uppercase tw:[&_th]:text-[10px]
          tw:[&_th]:tracking-[.6px] tw:[&_th]:whitespace-normal tw:[&_th:first-child]:w-[7%]
          tw:[&_th:nth-child(2)]:w-[21%] tw:[&_th:nth-child(3)]:w-[20%] tw:[&_th:nth-child(4)]:w-[25%]
          tw:[&_th:nth-child(5)]:w-[15%] tw:[&_th:last-child]:w-[12%] tw:[&_td]:whitespace-normal
          tw:[&_td]:[overflow-wrap:anywhere] tw:[&_td]:leading-[1.7] tw:[&_td]:[color:var(--text-secondary)]
          tw:[&_td_strong]:block tw:[&_td_strong]:[color:var(--text-primary)] tw:[&_td_strong]:text-[13px]
          tw:[&_td_strong]:font-[650] tw:[&_.report-content]:m-[3px_0_0] tw:[&_.report-content]:whitespace-pre-wrap
          tw:[&_.report-content]:text-[12px]" id="system-reports-table">
      <caption className="sr-only tw:sr-only">System reports and employee submissions, newest first</caption>
      <thead><tr>
        <th scope="col">ID</th><th scope="col">Report category</th><th scope="col">Submitted by</th>
        <th scope="col">Content / Parameters</th><th scope="col">Attachment / URL</th><th scope="col">Date</th>
      </tr></thead>
      <tbody>{reports.map((report) => {
        const attachment = reportAttachmentUrl(report.attachmentUrl)
        const hasAttachment = report.attachmentUrl?.trim() && report.attachmentUrl.trim().toUpperCase() !== 'N/A'
        return <tr key={report.id}>
          <td><span className="report-id tw:[color:var(--text-muted)] tw:font-[650]">#{report.id}</span></td>
          <td><span className="report-category tw:inline-block tw:p-[3px_11px] tw:rounded-[20px] tw:text-[10px] tw:font-bold tw:leading-[1.5]
          tw:[color:#245a91] tw:[background:#e3efff] tw:uppercase">{reportCategoryLabel(report.category)}</span></td>
          <td><strong>{report.submittedBy || 'Unknown submitter'}</strong><small className="report-role tw:block tw:[color:var(--text-muted)] tw:text-[10px]">{report.submittedRole || 'Role unavailable'}</small></td>
          <td>{report.title && <strong>{report.title}</strong>}<p className="report-content">{report.content || 'No content supplied.'}</p></td>
          <td>{attachment ? <a className="report-attachment tw:inline-flex tw:items-center tw:gap-[6px] tw:[color:#245a91] tw:text-[12px] tw:font-semibold
          tw:underline tw:underline-offset-[3px] tw:[&_svg]:shrink-0 tw:[&:hover]:[color:var(--primary)]" href={attachment} target="_blank" rel="noopener noreferrer"
            aria-label={`Open attachment for report #${report.id} (opens in a new tab)`}><Icon name="file" size={16} />Open attachment</a>
            : <span className="report-no-attachment tw:[color:var(--text-muted)]">{hasAttachment ? 'Unavailable' : 'None'}</span>}</td>
          <td><time dateTime={report.date}>{formatDate(report.date, { month: '2-digit', day: '2-digit' })}</time></td>
        </tr>
      })}</tbody>
    </table>
  </div>
}
