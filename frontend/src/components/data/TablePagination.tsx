interface TablePaginationProps {
  page: number;
  size: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({ page, size, total, onPageChange }: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / size));
  const from = total === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(page * size, total);

  return (
    <div className="table-pagination-row">
      <span>
        Showing {from}-{to} of {total}
      </span>
      <div className="table-pagination-actions">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} type="button">
          Previous
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} type="button">
          Next
        </button>
      </div>
    </div>
  );
}
