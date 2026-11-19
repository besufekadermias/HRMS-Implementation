import { useCallback, useEffect, useId, useRef, useState } from 'react'
import AccountForm from '../../components/account/AccountForm.jsx'
import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import Icon from '../../components/common/Icon.jsx'
import { formatTimestamp } from '../../utils/formatters/formatTime.js'

const sections = [{ id: 'profile', label: 'Profile', icon: 'users' }, { id: 'security', label: 'Login & Security', icon: 'key' }]

export default function AdminAccount({ account, companyName, signedInAt, section, onSectionChange, onSaveProfile, onSaveSecurity, onDirtyChange, onNavigate, busy }) {
  const [drafts, setDrafts] = useState({ profile: false, security: false })
  const profileDirty = useCallback(value => setDrafts(current => current.profile === value ? current : { ...current, profile: value }), [])
  const securityDirty = useCallback(value => setDrafts(current => current.security === value ? current : { ...current, security: value }), [])
  useEffect(() => { onDirtyChange(drafts.profile || drafts.security) }, [drafts, onDirtyChange])
  const tabsId = useId()
  const tabRefs = useRef({})
  const active = section === 'security' ? 'security' : 'profile'

  function tabKey(event, id) {
    if (busy) return
    const index = sections.findIndex(item => item.id === id)
    let next
    if (['ArrowRight', 'ArrowLeft'].includes(event.key)) next = (index + 1) % sections.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = sections.length - 1
    else return
    event.preventDefault()
    onSectionChange(sections[next].id)
    tabRefs.current[sections[next].id]?.focus()
  }

  return <div className="tw:pb-8">
    <div className="tw:mb-6 tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-4">
      <div><h1>My Account</h1><p className="tw:mt-2 tw:text-[13px] tw:text-text-secondary">Manage your admin profile and sign-in details.</p></div>
      <Button type="button" variant="secondary" disabled={busy} onClick={() => onNavigate('dashboard')}><Icon name="arrow-left" size={17} />Back to Dashboard</Button>
    </div>
    <Card className="tw:mb-5 tw:flex tw:flex-wrap tw:items-center tw:gap-5 tw:p-6 tw:max-[640px]:p-[17px]">
      <span className="tw:inline-flex tw:size-[64px] tw:shrink-0 tw:items-center tw:justify-center tw:rounded-full tw:bg-icon-bg tw:text-[24px] tw:font-semibold tw:text-primary" aria-hidden="true">{account.profile.fullName.charAt(0).toUpperCase()}</span>
      <div className="tw:min-w-0 tw:flex-1"><h2 className="tw:[overflow-wrap:anywhere]">{account.profile.fullName}</h2>
        <p className="tw:mt-2 tw:text-[12px] tw:text-text-secondary">{account.role}{account.department && ` · ${account.department}`}</p>
        <p className="tw:mt-1 tw:text-[12px] tw:text-[var(--text-muted)] tw:[overflow-wrap:anywhere]">{companyName}</p>
      </div>
      <span className="tw:rounded-full tw:bg-icon-bg tw:px-3 tw:py-2 tw:text-[11px] tw:font-semibold tw:text-primary">Demo account · Active</span>
    </Card>
    <p className="tw:mb-5 tw:rounded-lg tw:border tw:border-solid tw:border-border tw:bg-white tw:p-4 tw:text-[12px] tw:leading-[1.8] tw:text-text-secondary">Profile and login changes are saved for this browser tab, including after signing out. Reloading restores the original demo account. Live account storage and recovery require backend integration.</p>
    <div role="tablist" aria-label="Account sections" className="tw:mb-5 tw:grid tw:grid-cols-2 tw:gap-2 tw:rounded-lg tw:border tw:border-solid tw:border-border tw:bg-white tw:p-2">
      {sections.map(item => <button key={item.id} type="button" role="tab" id={`${tabsId}-${item.id}-tab`} aria-controls={`${tabsId}-${item.id}-panel`}
        ref={element => { tabRefs.current[item.id] = element }} aria-selected={active === item.id} tabIndex={active === item.id ? 0 : -1} disabled={busy}
        onClick={() => onSectionChange(item.id)} onKeyDown={event => tabKey(event, item.id)}
        className={`tw:flex tw:min-h-[46px] tw:items-center tw:justify-center tw:gap-2 tw:rounded-md tw:border-0 tw:px-3 tw:py-3 tw:text-[12px] tw:font-semibold ${active === item.id ? 'tw:bg-icon-bg tw:text-primary' : 'tw:bg-white tw:text-text-secondary tw:hover:bg-page'}`}>
        <Icon name={item.icon} size={18} />{item.label}{drafts[item.id] && <span className="tw:size-[5px] tw:rounded-full tw:bg-primary" aria-label="Unsaved changes" />}
      </button>)}
    </div>
    {sections.map(item => <section key={item.id} role="tabpanel" id={`${tabsId}-${item.id}-panel`} aria-labelledby={`${tabsId}-${item.id}-tab`}
      hidden={active !== item.id} className="tw:[&[hidden]]:hidden">
      <AccountForm mode={item.id} account={account} busy={busy} onSave={item.id === 'profile' ? onSaveProfile : onSaveSecurity}
        onDirtyChange={item.id === 'profile' ? profileDirty : securityDirty} />
      {item.id === 'profile' ? <Card className="tw:mt-5 tw:p-6 tw:max-[640px]:p-[17px]">
        <h2>Account Access</h2>
        <dl className="tw:mt-4 tw:grid tw:grid-cols-3 tw:gap-4 tw:text-[12px] tw:max-[640px]:grid-cols-1">
          {[['Account ID', account.id], ['Role', account.role], ['Department', account.department || 'Unassigned']].map(([label, value]) => <div key={label}><dt className="tw:text-[var(--text-muted)]">{label}</dt><dd className="tw:m-0 tw:mt-2 tw:font-semibold tw:[overflow-wrap:anywhere]">{value}</dd></div>)}
        </dl>
        <p className="tw:mt-4 tw:text-[11px] tw:leading-[1.8] tw:text-[var(--text-muted)]">Role and department assignments are managed by your organization administrator.</p>
      </Card> : <Card className="tw:mt-5 tw:p-6 tw:max-[640px]:p-[17px]">
        <h2>Current Session</h2>
        <dl className="tw:mt-4 tw:grid tw:grid-cols-2 tw:gap-4 tw:text-[12px] tw:max-[640px]:grid-cols-1">
          {[['Sign-in email', account.loginEmail], ['Session', 'This browser tab'],
            ['Signed in', signedInAt ? formatTimestamp(signedInAt) : 'Current session'],
            ['Password updated', account.passwordChangedAt ? formatTimestamp(account.passwordChangedAt) : 'Original demo password']]
            .map(([label, value]) => <div key={label}><dt className="tw:text-[var(--text-muted)]">{label}</dt><dd className="tw:m-0 tw:mt-2 tw:font-semibold tw:[overflow-wrap:anywhere]">{value}</dd></div>)}
        </dl>
        <div className="tw:mt-5 tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-4 tw:border-0 tw:border-t tw:border-solid tw:border-border tw:pt-5">
          <p className="tw:text-[12px] tw:text-text-secondary">Sign out of this admin workspace.</p>
          <Button type="button" variant="secondary" disabled={busy} onClick={() => onNavigate('logout')}><Icon name="logout" size={17} />Sign Out</Button>
        </div>
      </Card>}
    </section>)}
  </div>
}
