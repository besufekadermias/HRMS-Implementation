import Icon from '../common/Icon.jsx'
import formatDate from '../../utils/formatters/formatDate.js'
import { reportAttachmentUrl, reportCategoryLabel } from '../../services/communications/reportService.js'

export default function ReportsTable({ reports }) {
  return <div className="table-scroll" tabIndex={0} role="region" aria-label="System reports table">
    <table className="employee-table reports-table" id="system-reports-table">
      <caption className="sr-only">System reports and employee submissions, newest first</caption>
      <thead><tr>
        <th scope="col">ID</th><th scope="col">Report category</th><th scope="col">Submitted by</th>
        <th scope="col">Content / Parameters</th><th scope="col">Attachment / URL</th><th scope="col">Date</th>
      </tr></thead>
      <tbody>{reports.map((report) => {
        const attachment = reportAttachmentUrl(report.attachmentUrl)
        const hasAttachment = report.attachmentUrl?.trim() && report.attachmentUrl.trim().toUpperCase() !== 'N/A'
        return <tr key={report.id}>
          <td><span className="report-id">#{report.id}</span></td>
          <td><span className="report-category">{reportCategoryLabel(report.category)}</span></td>
          <td><strong>{report.submittedBy || 'Unknown submitter'}</strong><small className="report-role">{report.submittedRole || 'Role unavailable'}</small></td>
          <td>{report.title && <strong>{report.title}</strong>}<p className="report-content">{report.content || 'No content supplied.'}</p></td>
          <td>{attachment ? <a className="report-attachment" href={attachment} target="_blank" rel="noopener noreferrer"
            aria-label={`Open attachment for report #${report.id} (opens in a new tab)`}><Icon name="file" size={16} />Open attachment</a>
            : <span className="report-no-attachment">{hasAttachment ? 'Unavailable' : 'None'}</span>}</td>
          <td><time dateTime={report.date}>{formatDate(report.date, { month: '2-digit', day: '2-digit' })}</time></td>
        </tr>
      })}</tbody>
    </table>
  </div>
}
