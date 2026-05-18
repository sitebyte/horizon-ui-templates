import { useQuery } from '@tanstack/react-query';
import { Hairline, KvGrid, Text } from '../../../../horizon';
import { systemStatusApi } from '../systemStatus/api';
import { buildThroughputRows } from '../derivers/throughputRows';

const SIXTY_SECONDS = 60 * 1000;

/**
 * v41 column-3 bottom block. Reads
 * `/api/support/system-status/throughput` and surfaces six rows:
 * DB Connections, Msg Queue Depth, Avg Response, Disk Usage,
 * Last Backup, EOD Runs MTD.
 *
 * Each backend field carries a pre-formatted Label so the row reads
 * "GB", "ms", "monitoring tag required" etc. without the frontend
 * re-implementing the formatting. When a probe partially fails (e.g.
 * RabbitMQ Management API auth rejected) the row shows the sentinel
 * label and the rest of the rows keep working — the section never
 * goes blank because one source is degraded.
 */
export function DatabaseThroughputSection() {
  const { data, isPending } = useQuery({
    queryKey: ['support-system-status', 'throughput'],
    queryFn: () => systemStatusApi.throughput(),
    staleTime: SIXTY_SECONDS,
    refetchInterval: SIXTY_SECONDS,
  });

  const rows = buildThroughputRows(
    data
      ? {
          dbConnections: data.dbConnectionsLabel,
          msgQueueDepth: data.msgQueueDepthLabel,
          avgResponse:   data.avgResponseLabel,
          diskUsage:     data.diskUsageLabel,
          lastBackup:    data.lastBackupLabel,
          eodRunsMtd:    data.eodRunsMtdLabel,
        }
      : undefined,
  );

  return (
    <div
      data-testid="database-throughput-section"
      className="bg-card border border-border rounded-md flex flex-col overflow-hidden"
    >
      <header className="flex items-baseline justify-between px-3 pt-3 pb-2">
        <Text role="label" size="xs" tone="tertiary" uppercase weight={600}>
          Database &amp; Throughput
        </Text>
        {isPending && <Text size="xs" tone="tertiary">loading…</Text>}
      </header>
      <Hairline tone="subtle" />
      <div className="px-3 py-2">
        <KvGrid rows={rows} density="sm" />
      </div>
    </div>
  );
}
