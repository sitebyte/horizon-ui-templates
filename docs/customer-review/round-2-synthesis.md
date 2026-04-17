# Round 2: Cross-Examination & Prioritised Fix List

**Synthesised from 6 independent Round 1 reviews**
**Date:** 12 April 2026

---

## Consensus Summary

All 6 reviewers agree on the core assessment: **Theme F is the production candidate.** The role-adaptive dashboard, comprehensive sidebar, and breadth of page types make it the only theme that could represent a complete product. Themes D and E contribute specific strengths (D's keyboard-first density and CSS architecture, E's back-office workflow pages) that should be absorbed into F.

**Overall scores by reviewer:**

| Reviewer | Score | Verdict |
|----------|-------|---------|
| Trading Tech Head | 7.4/10 | "Strong enough for a second meeting, not yet for a signed LOI" |
| Desk Trader | 6.8-8.0/10 | "Theme D quick entry is best. Missing P&L and WACOG are blockers" |
| Ops Manager | 5.2-6.6/10 | "Auditability scored 3.9/10. No four-eyes principle is a compliance failure" |
| UX Specialist | Varies | "Theme F only production-ready candidate. Zero loading/empty/error states" |
| Competitor Benchmarker | vs Allegro 7-8/10 | "Most modern ETRM evaluated. Role-adaptive dashboard is genuinely novel" |
| Frontend Craft Expert | 5-9/10 | "Domain accuracy excellent. No getRowId, null-unsafe formatters, XSS in dropdowns" |

---

## Issues Flagged by 3+ Reviewers (Consensus Problems)

These are the issues that multiple reviewers independently identified — the real problems:

### 1. NO AUDIT TRAIL / CHANGE TRACKING (flagged by 4 agents)
- Trading Tech: "No audit trail on state changes — compliance failure"
- Ops Manager: "Auditability scored 3.9/10 — no who/what/when on any change"
- Frontend Craft: "No event logging for state transitions"
- UX Specialist: "No timestamp or user attribution on any action"
**Impact:** Any regulated trading company will reject this. REMIT/EMIR require full audit trails.

### 2. NO LOADING / EMPTY / ERROR STATES (flagged by 3 agents)
- UX Specialist: "Not one skeleton screen, empty state, or error banner in 60+ pages"
- Frontend Craft: "Null-unsafe valueFormatters will throw on missing data"
- Trading Tech: "No graceful degradation when data is unavailable"
**Impact:** First time the API is slow or returns empty, the UI breaks visually.

### 3. POSITION LADDER MISSING KEY DATA (flagged by 3 agents)
- Desk Trader: "No WACOG — volume without average cost is meaningless for risk"
- Competitor Bench: "No real-time price reference, no sensitivity/delta, no P&L attribution"
- Trading Tech: "Position ladder needs drill-down interaction" (partially exists but incomplete)
**Impact:** The position ladder is the #1 screen traders use. If it's incomplete, the system feels hollow.

### 4. KEYBOARD NAVIGATION GAPS (flagged by 3 agents)
- Desk Trader: "Position ladder has zero keyboard nav — mouse-only is unacceptable"
- Frontend Craft: "Zero keyboard navigation in all comboboxes"
- UX Specialist: "No aria-labels, no focus management, no skip links"
**Impact:** Power users (traders) won't adopt a mouse-only system. Accessibility is also a procurement requirement.

### 5. BLOTTER MISSING P&L/MTM COLUMN (flagged by 3 agents)
- Desk Trader: "A blotter without mark-to-market is just a trade log"
- Competitor Bench: "No visible link to positions and P&L from blotter"
- Trading Tech: "Need MTM and unrealized P&L per trade"
**Impact:** The blotter is the second-most-used screen. Without P&L it's just a list.

### 6. NO CONFIRMATION/UNDO ON TRADE ENTRY (flagged by 3 agents)
- Trading Tech: "No confirmation dialog — risk management failure"
- Ops Manager: "No four-eyes principle — anyone can approve their own trade"
- Frontend Craft: "No getRowId means transaction updates are unsafe"
**Impact:** Fat-finger risk. A trader accidentally enters 32M instead of 3.2M and it's instantly committed.

---

## Top 10 Highest-Impact Fixes (Priority Order)

| # | Fix | Severity | Effort | Impact | Sources |
|---|-----|----------|--------|--------|---------|
| 1 | **Add confirmation step to trade entry** — preview summary + "Confirm" button before commit, with undo toast for 5 seconds after | Blocker | Low | Prevents fat-finger losses, satisfies risk requirements | TechHead, OpsMgr, Craft |
| 2 | **Add P&L/MTM column to blotter** — unrealized P&L per trade, color-coded green/red, with total in footer | Blocker | Low | Transforms blotter from trade log to trading tool | Trader, Benchmark, TechHead |
| 3 | **Add WACOG + physical/paper split to position ladder** — each cell shows volume, WACOG, P&L, and physical vs paper breakdown | Blocker | Medium | Makes position ladder actually useful for risk management | Trader, Benchmark |
| 4 | **Add loading/empty/error states** — skeleton screens for data loading, helpful empty states with actions, error banners with retry | Major | Medium | Prevents visual breakage, looks professional | UX, Craft, TechHead |
| 5 | **Add audit trail panel** — "History" tab on trade/invoice detail showing who/what/when with diff highlighting | Major | Medium | Compliance requirement for any regulated trading company | TechHead, OpsMgr, UX |
| 6 | **Fix combobox keyboard navigation** — Arrow keys through results, Enter to select, Escape to close, proper focus management | Major | Medium | Enables keyboard-only trade entry (the core promise) | Trader, Craft, UX |
| 7 | **Add delivery terms (FOB/DES) to quick entry** — with cascading port field | Major | Low | Trade is incomplete without incoterms | Trader, Benchmark |
| 8 | **Adopt Theme D's shell architecture** — shared `shell.js`/`shell.css` instead of 230 lines duplicated per page | Major | Medium | Code quality, maintainability, consistency | Craft, UX |
| 9 | **Fix AG Grid `getRowId` and null safety** — add row IDs, guard all valueFormatters against null/undefined | Major | Low | Prevents silent data corruption and runtime errors | Craft |
| 10 | **Add cross-entity navigation links** — trade links to its cargo, nomination, invoice; invoice links back to trade | Major | Medium | Connects the workflow chain, stops each page being an island | TechHead, Benchmark, OpsMgr |

---

## Disagreements Resolved

### Density: Trader wants dense, UX wants spacious
**Resolution:** Context-adaptive density (already in Theme F's design). Trading screens (blotter, positions, quick entry) use compact density. Admin screens (forms, settings, reconciliation) use comfortable density. Both are right — for different screens.

### Theme direction: Multiple themes vs single theme
**Resolution:** All 6 reviewers converge on Theme F as the base. Theme D's CSS architecture and keyboard patterns should be merged in. Theme E's back-office pages should be merged in. Themes A, B, C served their purpose as design exploration but should not be developed further.

### Glassmorphism (Theme C)
**Resolution:** UX Specialist called it an "anti-pattern for data-intensive applications." Competitor Benchmarker noted "no incumbent ETRM uses blur effects." Dropped.

---

## What's Genuinely Differentiating (Keep & Amplify)

These are the features that reviewers specifically called out as better than incumbents:

1. **Role-adaptive dashboard** (9/10 unique value) — "I have never seen an ETRM switch context by persona without a full page reload"
2. **Reconciliation side-by-side diff** (8.5/10) — "Better than any incumbent ETRM" (Trading Tech Head)
3. **Quick entry keyboard strip** (8/10) — "The inline quick entry with immediate grid population is better UX than Molecule's modal form"
4. **Modern visual quality** — "A generation ahead of the incumbent ETRM market" across all reviewers
5. **LNG domain accuracy** — "Column definitions, data models, cascading nomination workflows all reflect genuine ETRM knowledge" (Frontend Craft)

---

## Next: Round 3

Round 3 will produce specific before/after specs for each of the Top 10 fixes, implementation order, and estimated effort. The goal: after implementing fixes 1-5, the template survives a 30-minute demo with a Head of Trading Technology without a deal-breaker emerging.
