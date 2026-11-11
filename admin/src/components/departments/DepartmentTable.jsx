import Icon from '../common/Icon.jsx'

export default function DepartmentTable({
  departments,
  onEdit,
  onDelete,
  onViewEmployees,
}) {
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Department records"
    >
      <table className="employee-table department-table" id="department-table">
        <caption className="sr-only">
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
              <td className="employee-id">#{department.id}</td>
              <td>
                <div className="department-identity">
                  <span
                    className="icon-circle"
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
                <span className="department-code">{department.code}</span>
              </td>
              <td>
                {department.head ? (
                  <div className="department-head">
                    <span className="employee-avatar avatar-color-0">
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
                  <span className="muted-note">Not assigned</span>
                )}
              </td>
              <td>
                <button
                  className="department-staff-count"
                  onClick={() => onViewEmployees(department.name)}
                  aria-label={`View ${department.count} employees in ${department.name}`}
                >
                  {department.count}
                  <span className="sr-only"> employees</span>
                </button>
              </td>
              <td>
                <span
                  className={`status-pill status-${department.status.toLowerCase()}`}
                >
                  {department.status}
                </span>
              </td>
              <td>
                <div className="employee-row-actions">
                  <button
                    className="row-action edit-action"
                    aria-label={`Edit ${department.name}`}
                    title="Edit department"
                    onClick={() => onEdit(department)}
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button
                    className="row-action delete-action"
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
