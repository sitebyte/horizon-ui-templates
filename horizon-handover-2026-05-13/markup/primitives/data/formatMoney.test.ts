import { describe, it, expect } from 'vitest';
import { formatEnergy, formatMoney } from './formatMoney';

describe('formatMoney', () => {
  describe('default — collapse thousands', () => {
    it.each([
      [0, '$0.00'],
      [12.34, '$12.34'],
      [999, '$999.00'],
      [1_000, '$1.0k'],
      [1_234, '$1.2k'],
      [9_999, '$10.0k'],
      [10_000, '$10.0k'],
      [99_999, '$100.0k'],
      [123_456, '$123.5k'],
      [999_999, '$1000.0k'],
      [1_000_000, '$1.00M'],
      [47_840_000, '$47.84M'],
      [999_999_999, '$1000.00M'],
      [1_000_000_000, '$1.00B'],
      [1_234_567_890, '$1.23B'],
    ])('%i -> %s', (input, expected) => {
      expect(formatMoney(input)).toBe(expected);
    });
  });

  describe('negative values — leading minus, then symbol', () => {
    it.each([
      [-12.34, '-$12.34'],
      [-1_234, '-$1.2k'],
      [-47_840_000, '-$47.84M'],
    ])('%i -> %s', (input, expected) => {
      expect(formatMoney(input)).toBe(expected);
    });
  });

  describe('exact flag — bypass suffix collapse', () => {
    it('renders full precision', () => {
      expect(formatMoney(47_840_000.99, { exact: true })).toBe('$47,840,000.99');
    });
    it('handles negative full-precision', () => {
      expect(formatMoney(-87_234.50, { exact: true })).toBe('-$87,234.50');
    });
  });

  describe('currency handling', () => {
    it('GBP -> £', () => expect(formatMoney(1_234, { currency: 'GBP' })).toBe('£1.2k'));
    it('EUR -> €', () => expect(formatMoney(1_234, { currency: 'EUR' })).toBe('€1.2k'));
    it('JPY -> ¥', () => expect(formatMoney(1_234, { currency: 'JPY' })).toBe('¥1.2k'));
    it('unknown currency code -> code prefix', () => {
      expect(formatMoney(1_234, { currency: 'NOK' })).toBe('NOK 1.2k');
    });
  });
});

describe('formatEnergy', () => {
  it.each([
    [999, 'MMBtu' as const, '999 MMBtu'],
    [3_200, 'MMBtu' as const, '3.2k MMBtu'],
    [3_200_000, 'MMBtu' as const, '3.2M MMBtu'],
    [3_200_000_000, 'MMBtu' as const, '3.20B MMBtu'],
    [42_000, 'm3' as const, '42.0k m³'],
    [123, 'kWh' as const, '123 kWh'],
  ])('formatEnergy(%i, %s) -> %s', (v, u, expected) => {
    expect(formatEnergy(v, u)).toBe(expected);
  });

  it('exact flag bypasses suffix collapse', () => {
    expect(formatEnergy(3_200_000, 'MMBtu', { exact: true })).toBe('3,200,000 MMBtu');
  });

  it('negative value', () => {
    expect(formatEnergy(-3_200, 'MMBtu')).toBe('-3.2k MMBtu');
  });
});
