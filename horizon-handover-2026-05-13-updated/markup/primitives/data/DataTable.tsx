import { useMemo, useState, type ReactNode } from 'react';
import { nextSortState, type SortState } from './dataTableSort';

export type RowTone = 'fail' | 'warn' | 'pass' | 'info' | 'neutral';

export interface Column<T> {
  /** Stable column id — used for sort state + the col testid. */
  id: string;
  /** Header content. Either a string or a custom node. */
  header: ReactNode;
  /** Cell renderer. Pure projection from row → ReactNode. */
  cell: (row: T) => ReactNode;
  /** Text alignment. Default 'left'. */
  align?: 'left' | 'right' | 'center';
  /** CSS width, e.g. '6rem' or '15%'. Default auto. */
  width?: string;
  /** Marks the column sortable. If `sort` is omitted, falls back to a
   *  string-coerce comparator on `cell(row)` text content. */
  sortable?: boolean;
  /** Custom comparator. Implies `sortable: true`. */
  sort?: (a: T, b: T) => number;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  /** Stable row key. */
  rowKey: (row: T) => string;
  /** Optional click handler — turns the row into a button-shaped tr. */
  onRowClick?: (row: T) => void;
  /** Per-row tone for severity-tinted rows. FAIL rows get a faint red
   *  wash, WARN amber, etc. — colour as information. */
  rowTone?: (row: T) => RowTone;
  /** Empty-state slot. Defaults to "No rows." */
  emptyState?: ReactNode;
  /** Test ID. Defaults to 'data-table'. */
  testId?: string;
  /**
   * When provided, sort state is owned by the parent (controlled mode).
   * The internal sort comparator is bypassed — rows render in the order
   * they arrive — and header clicks fire `onSortChange` instead of
   * mutating internal state. Use this when sorting happens server-side
   * (e.g. a paged blotter or a query that goes back to SQL).
   * Header chevrons still render based on this value.
   */
  sort?: SortState;
  /** Required when `sort` is provided. */
  onSortChange?: (next: SortState) => void;
}

/* Row tone → faint background tint. The whole point of this is to make
   FAIL/WARN rows scannable without reading every label. Keep the alpha
   low (5%) so the table doesn't feel loud — the pill is the loud part. */
const ROW_TONE_CLASS: Record<RowTone, string> = {
  fail:    'bg-rag-red/5',
  warn:    'bg-rag-amber/5',
  pass:    'bg-rag-green/5',
  info:    'bg-rag-info/5',
  neutral: '',
};

const ALIGN_CLASS = {
  left:   'text-left',
  right:  'text-right',
  center: 'text-center',
} as const;

/**
 * `DataTable` — small-list status table. Hand-rolled HTML `<table>` styled
 * with horizon tokens; sortable headers, optional row-tone tinting, click
 * handler. For high-row-count blotters use AG Grid directly — this is for
 * 20–200 row status tables (Integrity Checks, Data Quality, Environment).
 *
 * `Column<T>` is discriminated by id; cells are pure projections from row
 * → ReactNode. The sort cycle (asc → desc → unsorted) is internal state;
 * complex backend-paged tables wrap their own controlled-sort variant.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  rowTone,
  emptyState,
  testId = 'data-table',
  sort: controlledSort,
  onSortChange,
}: Props<T>) {
  const [internalSort, setInternalSort] = useState<SortState>(null);
  const isControlled = controlledSort !== undefined;
  const sortState = isControlled ? controlledSort : internalSort;

  const sorted = useMemo(() => {
    // Controlled mode: rows arrive pre-sorted from the data source.
    if (isControlled) return rows;
    if (!sortState) return rows;
    const col = columns.find((c) => c.id === sortState.key);
    if (!col?.sort) return rows;
    const out = [...rows].sort(col.sort);
    return sortState.dir === 'desc' ? out.reverse() : out;
  }, [rows, columns, sortState, isControlled]);

  const handleHeaderClick = (col: Column<T>) => {
    if (!col.sortable && !col.sort) return;
    const next = nextSortState(sortState, col.id);
    if (isControlled) {
      onSortChange?.(next);
    } else {
      setInternalSort(next);
    }
  };

  if (rows.length === 0) {
    return (
      <div
        data-testid={`${testId}-empty`}
        className="bg-card border border-border rounded-md p-6 text-center text-sm text-muted-foreground"
      >
        {emptyState ?? 'No rows.'}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <table
        data-testid={testId}
        className="w-full border-separate border-spacing-0"
      >
        <thead data-testid={`${testId}-header`}>
          <tr>
            {columns.map((col) => {
              const isSorted = sortState?.key === col.id;
              const isSortable = !!(col.sortable || col.sort);
              return (
                <th
                  key={col.id}
                  data-testid={`${testId}-col-${col.id}`}
                  data-sorted={isSorted ? sortState!.dir : undefined}
                  className={`font-semibold uppercase border-b border-border bg-card sticky top-0 z-10 ${ALIGN_CLASS[col.align ?? 'left']} ${isSortable ? 'cursor-pointer select-none hover:text-foreground' : ''}`}
                  style={{ width: col.width, padding: '2px 8px', fontSize: '8px', letterSpacing: '0.05em', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}
                  onClick={isSortable ? () => handleHeaderClick(col) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {isSorted && (
                      <span className="text-fg-tertiary" aria-hidden>
                        {sortState!.dir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const tone = rowTone?.(row) ?? 'neutral';
            return (
              <tr
                key={rowKey(row)}
                data-testid={`${testId}-row`}
                data-row-tone={tone}
                className={`${ROW_TONE_CLASS[tone]} hover:bg-[var(--hover)] ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`border-b border-border-subtle ${ALIGN_CLASS[col.align ?? 'left']}`}
                    style={{ padding: '2px 8px', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)', height: 'var(--density-row-height)' }}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
