import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useAuth } from '../../../../auth/AuthContext';
import { auditActionsApi } from '../api';
import type { LogActionItem, PropertyDifference } from '../types';
import { horizonGridTheme } from '../../../../../ag-grid-theme';

function formatDiffValue(v: unknown): string {
  if (v == null) return '\u2014';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v))
    return new Date(v).toLocaleDateString('en-GB');
  return String(v);
}

function formatSectionTitle(sectionName: string): string {
  return sectionName.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
}

function ChangesRenderer(params: ICellRendererParams<LogActionItem>) {
  const changes: PropertyDifference[] = params.value ?? [];
  if (changes.length === 0) return <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Created</span>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 12px', alignItems: 'center', height: '100%' }}>
      {changes.map((c) => (
        <span key={c.propertyName} style={{ fontSize: 12 }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>{c.propertyName}: </span>
          <span style={{ textDecoration: 'line-through', color: 'var(--color-text-tertiary)' }}>
            {formatDiffValue(c.oldValue)}
          </span>
          <span>{' \u2192 '}</span>
          <span>{formatDiffValue(c.newValue)}</span>
        </span>
      ))}
    </div>
  );
}

export function ActionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentLegalEntityId } = useAuth();
  const actionId = Number(id);

  const { data: action, isPending, error } = useQuery({
    queryKey: ['audit-actions', currentLegalEntityId, actionId],
    queryFn: () => auditActionsApi.getAction(actionId),
    enabled: !!currentLegalEntityId && !isNaN(actionId),
  });

  const sections = action?.relatedSections ?? [];

  const sectionQueries = useQueries({
    queries: sections.map((s) => ({
      queryKey: ['audit-actions', currentLegalEntityId, actionId, 'items', s.sectionName],
      queryFn: () => auditActionsApi.listActionItems(actionId, s.sectionName),
      enabled: !!currentLegalEntityId && !isNaN(actionId),
    })),
  });

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/support/audit/actions')}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-raised)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1
              className="font-['DM_Serif_Display'] text-2xl"
              style={{ color: 'var(--color-text)' }}
            >
              Action {id}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
              Audit log detail
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-5">
        {isPending && (
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Loading...</p>
        )}

        {error && (
          <div
            className="p-3 rounded text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
          >
            <p className="font-semibold">Error loading action</p>
            <pre className="mt-1 text-xs">{(error as Error).message}</pre>
          </div>
        )}

        {action && (
          <div className="space-y-5">
            <div
              className="rounded-lg px-5 py-3 flex flex-wrap gap-x-8 gap-y-2"
              style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }}
            >
              <Field label="Date" value={new Date(action.actionDate).toLocaleString('en-GB')} />
              <Field label="User" value={action.personName} />
              <Field label="Function" value={action.functionName} />
              <Field label="Description" value={action.functionDescription} />
              <Field label="Scenario" value={action.scenarioName} />
              <Field label="Source" value={action.sourceId != null ? String(action.sourceId) : null} />
              <Field
                label="Success"
                value={action.success === null ? 'N/A' : action.success ? 'Yes' : 'No'}
              />
            </div>

            {sections.map((section, i) => (
              <ItemsGrid
                key={section.sectionName}
                title={formatSectionTitle(section.sectionName)}
                items={sectionQueries[i]?.data ?? []}
                isLoading={sectionQueries[i]?.isPending ?? false}
                count={section.sectionCount}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ItemsGrid({
  title,
  items,
  isLoading,
  count,
}: {
  title: string;
  items: LogActionItem[];
  isLoading: boolean;
  count: number;
}) {
  const columnDefs = useMemo<ColDef<LogActionItem>[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 180 },
      { field: 'changes', headerName: 'Changes', flex: 1, minWidth: 300, cellRenderer: ChangesRenderer },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({ sortable: true, resizable: true }),
    [],
  );

  return (
    <div>
      <h2
        className="text-xs font-medium uppercase tracking-[0.12em] mb-3"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {title} ({count})
      </h2>
      <div
        className="rounded-lg overflow-hidden"
        style={{ height: Math.min(320, 32 + items.length * 28 + 2), border: '1px solid var(--color-border)' }}
      >
        <AgGridReact<LogActionItem>
          theme={horizonGridTheme}
          rowData={items}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          loading={isLoading}
          suppressCellFocus
          headerHeight={32}
          rowHeight={28}
          getRowId={(params) => `${params.data.actionId}-${params.data.id}`}
        />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt
        className="text-[10px] font-medium uppercase tracking-[0.12em]"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {label}
      </dt>
      <dd className="text-sm mt-0.5" style={{ color: 'var(--color-text)' }}>
        {value || '\u2014'}
      </dd>
    </div>
  );
}
