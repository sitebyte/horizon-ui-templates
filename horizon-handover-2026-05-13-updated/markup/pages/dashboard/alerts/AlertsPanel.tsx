import { AlertRow, Hairline, Text } from '../../../../horizon';
import { useDashboardAlerts } from './hooks';

interface Props {
  /** Limit how many rows the panel renders. Hidden alerts surface as a
   *  "+N more not shown" footer. v41 column 3 caps at 4. Defaults to 12. */
  cap?: number;
}

/**
 * Alerts panel — rendered view of the dashboard's `useDashboardAlerts()`
 * hook. The hook owns aggregation; this component owns presentation.
 *
 * Visual: each row is a full-card severity-tinted block via the horizon
 * `<AlertRow>` primitive. Capped to `cap` rows so the panel stays
 * scannable; if more fire, the count banner tells the operator how many
 * are hidden.
 */
export function AlertsPanel({ cap = 12 }: Props) {
  const { alerts, fail, warn, isPending } = useDashboardAlerts();

  const visible = alerts.slice(0, cap);
  const hidden = alerts.length - visible.length;

  return (
    <div
      data-testid="alerts-panel"
      className="bg-card border border-border rounded-md flex flex-col h-full overflow-hidden"
    >
      <header className="flex items-start justify-between gap-3 px-3 pt-3 pb-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <Text role="label" size="xs" tone="tertiary" uppercase weight={600}>
            Alerts
          </Text>
          {alerts.length > 0 && fail > 0 && (
            <Text role="label" size="xs" tone="rag-red" uppercase weight={600}>
              {fail} FAIL
            </Text>
          )}
          {alerts.length > 0 && warn > 0 && (
            <Text role="label" size="xs" tone="rag-amber" uppercase weight={600}>
              {fail > 0 ? '· ' : ''}{warn} WARN
            </Text>
          )}
        </div>
      </header>
      <Hairline tone="subtle" />
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isPending && alerts.length === 0 && (
          <p className="px-3 py-2 m-0 text-xs text-muted-foreground">Loading…</p>
        )}
        {!isPending && alerts.length === 0 && (
          <p className="px-3 py-2 m-0 text-xs text-muted-foreground">All clear — nothing firing.</p>
        )}
        {visible.map((alert) => (
          <AlertRow
            key={alert.id}
            severity={alert.severity}
            title={alert.title}
            detail={alert.detail}
            to={alert.drillDownTo}
          />
        ))}
        {hidden > 0 && (
          <p className="px-3 py-2 m-0 text-xs italic text-muted-foreground">
            +{hidden} more not shown
          </p>
        )}
      </div>
    </div>
  );
}
