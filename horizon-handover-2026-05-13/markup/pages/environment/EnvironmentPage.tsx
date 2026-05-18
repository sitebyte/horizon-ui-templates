import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api/client';
import { systemApi, type SystemInfo } from '../../../api/system';
import './topology.css';

/* ============================================================
   Types — mirror of horizon-v38/environments/prod.json
   ============================================================ */

type NodeStatus = 'healthy' | 'degraded' | 'down' | 'offline' | 'manual';
type FlowSchedule = 'Continuous' | 'Daily' | 'Batch' | 'Manual' | 'Ad-hoc';

interface NodeTypeConfig {
  label: string;
  shape: 'pill' | 'circle' | 'rect' | 'hexagon' | 'rounded-xl' | 'rounded';
  size: 'sm' | 'md' | 'lg' | 'xl';
  borderStyle: 'solid' | 'dashed';
  borderColor: string;
  glowColor: string;
  icon?: string;
}

interface NodeHealth {
  checkUrl: string | null;
  lastCheck: string | null;
  latencyMs: number | null;
  responseCode: number | null;
  message: string | null;
  upSince: string | null;
  uptimePercent: number | null;
}

interface NodeMetrics {
  messagesPerHour: number;
  errorsLast24h: number;
  avgLatencyMs: number | null;
}

interface NodeMetadata {
  endpoint?: string | null;
  technology?: string | null;
  owner?: string | null;
  criticality?: 'critical' | 'high' | 'medium' | 'low';
  container?: { image: string; pod: string; cpuPercent?: number; memoryMb?: number; restarts?: number };
  broker?: { queues: number; consumers: number; unackedMessages: number };
  core?: { trades: number; cargoes: number; activeUsers: number; dbConnections?: number };
}

interface PrototypeNode {
  id: string;
  name: string;
  description: string;
  type: string;
  position: { x: number; y: number };
  status: NodeStatus;
  health: NodeHealth;
  metrics: NodeMetrics;
  metadata: NodeMetadata;
  issue: string | null;
}

interface DataFlow {
  id: string;
  name: string;
  description?: string;
  path: string[];
  bidirectional?: boolean;
  messageTypes?: string[];
  volume?: number;
  schedule?: FlowSchedule;
  annotation?: string | null;
}

interface PrototypeEnvironment {
  environment: { id: string; name: string; label: string; region: string; color: string; url: string };
  versions: { eos: string; horizon: string; database: string; rabbitmq: string; kubernetes?: string };
  asOf: string;
  nodeTypes: Record<string, NodeTypeConfig>;
  systems: PrototypeNode[];
  integrationComponents: PrototypeNode[];
  dataFlows: DataFlow[];
  rabbitMq?: { queues?: Array<{ name: string; messages: number; consumers: number; rate: number; unacked: number; status: string }> };
  healthChecks?: Array<{ id: string; targetNode: string; lastResult?: { status: 'pass' | 'warn' | 'fail' | 'unknown' } }>;
}

/* Resolved env identity for the running Horizon deployment. Built from
   /api/system/info (canonical source) with mock-fixture fallbacks for
   fields the API doesn't yet expose. */
interface LiveEnv {
  name: string;             // Display label, e.g. "TST2"
  label: string;            // Short label for badges, e.g. "TST2"
  color: string;            // CSS colour for env-tinted accents
  eosVersion: string;
  databaseVersion: string;
  database: string | null;  // SQL Server database catalogue
  server: string | null;    // SQL Server hostname (used as region-ish chip)
}

function liveEnvFromSystemInfo(
  info: SystemInfo | undefined,
  fallback: PrototypeEnvironment,
): LiveEnv {
  const envName = info?.environment ?? fallback.environment.label;
  const upper = envName.toUpperCase();
  // PROD/PRODUCTION → green, UAT → amber, anything else → muted neutral
  const color =
    upper === 'PROD' || upper === 'PRODUCTION'
      ? 'var(--green)'
      : upper === 'UAT'
      ? 'var(--amber)'
      : 'var(--text-tertiary)';
  return {
    name: envName,
    label: envName,
    color,
    eosVersion: info?.wcfVersion ?? fallback.versions.eos,
    databaseVersion: info?.databaseVersion ?? fallback.versions.database,
    database: info?.database ?? null,
    server: info?.server ?? null,
  };
}

/* Real probe-API DTO shape (current backend). */
type RealProbeStatus = 'Ok' | 'Degraded' | 'Down' | 'Unknown';
interface RealProbeNode {
  probeId: string;
  name: string;
  subtitle: string;
  nodeType: string;
  status: RealProbeStatus;
  statusSummary: string;
  lastChecked: string;
  details?: Array<{ label: string; value: string; mono?: boolean; tone?: string | null }>;
}
interface RealTopology { nodes: RealProbeNode[]; edges: Array<{ from: string; to: string }>; asOf: string }

/* ============================================================
   Probe → mock node id mapping. Probe IDs from the backend
   probe registry; mock IDs from prototype prod.json (with
   eos-db + keycloak added).
   ============================================================ */
const PROBE_TO_MOCK_ID: Record<string, string> = {
  db:        'eos-db',
  wcf:       'eos',
  scheduler: 'eos-scheduler',
  keycloak:  'keycloak',
};

function realStatusToMock(s: RealProbeStatus): NodeStatus {
  switch (s) {
    case 'Ok':       return 'healthy';
    case 'Degraded': return 'degraded';
    case 'Down':     return 'offline';
    case 'Unknown':  return 'manual';
  }
}

/* ============================================================
   Data fetchers
   ============================================================ */

async function fetchTopologyMock(): Promise<PrototypeEnvironment> {
  // Single-env app — there is one Horizon deployment per environment, and
  // the page only ever describes the env *this* Horizon is pointing to.
  // Topology shape (nodes, edges, queues, healthChecks, sample messages)
  // is sourced from a static fixture; env identity (name, versions) comes
  // from /api/system/info, see fetchSystemInfo below.
  const r = await fetch('/mock/environments/topology.json');
  if (!r.ok) throw new Error(`Topology fixture HTTP ${r.status}`);
  return r.json();
}

async function fetchRealTopology(): Promise<RealTopology | null> {
  try {
    return await api.get<RealTopology>('/support/environment/topology');
  } catch {
    return null;
  }
}

/* ============================================================
   Adapter — overlay real probe statuses onto mock nodes
   ============================================================ */

interface ViewModel {
  env: PrototypeEnvironment;
  nodes: PrototypeNode[];
  asOf: string;
  realDataAvailable: boolean;
}

function buildViewModel(mock: PrototypeEnvironment, real: RealTopology | null): ViewModel {
  const allNodes = [...mock.systems, ...mock.integrationComponents];
  if (!real) {
    return { env: mock, nodes: allNodes, asOf: mock.asOf, realDataAvailable: false };
  }

  const realByMockId = new Map<string, RealProbeNode>();
  for (const probe of real.nodes) {
    const mockId = PROBE_TO_MOCK_ID[probe.probeId];
    if (mockId) realByMockId.set(mockId, probe);
  }

  const overlaid = allNodes.map((n) => {
    const probe = realByMockId.get(n.id);
    if (!probe) return n;
    const status = realStatusToMock(probe.status);
    const latency =
      probe.details?.find((d) => /latency/i.test(d.label))?.value?.replace(/[^\d]/g, '');
    return {
      ...n,
      status,
      health: {
        ...n.health,
        lastCheck: probe.lastChecked,
        message: probe.statusSummary,
        latencyMs: latency ? parseInt(latency, 10) : n.health.latencyMs,
      },
      issue: status !== 'healthy' ? probe.statusSummary : n.issue,
    };
  });

  return { env: mock, nodes: overlaid, asOf: real.asOf, realDataAvailable: true };
}

/* ============================================================
   Helpers (port of prototype JS)
   ============================================================ */

function numberFormat(n: number): string {
  return n.toLocaleString('en-US');
}

function getNodeStyle(typeConfig: NodeTypeConfig | undefined): React.CSSProperties {
  if (!typeConfig) return {};
  const style: React.CSSProperties = {};
  if (typeConfig.shape === 'pill') style.borderRadius = '2rem';
  else if (typeConfig.shape === 'circle') {
    style.borderRadius = '50%';
    style.width = '2.5rem';
    style.height = '2.5rem';
  } else if (typeConfig.shape === 'hexagon') {
    style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
  } else if (typeConfig.shape === 'rounded-xl') style.borderRadius = 'var(--radius-xl)';
  else if (typeConfig.shape === 'rounded') style.borderRadius = 'var(--radius-md)';
  else style.borderRadius = 'var(--radius-sm)';

  if (typeConfig.borderStyle) style.borderStyle = typeConfig.borderStyle;
  if (typeConfig.borderColor) {
    style.borderColor = typeConfig.borderColor;
    style.borderWidth = typeConfig.size === 'xl' || typeConfig.size === 'lg' ? '2px' : '1px';
  }

  if (typeConfig.size === 'xl') {
    // EOS centre — should clearly anchor the diagram.
    style.minWidth = '12rem';
    style.minHeight = '7.5rem';
  } else if (typeConfig.size === 'lg') {
    style.minWidth = '6rem';
    style.minHeight = '3.5rem';
    style.padding = '0.75rem 1.5rem';
  } else if (typeConfig.size === 'sm') {
    style.minWidth = '2.5rem';
  } else {
    style.minWidth = '5rem';
    style.minHeight = '1.75rem';
  }
  return style;
}

/**
 * Squashes a 0–100 prototype X position into a 5–95 visual band so
 * leftmost externals (x=3 in the seed) and rightmost destinations
 * (x=85) sit fully inside the canvas. With `transform: translate(-50%,
 * -50%)` on each node, raw x=3 puts half the node off the left edge
 * — visually the diagram looked left-clipped. The squash centres
 * everything horizontally without rebalancing vertical layout.
 */
function squashX(x: number): number {
  return 5 + (x / 100) * 90;
}

interface EdgePair { from: string; to: string; label: string; volume: number; schedule: FlowSchedule }

function getFlowPairs(env: PrototypeEnvironment): EdgePair[] {
  const pairs: EdgePair[] = [];
  for (const flow of env.dataFlows) {
    const path = flow.path;
    for (let i = 0; i < path.length - 1; i++) {
      pairs.push({
        from: path[i],
        to: path[i + 1],
        label: i === 0 || i === path.length - 2 ? flow.name : '',
        volume: flow.volume ?? 0,
        schedule: flow.schedule ?? 'Continuous',
      });
    }
  }
  // Dedupe — first label per from→to wins
  const seen = new Map<string, EdgePair>();
  for (const p of pairs) {
    const k = `${p.from}>${p.to}`;
    if (!seen.has(k)) seen.set(k, p);
    else if (p.label && !seen.get(k)!.label) seen.set(k, p);
  }
  return Array.from(seen.values());
}

function edgeClasses(from: PrototypeNode, to: PrototypeNode, schedule: FlowSchedule): string {
  if (from.status === 'offline' || to.status === 'offline') return 'flow-offline';
  if (schedule === 'Manual') return 'flow-manual';
  const cls = ['flow-active'];
  if (from.type === 'broker' || to.type === 'broker') cls.push('flow-orange');
  else if (to.type === 'destination') cls.push('flow-violet');
  else if (from.type === 'glint' || to.type === 'glint') cls.push('flow-green');
  return cls.join(' ');
}

function buildHealthMap(env: PrototypeEnvironment): Record<string, 'pass' | 'warn' | 'fail' | 'unknown'> {
  const out: Record<string, 'pass' | 'warn' | 'fail' | 'unknown'> = {};
  if (!env.healthChecks) return out;
  const rank = { fail: 3, warn: 2, pass: 1, unknown: 0 } as const;
  for (const hc of env.healthChecks) {
    const s = hc.lastResult?.status ?? 'unknown';
    const cur = out[hc.targetNode];
    if (!cur || rank[s] > rank[cur]) out[hc.targetNode] = s;
  }
  return out;
}

/* ============================================================
   Page component
   ============================================================ */

type TabId = 'map' | 'tracer' | 'dashboard' | 'health';

export function EnvironmentPage() {
  const [activeTab, setActiveTab] = useState<TabId>('map');
  const [selectedNode, setSelectedNode] = useState<PrototypeNode | null>(null);

  const mockQ = useQuery({
    queryKey: ['env', 'topology-fixture'],
    queryFn: fetchTopologyMock,
    staleTime: Infinity,
  });

  const realQ = useQuery({
    queryKey: ['env', 'real-topology'],
    queryFn: fetchRealTopology,
    refetchInterval: 30_000,
  });

  // Real env identity (name, EOS / DB versions, server, db) comes from
  // /api/system/info — that's the env Horizon is actually pointing to.
  // The mock fixture's `environment` block + `versions.{eos,database}`
  // are no longer rendered.
  const systemInfoQ = useQuery({
    queryKey: ['env', 'system-info'],
    queryFn: () => systemApi.info(),
    staleTime: 60_000,
  });

  const view = useMemo<ViewModel | null>(() => {
    if (!mockQ.data) return null;
    return buildViewModel(mockQ.data, realQ.data ?? null);
  }, [mockQ.data, realQ.data]);

  const healthMap = useMemo(() => (view ? buildHealthMap(view.env) : {}), [view]);

  const kpis = useMemo(() => {
    if (!view) return null;
    let healthy = 0, total = 0, glint = 0, msgPerHour = 0;
    const degraded: string[] = [];
    for (const n of view.nodes) {
      if (n.status !== 'manual') total++;
      if (n.status === 'healthy') healthy++;
      if (n.type === 'glint' && n.status !== 'offline') glint++;
      if (n.status === 'degraded') degraded.push(n.name);
      msgPerHour += n.metrics?.messagesPerHour ?? 0;
    }
    const queueCount = view.env.rabbitMq?.queues?.length ?? 0;
    let failingChecks = 0;
    for (const hc of view.env.healthChecks ?? []) {
      const s = hc.lastResult?.status;
      if (s === 'fail' || s === 'warn') failingChecks++;
    }
    return { healthy, total, glint, msgPerHour, degraded, queueCount, failingChecks };
  }, [view]);

  if (mockQ.isPending) {
    return (
      <div className="flex flex-col h-full" data-testid="environment-page">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold">Environment</h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading topology…</p>
        </div>
      </div>
    );
  }

  if (mockQ.error || !view || !kpis) {
    return (
      <div className="flex flex-col h-full" data-testid="environment-page">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold">Environment</h1>
          <div className="env-mock-banner" style={{ marginTop: 'var(--sp-3)' }}>
            <strong>FAILED</strong>
            <span>Could not load topology fixture: {(mockQ.error as Error | undefined)?.message ?? 'unknown error'}</span>
          </div>
        </div>
      </div>
    );
  }

  const env = view.env;
  const liveEnv = liveEnvFromSystemInfo(systemInfoQ.data, env);
  return (
    <div className="flex flex-col h-full" data-testid="environment-page">
      <div className="px-6 py-3 flex flex-col gap-3" style={{ overflow: 'auto' }}>

        {/* KPI strip */}
        <div className="hz-kpi-strip" id="kpi-strip" data-testid="env-kpi-strip">
          <span><span className="strip-label">Services</span><span className="strip-value"><span style={{ color: 'var(--green)' }}>{kpis.healthy}</span>/{kpis.total} Healthy</span></span>
          <span className="strip-sep">|</span>
          <span><span className="strip-label">Glint Containers</span><span className="strip-value">{kpis.glint} Running</span></span>
          <span className="strip-sep">|</span>
          <span><span className="strip-label">RabbitMQ Queues</span><span className="strip-value">{kpis.queueCount}</span></span>
          <span className="strip-sep">|</span>
          <span><span className="strip-label">Messages/hr</span><span className="strip-value">{numberFormat(kpis.msgPerHour)}</span></span>
          <span className="strip-sep">|</span>
          {kpis.degraded.length > 0 ? (
            <span><span className="strip-label">Degraded</span><span className="strip-value" style={{ color: 'var(--amber)' }}>{kpis.degraded.length} ({kpis.degraded.join(', ')})</span></span>
          ) : (
            <span><span className="strip-label">Degraded</span><span className="strip-value" style={{ color: 'var(--green)' }}>None</span></span>
          )}
          {kpis.failingChecks > 0 && (
            <>
              <span className="strip-sep">|</span>
              <span><span className="strip-label">Health Alerts</span><span className="strip-value" style={{ color: 'var(--red)' }}>{kpis.failingChecks}</span></span>
            </>
          )}
          <span className="strip-sep">|</span>
          <span><span className="strip-label">Environment</span><span className="strip-value" style={{ color: liveEnv.color }}>{liveEnv.label}</span></span>
        </div>

        {/* Mock-only banner if real probe API unavailable */}
        {!view.realDataAvailable && (
          <div className="env-mock-banner" data-testid="env-mock-banner">
            <strong>MOCK</strong>
            <span>Live probe data unavailable — rendering mock topology only. Real probe statuses (db / wcf / scheduler / keycloak) will overlay when the API recovers.</span>
          </div>
        )}

        {/* Env identity row — single env (no selector). Sourced from
            /api/system/info; mock fixture's environment block is unused. */}
        <div className="env-info" data-testid="environment-info-strip" style={{ borderColor: liveEnv.color }}>
          <span className="env-name" style={{ color: liveEnv.color }}>{liveEnv.name}</span>
          {liveEnv.server && <span className="env-region" data-testid="env-server">{liveEnv.server}</span>}
          <span className="env-versions">
            EOS {liveEnv.eosVersion}
            {' · '}DB {liveEnv.databaseVersion}
            {' · '}RMQ {env.versions.rabbitmq}
          </span>
          {liveEnv.database && <span className="env-url">{liveEnv.database}</span>}
        </div>

        {/* Topology section */}
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--sp-1)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            EOS System Topology
            <span className={`hz-badge ${liveEnv.color === 'var(--green)' ? 'green' : 'amber'}`} style={{ fontSize: '0.375rem' }}>{liveEnv.label}</span>
            <span className="hz-badge blue" style={{ fontSize: '0.375rem' }}>v{env.versions.horizon}</span>
            {view.realDataAvailable && (
              <span className="hz-badge green" style={{ fontSize: '0.375rem' }}>Live</span>
            )}
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 'var(--sp-3)' }} role="tablist" data-testid="env-tab-list">
            <button className={`topo-tab ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')} data-testid="env-tab-map">The Map</button>
            <button className={`topo-tab ${activeTab === 'tracer' ? 'active' : ''}`} onClick={() => setActiveTab('tracer')} data-testid="env-tab-tracer">Flow Tracer</button>
            <button className={`topo-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} data-testid="env-tab-dashboard">Dashboard</button>
            <button className={`topo-tab ${activeTab === 'health' ? 'active' : ''}`} onClick={() => setActiveTab('health')} data-testid="env-tab-health">Health Checks</button>
          </div>

          {/* Tab panels */}
          {activeTab === 'map' && (
            <MapView
              view={view}
              healthMap={healthMap}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
            />
          )}
          {activeTab === 'tracer' && (
            <FlowTracerView view={view} healthMap={healthMap} />
          )}
          {activeTab === 'dashboard' && (
            <DashboardView view={view} healthMap={healthMap} kpis={kpis} />
          )}
          {activeTab === 'health' && (
            <HealthChecksView env={view.env} />
          )}
        </div>

        {/* Queue Monitor (collapsible) */}
        <QueueMonitor env={view.env} />

        {/* Message Explorer (collapsible) */}
        <MessageExplorer nodeMap={(() => {
          const m = new Map<string, PrototypeNode>();
          for (const n of view.nodes) m.set(n.id, n);
          return m;
        })()} />
      </div>
    </div>
  );
}

/* ============================================================
   Queue Monitor (collapsible)
   ============================================================ */

function QueueMonitor({ env }: { env: PrototypeEnvironment }) {
  const [collapsed, setCollapsed] = useState(false);
  const queues = env.rabbitMq?.queues ?? [];

  return (
    <div data-testid="queue-monitor">
      <button
        type="button"
        className={`collapsible-header${collapsed ? ' collapsed' : ''}`}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className="collapse-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>Queue Monitor</span>
        <span className="hz-badge blue" style={{ fontSize: '0.375rem' }}>RabbitMQ</span>
      </button>
      {!collapsed && (
        <div className="queue-grid">
          {queues.length === 0 && (
            <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', padding: 'var(--sp-2)' }}>No queue data available</div>
          )}
          {queues.map((q) => {
            const cls =
              q.status === 'critical' ? 'queue-card critical' :
              q.status === 'backing-up' || q.messages > 100 ? 'queue-card backing-up' :
              'queue-card';
            const statusColor =
              q.status === 'critical' ? 'var(--red)' :
              q.status === 'backing-up' ? 'var(--amber)' :
              'var(--green)';
            return (
              <div key={q.name} className={cls} data-testid={`queue-card-${q.name}`}>
                <div className="q-name">{q.name}</div>
                <div className="q-row">
                  <span className="q-label">Messages</span>
                  <span className="q-val" style={q.messages > 100 ? { color: 'var(--red)', fontWeight: 700 } : undefined}>{q.messages}</span>
                </div>
                <div className="q-row">
                  <span className="q-label">Consumers</span>
                  <span className="q-val" style={q.consumers === 0 ? { color: 'var(--red)', fontWeight: 700 } : undefined}>{q.consumers}</span>
                </div>
                <div className="q-row">
                  <span className="q-label">Rate</span>
                  <span className="q-val">{q.rate} msg/s</span>
                </div>
                <div className="q-row">
                  <span className="q-label">Unacked</span>
                  <span className="q-val" style={q.unacked > 0 ? { color: 'var(--amber)' } : undefined}>{q.unacked}</span>
                </div>
                <div className="q-row">
                  <span className="q-label">Status</span>
                  <span className="q-val" style={{ color: statusColor }}>{q.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Message Explorer (collapsible)
   ============================================================ */

function MessageExplorer({ nodeMap }: { nodeMap: Map<string, PrototypeNode> }) {
  const [collapsed, setCollapsed] = useState(false);
  const [corId, setCorId] = useState('');
  const [msgType, setMsgType] = useState('');
  const [sourceSvc, setSourceSvc] = useState('');
  const [status, setStatus] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const messageTypeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const m of ARCHIVE_DATA) set.add(m.messageType);
    return Array.from(set).sort();
  }, []);
  const sourceOptions = useMemo(() => {
    const set = new Set<string>();
    for (const m of ARCHIVE_DATA) set.add(m.source);
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    if (!hasSearched) return [];
    const q = corId.trim().toLowerCase();
    return ARCHIVE_DATA.filter((m) => {
      if (q && !m.correlationId.toLowerCase().includes(q) && !m.entityId.toLowerCase().includes(q)) return false;
      if (msgType && m.messageType !== msgType) return false;
      if (sourceSvc && m.source !== sourceSvc) return false;
      if (status && m.status !== status) return false;
      return true;
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [hasSearched, corId, msgType, sourceSvc, status]);

  function runSearch() { setHasSearched(true); }

  return (
    <div data-testid="message-explorer">
      <button
        type="button"
        className={`collapsible-header${collapsed ? ' collapsed' : ''}`}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className="collapse-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>Message Explorer</span>
        <span className="hz-badge blue" style={{ fontSize: '0.375rem' }}>Archive Search</span>
      </button>
      {!collapsed && (
        <>
          <div className="msg-search-bar">
            <div className="msg-search-field" style={{ flex: 1.5, minWidth: '10rem' }}>
              <label>Correlation ID</label>
              <input
                type="text"
                placeholder="COR-T1001-..."
                value={corId}
                onChange={(e) => setCorId(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem' }}
              />
            </div>
            <div className="msg-search-field" style={{ minWidth: '8rem' }}>
              <label>Message Type</label>
              <select value={msgType} onChange={(e) => setMsgType(e.target.value)}>
                <option value="">All Types</option>
                {messageTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="msg-search-field" style={{ minWidth: '6rem' }}>
              <label>Date From</label>
              <input type="date" defaultValue="2026-05-02" />
            </div>
            <div className="msg-search-field" style={{ minWidth: '6rem' }}>
              <label>Date To</label>
              <input type="date" defaultValue="2026-05-07" />
            </div>
            <div className="msg-search-field" style={{ minWidth: '7rem' }}>
              <label>Source Service</label>
              <select value={sourceSvc} onChange={(e) => setSourceSvc(e.target.value)}>
                <option value="">All Sources</option>
                {sourceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="msg-search-field" style={{ minWidth: '5rem' }}>
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="msg-search-field">
              <button
                type="button"
                onClick={runSearch}
                style={{
                  height: '1.5rem',
                  fontSize: '0.5625rem',
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  padding: '0 var(--sp-3)',
                  fontWeight: 600,
                }}
              >
                Search
              </button>
            </div>
          </div>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '24rem', overflowY: 'auto' }}>
            <table className="msg-table">
              <thead>
                <tr>
                  <th style={{ width: '5.5rem' }}>Time</th>
                  <th style={{ width: '9rem' }}>Correlation ID</th>
                  <th>Type</th>
                  <th>Source → Destination</th>
                  <th className="r" style={{ width: '4rem' }}>Status</th>
                  <th className="r" style={{ width: '3rem' }}>Latency</th>
                </tr>
              </thead>
              <tbody>
                {!hasSearched && (
                  <tr><td colSpan={6} style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--sp-3)', fontFamily: 'var(--font-ui)' }}>
                    Enter search criteria and click Search.
                  </td></tr>
                )}
                {hasSearched && filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--sp-3)', fontFamily: 'var(--font-ui)' }}>
                    No messages match the search criteria.
                  </td></tr>
                )}
                {filtered.map((m, idx) => {
                  const time = m.timestamp.replace('T', ' ').substring(0, 19);
                  const last = m.route[m.route.length - 1];
                  const route = `${nodeMap.get(m.source)?.name ?? m.source} → ${nodeMap.get(last)?.name ?? last}`;
                  const isFailed = m.status === 'failed';
                  return (
                    <tr key={`${m.correlationId}-${idx}`}>
                      <td style={{ color: 'var(--text-muted)' }}>{time}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{m.correlationId}</td>
                      <td><span className="hz-badge blue" style={{ fontSize: '0.4375rem' }}>{m.messageType}</span></td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>{route}</td>
                      <td className="r"><span className={`hz-badge ${isFailed ? 'red' : 'green'}`} style={{ fontSize: '0.4375rem' }}>{isFailed ? 'Failed' : 'Delivered'}</span></td>
                      <td className="r" style={{ color: isFailed ? 'var(--red)' : 'var(--green)' }}>{m.latencyMs != null ? `${m.latencyMs}ms` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   Map view
   ============================================================ */

interface MapViewProps {
  view: ViewModel;
  healthMap: Record<string, 'pass' | 'warn' | 'fail' | 'unknown'>;
  selectedNode: PrototypeNode | null;
  onSelectNode: (n: PrototypeNode | null) => void;
}

function MapView({ view, healthMap, selectedNode, onSelectNode }: MapViewProps) {
  const env = view.env;
  const nodeMap = useMemo(() => {
    const m = new Map<string, PrototypeNode>();
    for (const n of view.nodes) m.set(n.id, n);
    return m;
  }, [view.nodes]);

  const flowPairs = useMemo(() => getFlowPairs(env), [env]);

  // Track the canvas's actual pixel size via ResizeObserver. The SVG
  // path / textPath labels need pixel coords to render at the right
  // font scale — the prototype does this with getBoundingClientRect.
  // viewBox="0 0 100 100" + preserveAspectRatio="none" stretched the
  // labels horribly because we draw on a wide canvas; pixel coords +
  // a default-aspect viewBox keeps text crisp.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 1200, h: 512 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const apply = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setSize({ w: Math.round(r.width), h: Math.round(r.height) });
      }
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const W = size.w;
  const H = size.h;

  return (
    <div className="topo-view active" id="view-map">
      <div className="topo-container" id="topo-map" data-testid="topo-map" ref={containerRef}>
        <div className="topo-glow" />
        <svg
          className="topo-svg"
          viewBox={`0 0 ${W} ${H}`}
          aria-hidden="true"
        >
          <style>{`
            .topo-svg .topo-flow-label {
              font-size: 9px;
              font-family: var(--font-ui);
              fill: var(--text-muted);
              letter-spacing: 0.02em;
              paint-order: stroke;
              stroke: var(--surface-canvas);
              stroke-width: 3;
              stroke-linejoin: round;
            }
          `}</style>
          <defs>
            <marker id="arrow-default" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="var(--accent-light)" opacity="0.6" />
            </marker>
            <marker id="arrow-orange" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#fb923c" opacity="0.6" />
            </marker>
            <marker id="arrow-green" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="var(--green)" opacity="0.6" />
            </marker>
            <marker id="arrow-violet" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#7c3aed" opacity="0.6" />
            </marker>
            <marker id="arrow-offline" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="var(--text-muted)" opacity="0.3" />
            </marker>
          </defs>
          {flowPairs.map((p, idx) => {
            const fromNode = nodeMap.get(p.from);
            const toNode = nodeMap.get(p.to);
            if (!fromNode || !toNode) return null;
            // Percentage positions → pixel coords against the actual
            // measured container size. Keeps SVG geometry square, so
            // text along paths renders at its natural font size.
            const x1 = (squashX(fromNode.position.x) / 100) * W;
            const y1 = (fromNode.position.y / 100) * H;
            const x2 = (squashX(toNode.position.x) / 100) * W;
            const y2 = (toNode.position.y / 100) * H;
            const dx = x2 - x1;
            const cx1 = x1 + dx * 0.4;
            const cy1 = y1;
            const cx2 = x1 + dx * 0.6;
            const cy2 = y2;
            const cls = edgeClasses(fromNode, toNode, p.schedule);
            const offline = cls === 'flow-offline';
            const marker = offline
              ? 'url(#arrow-offline)'
              : cls.includes('flow-orange') ? 'url(#arrow-orange)'
              : cls.includes('flow-violet') ? 'url(#arrow-violet)'
              : cls.includes('flow-green')  ? 'url(#arrow-green)'
              : 'url(#arrow-default)';
            const pathId = `flow-map-${idx}`;
            const d = `M${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
            return (
              <g key={pathId}>
                <path
                  id={pathId}
                  className={cls}
                  d={d}
                  markerEnd={marker}
                  data-from={p.from}
                  data-to={p.to}
                />
                {p.label && (
                  <text className="topo-flow-label">
                    <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                      {p.label}
                    </textPath>
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {view.nodes.map((n) => {
          const typeConfig = env.nodeTypes[n.type];
          const style: React.CSSProperties = {
            left: `${squashX(n.position.x)}%`,
            top: `${n.position.y}%`,
            ...getNodeStyle(typeConfig),
          };
          const labelStyle: React.CSSProperties = {};
          if (typeConfig?.size === 'xl') {
            labelStyle.fontSize = 'var(--text-lg)';
            labelStyle.fontWeight = 700;
          } else if (typeConfig?.size === 'sm') {
            labelStyle.fontSize = '0.4375rem';
          } else if (typeConfig?.shape === 'hexagon') {
            labelStyle.fontSize = '0.625rem';
            labelStyle.fontWeight = 700;
            labelStyle.color = '#fb923c';
          }
          const subText =
            n.health.latencyMs != null && n.status !== 'offline'
              ? `${n.type} · ${n.health.latencyMs}ms`
              : n.type;
          const worstHealth = healthMap[n.id];
          return (
            <button
              key={n.id}
              type="button"
              className={`topo-node status-${n.status}${worstHealth === 'fail' ? ' health-failing' : ''}`}
              data-type={n.type}
              data-id={n.id}
              data-testid={`topo-node-${n.id}`}
              style={style}
              onClick={(e) => { e.stopPropagation(); onSelectNode(n); }}
              title={n.description}
            >
              <span className="node-label" style={labelStyle}>{n.name}</span>
              <span className="node-sub">{subText}</span>
              {n.status === 'offline' && <span className="offline-badge">OFFLINE</span>}
              {worstHealth && <span className={`node-health-dot ${worstHealth}`} />}
            </button>
          );
        })}

        {/* Annotations from dataFlows */}
        {env.dataFlows.filter((f) => f.annotation).map((f, i) => {
          const midIdx = Math.floor(f.path.length / 2);
          const midNode = nodeMap.get(f.path[midIdx]);
          if (!midNode) return null;
          return (
            <div
              key={`ann-${i}`}
              className="topo-annotation"
              style={{ left: `${squashX(midNode.position.x) + 3}%`, top: `${midNode.position.y + 3}%` }}
            >
              {f.annotation}
            </div>
          );
        })}

        <DetailPanel node={selectedNode} env={env} onClose={() => onSelectNode(null)} />
      </div>
    </div>
  );
}

/* ============================================================
   Detail panel
   ============================================================ */

interface DetailPanelProps {
  node: PrototypeNode | null;
  env: PrototypeEnvironment;
  onClose: () => void;
}

function DetailPanel({ node, env, onClose }: DetailPanelProps) {
  const open = node !== null;
  return (
    <div
      className={`detail-panel${open ? ' open' : ''}`}
      data-testid="topo-node-detail"
      role="dialog"
      aria-hidden={!open}
    >
      {node && (
        <>
          <button type="button" className="dp-close" onClick={onClose} aria-label="Close detail panel">×</button>
          <div className="dp-title">{node.name}</div>
          <DpRow label="Status" value={node.status} valueColor={
            node.status === 'healthy'  ? 'var(--green)'  :
            node.status === 'degraded' ? 'var(--amber)'  :
            (node.status === 'offline' || node.status === 'down') ? 'var(--red)' :
            'var(--text-muted)'
          } />
          <DpRow label="Type" value={node.type} />
          {node.health.latencyMs != null && (
            <DpRow label="Latency" value={`${node.health.latencyMs}ms`} valueColor={node.health.latencyMs > 100 ? 'var(--amber)' : 'var(--text-primary)'} />
          )}
          {node.metrics?.messagesPerHour > 0 && (
            <DpRow label="Messages/hr" value={numberFormat(node.metrics.messagesPerHour)} />
          )}
          {node.metadata.technology && <DpRow label="Technology" value={node.metadata.technology} />}
          {node.metadata.owner && <DpRow label="Owner" value={node.metadata.owner} />}
          {node.metadata.criticality && <DpRow label="Criticality" value={node.metadata.criticality.toUpperCase()} />}
          {node.metadata.container?.image && <DpRow label="Image" value={node.metadata.container.image} />}
          {node.metadata.container?.pod && <DpRow label="Pod" value={node.metadata.container.pod} />}
          {node.metadata.container?.cpuPercent != null && <DpRow label="CPU" value={`${node.metadata.container.cpuPercent}%`} />}
          {node.metadata.container?.memoryMb != null && <DpRow label="Memory" value={`${node.metadata.container.memoryMb}MB`} />}
          {node.metadata.broker && (
            <>
              <DpRow label="Queues" value={String(node.metadata.broker.queues)} />
              <DpRow label="Consumers" value={String(node.metadata.broker.consumers)} />
              <DpRow label="Unacked" value={String(node.metadata.broker.unackedMessages)} valueColor={node.metadata.broker.unackedMessages > 0 ? 'var(--amber)' : 'var(--text-primary)'} />
            </>
          )}
          {node.metadata.core && (
            <>
              <DpRow label="Trades" value={numberFormat(node.metadata.core.trades)} />
              <DpRow label="Cargoes" value={String(node.metadata.core.cargoes)} />
              <DpRow label="Active Users" value={String(node.metadata.core.activeUsers)} />
            </>
          )}
          {node.health.uptimePercent != null && (
            <DpRow label="Uptime" value={`${node.health.uptimePercent}%`} valueColor="var(--green)" />
          )}
          {node.health.message && <DpRow label="Last check" value={node.health.message} />}
          {node.metadata.endpoint && <DpRow label="Endpoint" value={node.metadata.endpoint} />}
          {node.issue && <DpRow label="Issue" value={node.issue} valueColor="var(--amber)" />}
          <DpRow label="Environment" value={env.environment.label} valueColor={env.environment.color} />
        </>
      )}
    </div>
  );
}

function DpRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="dp-row">
      <span className="dp-label">{label}</span>
      <span className="dp-value" style={valueColor ? { color: valueColor } : undefined}>{value}</span>
    </div>
  );
}

/* ============================================================
   Flow Tracer view
   ============================================================ */

interface ArchiveMessage {
  entityId: string;
  entityType: string;
  correlationId: string;
  messageType: string;
  timestamp: string;
  source: string;
  flowName: string;
  route: string[];
  status: 'delivered' | 'failed';
  latencyMs: number | null;
  error?: string;
}

const ARCHIVE_DATA: ArchiveMessage[] = [
  { entityId: 'T-1001', entityType: 'Trade', correlationId: 'COR-T1001-CAP-20260502', messageType: 'Trade.Captured', timestamp: '2026-05-02T09:42:15.234Z', source: 'eos', flowName: 'Trade/Recap to Pioneer', route: ['eos', 'rabbitmq', 'glint-pioneer-trade', 'pioneer'], status: 'delivered', latencyMs: 245 },
  { entityId: 'T-1001', entityType: 'Trade', correlationId: 'COR-T1001-CREDIT-20260502', messageType: 'Credit.ExposureUpdate', timestamp: '2026-05-02T09:42:16.102Z', source: 'eos', flowName: 'Credit Exposure Update', route: ['eos', 'rabbitmq', 'glint-credit', 'credit-cube'], status: 'delivered', latencyMs: 128 },
  { entityId: 'T-1001', entityType: 'Trade', correlationId: 'COR-T1001-AUDIT-20260502', messageType: 'Audit.TradeCreated', timestamp: '2026-05-02T09:42:15.456Z', source: 'eos', flowName: 'Internal Audit', route: ['eos', 'rabbitmq'], status: 'delivered', latencyMs: 12 },
  { entityId: 'T-1001', entityType: 'Trade', correlationId: 'COR-T1001-VAL-20260502', messageType: 'Trade.Validated', timestamp: '2026-05-02T10:15:03.891Z', source: 'eos', flowName: 'Trade/Recap to Pioneer', route: ['eos', 'rabbitmq', 'glint-pioneer-trade', 'pioneer'], status: 'delivered', latencyMs: 198 },
  { entityId: 'INV-P-4521', entityType: 'Invoice', correlationId: 'COR-INV4521-20260502', messageType: 'Settlement.Completed', timestamp: '2026-05-02T14:30:22.567Z', source: 'eos', flowName: 'Settlements to Pioneer', route: ['eos', 'rabbitmq', 'glint-pioneer-settle', 'pioneer'], status: 'delivered', latencyMs: 312 },
  { entityId: 'INV-P-4521', entityType: 'Invoice', correlationId: 'COR-INV4521-SAP-20260502', messageType: 'Settlement.SapExport', timestamp: '2026-05-02T14:30:23.891Z', source: 'eos', flowName: 'Settlement to SAP', route: ['eos', 'rabbitmq', 'glint-ma', 'sap'], status: 'delivered', latencyMs: 445 },
  { entityId: 'CARGO-Q2-01', entityType: 'Cargo', correlationId: 'COR-CRG01-MATCH-20260415', messageType: 'Cargo.Matched', timestamp: '2026-04-15T11:30:45.123Z', source: 'eos', flowName: 'Trade/Recap to Pioneer', route: ['eos', 'rabbitmq', 'glint-pioneer-trade', 'pioneer'], status: 'delivered', latencyMs: 267 },
  { entityId: 'ICE-2026-05021', entityType: 'ExchangeTrade', correlationId: 'COR-ICE-20260502-001', messageType: 'Trade.IceCaptured', timestamp: '2026-05-02T08:15:33.012Z', source: 'ice', flowName: 'ICE Trade Ingress', route: ['ice', 'ktp', 'shovel', 'rabbitmq', 'glint-ice', 'eos'], status: 'delivered', latencyMs: 89 },
  { entityId: 'JKM-20260502', entityType: 'Price', correlationId: 'COR-PRICE-JKM-20260502', messageType: 'Price.Updated', timestamp: '2026-05-02T17:00:05.678Z', source: 'dq-prices', flowName: 'Price Ingress', route: ['dq-prices', 'eos'], status: 'delivered', latencyMs: 342 },
  { entityId: 'T-1001', entityType: 'Trade', correlationId: 'COR-T1001-NOTIF-20260502', messageType: 'Notification.TradeAlert', timestamp: '2026-05-02T09:42:17.333Z', source: 'eos', flowName: 'Notification (FAILED)', route: ['eos', 'rabbitmq'], status: 'failed', latencyMs: null, error: 'No consumers on queue eos.notification.send — message backed up (847 pending)' },
  { entityId: 'T-1002', entityType: 'Trade', correlationId: 'COR-T1002-CAP-20260502', messageType: 'Trade.Captured', timestamp: '2026-05-02T10:15:01.234Z', source: 'eos', flowName: 'Trade/Recap to Pioneer', route: ['eos', 'rabbitmq', 'glint-pioneer-trade', 'pioneer'], status: 'delivered', latencyMs: 201 },
  { entityId: 'VAR-20260502', entityType: 'Risk', correlationId: 'COR-VAR-20260502', messageType: 'Risk.PositionExtract', timestamp: '2026-05-02T17:20:00.000Z', source: 'eos', flowName: 'VaR Position Extract', route: ['eos', 'rabbitmq', 'glint-var', 'var-engine'], status: 'delivered', latencyMs: 1200 },
  { entityId: 'PNL-20260502', entityType: 'Report', correlationId: 'COR-PNL-20260502', messageType: 'PnL.DailyReport', timestamp: '2026-05-02T17:35:00.000Z', source: 'eos', flowName: 'HQ PnL Reporting', route: ['eos', 'rabbitmq', 'glint-hq-pnl', 'hq-pnl'], status: 'delivered', latencyMs: 890 },
];

const TRACE_ROUTE_COLORS = ['#6366f1', '#fb923c', '#22c55e', '#7c3aed', '#f59e0b', '#06b6d4'];
const TRACE_PARTICLE_CLASSES = ['', 'particle-orange', 'particle-green', 'particle-violet', 'particle-amber', ''];

interface UniqueRoute {
  key: string;
  route: string[];
  flowName: string;
  status: 'delivered' | 'failed';
}

function uniqueRoutesOf(results: ArchiveMessage[]): UniqueRoute[] {
  const seen = new Map<string, UniqueRoute>();
  for (const m of results) {
    const key = m.route.join('>');
    if (!seen.has(key)) seen.set(key, { key, route: m.route, flowName: m.flowName, status: m.status });
  }
  return Array.from(seen.values());
}

function executeSearch(query: string, flowFilter: string): ArchiveMessage[] {
  const q = query.trim().toLowerCase();
  const results = ARCHIVE_DATA.filter((m) => {
    const matchesQuery =
      !q ||
      m.entityId.toLowerCase().includes(q) ||
      m.correlationId.toLowerCase().includes(q) ||
      m.messageType.toLowerCase().includes(q) ||
      m.flowName.toLowerCase().includes(q);
    const matchesFlow = !flowFilter || m.flowName === flowFilter;
    return matchesQuery && matchesFlow;
  });
  return results.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

interface FlowTracerViewProps {
  view: ViewModel;
  healthMap: Record<string, 'pass' | 'warn' | 'fail' | 'unknown'>;
}

function FlowTracerView({ view, healthMap }: FlowTracerViewProps) {
  const env = view.env;
  const nodeMap = useMemo(() => {
    const m = new Map<string, PrototypeNode>();
    for (const n of view.nodes) m.set(n.id, n);
    return m;
  }, [view.nodes]);
  const flowPairs = useMemo(() => getFlowPairs(env), [env]);

  const [query, setQuery] = useState('');
  const [flowFilter, setFlowFilter] = useState('');
  const [results, setResults] = useState<ArchiveMessage[] | null>(null);
  const flowOptions = useMemo(() => {
    const set = new Set<string>();
    for (const m of ARCHIVE_DATA) set.add(m.flowName);
    return Array.from(set).sort();
  }, []);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 1200, h: 480 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const apply = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const W = size.w, H = size.h;

  const uniqueRoutes = useMemo(() => (results ? uniqueRoutesOf(results) : []), [results]);

  // Compute which node ids and which from→to edge pairs are part of any
  // matched route. Used to dim/highlight on the canvas.
  const highlight = useMemo(() => {
    const nodeIds = new Set<string>();
    const edgeKeys = new Map<string, { color: string; failed: boolean }>();
    uniqueRoutes.forEach((r, i) => {
      const color = r.status === 'failed' ? 'var(--red)' : TRACE_ROUTE_COLORS[i % TRACE_ROUTE_COLORS.length];
      for (const id of r.route) nodeIds.add(id);
      for (let k = 0; k < r.route.length - 1; k++) {
        edgeKeys.set(`${r.route[k]}>${r.route[k + 1]}`, { color, failed: r.status === 'failed' });
      }
    });
    return { nodeIds, edgeKeys };
  }, [uniqueRoutes]);

  function runSearch() {
    const r = executeSearch(query, flowFilter);
    setResults(r.length === 0 ? [] : r);
  }
  function demoTrace(term: string) {
    setQuery(term);
    setFlowFilter('');
    setResults(executeSearch(term, ''));
  }
  function clearTrace() {
    setQuery('');
    setFlowFilter('');
    setResults(null);
  }

  return (
    <div className="topo-view active" id="view-tracer" data-testid="env-tabpanel-tracer">
      <div className="tracer-search">
        <input
          type="text"
          className="tracer-input"
          placeholder="Search by Trade ID, Invoice, Cargo, Counterparty, Reference..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
          data-testid="tracer-input"
        />
        <select
          className="tracer-filter"
          value={flowFilter}
          onChange={(e) => setFlowFilter(e.target.value)}
          data-testid="tracer-flow-filter"
        >
          <option value="">All Flows</option>
          {flowOptions.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <button
          type="button"
          onClick={runSearch}
          style={{
            height: '1.75rem',
            fontSize: '0.5625rem',
            padding: '0 var(--sp-3)',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
          data-testid="tracer-search-btn"
        >
          Search Archive
        </button>
        <button
          type="button"
          onClick={clearTrace}
          style={{
            height: '1.75rem',
            fontSize: '0.5625rem',
            padding: '0 var(--sp-2)',
            background: 'none',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
          data-testid="tracer-clear-btn"
        >
          Clear
        </button>
      </div>

      <div className="trace-demos">
        <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>Demo flows:</span>
        <button type="button" className="demo-chip" onClick={() => demoTrace('T-1001')}>Trade T-1001</button>
        <button type="button" className="demo-chip" onClick={() => demoTrace('INV-P-4521')}>Invoice INV-P-4521</button>
        <button type="button" className="demo-chip" onClick={() => demoTrace('ICE')}>ICE Ingress</button>
        <button type="button" className="demo-chip" onClick={() => demoTrace('Price')}>Price Update</button>
        <button type="button" className="demo-chip" onClick={() => demoTrace('CARGO-Q2-01')}>Cargo Match</button>
      </div>

      <div className="topo-container" id="topo-tracer" ref={containerRef}>
        <div className="topo-glow" />
        <svg className="topo-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          <style>{`
            .topo-svg .topo-flow-label {
              font-size: 9px;
              font-family: var(--font-ui);
              fill: var(--text-muted);
              letter-spacing: 0.02em;
              paint-order: stroke;
              stroke: var(--surface-canvas);
              stroke-width: 3;
              stroke-linejoin: round;
            }
          `}</style>
          {flowPairs.map((p, idx) => {
            const fromNode = nodeMap.get(p.from);
            const toNode = nodeMap.get(p.to);
            if (!fromNode || !toNode) return null;
            const x1 = (squashX(fromNode.position.x) / 100) * W;
            const y1 = (fromNode.position.y / 100) * H;
            const x2 = (squashX(toNode.position.x) / 100) * W;
            const y2 = (toNode.position.y / 100) * H;
            const dx = x2 - x1;
            const cx1 = x1 + dx * 0.4;
            const cy1 = y1;
            const cx2 = x1 + dx * 0.6;
            const cy2 = y2;
            const baseCls = edgeClasses(fromNode, toNode, p.schedule);
            const traceInfo = highlight.edgeKeys.get(`${p.from}>${p.to}`);
            let cls = baseCls;
            const inlineStyle: React.CSSProperties = {};
            if (results !== null) {
              if (traceInfo) {
                cls = traceInfo.failed ? 'flow-trace-fail' : 'flow-trace-glow';
                inlineStyle.stroke = traceInfo.color;
              } else {
                cls = 'flow-dimmed';
              }
            }
            const pathId = `flow-tracer-${idx}`;
            const d = `M${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
            return (
              <g key={pathId}>
                <path
                  id={pathId}
                  className={cls}
                  d={d}
                  style={inlineStyle}
                  data-from={p.from}
                  data-to={p.to}
                />
                {p.label && results === null && (
                  <text className="topo-flow-label">
                    <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">{p.label}</textPath>
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {view.nodes.map((n) => {
          const typeConfig = env.nodeTypes[n.type];
          const dimmed = results !== null && !highlight.nodeIds.has(n.id);
          const style: React.CSSProperties = {
            left: `${squashX(n.position.x)}%`,
            top: `${n.position.y}%`,
            ...getNodeStyle(typeConfig),
          };
          if (dimmed) style.opacity = 0.15;
          const labelStyle: React.CSSProperties = {};
          if (typeConfig?.size === 'xl') {
            labelStyle.fontSize = 'var(--text-lg)';
            labelStyle.fontWeight = 700;
          } else if (typeConfig?.size === 'sm') {
            labelStyle.fontSize = '0.4375rem';
          } else if (typeConfig?.shape === 'hexagon') {
            labelStyle.fontSize = '0.625rem';
            labelStyle.fontWeight = 700;
            labelStyle.color = '#fb923c';
          }
          const subText = n.type;
          const worstHealth = healthMap[n.id];
          return (
            <button
              key={n.id}
              type="button"
              className={`topo-node status-${n.status}${worstHealth === 'fail' ? ' health-failing' : ''}`}
              data-type={n.type}
              data-id={n.id}
              data-testid={`topo-tracer-node-${n.id}`}
              style={style}
              title={n.description}
            >
              <span className="node-label" style={labelStyle}>{n.name}</span>
              <span className="node-sub">{subText}</span>
              {worstHealth && <span className={`node-health-dot ${worstHealth}`} />}
            </button>
          );
        })}

        {/* Particles — one per unique route, animated via CSS transition by hopping its target. */}
        {uniqueRoutes.map((r, i) => (
          <TraceParticle
            key={r.key}
            route={r.route}
            colorIdx={i}
            failed={r.status === 'failed'}
            nodeMap={nodeMap}
          />
        ))}
      </div>

      {results !== null && uniqueRoutes.length > 0 && (
        <div className="trace-legend" data-testid="trace-legend">
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {uniqueRoutes.length} route{uniqueRoutes.length > 1 ? 's' : ''} found
          </span>
          {uniqueRoutes.map((r, i) => {
            const color = r.status === 'failed' ? 'var(--red)' : TRACE_ROUTE_COLORS[i % TRACE_ROUTE_COLORS.length];
            return (
              <span key={r.key} className="trace-legend-item">
                <span className="trace-legend-swatch" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                {r.flowName}
              </span>
            );
          })}
        </div>
      )}

      {results !== null && (
        <div className="trace-timeline" data-testid="trace-timeline">
          <div style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--sp-2)' }}>
            Message Timeline
          </div>
          {results.length === 0 && (
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>No messages found.</div>
          )}
          {results.map((m, idx) => {
            const time = m.timestamp.substring(11, 19);
            const isFailed = m.status === 'failed';
            const routeDisplay = m.route.map((id) => nodeMap.get(id)?.name ?? id).join(' → ');
            const latencyStr = m.latencyMs != null ? `${m.latencyMs}ms` : '—';
            const latencyColor = isFailed
              ? 'var(--red)'
              : m.latencyMs != null && m.latencyMs > 500 ? 'var(--amber)' : 'var(--green)';
            return (
              <div key={idx} className={`trace-msg${isFailed ? ' trace-failed' : ''}`} data-testid={`trace-msg-${idx}`}>
                <div className="trace-msg-header">
                  <span className="trace-time">{time}</span>
                  <span className="hz-badge blue trace-type">{m.messageType}</span>
                  <span className="trace-route">{routeDisplay}</span>
                  <span className="trace-latency" style={{ color: latencyColor }}>{latencyStr}</span>
                  <span className={`hz-badge ${isFailed ? 'red' : 'green'} trace-status`}>{isFailed ? 'Failed' : 'Delivered'}</span>
                </div>
                {isFailed && m.error && <div className="trace-error-box">{m.error}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Health Checks tab
   ============================================================ */

type SortKey = 'status' | 'name' | 'targetNode' | 'type' | 'latencyMs' | 'checkedAt' | 'fails';

const STATUS_RANK: Record<string, number> = { fail: 3, warn: 2, pass: 1, unknown: 0 };

function HealthChecksView({ env }: { env: PrototypeEnvironment }) {
  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc'); // worst-first by default

  const rows = useMemo(() => {
    const checks = env.healthChecks ?? [];
    const out = checks.map((hc) => {
      const r = (hc.lastResult ?? { status: 'unknown' }) as {
        status: 'pass' | 'warn' | 'fail' | 'unknown';
        latencyMs?: number | null;
        message?: string | null;
        checkedAt?: string;
        consecutiveFailures?: number;
      };
      return { hc, r };
    });
    out.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'status':      cmp = (STATUS_RANK[a.r.status] ?? 0) - (STATUS_RANK[b.r.status] ?? 0); break;
        case 'name':        cmp = (a.hc as unknown as { name: string }).name.localeCompare((b.hc as unknown as { name: string }).name); break;
        case 'targetNode':  cmp = a.hc.targetNode.localeCompare(b.hc.targetNode); break;
        case 'type':        cmp = ((a.hc as unknown as { type: string }).type ?? '').localeCompare((b.hc as unknown as { type: string }).type ?? ''); break;
        case 'latencyMs':   cmp = (a.r.latencyMs ?? Number.MAX_SAFE_INTEGER) - (b.r.latencyMs ?? Number.MAX_SAFE_INTEGER); break;
        case 'checkedAt':   cmp = new Date(a.r.checkedAt ?? 0).getTime() - new Date(b.r.checkedAt ?? 0).getTime(); break;
        case 'fails':       cmp = (a.r.consecutiveFailures ?? 0) - (b.r.consecutiveFailures ?? 0); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return out;
  }, [env.healthChecks, sortKey, sortDir]);

  function onSort(k: SortKey) {
    if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir(k === 'status' ? 'desc' : 'asc'); }
  }

  if (!env.healthChecks || env.healthChecks.length === 0) {
    return (
      <div className="topo-coming-soon" data-testid="env-tabpanel-health">
        No health-check data for this environment.
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        maxHeight: '36rem',
        overflowY: 'auto',
      }}
      data-testid="env-tabpanel-health"
    >
      <table className="hc-table">
        <thead>
          <tr>
            <th style={{ width: '4rem' }} onClick={() => onSort('status')}>Status {sortKey === 'status' && (sortDir === 'asc' ? '▲' : '▼')}</th>
            <th onClick={() => onSort('name')}>Check {sortKey === 'name' && (sortDir === 'asc' ? '▲' : '▼')}</th>
            <th onClick={() => onSort('targetNode')}>Target {sortKey === 'targetNode' && (sortDir === 'asc' ? '▲' : '▼')}</th>
            <th style={{ width: '5rem' }} onClick={() => onSort('type')}>Type {sortKey === 'type' && (sortDir === 'asc' ? '▲' : '▼')}</th>
            <th className="r" style={{ width: '4rem' }} onClick={() => onSort('latencyMs')}>Latency {sortKey === 'latencyMs' && (sortDir === 'asc' ? '▲' : '▼')}</th>
            <th style={{ width: '6rem' }} onClick={() => onSort('checkedAt')}>Last Check {sortKey === 'checkedAt' && (sortDir === 'asc' ? '▲' : '▼')}</th>
            <th className="r" style={{ width: '3rem' }} onClick={() => onSort('fails')}>Fails {sortKey === 'fails' && (sortDir === 'asc' ? '▲' : '▼')}</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ hc, r }) => {
            const status = r.status;
            const rowCls = status === 'fail' ? 'hc-fail' : status === 'warn' ? 'hc-warn' : '';
            const latencyStr = r.latencyMs != null ? `${r.latencyMs}ms` : '—';
            const latencyColor =
              status === 'warn' ? 'var(--amber)' : status === 'fail' ? 'var(--red)' : undefined;
            const checkedAt = r.checkedAt ? r.checkedAt.replace('T', ' ').substring(11, 19) : '—';
            const fails = r.consecutiveFailures ?? 0;
            const failColor = fails > 0 ? 'var(--red)' : undefined;
            // hc.name / hc.type may not be in the TS type but exist on the JSON.
            const hcAny = hc as unknown as { name?: string; type?: string };
            return (
              <tr key={hc.id} className={rowCls}>
                <td><span className={`hc-status-dot ${status}`} />{status.toUpperCase()}</td>
                <td style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-ui)' }}>
                  {hcAny.name ?? hc.id}
                </td>
                <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>{hc.targetNode}</td>
                <td><span className="hz-badge blue" style={{ fontSize: '0.4375rem' }}>{hcAny.type ?? '—'}</span></td>
                <td className="r" style={latencyColor ? { color: latencyColor } : undefined}>{latencyStr}</td>
                <td style={{ color: 'var(--text-muted)' }}>{checkedAt}</td>
                <td className="r" style={failColor ? { color: failColor, fontWeight: 700 } : undefined}>{fails}</td>
                <td style={{ color: 'var(--text-tertiary)', fontSize: '0.5rem', fontFamily: 'var(--font-ui)' }}>
                  {r.message ?? '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   Dashboard tab — same canvas, KPI strip + per-node metrics ribbon,
   edges thickened by mock dataFlow volume.
   ============================================================ */

interface DashboardViewProps {
  view: ViewModel;
  healthMap: Record<string, 'pass' | 'warn' | 'fail' | 'unknown'>;
  kpis: { healthy: number; total: number; glint: number; msgPerHour: number; degraded: string[]; queueCount: number; failingChecks: number };
}

function DashboardView({ view, healthMap, kpis }: DashboardViewProps) {
  const env = view.env;
  const nodeMap = useMemo(() => {
    const m = new Map<string, PrototypeNode>();
    for (const n of view.nodes) m.set(n.id, n);
    return m;
  }, [view.nodes]);
  const flowPairs = useMemo(() => getFlowPairs(env), [env]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 1200, h: 480 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const apply = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const W = size.w, H = size.h;

  return (
    <div className="topo-view active" id="view-dashboard" data-testid="env-tabpanel-dashboard">
      <div className="dash-kpi-strip">
        <div className="dash-kpi"><div className="dash-kpi-label">Services</div><div className="dash-kpi-value">{kpis.healthy}/{kpis.total} Healthy</div></div>
        <div className="dash-kpi"><div className="dash-kpi-label">Glint Containers</div><div className="dash-kpi-value">{kpis.glint}</div></div>
        <div className="dash-kpi"><div className="dash-kpi-label">RabbitMQ Queues</div><div className="dash-kpi-value">{kpis.queueCount}</div></div>
        <div className="dash-kpi"><div className="dash-kpi-label">Messages/hr</div><div className="dash-kpi-value">{numberFormat(kpis.msgPerHour)}</div></div>
        <div className="dash-kpi"><div className="dash-kpi-label">Degraded</div><div className="dash-kpi-value" style={{ color: kpis.degraded.length ? 'var(--amber)' : 'var(--green)' }}>{kpis.degraded.length || 'None'}</div></div>
        <div className="dash-kpi"><div className="dash-kpi-label">Failing Checks</div><div className="dash-kpi-value" style={{ color: kpis.failingChecks ? 'var(--red)' : 'var(--green)' }}>{kpis.failingChecks}</div></div>
      </div>

      <div className="topo-container dashboard-mode" id="topo-dashboard" ref={containerRef}>
        <div className="topo-glow" />
        <svg className="topo-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          <style>{`
            .topo-svg .topo-flow-label {
              font-size: 9px;
              font-family: var(--font-ui);
              fill: var(--text-muted);
            }
          `}</style>
          {flowPairs.map((p, idx) => {
            const fromNode = nodeMap.get(p.from);
            const toNode = nodeMap.get(p.to);
            if (!fromNode || !toNode) return null;
            const x1 = (squashX(fromNode.position.x) / 100) * W;
            const y1 = (fromNode.position.y / 100) * H;
            const x2 = (squashX(toNode.position.x) / 100) * W;
            const y2 = (toNode.position.y / 100) * H;
            const dx = x2 - x1;
            const cx1 = x1 + dx * 0.4, cy1 = y1, cx2 = x1 + dx * 0.6, cy2 = y2;
            const baseCls = edgeClasses(fromNode, toNode, p.schedule);
            const offline = baseCls === 'flow-offline';
            // Volume → thickness band
            const v = p.volume ?? 0;
            const thicknessCls = !offline && v > 500 ? 'flow-thick' : !offline && v > 50 ? 'flow-medium' : !offline ? 'flow-thin' : '';
            const cls = `${baseCls} ${thicknessCls}`.trim();
            const pathId = `flow-dash-${idx}`;
            const d = `M${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
            return (
              <g key={pathId}>
                <path id={pathId} className={cls} d={d} data-from={p.from} data-to={p.to} />
              </g>
            );
          })}
        </svg>

        {view.nodes.map((n) => {
          const typeConfig = env.nodeTypes[n.type];
          const style: React.CSSProperties = {
            left: `${squashX(n.position.x)}%`,
            top: `${n.position.y}%`,
            ...getNodeStyle(typeConfig),
          };
          const labelStyle: React.CSSProperties = {};
          if (typeConfig?.size === 'xl') {
            labelStyle.fontSize = 'var(--text-lg)';
            labelStyle.fontWeight = 700;
          } else if (typeConfig?.size === 'sm') {
            labelStyle.fontSize = '0.4375rem';
          } else if (typeConfig?.shape === 'hexagon') {
            labelStyle.fontSize = '0.625rem';
            labelStyle.fontWeight = 700;
            labelStyle.color = '#fb923c';
          }
          const worstHealth = healthMap[n.id];
          const msgs = n.metrics?.messagesPerHour ?? 0;
          const lat = n.health?.latencyMs;
          const msgsStr = msgs > 0 ? `${numberFormat(msgs)}/hr` : '—';
          const latStr = lat != null ? `${lat}ms` : '—';
          return (
            <button
              key={n.id}
              type="button"
              className={`topo-node status-${n.status}${worstHealth === 'fail' ? ' health-failing' : ''}`}
              data-type={n.type}
              data-id={n.id}
              data-testid={`topo-dashboard-node-${n.id}`}
              style={style}
              title={n.description}
            >
              <span className="node-label" style={labelStyle}>{n.name}</span>
              <span className="node-sub">{n.type}</span>
              <span className="dash-metrics">
                <span className="dm-line">{msgsStr}</span>
                <span className="dm-line">{latStr}</span>
              </span>
              {worstHealth && <span className={`node-health-dot ${worstHealth}`} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TraceParticleProps {
  route: string[];
  colorIdx: number;
  failed: boolean;
  nodeMap: Map<string, PrototypeNode>;
}

function TraceParticle({ route, colorIdx, failed, nodeMap }: TraceParticleProps) {
  const [hopIndex, setHopIndex] = useState(0);
  // Step the particle to the next hop on a setTimeout cadence; CSS
  // transition smooths the motion. Loop indefinitely.
  useEffect(() => {
    if (route.length < 2) return;
    const t = setTimeout(() => setHopIndex((h) => (h + 1) % route.length), 1300);
    return () => clearTimeout(t);
  }, [hopIndex, route.length]);

  const cur = nodeMap.get(route[hopIndex]);
  if (!cur) return null;
  const cls = failed
    ? 'tracer-particle active particle-red'
    : `tracer-particle active ${TRACE_PARTICLE_CLASSES[colorIdx % TRACE_PARTICLE_CLASSES.length]}`.trim();
  return (
    <span
      className={cls}
      style={{ left: `${cur.position.x}%`, top: `${cur.position.y}%` }}
      data-testid="trace-particle"
    />
  );
}
