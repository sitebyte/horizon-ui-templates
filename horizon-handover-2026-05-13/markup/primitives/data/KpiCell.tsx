import { Stack, Text } from '../index';

/**
 * KpiCell — the compact summary cell used in a horizontal KPI strip.
 *
 * Discriminated by `kind` — each kind has its own value-rendering shape:
 *   - status            : "HEALTHY" / "RUNNING" — text in semantic colour
 *   - counter           : "1,247" — mono numeric
 *   - counter-delta     : "1,247" + "+12 today" — mono + small delta
 *   - percentage        : "100%" — mono + optional window hint
 *   - money             : "$47.84M" — mono with currency formatting
 *
 * `tone` drives the dot AND the value-text colour. Only red/amber/green
 * tones colour the value; pass / fail / running / info / neutral leave it
 * primary so the page stays calm at empty.
 *
 * `null` value renders an em-dash placeholder (for "Coming next" cells).
 *
 * Visual: tiny uppercase label, status dot, big mono value, optional hint.
 * No per-cell card chrome — KpiStrip wraps the row in a single rounded
 * outer container. Cells are flat dividers.
 */

export type KpiTone = 'pass' | 'warn' | 'fail' | 'info' | 'neutral';

export type KpiCellProps = {
  /** Short uppercase label (e.g. "AUDIT COMPLETENESS"). */
  title: string;
  /** Status dot + value-text tone. */
  tone?: KpiTone;
  /** Optional one-line hint under the value. */
  hint?: string;
  /** "Coming next" placeholders use loading=true, value=null. */
  loading?: boolean;
} & (
  | { kind: 'status';        value: string | null }
  | { kind: 'counter';       value: number | null }
  | { kind: 'counter-delta'; value: number | null; delta?: string; deltaTone?: KpiTone }
  | { kind: 'percentage';    value: number | null }
  | { kind: 'money';         value: number | null; currency?: string; formatted?: string }
);

const DOT_CLASS: Record<KpiTone, string> = {
  pass:    'bg-rag-green',
  warn:    'bg-rag-amber',
  fail:    'bg-rag-red',
  info:    'bg-rag-info',
  neutral: 'bg-fg-tertiary',
};

/* Severity → vibrant RAG colours for the value text. Bound to `--rag-*`
   directly (NOT `--pnl-*`) — pnl colours are tuned for finance figures
   and read slightly muted; severity needs to yell. Colour is information:
   if a tile is FAIL, the value should jump out, not blend in. */
const TONE_TO_VALUE: Record<KpiTone, 'rag-green' | 'rag-amber' | 'rag-red' | 'rag-info' | 'primary'> = {
  pass:    'rag-green',
  warn:    'rag-amber',
  fail:    'rag-red',
  info:    'rag-info',
  neutral: 'primary',
};

function formatCounter(n: number): string {
  return n.toLocaleString('en-GB');
}

function formatMoney(n: number, currency = 'USD'): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  const symbol = currency === 'USD' ? '$' : currency + ' ';
  if (abs >= 1_000_000) return `${sign}${symbol}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000)     return `${sign}${symbol}${(abs / 1_000).toFixed(1)}k`;
  return `${sign}${symbol}${abs.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function KpiCell(props: KpiCellProps) {
  const { title, tone = 'neutral', hint, loading } = props;
  const isPlaceholder = props.value === null;

  let display: string;
  switch (props.kind) {
    case 'status':
      display = props.value ?? '—';
      break;
    case 'counter':
      display = isPlaceholder ? '—' : formatCounter(props.value as number);
      break;
    case 'counter-delta':
      display = isPlaceholder ? '—' : formatCounter(props.value as number);
      break;
    case 'percentage':
      display = isPlaceholder ? '—' : `${props.value as number}%`;
      break;
    case 'money':
      display = isPlaceholder
        ? '—'
        : props.formatted ?? formatMoney(props.value as number, props.currency);
      break;
  }

  const valueTone = isPlaceholder ? 'tertiary' : TONE_TO_VALUE[tone];

  return (
    <div
      data-testid="kpi-cell"
      data-tone={tone}
      data-kind={props.kind}
      className={`flex flex-col px-3 py-1.5 h-full ${loading ? 'animate-pulse' : ''}`.trim()}
    >
      <Stack direction="row" justify="between" align="center" gap={2}>
        <Text role="label" size="xs" tone="tertiary" uppercase weight={600} truncate>{title}</Text>
        <span
          aria-hidden
          data-testid="kpi-cell-dot"
          className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${DOT_CLASS[tone]}`}
        />
      </Stack>
      <Stack gap={0}>
        <Text
          role="mono"
          size="xl"
          tabular
          weight={600}
          tone={valueTone}
          truncate
          data-testid="kpi-cell-value"
        >
          {display}
        </Text>
        {props.kind === 'counter-delta' && props.delta && !isPlaceholder && (
          <Text
            role="mono"
            size="xs"
            tabular
            tone={props.deltaTone ? TONE_TO_VALUE[props.deltaTone] : 'tertiary'}
            data-testid="kpi-cell-delta"
          >
            {props.delta}
          </Text>
        )}
        {hint && (
          <Text size="xs" tone="tertiary" truncate>{hint}</Text>
        )}
      </Stack>
    </div>
  );
}
