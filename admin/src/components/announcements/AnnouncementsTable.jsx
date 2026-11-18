import { IconButton } from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import formatDate from '../../utils/formatters/formatDate.js'
import { announcementAudienceLabel } from '../../services/communications/announcementService.js'

export default function AnnouncementsTable({ announcements, onDelete }) {
  return <div className="table-scroll tw:shared-base:overflow-x-auto tw:shared-base:[scrollbar-width:thin]
          tw:shared-base:[scrollbar-color:#c5dbd6_#f5f9f9]" tabIndex={0} role="region" aria-label="Announcements table">
    <table className="employee-table announcements-table tw:shared-base:w-full tw:shared-base:border-collapse tw:shared-base:text-left
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
          tw:max-[768px]:shared-base:min-w-[870px] tw:w-full tw:min-w-[760px] tw:table-fixed
          tw:[&_th]:p-[24px_16px] tw:[&_td]:p-[24px_16px] tw:[&_th]:uppercase tw:[&_th]:text-[10px]
          tw:[&_th]:tracking-[.6px] tw:[&_th]:whitespace-normal tw:[&_th:first-child]:w-[50%]
          tw:[&_th:nth-child(2)]:w-[16%] tw:[&_th:nth-child(3)]:w-[10%] tw:[&_th:nth-child(4)]:w-[14%]
          tw:[&_th:last-child]:w-[10%] tw:[&_td]:whitespace-normal tw:[&_td]:[overflow-wrap:anywhere]
          tw:[&_td]:[color:var(--text-secondary)] tw:[&_td]:leading-[1.7] tw:[&_td_strong]:block
          tw:[&_td_strong]:text-[14px] tw:[&_td_strong]:font-[650] tw:[&_td_strong]:[color:var(--text-primary)]
          tw:[&_td_p]:m-[5px_0_0] tw:[&_td_p]:text-[12px] tw:[&_td_p]:whitespace-pre-wrap
          tw:[&_th:last-child]:text-center tw:[&_td:last-child]:text-center" id="announcements-table">
      <caption className="sr-only tw:sr-only">Department announcements, newest posting date first</caption>
      <thead><tr>
        <th scope="col">Announcement title</th><th scope="col">Target audience</th>
        <th scope="col">Posted by</th><th scope="col">Date</th><th scope="col">Delete</th>
      </tr></thead>
      <tbody>{announcements.map((announcement) => <tr key={announcement.id}>
        <td><strong>{announcement.title}</strong><p>{announcement.content}</p></td>
        <td><span className={`announcement-audience announcement-audience-${announcement.targetAudience.toLowerCase()} tw:inline-block tw:rounded-[20px] tw:p-[3px_10px] tw:text-[10px] tw:font-bold tw:leading-[1.5]
          tw:[&.announcement-audience-all]:[color:#087348] tw:[&.announcement-audience-all]:[background:#ddf8e8]
          tw:[&.announcement-audience-employees]:[color:#245a91]
          tw:[&.announcement-audience-employees]:[background:#e3efff]
          tw:[&.announcement-audience-public]:[color:#935a05]
          tw:[&.announcement-audience-public]:[background:#fff4c2] `}>
          {announcementAudienceLabel(announcement.targetAudience)}
        </span></td>
        <td>{announcement.postedBy}</td>
        <td><time dateTime={announcement.date}>{formatDate(announcement.date, { month: '2-digit', day: '2-digit' })}</time></td>
        <td><IconButton variant="muted-delete" type="button" aria-label={`Delete ${announcement.title}`} onClick={() => onDelete(announcement)}>
          <Icon name="trash" size={18} /></IconButton></td>
      </tr>)}</tbody>
    </table>
  </div>
}
