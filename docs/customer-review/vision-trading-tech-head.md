# Accuracy as Architecture: What Would Make a Trading System I Actually Trust

**Author perspective:** Head of Trading Technology, 15 years implementing ETRM systems (Bloomberg, Allegro, Endur, ION). Managing 12 developers. Authorised for $500K-$2M software purchases.

**Date:** 11 April 2026

---

## Prologue: Why I Have Trust Issues

I have implemented four ETRM systems across three companies. Each time, the same thing happens: the system is technically functional but nobody trusts it. Traders keep shadow spreadsheets. Operations runs a parallel process in Excel. Risk managers pull data into their own models. The CFO gets a manually assembled report that took someone three days to create.

The system is not wrong, exactly. It is unverifiable. The numbers appear on screen and nobody can tell you, in under thirty seconds, where they came from. Every number in a trading system is a conclusion drawn from assumptions, and if the system hides those assumptions, it creates a specific kind of anxiety that drives people to rebuild everything outside the system.

This is what I mean by accuracy: not just "the calculation is correct" but "I can see that the calculation is correct, I can trace every input, and the system actively prevents me from creating incorrect data."

Here is what I would build.

---

## Part I: The Four Dimensions of Accuracy

### 1. Data Accuracy: What Goes In

Every error I have seen in production traces back to data entry. A trader types 32,000,000 instead of 3,200,000. An ops analyst selects the wrong counterparty from a dropdown because two entities have similar names. A price is entered as 14.25 when the quote was 12.45. A volume is captured in MMBtu when the contract specifies metric tonnes.

These are not edge cases. They happen weekly. The cost of a single data entry error in LNG trading ranges from tens of thousands of dollars (a demurrage miscalculation) to hundreds of millions (a misbooked volume on a large SPA).

**What the best systems do:**

**Contextual validation, not just field-level validation.** Field-level validation (is this a number? is it positive?) catches maybe 20% of errors. The dangerous errors pass field validation perfectly -- 32,000,000 is a perfectly valid number, it is just the wrong number. What catches the real errors is context: "This volume is 10x larger than any trade you have entered this month. Confirm?" or "This price is $1.85 below the current JKM. Is this intentional?" or "You are entering a DES trade but the counterparty's master agreement specifies FOB only."

The system should know what normal looks like and flag what is abnormal. Not by blocking -- blocking is infuriating for experienced traders who sometimes genuinely do need to enter unusual numbers -- but by making the user pause and acknowledge the anomaly.

**Reference data shown at point of entry.** When a trader enters a price premium of +$0.50 against JKM, the system must show them the current JKM price right there, inline, next to the field. Not in a separate window. Not requiring them to look at a different screen. The current benchmark price, the implied total price, and a comparison to recent trades on the same benchmark. All visible without leaving the entry form.

I saw this done well exactly once, in a custom Bloomberg TOMS extension one of my clients built. The trader could see, as they typed, the implied total price updating in real time, colour-coded against the current market (green if competitive, amber if unusual, red if clearly wrong). Fat-finger errors dropped by 60% in the first month.

**Unit consistency enforced at the platform level.** This is the single most dangerous category of accuracy failure in LNG trading. A cargo might be quoted in metric tonnes by the seller, invoiced in MMBtu by the buyer, and reported in TBtu to management. The system must have a single internal unit convention (I prefer MMBtu as the canonical unit, since that is what all three major benchmarks price against) and convert at display time based on user preference. Every number that represents a physical quantity must carry its unit. Not as a column header that might scroll off screen, but as a suffix on the number itself: "3.2M MMBtu" or "65,000 MT". Always.

In Endur, I watched a settlement analyst approve a $40M invoice that was wrong by 15% because the provisional invoice was in MMBtu and the final was in therms, and the system displayed both as bare numbers. The quantities looked close enough to pass visual inspection. They were not.

**Duplicate detection that understands context.** If I enter a BUY 65,000 MT JKM Jun-26 from Shell at +0.50 premium, and three minutes ago I entered an identical trade, the system should intervene: "This trade matches T-2026-0412 entered at 09:37. Submit as new trade anyway?" This is not just a hash comparison -- it needs fuzzy matching. A duplicate with a slightly different volume (65,000 vs 64,500) is still suspicious. A duplicate at a different price is less suspicious (price amendments are common). The system needs to weight these signals.

### 2. Calculation Accuracy: What Happens Inside

Calculation accuracy in a trading system means two things: the maths is correct, and the methodology is visible.

**Show your working.** Every number in the system should be decomposable. If the blotter shows MTM of +$1,120,000 on a trade, I should be able to click that number and see: "Trade price: JKM Jun-26 + $0.50 = $14.75. Current JKM Jun-26: $15.10. Delta: +$0.35/MMBtu. Volume: 3,200,000 MMBtu. MTM = $0.35 x 3,200,000 = $1,120,000." Not in a report that takes three clicks to reach. In a tooltip or an expandable panel, right there on the number.

This is what Bloomberg does well with their DES (Description) function -- every calculated field has a breakdown. In trading, every number is an opinion about the future. The system must make the basis of that opinion visible.

**P&L attribution that explains itself.** When the desk P&L changes by $2.3M overnight, the first question every morning is "why?" The system should decompose this automatically: +$1.06M from price moves (JKM up $0.15, TTF down $0.08), +$0.64M from new trades entered yesterday, +$0.18M from settlements, -$0.06M from FX. This is not a report. This is the dashboard. The AI briefing should narrate it: "P&L up $2.3M driven primarily by JKM strengthening, partially offset by TTF softening in the near months."

**WACOG that traces to its components.** The weighted average cost of gas for each position bucket is the most important number for a trader assessing profitability. But a WACOG of $14.12/MMBtu is meaningless without decomposition: "Based on 5 trades: T-0401 at $14.25 (30%), T-0387 at $14.50 (25%), T-0392 at $13.85 (20%), T-0399 at $14.00 (15%), T-0405 at $13.90 (10%)." The weights should correspond to volume shares. The trades should be clickable links. The whole thing should be one click from the position ladder.

**Forward curve interpolation transparency.** When the system interpolates a forward curve price for a month that does not have a direct market quote, it must show the interpolation method and inputs. "Aug-26 JKM: $13.42 (interpolated from Jul-26: $13.65 and Sep-26: $13.20, linear)." The user needs to know whether they are looking at a market-observed price or a calculated one. Different visual treatment -- perhaps a subtle dashed underline -- should distinguish interpolated from observed prices everywhere in the system.

**Rounding rules visible and configurable.** LNG pricing conventions vary by contract and benchmark. JKM prices to 3 decimal places. Volumes round to the nearest whole MMBtu. Invoice amounts round to 2 decimal places. Intermediate calculations should carry full precision with rounding applied only at display and settlement. The rounding methodology should be configurable per contract (some use banker's rounding, others use commercial rounding) and the system should show the pre-rounded value on hover.

### 3. Workflow Accuracy: What Happens Between People

The most expensive accuracy failures in trading are not data entry errors or calculation bugs. They are workflow failures: a trade that should have been approved but was not. An invoice that was paid twice because two people processed it simultaneously. A nomination that was submitted to the wrong counterparty because the contract mapping was incorrect.

**State machines that enforce reality.** An invoice cannot go from Draft to Paid. A trade cannot be Confirmed without a credit check passing. A nomination cannot be submitted after its contractual deadline. These are not suggestions -- they are hard constraints encoded in the system. The UI should grey out impossible actions, not just display an error when you try them.

In Allegro, I once discovered that our settlements team had been manually changing invoice statuses to skip the approval step because it was "faster." The system allowed it because the status field was a freetext dropdown. The audit trail showed the status change but not the skipped approval. We only discovered the issue during an external audit. The system should have made it physically impossible.

**Four-eyes principle as infrastructure, not policy.** For any action above a configurable threshold -- approving an invoice over $10M, cancelling a confirmed trade, amending a contract price -- the system should require a second user to approve. Not "we have a policy that says someone else should check this." The button should be greyed out until a different user confirms. The system should track both the initiator and the approver, and it should prevent the same person from playing both roles.

This is not bureaucracy. This is the difference between a $45M invoice being approved correctly and a $45M invoice being approved by mistake at 4:58pm on a Friday by someone who just wanted to go home.

**Assignment and ownership.** Every entity in the system -- every trade, every invoice, every nomination, every cargo -- should have an owner. Not "whoever last touched it" but an explicit assignment. My five operations analysts each handle specific counterparty relationships. The system should route Shell invoices to Sarah, JERA invoices to Raj, and show me the workload distribution across my team. When someone is on holiday, I should be able to reassign their queue to a colleague, and the audit trail should record the reassignment.

**Deadline enforcement with escalation.** A nomination deadline is not a suggestion. If an ADP nomination is due in 48 hours and no one has submitted it, the system should alert the assigned coordinator. At 24 hours, it should alert me. At 4 hours, it should alert the trader. These escalation rules should be configurable by entity type and be visible in the UI -- the user should see "Deadline in 48h. Escalation: coordinator -> ops manager at 24h -> trader at 4h."

### 4. Audit Accuracy: What Gets Remembered

Every regulated commodity trading firm will eventually face an audit -- internal, external, or regulatory. The single most common finding in trading system audits is: "We cannot determine who made this change, when, or why."

**Every state change records who, what, when, and why.** Not just in a log file. In the UI, visible at the point of action. When I look at a trade, I should see its full history: created by Alex at 09:15, credit-checked automatically at 09:15, approved by Sarah at 09:22 ("within desk limits"), amended by Alex at 14:30 ("volume correction per counterparty confirmation, email ref SC-2026-0442"), confirmed by counterparty system at 15:01.

**Field-level change tracking with before/after.** "Trade amended" is not an audit entry. "Volume changed from 3,200,000 to 3,400,000 MMBtu by A. Kim at 14:30, reason: tolerance adjustment per counterparty email SC-2026-0442" is an audit entry. Every field that changes should show its old and new value. The system should require a reason for every amendment. And the reason field should not accept "corrected" or "updated" -- those are not reasons, they are descriptions of the action itself.

**Immutable audit trail.** The audit log should be append-only. No one -- not the admin, not the DBA, not the system itself -- should be able to delete or modify an audit entry. If an entry is incorrect, you add a correction entry, not modify the original. This is a regulatory requirement under EMIR and REMIT, and it is also just good engineering. I have seen DBAs asked to "clean up" audit logs before an external audit. The system architecture should make this impossible.

**Point-in-time reconstruction.** If I need to know what the position ladder looked like at 4pm last Tuesday, the system should be able to show me. Not "roughly what it was" but exactly what it was: what trades existed, what prices were used, what the calculated P&L was. This requires event sourcing or at minimum snapshotting, and it is non-negotiable for regulatory compliance and dispute resolution.

---

## Part II: UI Design That Prevents Errors

### The Principle of Honest Display

The most dangerous UI in trading is one that displays information without communicating its reliability. A price shown in the ticker without a timestamp might be 30 seconds old or 30 hours old. A position number shown without its component trades might be correct or might be missing a trade that has not synced yet. A P&L figure shown without its calculation date might reflect yesterday's close or a manual override.

**Every displayed value should communicate three things:**

1. **The value itself** -- rendered with appropriate precision, units, and formatting
2. **Its provenance** -- where did this number come from? (market data feed, calculation, manual entry, interpolation)
3. **Its freshness** -- when was this number last updated or verified?

This does not mean cluttering the screen with metadata. It means using visual encoding: a subtle indicator for interpolated vs observed prices, a timestamp that changes colour when data is stale, an icon that shows whether a number is market-derived or manually overridden.

In Bloomberg Terminal, every price field shows the source and timestamp. In most ETRM systems, prices appear without context. That gap creates distrust.

### Confirmations That Add Value, Not Friction

The typical approach to error prevention in enterprise software is the modal confirmation dialog: "Are you sure you want to approve this invoice? [Yes] [No]." This is useless. After the third time, users click "Yes" without reading. It is security theatre for audit compliance.

**What works instead:**

**Summary confirmation that shows consequences.** When a trader hits Enter after filling the quick entry form, the system should not show "Are you sure?" It should show: "BUY 3,200,000 MMBtu JKM Jun-26 +$0.50 (=$14.75) from JERA. Position impact: JKM Jun goes from +450k to +3,650k (long). Credit utilisation: JERA goes from 62% to 71%. Confirm (Enter) | Cancel (Esc)." Now the trader is reviewing the actual data, not clicking through a speed bump.

**Undo instead of confirm for low-stakes actions.** For routine actions (marking an alert as read, changing a filter, updating a status note), do not confirm. Just do it and show an "Undo (5s)" toast. This is faster for the user and actually safer -- because the undo window catches the "oh no I did not mean to do that" reaction, which typically occurs within 2-3 seconds.

**Progressive friction for high-stakes actions.** For actions above a financial threshold (approving an invoice over $10M, cancelling a confirmed trade, amending a contract price), require increasingly deliberate confirmation: a typed reason, a second approver, a mandatory waiting period. The friction should be proportional to the consequence. Approving a $500K routine invoice should take one click plus a reason. Approving a $50M disputed invoice should require a reason, a second approver, and a link to supporting documentation.

### Colour as a Structural Language

In trading systems, colour carries meaning. Green means profit or long. Red means loss or short. Amber means warning. Blue means neutral information. These are not aesthetic choices -- they are a vocabulary that traders rely on for rapid pattern recognition.

**Rules that protect this vocabulary:**

- **Never use colour as the only encoding.** Red/green colourblindness affects 8% of men. Every colour-coded value should also have a text indicator (+/-), an icon, or a positional cue.
- **Reserve red for genuine problems.** If the dashboard shows 15 items in red, none of them register. If it shows 1 item in red and 14 in amber, the user's eye goes straight to the red item. This is the Von Restorff effect, and it is the most powerful tool in dashboard design. Use it deliberately.
- **Consistency across all views.** If +$1.2M is green in the position ladder, it must be green in the blotter, in the P&L report, and in the AI briefing. If the reconciliation page uses amber for variances, the invoice page must use the same amber for the same concept. Colour inconsistency is a trust destroyer.

### Typography That Serves Data

Every financial figure in the system must use a monospace font with tabular numerals (font-variant-numeric: tabular-nums). This is non-negotiable. The reason: in a column of numbers, each digit must occupy the same horizontal space so that the eye can scan vertically and spot anomalies. "1,234,567" and "1,234,568" must differ by exactly one glyph-width in the ones column.

**Specific rules:**

- **Body text:** Inter or a similar humanist sans-serif. Readable at small sizes, professional appearance.
- **Financial figures:** JetBrains Mono or Source Code Pro. Monospace, tabular nums, distinct zero (slashed or dotted).
- **Labels and headers:** Same as body text but with weight/tracking variations.
- **Minimum size:** 13px for body text, 10px for secondary labels. Anything smaller causes eye strain over an 8-hour session. Theme D's 9px labels are too small. I know density matters, but not at the cost of readability.

### Density as a Feature, Not a Bug

Traders work on 4-6 monitor setups. They scan, they do not read. The system must provide maximum information density for primary trading views (dashboard, position ladder, blotter) while using comfortable density for data entry forms, settings pages, and documentation.

**The density contract:**
- **Trading views:** 28-30px row height, 0.8125rem base font, compact padding, no decorative borders. Every pixel shows data.
- **Data entry views:** 40-48px row height, 0.875rem base font, generous padding, clear field boundaries. Accuracy over speed.
- **Management views:** Between the two. Summary numbers large, detail available on interaction.

This is not a personal preference. This is ergonomic necessity. A trader who scans the position ladder 50 times a day needs it dense. An ops analyst entering an invoice reconciliation once needs space and clarity.

---

## Part III: Patterns That Enforce Accuracy Without Slowing Users Down

### Pattern 1: Inline Context at Point of Decision

When a user is about to make a decision, the system should show them everything they need to make it correctly, without requiring them to navigate away.

**Example: Trade entry with position impact preview.**

The trade form should have a live sidebar that updates as the user fills in fields. As they select JKM as the benchmark and Jun-26 as the delivery month, the sidebar shows: current JKM Jun position (+450k MMBtu), current WACOG ($14.12), current market price ($14.60), post-trade position (+3,650k MMBtu), post-trade WACOG (recalculated), credit impact on selected counterparty, hedge ratio change.

This is not a summary shown after entry. It is a real-time preview that updates with every keystroke. The trader can see, before they commit, whether this trade takes them over a position limit, whether it improves or worsens their WACOG, and whether the counterparty has credit headroom.

Horizon's Theme F trade form already has this concept with the Position Impact Preview panel. It is one of the best ideas in the prototype. The implementation needs to be live (currently using static placeholder data) and comprehensive (needs WACOG, not just volume).

### Pattern 2: Smart Defaults That Reduce Keystrokes

Every field in a form should have a defensible default value. Not "empty" -- that forces the user to fill everything from scratch. Not "last used" -- that creates dangerous carryover errors. Smart defaults:

- **Direction:** BUY (most trading desks buy more than they sell, since they are aggregating for end-users)
- **Benchmark:** The user's most-traded benchmark (personalised, not hardcoded)
- **Delivery month:** The nearest liquid month (not the current month, which is usually past its trading window)
- **Volume:** The standard cargo size for the selected counterparty (65,000 MT for a standard LNGC, but varies by vessel class and terminal constraint)
- **Delivery terms:** The default term from the counterparty's master agreement (if one exists)
- **Trader:** The logged-in user
- **Book:** The user's primary book

The user should be able to Tab through a pre-filled form, changing only what differs from the default, and submit in under 5 seconds. Theme D's quick entry gets close to this but misses several fields (no delivery terms, no book, no trader).

### Pattern 3: Reconciliation as Visual Diff

The reconciliation page in Horizon's prototype is, genuinely, the best implementation of this concept I have ever seen in an ETRM. The side-by-side provisional vs final layout with amber-highlighted deltas and inline variance values is how this workflow should look.

To make it perfect:

- **Tolerance bands shown visually.** If the contract tolerance is 0.5%, show a green zone (< 0.25%), amber zone (0.25-0.5%), and red zone (> 0.5%) as a background gradient behind the variance percentage. The user should see at a glance whether this reconciliation is routine or requires investigation.
- **Auto-approve queue.** All reconciliations within tolerance should flow into an auto-approve queue that a single senior analyst reviews and bulk-approves with one click. This is not cutting corners -- it is recognising that a 0.1% variance on a $45M invoice ($45K) is within measurement precision and does not warrant individual investigation.
- **Supporting document attachment.** The reconciliation page should have a document panel showing: outturn report, bill of lading, custody transfer survey, quality certificate, and counterparty invoice PDF. Each linked to the cargo record. Each with a status indicator (received / pending / discrepant).

### Pattern 4: Drill-Down as the Universal Interaction

Every aggregated number in the system should be drillable. Click a position cell and see the underlying trades. Click a P&L number and see the calculation breakdown. Click a credit utilisation percentage and see the contributing exposures. Click a cargo status and see the event history.

This creates a consistent mental model: if I see a number and want to understand it, I click it. The system always responds with decomposition. This is how Bloomberg works and it is the single most trust-building interaction pattern in financial software.

**Implementation specifics:**
- **Position ladder cells:** Click to see filtered trade list with volumes, prices, and WACOG contribution.
- **Blotter MTM values:** Click to see price breakdown (entry price, current price, volume, calculated MTM).
- **Dashboard KPIs:** Click to navigate to the relevant detail view (P&L clicks to P&L attribution, credit util clicks to counterparty breakdown).
- **Invoice totals:** Click to see line-item breakdown (volume x price, quality adjustment, demurrage, BOG deduction).

### Pattern 5: Cross-Entity Navigation That Creates a Workflow

In most ETRM systems, each entity lives on its own island. The trade blotter does not link to the cargo. The cargo does not link to the invoice. The invoice does not link to the reconciliation. The user must manually navigate between these views, carrying context in their head.

This is an accuracy risk. If I am reconciling an invoice and I need to check the bill of lading quantity, I should click the cargo reference in the reconciliation view and see the B/L data inline -- not open a new tab, search for the cargo, find the B/L, remember the number, and navigate back.

**The navigation graph should be:**

Trade <-> Cargo <-> Vessel <-> Voyage
Trade <-> Nomination
Cargo <-> Invoice (Provisional) <-> Invoice (Final) <-> Reconciliation
Trade <-> Position (aggregated)
Trade <-> Hedge (linked paper trade)
Cargo <-> Documents (B/L, Outturn, CTS, Quality Certificate)
Invoice <-> Payment
All entities -> Audit trail

Every reference to another entity should be a clickable link. Every detail panel should show related entities as a navigation bar. The user should be able to follow the workflow chain from trade booking through to final settlement without ever returning to a navigation menu.

### Pattern 6: Keyboard-First for Speed, Mouse-Confirmed for Safety

The tension between speed and accuracy is real. A keyboard-first interface (Tab between fields, Enter to submit, B/S hotkeys for direction) is measurably faster for experienced users. But speed creates fat-finger risk.

**The resolution:**

- **Data entry:** Keyboard-first. Tab through fields, type values, autocomplete with arrow keys. Speed matters here because a trader might enter 30 trades in a morning.
- **Confirmation:** Mouse-required. The confirmation step (the summary bar showing trade details and position impact) should require a mouse click or a deliberate Ctrl+Enter, not just Enter. This is a speed bump by design -- it forces a cognitive pause between "I am entering data" and "I am committing data."
- **High-consequence actions:** Keyboard-blocked. Cancelling a confirmed trade, approving an invoice over threshold, amending a contract price -- these should require mouse interaction, typed reason, and potentially a second user. No keyboard shortcut should trigger them.

This creates a graduated friction model: entry is fast, commitment is deliberate, high-stakes actions are slow. The friction matches the consequence.

---

## Part IV: What Would Make Me Say "This Is the Most Accurate System I Have Ever Used"

### For Traders

1. I have never accidentally entered the wrong volume because the system showed me how my trade compares to normal. The contextual validation caught every anomaly before I committed.

2. I trust the position ladder because I can drill into every cell and see the trades that compose it. No other system I have used makes this so effortless.

3. The WACOG updates in real time as I enter trades, and I can see my cost basis shifting before I commit. This has changed how I think about trade sizing.

4. The P&L attribution on my dashboard answers my first question every morning without me having to ask it: why did my P&L change overnight? The narrative AI briefing gives me context that no grid of numbers can provide.

5. I can enter a trade in 5 seconds but I cannot commit it without seeing its impact. The confirmation bar is not a nuisance -- it has saved me from at least three fat-finger errors this quarter.

### For Operations

1. The reconciliation queue lets me process all within-tolerance items in one click. What used to take my team half a day now takes twenty minutes.

2. The state machine on invoices means I cannot accidentally skip the approval step. When the auditors asked "how do you ensure every invoice over $10M is dual-approved?" I showed them the greyed-out button. That was the end of the conversation.

3. Every status change records who did it, when, and why. When I look at a cargo's history, I see its entire life story. I no longer need to ask colleagues "did you already handle this?"

4. The assignment system means I always know who is responsible for what. The workload dashboard shows me when someone is overloaded and needs help. My team has stopped using their personal tracking spreadsheets.

5. Supporting documents are attached to the entity they support. I can see the B/L, the outturn report, and the counterparty invoice from the reconciliation page without leaving it.

### For Risk Managers

1. The position limits are enforced in real time. Traders cannot breach them -- the system blocks the trade entry if it would cause a breach, and it shows them exactly why: "This trade would take JKM Jun position to +4.2M MMBtu, exceeding the +4.0M limit. Reduce volume to 3,250,000 or request limit increase."

2. Credit utilisation updates with every trade entry, not at end-of-day. I can see the current exposure to any counterparty at any moment, and the calculation is fully decomposable -- I can see every trade contributing to the exposure number.

3. The audit trail is comprehensive and immutable. When regulators ask "show me every trade that was amended in Q3 and the reason for each amendment," I run one query. In my previous system, this took the compliance team two weeks.

4. The system distinguishes between market-observed and calculated prices everywhere. I can see at a glance which forward curve months are based on actual market quotes and which are interpolated. This matters for VaR calculation and for explaining model risk to the board.

---

## Part V: The AI Layer as an Accuracy Multiplier

The most transformative aspect of Horizon's architecture is that AI is structural, not cosmetic. Claude's role is not to generate dashboards or answer chatbot questions. It is to reason about the trading book and surface insights that no grid of numbers can provide.

**How AI amplifies accuracy:**

### Anomaly Detection in Real Time

The AI agent should continuously monitor incoming data for anomalies that rule-based validation would miss. Not "this price is outside a range" (a simple threshold check) but "this JKM-TTF spread is 2.3 standard deviations wider than the 30-day rolling average, and the last time it widened this much was during the Asian cold snap in February 2024. Your unhedged JKM exposure in Q3 is $12M notional."

This is not a report. This is a real-time alert that combines statistical analysis with domain knowledge and historical context. No human analyst can maintain this level of continuous surveillance across all benchmarks, all positions, and all historical patterns simultaneously.

### Narrative Briefings That Explain "Why"

Numbers do not explain themselves. A position ladder shows me where I stand. An AI briefing explains why I should care.

"Your JKM Jun position is now +3.65M MMBtu, the largest single-month exposure since you joined. This was driven by yesterday's three Shell trades, which added 3.2M at an average premium of +$0.50. Current JKM Jun is $14.60, giving you unrealised P&L of +$1.12M. Note that this position is 91% of your Q2 limit. If JKM moves $0.50 against you, the MTM loss would be $1.63M. The TTF-JKM spread has been narrowing -- down $0.15 in the last week -- which could affect your inter-basin arb profitability."

This briefing takes what used to be 15 minutes of manual analysis and delivers it in 10 seconds. More importantly, it connects dots that a human might miss: the position size relative to limits, the correlation with spread movement, the scenario analysis of an adverse move.

### Reconciliation Assistance

When a reconciliation shows a variance outside tolerance, the AI should investigate before the human does. "Volume variance of -1,550 MMBtu (0.048%) is consistent with BOG deduction at 0.12%/day over 12.5 transit days. The counterparty's outturn report (attached) shows the same figure. Recommend approve." Or: "Price variance of -$0.03/MMBtu does not match any standard adjustment. The pricing period average from the contract's specified source (Platts JKM) for the March billing cycle is $14.25, not $14.22. The counterparty may have used a different averaging window. Flag for review."

This is not replacing the analyst's judgment. It is doing the research that the analyst would do anyway, in seconds instead of hours, and presenting the findings with its reasoning visible.

### What AI Must Not Do

AI must never change data without human confirmation. It can recommend, flag, analyse, and explain. It must not approve invoices, submit nominations, or enter trades. The human must remain in the loop for every state-changing action. AI is the analyst; the human is the decision-maker.

AI-generated analysis should always be clearly labelled as such, with a confidence indicator and the ability to see the inputs that informed the analysis. "Claude analysis (high confidence, based on: 180 days price history, 47 prior reconciliations for this counterparty, contract terms from SPA-SHELL-2024)." Transparency about the AI's reasoning is itself an accuracy feature -- it allows the human to judge whether the analysis is relevant and reliable.

---

## Part VI: The Technical Foundations of Trust

### Event Sourcing: The Accuracy Backbone

Every domain event -- trade created, price updated, status changed, position recalculated -- should be persisted as an immutable event. The current state of any entity should be derivable by replaying its events. This gives you:

- **Complete audit trail by design.** Every change is an event, every event has a timestamp and actor.
- **Point-in-time reconstruction.** Replay events up to timestamp T to see the system state at time T.
- **Debugging accuracy.** When a number looks wrong, you can replay the event stream and find exactly which event introduced the error.
- **Regulatory compliance.** EMIR Article 9 requires trade repositories to maintain a "golden source" of trade data. Event sourcing is the natural implementation.

Horizon's architecture already includes event sourcing. This is a structural advantage over Allegro and Endur, both of which use mutable database records and bolt on audit logging as an afterthought.

### Data Freshness as a First-Class Concept

Every piece of market data in the system should carry a timestamp, a source, and a freshness indicator. The UI should visually degrade stale data -- a price that has not been updated in 30 minutes should show a warning. A forward curve built from data that is 69 days old (as the current FRED-sourced JKM data is) should show a prominent staleness banner, not quietly present itself as current.

This is not about perfection -- real-time data is expensive and not always necessary. It is about honesty. The system should never silently present stale data as current. That is a form of inaccuracy that causes more damage than a wrong calculation, because it cannot be detected by the user without external verification.

### Idempotent Operations

Every API call that changes state should be idempotent. If the network glitches and the frontend retries a trade submission, the system should recognise the duplicate and not create two trades. This is implemented with request IDs (the frontend generates a UUID per submission, the backend deduplicates on it). It sounds like a backend concern, but the accuracy impact is felt in the frontend: users should never see duplicate records because of a network retry.

---

## Conclusion: Accuracy Is Not a Feature

Accuracy is not a feature you add to a trading system. It is a property that emerges from hundreds of small decisions: how you display units, how you structure confirmations, how you encode audit trails, how you enforce workflows, how you surface provenance, how you handle stale data, how you communicate uncertainty.

No system I have implemented has gotten all of these right. The ones that came closest -- Bloomberg for data display, Allegro for workflow enforcement, Endur for calculation depth -- each excelled at one dimension while failing at others.

What makes Horizon's approach promising is that accuracy is being designed in from the beginning, not bolted on after the first audit finding. The event-sourced domain model, the AI reasoning layer that can explain its conclusions, the reconciliation UX that makes variances visible -- these are architectural choices that make accuracy the default, not an optional mode.

The system I want to buy is one where I never have to ask "is this number right?" -- because the system has already shown me why it is right, or told me honestly that it is not sure.

That system does not exist yet. But for the first time in fifteen years, I believe it could.

---

*Author: Head of Trading Technology*
*Context: Vision document following Round 1-3 review of Horizon ETRM prototype*
*Intent: Define what "accuracy as the top priority" means in practice and how it should shape every design decision in the platform*
