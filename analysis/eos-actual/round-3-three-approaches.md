# Round 3: Three Approaches to Applying EOS Data to Horizon

**Orchestrated by:** Tech Lead
**Panel:** Full team — UX, Architecture, Domain, Visual
**Date:** 3 May 2026

---

## The Question

EOS is a real, production LNG ETRM with deep domain functionality but dated UI. Horizon is a modern UI template with strong design but simplified data. How do we bridge them?

Three approaches, each with different trade-offs:

---

## Approach A: "EOS Data, Horizon Shell"

### Philosophy
Keep Horizon's v5 visual design and layout system exactly as-is. Replace the simplified mock data with EOS-accurate data models, field names, and terminology. The UI stays modern; the data becomes real.

### What Changes
- **Contract form**: Add EOS fields — MSA, Strategy (None/Inventory/Exclude/Temporary), Credit Security (9 types), Tolerance (Min/Max with %/range), Location Restriction (Open/Validated/Constrained), multi-counterparty with % share
- **Trade grid columns**: Match EOS columns — Trade Group ID, Matched flag, Status (Draft/FO-Entered/FO-Validated/Trade Checked), Start Date, Cargo ref, Index formula display
- **Pricing**: Show actual index names (SGP_Platts JKM Month Ahead, SGP_Ave_ICE TTF FMA × 0.293071 × Ave_EURUSD), maturity rules
- **Charge management**: Add charges page with EOS taxonomy (38 types, 3 volume types)
- **Operations attributes**: Show the 5 attribute groups (Discharge Info 14, Loading Info 17, Dates 12, References 9, Trading Info 15) in trade detail tabs
- **Reminders**: Add reminder dashboard with EOS-style date expressions

### What Doesn't Change
- Visual design (dark theme, gradient, Inter + JetBrains Mono)
- Layout system (context strip, sidebar, status bar)
- Component library (cards, badges, tables, KPIs)
- Navigation pattern (sidebar + tabs)

### Effort: Medium
~20 pages to update data/fields, no structural changes.

### Risk: Low
Pure data replacement. If it looks wrong, easy to revert.

### Best For
Proving that Horizon can handle real EOS complexity without breaking the design.

---

## Approach B: "EOS Workflows, Horizon UX"

### Philosophy
Go deeper than data — implement EOS's actual workflows using Horizon's modern UX patterns. Re-imagine how EOS workflows would work in a modern interface, keeping the domain logic but improving the interaction design.

### What Changes

**1. Cargo Matching (new page)**
EOS: 3-grid matching window with checkboxes and parameters.
Horizon: Modern drag-and-drop matching board. Unmatched buys on left, unmatched sells on right, drop zone in centre. Vessel selector and parameters inline. Matched cargoes appear below with live position impact.

**2. Vessel Charter Management (new page)**
EOS: Complex multi-tab dialog with heel trades and fuel consumption tables.
Horizon: Tabbed vessel detail page (like trade detail) — Overview, Schedule, Fuel & Consumption, Invoicing. Heel trade creation via inline form. Journey fuel as a compact timeline visualisation.

**3. Charge Capture (new page or trade detail tab)**
EOS: Separate charge capture screen, 38 types across 40+ products.
Horizon: "Costs" tab on trade detail page. Grouped charge categories (Trading, Cargo, Shipping, Finance, Tax). Add charge via inline row with type dropdown + amount + volume type. Follow Parent toggles visible.

**4. Pricing Formula Builder (new page)**
EOS: 4-zone desktop layout with tree + formula text area + debug section.
Horizon: Modern formula editor. Signature picker (cards, not tree). Visual formula builder with blocks. Inline curve selector. Test panel with date inputs and evaluate button.

**5. Reminder System (enhancement to existing)**
EOS: Static Data config + Dashboard.
Horizon: Integrate reminders into the trade detail audit trail. Show upcoming reminders as amber items in the trail. Reminder rules as a settings-area configuration.

**6. Contract Enhancement**
EOS: 40+ field dialog with conditional sections.
Horizon: Multi-step wizard (already exists in v5) enhanced with EOS sections — Parties (multi-counterparty %), Delivery (tolerance, location restriction), Pricing (price groups with signature selection), Options.

### What Doesn't Change
- Visual design and layout system
- Existing pages (dashboard, blotter, positions, quick-entry)
- Component library

### What's New
- 2-3 new pages (Cargo Matching, Vessel Charter, Pricing Editor)
- Enhanced contract wizard
- Costs tab on trade detail
- Reminder integration

### Effort: High
New pages + workflow reimagination. Significant HTML/CSS/JS work.

### Risk: Medium
Reimagining workflows might miss edge cases that EOS handles. Need domain review.

### Best For
Showing stakeholders "this is what EOS could look like if we rebuilt it today."

---

## Approach C: "EOS Menu, Horizon Design System"

### Philosophy
Map EOS's full 40+ item menu structure into Horizon's sidebar, creating placeholder pages for every EOS function. Each page shows the correct data model and field layout but doesn't implement full workflows. The goal is a complete navigation map that mirrors EOS's scope.

### What Changes

**Sidebar expands to match EOS:**
```
TRADING (existing)
├── Dashboard, Quick Entry, Trade Lifecycle, Trade Form
├── Blotter, Positions, Curves, Hedge Book

CONTRACTS (new group)
├── Master Agreements
├── Contracts (list + wizard)
├── Counterparties

PHYSICAL (existing, expanded)
├── Cargo Board, Nominations
├── Cargo Matching (new)
├── Manage Schedule (new)
├── Vessel Charter (new)
├── Vessel Usage (new)
├── Bunker Actualisation (new)

SETTLEMENT (existing, expanded)
├── Invoice Queue, Reconciliation
├── Charge Management (new)
├── Statements (new)

PRICING (new group)
├── Index Builder (new)
├── Curve Management (new)
├── Price Basis (new)

RISK & PORTFOLIO (new group)
├── Valuations (new)
├── Portfolio View (new)
├── Exposure (new)

ADMIN (existing, expanded)
├── Contracts, Audit Log, Settings
├── Manage Attributes (new)
├── Manage Products (new)
├── Reminders (new)
├── Data Import (new)
├── Reports (new)

SUPPORT (existing)
├── System Status, Audit Search, Data Quality, SQL Checks
```

**Each new page gets:**
- Correct page title and breadcrumb
- A data grid or form with EOS-accurate columns/fields
- Realistic mock data
- Proper status badges and entity links
- Appropriate density for the data type

### What Doesn't Change
- Shell (header, context strip, sidebar mechanism, status bar)
- Design system (tokens, components, utilities)
- Existing page content

### What's New
- ~15 new placeholder pages
- Expanded sidebar menu (6→8 groups, 20→40+ items)

### Effort: High (volume) but Medium (per page)
Each new page is a straightforward HTML template with mock data. No complex JS workflows.

### Risk: Low-Medium
Volume of pages is large, but each is a self-contained template. Menu might feel overwhelming.

### Best For
Demonstrating that Horizon can scale to EOS's full functional scope without losing design quality.

---

## Recommendation Matrix

| Criteria | Approach A | Approach B | Approach C |
|----------|-----------|-----------|-----------|
| Effort | Medium | High | High (volume) |
| Risk | Low | Medium | Low-Medium |
| Impact | Moderate | High | High |
| Demonstrates real data | Yes | Yes | Yes |
| Demonstrates workflow | No | Yes | No |
| Demonstrates scale | No | No | Yes |
| Best audience | Tech reviewers | Business stakeholders | Management / procurement |

### If you could only do one: **Approach B**
It's the hardest but proves the most — that Horizon can handle real ETRM workflows, not just look pretty.

### If you want quick wins first: **Approach A → then B**
Start by making existing pages use real EOS data (quick), then add new workflow pages (deeper).

### If you want to impress procurement: **Approach C → then A**
Show the full menu first (looks comprehensive), then fill in real data (proves depth).

---

## Key EOS Data to Preserve in Any Approach

1. **Contract naming convention**: Company Short Code - Year - B/S - Sequence (e.g., ALPH0-23801)
2. **Status workflow**: Draft → FO-Entered → FO-Validated → Trade Checked
3. **Charge taxonomy**: 38 types across 7 categories
4. **Index naming**: SGP prefix, formula descriptions (e.g., SGP_Ave_ICE TTF FMA × 0.293071 × Ave_EURUSD)
5. **Delivery regions**: CHI, Europe, Far East, India, India/Pakistan, Japan, Jap/Kor, JKT, JKTC
6. **Port list**: Bintulu, Bal Haf Yemen, Barcelona, Barrow Island, Bear Head, etc.
7. **Volume tolerance**: Min 95% / Max 105% default
8. **Price signatures**: AbsoluteSpot, MonthlySpot, StandardProduct, etc.
9. **Reminder expressions**: BD(-1,"US"), CD(-12), BD(FOCM(),-2,"UK")
10. **Attribute groups**: Discharge Info (14), Loading Info (17), Dates (12), References (9), Trading Info (15)
