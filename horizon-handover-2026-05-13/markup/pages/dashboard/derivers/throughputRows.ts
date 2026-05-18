import type { KvRow } from '../../../../horizon';

/**
 * Database & Throughput KVs. v1 of this section is a stub set — the
 * brief spells out six stats (DB connections, msg queue depth, avg
 * response, disk usage, last backup, EOD runs MTD) but only some have
 * data sources today. Until the new throughput endpoint lands every
 * row renders `—`.
 *
 * Returning a KvRow[] with `'—'` placeholders keeps the visual layout
 * stable: when the endpoint is wired, swap this function for a hook
 * that reads it; the page composition doesn't change.
 */
export function buildThroughputRows(values?: Partial<ThroughputValues>): KvRow[] {
  const v = values ?? {};
  const dash = (s: string | number | null | undefined): string | number =>
    s == null || s === '' ? '—' : s;
  return [
    { label: 'DB Connections', value: dash(v.dbConnections) },
    { label: 'Msg Queue Depth', value: dash(v.msgQueueDepth) },
    { label: 'Avg Response', value: dash(v.avgResponse) },
    { label: 'Disk Usage', value: dash(v.diskUsage) },
    { label: 'Last Backup', value: dash(v.lastBackup) },
    { label: 'EOD Runs MTD', value: dash(v.eodRunsMtd) },
  ];
}

export interface ThroughputValues {
  dbConnections: string | number | null;
  msgQueueDepth: string | number | null;
  avgResponse: string | null;
  diskUsage: string | null;
  lastBackup: string | null;
  eodRunsMtd: string | number | null;
}
