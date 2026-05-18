import { useQuery } from '@tanstack/react-query';
import { KpiCell, KpiStrip as HorizonKpiStrip } from '../../../../horizon';
import { useAuth } from '../../../auth/AuthContext';
import { useEnvironmentProbes } from '../../environment/hooks';
import { useDashboardAlerts } from '../alerts/hooks';
import { tilesApi } from '../tiles/api';
import { systemStatusApi } from '../systemStatus/api';
import { systemHealthFromProbes } from '../derivers/systemHealthFromProbes';
import { statusToKpiTone } from './statusToKpiTone';

const SIXTY_SECONDS = 60 * 1000;

/**
 * v41 top-of-dashboard KPI strip — six live cells.
 *
 *   System Health · EOD Status · Curve Load · Trade Count · Open Alerts · Uptime
 *
 * All six are live now:
 *   - System Health     ← derived client-side from /api/support/environment/probes
 *   - EOD Status        ← /api/support/dashboard/tiles/eod-progress
 *   - Curve Load        ← /api/support/system-status/curve-load
 *   - Trade Count       ← /api/support/system-status/trade-count (LE-scoped)
 *   - Open Alerts       ← useDashboardAlerts (aggregates integrity + probes + tiles)
 *   - Uptime            ← /api/support/system-status/uptime (process uptime)
 *
 * Cell shapes are mixed deliberately (status / counter / counter-delta):
 * scanning a row of identical mono numbers is harder than scanning a row
 * where the eye latches on to shape changes per cell.
 */
export function KpiStrip() {
  const { currentLegalEntityId } = useAuth();

  const probes = useEnvironmentProbes();
  const eod = useQuery({
    queryKey: ['support-tile', 'eod-progress', currentLegalEntityId],
    queryFn: () => tilesApi.eodProgress(),
    enabled: !!currentLegalEntityId,
  });
  const alerts = useDashboardAlerts();

  // System Status endpoints — Curve Load and Uptime are firmwide (no LE
  // in the key); Trade Count is LE-scoped so the key carries the LE.
  const curveLoad = useQuery({
    queryKey: ['support-system-status', 'curve-load'],
    queryFn: () => systemStatusApi.curveLoad(),
    staleTime: SIXTY_SECONDS,
  });
  const tradeCount = useQuery({
    queryKey: ['support-system-status', 'trade-count', currentLegalEntityId],
    queryFn: () => systemStatusApi.tradeCount(),
    enabled: !!currentLegalEntityId,
    staleTime: SIXTY_SECONDS,
  });
  const uptime = useQuery({
    queryKey: ['support-system-status', 'uptime'],
    queryFn: () => systemStatusApi.uptime(),
    staleTime: SIXTY_SECONDS,
    refetchInterval: SIXTY_SECONDS,  // tick the cell forward without a full reload
  });

  const systemHealth = systemHealthFromProbes(probes.data);

  // Open Alerts → the worst-severity alert tints the cell. fail > warn
  // > info > all-clear. A zero count stays neutral / "0" so the strip
  // doesn't glow green just because nothing's broken — green has to be
  // earned by a passing System Health, not by an empty alert feed.
  const alertTone =
    alerts.fail > 0 ? 'fail'
    : alerts.warn > 0 ? 'warn'
    : alerts.info > 0 ? 'info'
    : 'neutral';
  const alertHint =
    alerts.fail + alerts.warn + alerts.info === 0
      ? 'no alerts firing'
      : `${alerts.fail} fail · ${alerts.warn} warn${alerts.info ? ` · ${alerts.info} info` : ''}`;

  // Curve Load tone: any stale curve → warn, none stale → pass, no data → neutral.
  const curveTone =
    !curveLoad.data ? 'neutral'
    : curveLoad.data.loaded === curveLoad.data.total && curveLoad.data.total > 0 ? 'pass'
    : 'warn';

  return (
    <HorizonKpiStrip columns={6}>
      <KpiCell
        kind="status"
        title="System Health"
        value={systemHealth.label}
        hint={systemHealth.summary}
        tone={systemHealth.tone}
        loading={probes.isPending}
      />
      <KpiCell
        kind="status"
        title="EOD Status"
        value={eod.data?.value?.statusName ?? null}
        hint={
          eod.data?.value?.cobDate
            ? `COB ${new Date(eod.data.value.cobDate).toLocaleDateString('en-GB')}`
            : 'no run'
        }
        tone={statusToKpiTone(eod.data?.status)}
        loading={eod.isPending}
      />
      <KpiCell
        kind="status"
        title="Curve Load"
        value={curveLoad.data?.formattedRatio ?? null}
        hint={curveLoad.data?.hint ?? 'loading…'}
        tone={curveTone}
        loading={curveLoad.isPending}
      />
      <KpiCell
        kind="counter-delta"
        title="Trade Count"
        value={tradeCount.data?.total ?? null}
        delta={tradeCount.data?.hint}
        hint={tradeCount.data?.hint ?? 'loading…'}
        tone="neutral"
        loading={tradeCount.isPending}
      />
      <KpiCell
        kind="counter"
        title="Open Alerts"
        value={alerts.total}
        hint={alertHint}
        tone={alertTone}
        loading={alerts.isPending}
      />
      <KpiCell
        kind="status"
        title="Uptime"
        value={uptime.data?.formattedUptime ?? null}
        hint={uptime.data?.hint ?? 'loading…'}
        tone="pass"
        loading={uptime.isPending}
      />
    </HorizonKpiStrip>
  );
}
