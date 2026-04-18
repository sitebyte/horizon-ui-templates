# Blackthorn Digital — Round 2: Team Lead Synthesis

**Team Lead:** Marcus Chen, VP of Design, Blackthorn Digital
**Consultants:** Katya Petrov, James Okonkwo, Mei-Lin Zhang
**Date:** 18 April 2026

---

## Cross-Examination Summary

I've reviewed all three Round 1 evaluations. Here's where my team agrees, where they disagree, and what matters most for the client's decision.

### Universal Agreement (all 3 consultants)

**1. Theme F is the right base, but it has the wrong architecture.**
- Katya: "Theme F has the features but Theme D has the code quality"
- James: "230+ lines duplicated per page. Theme D's shell.js solves this correctly"
- Mei-Lin: "Theme F base + Theme D soul + Theme C beauty"
- **Verdict:** Merge Theme D's `shell.js`/`shell.css` architecture INTO Theme F's feature set. This is the #1 recommendation.

**2. There is no product — there are 6 experiments.**
- Katya: "6 disconnected themes with different patterns"
- James: "Design INTENT is enterprise-grade. Design IMPLEMENTATION is prototype-grade"
- Mei-Lin: "6 stories, not one. Six names, six typefaces, six color systems"
- **Verdict:** Kill themes A, B, C. Consolidate D+E into F. Ship ONE product, not a template library.

**3. Keyboard navigation is broken in Theme F's comboboxes.**
- Katya: "Theme D's combobox has proper tabindex and arrow-key nav. Theme F's relies on mousedown events"
- James: "Bloomberg users will reject mouse-dependent form controls in the first 30 seconds"
- Mei-Lin: (did not evaluate keyboard — not her focus)
- **Verdict:** Port Theme D's keyboard patterns to Theme F. Non-negotiable.

**4. Zero loading/empty/error states.**
- Katya: "Critical — first API timeout and the UI breaks"
- James: "At Bloomberg we had 14 distinct loading state patterns for different data types"
- Mei-Lin: "Empty states are a brand opportunity, not just error handling"
- **Verdict:** Design 3 state patterns (skeleton loading, helpful empty, error with retry) and apply to every data view.

**5. No audit trail anywhere.**
- Katya: "Compliance failure for any regulated trading company"
- James: "Bloomberg's audit system is the gold standard — every field change tracked with user, time, old/new value"
- **Verdict:** Audit trail is a regulatory requirement, not a feature request.

### Disagreements Resolved

**Density: Katya says "denser." Mei-Lin says "more breathing room."**
- Katya wants Theme D's ultra-compact density for all trading views
- Mei-Lin wants more whitespace and a "premium" feel
- James mediates: "Context-adaptive density is correct. Trading views: compact. Admin views: comfortable. The mistake is applying one density everywhere."
- **Resolution:** Keep Theme F's adaptive approach but tighten the trading views (blotter, positions, quick entry) to match Theme D's density. Don't touch the admin views.

**Visual identity: Katya doesn't care. Mei-Lin cares deeply.**
- Katya: "Traders don't care about beauty. They care about speed."
- Mei-Lin: "The Head of Trading Technology does care. They're spending $1M. It needs to FEEL like $1M."
- James: "Both right. The functional views need to be invisible. The dashboard and sign-in need to be impressive."
- **Resolution:** Polish the "first impression" pages (dashboard, sign-in, hub) to premium level. Keep functional pages utilitarian.

**6 themes vs 1 theme:**
- Katya: "Ship one theme. Multiple themes is a distraction."
- Mei-Lin: "Keep 2-3 for the pitch to show design range, then consolidate."
- James: "One theme for the product. Keep the others as a reference library."
- **Resolution:** Consolidate into ONE production theme ("Horizon"). Keep A-E as archived design references, not active development.

### Scoring Comparison

| Criterion | Katya | James | Mei-Lin | Average |
|-----------|-------|-------|---------|---------|
| Overall | 5.5/10 | 7.2/10 | 7.5/10 (F) | 6.7/10 |
| Code quality | 4/10 | 5.5/10 | N/A | 4.8/10 |
| Design craft | 6/10 | 6/10 | 8/10 (D) | 6.7/10 |
| Feature coverage | 7/10 | 8/10 | 7/10 | 7.3/10 |
| Production readiness | 4/10 | 5/10 | 5/10 | 4.7/10 |
| Innovation | 8/10 | 8.5/10 | 7.5/10 | 8.0/10 |

**Innovation is the strongest dimension.** Production readiness is the weakest.

---

## Consolidated Issue List (Priority Order)

### CRITICAL (must fix before any client demo)

| # | Issue | Katya | James | Mei-Lin | Recommendation |
|---|-------|-------|-------|---------|----------------|
| C1 | No shared design system in Theme F | X | X | X | Port Theme D's shell.js/shell.css architecture to Theme F |
| C2 | Combobox keyboard nav broken in Theme F | X | X | | Port Theme D's keyboard patterns |
| C3 | No loading/empty/error states | X | X | X | Design 3 patterns, apply everywhere |
| C4 | XSS in counterparty dropdowns | X | X | | Escape all user-facing template literals |

### HIGH (must fix before pilot)

| # | Issue | Recommendation |
|---|-------|----------------|
| H1 | No audit trail on any entity | Add history timeline with who/what/when/diff |
| H2 | No four-eyes approval workflow | Creator cannot approve own entity |
| H3 | Position ladder missing WACOG | Add weighted avg cost, physical/paper split |
| H4 | No cross-entity navigation | Trade → Cargo → Nomination → Invoice links |
| H5 | No brand identity — 6 themes, no product | Consolidate to ONE "Horizon" product theme |
| H6 | Static ticker (no real-time feel) | Even simulated ticking is better than frozen numbers |

### MEDIUM (should fix for production)

| # | Issue | Recommendation |
|---|-------|----------------|
| M1 | Duplicate boilerplate per page (Theme F) | Single shell.js import |
| M2 | Hardcoded benchmark prices for MTM | Show "as of" timestamp, configurable |
| M3 | No responsive behaviour on mobile | Sidebar collapse, table scroll, card stack |
| M4 | No transitions or micro-interactions | 0.15s ease on hover, 0.2s on panel open |
| M5 | Inconsistent typography across themes | One type system: Inter + JetBrains Mono |
| M6 | Command palette lacks arrow key navigation | Full keyboard nav: arrows, Enter, Escape |

---

## What We'd Steal (Honest Assessment)

All three consultants identified patterns they would "steal" for their own work:

1. **Role-adaptive dashboard** (Katya 8/10, James 8.5/10, Mei-Lin 7.5/10) — "Genuinely novel. No incumbent ETRM has this."
2. **Reconciliation diff view** (Katya 8/10, James 8/10) — "Better than anything Allegro ships"
3. **Quick entry confirmation bar with undo** (Katya 7/10, James 7/10) — "Simple, effective, one extra keystroke for safety"
4. **Position ladder cell drill-down** (Katya 7/10, James 7/10) — "Right interaction, needs more data per cell"
5. **Theme D's shell.css token system** (James 9/10) — "Professional-grade. 40+ tokens across 5 surface tiers."
6. **AG Grid blotter with MTM/P&L columns** (Katya 7/10) — "The MTM calculation inline is a nice touch"

---

## Buy Recommendation to Client

**Katya:** "Conditional buy. Fix the 4 critical issues. Then it's viable for a pilot."
**James:** "Strong base for a production system. Not yet ready to hand to a dev team. Needs 3-4 weeks of architectural rework."
**Mei-Lin:** "Has the bones of a premium product. Needs one design pass to find its identity. Currently 'competent without confidence.'"

**Team Lead verdict:** This is a **7/10 foundation** that could become a **9/10 product** with focused work on: (1) architectural consolidation, (2) design system extraction, (3) the 4 critical fixes, and (4) one visual identity pass. The innovation score (8/10) is what makes it worth investing in rather than building from scratch.
