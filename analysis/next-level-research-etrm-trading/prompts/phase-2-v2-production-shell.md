# Phase 2: v2 — Production Shell Redesign

## Context
The user's boss feedback was "where is the UI?" — pages had too much scrolling from showcase sections. The top bar needed to span the full screen with proper branding, user identity, and enterprise-standard elements. The user wanted Playwright screenshots for verification, research into information-dense trading systems, user persona interviews, and a 3-phase review before implementation.

## Prompt Process

### Step 1: Playwright Screenshots
Took full-page screenshots of all 15 v1 pages using `npx playwright screenshot --wait-for-timeout 2000`. Initial screenshots showed skeleton loading (500ms delay) — all pages appeared blank. Re-took with longer wait to capture actual rendered content.

### Step 2: Web Research (8 parallel searches)
- Bloomberg Terminal UX — concealing complexity, zero-latency density, keyboard-first
- ETRM software landscape — Allegro, Endur, Molecule, Brady
- LNG trading desk workflows — front office operations, trade-to-cash
- UI density principles — Matt Ström-Awn's article on visual/information/design/temporal density
- Trading platform design examples — merge.rocks top 10, Dribbble inspiration
- Enterprise SaaS navigation — profile avatar top-right, collapsible sidebar
- Trayport Joule — market matrix, aggregated pricing, 50+ venues
- Jony Ive design principles — intentional reduction, bringing order to complexity

### Step 3: User Persona Research
Read all existing docs (24 files in docs/customer-review/, 3 agency review rounds, implementation plan). Synthesized 3 personas:
- **Desk Trader** — 15-second trade entry, keyboard-only, position ladder with WACOG, P&L everywhere
- **Operations Manager** — 200 invoices/month, bulk approve, audit trail, confirmation dialogs
- **Trading Tech Head** — evaluates vs Bloomberg/Allegro/Endur, decision-maker, 7.4/10 current score

### Step 4: 3-Phase Review in Plan Mode
Entered plan mode. Launched 3 parallel Explore agents:
1. Current UI structure analysis (header, sidebar, spacing, scroll depth)
2. User persona deep research (all 24 customer review docs)
3. Page structure audit (line counts, showcase sizes, AG Grid usage)

Then launched a Plan agent with all findings to design the v2 architecture.

### Step 5: v2 Implementation
Created `/horizon-v2/` with 19 files:

**Shell changes (shell.css + shell.js):**
- Header: brand + ticker (4 benchmarks) + search + notification bell (badge) + env badge (PROD) + theme toggle + user avatar (JC initials)
- Sidebar: removed brand duplication, starts with role selector
- Layout: viewport-fill (`height` not `min-height`, `overflow:hidden`)
- Status bar: connection status, timestamp, version
- Skeleton removed: immediate content render with fade-in

**Page changes (all 17 HTML files):**
- Removed all showcase sections (~3,344 lines total)
- Removed all "All Themes" floating buttons
- AG Grid containers: `calc(100vh - 10rem)` height
- No skeleton wrappers

Used 7 parallel agents to create all pages simultaneously.

### Step 6: Density Iteration
After initial v2 screenshots showed sparse layouts:
- Rewrote dashboard: 6 KPIs (was 4), 3-column layout, mini-blotter, hedge bars, P&L attribution
- Tightened CSS: smaller KPI values, compact table rows, reduced card padding
- Collapsed sidebar menus by default
- Removed Quick Actions (redundant with sidebar)

### Step 7: AG Grid Debugging
AG Grid pages showed empty grids because:
1. Skeleton wrappers were hiding content with `display:none`
2. `hz-grid-fill` (flex-based) didn't work because `initShell()` restructures the DOM
3. Fix: removed all skeleton wrappers, used `calc(100vh)` heights instead of flex, deferred grid init with `setTimeout(100)`

## Key Decisions
- **New directory, not in-place edit** — Created `/horizon-v2/` preserving v1 unchanged
- **No skeleton loading** — Immediate render with CSS fade-in instead of 500ms JS delay
- **calc(100vh) over flexbox** — For AG Grid containers, explicit calc heights are more reliable than flex chains that break when initShell restructures DOM
- **setTimeout for grid init** — Grid must initialize AFTER initShell finishes DOM restructuring

## Outcome
19 files in `/horizon-v2/`. Average 35% smaller than v1. Production-ready header with full user identity. All content renders immediately. AG Grid fills viewport on blotter, invoices, quick-entry.
