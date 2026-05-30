/**
 * Trade Entry Page — multi-tabbed LNG cargo trade capture form
 * Uses EXACT same CSS class names from the v46 prototype (trade-form.html + lifecycle.html).
 * All mock data is inline.
 */
import { useState } from 'react'

/* ================================================================
   Tab definitions
   ================================================================ */
const TAB_LABELS = [
  'Trade Details',
  'Pricing & Volume',
  'Physical Delivery',
  'Settlement & Charges',
  'Notes & Compliance',
]

/* ================================================================
   Helper: today's date as YYYY-MM-DD
   ================================================================ */
function todayStr(): string {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

/* ================================================================
   TradeEntryPage component
   ================================================================ */
export function TradeEntryPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy')
  const [priceBasis, setPriceBasis] = useState<'fixed' | 'index' | 'formula'>('fixed')

  return (
    <div style={{ padding: 'var(--sp-4)' }}>
      <div className="tf-layout">
        {/* ==================== LEFT: FORM ==================== */}
        <div>
          {/* ---- Tabs ---- */}
          <div className="td-tabs">
            {TAB_LABELS.map((label, i) => (
              <button
                key={label}
                className={`td-tab${activeTab === i ? ' active' : ''}`}
                onClick={() => setActiveTab(i)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          {/* ================================================
              Tab 0: Trade Details
              ================================================ */}
          <div className={`td-tab-panel${activeTab === 0 ? ' active' : ''}`}>
            {/* Direction */}
            <div className="tf-section tf-fade-in">
              <div className="tf-section-header">
                <span className="tf-section-number">1</span>
                <span className="tf-section-title">Direction &amp; Dates</span>
              </div>

              <div className="tf-group" style={{ marginBottom: 'var(--sp-4)' }}>
                <label className="tf-label">Trade Direction</label>
                <div className="tf-dir-toggle">
                  <button
                    type="button"
                    className={`tf-dir-btn buy${direction === 'buy' ? ' active' : ''}`}
                    onClick={() => setDirection('buy')}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    className={`tf-dir-btn sell${direction === 'sell' ? ' active' : ''}`}
                    onClick={() => setDirection('sell')}
                  >
                    SELL
                  </button>
                </div>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Trade Date</label>
                  <input type="date" className="tf-input" defaultValue={todayStr()} />
                </div>
              </div>
            </div>

            {/* Counterparty & Contract */}
            <div className="tf-section tf-fade-in-d1">
              <div className="tf-section-header">
                <span className="tf-section-number">2</span>
                <span className="tf-section-title">Counterparty &amp; Contract</span>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Counterparty</label>
                  <select className="tf-input" defaultValue="">
                    <option value="" disabled>Select counterparty...</option>
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
                <div className="tf-group">
                  <label className="tf-label">Contract Type</label>
                  <select className="tf-input" defaultValue="SPA">
                    <option>SPA</option>
                    <option>MSA</option>
                    <option>Spot</option>
                    <option>Term</option>
                  </select>
                </div>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Contract Reference</label>
                  <input type="text" className="tf-input" placeholder="e.g. SPA-SHELL-2026-001" />
                </div>
                <div className="tf-group">
                  <label className="tf-label">Commodity</label>
                  <select className="tf-input" defaultValue="LNG">
                    <option>LNG</option>
                    <option>Pipeline Gas</option>
                    <option>LPG</option>
                  </select>
                </div>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Delivery Region</label>
                  <select className="tf-input" defaultValue="">
                    <option value="" disabled>Select region...</option>
                    <option>Far East</option>
                    <option>Europe</option>
                    <option>India</option>
                    <option>Japan</option>
                    <option>CHI</option>
                    <option>JKT</option>
                    <option>JKTC</option>
                  </select>
                </div>
                <div className="tf-group">
                  <label className="tf-label">Incoterm</label>
                  <select className="tf-input" defaultValue="DES">
                    <option>DES</option>
                    <option>FOB</option>
                    <option>DAP</option>
                    <option>CIF</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================
              Tab 1: Pricing & Volume
              ================================================ */}
          <div className={`td-tab-panel${activeTab === 1 ? ' active' : ''}`}>
            {/* Pricing */}
            <div className="tf-section tf-fade-in">
              <div className="tf-section-header">
                <span className="tf-section-number">3</span>
                <span className="tf-section-title">Pricing</span>
              </div>

              <div className="tf-group" style={{ marginBottom: 'var(--sp-4)' }}>
                <label className="tf-label">Price Basis</label>
                <div className="tf-segmented">
                  <button
                    type="button"
                    className={`tf-seg-btn${priceBasis === 'fixed' ? ' active' : ''}`}
                    onClick={() => setPriceBasis('fixed')}
                  >
                    Fixed
                  </button>
                  <button
                    type="button"
                    className={`tf-seg-btn${priceBasis === 'index' ? ' active' : ''}`}
                    onClick={() => setPriceBasis('index')}
                  >
                    Index
                  </button>
                  <button
                    type="button"
                    className={`tf-seg-btn${priceBasis === 'formula' ? ' active' : ''}`}
                    onClick={() => setPriceBasis('formula')}
                  >
                    Formula
                  </button>
                </div>
              </div>

              {/* Fixed pricing panel */}
              <div className={`tf-pricing-panel${priceBasis === 'fixed' ? ' active' : ''}`}>
                <div className="tf-row">
                  <div className="tf-group">
                    <label className="tf-label">Fixed Price</label>
                    <div className="tf-input-wrap">
                      <input type="number" className="tf-input" defaultValue="14.25" step="0.01" />
                      <span className="tf-input-suffix">$/MMBtu</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Index pricing panel */}
              <div className={`tf-pricing-panel${priceBasis === 'index' ? ' active' : ''}`}>
                <div className="tf-row">
                  <div className="tf-group">
                    <label className="tf-label">Index</label>
                    <select className="tf-input" defaultValue="JKM">
                      <option>JKM</option>
                      <option>TTF</option>
                      <option>HH</option>
                      <option>Brent</option>
                      <option>NBP</option>
                      <option>JCC</option>
                    </select>
                  </div>
                  <div className="tf-group">
                    <label className="tf-label">Premium / Discount</label>
                    <div className="tf-input-wrap">
                      <input type="number" className="tf-input" defaultValue="0.50" step="0.01" />
                      <span className="tf-input-suffix">$/MMBtu</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formula pricing panel */}
              <div className={`tf-pricing-panel${priceBasis === 'formula' ? ' active' : ''}`}>
                <div className="tf-group">
                  <label className="tf-label">Formula Expression</label>
                  <input type="text" className="tf-input" placeholder="e.g. 0.1485 * Brent + 0.50" />
                </div>
                <div className="tf-formula-box" style={{ marginTop: 'var(--sp-3)' }}>
                  <div className="tf-formula-label">Formula Preview</div>
                  <div className="tf-formula-text">Price = 0.1485 &times; Brent + $0.50/MMBtu</div>
                </div>
              </div>
            </div>

            {/* Volume */}
            <div className="tf-section tf-fade-in-d1">
              <div className="tf-section-header">
                <span className="tf-section-number">4</span>
                <span className="tf-section-title">Volume &amp; Delivery Period</span>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Volume</label>
                  <div className="tf-input-wrap">
                    <input type="number" className="tf-input" defaultValue="3200000" />
                    <span className="tf-input-suffix">MMBtu</span>
                  </div>
                </div>
                <div className="tf-group">
                  <label className="tf-label">Volume Tolerance</label>
                  <div className="tf-input-wrap">
                    <input type="number" className="tf-input" defaultValue="5" step="0.5" />
                    <span className="tf-input-suffix">%</span>
                  </div>
                </div>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Delivery Period From</label>
                  <input type="date" className="tf-input" />
                </div>
                <div className="tf-group">
                  <label className="tf-label">Delivery Period To</label>
                  <input type="date" className="tf-input" />
                </div>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Unit</label>
                  <select className="tf-input" defaultValue="MMBtu">
                    <option>MMBtu</option>
                    <option>MWh</option>
                    <option>BBL</option>
                    <option>MT</option>
                  </select>
                </div>
                <div className="tf-group">
                  <label className="tf-label">Currency</label>
                  <select className="tf-input" defaultValue="USD">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>JPY</option>
                    <option>SGD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================
              Tab 2: Physical Delivery
              ================================================ */}
          <div className={`td-tab-panel${activeTab === 2 ? ' active' : ''}`}>
            <div className="tf-section tf-fade-in">
              <div className="tf-section-header">
                <span className="tf-section-number">5</span>
                <span className="tf-section-title">Loading</span>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Loading Port</label>
                  <select className="tf-input" defaultValue="">
                    <option value="" disabled>Select port...</option>
                    <option>Gladstone (AU)</option>
                    <option>Wheatstone (AU)</option>
                    <option>Sabine Pass (US)</option>
                    <option>Ras Laffan (QA)</option>
                    <option>Bintulu (MY)</option>
                    <option>Tangguh (ID)</option>
                  </select>
                </div>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Loading Window From</label>
                  <input type="date" className="tf-input" />
                </div>
                <div className="tf-group">
                  <label className="tf-label">Loading Window To</label>
                  <input type="date" className="tf-input" />
                </div>
              </div>
            </div>

            <div className="tf-section tf-fade-in-d1">
              <div className="tf-section-header">
                <span className="tf-section-number">6</span>
                <span className="tf-section-title">Discharge</span>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Discharge Port</label>
                  <select className="tf-input" defaultValue="">
                    <option value="" disabled>Select port...</option>
                    <option>Tokyo Bay (JP)</option>
                    <option>Incheon (KR)</option>
                    <option>Dahej (IN)</option>
                    <option>Zeebrugge (BE)</option>
                    <option>Montoir (FR)</option>
                    <option>Singapore (SG)</option>
                  </select>
                </div>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Discharge Window From</label>
                  <input type="date" className="tf-input" />
                </div>
                <div className="tf-group">
                  <label className="tf-label">Discharge Window To</label>
                  <input type="date" className="tf-input" />
                </div>
              </div>
            </div>

            <div className="tf-section tf-fade-in-d2">
              <div className="tf-section-header">
                <span className="tf-section-number">7</span>
                <span className="tf-section-title">Vessel &amp; Cargo</span>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Vessel</label>
                  <select className="tf-input" defaultValue="">
                    <option value="" disabled>Select vessel...</option>
                    <option>LNG Sakura</option>
                    <option>LNG Jupiter</option>
                    <option>Al Dafna</option>
                    <option>Seri Balhaf</option>
                    <option>Pacific Breeze</option>
                  </select>
                </div>
                <div className="tf-group">
                  <label className="tf-label">Cargo Reference</label>
                  <input type="text" className="tf-input" placeholder="e.g. CARGO-2026-Q3-001" />
                </div>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Estimated Volume (BBL)</label>
                  <input type="number" className="tf-input" placeholder="0" />
                </div>
                <div className="tf-group">
                  <label className="tf-label">Calorific Value</label>
                  <div className="tf-input-wrap">
                    <input type="number" className="tf-input" placeholder="0" />
                    <span className="tf-input-suffix">BTU/scf</span>
                  </div>
                </div>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Density</label>
                  <div className="tf-input-wrap">
                    <input type="number" className="tf-input" placeholder="0" />
                    <span className="tf-input-suffix">kg/m&sup3;</span>
                  </div>
                </div>
                <div className="tf-group">
                  <label className="tf-label">Boil-off Rate</label>
                  <div className="tf-input-wrap">
                    <input type="number" className="tf-input" placeholder="0" step="0.01" />
                    <span className="tf-input-suffix">%/day</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================
              Tab 3: Settlement & Charges
              ================================================ */}
          <div className={`td-tab-panel${activeTab === 3 ? ' active' : ''}`}>
            <div className="tf-section tf-fade-in">
              <div className="tf-section-header">
                <span className="tf-section-number">8</span>
                <span className="tf-section-title">Settlement</span>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Payment Terms</label>
                  <select className="tf-input" defaultValue="30 Days">
                    <option>30 Days</option>
                    <option>45 Days</option>
                    <option>60 Days</option>
                    <option>Letter of Credit</option>
                  </select>
                </div>
                <div className="tf-group">
                  <label className="tf-label">Settlement Currency</label>
                  <select className="tf-input" defaultValue="USD">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>JPY</option>
                    <option>SGD</option>
                  </select>
                </div>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Value Date</label>
                  <input type="date" className="tf-input" />
                </div>
                <div className="tf-group">
                  <label className="tf-label">Invoice Schedule</label>
                  <select className="tf-input" defaultValue="Per-Cargo">
                    <option>Monthly</option>
                    <option>Per-Cargo</option>
                    <option>Quarterly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="tf-section tf-fade-in-d1">
              <div className="tf-section-header">
                <span className="tf-section-number">9</span>
                <span className="tf-section-title">Charges</span>
              </div>

              <table className="tbl">
                <thead>
                  <tr>
                    <th>Charge Type</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    'Demurrage',
                    'Boil-off Allowance',
                    'Port Charges',
                    'Insurance',
                    'Agency Fees',
                    'Customs Duty',
                  ].map((charge) => (
                    <tr key={charge}>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                        {charge}
                      </td>
                      <td>
                        <input
                          type="number"
                          className="tf-input"
                          placeholder="0.00"
                          style={{ height: '1.5rem', padding: '0.125rem 0.375rem', fontSize: 'var(--text-xs)' }}
                        />
                      </td>
                      <td>
                        <select
                          className="tf-input"
                          defaultValue="USD"
                          style={{ height: '1.5rem', padding: '0.125rem 0.375rem', fontSize: 'var(--text-xs)' }}
                        >
                          <option>USD</option>
                          <option>EUR</option>
                          <option>GBP</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="tf-input"
                          placeholder="Notes..."
                          style={{ height: '1.5rem', padding: '0.125rem 0.375rem', fontSize: 'var(--text-xs)' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================================================
              Tab 4: Notes & Compliance
              ================================================ */}
          <div className={`td-tab-panel${activeTab === 4 ? ' active' : ''}`}>
            <div className="tf-section tf-fade-in">
              <div className="tf-section-header">
                <span className="tf-section-number">10</span>
                <span className="tf-section-title">Notes</span>
              </div>

              <div className="tf-group" style={{ marginBottom: 'var(--sp-4)' }}>
                <label className="tf-label">Internal Notes</label>
                <textarea
                  className="tf-input"
                  rows={6}
                  placeholder="Trading notes, strategy context..."
                  style={{ resize: 'vertical', height: 'auto' }}
                />
              </div>

              <div className="tf-group" style={{ marginBottom: 'var(--sp-4)' }}>
                <label className="tf-label">Compliance Notes</label>
                <textarea
                  className="tf-input"
                  rows={4}
                  placeholder="Sanctions screening, regulatory notes..."
                  style={{ resize: 'vertical', height: 'auto' }}
                />
              </div>

              <div className="tf-group">
                <label className="tf-label">Broker Notes</label>
                <textarea
                  className="tf-input"
                  rows={3}
                  placeholder="Broker communications, fee arrangements..."
                  style={{ resize: 'vertical', height: 'auto' }}
                />
              </div>
            </div>

            <div className="tf-section tf-fade-in-d1">
              <div className="tf-section-header">
                <span className="tf-section-number">11</span>
                <span className="tf-section-title">Document References</span>
              </div>

              <div className="tf-row">
                <div className="tf-group">
                  <label className="tf-label">Bill of Lading Ref</label>
                  <input type="text" className="tf-input" placeholder="B/L reference" />
                </div>
                <div className="tf-group">
                  <label className="tf-label">Certificate of Origin Ref</label>
                  <input type="text" className="tf-input" placeholder="CoO reference" />
                </div>
                <div className="tf-group">
                  <label className="tf-label">Quality Certificate Ref</label>
                  <input type="text" className="tf-input" placeholder="QC reference" />
                </div>
              </div>
            </div>
          </div>

          {/* ==================== Action Bar ==================== */}
          <div className="tf-actions">
            <button
              type="button"
              className={`tf-submit ${direction === 'buy' ? 'buy-mode' : 'sell-mode'}`}
            >
              Submit Trade &mdash; {direction === 'buy' ? 'BUY' : 'SELL'}
            </button>
            <button type="button" className="tf-secondary">Save Draft</button>
            <button type="button" className="tf-ghost">Reset</button>
          </div>
        </div>

        {/* ==================== RIGHT: PANEL ==================== */}
        <div className="tf-right-panel">
          {/* Trade Summary */}
          <div className="tf-section">
            <div className="tf-section-header">
              <span className="tf-section-title">Trade Summary</span>
            </div>
            <div className="hz-dense-form">
              <div className="hz-dense-form-row">
                <span className="hz-dense-form-label">Direction</span>
                <span
                  className="hz-dense-form-value"
                  style={{ color: direction === 'buy' ? 'var(--green)' : 'var(--red)' }}
                >
                  {direction === 'buy' ? 'BUY' : 'SELL'}
                </span>
              </div>
              <div className="hz-dense-form-row">
                <span className="hz-dense-form-label">Counterparty</span>
                <span className="hz-dense-form-value" style={{ color: 'var(--text-muted)' }}>&mdash;</span>
              </div>
              <div className="hz-dense-form-row">
                <span className="hz-dense-form-label">Volume</span>
                <span className="hz-dense-form-value" style={{ color: 'var(--text-muted)' }}>&mdash;</span>
              </div>
              <div className="hz-dense-form-row">
                <span className="hz-dense-form-label">Price</span>
                <span className="hz-dense-form-value" style={{ color: 'var(--text-muted)' }}>&mdash;</span>
              </div>
              <div className="hz-dense-form-row">
                <span className="hz-dense-form-label">Delivery</span>
                <span className="hz-dense-form-value" style={{ color: 'var(--text-muted)' }}>&mdash;</span>
              </div>
              <div className="hz-dense-form-row">
                <span className="hz-dense-form-label">Incoterm</span>
                <span className="hz-dense-form-value" style={{ color: 'var(--text-muted)' }}>&mdash;</span>
              </div>
            </div>
          </div>

          {/* Position Impact */}
          <div className="tf-section">
            <div className="tf-section-header">
              <span className="tf-section-title">Position Impact</span>
            </div>

            <div style={{ marginBottom: 'var(--sp-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-1)' }}>
                <span className="tf-label">Net Position</span>
                <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 600 }}>75%</span>
              </div>
              <div className="tf-gauge-track">
                <div
                  className="tf-gauge-fill"
                  style={{ width: '75%', background: 'var(--green)' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-1)' }}>
                <span className="tf-label">Hedge Ratio</span>
                <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 600 }}>82%</span>
              </div>
              <div className="tf-gauge-track">
                <div
                  className="tf-gauge-fill"
                  style={{ width: '82%', background: 'var(--green)' }}
                />
              </div>
            </div>
          </div>

          {/* Credit Check */}
          <div className="tf-section">
            <div className="tf-section-header">
              <span className="tf-section-title">Credit Check</span>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', padding: 'var(--sp-2) 0' }}>
              Select counterparty
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
