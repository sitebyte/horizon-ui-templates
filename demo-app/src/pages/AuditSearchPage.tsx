/**
 * Audit Search page — ported from v43 support-audit.html
 * Static demo data inline; items marked {/* TODO: API *\/} would come from backend.
 */
import '../tokens/audit.css'

export function AuditSearchPage() {
  return (
    <div className="hz-content-fill">
      {/* Search Bar */}
      <div className="audit-search-bar fade-in">
        <input type="text" className="hz-input search-text" placeholder="Search by entity ID, user, action..." />
        <input type="date" className="hz-input search-date" defaultValue="2026-05-01" title="Date From" />
        <input type="date" className="hz-input search-date" defaultValue="2026-05-02" title="Date To" />
        <select className="hz-input search-select">
          <option value="">All Entities</option>
          <option>Trade</option>
          <option>Invoice</option>
          <option>Nomination</option>
          <option>Cargo</option>
          <option>Contract</option>
          <option>Curve</option>
          <option>User</option>
        </select>
        <select className="hz-input search-select">
          <option value="">All Actions</option>
          <option>Create</option>
          <option>Update</option>
          <option>Delete</option>
          <option>Approve</option>
          <option>Reject</option>
          <option>Login</option>
          <option>EOD</option>
        </select>
        <select className="hz-input search-select">
          <option value="">All Users</option>
          <option>a.morgan</option>
          <option>s.kumar</option>
          <option>r.mehta</option>
          <option>system</option>
          <option>admin</option>
        </select>
        <button className="hz-btn primary sm">Search</button>
        <button className="hz-btn ghost sm">Reset</button>
      </div>

      {/* Results Table */}
      {/* TODO: API — rows would come from audit log endpoint */}
      <div className="fade-in-d1" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Entity</th>
              <th>ID</th>
              <th>Action</th>
              <th>User</th>
              <th>Field</th>
              <th>Old Value</th>
              <th>New Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>02 May 17:14:32</td>
              <td>Trade</td>
              <td><a href="/lifecycle" className="hz-entity-link">T-1024</a></td>
              <td><span className="action-badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>Update</span></td>
              <td>a.morgan</td>
              <td style={{ color: 'var(--text-tertiary)' }}>Price</td>
              <td className="font-mono pnl-negative">$14.25</td>
              <td className="font-mono pnl-positive">$14.42</td>
            </tr>
            <tr>
              <td className="font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>02 May 17:14:32</td>
              <td>Trade</td>
              <td><a href="/lifecycle" className="hz-entity-link">T-1024</a></td>
              <td><span className="action-badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>Update</span></td>
              <td>a.morgan</td>
              <td style={{ color: 'var(--text-tertiary)' }}>Volume</td>
              <td className="font-mono pnl-negative">3,200,000</td>
              <td className="font-mono pnl-positive">3,450,000</td>
            </tr>
            <tr>
              <td className="font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>02 May 16:58:11</td>
              <td>Invoice</td>
              <td><a href="/invoices" className="hz-entity-link">INV-4520</a></td>
              <td><span className="action-badge" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>Approve</span></td>
              <td>r.mehta</td>
              <td style={{ color: 'var(--text-tertiary)' }}>Status</td>
              <td className="font-mono pnl-negative">Pending</td>
              <td className="font-mono pnl-positive">Approved</td>
            </tr>
            <tr>
              <td className="font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>02 May 16:45:07</td>
              <td>Curve</td>
              <td><a href="/curves" className="hz-entity-link">JKM-FWD</a></td>
              <td><span className="action-badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>Update</span></td>
              <td>system</td>
              <td style={{ color: 'var(--text-tertiary)' }}>Jun-26 Settle</td>
              <td className="font-mono pnl-negative">$14.18</td>
              <td className="font-mono pnl-positive">$14.25</td>
            </tr>
            <tr>
              <td className="font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>02 May 16:30:00</td>
              <td>Nomination</td>
              <td><a href="/nominations" className="hz-entity-link">NOM-Q2-003</a></td>
              <td><span className="action-badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>Update</span></td>
              <td>s.kumar</td>
              <td style={{ color: 'var(--text-tertiary)' }}>Status</td>
              <td className="font-mono pnl-negative">Draft</td>
              <td className="font-mono pnl-positive">Submitted</td>
            </tr>
            <tr>
              <td className="font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>02 May 16:15:44</td>
              <td>Trade</td>
              <td><a href="/lifecycle" className="hz-entity-link">T-1023</a></td>
              <td><span className="action-badge" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>Create</span></td>
              <td>a.morgan</td>
              <td style={{ color: 'var(--text-muted)' }}>&mdash;</td>
              <td style={{ color: 'var(--text-muted)' }}>&mdash;</td>
              <td style={{ color: 'var(--text-muted)' }}>SELL 2.8M TTF Jul-26 @ $12.95</td>
            </tr>
            <tr>
              <td className="font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>02 May 15:42:18</td>
              <td>User</td>
              <td><span className="hz-entity-link">a.morgan</span></td>
              <td><span className="action-badge" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>Login</span></td>
              <td>a.morgan</td>
              <td style={{ color: 'var(--text-tertiary)' }}>IP</td>
              <td style={{ color: 'var(--text-muted)' }}>&mdash;</td>
              <td className="font-mono" style={{ color: 'var(--text-secondary)' }}>10.8.4.112</td>
            </tr>
            <tr>
              <td className="font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>02 May 15:30:00</td>
              <td>Curve</td>
              <td><a href="/curves" className="hz-entity-link">TTF-FWD</a></td>
              <td><span className="action-badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>Update</span></td>
              <td>admin</td>
              <td style={{ color: 'var(--text-tertiary)' }}>Sep-26 Override</td>
              <td className="font-mono pnl-negative">$12.60</td>
              <td className="font-mono pnl-positive">$12.78</td>
            </tr>
            <tr>
              <td className="font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>02 May 14:12:55</td>
              <td>Contract</td>
              <td><a href="/contracts" className="hz-entity-link">SPA-SHELL-26</a></td>
              <td><span className="action-badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>Update</span></td>
              <td>r.mehta</td>
              <td style={{ color: 'var(--text-tertiary)' }}>Credit Limit</td>
              <td className="font-mono pnl-negative">$80M</td>
              <td className="font-mono pnl-positive">$100M</td>
            </tr>
            <tr>
              <td className="font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>02 May 13:00:00</td>
              <td>Trade</td>
              <td><a href="/lifecycle" className="hz-entity-link">T-1022</a></td>
              <td><span className="action-badge" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>Reject</span></td>
              <td>r.mehta</td>
              <td style={{ color: 'var(--text-tertiary)' }}>Status</td>
              <td className="font-mono pnl-negative">Pending</td>
              <td className="font-mono pnl-negative">Rejected</td>
            </tr>
            <tr>
              <td className="font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>02 May 12:45:30</td>
              <td>Cargo</td>
              <td><a href="/cargo-board" className="hz-entity-link">C-2406</a></td>
              <td><span className="action-badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>Update</span></td>
              <td>s.kumar</td>
              <td style={{ color: 'var(--text-tertiary)' }}>ETA</td>
              <td className="font-mono pnl-negative">15 May</td>
              <td className="font-mono pnl-positive">14 May</td>
            </tr>
            <tr>
              <td className="font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>02 May 09:00:00</td>
              <td>Trade</td>
              <td><span className="hz-entity-link">EOD-20260501</span></td>
              <td><span className="action-badge" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>EOD</span></td>
              <td>system</td>
              <td style={{ color: 'var(--text-tertiary)' }}>Batch</td>
              <td style={{ color: 'var(--text-muted)' }}>&mdash;</td>
              <td style={{ color: 'var(--text-secondary)' }}>1,247 trades settled</td>
            </tr>
            <tr>
              <td className="font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>01 May 17:30:22</td>
              <td>Trade</td>
              <td><a href="/lifecycle" className="hz-entity-link">T-1021</a></td>
              <td><span className="action-badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>Update</span></td>
              <td>a.morgan</td>
              <td style={{ color: 'var(--text-tertiary)' }}>Delivery Point</td>
              <td className="font-mono pnl-negative">Gate</td>
              <td className="font-mono pnl-positive">Zeebrugge</td>
            </tr>
            <tr>
              <td className="font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>01 May 16:08:15</td>
              <td>Invoice</td>
              <td><a href="/invoices" className="hz-entity-link">INV-4518</a></td>
              <td><span className="action-badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>Update</span></td>
              <td>r.mehta</td>
              <td style={{ color: 'var(--text-tertiary)' }}>Amount</td>
              <td className="font-mono pnl-negative">$1,120,000</td>
              <td className="font-mono pnl-positive">$1,150,000</td>
            </tr>
            <tr>
              <td className="font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>01 May 14:55:40</td>
              <td>User</td>
              <td><span className="hz-entity-link">s.kumar</span></td>
              <td><span className="action-badge" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>Login</span></td>
              <td>s.kumar</td>
              <td style={{ color: 'var(--text-tertiary)' }}>IP</td>
              <td style={{ color: 'var(--text-muted)' }}>&mdash;</td>
              <td className="font-mono" style={{ color: 'var(--text-secondary)' }}>10.8.4.88</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {/* TODO: API — pagination state would be driven by total results count */}
      <div className="audit-pagination fade-in-d2">
        <span>Showing 15 of 2,847 results &mdash; Page 1 of 190</span>
        <div className="page-btns">
          <button className="page-btn" disabled>&laquo;</button>
          <button className="page-btn" disabled>&lsaquo;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">4</button>
          <button className="page-btn">5</button>
          <button className="page-btn">&hellip;</button>
          <button className="page-btn">190</button>
          <button className="page-btn">&rsaquo;</button>
          <button className="page-btn">&raquo;</button>
        </div>
      </div>
    </div>
  )
}
