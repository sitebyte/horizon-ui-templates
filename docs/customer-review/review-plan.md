# First Customer Review — Plan

**Objective:** Push the Horizon UI templates from "good effort" to "the most usable trading system UI"
**Date:** 12 April 2026

---

## Review Team

| # | Agent | File | Focus |
|---|-------|------|-------|
| 1 | Head of Trading Technology | `.claude/agents/head-of-trading-tech.md` | Product coherence, enterprise readiness, competitive positioning, deal-breakers |
| 2 | 10-Year LNG Desk Trader | `.claude/agents/desk-trader-reviewer.md` | Speed, keyboard flow, information density, daily workflow gaps |
| 3 | Operations Manager | `.claude/agents/ops-manager-reviewer.md` | Workflow completeness, batch operations, error prevention, audit trails |
| 4 | UX Critique Specialist | `.claude/agents/ux-critique-specialist.md` | Typography, consistency, focus states, hierarchy, micro-interactions, polish |
| 5 | Competitor Benchmarker | `.claude/agents/competitor-benchmarker.md` | Bloomberg/Allegro/Endur comparison, table stakes gaps, differentiators |
| 6 | Front-End Craft Expert | `.claude/agents/frontend-craft-expert.md` | AG Grid config, CSS quality, edge cases, production-readiness, React translatability |

## What They Review

The hero pages from the template library — focusing on the Phase 2 themes (D, E, F) which have the advanced interaction patterns:

**Theme D (Front Office):** Dashboard, Quick Entry + Blotter, AG Grid Blotter, Position Ladder
**Theme E (Back Office):** Dashboard, Invoice Queue (inline edit), Reconciliation, Trade Form, Nominations, Contract Wizard
**Theme F (Unified):** Dashboard (role selector), Quick Entry, Blotter, Positions, Trade Form, Invoices, Nominations, Reconciliation

Each agent also reviews the index page to assess overall coherence.

## Review Process

### Round 1: Independent Reviews (Parallel)
Each agent reviews independently. No collaboration. Raw first impressions.

**Deliverable per agent:** Numbered issue list with:
- Issue description
- Severity: **Blocker** (would kill a deal) / **Major** (significant problem) / **Minor** (noticeable but not blocking) / **Polish** (nice to fix)
- Affected page(s)
- Specific fix recommendation
- Score per their framework

**Output:** `analysis/first-customer-review/round-1-{agent-name}.md`

### Round 2: Cross-Examination & Prioritisation
I synthesise all Round 1 findings. Identify:
- Issues flagged by 3+ agents (consensus problems)
- Disagreements (trader wants dense, UX wants spacious — how to resolve)
- Top 10 highest-impact fixes
- What's actually differentiating vs what's table stakes

**Output:** `analysis/first-customer-review/round-2-synthesis.md`

### Round 3: Redesign Brief
Produce specific, actionable fix specifications:
- For each of the Top 10 issues: exact before/after description
- Priority order for implementation
- Which fixes apply across themes vs theme-specific
- Updated scoring after proposed fixes

**Output:** `analysis/first-customer-review/round-3-fix-spec.md`

## Success Criteria

The review is successful if:
1. We identify the 10 changes that would make the biggest difference
2. Each change is specific enough to implement (not "make it better" but "change X to Y because Z")
3. The changes are prioritised by impact on a competitive demo
4. After implementing the top 5 fixes, the template would survive a 30-minute demo with a Head of Trading Technology without a deal-breaker emerging
