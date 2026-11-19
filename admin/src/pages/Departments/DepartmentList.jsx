import Card from '../../components/common/Card.jsx'
import Button, { TextButton } from '../../components/common/Button.jsx'
import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Modal, { ModalActions } from '../../components/common/Modal.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import DepartmentTable from '../../components/departments/DepartmentTable.jsx'
import DepartmentModal from '../../components/departments/DepartmentModal.jsx'
import DepartmentDistributionChart from '../../components/dashboard/DepartmentDistributionChart.jsx'
import { formatTimestamp } from '../../utils/formatters/formatTime.js'

const colors = [
  '#087f6d',
  '#9872ec',
  '#ef79b5',
  '#ffb832',
  '#429aeb',
  '#25aab6',
]

export default function DepartmentList({
  departments,
  employees,
  changes,
  search,
  onSearch,
  onSave,
  onDelete,
  onViewEmployees,
  onDirtyChange,
}) {
  const [filters, setFilters] = useState({ department: '', status: '' })
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState({ key: '', page: 1 })
  const [editor, setEditor] = useState(null)
  const [removeCandidate, setRemoveCandidate] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [showAllChanges, setShowAllChanges] = useState(false)
  const rows = departments.map((department, index) => ({
    ...department,
    color: colors[index % colors.length],
    count: employees.filter(
      (employee) => employee.department === department.name,
    ).length,
    head: employees.find((employee) => employee.id === department.headId),
  }))
  const total = rows.reduce((sum, department) => sum + department.count, 0)
  const largest = total
    ? rows.reduce((a, b) => (b.count > a.count ? b : a))
    : null
  const inactiveCount = departments.filter(
    (department) => department.status === 'Inactive',
  ).length
  const query = search.trim().toLowerCase()
  const filtered = rows.filter(
    (department) =>
      [
        department.name,
        department.code,
        department.head?.name || '',
        String(department.id),
      ].some((value) => value.toLowerCase().includes(query)) &&
      (!filters.department || String(department.id) === filters.department) &&
      (!filters.status || department.status === filters.status),
  )
  const filterKey = JSON.stringify([query, filters, pageSize])
  const page =
    pagination.key === filterKey
      ? Math.min(
          pagination.page,
          Math.max(1, Math.ceil(filtered.length / pageSize)),
        )
      : 1
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const removing = rows.find((department) => department.id === removeCandidate)

  function clearFilters() {
    onSearch('')
    setFilters({ department: '', status: '' })
  }
  function closeEditor() {
    setEditor(null)
    onDirtyChange(false)
  }

  return (
    <div className="department-page">
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
          tw:shared-base:[background:#d8f8ee] tw:shared-base:[color:#05695c]">
          <Icon name="building" size={27} />
        </span>
        <div>
          <h1>Department Management</h1>
          <p>
            Manage organizational units, department details, and staff
            assignments within Hadiya Science IT Department.
          </p>
        </div>
        <Button onClick={() => setEditor({})}>
          <Icon name="plus" size={18} />
          Add Department
        </Button>
      </div>
      <section className="department-stats tw:grid tw:grid-cols-4 tw:gap-[15px] tw:mb-[19px] tw:max-[1100px]:grid-cols-2
          tw:max-[400px]:grid-cols-[minmax(0,_1fr)] tw:[&_.stat-card]:min-h-[130px] tw:[&_.stat-card]:p-[20px_17px]
          tw:[&_.stat-card]:gap-[14px] tw:max-[1440px]:[&_.stat-card]:p-[18px_14px]
          tw:max-[1440px]:[&_.stat-card]:gap-[10px] tw:max-[1440px]:[&_.icon-circle]:w-[37px]
          tw:max-[1440px]:[&_.icon-circle]:h-[37px] tw:[&_.stat-card_.stat-value]:text-[30px]
          tw:[&_.stat-card:last-child_.stat-value]:text-[30px]
          tw:[&_.stat-card:nth-child(3)_.stat-value]:text-[16px]
          tw:[&_.stat-card:nth-child(3)_.stat-value]:leading-[1.45]
          tw:[&_.stat-card:nth-child(3)_.stat-value]:tracking-[-0.2px]
          tw:[&_.stat-card:nth-child(3)_.stat-value]:[overflow-wrap:anywhere] tw:[&_.stat-content_h2]:text-[11px]
          tw:[&_.stat-detail]:text-[10px] tw:[&_.stat-detail]:leading-[1.5]" aria-label="Department statistics">
        <StatCard
          label="Total Departments"
          value={departments.length}
          icon="building"
          detail={`${departments.length - inactiveCount} active departments`}
        />
        <StatCard
          label="Total Employees"
          value={total}
          icon="users"
          detail="Across all departments"
        />
        <StatCard
          label="Largest Department"
          value={largest?.name || 'Not available'}
          icon="award"
          detail={
            largest
              ? `${largest.count} employees (${((largest.count / total) * 100).toFixed(1)}%)`
              : 'No employees assigned'
          }
        />
        <StatCard
          label="Inactive Departments"
          value={inactiveCount}
          icon="building"
          tone={inactiveCount ? 'amber' : 'green'}
          detail={
            inactiveCount
              ? 'Closed to new assignments'
              : 'No inactive departments'
          }
        />
      </section>
      <div className="department-layout tw:grid tw:grid-cols-[minmax(0,_2.65fr)_minmax(300px,_1fr)] tw:[align-items:start] tw:gap-[17px]
          tw:max-[1440px]:grid-cols-[minmax(0,_1fr)]">
        <Card
          className="department-main tw:p-[18px_16px_0] tw:max-[640px]:p-[13px_12px_0]"
          aria-label="Department management"
        >
          <div className="employee-filters department-filters tw:flex tw:items-center tw:flex-wrap tw:gap-[9px] tw:pb-[17px]
          tw:max-[768px]:gap-[8px]">
            <label className="directory-search tw:flex-[1_1_220px] tw:max-[640px]:basis-full tw:shared-base:flex tw:shared-base:items-center
          tw:shared-base:gap-[8px] tw:shared-base:min-w-[190px] tw:shared-base:[flex:1_1_240px]
          tw:shared-base:[border:1px_solid_var(--border)] tw:shared-base:rounded-[6px] tw:shared-base:p-[9px_10px]
          tw:shared-base:[color:#658da0] tw:shared-base:h-[38px]
          tw:[:where(&):focus-within]:[outline:2px_solid_var(--primary)]
          tw:[:where(&):focus-within]:[outline-offset:2px] tw:shared-base:[&_input]:w-full
          tw:shared-base:[&_input]:min-w-0 tw:shared-base:[&_input]:[border:0] tw:shared-base:[&_input]:[outline:0]
          tw:shared-base:[&_input]:text-[10px] tw:shared-base:[&_input]:[color:var(--text-primary)]
          tw:shared-base:[&_input]:[background:transparent] tw:shared-base:[&_input::placeholder]:[color:#628097]
          tw:max-[768px]:shared-base:[flex-basis:100%]">
              <Icon name="search" size={17} />
              <input
                type="search"
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="Search by name, code, or head…"
                aria-label="Search departments"
                aria-controls="department-table"
              />
            </label>
            <select
              className="tw:flex-[1_1_110px] tw:min-w-0 tw:max-w-[155px] tw:h-[38px] tw:p-[8px_25px_8px_10px]
          tw:[border:1px_solid_var(--border)] tw:rounded-[6px] tw:text-text-secondary tw:bg-white tw:text-[10px]
          tw:text-ellipsis tw:max-[640px]:max-w-none"
              aria-label="Filter departments"
              value={filters.department}
              onChange={(event) =>
                setFilters({ ...filters, department: event.target.value })
              }
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            <select
              className="tw:flex-[1_1_110px] tw:min-w-0 tw:max-w-[155px] tw:h-[38px] tw:p-[8px_25px_8px_10px]
          tw:[border:1px_solid_var(--border)] tw:rounded-[6px] tw:text-text-secondary tw:bg-white tw:text-[10px]
          tw:text-ellipsis tw:max-[640px]:max-w-none"
              aria-label="Filter department status"
              value={filters.status}
              onChange={(event) =>
                setFilters({ ...filters, status: event.target.value })
              }
            >
              <option value="">All Statuses</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <TextButton className="tw:[&.text-button]:text-[10px] tw:[&.text-button]:p-[6px]" onClick={clearFilters}>
              Clear Filters
            </TextButton>
          </div>
          <DepartmentTable
            departments={visible}
            onEdit={(department) => setEditor({ department })}
            onDelete={(department) => {
              setRemoveCandidate(department.id)
              setDeleteError('')
            }}
            onViewEmployees={onViewEmployees}
          />
          {!filtered.length && (
            <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]">
              <Icon name="building" size={32} />
              <h3>
                {departments.length
                  ? 'No matching departments'
                  : 'No departments yet'}
              </h3>
              <p>
                {departments.length
                  ? 'Try another name, code, head, or status.'
                  : 'Add your first department to start organizing your team.'}
              </p>
              <Button variant="secondary"
                onClick={
                  departments.length ? clearFilters : () => setEditor({})
                }
              >
                {departments.length ? 'Clear Filters' : 'Add Department'}
              </Button>
            </div>
          )}
          <Pagination
            itemLabel="departments"
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            onPageChange={(next) =>
              setPagination({ key: filterKey, page: next })
            }
            onPageSizeChange={setPageSize}
          />
        </Card>
        <aside className="department-aside tw:grid tw:gap-[15px] tw:min-w-0 tw:[&>.card]:p-[18px_16px] tw:[&_h2]:flex tw:[&_h2]:items-center
          tw:[&_h2]:gap-[8px] tw:[&_h2]:text-[12px] tw:[&_h2>svg]:text-primary tw:[&_.section-heading]:mb-[15px]
          tw:max-[1440px]:grid-cols-3 tw:max-[1440px]:[align-items:start] tw:max-[1100px]:grid-cols-2
          tw:max-[640px]:grid-cols-[minmax(0,_1fr)]" aria-label="Department insights">
          <DepartmentDistributionChart
            data={rows}
            title="Department Overview"
          />
          <Card className="department-bars">
            <h2>
              <Icon name="building" size={18} />
              Department Distribution
            </h2>
            {rows.length ? (
              <ul className="tw:list-none tw:m-[16px_0_0] tw:p-0">
                {rows.map((department) => {
                  const percentage = total
                    ? (department.count / total) * 100
                    : 0
                  return (
                    <li key={department.id} className="tw:[&+li]:mt-[13px]">
                      <div className="tw:flex tw:items-baseline tw:gap-[10px] tw:text-[10px] tw:leading-[1.5]">
                        <span className="tw:flex-1 tw:min-w-0 tw:[overflow-wrap:anywhere]">{department.name}</span>
                        <strong className="tw:font-[500]">{department.count}</strong>
                        <small className="tw:w-[37px] tw:text-[var(--text-muted)] tw:text-right tw:text-[9px]">{percentage.toFixed(1)}%</small>
                      </div>
                      <div
                        className="department-bar-track tw:h-[8px] tw:overflow-hidden tw:bg-[#edf6fa] tw:rounded-[10px] tw:mt-[5px]"
                        role="img"
                        aria-label={`${department.name}: ${department.count} employees, ${percentage.toFixed(1)} percent`}
                      >
                        <span
                          className="tw:block tw:h-full tw:rounded-[inherit] tw:flex-1 tw:min-w-0 tw:[overflow-wrap:anywhere]"
                          style={{
                            width: `${percentage}%`,
                            background: department.color,
                          }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="muted-note tw:shared-base:block tw:shared-base:[color:var(--text-muted)] tw:shared-base:text-[12px]
          tw:shared-base:leading-[1.8] tw:shared-base:mt-[17px]">
                Add departments to see your distribution.
              </p>
            )}
          </Card>
          <Card className="department-changes tw:max-[1100px]:col-span-full">
            <div className="section-heading tw:items-center tw:shared-base:flex tw:shared-base:justify-between tw:shared-base:items-start
          tw:shared-base:gap-[12px] tw:shared-base:mb-[20px] tw:shared-base:[&_h2]:flex
          tw:shared-base:[&_h2]:items-center tw:shared-base:[&_h2]:gap-[9px]
          tw:shared-base:[&_h2_>_svg]:[color:var(--primary)] tw:shared-base:[&_p]:[color:var(--text-muted)]
          tw:shared-base:[&_p]:text-[12px] tw:shared-base:[&_p]:mt-[6px] tw:shared-base:[&_p]:leading-[1.5]
          tw:max-[768px]:shared-base:[&_h2]:text-[15px]
          tw:max-[768px]:shared-base:gap-[8px] tw:max-[768px]:shared-base:[&_p]:text-[11px]">
              <h2>
                <Icon name="clock" size={18} />
                Recent Changes
              </h2>
              {changes.length > 4 && (
                <TextButton
                  className="tw:[&.text-button]:text-[10px] tw:[&.text-button]:min-h-[24px]"
                  onClick={() => setShowAllChanges(!showAllChanges)}
                >
                  {showAllChanges ? 'Show less' : 'View all'}
                </TextButton>
              )}
            </div>
            {changes.length ? (
              <ol className="tw:list-none tw:m-[16px_0_0] tw:p-0">
                {(showAllChanges ? changes : changes.slice(0, 4)).map(
                  (change) => (
                    <li key={change.id} className="tw:flex tw:gap-[10px] tw:mt-[14px] tw:leading-[1.6]">
                      <span className="icon-circle tone-green tw:w-[29px] tw:h-[29px] tw:shared-base:w-[46px] tw:shared-base:h-[46px]
          tw:shared-base:shrink-0 tw:shared-base:rounded-[50%] tw:shared-base:inline-flex
          tw:shared-base:items-center tw:shared-base:justify-center tw:[:where(&.tone-green)]:[color:#0b8972]
          tw:[:where(&.tone-green)]:[background:#e3f5f0]">
                        <Icon name={change.icon} size={17} />
                      </span>
                      <div className="tw:min-w-0 tw:[overflow-wrap:anywhere]">
                        <strong className="tw:text-[10px] tw:font-[600]">{change.title}</strong>
                        <p className="tw:text-[10px] tw:text-[var(--text-muted)]">{change.description}</p>
                        <time className="tw:text-[9px] tw:text-[var(--text-muted)]" dateTime={change.time}>
                          {formatTimestamp(change.time, { year: undefined })}{' '}
                          · EAT
                        </time>
                      </div>
                    </li>
                  ),
                )}
              </ol>
            ) : (
              <div className="department-changes-empty tw:flex tw:flex-col tw:items-center tw:gap-[9px] tw:p-[10px] tw:text-center">
                <span className="icon-circle tone-green tw:shared-base:w-[46px] tw:shared-base:h-[46px] tw:shared-base:shrink-0
          tw:shared-base:rounded-[50%] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:[:where(&.tone-green)]:[color:#0b8972]
          tw:[:where(&.tone-green)]:[background:#e3f5f0]">
                  <Icon name="clock" size={24} />
                </span>
                <strong className="tw:text-[12px]">No changes this session</strong>
                <p className="tw:text-[11px] tw:leading-[1.6] tw:text-[var(--text-muted)]">Department updates and staff moves will appear here.</p>
              </div>
            )}
          </Card>
        </aside>
      </div>
      <footer className={`dashboard-footer tw:shared-footer:flex tw:shared-footer:justify-between tw:shared-footer:items-center
          tw:shared-footer:gap-[15px] tw:shared-footer:text-[#74909b] tw:shared-footer:p-[20px_0]
          tw:shared-footer:text-[10px] tw:max-[768px]:shared-footer:flex-wrap
          tw:max-[768px]:shared-footer:gap-[8px] tw:max-[768px]:shared-footer:text-[9px] `}>
        <span>Hadiya Science · IT Department</span>
        <span className="tw:inline-flex tw:items-center tw:gap-[6px]">
          <span className="status-dot tone-green tw:[:where(&.tone-green)]:[color:#0b8972] tw:[:where(&.tone-green)]:[background:#e3f5f0]
          tw:[:where(&.status-dot)]:inline-block tw:[:where(&.status-dot)]:h-[6px]
          tw:[:where(&.status-dot)]:w-[6px] tw:[:where(&.status-dot)]:shrink-0
          tw:[:where(&.status-dot)]:rounded-[50%] tw:[:where(&.status-dot)]:[background:currentColor]" />
          Department Management
        </span>
      </footer>
      {editor && (
        <DepartmentModal
          department={editor.department}
          departments={departments}
          employees={employees}
          onDirtyChange={onDirtyChange}
          onClose={closeEditor}
          onSave={async (values) => {
            await onSave(values)
            closeEditor()
            clearFilters()
          }}
        />
      )}
      {removing &&
        (removing.count > 0 ? (
          <Modal
            title="Move employees before deleting"
            onClose={() => setRemoveCandidate(null)}
          >
            <div className="confirmation-copy tw:shared-base:[color:var(--text-secondary)] tw:shared-base:text-[14px]
          tw:shared-base:leading-[1.8]">
              <p>
                <strong>{removing.name}</strong> has {removing.count} assigned
                employee{removing.count === 1 ? '' : 's'}. Move them to another
                department before deleting it. You can also mark the department
                inactive to keep its records.
              </p>
            </div>
            <ModalActions >
              <Button variant="secondary"
                onClick={() => setRemoveCandidate(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => onViewEmployees(removing.name)}
              >
                View Employees
                <Icon name="arrow" size={17} />
              </Button>
            </ModalActions>
          </Modal>
        ) : (
          <ConfirmationModal
            title="Delete department?"
            confirmLabel="Delete Department"
            destructive
            onCancel={() => setRemoveCandidate(null)}
            onConfirm={() => {
              try {
                onDelete(removing.id)
                setRemoveCandidate(null)
                clearFilters()
              } catch (error) {
                setDeleteError(error.message)
              }
            }}
          >
            <p>
              Delete <strong>{removing.name}</strong>? There are no employees
              assigned to this department.
            </p>
            {deleteError && (
              <p className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" role="alert">
                {deleteError}
              </p>
            )}
          </ConfirmationModal>
        ))}
    </div>
  )
}
