# Round 2: Design Patterns & Technology Recommendations

**Review Panel:** Ravi (LNG BA), UX Designer, Senior Trader, Risk Analyst, Tech Architect
**Date:** 2026-04-11

---

## 1. Three Design Philosophies Considered

The panel evaluated three distinct approaches to the UI redesign. Each has tradeoffs.

### Approach A: "Bloomberg Terminal" - Maximum Information Density
- **Philosophy:** Dark theme, every pixel earns its place, multi-panel layouts, keyboard-first
- **Inspiration:** Bloomberg Terminal, Refinitiv Eikon
- **Strengths:** Traders who use Bloomberg daily will feel at home. Maximum data visibility. Professional gravitas.
- **Weaknesses:** Steep learning curve. Overwhelming for occasional users. Harder to build accessible.
- **Ravi's view:** "The traders I work with live in Bloomberg. They want dense data. But our ops and finance users don't - they want clarity."
- **Trader's view:** "Yes. This is what I want. Give me 4 panels, each with a different data stream."

### Approach B: "Modern SaaS" - Clean, Narrative-First
- **Philosophy:** Light theme, generous whitespace, card-based, progressive disclosure, AI narrative as primary
- **Inspiration:** Linear, Notion, modern fintech apps (Ramp, Mercury)
- **Strengths:** Lower learning curve. AI briefings shine. Mobile-friendly. Approachable for non-traders.
- **Weaknesses:** Information density too low for active trading. Too many clicks to reach data. "Looks nice but I can't work in it."
- **Ravi's view:** "Good for management reporting and occasional users. But the traders will revolt."
- **Risk view:** "I need to see 50 positions at once, not 5 cards with animations."

### Approach C: "Adaptive Workspace" - Context-Aware Density (RECOMMENDED)
- **Philosophy:** Configurable density. Dashboard is clean/narrative. Trading views are dense. User controls panel layout.
- **Inspiration:** VS Code, Figma, modern Bloomberg (which has evolved toward this)
- **Strengths:** Each persona gets the density they need. Command palette unifies navigation. Resizable panels allow custom workspaces.
- **Weaknesses:** More complex to implement. Need to maintain two density modes. Risk of inconsistency.
- **Ravi's view:** "This is right. The dashboard should tell me a story. The position ladder should show me everything."
- **Trader's view:** "As long as I can arrange my panels and it remembers my layout, I'm good."
- **Risk's view:** "I want dense tables with drill-down. The drill-down can be clean/spacious."

**Panel Decision: Approach C with elements of A for data views and B for narrative/AI views.**

---

## 2. Technology Stack Recommendations

### 2.1 Data Grid: TanStack Table (Primary) + AG Grid Community (Complex Views)

**Decision:** Use TanStack Table for most tables, AG Grid Community for the trade blotter and position ladder.

| Factor | TanStack Table | AG Grid Community |
|--------|---------------|-------------------|
| License | MIT (free) | MIT (free) |
| Bundle size | ~30KB with virtualization | ~200KB+ |
| Customization | Full control (headless) | Limited to AG Grid's API |
| Learning curve | Medium (you build the UI) | Low (batteries included) |
| Sorting/Filtering | Yes | Yes |
| Virtual scrolling | Via TanStack Virtual | Built-in |
| Column pinning | Manual implementation | Built-in |
| Row grouping | Manual | Built-in |
| Cell editing | Manual | Built-in |
| Export | Manual | Built-in (CSV) |

**Ravi's guidance:** "Use TanStack Table for simple lists (invoices, nominations, contracts) where you have <100 rows and want design consistency. Use AG Grid Community for the trade blotter and position ladder where traders need instant sort/group/filter on 500+ rows."

### 2.2 Command Palette: cmdk (via shadcn/ui Command component)

The shadcn/ui Command component wraps cmdk - fast, composable, accessible. Provides:
- Quick navigation between all views
- Entity search (trade by reference, counterparty by name)
- Action execution (create trade, generate briefing)
- Keyboard-first interaction (Cmd+K to open, arrow keys to navigate, Enter to select)

### 2.3 Resizable Panels: react-resizable-panels (via shadcn/ui Resizable)

For Bloomberg-style multi-panel layouts:
- Horizontal and vertical splits
- Drag handles with min/max constraints
- Persist layout to localStorage
- Keyboard accessible resize
- Used in VS Code, Figma

### 2.4 Charts: Recharts (keep) + TradingView Lightweight Charts (add)

| Use Case | Library | Rationale |
|----------|---------|-----------|
| Position bars, P&L waterfall | Recharts | Already in project, good for categorical data |
| Forward curves, price history | Lightweight Charts | 45KB, canvas-based, built for financial data |
| Sparklines in tables | Custom SVG or Recharts mini | Inline price movement indicators |
| Heatmaps (position ladder) | Custom with Tailwind | Color-coded cells already implemented |

### 2.5 Real-time: Native WebSocket (keep) + React patterns

**Current:** `useWebSocket.ts` exists but only handles cache invalidation.
**Recommended evolution:**
- Keep native WebSocket (already implemented, Python backend doesn't use SignalR)
- Add `useRealtimePrice` hook that subscribes to price channels
- Use `requestAnimationFrame` for high-frequency updates (avoid re-render storms)
- Flash animation on price change (green flash up, red flash down)
- Throttle UI updates to 250ms minimum (human perception limit)

SignalR was considered but rejected: it's a .NET technology, the backend is Python/FastAPI. Native WebSocket is the right choice here.

### 2.6 Forms: React Hook Form + Zod

| Feature | Recommendation |
|---------|---------------|
| Form state | React Hook Form (smaller, faster than Formik) |
| Validation | Zod schemas (already used in backend Pydantic models) |
| Conditional fields | RHF `watch()` for field dependencies |
| Combobox | shadcn/ui Combobox with async search |
| Date picker | shadcn/ui DatePicker (with Popover + Calendar) |

### 2.7 Notifications: Sonner

- Lightweight toast library
- Supports: success, error, warning, info, loading, custom
- Stacks nicely
- Dark/light theme aware
- Can be combined with sound alerts for price triggers

### 2.8 Component Library: shadcn/ui (install progressively)

**Priority installation order:**
1. Button, Input, Label, Select, Badge (foundation)
2. Dialog, Sheet, Popover, Tooltip (overlays)
3. Command (Cmd+K palette)
4. Table (base for TanStack Table integration)
5. Combobox (port/counterparty search)
6. Resizable (panel layouts)
7. DropdownMenu (context menus)
8. Tabs, Separator, ScrollArea (layout)
9. Calendar, DatePicker (date selection)
10. Sonner/Toast (notifications)

---

## 3. Design Pattern Specifications

### 3.1 Master-Detail Pattern
The dominant layout for ETRM screens. Used for: contracts, trades, cargoes, nominations, invoices.

```
+-------------------+------------------------+
|   List Panel      |   Detail Panel         |
|   (1/3 width)     |   (2/3 width)          |
|                   |                        |
|  [Filterable      |  [Entity header]       |
|   sortable grid]  |  [Tab sections]        |
|                   |  [Related entities]    |
|  Click row ->     |  [Action buttons]      |
|  loads detail     |  [Audit trail]         |
+-------------------+------------------------+
```

**Already partially implemented** in ContractsView.tsx (list left, detail right). Should be standardized as a reusable layout component.

### 3.2 Entity Lifecycle Pattern
Every domain entity with a status should display:
- Current status badge (color-coded)
- Valid next-state action buttons (driven by backend transition rules)
- Transition history timeline
- Confirmation dialog for destructive transitions (cancel, void)

```
[DRAFT] -> [Submit for Approval] [Cancel]
[PENDING_APPROVAL] -> [Approve] [Reject] [Return to Draft]
[APPROVED] -> [Execute] [Cancel]
```

### 3.3 Searchable Combobox Pattern
For ports, counterparties, vessels, benchmarks:
- Text input with dropdown
- Async backend search on keystroke (debounced 300ms)
- Show structured results: name, code, country, status indicators
- For counterparties: inline credit traffic light
- For ports: show port type, UN/LOCODE
- Clear button, keyboard navigation (arrow keys, Enter)
- Filter results based on form context (delivery terms -> port type)

### 3.4 Dashboard Widget Pattern
Each dashboard KPI should follow:
- **Metric label** (small, muted)
- **Current value** (large, bold, color-coded for P&L)
- **Change indicator** (delta from previous period, arrow up/down)
- **Sparkline** (7-day trend, optional)
- **Click to drill down** (navigates to detail view)

### 3.5 Grouped Navigation Pattern
Replace flat tabs with categorized sidebar or mega-menu:

```
HORIZON
─────────────────
HOME
  Dashboard
  Briefing

TRADING
  Contracts
  Trade Blotter
  Positions
  Hedges
  Curves

PHYSICAL
  Cargo Board
  Cargo Map
  Shipping
  Nominations

FINANCE
  Settlement
  Invoices

AI
  Scenarios
  Ask AI
─────────────────
[Cmd+K] Search...
```

### 3.6 Price Ticker Pattern
Real-time price display in header or sidebar:
```
JKM $14.25 ▲0.35 (+2.5%)  |  TTF $12.80 ▼0.15 (-1.2%)  |  HH $3.42 ▲0.02 (+0.6%)
```
- Flash green on uptick, red on downtick
- 250ms minimum between visual updates
- Click to jump to Curves view for that benchmark
- WebSocket subscription to price channel

### 3.7 Context Menu Pattern
Right-click on table rows provides entity-specific actions:
- Trade row: View Detail, Amend, Cancel, Create Nomination, View Cargo, Create Invoice
- Cargo row: View Detail, Update Status, View on Map, View Invoice
- Invoice row: View Detail, Approve, Dispute, Export PDF

---

## 4. Color System

### Semantic Colors
```
Buy/Long:       green-600 (#16a34a)     green-100 bg
Sell/Short:     red-600   (#dc2626)     red-100 bg
P&L Positive:   green-600               green-50 bg
P&L Negative:   red-600                 red-50 bg
Neutral:        gray-500                gray-50 bg

Status - Draft:     gray
Status - Pending:   blue
Status - Active:    green
Status - Warning:   amber
Status - Error:     red
Status - Closed:    gray (muted)

Cargo Phase - Planning:     slate
Cargo Phase - Nomination:   blue
Cargo Phase - Loading:      amber
Cargo Phase - Voyage:       indigo
Cargo Phase - Discharge:    emerald
Cargo Phase - Settlement:   green
```

### Dark Mode
The CSS already supports dark mode classes. Add a toggle in the header. Trading users overwhelmingly prefer dark mode for extended screen time.

---

## 5. Typography & Density

### Standard Density (Dashboards, Forms, AI views)
- Page title: text-2xl font-bold (24px)
- Section title: text-lg font-semibold (18px)
- Body: text-sm (14px)
- Caption/label: text-xs (12px)
- Line height: relaxed
- Padding: p-4 to p-6

### Compact Density (Grids, Blotters, Position Ladder)
- Column headers: text-xs font-medium uppercase tracking-wide
- Cell text: text-xs font-mono (for numbers)
- Row padding: py-1.5 px-2
- No unnecessary whitespace
- Data > decoration

---

## 6. Key Research Findings (Web Research)

### Bloomberg Terminal Design Principles
- "Surfacing what you need to know, when you need to know it, and why this is relevant to you"
- Dark background = brand identity + reduced eye strain for extended use
- Tabbed panel model where users fully customize their workflow
- Keyboard shortcuts for everything - power users never touch the mouse
- Information density is a feature, not a bug

### Modern ETRM Trends (2025-2026)
- Cloud-native with real-time analytics (Previse Coral, Molecule, Orchestrade)
- AI-powered frontends as an "architectural alternative" (NTT Data)
- Integrated front-to-back on single platform
- Cross-commodity capability
- "Easy-to-use experience at its core" (Molecule)
- Near real-time reporting with 30+ integrations

### Data Grid Selection
- AG Grid and TanStack Table are now official partners, recognizing they serve different needs
- TanStack Table: best for custom UIs, smaller bundle, MIT license
- AG Grid: best for feature-heavy enterprise needs (>10K rows, cell editing, pivoting)
- For trading platforms: AG Grid's proven performance with large datasets is advantageous

### Real-time Communication
- Native WebSocket is ideal for "performance-critical, real-time applications such as live financial dashboards"
- React re-renders only changed components, keeping UI smooth with frequent updates
- SignalR is .NET-centric, not ideal for Python backends
- requestAnimationFrame + state batching prevents render storms

---

## 7. Consensus Priorities for Round 3

After debate, the panel agreed on this priority order:

1. **Component library foundation** (shadcn/ui installation)
2. **Navigation restructure** (grouped sidebar + command palette)
3. **Searchable comboboxes** (ports, counterparties, vessels)
4. **Data grid upgrade** (TanStack Table for all tables)
5. **Trade lifecycle workflow** (status transitions + approval)
6. **Cross-view navigation** (entity linking)
7. **Dashboard enhancement** (P&L waterfall, cargo pipeline, credit summary)
8. **Real-time price streaming** (WebSocket + ticker display)
9. **Dark mode toggle**
10. **Keyboard shortcuts**

**Disagreements resolved:**
- Trader wanted real-time pricing as #1; Ravi argued "you can't build streaming on top of broken forms - fix data entry first." Panel agreed with Ravi.
- Risk wanted VaR display; Ravi said "VaR requires a calculation engine that doesn't exist yet. Focus UI effort on things the backend already supports." Panel agreed.
- UX designer wanted full design system first; Ravi said "progressively install shadcn components as needed, don't boil the ocean." Panel agreed.
