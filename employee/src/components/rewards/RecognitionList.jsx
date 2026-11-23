import { useState } from 'react'
import { Search } from 'lucide-react'
import RewardCard from './RewardCard.jsx'
import { AWARD_CATEGORIES } from '../../utils/validation/rewardSchemas.js'

export default function RecognitionList({ records }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const filtered = records.filter(
    (record) =>
      (!category || record.category === category) &&
      `${record.title} ${record.description} ${record.awardDate}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  )
  const pages = Math.max(1, Math.ceil(filtered.length / 8))
  const current = Math.min(page, pages)
  return (
    <section aria-label="My recognitions">
      <div
        className={String.raw`career-filters reward-filters employee-page:flex employee-page:[align-items:end] employee-page:flex-wrap
    employee-page:gap-[14px] employee-page:p-[0_24px_20px] employee-page:[padding-inline:0]
    employee-page:[&_label]:m-[0] employee-page:[&_select]:block employee-page:[&_select]:mt-[6px]
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
          <span className="sr-only">Search recognitions</span>
          <Search size={17} />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Search award title, description, or date…"
          />
        </label>
        <label htmlFor="reward-category">
          Award category
          <select
            id="reward-category"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value)
              setPage(1)
            }}
          >
            <option value="">All categories</option>
            {AWARD_CATEGORIES.map((category) => (
              <option
                value={category.value}
                key={category.value}
              >
                {category.label}
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
          disabled={!query && !category}
          onClick={() => {
            setQuery('')
            setCategory('')
            setPage(1)
          }}
        >
          Clear Filters
        </button>
      </div>
      <p
        role="status"
        className={String.raw`report-hint mb-4 employee-page:text-[color:var(--text-muted)] employee-page:text-[length:11px]
    employee-page:leading-[1.8]`}
      >
        {filtered.length} of {records.length} recognitions
      </p>
      {filtered.length ? (
        <div
          className={String.raw`recognition-grid employee-page:grid employee-page:grid-cols-[repeat(2,_minmax(0,_1fr))]
    employee-page:gap-[18px] employee-page:screen-max-700:grid-cols-[1fr]`}
        >
          {filtered.slice((current - 1) * 8, current * 8).map((record) => (
            <RewardCard
              record={record}
              key={record.id}
            />
          ))}
        </div>
      ) : (
        <p
          className={String.raw`surface report-empty employee-page:p-[40px_24px] employee-page:text-center
    employee-page:text-[color:var(--text-muted)] employee-page:text-[length:12px] employee-base:min-w-[0]
    employee-base:[border:1px_solid_var(--border)] employee-base:[background:var(--surface)]
    employee-base:rounded-[var(--card-radius)] employee-base:[box-shadow:var(--card-shadow)]`}
        >
          No recognitions match your filters.
        </p>
      )}
      <div
        className={String.raw`career-pagination employee-page:flex employee-page:items-center employee-page:justify-between
    employee-page:flex-wrap employee-page:gap-[12px] employee-page:p-[17px_24px]
    employee-page:text-[length:10px] employee-page:text-[color:var(--text-muted)] employee-page:[&_>_div]:flex
    employee-page:[&_>_div]:items-center employee-page:[&_>_div]:flex-wrap employee-page:[&_>_div]:gap-[12px]
    employee-page:[&_button]:min-h-[32px] employee-page:[&_button]:p-[6px_10px]
    employee-page:[&_button]:text-[length:11px]`}
      >
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
