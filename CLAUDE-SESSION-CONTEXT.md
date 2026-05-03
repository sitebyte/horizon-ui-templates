# Horizon ETRM — Claude Session Context

This document provides full context for any Claude session working on this project. Feed this file to Claude at the start of any new session.

## Project Overview

Horizon is a **static HTML/CSS/JS template library** for an LNG Energy Trading Risk Management (ETRM) system. It's being developed as the modern UI replacement for **EOS**, a production Windows-desktop ETRM used by GLNG (Global LNG).

## Version History

| Version | Directory | Description | Status |
|---------|-----------|-------------|--------|
| v1 | `/horizon/` | Original 6-theme exploration with component showcases | Preserved |
| v2 | `/horizon-v2/` | Production shell — full-width header with brand/ticker/avatar, stripped showcases | Preserved |
| v3 | `/horizon-v3/` | Tighter spacing, context strip, tabular-nums, dense dashboard | Preserved |
| v4 | `/horizon-v4/` | Disciplined Density applied to every page — borderless panels, entity links, toolbar KPIs | Preserved |
| v5 | `/horizon-v5/` | Support area (4 pages), tabbed trade detail with working workflow interactions | Current |
| v6 | `/horizon-v6/` | EOS data integration — real fields, workflows, expanded menu | In Progress |

## Architecture

### Shell System (`shell.css` + `shell.js`)
- **`shell.css`**: Design tokens (CSS custom properties), 5 surface tiers, dark/light themes, all components (cards, KPIs, tables, badges, buttons, inputs, combobox, AG Grid overrides, utilities)
- **`shell.js`**: `initShell(activeKey, pageTitle)` builds the entire chrome — header, context strip, sidebar, content area, status bar, command palette
- Every HTML page calls `initShell()` which wraps the page content inside the shell

### Header
Full-width, fixed top: `[☰ toggle] [⚡ Horizon brand] [Page Title] | [JKM TTF HH Brent ticker] | [⌘K search] [🔔3 notifications] [PROD env] [☀ theme] [JC avatar]`

### Context Strip
Fixed below header: `Net Position +4.8M | P&L +$2.11M | Hedge 78% | Credit 62% | Cargoes 7 active | Invoices 3 pending`

### Sidebar Menu (v5)
TRADING (collapsed by default), PHYSICAL, SETTLEMENT, ADMIN, SUPPORT — all with sub-items and badges

### Key CSS Classes
- `.hz-card`, `.hz-card.borderless` — card containers
- `.hz-kpi` — compact KPI cards
- `.hz-table`, `.tbl` — data tables (tbl is the ultra-compact variant)
- `.hz-badge` (green/amber/red/blue/neutral) — status badges
- `.hz-dot` (green/amber/red + pulse) — status indicators
- `.hz-entity-link` — clickable entity IDs (accent color, hover underline)
- `.pnl-positive`, `.pnl-negative` — bold green/red P&L values
- `.hz-inline-kpi` — compact toolbar KPIs
- `.hz-context-strip` — persistent portfolio state bar
- `.hz-content-fill`, `.hz-grid-fill` — viewport-filling layout utilities
- `font-mono` — JetBrains Mono with tabular-nums

## Pages (v5 — 21 pages)

### Trading
- `index.html` — Dashboard (3 role-adaptive views: Trader/Ops/Manager)
- `quick-entry.html` — 8-keystroke trade entry + AG Grid session blotter
- `lifecycle.html` — Trade detail with tabs (Overview/Valuation/Physical/Settlement) + working Amend/Cancel/Clone/Record Discharge workflows + audit trail sidebar
- `trade-form.html` — Multi-section trade form with position impact preview
- `blotter.html` — AG Grid (24 trades), toolbar KPIs, clickable trade IDs
- `positions.html` — Heat-map position matrix (benchmark × month, WACOG, P&L)
- `curves.html` — Forward curve cards, spread monitor
- `hedges.html` — Hedge book with ratio bars, paper trades

### Physical
- `cargo-board.html` — Gantt chart with vessel bars, phase tracking
- `nominations.html` — Pipeline stepper, cascading form

### Settlement
- `invoices.html` — AG Grid invoice queue, bulk approve, toolbar KPIs
- `reconciliation.html` — Side-by-side provisional/final comparison

### Admin
- `contracts.html` — 4-step contract wizard
- `audit-log.html` — Timeline + table with field-level diffs
- `settings.html` — User preferences, keyboard shortcuts

### Support
- `support-dashboard.html` — EOD batch monitoring, integrity checks, service health
- `support-audit.html` — Searchable audit log with filters and pagination
- `support-data-quality.html` — Curve quality, trade integrity, position checks
- `support-sql-checks.html` — 12 predefined SQL validations with syntax-highlighted viewer

### Standalone
- `signin.html` — Branded sign-in page
- `error-404.html` — Error page

## EOS System (Being Modernised)

### Key EOS Data
- **Menu**: 40+ items across 10 categories
- **Contract fields**: Type (SPA), Status (Draft/FO-Entered/FO-Validated), multi-counterparty with % share, book transfer logic, strategy, credit security (9 types), tolerance (95-105%), location restriction
- **Trade status workflow**: Draft → FO-Entered → FO-Validated → Trade Checked
- **Index naming**: SGP prefix (e.g., SGP_Platts JKM Month Ahead, SGP_Ave_ICE TTF FMA × 0.293071 × Ave_EURUSD)
- **12 Price Signatures**: AbsoluteSpot, MonthlySpot, StandardProduct, StandardProductWithFXAveraging, PartialMonthlySpot, CalendarProduct, etc.
- **38 Charge Types**: Paper Trade Fees, Cargo Charges (28 types), Chartering & Fuel, Service/Agent, Contract, Insurance, Finance, Tax, Bunkers
- **Cargo = Matched Trade Pair**: Buy + Sell + Vessel
- **Events**: Pick Up, Load, Discharge, Drop Off (each with port, dates, volumes, CV, density)
- **Vessel Charter**: Start/End dates, charter-specific pricing, heel trades
- **Attribute Groups**: Discharge Info (14), Loading Info (17), Dates (12), References (9), Trading Info (15)
- **Reminder Expressions**: BD(-1,"US"), CD(-12), BD(FOCM(),-2,"UK") with UK/US/Singapore calendars
- **Delivery Regions**: CHI, Europe, Far East, India, India/Pakistan, Japan, Jap/Kor, JKT, JKTC

## Design Principles ("Disciplined Density")

1. **Data Is the Interface** — Primary panels have no card borders; data fills the viewport
2. **Numbers Are Sacred** — tabular-nums, bold P&L (pnl-positive/pnl-negative), right-aligned monospace
3. **Hierarchy Through Density Variation** — Primary dense, secondary comfortable, tertiary minimal
4. **Connected, Not Isolated** — Every entity ID is a clickable link; context strip shows portfolio state
5. **Motion Is Feedback** — No decorative animation; every motion communicates state change

## Analysis Documents

All in `/analysis/`:
- `next-level-research-etrm-trading/round-1-competitive-landscape.md` — Bloomberg, Trayport, Molecule, ION comparison
- `next-level-research-etrm-trading/round-2-ux-audit-current-state.md` — Page-by-page scoring
- `next-level-research-etrm-trading/round-3-design-direction.md` — Disciplined Density principles
- `next-level-research-etrm-trading/synthesis-and-plan.md` — Implementation plan
- `next-level-research-etrm-trading/prompts/phase-1-through-6.md` — Prompt process docs
- `eos-actual/round-1-system-anatomy.md` — EOS full menu, UI patterns, data model
- `eos-actual/round-2-complexity-and-gaps.md` — Feature gaps, workflow complexity
- `eos-actual/round-3-three-approaches.md` — Three ways to apply EOS to Horizon

## Technical Notes

- **AG Grid**: v31.3.2 (CDN), containers use `height:calc(100vh - Xrem)` not flexbox (flex chain breaks when initShell restructures DOM)
- **Grid init timing**: Use `setTimeout(function(){...}, 100)` not `DOMContentLoaded` (grid must init AFTER initShell finishes)
- **No skeleton loading**: Content renders immediately with CSS fade-in
- **Sidebar menus**: All groups `defaultOpen: false` (collapsed by default)
- **GitHub Pages**: https://sitebyte.github.io/horizon-ui-templates/horizon-v5/
