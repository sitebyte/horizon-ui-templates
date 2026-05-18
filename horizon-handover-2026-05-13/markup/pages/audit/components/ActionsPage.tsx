import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Stack, Text } from '../../../../../horizon';
import { auditActionsApi } from '../api';
import type { LogActionFilters } from '../types';
import { AuditSearchBar } from './AuditSearchBar';
import { ActionsTable } from './ActionsTable';
import { AuditPagination } from './AuditPagination';

const PAGE_SIZE = 50;

function parseFilters(params: URLSearchParams): LogActionFilters {
  return {
    search: params.get('search') ?? undefined,
    username: params.get('username') ?? undefined,
    functionName: params.get('functionName') ?? undefined,
    dateFrom: params.get('dateFrom') ?? undefined,
    dateTo: params.get('dateTo') ?? undefined,
  };
}

function parsePage(params: URLSearchParams): number {
  const v = parseInt(params.get('page') ?? '', 10);
  return v > 0 ? v : 1;
}

export function ActionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const page = parsePage(searchParams);

  // No legal-entity scoping: the handler is GlobalCrossTenant
  // (t_LOG_Action has no LegalEntityId). Mirroring filter-options below —
  // no LE in the cache key, no LE gate. Tenant-isolation invalidation in
  // AuthContext still applies via the cross-cutting invalidateQueries().
  const optionsQuery = useQuery({
    queryKey: ['audit-actions', 'filter-options'],
    queryFn: ({ signal }) => auditActionsApi.getFilterOptions(signal),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const actionsQuery = useQuery({
    queryKey: ['audit-actions', page, filters],
    queryFn: ({ signal }) => auditActionsApi.listActions(page, PAGE_SIZE, filters, signal),
    refetchOnWindowFocus: false,
  });

  const updateUrl = useCallback((next: { page?: number; filters?: LogActionFilters }) => {
    setSearchParams((prev) => {
      const out = new URLSearchParams(prev);
      const f = next.filters;
      if (f) {
        const setOrDelete = (key: string, value: string | undefined) => {
          if (value && value.length > 0) out.set(key, value);
          else out.delete(key);
        };
        setOrDelete('search', f.search);
        setOrDelete('username', f.username);
        setOrDelete('functionName', f.functionName);
        setOrDelete('dateFrom', f.dateFrom);
        setOrDelete('dateTo', f.dateTo);
      }
      const targetPage = next.page ?? (f !== undefined ? 1 : page);
      if (targetPage > 1) out.set('page', String(targetPage));
      else out.delete('page');
      return out;
    }, { replace: true });
  }, [setSearchParams, page]);

  const items = actionsQuery.data?.items ?? [];
  const totalCount = actionsQuery.data?.totalCount ?? 0;

  return (
    <div className="flex flex-col h-full" data-testid="audit-actions-page">
      <div className="px-6 py-4 border-b border-border">
        <Stack gap={0}>
          <Text role="heading" size="xl" weight={500}>Audit Search</Text>
          <Text size="sm" tone="secondary">
            Top-level actions logged by EOS — click a row to drill into the linked field changes.
            Recorded successful actions only; denials are not captured by EOS today.
          </Text>
        </Stack>
      </div>

      <AuditSearchBar
        key={`${filters.search ?? ''}|${filters.username ?? ''}|${filters.functionName ?? ''}|${filters.dateFrom ?? ''}|${filters.dateTo ?? ''}`}
        initial={filters}
        usernames={optionsQuery.data?.usernames ?? []}
        functionNames={optionsQuery.data?.functionNames ?? []}
        optionsLoading={optionsQuery.isLoading}
        onApply={(f) => updateUrl({ page: 1, filters: f })}
        onReset={() => updateUrl({ page: 1, filters: {} })}
      />

      {actionsQuery.error && (
        <div
          data-testid="audit-actions-error"
          className="mx-6 mt-3 p-3 rounded text-sm border border-rag-red/30 bg-rag-red/10 text-rag-red"
        >
          <p className="font-semibold">Error loading audit actions</p>
          <pre className="mt-1 text-xs whitespace-pre-wrap">{(actionsQuery.error as Error).message}</pre>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto">
        <ActionsTable rows={items} isLoading={actionsQuery.isLoading} />
      </div>

      <AuditPagination
        page={page}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={(p) => updateUrl({ page: p })}
      />
    </div>
  );
}
