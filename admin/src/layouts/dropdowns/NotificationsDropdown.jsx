import Icon from '../../components/common/Icon.jsx'

export default function NotificationsDropdown({ count, onNavigate }) {
  return (
    <div
      className="header-dropdown notifications-dropdown"
      id="notification-dropdown"
      aria-label="Notifications"
    >
      <div className="dropdown-title">
        <strong>Notifications</strong>
        <small>Your workspace updates</small>
      </div>
      <div className="notification-empty">
        <span className="icon-circle tone-green">
          <Icon name="bell" />
        </span>
        <strong>
          {count
            ? `${count} announcement${count === 1 ? '' : 's'} available`
            : 'You’re all caught up'}
        </strong>
        <p>
          {count
            ? 'View department notices and their target audiences.'
            : 'There are no notifications.'}
        </p>
      </div>
      <button onClick={() => onNavigate('announcements')}>
        <Icon name="megaphone" size={18} />
        View announcements
      </button>
    </div>
  )
}
