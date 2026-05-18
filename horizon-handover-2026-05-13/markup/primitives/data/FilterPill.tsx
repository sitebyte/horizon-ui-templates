import type { ReactNode } from 'react';

export type FilterPillTone = 'pass' | 'warn' | 'fail' | 'info' | 'neutral';

interface Props {
  /** Pill label — typically uppercase, short. */
  label: string;
  /** Optional count rendered after the label (e.g. "ACTIVE 24"). */
  count?: number;
  /** Active state — saturated colouring. Inactive pills sit subtle until clicked. */
  active?: boolean;
  /** Tone of the pill. Drives colour both active and inactive. */
  tone?: FilterPillTone;
  /** Optional leading icon. */
  icon?: ReactNode;
  onClick?: () => void;
}

/* Active = solid bg + white text. Inactive = 10% bg tint + tone text.
   The active variant carries clear informational signal; inactive looks
   like a chip. */
const ACTIVE_CLASS: Record<FilterPillTone, string> = {
  pass:    'bg-rag-green text-white',
  warn:    'bg-rag-amber text-white',
  fail:    'bg-rag-red text-white',
  info:    'bg-rag-info text-white',
  neutral: 'bg-fg-tertiary text-white',
};

const INACTIVE_CLASS: Record<FilterPillTone, string> = {
  pass:    'bg-rag-green/10 text-rag-green hover:bg-rag-green/20',
  warn:    'bg-rag-amber/10 text-rag-amber hover:bg-rag-amber/20',
  fail:    'bg-rag-red/10 text-rag-red hover:bg-rag-red/20',
  info:    'bg-rag-info/10 text-rag-info hover:bg-rag-info/20',
  neutral: 'bg-muted text-muted-foreground hover:bg-muted/70',
};

/**
 * `FilterPill` — clickable count-bearing badge. Use as a row of filter
 * chips above a `DataTable` ("All / FAIL 3 / WARN 2 / PASS 12 / STALE 4").
 * `active` toggles the saturated variant.
 *
 * Renders as `<button>` when onClick is set, `<span>` otherwise.
 */
export function FilterPill({ label, count, active, tone = 'neutral', icon, onClick }: Props) {
  const classes = [
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider transition-colors',
    onClick ? 'cursor-pointer' : '',
    active ? ACTIVE_CLASS[tone] : INACTIVE_CLASS[tone],
  ].filter(Boolean).join(' ');

  const inner = (
    <>
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span data-testid="filter-pill-count" className="opacity-80 tabular-nums">
          {count}
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        data-testid="filter-pill"
        data-active={active}
        data-tone={tone}
        onClick={onClick}
        className={classes}
      >
        {inner}
      </button>
    );
  }

  return (
    <span
      data-testid="filter-pill"
      data-active={active}
      data-tone={tone}
      className={classes}
    >
      {inner}
    </span>
  );
}
