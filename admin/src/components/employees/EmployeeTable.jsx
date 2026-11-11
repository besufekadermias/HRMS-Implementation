import Icon from '../common/Icon.jsx'
import formatDate from '../../utils/formatters/formatDate.js'
import formatCurrency from '../../utils/formatters/formatCurrency.js'
import { EMPLOYEE_STATUSES } from '../../utils/constants/constants.js'

export default function EmployeeTable({
  employees,
  search = '',
  onClearSearch,
  onSelect,
  directory = false,
  selectedIds = [],
  onToggleSelection,
  onToggleAll,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const query = search.trim().toLowerCase()
  const filtered = employees.filter((employee) =>
    [
      employee.name,
      employee.id,
      employee.department,
      employee.email || '',
    ].some((value) => value.toLowerCase().includes(query)),
  )

  if (directory) {
    const selectedOnPage = employees.filter((employee) =>
      selectedIds.includes(employee.id),
    ).length
    return (
      <div
        className="table-scroll directory-table-scroll"
        id="employee-directory-table"
        tabIndex={0}
        role="region"
        aria-label="Employee directory table"
      >
        <table className="employee-table directory-table">
          <caption className="sr-only">
            Employee directory with ID, name, email, department, grade, status,
            hired date, and view, edit, delete actions
          </caption>
          <thead>
            <tr>
              <th scope="col">
                <input
                  type="checkbox"
                  aria-label="Select all employees on this page"
                  checked={
                    employees.length > 0 && selectedOnPage === employees.length
                  }
                  ref={(input) => {
                    if (input)
                      input.indeterminate =
                        selectedOnPage > 0 && selectedOnPage < employees.length
                  }}
                  onChange={onToggleAll}
                  disabled={!employees.length}
                />
              </th>
              <th scope="col">EMPLOYEE ID</th>
              <th scope="col">FULL NAME</th>
              <th scope="col">EMAIL / LOGIN ID</th>
              <th scope="col">DEPARTMENT</th>
              <th scope="col">JOB GRADE</th>
              <th scope="col">STATUS</th>
              <th scope="col">HIRED DATE</th>
              <th scope="col">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <tr
                key={employee.id}
                className={
                  selectedIds.includes(employee.id) ? 'selected-row' : ''
                }
              >
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Select ${employee.name} (${employee.id})`}
                    checked={selectedIds.includes(employee.id)}
                    onChange={() => onToggleSelection(employee.id)}
                  />
                </td>
                <td>
                  <span className="employee-id">{employee.id}</span>
                </td>
                <td>
                  <button
                    className="employee-name"
                    onClick={() => onSelect(employee)}
                  >
                    <span
                      className={`employee-avatar avatar-color-${index % 4}`}
                    >
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
                      <small className="employee-qualification">
                        {employee.qualification || 'Qualification not provided'}
                      </small>
                    </span>
                  </button>
                </td>
                <td>
                  <span className="employee-login">
                    {employee.email || '—'}
                  </span>
                </td>
                <td>
                  <span
                    className={`department-tag department-tag-${index % 4}`}
                  >
                    {employee.department}
                  </span>
                </td>
                <td>
                  {employee.grade}
                  <small className="employee-salary">
                    {employee.basicSalary != null
                      ? formatCurrency(employee.basicSalary)
                      : '—'}
                  </small>
                </td>
                <td>
                  <select
                    className={`employee-status-select status-${employee.status.toLowerCase().replaceAll(' ', '-')}`}
                    value={employee.status}
                    aria-label={`Status for ${employee.name} (${employee.id})`}
                    onChange={(event) =>
                      onStatusChange(employee.id, event.target.value)
                    }
                  >
                    {EMPLOYEE_STATUSES.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td className="nowrap">{formatDate(employee.hiredDate)}</td>
                <td>
                  <div className="employee-row-actions">
                    <button
                      type="button"
                      className="row-action view-action"
                      aria-label={`View ${employee.name} (${employee.id})`}
                      title="View employee"
                      onClick={() => onSelect(employee)}
                    >
                      <Icon name="eye" size={16} />
                    </button>
                    <button
                      type="button"
                      className="row-action edit-action"
                      aria-label={`Edit ${employee.name} (${employee.id})`}
                      title="Edit employee"
                      onClick={() => onEdit(employee)}
                    >
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      type="button"
                      className="row-action delete-action"
                      aria-label={`Delete ${employee.name} (${employee.id})`}
                      title="Delete employee"
                      onClick={() => onDelete(employee)}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <>
      {query && (
        <p className="search-result-count" role="status">
          {filtered.length} employee{filtered.length === 1 ? '' : 's'} matching
          “{search}”{' '}
          <button className="text-button" onClick={onClearSearch}>
            Clear search
          </button>
        </p>
      )}
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Personnel roster table; scroll horizontally on smaller screens"
      >
        <table className="employee-table">
          <caption className="sr-only">
            Personnel roster: employee ID, full name, department, job grade,
            status, and hired date
          </caption>
          <thead>
            <tr>
              <th scope="col">ID NO</th>
              <th scope="col">FULL NAME</th>
              <th scope="col">DEPARTMENT</th>
              <th scope="col">JOB GRADE</th>
              <th scope="col">STATUS</th>
              <th scope="col">HIRED DATE</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((employee, index) => (
              <tr key={employee.id}>
                <td>
                  <span className="employee-id">{employee.id}</span>
                </td>
                <td>
                  <button
                    className="employee-name"
                    onClick={() => onSelect(employee)}
                  >
                    <span
                      className={`employee-avatar avatar-color-${index % 4}`}
                    >
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
                    <strong>{employee.name}</strong>
                  </button>
                </td>
                <td>{employee.department}</td>
                <td>{employee.grade}</td>
                <td>
                  <span
                    className={`status-pill status-${employee.status.toLowerCase().replaceAll(' ', '-')}${employee.status === 'Onboarding' ? ' pending-pill' : ''}`}
                  >
                    <span />
                    {employee.status}
                  </span>
                </td>
                <td className="nowrap">{formatDate(employee.hiredDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <div className="empty-state">
          <Icon name="search" size={28} />
          <h3>No employees found</h3>
          <p>Try another name, employee ID, or department.</p>
          <button className="button button-secondary" onClick={onClearSearch}>
            Clear search
          </button>
        </div>
      )}
      <div className="table-footer">
        <span>
          Showing {filtered.length} of {employees.length} employees
        </span>
        <span>Hadiya Science · IT Department</span>
      </div>
    </>
  )
}
