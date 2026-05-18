import type { ReactNode } from 'react';
import { Children, isValidElement } from 'react';

interface Props {
  /** KpiCell children. The strip auto-paints hairline separators between
   *  them and rounds the outer container. */
  children: ReactNode;
  /** Number of columns at the lg breakpoint. Defaults to the child count
   *  (clamped 1..6). */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * KPI strip — single rounded outer container wrapping a row of `KpiCell`s
 * separated by 1px hairlines. No per-cell chrome; cells are flat. Reads
 * as one dense bar at the top of a page.
 *
 * Stacks responsively: 1 column on mobile, 2 at sm, then `columns` at lg.
 */
const COLUMNS_CLASS: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
};

export function KpiStrip({ children, columns }: Props) {
  const childArray = Children.toArray(children).filter(isValidElement);
  const colCount = (columns ?? Math.min(Math.max(childArray.length, 1), 6)) as 1 | 2 | 3 | 4 | 5 | 6;

  return (
    <div
      data-testid="kpi-strip"
      data-columns={colCount}
      className={`bg-card border border-border rounded-md overflow-hidden grid grid-cols-1 sm:grid-cols-2 ${COLUMNS_CLASS[colCount]}`}
    >
      {childArray.map((child, i) => (
        <div
          key={i}
          data-testid="kpi-strip-cell"
          className={`min-w-0 ${i < childArray.length - 1 ? 'border-r border-border-subtle' : ''}`}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
