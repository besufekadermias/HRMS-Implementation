export default function DepartmentPagination({ page, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / 10))
  return <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-[12px] text-text-secondary">
    <span>{total} records · Page {page} of {pages}</span>
    <div className="flex gap-2">
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} className="min-h-9 rounded-lg border border-border px-3 hover:bg-page disabled:opacity-40">Previous</button>
      <button type="button" disabled={page === pages} onClick={() => onChange(page + 1)} className="min-h-9 rounded-lg border border-border px-3 hover:bg-page disabled:opacity-40">Next</button>
    </div>
  </div>
}
