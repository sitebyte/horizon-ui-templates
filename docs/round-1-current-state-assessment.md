# Round 1: Current State Assessment

**Review Panel:** Ravi (Senior LNG BA), UX Designer, Senior LNG Trader, Risk Analyst, Tech Architect
**Date:** 2026-04-11

---

## Executive Summary

Project Horizon's UI is a strong prototype with 13 views covering the core ETRM workflow: trading, physical operations, risk, and AI-powered analysis. The Cargo Scheduling Board, Voyage Calculator, and AI integration are standout features that exceed many production ETRMs. However, the system has significant gaps that would prevent real-world trading use: no searchable lookups for ports/counterparties, no trade lifecycle workflow, no cross-view navigation, no sortable/filterable data grids, and no real-time data streaming.

**Overall Score: 6.5/10** - Excellent domain coverage, needs UX depth.

---

## 1. What Works Well (Consensus)

### 1.1 Cargo Scheduling Board (Score: 9/10)
All reviewers praised this. The phase-based Gantt with 8 lifecycle phases mapped from 17 granular statuses, the phase summary strip, and the cargo detail panel with transition history is better than many production ETRMs. The color coding is clear and the information hierarchy is correct.

### 1.2 Domain Model Coverage (Score: 8/10)
The system covers the full trade lifecycle: contracts, trades, positions, hedges, nominations, settlement. Most ETRM systems take years to build this breadth. The pricing model handles fixed, hub-indexed, oil-indexed, and hybrid structures.

### 1.3 AI Integration (Score: 8/10)
The Briefing, Scenarios, and Ask AI views are a genuine differentiator. No mainstream ETRM has AI reasoning built in at this level. The cost/model metadata transparency is thoughtful.

### 1.4 Voyage Calculator with Netback (Score: 8/10)
Inline voyage calculation with netback/arbitrage analysis is something traders usually do in separate Excel models. Having it integrated with the port/route database is a real workflow improvement.

### 1.5 Contract Form Quality (Score: 7/10)
The ContractForm handles four contract types with conditional ACQ terms. The real-time MTPA conversion from MMBtu shows domain understanding. The slide-over panel pattern is appropriate for creation flows.

---

## 2. Critical Gaps (Unanimous Agreement)

### 2.1 Port/Terminal Selection - Plain Text Input (Severity: CRITICAL)
**Current:** `TradeForm.tsx` uses `<input type="text">` for load_port and discharge_port. Users type free text like "Ras Laffan, Qatar".
**Problem:** The system has 40+ terminals in its database with structured data (coordinates, UN/LOCODE, port type). Free text means no validation, no standardization, no link to shipping routes. Additionally, delivery terms (FOB vs DES) should cascade available ports.
**Required:** Searchable combobox querying the ports API, filtered by delivery terms and port type.

### 2.2 No Trade Lifecycle Workflow (Severity: CRITICAL)
**Current:** Trades are created in DRAFT status. There is no way to move them through the lifecycle (DRAFT -> PENDING_APPROVAL -> APPROVED -> EXECUTED).
**Problem:** The backend has `VALID_TRADE_TRANSITIONS` with all valid state changes, but the UI has no status transition buttons. Similarly, invoices have no lifecycle controls.
**Required:** Action buttons on trade/invoice detail reflecting valid state transitions. Approval queue for risk managers.

### 2.3 No Cross-View Navigation (Severity: CRITICAL)
**Current:** Each view is an island. You cannot click a trade to see its cargo, or a cargo to see its invoice.
**Problem:** The trade lifecycle chain (Trade -> Contract -> Cargo -> Nomination -> Invoice) is the core ETRM workflow. Without linked navigation, users must manually switch tabs and search.
**Required:** Clickable entity references throughout the UI. Trade detail links to contract, cargo, nominations. Cargo links to trade and invoice.

### 2.4 No Counterparty Credit Check in Trade Entry (Severity: CRITICAL)
**Current:** Counterparty selection is a plain `<select>` dropdown showing name and country.
**Problem:** The backend has a `CreditCheckResult` model with headroom, utilization, and rating. But the UI never calls it during trade entry. A trader has no idea if their counterparty has credit headroom for the proposed deal.
**Required:** When counterparty is selected, fire a pre-trade credit check and display traffic-light indicator (green/amber/red) with headroom amount.

### 2.5 No Sortable/Filterable Data Grids (Severity: HIGH)
**Current:** Every table is plain HTML `<table>` with hover effects. No sorting, filtering, search, pagination, column resize, or export.
**Problem:** A trade blotter without sorting is unusable. An invoice list without filtering by status is unworkable.
**Required:** Adopt TanStack Table or AG Grid Community for all data tables. Minimum: column sort, text filter, CSV export.

---

## 3. Gap Analysis by Persona

### 3.1 Trader's Perspective

| Need | Current State | Gap |
|------|--------------|-----|
| Morning P&L summary | Portfolio cards show unrealized P&L | No day-over-day change, no attribution |
| Live price streaming | Static prices from last fetch | No real-time ticking, no price alerts |
| Quick deal entry | Full form in slide-over | Too many clicks for rapid capture |
| Position impact preview | None | "If I do this trade, my position becomes..." |
| Spread/arb view | Individual benchmarks only | No JKM-TTF, JKM-HH spread display |
| Credit headroom | Not shown during trade entry | Must check separate system |
| Keyboard-driven workflow | No keyboard shortcuts | Tab/Enter navigation not optimized |
| Right-click context menus | None | No contextual actions on table rows |
| Saved workspace layouts | Single fixed layout | No customizable panel arrangement |

### 3.2 Risk Manager's Perspective

| Need | Current State | Gap |
|------|--------------|-----|
| VaR display | None | No Value at Risk calculation or display |
| Limit monitoring | None | No position/credit limit breach alerts |
| Concentration risk | None | No visualization by counterparty/geography |
| P&L decomposition | Total P&L only | No attribution (price move vs new trades vs FX) |
| Stress testing | AI scenarios only | No structured stress test interface |
| Trade validation queue | None | No approval inbox for new trades |
| Audit trail display | None in UI | Backend tracks changes but UI doesn't show them |
| Exception/break reporting | None | No anomaly highlighting |
| Credit dashboard | None | No counterparty credit utilization overview |

### 3.3 Operations/Product Control Perspective

| Need | Current State | Gap |
|------|--------------|-----|
| Invoice approval workflow | Table display only | No approve/reject/escalate actions |
| Provisional to final | Status shown | No comparison view, no quality adjustments |
| Settlement reconciliation | Basic table | No aging buckets, no batch operations |
| Create nomination flow | View only | No "create nomination" from UI |
| Vessel assignment | None in trade flow | No vessel selection with compatibility checks |
| Month-end close | None | No checklist or close process tracking |
| B/L to outturn tracking | Shown in cargo detail | No exception flagging for tolerance breach |

---

## 4. Navigation & Information Architecture

### Current State
- Flat tab bar with 13 equally-weighted items
- Nav groups defined in code (trading, physical, risk, ai) but rendered as flat list
- No visual hierarchy - new users don't know where to start
- No breadcrumbs or context preservation when switching views
- No command palette / quick search

### Assessment
The flat tab bar with 13 items is the biggest UX structural problem. In Endur and Allegro, traders see 4-5 primary navigation items with sub-menus. The current design treats the Dashboard and the Demurrage Calculator as equally important, which they are not.

### Recommendation
Group into 4 primary areas with sub-navigation:
1. **Home** - Dashboard, Briefing
2. **Trading** - Contracts, Trades/Blotter, Positions, Hedges, Curves
3. **Physical** - Cargo Board, Cargo Map, Shipping, Nominations
4. **Finance** - Settlement, Invoices

Plus always-available: AI Discovery, Scenarios, Command Palette (Cmd+K)

---

## 5. Component Library Gap

### Current State
The `frontend/src/components/ui/` directory is **empty**. Every component uses raw Tailwind classes directly. No shared Button, Input, Select, Dialog, Table, Badge, or Toast components.

### Impact
- Inconsistent styling across views (different input styles, button variants)
- Duplicated formatting functions across 6+ files (formatCurrency, formatVolume, getStatusBadge)
- No design tokens or theme variables beyond CSS custom properties
- Every new view requires re-implementing basic patterns

### Recommendation
Install shadcn/ui core components: Button, Input, Select, Dialog, Command, Table, Badge, DropdownMenu, Combobox, Toast, Popover, Sheet. These are copy-paste components (not npm deps), so they integrate cleanly.

---

## 6. Scores by Category

| Category | Score | Notes |
|----------|-------|-------|
| Domain Coverage | 8/10 | Excellent breadth across ETRM functions |
| Data Entry | 4/10 | Basic forms, no lookups, no conditional logic |
| Data Display | 5/10 | Clean tables but no grid capabilities |
| Navigation | 4/10 | Flat tabs don't scale, no cross-view links |
| Real-time | 3/10 | WebSocket exists but no streaming display |
| Workflow | 2/10 | No lifecycle transitions, no approvals |
| Visualization | 5/10 | Good charts but limited variety |
| AI Integration | 8/10 | Unique differentiator |
| Component System | 3/10 | No shared library |
| Power User Features | 2/10 | No keyboard shortcuts, no customization |
| **Overall** | **6.5/10** | |

---

## Key Takeaway

The system has the right domain model and an impressive feature breadth for a single-developer project. The core limitation is that it's built as a **read-mostly information display** rather than an **interactive transaction processing system**. The transformation from "impressive demo" to "can capture and manage a real deal" requires: searchable lookups, lifecycle workflows, cross-navigation, and proper data grids.
