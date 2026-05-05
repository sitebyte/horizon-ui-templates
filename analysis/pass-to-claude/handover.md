# Horizon ETRM — Complete Handover for Claude

**Written by:** Claude Opus 4.6 (1M context) after a 2-day intensive session
**Date:** 5 May 2026
**Purpose:** Everything another Claude instance needs to continue this work

---

## What This Project Is

Horizon is a **static HTML/CSS/JS template library** that serves as the UI prototype for modernising **EOS**, a production LNG (Liquefied Natural Gas) Energy Trading Risk Management (ETRM) system used by **GLNG (Global LNG)**. 

EOS is a mid-2010s Windows desktop application — dense, functional, ugly. Horizon is what EOS should look like as a modern web application.

The templates are NOT a running application. They are static HTML files with mock data that demonstrate the UI, interactions, and information architecture. They will be used as the reference design when building the real system.

---

## Repository Structure

```
/horizon-ui-templates/
├── CLAUDE.md                    ← PROJECT RULES (read this first)
├── CLAUDE-SESSION-CONTEXT.md    ← Full context for any Claude session
├── eos_landacape_and_architecture.drawio.png  ← The actual EOS architecture diagram
│
├── horizon/                     ← v1 (original, preserved)
├── horizon-v2/ through v29/     ← Each iteration preserved
├── horizon-v30/                 ← CURRENT VERSION (latest)
│   ├── shell.css               ← Design tokens + custom components
│   ├── shell.js                ← Shell builder (header, sidebar, status bar, cmd palette)
│   ├── environments/
│   │   ├── prod.json           ← Production topology data
│   │   └── uat.json            ← UAT topology data (some services offline)
│   ├── index.html              ← Trades View (grid-first dashboard)
│   ├── lifecycle.html          ← Trade Detail (8 tabs, working workflows)
│   ├── blotter.html            ← Trade Blotter (30-column AG Grid)
│   ├── support-environments.html ← System topology (3 views, JSON-driven)
│   ├── ... (35 HTML files total)
│   └── style-guide.html        ← Living component reference
│
├── analysis/                    ← All research and review documents
│   ├── next-level-research-etrm-trading/
│   │   ├── round-1-competitive-landscape.md
│   │   ├── round-2-ux-audit-current-state.md
│   │   ├── round-3-design-direction.md
│   │   ├── synthesis-and-plan.md
│   │   └── prompts/phase-1-through-7.md
│   ├── eos-actual/
│   │   ├── round-1-system-anatomy.md      ← Full EOS menu, UI patterns, data model
│   │   ├── round-2-complexity-and-gaps.md  ← Feature gaps, workflow complexity
│   │   └── round-3-three-approaches.md    ← Three ways to apply EOS to Horizon
│   ├── environment-overview/
│   │   ├── round-1-film-principles.md     ← JARVIS/Minority Report design principles
│   │   ├── round-2-what-the-drawio-teaches.md
│   │   └── round-3-build-plan.md
│   ├── v11-honest-review.md              ← Honest critique of v11
│   └── review-of-23/                     ← Playwright test results
│       ├── test-navigation.js
│       ├── test-results.json
│       └── findings.md
│
└── /Users/jonathancobley/projects/eos/user docs/  ← EOS user documentation (PDFs)
```

---

## How The Shell System Works

Every page shares `shell.css` and `shell.js`. The shell handles all chrome — header, context strip, sidebar, status bar, command palette, toasts, theme switching.

### initShell(activeKey, pageTitle)

This is the entry point. Every HTML page has this structure:

```html
<div id="hz-app">
  <!-- page content goes here -->
</div>
<script src="shell.js"></script>
<script>
  initShell('blotter', 'Blotter');
</script>
```

When `initShell()` runs, it:
1. Reads the `#hz-app` div's innerHTML (the page content)
2. Builds the header, context strip, sidebar, status bar, and command palette
3. Wraps the page content inside the shell structure
4. Re-injects everything into `#hz-app`
5. Sets up keyboard shortcuts (Cmd+K, Cmd+B, F11, Escape)
6. Initializes the sidebar search filter

**Critical timing issue:** Because `initShell()` restructures the DOM, any AG Grid initialization must happen AFTER it completes. Use `setTimeout(function(){...}, 100)` for AG Grid, not `DOMContentLoaded`.

### shell.css Architecture

```
:root                  ← Design tokens (colors, spacing, fonts, radii, transitions)
[data-theme="dark"]    ← Dark theme surfaces, text, borders
[data-theme="light"]   ← Light theme overrides
Reset                  ← box-sizing, font-smoothing, body defaults
Layout                 ← #hz-app, .hz-main, .hz-content (viewport-fill)
Sidebar                ← Collapsed/expanded, menu groups, items, badges, search, footer
Header                 ← Fixed top, brand, breadcrumb, ticker, right controls
Context Strip          ← Portfolio state bar below header
Status Bar             ← Connection status, version at bottom
Command Palette        ← Cmd+K overlay with entity search
Components             ← Toast, cards, KPIs, badges, dots, tables, buttons, inputs, combobox, etc.
AG Grid Overrides      ← Theme-aware grid styling
Custom Components      ← Entity links, P&L classes, KPI strip, dense form, collapsible sections
Utilities              ← Color classes (text-green, pnl-positive, etc.)
Animations             ← fadeIn, pulse, shimmer
Responsive             ← Mobile breakpoints
Fullscreen             ← App fullscreen mode + floating exit button
Print                  ← Hide chrome for printing
```

### The Menu System

The sidebar menu is defined as a JavaScript array `MENU` in shell.js. It has 7 groups:

```
TRADING (4 items) — Trades View, Trade Capture, Charge Capture, Vessel Charter
CONTRACTS (3) — Master Agreements, Contracts, Contact Counterparties
OPERATIONS (8) — Cargo View/Ops/Matching/Schedule/Bunker/Vessel/Audit, Shipments
FINANCE (4) — Valuations, Statements, Portfolio, Prices
ADMINISTRATION (5+deep) — Static Data (7 sub-groups, 25+ items), Reports, Data Import, Regulations, Settings
SYSTEM (5) — Reminders (Dashboard+Rules), Help, Logs, FAQs
SUPPORT (5) — System Status, Environments, Audit Search, Data Quality, SQL Checks
```

The menu uses **accordion behavior** — only one group open at a time. The active page's group auto-expands. Clicking a group closes all others.

**Menu key matching:** Each menu item has a `key` property that must match the `activeKey` passed to `initShell()`. If they don't match, the sidebar won't highlight the active item or expand the correct group. This was a major bug source — see `analysis/review-of-23/findings.md` for the Playwright test that caught it.

---

## How Pages Are Built

### Grid-First Pages (Dashboard, Blotter)

These use AG Grid Community v31.3.2 (CDN). The grid fills the viewport:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community@31.3.2/styles/ag-grid.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community@31.3.2/styles/ag-theme-quartz.css" />
<script src="https://cdn.jsdelivr.net/npm/ag-grid-community@31.3.2/dist/ag-grid-community.min.js"></script>

<div id="trades-grid" class="ag-theme-quartz-dark ag-compact" 
     style="width:100%;height:calc(100vh - 12rem);"></div>

<script>
setTimeout(function() {
  var gridOptions = {
    columnDefs: [...],
    rowData: [...],
    defaultColDef: { sortable: true, resizable: true },
    rowGroupPanelShow: 'always',  // column grouping bar
    animateRows: true,
  };
  agGrid.createGrid(document.getElementById('trades-grid'), gridOptions);
}, 100);  // MUST be setTimeout, not DOMContentLoaded
</script>
```

**Why calc(100vh - Xrem)?** AG Grid needs a computed height. Flexbox-based heights (flex:1) break because initShell restructures the DOM and the flex chain doesn't resolve before the grid initializes.

### Trade Detail Page (lifecycle.html)

The most complex page. 8 tabs matching EOS:

1. **Trade Entry** — 32 fields in a 4-column dense form (`hz-dense-form`)
2. **Valuation** — EOD history table + intraday movement table with bar charts
3. **Physical** — Cargo, vessel, loading details, nomination
4. **Settlement** — Invoice status, line items, credit impact
5. **Invoice Schedule** — Monthly periods with padlock locking
6. **Linked Trades** — Book transfer visibility
7. **Supply Plan** — Delivery schedule with planned/expected/actual
8. **Attributes** — 67 fields across 5 collapsible groups (Discharge 14, Loading 17, Dates 12, References 9, Trading 15)

Working interactions:
- **Amend** → Modal with editable fields, reason capture, diff preview, adds audit entry
- **Cancel** → Position impact warning, reason dropdown, undo via toast
- **Clone** → Toast confirmation, adds audit entry
- **Record Discharge** → Stage-specific form (outturn, BOG, GHV, surveyor)
- All interactions update the audit trail sidebar live

### Environments Page (support-environments.html)

The most visually creative page. Three views:

**View A "The Map":** Percentage-positioned nodes with distinct shapes per type (clouds for external, pills for pipeline, rectangles for Glint, hexagon for RabbitMQ, large box for EOS). SVG flow lines with `<textPath>` labels. Annotations. Click-to-highlight. Sci-fi treatment (dot-grid, scanlines, glow effects, pulse animations).

**View B "Flow Tracer":** Correlation ID search. Map dims, traced path lights up. Animated particle travels node-to-node.

**View C "Dashboard":** Same topology with metrics overlaid. Line thickness = volume.

**JSON-driven:** Topology loaded from `environments/prod.json` or `environments/uat.json`. Environment selector switches between them. Offline nodes grey out, flow lines become dashed, KPIs update.

---

## Design Principles (from CLAUDE.md)

1. **ALWAYS VERSION** — Create horizon-v31/, v32/ etc. Never modify existing versions.
2. **USE TAILWIND CSS** — CDN loaded on all pages. shell.css is tokens + custom components only.
3. **NO FIXED WIDTHS** — rem, %, vh/vw only. Scalable.
4. **KEYBOARD-FIRST** — Type-and-tab, searchable selects, Enter/Escape, auto-focus.
5. **AI-AWARE** — Semantic data attributes, skinnable via CSS vars, clear class naming.
6. **NO ADDITIONS TO EOS** — The menu items match EOS production exactly. No Hedge Book, no Style Guide, no SQL Checks in the EOS menu. Support section is OUR addition (clearly separated).

---

## The EOS Data Model (Key Concepts)

From the EOS user documentation analysis:

- **Contract** → Type (SPA), Status (Draft/Firm/Recap), multi-counterparty with % shares, tolerance (95-105%), location restriction (Open/Validated/Constrained), credit security (9 types)
- **Trade** → Status workflow: Draft → FO-Entered → FO-Validated → Trade Checked. 8 tabs of data. Optional trades with Option Right/Status.
- **Cargo** = Matched buy trade + sell trade + vessel. Events: PickUp → Load → Discharge → Drop Off.
- **Charge** → 38 types across 7 categories. Volume types: Flat, Volumetric, BAV.
- **Index/Pricing** → 12 price signature types (AbsoluteSpot, MonthlySpot, StandardProduct, etc.). Formula-based with curve references.
- **Reminder** → Expression-based date calculations (BD, CD, FOCM, etc.) with UK/US/Singapore calendars.

The full data model is in `analysis/eos-actual/round-1-system-anatomy.md`.

---

## How To Continue This Work

### Adding a New Page
1. Copy an existing page as template (e.g., `counterparties.html`)
2. Change the `<title>` and `initShell('key', 'Title')` call
3. Ensure the `key` matches a menu item key in `shell.js`
4. Add Tailwind CDN + config in `<head>`
5. Add AG Grid CDN if needed
6. Use shell.css classes for components

### Adding a New Menu Item
1. Open `shell.js`, find the `MENU` array
2. Add the item to the appropriate group with: `{ label: 'Name', icon: 'icon-name', href: 'page.html', key: 'unique-key' }`
3. The `key` must match the `initShell()` call on the target page
4. Available icons are in the `ICONS` object at the top of shell.js

### Adding a New Environment
1. Create `environments/newenv.json` following the prod.json structure
2. Add a button to the environment selector in `support-environments.html`
3. The page will load and render it automatically

### Changing the Visual Theme
1. Edit the `:root` and `[data-theme="dark"]` / `[data-theme="light"]` blocks in shell.css
2. All components use CSS custom properties — changing `--accent` changes the entire accent color
3. The style guide page (`style-guide.html`) previews all components

### Running Playwright Tests
```bash
node analysis/review-of-23/test-navigation.js
```
This tests menu structure, accordion behavior, navigation links, sidebar collapse, and fullscreen toggle across all pages.

---

## Version History (v1 → v30)

| Version | Key Change |
|---------|-----------|
| v1 | 6 theme exploration with component showcases |
| v2 | Production shell — header with avatar/bell/env |
| v3 | Disciplined Density — context strip, tabular-nums |
| v4 | Density applied to every page — borderless panels |
| v5 | Support area + tabbed trade detail with working workflows |
| v6 | EOS-aligned menu + 10 new pages |
| v7 | Grid-first dashboard, 30-column blotter, 8-tab trade detail |
| v8 | No-sidebar experiment (reverted) |
| v9 | Theme-aware sidebar |
| v10 | Tailwind CSS, AI-aware semantic HTML, style guide |
| v11 | Full EOS-scale menu (55+ items) |
| v12 | shadcn-inspired sidebar (search, user footer) |
| v13 | Sidebar collapse fix, settings access, fullscreen panels |
| v14 | Working fullscreen toggle, deeper menu |
| v15 | Remove duplicate brand/user from sidebar |
| v16 | Visible collapse button + fullscreen icon fix |
| v17 | Sidebar footer: settings, permissions, versions |
| v18 | Exact EOS flat menu (22 groups) |
| v19 | Fixed menu hierarchy (groups prominent, items indented) |
| v20 | Exact EOS menu, zero additions |
| v21 | 6 logical groups, every EOS item, SUPPORT added back |
| v22 | SUPPORT group re-added |
| v23 | Accordion menu — only active group opens |
| v24 | Fullscreen exit button + menu key fixes (from Playwright tests) |
| v25 | Environments & integration health page |
| v26 | Visual integration flow + message explorer |
| v27 | Sci-fi treatment (glow, pulse, scanlines, dot-grid) |
| v28 | Real EOS topology from drawio diagram |
| v29 | Three-view topology (Map + Flow Tracer + Dashboard) |
| v30 | JSON-driven environments with PROD/UAT selector |

---

## Key Files To Read First

1. **CLAUDE.md** — Project rules (versioning, design, technical)
2. **CLAUDE-SESSION-CONTEXT.md** — Full system context
3. **analysis/eos-actual/round-1-system-anatomy.md** — EOS menu, data model, UI patterns
4. **horizon-v30/shell.js** — The shell system (header, sidebar, menu data)
5. **horizon-v30/shell.css** — Design tokens and components
6. **horizon-v30/support-environments.html** — Most complex page (topology, JSON-driven)
7. **horizon-v30/lifecycle.html** — Trade detail (8 tabs, working workflows)

---

## What's Still Needed

From the v11 review (`analysis/v11-honest-review.md`), partially addressed:

1. **Visual consistency** — Some pages are still from earlier versions (curves, hedges, cargo-board use v4-era HTML tables instead of AG Grid). The blotter, dashboard, quick-entry, positions, and cargo-matching are consistent (v12+).

2. **Keyboard-first forms** — Not yet implemented. Date fields should accept typed input, selects should be searchable, tab order should be logical.

3. **Big numbers** — $47,200,000 should visually dominate. Not yet treated with special typography.

4. **More environments** — DEV and TEST JSON files needed.

5. **Message explorer in environments** — Currently has static sample data. Should be driven from a messages.json or similar.

6. **The environments topology SVG rendering** — Works but could be more robust. The SVG connector lines are drawn with hardcoded path calculations that may not perfectly align at all viewport sizes.

---

## Technical Gotchas

1. **AG Grid init timing** — ALWAYS use `setTimeout(fn, 100)`, never `DOMContentLoaded`. The shell restructures the DOM.

2. **Menu key matching** — The `key` in the MENU item must exactly match the first argument to `initShell()`. Mismatches cause the sidebar to not highlight or expand the correct group.

3. **Sidebar default state** — All groups are `defaultOpen: false` except the one containing the active page. The accordion logic overrides any stored localStorage state.

4. **Fullscreen mode** — When entering fullscreen, the header hides. A floating "Exit Fullscreen" button appears at top-right. Escape key also exits. Without this, users get trapped.

5. **File:// protocol** — `fetch()` for JSON files fails on file:// protocol. The environments page has an inline fallback `PROD_DATA` variable.

6. **Tailwind CDN** — Every page needs both the CDN script AND the config block (darkMode selector, font families). Missing config means Tailwind classes don't work correctly with the theme system.

7. **CSS custom properties in sidebar** — The sidebar used to have hardcoded `rgba(255,255,255,...)` values that only worked on dark backgrounds. v9+ fixed this to use theme-aware variables. Don't revert to hardcoded rgba.

---

## The User's Priorities

Based on 2 days of iterating:

1. **EOS accuracy** — The menu, data model, and workflows must match the real EOS system. No embellishments, no additions to the EOS sections. Support/Horizon additions are clearly separated.

2. **Information density** — Traders don't want whitespace. Every pixel should carry data. Bloomberg is the benchmark.

3. **Keyboard-first** — Users don't want to spend time in this system. Type and tab. Enter submits. Escape cancels.

4. **The sidebar must work** — It went through 15+ iterations. Current state: 7 groups, accordion behavior, search filter, settings/permissions/versions footer, collapse button at bottom. Don't break this.

5. **The environments topology is the showpiece** — Three views (Map/Tracer/Dashboard), JSON-driven, sci-fi visual treatment, labeled flow lines. The user is genuinely proud of this page.

6. **Version everything** — Never modify an existing version directory. Always create a new one. This is a hard rule in CLAUDE.md.
