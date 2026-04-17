# Round 1 -- Desk Trader Review

**Reviewer persona:** 10-year LNG front-office trader. 30+ trades/day, keyboard-only workflow. Benchmark systems: Bloomberg TOMS, Endur, Allegro, Excel.
**Date:** 2026-04-11
**Pages reviewed:** 7 (theme-d: quick-entry, blotter, positions, dashboard; theme-f: quick-entry, positions, blotter)

---

## Page-by-Page Assessment

---

### 1. Theme-D Quick Entry (`theme-d/quick-entry.html`)

**Task:** Enter a new LNG trade and see it appear in the blotter beneath.

**Can I do my job here?** Yes -- this is the right concept. Horizontal strip at top, blotter below. The layout says "I will not slow you down." Good instinct.

**Time to enter a trade:** ~8 seconds keyboard-only. Tab through 6 fields, Enter to submit. That is competitive with Excel (5-7s) and far better than Endur's pop-up dialog (15-20s).

**Keyboard test:** Passes. B/S global hotkeys work when not focused on an input. Tab order is set via tabindex 1-8. Enter submits from any field except counterparty (where Enter selects from the autocomplete). Arrow keys navigate the counterparty dropdown. This is well thought through.

**What is missing:**
- No delivery term (FOB/DES/DAP). This is mandatory on every LNG deal. I need it.
- No trader initials field -- who booked this? The blotter has no trader column either.
- No book assignment (LNG-APAC, LNG-EUR, etc.).
- Volume units are MMBtu but LNG desk thinks in metric tonnes (MT) or TBtu. Need a unit toggle or at least show MT equivalent.
- No indication of current market price next to the premium field. Am I paying +0.10 over a JKM of 14.50 or 12.80? I need that context.
- Premium label but no base price shown -- premium to what? If I type "0.50" is that JKM + 0.50? The field just says "Premium" with no reference.
- No duplicate-trade warning. If I fat-finger and submit twice, I get two identical trades.
- No Esc to clear the form.
- After submission, focus goes to the Buy button -- it should go to the counterparty field since Buy is the most common direction and the user just set it.

**Density:** Excellent. Strip is compact, single-row. Blotter uses AG Grid at 28px row height. This is near Bloomberg density. No wasted space.

**vs Bloomberg/Excel:** The concept is better than both for speed-of-entry. Bloomberg TOMS requires navigating a modal wizard. Excel is faster to type but has no validation or autocomplete. This hits the sweet spot -- if the missing fields are added.

| Metric | Score |
|--------|-------|
| Usefulness | 7/10 |
| Speed | 8/10 |
| Density | 9/10 |
| Keyboard | 8/10 |

---

### 2. Theme-D Blotter (`theme-d/blotter.html`)

**Task:** Find, filter, and manage today's trades. Drill into a specific trade.

**Can I do my job here?** Yes. This is the audit/management view. Search, filter pills (All/Confirmed/Pending/Draft), AG Grid, detail drawer on Enter/double-click.

**Time to find a trade:** ~2 seconds. Type counterparty name in search, quick filter kicks in immediately. Status pills filter with one click.

**Keyboard test:** Partial pass. Search is keyboard-accessible. AG Grid supports arrow-key navigation. Enter opens the detail drawer. But: I cannot keyboard-navigate between filter pills. No shortcut to jump focus to the search box (should be `/` or `Ctrl+F`). No shortcut to toggle between filter states (e.g., `1` for All, `2` for Confirmed, etc.).

**What is missing:**
- No grouping by book or trader. On a desk with 4 traders, I need to see my trades vs. desk trades instantly.
- No bulk actions on selected rows. I can multi-select (checkbox) but there is no "Confirm selected" or "Assign cargo" button.
- Context menu exists (right-click) with "View Detail", "Amend Trade", "Cancel Trade", "Nominate Cargo" -- good concept but none are implemented ("not implemented" toast). These need to work.
- Detail drawer shows flat key-value pairs. I need: pricing breakdown (base + premium = total), delivery window dates, linked cargo if any, credit check status, amendment history.
- No column reorder persistence. If I drag columns around, it resets on page load.
- Export CSV works -- good. But no Excel export with formatting.
- Columns button is a binary toggle (show all / hide trader+book). Need a proper column chooser panel.
- No P&L column. Every blotter in the real world shows the current MTM next to each trade.
- No running totals row at the bottom (total volume bought, total volume sold, net).

**Density:** Good. 28px rows, 32px header. 22 trades visible in 32rem height. Comparable to Bloomberg.

**vs Bloomberg/Excel:** Bloomberg's blotter has grouping, running totals, and inline editing. Excel pivot table beats this for ad-hoc analysis. This is a solid foundation but lacks the power features that make a blotter indispensable.

| Metric | Score |
|--------|-------|
| Usefulness | 6/10 |
| Speed | 7/10 |
| Density | 8/10 |
| Keyboard | 5/10 |

---

### 3. Theme-D Positions (`theme-d/positions.html`)

**Task:** See my net position across benchmarks and months. Drill into any cell.

**Can I do my job here?** Yes. This is exactly the heatmap/matrix view I use in Excel every day. Benchmark (JKM/TTF/HH) x Month, with volume and P&L per cell, color-coded long/short. Click to drill down to underlying trades.

**Time to answer "what's my JKM Jul exposure?":** <1 second. Scan the grid, green = long, red = short. Instant.

**Keyboard test:** Fails. No keyboard navigation of the matrix. Cannot Tab or Arrow between cells. Cannot trigger drill-down with Enter. This is a mouse-only view. For a page I live on all day, that is a problem.

**What is missing:**
- No keyboard navigation at all. Must add arrow-key cell navigation and Enter to drill.
- No WACOG (weighted average cost of gas) shown. Volume alone is not enough -- I need to know my average entry price for each bucket.
- No MTM price shown for each benchmark/month. I see P&L but not the current market price feeding it.
- No hedge indicator. Is this position hedged? What percentage?
- Only 6 months forward. LNG books typically go 12-24 months. Need a scrollable column range.
- Totals row exists -- good. But no "Net across benchmarks" column on the right (row totals).
- No way to pivot the view (e.g., by counterparty, by book, by trader).
- Drill-down table is basic (ref, dir, volume, price, counterparty, status). Needs: trade date, delivery terms, linked cargo, amendment status.
- No way to jump from a drill-down trade directly to the blotter detail view.
- Cell click visual feedback is good (cyan outline on selected cell).

**Density:** Excellent. Matrix is extremely compact. Three rows of data plus totals, each cell shows volume + P&L. This is denser than any ETRM I have used. Well done.

**vs Bloomberg/Excel:** Bloomberg PORT shows this but with way more axes. Excel pivot tables are more flexible but less visual. The color-coding here is excellent and beats both. The missing WACOG and hedge ratio are what keep it from being superior.

| Metric | Score |
|--------|-------|
| Usefulness | 7/10 |
| Speed | 8/10 |
| Density | 9/10 |
| Keyboard | 2/10 |

---

### 4. Theme-D Dashboard (`theme-d/index.html`)

**Task:** Get a 10-second morning overview of the desk's state.

**Can I do my job here?** Partially. The KPI row (Net Position, Unrealized P&L, Hedge Ratio, Trades Today, Cargoes Active, Credit Util) is exactly right. That is the six numbers I need first thing. The position ladder, alerts panel, P&L attribution, hedge coverage, cargo pipeline, and recent trades round out a strong overview.

**Time to answer "how are we doing today?":** 3-5 seconds. Scan KPIs, scan alerts for red, glance at position ladder. This works.

**Keyboard test:** Mostly N/A -- dashboards are visual scanners. But the recent trades table is not navigable, and there are no keyboard shortcuts to jump to any section. Should have hotkeys like `1` for positions, `2` for blotter, etc.

**What is missing:**
- No live prices. There is no ticker or current JKM/TTF/HH price anywhere on this page. A trader's dashboard without live prices is incomplete.
- No timestamp showing when data was last refreshed. Is this real-time or 30 minutes stale?
- Position ladder only shows 4 months (May-Aug). Should match the positions page (6+ months).
- P&L attribution waterfall is clever but needs a time dimension -- today vs. yesterday vs. MTD.
- Alerts are static HTML. Need a "dismiss" action, a "go to trade" link, and severity filters.
- Recent Trades table shows 5 trades. Needs to show at least 10 and auto-refresh.
- "View all" link on Recent Trades goes to blotter.html -- good.
- No AI briefing / narrative section. The CLAUDE.md says the primary view is AI-generated briefings, but this dashboard is entirely manual data.
- Cargo pipeline stacked bar is a great concept but needs drill-through to the cargo board.
- Credit utilization KPI is great. Needs a "view counterparty breakdown" link.

**Density:** Perfect for a dashboard. Not too sparse, not overwhelmed. The two-column layout for positions + alerts is natural.

**vs Bloomberg/Excel:** Better than both for a quick morning scan. Bloomberg's LaunchPad is more customizable but takes 30 minutes to configure. This is opinionated and correct out of the box. Missing live prices is the critical gap.

| Metric | Score |
|--------|-------|
| Usefulness | 7/10 |
| Speed | 8/10 |
| Density | 8/10 |
| Keyboard | 3/10 |

---

### 5. Theme-F Quick Entry (`theme-f/quick-entry.html`)

**Task:** Same as Theme-D: enter a trade quickly.

**Can I do my job here?** Yes, but slower than Theme-D.

**Time to enter a trade:** ~10 seconds. Same fields but wrapped in a card with a heading ("Quick Trade Entry"), more padding, and a gradient submit button. The extra visual chrome adds ~2 seconds of cognitive overhead vs. Theme-D's bare strip.

**Keyboard test:** Partial pass. B/S hotkeys work globally. Tab order flows through the form. Enter submits the form (it is a `<form>` with `onsubmit`). Counterparty autocomplete works. But: after submission, all three fields (cpty, volume, price) are cleared and focus is lost. Where did my cursor go? Theme-D at least sends focus to the Buy button.

**Advantages over Theme-D:**
- Volume unit is MT (metric tonnes) not MMBtu. This is correct for LNG physical trading. Theme-D gets this wrong.
- Has Brent and NBP as benchmark options, not just JKM/TTF/HH. More complete.
- Has a live price ticker bar at the top showing JKM, TTF, HH, Brent, NBP with deltas. This is excellent and Theme-D lacks it entirely.
- Has a Cmd+K command palette for fast navigation. This is a power-user feature Theme-D also has via shell.js.
- Sidebar with full navigation, role selector, favorites section, badge counts on nominations and invoices. More complete app shell.

**What is missing:**
- Same as Theme-D: no FOB/DES, no trader initials, no book assignment.
- No incoterm field in the quick entry form (even though the blotter data has it).
- The embedded blotter uses `rowSelection: 'single'` -- should be `'multiple'` for bulk operations.
- No running totals or summary stats below the blotter.
- Sidebar takes 15rem of horizontal space. On a 1920px monitor, that is fine. On a laptop, it eats 16% of my screen. The collapse feature (down to 3.5rem) helps.
- Ticker bar animation is distracting. Needs a pause-on-hover and a static mode option.

**Density:** Lower than Theme-D. The card-in-card layout, 32px row height, rounded corners, and extra padding reduce information density by ~15%. On a 4-screen trading desk, every pixel matters.

**vs Bloomberg/Excel:** The ticker bar is a genuine differentiator -- constant price context while entering trades. But the overall density penalty compared to Theme-D is a step backward.

| Metric | Score |
|--------|-------|
| Usefulness | 7/10 |
| Speed | 6/10 |
| Density | 7/10 |
| Keyboard | 7/10 |

---

### 6. Theme-F Positions (`theme-f/positions.html`)

**Task:** Position matrix with drill-down, same as Theme-D.

**Can I do my job here?** Yes, and it is slightly better than Theme-D's version.

**Advantages over Theme-D:**
- Has a Net column on the right, showing net position per benchmark across all months. Theme-D lacks this. Critical for quick risk assessment.
- 6 months forward (Jun-Nov) vs. Theme-D's 6 (May-Oct). Same range.
- Drill-down table is better: includes trade ID, side, counterparty, volume, price, status. Same fields but rendered with better Tailwind badges.
- Cells use rounded-md cards with hover ring effect. Slightly more tactile feedback.

**What is missing:**
- Same keyboard problem as Theme-D: no arrow-key navigation, no Enter to drill. Mouse only.
- Same missing data: no WACOG, no current market price, no hedge ratio.
- Volume format uses lowercase 'k' (e.g., "+450k") while Theme-D uses uppercase 'K'. Inconsistency is minor but sloppy.
- No way to select multiple cells for aggregate analysis.
- Drill-down data is richer (more counterparties, includes Cancelled status) but still lacks delivery terms and cargo links.

**Density:** Slightly lower than Theme-D due to Tailwind padding and rounded elements. Each cell is larger. On a big monitor this is fine; on a smaller screen, Theme-D's tighter grid is preferable.

**vs Bloomberg/Excel:** Same assessment as Theme-D positions. The Net column is a genuine improvement.

| Metric | Score |
|--------|-------|
| Usefulness | 7/10 |
| Speed | 7/10 |
| Density | 7/10 |
| Keyboard | 2/10 |

---

### 7. Theme-F Blotter (`theme-f/blotter.html`)

**Task:** Full trade blotter with search, filter, context menu, column management.

**Can I do my job here?** Yes, and this is the most complete blotter of the set.

**Advantages over Theme-D Blotter:**
- More columns: adds portfolio, incoterm, type. Real ETRM fields.
- Trade ID pinned to left -- stays visible when scrolling horizontally. Essential for wide grids.
- Full timestamps with dates, not just times. I can see trades from prior days.
- Column toggle panel is a proper checkbox list, not Theme-D's binary toggle. Each column individually controllable.
- Status filter includes "Cancelled" option.
- Context menu on right-click with View/Amend/Cancel actions.
- Grid height is `calc(100vh - 14rem)` -- fills the viewport. Theme-D uses a fixed 32rem. The dynamic height is much better; I see maximum trades without scrolling.
- Has search box with a search icon. Better discoverability.

**What is missing:**
- Same core gaps: no P&L column, no running totals row.
- No grouping by benchmark, portfolio, or trader.
- No inline editing. In Endur I can click a cell and change the price. Here everything is read-only.
- Context menu actions are toast-only stubs (except Cancel, which actually updates the row -- nice).
- No keyboard shortcut to focus the search box.
- `rowSelection: 'single'` -- should be `'multiple'` for a full blotter.
- No detail drawer/panel. Theme-D has a detail drawer on double-click/Enter; Theme-F blotter lacks this.
- Column panel has duplicate `id="col-panel"` in the HTML -- cosmetic bug but sloppy.

**Density:** Good. 30px rows, dynamic height. Better vertical use of space than Theme-D due to viewport-relative height. Slightly wider padding on toolbar elements costs horizontal density.

**vs Bloomberg/Excel:** Closer to Bloomberg TOMS than any other page reviewed. The pinned ID column, full timestamps, and portfolio field are professional touches. Still needs grouping and inline edit to be competitive.

| Metric | Score |
|--------|-------|
| Usefulness | 7/10 |
| Speed | 7/10 |
| Density | 8/10 |
| Keyboard | 5/10 |

---

## Composite Scores

| Page | Usefulness | Speed | Density | Keyboard | Avg |
|------|-----------|-------|---------|----------|-----|
| D Quick Entry | 7 | 8 | 9 | 8 | **8.0** |
| D Blotter | 6 | 7 | 8 | 5 | **6.5** |
| D Positions | 7 | 8 | 9 | 2 | **6.5** |
| D Dashboard | 7 | 8 | 8 | 3 | **6.5** |
| F Quick Entry | 7 | 6 | 7 | 7 | **6.8** |
| F Positions | 7 | 7 | 7 | 2 | **5.8** |
| F Blotter | 7 | 7 | 8 | 5 | **6.8** |

**Best pages for production use:** Theme-D Quick Entry (highest avg, best density and speed) and Theme-F Blotter (most complete data model).

**Recommended approach:** Take Theme-D's density and speed philosophy, combine with Theme-F's richer data model (portfolio, incoterm, type, full timestamps, pinned columns, ticker bar). The result would score 8+ across the board.

---

## Numbered Issues List

### Blockers

1. **[Blocker] No delivery terms (FOB/DES/DAP) in quick entry.** Every LNG deal has delivery terms. Without this the trade is incomplete and cannot be processed downstream. **Fix:** Add an Incoterm toggle or dropdown (FOB/DES/DAP/ExShip) between Benchmark and Premium in the quick entry strip.

2. **[Blocker] No P&L / MTM column in any blotter.** A blotter without mark-to-market is a glorified trade log. Traders will not use it for risk management. **Fix:** Add an MTM column to the AG Grid column definitions in both blotters. Calculate as `(currentPrice - tradePrice) * volume * direction`. Show unrealized P&L with color coding.

3. **[Blocker] Position ladder has no keyboard navigation.** Both theme-D and theme-F positions pages are mouse-only. A keyboard trader cannot navigate the matrix or trigger drill-downs without a mouse. **Fix:** Implement arrow-key cell navigation on the position table. Track focused cell with a data attribute. Enter triggers `drillDown()`. Escape closes the drill panel and returns focus to the cell.

4. **[Blocker] No WACOG in position ladder.** Volume alone does not tell me if I am making or losing money. I need weighted average cost of gas per bucket so I can compare against the current market price. **Fix:** Calculate WACOG from underlying trades for each bench/month cell. Display as a third line in each cell beneath volume and P&L (e.g., "WACOG $12.45").

### Major

5. **[Major] Theme-D Quick Entry uses MMBtu; should use MT.** LNG physical trades are quoted in metric tonnes. MMBtu is a gas unit. The front-office thinks in cargoes (65,000 MT). Theme-F gets this right. **Fix:** Change Theme-D volume label to "Volume (MT)" and default to 65000. Keep MMBtu as a secondary display.

6. **[Major] No book/portfolio assignment in quick entry.** Trades without a book cannot be allocated. The blotter in Theme-D has a book column; the quick entry does not capture it. **Fix:** Add a Book dropdown (LNG-APAC, LNG-EUR, LNG-NAM, etc.) to the quick entry strip on both themes.

7. **[Major] No trader field in quick entry or Theme-D blotter.** The system cannot attribute P&L or enforce limits without knowing who traded. **Fix:** Add a Trader field (auto-populated from login, editable for delegation) to the quick entry strip. Add a Trader column to Theme-D blotter.

8. **[Major] No live prices on Theme-D dashboard.** The dashboard is the first screen of the day but shows no current JKM/TTF/HH prices. Theme-F has a ticker bar; Theme-D does not. **Fix:** Add a ticker bar or a "Current Prices" KPI row to the Theme-D dashboard.

9. **[Major] No current market price context on quick entry.** When entering a premium, I need to see what the base benchmark is trading at. Otherwise I have no idea if "+0.50" is reasonable. **Fix:** Show the current benchmark price (e.g., "JKM Jun: $12.45") inline next to the benchmark/premium fields. Update when benchmark or month selection changes.

10. **[Major] Blotter lacks grouping.** Cannot group by benchmark, portfolio, trader, or counterparty. On a 4-person desk with 30+ trades/day, a flat list becomes unmanageable by 11am. **Fix:** Enable AG Grid row grouping. Add a "Group by" dropdown in the toolbar with options for Benchmark, Trader, Portfolio, Status.

11. **[Major] Blotter lacks running totals.** No summary row showing total volume bought, total sold, net position. Every Bloomberg blotter has this. **Fix:** Enable AG Grid's built-in aggregation / pinned bottom row. Show sum of volume (split buy/sell), count of trades, net volume.

12. **[Major] No hedge ratio indicator in positions.** I can see my physical position but not how much is hedged. This is a daily risk management requirement. **Fix:** Add a hedge % row or column to the position ladder. Color-code: green >85%, amber 60-85%, red <60%.

13. **[Major] Theme-F blotter uses single-row selection.** `rowSelection: 'single'` prevents multi-select for bulk confirm, bulk cancel, or bulk nominate. **Fix:** Change to `rowSelection: 'multiple'` and add bulk action buttons in the toolbar.

14. **[Major] No detail drawer in Theme-F blotter.** Theme-D blotter has a detail drawer on Enter/double-click. Theme-F blotter has a context menu but no detail view. **Fix:** Port the detail drawer from Theme-D blotter into Theme-F. Open on double-click or Enter.

15. **[Major] Focus management after trade submission is wrong.** Theme-D sends focus to Buy button; Theme-F loses focus entirely. Neither is correct. **Fix:** After submission, focus should go to the Counterparty input field. The most common workflow is: enter trade -> enter next trade. Direction rarely changes between consecutive trades. Clearing + refocusing the cpty field minimizes keystrokes.

### Minor

16. **[Minor] No duplicate trade detection.** Submitting the same trade twice produces two identical rows with different ref numbers. **Fix:** Compare (counterparty, volume, benchmark, month, direction) against the last N trades. If a match is found within 30 seconds, show a "Possible duplicate -- submit anyway?" confirmation.

17. **[Minor] No Esc to clear the quick entry form.** Standard pattern: Escape clears current input and resets the form. **Fix:** Add a keydown listener for Escape that clears all quick entry fields and re-focuses the first field.

18. **[Minor] No keyboard shortcut to focus the search box.** `/` (slash) is the universal convention for "focus search" (Gmail, GitHub, Bloomberg). **Fix:** Add a `/` keydown handler (when not in an input) that focuses `#bl-search` or `#grid-search`.

19. **[Minor] Position ladder only shows 6 months.** LNG books commonly extend 12-24 months. Curves go out years. **Fix:** Make the month columns dynamic with a horizontal scroll. Show 12 months by default with the ability to extend.

20. **[Minor] Dashboard alerts have no actions.** "Credit limit breach: Shell exposure at 94%" -- what do I do? There is no "View Shell credit" link, no "Dismiss" button. **Fix:** Add a small action icon to each alert (link to the relevant page, dismiss button, or "acknowledge" checkbox).

21. **[Minor] Dashboard position ladder shows only 4 months.** The positions page shows 6. They should match or the dashboard should show a subset with "View full" link. **Fix:** Extend dashboard ladder to 6 months and add "View full positions ->" link.

22. **[Minor] Ticker bar animation is continuous and cannot be paused.** Scrolling text is distracting during focused work. **Fix:** Add pause-on-hover behavior. Add a toggle button (which Theme-F already has, but it fully hides the ticker rather than pausing it).

23. **[Minor] Theme-D counterparty autocomplete requires 2 characters.** If I type "S" I should immediately see "Shell". Requiring two characters adds a keystroke. **Fix:** Change the threshold from 2 to 1 character.

24. **[Minor] No column reorder persistence.** If I rearrange blotter columns to my preference, they reset on page load. **Fix:** Save column order and visibility to `localStorage`. Restore on page load.

25. **[Minor] Drill-down on positions page does not link back to blotter.** When I see trade T-2026-0147 in the drill-down, I should be able to click the ref to go to that trade's full detail. **Fix:** Make trade reference numbers in the drill-down panel clickable links to `blotter.html?ref=T-2026-0147` or open the detail drawer inline.

### Polish

26. **[Polish] Volume format inconsistency.** Theme-D positions uses uppercase K ("+800K"), Theme-F uses lowercase k ("+450k"). Pick one and use it everywhere. **Fix:** Standardize on lowercase "k" for thousands and uppercase "M" for millions across all pages.

27. **[Polish] Theme-F blotter has duplicate `id="col-panel"`.** The column toggle div has the id attribute specified twice in the HTML. **Fix:** Remove the duplicate `id="col-panel"` attribute.

28. **[Polish] Theme-D Quick Entry tabindex values start at 1.** The spec says tabindex="1" through "8", which overrides natural tab order and can conflict with shell elements. **Fix:** Remove explicit tabindex values and rely on DOM order, or use tabindex="0" for all interactive elements within the form.

29. **[Polish] Dashboard "Recent Trades" table is static HTML.** Unlike the AG Grid blotters, this is hand-coded table rows. No sorting, no filtering, no interaction. **Fix:** Either use a mini AG Grid instance or add click-to-navigate to each row.

30. **[Polish] Theme-F sidebar role selector does nothing.** Changing the role dropdown has no visible effect on the UI. **Fix:** Either implement role-based view filtering (e.g., Operations hides trading pages, Manager shows aggregated views) or remove the dropdown until it works.

---

## Recommendation: What to Build

The production front-office should combine:

- **Theme-D's density philosophy:** JetBrains Mono, 28px rows, minimal padding, no rounded card nesting. Every pixel shows data.
- **Theme-F's data model:** Portfolio, incoterm, type, full timestamps, pinned ID column. Real ETRM fields.
- **Theme-F's ticker bar:** Constant price context is non-negotiable.
- **Theme-F's Cmd+K palette and sidebar:** Professional navigation with badge counts.
- **Theme-D's keyboard design:** Tab order, B/S hotkeys, Enter-to-submit. Extend to all pages.

Fix the 4 blockers first (delivery terms, P&L column, keyboard positions, WACOG). Then the top 5 major issues (MT units, book assignment, trader field, live prices, blotter grouping). That gets the system from "promising prototype" to "I can run my desk on this."
