import { RefreshCw } from 'lucide-react'

export default function DepartmentPage({ title, description, resource, header, children }) {
  return <div className="space-y-6 pb-6">
    {header || <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Department workspace</p>
        <h1 className="text-[30px] font-bold leading-tight tracking-[-0.6px] max-sm:text-[25px]">{title}</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">{description}</p>
        {resource.data && <p className="mt-2 text-[12px] font-semibold text-primary">{resource.data.department.name}</p>}
      </div>
      <button type="button" onClick={resource.refresh} disabled={resource.loading || resource.refreshDisabled}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-[12px] font-semibold text-primary hover:bg-page disabled:opacity-50">
        <RefreshCw size={15} /> {resource.loading ? 'Refreshing…' : 'Refresh'}
      </button>
    </div>}
    {resource.error && <p role="alert" className="rounded-lg border border-[#f0d3dc] bg-[#fff0f3] p-4 text-[13px] text-[#b42344]">{resource.error}</p>}
    {!resource.data && !resource.error && <p role="status" className="rounded-xl border border-border bg-white p-6 text-[13px]">Loading department records…</p>}
    {resource.data && children}
  </div>
}
