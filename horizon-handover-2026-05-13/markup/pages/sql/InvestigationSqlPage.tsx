import { useCallback, useMemo, useState } from 'react';
import { Surface, Text, Toolbar } from '../../../horizon';
import type { SnippetCatalogueEntryDto } from './api';
import { ChecksTable } from './sections/ChecksTable';
import { CheckDetailPanel } from './sections/CheckDetailPanel';
import { runStateFromError, runStateFromResult, type CheckRunState } from './runState';
import { useRunSnippet, useSnippets } from './hooks';

/**
 * `/support/sql` — the v40 SQL Checks dashboard. The catalogue + audited
 * execution drive off t_RPT_Report (filter ReportTypeId=9) on the backend.
 * Each check is a row; clicking Run executes the check and updates the
 * row's last-run RAG state. Selecting a row reveals the bottom panel
 * with Results / SQL tabs.
 */
export function InvestigationSqlPage() {
  const { data, isLoading, error } = useSnippets();
  const snippets = useMemo<SnippetCatalogueEntryDto[]>(() => data ?? [], [data]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [runStates, setRunStates] = useState<Record<string, CheckRunState | undefined>>({});
  const [paramValues, setParamValues] = useState<Record<string, Record<string, string>>>({});

  const run = useRunSnippet();

  const selected = snippets.find(s => s.snippetId === selectedId) ?? null;

  const setRunState = useCallback((id: string, state: CheckRunState | undefined) => {
    setRunStates(prev => ({ ...prev, [id]: state }));
  }, []);

  const handleRun = useCallback(async (snippetId: string) => {
    const snippet = snippets.find(s => s.snippetId === snippetId);
    if (!snippet) return;

    setRunState(snippetId, {
      running: true, outcome: 'None', rowCount: 0, durationMs: 0,
      truncated: false, completedAt: new Date().toISOString(),
    });
    setSelectedId(snippetId);

    const args = paramValues[snippetId] ?? defaultArgs(snippet);
    try {
      const result = await run.mutateAsync({ snippetId, args });
      setRunState(snippetId, runStateFromResult(result));
    } catch (e) {
      setRunState(snippetId, runStateFromError(e instanceof Error ? e : new Error(String(e))));
    }
  }, [snippets, paramValues, run, setRunState]);

  const handleParamChange = useCallback((snippetId: string, name: string, value: string) => {
    setParamValues(prev => ({
      ...prev,
      [snippetId]: { ...(prev[snippetId] ?? {}), [name]: value },
    }));
  }, []);

  const lastRunSummary = useMemo(() => summariseLastRun(runStates), [runStates]);

  return (
    <div className="flex flex-col h-full" data-testid="investigation-sql-page">
      <div className="flex-1 overflow-hidden flex flex-col px-6 py-5 gap-4">
        {error && (
          <div
            className="bg-rag-red/10 text-rag-red border border-rag-red/30 rounded-md px-3 py-2 text-xs"
            data-testid="sql-catalogue-error"
          >
            <strong>Catalogue load failed.</strong> {(error as Error).message}
          </div>
        )}

        <Toolbar
          trailing={
            <Text size="xs" tone="tertiary">
              {lastRunSummary}
            </Text>
          }
        >
          <Text role="label" size="xs" tone="tertiary" uppercase weight={600}>
            SQL Checks · {snippets.length} {snippets.length === 1 ? 'check' : 'checks'}
            {isLoading && ' · loading'}
          </Text>
        </Toolbar>

        <Surface tone="raised" className="rounded-md flex-1 overflow-auto">
          <ChecksTable
            rows={snippets}
            runStates={runStates}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onRun={handleRun}
          />
        </Surface>

        {selected && (
          <CheckDetailPanel
            snippet={selected}
            state={runStates[selected.snippetId]}
            paramValues={paramValues[selected.snippetId] ?? defaultArgs(selected)}
            onParamChange={(name, value) => handleParamChange(selected.snippetId, name, value)}
            onRun={() => handleRun(selected.snippetId)}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}

function defaultArgs(snippet: SnippetCatalogueEntryDto): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of snippet.parameters) {
    if (p.type === 'LegalEntityId') continue;
    if (p.default !== null) out[p.name] = p.default;
  }
  return out;
}

function summariseLastRun(states: Record<string, CheckRunState | undefined>): string {
  const ran = Object.values(states).filter((s): s is CheckRunState => s !== undefined && !s.running);
  if (ran.length === 0) return 'No checks run yet';
  const pass = ran.filter(s => s.outcome === 'Pass').length;
  const warn = ran.filter(s => s.outcome === 'Warn').length;
  const fail = ran.filter(s => s.outcome === 'Fail' || s.error).length;
  return `${ran.length} run · ${pass} pass · ${warn} warn · ${fail} fail`;
}
