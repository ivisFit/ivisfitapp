import "./Pagination.css";

interface PaginationProps {
  page: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({
  page,
  totalItems,
  pageSize = 10,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Paginación">
      <p className="pagination__info">
        Mostrando {from}–{to} de {totalItems}
      </p>
      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage <= 1}
        >
          Anterior
        </button>
        <span className="pagination__page">
          Página {currentPage} de {totalPages}
        </span>
        <button
          type="button"
          className="pagination__button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage >= totalPages}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
