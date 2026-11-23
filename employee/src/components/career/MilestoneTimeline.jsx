import { useState } from 'react'
import { Search } from 'lucide-react'
import PromotionHistory from './PromotionHistory.jsx'
import { MILESTONE_TYPES, CAREER_STATUS_LABELS } from '../../utils/validation/careerSchemas.js'

export default function MilestoneTimeline({ records }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const filtered = records.filter(
    (record) =>
      (!type || record.milestoneType === type) &&
      (!status || record.status === status) &&
      [
        record.id,
        record.effectiveDate,
        record.description,
        record.previousGradeName,
        record.newGradeName,
        record.reviewReason,
        MILESTONE_TYPES.find((type) => type.value === record.milestoneType).label,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  )
  const pages = Math.max(1, Math.ceil(filtered.length / 8))
  const current = Math.min(page, pages)
  const reset = () => {
    setQuery('')
    setType('')
    setStatus('')
    setPage(1)
  }
  return (
    <section
      className={String.raw`surface career-history employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)]`}
      aria-labelledby="career-history-title"
    >
      <div
        className={String.raw`section-heading career-history-heading employee-page:p-[23px_24px_18px] employee-base:flex
    employee-base:items-start employee-base:justify-between employee-base:gap-[12px] employee-base:mb-[20px]
    employee-base:[&_h2]:flex employee-base:[&_h2]:items-center employee-base:[&_h2]:gap-[9px]
    employee-base:[&_h2_svg]:text-[color:var(--primary)] employee-base:[&_p]:mt-[6px]
    employee-base:[&_p]:text-[color:var(--text-muted)] employee-base:[&_p]:text-[length:12px]
    employee-base:[&_p]:leading-[1.5] employee-page:screen-max-768:[&_h2]:text-[length:15px]`}
      >
        <div>
          <h2 id="career-history-title">My career history</h2>
          <p>Official milestones recorded by HR</p>
        </div>
        <span
          className={String.raw`career-count employee-page:p-[4px_8px] employee-page:rounded-[5px] employee-page:[background:#eaf6f1]
    employee-page:text-[length:11px] employee-page:text-[color:var(--primary)] employee-page:whitespace-nowrap`}
        >
          {records.length} total
        </span>
      </div>
      <div
        className={String.raw`career-filters employee-page:flex employee-page:[align-items:end] employee-page:flex-wrap
    employee-page:gap-[14px] employee-page:p-[0_24px_20px] employee-page:[&_label]:m-[0]
    employee-page:[&_select]:block employee-page:[&_select]:mt-[6px]
    employee-page:[&_select]:p-[11px_27px_11px_12px] employee-page:[&_select]:[border:1px_solid_#d6e4e8]
    employee-page:[&_select]:rounded-[6px] employee-page:[&_select]:[background:white]
    employee-page:[&_select]:text-[length:12px] employee-page:[&_select]:text-[color:var(--text-secondary)]
    employee-page:screen-max-700:flex-col employee-page:screen-max-700:items-stretch
    employee-page:screen-max-700:[&_select]:w-[100%]`}
      >
        <label
          className={String.raw`career-search employee-page:relative employee-page:[flex:1] employee-page:min-w-[230px]
    employee-page:[&_svg]:absolute employee-page:[&_svg]:[left:12px] employee-page:[&_svg]:[top:13px]
    employee-page:[&_svg]:text-[color:var(--text-muted)] employee-page:[&_input]:pl-[37px]
    employee-page:screen-max-700:min-w-[0]`}
        >
          <span className="sr-only">Search career milestones</span>
          <Search size={17} />
          <input
            type="search"
            placeholder="Search type, grade, date, or description…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            aria-controls="employee-career-history"
          />
        </label>
        <label htmlFor="career-type">
          Milestone type
          <select
            id="career-type"
            value={type}
            onChange={(event) => {
              setType(event.target.value)
              setPage(1)
            }}
          >
            <option value="">All types</option>
            {MILESTONE_TYPES.map((type) => (
              <option
                key={type.value}
                value={type.value}
              >
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="career-status">
          Status
          <select
            id="career-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
          >
            <option value="">All statuses</option>
            {Object.entries(CAREER_STATUS_LABELS).map(([value, label]) => (
              <option
                key={value}
                value={value}
              >
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
          disabled={!query && !type && !status}
          onClick={reset}
        >
          Clear Filters
        </button>
      </div>
      {filtered.length ? (
        <PromotionHistory records={filtered.slice((current - 1) * 8, current * 8)} />
      ) : (
        <div
          className={String.raw`career-no-matches employee-page:grid employee-page:[justify-items:center] employee-page:p-[35px_24px]
    employee-page:gap-[14px] employee-page:text-[color:var(--text-muted)] employee-page:text-[length:12px]`}
        >
          <p>No career milestones match your filters.</p>
          <button
            className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
            onClick={reset}
          >
            Clear Filters
          </button>
        </div>
      )}
      <div
        className={String.raw`career-pagination employee-page:flex employee-page:items-center employee-page:justify-between
    employee-page:flex-wrap employee-page:gap-[12px] employee-page:p-[17px_24px]
    employee-page:text-[length:10px] employee-page:text-[color:var(--text-muted)] employee-page:[&_>_div]:flex
    employee-page:[&_>_div]:items-center employee-page:[&_>_div]:flex-wrap employee-page:[&_>_div]:gap-[12px]
    employee-page:[&_button]:min-h-[32px] employee-page:[&_button]:p-[6px_10px]
    employee-page:[&_button]:text-[length:11px]`}
      >
        <p role="status">
          {filtered.length
            ? `${(current - 1) * 8 + 1}–${Math.min(current * 8, filtered.length)} of ${filtered.length} milestones`
            : '0 milestones'}
        </p>
        <div>
          <button
            className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            Previous
          </button>
          <span>
            Page {current} of {pages}
          </span>
          <button
            className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
            disabled={current === pages}
            onClick={() => setPage(current + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
