import Icon from '../common/Icon.jsx'
import formatDate from '../../utils/formatters/formatDate.js'
import { announcementAudienceLabel } from '../../services/communications/announcementService.js'

export default function AnnouncementsTable({ announcements, onDelete }) {
  return <div className="table-scroll" tabIndex={0} role="region" aria-label="Announcements table">
    <table className="employee-table announcements-table" id="announcements-table">
      <caption className="sr-only">Department announcements, newest posting date first</caption>
      <thead><tr>
        <th scope="col">Announcement title</th><th scope="col">Target audience</th>
        <th scope="col">Posted by</th><th scope="col">Date</th><th scope="col">Delete</th>
      </tr></thead>
      <tbody>{announcements.map((announcement) => <tr key={announcement.id}>
        <td><strong>{announcement.title}</strong><p>{announcement.content}</p></td>
        <td><span className={`announcement-audience announcement-audience-${announcement.targetAudience.toLowerCase()}`}>
          {announcementAudienceLabel(announcement.targetAudience)}
        </span></td>
        <td>{announcement.postedBy}</td>
        <td><time dateTime={announcement.date}>{formatDate(announcement.date, { month: '2-digit', day: '2-digit' })}</time></td>
        <td><button type="button" className="icon-button announcement-delete" aria-label={`Delete ${announcement.title}`} onClick={() => onDelete(announcement)}>
          <Icon name="trash" size={18} /></button></td>
      </tr>)}</tbody>
    </table>
  </div>
}
