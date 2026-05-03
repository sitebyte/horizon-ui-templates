# Phase 3: Research, Analysis & Design Direction

## Context
The user wanted a team to research commodities trading UI/UX, compare against the templates, have "Jon Ive" orchestrate design direction, produce 3 rounds of review, and create an implementation plan for v3.

## Prompt Process

### Step 1: Research (8 parallel web searches + 4 page fetches)

**Search queries:**
1. `commodity trading platform UI design 2025 2026 Trayport ION Openlink`
2. `Jony Ive design principles information density enterprise software clarity simplicity`
3. `TradingView UI design system dark mode data visualization`
4. `LNG ETRM software Molecule Brady Allegro ION XTP interface`
5. `Trayport Joule trading screen market matrix UI layout`
6. `enterprise application UI dense data tables split pane docking Bloomberg`
7. `financial trading dashboard micro-interactions typography monospace numbers`
8. `Molecule ETRM cloud modern interface commodity trading SaaS`

**Page fetches:**
- mattstromawn.com/writing/ui-density/ — Visual density, information density, design density, temporal density, value density
- medium.com/pulsar — Enterprise data table design principles
- molecule.io/solutions/traders — Modern ETRM features, conversational trade entry, customizable views
- designative.info — Jony Ive's evolution from minimalism to meaning

### Step 2: Round 1 — Competitive Landscape
Wrote `round-1-competitive-landscape.md`:
- Mapped the competitive field: ION (Allegro/Endur/RightAngle), Molecule, Trayport Joule, TradingView, Bloomberg
- Identified where Horizon wins (role-adaptive, LNG-specific, visual quality, quick entry, reconciliation UX)
- Identified where Horizon loses (no workspace customization, static data, thin settlement, no cross-entity nav)
- Applied Ive lens: "Horizon should achieve density through coherence"

### Step 3: Round 2 — UX Audit
Wrote `round-2-ux-audit-current-state.md`:
- Scored all 15 v2 pages (7-9/10 range, average 7.9)
- Identified cross-cutting issues: spacing too generous, no visual hierarchy between panels, sidebar passive, ticker static, no cross-page navigation
- Applied Ive lens: "Care would look like... every number aligned, P&L that visually pops, transitions that feel purposeful"

### Step 4: Round 3 — Design Direction
Wrote `round-3-design-direction.md`:
- Defined "Disciplined Density" approach with 5 principles:
  1. Data Is the Interface (remove card wrappers)
  2. Numbers Are Sacred (tabular-nums, bold P&L)
  3. Hierarchy Through Density Variation
  4. Connected, Not Isolated (clickable entities, context strip)
  5. Motion Is Feedback
- Specific CSS changes required
- Page-by-page recommendations

### Step 5: Synthesis
Wrote `synthesis-and-plan.md`:
- Executive summary: "right content, wrong spatial relationship"
- Clear UI/UX approach table (what to do / what NOT to do)
- v3 implementation plan: 5 phases, versioning strategy (v1/v2/v3 all preserved)
- Success criteria: no scrolling on primary content, every number aligned, every entity clickable

## Key Insights

### From the Research
- **Bloomberg**: Density through speed, not through cramming. Zero-latency is the real feature.
- **Trayport Joule**: Market matrix pattern — benchmark x period with bid/ask/last in each cell.
- **Molecule**: Modern ease-of-use challenger. Natural language trade entry. 90-day implementation.
- **UI Density article**: Value density = value / (time + space). Optimize for value, not pixels.
- **Jony Ive**: "Simplicity is about bringing order to complexity" — not removing, but ordering.

### Design Direction Chosen
"Disciplined Density" — tighten composition (25% spacing reduction), strengthen hierarchy (borderless primary panels, bold P&L), connect pages (entity links, context strip). NOT adding features — reorganizing what exists.

## Outcome
4 analysis documents totaling 601 lines. Clear v3 plan with specific CSS changes, page-by-page recommendations, and success criteria. All sources cited.
