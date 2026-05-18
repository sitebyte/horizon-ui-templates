import type { KpiTone } from '../../../../horizon';
import type { EnvironmentProbeDto } from '../../environment/api';

export interface SystemHealth {
  /** "HEALTHY" / "DEGRADED" / "OFFLINE" — the headline KPI value. */
  label: string;
  /** "all 8 probes ok" / "2 of 8 degraded" / "1 of 8 down". */
  summary: string;
  tone: KpiTone;
}

/**
 * Reduce the topology probe set to a single KPI.
 *
 *   any probe `Down`     → red    / OFFLINE
 *   else any `Degraded`  → amber  / DEGRADED
 *   else all `Ok`        → green  / HEALTHY
 *   nothing yet loaded   → neutral / —
 *
 * Pure — no React, no fetch. Same source feeds the System-Health KPI
 * and the Service-Health KvGrid below it.
 */
export function systemHealthFromProbes(
  probes: EnvironmentProbeDto[] | undefined,
): SystemHealth {
  if (!probes || probes.length === 0) {
    return { label: '—', summary: 'no probes registered', tone: 'neutral' };
  }
  const total = probes.length;
  const down = probes.filter((p) => p.status === 'Down').length;
  const degraded = probes.filter((p) => p.status === 'Degraded').length;
  const unknown = probes.filter((p) => p.status === 'Unknown').length;
  const ok = probes.filter((p) => p.status === 'Ok').length;

  if (down > 0) {
    return {
      label: 'OFFLINE',
      summary: `${down} of ${total} down`,
      tone: 'fail',
    };
  }
  if (degraded > 0) {
    return {
      label: 'DEGRADED',
      summary: `${degraded} of ${total} degraded`,
      tone: 'warn',
    };
  }
  if (ok === total) {
    return {
      label: 'HEALTHY',
      summary: `all ${total} probes ok`,
      tone: 'pass',
    };
  }
  // Mixed Ok + Unknown — partial coverage. Stay neutral, don't false-pass.
  return {
    label: 'PARTIAL',
    summary: `${ok} ok · ${unknown} not configured`,
    tone: 'neutral',
  };
}
