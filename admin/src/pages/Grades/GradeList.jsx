import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Modal from '../../components/common/Modal.jsx'
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
      <div className="employee-page-heading">
        <span className="icon-circle directory-heading-icon">
          <Icon name="graduation" size={28} />
        </span>
        <div>
          <h1>Job Grades &amp; Salary Scales</h1>
          <p>
            Manage civil service job grades and base salaries for Hadiya Science
            IT Department.
          </p>
        </div>
        <button className="button button-primary" onClick={() => setEditor({})}>
          <Icon name="plus" size={18} />
          Add New Job Grade
        </button>
      </div>
      <section
        className="department-stats grade-stats"
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
      <section
        className="card grade-main"
        aria-label="Job grades and salary scales"
      >
        <div className="employee-filters grade-filters">
          <label className="directory-search">
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
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort job grades"
          >
            <option value="reference">Original order</option>
            <option value="title">Grade title: A–Z</option>
            <option value="salary-asc">Salary: Low to high</option>
            <option value="salary-desc">Salary: High to low</option>
          </select>
          <button className="text-button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
        <div
          className="table-scroll"
          role="region"
          aria-label="Job grade records"
          tabIndex={0}
        >
          <table className="employee-table grade-table" id="grade-table">
            <caption className="sr-only">
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
                  <td className="employee-id">#{grade.id}</td>
                  <td>
                    <div className="grade-identity">
                      <span className="icon-circle tone-green">
                        <Icon name="graduation" size={23} />
                      </span>
                      <div>
                        <strong>{grade.name}</strong>
                        {grade.staffCount > 0 ? (
                          <button
                            className="grade-staff-link"
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
                  <td className="grade-salary">
                    {formatCurrency(grade.salary, salaryOptions)}
                  </td>
                  <td>
                    <div className="employee-row-actions">
                      <button
                        className="row-action edit-action"
                        onClick={() => setEditor({ grade })}
                        aria-label={`Edit ${grade.name}`}
                        title="Edit job grade"
                      >
                        <Icon name="edit" size={17} />
                      </button>
                      <button
                        className="row-action delete-action"
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
          <div className="empty-state">
            <Icon name="graduation" size={34} />
            <h3>
              {grades.length ? 'No matching job grades' : 'No job grades yet'}
            </h3>
            <p>
              {grades.length
                ? 'Try a different grade title or ID.'
                : 'Add a job grade and base salary to start assigning employees.'}
            </p>
            <button
              className="button button-secondary"
              onClick={grades.length ? clearFilters : () => setEditor({})}
            >
              {grades.length ? 'Clear Filters' : 'Add New Job Grade'}
            </button>
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
      </section>
      <footer className="dashboard-footer">
        <span>Hadiya Science · IT Department</span>
        <span>
          <span className="status-dot tone-green" />
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
          onSave={(values) => {
            onSave(values)
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
            <div className="confirmation-copy">
              <p>
                <strong>{removing.name}</strong> is assigned to{' '}
                {removing.staffCount} employee
                {removing.staffCount === 1 ? '' : 's'}. Choose another grade for
                them before deleting this one.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="button button-secondary"
                onClick={() => setRemoveId(null)}
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
              <p className="field-error" role="alert">
                {deleteError}
              </p>
            )}
          </ConfirmationModal>
        ))}
    </div>
  )
}
