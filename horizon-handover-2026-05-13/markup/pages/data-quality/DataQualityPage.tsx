import { useMemo } from 'react';
import { Hairline, StatusPill, Surface, Stack, Text } from '../../../horizon';
import { BenchmarkTable } from './components/BenchmarkTable';
import { BootstrapChecksList } from './components/BootstrapChecksList';
import { CheckTable, type CheckRowSpec } from './components/CheckTable';
import { DataQualityKpiStrip } from './components/DataQualityKpiStrip';
import { useBenchmarks, useDqKpis, useIntegrityChecks } from './hooks';
import type { CheckCatalogueEntry } from './api';

/**
 * `/support/integrity` — v41 Data Quality page. Replaces the prior
 * generic Live Checks table. Layout:
 *   - 5-tile KPI strip (Curves loaded / Stale / Trade errors / Missing
 *     prices / Last check). Position Breaks tile is dropped along with
 *     the Position Checks section pending position-recon work.
 *   - Curve Quality card (full-width): per-benchmark table + bootstrap
 *     validation sub-list.
 *   - Trade Integrity card (full-width): six rows mapping to the
 *     existing + new IIntegrityCheck registrations.
 *
 * Route stays at `/support/integrity` (deep-link continuity); the H1
 * and sidebar entry change to "Data Quality" per v41 rebrand.
 */
export function DataQualityPage() {
  const kpis       = useDqKpis();
  const benchmarks = useBenchmarks();
  const checks     = useIntegrityChecks();

  const checkById = useMemo(() => indexByCheckId(checks.data ?? []), [checks.data]);
  const bootstrapChecks = useMemo(
    () => filterBootstrapChecks(checks.data ?? []),
    [checks.data],
  );
  const benchmarkRows = benchmarks.data ?? [];
  const okCount    = benchmarkRows.filter((b) => !b.isStale).length;
  const staleCount = benchmarkRows.length - okCount;

  return (
    <div className="flex flex-col h-full" data-testid="integrity-checks-page">
      <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
        <Stack gap={0}>
          <Text role="heading" size="xl" weight={500} as="h1">Data Quality</Text>
          <Text size="sm" tone="secondary">
            Curve, trade and settlement integrity at a glance. Pills surface the
            most recent run of each check; refresh by triggering a run.
          </Text>
        </Stack>

        <DataQualityKpiStrip kpis={kpis.data ?? null} isFetching={kpis.isFetching} />

        {/* Curve Quality */}
        <Surface tone="raised" className="rounded-md p-4" data-testid="dq-curve-quality">
          <Stack direction="row" align="center" gap={2} className="mb-2">
            <Text role="heading" size="sm" weight={600}>Curve Quality</Text>
            {benchmarkRows.length > 0 && (
              <>
                <StatusPill kind="informational" tone="pass" label={`${okCount} OK`} />
                {staleCount > 0 && (
                  <StatusPill kind="informational" tone="warn" label={`${staleCount} STALE`} />
                )}
              </>
            )}
          </Stack>

          <BenchmarkTable benchmarks={benchmarkRows} isFetching={benchmarks.isFetching} />

          <div className="mt-3 pt-3 border-t border-border-subtle">
            <Text role="label" size="xs" tone="muted" uppercase weight={600}>
              Bootstrap validation — curve smoothness
            </Text>
            <div className="mt-1">
              <BootstrapChecksList checks={bootstrapChecks} />
            </div>
          </div>
        </Surface>

        {/* Trade Integrity */}
        <Surface tone="raised" className="rounded-md p-4" data-testid="dq-trade-integrity">
          <Text role="heading" size="sm" weight={600} as="h2">Trade Integrity</Text>
          <div className="mt-2">
            <CheckTable rows={TRADE_INTEGRITY_ROWS} byId={checkById} />
          </div>
          {checks.isFetching && (
            <div className="mt-2">
              <Hairline tone="subtle" />
              <Text size="xs" tone="tertiary">Refreshing…</Text>
            </div>
          )}
        </Surface>
      </div>
    </div>
  );
}

/**
 * v41 Trade Integrity row order. Ids match registered IIntegrityCheck
 * implementations; missing checks render as em-dash (visible wiring bug).
 */
const TRADE_INTEGRITY_ROWS: CheckRowSpec[] = [
  { checkId: 'trade.duplicate',          label: 'Duplicate detection', scope: 'All trades' },
  { checkId: 'trade.tradegroup-empty',   label: 'Missing fields',      scope: 'Required fields' },
  { checkId: 'trade.price-tolerance',    label: 'Price tolerance',     scope: 'vs market' },
  { checkId: 'trade.volume-validation',  label: 'Volume validation',   scope: 'vs limits' },
  { checkId: 'trade.counterparty-match', label: 'Counterparty match',  scope: 'vs master' },
  { checkId: 'settlement.orphan-statement-group', label: 'Settlement ready', scope: 'EOD' },
];

/**
 * Bootstrap-validation source. Today: every Curve-domain check that isn't
 * already represented in the benchmark table (curve.completeness,
 * curve.freshness). curve.smoothness + curve.monotonicity surface here.
 */
function filterBootstrapChecks(all: CheckCatalogueEntry[]): CheckCatalogueEntry[] {
  return all.filter((c) =>
    c.domain === 'Curve'
    && c.checkId !== 'curve.completeness'
    && c.checkId !== 'curve.freshness',
  );
}

function indexByCheckId(entries: CheckCatalogueEntry[]): Record<string, CheckCatalogueEntry | undefined> {
  const out: Record<string, CheckCatalogueEntry | undefined> = {};
  for (const e of entries) out[e.checkId] = e;
  return out;
}
