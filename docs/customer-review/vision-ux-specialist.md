# UX Vision: An Accuracy-First Trading System

**Author:** Principal UX Designer perspective
**Date:** 2026-04-11
**Premise:** In a trading system, every pixel is a decision input. A misread number, an ambiguous status, a stale price, a misclicked button -- each one has a dollar cost. The job of design is to make the accurate path the easiest path.

---

## Part 1: The Accuracy Stack

Accuracy in a trading UI is not one thing. It is a stack of five layers, each dependent on the one below:

```
5. CONFIDENCE   "I trust what I see"         (data freshness, source attribution)
4. VERIFICATION "I can check before I act"   (preview, confirmation, undo)
3. LEGIBILITY   "I can read this correctly"  (typography, alignment, color)
2. ORIENTATION  "I know where I am"          (navigation, context, focus)
1. STRUCTURE    "The system won't let me do  (constraints, validation, state machines)
                 the wrong thing"
```

Most trading UIs invest in layer 3 (legibility) and ignore layers 1 and 5. Horizon should build all five. Here is how.

---

## Part 2: Layer 1 -- Structure (Error Prevention Through Constraints)

The cheapest error to fix is the one that cannot happen.

### 2.1 State Machine Enforcement on Every Lifecycle Entity

Every entity in Horizon (trade, nomination, invoice, cargo) has a lifecycle. The UI must enforce that lifecycle visually and functionally.

**Pattern: Disabled-with-Reason**

Do not just grey out invalid actions. Show *why* they are invalid.

```
Current state: DRAFT

[ Submit for Approval ]     active, blue
[ Confirm ]                 disabled, with tooltip:
                            "Cannot confirm directly.
                             Must be approved first."
[ Cancel ]                  active, muted
```

Implementation: Every action button checks the entity's current state against a transition map. Invalid transitions render as disabled buttons with a help tooltip explaining the precondition. This is not just UX -- it is a visual representation of the domain model's state machine.

**Where this matters in Horizon today:** The TradeForm component (`frontend/src/components/contracts/TradeForm.tsx`) submits directly with no intermediate states. The SettlementView invoice table allows any status to be set via a dropdown with no transition rules. Both need state machine guards.

### 2.2 Input Constraints That Encode Domain Knowledge

Every input field should know its domain boundaries.

| Field | Constraint | Rationale |
|-------|-----------|-----------|
| Volume (MT) | Min: 1,000. Max: 200,000. Step: 1,000. | No LNG cargo is < 1,000 MT or > 200,000 MT. The step prevents odd lots. |
| Volume (MMBtu) | Min: 50,000. Max: 10,000,000. Step: 10,000. | Same logic, different unit. |
| Tolerance (%) | Min: 0. Max: 15. Step: 0.5. | Industry standard range. |
| Price ($/MMBtu) | Min: 0.01. Max: 100.00. Step: 0.01. | No negative prices. $100 is a sanity ceiling. |
| Slope (% of Brent) | Min: 5.0. Max: 25.0. Step: 0.1. | Historical range for LNG oil-indexed contracts. |
| Laycan window | Start must be >= today + 5 days. End must be >= Start + 3 days. End must be <= Start + 15 days. | Minimum lead time. Minimum/maximum window width. |

**Current gap:** The Horizon TradeForm accepts any numeric value in every field. A volume of -500 or a price of 999999 would be submitted without question. The `<input type="number">` elements have no `min`, `max`, or `step` constraints (except tolerance, which has min=0, max=20).

**Pattern: Range Slider with Numeric Input**

For constrained numeric fields (tolerance, slope), replace the plain `<input>` with a dual control: a range slider for quick setting and an inline numeric input for precision. The slider makes the valid range physically visible. The numeric input allows exact values. Neither can exceed the constraints.

```
Tolerance
[=====|==============] 5%
       ^ draggable      [  5.0  ]%
                         ^ typeable, validated on blur
```

### 2.3 Cascading Field Dependencies

When one field's value constrains another, the constraint should be immediate and visible.

**Pattern: Conditional Field Revelation**

The current TradeForm already does this partially -- selecting "Oil Indexed" reveals slope/constant fields, "Hub Indexed" reveals benchmark/premium. Extend this principle everywhere:

- Selecting **FOB** delivery terms: Load port becomes required, discharge port becomes optional (buyer arranges shipping). Show a note: "FOB -- buyer arranges vessel."
- Selecting **DES** delivery terms: Both ports required. Show: "DES -- seller delivers to discharge port."
- Selecting a **contract**: Pre-fill counterparty, pricing basis, delivery terms, and port from the contract. Show which fields are inherited (with a small chain-link icon) vs. overridable.
- Selecting a **benchmark**: Show that benchmark's current price inline. If the benchmark has no current price data, show a warning: "JKM Jun-26: No current price available. Premium cannot be validated."

### 2.4 Cross-Field Validation with Real-Time Feedback

Fields do not exist in isolation. The combination of values must be valid.

**Examples:**
- Volume x Price = notional value. If notional > credit limit for the counterparty, show an inline warning *before* submission: "Notional $45.8M exceeds Shell credit limit ($40M). Requires credit committee approval."
- Laycan start < curve expiry. If the delivery month is earlier than the earliest available forward curve point, warn: "Delivery Jun-26 has no forward curve data. MTM will be estimated."
- Direction + benchmark + month = position impact. Show: "This trade will increase your JKM Jul-26 long position from 3.2M to 6.4M MMBtu."

**Where Horizon already does this well:** The template library's Theme F trade form has a Position Impact Preview panel that shows hedge ratio and credit impact as the form is filled. This is the right idea. It needs to be ported to the React TradeForm and made dynamic -- currently it uses hardcoded percentages.

---

## Part 3: Layer 2 -- Orientation (Context, Not Just Content)

A trader looking at a number needs to know: *what* is this number, *when* was it measured, *how* does it relate to what I was just looking at, and *where* am I in my workflow?

### 3.1 Persistent Context Bar

The header area must always show the three numbers a trader checks first:

```
HORIZON                                    JKM $14.52 +0.23   TTF $12.81 -0.15   HH $3.42 +0.08
LNG ETRM                                  as of 10:42 UTC | Net: +3.2M MMBtu | Unreal P&L: +$1.82M
```

This is not a ticker. It is a static bar that updates on an interval (every 60 seconds or on WebSocket push). No scrolling animation -- animation is cognitive overhead. The three benchmark prices, the portfolio net position, and the unrealized P&L are the trader's vital signs. They must be visible on every page.

**Current gap:** Horizon's React app (`App.tsx`) has no persistent market data display. The template library's Theme F has a scrolling ticker, but the round-1 desk trader review specifically called out the animation as "distracting during focused work." Static with a timestamp is better.

### 3.2 Breadcrumb + Entity Context

Every detail view must show its parentage:

```
Contracts > SPA-2026-042 (JERA) > Lifting BUY-20260411-XK2F4A
                                   ^ you are here
```

But also show the entity's current state prominently:

```
Trade BUY-20260411-XK2F4A                            Status: PENDING APPROVAL
Counterparty: JERA Co. | Volume: 3,200,000 MMBtu     [Approve] [Reject] [Edit]
Direction: BUY | Benchmark: JKM + $0.50              Created: 11 Apr 09:42 by j.cobley
```

This is the "entity header" pattern. It appears at the top of every detail view and contains: identity, current state (as a colored badge), key summary fields (inline, not in a card), and the available actions for the current state.

### 3.3 Navigation Architecture: Task Clusters, Not Feature Lists

The current Horizon nav (`App.tsx` lines 47-62) lists 14 items in four groups. But the grouping (trading, physical, risk, ai) does not match how traders think. Traders think in *tasks*:

**Morning startup:** Dashboard, Briefing, Curves
**Active trading:** Contracts (new trades), Positions, Hedges
**Logistics:** Cargo Map, Cargo Board, Nominations, Shipping
**End of day / month:** Settlement, Allocations
**On demand:** Scenarios, Ask AI

The navigation should be ordered by frequency of use, not by architectural category. And the most-used items should be reachable by keyboard shortcut:

| Key | Destination |
|-----|------------|
| `1` | Dashboard |
| `2` | Positions |
| `3` | Contracts |
| `4` | Curves |
| `5` | Cargo Board |
| `Cmd+K` | Command palette (search all) |
| `/` | Focus search within current view |
| `N` | New trade (opens TradeForm) |
| `B` | Briefing |

These shortcuts must only fire when no input element is focused.

### 3.4 Focus Management Within Data-Dense Views

The position ladder is the canonical example. It is a matrix of benchmark x month cells. The trader's eye must be guided to:

1. **The cell with the largest absolute position** (highest risk exposure)
2. **Cells that changed since the last view** (new trades entered)
3. **The cell being interacted with** (keyboard-focused or clicked)

**Pattern: Heat Intensity + Focus Ring + Change Indicator**

```
                Jun-26        Jul-26        Aug-26
JKM          [ +3.2M  ]    [ +1.8M  ]    [  -0.4M ]
             [bg:green/40]  [bg:green/20]  [bg:red/10]
                                           ^ faint because small
TTF          [ -2.1M  ]    [  +0.9M ]    [    --   ]
             [bg:red/30]   [bg:green/10]

Legend:  Background opacity encodes magnitude.
        Green = long, Red = short.
        White ring = keyboard focus.
        Blue dot = changed since last view.
```

The current PositionsView uses green/red backgrounds but at uniform opacity. A position of +3.2M and +0.1M get the same background color. The opacity should scale with magnitude to create a visual heat map that the eye can scan in under 2 seconds.

---

## Part 4: Layer 3 -- Legibility (Typography and Color as Accuracy Infrastructure)

### 4.1 Typographic Rules for Financial Data

These are not style preferences. They are accuracy requirements.

**Rule 1: All numeric values use a monospace font with tabular figures.**

```css
.financial-value {
  font-family: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
}
```

Tabular figures ensure that digits in a column align vertically. Without this, a column of prices ($14.52, $9.81, $112.40) will have misaligned decimal points, making comparison by eye unreliable.

**Current state:** The Horizon React components use `font-mono` (Tailwind class) on some but not all numeric values. The PositionsView applies it to the position ladder cells and the detail table, which is correct. The Dashboard component does NOT apply it to the market snapshot prices or portfolio summary numbers. The SettlementView applies it to invoice references and amounts but not to the outstanding balance totals at the heading level. This inconsistency must be eliminated. Every component that renders a number needs `font-mono`.

**Rule 2: Thousand separators are mandatory on all values >= 1,000.**

`3200000` is unreadable. `3,200,000` is readable. `3.2M` is scannable. The system should use abbreviated format (3.2M, 14.5K) for dashboard-level scanning and full format (3,200,000) for detail views where precision matters.

**Current state:** Horizon's `formatVolume` and `formatCurrency` helper functions handle this correctly in PositionsView. But they are defined locally in each component rather than shared. There should be a single `lib/format.ts` with canonical formatting functions used everywhere.

**Rule 3: Decimal precision must be context-appropriate and consistent.**

| Data type | Precision | Example |
|-----------|-----------|---------|
| LNG price ($/MMBtu) | 2 decimal places | $14.52 |
| Crude price ($/bbl) | 2 decimal places | $72.45 |
| Volume (MMBtu) | 0 decimal places (or abbreviated) | 3,200,000 or 3.2M |
| Volume (MT) | 0 decimal places | 65,000 |
| P&L | 0 decimal places (or abbreviated) | $1,820,000 or $1.82M |
| Percentage | 1 decimal place | 87.5% |
| Price delta | 2 decimal places with sign | +$0.23, -$0.15 |

Mixing precisions (showing $14.5 in one place and $14.50 in another) creates the impression of imprecision in the data itself.

**Rule 4: Right-align all numeric columns in tables.**

Numbers must be right-aligned so that the most significant digits line up. Left-aligned numbers in a column force the eye to hunt for the decimal point.

**Current state:** The PositionsView detail table correctly right-aligns volume, price, and P&L columns. The SettlementView invoice table right-aligns amounts but left-aligns references. Maintain right-alignment for all purely numeric columns and left-alignment for text (even text that happens to contain numbers, like invoice references).

### 4.2 Color Semantics: A Closed System

In Horizon, color must be a closed, deterministic system. The same color must always mean the same thing.

**The Horizon Color Dictionary:**

| Color | Meaning | Usage |
|-------|---------|-------|
| Green (emerald-600/400) | Long position, profit, buy direction, healthy state | Buy buttons, positive P&L, long positions, "on track" status |
| Red (red-600/400) | Short position, loss, sell direction, danger state | Sell buttons, negative P&L, short positions, overdue, breach |
| Amber (amber-600/400) | Warning, attention needed, approaching threshold | Approaching deadline, unmatched position, credit near limit |
| Blue (blue-600/400) | Neutral information, matched/allocated, linked entity | Matched volume, linked reference, informational badge |
| Gray (slate-400/500) | Inactive, no data, placeholder | Disabled fields, empty cells, loading states |
| Violet (violet-600) | AI-generated content, system action | Briefing content, AI suggestions, automated entries |

**Rules:**
- Green and red must NEVER be used for decorative purposes. No green success toasts for non-financial actions. No red error states on non-critical validation. Use amber for validation warnings and gray for informational messages.
- Green and red must ALWAYS be accompanied by a secondary indicator for color-blind users: an up-arrow / down-arrow icon, a +/- prefix, or the word "Long"/"Short". The current PositionsView uses both color AND a badge label ("long"/"short"), which is correct. The Dashboard's P&L card uses color AND a TrendingUp/TrendingDown icon, which is also correct. Maintain this pattern everywhere.
- Violet is reserved exclusively for AI-generated content. This creates an instant visual signal: "a human did not produce this; it was synthesized by the system." This matters for trust and auditability.

### 4.3 Buy/Sell Visual Differentiation

This is the single most important visual distinction in a trading system. If a user ever confuses buy and sell, the design has failed.

**Current state:** The TradeForm uses green background + green text for BUY and red background + red text for SELL. This is correct in principle but insufficient in execution. The buttons are identical in size, shape, position, and typography. They differ only in color.

**Accuracy-enforced pattern:**

```
Direction:

  [ BUY (Long)  ]          [  SELL (Short) ]
   green bg, green border    red bg, red border
   left position             right position
   UP arrow icon             DOWN arrow icon
   bold weight               bold weight

After selection, the ENTIRE form header reflects the direction:

  BUY Trade                  SELL Trade
  green left border          red left border
  on entire form card        on entire form card
```

Multiple redundant signals: color + position + icon + text + form border. A color-blind user can distinguish by position and icon alone. A user glancing at the form from across the desk can see the colored border.

**The submit button must also reflect direction:**

```
[ Create BUY Trade ]     green-600 bg, white text, UP arrow
[ Create SELL Trade ]    red-600 bg, white text, DOWN arrow
```

The current TradeForm already does this (line 398-403). Keep it.

---

## Part 5: Layer 4 -- Verification (The Pre-Commit Moment)

This is where accuracy lives or dies. The moment between "I filled in the form" and "the trade exists in the system."

### 5.1 Confirmation Choreography

Different actions require different levels of friction:

| Action | Risk Level | Confirmation Pattern |
|--------|-----------|---------------------|
| Filter a blotter view | None | Instant, no confirmation |
| Save a draft trade | Low | Inline success indicator, no dialog |
| Submit a trade for approval | Medium | Summary panel with all values, single Confirm button |
| Approve a trade | High | Modal dialog with amount, counterparty, key terms, typed confirmation |
| Amend a confirmed trade | High | Side-by-side diff (before/after), reason field required, two approvals |
| Cancel a confirmed trade | Very High | Modal with red header, trade details, mandatory reason, Ctrl+Enter to confirm |
| Approve a $40M+ invoice | Very High | Full-page review, second approver required, digital signature |

**The key principle:** Friction should scale with consequence. A trader entering 30 trades per day cannot have a modal on every submit. But a $45M invoice approval happening on a single click is negligence.

**Pattern: Inline Confirmation Strip**

For medium-risk actions (trade submission), use an inline confirmation strip rather than a modal. This keeps the user in context:

```
Form:    [BUY] [JERA] [3,200,000 MMBtu] [JKM + $0.50] [Jun-26] [DES]
         ____________________________________________________________
Result:  | BUY 3.2M MMBtu JKM+$0.50 Jun-26 from JERA (DES)        |
         | Notional: ~$47.3M | Credit: 72% of $65M limit           |
         | Position impact: JKM Jun +3.2M -> +6.4M (doubling)      |
         | [Confirm (Enter)] [Edit] [Cancel (Esc)]                  |
         |__________________________________________________________|
```

The strip shows: a human-readable summary of what will happen, the financial impact (notional, credit), the position impact (what changes), and the keyboard shortcuts for each action.

This is what Theme F's template called "Position Impact Preview." It exists in the HTML templates but has not been ported to the React TradeForm. It should be.

### 5.2 Undo Architecture

Every destructive action should be undoable for 5 seconds.

**Pattern: Undo Toast**

```
  [Trade BUY-20260411-XK2F4A created]  [Undo (4s)]  [x]
   ^                                     ^
   success message                       countdown, click to reverse
```

After 5 seconds, the toast disappears and the action becomes permanent. During those 5 seconds, the trade appears in the blotter with a subtle pulsing border to indicate it is not yet finalized.

This is cheaper than a confirmation dialog (which adds friction to every trade) and catches fat-finger errors within the window when the user realizes the mistake ("wait, that should have been SELL").

**What can be undone:**
- Trade creation (within 5 seconds, before any downstream processing)
- Status changes (draft to pending, within 5 seconds)
- Filter/sort changes in grids (always, instant)
- Column visibility changes (always, instant)
- Nomination creation (within 5 seconds)

**What cannot be undone (and therefore requires confirmation):**
- Trade confirmation (downstream effects begin)
- Trade cancellation (counterparty notification triggers)
- Invoice approval (payment process initiates)
- Reconciliation approval (books close)

### 5.3 Pre-Commit Impact Visualization

Before any position-altering action, show the portfolio state change:

```
BEFORE                          AFTER
JKM Jun-26: +3,200,000         JKM Jun-26: +6,400,000
             Long                            Long (DOUBLED)
             WACOG: $14.12                   WACOG: $14.31
                                             ^ new weighted average

Credit: Shell 68% ($44.2M)     Credit: Shell 82% ($53.3M)
                                       ^ APPROACHING LIMIT (amber)

Hedge ratio: 85%                Hedge ratio: 72%
                                       ^ BELOW TARGET (amber)
```

This visualization converts an abstract form submission into a concrete before/after comparison. The trader sees not just what they are entering but what it does to their portfolio.

---

## Part 6: Layer 5 -- Confidence (Trusting What You See)

### 6.1 Data Freshness Indicators

Every piece of market data must show when it was last updated.

**Pattern: Age Badge**

```
JKM: $14.52    2 min ago    <- green, fresh
TTF: $12.81    45 min ago   <- amber, getting stale
HH:  $3.42     2 days ago   <- red, stale (weekend?)
```

The age badge is not just a timestamp. It is color-coded: green (<15 min), amber (15 min - 2 hours), red (>2 hours). The trader can instantly see if they are making decisions on current data or stale data.

**Current state:** Horizon's Dashboard shows "as of [date]" on market snapshot prices, which is correct but too coarse. The BriefingCard has a DataFreshnessBanner component that checks data age. This pattern should be extended to all market data displays.

### 6.2 Source Attribution

Every number should be traceable to its source.

```
JKM: $14.52
Source: ICE Futures | via yfinance
Last settlement: 10 Apr 2026, 16:30 UTC
```

On hover or click, show the data lineage. This is an auditability requirement: a trader must be able to tell their risk manager "I based this trade on the JKM settlement price from ICE as of 10 April."

### 6.3 Calculation Transparency

When the system calculates a value (MTM, P&L, WACOG, demurrage), show the formula on demand.

**Pattern: Expandable Calculation**

```
Unrealized P&L: +$1,120,000  [show calculation]

  expanded:
  (Market price - Trade price) x Volume x Direction
  ($14.60 - $14.25) x 3,200,000 x +1
  = $0.35 x 3,200,000
  = $1,120,000
```

This serves three purposes: (1) the trader can verify the math, (2) a junior trader can learn how P&L is calculated, (3) an auditor can confirm the methodology.

### 6.4 AI Content Labeling

All AI-generated content must be visually distinct from data-derived content.

**Pattern: AI Provenance Strip**

```
[violet left border]
"JKM forward curve shows backwardation beyond Q3 2026,
suggesting the market expects weakening Asian demand.
Combined with your current +3.2M long position, consider
reducing exposure in the Sep-Nov window."

Generated by Horizon AI (Claude Sonnet) | 11 Apr 2026, 06:42 UTC
Based on: JKM curve (10 Apr), portfolio positions (11 Apr 06:30)
Confidence: Medium | This is analysis, not a recommendation.
```

The violet left border, the generation metadata, and the confidence disclaimer make it impossible to mistake AI output for market data or human analysis. This is an accuracy feature: the user knows exactly what weight to give this information.

---

## Part 7: Information Density vs. Error Rate

### 7.1 The Density-Accuracy Curve

More information on screen is not always better. There is an inflection point where additional data creates more errors than it prevents.

```
Accuracy
  |
  |        *   *   *
  |      *           *
  |    *               *
  |  *                   *
  | *                      *
  |*                         *
  +----------------------------> Density
  Low                      High
  (wasted space)    (cognitive overload)
```

The peak depends on the task:

- **Scanning task** (morning dashboard check): Medium density. Summary cards, key metrics, alerts. No detail grids.
- **Searching task** (find a specific trade): High density. Compact rows, many visible, fast filter.
- **Entry task** (entering a new trade): Low density. One thing at a time, generous spacing, clear labels.
- **Verification task** (reconciliation approval): Medium density. Side-by-side comparison, highlighted diffs, nothing else.

### 7.2 Context-Adaptive Density

The system should adjust density based on what the user is doing:

| Context | Density | Spacing | Font size | Information per row |
|---------|---------|---------|-----------|-------------------|
| Dashboard overview | Medium | Comfortable (p-5) | 14px body, 24px headings | 3-4 data points per card |
| Trade blotter (scanning) | High | Compact (p-2) | 13px body, 12px secondary | 8-12 columns visible |
| Trade entry form | Low | Generous (p-4, gap-6) | 14px labels, 16px inputs | 1-2 fields per row |
| Position ladder (analysis) | High | Tight (p-2) | 12px values, 10px secondary | Volume + WACOG + P&L per cell |
| Reconciliation (verification) | Medium | Comfortable | 14px body | Side-by-side, diffs highlighted |
| Invoice approval (high-stakes) | Low | Generous | 16px key values | One invoice, full detail |

The current Horizon app uses the same spacing (`space-y-6`, `p-4`) across all views. The TradeForm and the PositionsView have identical visual density, but their tasks are fundamentally different. The form should breathe. The positions should compress.

### 7.3 Progressive Disclosure in Practice

Show the minimum needed for the current task. Reveal detail on demand.

**Level 1 (Dashboard):** Position is +3.2M JKM. P&L is +$1.82M. Green. Good.
**Level 2 (Position ladder):** Position is +3.2M JKM Jun-26. WACOG $14.12. Market $14.52. P&L +$1.28M. Matched 1.6M / Unmatched 1.6M.
**Level 3 (Drill-down):** The 3.2M comprises: BUY 2.0M from JERA @ JKM+0.50 (confirmed), BUY 1.2M from Shell @ JKM+0.35 (pending). Hedge: 0% paper coverage.
**Level 4 (Trade detail):** Full trade terms, pricing formula, delivery terms, port details, cargo linkage, amendment history, audit trail.

Each level reveals itself on click or keyboard enter. The user controls how deep they go. No level shows more than the user needs for the decision they are making at that level.

---

## Part 8: The Ten Specific Design Changes

Grounded in Horizon's current codebase and the Round 1-3 review findings:

### Change 1: Global Formatting Library

Create `frontend/src/lib/format.ts` with canonical functions: `formatPrice`, `formatVolume`, `formatCurrency`, `formatPercentage`, `formatDate`, `formatRelativeTime`. Every component imports from here. No local `formatCurrency` definitions (currently duplicated in PositionsView, SettlementView, Dashboard, with slightly different implementations).

### Change 2: Persistent Market Context Bar

Replace the header's empty right side (currently just the "Generate Briefing" button) with a static market data strip showing JKM, TTF, HH prices with age indicators and the portfolio net position. Visible on every page. Updated via WebSocket. No animation.

### Change 3: Trade Entry Confirmation Strip

After the TradeForm submit button is clicked, instead of immediately calling `createTrade.mutateAsync()`, insert a confirmation state that shows: trade summary in human-readable format, notional value, credit impact, position impact. Confirm commits. Cancel returns to the form with all values preserved. Keyboard: Enter confirms, Esc cancels.

### Change 4: Position Ladder Heat Encoding

In the PositionLadder component, replace the uniform green/red background with opacity-scaled backgrounds: `bg-green-500/${Math.min(50, Math.round(absVolume / maxVolume * 50))}`. This creates a visual heat map where the eye is drawn to the largest exposures. Add WACOG as a second line in each cell.

### Change 5: State Machine Guard on All Status Changes

For invoices, trades, nominations: replace free-form status dropdowns with action buttons that are contextual to the current state. A Draft invoice shows "Issue" and "Cancel." An Issued invoice shows "Send" and "Cancel." A Sent invoice shows "Mark Paid" and "Dispute." Each action may require a confirmation dialog based on the consequence matrix in section 5.1.

### Change 6: Monospace and Tabular Figures Audit

Apply `font-mono` and `font-variant-numeric: tabular-nums` to every numeric value across all components. This is a systematic find-and-fix pass, not a new feature. The Dashboard market snapshot prices, portfolio summary numbers, and all KPI card values need this.

### Change 7: Keyboard Navigation for Position Ladder

Add arrow-key cell navigation to the PositionLadder component. Track focused cell in state. Render a `ring-2 ring-primary` outline on the focused cell. Enter triggers a drill-down panel. Escape closes the drill-down and returns focus to the cell. Tab moves to the next row.

### Change 8: Undo Toast System

Create a shared `useUndoToast` hook. When a trade is created, show a toast with "Undo" button and 5-second countdown. If Undo is clicked, call the delete endpoint and remove the trade from the local TanStack Query cache. After 5 seconds, dismiss the toast and the trade is permanent.

### Change 9: AI Content Visual Distinction

All AI-generated content (briefings, scenario analysis, discovery responses) should render with a violet left border (`border-l-4 border-violet-500`) and a provenance footer showing model, timestamp, and data sources. The BriefingCard may already be styled this way; extend the pattern to ScenarioPanel and DiscoveryPanel.

### Change 10: Error and Empty State System

Create three shared components: `SkeletonLoader` (already partially exists in Dashboard as `SkeletonCard`), `EmptyState` (icon + message + action button), and `ErrorBanner` (red border, error message, retry button). Every data-fetching component must implement all three states. Currently, most components show a plain text "Loading..." string, which is a missed opportunity to maintain layout stability during loading.

---

## Part 9: The Interaction Principles (Reference Card)

For any future design decision in Horizon, apply these tests:

1. **The Tired Trader Test:** Would a trader at hour 10 of a long day, with three screens of data, correctly interpret this element? If not, add redundant signals (color + icon + text).

2. **The Fat Finger Test:** If the user accidentally clicks this button or presses Enter at the wrong moment, what is the worst outcome? If the worst outcome costs money, add a confirmation step or undo window.

3. **The Glance Test:** Can the user get the answer to "how is my book doing?" in under 3 seconds from the dashboard? If not, the most important information is not visually prominent enough.

4. **The Audit Test:** Can an auditor, looking at this screen, determine who did what, when, to what entity, and why? If not, the interface is hiding information that should be visible.

5. **The Handoff Test:** Can a trader hand their screen to a colleague and the colleague immediately understand the current state? If not, the context indicators (active filters, current entity, selected view) are insufficient.

6. **The Stale Data Test:** Can the user tell, without thinking, whether the data on screen is current or stale? If not, add age indicators.

7. **The Keyboard Test:** Can every critical workflow (enter trade, check position, approve invoice) be completed without touching the mouse? If not, add keyboard shortcuts.

---

## Part 10: What "Intuitive" Actually Means in This Domain

The word "intuitive" is dangerous in enterprise software design. Consumer-app intuitive (large touch targets, playful animations, minimal text) is actively harmful in a trading context. Trading-intuitive means:

- **Predictable.** The same action always produces the same result. No smart defaults that change based on context. No AI "helpfully" pre-filling fields unless the user can see what was pre-filled and override it.

- **Transparent.** Every calculated value shows its inputs on demand. Every AI suggestion shows its reasoning. Every status change records its actor and timestamp.

- **Dense without being cluttered.** The distinction is in hierarchy: primary data (prices, volumes, P&L) is large and bold. Secondary data (timestamps, sources, notes) is small and muted. Tertiary data (calculation details, audit trails) is hidden until requested. Everything has a visual rank.

- **Honest about uncertainty.** When data is missing, show a dash, not a zero. When data is stale, say so. When the AI is uncertain, say "Confidence: Low." When a calculation depends on an assumption, show the assumption. A trading system that hides uncertainty is more dangerous than one that shows incomplete data.

Accuracy is not a feature. It is the absence of every design decision that could cause a misread, a misclick, a misunderstanding, or a missed signal. Every element in the interface either helps accuracy or hurts it. There is no neutral.
