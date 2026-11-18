import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx'
import AnnouncementsTable from '../../components/announcements/AnnouncementsTable.jsx'
import { announcementRows } from '../../services/communications/announcementService.js'

export default function Announcements({ announcements, search, onSearch, onPost, onDelete }) {
  const [removing, setRemoving] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const rows = announcementRows(announcements, search)

  function confirmDelete() {
    try {
      onDelete(removing.id)
      setRemoving(null)
      setDeleteError('')
    } catch (error) {
      setDeleteError(error.message || 'The announcement could not be deleted.')
    }
  }

  return <div className="announcements-page tw:[&_.employee-page-heading]:flex-wrap tw:[&_.announcements-heading-icon]:[color:#ad7615]
          tw:[&_.announcements-heading-icon]:[background:#fff3d3]
          tw:[&_.employee-page-heading_>_.button_svg]:[color:#f5d37a]
          tw:[@media(width<=700px)]:[&_.employee-page-heading_>_.button]:ml-[62px]
          tw:[@media(width<=420px)]:[&_.employee-page-heading_>_.button]:w-full
          tw:[@media(width<=420px)]:[&_.employee-page-heading_>_.button]:ml-[0]">
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
      <span className="icon-circle directory-heading-icon announcements-heading-icon tw:shared-base:w-[46px] tw:shared-base:h-[46px]
          tw:shared-base:shrink-0 tw:shared-base:rounded-[50%] tw:shared-base:inline-flex
          tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:w-[49px] tw:shared-base:h-[49px]
          tw:shared-base:[background:#d8f8ee] tw:shared-base:[color:#05695c]"><Icon name="megaphone" size={27} /></span>
      <div><h1>Department Announcements</h1><p>Manage notices for the public website and employee dashboard.</p></div>
      <Button type="button" onClick={onPost}><Icon name="plus" size={18} />Post New Announcement</Button>
    </div>
    {search.trim() && <div className="announcements-search-result tw:flex tw:items-center tw:justify-between tw:gap-[12px] tw:mb-[16px]
          tw:[color:var(--text-secondary)] tw:[@media(width<=420px)]:items-start" role="status">
      <span>{rows.length} announcement{rows.length === 1 ? '' : 's'} matching “{search}”</span>
      <Button variant="secondary" type="button" onClick={() => onSearch('')}>Clear search</Button>
    </div>}
    <Card className="announcements-card tw:p-[0] tw:overflow-hidden" aria-label="Department announcements">
      <AnnouncementsTable announcements={rows} onDelete={(announcement) => { setRemoving(announcement); setDeleteError('') }} />
      {!rows.length && <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]"><Icon name="megaphone" size={32} />
        <h3>{search.trim() ? 'No matching announcements' : 'No announcements yet'}</h3>
        <p>{search.trim() ? 'Try another title, message, author, or audience.' : 'Post your first notice to keep your audience informed.'}</p>
        <Button variant="secondary" type="button" onClick={() => search.trim() ? onSearch('') : onPost()}>
          {search.trim() ? 'Clear search' : 'Post New Announcement'}
        </Button>
      </div>}
    </Card>
    {removing && <ConfirmationModal title="Delete announcement?" confirmLabel="Delete Announcement" destructive
      onCancel={() => setRemoving(null)} onConfirm={confirmDelete}>
      <p>Delete <strong>{removing.title}</strong>? This will remove the notice from the announcement list.</p>
      {deleteError && <p className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]" role="alert">{deleteError}</p>}
    </ConfirmationModal>}
  </div>
}
