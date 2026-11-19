import { announcementAudienceLabel } from './announcementService.js'
import { notificationCategory } from '../../utils/constants/notificationConstants.js'
import formatDate from '../../utils/formatters/formatDate.js'
import { formatTimestamp } from '../../utils/formatters/formatTime.js'

// Local inbox projection. Replace this with server notifications and per-user
// receipts when the notification API is available. Never mutate source records.
export function buildWorkspaceNotifications({ announcements, recruitment, leaveData, careerMilestones, employees }, receipts = []) {
  const items = []
  function add(category, sourceId, fields, revision) {
    items.push({ id: `${category}:${sourceId}`, sourceId: String(sourceId), category, ...fields, version: JSON.stringify(revision) })
  }
  for (const item of announcements) {
    add('ANNOUNCEMENT', item.id, {
      title: item.title, message: item.content,
      context: `${announcementAudienceLabel(item.targetAudience)} · Posted by ${item.postedBy}`,
      date: item.date, timestamp: null,
      targetPage: 'announcements', targetId: '', actionLabel: 'View announcement',
    }, [item.title, item.content, item.targetAudience, item.date])
  }
  for (const item of recruitment.applications) {
    if (item.status !== 'PENDING') continue
    const job = recruitment.jobs.find(job => job.id === item.jobId)
    if (!job) continue
    add('RECRUITMENT', item.id, {
      title: 'Candidate application awaiting review',
      message: `${item.fullName} applied for ${job.title}. Review the application and supporting credentials.`,
      context: `Application ${item.id}`, date: item.appliedDate || '', timestamp: null,
      targetPage: 'applicants', targetId: String(item.jobId), actionLabel: 'View application',
    }, [item.fullName, item.jobId, item.appliedDate, item.status])
  }
  for (const item of leaveData?.requests || []) {
    if (item.status !== 'PENDING') continue
    const employee = employees.find(employee => employee.id === item.employeeId)
    const timestamp = item.history?.at(-1)?.at || null
    add('LEAVE', item.id, {
      title: 'Leave request awaiting approval',
      message: `${employee?.name || item.employeeName || 'Employee'} requested ${item.daysRequested} day${item.daysRequested === 1 ? '' : 's'} of leave.`,
      context: item.reason || 'Review this request in Leave Approvals.',
      date: '', timestamp, startDate: item.startDate, endDate: item.endDate,
      targetPage: 'leave', targetStatus: 'PENDING', targetId: '', actionLabel: 'View leave request',
    }, [item.employeeId, item.startDate, item.endDate, item.daysRequested, item.reason, timestamp])
  }
  for (const item of careerMilestones) {
    if (item.status !== 'NEEDS_REVIEW') continue
    add('CAREER', item.id, {
      title: 'Career change needs review',
      message: `${item.employeeName || 'Employee'}: ${item.reviewReason || 'Review this career change before it can be applied.'}`,
      context: `Effective date: ${item.effectiveDate}`, date: '', timestamp: null,
      effectiveDate: item.effectiveDate,
      targetPage: 'career', targetId: '', actionLabel: 'View career change',
    }, [item.employeeId, item.effectiveDate, item.status, item.reviewReason, item.newGradeId, item.newSalary])
  }
  const receiptById = new Map(receipts.map(item => [item.id, item]))
  return items.map(item => {
    const receipt = receiptById.get(item.id)
    const current = receipt?.version === item.version
    return { ...item, read: current && receipt.read }
  }).sort((a, b) => {
    // Missing event timestamps stay undated; leave start/career effective dates
    // are not presented as the time the notification arrived.
    const aTime = Date.parse(a.timestamp || a.date) || 0
    const bTime = Date.parse(b.timestamp || b.date) || 0
    return bTime - aTime || a.id.localeCompare(b.id)
  })
}

export function updateNotificationReceipts(receipts, notifications, changes) {
  const next = new Map(receipts.map(item => [item.id, item]))
  for (const item of notifications) {
    const previous = next.get(item.id)
    next.set(item.id, {
      id: item.id, version: item.version,
      read: previous?.version === item.version ? previous.read : false,
      ...changes,
    })
  }
  return [...next.values()]
}

export function notificationTarget(notification) {
  return {
    page: notification.targetPage,
    recordId: notification.sourceId,
    ...(notification.targetId ? { id: notification.targetId } : {}),
    ...(notification.targetStatus ? { status: notification.targetStatus } : {}),
  }
}

export function filterNotificationPreferences(notifications, settings) {
  if (!settings.enabled) return []
  return notifications.filter(item => settings.categories[item.category])
}

export function notificationRows(notifications, search = '', category = '', status = '') {
  const query = search.trim().toLowerCase()
  return notifications.filter(item => (!category || item.category === category) &&
    (!status || (status === 'READ' ? item.read : !item.read)) &&
    [item.title, item.message, item.context, notificationCategory(item.category)?.label]
      .some(value => value?.toLowerCase().includes(query)))
}

export function notificationDate(item) {
  return item.timestamp ? formatTimestamp(item.timestamp) : item.date ? formatDate(item.date) : 'Date unavailable'
}
