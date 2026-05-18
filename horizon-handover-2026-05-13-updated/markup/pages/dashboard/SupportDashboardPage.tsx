import { KpiStrip } from './kpi/KpiStrip';
import { SchedulerJobsTile } from './tiles/SchedulerJobsTile';
import { IntegrityChecksPanel } from './integrity/IntegrityChecksPanel';
import { ServiceHealthSection } from './sections/ServiceHealthSection';
import { AlertsPanel } from './alerts/AlertsPanel';
import { RecentActivityFeed } from './activity/RecentActivityFeed';
import { DatabaseThroughputSection } from './sections/DatabaseThroughputSection';
import { DashboardStatusBar } from './status/DashboardStatusBar';
import { useDashboardAlerts } from './alerts/hooks';
import { formatLastRefresh } from './format';

/**
 * v41 Support Dashboard.
 *
 *   ┌───────────────────────────────────────────────────────────────────────┐
 *   │ KPI strip — 6 cells: SysHealth · EOD · Curve · Trade · Alerts · Up   │
 *   ├──────────────────┬───────────────────────┬──────────────────────────┤
 *   │ EOD Run Status   │ Integrity Checks      │ Alerts (cap 4)           │
 *   │ (full-height)    │                       │                          │
 *   │                  ├───────────────────────┤ Recent Activity (top 6)  │
 *   │                  │ Service Health        │                          │
 *   │                  │ (probes KvGrid)       │ Database & Throughput    │
 *   │                  │                       │ (KvGrid stub)            │
 *   ├──────────────────┴───────────────────────┴──────────────────────────┤
 *   │ DashboardStatusBar (connected DB · alerts firing · refresh)          │
 *   └───────────────────────────────────────────────────────────────────────┘
 *
 * Three-column body collapses to two at 64rem (lg, 1024px) and one at
 * 48rem (md, 768px) — matches the brief's breakpoints exactly via the
 * Tailwind `md:` and `lg:` defaults.
 */
export function SupportDashboardPage() {
  const alerts = useDashboardAlerts();

  // Status-bar tile health: a tile counts as "healthy" when it isn't
  // contributing any failure to the alerts feed. The page tracks four
  // visible blocks (EOD, Integrity, Service Health, Alerts).
  const tileCount = 4;
  const healthyTileCount = Math.max(0, tileCount - alerts.fail);
  const lastRefresh = formatLastRefresh(alerts.lastRefreshUtc);

  return (
    <div className="flex flex-col h-full" data-testid="support-dashboard-page" data-density="compact">
      <div className="flex-1 overflow-auto px-4 py-3">
        <KpiStrip />

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3 lg:h-[calc(100%-3.5rem)]"
          data-testid="support-dashboard-body"
        >
          {/* Column 1 — EOD Run Status (Scheduler job groups in
              next-run order; the set with NextRun != null IS the EOD
              batch per operator convention, see SchedulerJobsTileHandler). */}
          <div className="min-w-0 min-h-[24rem] lg:min-h-0">
            <SchedulerJobsTile />
          </div>

          {/* Column 2 — Integrity Checks (1fr) + Service Health (auto). */}
          <div className="grid grid-rows-[1fr_auto] gap-2 min-w-0 min-h-[24rem] lg:min-h-0">
            <IntegrityChecksPanel />
            <ServiceHealthSection />
          </div>

          {/* Column 3 — Alerts (auto, cap 4) + Recent Activity (1fr) + Database & Throughput (auto). */}
          <div className="grid grid-rows-[auto_1fr_auto] gap-2 min-w-0 min-h-[36rem] lg:min-h-0 md:col-span-2 lg:col-span-1">
            <AlertsPanel cap={4} />
            <RecentActivityFeed limit={6} />
            <DatabaseThroughputSection />
          </div>
        </div>
      </div>

      <DashboardStatusBar
        tileCount={tileCount}
        healthyTileCount={healthyTileCount}
        lastRefresh={lastRefresh}
      />
    </div>
  );
}

