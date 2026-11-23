import { FileText, ExternalLink } from 'lucide-react'
import PortalDialog from '../common/PortalDialog.jsx'
import { careerDateLabel } from '../../utils/formatters/careerFormat.js'
import { reportAttachmentUrl } from '../../utils/validation/reportSchemas.js'

export default function ReportDetailsModal({ record, onClose }) {
  const link = reportAttachmentUrl(record.attachmentUrl)
  return (
    <PortalDialog
      title={record.title}
      titleId="report-details-title"
      icon={<FileText size={24} />}
      onClose={onClose}
    >
      <p
        className={String.raw`report-hint employee-page:text-[color:var(--text-muted)] employee-page:text-[length:11px]
    employee-page:leading-[1.8]`}
      >
        Employee Submission · {careerDateLabel(record.date)} · {record.submittedBy}
      </p>
      <p
        className={String.raw`report-body employee-page:whitespace-pre-wrap employee-page:[overflow-wrap:anywhere] employee-page:m-[20px_0]
    employee-page:text-[length:13px] employee-page:leading-[1.9]`}
      >
        {record.content}
      </p>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={String.raw`report-link employee-page:inline-flex employee-page:gap-[7px] employee-page:items-center
    employee-page:text-[length:11px] employee-page:font-[600] employee-page:text-[color:#245a91]
    employee-page:[text-decoration:underline]`}
        >
          <ExternalLink size={15} />
          Open attachment (new tab)
        </a>
      ) : (
        <p
          className={String.raw`report-hint employee-page:text-[color:var(--text-muted)] employee-page:text-[length:11px]
    employee-page:leading-[1.8]`}
        >
          No attachment link.
        </p>
      )}
      <p
        className={String.raw`report-hint mt-5 employee-page:text-[color:var(--text-muted)] employee-page:text-[length:11px]
    employee-page:leading-[1.8]`}
      >
        Report ID: {record.id}
      </p>
      <div
        className={String.raw`leave-form-actions employee-page:flex employee-page:justify-end employee-page:gap-[10px]
    employee-page:flex-wrap employee-page:mt-[22px] employee-page:pt-[20px]
    employee-page:[border-top:1px_solid_var(--border)] employee-page:screen-max-700:[&_button]:[flex:1]
    employee-page:screen-max-700:[&_button]:whitespace-nowrap`}
      >
        <button
          className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </PortalDialog>
  )
}
