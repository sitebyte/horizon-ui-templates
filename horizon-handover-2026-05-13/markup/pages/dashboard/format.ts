import type { TileStatus } from './tiles/types';
import type {
  ProgressBarTone,
  StatusDotTone,
  TextTone,
  TileStatus as HorizonTileStatus,
} from '../../../horizon';

/**
 * Pure formatting + status helpers for the Support Dashboard.
 * Kept out of the React components so they're unit-testable without a DOM.
 */

/**
 * Status-bar "Last refresh" label. Takes the newest `dataUpdatedAt`
 * (epoch-ms) across the dashboard's contributing queries and formats it
 * as a locale time string ("10:42:13"). Returns null when nothing has
 * loaded yet — the status bar then omits the line entirely rather than
 * showing "Last refresh —".
 */
export function formatLastRefresh(epochMs: number | null): string | null {
  if (epochMs === null || epochMs <= 0) return null;
  return formatHms(new Date(epochMs).toISOString());
}

/** "10:42:13" or empty string for invalid input. */
export function formatHms(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/** "as of HH:MM:SS" tile-shell footer string. Empty when iso is invalid. */
export function formatAsOf(iso: string | null | undefined): string {
  const hms = formatHms(iso);
  return hms ? `as of ${hms}` : '';
}

/**
 * Status-bar DB label. Returns one of:
 *  - "{db} on {server}"     when both are present
 *  - "{db}"                 when only db
 *  - "connecting…"          when still loading
 *  - "connection unavailable" when loaded but missing
 */
export function dbLabel(
  info: { database: string | null; server: string | null } | undefined,
  isPending: boolean,
): string {
  if (!info) return isPending ? 'connecting…' : 'connection unavailable';
  if (info.database && info.server) return `${info.database} on ${info.server}`;
  if (info.database) return info.database;
  return 'connection unavailable';
}

/** A tile counts as "healthy" if its status isn't Red and the schema is known. */
export function isHealthyStatus(status: TileStatus | undefined): boolean {
  if (status === undefined) return false;
  return status !== 'Red' && status !== 'SchemaUnknown';
}

/** ARIA label for an activity-row dot. */
export function activityDotLabel(success: boolean | null): 'failed' | 'succeeded' | 'unknown' {
  if (success === false) return 'failed';
  if (success === true) return 'succeeded';
  return 'unknown';
}

/**
 * Map the backend `TileStatus` enum (Red/Amber/Green/Unknown/SchemaUnknown)
 * to horizon's `TileStatus` (red/amber/green/info/neutral/schema-unknown).
 *
 * Decoupled from the wire enum on purpose: the backend enum can grow
 * without forcing UI tone names to follow.
 */
export function statusToHorizonTile(s: TileStatus | undefined): HorizonTileStatus {
  switch (s) {
    case 'Red':           return 'red';
    case 'Amber':         return 'amber';
    case 'Green':         return 'green';
    case 'SchemaUnknown': return 'schema-unknown';
    case 'Unknown':
    default:              return 'neutral';
  }
}

/**
 * Map the backend `TileStatus` to a `Text` tone for the headline value.
 * Red/Amber/Green tint the value text so the page reads at a glance;
 * Unknown / SchemaUnknown / undefined stay neutral so empty placeholders
 * don't shout.
 */
export function statusToValueTone(s: TileStatus | undefined): TextTone {
  if (s === 'Red')   return 'rag-red';
  if (s === 'Amber') return 'rag-amber';
  if (s === 'Green') return 'rag-green';
  return 'primary';
}

/** Map the backend `TileStatus` to a `ProgressBar` tone. */
export function statusToProgressTone(s: TileStatus | undefined): ProgressBarTone {
  if (s === 'Red')   return 'fail';
  if (s === 'Amber') return 'warn';
  if (s === 'Green') return 'pass';
  return 'neutral';
}

/** Map a t_LOG_Action `success` flag to a `StatusDot` tone. */
export function activitySuccessToTone(success: boolean | null): StatusDotTone {
  if (success === false) return 'fail';
  if (success === true)  return 'pass';
  return 'neutral';
}
