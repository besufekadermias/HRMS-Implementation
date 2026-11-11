import { useId, useState } from 'react'
import Icon from '../common/Icon.jsx'

// Illustrative values read from the teal design, not live attendance records.
const attendanceDays = [
  { date: 'Oct 19', present: 39, absent: 10, late: 6 },
  { date: 'Oct 20', present: 35, absent: 14, late: 7 },
  { date: 'Oct 21', present: 37, absent: 10, late: 6 },
  { date: 'Oct 22', present: 34, absent: 11, late: 5 },
  { date: 'Oct 23', present: 40, absent: 14, late: 7 },
  { date: 'Oct 24', present: 37, absent: 10, late: 6 },
  { date: 'Oct 25', present: 42, absent: 14, late: 5 },
]
const series = [
  { key: 'present', label: 'Present', color: '#00b56b' },
  { key: 'absent', label: 'Absent', color: '#ff3e68' },
  { key: 'late', label: 'Late', color: '#ffbc3d' },
]
const x = (index) => 12 + index * 96
const y = (value) => 200 - (value / 50) * 190

export default function AttendanceSummaryChart({ onViewLog }) {
  const [activeDay, setActiveDay] = useState(null)
  const chartId = useId()
  const areaId = `${chartId}-area`
  const tooltipId = `${chartId}-tooltip`
  const presentPoints = attendanceDays
    .map((day, index) => `${x(index)},${y(day.present)}`)
    .join(' ')

  return (
    <section
      className="card attendance-card attendance-overview-card"
      aria-labelledby="attendance-title"
    >
      <div className="section-heading">
        <div>
          <h2 id="attendance-title">Attendance Overview</h2>
          <p>
            Last 7 days{' '}
          </p>
        </div>
        <div className="chart-legend" aria-label="Attendance chart legend">
          {series.map((item) => (
            <span key={item.key}>
              <i style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div className="attendance-line-chart">
        <div className="attendance-y-axis" aria-hidden="true">
          {[50, 40, 30, 20, 10, 0].map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
        <div
          className="attendance-series-canvas"
          onMouseLeave={() => setActiveDay(null)}
        >
          <svg
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
            <polygon
              points={`12,200 ${presentPoints} 588,200`}
              fill={`url(#${areaId})`}
            />
            {series.map((item) => (
              <polyline
                key={item.key}
                points={attendanceDays
                  .map((day, index) => `${x(index)},${y(day[item.key])}`)
                  .join(' ')}
                fill="none"
                stroke={item.color}
                strokeWidth="1.7"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          {attendanceDays.map((day, index) => (
            <button
              key={day.date}
              type="button"
              className="attendance-day"
              style={{ left: `${x(index) / 6}%` }}
              aria-label={`${day.date}: ${day.present} present, ${day.absent} absent, ${day.late} late`}
              aria-describedby={activeDay === index ? tooltipId : undefined}
              onMouseEnter={() => setActiveDay(index)}
              onFocus={() => setActiveDay(index)}
              onBlur={() => setActiveDay(null)}
              onClick={() => setActiveDay(index)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setActiveDay(null)
              }}
            >
              {series.map((item) => (
                <span
                  key={item.key}
                  className="attendance-point"
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
              className="attendance-data-tooltip"
              id={tooltipId}
              role="tooltip"
              style={{
                left: `clamp(85px, ${x(activeDay) / 6}%, calc(100% - 85px))`,
              }}
            >
              <strong>{attendanceDays[activeDay].date}</strong>
              {series.map((item) => (
                <span key={item.key}>
                  <i style={{ background: item.color }} />
                  {item.label}
                  <b>{attendanceDays[activeDay][item.key]}</b>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="attendance-x-axis" aria-hidden="true">
          {attendanceDays.map((day) => (
            <span key={day.date}>{day.date}</span>
          ))}
        </div>
      </div>
      <div className="attendance-overview-footer">
        <span>Oct 19–25, 2025</span>
        <button className="text-button" onClick={onViewLog}>
          View Full Log
          <Icon name="arrow" size={17} />
        </button>
      </div>
    </section>
  )
}
