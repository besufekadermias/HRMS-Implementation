import { RefreshCw, TrendingUp } from 'lucide-react'
import useCareer from '../../hooks/growth/useCareer.js'
import MilestoneTimeline from '../../components/career/MilestoneTimeline.jsx'

export default function CareerMilestones() {
  const { data, error, loading, refresh } = useCareer()
  return (
    <>
      <section
        className={String.raw`career-intro employee-page:flex employee-page:items-center employee-page:gap-[14px] employee-page:mb-[26px]
    employee-page:[&_>_div]:[flex:1] employee-page:[&_>_div]:min-w-[0]
    employee-page:[&_>_.icon-circle]:w-[49px] employee-page:[&_>_.icon-circle]:h-[49px]
    employee-page:[&_h1]:text-[length:clamp(23px,_1.85vw,_29px)] employee-page:[&_>_button]:[flex-shrink:0]
    employee-page:screen-max-700:flex-wrap employee-page:screen-max-700:items-start
    employee-page:screen-max-700:[&_>_button]:ml-[auto]
    employee-page:screen-max-700:[&_>_.icon-circle]:w-[40px]
    employee-page:screen-max-700:[&_>_.icon-circle]:h-[40px]
    employee-page:screen-max-700:[&_>_div]:[flex:1_1_calc(100%_-_54px)]`}
      >
        <span
          className={String.raw`icon-circle tone-green employee-base:w-[46px] employee-base:h-[46px] employee-base:inline-flex
    employee-base:items-center employee-base:justify-center employee-base:rounded-[50%]
    employee-base:[flex-shrink:0] employee-base:text-[color:#0b8972] employee-base:[background:#e3f5f0]`}
        >
          <TrendingUp size={26} />
        </span>
        <div>
          <p
            className={String.raw`eyebrow mb-2 employee-base:text-[length:10px] employee-base:font-[700] employee-base:tracking-[1.4px]
    employee-base:uppercase employee-base:text-[color:var(--primary)]
    employee-page:screen-max-480:text-[length:9px] employee-page:screen-max-480:tracking-[1.1px]`}
          >
            EMPLOYEE SERVICES
          </p>
          <h1>Career Milestones &amp; Progression</h1>
          <p
            className={String.raw`intro-description employee-base:mt-[9px] employee-base:text-[length:12px] employee-base:leading-[1.8]
    employee-base:text-[color:var(--text-secondary)]`}
          >
            Your promotions, grade adjustments, step increments, and official achievements.
          </p>
        </div>
        <button
          className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </section>
      {error && (
        <div
          className={String.raw`error-notice mb-5 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#b42344] employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
          role="alert"
        >
          <p>{error}</p>
          {data && <p className="mt-1">Previously loaded milestones are retained.</p>}
          <button
            className="mt-2 font-semibold underline"
            onClick={refresh}
            disabled={loading}
          >
            Try Again
          </button>
        </div>
      )}
      {!data ? (
        <section
          className={String.raw`surface career-empty employee-page:flex employee-page:min-h-[300px] employee-page:p-[48px_24px]
    employee-page:flex-col employee-page:justify-center employee-page:items-center employee-page:gap-[18px]
    employee-page:text-center employee-page:[&_>_svg]:text-[color:#a5b9c4]
    employee-page:[&_h2]:text-[length:17px] employee-page:[&_h2]:text-[color:var(--text-secondary)]
    employee-page:[&_p]:text-[color:var(--text-muted)] employee-page:[&_p]:text-[length:12px]
    employee-page:[&_p]:leading-[1.8] employee-page:[&_>_.reward-empty-icon]:text-[color:#d7b16a]
    employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)]`}
          aria-busy={loading}
        >
          <TrendingUp size={42} />
          <p role="status">
            {loading
              ? 'Loading your career milestones…'
              : 'Career records are currently unavailable.'}
          </p>
        </section>
      ) : data.records.length ? (
        <>
          <MilestoneTimeline records={data.records} />
          <p
            className={String.raw`career-footnote employee-page:m-[18px_2px_0] employee-page:text-[length:11px] employee-page:leading-[1.8]
    employee-page:text-[color:var(--text-muted)]`}
          >
            Scheduled plans and changes needing review do not update your current grade or salary.
            HR manages recording, application, and cancellation.
          </p>
        </>
      ) : (
        <section
          className={String.raw`surface career-empty employee-page:flex employee-page:min-h-[300px] employee-page:p-[48px_24px]
    employee-page:flex-col employee-page:justify-center employee-page:items-center employee-page:gap-[18px]
    employee-page:text-center employee-page:[&_>_svg]:text-[color:#a5b9c4]
    employee-page:[&_h2]:text-[length:17px] employee-page:[&_h2]:text-[color:var(--text-secondary)]
    employee-page:[&_p]:text-[color:var(--text-muted)] employee-page:[&_p]:text-[length:12px]
    employee-page:[&_p]:leading-[1.8] employee-page:[&_>_.reward-empty-icon]:text-[color:#d7b16a]
    employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)]`}
          aria-labelledby="career-empty-title"
        >
          <TrendingUp size={46} />
          <h2 id="career-empty-title">No career milestone changes logged yet.</h2>
          <p>Official milestones will appear here when HR records them.</p>
        </section>
      )}
    </>
  )
}
