# Round 1: EOS System Anatomy

**Orchestrated by:** Tech Lead
**Panel:** UI Analyst, Data Modeller, Operations SME
**Date:** 3 May 2026

---

## What Is EOS?

EOS is a **Windows-style desktop ETRM application** used by **GLNG (Global LNG)** for managing the full LNG trade lifecycle — contracts, trade capture, cargo operations, vessel chartering, pricing, charges, and settlement. It's a mid-2010s enterprise system with high information density, designed for power users with deep LNG domain knowledge.

**Era:** 2010-2015 design language — blue header bars, light grey forms, right-click context menus, alternating row colours in grids, yellow highlighting for key fields, padlock icons for locked fields.

---

## Menu Structure (Full Hierarchy)

```
EOS Main Menu
├── Master Agreements
├── Contracts
├── Contact Counterparties
├── Trade Capture
│   └── Vessel Charter
├── Charge Capture
├── Trades View
├── Cargo Operations
│   ├── Cargo View
│   ├── Cargo Operations View
│   ├── Matching
│   ├── Manage Schedule
│   ├── Bunker Actualisation
│   ├── Vessel Usage
│   └── Cargo Audit Summary
├── Shipments
├── Valuations
├── Statements
├── Portfolio
├── Prices
├── Static Data
│   ├── General
│   │   ├── Manage User Tables
│   │   ├── Manage Regression Reason
│   │   ├── Manage Late Contract Reason
│   │   ├── Manage Not Remit Reports
│   │   ├── Manage Lookups
│   │   └── Manage Attributes
│   ├── Companies
│   │   ├── Manage Companies
│   │   ├── Manage Addresses
│   │   ├── Manage Contacts
│   │   ├── Manage Payment Terms
│   │   └── Manage Bank Accounts
│   ├── Tax
│   │   └── Manage Tax Rates
│   ├── Products
│   │   ├── Manage Products
│   │   ├── Manage Chains
│   │   └── Manage Charge Product
│   ├── Prices
│   │   ├── Manage Curve Definitions
│   │   └── Manage Price Basis
│   ├── Reports
│   │   └── Manage Reports
│   └── Security
│       ├── Manage Users
│       ├── Manage Roles
│       └── Manage Groups
├── Reports
├── Data Import
├── Settings
├── Help
├── Logs
├── Regulations
├── Reminders
│   ├── Reminder Dashboard
│   └── Reminder Rules
└── FAQs / Documentation
```

**Key observation:** This is a BIG menu system — 40+ items across 10+ categories. The Horizon v5 sidebar has ~20 items across 5 groups. EOS has roughly 2x the navigation surface.

---

## UI Layout Patterns

### Pattern 1: Grid + Right-Click
The dominant pattern. Most screens show a data grid with columns, and users right-click for actions (Add, Copy, Edit, Delete). Grids have:
- Alternating row colours (white/light cyan)
- Column picker (drag-drop to show/hide/reorder)
- Column grouping (drag columns to grouping bar)
- Filters (Excel-style or basic text)
- Toolbar: Refresh, Export, View, Audit, Evaluate

### Pattern 2: Multi-Section Modal Dialog
Contract and trade editing opens modal dialogs with multiple sections:
- Core Details (left), Schedule (right)
- Multiple tabs within: Trade Entry, Invoice Schedule, Linked Trades, Supply Plan, Contract Spec, Gas Potential, Hypertables, Attributes
- 40+ fields on a single contract dialog
- Conditional visibility (e.g., Cpty Book only active during book transfers)

### Pattern 3: Multi-Grid Matching Screen
Cargo matching shows 3 grids simultaneously:
- Unmatched Purchases (top-left)
- Unmatched Sales (top-right)
- Matched Cargoes (bottom)
- Parameters section in the middle

### Pattern 4: Tree Navigation
Pricing formula builder uses a collapsible tree:
- Functions, Price Signatures, Common Formulae, Trade Fields, Date Fields, Snippets
- Drag-drop from tree to formula editing area
- Right-click on items for detailed configuration dialogs

### Pattern 5: Event-Based Operations
Cargo Operations uses event tabs per cargo:
- PickUp [Port], Load [Port], Discharge [Port], Drop Off
- Each event has its own fields, fuel consumption, costs
- Journey between events tracked with fuel calculations

---

## Data Model (Key Entities)

### Contract
- Type (SPA only), Name (auto-generated), Status (Draft/Firm/Recap)
- Legal Entity, Counterparty (multi, with % shares), Trader
- LE Book, Cpty Book, Strategy, Credit Security (9 types)
- Delivery: Buy/Sell, Volume, Tolerance (95-105%), Location Restriction
- Pricing: Multiple Price Groups, each with Multiplier, Index, Margin, Rounding
- Location: Default Location, Delivery Regions (CHI, Europe, Far East, India, Japan, JKT, JKTC), Ports

### Trade
- Inherits from Contract, can override pricing
- Status: Draft → FO-Entered → FO-Validated (locks most fields)
- Optional: Option Right (Both/Counterparty/LE), Option Status (4 states)
- Book Transfer: Generates 2 offsetting trades when LE Book ≠ Cpty Book
- Tabs: Trade Entry, Invoice Schedule, Linked Trades, Supply Plan, Contract Spec, Gas Potential, Hypertables, Attributes

### Cargo (Matched Trade Pair)
- Created by matching Buy trade(s) + Sell trade(s) + Vessel
- Events: Pick Up, Load, Discharge, Drop Off
- OCT (On Cargo Time), CCT (Cargo Cumulative Time)
- Fuel consumption per journey segment (Steam, Idle, Pickup modes)
- Forecast vs Actual volumes, densities, CVs

### Vessel Charter
- Trade-like entity with Start/End dates, Vessel, Counterparty
- Charter-specific pricing (breakpoint rates by period)
- Heel Trades (Start Heel, End Heel) for residual cargo
- Delivery/Redelivery events via Start/End Locations
- Monthly invoice schedule with pre-payment

### Charge
- Parent Trade ID (linked to cargo trade)
- 38 charge types across 40+ products
- Volume Types: Flat (fixed $), Volumetric (energy × price), BAV (best available volume)
- Status: FO-Entered → Trade Checked → Cancelled
- Follow Parent flags for invoicing and delivery dates

### Index / Pricing
- 12+ Price Signature types (AbsoluteSpot, MonthlySpot, StandardProduct, etc.)
- Each references Settlement Curve + Forward Curve
- Curves have Market Price Source (ICE ENDEX, ICE, Platts, etc.)
- Price Search Rules: 4 levels of strictness
- 20+ pre-configured indices for SGP operations
- Complex formula-based indices with FX conversion

### Reminders
- Rules: Expression-based date calculators (BD, CD, FOCM, SOM, EOM, etc.)
- Dashboard: Maps rules to contracts/trades, tracks completion
- Roles: Owner role controls who can mark complete
- Calendars: UK, US, Singapore business day calendars

---

## Tabbed Interfaces (Complete Inventory)

| Context | Tabs |
|---------|------|
| **Contract Dialog** | Schedule Details, Location |
| **Trade Edit** | Trade Entry, Invoice Schedule, Linked Trades, Supply Plan, Contract Spec, Gas Potential, Hypertables, Attributes |
| **Cargo Operations** | PickUp [Port], Load [Port], Discharge [Port], Hyperlinks |
| **Cargo Operations Sub** | Journey Fuel Consumption, Forecast Costs, P&L, Exposure |
| **Vessel Charter** | Vessel Charter Trade Entry, Invoice Schedule, Linked Trades, Supply Plan, Contract Spec, Gas Potential, Hyperlinks |
| **Charge** | Charge Entry, Invoice Schedule, Supply Plan, Hyperlinks |
| **Main Screen (bottom)** | Trades, View Cargoes, Charges |
| **Attributes** | Discharge Info (14), Loading Info (17), Dates (12), References (9), Trading Info (15), Pricing |

**Key observation:** Trade Edit alone has **8 tabs**. The system is deeply tabbed — information is layered behind tabs rather than visible at once.

---

## Information Density Assessment

| Screen | Fields/Columns Visible | Density Rating |
|--------|----------------------|----------------|
| Contract Grid | 10+ columns | High |
| Contract Dialog | 40+ fields | Very High |
| Trade Grid | 8+ visible, 30+ available | High |
| Trade Edit | 8 tabs, 20+ fields per tab | Very High |
| Cargo Matching | 3 grids × 10+ columns | Extreme |
| Cargo Operations | 20+ fields + fuel table | Very High |
| Pricing Formula Builder | 4 zones + tree + formula | Very High |
| Manage Schedule | 10+ columns per event | High |

**Overall:** EOS is **extremely information-dense**. Every screen packs maximum data. There is no whitespace, no decorative elements, no breathing room. Pure function.

---

## Look & Feel Summary

- **Colour palette:** Blue headers, light grey forms, yellow highlights, white/cyan alternating rows
- **Typography:** Sans-serif system fonts, monospace in grids and formulas
- **Controls:** Standard Windows — dropdowns, checkboxes, text inputs, date pickers
- **Interactions:** Right-click context menus everywhere, drag-drop for columns and attributes
- **Icons:** Minimal — padlock (locked), green dot (active), red X (error)
- **Era:** 2010-2015 enterprise desktop
- **Feel:** "This was built by engineers for engineers" — no design system, no visual hierarchy, just raw data access
