import { Mono, StatusPill, Text } from '../../../../horizon';
import type { CheckCatalogueEntry, CheckSeverity } from '../api';

/**
 * One UI-shaped row backed by zero or more <see cref="CheckCatalogueEntry"/>s.
 * `checkId` matches the registered check; `label` and `scope` override the
 * check's display strings so v41 wording reads consistently across pages.
 */
export interface CheckRowSpec {
  /** Stable id matching an IIntegrityCheck.CheckId — drives data lookup. */
  checkId: string;
  /** v41 display label, e.g. "Duplicate detection". */
  label: string;
  /** v41 scope hint, e.g. "All trades", "vs market". */
  scope?: string;
}

interface Props {
  rows: CheckRowSpec[];
  /** Map of checkId → catalogue entry. Missing entries render as "—". */
  byId: Record<string, CheckCatalogueEntry | undefined>;
}

const SEV_TO_TONE: Record<CheckSeverity, 'pass' | 'warn' | 'fail' | 'neutral'> = {
  Pass: 'pass',
  Warn: 'warn',
  Fail: 'fail',
  Error: 'fail',
  Stub: 'neutral',
};

/**
 * Generic Check / Scope / Result / Details table for the v41 Trade
 * Integrity (and future Position Checks) section. Driven by a static
 * row spec to control v41 row order and label wording, joined to the
 * live catalogue by <c>checkId</c>. Rows missing from the catalogue
 * (e.g. an unregistered check) render with em-dash placeholders rather
 * than disappearing — that surfaces wiring bugs visually.
 */
export function CheckTable({ rows, byId }: Props) {
  return (
    <table
      data-testid="dq-check-table"
      className="w-full text-xs"
      style={{ borderCollapse: 'collapse' }}
    >
      <thead>
        <tr>
          <CheckHeader>Check</CheckHeader>
          <CheckHeader>Scope</CheckHeader>
          <CheckHeader>Result</CheckHeader>
          <CheckHeader>Details</CheckHeader>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const entry = byId[row.checkId];
          const sev = entry?.lastRun?.severity ?? null;
          const summary = entry?.lastRun?.summary ?? null;
          return (
            <tr
              key={row.checkId}
              data-testid="dq-check-row"
              data-checkid={row.checkId}
              className="border-b border-border-subtle"
            >
              <td className="px-2 py-1">
                <Text weight={500}>{row.label}</Text>
              </td>
              <td className="px-2 py-1">
                <Text size="xs" tone="tertiary">{row.scope ?? '—'}</Text>
              </td>
              <td className="px-2 py-1">
                {sev
                  ? <StatusPill kind="informational" tone={SEV_TO_TONE[sev]} label={sev.toUpperCase()} />
                  : <StatusPill kind="informational" tone="neutral" label="—" />}
              </td>
              <td className="px-2 py-1">
                {summary
                  ? <Mono size="xs" tone={sev === 'Warn' ? 'rag-amber' : 'secondary'}>{summary}</Mono>
                  : <Mono size="xs" tone="tertiary">—</Mono>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function CheckHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-2 py-1 border-b border-border text-left">
      <Text role="label" size="xs" tone="tertiary" uppercase weight={600}>
        {children}
      </Text>
    </th>
  );
}
