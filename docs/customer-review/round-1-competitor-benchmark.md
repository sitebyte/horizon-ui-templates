# Horizon ETRM -- Round 1 Competitor Benchmark

**Date:** 2026-04-11
**Analyst perspective:** Senior Energy Technology Analyst, 15+ ETRM platform evaluations
**Files reviewed:** 10 templates across theme-d, theme-e, theme-f

---

## Executive Summary

Horizon presents as the most modern-looking LNG ETRM I have evaluated. The UI quality surpasses Molecule, approaches Bloomberg Terminal density in the position ladder, and covers more of the LNG-specific workflow than most competitors attempt in their initial release. The role-adaptive dashboard is genuinely novel -- I have never seen an ETRM switch context by persona without a full page reload. The AG Grid integration is professionally done with proper status rendering, context menus, and column toggling.

However, there are meaningful gaps against incumbent platforms in trade lifecycle completeness, settlement depth, and the keyboard-first workflows that experienced traders demand. The issues below are solvable but several are blocking for a competitive demo.

---

## Feature-by-Feature Benchmark

### 1. Dashboard (index.html -- Role-Adaptive)

**Table stakes:** KPI cards (position, P&L, hedge ratio, trade count) -- present. Market alerts -- present. The operations view has pending action cards with counts, upcoming deadlines, cargo pipeline status bar, and activity timeline. The manager view has desk-level P&L, trader performance cards, hedge ratio bars by benchmark, and credit utilization bars by counterparty. All table stakes met.

**vs Bloomberg (7/10):** The scrolling price ticker is the right instinct -- Bloomberg's ticker bar is muscle memory for traders. JKM, TTF, HH, Brent, NBP all represented with green/red coloring and change values. The JetBrains Mono font choice for prices is excellent -- this is what traders expect. However, Bloomberg shows last update timestamps, bid/ask spreads, and volume. The ticker here is static CSS animation, not live data. A Bloomberg user would immediately notice prices are not updating.

**vs Allegro/Endur (8/10):** Allegro's dashboard is a configurable widget grid that takes 2-3 days to set up properly. Endur's is worse -- most users never leave the trade capture screen. Horizon's opinionated role-based layout is actually a selling point: "You get a useful dashboard on day one, not after a consultant configures it." The operations view with deadline tracking (ADP window closes, invoice due dates, vessel ETAs) is stronger than anything Allegro ships out of the box.

**vs Molecule (8/10):** Molecule's dashboard is clean but generic -- it looks like any SaaS analytics page. Horizon's LNG-specific content (cargo pipeline with Loaded/In Transit/Berthing/Pending states, nomination deadline tracking, JKM-TTF spread alerts) demonstrates domain expertise that Molecule cannot match. The role toggle (Trader/Operations/Manager) with instant content switching is a demo winner.

**Unique value (9/10):** The role-adaptive pattern is genuinely novel. I have not seen another ETRM where a trader, ops manager, and desk head each get a tailored view from the same URL. The market alerts panel with contextual intelligence ("JKM-TTF spread widened to $0.63 -- above 30d average", "JERA tender closes tomorrow") feels like it was written by a trader, not a product manager.

**Demo-readiness:** Strong. The role toggle is a showstopper moment in a demo. The only risk is a savvy evaluator asking "is the ticker live?" -- it obviously is not.

---

### 2. Quick Trade Entry (theme-f/quick-entry.html + theme-d/quick-entry.html)

**Table stakes:** Buy/Sell toggle, counterparty search with dropdown, volume, benchmark selector (JKM/TTF/HH/Brent/NBP), price, delivery month, submit button. Trade instantly appears in AG Grid blotter below. All present.

**vs Bloomberg (6/10):** Bloomberg's trade entry is keyboard-first: Tab through fields, type counterparty abbreviation, numeric keypad for price, Enter to submit, immediate confirmation. Theme-d nails this: B/S keyboard shortcuts, Tab ordering with explicit tabindex attributes, Enter to submit from any field, counterparty autocomplete with arrow-key navigation. Theme-f is mouse-heavier -- the B/S toggle requires clicking button elements, and counterparty selection relies on mousedown events. The theme-d implementation is closer to what a Bloomberg user expects.

**vs Allegro/Endur (7/10):** Allegro's "Quick Ticket" is faster for experienced users because it supports counterparty codes (SHL for Shell, JER for JERA) and remembers last-used values. Endur requires opening a full deal entry screen even for quick trades. Horizon's inline strip above the blotter is the right UX pattern. Missing: (a) counterparty short codes, (b) "repeat last trade" shortcut, (c) multi-leg entry for basis trades, (d) the trade does not auto-populate FOB/DES based on the counterparty's typical delivery terms.

**vs Molecule (8/10):** Molecule's trade entry is a modal form -- slower and more disruptive than Horizon's persistent strip. The inline quick entry with immediate grid population is better UX. Theme-d's volume field defaults to 3,200,000 MMBtu (a standard LNG cargo) -- this kind of domain-aware default is exactly what Molecule lacks.

**Unique value (7/10):** Theme-d's keyboard-first design with visible key hints (B/S labels on buttons, Enter symbol on Submit) is good but not unique. The auto-populated blotter with AG Grid is standard. No AI-assisted entry, no natural language trade capture, no duplicate detection.

**Demo-readiness:** Theme-d is demo-ready for front office users. Theme-f is demo-ready for a general audience. Neither would survive a head-to-head against a Bloomberg power user doing rapid trade entry -- the keyboard flow has gaps.

---

### 3. Trade Blotter (blotter.html)

**Table stakes:** AG Grid with sortable/filterable columns, trade ID, side (B/S with colored badges), counterparty, volume, benchmark, price, delivery, incoterm, type, portfolio, status (Confirmed/Pending/Cancelled with colored pills), trader initials, timestamp. Status filter pills (All/Confirmed/Pending/Cancelled). Quick search. CSV export. Column toggle panel. Right-click context menu (View, Amend, Cancel). All present and functioning.

**vs Bloomberg (7/10):** Bloomberg's TRAD function shows trades with real-time status updates, linkage to positions and P&L, and the ability to drill from any trade to its execution details, confirmation status, and settlement chain. Horizon's blotter has the right visual treatment but is an island -- clicking a trade does not navigate to a detail view, and there is no visible link to positions, invoices, or nominations. Bloomberg users expect everything to be cross-linked.

**vs Allegro/Endur (8/10):** Allegro's trade blotter is a Java thick client with AG Grid under the hood -- visually identical to what Horizon shows, but slower to load and harder to configure. Endur's blotter requires custom SQL views. Horizon wins on out-of-box usability. The column toggle panel is a nice touch -- Allegro requires admin configuration for this. Missing: (a) saved filter presets, (b) row grouping by portfolio/counterparty/benchmark, (c) inline editing beyond just viewing, (d) trade amendment audit trail visible from blotter.

**vs Molecule (9/10):** Molecule uses a basic React table with pagination. Horizon's AG Grid implementation is significantly more capable: pinned columns (trade ID), context menu, external status filtering, CSV export, column toggle panel, and proper dark mode theming. The 30-row dataset with realistic trade data (real counterparty names, realistic prices, proper timestamps) makes this feel production-ready.

**Unique value (6/10):** AG Grid blotter is table stakes for any modern ETRM. The implementation is clean but not differentiated. No AI features (anomaly highlighting, suggested groupings, natural language filtering).

**Demo-readiness:** Very strong. This is exactly what evaluators expect from an ETRM blotter, executed at a higher visual quality than most competitors. The right-click context menu with View/Amend/Cancel is a nice detail that shows awareness of real workflows.

---

### 4. Position Ladder (positions.html)

**Table stakes:** Matrix view with benchmarks (JKM, TTF, HH) as rows and delivery months (Jun through Nov 26) as columns. Each cell shows net volume with color coding (green for long, red for short) and P&L underneath. Net column per benchmark. Total row across all benchmarks. Click-to-drill-down showing underlying trades for any cell. All present.

**vs Bloomberg (7/10):** Bloomberg's PORT function shows positions with real-time MTM updates, Greeks for derivative positions, and scenario overlays. Horizon's position ladder has the right layout and density -- the color-coded cells with volume and P&L are immediately legible. The drill-down to underlying trades is well executed: clicking a cell opens a panel showing trade ID, side, counterparty, volume, price, and status. Missing: (a) no real-time price reference in the cells, (b) no WACOG display, (c) no sensitivity/delta column, (d) no P&L attribution (realized vs unrealized).

**vs Allegro/Endur (8/10):** Allegro's position view is the strongest feature of the platform -- hierarchical positions with drill-through to physical and paper trades, MTM calculation chain visibility, and hedge effectiveness analysis. Horizon matches the visual layout but lacks the calculation depth. Endur's position view requires custom Finder queries. Horizon wins on immediate usability. Missing: (a) physical vs paper position split, (b) hedge designation linkage, (c) position limit breach alerts in the grid itself.

**vs Molecule (9/10):** Molecule shows positions in a flat table with no matrix view. Horizon's benchmark-by-month matrix is the industry standard layout that LNG traders expect. The heat-map-style coloring (green/red backgrounds) with P&L subtotals is exactly right. Molecule cannot match this level of domain-specific visualization.

**Unique value (7/10):** The drill-down interaction is well done but not unique. The color density approach (lighter green/red for smaller positions, darker for larger) is not present -- all positive positions use the same green regardless of magnitude. A heat map intensity scale would be a differentiator.

**Demo-readiness:** This is a demo highlight. Any LNG trader will immediately recognize the position ladder pattern and feel at home. The drill-down is the right interaction. The visual quality is higher than Allegro's equivalent view.

---

### 5. Full Trade Form (trade-form.html)

**Table stakes:** Direction toggle (Buy/Sell), trade type (Physical, Paper Swap/Future/Option), incoterm (FOB/DES/DAP/CIF), counterparty search with credit limit and utilization display, pricing section with type toggle (Fixed/Oil-Indexed/Hub-Indexed/Hybrid) showing conditional fields (slope/constant for oil-indexed), volume with tolerance and unit, delivery section with loading and discharge port search with autocomplete, delivery window date range. Real-time position impact preview panel on the right showing current position, trade impact, new position, hedge ratio change, and credit impact. All present.

**vs Bloomberg (6/10):** Bloomberg does not have a comparable trade entry form -- trades are captured via chat/phone and booked by middle office. This is more comparable to Allegro/Endur's deal entry. The position impact preview is excellent and not something Bloomberg provides in the trade capture flow. However, Bloomberg-native users will expect price validation against live market data (is this price within the current bid-ask?) which is not present.

**vs Allegro/Endur (8/10):** Allegro's deal entry is a tabbed form with 6-8 tabs covering commercial terms, physical terms, pricing, scheduling, confirmations, and amendments. Endur's is similar but more cluttered. Horizon covers the core tabs (direction, counterparty, pricing, volume, delivery) in a single scrollable form with better visual organization. The conditional pricing fields (showing slope/constant for oil-indexed, showing fixed price for fixed, showing both for hybrid) demonstrate genuine understanding of LNG pricing structures. Missing: (a) quality specifications (GCV, CV, Wobbe Index), (b) BOG (boil-off gas) terms, (c) force majeure clauses, (d) confirmation template selection, (e) trade amendment mode (vs new entry only).

**vs Molecule (9/10):** Molecule's trade form is a generic form builder that does not understand commodity-specific pricing structures. Horizon's oil-indexed pricing with slope/constant/reference, hub-indexed with benchmark selection, and hybrid support is genuine LNG domain knowledge. The port autocomplete with 15 real LNG terminals is a strong detail. Molecule would require custom configuration to match this.

**Unique value (8/10):** The position impact preview panel is outstanding. Real-time visualization of how this trade changes your position, hedge ratio, and credit utilization -- before you submit -- is something I have not seen in any ETRM. This is a genuine innovation. Allegro requires running a separate position report after booking. This alone is a demo-winning feature.

**Demo-readiness:** Strong. The position impact preview will generate conversation in any demo. The conditional pricing fields demonstrate domain credibility. An experienced evaluator will ask about quality specs and BOG terms -- have an answer ready for "phase 2."

---

### 6. Invoice Queue (invoices.html)

**Table stakes:** AG Grid with invoice ID, counterparty, cargo reference, type (Provisional/Final), amount, issue date, due date, status (Pending/Approved/Overdue/Paid), trade reference. Status filtering pills. Checkbox multi-select with bulk approve. CSV export. Inline status editing via dropdown cell editor. All present.

**vs Bloomberg (N/A):** Bloomberg does not have invoice management. Not applicable.

**vs Allegro/Endur (6/10):** Allegro's invoice module is its weakest area -- most clients use a separate billing system. Endur's settlement module is comprehensive but has a terrible UI. Horizon's clean AG Grid presentation with inline status editing and bulk approval is better UX than either. However, the data model is thin: (a) no provisional-to-final invoice pairing, (b) no line item breakdown (volume * price = subtotal, adjustments, taxes), (c) no demurrage calculation, (d) no quality adjustment (B/L quantity vs outturn quantity), (e) no payment tracking with bank reference, (f) no credit note generation workflow. This is the largest functional gap in the entire template set.

**vs Molecule (7/10):** Molecule's invoice view is a basic table with manual status updates. Horizon's AG Grid with editable cells, bulk approve, and filtering is functionally superior. But both are thin on settlement depth.

**Unique value (5/10):** Nothing unique here. The inline cell editing for status changes is standard AG Grid functionality. The invoice data model needs significant enrichment for LNG settlement.

**Demo-readiness:** Risky. An operations or finance evaluator will immediately ask: "Where is the provisional-to-final reconciliation?" "How do I calculate demurrage?" "Where are the quality adjustments?" The reconciliation view partially addresses the first question, but the invoice queue alone does not tell a complete settlement story.

---

### 7. Nominations (nominations.html)

**Table stakes:** Cascading form: select contract -> cargoes populate -> select cargo -> volume and dates auto-fill -> vessel dropdown populates with capacity and ETA per port -> submit creates nomination. Nomination schedule table with ID, contract, cargo, volume, vessel, window, status (Submitted/Accepted/Loaded/Discharged), and deadline. All present.

**vs Bloomberg (N/A):** Bloomberg does not handle physical nominations.

**vs Allegro/Endur (7/10):** Allegro has a dedicated nomination module for pipeline gas but LNG nominations are typically managed in a separate scheduling system. Horizon's cascading form pattern (contract -> cargo -> vessel) with auto-populated ETA based on port is genuinely useful. The vessel data (Arctic Spirit 170k m3, LNG Pioneer 162k m3, Pacific Breeze 174k m3, Al Dafna 210k m3) with port-specific ETAs demonstrates understanding of the physical scheduling workflow. Missing: (a) ADP calendar visualization, (b) vessel schedule Gantt chart, (c) nomination amendment history, (d) counterparty notification workflow, (e) loading/discharge window conflict detection.

**vs Molecule (9/10):** Molecule does not have a nominations module. This is pure LNG-specific functionality that Molecule's generic commodity platform does not address. Horizon demonstrates clear vertical specialization.

**Unique value (8/10):** The cascading form with intelligent data population (vessel ETAs calculated per port, capacity display alongside vessel name) is well designed. Few ETRMs handle the contract -> cargo -> vessel -> nomination chain this cleanly. The port-specific ETA lookup is a genuinely useful feature for scheduling teams.

**Demo-readiness:** Good for operations persona demos. An operations manager would recognize this workflow immediately. Missing the Gantt-style visualization that would make it visually compelling alongside the form.

---

### 8. Reconciliation (reconciliation.html)

**Table stakes:** Side-by-side comparison of provisional vs final invoice for a specific cargo. Shows counterparty, cargo ID, volume, GCV, price, total value, loading date, vessel, and incoterm for both sides. Differences highlighted in amber with delta values (absolute and percentage). Delta summary cards (volume delta, GCV delta, value delta, tolerance check PASS/FAIL). Notes field. Approve/Flag for Review/Add Note actions. All present.

**vs Bloomberg (N/A):** Not applicable.

**vs Allegro/Endur (7/10):** Allegro handles reconciliation through a matching engine that compares multiple data sources. Horizon's visual side-by-side with amber highlighting of differences is more intuitive. The delta percentage display ("-130 MT / -0.20%") with tolerance check ("Within 1% tolerance -- eligible for auto-approval") is exactly how LNG operations teams think about this. Missing: (a) only shows one reconciliation at a time -- no queue/list of pending reconciliations, (b) no document upload (B/L, quality certificate, outturn report), (c) no multi-step approval workflow, (d) no automatic credit note generation on approval.

**vs Molecule (9/10):** Molecule does not have cargo-level reconciliation. This is pure LNG physical settlement functionality.

**Unique value (8/10):** The auto-approval tolerance check is a strong feature. The GCV (gross calorific value) comparison alongside volume comparison demonstrates that Horizon understands LNG quality-based settlement, not just quantity-based. This level of domain specificity is rare in an early-stage platform.

**Demo-readiness:** Strong for a single-cargo walkthrough. An evaluator will ask "how do I get to this view?" -- the answer needs to be from the invoice queue or a reconciliation work queue, which does not currently exist as a dedicated list view.

---

### 9. Front Office Quick Entry (theme-d/quick-entry.html)

**Table stakes:** Same as theme-f quick entry but with a terminal-aesthetic dark theme. JetBrains Mono throughout. Direction buttons with keyboard hints visible. Counterparty autocomplete with arrow key navigation. Volume defaults to 3,200,000 MMBtu (one standard LNG cargo). AG Grid blotter with row selection count in footer. All present.

**vs Bloomberg (8/10):** This is the closest thing to Bloomberg aesthetic in the entire template set. The dark background, monospace font, compact spacing, visible keyboard shortcuts, and information density all echo the Bloomberg Terminal experience. The counterparty search with arrow key + Enter selection is correct. The grid footer showing "15 trades / 0 selected" is a Bloomberg-style status bar. This would make a Bloomberg user feel immediately at home.

**vs Allegro/Endur (8/10):** Better than either for pure trade capture speed. The persistent quick entry strip above the blotter means zero context switching -- see your trades, enter new ones, see them appear. Allegro requires opening a separate Quick Ticket dialog.

**vs Molecule (9/10):** Molecule's trade entry is visually clean but functionally slower. Theme-d's keyboard-first design with auto-focus management (selecting counterparty auto-focuses volume field) is superior workflow design.

**Unique value (7/10):** The terminal aesthetic combined with modern web technology is well executed but has been done before (see: Koyfin, Terminal-style trading interfaces). The visible keyboard hints on buttons are a nice touch.

**Demo-readiness:** Excellent for front office demos. This is the template to show traders. Lead with this, not theme-f, when the audience is a trading desk.

---

### 10. Contract Wizard (theme-e/contracts.html)

**Table stakes:** 4-step wizard: (1) Contract Type & Parties with visual radio cards for SPA/MSA/Spot/Tender, seller/buyer selectors, date range; (2) Pricing Basis with hub-indexed/oil-indexed/fixed/hybrid conditional fields, benchmark, premium, averaging period, oil slope/constant; (3) Volume Terms with ACQ, min/max take-or-pay percentages, delivery terms (FOB/DES/CIF), cargo frequency; (4) Review summary with all selections displayed. Step indicator with active/completed/inactive states. All present.

**vs Bloomberg (N/A):** Bloomberg does not handle contract management.

**vs Allegro/Endur (7/10):** Allegro's contract setup is a multi-screen workflow that requires a consultant to configure correctly. Endur's is worse. Horizon's wizard pattern is more intuitive for first-time users. The visual radio cards for contract type (SPA/MSA/Spot/Tender) with icons and descriptions are excellent onboarding UX. The oil-indexed pricing fields (slope + constant + reference) and hub-indexed fields (benchmark + premium + averaging) show real LNG domain knowledge. Missing: (a) no take-or-pay calculation preview, (b) no ADP schedule template, (c) no clause library / general terms, (d) no version control for contract amendments.

**vs Molecule (9/10):** Molecule does not have a contract wizard. Contract setup is a flat form. Horizon's stepped approach with progressive disclosure and visual contract type selection is significantly better onboarding.

**Unique value (8/10):** The visual contract type cards are effective. The conditional pricing sections (switching between hub-indexed, oil-indexed, fixed, and hybrid) with appropriate fields for each type demonstrate genuine domain understanding. ACQ + min/max take percentages are LNG-specific terms that generic platforms do not include.

**Demo-readiness:** Strong. Walk through creating an SPA from scratch -- the 4-step flow tells a coherent story. The review step showing all selections is a natural "confirm and submit" moment. An evaluator will ask about take-or-pay clause enforcement -- have an answer ready.

---

## Consolidated Scores

| Feature Area | vs Bloomberg | vs Allegro | vs Molecule | Unique Value |
|---|---|---|---|---|
| Dashboard (Role-Adaptive) | 7 | 8 | 8 | 9 |
| Quick Entry (theme-f) | 6 | 7 | 8 | 7 |
| Blotter | 7 | 8 | 9 | 6 |
| Position Ladder | 7 | 8 | 9 | 7 |
| Full Trade Form | 6 | 8 | 9 | 8 |
| Invoice Queue | N/A | 6 | 7 | 5 |
| Nominations | N/A | 7 | 9 | 8 |
| Reconciliation | N/A | 7 | 9 | 8 |
| Quick Entry (theme-d) | 8 | 8 | 9 | 7 |
| Contract Wizard | N/A | 7 | 9 | 8 |
| **Average** | **6.8** | **7.4** | **8.6** | **7.3** |

**Summary:** Horizon comprehensively beats Molecule on every dimension. It matches or exceeds Allegro/Endur on UI quality and usability while lagging on functional depth. Against Bloomberg, it holds up well on visual density and layout but lacks the real-time data feel and keyboard workflow depth.

---

## Numbered Issues List

### Critical (Demo-Blocking)

**1. No trade detail/amendment view (Severity: Critical)**
Clicking a trade in the blotter does nothing. Every evaluator will click a trade and expect to see its full details, amendment history, and related objects (invoice, nomination, cargo). This is the single most important missing interaction.
*Recommendation:* Build a slide-out detail panel or navigate to a pre-populated trade form on row click. Show linked objects (cargo, invoice, nomination) as related records.

**2. Settlement model is too thin for LNG (Severity: Critical)**
The invoice queue shows amounts but no line item breakdown. LNG settlement requires: cargo quantity (B/L vs outturn), quality adjustment (GCV), pricing period, volume in MMBtu, unit price, subtotal, adjustments (heel gas, BOG, demurrage), taxes, total. Without line items, the invoice is just a number.
*Recommendation:* Add an invoice detail view with a line item table. Include at minimum: quantity (MT and MMBtu), unit price, subtotal, quality adjustment, and net amount. Reference the reconciliation view's data model -- it already has the right fields.

**3. No workflow state machine visible (Severity: Critical)**
Trades go from Pending to Confirmed to Cancelled with no visible workflow. LNG trades follow: Draft -> Pending Approval -> Approved -> Confirmed -> Executed -> Settled. Counterparty confirmation, internal approval, and compliance check steps are missing. An operations evaluator will immediately ask "where is the approval workflow?"
*Recommendation:* Add a status progression bar to the trade detail view. Show who approved, when, and any conditions. Even a simple timeline of status changes would suffice for an initial demo.

### High (Competitive Disadvantage)

**4. Ticker prices are static (Severity: High)**
The price ticker scrolls via CSS animation with hardcoded values. Any trader will notice within seconds that prices never change. This undermines the "real-time" narrative.
*Recommendation:* Add subtle JavaScript price variation (random walk within realistic ranges) every 3-5 seconds. Even simulated jitter makes the ticker feel alive. Better: connect to the actual websocket feed from the backend.

**5. No cross-linking between views (Severity: High)**
Trade T-1024 appears in the blotter, position ladder drill-down, and invoices -- but there are no hyperlinks between them. Clicking a trade reference in the invoice grid should navigate to the blotter filtered on that trade. Clicking a cargo in the nomination should navigate to the reconciliation view. Everything is siloed.
*Recommendation:* Make trade IDs, cargo IDs, and invoice IDs clickable links that navigate to the appropriate view with filters applied. This is the most impactful UX improvement for demonstrating an integrated platform.

**6. No saved views or filter presets in blotter (Severity: High)**
Every ETRM supports saved views ("My JKM Trades", "Pending Approvals", "This Week's Trades"). Allegro users will immediately ask for this.
*Recommendation:* Add a view selector dropdown above the blotter with 3-4 preset views. Allow saving current filter/sort/column state.

**7. Quick entry does not show position impact before submission (Severity: High)**
The full trade form has the position impact preview panel. The quick entry form does not. A trader entering a quick trade should see their position change before hitting Enter.
*Recommendation:* Add a compact position impact line below the quick entry strip: "Net JKM Jun position: +450k -> +515k" with color coding.

**8. No dark mode default for theme-f (Severity: High)**
Theme-f defaults to light mode. Every trading floor I have visited in the last 5 years uses dark mode. The dark mode exists (toggle works) but should be the default for trading personas.
*Recommendation:* Default to dark mode. Detect system preference with prefers-color-scheme. For a trading desk demo, always start dark.

### Medium (Polish Required)

**9. Position ladder lacks WACOG display (Severity: Medium)**
Weighted Average Cost of Gas is the single most important position metric after net volume. Every LNG trader tracks WACOG. It is not shown anywhere in the position ladder.
*Recommendation:* Add a WACOG row or column. Show WACOG alongside net position in the drill-down panel.

**10. No position limit enforcement visible (Severity: Medium)**
The dashboard shows credit limits by counterparty but no position limits by benchmark or tenor. Risk managers will ask "where are the position limits?"
*Recommendation:* Add limit lines to the position ladder. Show current position as a percentage of the limit. Color cells that approach or breach limits.

**11. Reconciliation has no queue/list view (Severity: Medium)**
The reconciliation page shows a single cargo comparison. There is no way to see all pending reconciliations or navigate between them. In production, there would be 10-20 cargo reconciliations per month.
*Recommendation:* Add a reconciliation list view (similar to the invoice queue) that shows all pending reconciliations with delta summaries. Click to open the side-by-side detail.

**12. Contract wizard has no document attachment (Severity: Medium)**
LNG contracts involve PDF documents (master agreement, annexes, side letters). The wizard captures commercial terms but has no place to attach or reference the legal document.
*Recommendation:* Add a document upload step or a document reference field in the review step.

**13. No multi-leg trade support (Severity: Medium)**
LNG trading frequently involves basis trades (buy JKM, sell TTF) and time spreads (buy Jun, sell Jul). The quick entry and trade form only support single-leg trades.
*Recommendation:* Add a "Leg 2" toggle in the trade form that reveals a second set of pricing/delivery fields linked to the first leg.

**14. Nomination form lacks conflict detection (Severity: Medium)**
If two nominations request the same vessel for overlapping windows, there is no warning. Scheduling conflicts are one of the most expensive operational errors in LNG.
*Recommendation:* When selecting a vessel, check against existing nominations and display a warning if the vessel is already assigned during the requested window.

### Low (Future Enhancement)

**15. No keyboard shortcut reference (Severity: Low)**
The Cmd+K command palette is excellent, but there is no visible list of keyboard shortcuts. Bloomberg publishes a keyboard map. Power users need this.
*Recommendation:* Add a "Keyboard Shortcuts" section to the command palette or settings page. Show all available shortcuts (B/S for side, Cmd+K for search, Escape to close).

**16. No audit trail visible in any view (Severity: Low)**
LNG trading is heavily regulated. Every change to a trade, invoice, or nomination should show who changed what, when. No audit information is visible in any template.
*Recommendation:* Add a "History" tab or collapsible section to the trade detail and invoice detail views. Show timestamp, user, field changed, old value, new value.

**17. Sidebar favorites are always empty (Severity: Low)**
The sidebar shows "No pinned items" under Favorites. This is a missed opportunity to show personalization.
*Recommendation:* Pre-populate with 2-3 favorites for the demo (e.g., "JKM Positions", "Pending Invoices").

**18. Notification badge counts are static (Severity: Low)**
The sidebar shows "3" on Invoice Queue and "2" on Nominations. These never change regardless of actions taken. After approving an invoice, the badge should decrement.
*Recommendation:* Wire badge counts to actual data state. When an invoice is approved, reduce the pending count.

**19. No print/PDF export for invoices or reconciliation (Severity: Low)**
Back office users will need to generate PDF invoices and reconciliation reports for counterparties and auditors.
*Recommendation:* Add "Export PDF" button to the reconciliation view and individual invoice detail.

**20. Theme-d and theme-e use different design systems (Severity: Low)**
Theme-d uses CSS custom properties with a terminal aesthetic. Theme-e uses Tailwind with a corporate blue palette. Theme-f uses Tailwind with an indigo/violet palette. For a demo, all views should use the same design system to avoid jarring transitions.
*Recommendation:* Consolidate on theme-f's design system for the demo. It has the best balance of visual quality and professional tone. Use theme-d's keyboard-first patterns within theme-f's visual framework.

---

## Demo Strategy Recommendation

**Lead with:** Dashboard role toggle -> Quick Entry (theme-d keyboard flow) -> Position Ladder drill-down -> Trade Form with position impact preview -> Reconciliation side-by-side.

**Avoid showing:** Invoice queue (too thin), settings page, anything that requires navigating between views without cross-links.

**Kill shots vs each competitor:**

- **vs Allegro:** "You get a useful dashboard on day one, not after 3 days of consultant configuration." Show the role toggle. Show the position impact preview in the trade form.
- **vs Endur:** "Every view is accessible in 2 clicks. No custom Finder queries required." Show the command palette. Show the cascading nomination form.
- **vs Molecule:** "We understand LNG. Oil-indexed pricing, GCV-based reconciliation, ADP nominations -- this is not a generic commodity platform." Show the contract wizard pricing section. Show the reconciliation GCV delta.
- **vs Bloomberg:** Do not compete on real-time data. Compete on workflow integration: "Bloomberg shows you the market. We show you the market and your position impact in the same view." Show the trade form with position preview.

---

## Overall Assessment

Horizon is in a strong position for an early-stage LNG ETRM. The UI quality exceeds every incumbent I have evaluated. The LNG domain knowledge embedded in the templates (oil-indexed pricing, GCV reconciliation, ADP nominations, take-or-pay terms) is genuine and would take a generic platform 12-18 months to replicate.

The critical gaps (trade detail view, settlement depth, workflow visibility) are all solvable with 2-4 weeks of focused development. The cross-linking issue (#5) is the highest-leverage fix -- it transforms the templates from a set of independent screens into an integrated platform.

**Bottom line:** This would survive a competitive demo today against Molecule. It would hold its own against Allegro/Endur on initial impression but would lose on follow-up questions about settlement depth and trade lifecycle. Fix issues #1, #2, #3, and #5, and it becomes genuinely competitive against the incumbents.
