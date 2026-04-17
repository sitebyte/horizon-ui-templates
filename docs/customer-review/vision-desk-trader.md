# Vision: The Trading System That Prevents Expensive Mistakes

**Author perspective:** 10-year LNG desk trader, 30+ trades/day, keyboard-only.
**Date:** 2026-04-11
**Anchor principle:** Accuracy is the constraint. Speed is the objective. Every design decision is tested against: "Does this prevent the $500K mistake?"

---

## 1. The Quick Entry Form: Accuracy-First Redesign

### The Current Problem

The existing TradeForm.tsx is a vertical scroll form with 15+ fields. No validation beyond `required`. No contextual market data. No position awareness. No confirmation step. It is a data-entry form, not a trading tool. A trader could enter $140 instead of $14.00, 32M MMBtu instead of 3.2M, pick the wrong counterparty, and it goes straight into the book.

### The Ideal Form: A Horizontal Strip With Guardrails

The form should be a single-row strip pinned to the top of the screen. Keyboard-only entry. Six to eight fields, left to right, matching the natural order a trader thinks in:

```
[B/S] [Counterparty] [Volume MT] [Benchmark] [Month] [Premium] [Delivery] [Submit]
```

But each field is not just an input -- it is a validation gate.

#### Field 1: Direction (B/S Toggle)

Two large buttons, keyboard shortcut `B` and `S` when no input is focused. The selected direction changes the entire strip's accent color:

- BUY: left border turns green, submit button says "BUY 65,000 MT @ JKM+0.50"
- SELL: left border turns red, submit button says "SELL 65,000 MT @ JKM+0.50"

The color coding is the first line of defense. If you see a red strip and you intended to buy, the visual mismatch stops you before you submit.

#### Field 2: Counterparty (Autocomplete With Context)

Type one character to filter. Arrow keys to navigate. Enter to select.

But when you select a counterparty, the system immediately shows three things below the field in a small info strip:

```
KOGAS (AA-, South Korea) | Credit: $340M / $500M (68%) | Last trade: SELL 3.2M MMBtu, 14-Mar
```

This tells you:
- Is this the right entity? (Name + country disambiguation -- "Shell Trading" vs "Shell Eastern" vs "Shell International")
- Can I trade with them? (Credit utilization -- if it's >80%, the strip turns amber as a warning)
- Have I traded with them recently? (Catches the "I picked the wrong Shell" error because you see the last trade and think "wait, I didn't sell to KOGAS last week, I mean JERA")

If credit headroom is insufficient for the volume you're entering, the system shows the credit check result inline:

```
!! Credit breach: $340M used of $500M limit. This trade adds $42M. Headroom: $118M needed.
```

The submit button is disabled. Not a modal. Not a popup. The button just greys out and the reason is right there.

#### Field 3: Volume (MT with sanity band)

Default unit: metric tonnes. Show MMBtu equivalent below.

The field has a validation band derived from vessel capacities in the Port model and standard cargo sizes:

- Standard LNG cargo: 60,000 - 80,000 MT (roughly 3.0M - 4.0M MMBtu)
- Small cargo (ISO containers, partial): 5,000 - 30,000 MT
- Large Q-Max: up to 85,000 MT

If the entered volume falls outside the standard cargo range, the field border turns amber and a label appears:

```
Volume: 650,000 MT
!! This is ~10 cargoes. Did you mean 65,000 MT?
```

If the volume is below 1,000 MT or above 200,000 MT, the field turns red and submit is disabled:

```
Volume: 6,500,000 MT
!! Volume exceeds maximum single-cargo capacity. Check for extra zeros.
```

The key insight: don't block the trader from entering unusual volumes (a strip deal might be 5 cargoes). Show them the context so they catch their own errors. Only hard-block for physically impossible values.

#### Field 4: Benchmark (JKM / TTF / HH / Brent)

Dropdown with live price shown inline:

```
[JKM ▼]  $14.52  (+0.18)
```

When the benchmark changes, the live price updates. This is the single most important piece of context for the premium field. The current TradeForm.tsx has no price context at all.

#### Field 5: Delivery Month

Month picker that shows:
- Your current position for that benchmark/month: "JKM Jul: Net Long 3.2M MMBtu"
- Number of existing trades: "4 trades"

This prevents the error where a trader accidentally books into the wrong month. If you're adding a 5th trade to July and you meant August, seeing "4 trades" makes you pause.

#### Field 6: Premium ($/MMBtu)

The premium field shows the implied total price:

```
Premium: +0.50    Implied: $15.02/MMBtu ($975M notional)
```

Sanity check bands:
- Hub-indexed premium: -$3.00 to +$5.00 (normal LNG premium range). Outside this: amber warning.
- Oil-indexed slope: 10% to 17% of Brent (normal LNG slope range). Outside: amber warning.
- Fixed price: $5.00 to $30.00/MMBtu (historical LNG price range). Outside: amber warning.

If someone enters $140 instead of $14.00:

```
Premium: +140.00    Implied: $154.52/MMBtu ($10.0B notional)
!! Price is 10x typical LNG range. Did you mean $14.00?
```

The system never silently accepts an outlier price. It always says "this looks unusual" and shows the implied notional value so the trader can self-correct.

#### Field 7: Delivery Terms (FOB / DES)

Toggle buttons, not a dropdown. Two clicks vs. three. Default to DES (most common for Asian-delivered LNG). When FOB is selected, the ports section swaps: load port becomes the primary field, discharge port becomes secondary.

#### Field 8: Submit Button

The submit button is not just "Create Trade." It is a full sentence that changes as you fill in the form:

```
BUY 65,000 MT from KOGAS @ JKM Jul +$0.50 (DES Sodegaura)  [Ctrl+Enter to confirm]
```

This is the final accuracy check. You read the button label and it's a human-readable summary of exactly what you're about to do. If any part is wrong, you see it before you press Enter.

---

## 2. The Confirmation Gate: Not a Modal, a Pause

### Why Modals Are Wrong

Bloomberg uses confirmation modals. Endur uses confirmation modals. Everyone clicks through them without reading because they appear on every trade. They are theater, not safety.

### The Right Pattern: Expand-to-Confirm

When the trader presses Ctrl+Enter (or clicks the submit button), the strip does not open a modal. Instead, it expands vertically by one row to show a confirmation strip:

```
+----------------------------------------------------------------------+
| BUY 65,000 MT | KOGAS | JKM Jul +$0.50 | DES Sodegaura              |
+----------------------------------------------------------------------+
| Confirm trade: 65,000 MT ($15.02/MMBtu = $976.3K notional)           |
| Position impact: JKM Jul goes from +3.2M to +6.4M MMBtu (net long)  |
| Credit impact: KOGAS utilization goes from 68% to 77%               |
|                                                                      |
| [CONFIRM - Enter]                [CANCEL - Esc]        [EDIT - Tab]  |
+----------------------------------------------------------------------+
```

Three critical pieces of information appear that were not visible during entry:

1. **Notional value in dollars.** You typed volume and price separately. Now you see the multiplication. "$976K" vs "$9.76M" is the kind of fat-finger that kills you.

2. **Position impact.** You're about to go from 3.2M long to 6.4M long. Is that what you wanted? If you see "goes from +3.2M to -3.2M" you know you accidentally entered BUY instead of SELL.

3. **Credit impact.** Before the trade, KOGAS was at 68%. After, 77%. If it pushes over 80%, this line turns amber. If over 100%, the confirm button is disabled.

The confirmation strip auto-focuses the Confirm button. Enter confirms. Esc cancels and returns focus to the first field that was changed. Tab moves focus to Edit, which scrolls back to the quick entry fields.

This takes less than 1 second to read. It adds 1 second to the trade workflow. That 1 second prevents $500K errors.

---

## 3. The Undo Problem: 30-Second Soft Delete

### What Happens Today

In the current system, a trade is created with `status: draft` and immediately appears in the blotter. If the trader realizes it's wrong, they have to find the trade, open a context menu or detail panel, and cancel it. That's 10+ seconds and requires the trade to be identifiable among all other trades.

### The Right Pattern: Undo Toast With Timer

After confirmation, the trade is created but with a 30-second grace period. A toast appears at the bottom of the screen:

```
+-------------------------------------------------------------------+
| Trade created: BUY-20260411-X4F2 (KOGAS, 65K MT, JKM Jul +0.50)  |
| [UNDO - Ctrl+Z] ||||||||||||||||................  18s remaining    |
+-------------------------------------------------------------------+
```

The progress bar counts down from 30 seconds. During this window:
- The trade appears in the blotter with a subtle pulsing border (visually distinct from committed trades)
- Ctrl+Z from anywhere on the page immediately cancels it
- The trade is not sent to downstream systems (no cargo nomination, no credit update, no risk calculation)
- Other traders on the desk can see the trade but it's marked "pending commit"

After 30 seconds:
- The trade status transitions from "draft" to "pending_approval" (or "executed" if auto-approval is enabled for the trader's mandate)
- The toast disappears
- The trade becomes a normal trade in the blotter
- Downstream events fire (credit utilization update, position recalculation, audit log entry)

If the trader presses Ctrl+Z:
- The trade is cancelled with reason "Undone by trader within grace period"
- An audit entry records the creation and immediate cancellation
- The blotter row disappears with a brief strikethrough animation
- Focus returns to the quick entry strip, pre-filled with the cancelled trade's data so they can correct and re-enter

This is not the same as a soft delete or a reversible commit in a database sense. It is a deliberate 30-second staging area where the trade exists but has not taken effect. The domain model already supports this -- the `TradeStatus.DRAFT` state is exactly this staging area.

---

## 4. Position Impact Preview: The Panel That Prevents Bad Decisions

### What Should Be Visible During Trade Entry

The right side of the screen (or a collapsible panel) should show a live position impact preview that updates as the trader fills in the form. This is not a separate page. It is context that travels with the trade entry form.

#### 4a. Position Ladder (Compact)

A miniature version of the position ladder showing the benchmark/month combination the trader is entering:

```
JKM Positions:
       Jun      Jul      Aug      Sep
Long   3.2M     3.2M     1.6M     --
Short  1.6M     --       1.6M     --
Net    +1.6M    +3.2M    0        --
WACOG  $12.45   $13.10   $12.80   --
Market $14.52   $14.38   $14.25   --
P&L    +$3.3M   +$4.1M   $0       --
```

The column for the month being entered (Jul in this case) has a highlight and shows the projected post-trade values:

```
       Jul          Jul (after)
Long   3.2M    -->  6.4M
Short  --       -->  --
Net    +3.2M   -->  +6.4M
WACOG  $13.10  -->  $13.06
```

#### 4b. Portfolio Limits

Below the position ladder, show relevant limits:

```
Limits:
  JKM Jul position limit: 10.0M MMBtu   Current: 3.2M   After: 6.4M   [OK]
  Net long limit: 15.0M MMBtu           Current: 8.0M   After: 11.2M  [OK]
  Single counterparty: $600M            Current: $340M   After: $382M  [OK]
```

If any limit would be breached:

```
  Net long limit: 15.0M MMBtu           Current: 14.0M   After: 17.2M  [BREACH]
```

The BREACH label is red. The submit button is disabled. The trader cannot accidentally breach a limit because the system shows them the math before they submit.

This is different from the credit check (which happens server-side on submission). Position limits should be calculated client-side from cached position data so the preview is instant, not waiting for an API call.

#### 4c. Hedge Ratio Impact

If the trader has paper hedges against this benchmark/month, show the hedge ratio change:

```
Hedge coverage:
  JKM Jul physical: 3.2M MMBtu (after: 6.4M)
  JKM Jul paper:    2.5M MMBtu (short futures)
  Hedge ratio:      78% (after: 39%)
  !! Under-hedged: new trade reduces hedge coverage below 50%
```

This catches the scenario where a trader enters a large physical trade without realizing it throws off the hedge ratio. The data for this calculation already exists in the `HedgePosition` model.

---

## 5. Fat-Finger Guards: Specific Validation Rules

These are not abstract "validation" -- they are specific rules derived from LNG market conventions that the system should enforce without slowing down normal trading.

### Price Guards

| Rule | Logic | Action |
|------|-------|--------|
| Fixed price outside $3-$30/MMBtu | `price < 3 OR price > 30` | Amber warning + "Unusual price" label |
| Fixed price outside $1-$50/MMBtu | `price < 1 OR price > 50` | Red hard block + "Price appears invalid" |
| Hub premium outside -$5 to +$8 | `abs(premium) > 8` | Amber warning |
| Hub premium outside -$10 to +$15 | `abs(premium) > 15` | Red hard block |
| Oil slope outside 8%-18% | `slope < 0.08 OR slope > 0.18` | Amber warning |
| Oil slope outside 5%-25% | `slope < 0.05 OR slope > 0.25` | Red hard block |
| Price is exact multiple of 10x a recent trade | Compare against last 50 trades for same benchmark | "Price is 10x your last KOGAS trade ($1.45 vs $14.50). Check decimal point." |
| Notional value exceeds $2B | `volume * price > 2,000,000,000` | Red hard block + "Notional exceeds maximum" |

### Volume Guards

| Rule | Logic | Action |
|------|-------|--------|
| Volume is standard cargo range | 60,000-80,000 MT | Green checkmark, no message |
| Volume is unusual but valid | 5,000-60,000 or 80,000-170,000 MT | Amber + "Non-standard cargo size" |
| Volume exceeds Q-Max capacity | > 170,000 MT | Amber + "Exceeds single cargo capacity. Multi-cargo deal?" |
| Volume exceeds annual contract | > 5,000,000 MT | Red hard block + "Volume exceeds any known annual LNG contract" |
| Volume has suspicious zeros | 320,000 vs 32,000 vs 3,200,000 | Show equivalents: "= 4.9 cargoes" or "= 0.49 cargoes" so the trader sees whether the number makes physical sense |
| Volume entered as MMBtu when field expects MT | Value matches common MMBtu amounts (3,200,000) | "Did you enter MMBtu? This field is metric tonnes. 3,200,000 MT = 49 cargoes." |

### Date Guards

| Rule | Logic | Action |
|------|-------|--------|
| Delivery month is in the past | `month < today` | Red hard block + "Delivery month is in the past" |
| Delivery month is > 36 months forward | `month > today + 36m` | Amber warning + "Far-forward delivery. Confirm liquidity." |
| Laycan window > 10 days | `end - start > 10` | Amber warning + "Wide laycan window" |
| Laycan window < 1 day | `end <= start` | Red hard block + "Invalid laycan" |

### Counterparty Guards

| Rule | Logic | Action |
|------|-------|--------|
| Counterparty is inactive | `is_active === false` | Red hard block + "Counterparty is inactive" |
| Counterparty has no credit rating | `credit_rating === null` | Amber warning + "No credit rating on file" |
| Counterparty credit utilization > 80% | From credit check | Amber warning + show utilization |
| Counterparty credit utilization > 100% | From credit check | Red hard block + show deficit |
| Same counterparty + benchmark + month + direction as another trade in last 60 seconds | Duplicate detection | "Possible duplicate of trade entered 34 seconds ago. Submit anyway?" |

All amber warnings allow submission but are logged in the audit trail. All red blocks prevent submission and require the trader to correct the value. The trader is never prompted with a modal -- the validation is inline, immediate, and visible without clicking anything.

---

## 6. Keyboard-Driven But Safe: Specific Shortcuts

### Global Shortcuts (Active When No Input Is Focused)

| Shortcut | Action |
|----------|--------|
| `B` | Set direction to BUY and focus counterparty field |
| `S` | Set direction to SELL and focus counterparty field |
| `N` | Focus the quick entry strip (new trade) |
| `/` | Focus the blotter search box |
| `Ctrl+Z` | Undo last trade (during 30-second grace period) |
| `1` through `5` | Switch between main tabs (Blotter, Positions, Allocations, Hedges, Cargoes) |
| `Ctrl+K` | Command palette (search anything) |
| `Esc` | Clear the quick entry form, or close the current panel/drawer |

### Quick Entry Shortcuts (Active When Quick Entry Is Focused)

| Shortcut | Action |
|----------|--------|
| `Tab` | Move to next field |
| `Shift+Tab` | Move to previous field |
| `Ctrl+Enter` | Submit trade (opens confirmation strip) |
| `Enter` (in confirmation strip) | Confirm trade |
| `Esc` | Cancel confirmation, or clear form |
| `Up/Down` in counterparty field | Navigate autocomplete results |
| `Enter` in counterparty field | Select highlighted counterparty |
| `Up/Down` in volume field | Increment/decrement by 1,000 MT |
| `Shift+Up/Down` in volume field | Increment/decrement by 10,000 MT |
| `Up/Down` in premium field | Increment/decrement by $0.01 |
| `Shift+Up/Down` in premium field | Increment/decrement by $0.10 |

### Blotter Shortcuts (Active When Blotter Is Focused)

| Shortcut | Action |
|----------|--------|
| Arrow keys | Navigate between rows and cells |
| `Enter` | Open trade detail drawer for selected row |
| `Space` | Toggle row selection (for bulk actions) |
| `Ctrl+A` | Select all visible rows |
| `C` | Change status of selected trade(s) |
| `D` | Duplicate selected trade (pre-fills quick entry with same values) |
| `Delete` | Cancel selected trade(s) -- with confirmation |

### Position Ladder Shortcuts (Active When Ladder Is Focused)

| Shortcut | Action |
|----------|--------|
| Arrow keys | Navigate between cells |
| `Enter` | Drill down into selected cell (show underlying trades) |
| `Esc` | Close drill-down and return to cell |
| `T` | Open quick entry pre-filled with the cell's benchmark and month |
| `H` | Show hedge detail for this cell |

The key design principle: shortcuts should be discoverable. When a trader presses `?` from any screen, a shortcuts overlay appears showing all available shortcuts for the current context. Shortcuts are also shown in tooltips on hover (e.g., the Submit button tooltip says "Ctrl+Enter").

---

## 7. The Blotter: What It Must Show

The current TradesList.tsx shows: reference, counterparty, direction, volume, delivery start, status. That's a trade log. A real blotter needs:

### Required Columns (Default Visible)

| Column | Source | Why |
|--------|--------|-----|
| Ref | `trade.reference` | Trade identity |
| Dir | `trade.direction` | BUY/SELL with color |
| Counterparty | `trade.counterparty.name` | Who |
| Volume (MT) | `trade.volume.quantity_mmbtu` converted | How much |
| Benchmark | `trade.pricing.benchmark` | Which curve |
| Month | `trade.delivery_window.start_date` | When |
| Price/Premium | `trade.pricing.constant` | At what price |
| Implied Price | Calculated from benchmark + premium | Full price (not just the premium) |
| MTM | Calculated from position data | Current mark-to-market value |
| Unrealized P&L | `position.unrealized_pnl` | Am I making or losing money |
| Status | `trade.status` | Lifecycle state |
| Delivery Terms | `trade.delivery_terms` | FOB/DES |
| Book | `trade.book_id` resolved | Portfolio assignment |
| Load Port | `trade.delivery_window.load_port` | Physical logistics |
| Discharge Port | `trade.delivery_window.discharge_port` | Physical logistics |
| Trader | Who entered it | Attribution |
| Trade Time | `trade.created_at` | When it was booked |

### Required Footer Row

A pinned bottom row showing:

```
Total: 42 trades | BUY: 12.8M MMBtu ($156M) | SELL: 9.6M MMBtu ($118M) | Net: +3.2M MMBtu | P&L: +$4.2M
```

This row updates when filters change. If I filter to "JKM only" trades, the totals reflect only JKM trades. This is essential for quick mental checks: "Did I enter that last trade? Total should have gone up by 65K MT."

### Required Grouping

The blotter must support row grouping by:
- Benchmark (JKM / TTF / HH)
- Book (LNG-APAC / LNG-EUR)
- Counterparty
- Status
- Trader

AG Grid supports this natively. The grouped rows should show subtotals: total volume, net volume, total P&L per group.

---

## 8. End-of-Day: The Clean Day Verification

The existing EOD process (`backend/horizon/domain/valuation/eod.py`) runs a batch that marks positions, calculates P&L attribution, and stores snapshots. Good. But the trader needs an interactive EOD workflow, not just a batch report.

### The EOD Checklist View

At 4:30 PM (configurable), the system should show an EOD summary panel (triggered automatically or via `Ctrl+E`):

```
+------------------------------------------------------------------+
| END OF DAY VERIFICATION - 11 Apr 2026                            |
+------------------------------------------------------------------+
|                                                                  |
| TRADE RECONCILIATION                                             |
|   Trades entered today: 34                                       |
|   Trades confirmed: 31                                           |
|   Trades pending: 3  [View pending -->]                          |
|     - BUY-20260411-X4F2 (KOGAS, draft)                          |
|     - SELL-20260411-A8B1 (JERA, pending_approval)               |
|     - BUY-20260411-C2D3 (Shell, pending_approval)               |
|   Trades cancelled: 2  (including 1 undo)                        |
|   Trades amended: 5  [View amendments -->]                       |
|                                                                  |
| POSITION CHECK                                                   |
|   Positions within limits: [YES]                                 |
|   Largest position: JKM Jul +6.4M MMBtu (64% of limit)          |
|   Positions near limit (>80%): None                              |
|   Unhedged positions >$5M: 2  [View -->]                        |
|                                                                  |
| CREDIT CHECK                                                     |
|   Counterparties within limits: 12/14                            |
|   Warnings (>80%): KOGAS (84%), TotalEnergies (81%)             |
|   Breaches: None                                                 |
|                                                                  |
| P&L ATTRIBUTION                                                  |
|   New trade P&L:    +$1.2M                                      |
|   Price move P&L:   -$0.4M                                      |
|   Realized P&L:     +$0.3M                                      |
|   Total daily P&L:  +$1.1M                                      |
|                                                                  |
| CARGO STATUS                                                     |
|   Cargoes in transit: 4                                          |
|   Cargoes loading: 1 (at Ras Laffan, KOGAS lifting)             |
|   Nominations due within 48h: 2  [View -->]                     |
|                                                                  |
| AUDIT FLAGS                                                      |
|   Trades booked outside market hours: 0                          |
|   Trades amended after initial confirmation: 2  [View -->]      |
|   Trades with price outside normal range: 1  [View -->]         |
|     - BUY-20260411-X4F2: JKM+$4.50 (amber warning overridden)  |
|                                                                  |
| [Mark day as clean]          [Flag for review]                   |
+------------------------------------------------------------------+
```

"Mark day as clean" creates an audit entry confirming the trader has reviewed the day. "Flag for review" adds a note for the operations manager.

The key insight: the system already has all this data (trades, positions, credit, P&L attribution, cargoes, audit trail). It just needs to present it in a single view at end-of-day so the trader can verify everything is correct before going home.

### Stale Price Detection

The EOD report should flag any benchmark where the latest price is more than 4 hours old:

```
!! JKM price is from 10:30 AM (6 hours stale). Refresh from ICE before marking day clean.
```

This catches the scenario where the data feed died mid-day and positions were marked against stale prices. The `MarketDataRepository.get_latest_price()` already returns a timestamp -- the EOD view just needs to display it.

---

## 9. The Information That Prevents Errors: Always-Visible Context

### The Ticker Bar

Pinned to the very top of every page. Shows live prices for all benchmarks:

```
JKM Jun: $14.52 (+0.18)  |  TTF Jun: EUR 31.40 (-0.22)  |  HH Jun: $2.84 (+0.03)  |  Brent Jun: $78.20 (+1.10)
```

The current system has no price context on the trade entry form. This is the single most important missing feature. A trader entering a JKM premium needs to know what JKM is trading at RIGHT NOW, not look it up on a separate Bloomberg terminal.

### The Position Summary Bar

Pinned below the ticker bar. Shows the trader's current aggregate position:

```
Net: +4.8M MMBtu (Long) | JKM: +3.2M | TTF: +1.6M | HH: 0 | Day P&L: +$1.1M | Credit util: 72%
```

This bar serves the same function as the total row in a Bloomberg position monitor. Glanceable. Updated in real time. If the net position or P&L changes significantly after a trade, the trader sees it immediately without switching to the Positions tab.

### Counterparty Quick Card

When any counterparty name appears anywhere in the UI (blotter, trade detail, allocation board), hovering for 500ms or pressing `I` while the row is selected shows a quick card:

```
KOGAS
Korea Gas Corporation | Seoul, South Korea | AA- (S&P)
Credit: $340M / $500M (68%) | 14 open trades | Last: 14-Mar SELL 65K MT JKM
Active contracts: SPA-2024-001 (annual 3.2M MT), SPA-2025-003 (spot framework)
```

This prevents counterparty confusion. "KOGAS" vs "Korea Southern Power" vs "Korea Midland Power" are all Korean entities a trader might deal with. The quick card shows enough context to confirm the right one.

---

## 10. What Makes This Different From Bloomberg/Endur/Allegro

### Bloomberg TOMS
- Trade entry is a modal wizard (5 screens, 30+ fields). Horizon: single strip, 8 fields.
- No position impact preview during entry. You trade, then check your position. Horizon: live preview.
- No price sanity checks. Bloomberg trusts the trader completely. Horizon: context-aware guards.
- Undo requires calling middle office. Horizon: 30-second Ctrl+Z.

### Endur/Allegro
- Trade entry is a full-page form with tabs (General, Pricing, Delivery, etc.). 20+ seconds to enter a trade. Horizon: 8 seconds.
- Confirmation is a modal that everyone clicks "OK" on without reading. Horizon: expand-to-confirm with position impact.
- No duplicate detection. Horizon: automatic comparison against recent trades.
- EOD is a batch job that generates a PDF. Horizon: interactive checklist with drill-down.

### Excel (The Real Competitor)
- Fastest possible entry (5-7 seconds). But zero validation, zero limit checks, zero audit trail.
- Horizon matches Excel's speed while adding every safety net that Excel lacks.
- The goal is to make traders say "I don't need my Excel blotter anymore" -- not because we took it away, but because Horizon is faster AND safer.

---

## 11. Summary: The Non-Negotiable Behaviors

1. **Every trade shows its full implied value before submission.** Volume x Price = dollars. Always visible. Never just the raw inputs.

2. **Position impact is shown before, not after.** The trader sees what their book will look like if they execute. Not what it looked like 5 minutes ago.

3. **Credit limits are enforced inline, not via rejection.** The submit button disables itself. The reason is visible. No surprises.

4. **Unusual values get warnings, impossible values get blocks.** Amber means "are you sure?" Red means "fix this." Neither uses a modal.

5. **Every trade has a 30-second undo window.** Not an amendment. Not a cancel request. An instant undo with Ctrl+Z.

6. **The system remembers the trader's context.** After submitting a trade, the form resets to the most likely next trade: same direction, same benchmark, clear counterparty and volume. Focus goes to the counterparty field.

7. **End-of-day is a verification workflow, not just a report.** The trader clicks through a checklist that surfaces exceptions and anomalies, and marks the day as clean.

8. **Keyboard-first does not mean keyboard-only.** Every action has a keyboard shortcut. Every action also works with a mouse. But the keyboard path is always faster.

9. **Price context is everywhere.** The current benchmark price is visible on the ticker bar, in the quick entry strip, in the position ladder, and in the confirmation step. The trader never has to wonder "what is JKM trading at right now?"

10. **The audit trail is automatic and invisible during normal operation.** Every trade, amendment, cancellation, and override is logged. The trader does not see audit overhead during entry. But at EOD or during a dispute, every action is reconstructible.
