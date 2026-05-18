/**
 * SQL Checks page — ported from v43 support-sql-checks.html
 * Uses EXACT same CSS class names from the prototype.
 * All mock data is inline. API integration points marked with TODO: API.
 */
import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

/* ================================================================
   CHECK DEFINITIONS — data-driven, structured as if from API
   Each check has per-check parameters with defaults.
   SQL templates use @paramName for both global and per-check params.
   TODO: API — In production, fetch from GET /api/support/sql-checks
   ================================================================ */

interface CheckParameter {
  id: string
  label: string
  type: 'number' | 'select' | 'text'
  default: number | string
  min?: number
  max?: number
  step?: number
  description?: string
  options?: Array<string | { value: string; label: string }>
}

interface MockResult {
  status: 'PASS' | 'WARN' | 'FAIL'
  detail: string
  duration: string
  rows: string[][]
}

interface CheckDefinition {
  id: number
  name: string
  category: string
  description: string
  severity: 'error' | 'warning'
  parameters: CheckParameter[]
  sqlTemplate: string
  cols: string[]
  colAlign: (string | null)[]
  mockResult: () => MockResult
}

interface CheckState {
  status: 'PASS' | 'WARN' | 'FAIL'
  detail: string
  duration: string
  time: string
  rows: string[][]
  cols: string[]
  colAlign: (string | null)[]
}

const CHECKS: CheckDefinition[] = [
  {
    id: 1, name: 'Bootstrap Curve Validation', category: 'Curves',
    description: 'Checks forward curves for smoothness and arbitrage-free pricing',
    severity: 'error',
    parameters: [
      { id: 'max_delta_pct', label: 'Max Delta %', type: 'number', default: 5, min: 0.1, max: 50, step: 0.5, description: 'Maximum allowed price change between adjacent tenors as a percentage' }
    ],
    sqlTemplate: `-- Bootstrap Curve Validation
-- Checks forward curves for smoothness and arbitrage-free pricing
SELECT
    c.benchmark, c.tenor, c.settle_date,
    c.price AS current_price,
    LAG(c.price) OVER (PARTITION BY c.benchmark ORDER BY c.tenor) AS prev_price,
    ABS(c.price - LAG(c.price) OVER (...)) AS delta,
    CASE WHEN ABS(delta) > c.price * (@max_delta_pct / 100.0)
         THEN 'FAIL' ELSE 'PASS' END AS check_result
FROM curve_data c
WHERE c.curve_date = @cob
  AND (@benchmark = 'ALL' OR c.benchmark = @benchmark)
ORDER BY c.benchmark, c.tenor;`,
    cols: ['Benchmark','Tenor','Settle Date','Price','Prev Price','Delta','Result'],
    colAlign: [null,null,null,'r','r','r','c'],
    mockResult: () => ({
      status: 'PASS', detail: '4 curves, 96 tenors validated', duration: '2.4s', rows: [
        ['JKM','M+1','2026-06-15','14.85','14.72','0.13','PASS'],
        ['JKM','M+2','2026-07-15','14.62','14.85','0.23','PASS'],
        ['JKM','M+3','2026-08-15','14.41','14.62','0.21','PASS'],
        ['TTF','M+1','2026-06-15','11.34','11.28','0.06','PASS'],
        ['TTF','M+2','2026-07-15','11.18','11.34','0.16','PASS'],
        ['HH','M+1','2026-06-15','3.42','3.38','0.04','PASS'],
        ['Brent','M+1','2026-06-15','78.40','78.15','0.25','PASS'],
        ['Brent','M+2','2026-07-15','77.95','78.40','0.45','PASS'],
      ]
    })
  },
  {
    id: 2, name: 'Forward Curve Monotonicity', category: 'Curves',
    description: 'Detects backward inversions in the forward curve',
    severity: 'warning',
    parameters: [
      { id: 'tenor_start', label: 'Tenor Start (months)', type: 'number', default: 1, min: 1, max: 120, step: 1, description: 'Start of tenor range to check' },
      { id: 'tenor_end', label: 'Tenor End (months)', type: 'number', default: 60, min: 1, max: 120, step: 1, description: 'End of tenor range to check' }
    ],
    sqlTemplate: `-- Forward Curve Monotonicity
-- Detects backward inversions in the forward curve
SELECT benchmark, tenor, price,
    LAG(price) OVER (PARTITION BY benchmark ORDER BY tenor) AS prev,
    CASE WHEN price < LAG(price) OVER (...) THEN 'INVERSION'
         ELSE 'OK' END AS status
FROM curve_data
WHERE curve_date = @cob
  AND (@benchmark = 'ALL' OR benchmark = @benchmark)
  AND tenor_months BETWEEN @tenor_start AND @tenor_end
ORDER BY benchmark, tenor;`,
    cols: ['Benchmark','Tenor','Price','Prev','Status'],
    colAlign: [null,null,'r','r','c'],
    mockResult: () => ({ status: 'PASS', detail: 'No inversions detected', duration: '1.1s', rows: [] })
  },
  {
    id: 3, name: 'Stale Price Detection', category: 'Curves',
    description: 'Flags prices not updated within staleness threshold',
    severity: 'warning',
    parameters: [
      { id: 'staleness_threshold_hours', label: 'Staleness Threshold (hrs)', type: 'number', default: 24, min: 1, max: 168, step: 1, description: 'Number of hours after which a price is considered stale' }
    ],
    sqlTemplate: `-- Stale Price Detection
-- Flags prices not updated within staleness threshold
SELECT benchmark, tenor, price, last_updated,
    DATEDIFF(hour, last_updated, @cob + ' 17:00') AS hours_stale
FROM curve_data
WHERE curve_date = @cob
  AND DATEDIFF(hour, last_updated, @cob + ' 17:00') > @staleness_threshold_hours
  AND (@benchmark = 'ALL' OR benchmark = @benchmark)
ORDER BY hours_stale DESC;`,
    cols: ['Benchmark','Tenor','Price','Last Updated','Hours Stale'],
    colAlign: [null,null,'r',null,'r'],
    mockResult: () => ({
      status: 'WARN', detail: '6 prices >24h old', duration: '0.8s', rows: [
        ['NBP','Q3-26','8.42','2026-05-04 09:15','55'],
        ['NBP','Q4-26','9.10','2026-05-04 09:15','55'],
        ['JCC','M+4','72.30','2026-05-04 14:22','50'],
        ['JCC','M+5','71.85','2026-05-04 14:22','50'],
        ['JCC','M+6','71.40','2026-05-04 14:22','50'],
        ['HH','Cal-27','3.95','2026-05-05 03:00','38'],
      ]
    })
  },
  {
    id: 4, name: 'Trade Duplicate Check', category: 'Trades',
    description: 'Identifies trades with identical key fields',
    severity: 'error',
    parameters: [
      { id: 'lookback_days', label: 'Lookback Days', type: 'number', default: 7, min: 1, max: 90, step: 1, description: 'Number of days to look back for duplicate detection' }
    ],
    sqlTemplate: `-- Trade Duplicate Check
-- Identifies trades with identical key fields
SELECT t1.trade_id, t1.counterparty, t1.direction,
    t1.volume, t1.price, t1.trade_date,
    COUNT(*) OVER (PARTITION BY t1.counterparty, t1.direction,
        t1.volume, t1.price, t1.trade_date) AS dup_count
FROM trades t1
WHERE t1.trade_date BETWEEN DATEADD(day, -@lookback_days, @cob) AND @cob
  AND (@book = 'ALL' OR t1.book = @book)
HAVING dup_count > 1
ORDER BY t1.trade_date DESC;`,
    cols: ['Trade ID','Counterparty','Direction','Volume','Price','Trade Date','Dup Count'],
    colAlign: [null,null,null,'r','r',null,'r'],
    mockResult: () => ({ status: 'PASS', detail: '0 duplicates in 1,247 trades', duration: '3.2s', rows: [] })
  },
  {
    id: 5, name: 'Missing Settlement Prices', category: 'Settlement',
    description: 'Checks for settlement periods without published prices',
    severity: 'error',
    parameters: [
      { id: 'lookback_days', label: 'Lookback Days', type: 'number', default: 5, min: 0, max: 30, step: 1, description: 'Past days to check for missing settlements' },
      { id: 'lookahead_days', label: 'Lookahead Days', type: 'number', default: 3, min: 0, max: 30, step: 1, description: 'Future days to check for settlement gaps' }
    ],
    sqlTemplate: `-- Missing Settlement Prices
-- Checks for settlement periods without published prices
SELECT s.benchmark, s.delivery_month, s.settlement_type,
    s.expected_date, s.status
FROM settlement_schedule s
LEFT JOIN settlement_prices sp
    ON s.benchmark = sp.benchmark
    AND s.delivery_month = sp.delivery_month
WHERE sp.price IS NULL
  AND s.expected_date BETWEEN DATEADD(day, -@lookback_days, @cob) AND DATEADD(day, @lookahead_days, @cob)
  AND (@benchmark = 'ALL' OR s.benchmark = @benchmark)
ORDER BY s.expected_date;`,
    cols: ['Benchmark','Delivery Month','Settlement Type','Expected Date','Status'],
    colAlign: [null,null,null,null,'c'],
    mockResult: () => ({
      status: 'WARN', detail: '2 missing: NBP Nov, JCC Dec', duration: '1.5s', rows: [
        ['NBP','Nov-26','Final','2026-05-02','MISSING'],
        ['JCC','Dec-26','Provisional','2026-05-05','MISSING'],
      ]
    })
  },
  {
    id: 6, name: 'Position-Trade Reconciliation', category: 'Positions',
    description: 'Verifies aggregated positions match underlying trades',
    severity: 'error',
    parameters: [
      { id: 'variance_threshold', label: 'Variance Threshold', type: 'number', default: 0.01, min: 0, max: 1000, step: 0.01, description: 'Minimum absolute variance to flag (volume units)' }
    ],
    sqlTemplate: `-- Position-Trade Reconciliation
-- Verifies aggregated positions match underlying trades
SELECT p.benchmark, p.delivery_month,
    p.net_position AS pos_volume,
    SUM(CASE t.direction WHEN 'BUY' THEN t.volume
         ELSE -t.volume END) AS trade_volume,
    p.net_position - trade_volume AS variance
FROM positions p
JOIN trades t ON p.benchmark = t.benchmark
    AND p.delivery_month = t.delivery_month
WHERE p.as_of_date = @cob
  AND (@book = 'ALL' OR p.book = @book)
GROUP BY p.benchmark, p.delivery_month, p.net_position
HAVING ABS(variance) > @variance_threshold
ORDER BY ABS(variance) DESC;`,
    cols: ['Benchmark','Delivery Month','Position Vol','Trade Vol','Variance'],
    colAlign: [null,null,'r','r','r'],
    mockResult: () => ({ status: 'PASS', detail: 'All positions reconciled', duration: '4.8s', rows: [] })
  },
  {
    id: 7, name: 'Credit Limit Validation', category: 'Risk',
    description: 'Checks counterparty exposure against credit limits',
    severity: 'warning',
    parameters: [
      { id: 'utilisation_warning_pct', label: 'Warning Threshold %', type: 'number', default: 80, min: 10, max: 100, step: 5, description: 'Utilisation percentage above which a counterparty is flagged' }
    ],
    sqlTemplate: `-- Credit Limit Validation
-- Checks counterparty exposure against credit limits
SELECT cp.name, cp.credit_limit,
    SUM(t.mtm_value) AS exposure,
    cp.credit_limit - SUM(t.mtm_value) AS headroom,
    ROUND(SUM(t.mtm_value) / cp.credit_limit * 100, 1) AS utilisation_pct
FROM counterparties cp
JOIN trades t ON cp.id = t.counterparty_id
WHERE t.status IN ('FO-Validated', 'Trade Checked')
  AND t.value_date >= @cob
  AND (@book = 'ALL' OR t.book = @book)
GROUP BY cp.name, cp.credit_limit
HAVING ROUND(SUM(t.mtm_value) / cp.credit_limit * 100, 1) >= @utilisation_warning_pct
ORDER BY utilisation_pct DESC;`,
    cols: ['Counterparty','Credit Limit ($M)','Exposure ($M)','Headroom ($M)','Utilisation %'],
    colAlign: [null,'r','r','r','r'],
    mockResult: () => ({
      status: 'PASS', detail: 'All within limits', duration: '0.6s', rows: [
        ['Tokyo Gas','150.0','89.2','60.8','59.5'],
        ['JERA','200.0','112.4','87.6','56.2'],
        ['Kogas','180.0','67.1','112.9','37.3'],
        ['Shell Eastern','250.0','43.8','206.2','17.5'],
        ['Petronas LNG','120.0','18.6','101.4','15.5'],
      ]
    })
  },
  {
    id: 8, name: 'Counterparty Master Check', category: 'Reference',
    description: 'Validates counterparty records for completeness',
    severity: 'warning',
    parameters: [
      { id: 'kyc_warning_days', label: 'KYC Warning Days', type: 'number', default: 30, min: 7, max: 180, step: 7, description: 'Days before KYC expiry to raise a warning' }
    ],
    sqlTemplate: `-- Counterparty Master Check
-- Validates counterparty records for completeness
SELECT cp.id, cp.name, cp.lei, cp.status,
    cp.kyc_expiry,
    CASE WHEN cp.lei IS NULL THEN 'Missing LEI'
         WHEN cp.credit_limit IS NULL THEN 'No credit limit'
         WHEN cp.kyc_expiry < @cob THEN 'KYC expired'
         WHEN DATEDIFF(day, @cob, cp.kyc_expiry) <= @kyc_warning_days THEN 'KYC expiring soon'
         ELSE 'Valid' END AS validation
FROM counterparties cp
WHERE cp.status = 'Active'
  AND (cp.lei IS NULL OR cp.credit_limit IS NULL OR cp.kyc_expiry < DATEADD(day, @kyc_warning_days, @cob))
ORDER BY cp.name;`,
    cols: ['ID','Name','LEI','Status','KYC Expiry','Validation'],
    colAlign: [null,null,null,'c',null,'c'],
    mockResult: () => ({ status: 'PASS', detail: '47 counterparties valid', duration: '0.4s', rows: [] })
  },
  {
    id: 9, name: 'Unmatched Nominations', category: 'Operations',
    description: 'Finds nominations without a matching trade or cargo',
    severity: 'error',
    parameters: [
      { id: 'forward_days', label: 'Forward Window (days)', type: 'number', default: 30, min: 1, max: 365, step: 1, description: 'Days forward from COB to check for unmatched nominations' }
    ],
    sqlTemplate: `-- Unmatched Nominations
-- Finds nominations without a matching trade or cargo
SELECT n.nom_id, n.facility, n.direction,
    n.volume_mmbtu, n.flow_date, n.status,
    n.counterparty
FROM nominations n
LEFT JOIN trades t ON n.trade_id = t.trade_id
WHERE t.trade_id IS NULL
  AND n.flow_date BETWEEN @cob AND DATEADD(day, @forward_days, @cob)
  AND n.status != 'Cancelled'
ORDER BY n.flow_date;`,
    cols: ['Nom ID','Facility','Direction','Volume (MMBtu)','Flow Date','Status','Counterparty'],
    colAlign: [null,null,null,'r',null,'c',null],
    mockResult: () => ({
      status: 'FAIL', detail: '1 unmatched: NOM-Q2-003', duration: '1.2s', rows: [
        ['NOM-Q2-003','Sabine Pass','DELIVER','145,000','2026-05-12','Confirmed','JERA'],
      ]
    })
  },
  {
    id: 10, name: 'Invoice Amount Validation', category: 'Settlement',
    description: 'Checks invoiced amounts against calculated amounts',
    severity: 'error',
    parameters: [
      { id: 'tolerance_pct', label: 'Tolerance %', type: 'number', default: 0.1, min: 0.001, max: 5, step: 0.01, description: 'Maximum allowed variance as percentage of invoice amount' }
    ],
    sqlTemplate: `-- Invoice Amount Validation
-- Checks invoiced amounts against calculated amounts
SELECT i.invoice_id, i.counterparty, i.invoice_amount,
    c.calculated_amount,
    ABS(i.invoice_amount - c.calculated_amount) AS variance,
    CASE WHEN ABS(variance) > i.invoice_amount * (@tolerance_pct / 100.0)
         THEN 'OUT OF TOLERANCE' ELSE 'OK' END AS status
FROM invoices i
JOIN calculated_settlements c
    ON i.trade_id = c.trade_id AND i.period = c.period
WHERE i.invoice_date <= @cob
  AND i.status IN ('Pending', 'Approved')
  AND (@book = 'ALL' OR i.book = @book)
ORDER BY variance DESC;`,
    cols: ['Invoice ID','Counterparty','Invoiced ($)','Calculated ($)','Variance ($)','Status'],
    colAlign: [null,null,'r','r','r','c'],
    mockResult: () => ({
      status: 'PASS', detail: 'All invoices within tolerance', duration: '2.1s', rows: [
        ['INV-2026-0142','Tokyo Gas','4,812,340.00','4,812,291.50','48.50','OK'],
        ['INV-2026-0143','JERA','7,241,100.00','7,241,087.25','12.75','OK'],
        ['INV-2026-0138','Kogas','3,590,000.00','3,589,972.10','27.90','OK'],
      ]
    })
  },
  {
    id: 11, name: 'Orphaned Cargo Check', category: 'Physical',
    description: 'Finds cargoes without both a buy and sell trade',
    severity: 'error',
    parameters: [
      { id: 'forward_days', label: 'Forward Window (days)', type: 'number', default: 90, min: 7, max: 365, step: 7, description: 'Days forward from COB to check for orphaned cargoes' }
    ],
    sqlTemplate: `-- Orphaned Cargo Check
-- Finds cargoes without both a buy and sell trade
SELECT c.cargo_id, c.vessel, c.load_port, c.discharge_port,
    c.load_date, c.volume_mmbtu,
    CASE WHEN tb.trade_id IS NULL THEN 'No buy trade'
         WHEN ts.trade_id IS NULL THEN 'No sell trade'
         END AS issue
FROM cargoes c
LEFT JOIN trades tb ON c.buy_trade_id = tb.trade_id
LEFT JOIN trades ts ON c.sell_trade_id = ts.trade_id
WHERE (tb.trade_id IS NULL OR ts.trade_id IS NULL)
  AND c.load_date BETWEEN @cob AND DATEADD(day, @forward_days, @cob)
ORDER BY c.load_date;`,
    cols: ['Cargo ID','Vessel','Load Port','Discharge Port','Load Date','Volume (MMBtu)','Issue'],
    colAlign: [null,null,null,null,null,'r',null],
    mockResult: () => ({ status: 'PASS', detail: 'No orphaned cargoes', duration: '0.9s', rows: [] })
  },
  {
    id: 12, name: 'EOD Completeness', category: 'System',
    description: 'Validates all end-of-day batch steps completed',
    severity: 'error',
    parameters: [
      { id: 'max_step_duration_sec', label: 'Max Step Duration (sec)', type: 'number', default: 300, min: 30, max: 3600, step: 30, description: 'Maximum allowed duration for any single EOD step in seconds' }
    ],
    sqlTemplate: `-- EOD Completeness
-- Validates all end-of-day batch steps completed
SELECT step_name, step_order, status,
    started_at, completed_at,
    DATEDIFF(second, started_at, completed_at) AS duration_sec
FROM eod_batch_log
WHERE batch_date = @cob
  AND (status != 'COMPLETE' OR DATEDIFF(second, started_at, completed_at) > @max_step_duration_sec)
ORDER BY step_order;`,
    cols: ['Step','Order','Status','Started','Completed','Duration (s)'],
    colAlign: [null,'c','c',null,null,'r'],
    mockResult: () => ({
      status: 'PASS', detail: '8/8 steps complete', duration: '0.3s', rows: [
        ['Curve Snapshot','1','COMPLETE','17:00:01','17:00:14','13'],
        ['Position Calc','2','COMPLETE','17:00:15','17:01:42','87'],
        ['P&L Calc','3','COMPLETE','17:01:43','17:03:18','95'],
        ['Risk Metrics','4','COMPLETE','17:03:19','17:04:05','46'],
        ['Credit Update','5','COMPLETE','17:04:06','17:04:22','16'],
        ['Trade Validation','6','COMPLETE','17:04:23','17:05:01','38'],
        ['Report Generation','7','COMPLETE','17:05:02','17:06:44','102'],
        ['Archive','8','COMPLETE','17:06:45','17:07:02','17'],
      ]
    })
  }
]

/* ================================================================
   PRESET DEFINITIONS
   ================================================================ */
interface PresetConfig {
  cob: number
  env: string
  book: string
  benchmark: string
}

const PRESETS: Record<string, PresetConfig> = {
  'eod-prod':   { cob: 0, env: 'PROD', book: 'ALL', benchmark: 'ALL' },
  'eod-1-prod': { cob: -1, env: 'PROD', book: 'ALL', benchmark: 'ALL' },
  'uat-all':    { cob: 0, env: 'UAT',  book: 'ALL', benchmark: 'ALL' },
  'jkm-only':   { cob: 0, env: 'PROD', book: 'ALL', benchmark: 'JKM' },
  'glng-book':  { cob: 0, env: 'PROD', book: 'ACME', benchmark: 'ALL' },
  'ttf-curves': { cob: 0, env: 'PROD', book: 'ALL', benchmark: 'TTF' }
}

const PRESET_LABELS: Record<string, string> = {
  'eod-prod': 'EOD PROD',
  'eod-1-prod': 'EOD-1 PROD',
  'uat-all': 'UAT All',
  'jkm-only': 'JKM Only',
  'glng-book': 'ACME Book',
  'ttf-curves': 'TTF Curves',
}

/* ================================================================
   SQL SYNTAX HIGHLIGHTING
   ================================================================ */
function highlightSQL(sql: string): string {
  let s = sql.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // Highlight @param references
  s = s.replace(/@(\w+)/g, '<span class="sql-param">@$1</span>')
  s = s.replace(/(--[^\n]*)/g, '<span class="sql-comment">$1</span>')
  s = s.replace(/'([^']*)'/g, '<span class="sql-str">\'$1\'</span>')
  s = s.replace(/\b(\d+\.?\d*)\b/g, '<span class="sql-num">$1</span>')
  const kws = ['SELECT','FROM','WHERE','AND','OR','NOT','IN','AS','ON','JOIN','LEFT','RIGHT','INNER',
    'CROSS','GROUP BY','ORDER BY','HAVING','CASE','WHEN','THEN','ELSE','END','IS','NULL','BETWEEN',
    'LIKE','EXISTS','UNION','PARTITION BY','DESC','ASC','DISTINCT','WITH']
  kws.forEach(kw => {
    const re = new RegExp('\\b(' + kw.replace(/ /g, '\\s+') + ')\\b', 'gi')
    s = s.replace(re, '<span class="sql-kw">$1</span>')
  })
  const fns = ['COUNT','SUM','AVG','MIN','MAX','ABS','ROUND','LAG','LEAD','OVER','ROW_NUMBER',
    'DATEDIFF','DATEADD','CURRENT_DATE','COALESCE','ISNULL','CAST','CONVERT','GETDATE']
  fns.forEach(fn => {
    const re = new RegExp('\\b(' + fn + ')\\b', 'gi')
    s = s.replace(re, '<span class="sql-fn">$1</span>')
  })
  return s
}

/* ================================================================
   HELPERS
   ================================================================ */
function todayStr(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function nowTime(): string {
  const now = new Date()
  return (
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0')
  )
}

function nowTimestamp(): string {
  const now = new Date()
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return (
    String(now.getDate()).padStart(2, '0') + ' ' +
    months[now.getMonth()] + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0')
  )
}

/** Build SQL with parameter substitution */
function buildSql(
  checkId: number,
  globalParams: { cob: string; environment: string; book: string; benchmark: string },
  checkParamValues: Record<number, Record<string, number | string>>
): string {
  const chk = CHECKS.find(c => c.id === checkId)
  if (!chk) return ''
  let sql = chk.sqlTemplate
  // Substitute global params
  sql = sql.replace(/@cob\b/g, `'${globalParams.cob}'`)
  sql = sql.replace(/@environment\b/g, `'${globalParams.environment}'`)
  sql = sql.replace(/@book\b/g, `'${globalParams.book}'`)
  sql = sql.replace(/@benchmark\b/g, `'${globalParams.benchmark}'`)
  // Substitute per-check params
  const defaults: Record<string, number | string> = {}
  chk.parameters.forEach(p => { defaults[p.id] = p.default })
  const overrides = checkParamValues[checkId] || {}
  const merged = { ...defaults, ...overrides }
  for (const key in merged) {
    const val = merged[key]
    const re = new RegExp('@' + key + '\\b', 'g')
    if (typeof val === 'number') {
      sql = sql.replace(re, String(val))
    } else {
      sql = sql.replace(re, `'${val}'`)
    }
  }
  return sql
}

/* ================================================================
   STATUS BADGE component
   ================================================================ */
function StatusBadge({ cell }: { cell: string }) {
  if (cell === 'PASS' || cell === 'OK' || cell === 'COMPLETE' || cell === 'Valid') {
    return <span className="hz-badge green">{cell}</span>
  }
  if (cell === 'FAIL' || cell === 'MISSING' || cell === 'OUT OF TOLERANCE' || cell === 'INVERSION') {
    return <span className="hz-badge red">{cell}</span>
  }
  if (cell === 'WARN' || cell === 'Confirmed') {
    return <span className="hz-badge amber">{cell}</span>
  }
  return <>{cell}</>
}

function isStatusCell(cell: string): boolean {
  return ['PASS','OK','COMPLETE','Valid','FAIL','MISSING','OUT OF TOLERANCE','INVERSION','WARN','Confirmed'].includes(cell)
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export function SqlChecksPage() {
  /* ---- Global parameters ---- */
  const [cobDate, setCobDate] = useState(todayStr)
  const [environment, setEnvironment] = useState('PROD')
  const [book, setBook] = useState('ALL')
  const [benchmark, setBenchmark] = useState('ALL')
  const [activePreset, setActivePreset] = useState('eod-prod')

  /* ---- Check states ---- */
  const [checkStates, setCheckStates] = useState<Record<number, CheckState>>({})
  const [runningChecks, setRunningChecks] = useState<Record<number, boolean>>({})
  const [selectedChecks, setSelectedChecks] = useState<Record<number, boolean>>({})
  const [activeCheckId, setActiveCheckId] = useState<number | null>(null)
  const [checkParamValues, setCheckParamValues] = useState<Record<number, Record<string, number | string>>>({})

  /* ---- Detail panel state ---- */
  const [panelOpen, setPanelOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'results' | 'sql'>('results')
  const [multiSelectMode, setMultiSelectMode] = useState(false)
  const [multiSelectIds, setMultiSelectIds] = useState<number[]>([])
  const [lastRunTime, setLastRunTime] = useState<string | null>(null)

  /* ---- Resize handle ---- */
  const panelRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<{ startY: number; startH: number } | null>(null)

  const globalParams = useMemo(() => ({
    cob: cobDate,
    environment,
    book,
    benchmark,
  }), [cobDate, environment, book, benchmark])

  /* ---- Summary counts ---- */
  const summary = useMemo(() => {
    let pass = 0, warn = 0, fail = 0, total = 0
    for (const id in checkStates) {
      total++
      const st = checkStates[Number(id)]
      if (st.status === 'PASS') pass++
      else if (st.status === 'WARN') warn++
      else fail++
    }
    return { pass, warn, fail, total }
  }, [checkStates])

  /* ---- Per-check param helpers ---- */
  const getCheckParamValues = useCallback((checkId: number): Record<string, number | string> => {
    const chk = CHECKS.find(c => c.id === checkId)
    if (!chk) return {}
    const defaults: Record<string, number | string> = {}
    chk.parameters.forEach(p => { defaults[p.id] = p.default })
    const overrides = checkParamValues[checkId] || {}
    return { ...defaults, ...overrides }
  }, [checkParamValues])

  const setCheckParam = useCallback((checkId: number, paramId: string, value: number | string) => {
    setCheckParamValues(prev => ({
      ...prev,
      [checkId]: { ...(prev[checkId] || {}), [paramId]: value }
    }))
  }, [])

  /* ---- Preset application ---- */
  const applyPreset = useCallback((key: string) => {
    const p = PRESETS[key]
    if (!p) return
    setCobDate(todayStr(p.cob))
    setEnvironment(p.env)
    setBook(p.book)
    setBenchmark(p.benchmark)
    setActivePreset(key)
  }, [])

  /* ---- Run a single check ---- */
  const runSingleCheck = useCallback((id: number) => {
    /* TODO: API — POST /api/support/sql-checks/{id}/run with global + per-check params */
    const chk = CHECKS.find(c => c.id === id)
    if (!chk) return

    setRunningChecks(prev => ({ ...prev, [id]: true }))

    const delay = 400 + Math.random() * 800
    setTimeout(() => {
      const result = chk.mockResult()
      const time = nowTime()

      setCheckStates(prev => ({
        ...prev,
        [id]: {
          status: result.status,
          detail: result.detail,
          duration: result.duration,
          time,
          rows: result.rows,
          cols: chk.cols,
          colAlign: chk.colAlign,
        }
      }))
      setRunningChecks(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setActiveCheckId(id)
      setMultiSelectMode(false)
      setPanelOpen(true)
      setActiveTab('results')
      setLastRunTime(nowTimestamp())
    }, delay)
  }, [])

  /* ---- Run batch (all or selected) ---- */
  const runBatch = useCallback((ids: number[]) => {
    /* TODO: API — POST /api/support/sql-checks/batch with ids + params */
    // Mark all as running
    setRunningChecks(prev => {
      const next = { ...prev }
      ids.forEach(id => { next[id] = true })
      return next
    })

    ids.forEach((id, i) => {
      setTimeout(() => {
        const chk = CHECKS.find(c => c.id === id)
        if (!chk) return
        const result = chk.mockResult()
        const time = nowTime()

        setCheckStates(prev => ({
          ...prev,
          [id]: {
            status: result.status,
            detail: result.detail,
            duration: result.duration,
            time,
            rows: result.rows,
            cols: chk.cols,
            colAlign: chk.colAlign,
          }
        }))
        setRunningChecks(prev => {
          const next = { ...prev }
          delete next[id]
          return next
        })
        setLastRunTime(nowTimestamp())

        // After last check completes, show summary
        if (i === ids.length - 1) {
          setTimeout(() => {
            if (ids.length > 1) {
              setMultiSelectMode(true)
              setMultiSelectIds(ids)
              setPanelOpen(true)
              setActiveTab('results')
            } else {
              setActiveCheckId(ids[0])
              setMultiSelectMode(false)
              setPanelOpen(true)
              setActiveTab('results')
            }
          }, 100)
        }
      }, (i + 1) * (300 + Math.random() * 400))
    })
  }, [])

  const runAllChecks = useCallback(() => {
    runBatch(CHECKS.map(c => c.id))
  }, [runBatch])

  const runSelected = useCallback(() => {
    const ids = CHECKS.filter(c => selectedChecks[c.id]).map(c => c.id)
    if (ids.length === 0) return
    runBatch(ids)
  }, [selectedChecks, runBatch])

  /* ---- Export results ---- */
  const exportResults = useCallback(() => {
    /* TODO: API — could also export from server */
    const allRows: string[] = []
    const header = ['Check #','Check Name','Category','Status','Details','Duration']
    allRows.push(header.join(','))
    CHECKS.forEach(chk => {
      const st = checkStates[chk.id]
      if (st) {
        allRows.push([chk.id, `"${chk.name}"`, chk.category, st.status, `"${st.detail}"`, st.duration].join(','))
      }
    })
    if (allRows.length <= 1) return
    const blob = new Blob([allRows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `sql-checks-${cobDate}.csv`
    a.click()
  }, [checkStates, cobDate])

  /* ---- Row click → show SQL ---- */
  const selectCheck = useCallback((id: number) => {
    setActiveCheckId(id)
    setMultiSelectMode(false)
    setPanelOpen(true)
    setActiveTab('sql')
  }, [])

  /* ---- View results / SQL for a check ---- */
  const viewResults = useCallback((id: number) => {
    setActiveCheckId(id)
    setMultiSelectMode(false)
    setPanelOpen(true)
    setActiveTab('results')
  }, [])

  const viewSQL = useCallback((id: number) => {
    setActiveCheckId(id)
    setMultiSelectMode(false)
    setPanelOpen(true)
    setActiveTab('sql')
  }, [])

  /* ---- Close panel ---- */
  const closePanel = useCallback(() => {
    setPanelOpen(false)
    setActiveCheckId(null)
    setMultiSelectMode(false)
  }, [])

  /* ---- Toggle select all ---- */
  const toggleSelectAll = useCallback((checked: boolean) => {
    const next: Record<number, boolean> = {}
    if (checked) {
      CHECKS.forEach(c => { next[c.id] = true })
    }
    setSelectedChecks(next)
  }, [])

  /* ---- Toggle individual check ---- */
  const toggleCheckSelection = useCallback((id: number) => {
    setSelectedChecks(prev => {
      const next = { ...prev }
      if (next[id]) {
        delete next[id]
      } else {
        next[id] = true
      }
      return next
    })
  }, [])

  /* ---- Handle multi-select changes ---- */
  useEffect(() => {
    const ids = CHECKS.filter(c => selectedChecks[c.id]).map(c => c.id)
    if (ids.length > 1) {
      setMultiSelectMode(true)
      setMultiSelectIds(ids)
      setPanelOpen(true)
      setActiveTab('results')
    } else if (ids.length === 1) {
      setActiveCheckId(ids[0])
      setMultiSelectMode(false)
      setPanelOpen(true)
      setActiveTab('sql')
    }
  }, [selectedChecks])

  /* ---- Copy actions ---- */
  const copySql = useCallback(() => {
    if (!activeCheckId) return
    const sql = buildSql(activeCheckId, globalParams, checkParamValues)
    navigator.clipboard.writeText(sql)
  }, [activeCheckId, globalParams, checkParamValues])

  const copyResults = useCallback(() => {
    if (!activeCheckId) return
    const st = checkStates[activeCheckId]
    if (!st || st.rows.length === 0) return
    const lines = [st.cols.join('\t')]
    st.rows.forEach(row => { lines.push(row.join('\t')) })
    navigator.clipboard.writeText(lines.join('\n'))
  }, [activeCheckId, checkStates])

  /* ---- Resize handle drag ---- */
  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (!panelRef.current) return
    resizeRef.current = { startY: e.clientY, startH: panelRef.current.offsetHeight }

    const onDrag = (ev: MouseEvent) => {
      if (!resizeRef.current || !panelRef.current) return
      const delta = resizeRef.current.startY - ev.clientY
      const newH = Math.max(120, Math.min(window.innerHeight * 0.7, resizeRef.current.startH + delta))
      panelRef.current.style.maxHeight = newH + 'px'
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('mouseup', onUp)
      resizeRef.current = null
    }
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', onUp)
  }, [])

  /* ---- Keyboard shortcuts ---- */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        runAllChecks()
      }
      if (e.key === 'Escape') {
        closePanel()
      }
      // Enter on per-check param field triggers run of active check
      if (e.key === 'Enter' && (e.target as HTMLElement)?.closest?.('.check-params-bar') && activeCheckId) {
        e.preventDefault()
        runSingleCheck(activeCheckId)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [runAllChecks, closePanel, activeCheckId, runSingleCheck])

  /* ---- Computed: active check + its built SQL ---- */
  const activeCheck = activeCheckId ? CHECKS.find(c => c.id === activeCheckId) : null
  const activeSql = activeCheckId
    ? highlightSQL(buildSql(activeCheckId, globalParams, checkParamValues))
    : ''
  const activeState = activeCheckId ? checkStates[activeCheckId] : null

  /* ---- Multi-select summary data ---- */
  const multiSummary = useMemo(() => {
    if (!multiSelectMode) return null
    let ranCount = 0, pass = 0, warn = 0, fail = 0
    multiSelectIds.forEach(id => {
      const st = checkStates[id]
      if (st) {
        ranCount++
        if (st.status === 'PASS') pass++
        else if (st.status === 'WARN') warn++
        else fail++
      }
    })
    return { ranCount, pass, warn, fail, total: multiSelectIds.length }
  }, [multiSelectMode, multiSelectIds, checkStates])

  const allSelected = CHECKS.every(c => selectedChecks[c.id])

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="hz-content-fill">
      <div className="sql-layout">

        {/* ---- Toolbar ---- */}
        <div className="sql-toolbar" data-component="sql-toolbar">
          <button className="hz-btn primary sm" onClick={runAllChecks} aria-label="Run all checks">
            Run All Checks
          </button>
          <button className="hz-btn sm" onClick={runSelected} aria-label="Run selected checks">
            Run Selected
          </button>
          <button className="hz-btn ghost sm" onClick={exportResults} aria-label="Export results to CSV">
            Export Results
          </button>
          <div className="spacer" />
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            Last run: {lastRunTime ?? '\u2014'}
          </span>
          <div className="sql-status-summary">
            <span>12 checks:</span>
            <span className="hz-dot green" /><span style={{ color: 'var(--green)' }}>
              {summary.total > 0 ? `${summary.pass} pass` : '\u2014'}
            </span>
            <span className="hz-dot amber" /><span style={{ color: 'var(--amber)' }}>
              {summary.total > 0 ? `${summary.warn} warning` : '\u2014'}
            </span>
            <span className="hz-dot red" /><span style={{ color: 'var(--red)' }}>
              {summary.total > 0 ? `${summary.fail} fail` : '\u2014'}
            </span>
          </div>
        </div>

        {/* ---- Preset Bar ---- */}
        <div className="preset-bar" data-component="preset-bar">
          <span className="preset-label">Presets</span>
          {Object.keys(PRESETS).map(key => (
            <button
              key={key}
              className={`preset-btn${activePreset === key ? ' active' : ''}`}
              onClick={() => applyPreset(key)}
            >
              {PRESET_LABELS[key]}
            </button>
          ))}
        </div>

        {/* ---- Global Parameter Bar ---- */}
        <div className="param-bar" data-component="param-bar">
          <div className="param-group">
            <label htmlFor="param-cob">COB Date</label>
            <input
              type="date"
              id="param-cob"
              value={cobDate}
              onChange={e => setCobDate(e.target.value)}
              aria-label="Close of business date"
            />
          </div>
          <div className="param-group">
            <label htmlFor="param-env">Environment</label>
            <select
              id="param-env"
              value={environment}
              onChange={e => setEnvironment(e.target.value)}
              aria-label="Target environment"
            >
              <option value="PROD">PROD</option>
              <option value="UAT">UAT</option>
              <option value="TST1">TST1</option>
              <option value="TST2">TST2</option>
            </select>
          </div>
          <div className="param-group">
            <label htmlFor="param-book">Book</label>
            <select
              id="param-book"
              value={book}
              onChange={e => setBook(e.target.value)}
              aria-label="Trading book filter"
            >
              <option value="ALL">All Books</option>
              <option value="ACME">ACME</option>
              <option value="ACME-SPOT">ACME Spot</option>
              <option value="ACME-TERM">ACME Term</option>
            </select>
          </div>
          <div className="param-group">
            <label htmlFor="param-benchmark">Benchmark</label>
            <select
              id="param-benchmark"
              value={benchmark}
              onChange={e => setBenchmark(e.target.value)}
              aria-label="Benchmark filter"
            >
              <option value="ALL">All</option>
              <option value="JKM">JKM</option>
              <option value="TTF">TTF</option>
              <option value="HH">HH</option>
              <option value="Brent">Brent</option>
              <option value="NBP">NBP</option>
              <option value="JCC">JCC</option>
            </select>
          </div>
        </div>

        {/* ---- Checks Table ---- */}
        <div className="sql-table-wrap" data-component="sql-checks-table">
          <table className="tbl">
            <thead>
              <tr>
                <th className="check-select">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={e => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th>#</th>
                <th>Check Name</th>
                <th>Category</th>
                <th>Last Run</th>
                <th>Duration</th>
                <th className="c">Result</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {CHECKS.map(chk => {
                const st = checkStates[chk.id]
                const isRunning = runningChecks[chk.id]
                const isActive = activeCheckId === chk.id
                const hasParams = chk.parameters.length > 0

                let statusBadge: React.ReactNode = (
                  <span style={{ color: 'var(--text-muted)' }}>{'\u2014'}</span>
                )
                let detail = '\u2014'
                let time = '\u2014'
                let dur = '\u2014'

                if (isRunning) {
                  statusBadge = <span className="check-running">Running</span>
                } else if (st) {
                  const badgeColor = st.status === 'PASS' ? 'green' : st.status === 'WARN' ? 'amber' : 'red'
                  statusBadge = <span className={`hz-badge ${badgeColor}`}>{st.status}</span>
                  detail = st.detail
                  time = st.time
                  dur = st.duration
                }

                return (
                  <tr
                    key={chk.id}
                    className={isActive ? 'active-check' : undefined}
                    data-check-id={chk.id}
                    onClick={() => selectCheck(chk.id)}
                  >
                    <td className="check-select" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="check-row-cb"
                        checked={!!selectedChecks[chk.id]}
                        onChange={() => toggleCheckSelection(chk.id)}
                      />
                    </td>
                    <td className="check-num">{chk.id}</td>
                    <td className="check-name">
                      {chk.name}
                      {hasParams && (
                        <span
                          style={{ color: 'var(--accent-light)', fontSize: '0.5rem', marginLeft: '0.25rem' }}
                          title="Has per-check parameters"
                        >
                          &#9881;
                        </span>
                      )}
                    </td>
                    <td className="check-category">{chk.category}</td>
                    <td className="check-time">{time}</td>
                    <td className="check-duration">{dur}</td>
                    <td className="c">{statusBadge}</td>
                    <td className="check-details" title={detail}>{detail}</td>
                    <td className="check-actions" onClick={e => e.stopPropagation()}>
                      <button
                        className="hz-btn sm primary"
                        onClick={() => runSingleCheck(chk.id)}
                        aria-label={`Run check ${chk.id}`}
                      >
                        Run
                      </button>
                      <button
                        className="hz-btn sm ghost"
                        onClick={() => viewResults(chk.id)}
                        aria-label={`View results for check ${chk.id}`}
                      >
                        Results
                      </button>
                      <button
                        className="hz-btn sm ghost"
                        onClick={() => viewSQL(chk.id)}
                        aria-label={`View SQL for check ${chk.id}`}
                      >
                        SQL
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ---- Bottom Detail Panel ---- */}
        <div
          ref={panelRef}
          className={`detail-panel ${panelOpen ? 'open' : 'closed'}`}
          data-component="detail-panel"
        >
          {/* Resize handle */}
          <div
            className="detail-resize"
            title="Drag to resize"
            onMouseDown={onResizeMouseDown}
          />

          {/* Per-check parameters bar */}
          {!multiSelectMode && activeCheck && activeCheck.parameters.length > 0 && (
            <div className="check-params-bar" data-component="check-params-bar">
              <span className="check-params-label">Check Params</span>
              <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'center' }}>
                {activeCheck.parameters.map(p => {
                  const values = getCheckParamValues(activeCheck.id)
                  const val = values[p.id]
                  return (
                    <div className="param-group" key={p.id}>
                      <label htmlFor={`cparam-${p.id}`}>{p.label}</label>
                      {p.type === 'number' ? (
                        <input
                          type="number"
                          id={`cparam-${p.id}`}
                          value={val as number}
                          min={p.min}
                          max={p.max}
                          step={p.step}
                          title={p.description}
                          aria-label={p.label}
                          onChange={e => setCheckParam(activeCheck.id, p.id, parseFloat(e.target.value))}
                        />
                      ) : p.type === 'select' && p.options ? (
                        <select
                          id={`cparam-${p.id}`}
                          value={String(val)}
                          title={p.description}
                          aria-label={p.label}
                          onChange={e => setCheckParam(activeCheck.id, p.id, e.target.value)}
                        >
                          {p.options.map(opt => {
                            const optVal = typeof opt === 'string' ? opt : opt.value
                            const optLabel = typeof opt === 'string' ? opt : opt.label
                            return <option key={optVal} value={optVal}>{optLabel}</option>
                          })}
                        </select>
                      ) : (
                        <input
                          type="text"
                          id={`cparam-${p.id}`}
                          value={String(val)}
                          title={p.description}
                          aria-label={p.label}
                          onChange={e => setCheckParam(activeCheck.id, p.id, e.target.value)}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tabs header */}
          <div className="detail-tabs">
            <span className="detail-tab-title">
              {multiSelectMode
                ? `${multiSelectIds.length} checks selected`
                : activeCheck
                  ? `#${activeCheck.id} ${activeCheck.name}`
                  : '\u2014'}
            </span>
            <button
              className={`detail-tab${activeTab === 'results' ? ' active' : ''}`}
              data-tab="results"
              onClick={() => setActiveTab('results')}
            >
              Results
            </button>
            <button
              className={`detail-tab${activeTab === 'sql' ? ' active' : ''}`}
              data-tab="sql"
              onClick={() => setActiveTab('sql')}
            >
              SQL
            </button>
            <div className="detail-tab-actions">
              {activeTab === 'results' && (
                <button className="hz-btn sm ghost" onClick={copyResults} title="Copy results as tab-separated">
                  Copy Results
                </button>
              )}
              {activeTab === 'sql' && (
                <button className="hz-btn sm ghost" onClick={copySql} title="Copy SQL to clipboard">
                  Copy SQL
                </button>
              )}
              <button className="hz-btn sm ghost" onClick={closePanel}>
                Close
              </button>
            </div>
          </div>

          {/* Detail body */}
          <div className="detail-body">
            {/* Results pane */}
            <div className={`detail-pane${activeTab === 'results' ? ' active' : ''}`}>
              {multiSelectMode && multiSummary ? (
                <>
                  <div className="results-header">
                    {multiSummary.ranCount > 0 ? (
                      <>
                        <span>{multiSummary.ranCount}/{multiSummary.total} run</span>
                        <span style={{ color: 'var(--green)', fontWeight: 600 }}>{multiSummary.pass} pass</span>
                        <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{multiSummary.warn} warn</span>
                        <span style={{ color: 'var(--red)', fontWeight: 600 }}>{multiSummary.fail} fail</span>
                      </>
                    ) : (
                      <span>{multiSummary.total} checks selected &mdash; none run yet</span>
                    )}
                  </div>
                  <div className="multi-summary">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Check Name</th>
                          <th>Category</th>
                          <th className="c">Result</th>
                          <th>Details</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {multiSelectIds.map(id => {
                          const chk = CHECKS.find(c => c.id === id)
                          if (!chk) return null
                          const st = checkStates[id]
                          return (
                            <tr
                              key={id}
                              onClick={() => selectCheck(id)}
                              title="Click to view details"
                            >
                              <td className="check-num">{id}</td>
                              <td className="check-name">{chk.name}</td>
                              <td className="check-category">{chk.category}</td>
                              <td className="c">
                                {st ? (
                                  <span className={`hz-badge ${st.status === 'PASS' ? 'green' : st.status === 'WARN' ? 'amber' : 'red'}`}>
                                    {st.status}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>{'\u2014'}</span>
                                )}
                              </td>
                              <td className="check-details">{st ? st.detail : '\u2014'}</td>
                              <td className="check-duration">{st ? st.duration : '\u2014'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : activeState ? (
                <>
                  <div className="results-header">
                    <span style={{
                      fontWeight: 600,
                      color: activeState.status === 'PASS' ? 'var(--green)' : activeState.status === 'WARN' ? 'var(--amber)' : 'var(--red)'
                    }}>
                      {activeState.status}
                    </span>
                    <span>{activeState.detail}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                      {activeState.rows.length} row{activeState.rows.length !== 1 ? 's' : ''}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                      {activeState.duration}
                    </span>
                  </div>
                  <div className="results-wrap">
                    {activeState.rows.length === 0 ? (
                      <div className="results-empty" style={{ color: 'var(--green)' }}>
                        No issues found &mdash; all records pass validation.
                      </div>
                    ) : (
                      <table className="tbl">
                        <thead>
                          <tr>
                            {activeState.cols.map((col, ci) => (
                              <th
                                key={ci}
                                className={
                                  activeState.colAlign[ci] === 'r' ? 'r' :
                                  activeState.colAlign[ci] === 'c' ? 'c' : undefined
                                }
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {activeState.rows.map((row, ri) => (
                            <tr key={ri}>
                              {row.map((cell, ci) => (
                                <td
                                  key={ci}
                                  className={
                                    activeState.colAlign[ci] === 'r' ? 'r font-mono' :
                                    activeState.colAlign[ci] === 'c' ? 'c' : undefined
                                  }
                                >
                                  {isStatusCell(cell) ? <StatusBadge cell={cell} /> : cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              ) : (
                <div className="results-wrap">
                  <div className="results-empty">
                    Check has not been run yet. Click <strong>Run</strong> to execute with the current parameters.
                  </div>
                </div>
              )}
            </div>

            {/* SQL pane */}
            <div className={`detail-pane${activeTab === 'sql' ? ' active' : ''}`}>
              <div
                className="sql-code-block"
                dangerouslySetInnerHTML={{
                  __html: multiSelectMode
                    ? `<span class="sql-comment">-- ${multiSelectIds.length} checks selected</span>\n<span class="sql-comment">-- Click a row above or in the table to view its SQL</span>`
                    : activeSql || '<span class="sql-comment">-- Select a check to view its SQL</span>'
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
