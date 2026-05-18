import { useState } from 'react';
import type { LogActionFilters } from '../types';

interface Props {
  initial: LogActionFilters;
  usernames: string[];
  functionNames: string[];
  optionsLoading: boolean;
  onApply: (filters: LogActionFilters) => void;
  onReset: () => void;
}

/**
 * v41 audit-search bar — one horizontal row with text search, two date
 * inputs, two dropdowns, and Search/Reset actions. Wraps when the
 * container is narrow (per the v41 prototype's `.audit-search-bar` rule).
 *
 * The form is held in local state so typing doesn't refire the query;
 * Search button (or Enter key in the text input) commits to the URL.
 */
export function AuditSearchBar({
  initial,
  usernames,
  functionNames,
  optionsLoading,
  onApply,
  onReset,
}: Props) {
  const [search, setSearch] = useState(initial.search ?? '');
  const [dateFrom, setDateFrom] = useState(initial.dateFrom ?? '');
  const [dateTo, setDateTo] = useState(initial.dateTo ?? '');
  const [username, setUsername] = useState(initial.username ?? '');
  const [functionName, setFunctionName] = useState(initial.functionName ?? '');

  // Browser back/forward, Reset, etc. change the URL — the parent passes
  // a `key` derived from the filter signature so the component remounts
  // with fresh useState initial values. No syncing-state-with-props
  // effect is needed (and triggers cascading-render lint).

  const apply = () => {
    onApply({
      search: search.trim() || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      username: username || undefined,
      functionName: functionName || undefined,
    });
  };

  const reset = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setUsername('');
    setFunctionName('');
    onReset();
  };

  const inputClass =
    'h-7 px-2 rounded-sm text-xs font-ui ' +
    'bg-input-bg border border-border text-foreground ' +
    'focus:outline-none focus:ring-1 focus:ring-accent';

  return (
    <div
      data-testid="audit-search-bar"
      className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-border bg-card"
    >
      <input
        data-testid="audit-search-text"
        type="text"
        placeholder="Search by user, function, action ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') apply(); }}
        className={`${inputClass} flex-1 min-w-[14rem]`}
      />
      <input
        data-testid="audit-search-date-from"
        type="date"
        title="Date from"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        className={`${inputClass} w-[8.5rem]`}
      />
      <input
        data-testid="audit-search-date-to"
        type="date"
        title="Date to"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        className={`${inputClass} w-[8.5rem]`}
      />
      <select
        data-testid="audit-search-username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={optionsLoading}
        className={`${inputClass} w-[10rem]`}
        aria-label="User"
      >
        <option value="">All users</option>
        {usernames.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
      <select
        data-testid="audit-search-function"
        value={functionName}
        onChange={(e) => setFunctionName(e.target.value)}
        disabled={optionsLoading}
        className={`${inputClass} w-[12rem]`}
        aria-label="Function"
      >
        <option value="">All functions</option>
        {functionNames.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
      <button
        data-testid="audit-search-submit"
        type="button"
        onClick={apply}
        className="h-7 px-3 rounded-sm text-xs font-semibold bg-accent text-text-inverse hover:bg-accent-hover"
      >
        Search
      </button>
      <button
        data-testid="audit-search-reset"
        type="button"
        onClick={reset}
        className="h-7 px-3 rounded-sm text-xs font-medium bg-surface-raised text-text-secondary border border-border hover:text-foreground"
      >
        Reset
      </button>
    </div>
  );
}
