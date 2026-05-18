import { Hairline, KvGrid, Text } from '../../../../horizon';
import { useEnvironmentProbes } from '../../environment/hooks';
import { serviceHealthFromProbes } from '../derivers/serviceHealthFromProbes';

/**
 * v41 column-2 lower block — small Service Health KvGrid that sits
 * directly under the Integrity Checks panel. Reads the same probe set
 * as the System-Health KPI cell at the top; React Query dedupes the
 * fetch via the shared query key (`useEnvironmentProbes`).
 *
 * Render: one KvRow per probe — name on the left, status word in its
 * RAG tone on the right.
 */
export function ServiceHealthSection() {
  const { data, isPending, error } = useEnvironmentProbes();
  const rows = serviceHealthFromProbes(data);

  return (
    <div
      data-testid="service-health-section"
      className="bg-card border border-border rounded-md flex flex-col overflow-hidden"
    >
      <header className="flex items-baseline justify-between px-3 pt-3 pb-2">
        <Text role="label" size="xs" tone="tertiary" uppercase weight={600}>
          Service Health
        </Text>
        {data && data.length > 0 && (
          <Text size="xs" tone="tertiary">{data.length} probes</Text>
        )}
      </header>
      <Hairline tone="subtle" />
      <div className="px-3 py-2">
        {error && (
          <Text size="xs" tone="rag-red">{(error as Error).message}</Text>
        )}
        {isPending && rows.length === 0 && (
          <Text size="xs" tone="tertiary">Loading…</Text>
        )}
        {!isPending && rows.length === 0 && !error && (
          <Text size="xs" tone="tertiary">No probes registered.</Text>
        )}
        {rows.length > 0 && <KvGrid rows={rows} density="sm" />}
      </div>
    </div>
  );
}
