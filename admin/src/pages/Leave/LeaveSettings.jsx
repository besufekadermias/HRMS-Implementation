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
  return <div className="leave-page">
    <div className="employee-page-heading"><span className="icon-circle directory-heading-icon"><Icon name="shield" size={28} /></span>
      <div><h1>Leave Settings</h1><p>Manage leave policy and individual employee entitlements.</p></div>
      <button className="button button-secondary" disabled={busy} onClick={() => onNavigate('leave')}><Icon name="arrow-left" size={17} />Leave Requests</button>
    </div>
    <div className="attendance-settings-layout leave-settings-layout">
      <LeaveSettingsForm key={`${formVersion}:${JSON.stringify(settings)}`} settings={settings} balances={balances} onSave={onSave} onDirtyChange={changePolicyDirty} />
      <aside className="card attendance-settings-summary" aria-label="Saved leave configuration"><h2><Icon name="check-circle" size={18} /> Saved Settings</h2><dl>
        <div><dt>Annual entitlement</dt><dd>{settings.defaultEntitlement} days</dd></div>
        <div><dt>Balance cap</dt><dd>{settings.maxBalance} days</dd></div>
        <div><dt>Leave year</dt><dd>{period.year} E.C.</dd></div>
        <div><dt>Annual renewal</dt><dd>Meskerem 1</dd></div>
        <div><dt>Next renewal</dt><dd>{formatDate(period.nextStart)}</dd></div>
        <div><dt>Carryover</dt><dd>None</dd></div>
        <div><dt>Day counting</dt><dd>{settings.dayCounting === 'calendar' ? 'Calendar days' : 'Monday–Friday'}</dd></div>
        <div><dt>Minimum notice</dt><dd>{settings.noticeDays} days</dd></div>
        <div><dt>Rejection note</dt><dd>{settings.requireRejectionReason ? 'Required' : 'Optional'}</dd></div>
      </dl><p>At midnight in Ethiopia on Meskerem 1, unused days expire and the balance renews to {settings.defaultEntitlement} days using the saved annual entitlement. Previous-year records are retained.</p></aside>
    </div>
    <section className="card leave-entitlements" aria-label="Employee leave entitlements">
      <div className="section-heading"><div><h2><Icon name="users" size={18} /> Employee Entitlements</h2><p>Adjust this year’s entitlement with a reason. Annual renewal uses the saved entitlement, currently {settings.defaultEntitlement} days.</p></div></div>
      <label className="directory-search"><Icon name="search" size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employee name, ID, or department…" aria-label="Search employee entitlements" /></label>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Employee entitlement records"><table className="employee-table leave-entitlement-table">
        <thead><tr>{['Employee', 'Department', 'Current Balance', 'HR Action'].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{rows.map((item) => {
          const balance = balances.find((entry) => entry.employeeId === item.id)
          return <tr key={item.id}><td><strong>{item.name}</strong><small className="leave-employee-id">{item.id}</small></td><td>{item.department}</td>
            <td><LeaveBalanceCard balance={getLeaveBalance(balance)} maxBalance={settings.maxBalance} /></td>
            <td><button className="button button-secondary" disabled={busy} onClick={() => { if (policyDirty) setPendingEmployee(item.id); else setEditing(item.id) }}>
              <Icon name={balance ? 'edit' : 'plus'} size={15} />{balance ? 'Adjust Entitlement' : 'Set Entitlement'}</button></td></tr>
        })}</tbody>
      </table></div>
      {!rows.length && <div className="empty-state"><h3>No matching employees</h3><p>Try another name, ID, or department.</p></div>}
    </section>
    {employee && <LeaveEntitlementModal key={employee.id} employee={employee} balance={balances.find((item) => item.employeeId === employee.id)}
      settings={settings} onSave={onSaveEntitlement} onClose={closeEditor} onDirtyChange={onDirtyChange} />}
    {pendingEmployee && <ConfirmationModal title="Discard unsaved policy changes?" confirmLabel="Discard and Continue" onCancel={() => setPendingEmployee(null)}
      onConfirm={() => { changePolicyDirty(false); setFormVersion((value) => value + 1); setEditing(pendingEmployee); setPendingEmployee(null) }}>
      <p>Save your policy first, or discard these changes to adjust the employee’s entitlement using the saved settings.</p>
    </ConfirmationModal>}
  </div>
}
