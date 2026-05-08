# Horizon UI Templates — AI Handover Spec

**From**: the Claude session working in `sitebyte/horizon-ui-templates` (v33 prototype)
**To**: the Claude session working in `EOS.Horizon` (production .NET 10 + React 19 build)
**Date**: 2026-05-07

This document describes the **design intent** behind each page, decomposed into component patterns your stack can consume. It maps every visual pattern to the production component vocabulary: `Tile`, `StatusPill`, `Stack`, `Text`, `Mono`, plus standard HTML/Tailwind primitives.

---

## Global Design System Mapping

### Design Tokens → Tailwind Config

The prototype uses CSS custom properties in `shell.css`. Here's how they map to a Tailwind config:

| Prototype Token | Purpose | Tailwind Equivalent |
|---|---|---|
| `--surface-canvas` (`#09090b`) | Darkest background | `bg-zinc-950` |
| `--surface-base` (`#0f0f12`) | Default background | `bg-zinc-900` |
| `--surface-raised` (`#18181b`) | Card/elevated | `bg-zinc-800` → your `Tile` |
| `--surface-elevated` (`#1f1f23`) | Higher elevation | `bg-zinc-700` |
| `--text-primary` (`#fafafa`) | Headings | `text-zinc-50` → your `Text` |
| `--text-secondary` (`#d4d4d8`) | Body | `text-zinc-300` |
| `--text-tertiary` (`#a1a1aa`) | Supporting | `text-zinc-400` |
| `--text-muted` (`#71717a`) | Disabled/meta | `text-zinc-500` |
| `--accent` (`#4f46e5`) | Primary action | `text-indigo-600` / `bg-indigo-600` |
| `--green` / `--red` / `--amber` | Semantic status | Your `StatusPill` variants |
| `--font-mono` | JetBrains Mono | Your `Mono` component |
| `--text-xs` (11px) | Compact labels | `text-[0.6875rem]` |
| `--text-sm` (13px) | Compact body | `text-[0.8125rem]` |

### Component Mapping

| Prototype Pattern | CSS Class | Production Component |
|---|---|---|
| Status badge | `.hz-badge green/amber/red/blue/neutral` | `<StatusPill variant="success/warning/error/info/neutral">` |
| Card container | `.hz-card` | `<Tile>` or `<Tile variant="raised">` |
| Borderless panel | `.hz-card.borderless` | `<Tile variant="flat">` (no border) |
| Button primary | `.hz-btn.primary` | `<Button variant="primary">` |
| Button ghost | `.hz-btn.ghost` | `<Button variant="ghost">` |
| Entity link | `.hz-entity-link` | `<Link>` styled with accent color + hover underline |
| Status dot | `.hz-dot green/amber/red` + optional `.pulse` | Custom `<StatusDot>` or inline span |
| KPI card | `.hz-kpi` | `<Tile>` containing `<Text size="xs">` label + `<Mono size="lg">` value |
| Inline KPI | `.hz-inline-kpi` | `<Stack direction="row" gap="1">` with `<Text>` + `<Mono>` |
| Monospace values | `.font-mono` | `<Mono>` |
| P&L colouring | `.pnl-positive` / `.pnl-negative` | `<Mono color={value >= 0 ? 'green' : 'red'}>` |
| Compact table | `.tbl` | Standard `<table>` with Tailwind `text-[0.6875rem]` + your design tokens |
| Dense form | `.hz-dense-form` | CSS Grid `grid-cols-4` with label/value pairs |

### Layout Patterns

| Pattern | Prototype Implementation | Production Approach |
|---|---|---|
| Full viewport fill | `.hz-content-fill` | `flex flex-col h-full min-h-0` |
| AG Grid container | `height:calc(100vh - 12rem)` | Same — do NOT use flex for AG Grid height |
| KPI strip | `.hz-kpi-strip` | `<Stack direction="row" gap="2" align="center">` with separator spans |
| Two-column detail | CSS Grid `grid-template-columns: 1fr 20rem` | Same, or `<Stack direction="row">` with fixed-width aside |
| Bottom panel (collapsible) | Flex column with `max-height: 45vh`, resize handle | Headless UI Disclosure or custom state |
| Tabs | Custom `.td-tab` buttons switching `.td-tab-panel` visibility | Headless UI Tab or Radix Tabs |

---

## Page Specs

### 1. Dashboard / Trades View (`index.html`)

**Layout**: Vertical stack — KPI Strip → AG Grid (fills remaining) → Bottom Tab Bar

**KPI Strip** (always visible above grid):
- 6 inline KPIs separated by `|`: Net Position (+6.4M), P&L (+$2.1M), Hedge (78%), Trades (47), Cargoes (7), Credit (62%)
- P&L values are green (positive) or red (negative)
- Component: `<Stack direction="row" align="center" gap="2">` with `<Mono>` values

**AG Grid** (the main content):
- 20 columns: Trade ID (pinned left, entity link), Group, B/S (badge), Status (pill), Counterparty, LE Book, Strategy, Product, Volume (right-aligned mono), Tol Min, Tol Max, Start Date, Cargo (entity link), Index, Price ($ formatted), MTM (P&L coloured), P&L (P&L coloured), Matched (Yes/No badge), Loc Restriction, Trader
- Row height: 24px, header height: 28px
- Cancelled rows: `line-through`, muted colour, 60% opacity
- Double-click navigates to lifecycle detail
- Container: `height: calc(100vh - 12rem)` — NOT flexbox

**Bottom Tab Bar**:
- 3 tabs: Trades | View Cargoes | Charges
- Pattern: horizontal button row at bottom, border-top
- Only switches grid view (same grid, different data)

**Cell Renderers** (critical — these define the visual language):
- **B/S badge**: 1.25rem square, rounded, green background for Buy, red for Sell, bold letter. Map to: `<StatusPill variant={side === 'B' ? 'success' : 'error'} size="xs">{side}</StatusPill>`
- **Status badge**: Rounded-full pill. Draft=blue, FO-Entered=amber, FO-Validated=green, Trade Checked=darker green, Cancelled=muted. Map to: `<StatusPill variant={statusMap[status]}>{status}</StatusPill>`
- **Entity link**: Accent-coloured text with hover underline. Map to: `<Link to={url}>{id}</Link>`
- **P&L formatting**: `+$340K`, `-$28K`, `+$2.1M`. Green positive, red negative. Use `<Mono color={v >= 0 ? 'green' : 'red'}>{format(v)}</Mono>`

---

### 2. Blotter (`blotter.html`)

**Layout**: Toolbar Row 1 → Toolbar Row 2 (Quick Filters) → AG Grid (fills remaining)

**Toolbar Row 1** (flex row, wrapping):
- Search input (left, max-width 14rem, with search icon)
- Status filter pills: All | Draft | FO-Entered | FO-Validated | Trade Checked | Cancelled — toggle active state, mutually exclusive
- Columns button (opens dropdown checklist of visible columns)
- Export CSV button
- 3 inline KPIs: Trades (24), Net Vol (+8.4M), P&L (+$2.1M)
- Row count (right): "24 trades"
- Total Unrealized P&L (right, bold green/red)

**Toolbar Row 2** (Quick Filters):
- Label "Quick:" then toggle buttons: Matched | Unmatched | Buy | Sell | My Trades
- Matched/Unmatched are mutually exclusive, Buy/Sell are mutually exclusive
- Active state: accent background + accent border

**AG Grid** — 25+ columns in 7 column groups:
- Trade Identity: ID (entity link, pinned), Trade Group, Side (B/S badge), Type, Status (pill)
- Counterparty & Books: Counterparty, LE Book, Cpty Book
- Commercial: Volume (right), Benchmark, Price ($, right), Index, Inco, Delivery
- Valuation: MTM (calculated, P&L coloured), Unreal P&L (calculated, P&L coloured)
- Matching & References: Matched (YES/NO badge), Cargo Ref (entity link), Contract Ref (entity link)
- Strategy & Controls: Strategy (colour-coded: Inventory=green, Exclude=red, Temporary=amber), Loc Restriction, Credit Sec, Option Right
- Tolerances: Tol Min %, Tol Max %
- Audit: Portfolio, Trader, Charges, Created, Modified

**Row Styles**:
- Matched rows: blue left border (3px)
- Cancelled rows: muted text, line-through
- Right-click context menu: View Trade | Amend Trade | Cancel Trade

**Filtering logic**: External filter combining status filter + quick filters. `isExternalFilterPresent` / `doesExternalFilterPass` pattern with AG Grid.

---

### 3. Trade Detail / Lifecycle (`lifecycle.html`)

**Layout**: Trade Header → Lifecycle Progress Bar → Two-column (Main + Audit Sidebar)

**Trade Header** (always visible, not scrolled):
- Left: Direction badge (BUY green / SELL red) + Trade ID (monospace, large) + Status pill + description line ("Shell Energy Trading — 3,200,000 MMBtu JKM+$0.50 DES Jun-26")
- Right: Action buttons — Amend | Clone | Record Discharge (primary) | Cancel (destructive red)

**Lifecycle Progress Bar** (horizontal stepper):
- Stages: Capture → Approval → Nomination → Loading → Voyage → Discharge → Settle → P&L
- Each stage: dot (done=green, active=accent with ring shadow, pending=empty with border) + label
- Connected by lines (green=done, accent=active edge, border=pending)
- Component: custom stepper, not a standard tab bar

**Tab Bar** (8 tabs):
1. **Trade Entry**: 4-column dense form grid (32+ fields). Each field: uppercase micro label + monospace value. Key fields highlighted with amber background. Sections: Trade Entry, Current Valuation (6 KPI fields in a row), Related Entities (4 entity links)
2. **Valuation**: Bar chart (simple div bars, green/red) + EOD table (Date, JKM Spot, MTM, Daily P&L, Cumulative, Delta) + Intraday table. Time range buttons: 1W | 1M | 3M | Life
3. **Physical**: 3-column field grids for Cargo & Vessel, Loading Details, Nomination
4. **Settlement**: Invoice Status fields + Settlement Breakdown table (line items with amounts) + Credit Impact fields
5. **Invoice Schedule**: Table with Seq, Type, Period, Volume, Rate, Amount, Due Date, Status (Paid/Locked/Open), lock icon. Totals row with bold.
6. **Linked Trades**: Table of related trades. Usually sparse — shows empty state message.
7. **Supply Plan**: Period-by-period table — Planned/Expected/Actual/Variance/Status/Cargo. Variance coloured green (positive) or red (negative).
8. **Attributes**: 5 collapsible sections (Discharge Info 14 fields, Loading Info 17 fields, Dates 12 fields, References 9 fields, Trading Info 15 fields). Each section: collapse header with arrow + field count badge, body is dense 4-column form grid. Default: most collapsed, Loading Info open.

**Audit Sidebar** (right, 20rem, persists across all tabs):
- Audit Trail: vertical timeline with coloured dots (green/blue/amber) + event title + description + timestamp + user. Most recent on top.
- Documents: list with coloured square icon + filename + file size

**Modals** (3):
- Amend: grid of Field | Current | New Value rows + reason text field
- Cancel: warning banner (position impact) + reason dropdown + detail text
- Record Discharge: 2-column form grid (port, date, outturn volume, BOG, GHV, surveyor)
- All modals: overlay with blur backdrop, centered card, Cancel + Submit buttons

**Dense Form Pattern** (used across many tabs):
```
.hz-dense-form = CSS Grid, 4 columns, gap 0.5rem
Each cell:
  .df-label = uppercase 0.5rem, muted, 600 weight, letter-spacing
  .df-value = monospace, tabular-nums, primary colour
  .df-highlight = amber tinted background (key editable fields)
```
Map to: `<Stack direction="row" wrap gap="2">` with label/value pairs using `<Text size="2xs">` and `<Mono>`

---

### 4. Positions (`positions.html`)

**Layout**: KPI Strip → Toolbar (Benchmark + Range filters) → Position Ladder (fills remaining) → Drill-Down Panel (collapsible bottom)

**KPI Strip**: Long (green), Short (red), Net, P&L, WACOG — all monospace

**Position Ladder** (the core — heat-mapped matrix):
- Rows: Benchmarks (JKM, TTF, HH, Brent) + Totals row
- Columns: Monthly buckets (Jun 26 through Nov 26) + Net column
- Each cell shows: Volume (formatted ±450k), WACOG ($12.46), P&L (+$285k, with %), Physical/Paper split (P:+380k / H:+70k)
- **Heat map colouring**: 4 intensity levels for long (green 6%→30% opacity) and short (red 6%→30% opacity) based on volume magnitude
- **Keyboard navigation**: Arrow keys move focus between cells, Enter drills down, Escape closes drill panel
- Cells are `tabindex="0"`, focusable, with accent outline on hover/focus
- Selected cell gets accent background
- Totals row: bold, border-top, raised background

**Drill-Down Panel** (opens below ladder):
- Header: "Trades — JKM Jun 26" + Close button
- Table: ID (entity link), Side (B/S badge), Counterparty, Volume (right mono), Price (right mono), Status (colour-coded text)
- Max-height 30vh, scrollable

**Critical implementation note**: The heat map is the whole point of this page. The API should return positions as `{ benchmark, month, volume, wacog, pnl, pnlPct, physical, paper }` and the UI applies the heat class based on volume magnitude and sign.

---

### 5. Support Dashboard (`support-dashboard.html`)

**Layout**: KPI Row (6 cards) → 3-Column Grid

**KPIs** (horizontal row, equal width):
- System Health: green pulsing dot + "HEALTHY"
- EOD Status: blue pulsing dot + "RUNNING"
- Curve Load: "4/4 OK"
- Trade Count: "1,247" with delta "+12 today"
- Open Alerts: amber "3" with delta "1 fail"
- Uptime: "99.97%" with delta "30d"

**3-Column Layout** (`grid-template-columns: 1fr 1fr 18rem`):
- **Column 1**: EOD Run Status — table (Step, Started, Duration, Status badge)
- **Column 2**: Data Integrity Checks — list of check rows with dot, label, detail
- **Column 3** (narrow): Alerts feed — alert cards with coloured left border, service health dots

**Responsive**: Collapses to 2-col at 64rem, 1-col at 48rem

---

### 6. SQL Checks (`support-sql-checks.html` — v33 enhanced)

**Layout**: Toolbar → Parameter Bar → Check Table (fills remaining) → Detail Panel (collapsible bottom with tabs)

**Parameter Bar** (the key addition in v33):
- Horizontal row with labelled inputs: COB Date (date picker, defaults today), Environment (PROD/UAT/TST1/TST2), Book (All/GLNG/etc.), Benchmark (All/JKM/TTF/etc.)
- All checks use these params in their SQL generation
- Component: `<Stack direction="row" gap="3" align="center">` in a raised tile

**Check Table** (12 rows):
- Columns: Checkbox, #, Check Name (bold), Category (muted), Last Run (mono), Duration (mono), Result (StatusPill: PASS/WARN/FAIL), Details (truncated), Actions (Run + Results + SQL buttons)
- Active check row highlighted with accent background
- Running state: inline spinner animation before badge

**Detail Panel** (bottom, tabbed):
- Tabs: Results | SQL
- **Results tab**: Status badge + summary + row count + duration header, then a `.tbl` showing actual result rows (e.g. the 6 stale prices, the unmatched nomination). Empty state for passing checks: "No issues found — all records pass validation" in green.
- **SQL tab**: Syntax-highlighted code block with the query parameterised with the COB date. Highlighting classes: `.sql-kw` (accent/indigo, bold), `.sql-fn` (violet), `.sql-str` (green), `.sql-comment` (muted, italic), `.sql-num` (amber)
- Tab actions: Copy Results (tab-separated for Excel paste) | Copy SQL | Close
- Resizable via drag handle between table and panel

**Run behaviour**: Click Run → row shows spinner → brief delay → badge updates → results auto-open in detail panel → summary bar updates (pass/warn/fail counts + timestamp)

---

### 7. Environments (`support-environments.html`)

**Layout**: Environment Selector → Environment Info Bar → 3-Tab View (Map | Flow Tracer | Dashboard)

**Environment Selector**: Horizontal row of environment buttons (PROD, UAT, TST1, TST2). Active state: accent border + accent background. Disabled environments greyed out.

**Environment Info Bar**: Name + region badge + version (mono) + URL (mono, accent)

**Three views** (tab bar below info bar):
- **Map**: Topology diagram showing system components as nodes with health status. This is what the production `/support/environment` endpoint returns as `{ nodes, edges, asOf }`.
- **Flow Tracer**: Sequence/flow view showing data flow between components
- **Dashboard**: Aggregated health metrics for the selected environment

**Note for production**: Per your architectural decision, the API owns the topology model. The UI should consume `{ nodes: [...], edges: [...], asOf }` and render it. Node positions can be hand-tuned in a UI-only `topology-positions.ts`. Do NOT ship static `prod.json`/`uat.json` — probe registry is the catalogue.

### 8. Security Profile (`user-profile.html` — v39)

**Layout**: Identity Banner → KPI Row → Sidebar (20rem) + Main Content (1fr)

**Identity Banner**: Gradient background card with large avatar (accent ring), full name, AD domain\username (`Mono`), status pills (Online, User ID, Environment). Settings button top-right.

**KPI Row**: 4 tiles — Roles count, Legal Entities count, Permissions count (green), Trades MTD (accent).

**Sidebar** (left, 20rem):
- **Account**: key-value `DetailRow` pairs — username, domain, email, department, location, manager (entity link)
- **Authentication**: provider, MFA status (green badge), last login, password expiry, account created
- **Recent Activity**: timeline list with colour-coded dots (trade=accent, login=green, setting=amber, admin=blue)
- **Sessions**: compact table — device, IP, last active (current session highlighted green)

**Main Content** (right, 1fr):
- **Roles**: Gradient-bordered cards with icons — one per EOS role (Connect, Security Administrator, System Administrator)
- **Legal Entities**: Card grid (`auto-fill, minmax(13rem, 1fr)`) — code (mono, accent), full name (muted), ID, active dot
- **Permission Explorer**: The key feature. Search bar with live filter + match count. Stats bar (462 granted / 14 limited / 12 denied). 8 collapsible accordion categories grouped by verb prefix (Add, Change, View, Cancel, Cargo, Approve, Reports, System). Each permission is a coloured pill (green=granted, red=denied, amber=limited). Search auto-opens matching categories and hides empty ones.

**Data source**: Single `GET /api/admin/security-profile` returning user identity (from Keycloak claims + EOS user table), roles, legal entities, and permissions. Permission categorisation is client-side by parsing PascalCase names.

**Shell integration**: Avatar dropdown in header (click initials → flyout with name, role, View Profile / Settings / Sign Out). Sidebar entry under ADMINISTRATION. Command palette: `G U`.

**Full implementation guide**: `analysis/pass-to-claude/implementation-guide-security-profile.md`

---

## Universal Interaction Patterns

### Toast Notifications
- Brief messages at bottom-right: success (green), warning (amber), error (red)
- Some include an Undo action (e.g. trade cancellation)
- Auto-dismiss after ~4 seconds

### Entity Links
- Any ID that references another entity (Trade ID, Cargo Ref, Invoice ID, Nomination ID, Contract Ref) is an accent-coloured link with hover underline
- Click navigates to the detail page for that entity
- In production: React Router `<Link>` with your route structure

### Number Formatting
- Volumes: `3,200,000 MMBtu` or abbreviated `+6.4M`, `-17.6M`, `+450k`
- Prices: `$14.75`, right-aligned, monospace
- P&L: `+$340K`, `-$28K`, `+$2.1M` — always signed, green positive, red negative
- Percentages: `78%`, `59.5%`, `+4.6%`
- Dates: `01 Jun 2026` (display), `2026-06-01` (input), `17:30:54` (timestamps)
- All numeric display uses monospace font (`font-variant-numeric: tabular-nums`)

### Keyboard-First
- Tab order follows visual order, all interactive elements focusable
- Enter submits forms/confirms actions
- Escape closes modals/panels
- Ctrl+Enter for "run" actions (SQL Checks)
- Arrow keys for matrix navigation (Positions page)
- Date fields accept typed input (not picker-only)

### Density Tiers
- **Primary** (data grids, position matrix): ultra-compact, 0.5625rem–0.6875rem font, 24px rows, minimal padding
- **Secondary** (detail forms, cards): comfortable, 0.8125rem font, standard padding
- **Tertiary** (settings, help): spacious, 0.875rem font

---

## What NOT to Copy

1. **Tailwind CDN** — you already have Tailwind in your build pipeline, don't use the CDN
2. **shell.js `initShell()`** — this builds the entire chrome (header, sidebar, context strip) from JS. Your production app has its own shell/layout from React components
3. **Inline `<style>` blocks** — extract these into your Tailwind config or component styles
4. **Mock data in HTML** — all data comes from your API via TanStack Query
5. **`setTimeout` init pattern** — this was needed because `initShell()` restructures the DOM. With React, components render naturally
6. **AG Grid CDN** — use `ag-grid-react` package instead
7. **Raw HTML in cell renderers** — use React cell renderer components

## What TO Copy

1. **The visual ratios** — the specific font sizes (0.5rem labels, 0.5625rem values), the spacing scale (0.125rem cell padding), the heat map opacity levels. These encode "disciplined density."
2. **The data model** — column definitions, field names, status values, and how they map to badges/colours
3. **The interaction patterns** — drill-down from position matrix, inline run+results for SQL checks, collapsible attribute sections with field counts
4. **The colour semantics** — green=pass/positive/long, red=fail/negative/short, amber=warning/hedge, blue=info/in-progress/matched, neutral=cancelled/pending
