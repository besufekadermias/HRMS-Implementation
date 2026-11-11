import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import LeaveStats from '../../components/leave/LeaveStats.jsx'
import LeaveRequestsTable from '../../components/leave/LeaveRequestsTable.jsx'
import LeaveActionModal from '../../components/leave/LeaveActionModal.jsx'
import LeaveRequestModal from '../../components/leave/LeaveRequestModal.jsx'
import { INITIAL_LEAVE_SETTINGS } from '../../utils/constants/constants.js'
import { todayInNairobi } from '../../utils/validation/validators.js'
import { buildLeaveRows, filterLeaveRequests, getLeaveApprovalError, summarizeLeave } from '../../services/operations/leaveService.js'

const filters = [ ['', 'All Requests'], ['PENDING', 'Pending'], ['APPROVED', 'Approved'], ['REJECTED', 'Rejected'] ]

export default function LeaveOverview({ requests, balances, employees, settings = INITIAL_LEAVE_SETTINGS, search, onSearch, onDecide, onSaveRequest, onNavigate, onDirtyChange, initialStatus = '', today = todayInNairobi() }) {
  const [status, setStatus] = useState(initialStatus)
  const [action, setAction] = useState(null)
  const [editor, setEditor] = useState(null)
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState({ key: '', page: 1 })
  const rows = buildLeaveRows(requests, balances, employees)
  const filtered = filterLeaveRequests(rows, { search, status })
  const filterKey = JSON.stringify([search, status, pageSize])
  const page = pagination.key === filterKey
    ? Math.min(pagination.page, Math.max(1, Math.ceil(filtered.length / pageSize))) : 1
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const deciding = rows.find((row) => row.id === action?.id)

  function clearFilters() {
    onSearch('')
    setStatus('')
  }
  function closeDialog() { setAction(null); setEditor(null); onDirtyChange(false) }

  return (
    <div className="leave-page">
      <div className="employee-page-heading">
        <span className="icon-circle directory-heading-icon"><Icon name="calendar-check" size={28} /></span>
        <div>
          <h1>Leave Approvals &amp; Entitlement Management</h1>
          <p>Review leave requests and track the {settings.defaultEntitlement}-day annual entitlement. Unused days expire at Ethiopian year-end.</p>
        </div>
        <div className="leave-heading-actions">
          <button className="button button-secondary" onClick={() => onNavigate('leave-settings')}><Icon name="shield" size={17} />Leave Settings</button>
          <button className="button button-primary" onClick={() => setEditor({})}><Icon name="plus" size={17} />New Request</button>
        </div>
      </div>
      <LeaveStats summary={summarizeLeave(requests, today)} today={today} />
      <section className="card leave-filters" aria-label="Filter leave requests">
        <label className="directory-search">
          <Icon name="search" size={19} />
          <input type="search" value={search} onChange={(event) => onSearch(event.target.value)}
            placeholder="Search by employee name, serial number, department…"
            aria-label="Search leave requests" aria-controls="leave-requests-table" />
        </label>
        <div className="leave-status-filters" role="group" aria-label="Request status">
          {filters.map(([value, label]) => (
            <button key={value} type="button" className={status === value ? 'selected' : ''}
              aria-pressed={status === value} aria-controls="leave-requests-table" onClick={() => setStatus(value)}>{label}</button>
          ))}
        </div>
      </section>
      <section className="card leave-main" aria-label="Leave approvals">
        <LeaveRequestsTable rows={visible} maxBalance={settings.maxBalance} onAction={(id, nextStatus) => setAction({ id, status: nextStatus })} onEdit={(request) => setEditor({ request })} />
        {!filtered.length && (
          <div className="empty-state">
            <Icon name={status === 'PENDING' && !search.trim() ? 'check-circle' : 'calendar'} size={32} />
            <h3>{!requests.length ? 'No leave requests yet' : status === 'PENDING' && !search.trim() ? 'All caught up' : 'No matching leave requests'}</h3>
            <p>{!requests.length ? 'Leave requests will appear here when employees submit them.' : status === 'PENDING' && !search.trim() ? 'There are no requests awaiting HR approval.' : 'Try another name, serial number, department, or status.'}</p>
            {(search || status) && <button className="button button-secondary" onClick={clearFilters}>Clear Filters</button>}
          </div>
        )}
        <Pagination page={page} pageSize={pageSize} total={filtered.length} itemLabel="requests"
          onPageChange={(next) => setPagination({ key: filterKey, page: next })} onPageSizeChange={setPageSize} />
      </section>
      <footer className="dashboard-footer leave-footer">
        <span><Icon name="shield" size={15} /> Renews to {settings.defaultEntitlement} days on Meskerem 1 · No carryover · Pending requests do not deduct leave.</span>
        <span>Hadiya Science · IT Department</span>
      </footer>
      {deciding && <LeaveActionModal key={`${deciding.id}:${action.status}`} request={deciding} status={action.status} settings={settings}
        approvalError={getLeaveApprovalError(deciding, deciding.balance, requests, employees, settings)}
        onDecide={onDecide} onClose={closeDialog} onDirtyChange={onDirtyChange} />}
      {editor && <LeaveRequestModal request={editor.request} employees={employees} balances={balances} settings={settings}
        onSave={async (values) => { await onSaveRequest(values); clearFilters(); setStatus('PENDING') }} onClose={closeDialog} onDirtyChange={onDirtyChange} />}
    </div>
  )
}
