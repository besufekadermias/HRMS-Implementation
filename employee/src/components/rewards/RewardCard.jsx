import { Award } from 'lucide-react'
import { AWARD_CATEGORIES } from '../../utils/validation/rewardSchemas.js'
import { careerDateLabel } from '../../utils/formatters/careerFormat.js'

export default function RewardCard({ record }) {
  return (
    <article
      className={String.raw`surface recognition-card employee-page:p-[25px] employee-page:[overflow-wrap:anywhere]
    employee-page:[&_h3]:text-[length:18px] employee-page:[&_h3]:leading-[1.6] employee-page:[&_h3]:mb-[5px]
    employee-page:[&_time]:text-[color:var(--text-muted)] employee-page:[&_time]:text-[length:11px]
    employee-page:[&_time]:leading-[1.8] employee-page:screen-max-700:p-[20px] employee-base:min-w-[0]
    employee-base:[border:1px_solid_var(--border)] employee-base:[background:var(--surface)]
    employee-base:rounded-[var(--card-radius)] employee-base:[box-shadow:var(--card-shadow)]`}
    >
      <div
        className={String.raw`recognition-card-top employee-page:flex employee-page:items-center employee-page:justify-between
    employee-page:gap-[12px] employee-page:mb-[20px]`}
      >
        <span
          className={String.raw`icon-circle tone-amber employee-base:w-[46px] employee-base:h-[46px] employee-base:inline-flex
    employee-base:items-center employee-base:justify-center employee-base:rounded-[50%]
    employee-base:[flex-shrink:0] employee-base:text-[color:#a36b0d] employee-base:[background:#fff5dd]`}
        >
          <Award size={24} />
        </span>
        <span
          className={String.raw`employee-page:p-[4px_10px] employee-page:rounded-[20px] employee-page:text-[length:10px]
    employee-page:font-[650] employee-page:[&.recognition-excellence]:[background:#e0f5ed]
    employee-page:[&.recognition-excellence]:text-[color:#076755]
    employee-page:[&.recognition-innovation]:[background:#fff5bf]
    employee-page:[&.recognition-innovation]:text-[color:#8d5700]
    employee-page:[&.recognition-long\_service]:[background:#f0e8fb]
    employee-page:[&.recognition-long\_service]:text-[color:#6d45a3]
    employee-page:[&.recognition-punctuality]:[background:#e0ecfc]
    employee-page:[&.recognition-punctuality]:text-[color:#245389] recognition-category recognition-${record.category.toLowerCase()}`}
        >
          {AWARD_CATEGORIES.find((category) => category.value === record.category).label}
        </span>
      </div>
      <h3>{record.title}</h3>
      <time dateTime={record.awardDate}>{careerDateLabel(record.awardDate)}</time>
      <p
        className={String.raw`recognition-description employee-page:mt-[15px] employee-page:whitespace-pre-wrap employee-page:leading-[1.9]
    employee-page:text-[length:12px] employee-page:text-[color:var(--text-secondary)]`}
      >
        {record.description || 'No additional description provided.'}
      </p>
    </article>
  )
}
