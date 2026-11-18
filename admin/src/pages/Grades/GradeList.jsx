import Card from '../../components/common/Card.jsx'
import Button, { TextButton } from '../../components/common/Button.jsx'
import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Modal, { ModalActions } from '../../components/common/Modal.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import GradeModal from '../../components/grades/GradeModal.jsx'
import formatCurrency from '../../utils/formatters/formatCurrency.js'

const salaryOptions = { minimumFractionDigits: 2 }

export default function GradeList({
  grades,
  employees,
  search,
  onSearch,
  onSave,
  onDelete,
  onViewEmployees,
  onDirtyChange,
}) {
  const [sort, setSort] = useState('reference')
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState({ key: '', page: 1 })
  const [editor, setEditor] = useState(null)
  const [removeId, setRemoveId] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const rows = grades.map((grade) => ({
    ...grade,
    staffCount: employees.filter((employee) => employee.grade === grade.name)
      .length,
  }))
  const assignedCount = rows.reduce((sum, grade) => sum + grade.staffCount, 0)
  const salaries = grades.map((grade) => grade.salary)
  const query = search.trim().toLowerCase()
  const filtered = rows.filter(
    (grade) =>
      grade.name.toLowerCase().includes(query) ||
      `#${grade.id}`.includes(query),
  )
  if (sort === 'salary-asc') filtered.sort((a, b) => a.salary - b.salary)
  if (sort === 'salary-desc') filtered.sort((a, b) => b.salary - a.salary)
  if (sort === 'title') filtered.sort((a, b) => a.name.localeCompare(b.name))
  const filterKey = JSON.stringify([query, sort, pageSize])
  const page =
    pagination.key === filterKey
      ? Math.min(
          pagination.page,
          Math.max(1, Math.ceil(filtered.length / pageSize)),
        )
      : 1
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const removing = rows.find((grade) => grade.id === removeId)

  function clearFilters() {
    onSearch('')
    setSort('reference')
  }
  function closeEditor() {
    setEditor(null)
    onDirtyChange(false)
  }

  return (
    <div className="grade-page">
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
          <Icon name="graduation" size={28} />
        </span>
        <div>
          <h1>Job Grades &amp; Salary Scales</h1>
          <p>
            Manage civil service job grades and base salaries for Hadiya Science
            IT Department.
          </p>
        </div>
        <Button onClick={() => setEditor({})}>
          <Icon name="plus" size={18} />
          Add New Job Grade
        </Button>
      </div>
      <section
        className="grade-stats tw:grid tw:grid-cols-4 tw:gap-[15px] tw:mb-[19px] tw:max-[1100px]:grid-cols-2
          tw:max-[400px]:grid-cols-[minmax(0,_1fr)] tw:[&_.stat-card]:min-h-[130px] tw:[&_.stat-card]:p-[20px_17px]
          tw:[&_.stat-card]:gap-[14px] tw:max-[1440px]:[&_.stat-card]:p-[18px_14px]
          tw:max-[1440px]:[&_.stat-card]:gap-[10px] tw:max-[1440px]:[&_.icon-circle]:w-[37px]
          tw:max-[1440px]:[&_.icon-circle]:h-[37px] tw:[&_.stat-card_.stat-value]:text-[30px]
          tw:[&_.stat-card:last-child_.stat-value]:text-[30px]
          tw:[&_.stat-card:nth-child(n+3)_.stat-value]:text-[clamp(16px,_1.5vw,_23px)]
          tw:[&_.stat-card:nth-child(n+3)_.stat-value]:leading-[1.5]
          tw:[&_.stat-card:nth-child(n+3)_.stat-value]:tracking-[-0.4px]
          tw:[&_.stat-card:nth-child(n+3)_.stat-value]:[overflow-wrap:anywhere] tw:[&_.stat-content_h2]:text-[11px]
          tw:[&_.stat-detail]:text-[10px] tw:[&_.stat-detail]:leading-[1.5]"
        aria-label="Job grade statistics"
      >
        <StatCard
          label="Total Job Grades"
          value={grades.length}
          icon="graduation"
          detail="Configured salary scales"
        />
        <StatCard
          label="Assigned Employees"
          value={assignedCount}
          icon="users"
          detail="Across all job grades"
        />
        <StatCard
          label="Lowest Base Salary"
          value={
            grades.length
              ? formatCurrency(Math.min(...salaries), salaryOptions)
              : '—'
          }
          icon="wallet"
          detail="Per employee · ETB"
        />
        <StatCard
          label="Highest Base Salary"
          value={
            grades.length
              ? formatCurrency(Math.max(...salaries), salaryOptions)
              : '—'
          }
          icon="trend"
          detail="Per employee · ETB"
        />
      </section>
      <Card
        className="grade-main tw:p-[20px_22px_0] tw:max-[768px]:p-[15px_13px_0]"
        aria-label="Job grades and salary scales"
      >
        <div className="employee-filters grade-filters tw:flex tw:items-center tw:flex-wrap tw:gap-[12px] tw:pb-[20px]
          tw:[&_.directory-search_input]:text-[12px] tw:[&>.text-button]:text-[12px] tw:[&>.text-button]:p-[6px]">
          <label className="directory-search tw:max-w-[480px] tw:max-[768px]:basis-full tw:max-[768px]:max-w-none tw:shared-base:flex
          tw:shared-base:items-center tw:shared-base:gap-[8px] tw:shared-base:min-w-[190px]
          tw:shared-base:[flex:1_1_240px] tw:shared-base:[border:1px_solid_var(--border)]
          tw:shared-base:rounded-[6px] tw:shared-base:p-[9px_10px] tw:shared-base:[color:#658da0]
          tw:shared-base:h-[38px] tw:[:where(&):focus-within]:[outline:2px_solid_var(--primary)]
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
              placeholder="Search by grade title or ID…"
              aria-label="Search job grades"
              aria-controls="grade-table"
            />
          </label>
          <select
            className="tw:flex-[1_1_115px] tw:min-w-0 tw:max-w-[190px] tw:h-[38px] tw:p-[8px_25px_8px_10px]
          tw:[border:1px_solid_var(--border)] tw:rounded-[6px] tw:text-text-secondary tw:bg-white tw:text-[12px]
          tw:text-ellipsis tw:ml-auto tw:max-[768px]:flex-[1_1_100px] tw:max-[768px]:max-w-none tw:max-[768px]:ml-0
          tw:max-[380px]:basis-full"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort job grades"
          >
            <option value="reference">Original order</option>
            <option value="title">Grade title: A–Z</option>
            <option value="salary-asc">Salary: Low to high</option>
            <option value="salary-desc">Salary: High to low</option>
          </select>
          <TextButton onClick={clearFilters}>
            Clear Filters
          </TextButton>
        </div>
        <div
          className="table-scroll tw:shared-base:overflow-x-auto tw:shared-base:[scrollbar-width:thin]
            tw:shared-base:[scrollbar-color:#c5dbd6_#f5f9f9]"
          role="region"
          aria-label="Job grade records"
          tabIndex={0}
        >
          <table className="employee-table grade-table tw:min-w-[620px] tw:[&_th]:p-[16px_18px] tw:[&_th]:bg-[#f0f9fa] tw:[&_th]:text-[10px]
          tw:[&_td]:p-[22px_18px] tw:[&_td]:align-middle tw:[&_th:first-child]:w-[15%]
          tw:[&_th:nth-child(2)]:w-[43%] tw:[&_th:last-child]:w-[100px] tw:[&_.employee-row-actions]:gap-[8px]
          tw:[&_.row-action]:w-[33px] tw:[&_.row-action]:h-[34px] tw:max-[768px]:[&_th]:px-[12px]
          tw:max-[768px]:[&_td]:px-[12px] tw:shared-base:w-full tw:shared-base:border-collapse
          tw:shared-base:text-left tw:shared-base:text-[11px] tw:shared-base:[&_th]:text-[9px]
          tw:shared-base:[&_th]:tracking-[0.6px] tw:shared-base:[&_th]:font-[650]
          tw:shared-base:[&_th]:[color:#5c768a] tw:shared-base:[&_th]:[background:#f6f9fb]
          tw:shared-base:[&_th]:p-[13px_12px] tw:shared-base:[&_th]:whitespace-nowrap
          tw:shared-base:[&_th]:[border-bottom:1px_solid_#e6eff2]
          tw:shared-base:[&_th:first-child]:rounded-[5px_0_0_5px]
          tw:shared-base:[&_th:last-child]:rounded-[0_5px_5px_0] tw:shared-base:[&_td]:p-[12px]
          tw:shared-base:[&_td]:[border-bottom:1px_solid_#f0f4f6]
          tw:shared-base:[&_td]:[color:var(--text-secondary)] tw:shared-base:[&_td]:leading-[1.6]
          tw:shared-base:[&_tbody_tr:hover]:[background:#f9fcfb]
          tw:shared-base:[&_tbody_tr:last-child_td]:[border-bottom:0]
          tw:max-[768px]:shared-base:min-w-[870px]" id="grade-table">
            <caption className="sr-only tw:sr-only">
              Grade IDs, titles, base salaries in ETB, and management actions
            </caption>
            <thead>
              <tr>
                {[
                  'Grade ID',
                  'Grade Title',
                  'Base Salary (ETB)',
                  'Actions',
                ].map((label) => (
                  <th key={label} scope="col">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((grade) => (
                <tr key={grade.id}>
                  <td className="employee-id tw:shared-base:[font-family:'SFMono-Regular',_Consolas,_monospace] tw:shared-base:text-[10px]
          tw:shared-base:font-semibold tw:shared-base:[color:#547082] tw:shared-base:whitespace-nowrap">#{grade.id}</td>
                  <td>
                    <div className="grade-identity tw:flex tw:items-center tw:gap-[13px] tw:[&>div]:min-w-0 tw:[&_strong]:block
          tw:[&_strong]:text-[13px] tw:[&_strong]:font-[600] tw:[&_strong]:text-text-primary
          tw:[&_strong]:[overflow-wrap:anywhere] tw:[&_small]:inline-flex tw:[&_small]:items-center
          tw:[&_small]:gap-[4px] tw:[&_small]:mt-[4px] tw:[&_small]:text-[11px]
          tw:[&_small]:text-[var(--text-muted)]">
                      <span className="icon-circle tone-green tw:w-[41px] tw:h-[41px] tw:shared-base:w-[46px] tw:shared-base:h-[46px]
          tw:shared-base:shrink-0 tw:shared-base:rounded-[50%] tw:shared-base:inline-flex
          tw:shared-base:items-center tw:shared-base:justify-center tw:[:where(&.tone-green)]:[color:#0b8972]
          tw:[:where(&.tone-green)]:[background:#e3f5f0]">
                        <Icon name="graduation" size={23} />
                      </span>
                      <div>
                        <strong>{grade.name}</strong>
                        {grade.staffCount > 0 ? (
                          <button
                            className="grade-staff-link tw:inline-flex tw:items-center tw:gap-[4px] tw:mt-[4px] tw:text-[11px] tw:text-primary tw:p-0
          tw:[border:0] tw:bg-transparent tw:hover:underline"
                            onClick={() => onViewEmployees(grade.name)}
                            aria-label={`View employees assigned to ${grade.name}`}
                          >
                            {grade.staffCount} employee
                            {grade.staffCount === 1 ? '' : 's'} assigned
                            <Icon name="chevron" size={12} />
                          </button>
                        ) : (
                          <small>No employees assigned</small>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="grade-salary tw:text-[15px] tw:font-[650] tw:[&.grade-salary]:text-[#145e54] tw:whitespace-nowrap tw:tabular-nums">
                    {formatCurrency(grade.salary, salaryOptions)}
                  </td>
                  <td>
                    <div className="employee-row-actions tw:shared-base:flex tw:shared-base:items-center tw:shared-base:gap-[4px]">
                      <button
                        className="row-action edit-action tw:shared-base:inline-flex tw:shared-base:items-center tw:shared-base:justify-center
          tw:shared-base:w-[28px] tw:shared-base:h-[29px] tw:shared-base:[border:1px_solid_transparent]
          tw:shared-base:rounded-[6px] tw:shared-base:p-[5px] tw:shared-base:[color:#07816a]
          tw:shared-base:[background:#eafaf2] tw:[:where(&):hover]:[border-color:currentColor]
          tw:[:where(&):hover]:[filter:brightness(0.97)]"
                        onClick={() => setEditor({ grade })}
                        aria-label={`Edit ${grade.name}`}
                        title="Edit job grade"
                      >
                        <Icon name="edit" size={17} />
                      </button>
                      <button
                        className="row-action delete-action tw:shared-base:inline-flex tw:shared-base:items-center tw:shared-base:justify-center
          tw:shared-base:w-[28px] tw:shared-base:h-[29px] tw:shared-base:[border:1px_solid_transparent]
          tw:shared-base:rounded-[6px] tw:shared-base:p-[5px] tw:shared-base:[color:#db4967]
          tw:shared-base:[background:#fff0f3] tw:[:where(&):hover]:[border-color:currentColor]
          tw:[:where(&):hover]:[filter:brightness(0.97)]"
                        onClick={() => {
                          setRemoveId(grade.id)
                          setDeleteError('')
                        }}
                        aria-label={`Delete ${grade.name}`}
                        title="Delete job grade"
                      >
                        <Icon name="trash" size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]">
            <Icon name="graduation" size={34} />
            <h3>
              {grades.length ? 'No matching job grades' : 'No job grades yet'}
            </h3>
            <p>
              {grades.length
                ? 'Try a different grade title or ID.'
                : 'Add a job grade and base salary to start assigning employees.'}
            </p>
            <Button variant="secondary"
              onClick={grades.length ? clearFilters : () => setEditor({})}
            >
              {grades.length ? 'Clear Filters' : 'Add New Job Grade'}
            </Button>
          </div>
        )}
        <Pagination
          itemLabel="job grades"
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={(next) => setPagination({ key: filterKey, page: next })}
          onPageSizeChange={setPageSize}
        />
      </Card>
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
          Grades & Scales
        </span>
      </footer>
      {editor && (
        <GradeModal
          grade={editor.grade}
          grades={grades}
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
        (removing.staffCount > 0 ? (
          <Modal
            title="Reassign employees before deleting"
            onClose={() => setRemoveId(null)}
          >
            <div className="confirmation-copy tw:shared-base:[color:var(--text-secondary)] tw:shared-base:text-[14px]
          tw:shared-base:leading-[1.8]">
              <p>
                <strong>{removing.name}</strong> is assigned to{' '}
                {removing.staffCount} employee
                {removing.staffCount === 1 ? '' : 's'}. Choose another grade for
                them before deleting this one.
              </p>
            </div>
            <ModalActions >
              <Button variant="secondary"
                onClick={() => setRemoveId(null)}
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
            title="Delete job grade?"
            confirmLabel="Delete Job Grade"
            destructive
            onCancel={() => setRemoveId(null)}
            onConfirm={() => {
              try {
                onDelete(removing.id)
                setRemoveId(null)
                clearFilters()
              } catch (error) {
                setDeleteError(error.message)
              }
            }}
          >
            <p>
              Delete <strong>{removing.name}</strong> and its base salary of{' '}
              {formatCurrency(removing.salary, salaryOptions)}? No employees are
              assigned to this grade.
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
