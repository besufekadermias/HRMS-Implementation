export const EMPTY_ATTENDANCE_FILTERS = {
  startDate: '',
  endDate: '',
  status: '',
  completion: '',
  verification: '',
}
export function filterAttendanceRecords(records, filters) {
  if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
    return []
  }
  return records.filter((record) => {
    if (filters.startDate && record.date < filters.startDate) {
      return false
    }
    if (filters.endDate && record.date > filters.endDate) {
      return false
    }
    if (filters.status && record.status !== filters.status) {
      return false
    }
    if (filters.completion === 'checked-out' && !record.checkOut) {
      return false
    }
    if (filters.completion === 'checked-in' && (!record.checkIn || record.checkOut)) {
      return false
    }
    if (
      filters.verification &&
      ![record.checkInVerification, record.checkOutVerification].includes(filters.verification)
    ) {
      return false
    }
    return true
  })
}
