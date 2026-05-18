import { useNavigate } from 'react-router-dom';
import { Mono, StatusPill } from '../../../../../horizon';
import type { LogAction } from '../types';
import { actionToneFromFunction, formatActionTimestamp } from '../actionTone';

interface Props {
  rows: LogAction[];
  isLoading: boolean;
}

/**
 * v41 audit-search results table — compact `.tbl`-style rendering against
 * the horizon token surface. Hand-rolled rather than DataTable because we
 * want the very-tight 1.25rem row height the v41 prototype calls for and
 * sticky-header inside a scroll container; DataTable's defaults are
 * comfortable-density.
 */
export function ActionsTable({ rows, isLoading }: Props) {
  const navigate = useNavigate();

  if (isLoading && rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-text-tertiary">
        Loading audit actions...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div
        data-testid="audit-results-empty"
        className="flex items-center justify-center h-32 text-xs text-text-tertiary"
      >
        No actions match the current filters.
      </div>
    );
  }

  return (
    <table
      data-testid="audit-results-table"
      className="w-full text-xs border-collapse"
    >
      <thead>
        <tr>
          <Th>Timestamp</Th>
          <Th>Action&nbsp;ID</Th>
          <Th>Function</Th>
          <Th>User</Th>
          <Th>Source</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            data-testid="audit-results-row"
            data-action-id={row.id}
            onClick={() => navigate(`/support/audit/actions/${row.id}`)}
            className="cursor-pointer border-b border-border-subtle hover:bg-hover transition-colors"
          >
            <td className="px-2 py-0.5 whitespace-nowrap text-text-tertiary">
              <Mono>{formatActionTimestamp(row.actionDate)}</Mono>
            </td>
            <td className="px-2 py-0.5 whitespace-nowrap">
              <Mono>{row.id}</Mono>
            </td>
            <td className="px-2 py-0.5">
              {row.functionName ? (
                <StatusPill
                  kind="informational"
                  tone={actionToneFromFunction(row.functionName)}
                  label={row.functionName}
                />
              ) : (
                <span className="text-text-muted">—</span>
              )}
            </td>
            <td className="px-2 py-0.5 whitespace-nowrap">
              {row.personName ?? <span className="text-text-muted">—</span>}
            </td>
            <td className="px-2 py-0.5 whitespace-nowrap text-text-secondary">
              {row.sourceId != null ? <Mono>{row.sourceId}</Mono> : <span className="text-text-muted">—</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-[0.5rem] font-semibold uppercase tracking-wider text-text-muted px-2 py-0.5 border-b border-border bg-card sticky top-0 z-[1]">
      {children}
    </th>
  );
}
