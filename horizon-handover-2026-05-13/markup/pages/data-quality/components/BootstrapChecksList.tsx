import { StatusPill, Text } from '../../../../horizon';
import type { CheckCatalogueEntry, CheckSeverity } from '../api';

interface Props {
  /** Bootstrap-validation checks. Order is preserved. */
  checks: CheckCatalogueEntry[];
}

const SEV_TO_TONE: Record<CheckSeverity, 'pass' | 'warn' | 'fail' | 'neutral'> = {
  Pass: 'pass',
  Warn: 'warn',
  Fail: 'fail',
  Error: 'fail',
  Stub: 'neutral',
};

/**
 * Bootstrap-validation sub-section of the v41 Curve Quality card. Renders
 * one row per check: label on the left, severity pill on the right.
 *
 * Uses the subtle pill treatment to match v41 (status-pass / status-warn
 * are dim-bg + tone-text, not solid). Text on the row stays at xs
 * tertiary so the pill carries the visual weight.
 */
export function BootstrapChecksList({ checks }: Props) {
  if (checks.length === 0) {
    return (
      <Text size="xs" tone="tertiary">
        No bootstrap checks registered.
      </Text>
    );
  }

  return (
    <ul data-testid="dq-bootstrap-checks" className="space-y-1">
      {checks.map((c) => {
        const sev = c.lastRun?.severity ?? null;
        return (
          <li
            key={c.checkId}
            data-testid="dq-bootstrap-row"
            className="flex items-center justify-between py-0.5"
          >
            <Text size="xs" tone="secondary">
              {c.displayName}
              {c.lastRun?.summary && (
                <>
                  {' — '}
                  <Text size="xs" tone="tertiary">{c.lastRun.summary}</Text>
                </>
              )}
            </Text>
            {sev
              ? <StatusPill kind="informational" tone={SEV_TO_TONE[sev]} label={sev.toUpperCase()} />
              : <StatusPill kind="informational" tone="neutral" label="—" />}
          </li>
        );
      })}
    </ul>
  );
}
