import { useRef, useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import Modal from '../../components/common/Modal.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import EmployeeFilters from '../../components/employees/EmployeeFilters.jsx'
import EmployeeTable from '../../components/employees/EmployeeTable.jsx'
import DepartmentDistributionChart from '../../components/dashboard/DepartmentDistributionChart.jsx'
import {
  INITIAL_DEPARTMENTS,
  JOB_GRADES,
} from '../../utils/constants/constants.js'
import { todayInNairobi } from '../../utils/validation/validators.js'
import formatDate from '../../utils/formatters/formatDate.js'
import {
  parseEmployeeCsv,
  downloadEmployeeTemplate,
  exportEmployees,
} from '../../services/workforce/employeeService.js'

const departmentColors = ['#087f6d', '#12b8b0', '#9b7bf3', '#ffbf51']

export default function EmployeeDirectory({
  employees,
  departments = INITIAL_DEPARTMENTS,
  grades = JOB_GRADES,
  initialDepartment = '',
  initialGrade = '',
  search,
  onSearch,
  onNavigate,
  onDelete,
  onStatusChange,
  onImport,
}) {
  const [filters, setFilters] = useState({
    department: initialDepartment,
    grade: initialGrade,
    status: '',
  })
  const [sort, setSort] = useState('reference')
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState({ key: '', page: 1 })
  const [selectedIds, setSelectedIds] = useState([])
  const [removeCandidate, setRemoveCandidate] = useState(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importRows, setImportRows] = useState([])
  const [importError, setImportError] = useState('')
  const [importBusy, setImportBusy] = useState(false)
  const [exportStatus, setExportStatus] = useState('idle')
  const importVersion = useRef(0)

  const query = search.trim().toLowerCase()
  const filtered = employees.filter(
    (employee) =>
      [
        employee.name,
        employee.id,
        employee.email || '',
        employee.department,
      ].some((value) => value.toLowerCase().includes(query)) &&
      (!filters.department || employee.department === filters.department) &&
      (!filters.grade || employee.grade === filters.grade) &&
      (!filters.status || employee.status === filters.status),
  )
  if (sort === 'newest')
    filtered.sort((a, b) => b.hiredDate.localeCompare(a.hiredDate))
  const filterKey = JSON.stringify([query, filters, sort, pageSize])
  const page =
    pagination.key === filterKey
      ? Math.min(
          pagination.page,
          Math.max(1, Math.ceil(filtered.length / pageSize)),
        )
      : 1
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const selected = employees.filter((employee) =>
    selectedIds.includes(employee.id),
  )
  const departmentNames = departments.map((department) => department.name)
  const activeDepartments = departments
    .filter((department) => department.status === 'Active')
    .map((department) => department.name)
  const breakdown = departmentNames.map((name, index) => ({
    name,
    count: employees.filter((employee) => employee.department === name).length,
    color: departmentColors[index % departmentColors.length],
  }))
  const recent = [...employees]
    .sort((a, b) => b.hiredDate.localeCompare(a.hiredDate))
    .slice(0, 4)
  const month = todayInNairobi().slice(0, 7)

  function clearFilters() {
    onSearch('')
    setFilters({ department: '', grade: '', status: '' })
    setSort('reference')
    setSelectedIds([])
  }
  function toggleSelection(id) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }
  function toggleAll() {
    const allSelected = visible.every((employee) =>
      selectedIds.includes(employee.id),
    )
    setSelectedIds((current) =>
      allSelected
        ? current.filter(
            (id) => !visible.some((employee) => employee.id === id),
          )
        : [...new Set([...current, ...visible.map((employee) => employee.id)])],
    )
  }
  function closeImport() {
    importVersion.current += 1
    setImportOpen(false)
    setImportBusy(false)
    setImportRows([])
    setImportError('')
  }
  async function readCsv(file) {
    if (!file) return
    const version = ++importVersion.current
    setImportRows([])
    setImportError('')
    if (!/\.csv$/i.test(file.name) || file.size > 2 * 1024 * 1024) {
      setImportBusy(false)
      setImportError('Choose a CSV file smaller than 2 MB.')
      return
    }
    setImportBusy(true)
    try {
      const text = await file.text()
      if (version === importVersion.current)
        setImportRows(
          parseEmployeeCsv(text, employees, activeDepartments, grades),
        )
    } catch (error) {
      if (version === importVersion.current)
        setImportError(error.message || 'The CSV file could not be read.')
    } finally {
      if (version === importVersion.current) setImportBusy(false)
    }
  }
  async function exportList() {
    setExportStatus('loading')
    try {
      await exportEmployees(selected.length ? selected : filtered)
      setExportStatus('success')
    } catch {
      setExportStatus('error')
    }
  }

  return (
    <div className="employee-directory-page">
      <div className="employee-page-heading">
        <span className="icon-circle directory-heading-icon">
          <Icon name="users" size={26} />
        </span>
        <div>
          <h1>Employee Directory</h1>
          <p>
            View and manage all your employees in one place. Search, filter, and
            take action easily.
          </p>
        </div>
        <button
          className="button button-primary"
          onClick={() => onNavigate('add-employee')}
        >
          <Icon name="plus" size={18} />
          Add Employee
        </button>
      </div>
      <section
        className="directory-stats"
        aria-label="Employee directory statistics"
      >
        <StatCard
          label="Total Employees"
          value={employees.length}
          icon="users"
          detail="Registered personnel"
        />
        <StatCard
          label="Active Employees"
          value={
            employees.filter((employee) => employee.status === 'Active').length
          }
          icon="check-circle"
          detail="Active employment status"
        />
        <StatCard
          label="On Leave"
          value={
            employees.filter((employee) => employee.status === 'On Leave')
              .length
          }
          icon="clock"
          detail="By employee status"
        />
        <StatCard
          label="Departments"
          value={breakdown.filter((item) => item.count > 0).length}
          icon="building"
          detail="Represented in the roster"
        />
        <StatCard
          label="New Hires (This Month)"
          value={
            employees.filter((employee) => employee.hiredDate.startsWith(month))
              .length
          }
          icon="users"
          detail={formatDate(`${month}-01`, {
            month: 'long',
            year: 'numeric',
            day: undefined,
          })}
        />
      </section>
      <div className="directory-layout">
        <section
          className="card directory-main"
          aria-label="Personnel directory"
        >
          <EmployeeFilters
            departments={departmentNames}
            grades={grades}
            search={search}
            onSearch={onSearch}
            {...filters}
            onFilter={(name, value) =>
              setFilters((current) => ({ ...current, [name]: value }))
            }
            onClear={clearFilters}
          />
          {selected.length > 0 && (
            <div className="selection-toolbar">
              <span>
                {selected.length} employee{selected.length === 1 ? '' : 's'}{' '}
                selected
              </span>
              <button
                className="text-button"
                onClick={() => setSelectedIds([])}
              >
                Clear selection
              </button>
              <button
                className="text-button"
                onClick={exportList}
                disabled={exportStatus === 'loading'}
              >
                <Icon name="download" size={15} />
                Export selected
              </button>
            </div>
          )}
          {sort === 'newest' && (
            <div className="directory-sort-note">
              Sorted by most recently hired
              <button
                className="text-button"
                onClick={() => setSort('reference')}
              >
                Reset order
              </button>
            </div>
          )}
          <EmployeeTable
            employees={visible}
            directory
            selectedIds={selectedIds}
            onToggleSelection={toggleSelection}
            onToggleAll={toggleAll}
            onSelect={(employee) => onNavigate('employee', employee.id)}
            onEdit={(employee) => onNavigate('edit-employee', employee.id)}
            onDelete={setRemoveCandidate}
            onStatusChange={onStatusChange}
          />
          {filtered.length === 0 && (
            <div className="empty-state">
              <Icon name="users" size={30} />
              <h3>
                {employees.length
                  ? 'No employees match your filters'
                  : 'Your employee directory is empty'}
              </h3>
              <p>
                {employees.length
                  ? 'Try another name, email, department, grade, or status.'
                  : 'Add an employee or import your first CSV file to get started.'}
              </p>
              <button
                className="button button-secondary"
                onClick={
                  employees.length
                    ? clearFilters
                    : () => onNavigate('add-employee')
                }
              >
                {employees.length ? 'Clear filters' : 'Add Employee'}
              </button>
            </div>
          )}
          <Pagination
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            onPageChange={(next) =>
              setPagination({ key: filterKey, page: next })
            }
            onPageSizeChange={setPageSize}
          />
        </section>
        <aside
          className="directory-aside"
          aria-label="Employee directory tools"
        >
          <section className="card directory-quick-actions">
            <h2>
              <Icon name="bolt" size={18} />
              Quick Actions
            </h2>
            <button
              className="operation"
              onClick={() => onNavigate('add-employee')}
            >
              <span className="icon-circle tone-green">
                <Icon name="plus" />
              </span>
              <span className="operation-text">
                <strong>Add New Employee</strong>
                <small>Register a new team member</small>
              </span>
              <Icon name="chevron" size={15} />
            </button>
            <button className="operation" onClick={() => setImportOpen(true)}>
              <span className="icon-circle tone-green">
                <Icon name="upload" />
              </span>
              <span className="operation-text">
                <strong>Import Employees</strong>
                <small>Bulk import from a CSV file</small>
              </span>
              <Icon name="chevron" size={15} />
            </button>
            <button
              className="operation"
              disabled={
                exportStatus === 'loading' ||
                (!filtered.length && !selected.length)
              }
              onClick={exportList}
            >
              <span className="icon-circle tone-green">
                <Icon name="download" />
              </span>
              <span className="operation-text">
                <strong>
                  {exportStatus === 'loading'
                    ? 'Preparing export…'
                    : selected.length
                      ? `Export Selected (${selected.length})`
                      : 'Export Employees'}
                </strong>
                <small>
                  {selected.length
                    ? 'Download selected employee records'
                    : 'Download the filtered employee list'}
                </small>
              </span>
              <Icon name="chevron" size={15} />
            </button>
            {exportStatus === 'error' && (
              <p className="field-error" role="alert">
                Export failed. Please try again.
              </p>
            )}
            {exportStatus === 'success' && (
              <p className="export-feedback" role="status">
                Your Excel download has started.
              </p>
            )}
          </section>
          <DepartmentDistributionChart
            data={breakdown}
            title="Department Breakdown"
          />
          <section className="card recent-hires">
            <div className="section-heading">
              <h2>
                <Icon name="users" size={18} />
                Recent Hires
              </h2>
              <button
                className="text-button"
                onClick={() => {
                  clearFilters()
                  setSort('newest')
                  document
                    .getElementById('employee-directory-table')
                    ?.scrollIntoView({ block: 'center' })
                }}
              >
                View all
              </button>
            </div>
            {recent.length ? (
              recent.map((employee, index) => (
                <button
                  className="recent-hire"
                  key={employee.id}
                  onClick={() => onNavigate('employee', employee.id)}
                >
                  <span className={`employee-avatar avatar-color-${index % 4}`}>
                    {employee.photo ? (
                      <img src={employee.photo.dataUrl} alt="" />
                    ) : (
                      employee.name
                        .split(' ')
                        .slice(0, 2)
                        .map((name) => name[0])
                        .join('')
                    )}
                  </span>
                  <span>
                    <strong>{employee.name}</strong>
                    <small>{employee.department}</small>
                    <small>{formatDate(employee.hiredDate)}</small>
                  </span>
                  <Icon name="chevron" size={14} />
                </button>
              ))
            ) : (
              <p className="muted-note">New employees will appear here.</p>
            )}
          </section>
          <div className="team-message">
            <span className="icon-circle tone-green">
              <Icon name="users" size={23} />
            </span>
            <div>
              <strong>Building a stronger team</strong>
              <p>Great people make great companies.</p>
            </div>
            <span className="team-leaf" aria-hidden="true" />
          </div>
        </aside>
      </div>
      <footer className="dashboard-footer">
        <span>Hadiya Science · IT Department</span>
        <span>
          <span className="status-dot tone-green" />
          Employee Directory
        </span>
      </footer>
      {removeCandidate && (
        <ConfirmationModal
          title="Delete employee?"
          confirmLabel="Delete employee"
          destructive
          onCancel={() => setRemoveCandidate(null)}
          onConfirm={() => {
            onDelete(removeCandidate.id)
            setSelectedIds((current) =>
              current.filter((id) => id !== removeCandidate.id),
            )
            setRemoveCandidate(null)
          }}
        >
          <p>
            Remove <strong>{removeCandidate.name}</strong> ({removeCandidate.id}
            ) from the employee directory?
          </p>
        </ConfirmationModal>
      )}
      {importOpen && (
        <Modal
          title="Import Employees"
          subtitle="Add employee records from a CSV file"
          onClose={closeImport}
        >
          <div className="notice">
            <Icon name="info" />
            <p>
              Use the template’s column headings. Do not include passwords in the file.
            </p>
          </div>
          <button
            className="button button-secondary"
            onClick={() => downloadEmployeeTemplate(activeDepartments, grades)}
            disabled={!activeDepartments.length || !grades.length}
          >
            <Icon name="download" size={17} />
            Download CSV template
          </button>
          {(!activeDepartments.length || !grades.length) && (
            <p className="field-error">
              Create an active department and a job grade before importing
              employees.
            </p>
          )}
          <label className="file-dropzone import-dropzone">
            <input
              type="file"
              accept=".csv,text/csv"
              aria-label="Choose employee CSV file"
              onChange={(event) => {
                readCsv(event.target.files[0])
                event.target.value = ''
              }}
            />
            <Icon name="upload" size={26} />
            <span>
              <strong>
                {importBusy ? 'Reading your file…' : 'Choose a CSV file'}
              </strong>
              <small>Up to 2 MB · Maximum 500 employees</small>
            </span>
          </label>
          {importError && (
            <p className="form-error" role="alert">
              {importError}
            </p>
          )}
          {importRows.length > 0 && (
            <div className="import-preview">
              <h3>
                {importRows.length} employee{importRows.length === 1 ? '' : 's'}{' '}
                ready to import
              </h3>
              <ul>
                {importRows.slice(0, 5).map((employee) => (
                  <li key={employee.id}>
                    <strong>{employee.name}</strong>
                    <span>
                      {employee.id} · {employee.department}
                    </span>
                  </li>
                ))}
              </ul>
              {importRows.length > 5 && (
                <p>And {importRows.length - 5} more…</p>
              )}
            </div>
          )}
          <div className="modal-actions">
            <button className="button button-secondary" onClick={closeImport}>
              Cancel
            </button>
            <button
              className="button button-primary"
              disabled={importBusy || !importRows.length}
              onClick={() => {
                onImport(importRows)
                clearFilters()
                closeImport()
              }}
            >
              <Icon name="upload" size={17} />
              Import {importRows.length || ''} Employees
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
