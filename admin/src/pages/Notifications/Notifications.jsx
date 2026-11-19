import { useState } from 'react'
import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import Icon from '../../components/common/Icon.jsx'
import NotificationFilters from '../../components/notifications/NotificationFilters.jsx'
import NotificationItem from '../../components/notifications/NotificationItem.jsx'
import { notificationRows } from '../../services/communications/notificationService.js'

export default function Notifications({ notifications, notificationSettings, onNavigate, search, onSearch, onOpen, onRead, onReadAll, leaveLoading, leaveBusy, leaveError, onRetryLeave }) {
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const unread = notifications.filter(item => !item.read).length
  const review = notifications.filter(item => item.category !== 'ANNOUNCEMENT').length
  const rows = notificationRows(notifications, search, category, status)
  const filtered = !!(search.trim() || category || status)
  const enabled = notificationSettings.enabled && Object.values(notificationSettings.categories).some(Boolean)
  return <div className="tw:pb-[30px]">
    <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-[13px] tw:mb-[24px]">
      <span className="tw:inline-flex tw:items-center tw:justify-center tw:shrink-0 tw:size-[49px] tw:rounded-full tw:bg-icon-bg tw:text-primary"><Icon name="bell" size={27} /></span>
      <div className="tw:flex-1 tw:min-w-[180px]">
        <h1 className="tw:text-[27px] tw:max-[640px]:text-[23px]">Notifications</h1>
        <p className="tw:mt-[5px] tw:text-[12px] tw:text-[var(--text-muted)] tw:leading-[1.7]">Keep up with announcements and requests awaiting your review.</p>
      </div>
      <div className="tw:flex tw:flex-wrap tw:gap-[10px]">
        <Button type="button" variant="secondary" onClick={() => onNavigate('notification-settings')}><Icon name="settings" size={18} />Notification settings</Button>
        <Button type="button" variant="secondary" disabled={!unread} onClick={onReadAll}><Icon name="check" size={18} />Mark all as read</Button>
      </div>
    </div>
    <div className="tw:grid tw:grid-cols-3 tw:gap-[16px] tw:mb-[20px] tw:max-[480px]:grid-cols-1">
      {[{ label: 'Total notifications', count: notifications.length, icon: 'bell' }, { label: 'Unread', count: unread, icon: 'mail' }, { label: 'Awaiting review', count: review, icon: 'clock' }].map(item =>
        <Card key={item.label} className="tw:flex tw:items-center tw:gap-[13px] tw:p-[19px]">
          <Icon name={item.icon} size={22} className="tw:text-primary tw:shrink-0" />
          <div><p className="tw:text-[11px] tw:text-text-secondary">{item.label}</p><strong className="tw:block tw:mt-[5px] tw:text-[24px]">{item.count}</strong></div>
        </Card>)}
    </div>
    {leaveLoading && <p role="status" className="tw:mb-[14px] tw:text-[12px] tw:text-text-secondary">Loading leave request updates…</p>}
    {leaveError && <Card className="tw:flex tw:flex-wrap tw:items-center tw:gap-[12px] tw:mb-[16px] tw:p-[16px]">
      <p role="alert" className="tw:flex-1 tw:text-[12px] tw:text-[#b33450] tw:leading-[1.8]">Leave request updates could not be refreshed. {leaveError}</p>
      <Button type="button" variant="secondary" onClick={onRetryLeave} disabled={leaveBusy}>{leaveBusy ? 'Please wait…' : 'Retry leave updates'}</Button>
    </Card>}
    <Card className="tw:overflow-hidden" aria-label="Notification inbox">
      <NotificationFilters search={search} onSearch={onSearch} category={category} onCategory={setCategory} status={status} onStatus={setStatus} />
      <p className="tw:p-[12px_20px] tw:text-[11px] tw:text-[var(--text-muted)]" role="status">Showing {rows.length} of {notifications.length} notification{notifications.length === 1 ? '' : 's'}</p>
      {rows.length ? <ul id="notification-list" className="tw:list-none tw:m-0 tw:p-0">
        {rows.map(item => <NotificationItem key={item.id} notification={item} onOpen={onOpen} onRead={onRead} />)}
      </ul> : <div id="notification-list" className="tw:flex tw:flex-col tw:items-center tw:gap-[12px] tw:p-[45px_20px] tw:text-center">
        <Icon name={filtered ? 'search' : 'check-circle'} size={34} className="tw:text-primary" />
        <h2 className="tw:text-[17px]">{filtered ? 'No matching notifications' : enabled ? 'You’re all caught up' : 'Notifications are turned off'}</h2>
        <p className="tw:text-[12px] tw:text-[var(--text-muted)] tw:leading-[1.8]">{filtered ? 'Try a different search, category or read status.' : enabled ? 'New updates in your enabled categories will appear here.' : 'Enable notifications and choose your categories in General Settings.'}</p>
        {!enabled && <Button type="button" variant="secondary" onClick={() => onNavigate('notification-settings')}>Open notification settings</Button>}
      </div>}
    </Card>
    <p className="tw:mt-[17px] tw:text-[11px] tw:text-[var(--text-muted)] tw:leading-[1.8]">Reading an update does not approve a request. Pending updates leave the inbox when resolved. Read status stays in this workspace until you reload or sign out.</p>
  </div>
}
