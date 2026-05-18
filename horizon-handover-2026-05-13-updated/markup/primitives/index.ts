/**
 * Horizon — public API barrel.
 *
 * Pages and feature folders import from here, never deeper. Deep imports
 * are banned by lint (gate G2). When adding a new primitive, export it
 * here AND add a `/dev/horizon/<name>` page (gate G17 enforces).
 *
 * See `client/src/horizon/CONVENTIONS.md`.
 */

// === Primitives ===
export { Surface, type SurfaceTone } from './primitives/Surface';
export { Hairline } from './primitives/Hairline';
export {
  Stack,
  type StackGap,
  type StackAlign,
  type StackJustify,
} from './primitives/Stack';
export {
  Text,
  type TextRole,
  type TextSize,
  type TextWeight,
  type TextTone,
} from './primitives/Text';
export { Mono } from './primitives/Mono';

// === Card ===
export { Tile, type TileStatus } from './card/Tile';
export { TileHeader } from './card/TileHeader';
export { TileBody } from './card/TileBody';
export { TileFooter } from './card/TileFooter';
export { Section } from './card/Section';

// === Data ===
export { KpiCell, type KpiCellProps, type KpiTone } from './data/KpiCell';
export { KpiStrip } from './data/KpiStrip';
export {
  BigNumber,
  type BigNumberRole,
  type BigNumberTrend,
} from './data/BigNumber';
export { MoneyValue } from './data/MoneyValue';
export { EnergyValue } from './data/EnergyValue';
export { StatusDot, type StatusDotTone } from './data/StatusDot';
export {
  StatusPill,
  type StatusPillProps,
  type StatusPillTone,
  type SeverityTone,
  type LifecycleState,
} from './data/StatusPill';
export { ProgressBar, type ProgressBarTone } from './data/ProgressBar';
export { ActivityRow } from './data/ActivityRow';
export { ActivityFeed } from './data/ActivityFeed';
export { DataTable, type Column, type RowTone } from './data/DataTable';
export { Toolbar } from './data/Toolbar';
export { FilterPill, type FilterPillTone } from './data/FilterPill';
export { AlertRow, type AlertRowSeverity } from './data/AlertRow';
export { CheckRow, type CheckRowSeverity } from './data/CheckRow';
export { KvGrid, type KvRow, type KvRowTone } from './data/KvGrid';
