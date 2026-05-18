import { KpiCell, KpiStrip } from '../../../../horizon';
import type { DqKpisDto } from '../api';
import { formatLastCheckClock } from '../dqKpis';

interface Props {
  kpis: DqKpisDto | null;
  isFetching?: boolean;
}

/**
 * Five-tile KPI strip sitting above the Data Quality sections. Tile order
 * matches the v41 reference (Curves Loaded, Stale Curves, Trade Errors,
 * Missing Prices, Last Check) — Position Breaks dropped pending the
 * position-recon checks landing.
 */
export function DataQualityKpiStrip({ kpis, isFetching }: Props) {
  const ld = kpis?.curvesLoaded ?? null;
  const total = kpis?.curvesTotal ?? 0;
  const stale = kpis?.staleCurves ?? null;
  const errs = kpis?.tradeErrors ?? null;
  const miss = kpis?.missingPrices ?? null;
  const last = formatLastCheckClock(kpis?.lastCheckUtc);

  return (
    <KpiStrip columns={5}>
      <KpiCell
        kind="counter"
        title="Curves loaded"
        value={ld}
        loading={isFetching && kpis === null}
        tone={ld !== null && total > 0 && ld < total ? 'warn' : 'neutral'}
        hint={total > 0 ? `of ${total} total` : undefined}
      />
      <KpiCell
        kind="counter"
        title="Stale curves"
        value={stale}
        loading={isFetching && kpis === null}
        tone={stale !== null && stale > 0 ? 'warn' : 'pass'}
      />
      <KpiCell
        kind="counter"
        title="Trade errors"
        value={errs}
        loading={isFetching && kpis === null}
        tone={errs !== null && errs > 0 ? 'fail' : 'pass'}
      />
      <KpiCell
        kind="counter"
        title="Missing prices"
        value={miss}
        loading={isFetching && kpis === null}
        tone={miss !== null && miss > 0 ? 'warn' : 'pass'}
      />
      <KpiCell
        kind="status"
        title="Last check"
        value={last}
        tone="neutral"
      />
    </KpiStrip>
  );
}
