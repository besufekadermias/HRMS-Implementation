const dayMs = 86400000
const ethiopicCalendar = new Intl.DateTimeFormat('en-u-ca-ethiopic-nu-latn', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})
export function isValidLeaveDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}
export function countLeaveDays(startDate, endDate, mode = 'calendar') {
  if (!isValidLeaveDate(startDate) || !isValidLeaveDate(endDate) || endDate < startDate) {
    return 0
  }
  const start = new Date(`${startDate}T00:00:00Z`)
  const days = (Date.parse(endDate) - start.getTime()) / dayMs + 1
  if (mode === 'calendar') {
    return days
  }
  let total = Math.floor(days / 7) * 5
  for (let offset = 0; offset < days % 7; offset++) {
    const weekday = (start.getUTCDay() + offset) % 7
    if (weekday !== 0 && weekday !== 6) {
      total++
    }
  }
  return total
}
export function getLeaveYear(date) {
  if (!isValidLeaveDate(date)) {
    throw new Error('Use a valid date for the leave year.')
  }
  const instant = new Date(`${date}T00:00:00Z`)
  const parts = ethiopicCalendar.formatToParts(instant)
  const number = (name) => Number(parts.find((part) => part.type === name).value)
  const year = number('year')
  const start = instant.getTime() - ((number('month') - 1) * 30 + number('day') - 1) * dayMs
  const next = start + (year % 4 === 3 ? 366 : 365) * dayMs
  return {
    year,
    start: new Date(start).toISOString().slice(0, 10),
    end: new Date(next - dayMs).toISOString().slice(0, 10),
    nextStart: new Date(next).toISOString().slice(0, 10),
  }
}
export function earliestLeaveDate(today, noticeDays) {
  return new Date(Date.parse(`${today}T00:00:00Z`) + Number(noticeDays) * dayMs)
    .toISOString()
    .slice(0, 10)
}
export function leaveDateLabel(date) {
  return date
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: 'UTC',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(`${date}T00:00:00Z`))
    : 'Not provided'
}
export function leaveTimestampLabel(date) {
  return date
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Addis_Ababa',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(date))
    : 'Not provided'
}
