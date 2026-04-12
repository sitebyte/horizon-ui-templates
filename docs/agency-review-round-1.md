# MERIDIAN DESIGN CO.
## Project Horizon — Round 1: Discovery & UX Audit

**Client:** Jonathan Cobley, Project Horizon
**Engagement:** Enterprise ETRM UI Design System & Template Library
**Date:** 11 April 2026

---

### Participants

| Role | Name | Focus |
|------|------|-------|
| Lead UI Designer | Sasha Koval | Visual design, component architecture, design tokens, dark/light theming |
| Lead UX Designer | Marcus Chen | Interaction patterns, user flows, information architecture, accessibility |
| Design BA / Orchestrator | Elena Torres | Client requirements, prioritization, deliverable scope, agency process |

---

## 1. How We Work

At Meridian, enterprise design engagements follow a four-phase process:

**Phase 1 — Discovery & Audit** (this document)
We audit what exists, understand user personas, map workflows, and identify the full taxonomy of screen types needed. No design yet — just understanding.

**Phase 2 — Design System & Pattern Library**
We define the atomic components (buttons, inputs, badges), molecular patterns (search combobox, data grid row, metric card), and organism templates (dashboard layout, master-detail view, data entry form). Each gets a specification.

**Phase 3 — Template Specification & Prototype**
We build functioning HTML/CSS prototypes for every screen template, with real interactions (AG Grid sorting, form validation, dark/light toggle, command palette). These are the reference implementations developers code against.

**Phase 4 — Handoff & Implementation Support**
Developer-ready specs, component API documentation, interaction annotations. We stay available for questions during build.

**What you're paying for:** Not just "nice screens" — a **system** that scales. Every new screen your team builds should be assemblable from the template library without calling us back.

---

## 2. Lead UI Designer Audit — Sasha Koval

### 2.1 What I Reviewed
All 13 existing views, the component directory (empty), the Tailwind config, the CSS custom properties, and the overall visual language.

### 2.2 Visual Language Assessment

**Current state:** The app has no visual language. It has Tailwind utility classes applied directly, which means:
- No design tokens (colors, spacing, typography are ad-hoc)
- No component consistency (buttons are styled inline in 8+ different files)
- No elevation system (everything is flat border + rounded-lg)
- No motion/animation vocabulary
- The `ui/` directory is empty — there is literally no shared component library

**What works:** The color semantics are instinctively correct — green for buy/long/positive, red for sell/short/negative, amber for warnings. The cargo phase colors are well chosen. Monospace font for numbers is correct.

**What doesn't:** Every view reinvents basic patterns. `formatCurrency` is defined 6 times. Status badges are rebuilt in every file. There's no spacing rhythm — some cards use p-4, others p-5, others p-6 with no rationale.

### 2.3 Dark/Light Theme Analysis

The codebase has `dark:` Tailwind classes scattered throughout, suggesting dark mode was intended. But:
- No theme toggle exists
- No CSS custom properties for theme colors
- No semantic color tokens (e.g., `--color-surface`, `--color-text-primary`)
- The dark mode classes are incomplete — some components would break

**Recommendation:** Build the design system dark-first (traders prefer it), with light mode as an inversion. Use CSS custom properties for all semantic colors, not hardcoded Tailwind classes.

### 2.4 Typography Audit

| Usage | Current | Recommendation |
|-------|---------|----------------|
| Page title | text-2xl font-bold (inconsistent) | 24px/700, tracked tight |
| Section header | text-lg font-semibold (inconsistent) | 18px/600 |
| Body text | text-sm (14px) | 14px/400 for standard, 13px for compact |
| Data cell | text-sm font-mono (sometimes text-xs) | 12px/500 monospace for ALL numeric data |
| Label | text-xs text-muted-foreground | 11px/500 uppercase tracking-wide |
| Caption | text-xs | 11px/400 |

**Critical missing typeface decision:** The app uses system fonts. For a trading platform, I recommend Inter for UI text and JetBrains Mono for numeric data. Both are free, both are optimized for screen readability at small sizes.

### 2.5 Elevation & Surface System

**Current:** One level — flat cards with `border rounded-lg bg-card`. Everything is at the same visual depth.

**Recommendation — 4 elevation levels:**
| Level | Usage | Treatment |
|-------|-------|-----------|
| 0 - Canvas | Page background | `--color-canvas` |
| 1 - Surface | Cards, panels, sidebar | `--color-surface` + 1px border |
| 2 - Raised | Dropdowns, popovers, tooltips | `--color-raised` + shadow-md |
| 3 - Overlay | Modals, command palette, sheets | `--color-overlay` + shadow-xl + backdrop blur |

---

## 3. Lead UX Designer Audit — Marcus Chen

### 3.1 Screen Type Taxonomy

After reviewing all 13 views and the backend API surface, I've identified **8 distinct screen types** that the template library must support. Every screen in the app (and future screens) is one of these:

| # | Screen Type | Current Examples | Key Pattern |
|---|------------|------------------|-------------|
| 1 | **Dashboard** | Dashboard.tsx | KPI cards + charts + alert feed + quick actions |
| 2 | **Master-Detail List** | ContractsView.tsx | Filterable list left, entity detail right |
| 3 | **Data Grid View** | TradesList, NominationsTable, InvoicesTable | Sortable/filterable/exportable tabular data |
| 4 | **Complex Data Entry** | TradeForm.tsx, ContractForm.tsx | Multi-section form with conditional fields, lookups, validation |
| 5 | **Timeline/Gantt** | CargoSchedulingBoard.tsx | Time-axis visualization with entity rows |
| 6 | **Map/Spatial** | CargoMap.tsx | Geographic visualization with data overlay |
| 7 | **Narrative/Content** | BriefingCard.tsx, DiscoveryPanel.tsx | AI-generated content with structured sections |
| 8 | **Calculator/Tool** | VoyageCalculator, DemurrageCalculator | Input form + computed result display |

**Key insight:** Templates 1-4 cover ~80% of all enterprise application screens, not just trading. If we nail these four, they're reusable across any data-intensive application.

### 3.2 Interaction Pattern Inventory

Every template needs these interaction patterns. Current coverage:

| Pattern | Exists? | Quality | Priority |
|---------|---------|---------|----------|
| Sortable columns | No | N/A | P0 |
| Column filtering | No | N/A | P0 |
| Row selection (single) | Partial (click to open detail) | 5/10 | P0 |
| Row selection (multi + bulk actions) | No | N/A | P1 |
| Searchable combobox / typeahead | No | N/A | P0 |
| Right-click context menu | No | N/A | P1 |
| Command palette (Cmd+K) | No | N/A | P0 |
| Inline cell editing | No | N/A | P2 |
| Drag-and-drop reorder | No | N/A | P2 |
| Form conditional sections | Partial (pricing basis toggle) | 6/10 | P0 |
| Form inline validation | No | N/A | P0 |
| Toast notifications | No | N/A | P1 |
| Confirmation dialogs | No | N/A | P0 |
| Dark/light theme toggle | No | N/A | P0 |
| Keyboard shortcuts | No | N/A | P1 |
| Resizable split panels | No | N/A | P2 |
| Breadcrumb navigation | No | N/A | P1 |
| Skeleton loading states | No (text "Loading...") | 2/10 | P1 |
| Empty states with actions | Partial (some views) | 6/10 | P1 |
| Error states with retry | Partial (text only) | 4/10 | P1 |

### 3.3 User Flow Gaps

**Trade Lifecycle Flow (Critical Gap):**
```
[Create Trade] → ??? → [View in List] → ??? → [See Position Impact]
                                         → ??? → [Nominate Cargo]
                                         → ??? → [Create Invoice]
```
There is no connected flow. Each view is an island. A user creating a trade cannot then navigate to the resulting position, or create a nomination against it, or see its cargo status.

**The Golden Path must work:**
Trade Entry → Trade in Blotter → Link to Cargo → Cargo on Map → Nomination → Invoice → Settlement

### 3.4 Accessibility Gaps

| Concern | Status |
|---------|--------|
| Focus management (modals, slide-overs) | Not implemented |
| Keyboard navigation (tables, forms) | Not implemented |
| ARIA labels | Not implemented |
| Color contrast (dark mode) | Untested |
| Screen reader support | Not implemented |
| Reduced motion preference | Not implemented |

These are not nice-to-haves — they affect all users. Focus management for modal forms and keyboard navigation for grids are usability requirements even for sighted users.

---

## 4. Elena Torres — BA Synthesis

### 4.1 What the Client Actually Needs

Jonathan hasn't asked for a redesign of the trading app. He's asked for a **template library** — reusable screen templates that demonstrate best-practice patterns for:
- Information display (dashboards, data grids)
- Data entry (complex forms with lookups and conditional fields)
- Navigation and workflow
- Data visualization
- Dark/light theming

These templates need to work for trading but also be **generic enough to serve as implementation patterns** for any enterprise application.

### 4.2 Template Deliverable Scope

Based on the screen type taxonomy, we will deliver **functioning HTML prototypes** for:

| Template | Shows | Key Components Demonstrated |
|----------|-------|-----------------------------|
| T1: Dashboard | KPIs, charts, alerts, quick actions | MetricCard, Sparkline, AlertFeed, QuickAction |
| T2: Master-Detail | List with filters + detail panel | DataGrid (AG Grid), EntityDetail, TabPanel, StatusBadge |
| T3: Data Grid | Full-featured sortable/filterable grid | AG Grid with dark theme, column menu, row selection, export, context menu |
| T4: Complex Form | Multi-section form with lookups | Combobox, ConditionalSection, InlineValidation, FormPreview |
| T5: Timeline | Gantt-style visualization | TimelineGrid, PhaseBar, DetailPanel |
| T6: Settings/Config | System configuration page | SettingsGroup, ToggleRow, form sections |

**Each template will include:**
- Dark mode and light mode (toggle)
- AG Grid integration (where applicable)
- Tailwind CSS exclusively (no other CSS frameworks)
- Mock data (realistic, not lorem ipsum)
- Working interactions (sort, filter, theme toggle, form validation)
- Responsive behavior (desktop primary, tablet secondary)
- Documented component patterns

### 4.3 What We Will NOT Deliver

- A full React component library (that's implementation, not design)
- Backend integration
- Mobile-optimized views
- Accessibility certification (we'll follow best practices but not audit)
- Animation specifications beyond functional transitions

### 4.4 Risk: The AG Grid Question

AG Grid Community Edition is free (MIT) and covers: sorting, filtering, column pinning, row selection, CSV export, theming. AG Grid Enterprise adds: row grouping, pivoting, clipboard, server-side row model, Excel export — but requires a commercial license.

**Recommendation:** Design all templates against AG Grid Community. If the client later needs enterprise features, the upgrade path is straightforward. Our prototypes will use AG Grid's CDN for the demos.

---

## 5. Round 1 Evaluation Scorecard

| Criterion | Score | Notes |
|-----------|-------|-------|
| Sasha (UI): Visual consistency | 3/10 | No design system, no tokens, no shared components |
| Sasha (UI): Theme support | 2/10 | Dark classes scattered, no toggle, incomplete |
| Sasha (UI): Typography | 4/10 | Right instincts, no system |
| Sasha (UI): Component quality | 3/10 | Empty ui/ directory |
| Marcus (UX): Screen type coverage | 7/10 | All 8 types present but no templates |
| Marcus (UX): Interaction patterns | 3/10 | Most critical patterns missing |
| Marcus (UX): User flow continuity | 2/10 | Every view is an island |
| Marcus (UX): Accessibility | 1/10 | Not addressed |
| Elena (BA): Meets client needs | 5/10 | Good domain coverage, needs template extraction |

**Overall Discovery Score: 3.3/10 for design system maturity**
**Domain coverage score: 7.5/10 — the backend and data model are strong**

---

## 6. Agreed Actions for Round 2

1. Define the complete design token set (colors, spacing, typography, elevation, motion)
2. Specify the atomic component library (20-25 components)
3. Define the 6 template layouts with wireframes
4. Identify all AG Grid configurations needed
5. Document every form control pattern with states (default, focus, error, disabled, loading)
6. Specify the interaction patterns for each template
