import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { StatusPill, type SeverityTone } from './StatusPill';
import { Text } from '../primitives/Text';

/**
 * `null` means "never run" — rendered as a neutral pill (`unrunLabel`,
 * defaults to "—"). Pass / Warn / Fail use the saturated severity pill.
 */
export type CheckRowSeverity = SeverityTone | null;

interface Props {
  severity: CheckRowSeverity;
  /** Replaces the SeverityPill when severity===null. Defaults to "—". */
  unrunLabel?: string;
  /** Bold one-line title (truncated). */
  title: string;
  /** Tertiary one-line sub-detail (truncated). Optional. */
  detail?: string;
  /** Right-side slot — affected-row count, last-run time, etc. */
  trailing?: ReactNode;
  /** Internal route makes the row a Link; URL → external <a>. */
  to?: string;
  /** When set as raw severity (no pill), drop the visual pill entirely. */
  hidePill?: boolean;
  /** Use subtle (tinted bg) pills instead of saturated. For dashboard contexts. */
  subtlePills?: boolean;
}

/**
 * One row in a vertical list of checks (integrity checks, validation
 * rules, SQL guard checks). Severity-pill leading + bold title + optional
 * sub-detail + trailing meta. Hover-tinted when clickable.
 *
 * Sibling of `<ActivityRow>` — that one carries time + actor; this one
 * carries severity + check identity.
 */
const SEVERITY_BG: Record<string, string> = {
  warn: 'bg-[var(--rag-amber-dim)]',
  fail: 'bg-[var(--rag-red-dim)]',
};

export function CheckRow({
  severity,
  unrunLabel = '—',
  title,
  detail,
  trailing,
  to,
  hidePill,
  subtlePills,
}: Props) {
  const severityBg = severity ? SEVERITY_BG[severity] ?? '' : '';
  const body = (
    <div
      data-testid="check-row"
      data-severity={severity ?? 'unrun'}
      className={`flex items-center justify-between gap-3 border-b border-border-subtle last:border-b-0 hover:rounded-sm ${severityBg}`}
      style={{
        paddingBlock: 'var(--density-cell-padding-y)',
        paddingInline: 'var(--density-cell-padding-x)',
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {!hidePill && (severity === null ? <UnrunPill label={unrunLabel} /> : <StatusPill kind="severity" tone={severity} subtle={subtlePills} />)}
          <Text size="xs" tone="secondary" weight={400} truncate>{title}</Text>
        </div>
        {detail && (
          <Text tone="muted" truncate style={{ fontSize: '9px', fontStyle: 'italic' }}>{detail}</Text>
        )}
      </div>
      {trailing && <div className="shrink-0 text-right">{trailing}</div>}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block no-underline hover:bg-[var(--hover)] hover:rounded-sm">
        {body}
      </Link>
    );
  }
  return body;
}

function UnrunPill({ label }: { label: string }) {
  return (
    <span
      data-testid="check-row-unrun-pill"
      className="inline-flex items-center px-2 py-px rounded-sm text-xs font-semibold uppercase tracking-wider font-ui leading-loose bg-fg-tertiary text-white"
    >
      {label}
    </span>
  );
}
