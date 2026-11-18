import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import { useState } from 'react'
import Icon from '../../components/common/Icon.jsx'
import ReportsTable from '../../components/reports/ReportsTable.jsx'
import { REPORT_CATEGORIES, reportRows } from '../../services/communications/reportService.js'

export default function Reports({ reports, search, onSearch }) {
  const [category, setCategory] = useState('')
  const rows = reportRows(reports, search, category)
  const filtered = !!(search.trim() || category)

  function clearFilters() {
    onSearch('')
    setCategory('')
  }

  return <div className="reports-page tw:[&_.employee-page-heading]:items-start tw:[&_.reports-heading-icon]:[color:#245a91]
          tw:[&_.reports-heading-icon]:[background:#e3efff] tw:[&_.reports-heading-icon]:shrink-0
          tw:[@media(width<=600px)]:[&_.employee-page-heading_h1]:text-[23px]">
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
      <span className="icon-circle directory-heading-icon reports-heading-icon tw:shared-base:w-[46px] tw:shared-base:h-[46px]
          tw:shared-base:shrink-0 tw:shared-base:rounded-[50%] tw:shared-base:inline-flex
          tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:w-[49px] tw:shared-base:h-[49px]
          tw:shared-base:[background:#d8f8ee] tw:shared-base:[color:#05695c]"><Icon name="bar-chart" size={27} /></span>
      <div><h1>System Reports &amp; Employee Submissions</h1>
        <p>Reports, technical summaries, and inquiries submitted to HR management.</p>
      </div>
    </div>
    <Card className="reports-card tw:p-[0] tw:overflow-hidden tw:[&_.empty-state]:p-[48px_20px]" aria-label="System reports and employee submissions">
      <div className="reports-toolbar tw:flex tw:items-center tw:flex-wrap tw:gap-[12px] tw:p-[16px_20px]
          tw:[border-bottom:1px_solid_var(--border)] tw:[&_>_span]:flex-1 tw:[&_>_span]:min-w-[95px]
          tw:[&_>_span]:[color:var(--text-muted)] tw:[&_>_span]:text-[12px] tw:[&_select]:min-h-[38px]
          tw:[&_select]:max-w-[100%] tw:[&_select]:p-[8px_12px] tw:[&_select]:[font:inherit]
          tw:[&_select]:text-[12px] tw:[&_select]:[color:var(--text-secondary)]
          tw:[&_select]:[border:1px_solid_var(--border)] tw:[&_select]:rounded-[7px]
          tw:[&_select]:[background:var(--surface)] tw:[&_.button]:min-h-[38px] tw:[&_.button]:p-[8px_12px]
          tw:[&_.button]:text-[12px] tw:[@media(width<=600px)]:items-stretch
          tw:[@media(width<=600px)]:[&_>_span]:[flex-basis:100%]
          tw:[@media(width<=600px)]:[&_>_label]:flex-1 tw:[@media(width<=600px)]:[&_>_label]:min-w-0
          tw:[@media(width<=600px)]:[&_select]:w-full">
        <span role="status">{rows.length} of {reports.length} report{reports.length === 1 ? '' : 's'}</span>
        <label><span className="sr-only tw:sr-only">Report category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-controls="system-reports-table">
            <option value="">All Report Categories</option>
            {REPORT_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        {filtered && <Button variant="secondary" type="button" onClick={clearFilters}>Clear filters</Button>}
      </div>
      <ReportsTable reports={rows} />
      {!rows.length && <div className="empty-state tw:shared-base:flex tw:shared-base:items-center tw:shared-base:justify-center tw:shared-base:flex-col
          tw:shared-base:gap-[13px] tw:shared-base:p-[35px_20px] tw:shared-base:text-center
          tw:shared-base:[color:var(--text-muted)] tw:shared-base:[&_h3]:text-[17px]
          tw:shared-base:[&_h3]:[color:var(--text-primary)] tw:shared-base:[&_p]:text-[13px]
          tw:shared-base:[&_p]:max-w-[470px] tw:shared-base:[&_p]:leading-[1.8]"><Icon name="file" size={32} />
        <h3>{filtered ? 'No matching reports' : 'No reports yet'}</h3>
        <p>{filtered ? 'Try another name, report ID, keyword, or category.' : 'Employee submissions and system reports will appear here when available.'}</p>
      </div>}
    </Card>
  </div>
}
