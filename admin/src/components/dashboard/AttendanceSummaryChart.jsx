import Card from '../common/Card.jsx'
import { TextButton } from '../common/Button.jsx'
import { useId, useState } from 'react'
import Icon from '../common/Icon.jsx'
import formatDate from '../../utils/formatters/formatDate.js'

const series = [
  { key: 'present', label: 'Present', color: '#00b56b' },
  { key: 'absent', label: 'Absent', color: '#ff3e68' },
  { key: 'late', label: 'Late', color: '#ffbc3d' },
]
const x = (index) => 12 + index * 96
const y = (value) => 200 - (value / 50) * 190

export default function AttendanceSummaryChart({ attendanceDays, onViewLog }) {
  const [activeDay, setActiveDay] = useState(null)
  const chartId = useId()
  const areaId = `${chartId}-area`
  const tooltipId = `${chartId}-tooltip`
  // Separate recorded days into segments so missing records do not become zeros.
  const segments = []
  attendanceDays.forEach((day, index) => {
    if (!day.hasData) return
    if (index === 0 || !attendanceDays[index - 1].hasData) segments.push([])
    segments.at(-1).push({ ...day, index })
  })
  const dayLabel = date => formatDate(date, { year: undefined, month: 'short', day: 'numeric' })

  return (
    <Card
      className={`attendance-card attendance-overview-card tw:p-[21px_23px_18px] tw:mb-[20px] tw:[.dashboard-middle>&]:p-[18px_16px]
        tw:[.dashboard-middle>&]:flex tw:[.dashboard-middle>&]:flex-col tw:[.dashboard-middle>&]:mb-[0]
        tw:max-[768px]:p-[19px_17px] tw:max-[768px]:mb-[16px] `}
      aria-labelledby="attendance-title"
    >
      <div className={`section-heading tw:[.dashboard-middle_.attendance-overview-card>&]:flex-wrap
          tw:[.dashboard-middle_.attendance-overview-card>&]:gap-[12px]
          tw:[.attendance-overview-card>&]:items-center tw:max-[480px]:[.attendance-overview-card>&]:items-start
          tw:max-[480px]:[.attendance-overview-card>&]:flex-col
          tw:max-[480px]:[.attendance-overview-card>&]:gap-[14px] tw:max-[480px]:[.attendance-card_&]:flex-wrap
          tw:shared-base:flex tw:shared-base:justify-between tw:shared-base:items-start tw:shared-base:gap-[12px]
          tw:shared-base:mb-[20px] tw:shared-base:[&_h2]:flex tw:shared-base:[&_h2]:items-center
          tw:shared-base:[&_h2]:gap-[9px] tw:shared-base:[&_h2_>_svg]:[color:var(--primary)]
          tw:shared-base:[&_p]:[color:var(--text-muted)] tw:shared-base:[&_p]:text-[12px]
          tw:shared-base:[&_p]:mt-[6px] tw:shared-base:[&_p]:leading-[1.5]
          tw:max-[768px]:shared-base:[&_h2]:text-[15px]
          tw:max-[768px]:shared-base:gap-[8px] tw:max-[768px]:shared-base:[&_p]:text-[11px] `}>
        <div>
          <h2 id="attendance-title">Attendance Overview</h2>
          <p>
            Last 7 days{' '}
          </p>
        </div>
        <div className={`chart-legend tw:flex tw:items-center tw:gap-[17px] tw:flex-wrap tw:text-[var(--text-muted)] tw:text-[10px]
          tw:[.dashboard-middle_&]:gap-[12px] tw:max-[480px]:gap-[12px] tw:max-[480px]:text-[9px] `} aria-label="Attendance chart legend">
          {series.map((item) => (
            <span className="tw:flex tw:items-center tw:gap-[5px]" key={item.key}>
              <i className="tw:w-[6px] tw:h-[6px] tw:rounded-[50%]" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div className={`attendance-line-chart tw:[.dashboard-middle_&]:flex-[1]
          tw:[.dashboard-middle_&]:grid-rows-[minmax(210px,_1fr)_auto] tw:grid tw:grid-cols-[28px_minmax(0,_1fr)]
          tw:gap-[9px_5px] `}>
        <div className={`attendance-y-axis tw:[.dashboard-middle_&]:h-[100%] tw:[.dashboard-middle_&]:min-h-[210px] tw:h-[210px]
          tw:p-[4px_0] tw:flex tw:flex-col tw:justify-between tw:text-[var(--text-secondary)] tw:text-[11px]
          tw:leading-[12px] `} aria-hidden="true">
          {[50, 40, 30, 20, 10, 0].map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
        <div
          className="attendance-series-canvas tw:[.dashboard-middle_&]:h-[100%] tw:[.dashboard-middle_&]:min-h-[210px] tw:relative
            tw:h-[210px] tw:min-w-[0]"
          onMouseLeave={() => setActiveDay(null)}
        >
          <svg className="tw:block tw:w-[100%] tw:h-[100%]"
            viewBox="0 0 600 210"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.17" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[50, 40, 30, 20, 10, 0].map((value) => (
              <line
                key={value}
                x1="12"
                y1={y(value)}
                x2="588"
                y2={y(value)}
                stroke="#eaf1f5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {attendanceDays.map((day, index) => (
              <line
                key={day.date}
                x1={x(index)}
                y1="10"
                x2={x(index)}
                y2="200"
                stroke="#eef3f6"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {segments.map(segment => (
              <polygon
                key={segment[0].date}
                points={`${x(segment[0].index)},200 ${segment.map(day => `${x(day.index)},${y(day.present)}`).join(' ')} ${x(segment.at(-1).index)},200`}
                fill={`url(#${areaId})`}
              />
            ))}
            {series.flatMap(item => segments.map(segment => (
              <polyline
                key={`${item.key}-${segment[0].date}`}
                points={segment
                  .map(day => `${x(day.index)},${y(day[item.key])}`)
                  .join(' ')}
                fill="none"
                stroke={item.color}
                strokeWidth="1.7"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )))}
          </svg>
          {attendanceDays.map((day, index) => (
            <button
              key={day.date}
              type="button"
              className={`attendance-day tw:absolute tw:top-[0] tw:bottom-[0] tw:[transform:translateX(-50%)] tw:w-[24px] tw:p-[0]
          tw:[border:0] tw:rounded-[3px] tw:bg-[transparent] tw:hover:before:[content:''] tw:hover:before:absolute
          tw:hover:before:left-[50%] tw:hover:before:top-[10px] tw:hover:before:bottom-[10px]
          tw:hover:before:[border-left:1px_dashed_#bfd5d0] tw:focus-visible:before:[content:'']
          tw:focus-visible:before:absolute tw:focus-visible:before:left-[50%] tw:focus-visible:before:top-[10px]
          tw:focus-visible:before:bottom-[10px] tw:focus-visible:before:[border-left:1px_dashed_#bfd5d0] `}
              style={{ left: `${x(index) / 6}%` }}
              aria-label={day.hasData
                ? `${dayLabel(day.date)}: ${day.present} present, ${day.absent} absent, ${day.late} late`
                : `${dayLabel(day.date)}: No attendance records`}
              aria-describedby={activeDay === index ? tooltipId : undefined}
              onMouseEnter={() => setActiveDay(index)}
              onFocus={() => setActiveDay(index)}
              onBlur={() => setActiveDay(null)}
              onClick={() => setActiveDay(index)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setActiveDay(null)
              }}
            >
              {day.hasData && series.map((item) => (
                <span
                  key={item.key}
                  className="attendance-point tw:absolute tw:left-[50%] tw:[transform:translate(-50%,_-50%)] tw:w-[6px] tw:h-[6px]
          tw:rounded-[50%] tw:[border:1px_solid_white]"
                  style={{
                    top: `${y(day[item.key]) / 2.1}%`,
                    background: item.color,
                  }}
                />
              ))}
            </button>
          ))}
          {activeDay !== null && (
            <div
              className={`attendance-data-tooltip tw:absolute tw:top-[7px] tw:z-[2] tw:w-[158px] tw:p-[11px_13px]
          tw:[transform:translateX(-50%)] tw:[border:1px_solid_var(--border)] tw:rounded-[7px] tw:bg-[white]
          tw:shadow-[0_4px_18px_#123f3b20] tw:pointer-events-none tw:text-[11px] `}
              id={tooltipId}
              role="tooltip"
              style={{
                left: `clamp(85px, ${x(activeDay) / 6}%, calc(100% - 85px))`,
              }}
            >
              <strong className="tw:block tw:mb-[9px]">{dayLabel(attendanceDays[activeDay].date)}{!attendanceDays[activeDay].hasData && ' · No data'}</strong>
              {series.map((item) => (
                <span className="tw:flex tw:items-center tw:gap-[7px] tw:mt-[6px] tw:text-[var(--text-secondary)]" key={item.key}>
                  <i className="tw:w-[7px] tw:h-[7px] tw:shrink-[0] tw:rounded-[50%]" style={{ background: item.color }} />
                  {item.label}
                  <b className="tw:ml-[auto]">{attendanceDays[activeDay].hasData ? attendanceDays[activeDay][item.key] : '—'}</b>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="attendance-x-axis tw:[grid-column:2] tw:flex tw:justify-between tw:text-[var(--text-secondary)] tw:text-[10px]" aria-hidden="true">
          {attendanceDays.map((day) => (
            <span key={day.date}>{dayLabel(day.date)}</span>
          ))}
        </div>
      </div>
      <div className={`attendance-overview-footer tw:[.dashboard-middle_&]:flex-wrap tw:[.dashboard-middle_&]:gap-[4px_10px] tw:flex
          tw:items-center tw:justify-between tw:gap-[12px] tw:pt-[10px] tw:max-[480px]:flex-wrap
          tw:max-[480px]:gap-[4px] `}>
        <span className="tw:text-[10px] tw:text-[var(--text-muted)]">{dayLabel(attendanceDays[0].date)}–{formatDate(attendanceDays[6].date, { month: 'short', day: 'numeric' })}</span>
        <TextButton onClick={onViewLog}>
          View Full Log
          <Icon name="arrow" size={17} />
        </TextButton>
      </div>
    </Card>
  )
}
