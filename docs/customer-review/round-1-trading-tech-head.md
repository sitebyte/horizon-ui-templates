# Round 1 Review: Head of Trading Technology

**Reviewer**: 15 years implementing ETRM systems (Bloomberg, Allegro, Endur, ION). Managing 12 developers. Authorized for $500K-$2M software purchases.

**Date**: 2026-04-11

**Scope**: Themes D, E, F — 28 pages across front office, back office, and unified ETRM prototypes. Plus the hub page.

---

## Executive Summary

This is the most promising ETRM UI prototype I have seen from a team this size. Theme F's unified approach — one shell, role-adaptive views, keyboard-first with AG Grid — is genuinely competitive with what Allegro and ION ship today, and in some areas ahead of them. The domain knowledge embedded in these prototypes (BOG allowances on reconciliation, ADP nomination windows, JKM/TTF/HH benchmark coverage, custody transfer concepts) tells me this was built by someone who actually understands LNG trading, not a generic "enterprise dashboard" template factory.

That said, there are specific issues that would prevent me from proceeding to a paid pilot without resolution. Nothing here is unfixable, but some items are structural.

**Overall Score: 7.4 / 10** — Strong enough to warrant a second meeting. Not yet strong enough for a signed LOI.

---

## Page-by-Page Review

### 1. Theme F — Dashboard (index.html)
**Score: 8/10**

**First impression (2 seconds):** Professional. The scrolling price ticker, role selector (Trader/Operations/Manager), and KPI cards immediately communicate "this was built for energy traders." The indigo-to-violet gradient branding is distinctive without being distracting.

**Product coherence:** Excellent. The sidebar with multi-level navigation (Trading, Operations, Settlement, Admin sections), collapsible accordion menus, badge counts on Nominations and Invoices — this feels like a real product, not a demo page. The role-switcher in the sidebar that also has a redundant toggle in the main content area is a thoughtful touch — it means a manager can peek at the trader view without changing their sidebar context.

**Enterprise readiness:** The three role-specific dashboards are exactly right:
- **Trader view**: Position ladder (JKM/TTF/HH by month), P&L MTD, hedge ratio with progress bar, market alerts. This is what a trader needs at 7am before London opens.
- **Operations view**: Pending action cards (3 invoices, 2 nominations, 1 validation), upcoming deadlines with actual dates (ADP window closes 14 Apr), cargo pipeline visualization, activity timeline. My ops team would actually use this.
- **Manager view**: P&L summary with budget comparison (+7.7% vs $6.5M budget), team cards (Alex Kim Pacific Desk, Sarah Mitchell Atlantic Desk, Raj Patel Middle East Desk), risk summary with hedge ratios by benchmark and credit utilization by counterparty. This is what I present to the CEO on Monday mornings.

**Competitive comparison:** Better than Allegro's default dashboard (which is a customizable widget grid that nobody customizes). On par with Bloomberg BVAL for information density. Endur does not have role-based dashboards at all — you get the same view whether you're a trader or a settlements clerk.

**Deal-breakers:** None on this page.

**Differentiators:** The role-adaptive dashboard is genuinely novel. No ETRM I have used ships with this. The market alerts panel that combines spread analysis ("JKM-TTF spread widened to $0.63") with credit monitoring ("Credit limit utilization at 62% for Shell") and market intelligence ("Freeport LNG output at 95% capacity") is the kind of cross-domain insight that usually requires three separate screens.

**Top improvement:** The position ladder should be clickable — drilling into a cell like "JKM Jun +450k" should open a filtered blotter showing every trade contributing to that position. The data is right there; the interaction is missing.

---

### 2. Theme F — Blotter (blotter.html)
**Score: 8/10**

**First impression (2 seconds):** A proper AG Grid blotter with 24 trades, column toggles, status filtering, CSV export, and right-click context menu. This is what my traders expect.

**Product coherence:** Shares the same sidebar, ticker, Cmd+K palette, and visual language as the dashboard. Navigation between pages is seamless. The breadcrumb trail (Horizon > Blotter) confirms where you are.

**Enterprise readiness:** Strong fundamentals. 13 columns (Trade ID, Side, Counterparty, Volume, Benchmark, Price, Delivery, Incoterm, Type, Portfolio, Status, Trader, Timestamp) with pinned ID column, monospace numerics, and Buy/Sell badges using green/red color coding. The column toggle panel is a power-user feature that Allegro charges extra for. Status filter pills (All/Confirmed/Pending/Cancelled) work correctly. Right-click context menu with View/Amend/Cancel is the right pattern.

**Competitive comparison:** Equal to Allegro's blotter. Better than Endur's, which still renders in Java Swing on some installations. Bloomberg TOMS has denser grids, but worse usability. ION's Openlink blotter is comparable but slower.

**Deal-breakers:** No multi-select for bulk operations. In a real environment, I need to select 15 trades and mark them all "Confirmed" in one click. Single-row selection only is a limitation.

**Differentiators:** The combination of AG Grid + column toggles + context menu + status filters in a single view is well-integrated. Most ETRMs have these features but they feel bolted on. Here they feel native.

**Top improvement:** Add multi-row selection with a bulk action bar (like the invoice page has). Also: row grouping by Portfolio or Benchmark would be essential — "show me all JKM trades grouped by delivery month."

---

### 3. Theme F — Quick Entry (quick-entry.html)
**Score: 8.5/10**

**First impression (2 seconds):** A compact trade entry strip at the top with a live blotter below. Buy/Sell toggle, counterparty autocomplete, volume, benchmark dropdown, price, delivery month, and an "Enter Trade" button. This is designed for speed.

**Product coherence:** Same shell as the rest of Theme F. The quick entry strip feeds directly into the blotter below — submit a trade and it appears at the top of the grid. This is exactly the workflow pattern traders need.

**Enterprise readiness:** The keyboard shortcut design is excellent: press B or S (when not in an input field) to toggle Buy/Sell. Tab through fields, Enter to submit. This is how Bloomberg Terminal entry works, and traders expect it. The counterparty autocomplete searches through real LNG counterparties (Shell, JERA, QatarEnergy, Cheniere, Petronas, etc.). The benchmark dropdown covers JKM, TTF, HH, Brent, NBP — the correct set for LNG.

**Competitive comparison:** This is better than Allegro's trade entry, which requires a full-screen modal with 30+ fields. Bloomberg TOMS's Quick Entry is comparable but denser. Endur does not have a quick entry mode — every trade goes through the full capture form. This page gives you BOTH: quick entry for speed, plus a link to the full trade form for complex deals.

**Deal-breakers:** None. This is the strongest page in the library.

**Differentiators:** The "entry strip + live blotter" pattern is how modern trading UIs should work. The B/S keyboard toggle is a small detail that signals the developer understands trader workflows. No incumbent ETRM has this level of keyboard-first design for LNG specifically.

**Top improvement:** Add a confirmation step or undo — a mistyped $12.45 vs $14.25 on a 65,000 MT trade is a $117M error. A 3-second "Undo" toast after submission would be critical.

---

### 4. Theme D — Front Office Dashboard (index.html)
**Score: 7/10**

**First impression (2 seconds):** Dark, monospace, ultra-compact. JetBrains Mono font, cyan accent on pure black. This screams "trading terminal." The KPI row (Net Position +2.4M, Unrealized P&L +$1.82M, Hedge Ratio 87%, Trades Today 14, Cargoes Active 6, Credit Util 62%) is immediately scannable.

**Product coherence:** This is a standalone front-office theme — different shell (shell.css + shell.js) from Theme F. It shares no code with Themes E or F. This is a problem for product coherence: if this is a separate product, fine. If it is meant to coexist with the back office theme, the visual disconnect is jarring.

**Enterprise readiness:** The information density is correct for a front office. The position ladder (JKM/TTF/HH by month with green/red cell coloring) is immediately readable. The alert panel with color-coded severity (red for credit breach, amber for position limit, green for trade confirmation) is well-designed. P&L attribution (Price moves +$1.06M, New trades +$0.64M, Settlements +$0.18M, FX impact -$0.06M) is a view that typically lives in a separate risk system — having it on the dashboard is impressive. The cargo pipeline stacked bar (Plan 3, Nom 2, Load 1, Transit 4, Disch 1) gives instant logistics context. Hedge coverage by quarter (Q2-26 92%, Q3-26 68%, Q4-26 31%, Q1-27 8%) shows exactly where the exposure gaps are.

**Competitive comparison:** The visual density is comparable to Bloomberg TOMS. Better than Allegro or Endur for at-a-glance trading overview. The monospace font is polarizing — some traders love it, some find it fatiguing over 12-hour sessions.

**Deal-breakers:** Volume units are inconsistent. The KPI shows "+2.4M" (presumably MMBtu), the position ladder shows "+800K" and "+1.2M" (also MMBtu?), but the recent trades table shows volumes as "3,200,000" (raw numbers without units). LNG trades in MMBtu, MT, and TBtu depending on the market. If I cannot trust the units, I cannot trust the system.

**Differentiators:** The P&L attribution breakdown is unique — I have not seen this as a dashboard widget in any ETRM. The hedge coverage by quarter visualization is also unusual for a dashboard view; most systems bury this in a report.

**Top improvement:** Add explicit unit labels everywhere. Every number that represents a physical quantity must have its unit (MMBtu, MT, $/MMBtu). No exceptions.

---

### 5. Theme E — Invoice Queue (invoices.html)
**Score: 7.5/10**

**First impression (2 seconds):** Clean back-office view. AG Grid with inline status editing, filter pills (All/Pending/Approved/Overdue), search bar, CSV export. The bulk action bar at the bottom for multi-select approve/export is exactly right.

**Product coherence:** Theme E has its own sidebar with "Back Office" branding, separate navigation structure (Settlement > Invoice Queue, Reconciliation, Demurrage, Quality Adjustments, Payment Tracking; Operations > Nominations, Contract Management; Reporting > Daily P&L, Position Report, Audit Log). This is a complete back-office application in its own right. The Cmd+K command palette is a nice touch for power users.

**Enterprise readiness:** The AG Grid setup is production-grade: checkbox multi-select, inline status editing via dropdown (Draft/Issued/Pending/Approved/Paid/Disputed), action buttons (Approve/Reject) directly in each row, column sorting and filtering. The invoice amounts ($27.5M-$62.3M) are realistic LNG invoice sizes. The counterparty names (Shell Western LNG, QatarEnergy, JERA Trading, TotalEnergies Gas) are accurate. The bulk approve flow (select multiple rows, click "Bulk Approve" in the floating action bar) is how real settlement teams work.

**Competitive comparison:** Better than Allegro's settlement module, which requires clicking into each invoice individually. On par with ION's Openlink for bulk operations. The inline status editing in the grid is a feature that Endur charges for as an add-on.

**Deal-breakers:** No audit trail visible. When I change an invoice status from "Pending" to "Approved," there is no record of who did it, when, or why. In a regulated trading environment, this is a compliance failure. The sidebar links to an "Audit Log" page, so the infrastructure exists — but the connection between action and audit record must be visible at the point of action.

**Differentiators:** The overdue filter logic (due date before today AND status not in Paid/Approved) is a smart domain-specific filter. The inline editing + bulk actions pattern is more modern than what most ETRMs offer.

**Top improvement:** Add an audit indicator — when a status changes, show a small "Last changed by JC at 09:42" annotation below the status badge. Make the audit trail accessible without navigating away from the invoice queue.

---

### 6. Theme E — Reconciliation (reconciliation.html)
**Score: 8.5/10**

**First impression (2 seconds):** Side-by-side comparison. Provisional invoice on the left, final invoice on the right. Differences highlighted in amber with delta values. This is exactly how reconciliation should look.

**Product coherence:** Shares Theme E's back-office shell. The breadcrumb (Home > Settlement > Reconciliation > INV-2026-0042) confirms navigation context. The sidebar correctly highlights the Reconciliation page as active.

**Enterprise readiness:** This is the best page in the entire library for domain correctness. The fields compared are exactly right for LNG:
- Volume: 3,200,000 vs 3,198,450 (-1,550 MMBtu) — the delta from survey measurement
- Unit Price: $14.25 vs $14.22 (-$0.03) — pricing period adjustment
- Total Amount: $45,600,000 vs $45,481,959 (-$118,041) — the real financial impact
- Quality (GHV BTU/scf): 1,050 vs 1,052 (+2) — heating value from lab analysis
- BOG Allowance: N/A vs -1,550 MMBtu — boil-off gas deduction on final
- Demurrage: $0 vs $42,000 — vessel waiting time charges

The summary shows "Difference: -$118,041 (0.26%)" with a green checkmark indicating "Within tolerance (< 1%) — eligible for auto-approval." This is exactly how LNG reconciliation works. The tolerance-based auto-approval concept saves enormous time.

**Competitive comparison:** I have never seen a dedicated reconciliation comparison view this clear in any ETRM. Allegro does reconciliation in a data grid. Endur does it through report comparison. Bloomberg does not do physical reconciliation at all. This is genuinely better than the incumbents.

**Deal-breakers:** None. This page could ship as-is with real data behind it.

**Differentiators:** The visual diff with amber highlighting and inline delta values (+2, -$0.03, -1,550) is a UX pattern I have not seen in any ETRM. The auto-approval threshold concept built into the UI (not buried in settings) is operationally excellent. The Notes section for adding reconciliation comments and the action buttons (Approve Reconciliation, Flag for Review) complete the workflow.

**Top improvement:** Add a history panel showing previous reconciliation attempts for this invoice. In practice, a single cargo may go through 3-4 rounds of reconciliation before the final amount is agreed.

---

### 7. Hub Page (index.html)
**Score: 7/10**

**First impression (2 seconds):** Clean portfolio page. Six theme cards arranged in a grid, with Phase 1 (visual themes A-C) and Phase 2 (advanced interaction patterns D-F) clearly separated. Theme F is marked "Recommended" with a gradient badge. Professional presentation.

**Product coherence:** This is a design library hub, not a product page. It serves its purpose well: comparison table showing attributes across all 6 themes (Audience, Accent, Density, Menu, Quick Entry, Inline Grid Edit, etc.). The "6 Themes / 62 Pages" count is impressive for a prototype library.

**Enterprise readiness:** N/A — this is a presentation page, not a product feature.

**Competitive comparison:** N/A.

**Deal-breakers:** The comparison table shows Theme F as "Adaptive" density and "Both" audience (Front Office + Back Office). This is the right answer. The fact that this was explored through 6 iterations shows design maturity.

**Top improvement:** Add a "key decisions" section: why was Theme F chosen as the recommendation? What was learned from Themes A-E that informed it? This would help me trust the design process.

---

## Numbered Issues List

### Blockers

**1. Volume unit inconsistency across pages** (Blocker)
Theme D dashboard shows "+2.4M" (no unit), position ladder shows "+800K" (no unit), recent trades show "3,200,000" (no unit). Theme F shows "1.2 MT" in one place and "65,000" in quick entry. LNG trades in MMBtu, MT, and TBtu depending on market convention. Every numeric quantity must have an explicit unit label.
*Fix: Add unit suffix to every volume display. Use a global unit preference (MMBtu/MT/TBtu) with conversion. Display as "3.2M MMBtu" or "65,000 MT" — never bare numbers.*

**2. No audit trail on state changes** (Blocker)
Invoice status changes, trade cancellations, and reconciliation approvals produce no visible audit record. In a CFTC/FCA regulated environment, this is a compliance failure.
*Fix: Every state-changing action must produce a visible audit entry. Show "Changed to Approved by JC at 09:42" inline. Link to the full audit log from each record.*

**3. No confirmation/undo on trade entry** (Blocker)
The Quick Entry form submits immediately with no confirmation. A fat-finger error on a $45M LNG trade has no safety net. This would fail any risk management review.
*Fix: Add either (a) a confirmation modal showing trade summary, or (b) a 5-second "Undo" toast after submission that allows immediate reversal. Prefer option (b) for speed.*

### Major

**4. Theme D and Theme E are visually disconnected** (Major)
Theme D (dark, cyan, JetBrains Mono) and Theme E (light, blue, Inter) look like completely different products. If a trader needs to check an invoice, the visual context switch is disorienting.
*Fix: Theme F already solves this by unifying both audiences in one shell. Commit to Theme F as the production direction and retire D/E as design explorations. Document this decision.*

**5. Blotter lacks multi-row selection and bulk operations** (Major)
Theme F's blotter.html uses `rowSelection:'single'`. Real trading operations require selecting multiple trades for bulk confirm, bulk cancel, or bulk export. The invoice page already has this pattern.
*Fix: Change to `rowSelection:'multiple'` with checkbox column. Add a floating bulk action bar (copy the pattern from invoices.html).*

**6. No price curve visualization anywhere** (Major)
For a system that tracks JKM, TTF, HH, Brent, and NBP, there is no forward curve chart. The ticker shows spot prices, but traders need to see the curve shape (contango/backwardation) to make decisions.
*Fix: Add a forward curve chart page (Curves > Forward Curves link already exists in Theme F sidebar). Show JKM/TTF/HH as line charts with monthly points. This is table-stakes for an LNG ETRM.*

**7. No trade detail/amendment view** (Major)
The blotter's context menu has "View" and "Amend" actions, but they only trigger a toast notification. There is no trade detail page or amendment form. Traders need to see the full trade record and modify terms (price adjustments, volume amendments, delivery date changes).
*Fix: Build a trade detail page accessible from the blotter context menu and from the dashboard's recent trades list. Include amendment history.*

**8. Position ladder is not interactive** (Major)
Theme F's position ladder shows monthly positions by benchmark but clicking a cell does nothing. In Bloomberg TOMS, clicking a position cell shows you the underlying trades. This drill-down is expected.
*Fix: Make each cell clickable. On click, filter the blotter to show trades contributing to that position (e.g., JKM + Jun 26 + Buy side = the trades adding to the +450k position).*

### Minor

**9. Sidebar accordion state is not persisted** (Minor)
Expanding "Curves" or "Nominations" sub-menus resets on page navigation. Users have to re-expand their preferred sections every time they navigate.
*Fix: Store accordion state in localStorage and restore on page load.*

**10. Command palette (Cmd+K) does not search trade IDs** (Minor)
The Cmd+K palette searches page names and actions but cannot find specific trades (e.g., searching "T-1024" or "Shell" returns no results in the blotter). Power users expect universal search.
*Fix: Extend the command palette to search trade data. Show matching trades as results that navigate directly to the trade detail view.*

**11. Ticker prices are static** (Minor)
The scrolling ticker shows hardcoded prices. In a production system, stale prices are dangerous — a trader might act on yesterday's JKM.
*Fix: Add a "Last updated: 09:42 UTC" indicator to the ticker. In production, connect to the real-time price feed. For the prototype, show the timestamp to set expectations.*

**12. Theme E invoice grid uses Alpine theme, Theme F uses Quartz** (Minor)
Theme E invoices use `ag-theme-alpine`, Theme F blotter uses `ag-theme-quartz`. If these merge into one product, the grid styling will be inconsistent.
*Fix: Standardize on ag-theme-quartz across all grids. Quartz is AG Grid's newer, more customizable theme.*

**13. Reconciliation page shows a single invoice** (Minor)
The reconciliation view is hardcoded to INV-2026-0042. There is no list or queue of invoices pending reconciliation. In practice, a settlements analyst works through a queue.
*Fix: Add a reconciliation queue page (similar to the invoice queue) that lists all invoices with reconciliation status. The current side-by-side view becomes the detail page.*

### Polish

**14. Dark mode toggle position varies** (Polish)
Theme D puts the toggle in shell.js (likely header), Theme E puts it in the header right section, Theme F puts it in the header toolbar. Consistent placement needed.
*Fix: Standardize the theme toggle position across all pages — top-right header, same icon, same behavior.*

**15. "All Themes" navigation button** (Polish)
Every page has a fixed "All Themes" button in the bottom-right corner. This is a prototype navigation aid that should not appear in the production product.
*Fix: Remove the "All Themes" button from all pages before any customer demo. It breaks the illusion of a real product.*

**16. Notification badge counts are static** (Polish)
The sidebar shows "3" on Invoice Queue and "2" on Nominations as hardcoded badges. These should reflect actual pending item counts.
*Fix: For the prototype, this is acceptable. For production, connect badges to actual data counts.*

**17. Mobile responsiveness varies** (Polish)
Theme E has explicit mobile sidebar toggle (`@media(max-width:768px)`). Theme F sidebar collapses but does not hide. Theme D has no mobile consideration.
*Fix: For LNG trading, mobile is secondary (traders work on 4-monitor desks). But the back office (Theme E patterns) should work on tablets for warehouse/terminal use. Ensure consistent tablet breakpoints.*

---

## Competitive Position Assessment

| Capability | Allegro | Endur | Bloomberg | ION | Horizon (Theme F) |
|---|---|---|---|---|---|
| Trade entry speed | 3/5 | 2/5 | 5/5 | 3/5 | **4/5** |
| Position management | 4/5 | 4/5 | 5/5 | 4/5 | **3/5** |
| Settlement/recon | 3/5 | 4/5 | 1/5 | 4/5 | **4/5** |
| UI modernity | 2/5 | 1/5 | 3/5 | 2/5 | **5/5** |
| Role-based views | 1/5 | 1/5 | 2/5 | 2/5 | **5/5** |
| Keyboard-first | 2/5 | 1/5 | 5/5 | 2/5 | **4/5** |
| Domain depth (LNG) | 4/5 | 3/5 | 3/5 | 4/5 | **4/5** |
| Reporting | 4/5 | 5/5 | 4/5 | 4/5 | **1/5** |
| Integration ecosystem | 5/5 | 5/5 | 5/5 | 5/5 | **1/5** |

**Where Horizon leads:** UI modernity, role-based views, trade entry ergonomics, reconciliation UX.

**Where Horizon lags:** Reporting (no visible reports), integration ecosystem (understandable for a prototype), position management depth (no drill-down, no VaR, no Greeks).

---

## Verdict

**Would I take a second meeting?** Yes.

**Would I start a paid pilot?** Not yet. The three blockers (unit inconsistency, no audit trail, no trade confirmation) must be resolved first. The major issues (no curve visualization, no trade detail page, no position drill-down) would need to be on a committed roadmap.

**What would make me sign an LOI?**
1. Fix the three blockers.
2. Build the forward curve chart page.
3. Build the trade detail/amendment page.
4. Demo the reconciliation flow end-to-end (queue > detail > approve > audit log).
5. Show me the system with real market data (even 15-minute delayed JKM/TTF).

**What excites me about this prototype that the incumbents cannot match?**
The reconciliation side-by-side view with visual diffs is genuinely better than anything I have used in 15 years. The role-adaptive dashboard is a feature I have asked every ETRM vendor for and none have delivered. The quick entry strip with keyboard shortcuts respects how traders actually work. And the overall visual quality — this does not look like enterprise software from 2005. It looks like a product built in 2026. That matters for recruiting young traders who grew up on modern SaaS.

---

*Reviewer: Head of Trading Technology*
*Scope: Themes D, E, F (28 pages) + Hub page*
*Assessment: Proceed to Round 2 — address blockers, then schedule live demo with trading desk*
