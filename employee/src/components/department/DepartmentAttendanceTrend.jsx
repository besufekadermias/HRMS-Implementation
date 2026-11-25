import { Link } from 'react-router-dom'
import { ArrowUpRight, BarChart3 } from 'lucide-react'
import { formatAttendanceDate } from '../../utils/formatters/attendanceTime.js'

export default function DepartmentAttendanceTrend({ records }) {
  const dates = [...new Set(records.map(record => record.date))].sort().slice(-7)
  const days = dates.map(date => {
    const saved = records.filter(record => record.date === date && record.checkIn)
    return { date, present: saved.filter(record => record.status === 'PRESENT').length,
      late: saved.filter(record => record.status === 'LATE').length }
  })
  const maximum = Math.max(1, ...days.map(day => day.present + day.late))
  return <section className="min-w-0 rounded-[14px] border border-border bg-white p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="flex items-center gap-2 text-[16px] font-semibold"><BarChart3 size={19} className="text-primary" /> Recorded check-ins</h2>
        <p className="mt-1.5 text-[12px] text-muted">Last seven saved workdays</p></div>
      <Link to="/department/attendance" className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline">View log <ArrowUpRight size={14} /></Link>
    </div>
    <div className="mt-5 flex gap-5 text-[11px] text-text-secondary">
      <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[#168574]" />Present</span>
      <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[#e7b458]" />Late</span>
    </div>
    {days.length ? <svg viewBox="0 0 560 165" className="mt-4 block w-full" role="img" aria-label="Recorded present and late check-ins over the last seven saved workdays">
      {[40, 80, 120].map(y => <line key={y} x1="12" x2="548" y1={y} y2={y} className="stroke-[#edf2f4]" />)}
      {days.map((day, index) => {
        const x = 42 + index * (480 / Math.max(days.length - 1, 1))
        const presentHeight = day.present / maximum * 88
        const lateHeight = day.late / maximum * 88
        return <g key={day.date}>
          <title>{formatAttendanceDate(day.date)}: {day.present} present, {day.late} late</title>
          {presentHeight > 0 && <rect x={x - 13} y={120 - presentHeight - lateHeight} width="26" height={presentHeight} rx="4" className="fill-[#168574]" />}
          {lateHeight > 0 && <rect x={x - 13} y={120 - lateHeight} width="26" height={lateHeight} rx="4" className="fill-[#e7b458]" />}
          {!presentHeight && !lateHeight && <line x1={x - 12} x2={x + 12} y1="120" y2="120" className="stroke-[#dbe7e7] stroke-[3]" />}
          <text x={x} y={110 - presentHeight - lateHeight} textAnchor="middle" className="fill-text-primary text-[12px] font-semibold">{day.present + day.late}</text>
          <text x={x} y="145" textAnchor="middle" className="fill-muted text-[11px]">{formatAttendanceDate(day.date, { weekday: undefined, year: undefined })}</text>
        </g>
      })}
    </svg> : <p className="py-12 text-center text-[13px] text-muted">No saved check-ins to display.</p>}
  </section>
}
