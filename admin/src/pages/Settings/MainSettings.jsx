import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import Icon from '../../components/common/Icon.jsx'
import GeneralSettings from '../../components/settings/GeneralSettings.jsx'
import NotificationSettings from '../../components/settings/NotificationSettings.jsx'
import { REGIONAL_INFORMATION } from '../../utils/constants/settingsConstants.js'

export default function MainSettings({ settings, notificationSettings, onSave, onSaveNotifications, onDirtyChange, section = 'general', onSectionChange, busy = false }) {
  const [formDirty, setFormDirty] = useState({ general: false, notifications: false })
  const onGeneralDirty = useCallback(value => setFormDirty(current => current.general === value ? current : { ...current, general: value }), [])
  const onNotificationsDirty = useCallback(value => setFormDirty(current => current.notifications === value ? current : { ...current, notifications: value }), [])
  useEffect(() => { onDirtyChange(formDirty.general || formDirty.notifications) }, [formDirty, onDirtyChange])
  const tabsId = useId()
  const tabRefs = useRef({})
  const sections = [
    { id: 'general', label: 'Company Profile', icon: 'building' },
    { id: 'notifications', label: 'Notifications', icon: 'file' },
  ]
  const activeSection = section === 'notifications' ? 'notifications' : 'general'
  const activeFormId = activeSection === 'notifications' ? 'notification-settings-form' : 'general-settings-form'
  function onTabKey(event, id) {
    if (busy) return
    const index = sections.findIndex(item => item.id === id)
    let next
    if (event.key === 'ArrowRight') next = (index + 1) % sections.length
    else if (event.key === 'ArrowLeft') next = (index + sections.length - 1) % sections.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = sections.length - 1
    else return
    event.preventDefault()
    onSectionChange(sections[next].id)
    tabRefs.current[sections[next].id]?.focus()
  }
  return <div className="tw:pb-[30px]">
    <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-[13px] tw:mb-[24px]">
      <span className="tw:inline-flex tw:shrink-0 tw:items-center tw:justify-center tw:size-[49px] tw:rounded-full tw:bg-icon-bg tw:text-primary">
        <Icon name="settings" size={27} />
      </span>
      <div className="tw:min-w-0 tw:flex-1">
        <h1 className="tw:text-[27px] tw:max-[640px]:text-[23px]">Settings</h1>
        <p className="tw:mt-[5px] tw:text-[12px] tw:text-[var(--text-muted)] tw:leading-[1.7]">Manage your company profile, contact details, display preferences and notifications.</p>
      </div>
      <div className="tw:flex tw:gap-[10px] tw:max-[640px]:basis-full tw:max-[640px]:[&>.button]:flex-1">
        <Button type="reset" form={activeFormId} variant="secondary" disabled={busy || !formDirty[activeSection]} title="Reset changes in this section">Cancel</Button>
        <Button type="submit" form={activeFormId} disabled={busy || !formDirty[activeSection]}><Icon name="check" size={17} />{busy ? 'Please wait…' : 'Save Changes'}</Button>
      </div>
    </div>

    <Card as="div" className="tw:grid tw:grid-cols-2 tw:gap-[5px] tw:p-[10px] tw:mb-[24px]" role="tablist" aria-label="Settings sections">
      {sections.map(item => <button key={item.id} type="button" role="tab" id={`${tabsId}-tab-${item.id}`}
        ref={element => { tabRefs.current[item.id] = element }}
        aria-selected={activeSection === item.id} aria-controls={`${tabsId}-panel-${item.id}`} tabIndex={activeSection === item.id ? 0 : -1}
        disabled={busy}
        onClick={() => onSectionChange(item.id)} onKeyDown={event => onTabKey(event, item.id)}
        className={`tw:flex tw:items-center tw:justify-start tw:gap-[9px] tw:p-[15px_18px] tw:min-h-[50px] tw:border-0 tw:rounded-[9px] tw:text-[12px] tw:font-semibold tw:max-[640px]:p-[12px] tw:disabled:opacity-60 ${activeSection === item.id ? 'tw:bg-[#def8ef] tw:text-primary' : 'tw:bg-transparent tw:text-text-secondary tw:hover:bg-icon-bg'}`}>
        <Icon name={item.icon} size={18} />{item.label}
        {formDirty[item.id] && <><span aria-hidden="true" className="tw:size-[6px] tw:rounded-full tw:bg-current" /><span className="tw:sr-only">, unsaved changes</span></>}
      </button>)}
    </Card>

    <section role="tabpanel" id={`${tabsId}-panel-general`} aria-labelledby={`${tabsId}-tab-general`} hidden={activeSection !== 'general'} tabIndex={0} className="tw:min-w-0 tw:rounded-[12px] tw:focus-visible:outline-2 tw:focus-visible:outline-primary">
      <div className="tw:grid tw:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] tw:items-start tw:gap-[20px] tw:max-[1100px]:grid-cols-1">
        <GeneralSettings settings={settings} onSave={onSave} onDirtyChange={onGeneralDirty} busy={busy} />
      <Card as="aside" className="tw:p-[24px] tw:max-[640px]:p-[17px]" aria-label="Regional information">
        <h2 className="tw:flex tw:items-center tw:gap-[9px]"><Icon name="globe" size={20} className="tw:text-primary" /> Regional Information</h2>
        <p className="tw:mt-[6px] tw:text-[12px] tw:text-[var(--text-muted)] tw:leading-[1.7]">The current workspace uses these regional defaults.</p>
        <dl className="tw:m-0 tw:mt-[12px]">
          {REGIONAL_INFORMATION.map(item => <div key={item.label} className="tw:py-[18px] tw:border-0 tw:border-b tw:border-solid tw:border-border tw:last:border-b-0">
            <dt className="tw:flex tw:items-center tw:gap-[8px] tw:text-[11px] tw:text-[var(--text-muted)]"><Icon name={item.icon} size={16} />{item.label}</dt>
            <dd className="tw:m-0 tw:mt-[8px] tw:text-[13px] tw:font-semibold tw:text-text-primary">{item.value}</dd>
          </div>)}
        </dl>
      </Card>
      </div>
    </section>
    <section role="tabpanel" id={`${tabsId}-panel-notifications`} aria-labelledby={`${tabsId}-tab-notifications`} hidden={activeSection !== 'notifications'} tabIndex={0} className="tw:min-w-0 tw:rounded-[12px] tw:focus-visible:outline-2 tw:focus-visible:outline-primary">
      <NotificationSettings settings={notificationSettings} onSave={onSaveNotifications} onDirtyChange={onNotificationsDirty} busy={busy} />
    </section>

    <div className="tw:flex tw:items-start tw:gap-[10px] tw:mt-[20px] tw:p-[16px_18px] tw:bg-icon-bg tw:rounded-[10px] tw:text-primary">
      <Icon name="info" size={18} />
      <p className="tw:text-[12px] tw:leading-[1.7]">Saved changes stay available while you use this workspace. Reloading or signing out restores the demo company profile, display preferences and notification settings.</p>
    </div>
  </div>
}
