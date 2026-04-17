# Horizon UI Templates — Project Resume

**Last updated:** 17 April 2026
**Repo:** https://github.com/sitebyte/horizon-ui-templates
**Live site:** https://sitebyte.github.io/horizon-ui-templates/

---

## What This Is

A design template library for an LNG ETRM (Energy Trading and Risk Management) platform. 6 visually distinct themes, 63 HTML pages total, all using Tailwind CSS, AG Grid Community, and vanilla JS. Every page has dark/light theme toggle, responsive layout (rem-based, no fixed pixels), and a "Back to All Themes" navigation button.

---

## Current State

### Themes A-C (Phase 1 — Visual Design Exploration)

Three themes demonstrating different visual identities applied to the same 11 page types (Dashboard, AG Grid, Tables, Forms, Cards, Charts, Profile, Settings, Invoice, Sign In, 404).

| Theme | Identity | Pages | Accent | Key Trait |
|-------|----------|-------|--------|-----------|
| **A: Horizon Pro** | Clean enterprise (Linear/Vercel) | 11 | Indigo | Shadow cards, wide sidebar, comfortable spacing |
| **B: Trading Terminal** | Dense data-first (Bloomberg) | 11 | Emerald | Monospace, icon sidebar, compact |
| **C: Meridian Glass** | Premium glassmorphism (Raycast/Arc) | 12 | Violet | Backdrop-blur, Plus Jakarta Sans, spacious |

**Status:** Complete. Reviewed. UX critique recommends using Theme F as the production base, not these. Themes A-C are useful as design references but should not be developed further.

### Themes D-F (Phase 2 — Advanced Interaction Patterns)

Three themes demonstrating functional patterns specific to trading applications: multi-level menus, keyboard-first design, front office vs back office workflows, AG Grid inline editing, cascading forms.

| Theme | Identity | Pages | Focus | Key Patterns |
|-------|----------|-------|-------|-------------|
| **D: Front Office Workspace** | Dark, monospace, teal | 7 | Traders | Quick trade entry (keyboard B/S + Tab + Enter), AG Grid blotter with context menu, position ladder with cell drill-down, keyboard shortcuts |
| **E: Back Office Operations** | Light, professional, blue | 10 | Operations | AG Grid inline status editing + bulk approve, cascading nomination form (contract → cargo → vessel → ETA), multi-step contract wizard, side-by-side reconciliation, audit log |
| **F: Unified ETRM** | Adaptive, role-aware, indigo+violet | 11 | Both | Role selector (Trader/Ops/Manager) changes dashboard, BOTH quick entry AND full forms, BOTH dense blotter AND comfortable invoice grids, all patterns from D+E combined |

**Status:** Complete. Blocker fixes applied. Theme F is the recommended production direction per all 6 reviewers.

### Blocker Fixes Applied (on Theme F)

| Fix | File | What Changed |
|-----|------|-------------|
| Confirmation step | `theme-f/quick-entry.html` | Enter shows confirmation bar with trade summary before committing. Undo available for 5 seconds after confirm. |
| Delivery terms | `theme-f/quick-entry.html` | Added FOB/DES/CIF/DAP dropdown in quick entry strip |
| P&L/MTM columns | `theme-f/blotter.html` | Added MTM and Unrealized P&L columns, calculated from benchmark prices, green/red coloring, total in header |
| AG Grid safety | `theme-f/blotter.html` | Added getRowId, null-safe valueFormatters, XSS prevention via escapeHtml() |

---

## Review Process Completed

### Phase 1: Design Agency Review (Meridian Design Co.)
3 rounds with Lead UI Designer (Sasha), Lead UX Designer (Marcus), Design BA (Elena).
- Round 1: Discovery & UX Audit — scored existing Horizon UI 3.3/10 for design maturity
- Round 2: Design System & Pattern Library — 25 components, 6 template specs, AG Grid config
- Round 3: Final Specification — client delivery plan, 8.6/10 readiness score

### Phase 2: Front/Back Office Research
3 rounds with UI Lead, UX Lead, LNG BA (Ravi).
- Mapped full ETRM menu hierarchy (60+ items with sub-menus)
- Defined 5 form patterns (quick entry, full form, wizard, cascading, inline grid)
- Front office vs back office persona matrix
- Theme D/E/F specifications

### First Customer Review (6-agent panel)
6 independent reviewers scoring the templates as if evaluating for purchase:

| Reviewer | Score | Key Finding |
|----------|-------|-------------|
| Head of Trading Technology | 7.4/10 | "Strong enough for second meeting, not yet for signed LOI" |
| 10-Year Desk Trader | 6.8-8.0/10 | Missing P&L in blotter, WACOG in positions (both now fixed in blotter) |
| Operations Manager | 5.2-6.6/10 | Auditability 3.9/10, no four-eyes principle |
| UX Critique Specialist | Varies | "Theme F only production candidate. Zero loading/empty/error states" |
| Competitor Benchmarker | vs Allegro 7-8/10 | "Most modern ETRM evaluated. Role-adaptive dashboard genuinely novel" |
| Frontend Craft Expert | 5-9/10 | "Domain accuracy excellent. Null-unsafe formatters, XSS in dropdowns" (now fixed) |

**Consensus:** Theme F is the base. Absorb Theme D's density/keyboard patterns and Theme E's back-office pages.

### Vision Documents (6 perspectives)
All 6 reviewers answered: "What would make a really intuitive and easy to use trading system with accuracy as the top priority?"

**The 10 Principles of Accuracy-First Trading UI:**
1. Constrain, don't validate — make invalid input impossible
2. Show consequences before commitment — live position/credit/hedge impact
3. One number, one source, one format — every number traceable with unit
4. Keyboard-first with guardrails — speed through constraints, not despite them
5. Four-eyes enforced by the system — can't approve your own trade
6. Deadline-driven, not task-driven — sorted by urgency
7. Reconciliation is the accuracy test — auto-compare, auto-flag breaks
8. Audit is context, not logging — show WHY, not just what
9. Progressive disclosure with full depth — every number is a door
10. The system learns from errors — AI flags patterns from past corrections

---

## Documentation Index

```
docs/
├── agency-review-round-1.md          # Design agency discovery & audit
├── agency-review-round-2.md          # Design system & pattern library
├── agency-review-round-3.md          # Final spec & client plan
├── implementation-plan.md            # 7-phase, 22-week roadmap
├── round-1-current-state-assessment.md   # Ravi's initial assessment
├── round-1-discovery.md              # Phase 2 front/back office discovery
├── round-2-design-patterns-and-technology.md
├── round-2-specification.md          # Theme D/E/F page specs
├── round-3-consolidated-proposals.md
├── round-3-final-analysis.md         # Final analysis before build
└── customer-review/
    ├── review-plan.md                # Customer review process
    ├── round-1-trading-tech-head.md  # CTO buyer review
    ├── round-1-desk-trader.md        # Trader review
    ├── round-1-ops-manager.md        # Operations review
    ├── round-1-ux-critique.md        # UX specialist review
    ├── round-1-competitor-benchmark.md # vs Bloomberg/Allegro/Endur
    ├── round-1-frontend-craft.md     # Frontend engineer review
    ├── round-2-synthesis.md          # Prioritised top 10 fixes
    ├── round-3-fix-spec.md           # Exact before/after for each fix
    ├── vision-trading-tech-head.md   # What makes the best trading UI
    ├── vision-desk-trader.md         # Trader's accuracy vision
    ├── vision-ops-manager.md         # Operations accuracy vision
    ├── vision-ux-specialist.md       # UX accuracy patterns
    ├── vision-competitor-benchmark.md # Competitive accuracy analysis
    ├── vision-frontend-craft.md      # Technical accuracy patterns
    └── vision-synthesis.md           # Consolidated 10 principles
```

---

## Next Steps (Priority Order)

### Week 2 Fixes (High Impact, from customer review)
- [ ] **WACOG + physical/paper split in position ladder** — each cell shows volume, WACOG, P&L, physical vs paper breakdown (`theme-f/positions.html`)
- [ ] **Combobox keyboard navigation** — Arrow keys, Enter, Escape, Tab all work properly in all searchable dropdowns
- [ ] **Loading/empty/error states** — skeleton screens, helpful empty states, error banners with retry across all pages

### Week 3 Fixes (Completeness)
- [ ] **Audit trail panel** — "History" tab on trade/invoice detail with who/what/when/why
- [ ] **Cross-entity navigation links** — trade links to cargo, nomination, invoice; invoice links to trade
- [ ] **Shared shell architecture** — adopt Theme D's `shell.js`/`shell.css` pattern for Theme F (eliminate 230 lines of duplication per page)

### Accuracy-First Implementation (from vision documents)
- [ ] **Input constraints** — volume sanity bands, price deviation warnings, port filtering by delivery terms
- [ ] **Formula transparency** — show calculation breakdown on hover for every computed number
- [ ] **State machine enforcement** — trade/invoice/nomination status transitions enforced in UI matching backend rules
- [ ] **Four-eyes approval workflow** — creator cannot approve their own entity
- [ ] **Reconciliation auto-matching** — provisional vs final with tolerance check and auto-approve

### Longer Term
- [ ] **Consolidate into single production theme** — merge best of D/E into F as the canonical implementation
- [ ] **Convert to React components** — translate HTML templates into shadcn/ui + AG Grid React components
- [ ] **Connect to live Horizon backend** — replace mock data with TanStack Query hooks
- [ ] **AI accuracy layer** — anomaly detection on trade entry, pattern matching against past corrections

---

## Technology

| Component | Choice | Notes |
|-----------|--------|-------|
| CSS | Tailwind CDN | All themes use Tailwind utility classes exclusively |
| Data Grid | AG Grid Community v31.3 (CDN) | 9 pages have working AG Grid with sort/filter/selection |
| Fonts | Inter, JetBrains Mono, Plus Jakarta Sans (Google Fonts CDN) | Theme-dependent |
| Charts | CSS-only (bars, donuts, sparklines) | No chart library — placeholder for Recharts/Lightweight Charts |
| Interactions | Vanilla JS | Command palette, combobox search, conditional forms, theme toggle |
| Responsive | rem/% only, zero px | Sidebar collapses on mobile, grids scroll horizontally |
| Hosting | GitHub Pages | Auto-deploys from main branch |

---

## Playwright Audit Results

Last run: 12 April 2026
- **33 pages tested, 0 failures, 0 JS errors**
- All AG Grids rendered (12-48 rows each)
- 66 screenshots captured (dark + light per page)
- Screenshots stored locally in `screenshots/` (gitignored)

---

## Agent Files

6 customer review agents defined in the main ETRM project at `.claude/agents/`:
- `head-of-trading-tech.md` — CTO buyer persona
- `desk-trader-reviewer.md` — 10-year desk trader
- `ops-manager-reviewer.md` — Back office operations manager
- `ux-critique-specialist.md` — Enterprise UX expert (ex-Pentagram/frog)
- `competitor-benchmarker.md` — Bloomberg/Allegro/Endur analyst
- `frontend-craft-expert.md` — Trading UI developer (ex-Citadel)

These agents can be re-used for future review rounds as the templates evolve.
