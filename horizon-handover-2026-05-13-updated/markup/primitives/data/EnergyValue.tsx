import { BigNumber, type BigNumberRole } from './BigNumber';
import { formatEnergy, type EnergyUnit } from './formatMoney';

interface Props {
  value: number;
  unit: EnergyUnit;
  role?: BigNumberRole;
  /** Bypass suffix collapse for byte-exact audit cells. */
  exact?: boolean;
  /** Override tone (default 'primary'). */
  tone?: 'primary' | 'secondary' | 'tertiary';
  testId?: string;
}

/**
 * Render an energy quantity through the BigNumber primitive with unit
 * formatting. Same role axis as MoneyValue. Energy is non-signed in the
 * trading sense (volumes don't go negative the way P&L does), so no
 * auto-tone — pass `tone` explicitly if needed.
 */
export function EnergyValue({ value, unit, role = 'tabular', exact, tone = 'primary', testId }: Props) {
  const formatted = formatEnergy(value, unit, { exact });
  return <BigNumber value={formatted} role={role} tone={tone} testId={testId ?? 'energy-value'} />;
}
