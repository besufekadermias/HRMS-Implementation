import Icon from './Icon.jsx'

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'employees',
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const first = Math.max(1, Math.min(page - 2, pages - 4))
  const visiblePages = Array.from(
    { length: Math.min(5, pages) },
    (_, index) => first + index,
  )
  return (
    <div className="directory-pagination">
      <span role="status">
        Showing {total ? (page - 1) * pageSize + 1 : 0}–
        {Math.min(page * pageSize, total)} of {total} {itemLabel}
      </span>
      <div className="pagination-controls">
        <label>
          Rows{' '}
          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {[5, 10, 20].map((size) => (
              <option key={size}>{size}</option>
            ))}
          </select>
        </label>
        <nav aria-label={`${itemLabel} table pages`}>
          <button
            className="page-button"
            aria-label="Previous page"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            <Icon name="arrow-left" size={15} />
          </button>
          {visiblePages.map((number) => (
            <button
              key={number}
              className={`page-button${page === number ? ' current' : ''}`}
              aria-label={`Page ${number}`}
              aria-current={page === number ? 'page' : undefined}
              onClick={() => onPageChange(number)}
            >
              {number}
            </button>
          ))}
          <button
            className="page-button"
            aria-label="Next page"
            disabled={page === pages}
            onClick={() => onPageChange(page + 1)}
          >
            <Icon name="chevron" size={15} />
          </button>
        </nav>
      </div>
    </div>
  )
}
