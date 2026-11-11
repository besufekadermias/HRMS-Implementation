import Icon from '../../components/common/Icon.jsx'

export default function AdminProfileDropdown({ onNavigate }) {
  return (
    <div
      className="header-dropdown"
      id="profile-dropdown"
      aria-label="Profile options"
    >
      <div className="dropdown-title">
        <strong>HR Manager Portal</strong>
        <small>Hadiya Science · IT Department</small>
      </div>
      <button onClick={() => onNavigate('profile')}>
        <Icon name="users" size={18} />
        View profile
      </button>
      <button onClick={() => onNavigate('logout')}>
        <Icon name="logout" size={18} />
        Log out
      </button>
    </div>
  )
}
