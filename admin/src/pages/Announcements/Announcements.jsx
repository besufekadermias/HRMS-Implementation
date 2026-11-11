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

  return <div className="announcements-page">
    <div className="employee-page-heading">
      <span className="icon-circle directory-heading-icon announcements-heading-icon"><Icon name="megaphone" size={27} /></span>
      <div><h1>Department Announcements</h1><p>Manage notices for the public website and employee dashboard.</p></div>
      <button type="button" className="button button-primary" onClick={onPost}><Icon name="plus" size={18} />Post New Announcement</button>
    </div>
    {search.trim() && <div className="announcements-search-result" role="status">
      <span>{rows.length} announcement{rows.length === 1 ? '' : 's'} matching “{search}”</span>
      <button type="button" className="button button-secondary" onClick={() => onSearch('')}>Clear search</button>
    </div>}
    <section className="card announcements-card" aria-label="Department announcements">
      <AnnouncementsTable announcements={rows} onDelete={(announcement) => { setRemoving(announcement); setDeleteError('') }} />
      {!rows.length && <div className="empty-state"><Icon name="megaphone" size={32} />
        <h3>{search.trim() ? 'No matching announcements' : 'No announcements yet'}</h3>
        <p>{search.trim() ? 'Try another title, message, author, or audience.' : 'Post your first notice to keep your audience informed.'}</p>
        <button type="button" className="button button-secondary" onClick={() => search.trim() ? onSearch('') : onPost()}>
          {search.trim() ? 'Clear search' : 'Post New Announcement'}
        </button>
      </div>}
    </section>
    {removing && <ConfirmationModal title="Delete announcement?" confirmLabel="Delete Announcement" destructive
      onCancel={() => setRemoving(null)} onConfirm={confirmDelete}>
      <p>Delete <strong>{removing.title}</strong>? This will remove the notice from the announcement list.</p>
      {deleteError && <p className="form-error" role="alert">{deleteError}</p>}
    </ConfirmationModal>}
  </div>
}
