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

  return <div className="reports-page">
    <div className="employee-page-heading">
      <span className="icon-circle directory-heading-icon reports-heading-icon"><Icon name="bar-chart" size={27} /></span>
      <div><h1>System Reports &amp; Employee Submissions</h1>
        <p>Reports, technical summaries, and inquiries submitted to HR management.</p>
      </div>
    </div>
    <section className="card reports-card" aria-label="System reports and employee submissions">
      <div className="reports-toolbar">
        <span role="status">{rows.length} of {reports.length} report{reports.length === 1 ? '' : 's'}</span>
        <label><span className="sr-only">Report category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-controls="system-reports-table">
            <option value="">All Report Categories</option>
            {REPORT_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        {filtered && <button type="button" className="button button-secondary" onClick={clearFilters}>Clear filters</button>}
      </div>
      <ReportsTable reports={rows} />
      {!rows.length && <div className="empty-state"><Icon name="file" size={32} />
        <h3>{filtered ? 'No matching reports' : 'No reports yet'}</h3>
        <p>{filtered ? 'Try another name, report ID, keyword, or category.' : 'Employee submissions and system reports will appear here when available.'}</p>
      </div>}
    </section>
  </div>
}
