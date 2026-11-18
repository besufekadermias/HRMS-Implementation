import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
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
      <Card className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]">
        <Icon name="users" size={32} />
        <h1>Employee not found</h1>
        <p>This employee record could not be found.</p>
        <Button onClick={onBack}>
          Back to Employee Directory
        </Button>
      </Card>
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
    <div className="employee-details-page tw:max-w-[1240px] tw:m-[0_auto]">
      <div className="employee-page-heading tw:flex tw:items-center tw:gap-[13px] tw:mb-[23px] tw:[&>div]:min-w-0 tw:[&>div]:flex-1
          tw:[&>.button]:shrink-0 tw:max-[768px]:flex-wrap tw:max-[768px]:gap-[11px]
          tw:max-[768px]:[&>.button]:ml-auto tw:[&_h1]:text-[27px] tw:[&_h1]:tracking-[-0.6px]
          tw:max-[768px]:[&_h1]:text-[24px] tw:max-[560px]:[&_h1]:text-[22px] tw:[&_p]:text-[var(--text-muted)]
          tw:[&_p]:text-[12px] tw:[&_p]:leading-[1.7] tw:[&_p]:mt-[4px] tw:max-[768px]:[&_p]:text-[11px]
          tw:shared-base:flex tw:shared-base:items-center tw:shared-base:gap-[13px] tw:shared-base:mb-[23px]
          tw:shared-base:[&_>_div]:min-w-0 tw:shared-base:[&_>_div]:flex-1 tw:shared-base:[&_h1]:text-[27px]
          tw:shared-base:[&_h1]:tracking-[-0.6px] tw:shared-base:[&_p]:[color:var(--text-muted)]
          tw:shared-base:[&_p]:text-[12px] tw:shared-base:[&_p]:leading-[1.7] tw:shared-base:[&_p]:mt-[4px]
          tw:shared-base:[&_>_.button]:shrink-0 tw:max-[768px]:shared-base:flex-wrap
          tw:max-[768px]:shared-base:gap-[11px]
          tw:max-[768px]:shared-base:[&_h1]:text-[24px]
          tw:max-[768px]:shared-base:[&_p]:text-[11px]
          tw:max-[768px]:shared-base:[&_>_.button]:ml-[auto]
          tw:max-[560px]:shared-base:[&_h1]:text-[22px]">
        <button
          className="back-button tw:inline-flex tw:items-center tw:justify-center tw:w-[40px] tw:h-[40px] tw:p-[9px] tw:shrink-0
            tw:bg-white tw:[border:1px_solid_var(--border)] tw:rounded-[9px] tw:text-text-secondary
            tw:hover:border-[#a0cec1] tw:hover:text-primary"
          onClick={onBack}
          aria-label="Back to employee directory"
        >
          <Icon name="arrow-left" />
        </button>
        <div>
          <h1>Employee Details</h1>
          <p>Personnel information for {employee.name}</p>
        </div>
        <Button onClick={onEdit}>
          <Icon name="edit" size={17} />
          Edit Employee
        </Button>
      </div>
      <Card className="employee-profile-summary tw:flex tw:items-center tw:gap-[18px] tw:p-[23px] tw:mb-[18px] tw:[&_h2]:text-[24px]
          tw:[&_h2]:mt-[7px] tw:[&_p]:text-[var(--text-muted)] tw:[&_p]:text-[12px] tw:[&_p]:mt-[7px]
          tw:[&>.status-pill]:ml-auto tw:max-[768px]:flex-wrap tw:max-[768px]:gap-[13px] tw:max-[768px]:p-[20px]
          tw:max-[768px]:[&_h2]:text-[22px] tw:max-[768px]:[&>div]:flex-1 tw:max-[768px]:[&>div]:min-w-[150px]
          tw:max-[768px]:[&>.status-pill]:ml-0">
        <span className="profile-photo tw:inline-flex tw:items-center tw:justify-center tw:shrink-0 tw:w-[74px] tw:h-[74px]
          tw:[border:4px_solid_white] tw:[outline:1px_solid_#d8eee4] tw:rounded-[50%] tw:bg-[#e0f4e9]
          tw:text-[#237660] tw:text-[23px] tw:font-[600] tw:overflow-hidden">
          {employee.photo ? (
            <img className="tw:w-full tw:h-full tw:object-cover" src={employee.photo.dataUrl} alt={employee.name} />
          ) : (
            employee.name
              .split(' ')
              .slice(0, 2)
              .map((name) => name[0])
              .join('')
          )}
        </span>
        <div>
          <span className="eyebrow tw:shared-base:text-[10px] tw:shared-base:font-bold tw:shared-base:tracking-[1.4px]
          tw:shared-base:[color:var(--primary)] tw:max-[480px]:shared-base:text-[9px]
          tw:max-[480px]:shared-base:tracking-[1.1px]">{employee.id}</span>
          <h2>{employee.name}</h2>
          <p>{employee.department}</p>
        </div>
        <span
          className={`status-pill status-${employee.status.toLowerCase().replaceAll(" ", "-")} tw:inline-flex tw:items-center tw:gap-[5px] tw:rounded-[20px] tw:bg-[#ddf7e9] tw:text-[#07814c] tw:p-[3px_8px]
            tw:text-[10px] tw:leading-[1.5] tw:whitespace-nowrap tw:[&.status-on-leave]:text-[#996218]
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
            tw:[:where(&.status-on-leave)]:[background-color:#fff1d9]
            tw:[:where(&.status-inactive)]:[color:#9b465d]
            tw:[:where(&.status-inactive)]:[background-color:#fce9ee]
            tw:[:where(&.status-onboarding)]:[color:#65509d]
            tw:[:where(&.status-onboarding)]:[background-color:#eee9fb] `}
        >
          {employee.status}
        </span>
      </Card>
      <div className="employee-detail-grid tw:grid tw:grid-cols-2 tw:gap-[18px] tw:max-[768px]:grid-cols-[minmax(0,_1fr)]">
        {sections.map((section) => (
          <Card className="employee-detail-card tw:p-[24px] tw:[&_h2]:flex tw:[&_h2]:items-center tw:[&_h2]:gap-[10px] tw:[&_h2]:text-[15px]
          tw:[&_h2_svg]:text-primary" key={section.title}>
            <h2>
              <Icon name={section.icon} size={20} />
              {section.title}
            </h2>
            <dl className="detail-list tw:m-[18px_0_0] tw:[&>div]:flex tw:[&>div]:justify-between tw:[&>div]:gap-[20px]
          tw:max-[480px]:[&>div]:gap-[12px] tw:[&>div]:p-[15px_0]
          tw:[&>div]:[border-bottom:1px_solid_var(--divider)] tw:[&>div]:text-[12px]
          tw:[&_dt]:text-[var(--text-muted)] tw:[&_dd]:text-text-primary tw:[&_dd]:m-0 tw:[&_dd]:text-right
          tw:[&_dd]:font-[500] tw:[&_dd]:[overflow-wrap:anywhere] tw:[&_dd]:max-w-[65%] tw:shared-base:m-[18px_0]
          tw:shared-base:[&_>_div]:flex tw:shared-base:[&_>_div]:justify-between
          tw:shared-base:[&_>_div]:gap-[20px] tw:shared-base:[&_>_div]:p-[15px_0]
          tw:shared-base:[&_>_div]:[border-bottom:1px_solid_var(--divider)] tw:shared-base:[&_>_div]:text-[13px]
          tw:shared-base:[&_dt]:[color:var(--text-muted)] tw:shared-base:[&_dd]:[color:var(--text-primary)]
          tw:shared-base:[&_dd]:m-[0] tw:shared-base:[&_dd]:text-right tw:shared-base:[&_dd]:font-[500]
          tw:max-[480px]:shared-base:[&_>_div]:text-[12px]
          tw:max-[480px]:shared-base:[&_>_div]:gap-[12px]">
              {section.rows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value || 'Not provided'}</dd>
                </div>
              ))}
            </dl>
          </Card>
        ))}
        <Card className="employee-detail-card tw:p-[24px] tw:[&_h2]:flex tw:[&_h2]:items-center tw:[&_h2]:gap-[10px] tw:[&_h2]:text-[15px]
          tw:[&_h2_svg]:text-primary">
          <h2>
            <Icon name="file" size={20} />
            Education Document
          </h2>
          {employee.educationDocument ? (
            <div className="education-file tw:flex tw:flex-col tw:items-center tw:text-center tw:gap-[12px] tw:p-[24px_5px_5px]
          tw:[&_strong]:[overflow-wrap:anywhere] tw:[&_strong]:max-w-full tw:[&_strong]:text-[13px]
          tw:[&>span:not(.icon-circle)]:text-[11px] tw:[&>span:not(.icon-circle)]:text-[var(--text-muted)]">
              <span className="icon-circle tone-green tw:shared-base:w-[46px] tw:shared-base:h-[46px] tw:shared-base:shrink-0
          tw:shared-base:rounded-[50%] tw:shared-base:inline-flex tw:shared-base:items-center
          tw:shared-base:justify-center tw:[:where(&.tone-green)]:[color:#0b8972]
          tw:[:where(&.tone-green)]:[background:#e3f5f0]">
                <Icon name="file" size={25} />
              </span>
              <strong>{employee.educationDocument.name}</strong>
              <span>
                {(employee.educationDocument.size / 1024).toFixed(0)} KB · Local
                file
              </span>
              <Button variant="secondary"
                onClick={() =>
                  downloadBlob(
                    employee.educationDocument.file,
                    employee.educationDocument.name,
                  )
                }
              >
                <Icon name="download" size={17} />
                Download document
              </Button>
            </div>
          ) : (
            <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]">
              <Icon name="file" size={28} />
              <h3>No document attached</h3>
              <p>Add an education document when editing this employee.</p>
            </div>
          )}
        </Card>
      </div>
      <div className="employee-details-footer tw:flex tw:justify-between tw:items-center tw:gap-[15px] tw:p-[22px_0] tw:text-[11px]
          tw:text-[var(--text-muted)] tw:max-[560px]:flex-wrap">
        <span>Employee Details</span>
        <Button variant="danger-outline"
          onClick={() => setConfirmDelete(true)}
        >
          <Icon name="trash" size={17} />
          Delete Employee
        </Button>
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
