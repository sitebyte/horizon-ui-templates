import { Fragment, type ReactNode } from 'react';
import { Mono } from './Mono';
import { Text, type TextTone } from './Text';

export type KvRowTone =
  | 'primary'
  | 'tertiary'
  | 'rag-red'
  | 'rag-amber'
  | 'rag-green'
  | 'rag-info';

export interface KvRow {
  /** Left column. Tertiary uppercase micro-label. */
  label: string;
  /**
   * Right column. Strings/numbers render through `<Mono>` for tabular
   * alignment; ReactNode renders as-is so callers can drop in pills, dot
   * + text, etc.
   */
  value: string | number | ReactNode;
  /** Value tone. Defaults to `primary`. Ignored when `value` is a node. */
  tone?: KvRowTone;
  /** Render strings via `<Text>` instead of `<Mono>` (prose values). */
  plain?: boolean;
}

interface Props {
  rows: KvRow[];
  /** Vertical density. Defaults to `md`. */
  density?: 'sm' | 'md';
}

const ROW_GAP_CLASS: Record<NonNullable<Props['density']>, string> = {
  sm: 'gap-y-0.5',
  md: 'gap-y-1',
};

/**
 * Two-column `[label, value]` grid. Labels are tertiary uppercase
 * micro-text; values are mono+tabular by default and right-aligned so
 * scanning a column of numbers stays clean.
 *
 * Used for service-health KVs, throughput stats, container metadata
 * blocks. Compose inside a `Surface` or `Tile` body — this primitive
 * has no chrome.
 */
export function KvGrid({ rows, density = 'md' }: Props) {
  return (
    <div
      data-testid="kv-grid"
      data-density={density}
      className={`grid grid-cols-[auto_1fr] ${ROW_GAP_CLASS[density]}`}
      style={{ columnGap: '8px' }}
    >
      {rows.map((row, i) => (
        <Fragment key={i}>
          <Text
            tone="tertiary"
            uppercase
            weight={600}
            truncate
            data-testid="kv-grid-label"
            style={{ fontSize: '8px', letterSpacing: '0.05em' }}
          >
            {row.label}
          </Text>
          <div data-testid="kv-grid-value" className="text-right min-w-0">
            <KvValue value={row.value} tone={row.tone} plain={row.plain} />
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function KvValue({
  value,
  tone = 'primary',
  plain,
}: {
  value: string | number | ReactNode;
  tone?: KvRowTone;
  plain?: boolean;
}) {
  const isStringy = typeof value === 'string' || typeof value === 'number';
  if (!isStringy) return <>{value}</>;
  if (plain) {
    return (
      <Text size="xs" tone={tone as TextTone} truncate>
        {value as string | number}
      </Text>
    );
  }
  return (
    <Mono size="xs" tone={tone as TextTone} weight={600} truncate>
      {value as string | number}
    </Mono>
  );
}
