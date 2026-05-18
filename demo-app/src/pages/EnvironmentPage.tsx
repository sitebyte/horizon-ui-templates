/**
 * Environment page — ported from v43 support-environments.html
 * Topology visualization, interactive nodes, health tables, queue monitoring,
 * message explorer with search, expandable rows, and flow tracer.
 *
 * All demo data inline (from prod.json). API-sourced data marked with TODO comments.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import '../tokens/environment.css'

/* ================================================================
   TYPE DEFINITIONS
   ================================================================ */
interface NodePosition { x: number; y: number }

interface NodeHealth {
  checkUrl: string | null
  lastCheck: string | null
  latencyMs: number | null
  responseCode: number | null
  message: string
  upSince: string | null
  uptimePercent: number | null
}

interface NodeMetrics {
  messagesPerHour: number
  errorsLast24h: number
  avgLatencyMs: number | null
}

interface ContainerMeta {
  image: string
  pod: string
  namespace: string
  cpuPercent: number
  memoryMb: number
  restarts: number
  age: string
}

interface BrokerMeta {
  queues: number
  consumers: number
  unackedMessages: number
  publishRate: number
  deliverRate: number
}

interface CoreMeta {
  trades: number
  cargoes: number
  activeUsers: number
  dbConnections: number
}

interface NodeMetadata {
  endpoint: string | null
  technology: string
  owner: string
  criticality: string
  container?: ContainerMeta
  broker?: BrokerMeta
  core?: CoreMeta
}

interface SystemNode {
  id: string
  name: string
  description: string
  type: string
  position: NodePosition
  status: string
  health: NodeHealth
  metrics: NodeMetrics
  metadata: NodeMetadata
  issue: string | null
}

interface NodeTypeConfig {
  label: string
  shape: string
  size: string
  borderStyle: string
  borderColor: string
  glowColor: string
  icon: string
}

interface QueueData {
  name: string
  exchange: string
  routingKey: string
  consumer: string
  messages: number
  consumers: number
  rate: number
  unacked: number
  status: string
}

interface HealthCheck {
  id: string
  name: string
  targetNode: string
  type: string
  config: {
    url: string | null
    method: string | null
    expectedStatus: number | null
    timeoutMs: number
    intervalSeconds: number
    headers: Record<string, string> | null
  }
  lastResult: {
    status: string
    latencyMs: number | null
    responseCode: number | null
    message: string
    checkedAt: string | null
    consecutiveFailures: number
  }
  thresholds: {
    latencyWarnMs: number | null
    latencyFailMs: number | null
    consecutiveFailuresWarn: number
    consecutiveFailuresFail: number
  }
}

interface DataFlow {
  id: string
  name: string
  description: string
  path: string[]
  bidirectional: boolean
  messageTypes: string[]
  volume: number
  schedule: string
  criticality: string
  annotation: string | null
}

interface MessageType {
  type: string
  description: string
  source: string
  exchange: string
  routingKey: string
  consumers: string[]
  frequency: string
  samplePayload: Record<string, unknown>
}

interface ArchiveMessage {
  entityId: string
  entityType: string
  correlationId: string
  messageType: string
  timestamp: string
  source: string
  queue: string
  consumer: string | null
  route: string[]
  flowName: string
  status: string
  latencyMs: number | null
  payload: Record<string, unknown>
  error?: string
}

interface EnvData {
  environment: {
    id: string
    name: string
    label: string
    region: string
    color: string
    url: string
  }
  versions: {
    eos: string
    horizon: string
    database: string
    rabbitmq: string
    kubernetes: string
  }
  asOf: string
  nodeTypes: Record<string, NodeTypeConfig>
  systems: SystemNode[]
  integrationComponents: SystemNode[]
  dataFlows: DataFlow[]
  rabbitMq: {
    exchanges: Array<{
      name: string
      type: string
      description: string
      routingKeyPattern: string
      examples: string[]
    }>
    queues: QueueData[]
  }
  messageTypes: MessageType[]
  healthChecks: HealthCheck[]
}

/* ================================================================
   INLINE PROD DATA (from prod.json)
   ================================================================ */
/* TODO: API — all environment data should come from API */
const PROD_DATA: EnvData = {"environment":{"id":"prod","name":"Production","label":"PROD","region":"SGP","color":"#22c55e","url":"https://eos-prod.glng.internal"},"versions":{"eos":"4.2.1","horizon":"1.0.30","database":"4.2.1.3847","rabbitmq":"3.12.14","kubernetes":"1.28.4"},"asOf":"2026-05-07T14:30:00Z","nodeTypes":{"external":{"label":"External System","shape":"pill","size":"md","borderStyle":"dashed","borderColor":"var(--border-strong)","glowColor":"rgba(79,70,229,0.2)","icon":"cloud"},"pipeline":{"label":"Pipeline","shape":"circle","size":"sm","borderStyle":"solid","borderColor":"var(--border)","glowColor":"rgba(79,70,229,0.15)","icon":"arrow-right"},"glint":{"label":"Glint Integration Module","shape":"rounded","size":"md","borderStyle":"solid","borderColor":"#22c55e","glowColor":"rgba(34,197,94,0.25)","icon":"container"},"broker":{"label":"Message Broker","shape":"hexagon","size":"lg","borderStyle":"solid","borderColor":"#f97316","glowColor":"rgba(249,115,22,0.35)","icon":"message-square"},"core":{"label":"Core System","shape":"rounded-xl","size":"xl","borderStyle":"solid","borderColor":"var(--accent)","glowColor":"rgba(79,70,229,0.35)","icon":"database"},"core-secondary":{"label":"Core Secondary","shape":"rounded","size":"md","borderStyle":"solid","borderColor":"rgba(79,70,229,0.5)","glowColor":"rgba(79,70,229,0.15)","icon":"clock"},"destination":{"label":"Destination System","shape":"rounded","size":"md","borderStyle":"solid","borderColor":"#7c3aed","glowColor":"rgba(124,58,237,0.25)","icon":"external-link"}},"systems":[{"id":"eos","name":"EOS","description":"Core ETRM application","type":"core","position":{"x":45,"y":52},"status":"healthy","health":{"checkUrl":"https://eos-prod.glng.internal/api/health","lastCheck":"2026-05-07T14:29:45Z","latencyMs":18,"responseCode":200,"message":"All services operational","upSince":"2026-04-12T06:00:00Z","uptimePercent":99.97},"metrics":{"messagesPerHour":4230,"errorsLast24h":2,"avgLatencyMs":18},"metadata":{"endpoint":"https://eos-prod.glng.internal","technology":"WinForms / .NET","owner":"EOS Core Team","criticality":"critical","core":{"trades":1247,"cargoes":7,"activeUsers":42,"dbConnections":68}},"issue":null},{"id":"rabbitmq","name":"RabbitMQ","description":"Single message broker instance","type":"broker","position":{"x":45,"y":25},"status":"healthy","health":{"checkUrl":"http://eos-rmq-prod:15672/api/healthchecks/node","lastCheck":"2026-05-07T14:29:50Z","latencyMs":2,"responseCode":200,"message":"Node running, all alarms clear","upSince":"2026-03-28T02:15:00Z","uptimePercent":99.99},"metrics":{"messagesPerHour":4230,"errorsLast24h":0,"avgLatencyMs":2},"metadata":{"endpoint":"amqp://eos-rmq-prod:5672","technology":"RabbitMQ 3.12.14","owner":"Platform Team","criticality":"critical","broker":{"queues":12,"consumers":14,"unackedMessages":3,"publishRate":70.5,"deliverRate":69.8}},"issue":null},{"id":"eos-scheduler","name":"EOS Scheduler EOD","description":"End-of-day batch scheduler","type":"core-secondary","position":{"x":45,"y":78},"status":"healthy","health":{"checkUrl":null,"lastCheck":"2026-05-07T14:29:00Z","latencyMs":null,"responseCode":null,"message":"Last EOD completed successfully at 17:30:54","upSince":"2026-04-12T06:00:00Z","uptimePercent":99.95},"metrics":{"messagesPerHour":1,"errorsLast24h":0,"avgLatencyMs":null},"metadata":{"endpoint":null,"technology":"Windows Service / Hangfire","owner":"EOS Core Team","criticality":"high"},"issue":null},{"id":"dq-prices","name":"DQ Prices","description":"External price data provider","type":"external","position":{"x":3,"y":8},"status":"healthy","health":{"checkUrl":"https://dq.prices.provider.com/api/health","lastCheck":"2026-05-07T14:29:30Z","latencyMs":12,"responseCode":200,"message":"Feed active","upSince":"2026-05-01T00:00:00Z","uptimePercent":99.8},"metrics":{"messagesPerHour":240,"errorsLast24h":0,"avgLatencyMs":12},"metadata":{"endpoint":"https://dq.prices.provider.com/api","technology":"REST API / proprietary feed","owner":"External vendor","criticality":"high"},"issue":null},{"id":"ice","name":"ICE","description":"Intercontinental Exchange","type":"external","position":{"x":3,"y":22},"status":"healthy","health":{"checkUrl":"wss://ice.exchange.com/feed/status","lastCheck":"2026-05-07T14:29:55Z","latencyMs":8,"responseCode":200,"message":"WebSocket connected, market open","upSince":"2026-05-07T07:00:00Z","uptimePercent":99.9},"metrics":{"messagesPerHour":1420,"errorsLast24h":1,"avgLatencyMs":8},"metadata":{"endpoint":"wss://ice.exchange.com/feed","technology":"WebSocket / FIX protocol","owner":"External (ICE)","criticality":"high"},"issue":null},{"id":"ktp","name":"KTP","description":"ICE data adapter","type":"pipeline","position":{"x":12,"y":22},"status":"healthy","health":{"checkUrl":null,"lastCheck":"2026-05-07T14:29:40Z","latencyMs":2,"responseCode":null,"message":"Processing normally","upSince":"2026-04-28T10:00:00Z","uptimePercent":99.95},"metrics":{"messagesPerHour":1420,"errorsLast24h":0,"avgLatencyMs":2},"metadata":{"endpoint":null,"technology":"Custom service","owner":"Platform Team","criticality":"high"},"issue":null},{"id":"shovel","name":"Shovel","description":"RabbitMQ Shovel plugin","type":"pipeline","position":{"x":19,"y":22},"status":"healthy","health":{"checkUrl":"http://eos-rmq-prod:15672/api/shovels","lastCheck":"2026-05-07T14:29:50Z","latencyMs":1,"responseCode":200,"message":"Shovel running","upSince":"2026-03-28T02:15:00Z","uptimePercent":99.99},"metrics":{"messagesPerHour":1420,"errorsLast24h":0,"avgLatencyMs":1},"metadata":{"endpoint":null,"technology":"RabbitMQ Shovel plugin","owner":"Platform Team","criticality":"high"},"issue":null},{"id":"pioneer","name":"Pioneer","description":"Downstream system","type":"destination","position":{"x":85,"y":15},"status":"healthy","health":{"checkUrl":"https://pioneer.glng.internal/api/health","lastCheck":"2026-05-07T14:29:35Z","latencyMs":25,"responseCode":200,"message":"Online and accepting data","upSince":"2026-04-20T08:00:00Z","uptimePercent":99.92},"metrics":{"messagesPerHour":60,"errorsLast24h":0,"avgLatencyMs":25},"metadata":{"endpoint":"https://pioneer.glng.internal/api","technology":"External system","owner":"Finance / downstream team","criticality":"high"},"issue":null},{"id":"hq-pnl","name":"HQ PnL Reporting","description":"Head-quarter P&L reporting system","type":"external","position":{"x":3,"y":42},"status":"healthy","health":{"checkUrl":"https://hq-pnl.glng.internal/api/health","lastCheck":"2026-05-07T14:29:20Z","latencyMs":45,"responseCode":200,"message":"Accepting reports","upSince":"2026-05-01T06:00:00Z","uptimePercent":99.7},"metrics":{"messagesPerHour":12,"errorsLast24h":0,"avgLatencyMs":45},"metadata":{"endpoint":"https://hq-pnl.glng.internal/api","technology":"Internal reporting platform","owner":"Finance / HQ","criticality":"medium"},"issue":null},{"id":"credit-cube","name":"Credit Cube","description":"Credit risk management system","type":"external","position":{"x":3,"y":55},"status":"healthy","health":{"checkUrl":"https://creditcube.glng.internal/api/health","lastCheck":"2026-05-07T14:29:25Z","latencyMs":22,"responseCode":200,"message":"Running","upSince":"2026-04-15T00:00:00Z","uptimePercent":99.85},"metrics":{"messagesPerHour":8,"errorsLast24h":0,"avgLatencyMs":22},"metadata":{"endpoint":"https://creditcube.glng.internal/api","technology":"Internal credit system","owner":"Risk / Credit team","criticality":"medium"},"issue":null},{"id":"endur","name":"Endur","description":"Legacy ETRM","type":"external","position":{"x":3,"y":68},"status":"healthy","health":{"checkUrl":"https://endur.glng.internal/api/health","lastCheck":"2026-05-07T14:28:50Z","latencyMs":35,"responseCode":200,"message":"Legacy system responding","upSince":"2026-04-10T06:00:00Z","uptimePercent":99.5},"metrics":{"messagesPerHour":4,"errorsLast24h":0,"avgLatencyMs":35},"metadata":{"endpoint":"https://endur.glng.internal/api","technology":"OpenLink Endur","owner":"European trading desk","criticality":"medium"},"issue":null},{"id":"var-engine","name":"VaR Engine","description":"Value-at-Risk calculation engine","type":"external","position":{"x":3,"y":82},"status":"healthy","health":{"checkUrl":"https://var.glng.internal/api/health","lastCheck":"2026-05-07T14:28:55Z","latencyMs":120,"responseCode":200,"message":"Calculation engine idle","upSince":"2026-04-20T00:00:00Z","uptimePercent":99.6},"metrics":{"messagesPerHour":2,"errorsLast24h":0,"avgLatencyMs":120},"metadata":{"endpoint":"https://var.glng.internal/api","technology":"Custom / vendor risk engine","owner":"Risk team","criticality":"medium"},"issue":null},{"id":"a2kvan","name":"a2kvan","description":"Port distance calculation service","type":"destination","position":{"x":85,"y":42},"status":"manual","health":{"checkUrl":null,"lastCheck":null,"latencyMs":null,"responseCode":null,"message":"Manual process","upSince":null,"uptimePercent":null},"metrics":{"messagesPerHour":0,"errorsLast24h":0,"avgLatencyMs":null},"metadata":{"endpoint":"https://a2kvan.glng.internal","technology":"Web service / manual","owner":"Operations","criticality":"low"},"issue":null},{"id":"ax-cloud","name":"AX Cloud Shared Drive","description":"SharePoint / cloud storage","type":"destination","position":{"x":85,"y":58},"status":"healthy","health":{"checkUrl":"https://axcloud.sharepoint.com/sites/glng/_api/web","lastCheck":"2026-05-07T14:29:10Z","latencyMs":180,"responseCode":200,"message":"SharePoint accessible","upSince":"2026-04-01T00:00:00Z","uptimePercent":99.9},"metrics":{"messagesPerHour":6,"errorsLast24h":0,"avgLatencyMs":180},"metadata":{"endpoint":"https://axcloud.sharepoint.com/sites/glng","technology":"SharePoint Online / Azure Files","owner":"Finance / IT","criticality":"medium"},"issue":null},{"id":"sap","name":"SAP Document","description":"SAP financial system","type":"destination","position":{"x":85,"y":82},"status":"healthy","health":{"checkUrl":null,"lastCheck":"2026-05-07T14:28:00Z","latencyMs":null,"responseCode":null,"message":"SAP accessible","upSince":"2026-04-01T00:00:00Z","uptimePercent":99.8},"metrics":{"messagesPerHour":6,"errorsLast24h":0,"avgLatencyMs":null},"metadata":{"endpoint":"Manual download","technology":"SAP (via Excel download)","owner":"Finance","criticality":"medium"},"issue":null}],"integrationComponents":[{"id":"glint-ice","name":"Glint ICE Trade Capture","description":"Consumes ICE trade data from RabbitMQ","type":"glint","position":{"x":28,"y":15},"status":"healthy","health":{"checkUrl":"http://glint-ice-7d4f8-xk2j4:8080/health","lastCheck":"2026-05-07T14:29:58Z","latencyMs":4,"responseCode":200,"message":"Processing ICE feed normally","upSince":"2026-04-28T10:00:00Z","uptimePercent":99.98},"metrics":{"messagesPerHour":1420,"errorsLast24h":1,"avgLatencyMs":4},"metadata":{"endpoint":"http://glint-ice-7d4f8-xk2j4:8080","technology":".NET 8 / Docker","owner":"Integration Team","criticality":"critical","container":{"image":"eos/glint-ice-trade-capture:4.2.1","pod":"glint-ice-7d4f8-xk2j4","namespace":"eos-prod","cpuPercent":12,"memoryMb":256,"restarts":0,"age":"9d"}},"issue":null},{"id":"glint-price-load","name":"Glint Price Loading","description":"Loads price/curve data into EOS","type":"glint","position":{"x":28,"y":25},"status":"degraded","health":{"checkUrl":"http://glint-price-8b3e2-mn5p1:8080/health","lastCheck":"2026-05-07T14:29:52Z","latencyMs":342,"responseCode":200,"message":"Responding but slow","upSince":"2026-04-28T10:00:00Z","uptimePercent":99.9},"metrics":{"messagesPerHour":240,"errorsLast24h":5,"avgLatencyMs":342},"metadata":{"endpoint":"http://glint-price-8b3e2-mn5p1:8080","technology":".NET 8 / Docker","owner":"Integration Team","criticality":"critical","container":{"image":"eos/glint-price-loading:4.2.1","pod":"glint-price-8b3e2-mn5p1","namespace":"eos-prod","cpuPercent":8,"memoryMb":128,"restarts":0,"age":"9d"}},"issue":"Slow ingress \u2014 DQ feed latency elevated (342ms, threshold 200ms)"},{"id":"glint-price-eod","name":"Glint Price EoD Export","description":"Exports end-of-day settlement prices","type":"glint","position":{"x":28,"y":33},"status":"healthy","health":{"checkUrl":"http://glint-eod-5c7a1-qr8w3:8080/health","lastCheck":"2026-05-07T14:29:48Z","latencyMs":8,"responseCode":200,"message":"Idle","upSince":"2026-04-28T10:00:00Z","uptimePercent":99.99},"metrics":{"messagesPerHour":48,"errorsLast24h":0,"avgLatencyMs":8},"metadata":{"endpoint":"http://glint-eod-5c7a1-qr8w3:8080","technology":".NET 8 / Docker","owner":"Integration Team","criticality":"high","container":{"image":"eos/glint-price-eod-export:4.2.1","pod":"glint-eod-5c7a1-qr8w3","namespace":"eos-prod","cpuPercent":3,"memoryMb":96,"restarts":0,"age":"9d"}},"issue":null},{"id":"glint-pioneer-trade","name":"Glint Pioneer Trade Connector","description":"Pushes trade/recap data to Pioneer","type":"glint","position":{"x":65,"y":15},"status":"healthy","health":{"checkUrl":"http://glint-pio-t-3g2h7-wn8r5:8080/health","lastCheck":"2026-05-07T14:29:55Z","latencyMs":12,"responseCode":200,"message":"Processing trade events","upSince":"2026-04-28T10:00:00Z","uptimePercent":99.97},"metrics":{"messagesPerHour":48,"errorsLast24h":0,"avgLatencyMs":12},"metadata":{"endpoint":"http://glint-pio-t-3g2h7-wn8r5:8080","technology":".NET 8 / Docker","owner":"Integration Team","criticality":"high","container":{"image":"eos/glint-pioneer-trade-connector:4.2.1","pod":"glint-pio-t-3g2h7-wn8r5","namespace":"eos-prod","cpuPercent":4,"memoryMb":128,"restarts":0,"age":"9d"}},"issue":null},{"id":"glint-pioneer-settle","name":"Glint Pioneer Settlements Connector","description":"Pushes settlement data to Pioneer","type":"glint","position":{"x":65,"y":28},"status":"healthy","health":{"checkUrl":"http://glint-pio-s-8k4m1-tz7v2:8080/health","lastCheck":"2026-05-07T14:29:53Z","latencyMs":15,"responseCode":200,"message":"Idle","upSince":"2026-04-28T10:00:00Z","uptimePercent":99.96},"metrics":{"messagesPerHour":12,"errorsLast24h":0,"avgLatencyMs":15},"metadata":{"endpoint":"http://glint-pio-s-8k4m1-tz7v2:8080","technology":".NET 8 / Docker","owner":"Integration Team","criticality":"high","container":{"image":"eos/glint-pioneer-settlements-connector:4.2.1","pod":"glint-pio-s-8k4m1-tz7v2","namespace":"eos-prod","cpuPercent":3,"memoryMb":96,"restarts":0,"age":"9d"}},"issue":null},{"id":"glint-hq-pnl","name":"Glint HQ PnL Reporting","description":"Extracts P&L data from EOS","type":"glint","position":{"x":20,"y":42},"status":"healthy","health":{"checkUrl":"http://glint-hqpnl-2a8c5-bv6n9:8080/health","lastCheck":"2026-05-07T14:29:40Z","latencyMs":6,"responseCode":200,"message":"Last report sent at 07:15 SGT","upSince":"2026-04-28T10:00:00Z","uptimePercent":99.95},"metrics":{"messagesPerHour":12,"errorsLast24h":0,"avgLatencyMs":6},"metadata":{"endpoint":"http://glint-hqpnl-2a8c5-bv6n9:8080","technology":".NET 8 / Docker","owner":"Integration Team","criticality":"medium","container":{"image":"eos/glint-hq-pnl-reporting:4.2.1","pod":"glint-hqpnl-2a8c5-bv6n9","namespace":"eos-prod","cpuPercent":2,"memoryMb":64,"restarts":0,"age":"9d"}},"issue":null},{"id":"glint-credit","name":"Glint Credit Cube","description":"Pushes credit exposure data","type":"glint","position":{"x":20,"y":55},"status":"healthy","health":{"checkUrl":"http://glint-credit-4e7b3-hs2m8:8080/health","lastCheck":"2026-05-07T14:29:38Z","latencyMs":5,"responseCode":200,"message":"Processing exposure updates","upSince":"2026-04-28T10:00:00Z","uptimePercent":99.98},"metrics":{"messagesPerHour":8,"errorsLast24h":0,"avgLatencyMs":5},"metadata":{"endpoint":"http://glint-credit-4e7b3-hs2m8:8080","technology":".NET 8 / Docker","owner":"Integration Team","criticality":"medium","container":{"image":"eos/glint-credit-cube:4.2.1","pod":"glint-credit-4e7b3-hs2m8","namespace":"eos-prod","cpuPercent":1,"memoryMb":64,"restarts":0,"age":"9d"}},"issue":null},{"id":"glint-endur","name":"Glint Endur Spanish Gas","description":"Imports Spanish gas trades from Endur","type":"glint","position":{"x":20,"y":68},"status":"healthy","health":{"checkUrl":"http://glint-endur-6d9a4-jw5x1:8080/health","lastCheck":"2026-05-07T14:29:30Z","latencyMs":15,"responseCode":200,"message":"Awaiting Endur messages","upSince":"2026-04-28T10:00:00Z","uptimePercent":99.9},"metrics":{"messagesPerHour":4,"errorsLast24h":0,"avgLatencyMs":15},"metadata":{"endpoint":"http://glint-endur-6d9a4-jw5x1:8080","technology":".NET 8 / Docker","owner":"Integration Team","criticality":"medium","container":{"image":"eos/glint-endur-spanish-gas:4.2.1","pod":"glint-endur-6d9a4-jw5x1","namespace":"eos-prod","cpuPercent":1,"memoryMb":64,"restarts":0,"age":"9d"}},"issue":null},{"id":"glint-var","name":"Glint VaR Extract","description":"Extracts position data for VaR","type":"glint","position":{"x":20,"y":82},"status":"healthy","health":{"checkUrl":"http://glint-var-1b5f8-cp4q6:8080/health","lastCheck":"2026-05-07T14:29:32Z","latencyMs":10,"responseCode":200,"message":"Idle","upSince":"2026-04-28T10:00:00Z","uptimePercent":99.95},"metrics":{"messagesPerHour":2,"errorsLast24h":0,"avgLatencyMs":10},"metadata":{"endpoint":"http://glint-var-1b5f8-cp4q6:8080","technology":".NET 8 / Docker","owner":"Integration Team","criticality":"medium","container":{"image":"eos/glint-var-extract:4.2.1","pod":"glint-var-1b5f8-cp4q6","namespace":"eos-prod","cpuPercent":5,"memoryMb":128,"restarts":0,"age":"9d"}},"issue":null},{"id":"glint-ma","name":"Glint MA","description":"Settlements connector to SAP","type":"glint","position":{"x":45,"y":90},"status":"healthy","health":{"checkUrl":"http://glint-ma-5p9s3-fx1y8:8080/health","lastCheck":"2026-05-07T14:29:28Z","latencyMs":8,"responseCode":200,"message":"Processing settlement documents","upSince":"2026-04-28T10:00:00Z","uptimePercent":99.97},"metrics":{"messagesPerHour":6,"errorsLast24h":0,"avgLatencyMs":8},"metadata":{"endpoint":"http://glint-ma-5p9s3-fx1y8:8080","technology":".NET 8 / Docker","owner":"Integration Team","criticality":"medium","container":{"image":"eos/glint-ma:4.2.1","pod":"glint-ma-5p9s3-fx1y8","namespace":"eos-prod","cpuPercent":2,"memoryMb":64,"restarts":0,"age":"9d"}},"issue":null}],"dataFlows":[{"id":"price-ingress","name":"Price Ingress","description":"Market prices from DQ Prices into EOS","path":["dq-prices","eos"],"bidirectional":true,"messageTypes":["Price.Updated"],"volume":240,"schedule":"Continuous","criticality":"critical","annotation":null},{"id":"ice-trade-ingress","name":"ICE Trade Ingress","description":"Exchange-traded data from ICE","path":["ice","ktp","shovel","rabbitmq","glint-ice","eos"],"bidirectional":false,"messageTypes":["Trade.IceCaptured"],"volume":1420,"schedule":"Continuous","criticality":"critical","annotation":null},{"id":"pioneer-trade","name":"Trade/Recap to Pioneer","description":"Trade lifecycle events pushed to Pioneer","path":["eos","rabbitmq","glint-pioneer-trade","pioneer"],"bidirectional":false,"messageTypes":["Trade.Captured","Trade.Validated","Trade.Amended","Trade.Cancelled"],"volume":48,"schedule":"Continuous","criticality":"high","annotation":"Trade/Recap data"},{"id":"pioneer-settlement","name":"Settlements to Pioneer","description":"Settlement completion events","path":["eos","rabbitmq","glint-pioneer-settle","pioneer"],"bidirectional":false,"messageTypes":["Settlement.Completed","Invoice.Approved","Invoice.Paid"],"volume":12,"schedule":"Batch","criticality":"high","annotation":"Settlements data"},{"id":"spanish-gas","name":"Spanish Gas Trade Import","description":"Spanish gas trades from Endur","path":["endur","glint-endur","rabbitmq","eos"],"bidirectional":false,"messageTypes":["Trade.EndurImported"],"volume":4,"schedule":"Continuous","criticality":"medium","annotation":"Spanish gas trade data flow"},{"id":"var-extract","name":"VaR Position Extract","description":"Position data for VaR engine","path":["eos","rabbitmq","glint-var","var-engine"],"bidirectional":false,"messageTypes":["Risk.PositionExtract"],"volume":2,"schedule":"Daily","criticality":"medium","annotation":"VaR Extract"},{"id":"credit-exposure","name":"Credit Exposure Update","description":"Credit exposure to Credit Cube","path":["eos","rabbitmq","glint-credit","credit-cube"],"bidirectional":false,"messageTypes":["Credit.ExposureUpdate","Credit.LimitBreach"],"volume":8,"schedule":"Continuous","criticality":"medium","annotation":"Credit Data"},{"id":"hq-pnl","name":"HQ PnL Reporting","description":"P&L reports to HQ","path":["eos","rabbitmq","glint-hq-pnl","hq-pnl"],"bidirectional":false,"messageTypes":["PnL.DailyReport","PnL.MonthEndReport"],"volume":12,"schedule":"Daily","criticality":"medium","annotation":"PnL Reports"},{"id":"settlement-sap","name":"Settlement to SAP","description":"Settlement documents to SAP","path":["eos","rabbitmq","glint-ma","sap"],"bidirectional":false,"messageTypes":["Settlement.SapExport"],"volume":6,"schedule":"Batch","criticality":"medium","annotation":"SAP Document"},{"id":"invoice-pdf","name":"Invoice PDF Export","description":"EOS exports invoices as PDF","path":["eos","ax-cloud"],"bidirectional":false,"messageTypes":[],"volume":6,"schedule":"Continuous","criticality":"low","annotation":"Invoices saved as PDF"},{"id":"port-distance","name":"Port Distance Manual Pull","description":"Manual port distance data retrieval","path":["a2kvan","eos"],"bidirectional":false,"messageTypes":[],"volume":0,"schedule":"Manual","criticality":"low","annotation":"Port Distance data\npull (manual)"},{"id":"eod-batch","name":"EOD Batch Trigger","description":"EOS Scheduler triggers EOD processing","path":["eos-scheduler","eos"],"bidirectional":false,"messageTypes":[],"volume":1,"schedule":"Daily","criticality":"critical","annotation":"EOD Batch"}],"rabbitMq":{"exchanges":[{"name":"eos.inbound","type":"topic","description":"Inbound data flowing INTO EOS","routingKeyPattern":"{source}.{entity}.{action}","examples":["ice.trade.captured","price.curve.published"]},{"name":"eos.outbound","type":"topic","description":"Outbound data flowing FROM EOS","routingKeyPattern":"{destination}.{entity}.{action}","examples":["pioneer.trade.captured","hq.pnl.daily"]},{"name":"eos.internal","type":"topic","description":"Internal EOS events","routingKeyPattern":"{domain}.{entity}.{action}","examples":["audit.trade.amended","scheduler.eod.triggered"]}],"queues":[{"name":"eos.ice.trade.capture","exchange":"eos.inbound","routingKey":"ice.trade.#","consumer":"glint-ice","messages":0,"consumers":2,"rate":23.6,"unacked":0,"status":"healthy"},{"name":"eos.price.loading","exchange":"eos.inbound","routingKey":"price.#","consumer":"glint-price-load","messages":12,"consumers":2,"rate":4.0,"unacked":2,"status":"healthy"},{"name":"eos.endur.spanish.gas","exchange":"eos.inbound","routingKey":"endur.trade.#","consumer":"glint-endur","messages":0,"consumers":1,"rate":0.07,"unacked":0,"status":"healthy"},{"name":"eos.pioneer.trade","exchange":"eos.outbound","routingKey":"pioneer.trade.#","consumer":"glint-pioneer-trade","messages":0,"consumers":2,"rate":0.8,"unacked":0,"status":"healthy"},{"name":"eos.pioneer.settlement","exchange":"eos.outbound","routingKey":"pioneer.settlement.#","consumer":"glint-pioneer-settle","messages":0,"consumers":1,"rate":0.2,"unacked":0,"status":"healthy"},{"name":"eos.price.eod.export","exchange":"eos.outbound","routingKey":"price.eod.#","consumer":"glint-price-eod","messages":0,"consumers":1,"rate":0.8,"unacked":0,"status":"healthy"},{"name":"eos.hq.pnl","exchange":"eos.outbound","routingKey":"hq.pnl.#","consumer":"glint-hq-pnl","messages":0,"consumers":1,"rate":0.2,"unacked":0,"status":"healthy"},{"name":"eos.credit.cube","exchange":"eos.outbound","routingKey":"credit.#","consumer":"glint-credit","messages":0,"consumers":1,"rate":0.13,"unacked":0,"status":"healthy"},{"name":"eos.var.extract","exchange":"eos.outbound","routingKey":"risk.var.#","consumer":"glint-var","messages":0,"consumers":1,"rate":0.03,"unacked":0,"status":"healthy"},{"name":"eos.settlement.ma","exchange":"eos.outbound","routingKey":"settlement.sap.#","consumer":"glint-ma","messages":0,"consumers":1,"rate":0.1,"unacked":0,"status":"healthy"},{"name":"eos.audit.event","exchange":"eos.internal","routingKey":"audit.#","consumer":"audit-logger","messages":0,"consumers":2,"rate":8.7,"unacked":0,"status":"healthy"},{"name":"eos.notification.send","exchange":"eos.internal","routingKey":"notification.#","consumer":"notification-service","messages":847,"consumers":0,"rate":0.0,"unacked":0,"status":"critical"}]},"messageTypes":[{"type":"Trade.Captured","description":"New trade entered in EOS","source":"eos","exchange":"eos.outbound","routingKey":"pioneer.trade.captured","consumers":["glint-pioneer-trade"],"frequency":"~10-30/day","samplePayload":{"tradeId":"T-1001","direction":"BUY","counterparty":"Shell Energy Trading","benchmark":"JKM","premium":0.5,"volume":3200000,"volumeUnits":"MMBtu","deliveryMonth":"2026-06","incoterm":"DES","dischargePort":"Sodegaura","trader":"a.morgan","status":"FO-Entered","contractRef":"SPA-SHELL-2026"}},{"type":"Trade.Validated","description":"Trade status changed to FO-Validated","source":"eos","exchange":"eos.outbound","routingKey":"pioneer.trade.validated","consumers":["glint-pioneer-trade"],"frequency":"~10-30/day","samplePayload":{"tradeId":"T-1001","status":"FO-Validated","validatedBy":"m.tanaka","validatedAt":"2026-05-07T09:15:00Z"}},{"type":"Price.Updated","description":"Market price update from DQ Prices","source":"dq-prices","exchange":"eos.inbound","routingKey":"price.curve.updated","consumers":["glint-price-load"],"frequency":"~240/hour","samplePayload":{"curveId":"JKM-M1","curveName":"JKM Front Month","value":12.85,"currency":"USD/MMBtu","asOfDate":"2026-05-07","source":"DQ Platts","quality":"final"}},{"type":"Settlement.Completed","description":"Trade settlement finalised","source":"eos","exchange":"eos.outbound","routingKey":"pioneer.settlement.completed","consumers":["glint-pioneer-settle"],"frequency":"~12/hour","samplePayload":{"settlementId":"STL-2026-0507-014","tradeId":"T-892","amount":4250000,"currency":"USD","counterparty":"TotalEnergies","settledAt":"2026-05-07T14:20:00Z"}},{"type":"Credit.ExposureUpdate","description":"Credit exposure recalculated","source":"eos","exchange":"eos.outbound","routingKey":"credit.exposure.updated","consumers":["glint-credit"],"frequency":"~8/hour","samplePayload":{"counterpartyId":"CP-SHELL","counterpartyName":"Shell Energy Trading","currentExposure":15200000,"creditLimit":50000000,"utilisationPct":30.4,"currency":"USD"}}],"healthChecks":[{"id":"hc-eos-api","name":"EOS Core API","targetNode":"eos","type":"http","config":{"url":"https://eos-prod.glng.internal/api/health","method":"GET","expectedStatus":200,"timeoutMs":5000,"intervalSeconds":30,"headers":null},"lastResult":{"status":"pass","latencyMs":18,"responseCode":200,"message":"All services operational","checkedAt":"2026-05-07T14:29:45Z","consecutiveFailures":0},"thresholds":{"latencyWarnMs":500,"latencyFailMs":2000,"consecutiveFailuresWarn":2,"consecutiveFailuresFail":5}},{"id":"hc-rabbitmq-node","name":"RabbitMQ Node Health","targetNode":"rabbitmq","type":"http","config":{"url":"http://eos-rmq-prod:15672/api/healthchecks/node","method":"GET","expectedStatus":200,"timeoutMs":3000,"intervalSeconds":15,"headers":null},"lastResult":{"status":"pass","latencyMs":2,"responseCode":200,"message":"Node running, all alarms clear","checkedAt":"2026-05-07T14:29:50Z","consecutiveFailures":0},"thresholds":{"latencyWarnMs":100,"latencyFailMs":500,"consecutiveFailuresWarn":1,"consecutiveFailuresFail":3}},{"id":"hc-glint-price-load","name":"Glint Price Loading","targetNode":"glint-price-load","type":"http","config":{"url":"http://glint-price-8b3e2-mn5p1:8080/health","method":"GET","expectedStatus":200,"timeoutMs":3000,"intervalSeconds":15,"headers":null},"lastResult":{"status":"warn","latencyMs":342,"responseCode":200,"message":"Responding but slow (342ms exceeds 200ms threshold)","checkedAt":"2026-05-07T14:29:52Z","consecutiveFailures":0},"thresholds":{"latencyWarnMs":200,"latencyFailMs":1000,"consecutiveFailuresWarn":2,"consecutiveFailuresFail":5}},{"id":"hc-notification-queue","name":"eos.notification.send Queue","targetNode":"rabbitmq","type":"rabbitmq-queue","config":{"url":"http://eos-rmq-prod:15672/api/queues/%2F/eos.notification.send","method":"GET","expectedStatus":200,"timeoutMs":3000,"intervalSeconds":30,"headers":null},"lastResult":{"status":"fail","latencyMs":3,"responseCode":200,"message":"Consumer down \u2014 0 consumers, 847 messages backed up","checkedAt":"2026-05-07T14:29:51Z","consecutiveFailures":12},"thresholds":{"latencyWarnMs":50,"latencyFailMs":200,"consecutiveFailuresWarn":3,"consecutiveFailuresFail":5}},{"id":"hc-smtp-relay","name":"SMTP Relay","targetNode":"rabbitmq","type":"tcp","config":{"url":"smtp-relay.glng.internal:587","method":null,"expectedStatus":null,"timeoutMs":5000,"intervalSeconds":60,"headers":null},"lastResult":{"status":"fail","latencyMs":null,"responseCode":null,"message":"TCP connection failed \u2014 connection refused on port 587","checkedAt":"2026-05-07T14:29:55Z","consecutiveFailures":8},"thresholds":{"latencyWarnMs":100,"latencyFailMs":500,"consecutiveFailuresWarn":1,"consecutiveFailuresFail":3}},{"id":"hc-pioneer","name":"Pioneer API","targetNode":"pioneer","type":"http","config":{"url":"https://pioneer.glng.internal/api/health","method":"GET","expectedStatus":200,"timeoutMs":5000,"intervalSeconds":60,"headers":null},"lastResult":{"status":"pass","latencyMs":25,"responseCode":200,"message":"Online and accepting data","checkedAt":"2026-05-07T14:29:35Z","consecutiveFailures":0},"thresholds":{"latencyWarnMs":200,"latencyFailMs":1000,"consecutiveFailuresWarn":2,"consecutiveFailuresFail":5}},{"id":"hc-dq-prices","name":"DQ Prices Feed","targetNode":"dq-prices","type":"http","config":{"url":"https://dq.prices.provider.com/api/health","method":"GET","expectedStatus":200,"timeoutMs":5000,"intervalSeconds":60,"headers":null},"lastResult":{"status":"pass","latencyMs":12,"responseCode":200,"message":"Feed active","checkedAt":"2026-05-07T14:29:30Z","consecutiveFailures":0},"thresholds":{"latencyWarnMs":200,"latencyFailMs":1000,"consecutiveFailuresWarn":2,"consecutiveFailuresFail":5}},{"id":"hc-ice-ws","name":"ICE WebSocket Feed","targetNode":"ice","type":"tcp","config":{"url":"ice.exchange.com:443","method":null,"expectedStatus":null,"timeoutMs":3000,"intervalSeconds":30,"headers":null},"lastResult":{"status":"pass","latencyMs":8,"responseCode":null,"message":"WebSocket connected","checkedAt":"2026-05-07T14:29:55Z","consecutiveFailures":0},"thresholds":{"latencyWarnMs":100,"latencyFailMs":500,"consecutiveFailuresWarn":2,"consecutiveFailuresFail":5}}]};

/* ================================================================
   ARCHIVE DATA (mock message history for flow tracer)
   ================================================================ */
const ARCHIVE_DATA: ArchiveMessage[] = [
  { entityId:'T-1001', entityType:'Trade', correlationId:'COR-T1001-CAP-20260502', messageType:'Trade.Captured', timestamp:'2026-05-02T09:42:15.234Z', source:'eos', queue:'eos.pioneer.trade', consumer:'glint-pioneer-trade', route:['eos','rabbitmq','glint-pioneer-trade','pioneer'], flowName:'Trade/Recap to Pioneer', status:'delivered', latencyMs:245, payload:{tradeId:'T-1001',direction:'BUY',counterparty:'Shell Energy Trading',benchmark:'JKM',volume:3200000,status:'FO-Entered'} },
  { entityId:'T-1001', entityType:'Trade', correlationId:'COR-T1001-CREDIT-20260502', messageType:'Credit.ExposureUpdate', timestamp:'2026-05-02T09:42:16.102Z', source:'eos', queue:'eos.credit.cube', consumer:'glint-credit', route:['eos','rabbitmq','glint-credit','credit-cube'], flowName:'Credit Exposure Update', status:'delivered', latencyMs:128, payload:{tradeId:'T-1001',counterparty:'Shell Energy Trading',exposureChange:47200000,newTotal:78400000} },
  { entityId:'T-1001', entityType:'Trade', correlationId:'COR-T1001-VAL-20260502', messageType:'Trade.Validated', timestamp:'2026-05-02T10:15:03.891Z', source:'eos', queue:'eos.pioneer.trade', consumer:'glint-pioneer-trade', route:['eos','rabbitmq','glint-pioneer-trade','pioneer'], flowName:'Trade/Recap to Pioneer', status:'delivered', latencyMs:198, payload:{tradeId:'T-1001',previousStatus:'FO-Entered',newStatus:'FO-Validated',validator:'r.mehta'} },
  { entityId:'INV-P-4521', entityType:'Invoice', correlationId:'COR-INV4521-20260502', messageType:'Settlement.Completed', timestamp:'2026-05-02T14:30:22.567Z', source:'eos', queue:'eos.pioneer.settlement', consumer:'glint-pioneer-settle', route:['eos','rabbitmq','glint-pioneer-settle','pioneer'], flowName:'Settlements to Pioneer', status:'delivered', latencyMs:312, payload:{invoiceId:'INV-P-4521',tradeId:'T-1001',amount:47200000,currency:'USD',type:'Provisional'} },
  { entityId:'INV-P-4521', entityType:'Invoice', correlationId:'COR-INV4521-SAP-20260502', messageType:'Settlement.SapExport', timestamp:'2026-05-02T14:30:23.891Z', source:'eos', queue:'eos.settlement.ma', consumer:'glint-ma', route:['eos','rabbitmq','glint-ma','sap'], flowName:'Settlement to SAP', status:'delivered', latencyMs:445, payload:{invoiceId:'INV-P-4521',sapDocType:'FI-Invoice',amount:47200000} },
  { entityId:'ICE-2026-05021', entityType:'ExchangeTrade', correlationId:'COR-ICE-20260502-001', messageType:'Trade.IceCaptured', timestamp:'2026-05-02T08:15:33.012Z', source:'ice', queue:'eos.ice.trade.capture', consumer:'glint-ice', route:['ice','ktp','shovel','rabbitmq','glint-ice','eos'], flowName:'ICE Trade Ingress', status:'delivered', latencyMs:89, payload:{iceTradeId:'ICE-2026-05021',instrument:'JKM',price:14.25,volume:65000} },
  { entityId:'JKM-20260502', entityType:'Price', correlationId:'COR-PRICE-JKM-20260502', messageType:'Price.Updated', timestamp:'2026-05-02T17:00:05.678Z', source:'dq-prices', queue:'eos.price.loading', consumer:'glint-price-load', route:['dq-prices','eos'], flowName:'Price Ingress', status:'delivered', latencyMs:342, payload:{benchmark:'JKM',month:'2026-06',price:14.25,source:'Platts',asOf:'2026-05-02'} },
  { entityId:'T-1001', entityType:'Trade', correlationId:'COR-T1001-NOTIF-20260502', messageType:'Notification.TradeAlert', timestamp:'2026-05-02T09:42:17.333Z', source:'eos', queue:'eos.notification.send', consumer:null, route:['eos','rabbitmq'], flowName:'Notification (FAILED)', status:'failed', latencyMs:null, payload:{tradeId:'T-1001',alertType:'NewTradeCaptured',recipients:['trading-desk@glng.com']}, error:'No consumers on queue eos.notification.send \u2014 message backed up (847 pending)' },
  { entityId:'CARGO-Q2-01', entityType:'Cargo', correlationId:'COR-CRG01-MATCH-20260415', messageType:'Cargo.Matched', timestamp:'2026-04-15T11:30:45.123Z', source:'eos', queue:'eos.pioneer.trade', consumer:'glint-pioneer-trade', route:['eos','rabbitmq','glint-pioneer-trade','pioneer'], flowName:'Trade/Recap to Pioneer', status:'delivered', latencyMs:267, payload:{cargoId:'CARGO-Q2-01',vessel:'Al Dafna',buyTrade:'T-1001',sellTrade:'T-1002',volume:3200000} },
];

/* ================================================================
   UTILITY FUNCTIONS
   ================================================================ */
function numberFormat(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function getNodeStyle(tc: NodeTypeConfig): React.CSSProperties {
  const s: React.CSSProperties = {}
  if (tc.shape === 'pill') s.borderRadius = '2rem'
  else if (tc.shape === 'circle') { s.borderRadius = '50%'; s.width = '2.5rem'; s.height = '2.5rem' }
  else if (tc.shape === 'hexagon') s.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
  else if (tc.shape === 'rounded-xl') s.borderRadius = 'var(--radius-xl)'
  else if (tc.shape === 'rounded') s.borderRadius = 'var(--radius-md)'
  else s.borderRadius = 'var(--radius-sm)'

  if (tc.borderStyle) s.borderStyle = tc.borderStyle as React.CSSProperties['borderStyle']
  if (tc.borderColor) { s.borderColor = tc.borderColor; s.borderWidth = tc.size === 'xl' || tc.size === 'lg' ? '2px' : '1px' }

  if (tc.size === 'xl') { s.minWidth = '10rem'; s.minHeight = '6rem' }
  else if (tc.size === 'lg') { s.minWidth = '6rem'; s.minHeight = '3.5rem'; s.padding = '0.75rem 1.5rem' }
  else if (tc.size === 'sm') { s.minWidth = '2.5rem' }
  else { s.minWidth = '5rem'; s.minHeight = '1.75rem' }

  return s
}

function getLabelStyle(tc: NodeTypeConfig | null): React.CSSProperties {
  if (!tc) return {}
  if (tc.size === 'xl') return { fontSize: 'var(--text-lg)', fontWeight: 700 }
  if (tc.size === 'sm') return { fontSize: '0.4375rem' }
  if (tc.shape === 'hexagon') return { fontSize: '0.625rem', fontWeight: 700, color: '#fb923c' }
  return {}
}

function syntaxHighlight(json: string): string {
  return json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
    .replace(/: (true|false)/g, ': <span class="json-bool">$1</span>')
    .replace(/: (null)/g, ': <span class="json-null">$1</span>')
    .replace(/[{}]/g, '<span class="json-brace">$&</span>')
    .replace(/[[\]]/g, '<span class="json-brace">$&</span>')
}

/* ================================================================
   TOPOLOGY SVG COMPONENT
   ================================================================ */
interface FlowPair {
  from: string
  to: string
  label: string
  volume: number
  bidirectional: boolean
  schedule: string
}

function getFlowPairs(data: EnvData): FlowPair[] {
  const pairs: FlowPair[] = []
  data.dataFlows.forEach(flow => {
    const path = flow.path
    for (let i = 0; i < path.length - 1; i++) {
      pairs.push({
        from: path[i],
        to: path[i + 1],
        label: (i === 0 || i === path.length - 2) ? flow.name : '',
        volume: flow.volume || 0,
        bidirectional: flow.bidirectional || false,
        schedule: flow.schedule || 'Continuous',
      })
    }
  })
  return pairs
}

function TopologySvg({
  svgId,
  data,
  nodeMap,
  containerRef,
  isDashboard,
  markerPrefix,
}: {
  svgId: string
  data: EnvData
  nodeMap: Record<string, SystemNode>
  containerRef: React.RefObject<HTMLDivElement | null>
  isDashboard?: boolean
  markerPrefix: string
}) {
  const [dims, setDims] = useState({ w: 800, h: 512 })

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect()
        setDims({ w: r.width, h: r.height })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [containerRef])

  const { w, h } = dims
  const flowPairs = useMemo(() => getFlowPairs(data), [data])

  // De-duplicate
  const seen = new Set<string>()
  const uniqueFlows: FlowPair[] = []
  flowPairs.forEach(flow => {
    const key = `${flow.from}->${flow.to}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueFlows.push(flow)
    }
  })

  return (
    <svg className="topo-svg" id={svgId} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <marker id={`${markerPrefix}-default`} markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="var(--accent-light)" opacity="0.6" />
        </marker>
        <marker id={`${markerPrefix}-orange`} markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#fb923c" opacity="0.6" />
        </marker>
        <marker id={`${markerPrefix}-green`} markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="var(--green)" opacity="0.6" />
        </marker>
        <marker id={`${markerPrefix}-violet`} markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#7c3aed" opacity="0.6" />
        </marker>
        <marker id={`${markerPrefix}-offline`} markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="var(--text-muted)" opacity="0.3" />
        </marker>
      </defs>
      {uniqueFlows.map((flow, idx) => {
        const fromNode = nodeMap[flow.from]
        const toNode = nodeMap[flow.to]
        if (!fromNode || !toNode) return null

        const x1 = (fromNode.position.x / 100) * w
        const y1 = (fromNode.position.y / 100) * h
        const x2 = (toNode.position.x / 100) * w
        const y2 = (toNode.position.y / 100) * h

        const isOffline = fromNode.status === 'offline' || toNode.status === 'offline'
        let cls = ''
        let marker = ''

        if (isOffline) {
          cls = 'flow-offline'
          marker = `url(#${markerPrefix}-offline)`
        } else {
          cls = 'flow-active'
          marker = `url(#${markerPrefix}-default)`
          if (fromNode.type === 'broker' || toNode.type === 'broker') {
            cls += ' flow-orange'
            marker = `url(#${markerPrefix}-orange)`
          } else if (toNode.type === 'destination') {
            cls += ' flow-violet'
            marker = `url(#${markerPrefix}-violet)`
          } else if (fromNode.type === 'glint' || toNode.type === 'glint') {
            cls += ' flow-green'
            marker = `url(#${markerPrefix}-green)`
          }
          if (flow.schedule === 'Manual') {
            cls = 'flow-manual'
          }
        }

        if (isDashboard && !isOffline) {
          const vol = flow.volume || 0
          if (vol > 500) cls += ' flow-thick'
          else if (vol > 50) cls += ' flow-medium'
          else cls += ' flow-thin'
        }

        const dx = x2 - x1
        const cx1 = x1 + dx * 0.4
        const cy1 = y1
        const cx2 = x1 + dx * 0.6
        const cy2 = y2
        const pathId = `flow-${svgId}-${idx}`
        const d = `M${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`

        return (
          <g key={pathId}>
            <path
              id={pathId}
              className={cls}
              d={d}
              markerEnd={marker}
              data-from={flow.from}
              data-to={flow.to}
            />
            {flow.label && (
              <text>
                <textPath
                  href={`#${pathId}`}
                  startOffset="50%"
                  textAnchor="middle"
                  style={{ fontSize: '0.4375rem', fill: 'var(--text-muted)' }}
                >
                  {flow.label}
                </textPath>
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ================================================================
   TOPOLOGY NODE COMPONENT
   ================================================================ */
function TopoNode({
  node,
  typeConfig,
  healthStatus,
  isDashboard,
  onClick,
}: {
  node: SystemNode
  typeConfig: NodeTypeConfig | null
  healthStatus?: string
  isDashboard?: boolean
  onClick: (node: SystemNode) => void
}) {
  const statusCls = `status-${node.status || 'healthy'}`
  const style: React.CSSProperties = {
    left: `${node.position.x}%`,
    top: `${node.position.y}%`,
    ...(typeConfig ? getNodeStyle(typeConfig) : {}),
  }

  const latency = node.health?.latencyMs
  const subText = latency !== null && latency !== undefined && node.status !== 'offline'
    ? `${node.type} \u00b7 ${latency}ms`
    : node.type

  const msgs = node.metrics?.messagesPerHour || 0
  const msgsStr = node.status === 'offline' ? 'OFFLINE' : node.status === 'manual' ? 'manual' : msgs ? `${numberFormat(msgs)}/hr` : '-'
  const latStr = latency != null ? `${latency}ms` : '-'

  return (
    <div
      className={`topo-node ${statusCls}${healthStatus === 'fail' ? ' health-failing' : ''}`}
      data-type={node.type}
      data-id={node.id}
      style={style}
      onClick={e => { e.stopPropagation(); onClick(node) }}
    >
      <span className="node-label" style={getLabelStyle(typeConfig)}>{node.name}</span>
      <span className="node-sub">{subText}</span>
      {node.status === 'offline' && <span className="offline-badge">OFFLINE</span>}
      {healthStatus && <div className={`node-health-dot ${healthStatus}`} />}
      {isDashboard && (
        <div className="dash-metrics">
          <span className="dm-line">{msgsStr}</span>
          <span className="dm-line">{latStr}</span>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   DETAIL PANEL COMPONENT
   ================================================================ */
function DetailPanel({
  node,
  envData,
  onClose,
}: {
  node: SystemNode | null
  envData: EnvData
  onClose: () => void
}) {
  if (!node) return <div className="detail-panel" />

  const statusColor = node.status === 'degraded' ? 'var(--amber)'
    : (node.status === 'offline' || node.status === 'down') ? 'var(--red)'
    : node.status === 'manual' ? 'var(--text-muted)'
    : 'var(--green)'

  const latency = node.health?.latencyMs
  const m = node.metadata
  const msgHr = node.metrics?.messagesPerHour ?? 0

  return (
    <div className="detail-panel open">
      <button className="dp-close" onClick={onClose}>&times;</button>
      <div className="dp-title">{node.name}</div>
      <div className="dp-row"><span className="dp-label">Status</span><span className="dp-value" style={{ color: statusColor }}>{node.status || 'unknown'}</span></div>
      <div className="dp-row"><span className="dp-label">Type</span><span className="dp-value">{node.type}</span></div>
      {latency != null && (
        <div className="dp-row"><span className="dp-label">Latency</span><span className="dp-value" style={{ color: latency > 100 ? 'var(--amber)' : 'var(--text-primary)' }}>{latency}ms</span></div>
      )}
      <div className="dp-row"><span className="dp-label">Messages/hr</span><span className="dp-value">{numberFormat(msgHr)}</span></div>
      {m.technology && <div className="dp-row"><span className="dp-label">Technology</span><span className="dp-value" style={{ fontSize: '0.5rem' }}>{m.technology}</span></div>}
      {m.owner && <div className="dp-row"><span className="dp-label">Owner</span><span className="dp-value" style={{ fontSize: '0.5rem' }}>{m.owner}</span></div>}
      {m.criticality && <div className="dp-row"><span className="dp-label">Criticality</span><span className="dp-value" style={{ fontSize: '0.5rem', textTransform: 'uppercase' }}>{m.criticality}</span></div>}
      {m.container && (
        <>
          {m.container.image && <div className="dp-row"><span className="dp-label">Image</span><span className="dp-value" style={{ fontSize: '0.5rem' }}>{m.container.image}</span></div>}
          {m.container.pod && <div className="dp-row"><span className="dp-label">Pod</span><span className="dp-value" style={{ fontSize: '0.5rem' }}>{m.container.pod}</span></div>}
          <div className="dp-row"><span className="dp-label">CPU</span><span className="dp-value">{m.container.cpuPercent}%</span></div>
          <div className="dp-row"><span className="dp-label">Memory</span><span className="dp-value">{m.container.memoryMb}MB</span></div>
          <div className="dp-row"><span className="dp-label">Restarts</span><span className="dp-value">{m.container.restarts}</span></div>
        </>
      )}
      {m.broker && (
        <>
          <div className="dp-row"><span className="dp-label">Queues</span><span className="dp-value">{m.broker.queues}</span></div>
          <div className="dp-row"><span className="dp-label">Consumers</span><span className="dp-value">{m.broker.consumers}</span></div>
          <div className="dp-row"><span className="dp-label">Unacked</span><span className="dp-value" style={m.broker.unackedMessages > 0 ? { color: 'var(--amber)' } : undefined}>{m.broker.unackedMessages}</span></div>
        </>
      )}
      {m.core && (
        <>
          <div className="dp-row"><span className="dp-label">Trades</span><span className="dp-value">{numberFormat(m.core.trades)}</span></div>
          <div className="dp-row"><span className="dp-label">Cargoes</span><span className="dp-value">{m.core.cargoes}</span></div>
          <div className="dp-row"><span className="dp-label">Active Users</span><span className="dp-value">{m.core.activeUsers}</span></div>
        </>
      )}
      {node.health?.uptimePercent != null && <div className="dp-row"><span className="dp-label">Uptime</span><span className="dp-value" style={{ color: 'var(--green)' }}>{node.health.uptimePercent}%</span></div>}
      {node.metrics?.errorsLast24h != null && <div className="dp-row"><span className="dp-label">Errors (24h)</span><span className="dp-value" style={{ color: node.metrics.errorsLast24h > 0 ? 'var(--amber)' : 'var(--green)' }}>{node.metrics.errorsLast24h}</span></div>}
      {m.endpoint && <div className="dp-row"><span className="dp-label">Endpoint</span><span className="dp-value" style={{ fontSize: '0.5rem', wordBreak: 'break-all' }}>{m.endpoint}</span></div>}
      {node.issue && <div className="dp-row"><span className="dp-label">Issue</span><span className="dp-value" style={{ color: 'var(--amber)', fontSize: '0.5rem' }}>{node.issue}</span></div>}
      <div className="dp-row" style={{ marginTop: 'var(--sp-2)', borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-1)' }}>
        <span className="dp-label">Environment</span>
        <span className="dp-value" style={{ color: envData.environment.color }}>{envData.environment.label}</span>
      </div>
    </div>
  )
}

/* ================================================================
   MAIN ENVIRONMENT PAGE COMPONENT
   ================================================================ */
export function EnvironmentPage() {
  /* TODO: API — load from environment endpoint */
  const data = PROD_DATA
  const [activeView, setActiveView] = useState<'map' | 'health' | 'dashboard'>('map')
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(null)
  const [legendCollapsed, setLegendCollapsed] = useState(false)
  const [queueExpanded, setQueueExpanded] = useState(true)
  const [msgExpanded, setMsgExpanded] = useState(true)
  const [expandedMsgIdx, setExpandedMsgIdx] = useState<number | null>(null)
  const [activeMsgTab, setActiveMsgTab] = useState<Record<number, string>>({})

  const mapRef = useRef<HTMLDivElement>(null)
  const dashRef = useRef<HTMLDivElement>(null)

  // Build nodeMap
  const nodeMap = useMemo(() => {
    const map: Record<string, SystemNode> = {}
    data.systems.forEach(n => { map[n.id] = n })
    data.integrationComponents.forEach(n => { map[n.id] = n })
    return map
  }, [data])

  // Build health check map (nodeId -> worst status)
  const healthCheckMap = useMemo(() => {
    const hcMap: Record<string, string> = {}
    const rank: Record<string, number> = { fail: 3, warn: 2, pass: 1, unknown: 0 }
    data.healthChecks.forEach(hc => {
      const status = hc.lastResult?.status || 'unknown'
      const nodeId = hc.targetNode
      if (!hcMap[nodeId] || (rank[status] || 0) > (rank[hcMap[nodeId]] || 0)) {
        hcMap[nodeId] = status
      }
    })
    return hcMap
  }, [data])

  const allNodes = useMemo(() => [...data.systems, ...data.integrationComponents], [data])

  // Health summary counts
  const healthSummary = useMemo(() => {
    let total = 0, healthy = 0, degraded = 0, down = 0, offline = 0
    allNodes.forEach(n => {
      if (n.status === 'manual') return
      total++
      if (n.status === 'healthy') healthy++
      else if (n.status === 'degraded') degraded++
      else if (n.status === 'down') down++
      else if (n.status === 'offline') offline++
      else healthy++
    })
    const queueAlerts = data.rabbitMq.queues.filter(q => q.status === 'critical' || q.messages > 100).length
    return { total, healthy, degraded, down, offline, queueAlerts }
  }, [allNodes, data])

  // KPI strip values
  const kpiValues = useMemo(() => {
    const healthyCount = allNodes.filter(n => n.status === 'healthy').length
    const totalActive = allNodes.filter(n => n.status !== 'manual').length
    const glintCount = allNodes.filter(n => n.type === 'glint' && n.status !== 'offline').length
    const queueCount = data.rabbitMq.queues.length
    const totalMsgPerHour = allNodes.reduce((s, n) => s + (n.metrics?.messagesPerHour || 0), 0)
    const degradedList = allNodes.filter(n => n.status === 'degraded').map(n => n.name)
    const failingChecks = data.healthChecks.filter(hc => hc.lastResult?.status === 'fail' || hc.lastResult?.status === 'warn').length
    return { healthyCount, totalActive, glintCount, queueCount, totalMsgPerHour, degradedList, failingChecks }
  }, [allNodes, data])

  // Dashboard KPIs
  const dashKpis = useMemo(() => {
    const totalMsgHr = allNodes.reduce((s, n) => s + (n.metrics?.messagesPerHour || 0), 0)
    const degradedCount = allNodes.filter(n => n.status === 'degraded').length
    const offlineCount = allNodes.filter(n => n.status === 'offline').length
    const latencies = allNodes.map(n => n.health?.latencyMs).filter((l): l is number => l != null && l > 0)
    const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0
    const rmqNode = nodeMap['rabbitmq']
    const totalConsumers = rmqNode?.metadata?.broker?.consumers ?? 0
    const backedUpQueues = data.rabbitMq.queues.filter(q => q.status === 'critical' || q.status === 'backing-up').length
    const failingChecks = data.healthChecks.filter(hc => hc.lastResult?.status === 'fail').length
    const errorRate = degradedCount > 0 ? '0.02%' : '0.00%'
    return { totalMsgHr, errorRate, avgLatency, backedUpQueues, totalConsumers, failingChecks, offlineCount, degradedCount }
  }, [allNodes, nodeMap, data])

  // Health checks sorted by severity
  const sortedHealthChecks = useMemo(() => {
    const rank: Record<string, number> = { fail: 3, warn: 2, pass: 1, unknown: 0 }
    return [...data.healthChecks].sort((a, b) => {
      const sa = rank[a.lastResult?.status || 'unknown'] || 0
      const sb = rank[b.lastResult?.status || 'unknown'] || 0
      return sb - sa
    })
  }, [data])

  // Close detail panel
  const closeDetail = useCallback(() => setSelectedNode(null), [])

  // Handle node click
  const handleNodeClick = useCallback((node: SystemNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node)
  }, [])

  // Message table sample data
  const sampleMessages = useMemo(() => {
    const baseTime = new Date('2026-05-07T14:30:00Z')
    return data.messageTypes.map((mt, idx) => {
      const time = new Date(baseTime.getTime() - (idx * 3247))
      const timeStr = time.toISOString().substring(11, 23)
      const corId = `COR-${mt.type.replace('.', '-').toUpperCase()}-${1000 + idx}`
      const sourceName = nodeMap[mt.source]?.name || mt.source
      const destName = mt.consumers.length > 0 && nodeMap[mt.consumers[0]] ? nodeMap[mt.consumers[0]].name : (mt.exchange || '')
      const size = `${(Math.random() * 8 + 0.5).toFixed(1)} KB`
      const latency = Math.round(Math.random() * 30 + 2)
      const isSlowPrice = mt.type === 'Price.Updated'
      return {
        timeStr, corId, type: mt.type, sourceName, destName, size,
        latency: isSlowPrice ? 342 : latency,
        isSlow: isSlowPrice,
        exchange: mt.exchange,
        routingKey: mt.routingKey,
        frequency: mt.frequency,
        samplePayload: mt.samplePayload,
      }
    })
  }, [data, nodeMap])

  // Resize-triggered re-render for SVG
  const [, setResizeTick] = useState(0)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const handler = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setResizeTick(t => t + 1), 100)
    }
    window.addEventListener('resize', handler)
    return () => { window.removeEventListener('resize', handler); clearTimeout(timer) }
  }, [])

  // Click outside topo to close detail
  const handleTopoClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('topo-glow') || target.classList.contains('topo-container')) {
      setSelectedNode(null)
    }
  }, [])

  return (
    <div className="hz-content-fill">
      {/* KPI Strip */}
      <div className="hz-kpi-strip">
        {/* TODO: API */}
        <span><span className="strip-label">Services</span><span className="strip-value"><span style={{ color: 'var(--green)' }}>{kpiValues.healthyCount}</span>/{kpiValues.totalActive} Healthy</span></span>
        <span className="strip-sep">|</span>
        <span><span className="strip-label">Glint Containers</span><span className="strip-value">{kpiValues.glintCount} Running</span></span>
        <span className="strip-sep">|</span>
        <span><span className="strip-label">RabbitMQ Queues</span><span className="strip-value">{kpiValues.queueCount}</span></span>
        <span className="strip-sep">|</span>
        <span><span className="strip-label">Messages/hr</span><span className="strip-value">{numberFormat(kpiValues.totalMsgPerHour)}</span></span>
        <span className="strip-sep">|</span>
        {kpiValues.degradedList.length > 0
          ? <span><span className="strip-label">Degraded</span><span className="strip-value" style={{ color: 'var(--amber)' }}>{kpiValues.degradedList.length} ({kpiValues.degradedList.join(', ')})</span></span>
          : <span><span className="strip-label">Degraded</span><span className="strip-value" style={{ color: 'var(--green)' }}>None</span></span>
        }
        {kpiValues.failingChecks > 0 && (
          <>
            <span className="strip-sep">|</span>
            <span><span className="strip-label">Health Alerts</span><span className="strip-value" style={{ color: 'var(--red)' }}>{kpiValues.failingChecks}</span></span>
          </>
        )}
        <span className="strip-sep">|</span>
        <span><span className="strip-label">Environment</span><span className="strip-value" style={{ color: data.environment.color }}>{data.environment.label}</span></span>
      </div>

      {/* Scrollable content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', flex: 1, minHeight: 0, overflow: 'auto' }}>

        {/* Environment Selector + Info */}
        <div>
          <div className="env-selector">
            <button className="env-btn active" data-env="prod">
              <span className="hz-dot green" style={{ width: '0.375rem', height: '0.375rem' }} /> PROD
            </button>
          </div>
          <div className="env-info" style={{ borderColor: data.environment.color }}>
            <span className="env-name" style={{ color: data.environment.color }}>{data.environment.name}</span>
            <span className="env-region">{data.environment.region}</span>
            <span className="env-versions">EOS {data.versions.eos} &middot; Horizon {data.versions.horizon} &middot; DB {data.versions.database} &middot; RMQ {data.versions.rabbitmq}</span>
            <span className="env-url font-mono">{data.environment.url}</span>
          </div>

          {/* Health Summary KPI Strip */}
          <div className="flex gap-2 flex-shrink-0 mb-2" style={{ padding: '0 var(--sp-3)' }}>
            {/* TODO: API */}
            <div className="hz-kpi" style={{ flex: 1 }}>
              <span className="hz-kpi-label">Total Nodes</span>
              <span className="hz-kpi-value font-mono">{healthSummary.total}</span>
            </div>
            <div className="hz-kpi" style={{ flex: 1 }}>
              <span className="hz-kpi-label">Healthy</span>
              <span className="hz-kpi-value font-mono pnl-positive">{healthSummary.healthy}</span>
            </div>
            <div className="hz-kpi" style={{ flex: 1 }}>
              <span className="hz-kpi-label">Degraded</span>
              <span className="hz-kpi-value font-mono" style={{ color: 'var(--amber)' }}>{healthSummary.degraded}</span>
            </div>
            <div className="hz-kpi" style={{ flex: 1 }}>
              <span className="hz-kpi-label">Down</span>
              <span className="hz-kpi-value font-mono pnl-negative">{healthSummary.down}</span>
            </div>
            <div className="hz-kpi" style={{ flex: 1 }}>
              <span className="hz-kpi-label">Offline</span>
              <span className="hz-kpi-value font-mono" style={{ color: 'var(--text-muted)' }}>{healthSummary.offline}</span>
            </div>
            <div className="hz-kpi" style={{ flex: 1 }}>
              <span className="hz-kpi-label">Queue Alerts</span>
              <span className="hz-kpi-value font-mono pnl-negative">{healthSummary.queueAlerts}</span>
            </div>
          </div>
        </div>

        {/* EOS System Topology */}
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--sp-1)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            EOS System Topology
            <span className="hz-badge green" style={{ fontSize: '0.375rem' }}>{data.environment.label}</span>
            <span className="hz-badge blue" style={{ fontSize: '0.375rem' }}>v{data.versions.horizon}</span>
          </div>

          {/* Tab Bar */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 'var(--sp-3)', flexShrink: 0 }}>
            <button className={`topo-tab${activeView === 'map' ? ' active' : ''}`} onClick={() => setActiveView('map')}>The Map</button>
            <button className={`topo-tab${activeView === 'dashboard' ? ' active' : ''}`} onClick={() => setActiveView('dashboard')}>Dashboard</button>
            <button className={`topo-tab${activeView === 'health' ? ' active' : ''}`} onClick={() => setActiveView('health')}>Health Checks</button>
          </div>

          {/* VIEW A: The Map */}
          <div className={`topo-view${activeView === 'map' ? ' active' : ''}`}>
            <div className="topo-container" ref={mapRef} onClick={handleTopoClick}>
              <div className="topo-glow" />
              <TopologySvg svgId="svg-map" data={data} nodeMap={nodeMap} containerRef={mapRef} markerPrefix="arrow-map" />

              {/* Nodes */}
              {allNodes.map(node => (
                <TopoNode
                  key={node.id}
                  node={node}
                  typeConfig={data.nodeTypes[node.type] || null}
                  healthStatus={healthCheckMap[node.id]}
                  onClick={handleNodeClick}
                />
              ))}

              {/* Annotations from dataFlows */}
              {data.dataFlows.filter(f => f.annotation).map(flow => {
                const midIdx = Math.floor(flow.path.length / 2)
                const midNode = nodeMap[flow.path[midIdx]] || nodeMap[flow.path[0]]
                if (!midNode) return null
                return (
                  <div key={flow.id} className="topo-annotation" style={{ left: `${midNode.position.x + 3}%`, top: `${midNode.position.y + 3}%` }}>
                    {flow.annotation}
                  </div>
                )
              })}

              {/* Legend */}
              <div className={`env-legend${legendCollapsed ? ' collapsed' : ''}`}>
                <div className="env-legend-header" onClick={() => setLegendCollapsed(c => !c)}>
                  <span>Legend</span>
                  <span className="env-legend-toggle">&#9660;</span>
                </div>
                <div className="env-legend-body">
                  <div className="env-legend-section">Node Types</div>
                  <div className="env-legend-row"><span className="env-legend-swatch" style={{ background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.4)', borderRadius: '1rem' }} /> External System</div>
                  <div className="env-legend-row"><span className="env-legend-swatch" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '50%' }} /> Pipeline / Adapter</div>
                  <div className="env-legend-row"><span className="env-legend-swatch" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '0.25rem' }} /> Integration Module (Glint)</div>
                  <div className="env-legend-row"><span className="env-legend-swatch" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.4)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} /> Message Broker</div>
                  <div className="env-legend-row"><span className="env-legend-swatch" style={{ background: 'rgba(79,70,229,0.2)', border: '2px solid rgba(79,70,229,0.6)', borderRadius: '0.5rem' }} /> Core System</div>
                  <div className="env-legend-row"><span className="env-legend-swatch" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '0.25rem' }} /> Destination System</div>

                  <div className="env-legend-section" style={{ marginTop: 'var(--sp-2)' }}>Health Status</div>
                  <div className="env-legend-row"><span className="hz-dot green" style={{ width: '0.5rem', height: '0.5rem' }} /> Healthy</div>
                  <div className="env-legend-row"><span className="hz-dot amber" style={{ width: '0.5rem', height: '0.5rem' }} /> Degraded</div>
                  <div className="env-legend-row"><span className="hz-dot red" style={{ width: '0.5rem', height: '0.5rem' }} /> Down / Failing</div>
                  <div className="env-legend-row"><span className="hz-dot" style={{ width: '0.5rem', height: '0.5rem', background: 'var(--text-muted)' }} /> Offline</div>

                  <div className="env-legend-section" style={{ marginTop: 'var(--sp-2)' }}>Data Flows</div>
                  <div className="env-legend-row"><span style={{ display: 'inline-block', width: '1.5rem', height: '2px', background: 'var(--accent)', opacity: 0.6 }} /> Active flow</div>
                  <div className="env-legend-row"><span style={{ display: 'inline-block', width: '1.5rem', height: '3px', background: 'var(--accent)', opacity: 0.6 }} /> High volume</div>
                  <div className="env-legend-row"><span style={{ display: 'inline-block', width: '1.5rem', height: '1px', background: 'var(--accent)', opacity: 0.35 }} /> Low volume</div>
                </div>
              </div>

              {/* Detail panel */}
              {selectedNode && activeView === 'map' && (
                <DetailPanel node={selectedNode} envData={data} onClose={closeDetail} />
              )}
            </div>
          </div>

          {/* VIEW C: Dashboard */}
          <div className={`topo-view${activeView === 'dashboard' ? ' active' : ''}`}>
            <div className="dash-kpi-strip">
              {/* TODO: API */}
              <div className="dash-kpi"><span className="dash-kpi-label">Total Messages/hr</span><span className="dash-kpi-value">{numberFormat(dashKpis.totalMsgHr)}</span></div>
              <div className="dash-kpi"><span className="dash-kpi-label">Error Rate</span><span className="dash-kpi-value" style={{ color: dashKpis.degradedCount > 0 ? 'var(--amber)' : 'var(--green)' }}>{dashKpis.errorRate}</span></div>
              <div className="dash-kpi"><span className="dash-kpi-label">Avg Latency</span><span className="dash-kpi-value">{dashKpis.avgLatency}ms</span></div>
              <div className="dash-kpi"><span className="dash-kpi-label">Queue Issues</span><span className="dash-kpi-value" style={dashKpis.backedUpQueues > 0 ? { color: 'var(--amber)' } : undefined}>{dashKpis.backedUpQueues}</span></div>
              <div className="dash-kpi"><span className="dash-kpi-label">Active Consumers</span><span className="dash-kpi-value">{dashKpis.totalConsumers}</span></div>
              <div className="dash-kpi"><span className="dash-kpi-label">Health Failures</span><span className="dash-kpi-value" style={{ color: dashKpis.failingChecks > 0 ? 'var(--red)' : 'var(--green)' }}>{dashKpis.failingChecks}</span></div>
              <div className="dash-kpi"><span className="dash-kpi-label">Offline</span><span className="dash-kpi-value" style={{ color: dashKpis.offlineCount > 0 ? 'var(--red)' : 'var(--green)' }}>{dashKpis.offlineCount}</span></div>
            </div>
            <div className="topo-container dashboard-mode" ref={dashRef}>
              <div className="topo-glow" />
              <TopologySvg svgId="svg-dashboard" data={data} nodeMap={nodeMap} containerRef={dashRef} isDashboard markerPrefix="arrow-dash" />
              {allNodes.map(node => (
                <TopoNode
                  key={node.id}
                  node={node}
                  typeConfig={data.nodeTypes[node.type] || null}
                  healthStatus={healthCheckMap[node.id]}
                  isDashboard
                  onClick={handleNodeClick}
                />
              ))}
            </div>
          </div>

          {/* VIEW D: Health Checks */}
          <div className={`topo-view${activeView === 'health' ? ' active' : ''}`}>
            <div style={{ background: 'var(--card-bg)', border: '0.0625rem solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '36rem', overflowY: 'auto' }}>
              <table className="hc-table">
                <thead>
                  <tr>
                    <th style={{ width: '3rem' }}>Status</th>
                    <th>Check</th>
                    <th>Target</th>
                    <th style={{ width: '5rem' }}>Type</th>
                    <th className="r" style={{ width: '4rem' }}>Latency</th>
                    <th style={{ width: '6rem' }}>Last Check</th>
                    <th className="r" style={{ width: '3rem' }}>Fails</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHealthChecks.map(hc => {
                    const result = hc.lastResult
                    const status = result?.status || 'unknown'
                    const rowCls = status === 'fail' ? 'hc-fail' : status === 'warn' ? 'hc-warn' : ''
                    const targetName = nodeMap[hc.targetNode]?.name || hc.targetNode
                    const latencyStr = result?.latencyMs != null ? `${result.latencyMs}ms` : '-'
                    const latencyColor = status === 'warn' ? 'var(--amber)' : status === 'fail' ? 'var(--red)' : undefined
                    const checkedAt = result?.checkedAt ? result.checkedAt.replace('T', ' ').substring(11, 19) : '-'
                    const failCount = result?.consecutiveFailures || 0
                    return (
                      <tr key={hc.id} className={rowCls}>
                        <td><span className={`hc-status-dot ${status}`} />{status.toUpperCase()}</td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{hc.name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{targetName}</td>
                        <td><span className="hz-badge blue" style={{ fontSize: '0.375rem' }}>{hc.type}</span></td>
                        <td className="r" style={latencyColor ? { color: latencyColor } : undefined}>{latencyStr}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{checkedAt}</td>
                        <td className="r" style={failCount > 0 ? { color: 'var(--red)', fontWeight: 700 } : undefined}>{failCount}</td>
                        <td style={{ color: 'var(--text-tertiary)', fontSize: '0.5rem', maxWidth: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={result?.message || ''}>
                          {result?.message || '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Queue Monitor (collapsible) */}
        <div>
          <div className={`collapsible-header${!queueExpanded ? ' collapsed' : ''}`} onClick={() => setQueueExpanded(e => !e)}>
            <span className="collapse-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </span>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>Queue Monitor</span>
            <span className="hz-badge blue" style={{ fontSize: '0.375rem' }}>RabbitMQ</span>
          </div>
          {queueExpanded && (
            <div className="collapsible-body">
              <div className="queue-grid">
                {/* TODO: API */}
                {data.rabbitMq.queues.map(q => {
                  const cls = q.status === 'critical' ? ' critical' : (q.status === 'backing-up' || q.messages > 100) ? ' backing-up' : ''
                  const statusColor = q.status === 'critical' ? 'var(--red)' : q.status === 'backing-up' ? 'var(--amber)' : 'var(--green)'
                  return (
                    <div key={q.name} className={`queue-card${cls}`}>
                      <div className="q-name">{q.name}</div>
                      <div className="q-row"><span className="q-label">Messages</span><span className="q-val" style={q.messages > 100 ? { color: 'var(--red)', fontWeight: 700 } : undefined}>{q.messages}</span></div>
                      <div className="q-row"><span className="q-label">Consumers</span><span className="q-val" style={q.consumers === 0 ? { color: 'var(--red)', fontWeight: 700 } : undefined}>{q.consumers}</span></div>
                      <div className="q-row"><span className="q-label">Rate</span><span className="q-val">{q.rate} msg/s</span></div>
                      <div className="q-row"><span className="q-label">Unacked</span><span className="q-val" style={q.unacked > 0 ? { color: 'var(--amber)' } : undefined}>{q.unacked}</span></div>
                      <div className="q-row"><span className="q-label">Status</span><span className="q-val" style={{ color: statusColor }}>{q.status}</span></div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Message Explorer (collapsible) */}
        <div>
          <div className={`collapsible-header${!msgExpanded ? ' collapsed' : ''}`} onClick={() => setMsgExpanded(e => !e)}>
            <span className="collapse-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </span>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>Message Explorer</span>
            <span className="hz-badge blue" style={{ fontSize: '0.375rem' }}>Archive Search</span>
          </div>
          {msgExpanded && (
            <div className="collapsible-body">
              {/* Search Bar */}
              <div className="msg-search-bar" style={{ marginBottom: 'var(--sp-2)' }}>
                <div className="msg-search-field" style={{ flex: 1.5, minWidth: '10rem' }}>
                  <label>Correlation ID</label>
                  <input type="text" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem' }} placeholder="COR-T1001-20260502" />
                </div>
                <div className="msg-search-field" style={{ minWidth: '8rem' }}>
                  <label>Message Type</label>
                  <select defaultValue="">
                    <option value="">All Types</option>
                    {data.messageTypes.map(mt => <option key={mt.type} value={mt.type}>{mt.type}</option>)}
                  </select>
                </div>
                <div className="msg-search-field" style={{ minWidth: '6rem' }}>
                  <label>Date From</label>
                  <input type="date" defaultValue="2026-05-07" />
                </div>
                <div className="msg-search-field" style={{ minWidth: '6rem' }}>
                  <label>Date To</label>
                  <input type="date" defaultValue="2026-05-07" />
                </div>
                <div className="msg-search-field" style={{ minWidth: '7rem' }}>
                  <label>Source Service</label>
                  <select defaultValue="">
                    <option value="">All Sources</option>
                    {allNodes.filter(n => n.type === 'glint' || n.type === 'core').map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <div className="msg-search-field" style={{ minWidth: '5rem' }}>
                  <label>Status</label>
                  <select defaultValue="">
                    <option value="">All</option>
                    <option value="delivered">Delivered</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="msg-search-field" style={{ alignSelf: 'end' }}>
                  <button className="hz-btn primary sm" style={{ height: '1.5rem', fontSize: '0.5625rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    Search
                  </button>
                </div>
              </div>

              {/* Results Table */}
              <div style={{ background: 'var(--card-bg)', border: '0.0625rem solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <table className="msg-table">
                  <thead>
                    <tr>
                      <th style={{ width: '5.5rem' }}>Time</th>
                      <th style={{ width: '9rem' }}>Correlation ID</th>
                      <th>Type</th>
                      <th>Source &rarr; Destination</th>
                      <th className="r" style={{ width: '3rem' }}>Size</th>
                      <th style={{ width: '4rem' }}>Status</th>
                      <th className="r" style={{ width: '3rem' }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* TODO: API */}
                    {sampleMessages.map((msg, idx) => {
                      const isExpanded = expandedMsgIdx === idx
                      const currentTab = activeMsgTab[idx] || 'header'
                      return (
                        <MsgRow
                          key={idx}
                          msg={msg}
                          idx={idx}
                          isExpanded={isExpanded}
                          currentTab={currentTab}
                          onToggle={() => setExpandedMsgIdx(prev => prev === idx ? null : idx)}
                          onTabChange={(tab) => setActiveMsgTab(prev => ({ ...prev, [idx]: tab }))}
                        />
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>{/* /scrollable content */}
    </div>
  )
}

/* ================================================================
   MESSAGE ROW SUB-COMPONENT (expandable)
   ================================================================ */
function MsgRow({
  msg,
  idx,
  isExpanded,
  currentTab,
  onToggle,
  onTabChange,
}: {
  msg: {
    timeStr: string; corId: string; type: string; sourceName: string; destName: string
    size: string; latency: number; isSlow: boolean; exchange: string; routingKey: string
    frequency: string; samplePayload: Record<string, unknown>
  }
  idx: number
  isExpanded: boolean
  currentTab: string
  onToggle: () => void
  onTabChange: (tab: string) => void
}) {
  const status = msg.isSlow
    ? <span className="hz-badge amber" style={{ fontSize: '0.375rem' }}>Slow</span>
    : <span className="hz-badge green" style={{ fontSize: '0.375rem' }}>Delivered</span>
  const latColor = msg.isSlow ? 'var(--amber)' : 'var(--green)'

  return (
    <>
      <tr className={`msg-row${isExpanded ? ' expanded' : ''}`} onClick={onToggle}>
        <td style={{ color: 'var(--text-muted)' }}>{msg.timeStr}</td>
        <td><span className="hz-entity-link" style={{ fontSize: '0.5625rem' }}>{msg.corId}</span></td>
        <td style={{ color: 'var(--text-secondary)' }}>{msg.type}</td>
        <td style={{ color: 'var(--text-tertiary)' }}>{msg.sourceName} &rarr; {msg.destName}</td>
        <td className="r" style={{ color: 'var(--text-tertiary)' }}>{msg.size}</td>
        <td>{status}</td>
        <td className="r" style={{ color: latColor }}>{msg.latency}ms</td>
      </tr>
      {isExpanded && (
        <tr className="msg-detail">
          <td colSpan={7}>
            <div className="msg-detail-inner">
              <div className="msg-tabs">
                <button className={`msg-tab${currentTab === 'header' ? ' active' : ''}`} onClick={e => { e.stopPropagation(); onTabChange('header') }}>Header</button>
                {msg.samplePayload && <button className={`msg-tab${currentTab === 'payload' ? ' active' : ''}`} onClick={e => { e.stopPropagation(); onTabChange('payload') }}>Payload</button>}
              </div>
              {currentTab === 'header' && (
                <div className="msg-tab-panel active">
                  <div className="msg-header-grid">
                    <div><div className="mh-label">Correlation ID</div><div className="mh-value" style={{ color: 'var(--accent-light)' }}>{msg.corId}</div></div>
                    <div><div className="mh-label">Type</div><div className="mh-value">{msg.type}</div></div>
                    <div><div className="mh-label">Exchange</div><div className="mh-value">{msg.exchange || '-'}</div></div>
                    <div><div className="mh-label">Routing Key</div><div className="mh-value">{msg.routingKey || '-'}</div></div>
                    <div><div className="mh-label">Source</div><div className="mh-value">{msg.sourceName}</div></div>
                    <div><div className="mh-label">Frequency</div><div className="mh-value">{msg.frequency || '-'}</div></div>
                  </div>
                </div>
              )}
              {currentTab === 'payload' && msg.samplePayload && (
                <div className="msg-tab-panel active">
                  <div className="json-viewer" dangerouslySetInnerHTML={{ __html: syntaxHighlight(JSON.stringify(msg.samplePayload, null, 2)) }} />
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
