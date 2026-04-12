# UI Implementation Plan

**Based on:** Rounds 1-3 review, panel consensus, Ravi's prioritization
**Target:** Single developer, incremental delivery
**Approach:** Demo 3 "Horizon" (Adaptive Workspace) as the direction

---

## Phase 0: Foundation (Week 1-2)
*Goal: Establish the component library and design tokens so everything built after is consistent.*

### 0.1 Install shadcn/ui core components
- Button, Input, Label, Select, Badge
- Dialog, Sheet, Popover, Tooltip
- DropdownMenu, Separator
- ScrollArea, Tabs

### 0.2 Create shared utility components
- `StatusBadge` - unified status rendering across all entities
- `MetricCard` - dashboard KPI widget with label/value/delta/sparkline
- `EmptyState` - consistent empty state with icon + message + action
- `LoadingSkeleton` - replace "Loading..." text with animated skeletons
- `ConfirmDialog` - reusable confirmation for destructive actions

### 0.3 Consolidate duplicated utilities
- Merge 6+ copies of `formatCurrency`, `formatVolume`, `formatDate` into `lib/formatters.ts`
- Create `lib/colors.ts` for semantic color mappings (status -> color, direction -> color)

### 0.4 Add dark mode toggle
- Add theme toggle button to header
- Persist preference to localStorage
- Use existing dark: classes already in codebase

**Deliverable:** Consistent component foundation. No user-visible behavior change yet.

---

## Phase 1: Navigation & Structure (Week 3-4)
*Goal: Replace flat tabs with grouped sidebar + command palette.*

### 1.1 Collapsible sidebar navigation
- Group items: Home, Trading, Physical, Finance, AI
- Collapsible to icons-only mode
- Active item highlighting
- Persist collapsed state

### 1.2 Command palette (Cmd+K)
- Install shadcn/ui Command component (wraps cmdk)
- Navigation actions (all 13+ views)
- Entity search (trades by reference, counterparties by name)
- Quick actions (New Trade, Generate Briefing)
- Recent items

### 1.3 Price ticker in header
- Show JKM, TTF, HH current prices
- Direction arrows (up/down from previous)
- Click to navigate to Curves view
- WebSocket subscription for updates

### 1.4 Breadcrumb + context
- Show current location: Trading > Contracts > SPA-2026-001
- Back navigation support
- Entity reference in page title

**Deliverable:** Professional navigation. Users can find anything in 2 clicks or via Cmd+K.

---

## Phase 2: Data Entry Excellence (Week 5-7)
*Goal: Fix the critical data entry gaps identified in Round 1.*

### 2.1 Searchable comboboxes
- Install shadcn/ui Combobox component
- Port/terminal combobox: queries ports API, shows UN/LOCODE, port type, filtered by delivery terms
- Counterparty combobox: queries counterparties API, shows country, credit rating
- Vessel combobox: queries vessels API, shows IMO, capacity, type
- Benchmark combobox: static list with descriptions

### 2.2 Credit check integration
- When counterparty selected in trade form, auto-fire credit check API
- Display traffic light (green/amber/red) with headroom amount
- Warn if proposed trade volume exceeds headroom
- Allow override with reason for authorized users

### 2.3 Pricing formula enhancements
- Add averaging period selector (calendar month preceding, delivery month, 3-month average)
- Formula preview ("Avg(JKM, M-1) + $0.50")
- Support for S-curve pricing (multi-segment slopes)
- Currency selector

### 2.4 Conditional field cascading
- Delivery terms (FOB/DES) filters available ports
- Contract selection pre-fills counterparty, pricing basis, ports
- Direction (buy/sell) adjusts port labels (load port for seller, discharge port for buyer)

### 2.5 Position impact preview
- Show current position for the selected benchmark/month
- Show projected position after this trade
- Show hedge ratio impact
- Highlight if position would breach limits

### 2.6 Form validation with Zod
- Install React Hook Form + Zod
- Schema-based validation matching backend Pydantic models
- Inline field errors
- Volume range validation (min/max cargo size)
- Date range validation (end after start)

**Deliverable:** Trade entry form that a real trader would use. Fast, accurate, guided.

---

## Phase 3: Data Grids (Week 8-10)
*Goal: Replace all plain tables with sortable, filterable grids.*

### 3.1 TanStack Table integration
- Create `DataTable` wrapper component with consistent styling
- Features: column sorting, text filter, column visibility toggle, row selection
- Compact density mode for trading views
- CSV export button
- Pagination or virtual scrolling

### 3.2 Migrate existing tables
- Contracts list -> DataTable
- Trades list -> DataTable
- Nominations table -> DataTable
- Invoices table -> DataTable
- Paper trades table -> DataTable
- Hedge positions table -> DataTable

### 3.3 Trade blotter (new view)
- Replace TradesList with full-featured blotter
- Real-time row updates via WebSocket
- Right-click context menu (View, Amend, Cancel, Nominate)
- Saved filter presets
- Color-coded status column

### 3.4 Enhanced position ladder
- Clickable cells with drill-down to trades
- Physical/paper split per cell
- WACOG display
- Totals row and column

**Deliverable:** Every data table is sortable, filterable, exportable. Trade blotter is a proper working tool.

---

## Phase 4: Workflows & Lifecycle (Week 11-13)
*Goal: Add state machine transitions and cross-view navigation.*

### 4.1 Entity lifecycle actions
- Trade: Draft -> Submit -> Approve -> Execute -> Settle
- Invoice: Draft -> Issue -> Final -> Approve -> Pay
- Nomination: Draft -> Submit -> Confirm -> Amend
- Cargo: Status transitions through 17 states
- Buttons driven by backend `VALID_TRANSITIONS` dictionaries
- Confirmation dialog for Cancel/Void

### 4.2 Cross-view entity linking
- Trade detail: links to Contract, Cargo, Nominations, Invoices
- Contract detail: links to all Liftings/Trades, ACQ utilization
- Cargo detail: links to Trade, Vessel, Nomination, Invoice
- Invoice detail: links to Trade, Cargo
- Clickable reference links throughout all tables

### 4.3 Create nomination flow
- "Nominate" action on trade detail
- Vessel selection combobox with compatibility checks
- Auto-calculate ETA based on route
- Laycan window display
- Link to cargo creation

### 4.4 Amendment workflow
- "Amend" action on trade detail
- Amendment form (pre-filled with current values)
- Change highlighting (diff view)
- Amendment history/audit trail display

### 4.5 Approval queue (new view)
- Inbox-style list of pending approvals
- Trades pending approval
- Invoices pending approval
- Amendments pending approval
- Approve/Reject with comments

**Deliverable:** Complete trade lifecycle management through the UI. Everything is connected.

---

## Phase 5: Dashboard & Visualization (Week 14-16)
*Goal: Transform dashboard from KPI cards to intelligence center.*

### 5.1 Dashboard redesign
- P&L waterfall chart (Recharts)
- Cargo pipeline visualization
- Credit exposure summary
- AI briefing highlights (top 3 bullets, not full narrative)
- Upcoming deadlines with countdown
- Mini position ladder (next 6 months)

### 5.2 Forward curves with Lightweight Charts
- Install TradingView Lightweight Charts
- Interactive price history with crosshair
- Multi-curve overlay (JKM, TTF, HH on same chart)
- Spread visualization (JKM-TTF)
- Date range selector

### 5.3 Sparklines in tables
- Inline 7-day price trend in market snapshot
- Position trend in position table
- Invoice aging trend in settlement

### 5.4 Real-time enhancements
- Price flash animation (green up, red down)
- WebSocket connection status indicator
- Last-update timestamps on all data
- Auto-refresh with stale data warning

**Deliverable:** Dashboard that answers "what happened overnight and what do I need to do today" in 10 seconds.

---

## Phase 6: Power User Features (Week 17-19)
*Goal: Keyboard shortcuts, workspaces, context menus.*

### 6.1 Keyboard shortcuts
- `Cmd+K` - Command palette
- `N` - New trade (from any view)
- `P` - Go to positions
- `D` - Go to dashboard
- `Escape` - Close panel/dialog
- `?` - Show keyboard shortcuts overlay

### 6.2 Context menus
- Right-click on any table row
- Entity-specific actions (View, Amend, Cancel, Navigate to related)
- Keyboard accessible (Shift+F10)

### 6.3 Resizable panel workspaces
- Split-screen layouts (positions + curves side by side)
- Persist layout to localStorage
- Preset layouts: "Trader" (blotter + positions), "Ops" (cargo board + map)

### 6.4 Notification system
- Install Sonner
- Trade confirmations
- Price alerts
- Deadline warnings
- System status updates
- Optional sound notifications

**Deliverable:** Power user efficiency. Keyboard-first interaction. Custom workspaces.

---

## Phase 7: Risk & Reporting (Week 20-22)
*Goal: Add risk-specific views and export capabilities.*

### 7.1 Credit dashboard
- Counterparty exposure table
- Utilization bars
- Breach alerts
- Drill-down to trades

### 7.2 P&L report view
- Daily P&L with attribution breakdown
- Comparison: today vs yesterday
- Export to Excel/PDF
- Print-friendly layout

### 7.3 Hedge effectiveness report
- Physical vs paper by month
- Hedge ratio trend chart
- Unhedged exposure highlighting

### 7.4 Month-end close
- Checklist of close activities
- Status tracking (not started / in progress / complete)
- Links to relevant views for each activity

**Deliverable:** Risk and operations teams can generate reports without Excel.

---

## Technology Shopping List

| Package | Purpose | Install Phase |
|---------|---------|---------------|
| shadcn/ui components | UI foundation | Phase 0 |
| react-hook-form | Form state | Phase 2 |
| zod | Validation | Phase 2 |
| @tanstack/react-table | Data grids | Phase 3 |
| @tanstack/react-virtual | Virtual scrolling | Phase 3 |
| lightweight-charts | Financial charts | Phase 5 |
| sonner | Toast notifications | Phase 6 |
| cmdk (via shadcn Command) | Command palette | Phase 1 |
| react-resizable-panels (via shadcn Resizable) | Panel layouts | Phase 6 |

---

## Success Criteria

| Phase | Metric |
|-------|--------|
| 0 | All components use shared design tokens. Zero raw Tailwind class duplication for status badges. |
| 1 | Any view reachable in 2 clicks or via Cmd+K. Users can find trades by reference. |
| 2 | Trade entry form uses comboboxes for ports/counterparties. Credit check fires automatically. |
| 3 | All tables sortable by any column. CSV export works. Trade blotter handles 500+ rows. |
| 4 | Complete trade lifecycle (Draft -> Settled) manageable from UI. Entity cross-links work. |
| 5 | Dashboard answers "what happened overnight" in 10 seconds. Forward curves are interactive. |
| 6 | Power users never touch the mouse. Workspace layouts persist across sessions. |
| 7 | Risk manager can generate daily P&L report without leaving the system. |

---

## Risk Factors

1. **AG Grid licensing** - Community Edition may lack features needed for trade blotter. Fallback: build with TanStack Table.
2. **WebSocket reliability** - Price streaming at scale needs error recovery. Implement reconnect with exponential backoff.
3. **shadcn/ui customization** - May need to modify components for trading-specific patterns. This is by design (copy-paste, not npm).
4. **Performance with large datasets** - Position ladder with 36 months x 5 benchmarks = 180 cells. Virtual scroll not needed yet but plan for it.
5. **Single developer bandwidth** - 22 weeks is ambitious. Each phase should deliver standalone value so progress is visible even if later phases slip.
