import { Mono, StatusPill, Text } from '../../../../horizon';
import type { BenchmarkDto } from '../api';
import { formatObservationTime, formatStaleness } from '../dqKpis';

interface Props {
  benchmarks: BenchmarkDto[];
  isFetching?: boolean;
}

/**
 * Per-benchmark table for the v41 Data Quality page's Curve Quality
 * section. One row per <c>t_EOS_CurveDefinition</c>; status pill reads
 * <code>OK</code> when fresh and <code>STALE</code> when missing or older
 * than 24h. Both pills use the subtle (informational) treatment to match
 * the v41 reference — saturated pills would dominate the page; this
 * table is dense and reads better with low-key colour.
 */
export function BenchmarkTable({ benchmarks, isFetching }: Props) {
  if (benchmarks.length === 0) {
    return (
      <Text size="xs" tone="tertiary">
        {isFetching ? 'Loading benchmarks…' : 'No benchmarks registered.'}
      </Text>
    );
  }

  return (
    <table
      data-testid="dq-benchmark-table"
      className="w-full text-xs"
      style={{ borderCollapse: 'collapse' }}
    >
      <thead>
        <tr>
          <BenchmarkHeader>Benchmark</BenchmarkHeader>
          <BenchmarkHeader align="right">Tenors</BenchmarkHeader>
          <BenchmarkHeader>Last update</BenchmarkHeader>
          <BenchmarkHeader>Status</BenchmarkHeader>
          <BenchmarkHeader>Staleness</BenchmarkHeader>
        </tr>
      </thead>
      <tbody>
        {benchmarks.map((b) => (
          <tr
            key={b.curveDefinitionId}
            data-testid="dq-benchmark-row"
            data-stale={b.isStale}
            className="border-b border-border-subtle"
          >
            <td className="px-2 py-1">
              <Text weight={600}>{b.name}</Text>
            </td>
            <td className="px-2 py-1 text-right">
              <Mono>{b.tenorCount}</Mono>
            </td>
            <td className="px-2 py-1">
              <Mono size="xs" tone="tertiary">
                {formatObservationTime(b.latestObservation)}
              </Mono>
            </td>
            <td className="px-2 py-1">
              {b.isStale
                ? <StatusPill kind="informational" tone="warn" label="STALE" />
                : <StatusPill kind="informational" tone="pass" label="OK" />}
            </td>
            <td className="px-2 py-1">
              {b.isStale
                ? <Mono tone="rag-amber">{formatStaleness(b.hoursStale)}</Mono>
                : <Text tone="rag-green">Fresh</Text>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BenchmarkHeader({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <th
      className="px-2 py-1 border-b border-border"
      style={{ textAlign: align ?? 'left' }}
    >
      <Text role="label" size="xs" tone="tertiary" uppercase weight={600}>
        {children}
      </Text>
    </th>
  );
}
