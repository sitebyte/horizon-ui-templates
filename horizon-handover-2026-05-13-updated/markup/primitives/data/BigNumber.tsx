import { Text } from '../primitives/Text';
import type { TextSize, TextTone, TextWeight } from '../primitives/Text';

export type BigNumberRole = 'hero' | 'display' | 'tabular' | 'inline';
export type BigNumberTrend = 'up' | 'down' | 'flat';

interface Props {
  /** The number/string to render. Strings pass through unchanged so wrappers
   *  (MoneyValue, EnergyValue) can pre-format. */
  value: number | string;
  /** Visual role — drives size + weight. NO size/serif props per R02. */
  role?: BigNumberRole;
  /** Override tone explicitly. By default tone is 'primary' for non-numeric
   *  values. Numeric values can be tone-driven by the wrapper (e.g.
   *  MoneyValue auto-applies pos/neg from sign). */
  tone?: TextTone;
  /** Up / down / flat — currently informational; reserved for a future
   *  arrow glyph. */
  trend?: BigNumberTrend;
  /** Test hook. */
  testId?: string;
}

const ROLE_TO_SIZE: Record<BigNumberRole, TextSize> = {
  hero:    'hero',     // 36px
  display: '3xl',      // 30px
  tabular: '2xl',      // 24px
  inline:  'lg',       // 16px
};

const ROLE_TO_WEIGHT: Record<BigNumberRole, TextWeight> = {
  hero:    700,
  display: 600,
  tabular: 600,
  inline:  500,
};

/**
 * BigNumber — the load-bearing numeric primitive. Always monospace,
 * always tabular-nums. Role-driven size + weight (hero / display /
 * tabular / inline). Wrap in `<MoneyValue>` / `<EnergyValue>` for
 * format-domain semantics; this primitive is pure rendering.
 */
export function BigNumber({ value, role = 'display', tone = 'primary', testId = 'big-number' }: Props) {
  return (
    <Text
      role="mono"
      size={ROLE_TO_SIZE[role]}
      weight={ROLE_TO_WEIGHT[role]}
      tone={tone}
      tabular
      data-testid={testId}
      data-role={role}
      style={{ lineHeight: 1.1 }}
    >
      {value}
    </Text>
  );
}
