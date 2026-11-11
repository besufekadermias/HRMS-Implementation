import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import formatDate from '../../utils/formatters/formatDate.js'
import formatCurrency from '../../utils/formatters/formatCurrency.js'
import { downloadBlob } from '../../services/workforce/employeeService.js'

export default function EmployeeDetails({
  employee,
  onBack,
  onEdit,
  onDelete,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  if (!employee)
    return (
      <section className="card empty-state">
        <Icon name="users" size={32} />
        <h1>Employee not found</h1>
        <p>This employee record could not be found.</p>
        <button className="button button-primary" onClick={onBack}>
          Back to Employee Directory
        </button>
      </section>
    )
  const sections = [
    {
      title: 'Identity & Demographics',
      icon: 'users',
      rows: [
        ['Employee ID', employee.id],
        ['Full name', employee.name],
        ['Gender', employee.gender],
        [
          'Birth date',
          employee.birthDate ? formatDate(employee.birthDate) : '',
        ],
        ['Highest qualification', employee.qualification],
      ],
    },
    {
      title: 'Employment Details',
      icon: 'building',
      rows: [
        ['Department', employee.department],
        ['Civil job grade', employee.grade],
        [
          'Basic salary',
          employee.basicSalary != null
            ? formatCurrency(employee.basicSalary)
            : '',
        ],
        ['Employment type', employee.employmentType],
        ['Hired date', formatDate(employee.hiredDate)],
        ['Status', employee.status],
      ],
    },
    {
      title: 'Portal Account Details',
      icon: 'key',
      rows: [
        ['Official email / Login ID', employee.email],
        ['Requested portal role', employee.portalRole],
      ],
    },
  ]
  return (
    <div className="employee-details-page">
      <div className="employee-page-heading">
        <button
          className="back-button"
          onClick={onBack}
          aria-label="Back to employee directory"
        >
          <Icon name="arrow-left" />
        </button>
        <div>
          <h1>Employee Details</h1>
          <p>Personnel information for {employee.name}</p>
        </div>
        <button className="button button-primary" onClick={onEdit}>
          <Icon name="edit" size={17} />
          Edit Employee
        </button>
      </div>
      <section className="card employee-profile-summary">
        <span className="profile-photo">
          {employee.photo ? (
            <img src={employee.photo.dataUrl} alt={employee.name} />
          ) : (
            employee.name
              .split(' ')
              .slice(0, 2)
              .map((name) => name[0])
              .join('')
          )}
        </span>
        <div>
          <span className="eyebrow">{employee.id}</span>
          <h2>{employee.name}</h2>
          <p>{employee.department}</p>
        </div>
        <span
          className={`status-pill status-${employee.status.toLowerCase().replaceAll(' ', '-')}`}
        >
          {employee.status}
        </span>
      </section>
      <div className="employee-detail-grid">
        {sections.map((section) => (
          <section className="card employee-detail-card" key={section.title}>
            <h2>
              <Icon name={section.icon} size={20} />
              {section.title}
            </h2>
            <dl className="detail-list">
              {section.rows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value || 'Not provided'}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <section className="card employee-detail-card">
          <h2>
            <Icon name="file" size={20} />
            Education Document
          </h2>
          {employee.educationDocument ? (
            <div className="education-file">
              <span className="icon-circle tone-green">
                <Icon name="file" size={25} />
              </span>
              <strong>{employee.educationDocument.name}</strong>
              <span>
                {(employee.educationDocument.size / 1024).toFixed(0)} KB · Local
                file
              </span>
              <button
                className="button button-secondary"
                onClick={() =>
                  downloadBlob(
                    employee.educationDocument.file,
                    employee.educationDocument.name,
                  )
                }
              >
                <Icon name="download" size={17} />
                Download document
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="file" size={28} />
              <h3>No document attached</h3>
              <p>Add an education document when editing this employee.</p>
            </div>
          )}
        </section>
      </div>
      <div className="employee-details-footer">
        <span>Employee Details</span>
        <button
          className="button button-danger-outline"
          onClick={() => setConfirmDelete(true)}
        >
          <Icon name="trash" size={17} />
          Delete Employee
        </button>
      </div>
      {confirmDelete && (
        <ConfirmationModal
          title="Delete employee?"
          confirmLabel="Delete employee"
          destructive
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => onDelete(employee.id)}
        >
          <p>
            Remove <strong>{employee.name}</strong> from the employee directory? This
            will also remove the record from the directory and dashboard roster.
          </p>
        </ConfirmationModal>
      )}
    </div>
  )
}
