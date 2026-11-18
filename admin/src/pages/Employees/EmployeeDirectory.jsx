import Card from '../../components/common/Card.jsx'
import Button, { TextButton } from '../../components/common/Button.jsx'
import { useRef, useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import Modal, { ModalActions } from '../../components/common/Modal.jsx'
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
      <div className="employee-page-heading tw:flex tw:items-center tw:gap-[13px] tw:mb-[23px] tw:[&>div]:min-w-0 tw:[&>div]:flex-1
          tw:[&>.button]:shrink-0 tw:max-[768px]:flex-wrap tw:max-[768px]:gap-[11px]
          tw:max-[768px]:[&>.button]:ml-auto tw:shared-base:flex tw:shared-base:items-center
          tw:shared-base:gap-[13px] tw:shared-base:mb-[23px] tw:shared-base:[&_>_div]:min-w-0
          tw:shared-base:[&_>_div]:flex-1 tw:shared-base:[&_h1]:text-[27px] tw:shared-base:[&_h1]:tracking-[-0.6px]
          tw:shared-base:[&_p]:[color:var(--text-muted)] tw:shared-base:[&_p]:text-[12px]
          tw:shared-base:[&_p]:leading-[1.7] tw:shared-base:[&_p]:mt-[4px] tw:shared-base:[&_>_.button]:shrink-0
          tw:max-[768px]:shared-base:flex-wrap tw:max-[768px]:shared-base:gap-[11px]
          tw:max-[768px]:shared-base:[&_h1]:text-[24px]
          tw:max-[768px]:shared-base:[&_p]:text-[11px]
          tw:max-[768px]:shared-base:[&_>_.button]:ml-[auto]
          tw:max-[560px]:shared-base:[&_h1]:text-[22px]">
        <span className="icon-circle directory-heading-icon tw:w-[49px] tw:h-[49px] tw:bg-[#d8f8ee] tw:text-[#05695c]
          tw:shared-base:w-[46px] tw:shared-base:h-[46px] tw:shared-base:shrink-0 tw:shared-base:rounded-[50%]
          tw:shared-base:inline-flex tw:shared-base:items-center tw:shared-base:justify-center
          tw:shared-base:w-[49px] tw:shared-base:h-[49px] tw:shared-base:[background:#d8f8ee]
          tw:shared-base:[color:#05695c]">
          <Icon name="users" size={26} />
        </span>
        <div>
          <h1 className="tw:text-[27px] tw:tracking-[-0.6px] tw:max-[768px]:text-[24px] tw:max-[560px]:text-[22px]">Employee Directory</h1>
          <p className="tw:text-[var(--text-muted)] tw:text-[12px] tw:leading-[1.7] tw:mt-[4px] tw:max-[768px]:text-[11px]">
            View and manage all your employees in one place. Search, filter, and
            take action easily.
          </p>
        </div>
        <Button
          onClick={() => onNavigate('add-employee')}
        >
          <Icon name="plus" size={18} />
          Add Employee
        </Button>
      </div>
      <section
        className="directory-stats tw:grid tw:grid-cols-5 tw:gap-[13px] tw:mb-[18px] tw:[&_.stat-card]:gap-[12px]
          tw:[&_.stat-card]:min-h-[129px] tw:[&_.stat-card]:p-[18px_14px] tw:[&_.icon-circle]:w-[40px]
          tw:[&_.icon-circle]:h-[40px] tw:[&_.icon-circle]:bg-[#dbf8ef] tw:[&_.stat-value]:text-[28px]
          tw:[&_.stat-card:last-child_.stat-value]:text-[28px] tw:[&_.stat-content_h2]:text-[10px]
          tw:[&_.stat-detail]:text-[9px] tw:max-[1440px]:[&_.stat-card]:gap-[9px]
          tw:max-[1440px]:[&_.stat-card]:px-[12px] tw:max-[1440px]:[&_.icon-circle]:w-[35px]
          tw:max-[1440px]:[&_.icon-circle]:h-[35px] tw:max-[1440px]:[&_.icon-circle_svg]:w-[21px]
          tw:max-[1100px]:grid-cols-3 tw:max-[768px]:grid-cols-2 tw:max-[768px]:gap-[11px]
          tw:max-[768px]:[&_.stat-card]:p-[17px] tw:max-[768px]:[&_.stat-card]:min-h-[115px]
          tw:max-[380px]:grid-cols-1"
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
      <div className="directory-layout tw:grid tw:grid-cols-[minmax(0,_3fr)_minmax(260px,_1fr)] tw:gap-[16px] tw:[align-items:start]
          tw:max-[1440px]:grid-cols-[minmax(0,_1fr)]">
        <Card
          className="directory-main tw:p-[16px_16px_0] tw:max-[768px]:p-[13px_13px_0]"
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
            <div className="selection-toolbar tw:flex tw:items-center tw:flex-wrap tw:gap-[12px] tw:text-primary tw:bg-[#eff9f5]
          tw:p-[6px_10px] tw:rounded-[6px] tw:mb-[10px] tw:text-[11px] tw:[&>.text-button:last-child]:ml-auto">
              <span>
                {selected.length} employee{selected.length === 1 ? '' : 's'}{' '}
                selected
              </span>
              <TextButton
                onClick={() => setSelectedIds([])}
              >
                Clear selection
              </TextButton>
              <TextButton
                onClick={exportList}
                disabled={exportStatus === 'loading'}
              >
                <Icon name="download" size={15} />
                Export selected
              </TextButton>
            </div>
          )}
          {sort === 'newest' && (
            <div className="directory-sort-note tw:flex tw:items-center tw:justify-between tw:flex-wrap tw:gap-[12px] tw:text-text-secondary
          tw:bg-[#f4f8fa] tw:p-[6px_10px] tw:rounded-[6px] tw:mb-[10px] tw:text-[11px]">
              Sorted by most recently hired
              <TextButton
                onClick={() => setSort('reference')}
              >
                Reset order
              </TextButton>
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
            <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]">
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
              <Button variant="secondary"
                onClick={
                  employees.length
                    ? clearFilters
                    : () => onNavigate('add-employee')
                }
              >
                {employees.length ? 'Clear filters' : 'Add Employee'}
              </Button>
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
        </Card>
        <aside
          className="directory-aside tw:flex tw:flex-col tw:gap-[13px] tw:min-w-0 tw:max-[1440px]:grid tw:max-[1440px]:grid-cols-3
            tw:max-[1440px]:[align-items:start] tw:max-[1100px]:grid-cols-2
            tw:max-[560px]:grid-cols-[minmax(0,_1fr)]"
          aria-label="Employee directory tools"
        >
          <Card className="directory-quick-actions tw:p-[15px_13px]">
            <h2 className="tw:flex tw:items-center tw:gap-[9px] tw:text-[12px] tw:mb-[12px]">
              <Icon name="bolt" size={18} />
              Quick Actions
            </h2>
            <button
              className={`operation tw:flex tw:items-center tw:gap-[9px] tw:[border:1px_solid_var(--border)] tw:rounded-[9px] tw:bg-white
          tw:p-[7px_9px] tw:w-full tw:min-h-[54px] tw:mt-[7px] tw:text-left
          tw:[transition:border_0.15s,background_0.15s] tw:hover:bg-[#f7fcfa] tw:hover:border-[#a5d7ca] `}
              onClick={() => onNavigate('add-employee')}
            >
              <span className="icon-circle tone-green tw:w-[33px] tw:h-[33px] tw:shared-base:w-[46px] tw:shared-base:h-[46px]
          tw:shared-base:shrink-0 tw:shared-base:rounded-[50%] tw:shared-base:inline-flex
          tw:shared-base:items-center tw:shared-base:justify-center tw:[:where(&.tone-green)]:[color:#0b8972]
          tw:[:where(&.tone-green)]:[background:#e3f5f0]">
                <Icon name="plus" />
              </span>
              <span className="operation-text tw:block tw:min-w-[0] tw:flex-[1]">
                <strong className="tw:block tw:text-[10px] tw:font-[600] tw:leading-[1.5]">Add New Employee</strong>
                <small className="tw:block tw:text-[9px] tw:leading-[1.4] tw:text-[var(--text-muted)] tw:mt-[2px]">Register a new team member</small>
              </span>
              <Icon className="tw:text-[#7b98a7]" name="chevron" size={15} />
            </button>
            <button className={`operation tw:flex tw:items-center tw:gap-[9px] tw:[border:1px_solid_var(--border)] tw:rounded-[9px] tw:bg-white
          tw:p-[7px_9px] tw:w-full tw:min-h-[54px] tw:mt-[7px] tw:text-left
          tw:[transition:border_0.15s,background_0.15s] tw:hover:bg-[#f7fcfa] tw:hover:border-[#a5d7ca] `} onClick={() => setImportOpen(true)}>
              <span className="icon-circle tone-green tw:w-[33px] tw:h-[33px] tw:shared-base:w-[46px] tw:shared-base:h-[46px]
          tw:shared-base:shrink-0 tw:shared-base:rounded-[50%] tw:shared-base:inline-flex
          tw:shared-base:items-center tw:shared-base:justify-center tw:[:where(&.tone-green)]:[color:#0b8972]
          tw:[:where(&.tone-green)]:[background:#e3f5f0]">
                <Icon name="upload" />
              </span>
              <span className="operation-text tw:block tw:min-w-[0] tw:flex-[1]">
                <strong className="tw:block tw:text-[10px] tw:font-[600] tw:leading-[1.5]">Import Employees</strong>
                <small className="tw:block tw:text-[9px] tw:leading-[1.4] tw:text-[var(--text-muted)] tw:mt-[2px]">Bulk import from a CSV file</small>
              </span>
              <Icon className="tw:text-[#7b98a7]" name="chevron" size={15} />
            </button>
            <button
              className={`operation tw:flex tw:items-center tw:gap-[9px] tw:[border:1px_solid_var(--border)] tw:rounded-[9px] tw:bg-white
          tw:p-[7px_9px] tw:w-full tw:min-h-[54px] tw:mt-[7px] tw:text-left
          tw:[transition:border_0.15s,background_0.15s] tw:hover:bg-[#f7fcfa] tw:hover:border-[#a5d7ca] `}
              disabled={
                exportStatus === 'loading' ||
                (!filtered.length && !selected.length)
              }
              onClick={exportList}
            >
              <span className="icon-circle tone-green tw:w-[33px] tw:h-[33px] tw:shared-base:w-[46px] tw:shared-base:h-[46px]
          tw:shared-base:shrink-0 tw:shared-base:rounded-[50%] tw:shared-base:inline-flex
          tw:shared-base:items-center tw:shared-base:justify-center tw:[:where(&.tone-green)]:[color:#0b8972]
          tw:[:where(&.tone-green)]:[background:#e3f5f0]">
                <Icon name="download" />
              </span>
              <span className="operation-text tw:block tw:min-w-[0] tw:flex-[1]">
                <strong className="tw:block tw:text-[10px] tw:font-[600] tw:leading-[1.5]">
                  {exportStatus === 'loading'
                    ? 'Preparing export…'
                    : selected.length
                      ? `Export Selected (${selected.length})`
                      : 'Export Employees'}
                </strong>
                <small className="tw:block tw:text-[9px] tw:leading-[1.4] tw:text-[var(--text-muted)] tw:mt-[2px]">
                  {selected.length
                    ? 'Download selected employee records'
                    : 'Download the filtered employee list'}
                </small>
              </span>
              <Icon className="tw:text-[#7b98a7]" name="chevron" size={15} />
            </button>
            {exportStatus === 'error' && (
              <p className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]" role="alert">
                Export failed. Please try again.
              </p>
            )}
            {exportStatus === 'success' && (
              <p className="export-feedback tw:text-[10px] tw:text-primary tw:leading-[1.7] tw:mt-[10px]" role="status">
                Your Excel download has started.
              </p>
            )}
          </Card>
          <DepartmentDistributionChart
            data={breakdown}
            title="Department Breakdown"
          />
          <Card className="recent-hires tw:p-[15px_13px]">
            <div className="section-heading tw:flex tw:justify-between tw:gap-[12px] tw:items-center tw:mb-[5px] tw:max-[768px]:gap-[8px]
          tw:shared-base:flex tw:shared-base:justify-between tw:shared-base:items-start tw:shared-base:gap-[12px]
          tw:shared-base:mb-[20px] tw:shared-base:[&_h2]:flex tw:shared-base:[&_h2]:items-center
          tw:shared-base:[&_h2]:gap-[9px] tw:shared-base:[&_h2_>_svg]:[color:var(--primary)]
          tw:shared-base:[&_p]:[color:var(--text-muted)] tw:shared-base:[&_p]:text-[12px]
          tw:shared-base:[&_p]:mt-[6px] tw:shared-base:[&_p]:leading-[1.5]
          tw:max-[768px]:shared-base:[&_h2]:text-[15px]
          tw:max-[768px]:shared-base:gap-[8px] tw:max-[768px]:shared-base:[&_p]:text-[11px]">
              <h2 className="tw:flex tw:items-center tw:gap-[9px] tw:[.recent-hires_&]:text-[12px]">
                <Icon name="users" size={18} />
                Recent Hires
              </h2>
              <TextButton className="tw:[.recent-hires_&]:text-[10px] tw:[.recent-hires_&]:min-h-[26px]"
                onClick={() => {
                  clearFilters()
                  setSort('newest')
                  document
                    .getElementById('employee-directory-table')
                    ?.scrollIntoView({ block: 'center' })
                }}
              >
                View all
              </TextButton>
            </div>
            {recent.length ? (
              recent.map((employee, index) => (
                <button
                  className="recent-hire tw:flex tw:items-center tw:gap-[8px] tw:p-[10px_0] tw:border-0 tw:border-current tw:border-b
          tw:[border-bottom-style:solid] tw:border-b-[var(--divider)] tw:bg-transparent tw:text-left tw:w-full
          tw:last:border-b-0 tw:last:pb-0 tw:[&>span:nth-child(2)]:flex-1 tw:[&>span:nth-child(2)]:min-w-0
          tw:[&_strong]:block tw:[&_strong]:text-[10px] tw:[&_strong]:font-[500] tw:[&_strong]:leading-[1.4]
          tw:[&_small]:block tw:[&_small]:text-[var(--text-muted)] tw:[&_small]:text-[9px]
          tw:[&_small]:leading-[1.4] tw:[&_small]:mt-[2px] tw:[&>svg]:text-[var(--text-muted)]
          tw:[&:hover_strong]:text-primary tw:[&:hover_strong]:underline"
                  key={employee.id}
                  onClick={() => onNavigate('employee', employee.id)}
                >
                  <span className={`employee-avatar avatar-color-${index % 4} tw:shared-base:inline-flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:shrink-0
          tw:shared-base:w-[30px] tw:shared-base:h-[30px] tw:shared-base:rounded-[50%] tw:shared-base:text-[9px]
          tw:shared-base:font-semibold tw:shared-base:[border:2px_solid_#fff]
          tw:[:where(&.avatar-color-0)]:[background:#e2eee6] tw:[:where(&.avatar-color-0)]:[color:#607c56]
          tw:[:where(&.avatar-color-1)]:[background:#efe8e3] tw:[:where(&.avatar-color-1)]:[color:#956948]
          tw:[:where(&.avatar-color-2)]:[background:#e3ecf3] tw:[:where(&.avatar-color-2)]:[color:#527994]
          tw:[:where(&.avatar-color-3)]:[background:#eee8f4] tw:[:where(&.avatar-color-3)]:[color:#86679f]
          tw:shared-base:overflow-hidden tw:shared-base:[&_img]:w-full tw:shared-base:[&_img]:h-[100%]
          tw:shared-base:[&_img]:object-cover `}>
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
              <p className="muted-note tw:shared-base:block tw:shared-base:[color:var(--text-muted)] tw:shared-base:text-[12px]
          tw:shared-base:leading-[1.8] tw:shared-base:mt-[17px]">New employees will appear here.</p>
            )}
          </Card>
          <div className="team-message tw:flex tw:items-center tw:relative tw:gap-[10px] tw:overflow-hidden tw:p-[13px]
          tw:[border:4px_solid_white] tw:rounded-[9px] tw:[background:linear-gradient(110deg,_#e4faf1,_#f6fffa)]
          tw:[&_.icon-circle]:w-[35px] tw:[&_.icon-circle]:h-[35px] tw:[&_strong]:text-[10px]
          tw:[&_strong]:font-[600] tw:[&_p]:text-[9px] tw:[&_p]:text-[var(--text-muted)] tw:[&_p]:mt-[5px]
          tw:max-[1440px]:col-span-full tw:max-[1100px]:col-auto">
            <span className="icon-circle tone-green tw:shared-base:w-[46px] tw:shared-base:h-[46px] tw:shared-base:shrink-0
          tw:shared-base:rounded-[50%] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:[:where(&.tone-green)]:[color:#0b8972]
          tw:[:where(&.tone-green)]:[background:#e3f5f0]">
              <Icon name="users" size={23} />
            </span>
            <div>
              <strong>Building a stronger team</strong>
              <p>Great people make great companies.</p>
            </div>
            <span className="team-leaf tw:absolute tw:w-[25px] tw:h-[35px] tw:bg-[#82cbb92e] tw:rounded-[90%_0_90%_0]
          tw:[transform:rotate(-35deg)] tw:right-[5px] tw:bottom-0" aria-hidden="true" />
          </div>
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
          <div className="notice tw:shared-base:flex tw:shared-base:items-start tw:shared-base:gap-[11px] tw:shared-base:[background:#f0f8f6]
          tw:shared-base:[border:1px_solid_#daeee6] tw:shared-base:[color:#46756c] tw:shared-base:p-[13px_14px]
          tw:shared-base:rounded-[7px] tw:shared-base:m-[18px_0] tw:shared-base:text-[12px]
          tw:shared-base:leading-[1.7] tw:shared-base:[&_>_svg]:mt-[2px] tw:shared-base:[&_>_svg]:w-[18px]">
            <Icon name="info" />
            <p>
              Use the template’s column headings. Do not include passwords in the file.
            </p>
          </div>
          <Button variant="secondary"
            onClick={() => downloadEmployeeTemplate(activeDepartments, grades)}
            disabled={!activeDepartments.length || !grades.length}
          >
            <Icon name="download" size={17} />
            Download CSV template
          </Button>
          {(!activeDepartments.length || !grades.length) && (
            <p className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]">
              Create an active department and a job grade before importing
              employees.
            </p>
          )}
          <label className="file-dropzone import-dropzone tw:mt-[20px] tw:min-h-[115px] tw:relative tw:flex tw:items-center tw:gap-[13px]
          tw:[border:1.5px_dashed_#c8ddd5] tw:rounded-[8px] tw:bg-[#f9fcfa] tw:text-primary tw:cursor-pointer
          tw:min-w-0 tw:hover:border-primary tw:hover:bg-[#f1faf5]
          tw:focus-within:[outline:2px_solid_var(--primary)] tw:focus-within:outline-offset-[3px]
          tw:[&>input]:absolute tw:[&>input]:w-[1px] tw:[&>input]:h-[1px] tw:[&>input]:opacity-0 tw:[&>input]:p-0
          tw:[&>input]:m-0 tw:[&>span]:min-w-0 tw:[&_strong]:block tw:[&_strong]:text-text-secondary
          tw:[&_strong]:text-[12px] tw:[&_strong]:leading-[1.5] tw:[&_strong]:font-[550]
          tw:[&_strong]:[overflow-wrap:anywhere] tw:[&_small]:block tw:[&_small]:mt-[4px]
          tw:[&_small]:text-[#8ba398] tw:[&_small]:text-[10px] tw:[&_small]:font-normal tw:justify-center
          tw:p-[18px]">
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
            <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">
              {importError}
            </p>
          )}
          {importRows.length > 0 && (
            <div className="import-preview tw:mt-[22px] tw:p-[17px] tw:bg-[#f4faf7] tw:[border:1px_solid_var(--border)] tw:rounded-[7px]
          tw:[&_h3]:text-[15px] tw:[&_ul]:m-[12px_0_0] tw:[&_ul]:p-0 tw:[&_ul]:list-none tw:[&_li]:flex
          tw:[&_li]:flex-col tw:[&_li]:gap-[4px] tw:[&_li]:p-[8px_0] tw:[&_li]:border-b
          tw:[&_li]:border-b-[#e4eeea] tw:[&_li]:text-[12px] tw:[&_li>span]:text-[var(--text-muted)]
          tw:[&_li>span]:text-[11px] tw:[&_li>span]:mt-[5px] tw:[&>p]:text-[var(--text-muted)] tw:[&>p]:text-[11px]
          tw:[&>p]:mt-[5px]">
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
          <ModalActions >
            <Button variant="secondary" onClick={closeImport}>
              Cancel
            </Button>
            <Button
              disabled={importBusy || !importRows.length}
              onClick={() => {
                onImport(importRows)
                clearFilters()
                closeImport()
              }}
            >
              <Icon name="upload" size={17} />
              Import {importRows.length || ''} Employees
            </Button>
          </ModalActions>
        </Modal>
      )}
    </div>
  )
}
