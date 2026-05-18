import { api } from '../../../../api/client';

/**
 * KPI strip cells previously stubbed as "endpoint pending" — Uptime,
 * Trade Count, Curve Load. Each backend endpoint formats the headline
 * value + hint server-side so the frontend stays presentation-only.
 *
 * Backend handlers live under
 * `src/Eos.Horizon.Application/Support/SystemStatus/`.
 */

export interface UptimeDto {
  startedUtc: string;
  uptimeSeconds: number;
  formattedUptime: string; // "2d 14h"
  hint: string;            // "since 12 May 09:01 UTC"
}

export interface TradeCountDto {
  total: number;
  today: number;
  formattedTotal: string;  // "1,247"
  hint: string;            // "+12 today"
}

export interface CurveLoadDto {
  loaded: number;
  total: number;
  formattedRatio: string;  // "142/148"
  hint: string;            // "6 stale" / "all curves loaded"
}

export interface ThroughputDto {
  dbConnections: number | null;
  dbConnectionsLabel: string;
  msgQueueDepth: number | null;
  msgQueueDepthLabel: string;
  avgResponseMs: number | null;
  avgResponseLabel: string;
  diskUsageMb: number | null;
  diskUsageLabel: string;
  lastBackupUtc: string | null;
  lastBackupLabel: string;
  eodRunsMtd: number | null;
  eodRunsMtdLabel: string;
}

export const systemStatusApi = {
  uptime: () => api.get<UptimeDto>('/support/system-status/uptime'),
  tradeCount: () => api.get<TradeCountDto>('/support/system-status/trade-count'),
  curveLoad: () => api.get<CurveLoadDto>('/support/system-status/curve-load'),
  throughput: () => api.get<ThroughputDto>('/support/system-status/throughput'),
};
