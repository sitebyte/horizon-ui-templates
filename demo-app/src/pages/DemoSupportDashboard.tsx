/**
 * Support Dashboard — renders the EXACT same HTML as the v43 static prototype.
 * Uses shell.css class names directly. No abstraction layers.
 * To make this data-driven: replace the static strings with props/state.
 */
export function DemoSupportDashboard() {
  return (
    <div className="hz-content-fill">
      {/* KPI Strip */}
      <div className="kpis">
        <div className="hz-kpi">
          <span className="hz-kpi-label">System Health</span>
          <span className="hz-kpi-value" style={{fontSize:'var(--text-base)'}}>
            <span className="flex items-center gap-2"><span className="hz-dot green pulse" style={{width:'0.375rem',height:'0.375rem'}}></span> <span style={{color:'var(--green)'}}>HEALTHY</span></span>
          </span>
        </div>
        <div className="hz-kpi">
          <span className="hz-kpi-label">EOD Status</span>
          <span className="hz-kpi-value" style={{fontSize:'var(--text-base)'}}>
            <span className="flex items-center gap-2"><span className="hz-dot blue pulse" style={{width:'0.375rem',height:'0.375rem'}}></span> <span style={{color:'var(--blue)'}}>RUNNING</span></span>
          </span>
        </div>
        <div className="hz-kpi">
          <span className="hz-kpi-label">Curve Load</span>
          <span className="hz-kpi-value font-mono" style={{fontSize:'var(--text-base)'}}>4/4 <span style={{color:'var(--green)',fontSize:'var(--text-xs)'}}>OK</span></span>
        </div>
        <div className="hz-kpi">
          <span className="hz-kpi-label">Trade Count</span>
          <span className="hz-kpi-value font-mono" style={{fontSize:'var(--text-base)'}}>1,247</span>
          <span className="hz-kpi-delta" style={{color:'var(--text-muted)'}}>+12 today</span>
        </div>
        <div className="hz-kpi">
          <span className="hz-kpi-label">Open Alerts</span>
          <span className="hz-kpi-value font-mono text-amber" style={{fontSize:'var(--text-base)'}}>3</span>
          <span className="hz-kpi-delta negative">1 fail</span>
        </div>
        <div className="hz-kpi">
          <span className="hz-kpi-label">Uptime</span>
          <span className="hz-kpi-value font-mono" style={{fontSize:'var(--text-base)'}}>99.97%</span>
          <span className="hz-kpi-delta positive">30d</span>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="dash">

        {/* Column 1: EOD Run Status */}
        <div className="dash-col">
          <div style={{flex:1,overflow:'auto'}}>
            <div className="flex items-center justify-between" style={{marginBottom:'2px'}}>
              <span className="sec-title">EOD Run Status</span>
              <span className="hz-badge blue" style={{fontSize:'0.375rem'}}>7/8 steps</span>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Started</th>
                  <th className="r">Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{color:'var(--text-primary)'}}>Market Data Load</td><td className="font-mono" style={{color:'var(--text-tertiary)'}}>17:00:01</td><td className="r font-mono" style={{color:'var(--text-tertiary)'}}>00:02:14</td><td><span className="hz-badge green" style={{fontSize:'0.375rem'}}>Complete</span></td></tr>
                <tr><td style={{color:'var(--text-primary)'}}>Curve Bootstrap</td><td className="font-mono" style={{color:'var(--text-tertiary)'}}>17:02:15</td><td className="r font-mono" style={{color:'var(--text-tertiary)'}}>00:04:32</td><td><span className="hz-badge green" style={{fontSize:'0.375rem'}}>Complete</span></td></tr>
                <tr><td style={{color:'var(--text-primary)'}}>Position Calc</td><td className="font-mono" style={{color:'var(--text-tertiary)'}}>17:06:47</td><td className="r font-mono" style={{color:'var(--text-tertiary)'}}>00:08:15</td><td><span className="hz-badge green" style={{fontSize:'0.375rem'}}>Complete</span></td></tr>
                <tr><td style={{color:'var(--text-primary)'}}>P&amp;L Attribution</td><td className="font-mono" style={{color:'var(--text-tertiary)'}}>17:15:02</td><td className="r font-mono" style={{color:'var(--text-tertiary)'}}>00:03:44</td><td><span className="hz-badge green" style={{fontSize:'0.375rem'}}>Complete</span></td></tr>
                <tr><td style={{color:'var(--text-primary)'}}>VaR Calculation</td><td className="font-mono" style={{color:'var(--text-tertiary)'}}>17:18:46</td><td className="r font-mono" style={{color:'var(--text-tertiary)'}}>00:12:08</td><td><span className="hz-badge green" style={{fontSize:'0.375rem'}}>Complete</span></td></tr>
                <tr><td style={{color:'var(--text-primary)'}}>Settlement Price</td><td className="font-mono" style={{color:'var(--text-tertiary)'}}>17:30:54</td><td className="r font-mono" style={{color:'var(--text-tertiary)'}}>00:01:22</td><td><span className="hz-badge green" style={{fontSize:'0.375rem'}}>Complete</span></td></tr>
                <tr><td style={{color:'var(--text-primary)',fontWeight:500}}>Regulatory Report</td><td className="font-mono" style={{color:'var(--text-tertiary)'}}>17:32:16</td><td className="r font-mono" style={{color:'var(--text-tertiary)'}}>00:05:18</td><td><span className="hz-badge blue" style={{fontSize:'0.375rem'}}><span className="flex items-center gap-1"><span className="hz-dot blue pulse" style={{width:'0.25rem',height:'0.25rem'}}></span> Running</span></span></td></tr>
                <tr><td style={{color:'var(--text-muted)'}}>Data Archive</td><td className="font-mono" style={{color:'var(--text-muted)'}}>—</td><td className="r font-mono" style={{color:'var(--text-muted)'}}>—</td><td><span className="hz-badge neutral" style={{fontSize:'0.375rem'}}>Queued</span></td></tr>
              </tbody>
            </table>
            <div className="eod-footer">EOD Run: 02 May 2026 — Started 17:00:01 — 7/8 steps complete</div>
            <div style={{padding:'0 var(--sp-2)',marginTop:'var(--sp-1)'}}>
              <div className="flex items-center justify-between" style={{fontSize:'0.5rem',color:'var(--text-muted)',marginBottom:'2px'}}>
                <span>Overall Progress</span><span className="font-mono">87.5%</span>
              </div>
              <div className="hbar" style={{height:'0.375rem'}}><div className="hfill" style={{width:'87.5%',background:'linear-gradient(90deg, var(--green) 75%, var(--blue) 100%)'}}></div></div>
            </div>
          </div>
        </div>

        {/* Column 2: Integrity Checks */}
        <div className="dash-col">
          <div style={{flex:1,overflow:'auto'}}>
            <div className="flex items-center justify-between" style={{marginBottom:'2px'}}>
              <span className="sec-title">Integrity Checks</span>
              <div className="flex gap-1" style={{fontSize:'0.4375rem'}}>
                <span className="hz-badge green" style={{fontSize:'0.34375rem'}}>6 pass</span>
                <span className="hz-badge amber" style={{fontSize:'0.34375rem'}}>1 warn</span>
                <span className="hz-badge red" style={{fontSize:'0.34375rem'}}>1 fail</span>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column'}}>
              <div className="check-row"><span className="hz-dot green" style={{width:'0.375rem',height:'0.375rem',flexShrink:0}}></span><span className="check-label">Trade-Position Reconciliation</span><span className="hz-badge green" style={{fontSize:'0.375rem'}}>PASS</span></div>
              <div className="check-row"><span className="hz-dot green" style={{width:'0.375rem',height:'0.375rem',flexShrink:0}}></span><span className="check-label">Curve Staleness Check</span><span className="hz-badge green" style={{fontSize:'0.375rem'}}>PASS</span></div>
              <div className="check-row"><span className="hz-dot green" style={{width:'0.375rem',height:'0.375rem',flexShrink:0}}></span><span className="check-label">Duplicate Trade Detection</span><span className="hz-badge green" style={{fontSize:'0.375rem'}}>PASS</span></div>
              <div className="check-row" style={{background:'var(--amber-dim)',borderRadius:'var(--radius-sm)'}}>
                <span className="hz-dot amber pulse" style={{width:'0.375rem',height:'0.375rem',flexShrink:0}}></span>
                <div style={{flex:1,minWidth:0}}><span className="check-label" style={{color:'var(--text-primary)'}}>Missing Settlement Prices</span><div className="check-detail">2 curves: JKM Nov-26, TTF Dec-26</div></div>
                <span className="hz-badge amber" style={{fontSize:'0.375rem'}}>WARN</span>
              </div>
              <div className="check-row"><span className="hz-dot green" style={{width:'0.375rem',height:'0.375rem',flexShrink:0}}></span><span className="check-label">Credit Limit Breach</span><span className="hz-badge green" style={{fontSize:'0.375rem'}}>PASS</span></div>
              <div className="check-row"><span className="hz-dot green" style={{width:'0.375rem',height:'0.375rem',flexShrink:0}}></span><span className="check-label">Counterparty Validation</span><span className="hz-badge green" style={{fontSize:'0.375rem'}}>PASS</span></div>
              <div className="check-row"><span className="hz-dot green" style={{width:'0.375rem',height:'0.375rem',flexShrink:0}}></span><span className="check-label">Volume Tolerance Check</span><span className="hz-badge green" style={{fontSize:'0.375rem'}}>PASS</span></div>
              <div className="check-row" style={{background:'var(--red-dim)',borderRadius:'var(--radius-sm)'}}>
                <span className="hz-dot red pulse" style={{width:'0.375rem',height:'0.375rem',flexShrink:0}}></span>
                <div style={{flex:1,minWidth:0}}><span className="check-label" style={{color:'var(--text-primary)'}}>Unmatched Nominations</span><div className="check-detail">1 unmatched: NOM-2026-Q2-003</div></div>
                <span className="hz-badge red" style={{fontSize:'0.375rem'}}>FAIL</span>
              </div>
            </div>
            <div className="eod-footer">Last run: 02 May 17:30 — 6 pass, 1 warning, 1 fail</div>
          </div>

          {/* Service Health */}
          <div>
            <span className="sec-title" style={{fontSize:'0.5625rem'}}>Service Health</span>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:'2px var(--sp-2)',fontSize:'0.5rem',alignItems:'center'}}>
              <span style={{color:'var(--text-tertiary)'}}>Trade Capture API</span>
              <span className="flex items-center gap-1"><span className="hz-dot green" style={{width:'0.25rem',height:'0.25rem'}}></span><span className="font-mono" style={{color:'var(--green)'}}>12ms</span></span>
              <span style={{color:'var(--text-tertiary)'}}>Curve Service</span>
              <span className="flex items-center gap-1"><span className="hz-dot green" style={{width:'0.25rem',height:'0.25rem'}}></span><span className="font-mono" style={{color:'var(--green)'}}>8ms</span></span>
              <span style={{color:'var(--text-tertiary)'}}>Position Engine</span>
              <span className="flex items-center gap-1"><span className="hz-dot green" style={{width:'0.25rem',height:'0.25rem'}}></span><span className="font-mono" style={{color:'var(--green)'}}>45ms</span></span>
              <span style={{color:'var(--text-tertiary)'}}>Risk Calculator</span>
              <span className="flex items-center gap-1"><span className="hz-dot green" style={{width:'0.25rem',height:'0.25rem'}}></span><span className="font-mono" style={{color:'var(--green)'}}>92ms</span></span>
              <span style={{color:'var(--text-tertiary)'}}>Reporting Service</span>
              <span className="flex items-center gap-1"><span className="hz-dot blue pulse" style={{width:'0.25rem',height:'0.25rem'}}></span><span className="font-mono" style={{color:'var(--blue)'}}>busy</span></span>
              <span style={{color:'var(--text-tertiary)'}}>Message Bus</span>
              <span className="flex items-center gap-1"><span className="hz-dot green" style={{width:'0.25rem',height:'0.25rem'}}></span><span className="font-mono" style={{color:'var(--green)'}}>3ms</span></span>
            </div>
          </div>
        </div>

        {/* Column 3: Alerts + Recent Activity */}
        <div className="dash-col" style={{fontSize:'0.5625rem'}}>
          <div>
            <span className="sec-title">Alerts <span className="hz-badge red" style={{fontSize:'0.34375rem',padding:'0 0.15625rem',verticalAlign:'middle'}}>4</span></span>
            <div className="alert-row" style={{background:'var(--red-dim)',borderColor:'var(--red)'}}><div style={{fontWeight:600,color:'var(--red)'}}>FAIL: Unmatched Nomination</div><div style={{fontSize:'0.5rem',color:'var(--text-tertiary)'}}>NOM-2026-Q2-003 — SPOT-TOTAL-Q2</div></div>
            <div className="alert-row" style={{background:'var(--amber-dim)',borderColor:'var(--amber)'}}><div style={{fontWeight:600,color:'var(--amber)'}}>WARN: Stale Curve Data</div><div style={{fontSize:'0.5rem',color:'var(--text-tertiary)'}}>JKM Nov-26 not updated since 01 May</div></div>
            <div className="alert-row" style={{background:'var(--amber-dim)',borderColor:'var(--amber)'}}><div style={{fontWeight:600,color:'var(--amber)'}}>WARN: Missing Settlement</div><div style={{fontSize:'0.5rem',color:'var(--text-tertiary)'}}>TTF Dec-26 settlement price missing</div></div>
            <div className="alert-row" style={{background:'var(--blue-dim)',borderColor:'var(--blue)'}}><div style={{fontWeight:600,color:'var(--blue)'}}>INFO: Report Generating</div><div style={{fontSize:'0.5rem',color:'var(--text-tertiary)'}}>EOD regulatory report in progress</div></div>
          </div>

          <div>
            <span className="sec-title">Recent Activity</span>
            <div className="feed-row"><span className="font-mono" style={{fontSize:'0.4375rem',color:'var(--text-muted)',width:'2rem',flexShrink:0}}>17:30</span><span className="hz-dot green" style={{width:'0.25rem',height:'0.25rem',flexShrink:0}}></span><div style={{flex:1,minWidth:0}}><div style={{fontSize:'0.5rem',color:'var(--text-secondary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>VaR calc complete: <span className="font-mono pnl-positive" style={{fontSize:'0.5rem'}}>$1.18M</span></div></div></div>
            <div className="feed-row"><span className="font-mono" style={{fontSize:'0.4375rem',color:'var(--text-muted)',width:'2rem',flexShrink:0}}>17:18</span><span className="hz-dot green" style={{width:'0.25rem',height:'0.25rem',flexShrink:0}}></span><div style={{flex:1,minWidth:0}}><div style={{fontSize:'0.5rem',color:'var(--text-secondary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Settlement prices loaded: <span className="font-mono" style={{color:'var(--text-primary)',fontSize:'0.5rem'}}>142 curves</span></div></div></div>
            <div className="feed-row"><span className="font-mono" style={{fontSize:'0.4375rem',color:'var(--text-muted)',width:'2rem',flexShrink:0}}>17:06</span><span className="hz-dot green" style={{width:'0.25rem',height:'0.25rem',flexShrink:0}}></span><div style={{flex:1,minWidth:0}}><div style={{fontSize:'0.5rem',color:'var(--text-secondary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Position calc: <span className="font-mono" style={{color:'var(--text-primary)',fontSize:'0.5rem'}}>1,247 trades</span> processed</div></div></div>
            <div className="feed-row"><span className="font-mono" style={{fontSize:'0.4375rem',color:'var(--text-muted)',width:'2rem',flexShrink:0}}>17:02</span><span className="hz-dot green" style={{width:'0.25rem',height:'0.25rem',flexShrink:0}}></span><div style={{flex:1,minWidth:0}}><div style={{fontSize:'0.5rem',color:'var(--text-secondary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Curve bootstrap: <span className="font-mono" style={{color:'var(--text-primary)',fontSize:'0.5rem'}}>4 benchmarks, 48 tenors</span></div></div></div>
            <div className="feed-row"><span className="font-mono" style={{fontSize:'0.4375rem',color:'var(--text-muted)',width:'2rem',flexShrink:0}}>17:00</span><span className="hz-dot blue" style={{width:'0.25rem',height:'0.25rem',flexShrink:0}}></span><div style={{flex:1,minWidth:0}}><div style={{fontSize:'0.5rem',color:'var(--text-secondary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>EOD batch initiated by <span style={{color:'var(--text-primary)'}}>system</span></div></div></div>
            <div className="feed-row"><span className="font-mono" style={{fontSize:'0.4375rem',color:'var(--text-muted)',width:'2rem',flexShrink:0}}>16:45</span><span className="hz-dot" style={{width:'0.25rem',height:'0.25rem',flexShrink:0,background:'var(--accent)'}}></span><div style={{flex:1,minWidth:0}}><div style={{fontSize:'0.5rem',color:'var(--text-secondary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>A. Morgan: manual curve override <span className="font-mono" style={{color:'var(--accent-light)',fontSize:'0.5rem'}}>JKM Dec-26</span></div></div></div>
          </div>

          <div>
            <span className="sec-title" style={{fontSize:'0.5rem'}}>Database &amp; Throughput</span>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:'0 var(--sp-2)',fontSize:'0.4375rem'}}>
              <span style={{color:'var(--text-tertiary)'}}>DB Connections</span><span className="font-mono" style={{color:'var(--text-primary)'}}>24/100</span>
              <span style={{color:'var(--text-tertiary)'}}>Msg Queue Depth</span><span className="font-mono" style={{color:'var(--text-primary)'}}>142</span>
              <span style={{color:'var(--text-tertiary)'}}>Avg Response</span><span className="font-mono" style={{color:'var(--green)'}}>18ms</span>
              <span style={{color:'var(--text-tertiary)'}}>Disk Usage</span><span className="font-mono" style={{color:'var(--text-primary)'}}>62%</span>
              <span style={{color:'var(--text-tertiary)'}}>Last Backup</span><span className="font-mono" style={{color:'var(--text-primary)'}}>16:00</span>
              <span style={{color:'var(--text-tertiary)'}}>EOD Runs (May)</span><span className="font-mono" style={{color:'var(--green)'}}>2/2 OK</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
