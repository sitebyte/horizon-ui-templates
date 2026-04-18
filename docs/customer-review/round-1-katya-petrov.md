# Competitor Review: Horizon UI Templates
## Blackthorn Digital -- Confidential Client Advisory

**Reviewer:** Katya Petrov, Senior Design Consultant  
**Date:** 11 April 2026  
**Subject:** Evaluation of Horizon UI template library for LNG ETRM  
**Client:** LNG Trading House Consortium  
**Verdict:** Conditional pass with significant remediation required before production deployment  

---

## Executive Summary

I spent a full day in this codebase. I have designed two production ETRM front-ends (Trayport exchange platform redesign, Gunvor internal ETRM dashboard), and I have seen approximately thirty ETRM vendor demos in the past six years. My honest assessment: this is the most visually competent ETRM template I have evaluated from a non-established vendor. The domain knowledge is real -- they know what JKM is, they know what FOB/DES means, they know what a position ladder looks like. That alone puts them ahead of 80% of what crosses my desk.

But "visually competent template" is not "production trading system," and the gap between those two things is where my 23 numbered issues live.

The consortium should understand: what you are buying is a design direction, not software. The JavaScript is demo-grade. The workflows are incomplete. There is no error handling, no loading states, no accessibility, and no backend integration. If you are buying this as a starting point that your own engineers will rebuild in React, it has real value. If anyone is suggesting you deploy this, walk away.

---

## Detailed Findings

### CRITICAL (Would block go-live)

#### 1. XSS Vulnerability in Counterparty Dropdowns -- Theme F Quick Entry
**Severity:** Critical  
**File:** `theme-f/quick-entry.html`, line 391  

The counterparty dropdown in quick-entry uses string interpolation directly into `onmousedown` handlers:

```javascript
dd.innerHTML = filtered.map(c =>
  `<div ... onmousedown="selectCpty('${c}')">${c}</div>`
).join('');
```

If a counterparty name contains a single quote (e.g., `O'Brien Energy`), this breaks the handler. If it contains malicious content, it is a stored XSS vector. The blotter page has `escapeHtml()` -- the quick-entry page does not use it in the dropdown rendering. The trade form (`filterTfCpty`, `filterPort`) has the same issue. Theme D's quick-entry has it too (`renderCptyDd` uses unescaped template literals in `onmousedown`).

**Our approach:** All dynamic content rendered into DOM would go through a sanitization layer. In React (which this should become), JSX handles this natively. In vanilla JS, we would never use innerHTML with user-controlled strings -- `createElement` + `textContent` only.

#### 2. No Input Validation on Trade Submission -- Quick Entry
**Severity:** Critical  
**File:** `theme-f/quick-entry.html`, lines 406-426  

The `submitQuickTrade` function accepts any value for volume and price. There is a `formatVolume` function that does `parseInt(v.replace(/,/g,''))`, but:
- No minimum/maximum volume check (a trader could enter 1 MT or 999,999,999 MT)
- No price sanity check (a $0.001/MMBtu or $9999/MMBtu trade passes through)
- No check that the counterparty is from the approved list (freetext is accepted)
- The volume field is `type="text"` with no input mask -- "abc" becomes `NaN`, which becomes `0` via the `||0` fallback, and a zero-volume trade enters the blotter

The trade form page (`trade-form.html`) does have `validatePrice` and `validateVolume` functions, but the quick-entry page -- the one traders will use 50 times a day -- does not. This is a fundamental design error: the fast path has fewer guardrails than the slow path.

**Our approach:** Constrain, do not validate. Volume field would be a numeric input with min/max/step attributes. Price field would have a deviation check against current market rate. Counterparty would be select-only, never freetext. Invalid submissions would be impossible, not merely warned against.

#### 3. No Persistence, No Backend Contract
**Severity:** Critical  

Every page operates on hardcoded JavaScript arrays. The quick-entry `blotterData` array, the blotter `tradeData` array, the position `positions` object, and the invoice `invData` array are all static. A trade entered in quick-entry does not appear in the blotter. A position shown in the position ladder does not reflect the trades in the blotter.

This is expected for a template library, but it means there is zero evidence that the data structures will survive contact with a real API. The blotter has 24 rows -- can it handle 10,000? 50,000? AG Grid can, but will their `updateTotalPnl` function that calls `forEachNodeAfterFilter` perform acceptably at scale?

**Our approach:** Even in a template, we would include a mock API layer (MSW or a simple fetch wrapper returning static JSON) so the data contract is visible and the loading/error paths are exercised.

#### 4. No Loading, Empty, or Error States Anywhere
**Severity:** Critical  

Zero pages show a loading skeleton. Zero pages show an empty state ("No trades yet"). Zero pages show an error banner. Zero pages handle API failure. The position ladder assumes `positions[bench][month]` always has data. The blotter assumes `rowData` is always a valid array. The invoices page assumes `invData` is never empty.

A real ETRM system spends significant time in transitional states: waiting for curve data, waiting for AIS position updates, waiting for settlement confirmations. A template library that ignores these states is not demonstrating the hard part of ETRM UI design -- it is demonstrating the easy part.

**Our approach:** Every data-driven component would have three states: loading (skeleton), empty (helpful message + CTA), error (retry button + error detail). This is table stakes for enterprise UI.

---

### HIGH (Would cause significant user friction)

#### 5. Combobox Keyboard Navigation is Broken -- Theme F
**Severity:** High  
**File:** `theme-f/quick-entry.html`, `trade-form.html`  

The counterparty search in Theme F's quick-entry uses `oninput` to filter and `onblur` with a 150ms timeout to close. But there is no arrow-key navigation, no highlighted-item tracking, no Enter-to-select. Compare with Theme D's quick-entry (`theme-d/quick-entry.html`, lines 225-237), which has proper `ArrowDown`, `ArrowUp`, `Enter`, and `Escape` handling with a `cptyHighlight` index.

Theme F, which is the recommended production base, has WORSE keyboard support than Theme D. A trader Tab-ing through the quick-entry strip will hit the counterparty field, type a name, and then have to reach for the mouse to select from the dropdown. That is a workflow-breaking regression from Theme D.

**Our approach:** Use a proper combobox pattern (ARIA 1.2 combobox). Arrow keys navigate, Enter selects, Escape closes, Tab accepts current selection and moves forward. This is non-negotiable for any field a trader touches 50+ times per day.

#### 6. Confirmation Step Bypasses Pre-Trade Checks
**Severity:** High  
**File:** `theme-f/quick-entry.html`, lines 253-265  

The confirmation bar shows a text summary: "BUY 65,000 MT JKM +$12.45 Jun 26 FOB from Shell." This is good -- they added it based on reviewer feedback. But it lacks:
- Position impact (what will my position be after this trade?)
- Credit impact (does Shell have headroom for this?)
- Margin/collateral impact
- Any comparison to current market price (is $12.45 in-line or an outlier?)

The trade form page has a "Position Impact Preview" panel that does some of this, but the quick-entry page -- again, the primary trading interface -- does not. The confirmation bar is cosmetic rather than functional.

**Our approach:** The confirmation step would show a mini position-impact card: current position, post-trade position, credit utilization change, and a price deviation indicator (green/amber/red vs. current benchmark). If any threshold is breached, the Confirm button would require an override reason.

#### 7. Invoice Bulk Approval Has No Four-Eyes Principle
**Severity:** High  
**File:** `theme-f/invoices.html`, lines 171-178  

The `bulkApprove` function selects all checked rows with status "Pending" and changes them to "Approved" in a single click. There is:
- No check that the approver is different from the creator
- No approval threshold (a $10M invoice gets the same one-click approval as a $10K invoice)
- No audit trail of who approved and when
- No approval comment/reason
- No second-level approval for amounts above a threshold

In LNG trading, a single cargo invoice can be $30-50M. The idea that this gets one-click bulk-approved with zero controls is operationally unacceptable.

**Our approach:** Four-eyes enforced at the system level: creator cannot approve. Tiered approval thresholds ($1M: one approver; $10M: two approvers; $25M+: treasury sign-off). Every approval records who, when, and optionally why.

#### 8. Position Ladder Missing WACOG and Physical/Paper Split
**Severity:** High  
**File:** `theme-f/positions.html`, lines 239-274  

The position ladder shows volume and P&L per benchmark per month. But a real position ladder needs:
- WACOG (Weighted Average Cost of Gas) per cell -- this is how traders evaluate whether to add to a position
- Physical vs. paper breakdown -- a +450k MT position that is 400k physical and 50k paper has very different risk characteristics than one that is all paper
- Hedge ratio per row
- MTM vs. realized P&L distinction

The resume acknowledges this gap ("Week 2 Fixes" includes WACOG), but as delivered, the position ladder is presentational rather than analytical.

**Our approach:** Each cell in the position ladder would be a micro-card showing: volume (physical/paper split), WACOG, MTM, and hedge ratio. Clicking a cell would show the underlying trades (this they do have, and it works well).

#### 9. No Audit Trail on Any Entity
**Severity:** High  

Trades, invoices, nominations, reconciliations -- none of them show a history panel. There is no "who changed what when" visible anywhere. The reconciliation page (Theme E) has an "Approve" button and a "Flag for Review" button, but no indication of who previously flagged, reviewed, or modified the record.

In regulated commodity trading, audit trail is not a feature -- it is a compliance requirement. Every field change, every status transition, every approval must be recorded with timestamp, user, old value, and new value.

**Our approach:** Every entity detail view would have a collapsible "History" panel showing a chronological list of mutations. Each entry: timestamp, user, field changed, old value, new value, and an optional comment.

---

### MEDIUM (Quality gaps a buyer should negotiate on)

#### 10. 230+ Lines of Shell Code Duplicated Across Every Theme F Page
**Severity:** Medium  

Every Theme F page contains an identical sidebar (~100 lines), header (~30 lines), ticker (~20 lines), command palette (~50 lines), theme toggle (~10 lines), and toast (~10 lines). This is ~230 lines copy-pasted 11 times. A typo fix to the sidebar requires editing 11 files.

Theme D solved this with `shell.js` and `shell.css` -- a shared shell that gets injected. Theme F, the supposedly more mature theme, regressed to copy-paste.

**Our approach:** For the template stage, a shared `shell.html` fragment loaded via `fetch()` + `insertAdjacentHTML`. For production, React layout components.

#### 11. AG Grid Configuration Is Inconsistent Across Pages
**Severity:** Medium  

- Quick-entry blotter: no `getRowId` (will break transaction updates on sort/filter changes)
- Full blotter: has `getRowId` using `params.data.id`
- Invoice grid: no `getRowId`
- Quick-entry: `rowSelection: 'single'`; Invoices: `rowSelection: 'multiple'` (correct for bulk ops)
- Quick-entry: `suppressCellFocus: true`; Invoices: `suppressCellFocus: false` -- inconsistent and the invoice grid needs keyboard cell navigation for status editing
- Blotter has null-safe valueFormatters (`p.value != null`); quick-entry blotter does not (`p.value.toFixed(2)` will throw on null)

**Our approach:** A shared AG Grid configuration factory that sets consistent defaults (getRowId, null-safe formatters, consistent row height, consistent selection mode per page type).

#### 12. MTM/P&L Calculation Uses Hardcoded Benchmark Prices
**Severity:** Medium  
**File:** `theme-f/blotter.html`, line 193  

```javascript
const benchmarkPrices = {JKM: 14.60, TTF: 12.65, HH: 3.55, Brent: 82.40};
```

Meanwhile, the ticker shows JKM at $12.45 and the trade data has JKM prices around $12.33-$12.55. The MTM column uses $14.60 -- a $2+ deviation from the price shown in the ticker and the trade data. Every MTM value displayed is therefore misleading. This is exactly the kind of inconsistency that destroys trader trust in a platform.

**Our approach:** One source of truth for benchmark prices. Even in a template, the ticker data and the calculation data should come from the same JavaScript object.

#### 13. Reconciliation Page (Theme E) Is a Static Comparison, Not a Workflow
**Severity:** Medium  
**File:** `theme-e/reconciliation.html`  

The reconciliation page shows a clean side-by-side of provisional vs. final invoice. The amber highlighting on differences is well done. But:
- It shows a single hardcoded reconciliation (INV-2026-0042). There is no list/queue of reconciliations to process.
- The "Approve Reconciliation" button calls `showToast('Reconciliation approved successfully')` and does nothing else.
- There is no tolerance configuration (the 1% threshold mentioned in the UI is not enforced in code).
- No ability to partially accept/reject line items.
- No workflow state machine (Pending -> In Review -> Approved/Rejected/Escalated).

For an operations team processing 200 invoices per month, this page shows the concept but not the workflow.

**Our approach:** A reconciliation queue (AG Grid) showing all pending reconciliations, sortable by delta size. Clicking a row opens the side-by-side comparison. Each line item can be individually accepted, rejected, or flagged. Tolerance bands are configurable per counterparty. State machine enforced.

#### 14. Price Ticker Is Static and Misleading
**Severity:** Medium  

The ticker shows JKM Jun at $12.45. This value is hardcoded in HTML, the same across every page, and never changes. In an ETRM context, a static ticker is worse than no ticker -- it gives the impression of live data where there is none.

The ticker also uses a CSS animation for scrolling (`ticker-scroll` at 30 seconds), which means a trader scanning for a specific price has to wait for it to scroll past. Bloomberg Terminal solves this with a static multi-line ticker that shows all key prices simultaneously.

**Our approach:** If the data is not live, do not show a ticker. Show a static "Market Snapshot" card with "as of" timestamp. When live data is available, use a WebSocket-driven static grid, not a scrolling marquee.

#### 15. Command Palette (Cmd+K) Has No Arrow-Key Navigation
**Severity:** Medium  

The command palette filters results on text input, but there is no keyboard navigation of results. A user must mouse-click to select a result. In a keyboard-first trading UI, every modal/palette should support Up/Down/Enter navigation. Theme D has this for counterparty search; Theme F does not have it for the most prominent keyboard feature.

**Our approach:** Cmd+K results get a `highlightedIndex` state. ArrowDown/ArrowUp cycle through visible results. Enter activates the highlighted result. This is a solved pattern (VSCode, Raycast, Linear all do this).

#### 16. Trade Form Submit Does Not Collect Form Data
**Severity:** Medium  
**File:** `theme-f/trade-form.html`, lines 358-365  

The `submitTrade` function checks if counterparty is filled, then calls `showToast('Trade submitted successfully')`. It does not read or validate any other field (price, volume, benchmark, delivery dates, ports, pricing type). The form has inline validation functions (`validatePrice`, `validateVolume`, `validateDates`) that are wired to `onblur`, but submit does not call any of them.

This means a trader can submit a trade form with an invalid price, zero volume, and reversed dates, and the system will say "submitted successfully."

**Our approach:** The submit handler would call all validation functions, collect all form values into a structured object, and only proceed if all validations pass. A pre-submission summary panel would show the complete trade for review.

---

### LOW (Polish items, nice-to-haves)

#### 17. No Responsive Behavior Below 1024px
**Severity:** Low  

The sidebar is a fixed 15rem element. On mobile/tablet, it overlaps the content. There is no hamburger menu, no overlay behavior, no responsive breakpoint. Theme E handles this with `@media (max-width: 768px)` and a toggle button. Theme F does not.

For a trading platform this matters less (traders use multi-monitor desks), but for operations staff on tablets during vessel inspections, it matters.

#### 18. Dark Mode Toggling Does Not Update AG Grid Theme Consistently
**Severity:** Low  

The blotter page and invoice page call `applyGridTheme()` on theme toggle. The quick-entry page also calls it. But the position ladder page and the trade form page do not call any grid theme update (positions uses a custom HTML table, not AG Grid). The inconsistency means toggling dark mode on the quick-entry page properly updates the grid, but the theme class approach varies.

#### 19. Accessibility Is Not Addressed
**Severity:** Low  

No ARIA labels on any interactive element. No role attributes on the sidebar navigation. No aria-expanded on accordion buttons. No aria-live on the toast notifications. No focus management after modal open/close. No skip-to-content link. Color contrast on some slate-400-on-white text elements may fail WCAG AA.

For a production ETRM, this would need remediation to meet corporate accessibility requirements (many trading houses have these as procurement requirements).

#### 20. Trade ID Generation Is Not Robust
**Severity:** Low  
**File:** `theme-f/quick-entry.html`, line 405  

`tradeIdCounter = 1016` and increments sequentially. If the page is refreshed, it resets to 1016. Theme D generates random IDs (`'T-2026-' + String(Math.floor(Math.random() * 9000) + 1000)`), which avoids duplication but is not sequential. Neither approach is production-viable, but the quick-entry approach will generate duplicate IDs on page reload.

#### 21. Undo Mechanism Has Race Conditions
**Severity:** Low  
**File:** `theme-f/quick-entry.html`, lines 450-473  

The undo function removes the last trade from the grid and restores form values. But if a trader enters two trades rapidly (Trade A, then Trade B within 5 seconds), undoing Trade B also decrements `tradeIdCounter`, which means the next trade will get Trade B's ID. The `lastAddedTrade` variable only holds one reference, so Trade A becomes un-undoable the moment Trade B is confirmed.

#### 22. Port Search in Trade Form Allows Freetext
**Severity:** Low  
**File:** `theme-f/trade-form.html`, line 332  

The port search is a text input with a dropdown suggestion list. But the user can type any freetext and submit -- "asdfgh" is accepted as a valid loading port. Ports should be constrained to the known list.

#### 23. Tailwind CDN in Production
**Severity:** Low  

All pages load `https://cdn.tailwindcss.com`, which is the Tailwind Play CDN explicitly marked "for development only." The AG Grid CDN references are also not pinned to SRI hashes. For a production financial application, all assets must be bundled, version-pinned, and integrity-checked.

---

## Summary Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| **Domain Accuracy** | 8/10 | Correct LNG terminology, realistic counterparties, proper benchmark coverage. Missing WACOG, BOG calculations, quality specs in positions. |
| **Visual Design** | 8.5/10 | Best-in-class for ETRM templates. Clean, professional, appropriate information density. Dark mode is well-executed. |
| **Trader Usability** | 5/10 | Quick entry has right shape but broken keyboard flow. No input constraints. No pre-trade impact preview. Confirmation step is cosmetic. |
| **Operations Usability** | 4/10 | Invoice queue exists but has no controls. Reconciliation is a static mockup. No audit trail. No four-eyes. No workflow state machine. |
| **Code Quality** | 4/10 | XSS vectors. No error handling. Duplicated shell. Inconsistent AG Grid config. Hardcoded data with no API abstraction. |
| **Production Readiness** | 2/10 | CDN dependencies. No build process. No tests (they claim Playwright but it tests rendering, not functionality). No accessibility. No loading/error states. |
| **Architecture** | 5/10 | Theme D's shell.js pattern is correct but not used in Theme F. AG Grid is well-chosen. Tailwind is appropriate. Vanilla JS will not scale -- needs React. |
| **Overall** | 5.5/10 | Strong design direction with significant engineering gaps. |

---

## What We Would Steal

I believe in being honest about good work, and there are patterns here that are genuinely better than what we have built for clients:

### 1. Role-Adaptive Dashboard (Theme F index.html)
The role selector that switches between Trader/Operations/Manager views on the same dashboard is an excellent pattern. We have built role-based routing (different URLs per role), but the in-page toggle is better for managers who need to context-switch quickly. The content for each role is well-chosen: traders see positions and market alerts, ops sees deadlines and pending actions, managers see team P&L and risk summary. We would adopt this pattern.

### 2. Position Ladder Drill-Down (Theme F positions.html)
Clicking a cell in the position matrix to see underlying trades is a clean implementation of progressive disclosure. The cell shows volume and P&L at a glance; the drill-down shows individual trade IDs, counterparties, and statuses. This is exactly the right interaction model for a position ladder. We would use this approach (probably with a slide-over panel rather than an inline expansion).

### 3. Reconciliation Side-by-Side with Diff Highlighting (Theme E reconciliation.html)
The provisional-vs-final comparison with amber left-border highlighting on changed fields is clear and scannable. The percentage tolerance indicator ("Within tolerance < 1% -- eligible for auto-approval") is operationally useful. We would adopt this visual pattern for our reconciliation module, though we would build it as a proper queue workflow.

### 4. Quick-Entry Confirmation Bar (Theme F quick-entry.html)
The pattern of Enter-to-show-confirmation, then Enter-to-confirm or Escape-to-cancel, with a 5-second undo window after commit -- this is thoughtfully designed. It balances speed (two keystrokes to enter a trade) with safety (chance to review before commit, chance to undo after). We have not implemented undo in our trading UIs and we should.

### 5. AG Grid Blotter with MTM/P&L Columns (Theme F blotter.html)
The calculated columns for MTM and Unrealized P&L with real-time total in the header, color-coded positive/negative, and proper null-safety with `escapeHtml()` -- this is a well-implemented trading blotter. The column toggle panel and CSV export are practical features. The context menu (View/Amend/Cancel) is the right set of actions.

### 6. Trade Form Position Impact Preview (Theme F trade-form.html)
The right-panel sticky card that shows current position, trade impact, new position, hedge ratio change, and credit impact -- updated live as the trader fills in the form -- is exactly what we recommend in our "show consequences before commitment" principle. We would make it more prominent and add it to quick-entry as well.

---

## Recommendation to Consortium

**Buy decision:** Conditional YES, with the following terms:

1. **Buy as design IP, not as code.** The visual design, domain patterns, and interaction concepts have value. The JavaScript implementation should be discarded and rebuilt in React by your own engineering team.

2. **Negotiate the price down 30-40%.** The resume admits multiple critical issues that remain unfixed (WACOG, combobox keyboard navigation, loading states). The "Week 2 Fixes" and "Week 3 Fixes" are documented but not delivered.

3. **Require Theme D's keyboard patterns be merged into Theme F.** Theme D's counterparty combobox with arrow-key navigation, its shell.js architecture, and its keyboard shortcut system are strictly better than Theme F's equivalents. This merge is listed as a "Longer Term" task but should be a delivery condition.

4. **Do not accept delivery until:** loading/empty/error states are demonstrated on at least 3 pages, the XSS vectors are closed, and the quick-entry page has input constraints matching the trade form.

5. **Budget for 12-16 weeks of engineering** to convert these templates into a production React application with proper state management, API integration, error handling, and accessibility.

---

*Katya Petrov*  
*Senior Design Consultant, Blackthorn Digital*  
*katya.petrov@blackthorndigital.com*
