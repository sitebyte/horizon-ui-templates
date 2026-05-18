import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../auth/AuthContext';
import {
  Mono,
  StatusPill,
  Text,
  Tile,
  TileBody,
  TileFooter,
  TileHeader,
} from '../../../../horizon';
import type { SeverityTone } from '../../../../horizon';
import { tilesApi } from './api';
import { statusToHorizonTile } from '../format';
import type { SchedulerJobRowDto } from './types';

const ONE_MINUTE = 60_000;

/**
 * Scheduler Jobs tile — pulls the EOS Scheduler dashboard's live
 * `rawDataSet` via the Horizon API (`IEosSchedulerClient` does the HTML
 * scrape) and renders each job group with a saturated severity pill.
 *
 * Per-row Run / Cancel buttons trigger the POST endpoints. Native
 * confirm() guards against one-click oops; full audit-table integration
 * is deferred but each call is structured-logged on the API side with
 * the caller's username.
 *
 * Refresh cadence: 60s. After a manual Run/Cancel, we invalidate the
 * cache key so the next refetch hits the snapshot fresh.
 */
export function SchedulerJobsTile() {
  const { currentLegalEntityId } = useAuth();
  const qc = useQueryClient();

  const { data, isPending, error } = useQuery({
    queryKey: ['support-tile', 'scheduler-jobs', currentLegalEntityId],
    queryFn: () => tilesApi.schedulerJobs(),
    enabled: !!currentLegalEntityId,
    staleTime: ONE_MINUTE,
    refetchInterval: ONE_MINUTE,
  });

  const value = data?.value;
  const status = data?.status;
  const tileStatus = statusToHorizonTile(status);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['support-tile', 'scheduler-jobs', currentLegalEntityId] });

  const runMutation = useMutation({
    mutationFn: (id: number) => tilesApi.runSchedulerJob(id),
    onSettled: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => tilesApi.cancelSchedulerJob(id),
    onSettled: invalidate,
  });

  const pendingRowId =
    runMutation.isPending     ? runMutation.variables ?? null
    : cancelMutation.isPending ? cancelMutation.variables ?? null
    : null;

  return (
    <Tile status={tileStatus} accentStrip>
      <TileHeader
        title="EOD Run Status"
        subtitle={value?.statusSummary ?? 'Scheduler · scheduled job groups in next-run order'}
        status={tileStatus}
        cadence="1min"
      />
      <TileBody loading={isPending} padding="none">
        {error && (
          <p className="px-3 py-2 m-0 text-xs text-rag-red">
            {(error as Error).message}
          </p>
        )}

        {!error && data?.emptyStateExplanation && (!value || value.groups.length === 0) && (
          <p className="px-3 py-2 m-0 text-xs italic text-muted-foreground">
            {data.emptyStateExplanation}
          </p>
        )}

        {!error && value && value.groups.length > 0 && (
          <div className="overflow-y-auto h-full">
            <table className="w-full text-xs" data-testid="scheduler-jobs-table">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-3 py-1 text-left text-[8px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Job</th>
                  <th className="px-3 py-1 text-right text-[8px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Last Run</th>
                  <th className="px-3 py-1 text-center text-[8px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                  <th className="px-3 py-1 text-right text-[8px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}></th>
                </tr>
              </thead>
              <tbody>
                {value.groups.map((row) => (
                  <SchedulerRow
                    key={row.id}
                    row={row}
                    isPending={pendingRowId === row.id}
                    onRun={() => {
                      if (window.confirm(`Run scheduler group "${row.name}" (#${row.id}) now?`)) {
                        runMutation.mutate(row.id);
                      }
                    }}
                    onCancel={() => {
                      if (window.confirm(`Cancel running scheduler group "${row.name}" (#${row.id})?`)) {
                        cancelMutation.mutate(row.id);
                      }
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TileBody>
      <TileFooter
        asOf={data?.asOf}
        drillDownTo={value?.baseUrl ?? data?.drillDownUrl ?? '/support/environment'}
        drillDownLabel="Open scheduler"
      />
    </Tile>
  );
}

function SchedulerRow({
  row, isPending, onRun, onCancel,
}: {
  row: SchedulerJobRowDto;
  isPending: boolean;
  onRun: () => void;
  onCancel: () => void;
}) {
  const tone = severityToTone(row.severity);
  const isRunning = row.status === 'Running' || row.status === 'Cancelling' || row.severity === 'warn';

  return (
    <tr
      data-testid="scheduler-job-row"
      data-severity={row.severity}
      data-id={row.id}
      className="border-b border-border-subtle last:border-b-0 hover:bg-sidebar-hover"
    >
      <td style={{ paddingBlock: 'var(--density-cell-padding-y)', paddingInline: 'var(--density-cell-padding-x)' }}>
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Mono size="xs" tone="tertiary">#{row.id}</Mono>
            <Text size="xs" tone="primary" weight={600} truncate>{row.name}</Text>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Mono size="xs" tone="tertiary" title={row.nextRunUtc ?? undefined}>
              {formatNextRun(row.nextRunUtc)}
            </Mono>
            {tone ? (
              <StatusPill kind="severity" tone={tone} label={(row.status ?? '—').toUpperCase()} />
            ) : (
              <Text size="xs" tone="tertiary" weight={600}>{(row.status ?? '—').toUpperCase()}</Text>
            )}
            {isRunning ? (
              <ActionButton
                kind="cancel"
                onClick={onCancel}
                disabled={isPending}
                testId="scheduler-cancel-btn"
                label={isPending ? '…' : 'Cancel'}
              />
            ) : (
              <ActionButton
                kind="run"
                onClick={onRun}
                disabled={isPending}
                testId="scheduler-run-btn"
                label={isPending ? '…' : 'Run'}
              />
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

function formatNextRun(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  // Compact relative-time render — operators care about "when next" not
  // the full timestamp; the title attribute holds the ISO for the
  // tooltip / forensic case.
  const diffMs = d.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const mins = Math.round(abs / 60_000);
  const hrs  = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);
  let body: string;
  if (days >= 1)      body = `${days}d`;
  else if (hrs  >= 1) body = `${hrs}h`;
  else if (mins >= 1) body = `${mins}m`;
  else                body = '<1m';
  return diffMs >= 0 ? `in ${body}` : `${body} ago`;
}

function ActionButton({
  kind, onClick, disabled, testId, label,
}: {
  kind: 'run' | 'cancel';
  onClick: () => void;
  disabled: boolean;
  testId: string;
  label: string;
}) {
  // Saturated tone per kind so colour is information: run = green-go,
  // cancel = red-stop. Disabled state stays neutral.
  const base = 'font-semibold uppercase tracking-wider rounded-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 border-0';
  const btnStyle = { fontSize: 'var(--density-font-size)', paddingBlock: 'var(--density-cell-padding-y)', paddingInline: 'var(--density-cell-padding-x)' };
  const tone = kind === 'run'
    ? 'bg-rag-green/20 text-rag-green hover:bg-rag-green/30'
    : 'bg-rag-red/20   text-rag-red   hover:bg-rag-red/30';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={`${base} ${tone}`}
      style={btnStyle}
    >
      {label}
    </button>
  );
}

function severityToTone(s: SchedulerJobRowDto['severity']): SeverityTone | null {
  if (s === 'pass') return 'pass';
  if (s === 'warn') return 'warn';
  if (s === 'fail') return 'fail';
  return null;
}
