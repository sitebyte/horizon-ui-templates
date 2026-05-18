import type { KvRow, KvRowTone } from '../../../../horizon';
import type { EnvironmentProbeDto, ProbeStatus } from '../../environment/api';

const STATUS_TONE: Record<ProbeStatus, KvRowTone> = {
  Ok: 'rag-green',
  Degraded: 'rag-amber',
  Down: 'rag-red',
  Unknown: 'tertiary',
};

const STATUS_LABEL: Record<ProbeStatus, string> = {
  Ok: 'OK',
  Degraded: 'DEGRADED',
  Down: 'DOWN',
  Unknown: '—',
};

/**
 * Translate the probe set into the small Service-Health KvGrid that sits
 * below the Integrity Checks panel in column 2 of the v41 dashboard.
 *
 * One row per probe. Value text is the probe's status word in its RAG
 * tone — colour-is-information rule (the value carries the signal, not
 * a separate dot).
 *
 * Pure — same input as `systemHealthFromProbes`; that function reduces
 * to the headline KPI, this one expands to the inline list.
 */
export function serviceHealthFromProbes(
  probes: EnvironmentProbeDto[] | undefined,
): KvRow[] {
  if (!probes || probes.length === 0) return [];
  return probes.map((p) => ({
    label: p.name,
    value: STATUS_LABEL[p.status],
    tone: STATUS_TONE[p.status],
  }));
}
