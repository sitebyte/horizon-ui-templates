# Horizon UI Templates — Project Resume

**Last updated:** 19 April 2026
**Repo:** https://github.com/sitebyte/horizon-ui-templates
**Live site:** https://sitebyte.github.io/horizon-ui-templates/
**Stats:** 83 HTML pages, 34 analysis docs, 14 commits, 7 themes + 3 variations

---

## Quick Start

The **consolidated Horizon theme** is the production-ready direction. Start here:
```
https://sitebyte.github.io/horizon-ui-templates/horizon/
```

The hub page shows all themes and variations:
```
https://sitebyte.github.io/horizon-ui-templates/
```

---

## What Exists

### Consolidated Horizon Theme (`horizon/` — 17 pages)
The production candidate. Shared shell architecture (shell.css 1,344 lines + shell.js 728 lines), zero code duplication across pages, every sidebar link goes to a working page.

**Scored 8.7/10 by competitor review agency (Blackthorn Digital).**

| Page | Key Features |
|------|-------------|
| `shell.css` | Design tokens: 5 surface tiers, semantic colors, component styles, AG Grid overrides, skeleton animations |
| `shell.js` | Sidebar builder with accordion menus + role selector + badges, Cmd+K command palette, price ticker, toast with undo, combobox with keyboard nav, theme toggle |
| `index.html` | Role-adaptive dashboard — Trader/Operations/Manager toggle changes all content |
| `quick-entry.html` | Quick trade entry with confirmation bar + undo, delivery terms, proper keyboard combobox, AG Grid blotter with P&L/MTM columns |
| `blotter.html` | Full AG Grid (48 rows), MTM + Unrealized P&L, status filters, column toggle, CSV export, right-click context menu (View/Amend/Cancel) |
| `positions.html` | Position ladder with WACOG, physical/paper split, heat-map intensity, cell drill-down to underlying trades, keyboard arrow nav |
| `trade-form.html` | Full form with combobox keyboard nav, conditional pricing sections, inline validation, position impact preview |
| `invoices.html` | AG Grid with inline status dropdown editing, checkbox selection, bulk approve button |
| `nominations.html` | Cascading form: contract → cargo → vessel → auto-ETA calculation |
| `reconciliation.html` | Side-by-side provisional vs final diff with highlighted differences, tolerance check |
| `contracts.html` | 4-step wizard with per-step validation |
| `curves.html` | Forward curves (3 benchmark cards with CSS bar charts), comparison table, spread monitor with range bars |
| `hedges.html` | Hedge book: KPIs, hedge ratio by quarter, paper trades table, physical vs paper comparison |
| `cargo-board.html` | Gantt timeline with 8 cargo rows, phase-colored bars, expandable detail panels with status transitions |
| `audit-log.html` | Filterable table + timeline with field-level diffs |
| `lifecycle.html` | **The Golden Path** — full trade lifecycle (capture → approval → nomination → loading → voyage → discharge → settlement → P&L) in a vertical timeline. Blackthorn called this "unprecedented in the ETRM market" |
| `settings.html` | Role selector, keyboard shortcuts reference, preferences |
| `signin.html` | Branded indigo→violet gradient, premium sign-in |
| `error-404.html` | Clean branded error page |

### Specialist Variations (`variations/` — 3 pages)
Built on the Horizon shell, each pushes one dimension to its extreme.

| Variation | Focus |
|-----------|-------|
| `trader-speed.html` | 8-keystroke trade capture with live keystroke counter, auto-completing counterparty, pre-filled defaults |
| `ops-accuracy.html` | Invoice where every number is calculated/locked with source tracing, override requires reason + second approver |
| `demo-narrative.html` | Marketing-quality 15-minute guided pitch page with scroll-triggered sections, hero stats, "Request a Pilot" CTA |

### Design Exploration Themes (archived — for reference, not active development)

| Theme | Pages | Identity | Status |
|-------|-------|----------|--------|
| A: Horizon Pro | 11 | Clean enterprise, indigo, shadow cards | Archived |
| B: Trading Terminal | 11 | Dense monospace, emerald, icon sidebar | Archived |
| C: Meridian Glass | 12 | Glassmorphism, violet, Plus Jakarta Sans | Archived |
| D: Front Office | 7 | Ultra-compact, teal, keyboard-first | Best CSS architecture (shell.js/css pattern adopted for Horizon) |
| E: Back Office | 10 | Professional, blue, workflow-oriented | Best back-office pages (invoice, reconciliation, wizard, audit) |
| F: Unified ETRM | 11 | Adaptive, role-aware, indigo+violet | Feature prototype that Horizon consolidated from |

---

## Review History

### Phase 1: Design Agency (Meridian Design Co.)
3 rounds with Lead UI Designer, Lead UX Designer, Design BA.
- Scored existing Horizon app UI 3.3/10 for design maturity
- Defined 25-component inventory, 6 template specs
- Recommended Approach C (Adaptive Workspace)
- **Docs:** `docs/agency-review-round-{1,2,3}.md`, `docs/implementation-plan.md`

### Phase 2: Front/Back Office Research
3 rounds with UI Lead, UX Lead, LNG BA (Ravi).
- Full ETRM menu hierarchy (60+ items)
- 5 form patterns, front/back office persona matrix
- **Docs:** `docs/round-{1,2,3}-*.md`

### First Customer Review (6-agent panel)
Independent reviews from: Head of Trading Technology (7.4/10), Desk Trader (6.8-8.0/10), Operations Manager (5.2-6.6/10), UX Specialist, Competitor Benchmarker (vs Allegro 7-8/10), Frontend Craft Expert.

**Consensus:** Theme F is the base. Fix audit trails, keyboard nav, missing data fields.

**Top 3 blockers identified and fixed:**
1. ~~No confirmation on trade entry~~ → Added confirmation bar + undo
2. ~~No P&L in blotter~~ → Added MTM + Unrealized P&L columns
3. ~~No WACOG in positions~~ → Added WACOG + physical/paper split + heat map

**Docs:** `docs/customer-review/round-{1,2,3}-*.md`, `docs/customer-review/vision-*.md`

### Vision Documents (6 perspectives, 222KB)
All 6 agents answered: "What makes the most intuitive, accuracy-first trading system?"

**The 10 Principles:**
1. Constrain, don't validate — make invalid input impossible
2. Show consequences before commitment
3. One number, one source, one format
4. Keyboard-first with guardrails
5. Four-eyes enforced by the system
6. Deadline-driven, not task-driven
7. Reconciliation is the accuracy test
8. Audit is context, not logging
9. Progressive disclosure with full depth
10. The system learns from errors

**Docs:** `docs/customer-review/vision-*.md`, `docs/customer-review/vision-synthesis.md`

### Competitor Review (Blackthorn Digital — 3 consultants)
Katya Petrov (5.5/10), James Okonkwo (7.2/10), Mei-Lin Zhang (7.5/10).

**Key findings:**
- "6 stories, not one" → Led to consolidated Horizon theme
- Theme D has the right architecture, Theme F has the right features → Merged
- Position ladder, reconciliation diff, role-adaptive dashboard are genuine differentiators
- Glassmorphism is wrong for trading → Dropped Theme C patterns

**Round 4 (reviewing consolidated Horizon):** 8.7/10
- "Demo-ready after fixing context menu bug" (fixed)
- "The lifecycle page alone justifies the investment"
- Brand adherence scored 10/10

**Docs:** `docs/customer-review/round-1-{katya,james,mei-lin}*.md`, `docs/customer-review/round-{2,3,4}-*.md`

---

## Agent Files

12 review agents defined in the main ETRM project at `/Users/jonathancobley/projects/next-gen-lng-etrm/.claude/agents/`:

**Original project agents:** senior-lng-trader, frontend-ux-analyst, ba-pm-orchestrator, risk-product-control, senior-lng-operator, tech-lead, domain-model-architect, ai-systems-specialist, data-pipeline-specialist, testing-security-auditor, implementation-builder, physical-logistics-solver-specialist

**Customer review agents:** head-of-trading-tech, desk-trader-reviewer, ops-manager-reviewer, ux-critique-specialist, competitor-benchmarker, frontend-craft-expert

---

## Technology

| Component | Choice |
|-----------|--------|
| CSS | Tailwind CDN |
| Data Grid | AG Grid Community v31.3 (CDN) |
| Fonts | Inter + JetBrains Mono (Google Fonts CDN) |
| Charts | CSS-only (bars, donuts, sparklines, Gantt) |
| Interactions | Vanilla JS (combobox, command palette, cascading forms, theme toggle, confirmation/undo) |
| Responsive | rem/% only, zero px values |
| Hosting | GitHub Pages (auto-deploys from main) |
| Testing | Playwright (local, screenshots in gitignored directory) |

---

## Playwright Test Results

Last full run: 18 April 2026
- **18 pages tested (horizon + variations), 0 failures, 0 JS errors**
- All AG Grids rendering (blotter 48 rows, invoices 12 rows, quick-entry 6 rows)
- All sidebar links verified — zero broken hash links
- All back buttons present

---

## Next Steps (Priority Order)

### Immediate (from Blackthorn Round 4 remaining issues)
- [ ] Add clear button to combobox UI
- [ ] Show error state pattern on at least one page (CSS exists in shell.css but unused)
- [ ] Extract audit trail as inline component on entity detail views (currently standalone page only)
- [ ] Fix trade-form.html duplicating combobox implementation instead of using shared one from shell.js
- [ ] Remove duplicated skeleton CSS from individual pages (already in shell.css)

### Short-term (accuracy-first implementation)
- [ ] Input constraints: volume sanity bands, price deviation warnings, port filtering by delivery terms
- [ ] Formula transparency: show calculation breakdown on hover for every computed number
- [ ] State machine enforcement: trade/invoice/nomination status transitions enforced in UI
- [ ] Four-eyes approval workflow: creator cannot approve own entity
- [ ] Cross-entity navigation: trade links to cargo/nomination/invoice

### Medium-term
- [ ] Convert to React components using shadcn/ui + AG Grid React
- [ ] Connect to live Horizon backend (replace mock data with TanStack Query hooks)
- [ ] Real WebSocket price streaming (replace setInterval ticker)
- [ ] AI accuracy layer: anomaly detection on trade entry, pattern matching against past corrections

### Longer-term
- [ ] Multi-window/multi-monitor support
- [ ] Saved workspace layouts
- [ ] Print-optimized views for reports
- [ ] Mobile-optimized views for management reporting

---

## File Structure

```
horizon-ui-templates/
├── index.html                    # Hub page — all themes + variations
├── resume.md                     # This file
├── .gitignore                    # Excludes screenshots/
├── README.md                     # Original readme
│
├── horizon/                      # PRODUCTION THEME (17 pages)
│   ├── shell.css                 # Design tokens + component styles (1,344 lines)
│   ├── shell.js                  # Shared shell builder (728 lines)
│   ├── index.html                # Role-adaptive dashboard
│   ├── quick-entry.html          # Quick trade + AG Grid blotter
│   ├── blotter.html              # Full AG Grid blotter with P&L
│   ├── positions.html            # Position ladder + WACOG + drill-down
│   ├── trade-form.html           # Full trade entry with validation
│   ├── invoices.html             # Invoice queue with inline edit
│   ├── nominations.html          # Cascading nomination form
│   ├── reconciliation.html       # Side-by-side diff
│   ├── contracts.html            # Multi-step wizard
│   ├── curves.html               # Forward curves + spread monitor
│   ├── hedges.html               # Hedge book
│   ├── cargo-board.html          # Gantt timeline
│   ├── audit-log.html            # Audit trail
│   ├── lifecycle.html            # Golden Path trade lifecycle
│   ├── settings.html             # Settings + shortcuts
│   ├── signin.html               # Branded sign-in
│   └── error-404.html            # Error page
│
├── variations/                   # SPECIALIST VARIATIONS (3 pages)
│   ├── trader-speed.html         # 8-keystroke trade capture
│   ├── ops-accuracy.html         # Zero-manual-calc invoice
│   └── demo-narrative.html       # Marketing pitch page
│
├── theme-a/ through theme-f/    # ARCHIVED DESIGN EXPLORATION (62 pages)
│
└── docs/                         # ANALYSIS DOCUMENTS (34 files)
    ├── agency-review-round-{1,2,3}.md
    ├── implementation-plan.md
    ├── round-{1,2,3}-*.md
    └── customer-review/
        ├── round-{1,2,3,4}-*.md
        ├── vision-{6 perspectives}.md
        └── vision-synthesis.md
```
