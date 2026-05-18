import { describe, expect, it } from 'vitest';
import { buildThroughputRows } from './throughputRows';

describe('buildThroughputRows', () => {
  it('returns six rows with "—" placeholders when no values are supplied', () => {
    const rows = buildThroughputRows();
    expect(rows).toHaveLength(6);
    for (const row of rows) {
      expect(row.value).toBe('—');
    }
  });

  it('preserves the row order and labels', () => {
    const rows = buildThroughputRows();
    expect(rows.map((r) => r.label)).toEqual([
      'DB Connections',
      'Msg Queue Depth',
      'Avg Response',
      'Disk Usage',
      'Last Backup',
      'EOD Runs MTD',
    ]);
  });

  it('renders supplied values as-is', () => {
    const rows = buildThroughputRows({
      dbConnections: '34 / 200',
      msgQueueDepth: 142,
      avgResponse: '87 ms',
      diskUsage: '64%',
      lastBackup: '02:14:00',
      eodRunsMtd: 11,
    });
    expect(rows.map((r) => r.value)).toEqual([
      '34 / 200', 142, '87 ms', '64%', '02:14:00', 11,
    ]);
  });

  it('uses "—" for null / empty-string values mixed with real ones', () => {
    const rows = buildThroughputRows({
      dbConnections: '34 / 200',
      msgQueueDepth: null,
      avgResponse: '',
      diskUsage: '64%',
    });
    const map = Object.fromEntries(rows.map((r) => [r.label, r.value]));
    expect(map['DB Connections']).toBe('34 / 200');
    expect(map['Msg Queue Depth']).toBe('—');
    expect(map['Avg Response']).toBe('—');
    expect(map['Disk Usage']).toBe('64%');
    expect(map['Last Backup']).toBe('—');
    expect(map['EOD Runs MTD']).toBe('—');
  });
});
