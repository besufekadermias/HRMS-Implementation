import Icon from '../common/Icon.jsx'
import { IconButton } from '../common/Button.jsx'
import { notificationCategory } from '../../utils/constants/notificationConstants.js'
import { notificationDate } from '../../services/communications/notificationService.js'

export default function NotificationItem({ notification, onOpen, onRead }) {
  const category = notificationCategory(notification.category)
  return <li className={`tw:flex tw:items-start tw:gap-[14px] tw:p-[20px] tw:border-0 tw:border-b tw:border-solid tw:border-border tw:last:border-b-0 tw:max-[640px]:p-[16px] tw:max-[480px]:gap-[10px] ${notification.read ? '' : 'tw:bg-[#f1faf7]'}`}>
    <span className={`tw:inline-flex tw:items-center tw:justify-center tw:shrink-0 tw:size-[42px] tw:rounded-[11px] tw:max-[480px]:size-[34px] ${category.tone}`}><Icon name={category.icon} size={20} /></span>
    <div className="tw:min-w-0 tw:flex-1">
      <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-[8px] tw:mb-[7px]">
        <span className="tw:text-[10px] tw:font-semibold tw:text-text-secondary">{category.label}</span>
        <span className={`tw:rounded-full tw:p-[2px_7px] tw:text-[9px] tw:font-semibold ${notification.read ? 'tw:bg-[#edf1f4] tw:text-text-secondary' : 'tw:bg-[#d9f1e8] tw:text-primary'}`}>{notification.read ? 'Read' : 'Unread'}</span>
      </div>
      <button type="button" onClick={() => onOpen(notification)} className="tw:block tw:w-full tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:text-text-primary tw:[overflow-wrap:anywhere] tw:hover:text-primary">
        <strong className="tw:block tw:text-[13px] tw:font-semibold tw:leading-[1.6]">{notification.title}</strong>
        <span className="tw:block tw:mt-[6px] tw:text-[12px] tw:text-text-secondary tw:leading-[1.8] tw:line-clamp-2">{notification.message}</span>
        <span className="tw:block tw:mt-[8px] tw:text-[11px] tw:font-semibold tw:text-primary">{notification.actionLabel} →</span>
      </button>
      <p className="tw:mt-[8px] tw:text-[10px] tw:text-[var(--text-muted)]">{notificationDate(notification)}</p>
    </div>
    <IconButton type="button" className="tw:shrink-0" onClick={() => onRead(notification, !notification.read)}
      aria-label={`Mark ${notification.title} as ${notification.read ? 'unread' : 'read'}`} title={`Mark as ${notification.read ? 'unread' : 'read'}`}>
      <Icon name={notification.read ? 'mail' : 'check'} size={18} />
    </IconButton>
  </li>
}
