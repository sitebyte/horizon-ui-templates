# Phase 5: v4 — Every Page Gets the Density Treatment

## Context
v3 applied "Disciplined Density" to the shell (context strip, tighter spacing, tabular-nums) and fully rewrote the dashboard, but the other 14 pages were still essentially v2 structure with tighter CSS inherited from the shell. v4 applies page-specific density treatment to every page.

## Prompt Process

### Step 1: Identify Page-Specific Changes
From the Round 3 analysis, each page needed specific v4 work:

| Page | v4 Treatment |
|------|-------------|
| Blotter | Remove card wrapper from grid, add toolbar KPIs, clickable trade IDs |
| Invoices | Add toolbar KPIs (pending/approved amounts), clickable invoice IDs |
| Positions | Add summary strip (Long/Short/Net/P&L/WACOG), borderless matrix |
| Quick Entry | Inline position impact next to Submit, borderless blotter |
| Trade Form | Tighten section spacing, add market context to pricing |
| Lifecycle | 2-column layout (timeline left, trade details right) |
| Curves | P&L utility classes, clickable benchmarks |
| Hedges | P&L classes, entity links on trade IDs |
| Cargo Board | Clickable cargo IDs and vessel names |
| Nominations | Entity links on nomination IDs, contracts, vessels |
| Reconciliation | Entity links on cargo/invoice refs, P&L classes on variances |
| Audit Log | Entity links on all entity IDs in trail |
| Contracts | Entity links on contract IDs |
| Settings | No changes (already appropriate density) |

### Step 2: Parallel Agent Dispatch
5 agents launched simultaneously, each handling 2-3 pages:

1. **Blotter + Invoices** — AG Grid pages: remove card wrappers, add toolbar KPIs, clickable entity IDs in cellRenderers
2. **Positions + Quick Entry** — Data-dense pages: summary strip, inline position impact, borderless panels
3. **Trade Form + Lifecycle** — Form/workflow pages: tighter sections, market context, 2-column lifecycle with trade detail sidebar
4. **Curves + Hedges + Cargo Board** — Analytics/operations pages: P&L classes, entity links
5. **Nominations + Reconciliation + Audit Log + Contracts + Settings** — Remaining pages: entity links, P&L classes

### Step 3: Key Implementation Details

**Borderless primary panels:**
Removing the `hz-card` wrapper from AG Grid containers means the grid sits directly in the content area. The toolbar (search, filters, buttons) stays as a flex row above the grid. This makes the grid feel like THE page, not a card on a page.

**Toolbar KPIs:**
Using the `hz-inline-kpi` class from v3's shell.css:
```html
<span class="hz-inline-kpi">Trades <span class="kpi-val">24</span></span>
```
These sit inline with the toolbar buttons — compact, informative, no extra vertical space.

**Clickable entity IDs:**
In AG Grid cellRenderers, wrapping values in `<a class="hz-entity-link" href="...">`:
```javascript
cellRenderer: function(p) {
  return '<a href="lifecycle.html" class="hz-entity-link">' + escapeHtml(p.value) + '</a>';
}
```
This creates a connected application — clicking T-1024 in the blotter navigates to its lifecycle page.

**2-column lifecycle:**
```css
.lc-layout { display: grid; grid-template-columns: 1fr 22rem; gap: var(--sp-3); }
```
Timeline occupies the main column, trade details (key/value pairs, valuation, documents) sit in a persistent right panel. Collapses to single column below 64rem.

**Position summary strip:**
A single-line flex row showing aggregated position data:
```
Long: 22.4M | Short: -17.6M | Net: 4.8M | P&L: +$2.11M | WACOG: $13.92
```
Uses the same compact font sizing as the context strip — information without chrome.

## Versioning
```
/horizon/    — v1 (original with showcases)
/horizon-v2/ — v2 (production shell, stripped showcases)
/horizon-v3/ — v3 (disciplined density shell + dense dashboard)
/horizon-v4/ — v4 (every page at density standard)
```

## Outcome
17 pages in `/horizon-v4/`. Every page has:
- Tighter spacing from v3 shell
- Context strip with portfolio state
- Borderless primary panels (where appropriate)
- Clickable entity links connecting pages
- Bold P&L values with proper utility classes
- Toolbar KPIs on data-heavy pages
- 2-column layouts where content benefits from it
