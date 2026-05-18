import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import { ActivityFeed, ActivityRow } from '../../../../horizon';
import { recentActivityApi } from './api';
import { activitySuccessToTone, formatHms } from '../format';

const REFRESH_MS = 30_000;

interface Props {
  /** How many rows to fetch + render. v41 column 3 caps at 6; the
   *  full /support/audit/actions page is the place for deeper history. */
  limit?: number;
}

/**
 * Right-column "Recent Activity" feed for the Support Dashboard.
 *
 * Pulls the last N t_LOG_Action rows; each row drills into the existing
 * audit detail page. This is audit-as-spine made visible — every glance
 * at the dashboard starts with "what just happened" and one click lands
 * the operator in the right place.
 */
export function RecentActivityFeed({ limit = 50 }: Props = {}) {
  const { currentLegalEntityId } = useAuth();

  const { data, isPending, error } = useQuery({
    queryKey: ['support-recent-activity', currentLegalEntityId, limit],
    queryFn: () => recentActivityApi.list(limit),
    enabled: !!currentLegalEntityId,
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: false,
  });

  const rows = data ?? [];

  return (
    <ActivityFeed
      title="Recent Activity"
      subtitle={`Last ${limit} audit actions · refreshes every 30s`}
      headerAction={
        <Link
          to="/support/audit/actions"
          className="text-xs uppercase tracking-wide text-accent no-underline hover:underline"
        >
          Open Audit →
        </Link>
      }
      isLoading={isPending}
      error={error ? (error as Error).message : null}
      emptyMessage="No actions recorded."
      rowCount={rows.length}
    >
      {rows.map((row) => (
        <ActivityRow
          key={row.actionId}
          time={formatHms(row.actionDate)}
          who={row.personName ?? '—'}
          what={row.functionName ?? undefined}
          status={activitySuccessToTone(row.success)}
          to={`/support/audit/actions/${row.actionId}`}
        />
      ))}
    </ActivityFeed>
  );
}
