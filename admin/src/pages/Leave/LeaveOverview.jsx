import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
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
    <div className="leave-page tw:min-w-0">
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
          tw:max-[560px]:shared-base:[&_h1]:text-[22px]">
        <span className="icon-circle directory-heading-icon tw:max-[768px]:w-[39px] tw:max-[768px]:h-[39px] tw:shared-base:w-[46px]
          tw:shared-base:h-[46px] tw:shared-base:shrink-0 tw:shared-base:rounded-[50%] tw:shared-base:inline-flex
          tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:w-[49px] tw:shared-base:h-[49px]
          tw:shared-base:[background:#d8f8ee] tw:shared-base:[color:#05695c]"><Icon name="calendar-check" size={28} /></span>
        <div>
          <h1>Leave Approvals &amp; Entitlement Management</h1>
          <p>Review leave requests and track the {settings.defaultEntitlement}-day annual entitlement. Unused days expire at Ethiopian year-end.</p>
        </div>
        <div className="leave-heading-actions tw:flex tw:gap-[9px] tw:flex-wrap tw:justify-end tw:[&.leave-heading-actions]:flex-[0_0_auto]
          tw:max-[768px]:[&.leave-heading-actions]:basis-full tw:max-[768px]:justify-start">
          <Button variant="secondary" onClick={() => onNavigate('leave-settings')}><Icon name="shield" size={17} />Leave Settings</Button>
          <Button onClick={() => setEditor({})}><Icon name="plus" size={17} />New Request</Button>
        </div>
      </div>
      <LeaveStats summary={summarizeLeave(requests, today)} today={today} />
      <Card className="leave-filters tw:flex tw:items-center tw:flex-wrap tw:gap-[14px] tw:p-[18px] tw:mb-[24px] tw:max-[768px]:p-[14px]
          tw:max-[768px]:gap-[12px]" aria-label="Filter leave requests">
        <label className="directory-search tw:flex-[1_1_310px] tw:h-[44px] tw:px-[13px] tw:rounded-[9px] tw:max-[768px]:min-w-0
          tw:max-[768px]:basis-full tw:shared-base:flex tw:shared-base:items-center tw:shared-base:gap-[8px]
          tw:shared-base:min-w-[190px] tw:shared-base:[flex:1_1_240px]
          tw:shared-base:[border:1px_solid_var(--border)] tw:shared-base:rounded-[6px] tw:shared-base:p-[9px_10px]
          tw:shared-base:[color:#658da0] tw:shared-base:h-[38px]
          tw:[:where(&):focus-within]:[outline:2px_solid_var(--primary)]
          tw:[:where(&):focus-within]:[outline-offset:2px] tw:shared-base:[&_input]:w-full
          tw:shared-base:[&_input]:min-w-0 tw:shared-base:[&_input]:[border:0] tw:shared-base:[&_input]:[outline:0]
          tw:shared-base:[&_input]:text-[10px] tw:shared-base:[&_input]:[color:var(--text-primary)]
          tw:shared-base:[&_input]:[background:transparent] tw:shared-base:[&_input::placeholder]:[color:#628097]
          tw:max-[768px]:shared-base:[flex-basis:100%]">
          <Icon name="search" size={19} />
          <input className="tw:text-[12px] tw:max-[768px]:text-[16px]" type="search" value={search} onChange={(event) => onSearch(event.target.value)}
            placeholder="Search by employee name, serial number, department…"
            aria-label="Search leave requests" aria-controls="leave-requests-table" />
        </label>
        <div className="leave-status-filters tw:flex tw:flex-wrap tw:gap-[7px] tw:max-[768px]:w-full tw:max-[768px]:gap-[5px]" role="group" aria-label="Request status">
          {filters.map(([value, label]) => (
            <button key={value} type="button" className={`tw:min-h-[38px] tw:p-[9px_15px] tw:[border:1px_solid_transparent] tw:rounded-[20px] tw:text-[11px] tw:font-[650]
          tw:max-[768px]:flex-[1_1_auto] tw:max-[768px]:p-[8px_10px] tw:max-[768px]:min-h-[42px] ${status === value ? "selected tw:bg-primary tw:text-white" : "tw:bg-[#f0f5f7] tw:text-text-secondary tw:hover:bg-[#e2efeb]"}`}
              aria-pressed={status === value} aria-controls="leave-requests-table" onClick={() => setStatus(value)}>{label}</button>
          ))}
        </div>
      </Card>
      <Card className="leave-main tw:overflow-hidden tw:[&_.directory-pagination]:px-[20px]
          tw:max-[768px]:[&_.directory-pagination]:px-[14px]" aria-label="Leave approvals">
        <LeaveRequestsTable rows={visible} maxBalance={settings.maxBalance} onAction={(id, nextStatus) => setAction({ id, status: nextStatus })} onEdit={(request) => setEditor({ request })} />
        {!filtered.length && (
          <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]">
            <Icon name={status === 'PENDING' && !search.trim() ? 'check-circle' : 'calendar'} size={32} />
            <h3>{!requests.length ? 'No leave requests yet' : status === 'PENDING' && !search.trim() ? 'All caught up' : 'No matching leave requests'}</h3>
            <p>{!requests.length ? 'Leave requests will appear here when employees submit them.' : status === 'PENDING' && !search.trim() ? 'There are no requests awaiting HR approval.' : 'Try another name, serial number, department, or status.'}</p>
            {(search || status) && <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>}
          </div>
        )}
        <Pagination page={page} pageSize={pageSize} total={filtered.length} itemLabel="requests"
          onPageChange={(next) => setPagination({ key: filterKey, page: next })} onPageSizeChange={setPageSize} />
      </Card>
      <footer className={`dashboard-footer leave-footer tw:flex-wrap tw:gap-[12px] tw:leading-[1.7] tw:shared-footer:flex
          tw:shared-footer:justify-between tw:shared-footer:items-center tw:shared-footer:gap-[15px]
          tw:shared-footer:text-[#74909b] tw:shared-footer:p-[20px_0] tw:shared-footer:text-[10px]
          tw:max-[768px]:shared-footer:flex-wrap tw:max-[768px]:shared-footer:gap-[8px]
          tw:max-[768px]:shared-footer:text-[9px] `}>
        <span className="tw:flex tw:items-center tw:gap-[7px] tw:max-[768px]:items-start"><Icon name="shield" size={15} /> Renews to {settings.defaultEntitlement} days on Meskerem 1 · No carryover · Pending requests do not deduct leave.</span>
        <span className="tw:inline-flex tw:items-center tw:gap-[6px]">Hadiya Science · IT Department</span>
      </footer>
      {deciding && <LeaveActionModal key={`${deciding.id}:${action.status}`} request={deciding} status={action.status} settings={settings}
        approvalError={getLeaveApprovalError(deciding, deciding.balance, requests, employees, settings)}
        onDecide={onDecide} onClose={closeDialog} onDirtyChange={onDirtyChange} />}
      {editor && <LeaveRequestModal request={editor.request} employees={employees} balances={balances} settings={settings}
        onSave={async (values) => { await onSaveRequest(values); clearFilters(); setStatus('PENDING') }} onClose={closeDialog} onDirtyChange={onDirtyChange} />}
    </div>
  )
}
