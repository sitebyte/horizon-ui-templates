import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Text } from '../primitives/Text';

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
  fail: 'bg-rag-red/20   border-l-4 border-l-rag-red',
  warn: 'bg-rag-amber/20 border-l-4 border-l-rag-amber',
  info: 'bg-rag-info/20  border-l-4 border-l-rag-info',
};

const LABEL_TONE: Record<AlertRowSeverity, 'rag-red' | 'rag-amber' | 'rag-info'> = {
  fail: 'rag-red',
  warn: 'rag-amber',
  info: 'rag-info',
};

/**
 * Severity-tinted alert block with a coloured left border. The colour IS
 * the signal — text colour stays primary so the title remains readable
 * against the tinted background.
 *
 * Whole row becomes a `<Link>` (internal) or `<a target="_blank">`
 * (external) when `to` is set. Plain block otherwise.
 */
export function AlertRow({ severity, title, detail, to, trailing }: Props) {
  const body = (
    <div
      data-testid="alert-row"
      data-severity={severity}
      className={`px-3 py-1.5 ${TINT[severity]} border-b border-border-subtle last:border-b-0`}
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
        <Text size="xs" tone="primary" weight={600} truncate>{title}</Text>
        {trailing && <span className="ml-auto shrink-0">{trailing}</span>}
      </div>
      <Text size="xs" tone="tertiary" truncate>{detail}</Text>
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
