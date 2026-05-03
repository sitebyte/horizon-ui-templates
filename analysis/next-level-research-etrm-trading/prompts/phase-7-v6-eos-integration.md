# Phase 7: v6 — EOS Data & Workflow Integration

## Context
EOS is the production LNG ETRM being modernised. After analysing 21 EOS user docs (Round 1-3 in analysis/eos-actual/), v6 implements the combined approach: expand the menu to match EOS scope, create new workflow pages, and use EOS-accurate data models.

## What Changed in v6

### Expanded Menu (7 groups → EOS-aligned)
```
TRADING — Dashboard, Quick Entry, Trade Detail, Trade Form, Blotter, Positions, Hedge Book
CONTRACTS — Contracts, Counterparties, Master Agreements (NEW)
PHYSICAL — Cargo Board, Cargo Matching (NEW), Nominations, Vessel Charters (NEW), Manage Schedule (NEW)
PRICING — Curves, Index Builder (NEW), Curve Management (NEW)
SETTLEMENT — Invoice Queue, Reconciliation, Charge Management (NEW), Valuations (NEW)
ADMIN — Audit Log, Reminders (NEW), Reference Data, Settings
SUPPORT — System Status, Audit Search, Data Quality, SQL Checks
```

### New Pages (10)
1. **cargo-matching.html** — 3-panel matching: unmatched buys + sells → select + match → matched cargoes
2. **vessel-charters.html** — Charter list with detail panel (essentials, delivery/redelivery, heel, invoicing)
3. **charges.html** — 38-type charge taxonomy, volume types (Flat/Volumetric/BAV), linked to parent trades
4. **valuations.html** — Portfolio MTM, P&L attribution, valuation by benchmark + counterparty
5. **reminders.html** — Expression-based deadline tracking, role-based completion, countdown badges
6. **index-builder.html** — Price signature editor (12 types), formula preview, test/evaluate panel
7. **curve-management.html** — Curve grid with type/source/search rules
8. **counterparties.html** — Credit exposure tracking, headroom indicators
9. **master-agreements.html** — SPA/MSA registry linked to contracts
10. **manage-schedule.html** — Cargo event timeline (PickUp/Load/Discharge with OCT/CCT)

### Session Context Document
Created `CLAUDE-SESSION-CONTEXT.md` at project root — comprehensive handover document for feeding into any Claude session. Contains: version history, architecture, shell system, all 30+ pages, EOS data model, design principles, technical notes.

## Prompt Process
- 3 parallel agents created 10 new pages (2+3+5 per agent)
- Each page uses EOS-accurate terminology: Trade Status (Draft/FO-Entered/FO-Validated), Charge Types (38 across 7 categories), Index names (SGP_Platts JKM Month Ahead), Delivery Regions (CHI, Europe, Far East, etc.)
- Menu restructured from 5 groups to 7, adding CONTRACTS and PRICING as standalone groups
