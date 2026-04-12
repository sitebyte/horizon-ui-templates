# Phase 2 — Round 1: Discovery & Requirements Gathering

**Panel:** Sasha (UI Lead), Marcus (UX Lead / Trader), Ravi (LNG BA)
**Date:** 12 April 2026
**Focus:** Front office vs back office UI needs, advanced interaction patterns

---

## 1. The Core Insight: Two Audiences, One System

The single most important finding across all three reviewers: **front office and back office users have fundamentally different relationships with the UI**.

| Dimension | Front Office (Traders) | Back Office (Ops/Settlement/Finance) |
|-----------|----------------------|--------------------------------------|
| **Primary goal** | Execute trades fast, monitor positions | Process workflows accurately, ensure compliance |
| **Speed priority** | Seconds matter — 15 seconds to enter a trade | Minutes acceptable — accuracy over speed |
| **Screen time** | 10+ hours/day, same screens | Varies by task, moves between screens |
| **Keyboard use** | Essential — shortcut keys, Tab/Enter flows | Moderate — mouse-driven, some keyboard |
| **Information density** | Maximum — every pixel shows data | Moderate — need clarity for complex workflows |
| **Form preference** | Minimal fields, defaults for the rest | All fields visible, validation, audit trail |
| **Grid interaction** | Read + drill-down, no editing in grid | Inline editing, bulk select, status changes |
| **Approval workflows** | Submits, doesn't approve | Approves, reviews, reconciles |
| **Primary screen** | Position ladder + blotter + curves | Invoice queue + nominations + reconciliation |
| **Menu depth** | Flat — 4-5 items, switch fast | Hierarchical — needs sub-menus for workflow steps |

## 2. Menu System Requirements

### 2.1 Multi-Level Menu Hierarchy (Ravi + Marcus consensus)

An LNG ETRM needs this menu structure:

```
TRADING
  ├── Dashboard ..................... overview + AI briefing
  ├── Quick Entry ................... front-office speed form
  ├── Deal Blotter .................. all trades, real-time
  ├── Position Ladder ............... benchmark × month grid
  ├── Curves & Pricing
  │   ├── Forward Curves ........... JKM, TTF, HH, Brent
  │   ├── Spread Monitor ........... JKM-TTF, JKM-HH
  │   └── Arbitrage Calculator ..... netback/freight analysis
  └── Hedge Book .................... paper trades + ratio

PHYSICAL OPERATIONS
  ├── Cargo Board ................... Gantt timeline
  ├── Vessel Tracking ............... map + AIS positions
  ├── Nominations
  │   ├── ADP Schedule ............. annual delivery program
  │   ├── Cargo Nominations ........ per-cargo noms
  │   └── Vessel Nominations ....... vessel assignment
  └── Shipping Calculator ........... voyage cost + BOG

SETTLEMENT & FINANCE
  ├── Invoice Queue ................. (badge: "3 pending")
  │   ├── Provisional Invoices
  │   ├── Final Invoices
  │   └── Disputed Invoices
  ├── Reconciliation ................ provisional vs final
  ├── Demurrage ..................... laytime calculations
  ├── Quality Adjustments ........... CV/GHV corrections
  └── Payment Tracking .............. receivables + payables

RISK & COMPLIANCE
  ├── Credit Dashboard .............. counterparty exposure
  ├── Position Limits ............... limit monitoring
  ├── Hedge Effectiveness ........... physical vs paper
  └── Reports
      ├── Daily P&L ................. attribution breakdown
      ├── Position Report ........... end-of-day snapshot
      └── Regulatory ................ REMIT/EMIR/Dodd-Frank

ADMINISTRATION
  ├── Counterparties ................ CRUD + credit limits
  ├── Contracts ..................... SPA/MSA/Spot management
  ├── Vessels ....................... fleet + charter pool
  ├── Ports & Terminals ............. reference data
  └── System Settings ............... preferences + config
```

### 2.2 Menu Interaction Patterns

**Collapsible behavior:**
- Default: sidebar expanded showing labels + icons
- Click collapse button: sidebar shrinks to icon-only (3.5rem)
- Hover on collapsed sidebar: temporarily expand to show labels (tooltip or flyout)
- State persisted to localStorage
- Keyboard: `Cmd+B` or `Ctrl+B` to toggle

**Sub-menu expansion:**
- Accordion style: click parent to expand/collapse children
- Only one group expanded at a time (optional setting)
- Arrow icon rotates on expand
- Keyboard: Arrow Right to expand, Arrow Left to collapse

**Badges/counts:**
- Invoice Queue: show pending count ("3")
- Nominations: show approaching deadlines count
- Deal Blotter: show today's trade count
- Credit Dashboard: show breach count (if any, red)

**Favorites/pinned:**
- Users can right-click → "Pin to top" on any menu item
- Pinned items appear in a "Favorites" section above the main menu
- Stored in localStorage

## 3. Form Patterns Required

### 3.1 Quick Trade Entry (Front Office)

**Purpose:** Capture a trade in 15 seconds. Keyboard-only capable.

**Layout:** Single horizontal strip, pinned to top of trading views.

```
[B|S] [Counterparty___▼] [3,200,000] [JKM] [+0.50] [Jun-26] [Enter ⏎]
 ↑         ↑                ↑          ↑      ↑        ↑
 B/S key  3 chars+Tab    Tab+type   dropdown  price    month
```

**Fields (6 only):**
1. Direction: B/S toggle (keyboard: B or S key)
2. Counterparty: type-ahead, 3 chars trigger search, Tab to select top result
3. Volume: numeric, auto-format with commas, default 3,200,000
4. Benchmark: dropdown (JKM/TTF/HH), keyboard: arrow keys
5. Price/Premium: numeric, sign indicates premium (+) or discount (-)
6. Delivery Month: month picker, keyboard: type "Jun26"

**Behavior:**
- Enter submits immediately
- Trade appears in blotter below
- Form clears and refocuses for next entry
- Non-essential fields (tolerance, ports, delivery terms) get smart defaults
- Can be edited afterward via inline-edit on the blotter row

### 3.2 Full Trade Entry (Back Office)

**Purpose:** Complete data capture with all fields and validation.

**Layout:** Multi-section card form in slide-over panel (existing pattern).

**Fields (15+):**
- Reference (auto-generated)
- Contract link (optional, dropdown)
- Direction (toggle)
- Counterparty (searchable combobox + credit display)
- Volume + tolerance
- Pricing: basis selector → conditional fields (Fixed/Hub/Oil/Hybrid)
- Averaging period
- Delivery terms (FOB/DES/DAP → cascades port selection)
- Load port (searchable, filtered by delivery terms)
- Discharge port (searchable)
- Laycan dates (start/end with validation)
- Currency
- Notes/comments

### 3.3 Nomination Form (Cascading Lookups)

```
Select Contract: [SPA-2026-QATAR ▼]
                    ↓ filters
Available Cargoes: [CARGO-Q2-03 ▼]
                    ↓ pre-fills
Volume:           [3,200,000] MMBtu
Delivery Month:   [Jun 2026]
                    ↓ filters
Select Vessel:    [Al Dafna (IMO: 9431111) ▼]
                    ↓ calculates
ETA Load:         15 Jun 2026 (auto)
ETA Discharge:    28 Jun 2026 (auto)
```

### 3.4 Invoice Form (Editable Line Items Grid)

```
┌────────────────────────────┬────────┬──────────┬──────────┐
│ Description                │ Qty    │ Rate     │ Total    │
├────────────────────────────┼────────┼──────────┼──────────┤
│ [LNG DES Delivery Jun-26] │ [3.2M] │ [$14.25] │ $45.6M   │
│ [Quality adjustment      ] │ [1   ] │ [$-0.12] │ -$384K   │
│ [BOG compensation        ] │ [1   ] │ [$82K  ] │ $82K     │
│ [+ Add line item]          │        │          │          │
├────────────────────────────┼────────┼──────────┼──────────┤
│                            │        │ Subtotal │ $45.3M   │
│                            │        │ Tax (0%) │ $0       │
│                            │        │ TOTAL    │ $45.3M   │
└────────────────────────────┴────────┴──────────┴──────────┘
[Submit for Approval] [Save Draft] [Cancel]
```

### 3.5 Settlement Reconciliation (Side-by-Side Comparison)

```
┌──────────────────────┬──────────────────────┐
│ PROVISIONAL INVOICE  │ FINAL INVOICE        │
├──────────────────────┼──────────────────────┤
│ Volume: 3,200,000    │ Volume: 3,198,450 ⚠  │
│ Price:  $14.25       │ Price:  $14.22    ⚠  │
│ Amount: $45,600,000  │ Amount: $45,481,959  │
│ Quality: Standard    │ Quality: +0.02 GHV ⚠ │
│ BOG:    N/A          │ BOG:    -1,550 MMBtu │
├──────────────────────┼──────────────────────┤
│ DIFFERENCE                    -$118,041     │
│ Within tolerance (0.26%)      ✓ AUTO-APPROVE│
└─────────────────────────────────────────────┘
```

## 4. Grid Pattern Requirements

### 4.1 Front Office: Position Ladder (Interactive)

- Cells are clickable → drill-down shows underlying trades
- Each cell shows: volume, P&L, physical/paper split
- WebSocket updates flash changed cells
- Sticky first column + header row
- Monospace font for all numbers

### 4.2 Front Office: Trade Blotter (AG Grid)

- AG Grid with Community features
- Columns: Time, Dir, Ref, Counterparty, Volume, Price, Benchmark, Delivery, Status
- Working: sort any column, filter by status/benchmark, resize columns
- Row selection for context actions
- Right-click context menu: View, Amend, Cancel, Nominate
- New trades appear at top with flash animation
- Dense row height (2rem)

### 4.3 Back Office: Invoice Approval Queue (AG Grid)

- Checkbox column for bulk selection
- Status column with inline dropdown (change status without opening detail)
- Filter bar: Status, Type, Counterparty, Date range
- Action column: Approve / Reject / View buttons
- Bulk action bar: "Approve Selected (3)" button
- Export CSV
- Standard row height (2.5rem)

### 4.4 Back Office: Nomination Schedule

- Group by month (collapsible groups)
- Status badges with deadline countdown
- Inline status update dropdown
- Filter by status, contract, delivery month
- Sort by deadline date (default)

## 5. What Themes D, E, F Should Each Demonstrate

### Theme D: "Front Office Workspace"
**Visual:** Dark-first, dense, wide-screen optimized, teal/cyan accent
**Key patterns:**
- Quick trade entry strip pinned at top
- Multi-panel resizable layout (blotter + position ladder + curves)
- Real-time price ticker in header
- Keyboard shortcut overlay (? key)
- AG Grid blotter with dense rows, working sort/filter
- Command palette (Cmd+K) with trade actions
- Minimal sidebar (icon-only default, expandable)
- Position ladder with drill-down popover

**Pages:** Dashboard, Quick Entry + Blotter, Position Ladder, Curves, Hedge Book, Settings, Sign In, 404

### Theme E: "Back Office Operations Hub"
**Visual:** Light-first, comfortable density, blue accent, clean professional
**Key patterns:**
- Approval queue dashboard (pending invoices, nominations, trade validations)
- Full-width AG Grid with inline editing (status dropdowns, batch approve)
- Multi-section forms with full validation
- Side-by-side reconciliation view
- Invoice with editable line items
- Hierarchical sidebar with sub-menus (expandable accordion)
- Breadcrumb trail for workflow navigation
- Export CSV from every grid

**Pages:** Dashboard, Invoice Queue, Reconciliation, Full Trade Entry, Nomination Form, Contract Wizard, Audit Log, Settings, Sign In, 404

### Theme F: "Unified ETRM"
**Visual:** Adaptive — dark trading views, light admin views. Indigo+violet gradient accent.
**Key patterns:**
- Role-based sidebar: "Trader" preset and "Operations" preset with different default expanded sections
- Both quick entry AND full forms available
- Both dense blotter AND comfortable approval grids
- Cascading nomination form
- Command palette with role-aware actions
- Working AG Grid with full-row editing
- Keyboard shortcut system with visible hints
- Responsive: works on laptop to ultra-wide

**Pages:** Dashboard, Quick Entry, Blotter (AG Grid), Position Ladder, Full Trade Form, Invoice Queue (AG Grid inline edit), Nomination Wizard, Reconciliation, Settings (with role selector), Sign In, 404

## 6. Round 1 Scorecard

| Area | Completeness | Notes |
|------|-------------|-------|
| Menu hierarchy | 9/10 | Full ETRM menu mapped with sub-items |
| Front office needs | 9/10 | Quick entry, keyboard-first, density defined |
| Back office needs | 8/10 | Approval workflows, bulk ops, reconciliation |
| Form variations | 9/10 | 5 distinct patterns specified |
| Grid patterns | 8/10 | Front + back office grids differentiated |
| Theme D/E/F proposals | 9/10 | Each has clear functional differentiator |
| Keyboard design | 8/10 | Shortcut map + AG Grid keyboard + tab order |

**Ready for Round 2: Detailed specification of each theme's page list and interactions.**
