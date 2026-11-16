import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Modal from '../../components/common/Modal.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import DepartmentTable from '../../components/departments/DepartmentTable.jsx'
import DepartmentModal from '../../components/departments/DepartmentModal.jsx'
import DepartmentDistributionChart from '../../components/dashboard/DepartmentDistributionChart.jsx'

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
      <div className="employee-page-heading">
        <span className="icon-circle directory-heading-icon">
          <Icon name="building" size={27} />
        </span>
        <div>
          <h1>Department Management</h1>
          <p>
            Manage organizational units, department details, and staff
            assignments within Hadiya Science IT Department.
          </p>
        </div>
        <button className="button button-primary" onClick={() => setEditor({})}>
          <Icon name="plus" size={18} />
          Add Department
        </button>
      </div>
      <section className="department-stats" aria-label="Department statistics">
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
      <div className="department-layout">
        <section
          className="card department-main"
          aria-label="Department management"
        >
          <div className="employee-filters department-filters">
            <label className="directory-search">
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
            <button className="text-button" onClick={clearFilters}>
              Clear Filters
            </button>
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
            <div className="empty-state">
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
              <button
                className="button button-secondary"
                onClick={
                  departments.length ? clearFilters : () => setEditor({})
                }
              >
                {departments.length ? 'Clear Filters' : 'Add Department'}
              </button>
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
        </section>
        <aside className="department-aside" aria-label="Department insights">
          <DepartmentDistributionChart
            data={rows}
            title="Department Overview"
          />
          <section className="card department-bars">
            <h2>
              <Icon name="building" size={18} />
              Department Distribution
            </h2>
            {rows.length ? (
              <ul>
                {rows.map((department) => {
                  const percentage = total
                    ? (department.count / total) * 100
                    : 0
                  return (
                    <li key={department.id}>
                      <div>
                        <span>{department.name}</span>
                        <strong>{department.count}</strong>
                        <small>{percentage.toFixed(1)}%</small>
                      </div>
                      <div
                        className="department-bar-track"
                        role="img"
                        aria-label={`${department.name}: ${department.count} employees, ${percentage.toFixed(1)} percent`}
                      >
                        <span
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
              <p className="muted-note">
                Add departments to see your distribution.
              </p>
            )}
          </section>
          <section className="card department-changes">
            <div className="section-heading">
              <h2>
                <Icon name="clock" size={18} />
                Recent Changes
              </h2>
              {changes.length > 4 && (
                <button
                  className="text-button"
                  onClick={() => setShowAllChanges(!showAllChanges)}
                >
                  {showAllChanges ? 'Show less' : 'View all'}
                </button>
              )}
            </div>
            {changes.length ? (
              <ol>
                {(showAllChanges ? changes : changes.slice(0, 4)).map(
                  (change) => (
                    <li key={change.id}>
                      <span className="icon-circle tone-green">
                        <Icon name={change.icon} size={17} />
                      </span>
                      <div>
                        <strong>{change.title}</strong>
                        <p>{change.description}</p>
                        <time dateTime={change.time}>
                          {new Intl.DateTimeFormat('en-GB', {
                            timeZone: 'Africa/Nairobi',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(new Date(change.time))}{' '}
                          · EAT
                        </time>
                      </div>
                    </li>
                  ),
                )}
              </ol>
            ) : (
              <div className="department-changes-empty">
                <span className="icon-circle tone-green">
                  <Icon name="clock" size={24} />
                </span>
                <strong>No changes this session</strong>
                <p>Department updates and staff moves will appear here.</p>
              </div>
            )}
          </section>
        </aside>
      </div>
      <footer className="dashboard-footer">
        <span>Hadiya Science · IT Department</span>
        <span>
          <span className="status-dot tone-green" />
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
            <div className="confirmation-copy">
              <p>
                <strong>{removing.name}</strong> has {removing.count} assigned
                employee{removing.count === 1 ? '' : 's'}. Move them to another
                department before deleting it. You can also mark the department
                inactive to keep its records.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="button button-secondary"
                onClick={() => setRemoveCandidate(null)}
              >
                Close
              </button>
              <button
                className="button button-primary"
                onClick={() => onViewEmployees(removing.name)}
              >
                View Employees
                <Icon name="arrow" size={17} />
              </button>
            </div>
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
              <p className="field-error" role="alert">
                {deleteError}
              </p>
            )}
          </ConfirmationModal>
        ))}
    </div>
  )
}
