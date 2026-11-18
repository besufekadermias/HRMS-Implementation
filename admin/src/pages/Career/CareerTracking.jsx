import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import CareerMilestoneModal from '../../components/career/CareerMilestoneModal.jsx'
import { careerRows } from '../../services/growth/careerService.js'
import formatDate from '../../utils/formatters/formatDate.js'

const statusLabels = { SCHEDULED: 'Scheduled', NEEDS_REVIEW: 'Needs review', CANCELLED: 'Cancelled', HISTORICAL: 'History only' }

export default function CareerTracking({ milestones, employees, grades, search, onSearch, onSave, onCancelScheduled, onDirtyChange }) {
  const [recording, setRecording] = useState(false)
  const [cancelling, setCancelling] = useState(null)
  const [cancelError, setCancelError] = useState('')
  const rows = careerRows(milestones, employees, search)
  function closeForm() { setRecording(false); onDirtyChange(false) }
  function cancelPlan() {
    try { onCancelScheduled(cancelling.id); setCancelling(null) }
    catch (error) { setCancelError(error.message || 'The scheduled change could not be cancelled.') }
  }

  return <div className="career-page tw:[&_.employee-page-heading]:flex-wrap tw:[&_.career-heading-icon]:[background:#e1f5ee]
          tw:[&_.career-heading-icon]:[color:#08764c] tw:[&_.employee-page-heading_>_.button_svg]:[color:#f5d37a]
          tw:[@media(width<=700px)]:[&_.employee-page-heading_>_.button]:ml-[62px]
          tw:[@media(width<=420px)]:[&_.employee-page-heading_>_.button]:ml-[0]
          tw:[@media(width<=420px)]:[&_.employee-page-heading_>_.button]:w-full">
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
      <span className="icon-circle directory-heading-icon career-heading-icon tw:shared-base:w-[46px] tw:shared-base:h-[46px]
          tw:shared-base:shrink-0 tw:shared-base:rounded-[50%] tw:shared-base:inline-flex
          tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:w-[49px] tw:shared-base:h-[49px]
          tw:shared-base:[background:#d8f8ee] tw:shared-base:[color:#05695c]"><Icon name="trend" size={27} /></span>
      <div><h1>Career Milestones &amp; Promotions</h1><p>Track promotions, grade changes, and step increments with automatic salary adjustment.</p></div>
      <Button type="button" onClick={() => setRecording(true)}><Icon name="plus" size={18} /> Record Promotion / Step</Button>
    </div>
    {search.trim() && <div className="career-search-result tw:flex tw:items-center tw:justify-between tw:gap-[12px] tw:mb-[15px]
          tw:[color:var(--text-secondary)] tw:[@media(width<=700px)]:items-start" role="status"><span>{rows.length} milestone{rows.length === 1 ? '' : 's'} matching “{search}”</span>
      <Button variant="secondary" type="button" onClick={() => onSearch('')}>Clear search</Button></div>}
    <Card className="career-card tw:p-[0] tw:overflow-hidden tw:[&_.empty-state]:p-[48px_20px]" aria-label="Career milestones">
      <div className="table-scroll tw:shared-base:overflow-x-auto tw:shared-base:[scrollbar-width:thin]
          tw:shared-base:[scrollbar-color:#c5dbd6_#f5f9f9]" tabIndex={0} role="region" aria-label="Career milestone table">
        <table className="employee-table career-table tw:shared-base:w-full tw:shared-base:border-collapse tw:shared-base:text-left
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
          tw:max-[768px]:shared-base:min-w-[870px] tw:w-full tw:min-w-[800px] tw:table-fixed
          tw:[&_th]:p-[20px_12px] tw:[&_td]:p-[20px_12px] tw:[&_th]:uppercase tw:[&_th]:text-[10px]
          tw:[&_th]:tracking-[.6px] tw:[&_th:first-child]:w-[16%] tw:[&_th:nth-child(2)]:w-[19%]
          tw:[&_th:nth-child(3)]:w-[14%] tw:[&_th:nth-child(4)]:w-[14%] tw:[&_th:nth-child(5)]:w-[13%]
          tw:[&_td]:whitespace-normal tw:[&_td]:[overflow-wrap:anywhere] tw:[&_td]:[color:var(--text-secondary)]
          tw:[&_td]:leading-[1.6] tw:[&_td_strong]:[color:var(--text-primary)] tw:[&_td_strong]:font-[650]
          tw:[&_td_.career-promoted-grade]:[color:#087c42] tw:[&_.career-description]:whitespace-pre-wrap" id="career-table">
          <caption className="sr-only tw:sr-only">Career milestones and promotions, newest effective date first</caption>
          <thead><tr><th scope="col">Employee</th><th scope="col">Milestone type</th><th scope="col">Previous<br />grade</th><th scope="col">New<br />grade</th><th scope="col">Effective<br />date</th><th scope="col">Description</th></tr></thead>
          <tbody>{rows.map((item) => <tr key={item.id}>
            <td><strong className="career-employee tw:block">{item.employeeName}</strong><span className="career-employee-id tw:block tw:[color:var(--text-muted)] tw:text-[11px]">{item.employeeId}</span></td>
            <td><span className={String.raw`career-type career-type-${item.milestoneType.toLowerCase()} tw:inline-block tw:p-[3px_9px] tw:rounded-[20px] tw:text-[10px] tw:leading-[1.5] tw:font-bold tw:uppercase
          tw:tracking-[.2px] tw:whitespace-nowrap tw:[&.career-type-promotion]:[color:#076755]
          tw:[&.career-type-promotion]:[background:#e0f5ed] tw:[&.career-type-step\_increment]:[color:#6d45a3]
          tw:[&.career-type-step\_increment]:[background:#f0e8fb] tw:[&.career-type-grade\_change]:[color:#245389]
          tw:[&.career-type-grade\_change]:[background:#e0ecfc] tw:[&.career-type-award\_milestone]:[color:#8d5700]
          tw:[&.career-type-award\_milestone]:[background:#fff5bf] `}>{item.typeLabel}</span></td>
            <td>{item.previousGradeName || 'N/A'}</td>
            <td><strong className="career-promoted-grade">{item.newGradeName || 'Unchanged'}</strong></td>
            <td className="career-effective-date tw:[&_time]:whitespace-nowrap"><time dateTime={item.effectiveDate}>{formatDate(item.effectiveDate, { month: '2-digit', day: '2-digit' })}</time>
              {statusLabels[item.status] && <span className={String.raw`career-status career-status-${item.status.toLowerCase()} tw:block tw:[color:var(--text-muted)] tw:text-[10px] tw:mt-[5px] tw:[&.career-status-scheduled]:[color:#245389]
          tw:[&.career-status-needs\_review]:[color:#a64b0a] `}>{statusLabels[item.status]}</span>}
              {['SCHEDULED', 'NEEDS_REVIEW'].includes(item.status) && <button type="button" className="career-cancel-plan tw:block tw:p-[3px_0] tw:mt-[3px] tw:[border:0] tw:[background:none] tw:underline tw:text-[11px]
          tw:[color:var(--text-secondary)]" aria-label={`Cancel scheduled change for ${item.employeeName} (${item.employeeId}) on ${item.effectiveDate}`}
                onClick={() => { setCancelling(item); setCancelError('') }}>Cancel plan</button>}
            </td>
            <td className="career-description">{item.description}{item.reviewReason && <p className="career-review-reason tw:[color:#a64b0a] tw:mt-[8px] tw:text-[11px]">{item.reviewReason}</p>}</td>
          </tr>)}</tbody>
        </table>
      </div>
      {!rows.length && <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]"><Icon name="trend" size={32} /><h3>{search.trim() ? 'No matching career milestones' : 'No career milestones yet'}</h3>
        <p>{search.trim() ? 'Try another employee, milestone type, or grade.' : 'Record a promotion, step increment, grade change, or achievement.'}</p>
        <Button variant="secondary" type="button" onClick={() => search.trim() ? onSearch('') : setRecording(true)}>{search.trim() ? 'Clear search' : 'Record Promotion / Step'}</Button>
      </div>}
    </Card>
    {recording && <CareerMilestoneModal milestones={milestones} employees={employees} grades={grades} onSave={onSave} onClose={closeForm} onDirtyChange={onDirtyChange} />}
    {cancelling && <ConfirmationModal title="Cancel scheduled milestone?" confirmLabel="Cancel Plan" onCancel={() => setCancelling(null)} onConfirm={cancelPlan}>
      <p>Cancel the planned change for <strong>{cancelling.employeeName}</strong> on {formatDate(cancelling.effectiveDate)}? The cancelled milestone will remain in history, and their current grade and salary will stay unchanged.</p>
      {cancelError && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{cancelError}</p>}
    </ConfirmationModal>}
  </div>
}
