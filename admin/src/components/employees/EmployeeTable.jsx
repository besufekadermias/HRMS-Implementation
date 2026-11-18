import Button, { TextButton } from '../common/Button.jsx'
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
        className="table-scroll directory-table-scroll tw:overflow-x-auto tw:[scrollbar-width:thin]
          tw:[scrollbar-color:#c5dbd6_#f5f9f9] tw:shared-base:overflow-x-auto tw:shared-base:[scrollbar-width:thin]
          tw:shared-base:[scrollbar-color:#c5dbd6_#f5f9f9]"
        id="employee-directory-table"
        tabIndex={0}
        role="region"
        aria-label="Employee directory table"
      >
        <table className="employee-table directory-table tw:w-full tw:border-collapse tw:text-left tw:text-[10px] tw:min-w-[900px]
          tw:[&_th]:text-[8px] tw:[&_th]:tracking-[0.6px] tw:[&_th]:font-[650] tw:[&_th]:text-[#5c768a]
          tw:[&_th]:bg-[#f6f9fb] tw:[&_th]:p-[13px_7px] tw:[&_th]:whitespace-normal tw:[&_th]:border-b
          tw:[&_th]:border-b-[#e6eff2] tw:[&_th:first-child]:rounded-[5px_0_0_5px]
          tw:[&_th:last-child]:rounded-[0_5px_5px_0] tw:[&_td]:p-[13px_7px] tw:[&_td]:border-b
          tw:[&_td]:border-b-[#f0f4f6] tw:[&_td]:text-text-secondary tw:[&_td]:leading-[1.6] tw:[&_td]:align-middle
          tw:[&_tbody_tr:hover]:bg-[#f9fcfb] tw:[&_tbody_tr:last-child_td]:border-b-0
          tw:[&_th:first-child]:w-[23px] tw:[&_th:first-child]:pl-[1px] tw:[&_td:first-child]:w-[23px]
          tw:[&_td:first-child]:pl-[1px] tw:[&_td:nth-child(3)]:min-w-[135px] tw:[&_td:nth-child(4)]:max-w-[130px]
          tw:[&_td:nth-child(5)]:max-w-[140px] tw:[&_td:nth-child(6)]:min-w-[100px]
          tw:[&_input[type=checkbox]]:w-[12px] tw:[&_input[type=checkbox]]:h-[12px]
          tw:[&_input[type=checkbox]]:accent-primary tw:[&_input[type=checkbox]]:cursor-pointer
          tw:shared-base:w-full tw:shared-base:border-collapse tw:shared-base:text-left tw:shared-base:text-[11px]
          tw:shared-base:[&_th]:text-[9px] tw:shared-base:[&_th]:tracking-[0.6px] tw:shared-base:[&_th]:font-[650]
          tw:shared-base:[&_th]:[color:#5c768a] tw:shared-base:[&_th]:[background:#f6f9fb]
          tw:shared-base:[&_th]:p-[13px_12px] tw:shared-base:[&_th]:whitespace-nowrap
          tw:shared-base:[&_th]:[border-bottom:1px_solid_#e6eff2]
          tw:shared-base:[&_th:first-child]:rounded-[5px_0_0_5px]
          tw:shared-base:[&_th:last-child]:rounded-[0_5px_5px_0] tw:shared-base:[&_td]:p-[12px]
          tw:shared-base:[&_td]:[border-bottom:1px_solid_#f0f4f6]
          tw:shared-base:[&_td]:[color:var(--text-secondary)] tw:shared-base:[&_td]:leading-[1.6]
          tw:shared-base:[&_tbody_tr:hover]:[background:#f9fcfb]
          tw:shared-base:[&_tbody_tr:last-child_td]:[border-bottom:0]
          tw:max-[768px]:shared-base:min-w-[870px]">
          <caption className="sr-only tw:sr-only">
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
                  selectedIds.includes(employee.id) ? "selected-row tw:[.directory-table_&]:bg-[#effaf5]" : ""
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
                  <span className="employee-id tw:[font-family:SFMono-Regular,Consolas,monospace] tw:text-[10px] tw:font-[600] tw:text-[#547082]
          tw:whitespace-nowrap tw:shared-base:[font-family:'SFMono-Regular',_Consolas,_monospace]
          tw:shared-base:text-[10px] tw:shared-base:font-semibold tw:shared-base:[color:#547082]
          tw:shared-base:whitespace-nowrap">{employee.id}</span>
                </td>
                <td>
                  <button
                    className="employee-name tw:flex tw:items-center tw:gap-[7px] tw:bg-transparent tw:border-0 tw:p-0 tw:min-h-[32px]
          tw:text-left tw:[&_strong]:min-w-0 tw:[&_strong]:block tw:[&_strong]:text-[10px]
          tw:[&_strong]:leading-[1.5] tw:[&_strong]:font-[600] tw:[&_strong]:text-text-primary
          tw:[&:hover_strong]:text-primary tw:[&:hover_strong]:underline tw:shared-base:flex
          tw:shared-base:items-center tw:shared-base:gap-[10px] tw:shared-base:[background:none]
          tw:shared-base:[border:none] tw:shared-base:p-[0] tw:shared-base:min-h-[32px] tw:shared-base:text-left
          tw:shared-base:[&_strong]:text-[11px] tw:shared-base:[&_strong]:font-semibold
          tw:shared-base:[&_strong]:[color:var(--text-primary)] tw:shared-base:[&_strong]:min-w-[125px]
          tw:[:where(&):hover_strong]:[color:var(--primary)] tw:[:where(&):hover_strong]:underline"
                    onClick={() => onSelect(employee)}
                  >
                    <span
                      className={`employee-avatar avatar-color-${index % 4} tw:inline-flex tw:items-center tw:justify-center tw:shrink-0 tw:w-[30px] tw:h-[30px] tw:rounded-[50%] tw:text-[9px]
          tw:font-[600] tw:[border:2px_solid_white] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:shared-base:shrink-0 tw:shared-base:w-[30px] tw:shared-base:h-[30px]
          tw:shared-base:rounded-[50%] tw:shared-base:text-[9px] tw:shared-base:font-semibold
          tw:shared-base:[border:2px_solid_#fff] tw:[:where(&.avatar-color-0)]:[background:#e2eee6]
          tw:[:where(&.avatar-color-0)]:[color:#607c56] tw:[:where(&.avatar-color-1)]:[background:#efe8e3]
          tw:[:where(&.avatar-color-1)]:[color:#956948] tw:[:where(&.avatar-color-2)]:[background:#e3ecf3]
          tw:[:where(&.avatar-color-2)]:[color:#527994] tw:[:where(&.avatar-color-3)]:[background:#eee8f4]
          tw:[:where(&.avatar-color-3)]:[color:#86679f] tw:shared-base:overflow-hidden
          tw:shared-base:[&_img]:w-full tw:shared-base:[&_img]:h-[100%] tw:shared-base:[&_img]:object-cover
          tw:overflow-hidden `}
                    >
                      {employee.photo ? (
                        <img className="tw:w-full tw:h-full tw:object-cover" src={employee.photo.dataUrl} alt="" />
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
                      <small className="employee-qualification tw:block tw:text-[var(--text-muted)] tw:text-[9px] tw:font-normal tw:mt-[3px]
          tw:leading-[1.5]">
                        {employee.qualification || 'Qualification not provided'}
                      </small>
                    </span>
                  </button>
                </td>
                <td>
                  <span className="employee-login tw:inline tw:p-[2px_5px] tw:rounded-[4px] tw:bg-[#f2f6fa] tw:[font-family:Consolas,monospace]
          tw:text-[9px] tw:[overflow-wrap:anywhere]">
                    {employee.email || '—'}
                  </span>
                </td>
                <td>
                  <span
                    className={`department-tag department-tag-${index % 4} tw:inline-block tw:p-[4px_7px] tw:rounded-[6px] tw:text-[9px] tw:leading-[1.5] tw:bg-[#e2f7f0] tw:text-[#187568]
          tw:[&.department-tag-1]:bg-[#efebfd] tw:[&.department-tag-1]:text-[#7351a9]
          tw:[&.department-tag-2]:bg-[#e7f1ff] tw:[&.department-tag-2]:text-[#3979aa]
          tw:[&.department-tag-3]:bg-[#fff5dc] tw:[&.department-tag-3]:text-[#906916] tw:shared-base:inline-block
          tw:shared-base:p-[4px_7px] tw:shared-base:rounded-[6px] tw:shared-base:text-[9px]
          tw:shared-base:leading-[1.5] tw:shared-base:[background:#e2f7f0] tw:shared-base:[color:#187568] `}
                  >
                    {employee.department}
                  </span>
                </td>
                <td>
                  {employee.grade}
                  <small className="employee-salary tw:block tw:mt-[2px] tw:text-[var(--text-muted)] tw:text-[9px] tw:whitespace-nowrap">
                    {employee.basicSalary != null
                      ? formatCurrency(employee.basicSalary)
                      : '—'}
                  </small>
                </td>
                <td>
                  <select
                    className={`employee-status-select status-${employee.status.toLowerCase().replaceAll(" ", "-")} tw:max-w-[105px] tw:[border:1px_solid_transparent] tw:rounded-[6px] tw:p-[5px_18px_5px_6px] tw:text-[9px]
          tw:text-[#07814c] tw:bg-[#ddf7e9] tw:cursor-pointer tw:[&.status-on-leave]:text-[#996218]
          tw:[&.status-on-leave]:bg-[#fff1d9] tw:[&.status-inactive]:text-[#9b465d]
          tw:[&.status-inactive]:bg-[#fce9ee] tw:[&.status-onboarding]:text-[#65509d]
          tw:[&.status-onboarding]:bg-[#eee9fb] tw:[:where(&.status-dot)]:inline-block
          tw:[:where(&.status-dot)]:h-[6px] tw:[:where(&.status-dot)]:w-[6px] tw:[:where(&.status-dot)]:shrink-0
          tw:[:where(&.status-dot)]:rounded-[50%] tw:[:where(&.status-dot)]:[background:currentColor]
          tw:[:where(&.status-pill)]:inline-flex tw:[:where(&.status-pill)]:items-center
          tw:[:where(&.status-pill)]:gap-[5px] tw:[:where(&.status-pill)]:rounded-[20px]
          tw:[:where(&.status-pill)]:[background:#ddf7e9] tw:[:where(&.status-pill)]:[color:#07814c]
          tw:[:where(&.status-pill)]:p-[3px_8px] tw:[:where(&.status-pill)]:text-[10px]
          tw:[:where(&.status-pill)]:leading-[1.5] tw:[:where(&.status-pill)]:whitespace-nowrap
          tw:[:where(&.status-pill)_>_span]:w-[4px] tw:[:where(&.status-pill)_>_span]:h-[4px]
          tw:[:where(&.status-pill)_>_span]:[background:currentColor]
          tw:[:where(&.status-pill)_>_span]:rounded-[50%] tw:[:where(&.status-on-leave)]:[color:#996218]
          tw:[:where(&.status-on-leave)]:[background-color:#fff1d9] tw:[:where(&.status-inactive)]:[color:#9b465d]
          tw:[:where(&.status-inactive)]:[background-color:#fce9ee]
          tw:[:where(&.status-onboarding)]:[color:#65509d]
          tw:[:where(&.status-onboarding)]:[background-color:#eee9fb] `}
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
                <td className="nowrap tw:shared-base:whitespace-nowrap">{formatDate(employee.hiredDate)}</td>
                <td>
                  <div className="employee-row-actions tw:flex tw:items-center tw:gap-[4px] tw:shared-base:flex tw:shared-base:items-center
          tw:shared-base:gap-[4px]">
                    <button
                      type="button"
                      className="row-action view-action tw:inline-flex tw:items-center tw:justify-center tw:w-[28px] tw:h-[29px]
          tw:[border:1px_solid_transparent] tw:rounded-[6px] tw:p-[5px] tw:text-[#467c9b] tw:bg-[#edf4fe]
          tw:hover:border-current tw:hover:brightness-[0.97] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:shared-base:w-[28px] tw:shared-base:h-[29px]
          tw:shared-base:[border:1px_solid_transparent] tw:shared-base:rounded-[6px] tw:shared-base:p-[5px]
          tw:shared-base:[color:#467c9b] tw:shared-base:[background:#edf4fe]
          tw:[:where(&):hover]:[border-color:currentColor] tw:[:where(&):hover]:[filter:brightness(0.97)]"
                      aria-label={`View ${employee.name} (${employee.id})`}
                      title="View employee"
                      onClick={() => onSelect(employee)}
                    >
                      <Icon name="eye" size={16} />
                    </button>
                    <button
                      type="button"
                      className="row-action edit-action tw:inline-flex tw:items-center tw:justify-center tw:w-[28px] tw:h-[29px]
          tw:[border:1px_solid_transparent] tw:rounded-[6px] tw:p-[5px] tw:text-[#07816a] tw:bg-[#eafaf2]
          tw:hover:border-current tw:hover:brightness-[0.97] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:shared-base:w-[28px] tw:shared-base:h-[29px]
          tw:shared-base:[border:1px_solid_transparent] tw:shared-base:rounded-[6px] tw:shared-base:p-[5px]
          tw:shared-base:[color:#07816a] tw:shared-base:[background:#eafaf2]
          tw:[:where(&):hover]:[border-color:currentColor] tw:[:where(&):hover]:[filter:brightness(0.97)]"
                      aria-label={`Edit ${employee.name} (${employee.id})`}
                      title="Edit employee"
                      onClick={() => onEdit(employee)}
                    >
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      type="button"
                      className="row-action delete-action tw:inline-flex tw:items-center tw:justify-center tw:w-[28px] tw:h-[29px]
          tw:[border:1px_solid_transparent] tw:rounded-[6px] tw:p-[5px] tw:text-[#db4967] tw:bg-[#fff0f3]
          tw:hover:border-current tw:hover:brightness-[0.97] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:shared-base:w-[28px] tw:shared-base:h-[29px]
          tw:shared-base:[border:1px_solid_transparent] tw:shared-base:rounded-[6px] tw:shared-base:p-[5px]
          tw:shared-base:[color:#db4967] tw:shared-base:[background:#fff0f3]
          tw:[:where(&):hover]:[border-color:currentColor] tw:[:where(&):hover]:[filter:brightness(0.97)]"
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
        <p className="search-result-count tw:shared-base:flex tw:shared-base:items-center tw:shared-base:gap-[10px]
          tw:shared-base:flex-wrap tw:shared-base:m-[0_0_10px] tw:shared-base:[color:var(--text-secondary)]
          tw:shared-base:text-[12px] tw:shared-base:[overflow-wrap:anywhere]" role="status">
          {filtered.length} employee{filtered.length === 1 ? '' : 's'} matching
          “{search}”{' '}
          <TextButton onClick={onClearSearch}>
            Clear search
          </TextButton>
        </p>
      )}
      <div
        className="table-scroll tw:shared-base:overflow-x-auto tw:shared-base:[scrollbar-width:thin]
          tw:shared-base:[scrollbar-color:#c5dbd6_#f5f9f9]"
        tabIndex={0}
        role="region"
        aria-label="Personnel roster table; scroll horizontally on smaller screens"
      >
        <table className="employee-table tw:shared-base:w-full tw:shared-base:border-collapse tw:shared-base:text-left
          tw:shared-base:text-[11px] tw:shared-base:[&_th]:text-[9px] tw:shared-base:[&_th]:tracking-[0.6px]
          tw:shared-base:[&_th]:font-[650] tw:shared-base:[&_th]:[color:#5c768a]
          tw:shared-base:[&_th]:[background:#f6f9fb] tw:shared-base:[&_th]:p-[13px_12px]
          tw:shared-base:[&_th]:whitespace-nowrap tw:shared-base:[&_th]:[border-bottom:1px_solid_#e6eff2]
          tw:shared-base:[&_th:first-child]:rounded-[5px_0_0_5px]
          tw:shared-base:[&_th:last-child]:rounded-[0_5px_5px_0] tw:shared-base:[&_td]:p-[12px]
          tw:shared-base:[&_td]:[border-bottom:1px_solid_#f0f4f6]
          tw:shared-base:[&_td]:[color:var(--text-secondary)] tw:shared-base:[&_td]:leading-[1.6]
          tw:shared-base:[&_tbody_tr:hover]:[background:#f9fcfb]
          tw:shared-base:[&_tbody_tr:last-child_td]:[border-bottom:0]
          tw:max-[768px]:shared-base:min-w-[870px]">
          <caption className="sr-only tw:sr-only">
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
                  <span className="employee-id tw:shared-base:[font-family:'SFMono-Regular',_Consolas,_monospace] tw:shared-base:text-[10px]
          tw:shared-base:font-semibold tw:shared-base:[color:#547082] tw:shared-base:whitespace-nowrap">{employee.id}</span>
                </td>
                <td>
                  <button
                    className="employee-name tw:shared-base:flex tw:shared-base:items-center tw:shared-base:gap-[10px]
          tw:shared-base:[background:none] tw:shared-base:[border:none] tw:shared-base:p-[0]
          tw:shared-base:min-h-[32px] tw:shared-base:text-left tw:shared-base:[&_strong]:text-[11px]
          tw:shared-base:[&_strong]:font-semibold tw:shared-base:[&_strong]:[color:var(--text-primary)]
          tw:shared-base:[&_strong]:min-w-[125px] tw:[:where(&):hover_strong]:[color:var(--primary)]
          tw:[:where(&):hover_strong]:underline"
                    onClick={() => onSelect(employee)}
                  >
                    <span
                      className={`employee-avatar avatar-color-${index % 4} tw:shared-base:inline-flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:shrink-0
          tw:shared-base:w-[30px] tw:shared-base:h-[30px] tw:shared-base:rounded-[50%] tw:shared-base:text-[9px]
          tw:shared-base:font-semibold tw:shared-base:[border:2px_solid_#fff]
          tw:[:where(&.avatar-color-0)]:[background:#e2eee6] tw:[:where(&.avatar-color-0)]:[color:#607c56]
          tw:[:where(&.avatar-color-1)]:[background:#efe8e3] tw:[:where(&.avatar-color-1)]:[color:#956948]
          tw:[:where(&.avatar-color-2)]:[background:#e3ecf3] tw:[:where(&.avatar-color-2)]:[color:#527994]
          tw:[:where(&.avatar-color-3)]:[background:#eee8f4] tw:[:where(&.avatar-color-3)]:[color:#86679f]
          tw:shared-base:overflow-hidden tw:shared-base:[&_img]:w-full tw:shared-base:[&_img]:h-[100%]
          tw:shared-base:[&_img]:object-cover `}
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
                    className={`status-pill status-${employee.status.toLowerCase().replaceAll(" ", "-")}${employee.status === "Onboarding" ? " pending-pill tw:shared-base:[color:#946008] tw:shared-base:[background:#fff2d7]" : ""} tw:[:where(&.status-dot)]:inline-block tw:[:where(&.status-dot)]:h-[6px] tw:[:where(&.status-dot)]:w-[6px]
          tw:[:where(&.status-dot)]:shrink-0 tw:[:where(&.status-dot)]:rounded-[50%]
          tw:[:where(&.status-dot)]:[background:currentColor] tw:[:where(&.status-pill)]:inline-flex
          tw:[:where(&.status-pill)]:items-center tw:[:where(&.status-pill)]:gap-[5px]
          tw:[:where(&.status-pill)]:rounded-[20px] tw:[:where(&.status-pill)]:[background:#ddf7e9]
          tw:[:where(&.status-pill)]:[color:#07814c] tw:[:where(&.status-pill)]:p-[3px_8px]
          tw:[:where(&.status-pill)]:text-[10px] tw:[:where(&.status-pill)]:leading-[1.5]
          tw:[:where(&.status-pill)]:whitespace-nowrap tw:[:where(&.status-pill)_>_span]:w-[4px]
          tw:[:where(&.status-pill)_>_span]:h-[4px] tw:[:where(&.status-pill)_>_span]:[background:currentColor]
          tw:[:where(&.status-pill)_>_span]:rounded-[50%] tw:[:where(&.status-on-leave)]:[color:#996218]
          tw:[:where(&.status-on-leave)]:[background-color:#fff1d9] tw:[:where(&.status-inactive)]:[color:#9b465d]
          tw:[:where(&.status-inactive)]:[background-color:#fce9ee]
          tw:[:where(&.status-onboarding)]:[color:#65509d]
          tw:[:where(&.status-onboarding)]:[background-color:#eee9fb] `}
                  >
                    <span />
                    {employee.status}
                  </span>
                </td>
                <td className="nowrap tw:shared-base:whitespace-nowrap">{formatDate(employee.hiredDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]">
          <Icon name="search" size={28} />
          <h3>No employees found</h3>
          <p>Try another name, employee ID, or department.</p>
          <Button variant="secondary" onClick={onClearSearch}>
            Clear search
          </Button>
        </div>
      )}
      <div className="table-footer tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-between
          tw:shared-base:gap-[12px] tw:shared-base:[border-top:1px_solid_var(--divider)] tw:shared-base:p-[14px_0]
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:text-[10px]
          tw:max-[768px]:shared-base:[&_>_span:last-child]:hidden">
        <span>
          Showing {filtered.length} of {employees.length} employees
        </span>
        <span>Hadiya Science · IT Department</span>
      </div>
    </>
  )
}
