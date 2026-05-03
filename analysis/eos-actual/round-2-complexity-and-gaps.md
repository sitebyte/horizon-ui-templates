# Round 2: Complexity Analysis & Gap Assessment

**Orchestrated by:** Tech Lead
**Panel:** UX Analyst, Domain Expert, Front-End Architect
**Date:** 3 May 2026

---

## Workflow Complexity Map

### Tier 1: Simple (1-3 steps)
- View trade grid, filter, sort
- View cargo operations
- Mark reminder as complete
- Export grid to CSV

### Tier 2: Moderate (4-7 steps)
- Create contract → fill sections → save
- Edit trade → modify fields → save
- Create charge → link to trade → save
- Create reminder → map to trade → evaluate

### Tier 3: Complex (8+ steps, conditional logic)
- **Cargo Matching**: Select purchases → select sales → choose vessel → set parameters → match → verify → schedule events
- **Pricing Configuration**: Create index → select signatures → configure curves → set averaging → test formula → validate
- **Vessel Charter**: Create charter → set pricing → create heel trades → schedule pickup → manage fuel consumption → invoice
- **Attribute Setup**: Create attribute → add to product (FOB) → add to product (DES) → populate on trade → configure column display → drag-drop ordering
- **Multi-Counterparty Contract**: Create contract → add multiple counterparties with % → auto-generate pro-rata trades → manage each trade independently

---

## What EOS Does That Horizon v5 Doesn't

| EOS Feature | Horizon v5 Status | Complexity |
|-------------|-------------------|-----------|
| Multi-counterparty contracts with % share | Not modelled | High |
| Book transfer (offsetting trades) | Not modelled | Medium |
| Cargo matching (buy + sell + vessel) | Basic cargo board, no matching | Very High |
| Vessel charter management | Not present | High |
| Heel trade calculation | Not present | High |
| Charge management (38 types) | Not present | Medium |
| Formula-based pricing (12 signature types) | Not present | Very High |
| Curve management with search rules | Not present | High |
| Reminder rules with date expressions | Not present | Medium |
| Operation attributes (custom fields) | Not present | Medium |
| OCT/CCT calculation | Not present | High |
| Fuel consumption forecasting | Not present | High |
| Invoice schedule with payment locking | Basic invoice grid | Medium |
| Trade status workflow (Draft→Entered→Validated) | Badges only, no workflow | Medium |
| Option trades (expiry, right, status) | Not present | Medium |
| Location restriction (Open/Validated/Constrained) | Not present | Medium |

### What Horizon v5 Does Better Than EOS

| Feature | EOS | Horizon v5 |
|---------|-----|-----------|
| Visual design | 2010s Windows desktop | Modern dark theme, indigo gradient |
| Role-adaptive dashboard | Not present | 3-role dashboard (Trader/Ops/Manager) |
| Position heat map | Not present | Benchmark × month matrix with WACOG |
| Quick trade entry | Multi-dialog workflow | 8-keystroke strip |
| Valuation history over time | Not visible in docs | EOD + intraday tables |
| Trade detail with audit trail | Audit button → separate view | Persistent sidebar audit trail |
| Context strip | Not present | Portfolio state on every page |
| Keyboard navigation | Right-click dependent | Cmd+K, B/S hotkeys, Tab flow |
| Cross-entity links | Via right-click → Edit | Clickable entity IDs throughout |
| System status dashboard | Not present | EOD monitoring, integrity checks |
| Data quality checks | Not present | Curve, trade, position validation |
| SQL check runner | Not present | 12 predefined validations |

---

## EOS's Hidden Strengths (Don't Lose These)

1. **Cargo = Matched Trade Pair** — This is the fundamental data model. A cargo doesn't exist until you match a buy and a sell on a vessel. Horizon shows cargoes as standalone entities, which is a simplification.

2. **Event-Based Operations** — Pick Up → Load → Discharge → Drop Off. Each event has its own port, dates, volumes, CV, density. This granularity matters for fuel calculations and cost allocation.

3. **Charge Taxonomy** — 38 charge types across categories (Paper Fees, Cargo Charges, Chartering, Service/Agent, Contract, Insurance, Finance, Tax, Bunkers). Horizon has no charge management.

4. **Formula Pricing Engine** — The ability to build complex pricing formulas from signatures, with curve references, FX averaging, settlement lateness, and partial month calculations. This is the heart of LNG pricing.

5. **Reminder Rules** — Expression-based date calculations with business day awareness across multiple calendars (UK, US, Singapore). Tied to contracts and trades.

6. **Volume Types** — Flat (fixed $), Volumetric (energy × price), BAV (Best Available Volume from parent trade). Each changes how charges are calculated.

7. **Location Restriction** — Three levels: Open (anywhere), Validated (soft warning), Constrained (hard block). Affects where cargoes can be delivered.

8. **Attribute System** — Custom fields per product type, with picklist support, multiple data types, and drag-drop ordering. Extensibility without code changes.

---

## Complexity That Could Be Simplified

1. **Attribute setup is 5+ screens** — Should be 1 screen with a table editor
2. **Cargo matching is a separate window** — Could be inline in the cargo board
3. **Pricing formula builder is expert-only** — Could have wizard mode for common patterns
4. **Right-click for everything** — Modern UIs use inline actions, buttons, hover menus
5. **No dashboard or KPIs** — Users must navigate to specific screens to see status
6. **Filter inconsistency** — Some screens have Excel-style filters, others basic text
7. **Manual payment date management** — Padlock + checkbox pattern is unintuitive
8. **No search** — No Cmd+K or global entity search — must navigate menus to find things
