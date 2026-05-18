import { BigNumber, type BigNumberRole } from './BigNumber';
import { formatMoney, type MoneyFormatOptions } from './formatMoney';

interface Props {
  value: number;
  /** ISO 4217 currency code. Defaults to USD. */
  currency?: string;
  role?: BigNumberRole;
  /** Bypass suffix collapse for byte-exact audit cells. */
  exact?: boolean;
  /** Override the auto-pos/neg tone (e.g. 'primary' for neutral display). */
  tone?: 'primary' | 'secondary' | 'tertiary' | 'pos' | 'neg' | 'rag-amber';
  /** Test hook. */
  testId?: string;
}

/**
 * Render a money value through the BigNumber primitive with currency
 * formatting. Negative values automatically pick up the `--pnl-negative`
 * tone unless `tone` is explicitly overridden.
 */
export function MoneyValue({ value, currency = 'USD', role = 'tabular', exact, tone, testId }: Props) {
  const opts: MoneyFormatOptions = { currency, exact };
  const formatted = formatMoney(value, opts);

  const autoTone = value < 0 ? 'neg' : value > 0 ? 'pos' : 'primary';
  const finalTone = tone ?? autoTone;

  return <BigNumber value={formatted} role={role} tone={finalTone} testId={testId ?? 'money-value'} />;
}
