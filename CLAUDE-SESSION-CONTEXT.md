# Horizon ETRM — Claude Session Context

This document provides full context for any Claude session working on this project. Feed this file to Claude at the start of any new session.

## Project Overview

Horizon is a **static HTML/CSS/JS template library** for an LNG Energy Trading Risk Management (ETRM) system. It's being developed as the modern UI replacement for **EOS**, a production Windows-desktop ETRM used by GLNG (Global LNG).

A parallel production build (**EOS.Horizon**) runs in a separate repo (`.NET 10 + React 19`) and consumes our `tokens.css` for theme synchronisation.

## Current State: v41 (38 pages)

**Live:** https://sitebyte.github.io/horizon-ui-templates/horizon-v41/

### Version History (Recent)

| Version | Description | Status |
|---------|-------------|--------|
| v29-v38 | Earlier iterations (dashboard, blotter, support area, SQL checks, environments, user profile, security profile) | Frozen |
| v39 | Security Profile redesign with EOS data, permission explorer | Frozen |
| v40 | **Token split** — `shell.css` split into `tokens.css` + `demo-fonts.css` + `shell.css` for production theme porting | Frozen |
| v41 | **Theme hardening** — light theme WCAG fix, reactive design, workspace tabs, state persistence, LNG carrier branding | Current |

Versions v1-v28 were removed from deployment. v29+ are on disk.

## Architecture

### File Structure (v41)

```
horizon-v41/
  tokens.css          ← Standalone design tokens (production team consumes THIS)
  demo-fonts.css      ← Google Fonts imports (demo only)
  shell.css           ← @imports both above + reset + .hz-* component CSS
  shell.js            ← initShell(key, title) — builds header, sidebar, tabs, state persistence
  favicon.svg         ← LNG carrier on gradient circle
  favicon-{16,32,48,192}.png
  logo-header.svg     ← White LNG carrier silhouette (used inline in shell.js)
  *.html              ← 38 pages
```

### Shell System (`shell.css` + `shell.js`)

- **`tokens.css`**: Design tokens — `:root` universals + `[data-theme="dark"]` + `[data-theme="light"]`. 5-tier surface ramp, 4-tier text, semantic colours with `-dim`/`-text` variants, spacing, radii, transitions, shadows, cargo phases.
- **`shell.css`**: Imports tokens, then provides reset + 120+ `.hz-*` component classes.
- **`shell.js`**: `initShell(activeKey, pageTitle)` builds the entire chrome — header, context strip, workspace tabs, sidebar, content area, status bar, command palette. Also handles theme toggle, state persistence, and `hzRegisterGrid()` for AG Grid state.

### Layout Stack (Fixed Positioning)

```
Header           — fixed top, height: 3rem (--sp-12)
Context Strip    — fixed below header, height: 1.5rem
Workspace Tabs   — fixed below context strip, height: 1.75rem
Sidebar          — fixed left, top offset = header + strip + tabs
Main Content     — margin-left: sidebar width, margin-top: header + strip + tabs
Status Bar       — bottom of main
```

### Key Features (v41)

- **Workspace Tabs**: Tab bar showing visited pages, persisted to localStorage. Max 10, close buttons, click to navigate. Hidden on mobile/fullscreen/print.
- **State Persistence**: Page state saved to localStorage on `beforeunload`. Restores scroll position, active pills/filters, active tabs. AG Grid state via `hzRegisterGrid(api)`.
- **Reactive Design**: Zero px values in CSS. AG Grid columns use `flex` proportional sizing with `autoSizeStrategy: { type: 'fitGridWidth' }`. Breakpoints at 64rem (tablet) and 48rem (mobile).
- **Theme-Aware**: All colours via CSS custom properties. Dark (default) and light themes. AG Grid overrides use tokens in both themes.

### Header

`[LNG icon] [Horizon brand] [Page Title] | [JKM TTF HH Brent ticker] | [⌘K search] [🔔3] [PROD] [☀ theme] [⛶ fullscreen] [AM avatar]`

### Context Strip

`Net Position +4.8M | P&L +$2.11M | Hedge 78% | Credit 62% | Cargoes 7 active | Invoices 3 pending`

### Sidebar Menu (EOS Menu Structure)

TRADING, CONTRACTS, OPERATIONS, FINANCE, ADMINISTRATION (with Static Data submenu tree), SYSTEM, SUPPORT — all with sub-items and badges. All groups `defaultOpen: false` except TRADING.

### Key CSS Classes

- `.hz-card`, `.hz-card.borderless` — card containers
- `.hz-kpi`, `.hz-kpi-label`, `.hz-kpi-value` — compact KPI cards
- `.hz-table`, `.tbl` — data tables (tbl is ultra-compact)
- `.hz-badge` (green/amber/red/blue/neutral) — status badges
- `.hz-dot` (green/amber/red + pulse) — status indicators
- `.hz-entity-link` — clickable entity IDs (accent colour, hover underline)
- `.pnl-positive`, `.pnl-negative` — bold green/red P&L
- `.hz-inline-kpi` — compact toolbar KPIs
- `.hz-context-strip` — persistent portfolio state bar
- `.hz-workspace-tabs` — visited page tab bar
- `.hz-content-fill`, `.hz-grid-fill` — viewport-filling layout
- `.hz-layout-collapse` — collapses grid to 1-col at 64rem
- `.hz-mobile-banner` — "desktop recommended" message at 48rem
- `font-mono` — JetBrains Mono with tabular-nums

## Pages (v41 — 38 pages)

### Trading
- `index.html` — Trades View (3 role-adaptive views: Trader/Ops/Manager)
- `quick-entry.html` — Quick Entry (8-keystroke trade capture + session blotter)
- `lifecycle.html` — Trade Detail (tabbed: Overview/Valuation/Physical/Settlement + audit trail)
- `trade-form.html` — Trade Capture (multi-section form with position impact)
- `blotter.html` — Blotter (AG Grid, 30+ columns, 11 hidden by default, column toggle)
- `charges.html` — Charge Capture
- `vessel-charters.html` — Vessel Charters

### Contracts
- `master-agreements.html` — Master Agreements
- `contracts.html` — Contracts (4-step wizard)
- `counterparties.html` — Counterparties

### Operations
- `cargo-board.html` — Cargo View (Gantt chart with vessel bars, phase tracking)
- `cargo-matching.html` — Cargo Matching (3 AG Grids: purchases, sales, matched)
- `manage-schedule.html` — Manage Schedule
- `nominations.html` — Shipments (pipeline stepper, cascading form)
- `audit-log.html` — Cargo Audit Summary

### Finance
- `valuations.html` — Valuations
- `invoices.html` — Statements (AG Grid invoice queue, bulk approve)
- `positions.html` — Portfolio (heat-map position matrix, WACOG, P&L)
- `curves.html` — Prices (forward curve cards, spread monitor)
- `hedges.html` — Hedge Book (ratio bars, paper trades)

### Administration
- `settings.html` — Settings (user preferences, keyboard shortcuts)
- `user-profile.html` — My Profile (security profile, permission explorer)
- `index-builder.html` — Index Builder (price basis management)
- `curve-management.html` — Curve Management
- `reminders.html` — Reminder Dashboard

### System
- `style-guide.html` — Component Style Guide

### Support
- `support-dashboard.html` — System Status (EOD batch, integrity checks, service health)
- `support-audit.html` — Audit Search (searchable with filters and pagination)
- `support-data-quality.html` — Data Quality (curve, trade, position checks)
- `support-sql-checks.html` — SQL Checks (predefined validations with syntax viewer)
- `support-environments.html` — Environments (topology visualisation)

### Standalone
- `signin.html` — Branded sign-in
- `error-404.html` — Error page
- `reconciliation.html` — Reconciliation (side-by-side provisional/final)

## Token System (v41)

### Universal (`:root`)
- Typography: `--font-ui`, `--font-mono`, type scale (`--text-xs` through `--text-hero`)
- Accent: `--accent`, `--accent-hover`, `--accent-light`, `--accent-violet`, `--accent-bg`, `--accent-bg2`
- Gradients: `--gradient`, `--gradient-subtle`
- Status: `--green/red/amber/blue` with `-dim` and `-text` variants
- `--text-inverse` — white on coloured backgrounds
- Spacing: `--sp-1` through `--sp-12`
- Shadows: `--shadow-sm/md/lg/xl` (theme-aware)
- Blur: `--blur-overlay`
- Radii, transitions, sidebar widths
- Cargo phases: `--phase-planning/nomination/loading/transit/discharge/settlement`

### Dark Theme (`[data-theme="dark"]`)
5-tier surface ramp, 4-tier text, component surfaces, 3-tier borders, interactive states, skeleton

### Light Theme (`[data-theme="light"]`)
Same shape, adjusted values. `--text-muted` is `#78859b` (not `#94a3b8` — WCAG fix in v41).

## EOS.Horizon Production Sync

### How It Works
- Production consumes `tokens.css` only (not shell.css or component CSS)
- They bridge naming differences in their `theme-horizon-ui.css` (e.g., `--rag-green` ← `--green`)
- Wholesale re-pull versioning: token names stay stable, values evolve
- Per-version handover summaries at `analysis/pass-to-claude/v{N}/handover-v{N}.md`

### Sync Contract
- **Never rename tokens** without flagging in the handover channel
- **Never remove tokens** — only additive changes
- **Document new tokens** in the `tokens.css` header comment
- **No font `@import`** in `tokens.css` (production uses system fonts)

## EOS System (Being Modernised)

### Key EOS Data
- **Menu**: 40+ items across 10 categories (faithfully reproduced in sidebar)
- **Contract fields**: Type (SPA), Status workflow (Draft → FO-Entered → FO-Validated → Trade Checked)
- **12 Price Signatures**, **38 Charge Types**, **Cargo = Matched Trade Pair** (Buy + Sell + Vessel)
- **Events**: Pick Up, Load, Discharge, Drop Off (each with port, dates, volumes, CV, density)
- **Delivery Regions**: CHI, Europe, Far East, India, Japan, JKT, JKTC

## Technical Notes

- **AG Grid**: v31.3.2 (CDN), columns use `flex` sizing (no px), containers use `height:calc(100vh - Xrem)`
- **Grid init timing**: `setTimeout(function(){...}, 100)` not `DOMContentLoaded`
- **Grid state**: call `hzRegisterGrid(api)` after creating grid — shell.js handles save/restore
- **No skeleton loading**: content renders immediately with CSS fade-in
- **Sidebar menus**: all groups `defaultOpen: false`
- **GitHub Pages**: https://sitebyte.github.io/horizon-ui-templates/horizon-v41/

## Analysis Documents

All in `/analysis/`:
- `v40-review/` — 4-agent theme review (token audit, responsiveness, sync, industry research)
- `pass-to-claude/v40/` — v40 handover for production team
- `pass-to-claude/v41/` — v41 handover for production team
- `pass-to-claude/answers-to-builder-theme-port.md` — theme port reply
- `ai-handover-spec.md` — page-by-page component spec
- `theme-builder/` — production session's theme port brief
- `v41-screenshots/` — local Playwright captures (gitignored)

## Design Principles ("Disciplined Density")

1. **Data Is the Interface** — Primary panels have no card borders; data fills the viewport
2. **Numbers Are Sacred** — tabular-nums, bold P&L, right-aligned monospace
3. **Hierarchy Through Density Variation** — Primary dense, secondary comfortable, tertiary minimal
4. **Connected, Not Isolated** — Every entity ID is a clickable link; context strip shows portfolio state
5. **Motion Is Feedback** — No decorative animation; every motion communicates state change
