# Round 3: Fix Specifications

**Date:** 12 April 2026
**Focus:** Top 10 fixes with exact before/after specs

---

## Fix 1: Trade Entry Confirmation Step (BLOCKER)

**Before:** Quick entry form submits immediately on Enter. No preview, no undo.
**After:**
- Enter shows a confirmation bar below the form: "BUY 3,200,000 MMBtu JKM+$0.50 Jun-26 from JERA — Confirm (Enter) | Cancel (Esc)"
- Confirm adds to blotter, shows success toast with "Undo (5s)" countdown
- Undo removes the trade from the blotter and re-populates the form
- Full trade form: "Review & Submit" step showing summary before API call

**Applies to:** Theme D quick-entry, Theme F quick-entry, Theme E trade-entry, Theme F trade-form
**Effort:** Low — JS state machine change, no new components

---

## Fix 2: Add P&L/MTM Column to Blotter (BLOCKER)

**Before:** Blotter columns: ID, Dir, Counterparty, Volume, Price, Benchmark, Delivery, Status, etc. No P&L.
**After:**
- New column "MTM" after Price: right-aligned, monospace, green (positive) / red (negative)
- New column "Unreal P&L" after MTM: same styling
- Footer row: "Total MTM: +$2.14M | Total Unreal P&L: +$1.82M"
- Values: mock calculated from (current benchmark price - trade price) × volume

**Mock data example:**
```
BUY JKM @ $14.25, current JKM $14.60 → MTM +$0.35/MMBtu → P&L +$1,120,000
SELL TTF @ $12.80, current TTF $12.65 → MTM +$0.15/MMBtu → P&L +$420,000
```

**Applies to:** Theme D blotter, Theme F blotter, Theme F quick-entry blotter
**Effort:** Low — 2 new AG Grid column defs + mock valueGetter

---

## Fix 3: WACOG + Physical/Paper Split in Position Ladder (BLOCKER)

**Before:** Each cell shows: volume (e.g., "+3.2M") and P&L (e.g., "+$0.82M").
**After:** Each cell shows 4 data points:
```
+3.2M           ← net volume (green=long, red=short)
WACOG $14.12    ← weighted average cost of gas
+$0.82M         ← unrealized P&L
P:3.2M H:0      ← physical 3.2M, hedge 0 (or P:1.6M H:1.6M)
```

**Cell sizing:** Increase cell height from ~2.5rem to ~4rem to accommodate the extra lines. Use text-[0.625rem] for the P/H line.

**Applies to:** Theme D positions, Theme F positions
**Effort:** Medium — rework cell HTML, add mock WACOG/physical/paper data

---

## Fix 4: Loading / Empty / Error States (MAJOR)

**Add three state patterns across all pages:**

**Loading state (skeleton):**
```html
<div class="animate-pulse">
  <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
  <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
</div>
```
Show for 1.5 seconds on page load before revealing content (simulates API fetch).

**Empty state:**
```html
<div class="text-center py-12">
  <div class="text-4xl mb-3 opacity-30">[icon]</div>
  <h3 class="font-semibold mb-1">No trades yet</h3>
  <p class="text-sm text-muted mb-4">Create your first trade to see it here.</p>
  <button class="btn btn-primary">+ New Trade</button>
</div>
```

**Error state:**
```html
<div class="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
  <h4 class="font-semibold text-red-800 dark:text-red-300">Failed to load trades</h4>
  <p class="text-sm text-red-600 dark:text-red-400 mt-1">Connection timeout. Please check your network.</p>
  <button class="btn btn-sm mt-2">Retry</button>
</div>
```

**Applies to:** All AG Grid pages (blotter, invoices), dashboard KPI cards, position ladder
**Effort:** Medium — create 3 reusable patterns, add simulated loading delay

---

## Fix 5: Audit Trail Panel (MAJOR)

**Add a "History" section to entity detail views showing:**

```
┌─────────────────────────────────────────────────────┐
│ HISTORY                                             │
├─────────────────────────────────────────────────────┤
│ ● 12 Apr 09:42  j.cobley  Created trade             │
│   Direction: BUY, Volume: 3,200,000, Price: $14.25  │
│                                                     │
│ ● 12 Apr 10:15  r.mehta   Updated status            │
│   Status: Draft → Pending Approval                  │
│                                                     │
│ ● 12 Apr 10:22  s.kumar   Approved                  │
│   Status: Pending Approval → Confirmed              │
│   Comment: "Checked against credit limit"           │
│                                                     │
│ ● 12 Apr 11:30  j.cobley  Amended volume            │
│   Volume: 3,200,000 → 3,400,000 MMBtu              │
│   Reason: "Tolerance adjustment per counterparty"   │
└─────────────────────────────────────────────────────┘
```

**Implementation:** Timeline component with dot + line connector, timestamp, user, action, and field-level diff. Mock 3-5 history entries per entity.

**Applies to:** Trade detail (blotter context menu → View), Invoice detail, Nomination detail
**Effort:** Medium — new HTML pattern, mock data, integrate into existing pages

---

## Fix 6: Combobox Keyboard Navigation (MAJOR)

**Before:** Comboboxes filter on type but Arrow/Enter/Escape don't work consistently.
**After:**
- Arrow Down: open dropdown if closed, move to next item if open
- Arrow Up: move to previous item
- Enter: select highlighted item, close dropdown, move focus to next field
- Escape: close dropdown without selecting, restore previous value
- Tab: select highlighted item (or first if none highlighted), move to next field
- Typing: filters list, highlights first match
- Focus ring visible on the input at all times

**Test flow:** Tab into combobox → type "sh" → list shows "Shell Energy" highlighted → Enter → "Shell Energy" selected → focus moves to next field

**Applies to:** All combobox instances (counterparty, ports, vessels, benchmarks)
**Effort:** Medium — rewrite combobox JS event handlers

---

## Fix 7: Add Delivery Terms to Quick Entry (MAJOR)

**Before:** Quick entry has: Direction, Counterparty, Volume, Benchmark, Price, Month
**After:** Add between Volume and Benchmark:
- Incoterms select: `[FOB ▼]` (options: FOB, DES, CIF, DAP)
- Default: DES (most common for LNG spot)
- Compact: 4rem wide dropdown, keyboard-navigable

**Applies to:** Theme D quick-entry, Theme F quick-entry
**Effort:** Low — one additional select field

---

## Fix 8: Shared Shell Architecture (MAJOR)

**Before:** Theme F duplicates ~230 lines of sidebar/header/palette/toast per page.
**After:** Adopt Theme D's pattern:
- `shell.css` — all CSS custom properties, sidebar, header, card, button, badge styles
- `shell.js` — `initShell(activeKey, pageTitle)` function that builds sidebar, header, command palette, theme toggle, toast system
- Each page: just links `shell.css` + `shell.js` and calls `initShell()`

**Applies to:** Theme F (all 11 pages), Theme E (all 10 pages)
**Effort:** Medium-High — refactor, but massive maintainability improvement

---

## Fix 9: AG Grid `getRowId` and Null Safety (MAJOR)

**Before:**
```javascript
// No getRowId — AG Grid uses index-based identity
columnDefs: [
  { field: 'price', valueFormatter: p => '$' + p.value.toFixed(2) }  // THROWS on null
]
```

**After:**
```javascript
gridOptions: {
  getRowId: params => params.data.id,  // Stable row identity
}
columnDefs: [
  { field: 'price', valueFormatter: p => p.value != null ? '$' + p.value.toFixed(2) : '–' }
]
```

**Also fix:** XSS in dropdown template literals — escape counterparty names containing quotes/apostrophes.

**Applies to:** All AG Grid instances (6 pages across themes D, E, F)
**Effort:** Low — systematic find/replace

---

## Fix 10: Cross-Entity Navigation Links (MAJOR)

**Before:** Each page is an island. Trade blotter doesn't link to invoices. Invoice doesn't link to trade. Position doesn't link to trades.

**After:** Add clickable reference links:
- Blotter: counterparty name links to counterparty detail, cargo ref links to cargo
- Invoice queue: trade ref links to trade detail, cargo ref links to cargo
- Position drill-down: trade references are clickable links to trade detail
- Nomination: contract ref links to contract detail
- Reconciliation: invoice ref links to invoice detail

**Implementation:** Since these are static demos, links navigate to the relevant page (e.g., blotter.html, invoices.html) with a visual indication that cross-navigation is possible (underline on hover, different cursor).

**Applies to:** All entity-display pages
**Effort:** Low — add `<a>` tags with appropriate styling

---

## Implementation Order

```
Week 1 (Blockers):
  Fix 1: Confirmation step          [2 hours]
  Fix 2: P&L/MTM column            [2 hours]  
  Fix 7: Delivery terms in quick entry [1 hour]
  Fix 9: AG Grid safety            [2 hours]

Week 2 (Major - High Impact):
  Fix 3: WACOG + physical/paper     [4 hours]
  Fix 6: Combobox keyboard          [4 hours]
  Fix 4: Loading/empty/error states  [3 hours]

Week 3 (Major - Completeness):
  Fix 5: Audit trail panel          [4 hours]
  Fix 10: Cross-entity links        [2 hours]
  Fix 8: Shared shell architecture   [6 hours]
```

**Total: ~30 hours of work. After Week 1, the 3 blockers are resolved and the system is demo-safe.**

---

## Post-Fix Projected Scores

| Reviewer | Current | After Fixes | Notes |
|----------|---------|-------------|-------|
| Trading Tech Head | 7.4 | 8.5 | Confirmation + audit trail + P&L satisfy enterprise requirements |
| Desk Trader | 6.8-8.0 | 8.5-9.0 | P&L in blotter + WACOG + keyboard fixes address all blockers |
| Ops Manager | 5.2-6.6 | 7.0-8.0 | Audit trail + confirmation + cross-links address biggest gaps |
| UX Specialist | Varies | 7.5-8.5 | Loading/error states + consistency via shared shell |
| Competitor Bench | 7-8 | 8.5-9.0 | P&L + WACOG + audit makes it competitive with Allegro |
| Frontend Craft | 5-9 | 7.5-9.0 | getRowId + null safety + shared shell fix systemic issues |

**Projected overall: 8.0-8.5/10 — "ready for a pilot discussion"**
