# Round 2: UX Audit of Current Horizon v2

**Orchestrated by:** Jon Ive (Design Director)
**Panel:** UX Specialist, Desk Trader (persona), Operations Manager (persona), Front-End Architect
**Date:** 3 May 2026

---

## Assessment Method

The panel reviewed Playwright screenshots of all 15 v2 pages at 1440x900, evaluated information density, interaction patterns, and visual coherence. Each page was assessed against Bloomberg/Trayport density benchmarks and Molecule ease-of-use standards.

---

## Page-by-Page Audit

### Dashboard (index.html) — Score: 8/10
**What works:**
- 6 KPIs across the top — good density, compact labels
- 3-column layout fills viewport — position ladder, mini-blotter, alerts/activity/cargo
- Hedge coverage bars with quarterly breakdown — useful at-a-glance
- Activity feed with mini avatars — shows team is alive

**What needs work:**
- Position ladder column headers are wider than necessary (Month takes too much space)
- Mini-blotter truncates counterparty names unnecessarily — could abbreviate differently
- Alerts and cargo sections in the right column could be taller — some vertical space wasted below them
- No visual hierarchy between the 3 columns — they all look the same weight. The position ladder should feel primary.

### Blotter (blotter.html) — Score: 9/10
**What works:**
- AG Grid fills viewport — this is how every data-heavy page should work
- 24 rows visible with clear column headers
- Status filter pills in toolbar — efficient filtering
- P&L column with green/red coloring — instant readability

**What needs work:**
- Column widths could be tighter (Trade ID column is wider than needed)
- No running totals row at the bottom (pinned bottom row)
- No row grouping capability visible (would help traders group by benchmark/portfolio)

### Quick Entry (quick-entry.html) — Score: 7.5/10
**What works:**
- Entry strip is compact and clear — 8 fields in one row
- Keyboard hints (B/S/Tab/Enter) visible
- AG Grid shows session trades below

**What needs work:**
- The entry strip card has too much padding — could be even more compact
- No position impact preview inline (was in v1 showcase but removed)
- The "Enter Trade" button should be more prominent — it's the primary action
- Empty grid area below the 3 sample trades is wasted space

### Positions (positions.html) — Score: 9/10
**What works:**
- Heat-map matrix is excellent — benchmarks x months with color-coded cells
- WACOG visible in every cell — addresses the blocker feedback
- Net position + P&L per cell — dense and useful
- Keyboard navigation note visible

**What needs work:**
- Cells are slightly too tall — could pack more benchmarks if rows were tighter
- No summary strip at the top (Total Long/Short/Net/P&L) — trader needs this at a glance
- Totals column on the right is good but could use stronger visual treatment

### Trade Form (trade-form.html) — Score: 8.5/10
**What works:**
- 2-column layout with sticky right panel — correct pattern
- Numbered sections with icons — clear progression
- Position impact preview updates live — unique differentiator

**What needs work:**
- Form sections have generous spacing — could tighten for less scrolling
- The right panel could show more context (market price, spread to market, historical fills)

### Lifecycle (lifecycle.html) — Score: 8/10
**What works:**
- Timeline visualization with colored dots (complete/active/pending)
- Trade header with key details
- Expandable panels per stage

**What needs work:**
- Single-column layout wastes the right side of the screen
- Could use a 2-column layout: timeline left, trade details right
- P&L breakdown at the bottom is good but disconnected from the timeline

### Curves (curves.html) — Score: 7/10
**What needs work:**
- Forward curve cards are good but chart visualization is CSS-only (bars) — limited
- Spread monitor is useful but cards are too spaced out
- Could use a dominant chart area with a table beside it

### Hedges (hedges.html) — Score: 7/10
**What needs work:**
- KPI cards + hedge ratio bars + paper trades table are all good individual components
- But they don't connect — no drill-down from ratio bar to underlying trades
- Physical vs paper comparison could be a split bar chart instead of text

### Cargo Board (cargo-board.html) — Score: 8.5/10
**What works:**
- Gantt chart is excellent — visual timeline of cargo voyages
- Phase strip at top with counts
- Color coding per phase is clear

**What needs work:**
- No filtering by vessel/route/status
- Detail panels could show more (vessel specs, B/L number)

### Invoices (invoices.html) — Score: 8.5/10
**What works:**
- AG Grid fills viewport
- Status badges with color coding
- Bulk approve + export in toolbar

**What needs work:**
- No summary KPIs inline (total pending amount, overdue count)
- Could benefit from a split view: grid left, invoice detail right

### Remaining Pages
- **Nominations** (8/10) — Pipeline stepper is innovative but form-heavy
- **Reconciliation** (7.5/10) — Side-by-side is correct but could be tighter
- **Audit Log** (7/10) — Timeline + table is good but feels sparse
- **Contracts** (7.5/10) — Wizard works but steps have too much whitespace
- **Settings** (7/10) — Functional but not a priority for density

---

## Cross-Cutting Issues

### 1. Spacing is Still Too Generous
- Cards use `padding: 0.75rem` — could be `0.5rem` on data-heavy pages
- Gap between grid items is `0.75rem` — could be `0.5rem`
- The overall feeling is "comfortable" when it should be "compact"

### 2. No Visual Hierarchy Between Panels
- All cards look the same — same border, same radius, same padding
- The PRIMARY panel (position ladder on dashboard, AG Grid on blotter) should look different from secondary panels
- Bloomberg achieves this by removing borders entirely — data IS the interface

### 3. Sidebar Is Passive
- Sidebar just lists pages. It could show contextual information:
  - Badge counts that update (pending invoices, open nominations)
  - The current position net (tiny number next to "Positions")
  - Alert count in header notification bell

### 4. Header Ticker Is Static
- Prices never change. In a real system this would update every second.
- Consider adding a subtle pulse/flash on price change to show liveness.
- The timestamp in the status bar says "Last update: XX:XX:XX" but nothing actually updates.

### 5. No Cross-Page Navigation
- Clicking a trade in the blotter should navigate to its lifecycle page.
- Clicking a cargo in the dashboard should navigate to cargo-board.
- Clicking an invoice should show its detail.
- Currently, pages are islands.

---

## Jon Ive's Assessment

> "When you sense that someone has designed something with immense care, it communicates something beyond the functional."

The v2 templates are **structurally correct** — the right pages exist, the right data is shown, the right patterns are used. But they don't yet communicate **care**.

Care would look like:
1. **Every number aligned to the right, every label aligned to the left.** Consistently, without exception.
2. **P&L numbers that visually "pop"** — not just colored, but weighted. A +$2.1M profit should feel like good news. A -$128K loss should feel like a warning.
3. **Transitions that feel purposeful** — not decorative animations, but functional feedback. When a trade is submitted, the blotter row should slide in, not appear.
4. **Typography that creates rhythm** — monospace for numbers, sans-serif for labels, with consistent sizing that creates scannable columns.
5. **Color used sparingly and meaningfully** — green/red only for P&L and direction. Amber only for warnings. Blue only for informational. No color for decoration.

The current templates use color correctly but don't use it *boldly*. The green on a positive P&L should be the most noticeable thing on the screen. Currently it's just... green text.
