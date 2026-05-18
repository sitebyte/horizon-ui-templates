/**
 * Data Quality page — ported from v43 support-data-quality.html
 * All static/demo data inline. API-sourced data marked with TODO comments.
 */
import '../tokens/data-quality.css'

export function DataQualityPage() {
  return (
    <div className="hz-content-fill">
      {/* KPIs */}
      <div className="dq-kpis fade-in">
        {/* TODO: API — all KPI values */}
        <div className="hz-kpi">
          <span className="hz-kpi-label">Curves Loaded</span>
          <span className="hz-kpi-value">
            142
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 400 }}>/148</span>
          </span>
        </div>
        <div className="hz-kpi">
          <span className="hz-kpi-label">Stale Curves</span>
          <span className="hz-kpi-value text-amber">6</span>
        </div>
        <div className="hz-kpi">
          <span className="hz-kpi-label">Trade Errors</span>
          <span className="hz-kpi-value pnl-positive">0</span>
        </div>
        <div className="hz-kpi">
          <span className="hz-kpi-label">Position Breaks</span>
          <span className="hz-kpi-value text-amber">1</span>
        </div>
        <div className="hz-kpi">
          <span className="hz-kpi-label">Missing Prices</span>
          <span className="hz-kpi-value text-amber">2</span>
        </div>
        <div className="hz-kpi">
          <span className="hz-kpi-label">Last Check</span>
          <span className="hz-kpi-value" style={{ fontSize: 'var(--text-base)' }}>17:30</span>
        </div>
      </div>

      {/* Sections */}
      <div className="dq-sections">

        {/* Section 1: Curve Quality */}
        <div className="hz-card dq-section-full fade-in-d1" id="curves">
          <div className="dq-section-title">
            Curve Quality
            {/* TODO: API — status counts */}
            <span className="status-ok">4 OK</span>
            <span className="status-stale">2 STALE</span>
          </div>
          {/* TODO: API — curve quality rows */}
          <table className="tbl">
            <thead>
              <tr>
                <th>Benchmark</th>
                <th className="r">Tenors</th>
                <th>Last Update</th>
                <th>Status</th>
                <th>Staleness</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>JKM</td>
                <td className="r font-mono">24</td>
                <td className="font-mono" style={{ color: 'var(--text-tertiary)' }}>02 May 17:02</td>
                <td><span className="status-ok">OK</span></td>
                <td style={{ color: 'var(--green)' }}>Fresh</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>TTF</td>
                <td className="r font-mono">24</td>
                <td className="font-mono" style={{ color: 'var(--text-tertiary)' }}>02 May 17:02</td>
                <td><span className="status-ok">OK</span></td>
                <td style={{ color: 'var(--green)' }}>Fresh</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>HH</td>
                <td className="r font-mono">24</td>
                <td className="font-mono" style={{ color: 'var(--text-tertiary)' }}>02 May 17:02</td>
                <td><span className="status-ok">OK</span></td>
                <td style={{ color: 'var(--green)' }}>Fresh</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Brent</td>
                <td className="r font-mono">24</td>
                <td className="font-mono" style={{ color: 'var(--text-tertiary)' }}>02 May 17:02</td>
                <td><span className="status-ok">OK</span></td>
                <td style={{ color: 'var(--green)' }}>Fresh</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>NBP</td>
                <td className="r font-mono">18</td>
                <td className="font-mono" style={{ color: 'var(--text-tertiary)' }}>01 May 16:45</td>
                <td><span className="status-stale">STALE</span></td>
                <td className="font-mono" style={{ color: 'var(--amber)' }}>24h</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>JCC</td>
                <td className="r font-mono">12</td>
                <td className="font-mono" style={{ color: 'var(--text-tertiary)' }}>30 Apr 09:00</td>
                <td><span className="status-stale">STALE</span></td>
                <td className="font-mono" style={{ color: 'var(--amber)' }}>56h</td>
              </tr>
            </tbody>
          </table>

          {/* Bootstrap validation */}
          {/* TODO: API — bootstrap validation rows */}
          <div className="bootstrap-checks">
            <div className="bootstrap-title">Bootstrap Validation &mdash; Curve Smoothness</div>
            <div className="bootstrap-row">
              <span>JKM &mdash; Monotonicity check (contango structure)</span>
              <span className="status-pass">PASS</span>
            </div>
            <div className="bootstrap-row">
              <span>TTF &mdash; Monotonicity check (contango structure)</span>
              <span className="status-pass">PASS</span>
            </div>
            <div className="bootstrap-row">
              <span>HH &mdash; Seasonality smoothness (summer/winter spread)</span>
              <span className="status-pass">PASS</span>
            </div>
            <div className="bootstrap-row">
              <span>Brent &mdash; Backwardation consistency</span>
              <span className="status-pass">PASS</span>
            </div>
            <div className="bootstrap-row">
              <span>NBP &mdash; Interpolation gap check (missing tenors Q1-27)</span>
              <span className="status-warn">WARN</span>
            </div>
            <div className="bootstrap-row">
              <span>JCC &mdash; Stale input: lagged vs spot by &gt;2 std dev</span>
              <span className="status-warn">WARN</span>
            </div>
          </div>
        </div>

        {/* Section 2: Trade Integrity */}
        <div className="hz-card fade-in-d2" id="trades">
          <div className="dq-section-title">Trade Integrity</div>
          {/* TODO: API — trade integrity check rows */}
          <table className="tbl">
            <thead>
              <tr>
                <th>Check</th>
                <th>Scope</th>
                <th>Result</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Duplicate Detection</td>
                <td style={{ color: 'var(--text-tertiary)' }}>All trades</td>
                <td><span className="status-pass">PASS</span></td>
                <td className="font-mono" style={{ color: 'var(--text-secondary)' }}>0 duplicates in 1,247 trades</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Missing Fields</td>
                <td style={{ color: 'var(--text-tertiary)' }}>Required fields</td>
                <td><span className="status-pass">PASS</span></td>
                <td className="font-mono" style={{ color: 'var(--text-secondary)' }}>All trades complete</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Price Tolerance</td>
                <td style={{ color: 'var(--text-tertiary)' }}>vs market</td>
                <td><span className="status-warn">WARN</span></td>
                <td className="font-mono" style={{ color: 'var(--amber)' }}>2 trades &gt;5% from mid</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Volume Validation</td>
                <td style={{ color: 'var(--text-tertiary)' }}>vs limits</td>
                <td><span className="status-pass">PASS</span></td>
                <td className="font-mono" style={{ color: 'var(--text-secondary)' }}>All within limits</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Counterparty Match</td>
                <td style={{ color: 'var(--text-tertiary)' }}>vs master</td>
                <td><span className="status-pass">PASS</span></td>
                <td className="font-mono" style={{ color: 'var(--text-secondary)' }}>All matched</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Settlement Ready</td>
                <td style={{ color: 'var(--text-tertiary)' }}>EOD</td>
                <td><span className="status-pass">PASS</span></td>
                <td className="font-mono" style={{ color: 'var(--text-secondary)' }}>1,247/1,247 settleable</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Position Checks */}
        <div className="hz-card fade-in-d3" id="positions">
          <div className="dq-section-title">Position Checks</div>
          {/* TODO: API — position check rows */}
          <table className="tbl">
            <thead>
              <tr>
                <th>Check</th>
                <th>Result</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Trade-Position Recon</td>
                <td><span className="status-pass">PASS</span></td>
                <td className="font-mono" style={{ color: 'var(--text-secondary)' }}>Net matches across all benchmarks</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Physical-Paper Split</td>
                <td><span className="status-pass">PASS</span></td>
                <td className="font-mono" style={{ color: 'var(--text-secondary)' }}>Hedge ratios consistent</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Limit Monitoring</td>
                <td><span className="status-warn">WARN</span></td>
                <td className="font-mono" style={{ color: 'var(--amber)' }}>JKM Sep-26 at 96% of limit</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>WACOG Validation</td>
                <td><span className="status-pass">PASS</span></td>
                <td className="font-mono" style={{ color: 'var(--text-secondary)' }}>All WACOGs within 2&sigma;</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
