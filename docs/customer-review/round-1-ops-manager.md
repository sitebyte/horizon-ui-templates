# Round 1 Review: Head of LNG Operations Perspective

**Reviewer profile:** Head of LNG Operations, 5 direct reports, 200 invoices/month, 40+ nominations, monthly close cycle. Former Allegro and Endur user.

**Date:** 2026-04-11
**Pages reviewed:** 10 files across Theme E (dedicated back-office) and Theme F (unified platform)

---

## Executive Summary

The Horizon back-office templates demonstrate a strong conceptual understanding of LNG operations workflows. The dashboard, invoice queue, and reconciliation views cover the core settlement flow competently. However, significant gaps exist around approval workflows, four-eyes controls, bulk processing at scale, and the complete absence of demurrage and quality adjustment screens. As someone processing 200 invoices/month with a five-person team, I would need substantial additions before this could replace Allegro or Endur for month-end close.

Theme E is better suited for back-office operations work. Theme F is trader-oriented and bolts settlement onto a trading platform -- it lacks the operational depth Theme E provides (no audit log, no contracts, no month-end progress tracker).

---

## Page-by-Page Evaluation

### 1. Operations Dashboard (Theme E: index.html)

**Scores:** Workflow: 7 | Error Prevention: 5 | Efficiency: 8 | Auditability: 6

The dashboard is the strongest page for an ops manager. The "Pending Actions" cards (3 invoices awaiting approval, 2 nominations due, 1 trade pending validation) give an immediate morning snapshot. The "Upcoming Deadlines" section with colour-coded countdown (1 day in red, 5 days in amber, 14 days in green) is exactly what I need at 8am.

The Month-End Progress checklist (forward curves, position reconciliation, invoice finalization, demurrage, P&L sign-off, audit report) is genuinely useful -- this is how my team actually thinks about month-end. However, the checkboxes are disabled and there is no mechanism to assign owners, add notes, or track completion dates. In Allegro, we maintain a separate spreadsheet for this; Horizon could eliminate that.

Recent Activity shows who did what recently but only the last 5 items. I need to see my entire team's activity for today, filterable by person.

**Missing:**
- No way to see which of my 5 team members is overloaded
- No SLA/aging metrics (e.g., average time from provisional to final invoice)
- Month-end checklist is static, not interactive

---

### 2. Invoice Queue (Theme E: invoices.html)

**Scores:** Workflow: 7 | Error Prevention: 4 | Efficiency: 7 | Auditability: 3

Good: AG Grid with column filtering, sorting, and resizing is the right choice. The filter pills (All/Pending/Approved/Overdue) and quick search are efficient. Bulk selection with header checkbox and "Bulk Approve" action bar at the bottom is a genuine time-saver for high-volume processing. CSV export works for both full dataset and selected rows.

The inline status editing via dropdown (Draft/Issued/Pending/Approved/Paid/Disputed) and per-row Approve/Reject buttons give two ways to work. For 200 invoices/month, this would be workable.

**Critical problems:**
- No confirmation dialog on Approve or Reject actions. Clicking "Approve" on a $45.6M invoice happens instantly with no undo. In Allegro, every approval requires a confirmation dialog plus a reason field. This is a compliance risk.
- Status can be changed to any value via the dropdown with no business rules. I can set a Draft invoice directly to Paid, skipping the entire approval workflow. There is no state machine enforcing Draft -> Issued -> Pending -> Approved -> Paid.
- No "who approved this" tracking. The status changes in the grid but nothing records which user made the change or when.
- Bulk Approve applies to all selected rows regardless of current status. I could accidentally bulk-approve invoices that are already Disputed.
- No linked documents -- no way to view the underlying trade, cargo, or reconciliation from the invoice row.

---

### 3. Reconciliation (Theme E: reconciliation.html)

**Scores:** Workflow: 6 | Error Prevention: 6 | Efficiency: 5 | Auditability: 4

The side-by-side provisional vs. final comparison is the core of what I need. The diff highlighting (amber left border with delta values) makes variances immediately visible. Showing volume, price, quality (GHV), BOG allowance, and demurrage in parallel is correct for LNG settlement.

The tolerance check ("Within tolerance < 1% -- eligible for auto-approval") with the green checkmark is a genuinely useful feature. This is something we currently calculate manually in Allegro.

**Critical problems:**
- This page only shows one reconciliation at a time. I process dozens per month. There is no list view to see all pending reconciliations, sort by variance, or batch-process the ones within tolerance.
- The "Approve Reconciliation" button shows a toast message but there is no confirmation dialog, no reason capture, and no second approver. In Endur, reconciliation approval is a two-step process.
- Notes field exists but there is no history of previous notes. I cannot see what my colleague wrote when they flagged this for review.
- No link from this page back to the invoice queue or forward to the payment tracking page. The workflow is disconnected.
- Demurrage and BOG are shown but cannot be edited here. If the final invoice adds $42,000 demurrage, I need to verify the calculation, and there is no drill-down.
- No attachment support -- I need to upload the counterparty's invoice PDF, the bill of lading, and the outturn report as supporting documents.

---

### 4. Nominations (Theme E: nominations.html)

**Scores:** Workflow: 6 | Error Prevention: 5 | Efficiency: 5 | Auditability: 3

The cascading form (Contract -> Cargo -> pre-filled Volume/Month/Ports -> Vessel -> ETA) is well designed. The cascading logic correctly disables downstream fields until upstream selections are made. The vessel ETA display (load and discharge dates with arrow) is useful for scheduling.

The Nomination Schedule table below the form shows existing nominations with status badges and countdown timers. Colour coding (red for 2 days, amber for 4 days, green for complete) helps prioritize.

**Critical problems:**
- No nomination lifecycle management. I can create a nomination but cannot edit, cancel, or resubmit one. The schedule table is display-only.
- No ADP (Annual Delivery Programme) view. The sidebar links to ADP Schedule, Cargo Nominations, and Vessel Nominations, but all three link to the same page. These are fundamentally different workflows.
- No notification system for approaching deadlines. The countdown shows "2 days" but there is no email alert or escalation rule.
- No counterparty communication tracking. In practice, nominations involve back-and-forth with the counterparty (submit -> acknowledge -> confirm/reject -> amend). This form has no concept of nomination state beyond what the internal schedule table shows.
- Submit uses a browser alert() dialog rather than proper UI feedback, and validation only checks contract + cargo, not vessel.
- No batch nomination capability. For a quarterly ADP with 12 cargoes, I need to nominate all at once, not one by one.

---

### 5. Contract Wizard (Theme E: contracts.html)

**Scores:** Workflow: 7 | Error Prevention: 5 | Efficiency: 6 | Auditability: 3

The four-step wizard (Parties -> Pricing -> Volume -> Review) is the right structure. Contract type selection (SPA/MSA/Spot/Tender) with visual radio cards is clear. Pricing handles hub-indexed, oil-indexed, fixed, and hybrid with dynamic field show/hide. Volume terms include ACQ, min/max take percentages, delivery terms (FOB/DES/CIF), and cargo frequency.

The review step assembles all fields into a readable summary. Save Draft option is good.

**Critical problems:**
- No validation between steps. I can click Next without filling any fields. Step 1 has no required-field checking for Seller, Buyer, or dates.
- No contract template system. Most of our SPAs follow similar structures. There should be a "Clone from existing" option.
- No approval workflow for contract creation. A new 20-year SPA should require management sign-off, not just a Submit button.
- The breadcrumb says "Admin > Contracts > New" but contracts are under Operations in the sidebar. Inconsistent navigation.
- No special clause handling. LNG contracts have destination restrictions, diversion rights, take-or-pay makeup provisions, and force majeure clauses that are critical for operations.
- End date defaults to 2046-03-31 (20-year term) which is sensible for SPAs but wrong for Spot deals. The form should adapt defaults based on contract type.

---

### 6. Trade Entry (Theme E: trade-entry.html)

**Scores:** Workflow: 8 | Error Prevention: 7 | Efficiency: 7 | Auditability: 4

This is the most complete form. The Buy/Sell toggle with colour change (green/red) is clear. Auto-generated trade reference is good. The counterparty combobox with search, country display, and credit status indicator (green/amber/red dot) is well designed.

Pricing structure supports Fixed, Hub Indexed, and Oil Indexed with dynamic formula preview. Volume validation with on-blur error messages is present. Port search with autocomplete dropdown from real LNG terminal names is correct.

The Position Impact Preview sidebar is excellent -- showing current long position, trade volume, post-trade position, WACOG change, and credit utilisation change. The credit advisory warning at 74% utilisation is exactly the kind of real-time guardrail that prevents expensive mistakes.

**Critical problems:**
- No counterparty validation against the contract. If I am entering a trade under SPA-SHELL, the counterparty should be pre-filled or at least validated.
- Validation is minimal -- only volume and delivery dates are required. Counterparty, pricing, and ports are not validated on submit.
- No trade confirmation workflow. After creation, a trade should go through a confirm/validate step (as shown on the dashboard with "1 trade pending validation") but there is no view for this.
- The Position Impact sidebar uses static placeholder data rather than reacting to form inputs.
- No duplicate trade detection. Fat-finger protection is essential.
- No way to link the trade to a contract. The form is standalone.

---

### 7. Audit Log (Theme E: audit-log.html)

**Scores:** Workflow: 5 | Error Prevention: N/A | Efficiency: 6 | Auditability: 7

This is the strongest auditability feature. The log shows Timestamp, User, Action (Created/Updated/Approved/Cancelled), Entity Type, Entity Reference, and Details. Filters by entity type, date range, and free-text search are present. Pagination and sorting work. The data is realistic and covers all entity types.

47 entries across 12 days with 5 different users is representative. The detail text is meaningful (e.g., "Amendment: pricing premium changed +$0.15/MMBtu").

**Critical problems:**
- No old-value vs. new-value comparison. "Pricing premium changed" tells me something changed but not what it changed from. I need "Premium: $0.35 -> $0.50".
- No entity drill-down. Clicking on a reference (e.g., INV-2026-0039) should navigate to that invoice. Currently the references are plain text.
- No export by entity -- I cannot pull all audit entries for a specific trade or contract.
- No user filter dropdown. I have to use free-text search to find a specific team member's actions.
- The date filter does not actually filter the data (the JS only filters by entity type and search text, ignoring date inputs).
- No IP address or session tracking for compliance.

---

### 8. Invoice Queue (Theme F: invoices.html)

**Scores:** Workflow: 6 | Error Prevention: 4 | Efficiency: 6 | Auditability: 2

Same AG Grid pattern as Theme E but with the quartz theme and slightly different data. The filter pills and bulk approve are present. The grid uses more compact 36px row height which is better for scanning large lists.

Differences from Theme E: adds invoice Type column (Provisional/Final), uses smaller data amounts (suggesting per-cargo not per-contract invoicing), and includes a live market ticker at the top. The ticker is irrelevant for settlement work and wastes vertical space.

**Critical problems:**
- Same approve-without-confirmation problem as Theme E.
- No audit log accessible from this theme. There is no audit trail page linked from the sidebar.
- The role selector in the sidebar (Trader/Operations/Manager) is a good concept but does not change the visible content or permissions.
- Less invoice data than Theme E (amounts in $760K-$2.3M range vs. $27M-$62M in Theme E). The smaller amounts suggest per-cargo rather than per-SPA invoicing, which is more realistic but should be explicit.

---

### 9. Reconciliation (Theme F: reconciliation.html)

**Scores:** Workflow: 7 | Error Prevention: 6 | Efficiency: 6 | Auditability: 4

This is a meaningful improvement over Theme E's reconciliation. It adds:
- A four-metric summary bar (Volume Delta, GCV Delta, Value Delta, Tolerance Check) with large numbers that are scannable.
- The tolerance check shows explicit PASS/FAIL with colour coding.
- Individual field-level delta highlighting with percentages in the final invoice column.
- More fields: Loading Date, Vessel, and Incoterm alongside the standard volume/GCV/price/value.

The approve button text says "Invoice approved -- credit note generated for -$6,132" which implies automatic credit note creation. This is operationally correct and saves a manual step.

**Critical problems:**
- Still single-invoice view with no list of pending reconciliations.
- Same lack of second-approver workflow.
- No link to supporting documents.
- Notes history not preserved.

---

### 10. Nominations (Theme F: nominations.html)

**Scores:** Workflow: 7 | Error Prevention: 5 | Efficiency: 6 | Auditability: 3

Improvement over Theme E: the form is a single-row layout (4 columns) which is more compact. The vessel selection includes capacity display and port-specific ETA calculation (different ETAs for the same vessel depending on loading port). This is a genuine operational improvement -- in Allegro, vessel ETAs are manually looked up.

The nomination schedule table includes Vessel and Volume columns that Theme E omits. The countdown/deadline tracking is present.

**Critical problems:**
- Same lifecycle management gaps as Theme E.
- No ADP view separation.
- The form successfully generates incrementing nomination IDs (NOM-2427, NOM-2428...) which is better than Theme E's alert() dialog.

---

## Consolidated Scores

| Page | Workflow | Error Prevention | Efficiency | Auditability |
|------|----------|-----------------|------------|--------------|
| Dashboard (E) | 7 | 5 | 8 | 6 |
| Invoice Queue (E) | 7 | 4 | 7 | 3 |
| Reconciliation (E) | 6 | 6 | 5 | 4 |
| Nominations (E) | 6 | 5 | 5 | 3 |
| Contracts (E) | 7 | 5 | 6 | 3 |
| Trade Entry (E) | 8 | 7 | 7 | 4 |
| Audit Log (E) | 5 | N/A | 6 | 7 |
| Invoice Queue (F) | 6 | 4 | 6 | 2 |
| Reconciliation (F) | 7 | 6 | 6 | 4 |
| Nominations (F) | 7 | 5 | 6 | 3 |
| **Average** | **6.6** | **5.2** | **6.2** | **3.9** |

---

## Numbered Issues List

### CRITICAL (Severity 1) -- Blocking for go-live

1. **No approval confirmation dialogs.** Every approval action (invoice, reconciliation, nomination, trade) executes instantly with no confirmation step, no reason capture, and no undo. This is a compliance failure. **Fix:** Add a modal dialog requiring typed reason text and explicit "Confirm Approval" / "Cancel" buttons. Log the reason in the audit trail.

2. **No four-eyes principle (dual approval).** No page implements a second-approver requirement. For invoices over a configurable threshold (e.g., $10M) and contract amendments, a second user must approve. **Fix:** Add an approval_chain concept: first approver sets status to "Approved (Pending 2nd)", second approver finalises. Show both approvers in the audit log.

3. **Invoice status has no state machine.** Status can be changed to any value via inline editing, including invalid transitions (Draft -> Paid, Disputed -> Draft). **Fix:** Implement a state machine: Draft -> Issued -> Pending -> Approved -> Paid, with Disputed as a branch from Pending. Only allow valid forward/backward transitions. Grey out invalid options in the dropdown.

4. **No old-vs-new value tracking in audit log.** The audit log records that a change happened but not what specifically changed. This fails regulatory audit requirements. **Fix:** Store and display `{field: "premium", old: "$0.35", new: "$0.50"}` for every Update action. Render as a diff view.

5. **Audit log date filters do not function.** The Date From and Date To inputs exist but the `applyFilters()` JavaScript function ignores them entirely, filtering only by entity type and search text. **Fix:** Add date range comparison in the filter function.

6. **No document attachment capability anywhere.** Settlement requires supporting documents (counterparty invoices, bills of lading, outturn reports, quality certificates, survey reports). No page provides upload/view functionality. **Fix:** Add an attachments section to reconciliation and invoice detail views with drag-and-drop upload, file type validation, and version history.

### HIGH (Severity 2) -- Major workflow gaps

7. **No reconciliation list view.** The reconciliation page only shows one invoice at a time. With 200 invoices/month, I need a filterable/sortable list with variance summaries to triage which ones need attention. **Fix:** Create a reconciliation queue page (similar to invoice queue) with columns for provisional amount, final amount, delta, delta %, and tolerance status. Allow sorting by delta to surface the biggest variances first.

8. **No nomination lifecycle management.** Nominations can be created but not edited, cancelled, resubmitted, or tracked through counterparty confirmation. **Fix:** Add status workflow (Draft -> Submitted -> Acknowledged -> Confirmed -> Amended -> Cancelled) with edit capability at each stage and a history panel showing all changes.

9. **Demurrage and quality adjustment pages are stubs.** The sidebar links to Demurrage and Quality Adjustments but they point to `#` (no page exists). These are critical settlement workflows representing millions of dollars in monthly adjustments. **Fix:** Build dedicated pages: Demurrage should calculate lay-time, show laytime statement comparison (our calc vs. counterparty), and link to the vessel events. Quality adjustments should show GHV/composition comparison against contractual specs with automatic price adjustment calculation.

10. **No payment tracking page.** The sidebar lists Payment Tracking but it is a stub. Once invoices are approved, we need to track payment dates, bank confirmations, and aging. **Fix:** Build a payment tracking view showing approved invoices grouped by counterparty, payment terms, expected payment date, actual payment date, and aging buckets (current, 30+, 60+, 90+ days).

11. **Trade entry is disconnected from contracts.** There is no way to link a trade to an existing contract during entry, and no validation that trade terms match contract terms. **Fix:** Add a contract selector that pre-fills counterparty, pricing structure, delivery terms, and validates volume against remaining ACQ.

12. **No delegation or assignment system.** As a manager of 5, I need to assign invoices or nominations to specific team members and see who is working on what. **Fix:** Add an "Assigned To" field on invoices and nominations with a team member selector and a manager view showing workload distribution.

### MEDIUM (Severity 3) -- Efficiency improvements

13. **Month-end checklist is static and non-interactive.** Checkboxes are disabled and there is no way to assign owners, add completion dates, or attach evidence. **Fix:** Make each checklist item clickable with an assignment dropdown, date field, notes field, and status tracking. Show percentage complete.

14. **No batch nomination entry.** Creating nominations one at a time for a quarterly ADP with 12 cargoes is tedious. **Fix:** Add a "Bulk Nominate" mode that shows all unnominated cargoes for a contract and allows vessel assignment in a grid view.

15. **No invoice-to-reconciliation navigation.** From the invoice queue, there is no link to open the reconciliation view for a specific invoice. These are separate pages with no workflow connection. **Fix:** Add a "Reconcile" action button on invoice rows that navigates to the reconciliation page pre-loaded with that invoice's data.

16. **No saved filters or views.** With 200 invoices/month, I need saved filter presets (e.g., "My pending approvals", "Overdue this week", "Shell invoices Q2"). **Fix:** Add a "Save View" option that persists filter and sort configuration with a name.

17. **No totals row in invoice grid.** When I filter to show all Pending invoices, I need to see the total amount at the bottom for cash flow forecasting. AG Grid supports footer rows natively. **Fix:** Enable aggregation footer row showing sum of Amount column for filtered rows.

18. **Contract wizard has no step validation.** Users can advance through all four steps without entering any data, reaching the Review step with empty fields. **Fix:** Add per-step validation that prevents advancing to the next step until required fields are complete. Show inline error messages.

19. **Audit log entity references are not clickable.** References like "INV-2026-0039" are displayed as plain text. They should be hyperlinks navigating to the relevant invoice/trade/nomination/contract. **Fix:** Render entity references as `<a>` tags linking to the appropriate detail page.

20. **No notes history on reconciliation.** The notes textarea allows entry but previous notes are not displayed. When multiple team members work on a reconciliation, the conversation history is lost. **Fix:** Add a comments/notes timeline below the textarea showing all previous notes with author and timestamp.

### LOW (Severity 4) -- Polish and usability

21. **Theme F invoice amounts are unrealistically small.** Amounts range from $760K to $2.3M which would be per-cargo for very small cargoes. LNG invoices typically range from $20M-$80M per cargo. This may confuse stakeholders evaluating the UI. **Fix:** Use realistic LNG cargo values in demo data.

22. **Theme F market ticker wastes space on settlement pages.** The live price ticker is relevant for traders but not for operations staff doing reconciliation or invoice processing. **Fix:** Allow the ticker to be hidden per-page or per-role. The toggle button exists but defaults to visible.

23. **No keyboard shortcuts for common actions.** Cmd+K command palette exists for navigation but there are no shortcuts for Approve (e.g., Cmd+Enter), Reject, or Save Draft. **Fix:** Add keyboard shortcuts for primary actions and display them in button tooltips.

24. **Sidebar sub-menu items all link to the same page.** Under Nominations, "ADP Schedule", "Cargo Nominations", and "Vessel Nominations" all link to nominations.html. Under Invoice Queue, "Provisional", "Final", and "Disputed" all link to invoices.html. **Fix:** Either create separate views for each sub-item or have the links apply the relevant filter on the target page.

25. **No print/PDF export for reconciliation.** When sending reconciliation results to a counterparty or for filing, I need a clean PDF export. **Fix:** Add a "Export PDF" button that generates a formatted reconciliation statement.

---

## Comparative Assessment: Theme E vs. Theme F for Operations

| Capability | Theme E | Theme F | Verdict |
|---|---|---|---|
| Settlement depth | Dedicated section with demurrage/quality stubs | Invoice + Recon only | **Theme E** |
| Month-end tracking | Checklist on dashboard | None | **Theme E** |
| Audit trail | Full audit log page | None | **Theme E** |
| Contract management | Four-step wizard | None | **Theme E** |
| Reconciliation quality | Basic side-by-side | Better metrics + auto credit note | **Theme F** |
| Data density | Standard row height | Compact 36px rows | **Theme F** |
| Nomination vessel ETA | Static per-vessel | Port-specific calculation | **Theme F** |
| Role awareness | None | Role selector (non-functional) | **Tie** |

**Recommendation:** Use Theme E as the base for back-office operations, but incorporate Theme F's reconciliation summary metrics, compact grid density, and port-specific vessel ETA logic.

---

## What Would Make Me Switch from Allegro

1. Working dual-approval workflow with configurable thresholds
2. Complete invoice lifecycle: creation -> provisional -> reconciliation -> final -> approval -> payment tracking -> month-end close
3. Integrated demurrage calculation with laytime statement comparison
4. Document management (upload, view, version) attached to invoices and reconciliations
5. Reconciliation queue with batch auto-approval for within-tolerance items
6. Real-time position impact during settlement (how does approving this invoice change my P&L?)
7. Automated deadline alerts with escalation rules
8. Export capabilities: PDF reconciliation statements, month-end settlement reports, audit extracts

The foundation is solid. The data model understands LNG. The screens cover 60-70% of what I need. But the missing 30% is the most operationally critical: controls, approvals, and the connective tissue between screens that makes a workflow rather than a collection of pages.
