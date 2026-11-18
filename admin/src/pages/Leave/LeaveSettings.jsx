import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import LeaveSettingsForm from '../../components/leave/LeaveSettingsForm.jsx'
import LeaveEntitlementModal from '../../components/leave/LeaveEntitlementModal.jsx'
import LeaveBalanceCard from '../../components/leave/LeaveBalanceCard.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import { getLeaveBalance } from '../../services/operations/leaveService.js'
import { getLeaveYear } from '../../services/operations/leaveYear.js'
import formatDate from '../../utils/formatters/formatDate.js'

export default function LeaveSettings({ settings, balances, employees, busy = false, onSave, onSaveEntitlement, onNavigate, onDirtyChange }) {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [policyDirty, setPolicyDirty] = useState(false)
  const [pendingEmployee, setPendingEmployee] = useState(null)
  const [formVersion, setFormVersion] = useState(0)
  const query = search.trim().toLowerCase()
  const rows = employees.filter((employee) => [employee.name, employee.id, employee.department].some((text) => text.toLowerCase().includes(query)))
  const employee = employees.find((item) => item.id === editing)
  const period = getLeaveYear()
  function closeEditor() { setEditing(null); onDirtyChange(false) }
  function changePolicyDirty(value) { setPolicyDirty(value); onDirtyChange(value) }
  return <div className="leave-page tw:min-w-0">
    <div className="employee-page-heading tw:flex-wrap tw:max-[768px]:items-start tw:max-[768px]:[&_h1]:text-[23px] tw:shared-base:flex
           tw:shared-base:items-center tw:shared-base:gap-[13px] tw:shared-base:mb-[23px]
           tw:shared-base:[&_>_div]:min-w-0 tw:shared-base:[&_>_div]:flex-1 tw:shared-base:[&_h1]:text-[27px]
           tw:shared-base:[&_h1]:tracking-[-0.6px] tw:shared-base:[&_p]:[color:var(--text-muted)]
           tw:shared-base:[&_p]:text-[12px] tw:shared-base:[&_p]:leading-[1.7] tw:shared-base:[&_p]:mt-[4px]
           tw:shared-base:[&_>_.button]:shrink-0 tw:max-[768px]:shared-base:flex-wrap
           tw:max-[768px]:shared-base:gap-[11px]
           tw:max-[768px]:shared-base:[&_h1]:text-[24px]
           tw:max-[768px]:shared-base:[&_p]:text-[11px]
           tw:max-[768px]:shared-base:[&_>_.button]:ml-[auto]
           tw:max-[560px]:shared-base:[&_h1]:text-[22px]"><span className="icon-circle directory-heading-icon tw:max-[768px]:w-[39px] tw:max-[768px]:h-[39px] tw:shared-base:w-[46px]
          tw:shared-base:h-[46px] tw:shared-base:shrink-0 tw:shared-base:rounded-[50%] tw:shared-base:inline-flex
          tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:w-[49px] tw:shared-base:h-[49px]
          tw:shared-base:[background:#d8f8ee] tw:shared-base:[color:#05695c]"><Icon name="shield" size={28} /></span>
      <div><h1>Leave Settings</h1><p>Manage leave policy and individual employee entitlements.</p></div>
      <Button variant="secondary" disabled={busy} onClick={() => onNavigate('leave')}><Icon name="arrow-left" size={17} />Leave Requests</Button>
    </div>
    <div className="leave-settings-layout tw:grid tw:grid-cols-[minmax(0,_2fr)_minmax(260px,_1fr)] tw:gap-[20px] tw:[align-items:start]
           tw:max-[1100px]:grid-cols-1">
      <LeaveSettingsForm key={`${formVersion}:${JSON.stringify(settings)}`} settings={settings} balances={balances} onSave={onSave} onDirtyChange={changePolicyDirty} />
      <Card as="aside" className="tw:p-[22px] tw:max-[640px]:p-[17px] tw:[&_h2]:flex tw:[&_h2]:items-center tw:[&_h2]:gap-[8px]
          tw:[&_h2_svg]:text-primary tw:[&_dl]:m-[16px_0] tw:[&_dl>div]:flex tw:[&_dl>div]:justify-between
          tw:[&_dl>div]:gap-[15px] tw:[&_dl>div]:[border-bottom:1px_solid_var(--divider)] tw:[&_dl>div]:p-[14px_0]
          tw:[&_dl>div]:text-[12px] tw:[&_dt]:text-[var(--text-muted)] tw:[&_dd]:font-[600] tw:[&_dd]:m-0
          tw:[&_p]:text-[var(--text-muted)] tw:[&_p]:text-[11px] tw:[&_p]:leading-[1.8] tw:[&_p+p]:mt-[12px]" aria-label="Saved leave configuration"><h2><Icon name="check-circle" size={18} /> Saved Settings</h2><dl>
        <div><dt>Annual entitlement</dt><dd>{settings.defaultEntitlement} days</dd></div>
        <div><dt>Balance cap</dt><dd>{settings.maxBalance} days</dd></div>
        <div><dt>Leave year</dt><dd>{period.year} E.C.</dd></div>
        <div><dt>Annual renewal</dt><dd>Meskerem 1</dd></div>
        <div><dt>Next renewal</dt><dd>{formatDate(period.nextStart)}</dd></div>
        <div><dt>Carryover</dt><dd>None</dd></div>
        <div><dt>Day counting</dt><dd>{settings.dayCounting === 'calendar' ? 'Calendar days' : 'Monday–Friday'}</dd></div>
        <div><dt>Minimum notice</dt><dd>{settings.noticeDays} days</dd></div>
        <div><dt>Rejection note</dt><dd>{settings.requireRejectionReason ? 'Required' : 'Optional'}</dd></div>
      </dl><p>At midnight in Ethiopia on Meskerem 1, unused days expire and the balance renews to {settings.defaultEntitlement} days using the saved annual entitlement. Previous-year records are retained.</p></Card>
    </div>
    <Card className="leave-entitlements tw:mt-[24px] tw:p-[22px] tw:max-[768px]:p-[16px]" aria-label="Employee leave entitlements">
      <div className="section-heading tw:shared-base:flex tw:shared-base:justify-between tw:shared-base:items-start
          tw:shared-base:gap-[12px] tw:shared-base:mb-[20px] tw:shared-base:[&_h2]:flex
          tw:shared-base:[&_h2]:items-center tw:shared-base:[&_h2]:gap-[9px]
          tw:shared-base:[&_h2_>_svg]:[color:var(--primary)] tw:shared-base:[&_p]:[color:var(--text-muted)]
          tw:shared-base:[&_p]:text-[12px] tw:shared-base:[&_p]:mt-[6px] tw:shared-base:[&_p]:leading-[1.5]
          tw:max-[768px]:shared-base:[&_h2]:text-[15px]
          tw:max-[768px]:shared-base:gap-[8px] tw:max-[768px]:shared-base:[&_p]:text-[11px]"><div><h2><Icon name="users" size={18} /> Employee Entitlements</h2><p>Adjust this year’s entitlement with a reason. Annual renewal uses the saved entitlement, currently {settings.defaultEntitlement} days.</p></div></div>
      <label className="directory-search tw:max-w-[550px] tw:mb-[20px] tw:shared-base:flex tw:shared-base:items-center
          tw:shared-base:gap-[8px] tw:shared-base:min-w-[190px] tw:shared-base:[flex:1_1_240px]
          tw:shared-base:[border:1px_solid_var(--border)] tw:shared-base:rounded-[6px] tw:shared-base:p-[9px_10px]
          tw:shared-base:[color:#658da0] tw:shared-base:h-[38px]
          tw:[:where(&):focus-within]:[outline:2px_solid_var(--primary)]
          tw:[:where(&):focus-within]:[outline-offset:2px] tw:shared-base:[&_input]:w-full
          tw:shared-base:[&_input]:min-w-0 tw:shared-base:[&_input]:[border:0] tw:shared-base:[&_input]:[outline:0]
          tw:shared-base:[&_input]:text-[10px] tw:shared-base:[&_input]:[color:var(--text-primary)]
          tw:shared-base:[&_input]:[background:transparent] tw:shared-base:[&_input::placeholder]:[color:#628097]
          tw:max-[768px]:shared-base:[flex-basis:100%]"><Icon name="search" size={17} /><input className="tw:text-[12px]" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employee name, ID, or department…" aria-label="Search employee entitlements" /></label>
      <div className="table-scroll tw:shared-base:overflow-x-auto tw:shared-base:[scrollbar-width:thin]
          tw:shared-base:[scrollbar-color:#c5dbd6_#f5f9f9]" tabIndex={0} role="region" aria-label="Employee entitlement records"><table className="employee-table leave-entitlement-table tw:min-w-[720px] tw:text-[12px] tw:[&_td]:py-[18px]
          tw:[&_th:last-child]:text-right tw:[&_td:last-child]:text-right tw:shared-base:w-full
          tw:shared-base:border-collapse tw:shared-base:text-left tw:shared-base:text-[11px]
          tw:shared-base:[&_th]:text-[9px] tw:shared-base:[&_th]:tracking-[0.6px] tw:shared-base:[&_th]:font-[650]
          tw:shared-base:[&_th]:[color:#5c768a] tw:shared-base:[&_th]:[background:#f6f9fb]
          tw:shared-base:[&_th]:p-[13px_12px] tw:shared-base:[&_th]:whitespace-nowrap
          tw:shared-base:[&_th]:[border-bottom:1px_solid_#e6eff2]
          tw:shared-base:[&_th:first-child]:rounded-[5px_0_0_5px]
          tw:shared-base:[&_th:last-child]:rounded-[0_5px_5px_0] tw:shared-base:[&_td]:p-[12px]
          tw:shared-base:[&_td]:[border-bottom:1px_solid_#f0f4f6]
          tw:shared-base:[&_td]:[color:var(--text-secondary)] tw:shared-base:[&_td]:leading-[1.6]
          tw:shared-base:[&_tbody_tr:hover]:[background:#f9fcfb]
          tw:shared-base:[&_tbody_tr:last-child_td]:[border-bottom:0]
          tw:max-[768px]:shared-base:min-w-[870px]">
        <thead><tr>{['Employee', 'Department', 'Current Balance', 'HR Action'].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{rows.map((item) => {
          const balance = balances.find((entry) => entry.employeeId === item.id)
          return <tr key={item.id}><td><strong>{item.name}</strong><small className="leave-employee-id tw:block tw:mt-[2px] tw:[font:11px/1.5_Consolas,monospace]">{item.id}</small></td><td>{item.department}</td>
            <td><LeaveBalanceCard balance={getLeaveBalance(balance)} maxBalance={settings.maxBalance} /></td>
            <td><Button variant="secondary" disabled={busy} onClick={() => { if (policyDirty) setPendingEmployee(item.id); else setEditing(item.id) }}>
              <Icon name={balance ? 'edit' : 'plus'} size={15} />{balance ? 'Adjust Entitlement' : 'Set Entitlement'}</Button></td></tr>
        })}</tbody>
      </table></div>
      {!rows.length && <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]"><h3>No matching employees</h3><p>Try another name, ID, or department.</p></div>}
    </Card>
    {employee && <LeaveEntitlementModal key={employee.id} employee={employee} balance={balances.find((item) => item.employeeId === employee.id)}
      settings={settings} onSave={onSaveEntitlement} onClose={closeEditor} onDirtyChange={onDirtyChange} />}
    {pendingEmployee && <ConfirmationModal title="Discard unsaved policy changes?" confirmLabel="Discard and Continue" onCancel={() => setPendingEmployee(null)}
      onConfirm={() => { changePolicyDirty(false); setFormVersion((value) => value + 1); setEditing(pendingEmployee); setPendingEmployee(null) }}>
      <p>Save your policy first, or discard these changes to adjust the employee’s entitlement using the saved settings.</p>
    </ConfirmationModal>}
  </div>
}
