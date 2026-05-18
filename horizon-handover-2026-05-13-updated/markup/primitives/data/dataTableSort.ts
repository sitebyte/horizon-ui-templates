export type SortDir = 'asc' | 'desc';
export type SortState = { key: string; dir: SortDir } | null;

/**
 * Click cycle for a sortable column header. Each click advances the state:
 *
 *   unsorted              → { key, dir: 'asc' }
 *   { key, dir: 'asc'  }  → { key, dir: 'desc' }
 *   { key, dir: 'desc' }  → unsorted
 *   { other, ...       }  → { key, dir: 'asc' }   (jump to the new column)
 *
 * Pure function — extracted from `DataTable` so it can be vitest-tested
 * without rendering. The component owns the useState; this owns the
 * transition logic.
 */
export function nextSortState(current: SortState, columnId: string): SortState {
  if (!current || current.key !== columnId) return { key: columnId, dir: 'asc' };
  if (current.dir === 'asc') return { key: columnId, dir: 'desc' };
  return null;
}
