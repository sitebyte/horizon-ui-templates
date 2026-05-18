import { visiblePageNumbers } from '../pagination';

interface Props {
  page: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

/**
 * v41 audit pagination strip — "Showing N of total — Page X of Y" on the
 * left, page-number buttons on the right with first/prev/next/last and
 * an ellipsis when the run is long. Pure: derives the visible page list
 * from `page` and `totalPages`.
 */
export function AuditPagination({ page, totalCount, pageSize, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const visible = visiblePageNumbers(page, totalPages);

  const showingFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(totalCount, page * pageSize);

  return (
    <div
      data-testid="audit-pagination"
      className="flex items-center justify-between px-6 py-2 text-xs text-text-muted border-t border-border bg-card shrink-0"
    >
      <span data-testid="audit-pagination-summary">
        Showing {showingFrom.toLocaleString()}–{showingTo.toLocaleString()} of{' '}
        {totalCount.toLocaleString()} — Page {page} of {totalPages}
      </span>
      <div className="flex gap-1">
        <PageButton label="«" disabled={page <= 1} onClick={() => onPageChange(1)} testId="audit-pagination-first" />
        <PageButton label="‹" disabled={page <= 1} onClick={() => onPageChange(page - 1)} testId="audit-pagination-prev" />
        {visible.map((p, i) =>
          p === '…' ? (
            <span
              key={`ellipsis-${i}`}
              className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1 text-[0.5625rem] font-mono text-text-tertiary"
            >
              …
            </span>
          ) : (
            <PageButton
              key={p}
              label={String(p)}
              active={p === page}
              onClick={() => onPageChange(p)}
              testId={`audit-pagination-page-${p}`}
            />
          ),
        )}
        <PageButton label="›" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} testId="audit-pagination-next" />
        <PageButton label="»" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)} testId="audit-pagination-last" />
      </div>
    </div>
  );
}

function PageButton({
  label,
  onClick,
  disabled = false,
  active = false,
  testId,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  testId: string;
}) {
  const base = 'inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1 text-[0.5625rem] font-mono rounded-sm border transition-colors';
  const cls = active
    ? `${base} bg-accent text-text-inverse border-accent`
    : disabled
      ? `${base} border-border text-text-tertiary opacity-40 cursor-default`
      : `${base} border-border text-text-tertiary hover:text-accent hover:border-accent cursor-pointer`;

  return (
    <button
      type="button"
      data-testid={testId}
      data-active={active || undefined}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={cls}
    >
      {label}
    </button>
  );
}

