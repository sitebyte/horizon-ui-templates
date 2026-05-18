import { useQuery } from '@tanstack/react-query';
import { systemApi } from '../../../../api/system';
import { dbLabel } from '../format';

interface Props {
  /** Number of tiles known to the dashboard. */
  tileCount: number;
  /** How many of those are healthy (any non-Red, non-SchemaUnknown status). */
  healthyTileCount: number;
  /** Last-refreshed string already formatted for display. */
  lastRefresh?: string | null;
}

/**
 * Always-on situational awareness at the bottom of the Support Dashboard.
 * Names the connected database and server (no env hardcoding — pulled from
 * /api/system/info) plus the tile health summary.
 */
export function DashboardStatusBar({ tileCount, healthyTileCount, lastRefresh }: Props) {
  const { data, isPending } = useQuery({
    queryKey: ['system', 'info'],
    queryFn: () => systemApi.info(),
    staleTime: Infinity,
  });

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 text-[10px] font-mono tabular-nums border-t border-border-subtle bg-card text-muted-foreground"
      data-testid="dashboard-status-bar"
    >
      <span className="flex items-center gap-2">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-rag-green"
          aria-hidden
        />
        Connected to{' '}
        <span className="text-foreground" data-testid="status-bar-db">
          {dbLabel(data, isPending)}
        </span>
      </span>

      <span data-testid="status-bar-tiles">
        {healthyTileCount}/{tileCount} tiles healthy
      </span>

      {lastRefresh && (
        <span data-testid="status-bar-refresh">Last refresh {lastRefresh}</span>
      )}
    </div>
  );
}
