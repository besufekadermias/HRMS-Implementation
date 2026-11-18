import Icon from '../common/Icon.jsx'

export default function DepartmentTable({
  departments,
  onEdit,
  onDelete,
  onViewEmployees,
}) {
  return (
    <div
      className="table-scroll tw:shared-base:overflow-x-auto tw:shared-base:[scrollbar-width:thin]
        tw:shared-base:[scrollbar-color:#c5dbd6_#f5f9f9]"
      tabIndex={0}
      role="region"
      aria-label="Department records"
    >
      <table className="employee-table department-table tw:min-w-[760px] tw:text-[11px] tw:[&_th]:p-[14px_9px] tw:[&_th]:bg-[#f0f9fa]
          tw:[&_th]:tracking-[0] tw:[&_th]:text-[10px] tw:[&_td]:p-[21px_9px] tw:[&_td]:align-middle
          tw:[&_td:nth-child(2)]:w-[34%] tw:[&_td:nth-child(2)]:min-w-[220px] tw:[&_td:nth-child(4)]:min-w-[135px]
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
          tw:max-[768px]:shared-base:min-w-[870px]" id="department-table">
        <caption className="sr-only tw:sr-only">
          Departments, assigned staff, and management actions
        </caption>
        <thead>
          <tr>
            {[
              'ID',
              'Department',
              'Code',
              'Department Head',
              'Employees',
              'Status',
              'Actions',
            ].map((label) => (
              <th key={label} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departments.map((department) => (
            <tr key={department.id}>
              <td className="employee-id tw:shared-base:[font-family:'SFMono-Regular',_Consolas,_monospace] tw:shared-base:text-[10px]
          tw:shared-base:font-semibold tw:shared-base:[color:#547082] tw:shared-base:whitespace-nowrap">#{department.id}</td>
              <td>
                <div className="department-identity tw:flex tw:items-center tw:gap-[12px] tw:[&>div]:min-w-0 tw:[&_strong]:block
          tw:[&_strong]:text-[11px] tw:[&_strong]:font-[600] tw:[&_strong]:text-text-primary
          tw:[&_strong]:leading-[1.6] tw:[&_strong]:[overflow-wrap:anywhere] tw:[&_small]:block
          tw:[&_small]:text-[10px] tw:[&_small]:text-[var(--text-muted)] tw:[&_small]:mt-[3px]
          tw:[&_small]:[overflow-wrap:anywhere]">
                  <span
                    className="icon-circle tw:w-[40px] tw:h-[40px] tw:shared-base:w-[46px] tw:shared-base:h-[46px] tw:shared-base:shrink-0
          tw:shared-base:rounded-[50%] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center"
                    style={{
                      color: department.color,
                      background: `${department.color}18`,
                    }}
                  >
                    <Icon name="building" size={22} />
                  </span>
                  <div>
                    <strong>{department.name}</strong>
                    {department.description && (
                      <small>{department.description}</small>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <span className="department-code tw:inline-block tw:rounded-[20px] tw:p-[3px_10px] tw:bg-[#e0f8ef] tw:text-[#067562] tw:text-[10px]
          tw:[overflow-wrap:anywhere]">{department.code}</span>
              </td>
              <td>
                {department.head ? (
                  <div className="department-head tw:flex tw:items-center tw:gap-[8px] tw:[&>div]:min-w-0 tw:[&_strong]:block
          tw:[&_strong]:text-[11px] tw:[&_strong]:font-[600] tw:[&_strong]:text-text-primary
          tw:[&_strong]:leading-[1.6] tw:[&_strong]:[overflow-wrap:anywhere] tw:[&_small]:block
          tw:[&_small]:text-[10px] tw:[&_small]:text-[var(--text-muted)] tw:[&_small]:mt-[3px]
          tw:[&_small]:[overflow-wrap:anywhere]">
                    <span className="employee-avatar avatar-color-0 tw:w-[28px] tw:h-[28px] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:shared-base:shrink-0 tw:shared-base:w-[30px] tw:shared-base:h-[30px]
          tw:shared-base:rounded-[50%] tw:shared-base:text-[9px] tw:shared-base:font-semibold
          tw:shared-base:[border:2px_solid_#fff] tw:[:where(&.avatar-color-0)]:[background:#e2eee6]
          tw:[:where(&.avatar-color-0)]:[color:#607c56] tw:shared-base:overflow-hidden
          tw:shared-base:[&_img]:w-full tw:shared-base:[&_img]:h-[100%] tw:shared-base:[&_img]:object-cover">
                      {department.head.photo ? (
                        <img src={department.head.photo.dataUrl} alt="" />
                      ) : (
                        department.head.name
                          .split(' ')
                          .slice(0, 2)
                          .map((name) => name[0])
                          .join('')
                      )}
                    </span>
                    <div>
                      <strong>{department.head.name}</strong>
                      <small>{department.head.id}</small>
                    </div>
                  </div>
                ) : (
                  <span className="muted-note tw:shared-base:block tw:shared-base:[color:var(--text-muted)] tw:shared-base:text-[12px]
          tw:shared-base:leading-[1.8] tw:shared-base:mt-[17px]">Not assigned</span>
                )}
              </td>
              <td>
                <button
                  className="department-staff-count tw:min-w-[33px] tw:min-h-[33px] tw:[border:0] tw:rounded-[6px] tw:bg-[#edf8f7]
          tw:text-primary tw:font-[650] tw:hover:bg-[#d8f2e8] tw:hover:underline"
                  onClick={() => onViewEmployees(department.name)}
                  aria-label={`View ${department.count} employees in ${department.name}`}
                >
                  {department.count}
                  <span className="sr-only tw:sr-only"> employees</span>
                </button>
              </td>
              <td>
                <span
                  className={`status-pill status-${department.status.toLowerCase()} tw:[:where(&.status-dot)]:inline-block tw:[:where(&.status-dot)]:h-[6px] tw:[:where(&.status-dot)]:w-[6px]
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
                  {department.status}
                </span>
              </td>
              <td>
                <div className="employee-row-actions tw:shared-base:flex tw:shared-base:items-center tw:shared-base:gap-[4px]">
                  <button
                    className="row-action edit-action tw:shared-base:inline-flex tw:shared-base:items-center tw:shared-base:justify-center
          tw:shared-base:w-[28px] tw:shared-base:h-[29px] tw:shared-base:[border:1px_solid_transparent]
          tw:shared-base:rounded-[6px] tw:shared-base:p-[5px] tw:shared-base:[color:#07816a]
          tw:shared-base:[background:#eafaf2] tw:[:where(&):hover]:[border-color:currentColor]
          tw:[:where(&):hover]:[filter:brightness(0.97)]"
                    aria-label={`Edit ${department.name}`}
                    title="Edit department"
                    onClick={() => onEdit(department)}
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button
                    className="row-action delete-action tw:shared-base:inline-flex tw:shared-base:items-center tw:shared-base:justify-center
          tw:shared-base:w-[28px] tw:shared-base:h-[29px] tw:shared-base:[border:1px_solid_transparent]
          tw:shared-base:rounded-[6px] tw:shared-base:p-[5px] tw:shared-base:[color:#db4967]
          tw:shared-base:[background:#fff0f3] tw:[:where(&):hover]:[border-color:currentColor]
          tw:[:where(&):hover]:[filter:brightness(0.97)]"
                    aria-label={`Delete ${department.name}`}
                    title="Delete department"
                    onClick={() => onDelete(department)}
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
