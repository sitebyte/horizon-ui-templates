/**
 * Pure money + energy formatters.
 *
 * Used by MoneyValue + EnergyValue wrappers. Extracted to a sibling .ts
 * so the formatter logic is unit-testable without rendering React.
 */

export type MoneyFormatOptions = {
  currency?: string;
  /** When true, render full precision (e.g. "$47,840,000.00"). When
   *  false (default), collapse thousands to "$1.2k" / "$1.23M" etc. */
  exact?: boolean;
};

const CURRENCY_TO_SYMBOL: Record<string, string> = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
};

/**
 * Format a money value with smart suffix collapse.
 *  -    87,234   → "-$87,234.00"  (exact within thousands)
 *  -    1_234   → "$1.2k"
 *  -    47_840_000 → "$47.84M"
 *  -    1_234_567_890 → "$1.23B"
 *
 * `exact` flag bypasses suffix collapse — used for byte-exact audit
 * cells and statement totals where every digit matters.
 */
export function formatMoney(value: number, options: MoneyFormatOptions = {}): string {
  const { currency = 'USD', exact = false } = options;
  const symbol = CURRENCY_TO_SYMBOL[currency] ?? `${currency} `;
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);

  if (exact || abs < 1_000) {
    return `${sign}${symbol}${abs.toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (abs < 1_000_000) {
    return `${sign}${symbol}${(abs / 1_000).toFixed(1)}k`;
  }

  if (abs < 1_000_000_000) {
    return `${sign}${symbol}${(abs / 1_000_000).toFixed(2)}M`;
  }

  return `${sign}${symbol}${(abs / 1_000_000_000).toFixed(2)}B`;
}

export type EnergyUnit = 'MMBtu' | 'm3' | 'kWh' | 'TBtu' | 'GJ';

const UNIT_LABEL: Record<EnergyUnit, string> = {
  MMBtu: 'MMBtu',
  m3:    'm³',
  kWh:   'kWh',
  TBtu:  'TBtu',
  GJ:    'GJ',
};

/**
 * Format an energy quantity with smart suffix collapse.
 *  - 999       → "999 MMBtu"
 *  - 3_200     → "3.2k MMBtu"
 *  - 3_200_000 → "3.2M MMBtu"
 */
export function formatEnergy(value: number, unit: EnergyUnit, options: { exact?: boolean } = {}): string {
  const { exact = false } = options;
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const label = UNIT_LABEL[unit];

  if (exact || abs < 1_000) {
    return `${sign}${abs.toLocaleString('en-GB', { maximumFractionDigits: 1 })} ${label}`;
  }

  if (abs < 1_000_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}k ${label}`;
  }

  if (abs < 1_000_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1)}M ${label}`;
  }

  return `${sign}${(abs / 1_000_000_000).toFixed(2)}B ${label}`;
}
