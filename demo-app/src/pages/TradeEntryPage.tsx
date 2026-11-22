/**
 * Trade Entry — Bloomberg-style dense flat grid form.
 * No section cards, no chrome. Just fields packed tight.
 * Everything visible at once, no scrolling needed on 1080p.
 */
import { useState } from 'react'
import '../tokens/trade-entry.css'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function TradeEntryPage() {
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy')
  const [priceBasis, setPriceBasis] = useState<'fixed' | 'index' | 'formula'>('fixed')
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="te-page">
      {/* ---- TOP BAR: Direction + Key Info + Submit ---- */}
      <div className="te-topbar">
        <div className="te-dir-group">
          <button
            className={`te-dir-btn buy${direction === 'buy' ? ' active' : ''}`}
            onClick={() => setDirection('buy')}
            type="button"
          >BUY</button>
          <button
            className={`te-dir-btn sell${direction === 'sell' ? ' active' : ''}`}
            onClick={() => setDirection('sell')}
            type="button"
          >SELL</button>
        </div>
        <div className="te-topbar-fields">
          <div className="te-fg">
            <label className="te-lbl">Counterparty</label>
            <select className="te-inp" style={{minWidth:'10rem'}}>
              <option value="">Select...</option>
              <option>Shell Trading</option>
              <option>JERA Co.</option>
              <option>QatarEnergy</option>
              <option>TotalEnergies</option>
              <option>BP</option>
              <option>Woodside</option>
              <option>KOGAS</option>
              <option>Petronas</option>
            </select>
          </div>
          <div className="te-fg">
            <label className="te-lbl">Contract</label>
            <select className="te-inp" style={{minWidth:'5rem'}}>
              <option>SPA</option>
              <option>MSA</option>
              <option>Spot</option>
              <option>Term</option>
            </select>
          </div>
          <div className="te-fg">
            <label className="te-lbl">Commodity</label>
            <select className="te-inp">
              <option>LNG</option>
              <option>Pipeline Gas</option>
              <option>LPG</option>
            </select>
          </div>
          <div className="te-fg">
            <label className="te-lbl">Trade Date</label>
            <input type="date" className="te-inp" defaultValue={today()} />
          </div>
        </div>
        <div className="te-topbar-actions">
          <button className={`te-submit ${direction}`} type="button">
            {direction === 'buy' ? '▲ SUBMIT BUY' : '▼ SUBMIT SELL'}
          </button>
          <button className="te-draft" type="button">Draft</button>
        </div>
      </div>

      {/* ---- TABS ---- */}
      <div className="te-tabs">
        {['Deal', 'Pricing', 'Physical', 'Settlement', 'Notes'].map((t, i) => (
          <button
            key={t}
            className={`te-tab${activeTab === i ? ' active' : ''}`}
            onClick={() => setActiveTab(i)}
            type="button"
          >{t}</button>
        ))}
      </div>

      {/* ---- BODY: form grid + right panel ---- */}
      <div className="te-body">
        <div className="te-form-area">

          {/* === TAB 0: Deal === */}
          {activeTab === 0 && (
            <div className="te-grid te-grid-4">
              <div className="te-fg">
                <label className="te-lbl">Contract Ref</label>
                <input className="te-inp" placeholder="SPA-SHELL-2026-001" />
              </div>
              <div className="te-fg">
                <label className="te-lbl">Region</label>
                <select className="te-inp">
                  <option value="">Select...</option>
                  <option>Far East</option>
                  <option>Europe</option>
                  <option>India</option>
                  <option>Japan</option>
                  <option>CHI</option>
                  <option>JKT</option>
                  <option>JKTC</option>
                </select>
              </div>
              <div className="te-fg">
                <label className="te-lbl">Incoterm</label>
                <select className="te-inp">
                  <option>DES</option>
                  <option>FOB</option>
                  <option>DAP</option>
                  <option>CIF</option>
                </select>
              </div>
              <div className="te-fg">
                <label className="te-lbl">Volume</label>
                <div className="te-inp-sfx">
                  <input className="te-inp" type="number" defaultValue="3200000" />
                  <span className="te-sfx">MMBtu</span>
                </div>
              </div>
              <div className="te-fg">
                <label className="te-lbl">Tolerance</label>
                <div className="te-inp-sfx">
                  <input className="te-inp" type="number" defaultValue="5" />
                  <span className="te-sfx">%</span>
                </div>
              </div>
              <div className="te-fg">
                <label className="te-lbl">Unit</label>
                <select className="te-inp">
                  <option>MMBtu</option>
                  <option>MWh</option>
                  <option>BBL</option>
                  <option>MT</option>
                </select>
              </div>
              <div className="te-fg">
                <label className="te-lbl">Currency</label>
                <select className="te-inp">
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>JPY</option>
                  <option>SGD</option>
                </select>
              </div>
              <div className="te-fg">
                <label className="te-lbl">Delivery Period</label>
                <div className="te-date-range">
                  <input type="date" className="te-inp" />
                  <span className="te-sep">→</span>
                  <input type="date" className="te-inp" />
                </div>
              </div>
            </div>
          )}

          {/* === TAB 1: Pricing === */}
          {activeTab === 1 && (
            <div className="te-grid te-grid-4">
              <div className="te-fg te-span-2">
                <label className="te-lbl">Price Basis</label>
                <div className="te-seg">
                  {(['fixed', 'index', 'formula'] as const).map(b => (
                    <button
                      key={b}
                      className={`te-seg-btn${priceBasis === b ? ' active' : ''}`}
                      onClick={() => setPriceBasis(b)}
                      type="button"
                    >{b.charAt(0).toUpperCase() + b.slice(1)}</button>
                  ))}
                </div>
              </div>
              {priceBasis === 'fixed' && (
                <div className="te-fg">
                  <label className="te-lbl">Fixed Price</label>
                  <div className="te-inp-sfx">
                    <input className="te-inp" type="number" defaultValue="14.25" step="0.01" />
                    <span className="te-sfx">$/MMBtu</span>
                  </div>
                </div>
              )}
              {priceBasis === 'index' && <>
                <div className="te-fg">
                  <label className="te-lbl">Index</label>
                  <select className="te-inp">
                    <option>JKM</option>
                    <option>TTF</option>
                    <option>HH</option>
                    <option>Brent</option>
                    <option>NBP</option>
                    <option>JCC</option>
                  </select>
                </div>
                <div className="te-fg">
                  <label className="te-lbl">Premium</label>
                  <div className="te-inp-sfx">
                    <input className="te-inp" type="number" defaultValue="0.25" step="0.01" />
                    <span className="te-sfx">$/MMBtu</span>
                  </div>
                </div>
              </>}
              {priceBasis === 'formula' && (
                <div className="te-fg te-span-2">
                  <label className="te-lbl">Formula</label>
                  <input className="te-inp" defaultValue="0.1485 × JCC + 0.50" style={{fontFamily:'var(--font-mono)'}} />
                </div>
              )}
              <div className="te-fg">
                <label className="te-lbl">Payment</label>
                <select className="te-inp">
                  <option>30 Days</option>
                  <option>45 Days</option>
                  <option>60 Days</option>
                  <option>Letter of Credit</option>
                </select>
              </div>
              <div className="te-fg">
                <label className="te-lbl">Invoice</label>
                <select className="te-inp">
                  <option>Per-Cargo</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                </select>
              </div>
              <div className="te-fg">
                <label className="te-lbl">Value Date</label>
                <input type="date" className="te-inp" />
              </div>
            </div>
          )}

          {/* === TAB 2: Physical === */}
          {activeTab === 2 && (
            <div className="te-grid te-grid-4">
              <div className="te-fg">
                <label className="te-lbl">Load Port</label>
                <select className="te-inp">
                  <option value="">Select...</option>
                  <option>Gladstone (AU)</option>
                  <option>Wheatstone (AU)</option>
                  <option>Sabine Pass (US)</option>
                  <option>Ras Laffan (QA)</option>
                  <option>Bintulu (MY)</option>
                  <option>Tangguh (ID)</option>
                </select>
              </div>
              <div className="te-fg">
                <label className="te-lbl">Load Window</label>
                <div className="te-date-range">
                  <input type="date" className="te-inp" />
                  <span className="te-sep">→</span>
                  <input type="date" className="te-inp" />
                </div>
              </div>
              <div className="te-fg">
                <label className="te-lbl">Disch Port</label>
                <select className="te-inp">
                  <option value="">Select...</option>
                  <option>Tokyo Bay (JP)</option>
                  <option>Incheon (KR)</option>
                  <option>Dahej (IN)</option>
                  <option>Zeebrugge (BE)</option>
                  <option>Montoir (FR)</option>
                  <option>Singapore (SG)</option>
                </select>
              </div>
              <div className="te-fg">
                <label className="te-lbl">Disch Window</label>
                <div className="te-date-range">
                  <input type="date" className="te-inp" />
                  <span className="te-sep">→</span>
                  <input type="date" className="te-inp" />
                </div>
              </div>
              <div className="te-fg">
                <label className="te-lbl">Vessel</label>
                <select className="te-inp">
                  <option value="">Select...</option>
                  <option>LNG Sakura</option>
                  <option>LNG Jupiter</option>
                  <option>Al Dafna</option>
                  <option>Seri Balhaf</option>
                  <option>Pacific Breeze</option>
                </select>
              </div>
              <div className="te-fg">
                <label className="te-lbl">Cargo Ref</label>
                <input className="te-inp" placeholder="CARGO-2026-Q3-001" />
              </div>
              <div className="te-fg">
                <label className="te-lbl">Est. Vol (BBL)</label>
                <input className="te-inp" type="number" defaultValue="0" />
              </div>
              <div className="te-fg">
                <label className="te-lbl">CV</label>
                <div className="te-inp-sfx">
                  <input className="te-inp" type="number" defaultValue="0" />
                  <span className="te-sfx">BTU/scf</span>
                </div>
              </div>
              <div className="te-fg">
                <label className="te-lbl">Density</label>
                <div className="te-inp-sfx">
                  <input className="te-inp" type="number" defaultValue="0" />
                  <span className="te-sfx">kg/m³</span>
                </div>
              </div>
              <div className="te-fg">
                <label className="te-lbl">Boil-off</label>
                <div className="te-inp-sfx">
                  <input className="te-inp" type="number" defaultValue="0.15" step="0.01" />
                  <span className="te-sfx">%/day</span>
                </div>
              </div>
            </div>
          )}

          {/* === TAB 3: Settlement === */}
          {activeTab === 3 && (
            <div>
              <table className="tbl" style={{fontSize:'var(--text-xs)'}}>
                <thead>
                  <tr>
                    <th>Charge Type</th>
                    <th>Amount</th>
                    <th>Ccy</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {['Demurrage', 'Boil-off Allowance', 'Port Charges', 'Insurance', 'Agency Fees', 'Customs Duty'].map(ch => (
                    <tr key={ch}>
                      <td style={{color:'var(--text-primary)', fontWeight:500, fontFamily:'var(--font-mono)'}}>{ch}</td>
                      <td><input className="te-inp" type="number" defaultValue="0.00" step="0.01" style={{height:'1.5rem', fontSize:'var(--text-xs)'}} /></td>
                      <td>
                        <select className="te-inp" style={{height:'1.5rem', fontSize:'var(--text-xs)', minWidth:'4rem'}}>
                          <option>USD</option><option>EUR</option><option>GBP</option>
                        </select>
                      </td>
                      <td><input className="te-inp" placeholder="Notes..." style={{height:'1.5rem', fontSize:'var(--text-xs)'}} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* === TAB 4: Notes === */}
          {activeTab === 4 && (
            <div className="te-grid te-grid-3">
              <div className="te-fg">
                <label className="te-lbl">Internal Notes</label>
                <textarea className="te-inp" rows={5} placeholder="Trading notes, strategy context..." style={{height:'auto', resize:'vertical'}} />
              </div>
              <div className="te-fg">
                <label className="te-lbl">Compliance Notes</label>
                <textarea className="te-inp" rows={5} placeholder="Sanctions screening, regulatory..." style={{height:'auto', resize:'vertical'}} />
              </div>
              <div className="te-fg">
                <label className="te-lbl">Broker Notes</label>
                <textarea className="te-inp" rows={5} placeholder="Broker comms, fees..." style={{height:'auto', resize:'vertical'}} />
              </div>
              <div className="te-fg">
                <label className="te-lbl">B/L Ref</label>
                <input className="te-inp" placeholder="Bill of Lading" />
              </div>
              <div className="te-fg">
                <label className="te-lbl">CoO Ref</label>
                <input className="te-inp" placeholder="Certificate of Origin" />
              </div>
              <div className="te-fg">
                <label className="te-lbl">QC Ref</label>
                <input className="te-inp" placeholder="Quality Certificate" />
              </div>
            </div>
          )}
        </div>

        {/* ---- RIGHT PANEL ---- */}
        <div className="te-panel">
          <div className="te-panel-title">Trade Summary</div>
          <div className="te-kv">
            <span className="te-k">Direction</span>
            <span className="te-v" style={{color: direction === 'buy' ? 'var(--green)' : 'var(--red)', fontWeight:700}}>{direction.toUpperCase()}</span>
            <span className="te-k">Counterparty</span><span className="te-v">—</span>
            <span className="te-k">Volume</span><span className="te-v font-mono">3,200,000 MMBtu</span>
            <span className="te-k">Price</span><span className="te-v font-mono">$14.25 /MMBtu</span>
            <span className="te-k">Notional</span><span className="te-v font-mono" style={{color:'var(--green)'}}>$45.6M</span>
            <span className="te-k">Delivery</span><span className="te-v">—</span>
            <span className="te-k">Incoterm</span><span className="te-v">DES</span>
          </div>

          <div className="te-panel-title" style={{marginTop:'var(--sp-3)'}}>Position Impact</div>
          <div className="te-gauge-row">
            <span className="te-k">Net Position</span>
            <span className="te-v font-mono" style={{color:'var(--green)'}}>75%</span>
          </div>
          <div className="te-gauge-track"><div className="te-gauge-fill" style={{width:'75%', background:'var(--green)'}} /></div>
          <div className="te-gauge-row" style={{marginTop:'var(--sp-1)'}}>
            <span className="te-k">Hedge Ratio</span>
            <span className="te-v font-mono" style={{color:'var(--green)'}}>82%</span>
          </div>
          <div className="te-gauge-track"><div className="te-gauge-fill" style={{width:'82%', background:'var(--green)'}} /></div>

          <div className="te-panel-title" style={{marginTop:'var(--sp-3)'}}>Credit</div>
          <div style={{fontSize:'var(--text-xs)', color:'var(--text-muted)'}}>Select counterparty</div>
        </div>
      </div>
    </div>
  )
}
