import { useState } from 'react'
import { Search } from 'lucide-react'
import LeaveStatusBadge from './LeaveStatusBadge.jsx'
import { leaveDateLabel, leaveTimestampLabel } from '../../utils/helpers/leaveRules.js'

export default function LeaveHistoryTable({ requests }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)
  const filtered = requests.filter(
    (record) =>
      (status === 'ALL' || record.status === status) &&
      `${record.id} ${record.reason} ${record.startDate} ${record.endDate}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  )
  const pages = Math.max(1, Math.ceil(filtered.length / 8))
  const currentPage = Math.min(page, pages)
  const visible = filtered.slice((currentPage - 1) * 8, currentPage * 8)
  return (
    <section
      className={String.raw`surface leave-history employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)]`}
      aria-labelledby="leave-history-title"
    >
      <div
        className={String.raw`section-heading leave-history-heading employee-page:p-[22px_24px_18px] employee-base:flex
    employee-base:items-start employee-base:justify-between employee-base:gap-[12px] employee-base:mb-[20px]
    employee-base:[&_h2]:flex employee-base:[&_h2]:items-center employee-base:[&_h2]:gap-[9px]
    employee-base:[&_h2_svg]:text-[color:var(--primary)] employee-base:[&_p]:mt-[6px]
    employee-base:[&_p]:text-[color:var(--text-muted)] employee-base:[&_p]:text-[length:12px]
    employee-base:[&_p]:leading-[1.5] employee-page:screen-max-768:[&_h2]:text-[length:15px]`}
      >
        <div>
          <h2 id="leave-history-title">My leave applications</h2>
          <p>Follow your requests and HR decisions</p>
        </div>
        <span
          className={String.raw`leave-count employee-page:rounded-[5px] employee-page:p-[4px_8px] employee-page:[background:#eaf6f1]
    employee-page:text-[color:var(--primary)] employee-page:text-[length:11px]`}
        >
          {requests.length} total
        </span>
      </div>
      <div
        className={String.raw`leave-filters employee-page:flex employee-page:[align-items:end] employee-page:gap-[16px]
    employee-page:p-[0_24px_20px] employee-page:screen-max-700:items-stretch
    employee-page:screen-max-700:flex-col`}
      >
        <label
          className={String.raw`leave-search employee-page:relative employee-page:[flex:1] employee-page:max-w-[420px] employee-page:m-[0]
    employee-page:[&_svg]:absolute employee-page:[&_svg]:[top:13px] employee-page:[&_svg]:[left:12px]
    employee-page:[&_svg]:text-[color:var(--text-muted)] employee-page:[&_input]:pl-[38px]
    employee-page:screen-max-700:max-w-[none]`}
        >
          <span className="sr-only">Search leave applications</span>
          <Search size={17} />
          <input
            type="search"
            placeholder="Search reason, ID, or dates…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
          />
        </label>
        <label
          className={String.raw`leave-filter-label employee-page:flex employee-page:items-center employee-page:gap-[10px] employee-page:m-[0]
    employee-page:[&_select]:p-[10px_28px_10px_12px] employee-page:[&_select]:[border:1px_solid_#d6e4e8]
    employee-page:[&_select]:rounded-[6px] employee-page:[&_select]:[background:white]
    employee-page:[&_select]:text-[length:12px] employee-page:[&_select]:text-[color:var(--text-secondary)]
    employee-page:screen-max-700:[&_select]:[flex:1]`}
        >
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </label>
      </div>
      {visible.length ? (
        <div className={String.raw`leave-table-wrap employee-page:overflow-x-auto`}>
          <table
            className={String.raw`leave-table employee-page:w-[100%] employee-page:border-collapse employee-page:text-[length:12px]
    employee-page:text-left employee-page:[&_th]:p-[14px_20px] employee-page:[&_th]:[background:#f5f9fa]
    employee-page:[&_th]:[border-block:1px_solid_var(--border)]
    employee-page:[&_th]:text-[color:var(--text-muted)] employee-page:[&_th]:text-[length:10px]
    employee-page:[&_th]:font-[600] employee-page:[&_th]:tracking-[0.5px] employee-page:[&_th]:uppercase
    employee-page:[&_th]:whitespace-nowrap employee-page:[&_td]:p-[19px_20px]
    employee-page:[&_td]:[border-bottom:1px_solid_var(--border)] employee-page:[&_td]:align-top
    employee-page:[&_th:first-child]:pl-[24px] employee-page:[&_td:first-child]:pl-[24px]
    employee-page:screen-max-1100:[&_td]:[padding-inline:14px]
    employee-page:screen-max-1100:[&_th]:[padding-inline:14px] employee-page:screen-max-700:[&_thead]:hidden
    employee-page:screen-max-700:block employee-page:screen-max-700:w-[100%]
    employee-page:screen-max-700:[&_tbody]:block employee-page:screen-max-700:[&_tbody]:w-[100%]
    employee-page:screen-max-700:[&_tr]:block employee-page:screen-max-700:[&_tr]:w-[100%]
    employee-page:screen-max-700:[&_tr]:p-[16px_22px]
    employee-page:screen-max-700:[&_tr]:[border-top:1px_solid_var(--border)]
    employee-page:screen-max-700:[&_td]:p-[7px_0] employee-page:screen-max-700:[&_td]:[border:0]
    employee-page:screen-max-700:[&_td]:grid
    employee-page:screen-max-700:[&_td]:grid-cols-[112px_minmax(0,_1fr)]
    employee-page:screen-max-700:[&_td]:gap-[10px] employee-page:screen-max-700:[&_td]:max-w-[none]
    employee-page:screen-max-700:[&_td]:min-w-[0] employee-page:screen-max-700:[&_td:first-child]:p-[7px_0]
    employee-page:screen-max-700:[&_td:first-child]:[border:0]
    employee-page:screen-max-700:[&_td:first-child]:grid
    employee-page:screen-max-700:[&_td:first-child]:grid-cols-[112px_minmax(0,_1fr)]
    employee-page:screen-max-700:[&_td:first-child]:gap-[10px]
    employee-page:screen-max-700:[&_td:first-child]:max-w-[none]
    employee-page:screen-max-700:[&_td:first-child]:min-w-[0]
    employee-page:screen-max-700:[&_td::before]:[content:attr(data-label)]
    employee-page:screen-max-700:[&_td::before]:text-[color:var(--text-muted)]
    employee-page:screen-max-700:[&_td::before]:text-[length:10px]
    employee-page:screen-max-700:[&_.leave-counting]:[grid-column:2]
    employee-page:screen-max-700:[&_.leave-counting]:mt-[0]
    employee-page:screen-max-700:[&_details]:[grid-column:2] employee-page:screen-max-700:[&_details]:mt-[0]`}
          >
            <caption className="sr-only">Your leave applications, newest submissions first</caption>
            <thead>
              <tr>
                <th scope="col">Leave ID</th>
                <th scope="col">Start date</th>
                <th scope="col">End date</th>
                <th scope="col">Days requested</th>
                <th scope="col">Reason & decision</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((record) => (
                <tr key={record.id}>
                  <td data-label="Leave ID">
                    <span
                      className={String.raw`leave-id employee-page:block employee-page:max-w-[120px] employee-page:[overflow-wrap:anywhere]
    employee-page:text-[length:10px] employee-page:text-[color:var(--text-muted)]
    employee-page:screen-max-700:max-w-[none]`}
                    >
                      {record.id}
                    </span>
                  </td>
                  <td data-label="Start date">{leaveDateLabel(record.startDate)}</td>
                  <td data-label="End date">{leaveDateLabel(record.endDate)}</td>
                  <td data-label="Days requested">
                    <span
                      className={String.raw`leave-days employee-page:inline-block employee-page:p-[3px_7px] employee-page:rounded-[4px]
    employee-page:[background:#edf5fb] employee-page:text-[color:#356882] employee-page:whitespace-nowrap
    employee-page:font-[600] employee-page:screen-max-700:[justify-self:start]`}
                    >
                      {record.daysRequested} {record.daysRequested === 1 ? 'day' : 'days'}
                    </span>
                    {record.dayCounting && (
                      <small
                        className={String.raw`leave-counting employee-page:block employee-page:mt-[5px] employee-page:text-[length:10px]
    employee-page:text-[color:var(--text-muted)]`}
                      >
                        {record.dayCounting === 'weekdays' ? 'Mon–Fri' : 'Calendar'}
                      </small>
                    )}
                  </td>
                  <td
                    data-label="Reason & decision"
                    className={String.raw`leave-reason employee-page:min-w-[180px] employee-page:max-w-[340px] employee-page:[overflow-wrap:anywhere]
    employee-page:[&_details]:mt-[8px] employee-page:[&_details]:text-[length:10px]
    employee-page:[&_details]:text-[color:var(--text-muted)] employee-page:[&_details]:leading-[1.8]
    employee-page:[&_summary]:cursor-pointer employee-page:[&_summary]:text-[color:var(--primary)]`}
                  >
                    <p>{record.reason || 'Not provided'}</p>
                    <details>
                      <summary>Request details</summary>
                      <p>
                        Submitted: {leaveTimestampLabel(record.createdAt)}
                        {record.createdAt && ' EAT'}
                      </p>
                      {record.status !== 'PENDING' && (
                        <>
                          <p>
                            Decision: {leaveTimestampLabel(record.decidedAt)}
                            {record.decidedAt && ' EAT'}
                          </p>
                          <p>HR note: {record.decisionNote || 'No note provided'}</p>
                        </>
                      )}
                    </details>
                  </td>
                  <td data-label="Status">
                    <LeaveStatusBadge status={record.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p
          className={String.raw`leave-empty employee-page:p-[35px_24px] employee-page:text-center employee-page:text-[length:12px]
    employee-page:text-[color:var(--text-muted)]`}
        >
          {requests.length
            ? 'No leave applications match your filters.'
            : 'You have no leave applications yet. Submit a request to begin.'}
        </p>
      )}
      <div
        className={String.raw`leave-pagination employee-page:p-[16px_24px] employee-page:flex employee-page:items-center
    employee-page:justify-between employee-page:flex-wrap employee-page:gap-[12px]
    employee-page:text-[length:10px] employee-page:text-[color:var(--text-muted)]
    employee-page:[&_.secondary-button]:min-h-[32px] employee-page:[&_.secondary-button]:p-[6px_10px]
    employee-page:[&_.secondary-button]:text-[length:11px]`}
      >
        <p>
          {filtered.length
            ? `${(currentPage - 1) * 8 + 1}–${Math.min(currentPage * 8, filtered.length)} of ${filtered.length} applications`
            : '0 applications'}
        </p>
        <div className="flex items-center gap-3">
          <button
            className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {pages}
          </span>
          <button
            className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
            disabled={currentPage === pages}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
