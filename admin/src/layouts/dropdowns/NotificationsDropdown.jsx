import Icon from '../../components/common/Icon.jsx'

export default function NotificationsDropdown({ count, onNavigate }) {
  return (
    <div
      className="header-dropdown notifications-dropdown tw:absolute tw:right-0 tw:top-[calc(100%+15px)] tw:bg-white tw:border
        tw:border-solid tw:border-border tw:[box-shadow:0_12px_35px_#163d3920] tw:p-2 tw:rounded-[10px]
        tw:w-[290px] tw:max-[768px]:right-[-45px]"
      id="notification-dropdown"
      aria-label="Notifications"
    >
      <div className="dropdown-title tw:py-3 tw:px-[10px] tw:[border-bottom:1px_solid_var(--divider)] tw:mb-[5px]">
        <strong className="tw:block tw:text-[13px]">Notifications</strong>
        <small className="tw:block tw:text-[11px] tw:text-[var(--text-muted)] tw:mt-1">Your workspace updates</small>
      </div>
      <div className="notification-empty tw:flex tw:items-center tw:flex-col tw:gap-[10px] tw:py-[18px] tw:px-3 tw:text-center">
        <span className="icon-circle tone-green tw:size-[46px] tw:shrink-0 tw:rounded-[50%] tw:inline-flex tw:items-center tw:justify-center
          tw:text-[#0b8972] tw:bg-[#e3f5f0] tw:shared-base:w-[46px] tw:shared-base:h-[46px] tw:shared-base:shrink-0
          tw:shared-base:rounded-[50%] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:[:where(&.tone-green)]:[color:#0b8972]
          tw:[:where(&.tone-green)]:[background:#e3f5f0]">
          <Icon name="bell" />
        </span>
        <strong className="tw:text-[13px]">
          {count
            ? `${count} announcement${count === 1 ? '' : 's'} available`
            : 'You’re all caught up'}
        </strong>
        <p className="tw:text-[12px] tw:text-[var(--text-muted)] tw:leading-[1.6]">
          {count
            ? 'View department notices and their target audiences.'
            : 'There are no notifications.'}
        </p>
      </div>
      <button className="tw:flex tw:items-center tw:gap-[10px] tw:min-h-[42px] tw:[border:0] tw:[background:none] tw:w-full tw:p-[10px]
          tw:rounded-md tw:text-text-secondary tw:text-[12px] tw:text-left tw:hover:bg-[#f0f8f5]
          tw:hover:text-primary" onClick={() => onNavigate('announcements')}>
        <Icon name="megaphone" size={18} />
        View announcements
      </button>
    </div>
  )
}
