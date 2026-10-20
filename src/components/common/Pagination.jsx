import { useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function Pagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(totalPages);
    }
  }, [currentPage, totalPages, onPageChange]);

  if (totalItems === 0) return null;

  const getVisiblePages = () => {
    const pages = [];
    const first = Math.max(1, currentPage - 2);
    const last = Math.min(totalPages, currentPage + 2);

    for (let page = first; page <= last; page += 1) {
      pages.push(page);
    }

    return pages;
  };

  return (
    <div className="pagination">
      <div className="pagination-info">
        Hiển thị{" "}
        <strong>
          {start}–{end}
        </strong>{" "}
        trong <strong>{totalItems}</strong> bản ghi
      </div>

      <div className="pagination-controls">
        <label className="pagination-size">
          <span>Dòng/trang</span>
          <select
            value={pageSize}
            onChange={(event) => {
              onPageSizeChange(Number(event.target.value));
              onPageChange(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>

        <div className="pagination-buttons">
          <button
            type="button"
            className="pagination-button"
            title="Trang đầu"
            aria-label="Trang đầu"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            type="button"
            className="pagination-button"
            title="Trang trước"
            aria-label="Trang trước"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>

          {getVisiblePages().map((page) => (
            <button
              type="button"
              key={page}
              className={`pagination-button ${
                page === currentPage ? "active" : ""
              }`}
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            className="pagination-button"
            title="Trang sau"
            aria-label="Trang sau"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className="pagination-button"
            title="Trang cuối"
            aria-label="Trang cuối"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
