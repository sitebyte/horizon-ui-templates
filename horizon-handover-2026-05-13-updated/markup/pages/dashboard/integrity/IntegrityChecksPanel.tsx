import { Link } from 'react-router-dom';
import { CheckRow, Hairline, Mono, Stack, Text } from '../../../../horizon';
import type { CheckRowSeverity } from '../../../../horizon';
import {
  useIntegrityChecks,
  useRunAllChecks,
} from '../../integrity/hooks';
import type { CheckCatalogueEntry, CheckSeverity } from '../../integrity/api';
import { formatHms } from '../format';

/**
 * Right-column "Integrity Checks" panel. Shows the catalogue of registered
 * IIntegrityCheck entries with their last-run severity as a saturated
 * StatusPill (via `<CheckRow>`), summary text, affected-row count, and
 * the time it last ran.
 *
 * Colour-is-information rule: every row's pill is saturated severity (PASS
 * green, WARN amber, FAIL red). Rows with no last-run yet show a neutral
 * "—" pill so the eye still finds the row but doesn't false-pass.
 *
 * Click any row to drill into the integrity page (which holds run + sample
 * rows). The header carries a "Run all" button — fires the run-all mutation
 * and React Query refetches the catalogue.
 */
export function IntegrityChecksPanel() {
  const { data, isPending, error } = useIntegrityChecks();
  const runAll = useRunAllChecks();

  const checks = data ?? [];
  const summary = summariseChecks(checks);

  // No client-side auto-run: a server-side IntegrityChecksRefresher
  // populates the run store every 5 min so the panel arrives populated
  // for every visitor. The Run-all button below stays as a manual
  // operator override (force a run between cadence ticks).

  return (
    <div
      data-testid="integrity-checks-panel"
      className="bg-card border border-border rounded-md flex flex-col h-full overflow-hidden"
    >
      <header className="flex items-start justify-between gap-3 px-3 pt-3 pb-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <Text role="label" size="xs" tone="tertiary" uppercase weight={600}>
            Integrity Checks
          </Text>
          {summary.total > 0 && (
            <div className="flex items-center gap-1">
              {summary.fail > 0 && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-rag-red">
                  {summary.fail} FAIL
                </span>
              )}
              {summary.warn > 0 && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-rag-amber">
                  {summary.fail > 0 ? '· ' : ''}{summary.warn} WARN
                </span>
              )}
              {summary.pass > 0 && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-rag-green">
                  {(summary.fail > 0 || summary.warn > 0) ? '· ' : ''}{summary.pass} PASS
                </span>
              )}
              {summary.unrun > 0 && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-tertiary">
                  · {summary.unrun} —
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => runAll.mutate()}
            disabled={runAll.isPending || checks.length === 0}
            data-testid="integrity-run-all"
            className="text-xs uppercase tracking-wide text-accent disabled:text-fg-tertiary cursor-pointer disabled:cursor-not-allowed bg-transparent border-0 p-0"
          >
            {runAll.isPending ? 'running…' : 'Run all'}
          </button>
          <Link
            to="/support/integrity"
            className="text-xs uppercase tracking-wide text-accent no-underline hover:underline"
          >
            Open →
          </Link>
        </div>
      </header>
      <Hairline tone="subtle" />
      <div className="flex-1 min-h-0 overflow-y-auto">
        {error && (
          <p className="px-3 py-2 m-0 text-xs text-rag-red">
            {(error as Error).message}
          </p>
        )}
        {isPending && checks.length === 0 && (
          <p className="px-3 py-2 m-0 text-xs text-muted-foreground">Loading…</p>
        )}
        {!isPending && checks.length === 0 && !error && (
          <p className="px-3 py-2 m-0 text-xs text-muted-foreground">
            No checks registered.
          </p>
        )}
        {checks.map((c) => {
          const lastRun = c.lastRun;
          const severity = mapSeverity(lastRun?.severity ?? null);
          return (
            <CheckRow
              key={c.checkId}
              severity={severity}
              title={c.displayName}
              detail={lastRun?.summary || undefined}
              to={`/support/integrity#${c.checkId}`}
              subtlePills
              trailing={lastRun ? (
                <Stack gap={0} align="end">
                  {lastRun.affectedRowCount > 0 && (
                    <Mono size="xs" tone={severityToValueTone(lastRun.severity)} weight={600}>
                      {lastRun.affectedRowCount}
                    </Mono>
                  )}
                  <Mono size="xs" tone="tertiary">
                    {formatHms(lastRun.lastRunUtc) || '—'}
                  </Mono>
                </Stack>
              ) : (
                <Mono size="xs" tone="tertiary">never run</Mono>
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Wire severity is PascalCase ('Pass'/'Warn'/'Fail'/'Error'); CheckRow
 * takes lowercase. 'Error' collapses to 'fail' — both are red signals.
 * `null` means the check hasn't run yet.
 */
function mapSeverity(s: CheckSeverity | null): CheckRowSeverity {
  if (s === null) return null;
  if (s === 'Pass') return 'pass';
  if (s === 'Warn') return 'warn';
  return 'fail';
}

function severityToValueTone(s: CheckSeverity): 'rag-red' | 'rag-amber' | 'rag-green' | 'tertiary' {
  if (s === 'Fail' || s === 'Error') return 'rag-red';
  if (s === 'Warn') return 'rag-amber';
  if (s === 'Pass') return 'rag-green';
  return 'tertiary';
}

function summariseChecks(checks: CheckCatalogueEntry[]): {
  total: number; pass: number; warn: number; fail: number; unrun: number;
} {
  let pass = 0, warn = 0, fail = 0, unrun = 0;
  for (const c of checks) {
    if (!c.lastRun) { unrun++; continue; }
    if (c.lastRun.severity === 'Pass') pass++;
    else if (c.lastRun.severity === 'Warn') warn++;
    else fail++;
  }
  return { total: checks.length, pass, warn, fail, unrun };
}
