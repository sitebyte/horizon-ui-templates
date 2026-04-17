# Vision: Accuracy-First Trading System Design

**Date:** 11 April 2026
**Author perspective:** Senior Energy Technology Analyst. 15+ ETRM evaluations. Bloomberg daily user. Demoed Allegro, Endur, ION, Molecule, Orchestrade.
**Scope:** What would make a genuinely intuitive, easy-to-use trading system where accuracy is the absolute top priority -- informed by what every incumbent gets right, what they all get wrong, and what nobody has built yet.

---

## Part 1: What the Best Systems Get Right About Accuracy

### Bloomberg: Why Traders Trust the Data

Bloomberg is the only system in energy trading where users do not question the numbers. That trust was not built through technology -- it was built through a set of design decisions that most ETRM vendors ignore.

**1. Single source of truth with visible provenance.** Every price on Bloomberg shows: the source (exchange, composite, derived), the timestamp (to the second), and the methodology (last trade, VWAP, mid). When a trader sees JKM $14.25 on Bloomberg, they know it is the ICE settlement from 16:00 London time, not an interpolated value or a stale cache. No ETRM shows this. Allegro shows a price with no source. Endur shows a price with a source code that requires a lookup table to interpret. Molecule shows a price. The absence of provenance metadata is why traders keep Bloomberg open alongside their ETRM -- they need to verify the ETRM's numbers against Bloomberg's.

**2. Real-time staleness indicators.** Bloomberg greys out stale quotes. If a price has not updated in the expected interval, the display changes visually. The user never has to wonder "is this current?" In every ETRM I have evaluated, prices are shown in the same font, same color, same weight whether they are 5 seconds old or 5 days old. This is a design failure that causes real trading losses. A trader acting on a stale JKM price can be wrong by $2-3/MMBtu on a volatile day -- that is $200,000+ per cargo.

**3. Cross-referencing is instant.** In Bloomberg, DES (Description) on any security links to its related instruments, curves, news, fundamentals, and analytics. The entire data model is hyperlinked. Every ETRM I have evaluated is a collection of siloed screens. Trade blotter and position ladder use the same trade IDs but are not linked. The invoice references a cargo but there is no click-through. The reconciliation compares two numbers but does not link to the survey report or the B/L that generated them. This disconnection is not just a UX problem -- it is an accuracy problem. When you cannot trace a number to its origin in two clicks, you cannot verify it. When you cannot verify it, you do not trust it. When you do not trust it, you maintain a parallel spreadsheet. And the spreadsheet becomes the system of record, which defeats the entire purpose of the ETRM.

**4. Consistent units and precision.** Bloomberg enforces unit consistency at the platform level. Energy prices are in $/MMBtu to 4 decimal places. Volumes are in the contract-standard unit. You cannot configure your way into unit ambiguity. This sounds trivial. It is not. I have seen Allegro implementations where JKM is in $/MMBtu on the curve screen and in $/GJ on the trade blotter because two different teams configured the displays. The trader did not notice. The P&L was wrong for three weeks.

### Allegro: Where Users Make Errors

Allegro is the dominant mid-tier ETRM in energy. It is also where I have seen the most data entry errors, and the causes are instructive.

**1. Too many required fields create "just fill it in" behavior.** Allegro's deal entry form has 30+ fields. When a trader needs to book a deal quickly, they fill in the fields they care about (counterparty, price, volume) and accept defaults for the rest. The defaults are often wrong. I have seen an entire portfolio of trades booked with the wrong cost center because the default was set during implementation and never updated. The lesson: if you require 30 fields, 15 of them will be wrong. If you require 6 fields and derive the other 24 intelligently, accuracy goes up.

**2. Flexible pricing structures with no validation.** Allegro supports complex pricing formulae. It also lets you enter a formula that is mathematically valid but commercially nonsensical -- for example, a JKM-indexed price with a slope of 14.5% (correct for Brent-linked deals but wrong for hub-indexed, where the slope should be 1.0). There is no domain-aware validation. The formula compiles, the trade books, and nobody notices until the monthly P&L reconciliation reveals a $3M discrepancy. The lesson: syntactic validation (is the formula valid?) is not enough. Semantic validation (does this formula make commercial sense for this type of deal?) is what prevents errors.

**3. Configuration creates inconsistency.** Allegro is highly configurable. This means every implementation is different. The same trade type might have different status workflows, different mandatory fields, different pricing structures at different companies. This makes it impossible to build universal validation rules. The system validates against the configuration, not against the domain. If the configuration is wrong, the validation is wrong, and the errors are systematic rather than random -- which makes them much harder to detect.

**4. The amendment audit trail is technically correct but unusable.** Allegro records every field change with a timestamp and user ID. But the audit trail is a flat table with hundreds of entries per trade, most of which are system-generated status changes that obscure the meaningful commercial amendments. Finding "who changed the price on this deal?" requires scrolling through 40 entries of status transitions, workflow assignments, and system recalculations. The lesson: an audit trail that records everything but surfaces nothing is worse than useless -- it creates a false sense of security.

### Endur: How Too Much Flexibility Reduces Accuracy

Endur (OpenLink, now ION) is the most powerful ETRM on the market and also the most dangerous.

**1. Every field is overridable.** Endur allows manual override of calculated values -- MTM, Greeks, settlement amounts, even curve data. This was designed for edge cases (illiquid markets where the model is wrong) but in practice it means that any number in the system might be the calculated value or a manual override, and there is no visual distinction. I have audited Endur implementations where 15% of MTM values were manual overrides, some dating back years, applied by people who had left the company. Nobody knew which positions were model-valued and which were stale manual inputs. The lesson: overrides are necessary. But every override must be visually flagged, time-limited (expires after N days unless re-confirmed), and included in a daily exception report.

**2. Custom Finder queries create personal truths.** Endur's reporting is based on user-created queries ("Finders"). Each trader builds their own position view, their own P&L report, their own blotter filter. This means five traders looking at "their" JKM position can get five different numbers depending on which filters they included, which books they selected, and which date range they specified. There is no canonical "our JKM position is X" unless a report is centrally defined and locked. The lesson: allow personalized views, but always show a single authoritative number alongside them. "Your filtered view shows +2.4M. Desk total: +4.8M."

**3. Complexity breeds workarounds.** Endur's trade capture is so complex that many trading desks maintain a "quick booking" spreadsheet where trades are captured first, then entered into Endur by a junior operations person at end of day. This introduces a 4-8 hour lag between execution and system entry, during which positions are invisible, limits are unchecked, and dual-entry errors accumulate. The lesson: if the system is harder to use than a spreadsheet, the spreadsheet wins, and you lose all the control benefits the system was supposed to provide.

### Molecule: Where Simplicity Compromises Accuracy

Molecule is the "modern, easy" ETRM. It is a cautionary tale about trading depth for simplicity.

**1. Generic data model misses commodity-specific validation.** Molecule supports "commodities" generically. It does not know that LNG has boil-off gas, that oil-indexed pricing uses a 3-month average of Brent, or that a DES delivery means the seller bears shipping risk. Because the data model is generic, the validation is generic. You can enter a trade that is structurally invalid for LNG (no delivery tolerance, no quality specs, no vessel assignment) and the system accepts it because those fields do not exist. The lesson: domain-specific accuracy requires domain-specific data models. A generic platform will always sacrifice the validation layer that prevents commodity-specific errors.

**2. Beautiful charts with no calculation transparency.** Molecule's P&L charts are visually excellent. They are also black boxes. There is no way to drill from a P&L number to the underlying calculation -- which trades contributed, which curves were used, what methodology was applied. "Your P&L is +$1.2M" tells you what but not why. If the number is wrong, you have no way to diagnose it within the system. The lesson: every calculated number must be decomposable. Click the P&L, see the components. Click a component, see the trades. Click a trade, see the curve point used for valuation. This decomposition chain is what Bloomberg gets right and what every "simple" ETRM gets wrong.

**3. Minimal workflow enforcement feels easy until something goes wrong.** Molecule does not enforce a trade lifecycle state machine. A trade can go from Draft to Settled in one click. This feels fast and flexible. It also means there is no systematic check that a trade has been confirmed by the counterparty, verified by middle office, approved by risk, and allocated to a cargo before settlement proceeds. When a settlement error occurs (and in LNG, with $40M+ invoices, they always do), there is no audit trail showing which control steps were skipped. The lesson: workflow friction is accuracy infrastructure. Every step that feels like overhead is actually a checkpoint that prevents an error from propagating downstream.

---

## Part 2: What Every ETRM Gets Wrong

These are the accuracy failures that are universal across every system I have evaluated -- Bloomberg included, where applicable. They represent genuine market gaps.

### 1. No Real-Time Validation During Entry

Every ETRM validates after submission. None validates during entry.

When a trader types a price of $14.25 for a JKM July cargo, the system should instantly show: "JKM Jul last: $14.60. Your price is $0.35 below market (-2.4%). This is within normal discount range for [counterparty]." If the trader types $41.25 (a transposition error), the system should flag: "This price is $26.65 above market (+182%). Likely entry error."

This does not exist in any ETRM. Not Allegro. Not Endur. Not ION. Not Bloomberg TOMS. The reason is architectural: validation rules are defined declaratively (min/max ranges, required fields) and applied at submission time. Real-time price-aware validation requires a live connection between the entry form and the market data layer, which means the form needs to know which benchmark applies before the trade type is fully specified. Most ETRM architectures cannot do this because the pricing context is determined by the complete trade record, not by individual fields.

Horizon's architecture can do this. The trade form already has a position impact preview that reacts to form inputs. Extending this to include price validation against live market data is a natural evolution that would be genuinely unique.

### 2. No Cross-System Consistency Checking

When a trading company uses Bloomberg for market data, an ETRM for trade management, a vessel tracking system for logistics, and a treasury system for payments, there is no automated check that these systems agree.

Example: Bloomberg shows JKM July at $14.60. The ETRM's forward curve has JKM July at $14.45 (yesterday's close, not yet updated). The trader books a trade at $14.50, thinking they are getting a $0.05 discount to market. They are actually paying a $0.10 premium. The ETRM shows a positive MTM because its curve is stale. The real P&L is negative.

This happens constantly. Every trading desk I have visited has at least one price discrepancy between systems at any given time. The cost is invisible until month-end reconciliation, when the "P&L explain" meeting reveals that $500K of the desk's apparent profit was phantom P&L from stale curves.

No ETRM detects this. An AI-powered system could: compare the ETRM's curve against an independent source (Bloomberg, ICE, CME) every time a trade is booked, and flag discrepancies above a threshold. "Warning: your JKM July curve ($14.45) is 15bp below ICE settlement ($14.60). Last curve update: 16 hours ago. Recommend curve refresh before booking."

### 3. No Semantic Duplicate Detection

Every ETRM has syntactic duplicate detection: if you submit two identical trades (same counterparty, same volume, same price, same date), the system warns you. But real duplicates are semantic, not syntactic.

A trader calls Shell and agrees to buy 65,000 MT DES Japan at JKM + $0.50 for July delivery. They enter the trade. An hour later, the middle office enters the same trade from the broker confirmation, but with the volume in MMBtu (3,200,000) instead of MT, and the delivery month as "Jul-26" instead of "2026-07". The counterparty is "Shell Western LNG" instead of "Shell." The ETRM sees these as two completely different trades.

Semantic duplicate detection requires understanding that 65,000 MT approximately equals 3,200,000 MMBtu, that "Jul-26" and "2026-07" are the same month, and that "Shell" and "Shell Western LNG" are the same counterparty. No current ETRM does this. An AI system could -- and it would eliminate one of the most common and expensive error types in trading.

### 4. No Contextual Reasonableness Checking

When a trader enters a trade, the system checks hard constraints (is the field populated, is the number positive, is the counterparty valid). No system checks soft constraints (is this trade reasonable given everything we know).

Examples of contextual checks that no ETRM performs:
- "You are buying JKM July, but you are already +5M MMBtu long JKM July. This will increase your exposure to +8.2M MMBtu. Your typical maximum for any single month/benchmark is 6M MMBtu."
- "You are trading with Counterparty X at JKM + $0.50. Your last three trades with Counterparty X were at JKM + $0.35 to +$0.40. This premium is unusually high."
- "You are booking a DES Japan delivery for July, but vessel tracking shows no available vessels with compatible specifications arriving in the region before mid-August."
- "This trade exceeds the desk head's authority limit. Trades above $50M require VP approval."

These are the checks that an experienced desk head performs mentally. They are pattern-based, context-dependent, and require cross-referencing multiple data domains (positions, historical trades, vessel tracking, authority matrices). No rule-based validation engine can express them. An AI reasoning layer can.

### 5. No Settlement Accuracy Prediction

The most expensive accuracy failures in LNG trading are not in trade entry -- they are in settlement. A $40M invoice that is wrong by 2% is an $800K error. Settlement errors arise from:

- Quantity discrepancy between B/L and outturn (measurement uncertainty)
- Quality adjustment miscalculation (GCV difference applied incorrectly)
- Pricing period error (wrong averaging dates for oil-indexed deals)
- Demurrage miscalculation (laytime start disputed, weather exclusions missed)
- BOG allowance dispute (actual boil-off vs contractual allowance)

Every one of these is detectable before the invoice is issued if the system has the right data and can reason about it. No ETRM does pre-settlement accuracy checking. The process is: generate invoice, send to counterparty, receive dispute, investigate, issue credit note, repeat.

An AI system could review a draft invoice against all available data -- the B/L, the outturn report, the custody transfer survey, the vessel noon reports, the contractual terms -- and flag potential discrepancies before the invoice is issued. "Draft invoice uses B/L quantity (65,234 MT) but outturn report shows 64,890 MT. Recommend using outturn quantity for final invoice. Estimated credit note if B/L quantity is used: $218,000."

### 6. No Temporal Accuracy Awareness

Every number in a trading system has a time dimension that is almost never displayed or managed.

- A forward curve point was last updated at 16:00 yesterday. It is now 10:00. During those 18 hours, the market may have moved significantly.
- A position was last recalculated after the last trade was booked at 14:30. Since then, three new trades have been booked by other traders on the same desk but the position view has not refreshed.
- A credit exposure was calculated using yesterday's market prices. Today's price move has increased the exposure by 15% but the credit check still shows green.

No ETRM systematically tracks and displays the "freshness" of calculated values. Bloomberg does this for prices (stale quotes are visually distinguished) but not for derived values. The result is that traders routinely make decisions based on numbers that are hours or days out of date, without knowing it.

An accuracy-first system would timestamp every displayed value and visually degrade it as it ages. A position calculated 5 minutes ago gets full opacity. One calculated 2 hours ago gets slightly muted text. One calculated yesterday gets an explicit "Stale -- recalculating..." indicator. This is simple to implement and would be transformative for decision-making accuracy.

---

## Part 3: The System Nobody Has Built

### The Accuracy Architecture

An accuracy-first trading system would be built around a fundamentally different principle than every existing ETRM: **the system should make it harder to be wrong than to be right.**

Current ETRMs make it easy to enter data and hard to verify it. The ratio should be inverted. Entering a trade should take 10 seconds. The system should spend the next 2 seconds automatically verifying it against every data source it has access to. The trader should never have to manually check their own work -- the system should do it for them, continuously, in real time.

This is not about adding more validation rules. It is about building a system where accuracy is a structural property, not a procedural requirement.

### Feature 1: The Accuracy Layer (No ETRM Has This)

Every displayed value gets an accuracy metadata envelope:

```
{
  "value": 14.60,
  "unit": "$/MMBtu",
  "source": "ICE JKM Futures M1",
  "timestamp": "2026-04-11T16:00:00Z",
  "freshness": "2h 14m",
  "confidence": "high",
  "methodology": "settlement_price",
  "independent_verification": {
    "source": "Bloomberg LNG1 Comdty",
    "value": 14.58,
    "delta": 0.02,
    "status": "consistent"
  }
}
```

The UI shows: **$14.60** with a small green indicator (verified against Bloomberg, consistent). If the independent verification shows a discrepancy > threshold, the indicator turns amber. If the data is stale, the indicator pulses. If no independent source is available, the indicator shows grey with "unverified."

This metadata layer does not exist in any ETRM. It would transform how traders interact with data -- from implicit trust (or implicit distrust, which is worse) to informed confidence.

### Feature 2: AI Anomaly Detection on Every Entry (No ETRM Has This)

When a trade is submitted, before it is committed, an AI agent reviews it in context:

```
Trade submitted: BUY 65,000 MT JKM+$0.50 Jul-26 from JERA (DES Japan)

AI review (200ms):
- Price check: JKM Jul $14.60, effective price $15.10. Within normal range. OK.
- Volume check: Standard cargo size. OK.
- Position impact: JKM Jul goes from +2.4M to +5.6M MMBtu. ABOVE 90th percentile 
  of historical position for this month. WARNING: Consider hedge requirement.
- Counterparty check: JERA credit limit $200M, current exposure $142M, 
  this trade adds ~$48M. Post-trade exposure $190M (95% utilization). 
  WARNING: Approaching limit.
- Duplicate check: No similar trade in last 24h. OK.
- Historical premium check: Last 5 JERA JKM trades averaged +$0.38. 
  This is +$0.50. INFO: Premium is 32% above recent average.
- Delivery feasibility: 3 vessels available with compatible specs and 
  July arrival. OK.
- Result: 1 WARNING (position concentration), 1 WARNING (credit limit),
  1 INFO (premium above average). Proceed? [Confirm] [Review Warnings]
```

This is 200 milliseconds of AI processing that would catch errors that currently survive through trade capture, booking, confirmation, and position management -- sometimes for weeks. The cost is roughly $0.002 per trade at Sonnet pricing. For a desk doing 30 trades per day, that is $0.06/day to prevent errors that can cost hundreds of thousands.

No ETRM has anything like this. Allegro has rule-based validation that checks hard limits. Endur has compliance checks that run post-booking. ION has workflow controls. None of them can reason contextually about whether a trade "makes sense" given the full state of the portfolio, the market, and historical patterns.

### Feature 3: Continuous Position Integrity Monitoring (No ETRM Has This)

Current position management is snapshot-based. A position is calculated when requested and assumed correct until the next calculation. Between calculations, trades can be booked, amended, or cancelled without the position updating. Credit limits can be breached between checks.

An accuracy-first system would continuously monitor position integrity:

```
POSITION INTEGRITY MONITOR (runs every 60 seconds)

CHECK 1: Trade count reconciliation
  Blotter shows 247 active trades. Position calculation includes 247 trades. MATCH.

CHECK 2: Volume reconciliation  
  Sum of all active trade volumes by benchmark/month matches position ladder. MATCH.

CHECK 3: Curve consistency
  Position MTM calculated using JKM curve updated 14:32. Current JKM curve 
  updated 14:47. STALE: Position MTM is 15 minutes behind. 
  Estimated impact of curve update: +$180K.
  Action: Auto-refresh queued.

CHECK 4: Credit exposure reconciliation
  Sum of counterparty exposures ($847M) matches total position exposure ($847M). MATCH.
  
CHECK 5: Hedge ratio integrity
  Physical long: +12.4M MMBtu. Paper short: -10.1M MMBtu. 
  Hedge ratio: 81.5%. Within policy (>75%). OK.
  Note: 3 hedge positions expire in 14 days. Post-expiry hedge ratio: 67.2%. 
  WARNING: Will breach policy minimum on 25 April.

STATUS: 4/5 checks pass. 1 stale data flag (auto-resolving). 
1 forward-looking warning (hedge expiry).
```

This is the kind of monitoring that risk managers currently do manually at end-of-day. Running it continuously, with AI interpretation of the results, would catch errors in real time rather than at the next risk meeting.

### Feature 4: Settlement Pre-Flight Check (No ETRM Has This)

Before an invoice is generated, an AI agent reviews all available data for consistency:

```
PRE-FLIGHT CHECK: Cargo LNG-2026-0042 (Shell DES Japan)

Document completeness:
  [x] Bill of Lading: BL-2026-0042 (65,234 MT)
  [x] Outturn Report: OUT-2026-0042 (64,890 MT)
  [x] Custody Transfer Survey: CTS-2026-0042 (Load: 65,201 MT, Discharge: 64,893 MT)
  [ ] Quality Certificate: MISSING -- cannot verify GCV adjustment
  [x] Noon Reports: 14 of 15 received (Day 8 missing)

Quantity reconciliation:
  B/L: 65,234 MT
  CTS Load: 65,201 MT (delta: -33 MT, 0.05% -- within tolerance)
  CTS Discharge: 64,893 MT
  Outturn: 64,890 MT (delta from CTS: -3 MT, 0.005% -- within tolerance)
  BOG: 341 MT (0.52% of loaded -- within contractual 0.6% allowance)
  RECOMMENDATION: Invoice on outturn quantity (64,890 MT)

Pricing check:
  Contract: JKM + $0.50 (3-month Brent average)
  Pricing period: Feb-Mar-Apr 2026
  Calculated 3M Brent average: $82.47/bbl
  Derived LNG price: $14.44/MMBtu (using slope 14.5%, constant $2.50)
  Cross-check vs market: JKM spot $14.60 on delivery date. 
  Oil-indexed price is $0.16 below spot. CONSISTENT with expected discount 
  for term contract vs spot.

Demurrage check:
  NOR tendered: 2026-03-14 06:00 UTC
  Laytime allowed: 36 hours SHINC
  Laytime used: 34 hours 20 minutes
  Despatch due: 1h 40m at $25,000/day = $1,736 despatch to charterer
  No demurrage claim applicable.

RESULT: 1 missing document (quality certificate). 
Recommend: Request quality certificate before issuing final invoice.
All quantities within tolerance. Pricing verified. No demurrage.
```

This single feature would save a settlement team dozens of hours per month and eliminate the most common category of credit note issuance: invoices sent with errors that were detectable from data already in the system.

### Feature 5: The Accuracy Dashboard (No ETRM Has This)

A single view that answers: "How accurate is our data right now?"

```
SYSTEM ACCURACY STATUS

Market Data Freshness:
  JKM spot: 14 minutes old (green)
  JKM futures curve: 2.3 hours old (amber -- market is open)
  TTF spot: 8 minutes old (green)
  TTF futures curve: 2.1 hours old (amber)
  Brent: 3 minutes old (green)
  AIS vessel positions: 6 minutes old (green)

Position Accuracy:
  Last full recalculation: 12 minutes ago
  Trades booked since: 2 (estimated impact: +$340K MTM)
  Credit exposures: current (recalculated 4 minutes ago)
  Hedge ratio: current

Data Consistency:
  Internal curve vs ICE settlement: JKM 0bp delta, TTF +2bp delta (green)
  Internal curve vs Bloomberg: JKM -1bp, TTF +1bp (green)
  Trade count: blotter (247) = positions (247) = risk (247) MATCH

Settlement Accuracy:
  Open invoices: 14
  With complete documentation: 11
  Missing documents: 3 (quality certs for LNG-042, LNG-045, LNG-047)
  Auto-reconcilable (within tolerance): 9 of 11
  Requiring manual review: 2

Outstanding Exceptions:
  1 manual MTM override on trade T-2026-0189 (applied 6 days ago by JC)
  1 counterparty name mismatch (blotter: "Shell", invoice: "Shell Western LNG")
  1 unit discrepancy (trade booked in MT, position shows MMBtu -- conversion applied)
```

No system displays its own accuracy status. Every ETRM assumes its data is correct and leaves it to users to discover errors. An accuracy dashboard inverts this: the system continuously reports on its own data quality and surfaces issues before they cause problems.

---

## Part 4: AI for Accuracy -- Beyond Traditional Validation

### What AI Can Do That Rules Cannot

Traditional validation is boolean: a field is either valid or invalid, a trade either passes or fails. The real world is not boolean. A trade can be technically valid but contextually suspicious. A price can be within range but anomalous for this counterparty, this time of day, this market condition.

AI-powered accuracy operates in three modes that no rule engine can replicate:

**1. Pattern recognition across time.** "This trader's average trade size has been 65,000 MT for 18 months. This trade is 650,000 MT. Probable data entry error." A rule engine can set a hard cap, but it cannot learn individual patterns and adapt thresholds dynamically.

**2. Cross-domain reasoning.** "This DES Japan cargo for July delivery is priced at JKM + $0.50, but three vessels that could deliver to Japan in July are currently committed to Atlantic cargoes. Shipping cost for the only available Pacific vessel would be $0.30/MMBtu higher than budgeted, reducing the margin to $0.20." This requires correlating trade data, vessel positions, route distances, and charter rates -- four different data domains that no ETRM's validation engine touches simultaneously.

**3. Probabilistic assessment.** "Based on the last 200 trades with this counterparty, the settlement discrepancy is typically $50K-$150K. This draft invoice has a discrepancy of $800K. The probability that this is correct is <2%. Recommend review before issuance." Rule-based validation can flag values outside a range. AI can assess probability given historical context and recommend actions proportional to the risk.

### The AI Accuracy Agent Architecture

```
TRADE ENTRY
  |
  v
[Pre-commit AI Review] --- 200ms
  |  Checks: price vs market, volume reasonableness, 
  |  duplicate detection, position impact, credit impact,
  |  historical pattern match, delivery feasibility
  |
  v
[Human Decision: Confirm / Review / Cancel]
  |
  v
TRADE BOOKED
  |
  v
[Continuous Position Monitor] --- every 60s
  |  Checks: trade count, volume reconciliation,
  |  curve freshness, credit reconciliation,
  |  hedge ratio integrity, limit compliance
  |
  v
[Settlement Pre-flight] --- before invoice generation
  |  Checks: document completeness, quantity chain,
  |  pricing period, quality adjustment, demurrage,
  |  BOG allowance
  |
  v
INVOICE ISSUED
  |
  v
[Post-Settlement Audit] --- after payment
  |  Checks: credit note frequency by counterparty,
  |  systematic errors, process improvement suggestions
```

Each layer catches errors that the previous layer missed. The pre-commit review catches data entry errors. The continuous monitor catches consistency drift. The settlement pre-flight catches calculation errors. The post-settlement audit catches systematic process failures.

Total AI cost for a typical trading desk (30 trades/day, 200 invoices/month): approximately $5-10/day. For reference, a single cargo settlement error typically costs $50,000-$500,000 to resolve through the credit note process.

---

## Part 5: What a Trading Company Would Pay Premium For

### The ROI of Accuracy

I have been involved in ETRM procurement decisions ranging from $500K to $5M. In every case, the evaluation committee asks the same question: "What does this system prevent?" Not "what does it do" -- "what does it prevent?"

The honest answer for every incumbent ETRM is: "It prevents some manual tracking errors by centralizing data." That is a weak value proposition.

An accuracy-first system has a much stronger answer:

**1. Prevented fat-finger errors.** A single volume transposition (650,000 MT instead of 65,000 MT) on a $14/MMBtu trade is a $186M phantom position. If it survives for 24 hours before detection, the position limit breach alone triggers regulatory reporting. If it survives until settlement, the credit note process costs $200K+ in legal and operations time. Prevention value: $500K-$2M per incident avoided, with most desks experiencing 2-3 material incidents per year.

**2. Prevented stale data decisions.** A trader acting on a JKM price that is 4 hours old during a volatile session can be wrong by $1-2/MMBtu. On a 3.2M MMBtu cargo, that is $3.2M-$6.4M of unexpected P&L. Visual staleness indicators and automatic curve refresh prevent this. Prevention value: $1M-$5M per year for an active desk.

**3. Prevented settlement errors.** The average LNG cargo settlement involves a quantity discrepancy of 0.1-0.5%, a quality adjustment, and occasionally demurrage. Getting any of these wrong results in a credit note, which costs approximately $15,000-$25,000 in operations time (investigation, recalculation, re-issuance, counterparty negotiation, accounting adjustment). With 200 invoices per month, even a 5% error rate is 10 credit notes per month, or $150K-$250K per year in rework cost alone -- before counting the actual financial impact of the errors. Prevention value: $200K-$500K per year.

**4. Prevented P&L misstatement.** Phantom P&L from stale curves, incorrect MTM overrides, or miscalculated positions is the most insidious accuracy failure. It does not cause an immediate visible error -- it causes the desk to believe it is making more (or less) money than it actually is. This affects trading decisions, bonus calculations, risk appetite, and management reporting. When corrected (typically at month-end), the "P&L explain" reveals the gap, which erodes confidence in the system and management trust in the desk. Prevention value: difficult to quantify, but I have seen desks lose their P&L authority (requiring risk sign-off on every trade) after a single material misstatement that could have been detected by continuous position integrity monitoring.

### What Companies Would Pay

Based on my experience with ETRM procurement:

- **A system that demonstrably reduces settlement errors by 50%:** $200K-$400K additional annual license value. Every CFO understands this ROI.
- **A system that catches fat-finger errors before booking:** $100K-$300K additional annual license value. Risk committees understand this.
- **A system that provides continuous position accuracy monitoring:** $150K-$300K additional annual license value. CROs would mandate it.
- **A system that does AI pre-settlement review:** $100K-$200K additional annual license value. Operations heads would champion it.
- **An accuracy dashboard that shows system-wide data quality:** $50K-$100K additional annual license value. Audit committees would require it.

Total addressable premium for accuracy features: $600K-$1.3M per year above baseline ETRM licensing. This is significant -- baseline ETRM licenses for mid-tier LNG desks run $500K-$1.5M annually.

---

## Part 6: How This Applies to Horizon

### Current State

Horizon already has several accuracy-relevant foundations:

1. **Position impact preview on trade entry** -- the only ETRM I have evaluated with real-time position visualization during trade capture. This is the seed of the accuracy layer.
2. **AI agent architecture** -- the seven-agent framework (Market Context, Portfolio Analyst, Scenario Engine, Cargo Tracker, etc.) provides the infrastructure for AI-powered accuracy checking.
3. **Real data commitment** -- the CLAUDE.md principle "NEVER mock data" is fundamentally an accuracy principle. A system that is honest about what it can and cannot see is more trustworthy than one that fills gaps with plausible-looking fake data.
4. **Event-sourced domain model** -- domain events provide the audit trail infrastructure that accuracy features require.
5. **Reconciliation side-by-side view** -- already the best reconciliation UX I have seen in any ETRM. The tolerance-based auto-approval concept is an accuracy feature.
6. **Forward curve visualization** -- with provenance metadata (source, freshness), this becomes the foundation of the accuracy layer.

### Recommended Accuracy Roadmap for Horizon

**Phase 1: Foundation (Weeks 1-2)**
- Add provenance metadata to all displayed prices (source, timestamp, freshness indicator)
- Add visual staleness indicators (green/amber/red based on age relative to expected update frequency)
- Add unit labels to every numeric display (resolving the existing unit inconsistency issues flagged in Round 1)
- Implement the trade confirmation step with the position impact summary (already specified in Round 3 Fix Spec)

**Phase 2: AI Accuracy Layer (Weeks 3-4)**
- Build the pre-commit trade review agent (extend the existing agent architecture)
- Add price reasonableness checking against live market data during trade entry
- Add semantic duplicate detection using the AI agent (counterparty name matching, unit conversion, date normalization)
- Add historical pattern comparison (this trader's typical trade size, this counterparty's typical premium)

**Phase 3: Continuous Monitoring (Weeks 5-6)**
- Build the position integrity monitor (trade count reconciliation, curve freshness, credit reconciliation)
- Add the accuracy dashboard showing system-wide data quality status
- Implement automated curve refresh when staleness exceeds threshold
- Add forward-looking warnings (hedge expiry, limit approach, document deadlines)

**Phase 4: Settlement Accuracy (Weeks 7-8)**
- Build the settlement pre-flight check agent
- Add document completeness tracking per cargo
- Implement quantity chain reconciliation (B/L vs CTS vs outturn with tolerance checking)
- Add pricing period verification for oil-indexed deals

### The Competitive Position

No ETRM vendor is building an accuracy layer. Allegro is adding AI for "trade analytics." Endur is adding "smart alerts." ION is adding "intelligent workflows." Molecule is adding "AI-powered insights." None of them are building what I have described here -- a system that continuously monitors and reports on its own accuracy, that catches errors before they are committed, and that uses AI to reason about whether data "makes sense" in context.

This is Horizon's structural advantage. The AI agent architecture, the real data commitment, the event-sourced domain model, and the position impact preview are not just features -- they are the foundation of an accuracy layer that incumbents cannot retrofit without rebuilding their core architecture.

The question is not whether this is valuable. It is whether Horizon can execute it before the incumbents figure out that they should be building it too. Based on the typical 18-24 month development cycle at Allegro and the 24-36 month cycle at ION, there is a window of 18-24 months where this accuracy layer could be a genuine market differentiator.

Build it. It is the feature that no trading company has ever seen, that every trading company needs, and that only an AI-first architecture can deliver.
