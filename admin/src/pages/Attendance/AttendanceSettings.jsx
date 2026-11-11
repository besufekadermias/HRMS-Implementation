import Icon from '../../components/common/Icon.jsx'
import AttendanceSettingsForm from '../../components/attendance/AttendanceSettingsForm.jsx'

export default function AttendanceSettings({ settings, onSave, onDirtyChange }) {
  const ipCount = settings.allowedIps ? settings.allowedIps.split('\n').length : 0
  return (
    <div className="attendance-page">
      <div className="employee-page-heading">
        <span className="icon-circle directory-heading-icon"><Icon name="shield" size={28} /></span>
        <div>
          <h1>Attendance Settings</h1>
          <p>Configure working hours, a grace period, and approved office IP addresses.</p>
        </div>
        <span className="attendance-access"><Icon name="shield" size={16} /> HR Manager view</span>
      </div>
      <div className="attendance-settings-layout">
        <AttendanceSettingsForm settings={settings} onSave={onSave} onDirtyChange={onDirtyChange} />
        <aside className="card attendance-settings-summary" aria-label="Saved attendance configuration">
          <h2><Icon name="check-circle" size={18} /> Saved Settings</h2>
          <dl>
            <div><dt>Start time</dt><dd>{settings.startTime}</dd></div>
            <div><dt>End time</dt><dd>{settings.endTime}</dd></div>
            <div><dt>Grace period</dt><dd>{settings.gracePeriod} minutes</dd></div>
            <div><dt>Approved IPs</dt><dd>{ipCount}</dd></div>
          </dl>
          <p>Times are shown in 24-hour format, East Africa Time (UTC+3).</p>
        </aside>
      </div>
    </div>
  )
}
