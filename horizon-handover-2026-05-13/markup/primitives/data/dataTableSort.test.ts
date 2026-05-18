import { describe, it, expect } from 'vitest';
import { nextSortState, type SortState } from './dataTableSort';

describe('nextSortState', () => {
  it('null → { key, asc } when clicking any column', () => {
    expect(nextSortState(null, 'name')).toEqual({ key: 'name', dir: 'asc' });
  });

  it('asc on same column → desc', () => {
    expect(nextSortState({ key: 'name', dir: 'asc' }, 'name')).toEqual({
      key: 'name',
      dir: 'desc',
    });
  });

  it('desc on same column → null (unsorted)', () => {
    expect(nextSortState({ key: 'name', dir: 'desc' }, 'name')).toBeNull();
  });

  it('jumps to a new column at asc — drops the previous sort', () => {
    const prev: SortState = { key: 'name', dir: 'desc' };
    expect(nextSortState(prev, 'count')).toEqual({ key: 'count', dir: 'asc' });
  });

  it('jumps to a new column at asc even when previous was asc', () => {
    const prev: SortState = { key: 'name', dir: 'asc' };
    expect(nextSortState(prev, 'count')).toEqual({ key: 'count', dir: 'asc' });
  });
});
