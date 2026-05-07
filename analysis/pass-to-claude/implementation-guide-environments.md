# Implementation Guide: EOS.Horizon Environments Page

**For:** The Claude session building EOS.Horizon (.NET 10 + React 19)
**From:** The prototype at horizon-v31/support-environments.html
**Date:** 7 May 2026

---

## What This Guide Covers

How to implement the environments/topology page in the production EOS.Horizon system, translating the static prototype into a React 19 + API-driven application.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  React 19 UI                                     │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ EnvSelector  │  │ TopologyView             │  │
│  │ (from API)   │  │ ┌──────┬───────┬───────┐ │  │
│  │              │  │ │ Map  │Tracer │Dashbd │ │  │
│  │ PROD UAT ... │  │ │      │       │Health │ │  │
│  └──────────────┘  │ └──────┴───────┴───────┘ │  │
│                     │ Renders from API response │  │
│                     └──────────────────────────┘  │
└────────────────────────┬────────────────────────┘
                         │ GET /api/support/topology?env=prod
                         ▼
┌─────────────────────────────────────────────────┐
│  .NET 10 API                                     │
│  ┌───────────────────────────────────────────┐   │
│  │ TopologyEndpoint (FastEndpoints)           │   │
│  │ → Runs all IEnvironmentProbe instances     │   │
│  │ → Assembles EnvironmentTopologyDto         │   │
│  │ → Returns { nodes, edges, healthChecks }   │   │
│  └───────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────┐   │
│  │ IEnvironmentProbe implementations         │   │
│  │ ├── RabbitMqProbe (AMQP health + queues)  │   │
│  │ ├── HttpProbe (REST API health checks)    │   │
│  │ ├── TcpProbe (port connectivity)          │   │
│  │ ├── DatabaseProbe (SQL Server connection) │   │
│  │ ├── QueueDepthProbe (per-queue metrics)   │   │
│  │ └── CustomProbe (manual/config-based)     │   │
│  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## API Contract

### GET /api/support/topology?env={envId}

Returns the complete topology for a given environment.

```typescript
interface EnvironmentTopologyDto {
  environment: {
    id: string;
    name: string;
    label: string;
    region: string;
    color: string;
    url: string;
  };
  versions: Record<string, string>;
  asOf: string; // ISO 8601

  nodeTypes: Record<string, NodeTypeConfig>;
  nodes: TopologyNodeDto[];       // systems + integration components flattened
  edges: TopologyEdgeDto[];       // dataFlows flattened to from/to pairs
  healthChecks: HealthCheckDto[];
  queues: QueueStatusDto[];
}

interface NodeTypeConfig {
  label: string;
  shape: "pill" | "circle" | "rect" | "hexagon" | "rounded-xl" | "rounded";
  size: "sm" | "md" | "lg" | "xl";
  borderStyle: "solid" | "dashed";
  borderColor: string;
  glowColor: string;
}

interface TopologyNodeDto {
  id: string;
  name: string;
  description: string;
  type: string;          // key into nodeTypes
  status: "healthy" | "degraded" | "offline" | "manual" | "not-configured";
  health: {
    latencyMs: number | null;
    lastCheck: string | null;
    uptimePercent: number | null;
    message: string | null;
  };
  metrics: {
    messagesPerHour: number;
    errorsLast24h: number;
  };
  metadata: Record<string, any>;  // type-specific fields
  issue: string | null;
}

interface TopologyEdgeDto {
  from: string;
  to: string;
  label: string | null;     // THE critical field — "Price Ingress"
  bidirectional: boolean;
  volume: number;            // messages/hour — drives line thickness
  annotation: string | null; // "Spanish gas trade data flow"
}

interface HealthCheckDto {
  id: string;
  name: string;
  targetNode: string;
  type: "http" | "tcp" | "rabbitmq-queue" | "database" | "custom";
  status: "pass" | "warn" | "fail" | "unknown";
  latencyMs: number | null;
  lastCheck: string;
  consecutiveFailures: number;
  message: string | null;
  thresholds: {
    latencyWarnMs: number;
    latencyFailMs: number;
  };
}

interface QueueStatusDto {
  name: string;
  messages: number;
  consumers: number;
  publishRate: number;
  deliverRate: number;
  unacked: number;
  status: "healthy" | "backing-up" | "dead";
}
```

### GET /api/support/topology/environments

Returns the manifest — list of available environments.

```typescript
interface EnvironmentManifestDto {
  environments: {
    id: string;
    label: string;
    status: "active" | "disabled";
  }[];
  defaultEnvironment: string;
}
```

### Node positions

Positions are NOT in the API response. They live in a UI-only file:

```typescript
// topology-positions.ts
export const POSITIONS: Record<string, { x: number; y: number }> = {
  "eos":              { x: 45, y: 52 },
  "rabbitmq":         { x: 45, y: 25 },
  "dq-prices":        { x: 3,  y: 8  },
  "ice":              { x: 3,  y: 22 },
  "ktp":              { x: 12, y: 22 },
  "shovel":           { x: 19, y: 22 },
  "hq-pnl":           { x: 3,  y: 42 },
  "credit-cube":      { x: 3,  y: 55 },
  "endur":            { x: 3,  y: 68 },
  "var-engine":       { x: 3,  y: 82 },
  "glint-ice":        { x: 28, y: 15 },
  "glint-price-load": { x: 28, y: 25 },
  "glint-price-eod":  { x: 28, y: 33 },
  "glint-hq-pnl":     { x: 20, y: 42 },
  "glint-credit":     { x: 20, y: 55 },
  "glint-endur":      { x: 20, y: 68 },
  "glint-var":        { x: 20, y: 82 },
  "glint-pioneer-trade":  { x: 65, y: 15 },
  "glint-pioneer-settle": { x: 65, y: 28 },
  "glint-ma":         { x: 45, y: 90 },
  "pioneer":          { x: 85, y: 15 },
  "a2kvan":           { x: 85, y: 42 },
  "ax-cloud":         { x: 85, y: 58 },
  "sap":              { x: 85, y: 82 },
  "eos-scheduler":    { x: 45, y: 78 },
};
```

---

## React Component Structure

```
<EnvironmentPage>
  ├── <EnvironmentSelector />          // manifest-driven buttons
  ├── <EnvironmentInfo />              // name, versions, asOf
  ├── <KpiStrip />                     // computed from nodes/queues
  ├── <TopologyTabs>
  │   ├── <MapView />                  // the topology diagram
  │   │   ├── <TopologyContainer>      // position:relative wrapper
  │   │   │   ├── <DotGrid />          // CSS background pattern
  │   │   │   ├── <SvgFlowLayer />     // SVG overlay for edges
  │   │   │   │   ├── <FlowPath />     // per edge with <textPath> label
  │   │   │   │   └── <FlowArrow />    // markers
  │   │   │   ├── <TopologyNode />     // per node, absolutely positioned
  │   │   │   │   ├── <NodeShape />    // styled from nodeTypes config
  │   │   │   │   ├── <HealthDot />    // small indicator from health checks
  │   │   │   │   └── <NodeLabel />
  │   │   │   └── <Annotation />       // per annotation
  │   │   └── <NodeDetailPanel />      // slide-in on click
  │   ├── <FlowTracerView />
  │   │   ├── <TracerSearch />
  │   │   ├── <TopologyContainer />    // same diagram, dimmed
  │   │   └── <TraceTimeline />
  │   ├── <DashboardView />
  │   │   ├── <DashKpiStrip />
  │   │   └── <TopologyContainer />    // same diagram, metrics overlaid
  │   └── <HealthChecksView />
  │       └── <HealthCheckTable />
  ├── <QueueMonitor />                 // collapsible
  └── <MessageExplorer />              // collapsible
```

### Key Component: TopologyNode

```tsx
function TopologyNode({ node, typeConfig, position, healthChecks, onClick }) {
  const style = getNodeStyle(typeConfig);
  const health = healthChecks.filter(h => h.targetNode === node.id);
  const worstHealth = health.reduce((w, h) => 
    h.status === 'fail' ? 'fail' : h.status === 'warn' && w !== 'fail' ? 'warn' : w, 'pass');
  
  return (
    <div 
      className="topo-node"
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        ...style,
      }}
      data-status={node.status}
      data-health={worstHealth}
      onClick={() => onClick(node)}
    >
      <HealthDot status={worstHealth} />
      <span className="node-label">{node.name}</span>
      <span className="node-sub">{node.metrics.messagesPerHour} msg/hr</span>
    </div>
  );
}
```

### Key Component: SvgFlowLayer

```tsx
function SvgFlowLayer({ edges, nodes, positions }) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Calculate path between two nodes
  const getPath = (fromId: string, toId: string) => {
    const from = positions[fromId];
    const to = positions[toId];
    if (!from || !to) return '';
    // Cubic bezier with control points for smooth curves
    const cx1 = from.x + (to.x - from.x) * 0.4;
    const cy1 = from.y;
    const cx2 = from.x + (to.x - from.x) * 0.6;
    const cy2 = to.y;
    return `M ${from.x} ${to.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;
  };

  return (
    <svg ref={svgRef} className="flow-layer">
      {edges.map(edge => (
        <g key={`${edge.from}-${edge.to}`}>
          <path d={getPath(edge.from, edge.to)} className="flow-line" />
          {edge.label && (
            <text>
              <textPath href={`#path-${edge.from}-${edge.to}`} startOffset="50%">
                {edge.label}
              </textPath>
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
```

---

## .NET API Implementation

### Probe Interface

```csharp
public interface IEnvironmentProbe
{
    string NodeId { get; }
    string NodeType { get; }  // "external", "glint", "broker", etc.
    string[] DependsOn { get; }  // edge definitions
    
    Task<ProbeResult> CheckAsync(CancellationToken ct);
}

public record ProbeResult(
    string Status,           // "healthy", "degraded", "offline"
    int? LatencyMs,
    string? Message,
    Dictionary<string, object> Metadata  // type-specific KPIs
);
```

### Example Probe: RabbitMQ

```csharp
public class RabbitMqProbe : IEnvironmentProbe
{
    public string NodeId => "rabbitmq";
    public string NodeType => "broker";
    public string[] DependsOn => Array.Empty<string>();

    private readonly RabbitMqManagementClient _client;

    public async Task<ProbeResult> CheckAsync(CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var overview = await _client.GetOverviewAsync(ct);
            sw.Stop();
            return new ProbeResult(
                Status: "healthy",
                LatencyMs: (int)sw.ElapsedMilliseconds,
                Message: null,
                Metadata: new()
                {
                    ["queues"] = overview.QueueTotals.Total,
                    ["consumers"] = overview.ObjectTotals.Consumers,
                    ["unackedMessages"] = overview.QueueTotals.MessagesUnacknowledged,
                    ["publishRate"] = overview.MessageStats.PublishDetails.Rate,
                    ["deliverRate"] = overview.MessageStats.DeliverGetDetails.Rate,
                }
            );
        }
        catch (Exception ex)
        {
            return new ProbeResult("offline", null, ex.Message, new());
        }
    }
}
```

### Example Probe: Glint Container (HTTP health check)

```csharp
public class GlintContainerProbe : IEnvironmentProbe
{
    private readonly string _nodeId;
    private readonly string _healthUrl;
    private readonly HttpClient _http;

    public string NodeId => _nodeId;
    public string NodeType => "glint";
    public string[] DependsOn => new[] { "rabbitmq" };

    public async Task<ProbeResult> CheckAsync(CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var response = await _http.GetAsync(_healthUrl, ct);
            sw.Stop();
            
            var status = response.IsSuccessStatusCode ? "healthy"
                : sw.ElapsedMilliseconds > 500 ? "degraded"
                : "offline";
                
            return new ProbeResult(status, (int)sw.ElapsedMilliseconds, null, new()
            {
                ["responseCode"] = (int)response.StatusCode,
                // K8s metadata from pod labels if available
            });
        }
        catch (Exception ex)
        {
            return new ProbeResult("offline", null, ex.Message, new());
        }
    }
}
```

### Topology Endpoint

```csharp
public class TopologyEndpoint : Endpoint<TopologyRequest, EnvironmentTopologyDto>
{
    private readonly IEnumerable<IEnvironmentProbe> _probes;
    private readonly TopologyLayoutConfig _layout;  // positions from config

    public override void Configure()
    {
        Get("/api/support/topology");
        AllowAnonymous(); // or require support role
    }

    public override async Task HandleAsync(TopologyRequest req, CancellationToken ct)
    {
        // Run all probes in parallel
        var results = await Task.WhenAll(
            _probes.Select(async p => (p, result: await p.CheckAsync(ct)))
        );

        // Assemble nodes from probe results
        var nodes = results.Select(r => new TopologyNodeDto
        {
            Id = r.p.NodeId,
            Type = r.p.NodeType,
            Status = r.result.Status,
            Health = new() { LatencyMs = r.result.LatencyMs, Message = r.result.Message },
            Metrics = new() { MessagesPerHour = /* from metrics store */ },
            Metadata = r.result.Metadata,
        }).ToList();

        // Assemble edges from probe DependsOn
        var edges = results.SelectMany(r => 
            r.p.DependsOn.Select(dep => new TopologyEdgeDto
            {
                From = dep,
                To = r.p.NodeId,
                Label = /* from static config */,
                Volume = /* from metrics store */,
            })
        ).ToList();

        await SendAsync(new EnvironmentTopologyDto
        {
            Environment = /* from config */,
            Versions = /* from assembly metadata */,
            AsOf = DateTime.UtcNow.ToString("O"),
            Nodes = nodes,
            Edges = edges,
            HealthChecks = /* from dedicated health check service */,
            Queues = /* from RabbitMQ management API */,
        });
    }
}
```

---

## Health Check Implementation

### Types of Health Checks

| Type | What it checks | Implementation |
|------|---------------|----------------|
| `http` | REST API endpoint responds with expected status | `HttpClient.GetAsync(url)` |
| `tcp` | Port is open and accepting connections | `TcpClient.ConnectAsync(host, port)` |
| `rabbitmq-queue` | Queue exists, has consumers, isn't backing up | RabbitMQ Management API |
| `database` | SQL Server connection + simple query | `DbConnection.OpenAsync()` + `SELECT 1` |
| `custom` | Manual/config-based status (e.g., "manual pull") | Static config, no probe |

### Thresholds

Each health check defines warn/fail thresholds:

```csharp
public record HealthCheckThresholds(
    int LatencyWarnMs = 200,
    int LatencyFailMs = 1000,
    int ConsecutiveFailuresWarn = 1,
    int ConsecutiveFailuresFail = 3
);
```

Status is derived:
- `pass` — latency below warn threshold, no failures
- `warn` — latency above warn threshold OR 1-2 consecutive failures
- `fail` — latency above fail threshold OR 3+ consecutive failures
- `unknown` — never checked or check couldn't run

### Node health derivation

A node's health indicator (the dot on the topology) is the WORST status of all health checks targeting that node:

```typescript
function getNodeHealth(nodeId: string, healthChecks: HealthCheckDto[]): string {
  const checks = healthChecks.filter(h => h.targetNode === nodeId);
  if (checks.length === 0) return 'unknown';
  if (checks.some(h => h.status === 'fail')) return 'fail';
  if (checks.some(h => h.status === 'warn')) return 'warn';
  return 'pass';
}
```

---

## Seed Data File

The complete seed data (systems, components, exchanges, queues, message types, flows) is at:

```
analysis/pass-to-claude/eos-topology-seed.json
```

This contains everything inferred from the EOS architecture diagram. Fields marked `?` need validation against the real system. Use this to:

1. Bootstrap your `IEnvironmentProbe` registrations
2. Define static edge labels and annotations
3. Populate the `nodeTypes` visual config
4. Create your topology-positions.ts

---

## What The Prototype Proves

The prototype at `horizon-v31/support-environments.html` demonstrates:

1. **Everything renders from JSON** — change the JSON, the diagram changes
2. **Node types are config-driven** — adding a new type = adding a key to nodeTypes
3. **Health checks drive node indicators** — worst check status = node status
4. **4 views from one data fetch** — Map, Flow Tracer, Dashboard, Health Checks
5. **Environment switching** — manifest-driven selector, full re-render on switch
6. **The visual treatment works** — labeled flows, distinct shapes, scale=importance

The production build inherits all of this. The API replaces the JSON files. The React components replace the vanilla JS renderers. The CSS tokens align. The architecture is the same.
