import type { ReactNode } from 'react';

interface Props {
  /** Left-aligned slot — typically primary actions ("Run All Checks"). */
  leading?: ReactNode;
  /** Right-aligned slot — filters, exports, secondary actions. */
  trailing?: ReactNode;
  /** Center slot — page title, breadcrumb, or active-filter summary. */
  children?: ReactNode;
}

/**
 * `Toolbar` — horizontal action bar above a body section. Three slots:
 *
 *   <Toolbar
 *     leading={<button>Run All Checks</button>}
 *     trailing={<FilterPill … /><FilterPill … />}
 *   >
 *     <Text role="label">Curve Quality — 4 OK · 2 STALE</Text>
 *   </Toolbar>
 *
 * Owns no chrome of its own; just spacing + alignment. Pair with a
 * Hairline below if visual separation from the body is needed.
 */
export function Toolbar({ leading, trailing, children }: Props) {
  return (
    <div
      data-testid="toolbar"
      className="flex items-center justify-between gap-3 px-1 py-2"
    >
      {leading && (
        <div data-testid="toolbar-leading" className="flex items-center gap-2 shrink-0">
          {leading}
        </div>
      )}
      {children && <div className="flex-1 min-w-0">{children}</div>}
      {trailing && (
        <div data-testid="toolbar-trailing" className="flex items-center gap-2 shrink-0">
          {trailing}
        </div>
      )}
    </div>
  );
}
