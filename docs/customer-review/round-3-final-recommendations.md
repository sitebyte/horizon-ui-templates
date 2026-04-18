# Blackthorn Digital — Round 3: Final Recommendations

**To:** Horizon Design Team (Original Agency)
**From:** Blackthorn Digital (Competitor Review Panel)
**Date:** 18 April 2026
**Classification:** Actionable — build against these recommendations

---

## Executive Summary

We were hired by trading houses to evaluate your Horizon UI templates and advise whether to proceed. Our verdict: **proceed, with conditions.** The innovation is real (role-adaptive dashboard, reconciliation diff, quick entry confirmation), but the execution needs tightening before we'd recommend our clients sign.

Below are our 8 specific recommendations, each with enough detail to build against. We're not being vague — we're telling you exactly what to build.

---

## Recommendation 1: Build ONE Product Theme ("Horizon")

**Kill themes A, B, C, D, E as active development.** Archive them as design references. Create a single new theme called "Horizon" that combines:

- **Theme F's** feature set (role selector, all page types, breadcrumbs)
- **Theme D's** architecture (shell.js/shell.css shared module, CSS custom properties, design tokens)
- **Theme D's** keyboard patterns (tabindex, arrow-key combobox, focus management)
- **Theme F's** visual identity but sharpened (indigo-to-violet gradient accent, Inter + JetBrains Mono only)

**Template structure for the new theme:**
```
horizon/
├── shell.css          ← design tokens, all component styles
├── shell.js           ← sidebar builder, header, cmd-k, toast, theme toggle
├── index.html         ← dashboard (role-adaptive)
├── quick-entry.html   ← quick trade entry + blotter
├── blotter.html       ← full AG Grid blotter
├── positions.html     ← position ladder with drill-down
├── trade-form.html    ← full trade entry form
├── invoices.html      ← invoice queue with inline edit
├── nominations.html   ← cascading nomination form
├── reconciliation.html← side-by-side diff
├── contracts.html     ← multi-step wizard
├── audit-log.html     ← filterable audit trail
├── settings.html      ← settings + keyboard shortcuts
├── signin.html        ← standalone sign-in
└── error-404.html     ← standalone error
```

Each page: `<link href="shell.css">` + `<script src="shell.js">` + `<script>initShell('pageKey','Page Title')</script>`. Zero duplication.

---

## Recommendation 2: Fix the Combobox (Build It Properly)

The current combobox is the weakest interactive element. Build a proper one with this spec:

**Behaviour:**
```
CLOSED state:
  - Shows selected value (or placeholder)
  - Click or Down Arrow opens
  - Typing opens and filters

OPEN state:
  - Input field with search text
  - Dropdown list filtered by search
  - First match highlighted
  - Down Arrow: move highlight down
  - Up Arrow: move highlight up
  - Enter: select highlighted, close, move focus to next field
  - Tab: select highlighted, close, move focus to next field
  - Escape: close without selecting, restore previous value
  - Click item: select, close

SELECTED state:
  - Shows selected value with clear button (X)
  - Below input: context line (e.g., "Shell Energy Trading — UK — Credit: $22M headroom")
  - Clear button: reset to CLOSED with placeholder
```

**Edge cases to handle:**
- Empty results: show "No matches for 'xyz'" message
- Exact match: if typed text exactly matches one item, highlight it
- Long list: virtual scroll if >50 items (or cap visible at 8 with scroll)
- Apostrophes/special chars: escape for HTML rendering
- Blur without selecting: revert to previous value, don't leave orphan text

---

## Recommendation 3: Design the Three Missing States

Every data view needs these three states. Design them ONCE, use everywhere.

**Loading (skeleton):**
- AG Grid: grey pulsing rows (3-5 skeleton rows matching column layout)
- KPI cards: grey pulsing blocks for value and label
- Position ladder: grey pulsing cells
- Duration: show for minimum 300ms even if data arrives faster (prevents flash)

**Empty:**
- Icon (muted, large) + heading + description + primary action button
- Example: "No trades today" / "Create your first trade or import from file" / [+ New Trade]
- Each entity type gets a specific empty state (not generic)

**Error:**
- Red-tinted banner with icon + title + description + retry button
- Example: "Failed to load trade blotter" / "Server returned 503. This usually resolves in a few minutes." / [Retry]
- Non-blocking: error on one panel doesn't break the rest of the page

---

## Recommendation 4: Position Ladder — Make It the Hero

The position ladder is the most-used screen in any trading ETRM. It needs to be exceptional.

**Current cell:**
```
+3.2M
+$0.82M
```

**Target cell:**
```
+3.2M Long          ← volume with direction word
WACOG $14.12        ← weighted average cost
+$0.82M (+6.2%)     ← P&L absolute + percentage
P:1.6M  H:1.6M     ← physical / hedge split
```

**Additional features:**
- Heat map intensity: lighter green/red for small positions, darker for large
- Totals row (bottom) and totals column (right)
- Click cell → popover with trade list (already partially built)
- Keyboard: arrow keys move between cells, Enter opens drill-down
- Header row: month labels with current benchmark price shown

---

## Recommendation 5: Audit Trail Component

Build a reusable timeline component that appears on every entity detail:

```html
<div class="audit-trail">
  <div class="audit-entry">
    <div class="audit-dot"></div>
    <div class="audit-line"></div>
    <div class="audit-content">
      <div class="audit-header">
        <span class="audit-user">j.cobley</span>
        <span class="audit-action">Created trade</span>
        <span class="audit-time">12 Apr 09:42</span>
      </div>
      <div class="audit-details">
        Direction: BUY | Volume: 3,200,000 MMBtu | Price: JKM + $0.50
      </div>
    </div>
  </div>
  <div class="audit-entry">
    <div class="audit-dot dot-amber"></div>
    <div class="audit-line"></div>
    <div class="audit-content">
      <div class="audit-header">
        <span class="audit-user">r.mehta</span>
        <span class="audit-action">Amended volume</span>
        <span class="audit-time">12 Apr 10:15</span>
      </div>
      <div class="audit-diff">
        <span class="diff-old">3,200,000</span> → <span class="diff-new">3,400,000</span> MMBtu
      </div>
      <div class="audit-reason">Tolerance adjustment per counterparty request</div>
    </div>
  </div>
</div>
```

Show on: trade detail (from blotter right-click → View), invoice detail, nomination detail.

---

## Recommendation 6: Brand the Product

Currently this feels like "a developer built some pages." To feel like "$1M software":

**Typography system (2 fonts only):**
- Inter 400/500/600/700 for all UI text
- JetBrains Mono 400/500/600 for all numbers, codes, references
- Type scale: 0.6875rem (labels), 0.8125rem (compact body), 0.875rem (body), 1.125rem (section titles), 1.5rem (page titles), 2rem (hero KPIs)

**Color system (constrained):**
- Primary gradient: indigo-600 (#4f46e5) → violet-600 (#7c3aed) — used for branding, CTAs, active states
- Surfaces: 5 tiers from canvas to overlay (from Theme D's shell.css)
- Semantic: green (buy/long/positive), red (sell/short/negative), amber (warning), blue (info/pending)
- That's it. No other colors. Constraint = coherence.

**Spacing:** 0.25rem base unit. Everything divisible by 0.25rem. No exceptions.

**Transitions:** 0.15s ease for hovers, 0.2s ease-out for panels/modals, 0.3s ease for page transitions.

**Logo/identity:** The indigo lightning bolt icon from Theme A + "Horizon" in Inter 700. Use consistently on sign-in, sidebar header, and favicon.

---

## Recommendation 7: Make the Demo Narrative-Driven

Don't present this as "here are 63 pages." Present it as a **story:**

**Demo script (15 minutes):**
1. **Sign in** (30s) — show the branded sign-in, set the quality expectation
2. **Dashboard as trader** (2min) — role selector on "Trader," show KPIs, position ladder, alerts, price ticker
3. **Quick entry** (2min) — enter a trade: B → Shell → 3.2M → JKM → +0.50 → Jun-26 → DES → Enter → Confirm. Show it appear in blotter with P&L calculated.
4. **Position impact** (1min) — show how the position ladder changed after the trade
5. **Switch to Operations** (1min) — role toggle, dashboard changes to show pending invoices, deadlines
6. **Invoice approval** (2min) — inline status edit, bulk approve 3 invoices
7. **Reconciliation** (2min) — show provisional vs final side-by-side with highlighted differences
8. **Nomination** (2min) — cascading form: select contract → cargo → vessel → ETA auto-calculates
9. **Settings** (30s) — show keyboard shortcuts reference, theme toggle

**That's 13 minutes of STORY, not "click around and explore."**

---

## Recommendation 8: Build a "Golden Path" Template

One new page that demonstrates the FULL trade lifecycle in a single scrollable view:

```
TRADE LIFECYCLE: BUY-2026-0411-A3F

[1. CAPTURE]     Created 12 Apr 09:42 by j.cobley
                 BUY 3,200,000 MMBtu JKM+$0.50 DES Jun-26 from Shell

[2. APPROVAL]    Approved 12 Apr 10:15 by r.mehta
                 Credit check: PASS ($22M headroom)
                 Position impact: JKM Jun-26 3.2M → 6.4M Long

[3. NOMINATION]  Nominated 15 Apr by s.kumar
                 Vessel: Al Dafna | Laycan: 1-15 Jun 2026
                 ETA Load: 3 Jun | ETA Discharge: 16 Jun

[4. LOADING]     Loaded 5 Jun — B/L qty: 3,198,450 MMBtu
                 Quality: GHV 1,048 BTU/scf (contract: 1,050)

[5. VOYAGE]      In transit → Sodegaura, Japan
                 BOG estimate: -1,550 MMBtu (0.048%)

[6. DISCHARGE]   Discharged 17 Jun — Outturn: 3,196,900 MMBtu
                 Transit loss: 1,550 MMBtu (within tolerance)

[7. SETTLEMENT]  Provisional invoice: $45,578,025
                 Final invoice: $45,453,862 (quality adj: -$124,163)
                 Status: PAID 15 Jul

[8. P&L]         Realized P&L: +$1,120,000
                 Attribution: Price +$892K | Quality -$124K | BOG -$48K | FX +$400K
```

This single page tells the entire story of what the system does. It's the most powerful demo page you could build.

---

## Final Scores (Blackthorn Digital)

| Dimension | Score | After Recommendations |
|-----------|-------|-----------------------|
| Innovation | 8.0/10 | 8.5/10 (golden path adds to it) |
| Design craft | 6.7/10 | 8.5/10 (brand + typography + states) |
| Code quality | 4.8/10 | 8.0/10 (shared shell + proper combobox) |
| Feature coverage | 7.3/10 | 8.5/10 (audit trail + lifecycle view) |
| Production readiness | 4.7/10 | 7.5/10 (states + safety + architecture) |
| **Overall** | **6.7/10** | **8.2/10** |

**Our honest assessment:** If you implement recommendations 1-6, this becomes the strongest ETRM UI we've evaluated. Recommendation 8 (golden path) would be genuinely unprecedented in the ETRM market. The 18-24 month competitive window your previous analyst identified is real — but only if you consolidate and ship, rather than continuing to build more themes.

---

*Blackthorn Digital*
*Katya Petrov, James Okonkwo, Mei-Lin Zhang*
*Marcus Chen, VP Design (Team Lead)*
