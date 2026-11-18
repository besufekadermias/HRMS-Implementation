import Card from '../../components/common/Card.jsx'
import Button, { IconButton } from '../../components/common/Button.jsx'
import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import RecordDisciplinaryActionModal from '../../components/discipline/RecordDisciplinaryActionModal.jsx'
import DisciplineHistoryModal from '../../components/discipline/DisciplineHistoryModal.jsx'
import { disciplineRows } from '../../services/growth/disciplineService.js'
import formatDate from '../../utils/formatters/formatDate.js'

export default function DisciplineAndPenalties({ data, employees, search, onSearch, onSave, onDelete, onDirtyChange }) {
  const [recording, setRecording] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const rows = disciplineRows(data.records, employees, search)

  function closeForm() {
    setRecording(false)
    onDirtyChange(false)
  }
  function confirmDelete() {
    try {
      onDelete(removing.id)
      setRemoving(null)
      setDeleteError('')
    } catch (error) {
      setDeleteError(error.message || 'The record could not be deleted.')
    }
  }

  return (
    <div className="discipline-page tw:[&_.employee-page-heading]:flex-wrap tw:[&_.discipline-heading-icon]:[background:#ffe9eb]
           tw:[&_.discipline-heading-icon]:[color:#d5152c]
           tw:[@media(width<=700px)]:[&_.employee-page-heading_>_.button]:ml-[62px]
           tw:[@media(width<=420px)]:[&_.employee-page-heading_>_.button]:ml-[0]
           tw:[@media(width<=420px)]:[&_.employee-page-heading_>_.button]:w-full">
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
        <span className="icon-circle directory-heading-icon discipline-heading-icon tw:shared-base:w-[46px] tw:shared-base:h-[46px]
          tw:shared-base:shrink-0 tw:shared-base:rounded-[50%] tw:shared-base:inline-flex
          tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:w-[49px] tw:shared-base:h-[49px]
          tw:shared-base:[background:#d8f8ee] tw:shared-base:[color:#05695c]"><Icon name="alert-triangle" size={27} /></span>
        <div>
          <h1>Discipline &amp; Penalties Control</h1>
          <p>Official civil service sanctions (Warning, Fine, Suspension, Termination) with activity history.</p>
        </div>
        <Button variant="discipline" type="button" onClick={() => setRecording(true)}>
          <Icon name="plus" size={18} /> Record Disciplinary Action
        </Button>
      </div>
      {search.trim() && <div className="discipline-search-result tw:flex tw:items-center tw:justify-between tw:gap-[12px] tw:mb-[15px]
          tw:[color:var(--text-secondary)] tw:[@media(width<=700px)]:items-start" role="status">
        <span>{rows.length} record{rows.length === 1 ? '' : 's'} matching “{search}”</span>
        <Button variant="secondary" type="button" onClick={() => onSearch('')}>Clear search</Button>
      </div>}
      <Card className="discipline-card tw:p-[0] tw:overflow-hidden tw:[&_.empty-state]:p-[48px_20px]" aria-label="Disciplinary records">
        <div className="table-scroll tw:shared-base:overflow-x-auto tw:shared-base:[scrollbar-width:thin]
          tw:shared-base:[scrollbar-color:#c5dbd6_#f5f9f9]" tabIndex={0} role="region" aria-label="Disciplinary records table">
          <table className="employee-table discipline-table tw:shared-base:w-full tw:shared-base:border-collapse tw:shared-base:text-left
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
          tw:max-[768px]:shared-base:min-w-[870px] tw:w-full tw:min-w-[800px] tw:table-fixed
          tw:[&_th]:p-[20px_12px] tw:[&_td]:p-[20px_12px] tw:[&_th]:uppercase tw:[&_th]:text-[10px]
          tw:[&_th]:tracking-[.6px] tw:[&_th:first-child]:w-[15%] tw:[&_th:nth-child(2)]:w-[22%]
          tw:[&_th:nth-child(3)]:w-[12%] tw:[&_th:nth-child(4)]:w-[14%] tw:[&_th:nth-child(5)]:w-[15%]
          tw:[&_th:last-child]:w-[64px] tw:[&_td]:whitespace-normal tw:[&_td]:[overflow-wrap:anywhere]
          tw:[&_td]:[color:var(--text-secondary)] tw:[&_td]:leading-[1.6]
          tw:[&_td_strong]:[color:var(--text-primary)] tw:[&_td_strong]:font-[650] tw:[&_td:last-child]:text-center
          tw:[&_th:last-child]:text-center tw:[&_.discipline-date]:whitespace-nowrap
          tw:[&_.discipline-description]:whitespace-pre-wrap" id="discipline-table">
            <caption className="sr-only tw:sr-only">Disciplinary records, newest incident date first</caption>
            <thead><tr>
              <th scope="col">Employee</th><th scope="col">Department</th><th scope="col">Incident<br />date</th>
              <th scope="col">Violation<br />type</th><th scope="col">Sanction<br />action</th><th scope="col">Description</th><th scope="col">Delete</th>
            </tr></thead>
            <tbody>
              {rows.map((record) => <tr key={record.id}>
                <td><strong className="discipline-employee tw:block">{record.employeeName}</strong><span className="discipline-employee-id tw:block tw:[color:var(--text-muted)] tw:text-[11px]">{record.employeeId}</span></td>
                <td>{record.department}</td>
                <td className="discipline-date"><time dateTime={record.incidentDate}>{formatDate(record.incidentDate, { month: '2-digit', day: '2-digit' })}</time></td>
                <td><strong>{record.violationType}</strong></td>
                <td><span className={`discipline-sanction discipline-sanction-${record.penaltyAction.toLowerCase()} tw:inline-block tw:p-[3px_9px] tw:rounded-[20px] tw:text-[10px] tw:leading-[1.5] tw:font-bold tw:uppercase
          tw:tracking-[.2px] tw:whitespace-nowrap tw:[&.discipline-sanction-warning]:[color:#936000]
          tw:[&.discipline-sanction-warning]:[background:#fff1d8] tw:[&.discipline-sanction-fine]:[color:#8d5700]
          tw:[&.discipline-sanction-fine]:[background:#fff5bf]
          tw:[&.discipline-sanction-suspension]:[color:#9b3c15]
          tw:[&.discipline-sanction-suspension]:[background:#ffeadf]
          tw:[&.discipline-sanction-termination]:[color:#b42344]
          tw:[&.discipline-sanction-termination]:[background:#ffe8ee] `}>{record.sanctionLabel}</span></td>
                <td className="discipline-description">{record.description || '—'}</td>
                <td><IconButton variant="muted-delete" type="button"
                  aria-label={`Delete ${record.violationType} for ${record.employeeName} (${record.employeeId})`}
                  onClick={() => { setRemoving(record); setDeleteError('') }}><Icon name="trash" size={18} /></IconButton></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        {!rows.length && <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]">
          <Icon name="shield" size={32} />
          <h3>{search.trim() ? 'No matching disciplinary records' : 'No disciplinary records'}</h3>
          <p>{search.trim() ? 'Try another employee, department, violation, or sanction.' : 'Recorded disciplinary actions will appear here.'}</p>
          <Button variant="secondary" type="button" onClick={() => search.trim() ? onSearch('') : setRecording(true)}>
            {search.trim() ? 'Clear search' : 'Record Disciplinary Action'}
          </Button>
        </div>}
      </Card>
      <div className="discipline-history-action tw:flex tw:justify-end tw:mt-[14px] tw:[&_.button]:text-[12px]"><Button variant="secondary" type="button" onClick={() => setShowHistory(true)}>
        <Icon name="clock" size={16} /> Activity History{data.history.length > 0 ? ` (${data.history.length})` : ''}
      </Button></div>
      {recording && <RecordDisciplinaryActionModal employees={employees} onSave={onSave} onClose={closeForm} onDirtyChange={onDirtyChange} />}
      {removing && <ConfirmationModal title="Delete disciplinary record?" destructive confirmLabel="Delete Record"
        onCancel={() => setRemoving(null)} onConfirm={confirmDelete}>
        <p>Delete <strong>{removing.violationType}</strong> for <strong>{removing.employeeName}</strong> ({removing.employeeId})? The record will be removed from this list; its deletion will remain in activity history.</p>
        {deleteError && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{deleteError}</p>}
      </ConfirmationModal>}
      {showHistory && <DisciplineHistoryModal history={data.history} onClose={() => setShowHistory(false)} />}
    </div>
  )
}
