import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock3, RefreshCw } from 'lucide-react'
import AttendanceLogTable from './AttendanceLogTable.jsx'
import { ATTENDANCE_STATUS_LABELS } from '../../utils/validation/attendanceSchemas.js'
import {
  EMPTY_ATTENDANCE_FILTERS,
  filterAttendanceRecords,
} from '../../utils/helpers/attendanceHistory.js'

export default function AttendanceHistory({ history }) {
  const { data, loading, error, refresh } = history
  const [filters, setFilters] = useState(EMPTY_ATTENDANCE_FILTERS)
  const [page, setPage] = useState(1)
  const records = data?.records || []
  const filtered = filterAttendanceRecords(records, filters)
  const invalidRange = !!(
    filters.startDate &&
    filters.endDate &&
    filters.startDate > filters.endDate
  )
  const pages = Math.max(1, Math.ceil(filtered.length / 10))
  const currentPage = Math.min(page, pages)
  const rows = filtered.slice((currentPage - 1) * 10, currentPage * 10)
  const hasFilters = Object.values(filters).some(Boolean)
  function change(name, value) {
    setFilters((state) => ({ ...state, [name]: value }))
    setPage(1)
  }
  return (
    <section
      className={String.raw`surface employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)]`}
      aria-labelledby="attendance-history-title"
      aria-busy={loading}
    >
      <div
        className={String.raw`content-card pb-0 employee-base:p-[22px_23px] employee-page:screen-max-768:p-[20px_17px]`}
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
            <h2 id="attendance-history-title">
              <Clock3 size={19} />
              Recent Attendance History
            </h2>
            <p>Latest 30 entries · Your workdays in East Africa Time (UTC+3)</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold text-primary hover:underline"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw size={14} />
            {loading ? 'Loading…' : 'Refresh History'}
          </button>
        </div>
        <div
          className={String.raw`attendance-history-filters employee-base:flex employee-base:items-end employee-base:flex-wrap
    employee-base:gap-[12px] employee-base:mb-[18px] employee-base:[&_>_label]:[flex:1_1_130px]
    employee-base:[&_>_label]:min-w-[0] employee-base:[&_>_label]:m-[0]
    employee-base:[&_>_label]:text-[length:11px] employee-base:[&_input]:mt-[7px]
    employee-base:[&_input]:w-[100%] employee-base:[&_input]:min-w-[0] employee-base:[&_input]:h-[40px]
    employee-base:[&_input]:p-[9px] employee-base:[&_input]:[border:1px_solid_#d6e4e8]
    employee-base:[&_input]:rounded-[6px] employee-base:[&_input]:[background:white]
    employee-base:[&_input]:text-[color:var(--text-secondary)] employee-base:[&_input]:text-[length:12px]
    employee-base:[&_select]:mt-[7px] employee-base:[&_select]:w-[100%] employee-base:[&_select]:min-w-[0]
    employee-base:[&_select]:h-[40px] employee-base:[&_select]:p-[9px]
    employee-base:[&_select]:[border:1px_solid_#d6e4e8] employee-base:[&_select]:rounded-[6px]
    employee-base:[&_select]:[background:white] employee-base:[&_select]:text-[color:var(--text-secondary)]
    employee-base:[&_select]:text-[length:12px] employee-base:[&_>_button]:min-h-[40px]
    employee-base:[&_>_button]:text-[length:11px] employee-page:screen-max-480:[&_input]:text-[length:16px]
    employee-page:screen-max-480:[&_select]:text-[length:16px]
    employee-page:screen-max-480:[&_>_button]:w-[100%]`}
        >
          <label htmlFor="attendance-from">
            From
            <input
              type="date"
              id="attendance-from"
              value={filters.startDate}
              onChange={(event) => change('startDate', event.target.value)}
              min="1900-01-01"
              max="2100-12-31"
              aria-invalid={invalidRange}
              aria-describedby={invalidRange ? 'attendance-range-error' : undefined}
              aria-controls="attendance-history-table"
            />
          </label>
          <label htmlFor="attendance-to">
            To
            <input
              type="date"
              id="attendance-to"
              value={filters.endDate}
              onChange={(event) => change('endDate', event.target.value)}
              min="1900-01-01"
              max="2100-12-31"
              aria-invalid={invalidRange}
              aria-describedby={invalidRange ? 'attendance-range-error' : undefined}
              aria-controls="attendance-history-table"
            />
          </label>
          <label htmlFor="attendance-status">
            Status
            <select
              id="attendance-status"
              value={filters.status}
              onChange={(event) => change('status', event.target.value)}
              aria-controls="attendance-history-table"
            >
              <option value="">All Statuses</option>
              {Object.entries(ATTENDANCE_STATUS_LABELS).map(([value, label]) => (
                <option
                  value={value}
                  key={value}
                >
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="attendance-completion">
            Completion
            <select
              id="attendance-completion"
              value={filters.completion}
              onChange={(event) => change('completion', event.target.value)}
              aria-controls="attendance-history-table"
            >
              <option value="">All Records</option>
              <option value="checked-out">Checked Out</option>
              <option value="checked-in">Check-in Only</option>
            </select>
          </label>
          <label htmlFor="attendance-verification">
            Verification
            <select
              id="attendance-verification"
              value={filters.verification}
              onChange={(event) => change('verification', event.target.value)}
              aria-controls="attendance-history-table"
            >
              <option value="">All Results</option>
              <option value="VERIFIED">Verified</option>
              <option value="UNVERIFIED">Unverified</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </label>
          <button
            type="button"
            className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
            disabled={!hasFilters}
            onClick={() => {
              setFilters(EMPTY_ATTENDANCE_FILTERS)
              setPage(1)
            }}
          >
            Clear Filters
          </button>
        </div>
        {invalidRange && (
          <p
            className={String.raw`field-error mt-0 mb-4 employee-base:mt-[8px] employee-base:text-[color:#b33450]
    employee-base:text-[length:12px] employee-base:leading-[1.7]`}
            id="attendance-range-error"
            role="alert"
          >
            The start date must be on or before the end date.
          </p>
        )}
        {error && (
          <div
            className={String.raw`error-notice mb-4 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#b42344] employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
            role="alert"
          >
            <p>{error}</p>
            {data && <p className="mt-1">The previously loaded records are shown below.</p>}
            <button
              type="button"
              className="mt-2 font-semibold underline"
              onClick={refresh}
              disabled={loading}
            >
              Try Again
            </button>
          </div>
        )}
        {data && (
          <p
            className="mb-4 text-[11px] text-muted"
            role="status"
          >
            {filtered.length} of {records.length} loaded records match. Filters apply to the latest
            30 entries.
          </p>
        )}
      </div>
      {!data && loading ? (
        <p
          className="px-6 pb-6 text-[12px] text-muted"
          role="status"
        >
          Loading your recent attendance history…
        </p>
      ) : data && rows.length ? (
        <AttendanceLogTable
          records={rows}
          timeZone={data.timeZone}
        />
      ) : (
        data && (
          <p
            className="px-6 pb-6 text-[12px] leading-[1.8] text-muted"
            role="status"
          >
            {invalidRange
              ? 'Choose a valid date range to view attendance records.'
              : records.length
                ? 'No attendance records match these filters.'
                : 'No attendance has been recorded yet.'}
          </p>
        )
      )}
      {!!filtered.length && (
        <nav
          className={String.raw`attendance-pagination employee-base:flex employee-base:flex-wrap employee-base:items-center
    employee-base:justify-end employee-base:gap-[10px] employee-base:[border-top:1px_solid_var(--border)]
    employee-base:p-[16px_22px] employee-base:[&_button]:min-h-[36px] employee-base:[&_button]:p-[7px_10px]
    employee-page:screen-max-480:[&_>_span:first-child]:[flex-basis:100%]`}
          aria-label="Attendance history pages"
        >
          <span className="mr-auto text-[11px] text-muted">
            Showing {(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, filtered.length)} of{' '}
            {filtered.length} records
          </span>
          <button
            type="button"
            className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
            aria-label="Previous attendance page"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className="text-[12px]"
            aria-live="polite"
          >
            Page {currentPage} of {pages}
          </span>
          <button
            type="button"
            className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
            aria-label="Next attendance page"
            disabled={currentPage >= pages}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </section>
  )
}
