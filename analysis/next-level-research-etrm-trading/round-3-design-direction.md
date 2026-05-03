# Round 3: Design Direction & Recommendations

**Orchestrated by:** Jon Ive (Design Director)
**Panel:** Full team — UX, Visual, Architecture, Trading SME
**Date:** 3 May 2026

---

## The Core Insight

After three rounds of analysis, the central finding is:

> **Horizon has the right content but the wrong spatial relationship between that content.**

The data is correct. The components are well-built. The design tokens are professional. But the *composition* — how elements relate to each other on screen — doesn't yet achieve the density and coherence of a production trading system.

The fix is not "add more stuff." The fix is **tighten the composition, strengthen the hierarchy, and connect the pages.**

---

## Design Direction: "Disciplined Density"

Inspired by Ive's principle of "intentional reduction" — not minimalism that removes, but discipline that reveals:

### Principle 1: Data Is the Interface
- **Remove card borders on primary data panels.** The position ladder, blotter grid, and cargo Gantt should have no card wrapper — they ARE the page. Only secondary/supporting panels get card treatment.
- **Reduce padding globally.** Content padding from `1rem` to `0.75rem`. Card padding from `0.75rem` to `0.5rem`. Table cell padding from `0.25rem 0.75rem` to `0.25rem 0.5rem`.
- **Let AG Grid breathe but not its wrapper.** The grid itself has good internal density. But the card around it adds 1.5rem of padding (top + bottom) that serves no purpose.

### Principle 2: Numbers Are Sacred
- **All financial values right-aligned, monospace, tabular-nums.** Add `font-variant-numeric: tabular-nums;` to the mono class so digits align vertically.
- **P&L values get weight.** Positive P&L: `font-weight: 600; color: var(--green)`. Negative: `font-weight: 600; color: var(--red)`. Not just color — weight too.
- **Hero numbers get more contrast.** KPI values should be `color: var(--text-primary)` (not just inheriting). The `+$2.1M` on the dashboard should be the most visually dominant element.

### Principle 3: Hierarchy Through Density Variation
- **Primary panels are dense.** Position ladder, blotter, cargo Gantt — tight rows, compact cells, maximum data.
- **Secondary panels are comfortable.** Alerts, activity feed, settings — slightly more padding, readable.
- **Tertiary elements are minimal.** Breadcrumbs, status bar, sidebar labels — smallest possible.

### Principle 4: Connected, Not Isolated
- **Cross-entity links.** Trade ID in blotter links to lifecycle page. Cargo name links to cargo-board. Invoice ID links to reconciliation.
- **Contextual breadcrumbs.** "Dashboard > Positions > JKM > Jun-26" — showing drill-down path.
- **Persistent context strip.** Below the header, a thin strip showing current context: "Net Position: 4.8M Long | P&L: +$2.1M | Hedge: 78%" — visible on every page.

### Principle 5: Motion Is Feedback
- **Trade submission:** Row slides into blotter with a brief green flash.
- **P&L change:** Number morphs to new value with color transition.
- **Page transition:** Content fades in 150ms (already done).
- **No decorative animation.** Every motion communicates a state change.

---

## Specific Recommendations by Page

### Dashboard
1. Remove card borders from position ladder — make it a borderless table
2. Add a "context strip" below the header: `Net: 4.8M | P&L: +$2.1M | Hedge: 78% | Credit: 62%`
3. Make the mini-blotter clickable — each row navigates to lifecycle
4. Add 2 more months to the position ladder (currently 6, should be 8)

### Blotter
1. Remove the card wrapper around the AG Grid — grid IS the page
2. Add a pinned totals row at the bottom
3. Make Trade ID clickable (links to lifecycle)
4. Add compact KPIs inline in the toolbar: `24 trades | Net Vol: +8.4M | P&L: +$2.1M`

### Positions
1. Add a summary strip: `Long: 22.4M | Short: -17.6M | Net: 4.8M | P&L: +$2.11M`
2. Make cells clickable — drill to blotter filtered for that benchmark+month
3. Reduce cell height by 15% — pack 4 benchmarks without scrolling

### Quick Entry
1. Reduce entry strip padding — make it even more compact
2. Add inline position impact: `After: +9.6M JKM | Limit: 96%` next to Submit
3. Make AG Grid taller — use `calc(100vh - 12rem)` instead of `calc(100vh - 16rem)`

### Trade Form
1. Tighten section spacing — reduce margin between sections from `1.25rem` to `0.75rem`
2. Add market context to pricing section — show current JKM spot next to premium field

### Lifecycle
1. Switch to 2-column: timeline left (60%), trade details right (40%)
2. Make stage dots larger and more prominent — they're the key visual element

### Invoices
1. Add toolbar KPIs: `Pending: 3 ($42.8M) | Approved MTD: 18 ($156.2M) | Overdue: 2`
2. Make invoice ID clickable — links to reconciliation

---

## CSS Changes Required

```css
/* Tighter spacing globally */
:root {
  --content-padding: 0.75rem;  /* was 1rem */
  --card-padding: 0.5rem;      /* was 0.75rem */
  --table-cell-padding: 0.25rem 0.5rem;  /* was 0.25rem 0.75rem */
}

/* Tabular numbers for alignment */
.font-mono, .mono {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

/* Borderless primary panels */
.hz-card.borderless {
  border: none;
  border-radius: 0;
  background: transparent;
  padding: 0;
}

/* Context strip */
.hz-context-strip {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-1) var(--sp-4);
  background: var(--surface-base);
  border-bottom: 0.0625rem solid var(--border);
  font-size: 0.625rem;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
}
.hz-context-strip strong {
  color: var(--text-primary);
  font-weight: 600;
}

/* Bolder P&L */
.pnl-positive { color: var(--green); font-weight: 600; }
.pnl-negative { color: var(--red); font-weight: 600; }
```

---

## Implementation Plan: v3

### Versioning Approach
- **v1** (`/horizon/`) — Original with showcase sections. Preserved as design reference.
- **v2** (`/horizon-v2/`) — Production shell, stripped showcases. Preserved as baseline.
- **v3** (`/horizon-v3/`) — Disciplined density. The target production version.

### Phase 1: Shell Updates (shell.css + shell.js)
- Tighten global spacing (content padding, card padding, table cells)
- Add `tabular-nums` to mono class
- Add `.hz-card.borderless` class
- Add `.hz-context-strip` component
- Add cross-entity link styles (`.hz-link-entity`)
- Reduce KPI value size from `text-xl` to `text-lg` on compact variant

### Phase 2: Dashboard + Blotter + Positions (3 pages)
- Dashboard: context strip, borderless position ladder, clickable blotter rows
- Blotter: remove card wrapper, add toolbar KPIs, add totals row, clickable IDs
- Positions: add summary strip, reduce cell height, clickable cells

### Phase 3: Quick Entry + Trade Form + Lifecycle (3 pages)
- Quick entry: tighter strip, inline position impact, taller grid
- Trade form: tighter section spacing, market context
- Lifecycle: 2-column layout

### Phase 4: Remaining Pages (9 pages)
- Invoices: toolbar KPIs, clickable IDs
- All other pages: tighter spacing, borderless primary panels where appropriate

### Estimated Scope
- Shell changes: ~50 lines CSS, ~20 lines JS
- Per page: ~30-60 minutes to tighten + add links
- Total: 1-2 focused sessions

---

## Final Word from Jon Ive

> "Simplicity is not the absence of clutter — that's a consequence of simplicity. Simplicity is about bringing order to complexity."

The Horizon v2 templates achieved structural order. The v3 should achieve **compositional order** — where the spacing, hierarchy, and connections between elements make the complexity of commodity trading feel manageable, even elegant.

The goal is not a prettier UI. The goal is a UI that makes a trader feel **fast**, an operations manager feel **confident**, and a technology head feel **impressed**.

That's the bar. We're close.
