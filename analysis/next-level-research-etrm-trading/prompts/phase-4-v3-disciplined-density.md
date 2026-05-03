# Phase 4: v3 — Disciplined Density Implementation

## Context
Implementing the v3 design direction from the Round 3 analysis. Creating `/horizon-v3/` with tighter composition, stronger visual hierarchy, and connected navigation.

## Prompt Process

### Step 1: Shell (shell.css + shell.js)
Copied v2 shell files to v3 directory, then applied targeted edits:

**CSS changes:**
- `font-variant-numeric: tabular-nums` on `.font-mono` — perfect number column alignment
- Content padding: `var(--sp-4)` → `var(--sp-3)` (1rem → 0.75rem)
- Card padding: `var(--sp-3)` → `var(--sp-2) var(--sp-3)` — tighter vertical
- Card border-radius: `radius-lg` → `radius-md` — more compact feel
- `.hz-card.borderless` — new utility: no border, no radius, no background, no padding
- KPI label: `0.5625rem` → `0.5rem`, uppercase, tighter tracking
- KPI value: `text-xl` → `text-lg`, `font-weight: 700` (bolder)
- KPI radius: `radius-md` → `radius-sm`
- Table header padding: `sp-2 sp-3` → `sp-1 sp-2`, font-size `0.625rem` → `0.5625rem`
- Table cell height: `1.75rem` → `1.5rem`, padding: `sp-1 sp-3` → `sp-1 sp-2`

**New CSS components:**
- `.hz-context-strip` — fixed-position bar below header, monospace tabular-nums, portfolio state
- `.hz-entity-link` — accent-colored clickable IDs with hover underline
- `.pnl-positive` / `.pnl-negative` — bold green/red P&L values
- `.hz-inline-kpi` — compact toolbar KPIs (label + value inline)

**JS changes:**
- `buildContextStrip()` — new function rendering: Net Position, P&L, Hedge, Credit, Cargoes, Invoices
- Context strip inserted between header and sidebar in `initShell()` layout
- Main content `margin-top` accounts for header + context strip height
- Sidebar `top` accounts for context strip
- Status bar version bumped to v3.0

### Step 2: Dashboard (index.html)
Complete rewrite with "Disciplined Density":
- Custom page CSS: `.tbl` class with 1.25rem row height (vs 1.5rem shell default)
- 6 compact KPIs in a flex strip
- 3-column grid: `1fr 1fr 18rem`
- **Column 1**: 8-month position ladder (borderless, no card wrapper) + hedge coverage bars
- **Column 2**: 8-row mini-blotter with clickable entity links (`hz-entity-link` to lifecycle.html) + P&L attribution breakdown
- **Column 3**: Alerts (left-border accent style), Activity feed (mini avatars), Cargoes (clickable links to cargo-board.html), P&L Attribution

All three role views (Trader/Operations/Manager) rewritten with same density approach.

### Step 3: Remaining Pages
Launched background agent to fix v3 copies of remaining pages:
- Remove skeleton wrappers from 7 pages
- Fix AG Grid heights on 3 pages (blotter, invoices, quick-entry)
- Change grid init from `DOMContentLoaded` to `setTimeout(100)`
- All pages inherit v3 shell's tighter spacing automatically

### Step 4: Verification
Playwright screenshots at 1440x900 confirmed:
- Context strip visible below header on all pages
- Dashboard fills viewport with all 3 data columns
- Numbers align with tabular-nums
- P&L values visually bold green/red
- Entity IDs show accent color (clickable appearance)

## Key Design Decisions

### Why borderless primary panels?
Bloomberg's interface has no card wrappers — data IS the interface. By removing borders from the position ladder and trade table, they feel like primary content rather than "cards on a page." Secondary elements (alerts, activity) keep card styling for visual hierarchy.

### Why tabular-nums?
Without `font-variant-numeric: tabular-nums`, monospace numbers don't align vertically in columns. The "1" is narrower than "8" in proportional fonts. Tabular-nums forces all digits to the same width, creating perfect column alignment — critical for financial tables.

### Why a context strip?
Traders need persistent awareness of portfolio state. Bloomberg shows this across the top of every screen. The context strip provides: Net Position, P&L, Hedge Ratio, Credit, Cargoes, Invoices — visible on every page without taking significant space (1.5rem height).

### Why entity links?
Pages should not be islands. Clicking T-1001 in the blotter should navigate to its lifecycle. Clicking "Al Dafna" should go to the cargo board. This creates a connected application feel rather than a collection of separate pages.

## Outcome
19 files in `/horizon-v3/`. Dashboard is fully v3 (disciplined density). Other pages inherit tighter shell spacing. All three versions (v1/v2/v3) preserved and live on GitHub Pages.

Live URL: https://sitebyte.github.io/horizon-ui-templates/horizon-v3/
