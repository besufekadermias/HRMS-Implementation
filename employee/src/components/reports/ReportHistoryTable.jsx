import { useState } from 'react'
import { Search } from 'lucide-react'
import { careerDateLabel } from '../../utils/formatters/careerFormat.js'

export default function ReportHistoryTable({ records, onView }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const filtered = records.filter((record) =>
    `${record.id} ${record.title} ${record.content} ${record.date}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  )
  const pages = Math.max(1, Math.ceil(filtered.length / 8))
  const current = Math.min(page, pages)
  return (
    <section
      className={String.raw`surface employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)]`}
      aria-labelledby="reports-history-title"
    >
      <div
        className={String.raw`content-card employee-base:p-[22px_23px] employee-page:screen-max-768:p-[20px_17px]`}
      >
        <div
          className={String.raw`section-heading employee-base:flex employee-base:items-start employee-base:justify-between
    employee-base:gap-[12px] employee-base:mb-[20px] employee-base:[&_h2]:flex
    employee-base:[&_h2]:items-center employee-base:[&_h2]:gap-[9px]
    employee-base:[&_h2_svg]:text-[color:var(--primary)] employee-base:[&_p]:mt-[6px]
    employee-base:[&_p]:text-[color:var(--text-muted)] employee-base:[&_p]:text-[length:12px]
    employee-base:[&_p]:leading-[1.5] employee-page:screen-max-768:[&_h2]:text-[length:15px]`}
        >
          <div>
            <h2 id="reports-history-title">My submitted reports</h2>
            <p>Submissions saved for HR management</p>
          </div>
          <span
            className={String.raw`career-count employee-page:p-[4px_8px] employee-page:rounded-[5px] employee-page:[background:#eaf6f1]
    employee-page:text-[length:11px] employee-page:text-[color:var(--primary)] employee-page:whitespace-nowrap`}
          >
            {records.length} total
          </span>
        </div>
        <label
          className={String.raw`career-search block employee-page:relative employee-page:[flex:1] employee-page:min-w-[230px]
    employee-page:[&_svg]:absolute employee-page:[&_svg]:[left:12px] employee-page:[&_svg]:[top:13px]
    employee-page:[&_svg]:text-[color:var(--text-muted)] employee-page:[&_input]:pl-[37px]
    employee-page:screen-max-700:min-w-[0]`}
        >
          <span className="sr-only">Search my reports</span>
          <Search size={17} />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Search title, content, ID, or date…"
          />
        </label>
      </div>
      {filtered.length ? (
        <div className={String.raw`career-history-scroll employee-page:overflow-x-auto`}>
          <table
            className={String.raw`career-history-table report-history-table employee-page:w-[100%] employee-page:border-collapse
    employee-page:text-left employee-page:text-[length:12px] employee-page:[&_th]:[background:#f6f9fb]
    employee-page:[&_th]:p-[15px_20px] employee-page:[&_th]:[border-block:1px_solid_var(--border)]
    employee-page:[&_th]:text-[length:10px] employee-page:[&_th]:text-[color:var(--text-muted)]
    employee-page:[&_th]:tracking-[0.5px] employee-page:[&_th]:font-[600] employee-page:[&_th]:uppercase
    employee-page:[&_th]:whitespace-nowrap employee-page:[&_td]:p-[22px_20px]
    employee-page:[&_td]:[border-bottom:1px_solid_var(--border)] employee-page:[&_td]:align-top
    employee-page:[&_td]:leading-[1.7] employee-page:[&_td]:[overflow-wrap:anywhere]
    employee-page:[&_td:first-child]:pl-[24px] employee-page:[&_th:first-child]:pl-[24px]
    employee-page:[&_time]:whitespace-nowrap employee-page:screen-max-700:[&_thead]:hidden
    employee-page:screen-max-700:block employee-page:screen-max-700:w-[100%]
    employee-page:screen-max-700:[&_tbody]:block employee-page:screen-max-700:[&_tbody]:w-[100%]
    employee-page:screen-max-700:[&_tr]:block employee-page:screen-max-700:[&_tr]:w-[100%]
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
    employee-page:screen-max-700:[&_td::before]:text-[color:var(--text-muted)]
    employee-page:screen-max-700:[&_strong]:[justify-self:start]
    employee-page:screen-max-700:[&_.report-link]:[justify-self:start]`}
          >
            <caption className="sr-only">Your employee submissions, newest first</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Report title</th>
                <th scope="col">Category</th>
                <th scope="col">Attachment</th>
                <th scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((current - 1) * 8, current * 8).map((record) => (
                <tr key={record.id}>
                  <td data-label="Date">{careerDateLabel(record.date)}</td>
                  <td data-label="Report title">
                    <strong>{record.title}</strong>
                  </td>
                  <td data-label="Category">Employee Submission</td>
                  <td data-label="Attachment">{record.attachmentUrl ? 'Link provided' : 'None'}</td>
                  <td data-label="Details">
                    <button
                      className={String.raw`report-link employee-page:inline-flex employee-page:gap-[7px] employee-page:items-center
    employee-page:text-[length:11px] employee-page:font-[600] employee-page:text-[color:#245a91]
    employee-page:[text-decoration:underline]`}
                      onClick={() => onView(record)}
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p
          className={String.raw`report-empty employee-page:p-[40px_24px] employee-page:text-center
    employee-page:text-[color:var(--text-muted)] employee-page:text-[length:12px]`}
        >
          {records.length
            ? 'No reports match your search.'
            : 'No reports submitted yet. Send your first report to HR.'}
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
        <p role="status">{filtered.length} reports</p>
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
