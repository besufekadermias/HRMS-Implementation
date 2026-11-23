import { ArrowRight } from 'lucide-react'
import MilestoneCard from './MilestoneCard.jsx'
import { MILESTONE_TYPES, CAREER_STATUS_LABELS } from '../../utils/validation/careerSchemas.js'
import { careerDateLabel } from '../../utils/formatters/careerFormat.js'

export default function PromotionHistory({ records }) {
  return (
    <div className={String.raw`career-history-scroll employee-page:overflow-x-auto`}>
      <table
        className={String.raw`career-history-table employee-page:w-[100%] employee-page:border-collapse employee-page:text-left
    employee-page:text-[length:12px] employee-page:[&_th]:[background:#f6f9fb]
    employee-page:[&_th]:p-[15px_20px] employee-page:[&_th]:[border-block:1px_solid_var(--border)]
    employee-page:[&_th]:text-[length:10px] employee-page:[&_th]:text-[color:var(--text-muted)]
    employee-page:[&_th]:tracking-[0.5px] employee-page:[&_th]:font-[600] employee-page:[&_th]:uppercase
    employee-page:[&_th]:whitespace-nowrap employee-page:[&_td]:p-[22px_20px]
    employee-page:[&_td]:[border-bottom:1px_solid_var(--border)] employee-page:[&_td]:align-top
    employee-page:[&_td]:leading-[1.7] employee-page:[&_td:first-child]:pl-[24px]
    employee-page:[&_th:first-child]:pl-[24px] employee-page:[&_time]:whitespace-nowrap
    employee-page:screen-max-700:[&_thead]:hidden employee-page:screen-max-700:block
    employee-page:screen-max-700:w-[100%] employee-page:screen-max-700:[&_tbody]:block
    employee-page:screen-max-700:[&_tbody]:w-[100%] employee-page:screen-max-700:[&_tr]:block
    employee-page:screen-max-700:[&_tr]:w-[100%]
    employee-page:screen-max-700:[&_tr]:[border-top:1px_solid_var(--border)]
    employee-page:screen-max-700:[&_tr]:p-[17px_22px] employee-page:screen-max-700:[&_td]:grid
    employee-page:screen-max-700:[&_td]:grid-cols-[107px_minmax(0,_1fr)]
    employee-page:screen-max-700:[&_td]:gap-[10px] employee-page:screen-max-700:[&_td]:p-[8px_0]
    employee-page:screen-max-700:[&_td]:[border:0] employee-page:screen-max-700:[&_td]:min-w-[0]
    employee-page:screen-max-700:[&_td]:max-w-[none] employee-page:screen-max-700:[&_td:first-child]:grid
    employee-page:screen-max-700:[&_td:first-child]:grid-cols-[107px_minmax(0,_1fr)]
    employee-page:screen-max-700:[&_td:first-child]:gap-[10px]
    employee-page:screen-max-700:[&_td:first-child]:p-[8px_0]
    employee-page:screen-max-700:[&_td:first-child]:[border:0]
    employee-page:screen-max-700:[&_td:first-child]:min-w-[0]
    employee-page:screen-max-700:[&_td:first-child]:max-w-[none]
    employee-page:screen-max-700:[&_td::before]:[content:attr(data-label)]
    employee-page:screen-max-700:[&_td::before]:text-[length:10px]
    employee-page:screen-max-700:[&_td::before]:text-[color:var(--text-muted)]`}
        id="employee-career-history"
      >
        <caption className="sr-only">Your career milestones, newest effective date first</caption>
        <thead>
          <tr>
            <th scope="col">Effective date</th>
            <th scope="col">Milestone type</th>
            <th scope="col">Grade progression</th>
            <th scope="col">Description</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td data-label="Effective date">
                <time dateTime={record.effectiveDate}>{careerDateLabel(record.effectiveDate)}</time>
              </td>
              <td data-label="Milestone type">
                <span
                  className={String.raw`employee-page:inline-block employee-page:rounded-[20px] employee-page:p-[4px_9px]
    employee-page:text-[length:10px] employee-page:font-[650] employee-page:whitespace-nowrap
    employee-page:[&.career-type-promotion]:text-[color:#076755]
    employee-page:[&.career-type-promotion]:[background:#e0f5ed]
    employee-page:[&.career-type-step\_increment]:text-[color:#6d45a3]
    employee-page:[&.career-type-step\_increment]:[background:#f0e8fb]
    employee-page:[&.career-type-grade\_change]:text-[color:#245389]
    employee-page:[&.career-type-grade\_change]:[background:#e0ecfc]
    employee-page:[&.career-type-award\_milestone]:text-[color:#8d5700]
    employee-page:[&.career-type-award\_milestone]:[background:#fff5bf]
    employee-page:screen-max-700:[justify-self:start] employee-page:screen-max-700:whitespace-normal
    career-type career-type-${record.milestoneType.toLowerCase()}`}
                >
                  {MILESTONE_TYPES.find((type) => type.value === record.milestoneType).label}
                </span>
              </td>
              <td data-label="Grade progression">
                <div
                  className={String.raw`career-grade-change employee-page:flex employee-page:flex-wrap employee-page:items-center
    employee-page:gap-[5px_8px] employee-page:min-w-[130px] employee-page:max-w-[250px]
    employee-page:[overflow-wrap:anywhere] employee-page:[&_>_span]:text-[color:var(--text-muted)]
    employee-page:[&_strong]:text-[color:#087c42] employee-page:[&_strong]:font-[650]
    employee-page:screen-max-700:min-w-[0]`}
                >
                  <span>{record.previousGradeName || 'Not recorded'}</span>
                  <ArrowRight
                    size={14}
                    aria-label="to"
                  />
                  <strong>{record.newGradeName || 'Unchanged'}</strong>
                </div>
              </td>
              <td
                data-label="Description"
                className={String.raw`career-description employee-page:min-w-[210px] employee-page:max-w-[410px]
    employee-page:[overflow-wrap:anywhere] employee-page:[&_>_p]:whitespace-pre-wrap`}
              >
                <p>{record.description}</p>
                {record.reviewReason && (
                  <p
                    className={String.raw`career-review-reason employee-page:text-[color:#a64b0a] employee-page:text-[length:11px]
    employee-page:mt-[10px] employee-page:screen-max-700:[grid-column:2]`}
                  >
                    <strong>HR review:</strong> {record.reviewReason}
                  </p>
                )}
                <MilestoneCard record={record} />
              </td>
              <td data-label="Status">
                <span
                  className={String.raw`employee-page:inline-block employee-page:rounded-[20px] employee-page:p-[4px_9px]
    employee-page:text-[length:10px] employee-page:font-[650] employee-page:whitespace-nowrap
    employee-page:[&.career-status-applied]:text-[color:#087a58]
    employee-page:[&.career-status-applied]:[background:#e0f5e9]
    employee-page:[&.career-status-scheduled]:text-[color:#245389]
    employee-page:[&.career-status-scheduled]:[background:#eaf2fc]
    employee-page:[&.career-status-needs\_review]:text-[color:#a64b0a]
    employee-page:[&.career-status-needs\_review]:[background:#fff1df]
    employee-page:[&.career-status-historical]:text-[color:#527387]
    employee-page:[&.career-status-historical]:[background:#edf3f6]
    employee-page:[&.career-status-recorded]:text-[color:#527387]
    employee-page:[&.career-status-recorded]:[background:#edf3f6]
    employee-page:[&.career-status-cancelled]:text-[color:#a14c60]
    employee-page:[&.career-status-cancelled]:[background:#fcebef]
    employee-page:screen-max-700:[justify-self:start] employee-page:screen-max-700:whitespace-normal
    career-status career-status-${record.status.toLowerCase()}`}
                >
                  {CAREER_STATUS_LABELS[record.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
