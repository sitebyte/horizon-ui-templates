# Vision: The Accuracy-First LNG Operations System

**Perspective:** Head of LNG Operations. 5 direct reports, 200 invoices/month, 40+ nominations, month-end close. Every error my team makes costs $50K minimum -- a wrong quantity on a $60M cargo invoice, a missed nomination deadline that triggers dead-freight, a quality adjustment using the wrong GHV spec. The system I need does not just display data. It actively prevents the errors we actually make.

**Date:** 2026-04-11

---

## Part 1: The Errors We Actually Make (and How the System Kills Each One)

### Error 1: Wrong Invoice Amount

**How it happens today:** Somebody types 3,247,500 MMBtu instead of 3,247,500.00 USD. Or they use the provisional B/L quantity instead of the final outturn quantity. Or they apply last month's price instead of this month's. With 200 invoices/month, fat-finger errors are inevitable if humans are doing arithmetic.

**How the system prevents it:**

The system never asks a human to type an invoice amount. Ever.

The invoice is *computed*, not entered. The UI shows the calculation chain as a read-only formula:

```
+---------------------------------------------------------------+
|  Invoice INV-2026-0089 -- Cargo CARGO-2026-0045                |
|                                                                |
|  Quantity source: Outturn Report (OTR-2026-0045)               |
|  Quantity: 3,247,500.00 MMBtu  [View source document]          |
|                                                                |
|  Price source: Trade SP-2026-0142 pricing terms                |
|  Formula: JKM + $0.35/MMBtu                                   |
|  JKM observed: $12.45/MMBtu (2026-04-10, Platts)              |
|  Resolved price: $12.80/MMBtu                                  |
|                                                                |
|  Subtotal: 3,247,500.00 x $12.80 = $41,568,000.00            |
|  Quality adjustment: -$127,340.00  [See calculation]           |
|  Demurrage: +$42,000.00  [See calculation]                     |
|  ─────────────────────────────────────────────                  |
|  NET AMOUNT: $41,482,660.00                                    |
|                                                                |
|  [Every number above is a link to its source document]         |
+---------------------------------------------------------------+
```

Every number in the chain is a hyperlink to the source: the outturn report, the trade pricing terms, the market data observation, the quality calculation worksheet, the demurrage laytime statement. The human's job is to *verify* the chain, not to *perform* the calculation.

The only human inputs that affect invoice amounts are:
1. Approving or disputing the outturn quantity (which came from a surveyor document)
2. Approving or disputing the quality adjustment (which the system calculated from measured vs. contract GHV)
3. Approving or disputing the demurrage calculation (which the system calculated from vessel events vs. allowed laytime)

If you want to override any calculated value, you can -- but the system requires a typed reason, logs the override as a deviation, and flags it for second-approver review. The override shows inline as a red strikethrough on the original value with the manual override below it:

```
  Quantity: ~~3,247,500.00~~ 3,245,000.00 MMBtu
  Override reason: "Counterparty dispute on tank measurement,
                    agreed revised figure per email 2026-04-09"
  Override by: Sarah Chen, 2026-04-10 14:32
  Status: PENDING SECOND APPROVAL
```

**What the codebase already has that supports this:** The `settlement/service.py` already computes invoice amounts from B/L quantity and trade pricing terms via `build_provisional_invoice()` and `finalize_invoice_from_outturn()`. The `quantity_gates.py` model tracks the measurement chain from nominated through B/L through outturn. The architecture is correct -- the UI just needs to expose this calculation chain visually rather than letting users type amounts.

---

### Error 2: Missed Nomination Deadline

**How it happens today:** A nomination deadline falls on a Monday. Somebody was supposed to submit it Friday. They forgot because it was buried in a spreadsheet, or it was their first week, or they were covering for a colleague on leave. We get hit with dead-freight or lose the loading slot. $200K minimum.

**How the system prevents it:**

Three layers of defence, each one independently sufficient:

**Layer 1: The Countdown Wall**

The main nominations view does not show a table of nominations. It shows a *wall of countdown cards*, sorted by urgency, with the most urgent physically largest:

```
+==================================================================+
||                                                                  ||
||   NOM-2026-JERA-042           DEADLINE IN 1 DAY                 ||
||   JERA / Ras Laffan -> Futtsu                                   ||
||   150,000 MMBtu / Laycan: Apr 18-22                             ||
||   Status: DRAFT -- NOT YET SUBMITTED                            ||
||                                                                  ||
||   [Submit Now]  [Assign to Team Member]  [View Details]         ||
||                                                                  ||
+==================================================================+

+---------------------------------------+  +---------------------------+
|  NOM-2026-SHELL-015                   |  |  NOM-2026-KOGAS-008      |
|  DEADLINE IN 4 DAYS                   |  |  DEADLINE IN 7 DAYS      |
|  Shell / Sabine Pass -> Gate          |  |  KOGAS / GLNG -> Tongyeong|
|  Status: SUBMITTED, awaiting confirm  |  |  Status: DRAFT           |
|  [View Details]                       |  |  [View Details]          |
+---------------------------------------+  +---------------------------+
```

Cards in the 0-2 day range are full-width, red-bordered, with action buttons directly on the card. Cards in the 3-5 day range are half-width, amber-bordered. Cards 6+ days out are quarter-width, blue-bordered. You cannot miss the urgent ones because they are physically dominating the screen.

**Layer 2: Proactive Escalation Timeline**

For every nomination, the system runs a backwards schedule from the deadline and creates automatic checkpoints. These are not passive reminders -- they are *escalating status changes*:

```
  Deadline: April 15
  ──────────────────────────────────────
  Apr  8 (T-7): Auto-assign to default handler, status -> PREPARATION
  Apr 10 (T-5): If still PREPARATION, alert assigned person + manager
  Apr 12 (T-3): If still not SUBMITTED, alert Head of Ops + flash on dashboard
  Apr 14 (T-1): If still not SUBMITTED, BLOCK all other nominations
                 from being submitted until this one is addressed
  Apr 15 (T-0): Auto-set status to LAPSED, generate incident report
```

The T-1 blocking rule is the nuclear option and it works: you cannot submit any other nomination until you explicitly acknowledge the overdue one (submit it, cancel it, or document why it was missed). This mirrors how aviation checklists work -- you cannot proceed until every item is addressed.

**Layer 3: The Business Calendar Fence**

The system knows the business calendar (the codebase already has `business_calendar.py` with US, UK, Japan, Singapore, and GLOBAL_LNG calendars). When a user creates a nomination with a deadline of Monday April 15 and April 13-14 is a weekend:

```
  +------------------------------------------------------------+
  |  WARNING: Deadline falls on Monday April 15.               |
  |  The last business day to submit is Friday April 11.       |
  |                                                            |
  |  Your working deadline is April 11, not April 15.          |
  |  All countdown timers and escalations will use April 11.   |
  |                                                            |
  |  Also note: April 11 is a Japan public holiday.            |
  |  If counterparty is Japanese, consider April 10.           |
  +------------------------------------------------------------+
```

The system adjusts all countdown displays and escalation rules to the *effective* working deadline, not the contractual deadline. This is the kind of thing that currently lives in an ops manager's head. It should live in the system.

**What the codebase already has:** `CargoNomination` has `nomination_deadline`, `vessel_nomination_deadline`, `amendment_deadline`, `is_overdue`, and `days_until_laycan`. The `DeadlineAlert` model has `days_remaining`. The `NominationsView.tsx` has urgency colour coding. The building blocks exist -- they need to become a wall, not a table row.

---

### Error 3: Quantity Mismatch Between Trade, Cargo, Nomination, and Invoice

**How it happens today:** A trade says 3,250,000 MMBtu +/- 5%. The nomination says 3,100,000 MMBtu (within tolerance). The B/L says 3,087,500 MMBtu (within tolerance of the nomination but outside tolerance of the trade). The outturn says 3,045,000 MMBtu (after BOG loss). The invoice uses 3,087,500 MMBtu (the B/L number) for a provisional invoice, then 3,045,000 MMBtu (the outturn) for the final. But the quality adjustment calculation accidentally uses the B/L quantity instead of the outturn quantity. Nobody catches it because the numbers are all "roughly 3 million" and the 1.4% difference on a $40M invoice is $560K.

**How the system prevents it:**

**The Quantity Waterfall**

Every cargo has a permanently visible quantity waterfall that traces the number through every gate. This is not hidden in a detail panel -- it is the primary visual on the cargo detail page:

```
  CARGO-2026-0045 Quantity Waterfall
  ═══════════════════════════════════════════════════════════

  Contract ACQ allocation     3,250,000 MMBtu  [+/- 5%]
       |
       |  -150,000 (-4.6%)  Within tolerance
       v
  Nominated                   3,100,000 MMBtu  [+/- 5%]
       |
       |  -12,500 (-0.4%)   Within tolerance
       v
  Bill of Lading              3,087,500 MMBtu  Source: BL-2026-0045
       |
       |  -42,500 (-1.4%)   BOG loss (18 days x 0.08%/day)
       v
  Outturn                     3,045,000 MMBtu  Source: OTR-2026-0045
       |
       |  0 (0.0%)           Matches
       v
  Provisional Invoice         3,087,500 MMBtu  INV-2026-0089 (uses B/L)
       |
       |  -42,500 (-1.4%)   Updated to outturn
       v
  Final Invoice               3,045,000 MMBtu  INV-2026-0089-F

  ─── VARIANCE FLAGS ─────────────────────────────────────
  [OK] Nominated vs ACQ: -4.6% (within +/-5% tolerance)
  [OK] B/L vs Nominated: -0.4% (within +/-5% tolerance)
  [OK] Outturn vs B/L: -1.4% (within expected BOG range)
  [OK] Final Invoice uses Outturn quantity: MATCH
```

If the final invoice accidentally used the B/L quantity instead of the outturn quantity, the waterfall would show:

```
  Final Invoice               3,087,500 MMBtu  INV-2026-0089-F
  ─── VARIANCE FLAGS ─────────────────────────────────────
  [!!] Final Invoice quantity != Outturn quantity
       Invoice: 3,087,500   Outturn: 3,045,000
       Delta: 42,500 MMBtu ($544,000 at $12.80/MMBtu)
       THIS INVOICE CANNOT BE APPROVED UNTIL RESOLVED
```

The system performs this cross-check automatically on every invoice status transition. You literally cannot move an invoice from DRAFT to PROVISIONAL or from PROVISIONAL to FINAL without the quantity waterfall check passing. The state machine blocks the transition and shows the specific discrepancy.

**What the codebase already has:** `QuantityGate` in `quantity_gates.py` models exactly this chain -- ACQ_PLANNED through NOMINATED, BILL_OF_LADING, IN_TRANSIT, OUTTURN, INVOICED, SETTLED. Each gate has `variance_from_prior_mmbtu` and `variance_from_prior_percent`. The `Cargo` model has denormalized `nominated_quantity_mmbtu`, `bl_quantity_mmbtu`, `outturn_quantity_mmbtu`, `invoiced_quantity_mmbtu`. This is built into the domain model -- it just needs visual expression and enforcement.

---

### Error 4: Wrong Quality Adjustment (Heating Value Calculation)

**How it happens today:** The contract specifies GHV of 1,050 BTU/scf. The outturn report measures 1,042 BTU/scf. Somebody calculates the adjustment manually: (1,042 - 1,050) / 1,050 = -0.762%. Applied to 3,045,000 MMBtu at $12.80/MMBtu, that is -$296,930.40. But they accidentally use the contract GHV from a different cargo (1,055 BTU/scf), getting -1.232% and -$480,450.72. The difference is $183K and nobody catches it until the counterparty disputes.

**How the system prevents it:**

The quality adjustment is never manually calculated. The system computes it from two locked inputs:

1. **Contract GHV spec** -- pulled automatically from the contract/trade record, displayed as read-only with a link to the source. Cannot be typed.
2. **Actual GHV** -- pulled from the outturn report or custody transfer survey, displayed as read-only with a link to the surveyor's document. Cannot be typed.

The calculation is shown step by step with every intermediate value visible:

```
+----------------------------------------------------------------+
|  QUALITY ADJUSTMENT -- CARGO-2026-0045                         |
|                                                                |
|  Contract GHV:  1,050.00 BTU/scf                               |
|    Source: Trade SP-2026-0142, Clause 7.3                       |
|    [View contract clause]                                       |
|                                                                |
|  Measured GHV:  1,042.00 BTU/scf                               |
|    Source: Outturn Report OTR-2026-0045                         |
|    Surveyor: SGS, Certificate #2026-SGS-4521                   |
|    [View certificate]                                           |
|                                                                |
|  ── CALCULATION ──                                              |
|  Deviation: 1,042.00 - 1,050.00 = -8.00 BTU/scf               |
|  Deviation %: -8.00 / 1,050.00 = -0.7619%                     |
|  Volume: 3,045,000.00 MMBtu (from outturn, not B/L)           |
|  Price: $12.80/MMBtu (from trade pricing resolution)           |
|  Adjustment: -0.7619% x 3,045,000.00 x $12.80                 |
|            = -$296,930.40                                       |
|                                                                |
|  Direction: CREDIT TO BUYER (delivered energy below spec)      |
|                                                                |
|  ── CONTRACT TOLERANCE CHECK ──                                 |
|  Contractual dead-band: +/- 0.5%                               |
|  Actual deviation: -0.762%                                      |
|  Result: OUTSIDE dead-band, adjustment applies                  |
|                                                                |
|  [Approve Adjustment]  [Dispute -- Enter Reason]               |
+----------------------------------------------------------------+
```

Key defences:
- The contract GHV is pulled from the trade record, not typed. If someone tries to use the wrong contract, they would have to deliberately change the cargo-to-trade linkage.
- The measured GHV is pulled from the outturn report, not typed. The outturn report is a separate locked document.
- The volume used is the outturn quantity, and the system explicitly states "from outturn, not B/L" to prevent the error described above.
- The dead-band check is automatic. Some contracts have a +/- 0.5% dead-band where no adjustment applies. The system checks this and either applies or suppresses the adjustment based on the contract terms.
- Every intermediate value is shown so a reviewer can follow the arithmetic without a calculator.

**What the codebase already has:** `settlement/service.py` has `calculate_quality_adjustment()` that does exactly this math: `hhv_ratio = (actual_hhv - contract_hhv) / contract_hhv; return hhv_ratio * volume_mmbtu * price_usd_mmbtu`. The `QualityAdjustment` model has all the right fields. The calculation engine exists -- the UI needs to make every step of it visible and every input traceable.

---

## Part 2: Four-Eyes Principle -- The Approval Workflow

### The Core Rule

Nothing with a financial impact leaves the system with only one person's approval. The specific workflow depends on the dollar threshold and entity type:

```
  Threshold Matrix:
  ─────────────────────────────────────────────────
  Invoice < $5M        Single approval (any authorized user)
  Invoice $5M-$50M     Dual approval (preparer + approver, different users)
  Invoice > $50M       Dual approval + Head of Ops sign-off
  Quality adjustment   Always dual approval (any amount)
  Demurrage claim      Always dual approval (any amount)
  Nomination submit    Single approval (but escalation on deadline proximity)
  Trade booking        Dual approval (trader + ops)
  Contract amendment   Triple approval (preparer + legal + management)
```

### What the Approval Screen Looks Like

When an approver opens an item in their queue, they do not just see a button. They see a *decision context panel*:

```
+================================================================+
|  APPROVAL REQUEST -- Invoice INV-2026-0089                      |
|                                                                 |
|  Prepared by: Sarah Chen, 2026-04-09 10:15                     |
|  Requested from: You (James Park)                               |
|  Required by: 2026-04-12 (3 days)                               |
|                                                                 |
|  ── WHAT YOU ARE APPROVING ──                                   |
|  Final invoice for Cargo CARGO-2026-0045                        |
|  Counterparty: JERA Co.                                         |
|  Net amount: $41,482,660.00                                     |
|                                                                 |
|  ── SYSTEM CHECKS (all passed) ──                               |
|  [PASS] Quantity waterfall: all gates reconciled                |
|  [PASS] Pricing: resolved price matches trade terms             |
|  [PASS] Quality adjustment: calculation verified                |
|  [PASS] Demurrage: within expected range                        |
|  [PASS] Credit check: JERA within credit limit                  |
|  [PASS] No manual overrides on this invoice                     |
|                                                                 |
|  ── CHANGES SINCE PROVISIONAL ──                                |
|  Quantity: 3,087,500 -> 3,045,000 MMBtu (-1.4% BOG loss)      |
|  Amount: $39,520,000 -> $41,482,660 (+$1,962,660)              |
|  Reason: Price updated to April settlement, final outturn qty   |
|                                                                 |
|  ── AUDIT CONTEXT ──                                            |
|  This invoice is part of Cargo CARGO-2026-0045                  |
|  Related invoices: Quality Adj (-$296,930), Demurrage (+$42,000)|
|  Trade: SP-2026-0142 (JERA, FOB, JKM+$0.35)                   |
|  Vessel: LNG Sakura, Ras Laffan -> Futtsu, 18 days             |
|                                                                 |
|  [Approve]    [Reject -- Reason Required]    [Defer to Manager] |
|                                                                 |
|  Approve requires: typed confirmation reason                     |
|  Example: "Verified outturn qty against SGS report, price       |
|  confirmed against April JKM settlement"                        |
+================================================================+
```

The key design choice: the approval screen front-loads the *system checks* so the approver knows what the machine has already verified. The approver's job is to exercise judgment on the things the machine cannot check: does this counterparty relationship context make sense? Is this cargo part of a larger deal structure? Are there any commercial sensitivities?

After approval, the audit trail records:
```
  {
    action: "APPROVAL",
    entity: "INV-2026-0089",
    approved_by: "james.park",
    approval_level: "second_approver",
    first_approved_by: "sarah.chen",
    first_approved_at: "2026-04-09T10:15:00Z",
    reason: "Verified outturn qty against SGS report...",
    system_checks_passed: ["quantity_waterfall", "pricing", "quality_adj",
                           "demurrage", "credit_check", "no_overrides"],
    timestamp: "2026-04-10T14:32:00Z"
  }
```

---

## Part 3: Reconciliation -- Provisional vs. Final Matching

### The Reconciliation Queue

This is not a single-invoice view. It is a queue showing every cargo in the provisional-to-final pipeline:

```
+--------------------------------------------------------------------+
|  RECONCILIATION QUEUE -- April 2026                                 |
|  12 cargoes pending reconciliation | 3 auto-approvable | 2 flagged |
+--------------------------------------------------------------------+

  Filter: [All] [Within Tolerance] [Outside Tolerance] [Flagged]

  Sorted by: Absolute variance (largest first)

  ┌──────────────┬────────────┬────────────┬──────────┬─────────────┐
  │ Cargo        │ Prov. Amt  │ Final Amt  │ Delta    │ Status      │
  ├──────────────┼────────────┼────────────┼──────────┼─────────────┤
  │ CARGO-0045   │ $39.52M    │ $41.48M    │ +$1.96M  │ !! REVIEW   │
  │ CARGO-0051   │ $28.17M    │ $28.94M    │ +$770K   │ !! REVIEW   │
  │ CARGO-0048   │ $62.30M    │ $61.89M    │ -$410K   │ ! TOLERANCE │
  │ CARGO-0039   │ $45.60M    │ $45.42M    │ -$180K   │ AUTO-OK     │
  │ CARGO-0042   │ $31.20M    │ $31.15M    │ -$50K    │ AUTO-OK     │
  │ CARGO-0044   │ $55.80M    │ $55.77M    │ -$30K    │ AUTO-OK     │
  └──────────────┴────────────┴────────────┴──────────┴─────────────┘

  [Batch Approve 3 Auto-OK Items]   [Export Queue as PDF]
```

Rules:
- **AUTO-OK**: delta is within the configured tolerance (e.g., < 0.1% and < $100K). These can be batch-approved with a single click, but the system still logs each one individually in the audit trail.
- **TOLERANCE**: delta is between the auto-approve threshold and the review threshold. Needs single approval with reason.
- **REVIEW**: delta exceeds the review threshold (e.g., > 0.5% or > $500K). Requires dual approval and investigation.
- **FLAGGED**: system detected a specific anomaly (quantity gate mismatch, price discrepancy, quality adjustment issue).

Clicking any row opens the side-by-side comparison with the full quantity waterfall and calculation chain from Part 1.

### The Delta Drill-Down

When you click a delta value, the system decomposes it into its component causes:

```
  Delta Decomposition: CARGO-0045 (+$1,962,660)
  ──────────────────────────────────────────────
  Volume effect:   -$544,000  (B/L 3,087,500 -> Outturn 3,045,000)
  Price effect:   +$2,806,590  (Provisional $12.80 -> Final $13.72)
  Quality adj:      -$296,930  (GHV 1,042 vs contract 1,050)
  Demurrage:         +$42,000  (24 excess hours x $1,750/hr)
  Rounding:          -$45,000
  ──────────────────────────────────────────────
  Total:          +$1,962,660
```

This decomposition is essential. A $2M variance sounds alarming, but when you see it is almost entirely a price effect (the market moved between provisional and final), it is expected. Without the decomposition, my team spends hours trying to figure out why the numbers changed.

---

## Part 4: Data Entry -- Cascading Defaults That Prevent Re-Entry Errors

### The Cascade Rule

Every entity in the system has a parent, and child entities inherit defaults from their parent. The user can override any default, but overrides are visually distinct (amber background instead of white) and logged.

```
  Contract SPA-SHELL-2025
    |-- Trade SP-2026-0142
    |     |-- counterparty: Shell (inherited from contract, locked)
    |     |-- pricing: JKM + $0.35 (inherited from contract, overridable)
    |     |-- delivery terms: FOB (inherited from contract, locked)
    |     |-- volume: 3,250,000 MMBtu (entered, validated against ACQ remaining)
    |     |
    |     |-- Cargo CARGO-2026-0045
    |     |     |-- trade_id: SP-2026-0142 (inherited, locked)
    |     |     |-- counterparty: Shell (inherited from trade, locked)
    |     |     |-- load_port: Sabine Pass (inherited from contract, overridable)
    |     |     |-- discharge_port: Gate (inherited from contract, overridable)
    |     |     |-- volume: 3,250,000 MMBtu (inherited from trade, overridable)
    |     |     |
    |     |     |-- Nomination NOM-2026-SHELL-015
    |     |     |     |-- contract_id, cargo_id: (inherited, locked)
    |     |     |     |-- volume: 3,100,000 MMBtu (entered, validated within +/-5%)
    |     |     |     |-- laycan: auto-suggested from ADP, overridable
    |     |     |     |-- vessel: TBN (entered later)
    |     |     |     |-- deadlines: auto-calculated from contract terms
    |     |     |
    |     |     |-- Invoice INV-2026-0089
    |     |           |-- trade_id, cargo_id: (inherited, locked)
    |     |           |-- counterparty: Shell (inherited, locked)
    |     |           |-- quantity: 3,087,500 MMBtu (from B/L, system-populated)
    |     |           |-- price: $12.80 (from trade pricing, system-resolved)
    |     |           |-- amount: $39,520,000 (computed, read-only)
```

The cascade serves two purposes:
1. **Speed**: creating a trade under an existing contract pre-fills 8 of 12 fields. The user only enters what is unique to this lifting.
2. **Consistency**: the counterparty on the invoice cannot differ from the counterparty on the trade. The pricing terms on the invoice are always derived from the trade. You cannot accidentally invoice the wrong party or at the wrong price.

### Visual Design for Cascaded Fields

```
  ┌─────────────────────────────────────────────────────┐
  │  Counterparty:  Shell Eastern Trading    LOCKED     │
  │  Source: Contract SPA-SHELL-2025                    │
  │  [grey background, no edit affordance]              │
  ├─────────────────────────────────────────────────────┤
  │  Load Port:  Sabine Pass LNG            INHERITED   │
  │  Source: Contract SPA-SHELL-2025                    │
  │  [white background with small "from contract" tag]  │
  │  [click to override -- will show amber + log]       │
  ├─────────────────────────────────────────────────────┤
  │  Volume:  3,250,000 MMBtu               ENTERED     │
  │  Validated: within ACQ remaining (12,750,000 MMBtu) │
  │  [white background, standard edit affordance]       │
  └─────────────────────────────────────────────────────┘
```

Three visual states:
- **LOCKED** (grey, no edit): inherited and cannot be changed at this level
- **INHERITED** (white + source tag): has a default from parent, can be overridden with logging
- **ENTERED** (white, standard): user-entered value, validated against constraints

---

## Part 5: Deadline Management -- Making Missed Deadlines Structurally Impossible

### The Operations Calendar

Beyond the nomination countdown wall (Part 1, Error 2), the system has a unified operations calendar that shows all deadlines across all entity types on one screen:

```
  OPERATIONS CALENDAR -- Week of April 13, 2026
  ═══════════════════════════════════════════════

  Monday 13 (TODAY)
    09:00  Invoice due: INV-2026-0082 payment to KOGAS ($31.2M)
    EOD    EOD valuation run (auto)

  Tuesday 14
    [No deadlines]

  Wednesday 15
    EOD    Nomination deadline: NOM-2026-JERA-042 (!! 2 DAYS)
           Assigned to: Sarah Chen
           Status: DRAFT -- NOT YET SUBMITTED

  Thursday 16
    [No deadlines]

  Friday 17
    EOD    Vessel nomination: NOM-2026-SHELL-015
           Assigned to: Mike Wong
           Status: AWAITING VESSEL ACCEPTANCE
    EOD    Month-end preliminary close (!! 4 DAYS EARLY)

  ─── NEXT WEEK ──────────────────────────────────────
  Monday 20
    09:00  Amendment deadline: NOM-2026-BP-003
    EOD    Invoice finalization: 4 invoices due for April close
  ...
```

This calendar is the operations team's single source of truth. No separate spreadsheet. No shared Outlook calendar. Every deadline from every subsystem (nominations, invoices, payments, valuations, month-end tasks) appears here automatically.

The calendar has a "team view" mode showing all five team members' deadlines in swim lanes, so the ops manager can see workload distribution and reassign when someone is overloaded or on leave.

### Blocking Rules

The system has configurable blocking rules that make certain process failures structurally impossible:

1. **Cannot submit a nomination after its deadline** -- the Submit button is disabled and shows "Deadline passed: 2026-04-15. Status auto-set to LAPSED."
2. **Cannot finalize month-end with open items** -- the month-end close button is disabled until all items on the checklist are complete (see Part 7).
3. **Cannot approve an invoice with unresolved variance flags** -- the Approve button is disabled and lists the specific flags that must be resolved first.
4. **Cannot skip an approval level** -- the system enforces sequential approval. The second approver's button does not appear until the first approver has acted.

---

## Part 6: The Morning Check -- Operations Dashboard

### What the Ops Manager Sees at 8:00 AM

The dashboard is not a collection of KPI cards. It is a *narrative briefing* for operations, structured as a checklist of things that need attention today:

```
+================================================================+
|  GOOD MORNING -- Monday April 13, 2026                          |
|  You have 7 items requiring action today.                       |
+================================================================+

  ── CRITICAL (action required today) ───────────────────────────

  1. [!] NOM-2026-JERA-042 deadline in 2 days, still DRAFT
     Assigned: Sarah Chen (on leave today)
     [Reassign]  [Submit on behalf]  [View]

  2. [!] Invoice INV-2026-0082 payment due today ($31.2M to KOGAS)
     Status: APPROVED, awaiting payment confirmation
     [Confirm Payment]  [View]

  3. [!] Quality dispute: CARGO-2026-0039 (PETRONAS)
     Counterparty claims GHV 1,038 vs. our 1,042 (SGS report)
     Open 5 days, no response recorded
     [View Dispute]  [Record Response]

  ── ATTENTION (action required this week) ──────────────────────

  4. [~] 3 invoices ready for second approval (total $127.4M)
     Oldest: 3 days waiting   [Review Queue]

  5. [~] Vessel LNG Sakura ETA revised: arrives Apr 15 (was Apr 17)
     Impact: CARGO-2026-0045 discharge 2 days earlier
     Laytime clock starts earlier -- update demurrage estimate
     [View Voyage]  [Recalculate Demurrage]

  6. [~] Month-end close: 8 of 14 items complete (57%)
     Overdue: Forward curve validation (due Apr 11)
     [View Checklist]

  ── OVERNIGHT CHANGES ──────────────────────────────────────────

  7. Market: JKM settled at $13.72 (+2.3% vs. Friday)
     Impact: 3 open cargoes, estimated P&L change +$4.2M
     [View Position Impact]

  8. AIS: Vessel Maran Gas Apollonia deviated from route
     Current: Suez Canal approach (was scheduled for Cape)
     Impact: ETA revision needed for CARGO-2026-0051
     [View on Map]

  ── TEAM STATUS ────────────────────────────────────────────────
  Sarah Chen:    On leave (back Apr 15). 2 items reassigned to you.
  Mike Wong:     4 active items, 0 overdue
  Li Wei:        6 active items, 1 overdue (invoice approval, 2 days)
  Emma Davies:   3 active items, 0 overdue
  Tom Nakamura:  5 active items, 0 overdue
+================================================================+
```

This dashboard is generated every morning (or on-demand) by combining data from all subsystems:
- Nomination deadlines from the nominations module
- Invoice status and payment dates from settlement
- Vessel positions and ETA revisions from AIS tracking
- Market data changes and position impact from valuation
- Team leave status and workload from the assignment system
- Month-end checklist status from the close workflow

The critical innovation: **item #1 shows that Sarah is on leave today and her nomination is at risk**. The system cross-references the deadline calendar with team availability. This is the error that spreadsheets and traditional ETRM systems never catch -- the human who is supposed to act is not at their desk.

---

## Part 7: Month-End Close -- The Unbypassable Checklist

### The Checklist

Month-end close is not a button. It is a 14-item checklist where every item must be completed, verified, and signed off before the period can be closed:

```
+================================================================+
|  MONTH-END CLOSE -- March 2026                                  |
|  Status: IN PROGRESS (8 of 14 complete)                        |
|  [Close Period] -- DISABLED until all items complete            |
+================================================================+

  1. [DONE] Forward curves validated (all benchmarks)
     Completed: Sarah Chen, 2026-04-01 09:15
     JKM, TTF, HH curves imported and validated against broker marks

  2. [DONE] All cargoes delivered in March have outturn reports
     Completed: auto-check, 2026-04-02
     8 cargoes, all outturn reports received

  3. [DONE] Position reconciliation: system vs. spreadsheet
     Completed: Mike Wong, 2026-04-03 14:30
     Delta: $12,400 (within $50K tolerance)

  4. [DONE] EOD valuations run for all March business days
     Completed: system, 2026-04-01 (auto-run)
     22 business days, all completed

  5. [DONE] All provisional invoices issued for March cargoes
     Completed: Li Wei, 2026-04-02
     8 provisional invoices issued

  6. [IN PROGRESS] All final invoices issued for February cargoes
     Assigned: Li Wei
     Status: 6 of 8 complete, 2 pending outturn reports
     Blocking items: CARGO-0033 (outturn expected Apr 5),
                     CARGO-0035 (quality dispute with Shell)

  7. [IN PROGRESS] Quality adjustments calculated and approved
     Assigned: Emma Davies
     Status: 5 of 6 approved, 1 pending second approval
     Blocking: CARGO-0039 quality dispute (see #6 above)

  8. [DONE] Demurrage calculations completed
     Completed: Tom Nakamura, 2026-04-04
     3 demurrage claims ($127K total), 1 despatch credit ($18K)

  9. [DONE] Hedge reconciliation: paper vs. physical
     Completed: Sarah Chen, 2026-04-03
     All futures/swaps matched to physical exposures

  10. [NOT STARTED] Payment reconciliation
      Assigned: Emma Davies
      Due: 2026-04-07
      18 payments to verify (12 received, 6 outstanding)

  11. [DONE] Credit utilization snapshot
      Completed: system, 2026-04-01 (auto-run)
      No breaches. JERA at 74%, Shell at 61%.

  12. [NOT STARTED] P&L attribution and sign-off
      Assigned: Head of Ops (you)
      Due: 2026-04-08
      Requires: items 1-11 complete

  13. [NOT STARTED] Audit report generation
      Assigned: system (auto-generate when #12 complete)
      All March changes, approvals, and overrides

  14. [NOT STARTED] Period close confirmation
      Assigned: Head of Ops (you) + Finance Director
      Dual approval required
      Requires: items 1-13 complete
```

Key design principles:
- **Dependencies are enforced.** Item 12 (P&L sign-off) cannot be started until items 1-11 are complete. Item 14 (period close) cannot be attempted until 1-13 are complete. The system shows why an item is blocked.
- **Owner is named.** Every item has a responsible person. If they are on leave, the system alerts the manager.
- **Evidence is attached.** Each completed item links to the specific artifacts: the forward curves that were validated, the reconciliation report, the invoice list.
- **The Close button is disabled until all 14 items show DONE.** You cannot close the period with open disputes, missing outturn reports, or unapproved quality adjustments. The button tells you exactly what is blocking it.

### What Happens When You Close

Closing the period is an irreversible action (within the system). It:
1. Locks all March transactions from further editing
2. Generates the audit report (all changes, approvals, overrides for the period)
3. Snapshots all positions, MTM values, and P&L figures
4. Archives the period's documents
5. Opens the next period for month-end processing

The irreversibility is the point. After close, any corrections require a journal entry in the next period, which creates its own audit trail. This is standard accounting practice but most ETRM systems allow back-dating edits that destroy the audit trail.

---

## Part 8: Cross-Checking -- Automatic Consistency Enforcement

### The Consistency Engine

The system runs continuous cross-checks between all linked entities. These are not nightly batch jobs -- they run on every state transition and surface discrepancies immediately.

**Trade-Cargo Consistency:**
```
  When a cargo status changes:
  - Is cargo.volume within trade.volume +/- tolerance?
  - Does cargo.load_port match trade.delivery_window.load_port?
  - Does cargo.discharge_port match trade.delivery_window.discharge_port?
  - Is cargo.laycan within trade.delivery_window date range?
  - Is the vessel acceptable for this port? (draft limit, cargo size)
```

**Cargo-Nomination Consistency:**
```
  When a nomination is submitted:
  - Is nominated volume within cargo volume +/- tolerance?
  - Is laycan within the ADP slot for this month?
  - Does the nominated vessel match the cargo's vessel (if assigned)?
  - Has the nomination deadline passed? (block if yes)
  - Is there already a confirmed nomination for this cargo? (block duplicate)
```

**Invoice-Cargo Consistency:**
```
  When an invoice status changes:
  - Does invoice quantity match the appropriate quantity gate?
    (B/L for provisional, outturn for final)
  - Does invoice price match the trade pricing resolution?
  - Does the quality adjustment match the system calculation?
  - Does the demurrage amount match the laytime calculation?
  - Is the counterparty on the invoice the same as on the trade?
```

**Portfolio-Level Checks:**
```
  Daily (during morning briefing generation):
  - Do all long positions have confirmed nominations?
  - Do all confirmed nominations have vessels assigned?
  - Are any hedges orphaned (no matching physical exposure)?
  - Are any credit limits within 10% of breach?
  - Are any invoices overdue for payment?
```

When a cross-check fails, the system does not just log a warning. It creates a *resolution item* that appears on the responsible person's dashboard and cannot be dismissed without action:

```
  CONSISTENCY ALERT -- Created 2026-04-10 14:32
  ───────────────────────────────────────────────
  Type: Invoice-Cargo quantity mismatch
  Invoice: INV-2026-0089 (quantity: 3,087,500 MMBtu)
  Outturn: OTR-2026-0045 (quantity: 3,045,000 MMBtu)

  This invoice is using B/L quantity but status is FINAL.
  Final invoices must use outturn quantity.

  Resolution options:
  [Update invoice to outturn quantity]
  [Revert invoice to PROVISIONAL status]
  [Override with reason]  -- requires dual approval
```

---

## Part 9: Audit Trail -- Context That Prevents, Not Just Records

### Beyond Logging

The traditional audit trail answers "who changed what and when." That is necessary but insufficient. The Horizon audit trail also answers "what was the context when this decision was made?"

When an approver approves an invoice, the audit entry includes:
- Market prices at the time of approval (not just at the time of trade)
- The system check results (all passed, or which ones were overridden)
- The position impact (approving this invoice changed net position by X, P&L by Y)
- The counterparty's credit status at approval time
- Links to all supporting documents that were available

This means that three years later, when a dispute arises, the audit trail can reconstruct not just *what* was approved but *why it was reasonable to approve it given what was known at the time*.

### The Timeline View

For any entity, the audit trail is displayed as a timeline, not a table:

```
  CARGO-2026-0045 Timeline
  ═════════════════════════

  2026-01-15  CREATED by system
              Source: ADP SPA-SHELL-2025, March delivery slot
              Auto-assigned to: Sarah Chen

  2026-02-20  NOMINATED (NOM-2026-SHELL-015)
              Volume: 3,100,000 MMBtu (within +/-5% of trade)
              Submitted by: Sarah Chen
              Counterparty acknowledged: 2026-02-22

  2026-03-01  VESSEL ASSIGNED: LNG Sakura
              Vessel nom by: Shell (counterparty nomination)
              Our acceptance by: Mike Wong, 2026-03-03

  2026-03-15  LOADING at Sabine Pass
              Commenced: 2026-03-15 08:00 UTC
              B/L issued: 3,087,500 MMBtu (BL-2026-0045)
              Surveyor: SGS (#2026-SGS-4521)

  2026-03-16  IN TRANSIT
              Route: Sabine Pass -> Futtsu via Panama Canal
              ETA: 2026-04-02

  2026-03-31  ETA REVISED
              New ETA: 2026-04-01 (1 day earlier, speed optimized)
              Source: AIS position update

  2026-04-01  DISCHARGING at Futtsu
              Commenced: 2026-04-01 14:00 UTC
              Completed: 2026-04-02 06:00 UTC (16 hours)
              Outturn: 3,045,000 MMBtu (OTR-2026-0045)
              Surveyor: Intertek (#2026-ITK-892)

  2026-04-03  PROVISIONAL INVOICE ISSUED
              INV-2026-0089: $39,520,000 (B/L qty x $12.80)
              Prepared by: Li Wei
              Approved by: Sarah Chen

  2026-04-09  FINAL INVOICE ISSUED
              INV-2026-0089: $41,482,660 (outturn qty x $13.72)
              Quality adj: -$296,930
              Demurrage: +$42,000
              Prepared by: Li Wei
              First approval: Sarah Chen, 2026-04-09 10:15
              >> AWAITING SECOND APPROVAL <<

  [Expand any entry to see full detail and documents]
```

This timeline is the definitive record of everything that happened to this cargo. When the counterparty calls to ask "why did the final invoice change by $2M?", anyone on the team can open this timeline and explain it in 30 seconds: price moved from $12.80 to $13.72, quantity adjusted from B/L to outturn, quality adjustment applied, demurrage added. Every number has a source. Every action has an actor.

---

## Part 10: Workflow State Machines -- Enforced, Visible, Non-Negotiable

### Every Entity Has a Visible State Machine

The codebase already defines state machines for trades (8 states), cargoes (22 states), nominations (11 states), and invoices (8 states). These are well-designed. The UI must make them visible and non-bypassable.

On every entity detail page, the state machine is rendered as a horizontal stepper at the top:

```
  CARGO-2026-0045

  ADP_PLANNED > SCHEDULED > NOMINATED > CONFIRMED > VESSEL_ASSIGNED >
  AT_ANCHOR > LOADING > LOADED > IN_TRANSIT > DISCHARGING >
  [DISCHARGED] > PROV_INVOICED > FINAL_INVOICED > SETTLED

  Current: DISCHARGED
  Next valid states: PROVISIONALLY_INVOICED
  [Advance to Provisionally Invoiced]  -- requires provisional invoice
```

The stepper shows:
- Completed states in green with checkmarks
- Current state highlighted in blue
- Future states in grey
- Invalid/exception states (CANCELLED, FORCE_MAJEURE, DIVERTED) shown as branches below the main line
- The "Advance" button only appears for valid transitions and only when preconditions are met

**Precondition enforcement example:**

To advance from DISCHARGED to PROVISIONALLY_INVOICED:
- Outturn report must exist for this cargo
- At least one invoice must exist in PROVISIONAL or higher status
- Quantity gates must be reconciled (outturn <= B/L within expected BOG range)

If any precondition is not met, the advance button is disabled and the unmet conditions are listed:

```
  Cannot advance to PROVISIONALLY_INVOICED:
  [PASS] Outturn report exists (OTR-2026-0045)
  [FAIL] No provisional invoice found -- create one first
  [PASS] Quantity gates reconciled
```

---

## Summary: What Makes This System Different

Most ETRM systems are data entry tools. You type numbers, the system stores them, and if you type the wrong number, the system stores the wrong number.

This system is a *verification engine*. It computes numbers from source data, shows you the computation, and asks you to verify that the computation is correct. It cross-checks every number against every related number. It blocks invalid state transitions. It escalates anomalies. It makes the absence of action visible (deadline not met, approval not given, document not uploaded).

The single design principle: **no human should perform arithmetic, remember a deadline, or enforce a business rule.** Humans should verify, approve, and exercise judgment. The system does everything else.

For an ops team processing 200 invoices and 40+ nominations per month, this is the difference between spending 80% of time on data entry and error correction (the current state with Allegro/Endur) and spending 80% of time on exception handling and commercial judgment (the target state).

Every pattern described above is grounded in what the codebase already has:
- Computed invoices from `settlement/service.py`
- Quantity waterfalls from `quantity_gates.py`
- Quality adjustments from `calculate_quality_adjustment()`
- State machines from `VALID_*_TRANSITIONS` dicts in every domain model
- Business calendar from `business_calendar.py`
- Deadline tracking from `DeadlineAlert` and `CargoNomination.is_overdue`
- Audit trail from `audit/models.py` with before/after snapshots

The domain model is right. The UI needs to be the enforcement layer that makes these models un-bypassable.
