import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Text } from './Text';

export type AlertRowSeverity = 'fail' | 'warn' | 'info';

interface Props {
  severity: AlertRowSeverity;
  /** Bold title — single-line truncated. */
  title: string;
  /** One-line detail — tertiary, truncated. */
  detail: string;
  /** Click target. Internal route → react-router Link; full URL → external <a target="_blank">. */
  to?: string;
  /** Optional trailing slot (badge, count, secondary timestamp). */
  trailing?: ReactNode;
}

const TINT: Record<AlertRowSeverity, string> = {
  fail: 'bg-[var(--rag-red-dim)]   border-l-2 border-l-rag-red   rounded-sm',
  warn: 'bg-[var(--rag-amber-dim)] border-l-2 border-l-rag-amber rounded-sm',
  info: 'bg-[var(--rag-info-dim)]  border-l-2 border-l-rag-info  rounded-sm',
};

const LABEL_TONE: Record<AlertRowSeverity, 'rag-red' | 'rag-amber' | 'rag-info'> = {
  fail: 'rag-red',
  warn: 'rag-amber',
  info: 'rag-info',
};

/**
 * Severity-tinted alert block with a coloured left border. Both the
 * border colour and the title text colour carry the severity signal —
 * the row screams its severity at a glance.
 *
 * Whole row becomes a `<Link>` (internal) or `<a target="_blank">`
 * (external) when `to` is set. Plain block otherwise.
 */
export function AlertRow({ severity, title, detail, to, trailing }: Props) {
  const body = (
    <div
      data-testid="alert-row"
      data-severity={severity}
      className={`${TINT[severity]} mb-1`}
      style={{
        paddingBlock: 'var(--density-cell-padding-y)',
        paddingInline: 'var(--density-cell-padding-x)',
      }}
    >
      <div className="flex items-baseline gap-2 min-w-0">
        <Text
          size="xs"
          tone={LABEL_TONE[severity]}
          uppercase
          weight={600}
        >
          {severity}
        </Text>
        <Text size="xs" tone={LABEL_TONE[severity]} weight={600} truncate>{title}</Text>
        {trailing && <span className="ml-auto shrink-0">{trailing}</span>}
      </div>
      <Text tone="tertiary" truncate style={{ fontSize: '8px' }}>{detail}</Text>
    </div>
  );

  if (to) {
    if (/^https?:/i.test(to)) {
      return (
        <a
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          className="block no-underline"
        >
          {body}
        </a>
      );
    }
    return (
      <Link to={to} className="block no-underline">
        {body}
      </Link>
    );
  }
  return body;
}
