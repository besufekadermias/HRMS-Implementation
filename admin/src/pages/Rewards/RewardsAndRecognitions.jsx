import Card from '../../components/common/Card.jsx'
import Button, { IconButton } from '../../components/common/Button.jsx'
import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import GrantRecognitionModal from '../../components/rewards/GrantRecognitionModal.jsx'
import { rewardRows } from '../../services/growth/rewardService.js'
import formatDate from '../../utils/formatters/formatDate.js'

export default function RewardsAndRecognitions({ rewards, employees, search, onSearch, onSave, onDelete, onDirtyChange }) {
  const [granting, setGranting] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const rows = rewardRows(rewards, employees, search)

  function closeForm() {
    setGranting(false)
    onDirtyChange(false)
  }
  function confirmDelete() {
    try {
      onDelete(removing.id)
      setRemoving(null)
      setDeleteError('')
    } catch (error) {
      setDeleteError(error.message || 'The recognition could not be deleted.')
    }
  }

  return (
    <div className="rewards-page tw:[&_.employee-page-heading]:flex-wrap tw:[&_.rewards-heading-icon]:[background:#fff3d3]
           tw:[&_.rewards-heading-icon]:[color:#ad7615] tw:[&_.employee-page-heading_>_.button_svg]:[color:#f5d37a]
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
        <span className="icon-circle directory-heading-icon rewards-heading-icon tw:shared-base:w-[46px] tw:shared-base:h-[46px]
          tw:shared-base:shrink-0 tw:shared-base:rounded-[50%] tw:shared-base:inline-flex
          tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:w-[49px] tw:shared-base:h-[49px]
          tw:shared-base:[background:#d8f8ee] tw:shared-base:[color:#05695c]"><Icon name="award" size={27} /></span>
        <div>
          <h1>Rewards &amp; Recognitions</h1>
          <p>Institutional honors (Excellence, Innovation, Long Service, Punctuality) for outstanding IT staff.</p>
        </div>
        <Button type="button" onClick={() => setGranting(true)}>
          <Icon name="plus" size={18} /> Grant Staff Recognition
        </Button>
      </div>
      {search.trim() && <div className="rewards-search-result tw:flex tw:items-center tw:justify-between tw:gap-[12px] tw:mb-[15px]
          tw:[color:var(--text-secondary)] tw:[@media(width<=700px)]:items-start" role="status">
        <span>{rows.length} recognition{rows.length === 1 ? '' : 's'} matching “{search}”</span>
        <Button variant="secondary" type="button" onClick={() => onSearch('')}>Clear search</Button>
      </div>}
      <Card className="rewards-card tw:p-[0] tw:overflow-hidden tw:[&_.empty-state]:p-[48px_20px]
          tw:[&_.empty-state_>_svg]:[color:#ad7615]" aria-label="Staff recognitions">
        <div className="table-scroll tw:shared-base:overflow-x-auto tw:shared-base:[scrollbar-width:thin]
          tw:shared-base:[scrollbar-color:#c5dbd6_#f5f9f9]" tabIndex={0} role="region" aria-label="Recognition table">
          <table className="employee-table rewards-table tw:shared-base:w-full tw:shared-base:border-collapse tw:shared-base:text-left
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
          tw:[&_th]:tracking-[.6px] tw:[&_th:first-child]:w-[17%] tw:[&_th:nth-child(2)]:w-[22%]
          tw:[&_th:nth-child(3)]:w-[14%] tw:[&_th:nth-child(4)]:w-[15%] tw:[&_th:nth-child(5)]:w-[12%]
          tw:[&_th:last-child]:w-[64px] tw:[&_td]:whitespace-normal tw:[&_td]:[overflow-wrap:anywhere]
          tw:[&_td]:[color:var(--text-secondary)] tw:[&_td]:leading-[1.6]
          tw:[&_td_strong]:[color:var(--text-primary)] tw:[&_td_strong]:font-[650] tw:[&_td:last-child]:text-center
          tw:[&_th:last-child]:text-center tw:[&_.recognition-date]:whitespace-nowrap" id="rewards-table">
            <caption className="sr-only tw:sr-only">Staff awards and recognitions, newest award date first</caption>
            <thead><tr>
              <th scope="col">Employee</th><th scope="col">Department</th><th scope="col">Award title</th>
              <th scope="col">Category</th><th scope="col">Award date</th><th scope="col">Description</th><th scope="col">Delete</th>
            </tr></thead>
            <tbody>
              {rows.map((reward) => <tr key={reward.id}>
                <td><strong className="recognition-employee tw:block">{reward.employeeName}</strong><span className="recognition-employee-id tw:block tw:[color:var(--text-muted)] tw:text-[11px]">{reward.employeeId}</span></td>
                <td>{reward.department}</td>
                <td><strong>{reward.title}</strong></td>
                <td><span className={String.raw`recognition-category recognition-category-${reward.category.toLowerCase()} tw:inline-block tw:p-[3px_10px] tw:rounded-[20px] tw:text-[10px] tw:leading-[1.5] tw:font-bold tw:uppercase
          tw:tracking-[.2px] tw:whitespace-nowrap tw:[&.recognition-category-excellence]:[color:#076755]
          tw:[&.recognition-category-excellence]:[background:#e0f5ed]
          tw:[&.recognition-category-innovation]:[color:#8d5700]
          tw:[&.recognition-category-innovation]:[background:#fff5bf]
          tw:[&.recognition-category-long\_service]:[color:#6d45a3]
          tw:[&.recognition-category-long\_service]:[background:#f0e8fb]
          tw:[&.recognition-category-punctuality]:[color:#225e9a]
          tw:[&.recognition-category-punctuality]:[background:#e5f1fc] `}>{reward.categoryLabel}</span></td>
                <td className="recognition-date"><time dateTime={reward.awardDate}>{formatDate(reward.awardDate, { month: '2-digit', day: '2-digit' })}</time></td>
                <td className="recognition-description tw:whitespace-pre-wrap!">{reward.description || '—'}</td>
                <td><IconButton variant="muted-delete" type="button"
                  aria-label={`Delete ${reward.title} for ${reward.employeeName} (${reward.employeeId})`}
                  onClick={() => { setRemoving(reward); setDeleteError('') }}><Icon name="trash" size={18} /></IconButton></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        {!rows.length && <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]">
          <Icon name="award" size={32} />
          <h3>{search.trim() ? 'No matching recognitions' : 'No recognitions yet'}</h3>
          <p>{search.trim() ? 'Try another employee, award title, department, or category.' : 'Celebrate a staff member’s contribution with their first award.'}</p>
          <Button variant="secondary" type="button" onClick={() => search.trim() ? onSearch('') : setGranting(true)}>
            {search.trim() ? 'Clear search' : 'Grant Staff Recognition'}
          </Button>
        </div>}
      </Card>
      {granting && <GrantRecognitionModal employees={employees} onSave={onSave} onClose={closeForm} onDirtyChange={onDirtyChange} />}
      {removing && <ConfirmationModal title="Delete recognition?" destructive confirmLabel="Delete Recognition"
        onCancel={() => setRemoving(null)} onConfirm={confirmDelete}>
        <p>Delete <strong>{removing.title}</strong> for <strong>{removing.employeeName}</strong> ({removing.employeeId})? This cannot be undone.</p>
        {deleteError && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{deleteError}</p>}
      </ConfirmationModal>}
    </div>
  )
}
