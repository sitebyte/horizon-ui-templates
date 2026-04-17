# Vision Synthesis: The Most Intuitive, Accuracy-First Trading System

**Synthesised from 6 independent vision documents (218KB of analysis)**
**Date:** 13 April 2026

---

## The Core Insight (Unanimous)

All 6 agents converged on the same fundamental principle, stated differently by each:

> **Trading Tech Head:** "Nobody trusts the system. Traders keep shadow spreadsheets. The system that wins is the one where users stop checking its answers."

> **Desk Trader:** "Speed and accuracy aren't opposites. A good guardrail is faster than an undo."

> **Ops Manager:** "The errors we actually make are all preventable — the system just doesn't prevent them."

> **UX Specialist:** "Error prevention > error correction. Make the right action the easiest action."

> **Competitor Benchmarker:** "Bloomberg isn't trusted because it's accurate. It's trusted because it's VISIBLY accurate — you can see where every number comes from."

> **Frontend Craft Expert:** "The #1 cause of P&L-affecting bugs is the interface between human intention and system state."

**The synthesis:** An accuracy-first trading system doesn't add more validation dialogs. It makes errors structurally impossible through constraints, makes consequences visible before commitment, and makes every number traceable to its source.

---

## The 10 Principles of an Accuracy-First Trading UI

### 1. CONSTRAIN, DON'T VALIDATE

**Don't ask "is this valid?" after entry. Make invalid input impossible.**

- Volume input: slider or dropdown with standard cargo sizes (3.2M, 1.6M, 4.8M MMBtu). Free-type with sanity band (±50% of standard). Outside the band = amber warning with "Unusual volume — confirm?"
- Price input: show live benchmark price as placeholder. Deviation >10% from market = amber warning. >50% = red block requiring override.
- Counterparty: only show entities with active credit lines. Grey out breached counterparties with reason.
- Dates: only allow dates within the contract delivery window. Past dates greyed out.
- Ports: FOB trade = only show loading terminals. DES trade = only show discharge terminals.

**Trader's version:** "Don't ask me 'are you sure?' — just don't let me pick the wrong port for a FOB deal."

### 2. SHOW CONSEQUENCES BEFORE COMMITMENT

**Every action should preview its effect BEFORE the user commits.**

- Trade entry: live position impact panel showing "Your JKM Jun-26 position goes from 3.2M to 6.4M Long. Hedge ratio drops from 92% to 46%. Credit utilisation for Shell goes from 78% to 91%."
- Invoice amount: show the calculation breakdown — volume × price × quality adjustment = total. Each variable clickable to see its source.
- Status change: "Approving this trade will trigger a nomination deadline in 14 days and create a credit reservation of $45M."

**Ops Manager's version:** "I want to see the ripple effect before I push the button."

### 3. ONE NUMBER, ONE SOURCE, ONE FORMAT

**Every number on screen must be traceable, consistent, and unambiguous.**

- All volumes: always show unit (MMBtu, MT, m³). Never bare numbers.
- All prices: always show currency, unit ($/MMBtu, €/MWh). Always monospace, tabular-nums.
- All calculations: show the formula on hover or in a detail panel. "MTM = (Market $14.60 - Trade $14.25) × 3,200,000 = +$1,120,000"
- All sourced data: show provenance — "JKM $14.60 (Platts, 12 Apr 09:00 UTC)"
- Frontend: single numeric coercion module. Never call Number() or parseFloat() in render code.

**Frontend Expert's version:** "Create a `safeNumber(value)` function that handles null, undefined, NaN, string-typed numbers. Use it everywhere. Test it with 50 edge cases."

### 4. KEYBOARD-FIRST WITH GUARDRAILS

**Speed through keyboard, safety through constraints. Not speed OR safety.**

- Quick entry: B/S keys → Tab to counterparty → type 3 chars → Tab selects first match → Tab to volume (pre-filled) → Tab to price → Enter shows confirmation → Enter commits.
- Confirmation is ONE extra keystroke, not a modal dialog. It's the difference between 14 and 15 seconds, not 14 and 30.
- After commit: success toast with Undo (5s). One keystroke to undo. Not a dialog.
- AG Grid: F2 to edit cell, Escape to cancel, Tab to next cell. Changes validate per-cell and revert with toast if invalid.

**Trader's version:** "The confirmation bar costs me one second and saves me from the one trade a month that costs $500K."

### 5. FOUR-EYES ENFORCED BY THE SYSTEM

**The system physically prevents a single person from completing a high-risk action alone.**

- Trade entry: creator cannot approve their own trade. The "Approve" button is disabled with tooltip "Requires approval from another user."
- Invoice: creator cannot issue. Separate approve step required.
- Amendment: any change to a confirmed trade creates an amendment record and requires re-approval.
- Override: credit limit breach can be overridden, but requires a reason and a different user's confirmation. The override is permanently logged.

**Ops Manager's version:** "The system should make it harder to skip a control than to follow it."

### 6. DEADLINE-DRIVEN, NOT TASK-DRIVEN

**Don't show me a list of things to do. Show me what's about to go wrong.**

- Dashboard: sorted by deadline, not by type. "Vessel nomination for CARGO-Q2-03 due in 47 hours" is more useful than "You have 3 pending nominations."
- Escalation: 7 days = blue info. 3 days = amber warning. 1 day = red alert. Overdue = red banner that persists until resolved.
- Calendar integration: every deadline visible on a calendar view with colour coding.
- Notifications: push for <24 hours. Don't rely on users checking the dashboard.

**Ops Manager's version:** "I don't want to discover a missed deadline. I want the system to make missing one impossible."

### 7. RECONCILIATION IS THE ACCURACY TEST

**If two numbers should agree and don't, the system should find it before humans do.**

- Auto-reconciliation: when an outturn report is entered, automatically compare B/L quantity, calculate transit loss, and flag if outside tolerance.
- Invoice matching: when a final invoice is created, automatically compare to provisional. Highlight every field that differs. Calculate net difference. Show tolerance check.
- Cross-entity consistency: trade volume → nomination volume → B/L volume → outturn volume → invoice volume. Show the chain. Flag breaks.
- Quality adjustment: auto-calculate from contract spec vs actual GHV. Show the formula. Don't let humans do the arithmetic.

**Ops Manager's specific example:** "Contract GHV 1,050 BTU/scf. Outturn 1,042. System calculates: (1,042-1,050)/1,050 = -0.762%. Applied to 3,045,000 MMBtu at $12.80 = -$296,930.40. I verify the inputs, not the maths."

### 8. AUDIT IS NOT LOGGING — IT'S CONTEXT

**An audit trail that just says "User X changed field Y at time Z" is useless. Show WHY.**

- Every state change captures: who, when, what changed (before/after), and a mandatory reason field for significant changes.
- Trade amendment: side-by-side diff showing old vs new values, highlighted.
- Approval record: who approved, when, what they saw at the time (position, credit headroom).
- The audit trail is not hidden in a separate tab. Key events appear inline: "Amended by R.Mehta on 12 Apr — volume changed from 3.2M to 3.4M (tolerance adjustment)."

**Trading Tech Head's version:** "When the regulator asks 'why was this trade approved despite the credit breach?', the system should answer the question without anyone having to remember."

### 9. PROGRESSIVE DISCLOSURE WITH FULL DEPTH AVAILABLE

**Show the summary first. Let users drill to any depth.**

- Dashboard: "P&L: +$2.14M" → click → breakdown by attribution (price +$1.06M, trades +$0.82M, settlements +$0.18M, FX -$0.06M) → click → drill to individual trades contributing to each.
- Position ladder: cell shows "+3.2M / +$0.82M" → click → see 3 underlying trades → click trade → see full trade detail with cargo, nomination, invoice links.
- Invoice: shows "$45.3M" → expand → see line items with quantities, prices, adjustments → see the source trade and cargo for each line.

**UX Specialist's version:** "Every number is a door. Clicking it opens to the next level of detail."

### 10. THE SYSTEM LEARNS FROM ERRORS

**When an error IS caught, the system should prevent the same class of error forever.**

- If a quality adjustment error is caught in reconciliation: flag similar adjustments across all open invoices for review.
- If a price entry is corrected: adjust the sanity band for that benchmark based on actual trading ranges.
- If a nomination deadline is missed: tighten the alert threshold for that contract (alert at 10 days instead of 7).
- AI integration: "Based on the last 6 months of corrections, these 3 trades have patterns similar to previously corrected entries."

**Competitor Benchmarker's version:** "This is the feature no ETRM has today. An AI layer that watches for patterns in corrections and pro-actively flags similar situations. That's a $1M differentiator."

---

## The Accuracy Stack (UX Specialist's Framework)

```
Layer 5: RECOVERY     — Undo, rollback, amendment workflow
Layer 4: VERIFICATION — Confirmation step, preview, four-eyes
Layer 3: FEEDBACK     — Live position impact, price sanity, credit check
Layer 2: GUIDANCE     — Smart defaults, cascading constraints, formula preview
Layer 1: STRUCTURE    — State machines, input masks, type constraints, valid combinations only
```

**Each layer catches errors the layer below missed.** The best systems invest heavily in Layers 1-2 (making errors impossible) so Layers 4-5 (catching errors after they happen) rarely fire.

---

## What This Means for Horizon

The current Horizon templates demonstrate Layers 3-5 partially (some feedback, some confirmation, some preview). The gap is in Layers 1-2:

| Layer | Current | Target |
|-------|---------|--------|
| Structure | Basic HTML form validation | State machines, input masks, valid-combination-only dropdowns |
| Guidance | Some smart defaults | Cascading constraints, formula preview, live calculation display |
| Feedback | Position impact preview (Theme E/F) | Real-time credit, price sanity, hedge impact during entry |
| Verification | Confirmation bar (just added) | Four-eyes, approval workflows, amendment tracking |
| Recovery | Undo toast (just added) | Full amendment history, rollback to any version |

**The competitive advantage is in Layers 1-2.** Every ETRM has validation dialogs (Layer 4). No ETRM makes errors structurally impossible (Layer 1). That's the gap Horizon can own.

---

## Documents

| File | Size | Author |
|------|------|--------|
| `vision-trading-tech-head.md` | 37KB | Head of Trading Technology |
| `vision-desk-trader.md` | 29KB | 10-Year LNG Desk Trader |
| `vision-ops-manager.md` | 33KB | Operations Manager |
| `vision-ux-specialist.md` | 33KB | UX Critique Specialist |
| `vision-competitor-benchmark.md` | 38KB | Competitor Benchmarker |
| `vision-frontend-craft.md` | 52KB | Frontend Craft Expert |
| **Total** | **222KB** | |
