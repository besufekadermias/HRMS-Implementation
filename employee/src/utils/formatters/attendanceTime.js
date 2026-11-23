export function formatTime(value, timeZone, options = {}) {
  return value
    ? new Intl.DateTimeFormat('en', {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
        ...options,
      }).format(new Date(value))
    : '—'
}
export function formatAttendanceDate(value, options = {}) {
  return value
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: 'UTC',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...options,
      }).format(new Date(`${value}T00:00:00Z`))
    : 'Unavailable'
}
export function formatShiftTime(value) {
  return formatTime(`2000-01-01T${value}:00Z`, 'UTC')
}
export function formatAttendanceTimestamp(value, timeZone) {
  return value
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date(value))
    : 'Not recorded'
}
