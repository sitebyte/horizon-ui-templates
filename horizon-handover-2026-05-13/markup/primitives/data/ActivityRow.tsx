import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { StatusDot, type StatusDotTone } from './StatusDot';
import { Mono } from '../primitives/Mono';
import { Text } from '../primitives/Text';

interface Props {
  /** Time to display in the leading column. Pre-formatted (HH:MM:SS). */
  time: string;
  /** Primary identity — the actor. Rendered first, primary tone. */
  who: string;
  /** Secondary description — function name, action, etc. Tertiary tone. */
  what?: string;
  /** Trailing status dot (success / fail / unknown). */
  status?: StatusDotTone;
  /** Click target — when set, the whole row becomes a Link. */
  to?: string;
  /** Optional leading slot for an icon or pill. Goes before `time`. */
  leading?: ReactNode;
  /** Optional trailing slot for additional metadata (count, badge). */
  trailing?: ReactNode;
}

/**
 * One row in an `ActivityFeed`. Compact, click-through, scannable.
 * Default shape: `[leading?] [time] [who] [what?] [trailing?] [• status?]`
 *
 * Whole row is a Link when `to` is set; otherwise it's a plain div. Hover
 * tint is identical so the click affordance stays consistent.
 */
export function ActivityRow({
  time,
  who,
  what,
  status,
  to,
  leading,
  trailing,
}: Props) {
  const gridStyle: CSSProperties = {
    gridTemplateColumns: leading ? 'auto 5rem 1fr auto' : '5rem 1fr auto',
  };
  const className =
    'grid items-center gap-x-2 px-3 py-1 no-underline hover:bg-border-subtle';

  const inner = (
    <>
      {leading && <div className="flex">{leading}</div>}
      <Mono size="xs" tone="tertiary">{time}</Mono>
      <span className="min-w-0 flex gap-2 items-baseline">
        <Text size="xs" tone="primary" truncate>{who}</Text>
        {what && (
          <Text size="xs" tone="tertiary" truncate>{what}</Text>
        )}
      </span>
      <span className="flex items-center gap-2">
        {trailing}
        {status && <StatusDot tone={status} size="sm" />}
      </span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        data-testid="activity-row"
        className={`${className} cursor-pointer`}
        style={gridStyle}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div data-testid="activity-row" className={className} style={gridStyle}>
      {inner}
    </div>
  );
}
