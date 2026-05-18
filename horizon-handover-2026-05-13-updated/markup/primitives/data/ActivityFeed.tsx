import type { ReactNode } from 'react';
import { Hairline } from '../primitives/Hairline';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';

interface Props {
  /** Title shown in the feed header. */
  title: string;
  /** Optional second line under the title. */
  subtitle?: string;
  /** Right-aligned action slot in the header (e.g. "Open audit →"). */
  headerAction?: ReactNode;
  /** Loading state — typically combined with empty list. */
  isLoading?: boolean;
  /** Error to display below the header. */
  error?: string | null;
  /** Empty-state message when there are no rows and no error. */
  emptyMessage?: string;
  /** ActivityRow children. */
  children?: ReactNode;
  /** Total visible-row count for status; used to show empty state when 0. */
  rowCount?: number;
}

/**
 * Container for a stream of `ActivityRow`s — header + scrollable body.
 * Card-shaped chrome (matches Tile) so it composes alongside Tile in a
 * page grid.
 *
 * Owns the empty / loading / error rendering so consumers don't repeat
 * the same boilerplate. Renders a Hairline between the header and body
 * for visual separation.
 */
export function ActivityFeed({
  title,
  subtitle,
  headerAction,
  isLoading,
  error,
  emptyMessage = 'No recent activity.',
  children,
  rowCount,
}: Props) {
  const isEmpty = (rowCount ?? 0) === 0;

  return (
    <div
      data-testid="activity-feed"
      className="bg-card border border-border rounded-md flex flex-col h-full overflow-hidden"
    >
      <header className="flex items-start justify-between gap-3 px-3 pt-3 pb-2">
        <Stack gap={1}>
          <Text role="label" size="xs" tone="tertiary" uppercase weight={600}>{title}</Text>
          {subtitle && <Text size="xs" tone="tertiary">{subtitle}</Text>}
        </Stack>
        {headerAction && <div>{headerAction}</div>}
      </header>
      <Hairline tone="subtle" />
      <div
        data-testid="activity-feed-body"
        className="flex-1 overflow-y-auto min-h-0"
      >
        {error && (
          <p className="px-3 py-3 m-0 text-xs text-rag-red">{error}</p>
        )}
        {isLoading && isEmpty && (
          <p className="px-3 py-3 m-0 text-xs text-muted-foreground">Loading…</p>
        )}
        {!isLoading && isEmpty && !error && (
          <p className="px-3 py-3 m-0 text-xs text-muted-foreground">{emptyMessage}</p>
        )}
        {children}
      </div>
    </div>
  );
}
