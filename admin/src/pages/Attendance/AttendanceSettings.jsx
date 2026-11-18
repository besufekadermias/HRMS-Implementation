import Card from '../../components/common/Card.jsx'
import Icon from '../../components/common/Icon.jsx'
import AttendanceSettingsForm from '../../components/attendance/AttendanceSettingsForm.jsx'

export default function AttendanceSettings({ settings, onSave, onDirtyChange }) {
  const ipCount = settings.allowedIps ? settings.allowedIps.split('\n').length : 0
  return (
    <div className="attendance-page">
      <div className="employee-page-heading tw:shared-base:flex tw:shared-base:items-center tw:shared-base:gap-[13px]
          tw:shared-base:mb-[23px] tw:shared-base:[&_>_div]:min-w-0 tw:shared-base:[&_>_div]:flex-1
          tw:shared-base:[&_h1]:text-[27px] tw:shared-base:[&_h1]:tracking-[-0.6px]
          tw:shared-base:[&_p]:[color:var(--text-muted)] tw:shared-base:[&_p]:text-[12px]
          tw:shared-base:[&_p]:leading-[1.7] tw:shared-base:[&_p]:mt-[4px] tw:shared-base:[&_>_.button]:shrink-0
          tw:max-[768px]:shared-base:flex-wrap tw:max-[768px]:shared-base:gap-[11px]
          tw:max-[768px]:shared-base:[&_h1]:text-[24px]
          tw:max-[768px]:shared-base:[&_p]:text-[11px]
          tw:max-[768px]:shared-base:[&_>_.button]:ml-[auto]
          tw:max-[560px]:shared-base:[&_h1]:text-[22px]">
        <span className="icon-circle directory-heading-icon tw:shared-base:w-[46px] tw:shared-base:h-[46px] tw:shared-base:shrink-0
          tw:shared-base:rounded-[50%] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:shared-base:w-[49px] tw:shared-base:h-[49px]
          tw:shared-base:[background:#d8f8ee] tw:shared-base:[color:#05695c]"><Icon name="shield" size={28} /></span>
        <div>
          <h1>Attendance Settings</h1>
          <p>Configure working hours, a grace period, and approved office IP addresses.</p>
        </div>
        <span className="attendance-access tw:flex tw:items-center tw:gap-[9px] tw:text-primary tw:bg-[#e0f5ef] tw:p-[9px_12px]
          tw:rounded-[7px] tw:text-[11px] tw:whitespace-nowrap tw:max-[768px]:ml-[62px] tw:max-[400px]:ml-0"><Icon name="shield" size={16} /> HR Manager view</span>
      </div>
      <div className="attendance-settings-layout tw:grid tw:grid-cols-[minmax(0,_2fr)_minmax(260px,_1fr)] tw:gap-[20px]
          tw:[align-items:start] tw:max-[1100px]:grid-cols-1">
        <AttendanceSettingsForm settings={settings} onSave={onSave} onDirtyChange={onDirtyChange} />
        <Card as="aside" className="attendance-settings-summary tw:p-[22px] tw:max-[640px]:p-[17px] tw:[&_h2]:flex tw:[&_h2]:items-center
          tw:[&_h2]:gap-[8px] tw:[&_h2_svg]:text-primary tw:[&_dl]:m-[16px_0] tw:[&_dl>div]:flex
          tw:[&_dl>div]:justify-between tw:[&_dl>div]:gap-[15px]
          tw:[&_dl>div]:[border-bottom:1px_solid_var(--divider)] tw:[&_dl>div]:p-[14px_0] tw:[&_dl>div]:text-[12px]
          tw:[&_dt]:text-[var(--text-muted)] tw:[&_dd]:font-[600] tw:[&_dd]:m-0 tw:[&_p]:text-[var(--text-muted)]
          tw:[&_p]:text-[11px] tw:[&_p]:leading-[1.8] tw:[&_p+p]:mt-[12px]" aria-label="Saved attendance configuration">
          <h2><Icon name="check-circle" size={18} /> Saved Settings</h2>
          <dl>
            <div><dt>Start time</dt><dd>{settings.startTime}</dd></div>
            <div><dt>End time</dt><dd>{settings.endTime}</dd></div>
            <div><dt>Grace period</dt><dd>{settings.gracePeriod} minutes</dd></div>
            <div><dt>Approved IPs</dt><dd>{ipCount}</dd></div>
          </dl>
          <p>Times are shown in 24-hour format, East Africa Time (UTC+3).</p>
        </Card>
      </div>
    </div>
  )
}
