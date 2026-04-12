# Round 3: Consolidated Proposals & Final Recommendations

**Review Panel:** Ravi (LNG BA), UX Designer, Senior Trader, Risk Analyst, Tech Architect
**Date:** 2026-04-11

---

## Final Architecture Decision

**Adaptive Workspace with Command-First Navigation**

The UI will use a hybrid approach:
- **Collapsible sidebar** for primary navigation (grouped by function)
- **Command palette** (Cmd+K) for power users and entity search
- **Resizable panels** for trading workspaces
- **Context-adaptive density** - dashboard/AI views use standard density; grids/blotters use compact density
- **Dark mode default** with light mode toggle

---

## 1. Navigation Architecture (Final)

### Primary Structure
```
┌──────────────────────────────────────────────────────────┐
│ [≡] HORIZON   JKM $14.25 ▲  TTF $12.80 ▼  HH $3.42 ▲  │  <- Price ticker
├────────┬─────────────────────────────────────────────────┤
│        │                                                 │
│ HOME   │  [Main content area]                           │
│  Dash  │                                                 │
│  Brief │  Supports:                                      │
│        │  - Single panel (default)                       │
│ TRADE  │  - Split horizontal (2 panels)                  │
│  Deals │  - Split vertical (2 panels)                    │
│  Posns │  - Quad (4 panels)                              │
│  Hedge │                                                 │
│  Curve │  Each panel can show any view                   │
│        │                                                 │
│ CARGO  │                                                 │
│  Board │                                                 │
│  Map   │                                                 │
│  Ship  │                                                 │
│  Noms  │                                                 │
│        │                                                 │
│ SETTLE │                                                 │
│  Invoic│                                                 │
│        │                                                 │
│ AI     │                                                 │
│  Scen  │                                                 │
│  Ask   │                                                 │
│        │                                                 │
├────────┤                                                 │
│ [⌘K]   │                                                 │
│ Search │                                                 │
└────────┴─────────────────────────────────────────────────┘
```

### Command Palette Actions
- **Navigate:** "Go to Positions", "Open Cargo Board"
- **Search:** "Find trade BUY-20260411-ABC", "Search counterparty Shell"
- **Create:** "New Trade", "New Contract", "New Nomination"
- **Quick:** "Generate Briefing", "Run Scenario"

---

## 2. Screen-by-Screen Proposals

### 2.1 Dashboard (Redesigned)

**Layout:** 3-column grid with 6 widget areas

```
┌─────────────────┬─────────────────┬─────────────────┐
│ MARKET SNAPSHOT  │ PORTFOLIO       │ P&L WATERFALL   │
│ JKM  $14.25 ▲   │ Net: 6.4M Long  │ [bar chart]     │
│ TTF  $12.80 ▼   │ Unreal: +$2.1M  │ Price +$1.2M    │
│ HH    $3.42 ▲   │ Hedge: 92%      │ Trade +$0.8M    │
│ [sparklines]     │ [mini ladder]   │ FX    -$0.1M    │
├─────────────────┼─────────────────┤ Settle +$0.2M   │
│ CARGO PIPELINE  │ DEADLINES       ├─────────────────┤
│ Plan  ●●●  3    │ ⚠ NOM-2026-04   │ CREDIT EXPOSURE │
│ Nom   ●●   2    │   2 days left    │ Shell    ███░ 78%│
│ Load  ●    1    │ ⚠ LAY-2026-04   │ TotalEnr ██░░ 52%│
│ Voy   ●●   2    │   5 days left    │ JERA     █░░░ 24%│
│ Disch ●    1    │ ○ INV-2026-03   │ [view all]      │
│ [view board]     │   12 days left   │                 │
├─────────────────┴─────────────────┴─────────────────┤
│ AI BRIEFING HIGHLIGHTS                               │
│ • JKM rose 2.5% overnight on Asian buying            │
│ • Your Q3 position is 15% over-hedged                │
│ • Nomination deadline for CARGO-2026-04-A in 48hrs   │
│ [Read full briefing →]                               │
└──────────────────────────────────────────────────────┘
```

### 2.2 Trade Blotter (New View - replaces Trades tab)

**Layout:** Full-width data grid with toolbar

```
┌──────────────────────────────────────────────────────┐
│ TRADE BLOTTER                    [+ New Trade]       │
│ Filter: [All ▼] [All CP ▼] [All Bench ▼] [Search…]  │
├──────────────────────────────────────────────────────┤
│ Ref    │Dir│ CP      │Bench│Vol(MMBtu)│Price │Status │
│────────┼───┼─────────┼─────┼──────────┼──────┼───────│
│ BUY-01 │ B │ Shell   │ JKM │ 3,200,000│14.25 │●Active│
│ SELL-02│ S │ JERA    │ TTF │ 2,800,000│12.80 │●Draft │
│ BUY-03 │ B │ TotalEn │ JKM │ 3,200,000│14.50 │◐Pend  │
│ ...    │   │         │     │          │      │       │
├──────────────────────────────────────────────────────┤
│ Right-click: View | Amend | Cancel | Nominate | Cargo│
└──────────────────────────────────────────────────────┘
```

Features:
- AG Grid Community with sorting, filtering, column resize
- Right-click context menu
- Row color coding by status
- Real-time status updates via WebSocket
- Keyboard navigation (arrow keys, Enter to open detail)
- CSV export

### 2.3 Trade Entry Form (Redesigned)

**Key changes from current:**
1. Counterparty: Combobox with async search + credit traffic light
2. Ports: Combobox querying ports API, filtered by delivery terms
3. Pricing: Extended to support averaging periods and S-curves
4. Position impact: Real-time preview panel showing "Your position after this trade"
5. Credit check: Auto-fires on counterparty selection, blocks if breached

```
┌──────────────────────────────────────────────────────┐
│ CREATE TRADE                                    [×]  │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Direction:  [■ BUY (Long)] [ SELL (Short)]          │
│                                                      │
│ Counterparty: [Shell Energy Trading ▼]               │
│               🟢 Credit OK: $45M headroom            │
│                                                      │
│ ─── PRICING ────────────────────────────────────     │
│ Basis: [Fixed] [■ Hub Indexed] [Oil Indexed]         │
│ Benchmark: [JKM ▼]                                   │
│ Premium: [0.50] $/MMBtu                              │
│ Averaging: [Calendar month preceding delivery ▼]     │
│ Formula preview: Avg(JKM, M-1) + $0.50              │
│                                                      │
│ ─── VOLUME ─────────────────────────────────────     │
│ Quantity: [3,200,000] MMBtu  (≈ 0.062 MT)           │
│ Tolerance: [5] %                                     │
│                                                      │
│ ─── DELIVERY ───────────────────────────────────     │
│ Terms: [DES ▼]                                       │
│ Load Port: [Ras Laffan, Qatar 🔍▼]                  │
│ Discharge: [Sodegaura, Japan 🔍▼]                   │
│ Laycan: [2026-06-01] to [2026-06-15]                │
│                                                      │
│ ─── POSITION IMPACT ────────────────────────────     │
│ ┌──────────────────────────────────────────┐         │
│ │ Before: Net 3.2M Long (JKM Jun-26)      │         │
│ │ After:  Net 6.4M Long (JKM Jun-26)      │         │
│ │ Hedge ratio: 92% → 46% ⚠                │         │
│ └──────────────────────────────────────────┘         │
│                                                      │
│ [Create BUY Trade]                    [Cancel]       │
└──────────────────────────────────────────────────────┘
```

### 2.4 Position Ladder (Enhanced)

**Key changes:**
- Cells are clickable (drill down to underlying trades)
- Each cell shows: volume, WACOG, P&L, physical/paper split
- Column for totals
- Row for net across benchmarks

```
┌──────────────────────────────────────────────────────┐
│ POSITION LADDER          Total Unreal P&L: +$2.1M   │
├──────┬────────┬────────┬────────┬────────┬──────────┤
│      │ Apr-26 │ May-26 │ Jun-26 │ Jul-26 │ Total    │
├──────┼────────┼────────┼────────┼────────┼──────────┤
│ JKM  │ 3.2M L │ 0      │ 6.4M L │ 3.2M L │ 12.8M L │
│      │ +$0.8M │        │ +$1.2M │ +$0.1M │ +$2.1M  │
│      │ P:3.2M │        │ P:3.2M │ P:3.2M │         │
│      │ H:0    │        │ H:3.2M │ H:0    │         │
├──────┼────────┼────────┼────────┼────────┼──────────┤
│ TTF  │ 2.8M S │ 0      │ 0      │ 0      │ 2.8M S  │
│      │ -$0.3M │        │        │        │ -$0.3M  │
├──────┼────────┼────────┼────────┼────────┼──────────┤
│ Net  │ 0.4M L │ 0      │ 6.4M L │ 3.2M L │ 10.0M L │
└──────┴────────┴────────┴────────┴────────┴──────────┘
  Click any cell to see underlying trades
  P = Physical, H = Hedge/Paper
  Green bg = Long, Red bg = Short
```

### 2.5 Settlement View (Enhanced)

**Key changes:**
- Split into Invoices + Reconciliation tabs
- Invoice lifecycle buttons (Provisional -> Final -> Approved -> Paid)
- Aging buckets visualization
- Quality adjustment line items
- Batch approval capability

---

## 3. Shared Component Specifications

### 3.1 DataGrid Component
Wraps TanStack Table with consistent styling:
- Sortable columns (click header)
- Column filter (text input below header)
- Row hover highlight
- Row selection (checkbox column)
- Compact density (text-xs, py-1.5)
- Stripe pattern (optional)
- Empty state
- Loading skeleton
- Footer with row count + pagination

### 3.2 EntityCombobox Component
Reusable for ports, counterparties, vessels:
- Text input with dropdown
- Async search (debounced 300ms)
- Renders structured results (name, code, metadata)
- Slot for inline indicators (credit traffic light, port type badge)
- Keyboard navigation
- Clear button
- Loading state during search

### 3.3 StatusBadge Component
Standardized across all entities:
- Color mapping from status string
- Consistent shape (rounded-full, px-2 py-0.5, text-xs)
- Dark mode aware

### 3.4 MetricCard Component
Dashboard KPI widget:
- Label (text-xs, muted)
- Value (text-2xl, bold, color-coded)
- Delta (text-xs, arrow icon, green/red)
- Optional sparkline
- onClick for drill-down

### 3.5 LifecycleActions Component
Status transition buttons for any entity:
- Reads valid transitions from backend
- Renders buttons for each valid next state
- Confirmation dialog for destructive transitions
- Disabled state during mutation

---

## 4. Three Demo Approaches

Based on the panel's discussions, we will build three demo sites to explore different design directions. All use mock data and Tailwind CSS.

### Demo 1: "Terminal" - Bloomberg-Inspired Dense Trading UI
- Dark theme (slate-900 background)
- Multi-panel resizable layout
- Compact data tables everywhere
- Price ticker in header
- Monospace fonts for numbers
- Keyboard shortcut hints on every action
- Maximum information density
- Minimal whitespace

### Demo 2: "Clarity" - Clean Modern SaaS Trading UI  
- Light theme with generous whitespace
- Card-based layouts
- AI narrative as hero element
- Progressive disclosure (summary -> detail)
- Larger text, more padding
- Illustration/iconography
- Mobile-responsive
- Onboarding-friendly

### Demo 3: "Horizon" - Adaptive Workspace (Recommended)
- Configurable theme (dark/light toggle)
- Collapsible sidebar navigation
- Command palette (Cmd+K)
- Resizable panels for workspaces
- Standard density for dashboards, compact for grids
- Entity linking and drill-down
- Searchable comboboxes
- Real-time price indicators
- Context menus on data rows

---

## 5. Ravi's Final Guidance

> "I've seen three ETRM implementations fail because they looked great in demos but couldn't handle the day-to-day reality of trading. Here's what actually matters, in order:
>
> 1. **Data entry must be fast and accurate.** Comboboxes, not free text. Credit checks, not after-the-fact surprises. Pricing formulas that match term sheets, not simplified versions.
>
> 2. **Everything must be connected.** A trade is not just a row in a table. It's linked to a contract, a cargo, a nomination, a vessel, and an invoice. If I can't navigate that chain in two clicks, the system is broken.
>
> 3. **Grids must be sortable, filterable, and exportable.** This is table stakes. No trader will accept a grid they can't sort by delivery month or filter by counterparty.
>
> 4. **Workflows must have state machines.** A trade in DRAFT needs a button to submit it. An invoice in PROVISIONAL needs a button to finalize it. The backend has these transitions defined - the UI just needs to expose them.
>
> 5. **The AI integration is your competitive advantage.** Don't bury it. The briefing should be the first thing a trader sees, not the 13th tab. Scenarios and discovery should be accessible from any screen, not siloed in their own views.
>
> Everything else - dark mode, keyboard shortcuts, drag-and-drop, custom workspaces - is polish. Important polish, but polish. Get 1-4 right first."

---

## 6. Panel Vote

| Reviewer | Preferred Demo | Rationale |
|----------|---------------|-----------|
| Ravi (BA) | Demo 3 (Horizon) | "Adaptive density is the right approach. Dashboard tells a story, blotter shows data." |
| Trader | Demo 1 (Terminal) | "I want maximum data. But Demo 3's workspace panels are a good compromise." |
| Risk Analyst | Demo 3 (Horizon) | "I need dense grids for positions but clean layouts for reports. Both in one system." |
| UX Designer | Demo 3 (Horizon) | "Demo 2 is too sparse for power users. Demo 1 is too dense for onboarding. Demo 3 adapts." |
| Tech Architect | Demo 3 (Horizon) | "Demo 3's component model is most maintainable. shadcn + resizable panels + cmdk is proven." |

**Result: Demo 3 (Horizon - Adaptive Workspace) is the recommended direction, borrowing density from Demo 1 for data views and clarity from Demo 2 for narrative/AI views.**
