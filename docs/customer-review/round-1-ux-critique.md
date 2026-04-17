# Horizon UI Template Library -- Round 1 UX Critique

**Reviewer:** Principal UX Designer  
**Date:** 2026-04-11  
**Scope:** 6 themes (A-F), 10 pages sampled across dashboards, forms, grids, and specialised views  
**Verdict:** Theme F is the only production-ready candidate. Themes D and E are close. The rest are generic template-kit flavour, not enterprise tooling.

---

## Per-Page Scorecards

### 1. Theme A -- Dashboard (`theme-a/index.html`)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Hierarchy | 5/10 | Generic SaaS dashboard. KPI cards are undifferentiated -- "Total Revenue" and "Active Trades" given identical visual weight. No primary action visible. |
| Consistency | 6/10 | Tailwind utility classes used consistently within the page. Badge pill style (rounded-full, xs text) is well-maintained. |
| Interaction | 4/10 | No focus-visible styles defined. Hover states are basic opacity changes. No loading, empty, or error states. No keyboard shortcuts. |
| Polish | 5/10 | Sparklines are a nice touch but static SVG polylines have no tooltips. The bar chart is CSS-only rectangles with no values on hover. |

**Top 3 Issues:**

1. **No monospace on financial figures.** The `$4.28M`, `$2,450,000` values render in system-ui. For a trading platform, all numeric values must be in a tabular-nums monospace face. Fix: add `font-mono` to all `<td>` cells containing amounts, and specify `font-variant-numeric: tabular-nums` in the table styles.

2. **KPI cards lack sparkline context.** The small SVG sparklines have no axis, no tooltip, and no time context. A user cannot tell if `+12.5%` is today, this week, or this month. Fix: add a small `text-xs text-slate-400` duration label (e.g., "vs last month") beneath each badge.

3. **No primary CTA anywhere on the dashboard.** A trader landing here has no obvious path to the most frequent action (entering a trade). Fix: add a persistent "+ New Trade" button in the header, pinned right, styled as the primary action.

---

### 2. Theme B -- Dashboard (`theme-b/index.html`)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Hierarchy | 7/10 | Emerald-accent terminal aesthetic reads well. Price ticker gives immediate market context. KPI row at top, position heatmap below -- logical top-to-bottom flow. |
| Consistency | 7/10 | Monospace font used properly throughout. Emerald/red semantic pairing is maintained. Card borders and padding are uniform. |
| Interaction | 5/10 | Theme toggle works. Clock is live. But no keyboard shortcuts, no focus ring definitions, and the light-mode override block is a brittle pile of `!important` CSS. |
| Polish | 7/10 | The position heatmap with graduated opacity backgrounds (bg-emerald-500/20, /30, /40) is genuinely well-crafted for visual heat encoding. Header bar is compact (h-10). |

**Top 3 Issues:**

1. **Light mode is an afterthought.** Lines 399-420 are a block of `html:not(.dark)` overrides that manually remap every Tailwind class. This will break the moment any new element is added. Fix: refactor to use CSS custom properties (like Theme D does) so that light/dark are symmetric variable swaps, not class-by-class overrides.

2. **Sidebar labels use `opacity: 0` for collapsed state.** This means the text is still in the DOM, occupying space, just invisible. Screen readers will still announce it. Fix: use `display: none` or `visibility: hidden` (with `width: 0; overflow: hidden`) for proper accessibility.

3. **Ticker strip is static HTML.** The prices are hardcoded. There is a `ticker-scroll` animation but no mechanism to update data. Fix: the ticker should have a `data-*` attribute pattern or slot system for dynamic injection, and a `paused` state on hover so users can read values.

---

### 3. Theme C -- Dashboard (`theme-c/index.html`)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Hierarchy | 4/10 | Glassmorphism style prioritises aesthetics over data. The gradient welcome banner consumes 20% of above-the-fold space with "Good morning, Jonathan" -- useless in a trading context. |
| Consistency | 6/10 | Glass card styling is consistent. The nav-link active state uses violet consistently. Badge pills follow the same pattern. |
| Interaction | 5/10 | `card-hover` applies `transform: scale(1.02)` on every card -- including data cards. This is a consumer pattern, not an enterprise one. Data cards should not wiggle when hovered. |
| Polish | 5/10 | The conic-gradient donut chart is clever but unreadable without hover states. Five shades of violet for five categories is a discrimination nightmare. Plus Jakarta Sans is a good choice but is not loaded with a mono companion -- prices will render in proportional font. |

**Top 3 Issues:**

1. **No monospace font loaded or configured.** The Google Fonts import only loads `Plus Jakarta Sans`. Every financial figure on this dashboard renders in a proportional face. This is disqualifying for a trading UI. Fix: add JetBrains Mono or similar, apply `font-mono` to all numeric displays, and add `font-variant-numeric: tabular-nums`.

2. **Scale-on-hover animation on data cards.** The `.card-hover:hover { transform: scale(1.02) }` pattern creates visual instability on a dashboard that a trader will stare at for 8 hours. Fix: remove the scale transform entirely. Use a subtle `box-shadow` change or `border-color` shift if hover feedback is needed.

3. **Welcome banner wastes prime viewport real estate.** The gradient hero with "Good morning, Jonathan" has zero information density. Fix: replace with a condensed AI briefing summary (1-2 lines) or market status strip, or remove entirely. The date can go in the header.

---

### 4. Theme D -- Dashboard (`theme-d/index.html`)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Hierarchy | 8/10 | Excellent information density. JetBrains Mono everywhere. KPI row, position ladder, alerts, P&L attribution, hedge coverage, cargo pipeline, recent trades -- all above the fold on a 1080p screen. Clear section titles with uppercase tracking. |
| Consistency | 9/10 | The CSS custom property system (`--card-bg`, `--border`, `--text-0` through `--text-3`, `--green`, `--red`, `--amber`) is the most rigorous architecture in the library. Shared via `shell.css` and `shell.js`. |
| Interaction | 6/10 | The shell.js provides sidebar collapse, theme toggle, and page init. Focus-visible is defined in shell.css. But no loading states, no skeleton screens, no empty states for any widget. |
| Polish | 8/10 | The P&L attribution bar chart with inline dollar values is publication-quality. Hedge coverage progress bars use semantic colours (green/amber/red). Cargo pipeline stacked bar is compact and informative. Font size at 0.75rem base is aggressive but appropriate for a trading terminal. |

**Top 3 Issues:**

1. **Font size may be too small for extended use.** Base font is 0.75rem (12px). KPI labels are 0.5625rem (9px). While this maximises density, it will cause eye strain over an 8-hour trading session, especially on non-Retina displays. Fix: bump base to 0.8125rem (13px) and labels to 0.625rem (10px) minimum.

2. **Alert rows lack actionability.** The alerts section is display-only -- no click handlers, no dismiss buttons, no "mark as read". Fix: make each alert row a `<button>` or `<a>` that navigates to the relevant entity (trade, vessel, position). Add a dismiss/acknowledge action.

3. **No responsive fallback for the position ladder table.** On mobile, the table overflows horizontally without a scroll indicator. Fix: add `overflow-x: auto` wrapper (which exists) but also add a shadow gradient on the right edge to signal scrollability, a common pattern in enterprise data tables.

---

### 5. Theme E -- Dashboard (`theme-e/index.html`)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Hierarchy | 8/10 | Task-oriented "Pending Actions" cards at top create immediate call-to-action. Deadlines with countdown badges (1 day, 2 days, 5 days) are colour-coded red/amber/green. Month-end progress checklist is operationally useful. |
| Consistency | 8/10 | Clean, professional. Sidebar uses SVG icons consistently. Badge styles (rounded-full, semantic colours) identical across all instances. Card radius 0.75rem, shadow-sm, border pattern is uniform. |
| Interaction | 7/10 | Command palette (Cmd+K) is implemented. Sidebar sub-menus with chevron rotation work. Mobile responsive with sidebar transform. Toast notifications present on reconciliation page. |
| Polish | 7/10 | Breadcrumb navigation in header. User avatar with initials. Notification bell with red dot. This is the most "production application" feel of any theme. |

**Top 3 Issues:**

1. **Default to light mode is wrong for this domain.** The `class="light"` on `<html>` means it opens in light mode. LNG trading floors are typically low-light environments with multiple screens. Fix: default to `class="dark"` or use `prefers-color-scheme: dark` media query as the fallback, which the theme already supports but does not prioritise.

2. **Sidebar is fixed-width with no collapse option.** At 16rem (256px), the sidebar consumes significant space on smaller laptop screens. Theme F has a collapsible sidebar (15rem to 3.5rem). Fix: add a collapse toggle button that shrinks the sidebar to icon-only mode.

3. **No monospace font on numeric values in the activity feed.** Invoice numbers, trade IDs, and nomination codes in the activity feed use `font-mono text-xs bg-slate-100 px-1 py-0.5 rounded` which is correct -- but the amounts in the Deadlines section ("$45.6M") do not use monospace. Fix: apply `font-mono` consistently to all numeric/currency values.

---

### 6. Theme F -- Dashboard (`theme-f/index.html`)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Hierarchy | 9/10 | Role-based dashboard (Trader/Operations/Manager toggle) is a genuine product design decision. Price ticker, KPI cards, position ladder, alerts -- all correctly prioritised. The role toggle at top immediately changes the entire dashboard view. |
| Consistency | 9/10 | Uses Inter + JetBrains Mono pair throughout. Card pattern (rounded-xl, border, bg-white dark:bg-slate-800) is identical across all sub-pages. Badge, button, and input styles are remarkably consistent across dashboard, trade-form, and blotter. |
| Interaction | 8/10 | Cmd+K command palette. Sidebar collapse with smooth transition. Ticker toggle. Breadcrumbs. Sidebar accordion with notification badges. Toast system. AG Grid integration with right-click context menu, column visibility panel, status filter pills, and CSV export. |
| Polish | 9/10 | Gradient primary button (from-primary-600 to-violet-600) is distinctive without being distracting. The position impact preview panel on the trade form is a standout feature -- real-time hedge ratio and credit impact as you fill the form. |

**Top 3 Issues:**

1. **Trade form lacks inline validation feedback timing.** Validation fires `onblur` only. If a user tabs through quickly, they will not see errors until they come back. Fix: add real-time validation on `oninput` for numeric fields (price, volume) with a debounce of 300ms, showing errors as soon as the value is clearly wrong (e.g., negative price).

2. **Blotter AG Grid column definitions lack proper number formatting.** Volume shows `65000` but should show `65,000`. The `valueFormatter` does use `toLocaleString()` but the column width (100px) may truncate larger values. Fix: increase volume column width to 120px, and test with 6-digit volumes to ensure no clipping.

3. **The "All Themes" back-link is hardcoded as a fixed-position element on every page.** This is a development convenience that must be removed before any production use. It overlaps with the toast notification system (both at bottom-right). Fix: remove entirely, or gate behind a `?dev=true` query parameter.

---

### 7. Theme F -- Trade Form (`theme-f/trade-form.html`)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Hierarchy | 9/10 | Form sections are logically grouped: Direction, Counterparty, Pricing, Volume, Delivery. The Position Impact Preview panel on the right is a genuine differentiator. |
| Consistency | 9/10 | Input styling is pixel-identical to all other Theme F pages. Label pattern (`block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5`) is copy-paste consistent. |
| Interaction | 7/10 | Buy/Sell toggle with colour feedback. Counterparty autocomplete dropdown. Pricing type conditional fields (oil-indexed shows slope/constant). Port search with dropdown. Date validation. |
| Polish | 8/10 | The credit limit and utilisation display next to counterparty search gives immediate risk context. The hidden direction input with visible button toggle is a good pattern. |

**Top 3 Issues:**

1. **No keyboard shortcut to submit.** Ctrl+Enter to submit is a standard pattern in trading entry forms. Fix: add a `keydown` listener for `Ctrl+Enter` that triggers `submitTrade()`.

2. **Conditional pricing fields have no transition.** When switching from "Fixed Price" to "Oil-Indexed", the section just appears/disappears with `hidden`. Fix: add a `max-height` + `opacity` transition (like Theme E's sub-menus) for smoother progressive disclosure.

3. **Position Impact Preview does not update the hedge ratio bar in real-time.** The `updateImpact()` function is called `oninput` for volume, but the hedge ratio bar (`#hedge-bar`) width is hardcoded at `87%`. Fix: calculate new hedge ratio based on volume input and animate the progress bar width.

---

### 8. Theme E -- Trade Entry (`theme-e/trade-entry.html`)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Hierarchy | 8/10 | Clean form layout. Direction toggle (BUY/SELL) is prominent. Trade type and delivery terms are well-grouped. Sidebar panel shows related trades for context. |
| Consistency | 8/10 | Matches Theme E's design system exactly. Button styles, input styles, card containers -- all identical to the dashboard. |
| Interaction | 7/10 | BUY/SELL toggle with green/red active states. Combobox dropdown for counterparty. Field error states defined in CSS. |
| Polish | 7/10 | The `.toggle-btn.active-buy` / `.active-sell` colour classes are a good semantic approach. Error state CSS (`.field-error`, `.error-msg`) is well-structured. |

**Top 3 Issues:**

1. **Form has no progress indication.** With multiple sections (direction, counterparty, pricing, volume, delivery, cargo), the user has no sense of completion progress. Fix: add a step indicator or section-progress bar at the top of the form.

2. **No "Save as Draft" capability.** The only actions are Submit and presumably Cancel. A trade entry form for LNG deals (which can take hours to negotiate) needs draft saving. Fix: add a "Save Draft" secondary button next to Submit.

3. **Counterparty combobox dropdown appears on focus, disappears on blur with 150ms timeout.** This timeout is fragile -- a slow click on a dropdown item can miss the window. Fix: increase timeout to 200ms, or better, use `onmousedown` on dropdown items (which fires before `onblur`).

---

### 9. Theme F -- Blotter (`theme-f/blotter.html`)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Hierarchy | 9/10 | AG Grid integration is the correct choice for a trade blotter. Status filter pills above the grid. Search box. Column visibility toggle. Row count display. |
| Consistency | 9/10 | Grid theme (ag-theme-quartz / quartz-dark) switches with the app theme toggle. Badge styles inside cells match the rest of the app. |
| Interaction | 9/10 | Right-click context menu (View, Amend, Cancel). Quick filter search. Status filter pills. Column visibility toggle panel. CSV export. Row selection. |
| Polish | 8/10 | Trade data is realistic (24 rows with actual counterparty names, benchmarks, and prices). Cell renderers for Buy/Sell badges and status pills are well-implemented. |

**Top 3 Issues:**

1. **No pagination or virtual scrolling indicator.** With 24 rows the grid loads instantly, but with production data (thousands of trades), there is no indication of how pagination will work. Fix: add a footer bar showing "Showing 1-24 of 1,247 trades" with page controls.

2. **Context menu positioning does not account for viewport boundaries.** If you right-click near the bottom or right edge, the menu will overflow off-screen. Fix: add boundary detection that flips the menu direction when it would overflow.

3. **Column toggle panel has no "Reset to Default" option.** Once a user hides columns, there is no way to restore the default view. Fix: add a "Reset Columns" button at the bottom of the column visibility panel.

---

### 10. Theme E -- Reconciliation (`theme-e/reconciliation.html`)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Hierarchy | 9/10 | The side-by-side Provisional vs Final invoice comparison is excellent. Differences are highlighted with amber left-border (`.diff-highlight`). Summary shows variance amount and percentage. Auto-approval eligibility is clearly communicated. |
| Consistency | 8/10 | Follows Theme E patterns precisely. Badge for "Pending Reconciliation" uses the same amber pill as the rest of the app. Font-mono on all numeric values. |
| Interaction | 7/10 | Approve and Flag for Review buttons with toast feedback. Notes textarea for audit trail. Command palette available. |
| Polish | 8/10 | The diff highlighting pattern (amber left border + tinted background) is visually clear and accessible. Inline deltas (e.g., "-1,550", "-$0.03") in a smaller, amber-coloured span are well-executed. |

**Top 3 Issues:**

1. **No confirmation dialog before approval.** Approving a $45M invoice reconciliation is a consequential action. A single click should not complete it. Fix: add a confirmation modal: "Approve reconciliation of INV-2026-0042? Variance: -$118,041 (0.26%)".

2. **Breadcrumb trail is too deep.** Home > Settlement > Reconciliation > INV-2026-0042 is four levels. On mobile this overflows. Fix: collapse intermediate breadcrumbs on small screens (show "... > INV-2026-0042") or use a back arrow pattern instead.

3. **Notes textarea has no character count or submission timestamp.** For audit purposes, notes need to show who wrote them and when. Fix: display "Adding as J. Cobley" below the textarea, and add a timestamp to submitted notes.

---

## Cross-Theme Consistency Audit

### Architecture Patterns

| Aspect | Theme A | Theme B | Theme C | Theme D | Theme E | Theme F |
|--------|---------|---------|---------|---------|---------|---------|
| CSS Approach | Tailwind CDN inline | Tailwind CDN inline | Tailwind CDN inline | Custom CSS variables (shell.css) | Tailwind CDN inline | Tailwind CDN inline |
| Font Stack | System-ui | Inter + JetBrains Mono | Plus Jakarta Sans only | JetBrains Mono only | Inter only | Inter + JetBrains Mono |
| Monospace for Numbers | No | Yes | No | Yes | Partial | Yes |
| Dark Mode Method | class toggle + CSS overrides | class toggle + manual overrides | class toggle | data-theme attribute + CSS vars | class toggle | class toggle |
| Sidebar | Static 64px, hidden mobile | Collapsible hover-expand | Static 60px, mobile overlay | Collapsible via shell.js | Fixed 256px | Collapsible 240px to 56px |
| Command Palette | No | No | No | No | Yes (Cmd+K) | Yes (Cmd+K) |
| Shared Shell | No | No | No | Yes (shell.css + shell.js) | No (copy-paste) | No (copy-paste) |

### Critical Cross-Theme Findings

**1. Monospace for financial data is inconsistent across themes.**

Themes A and C have ZERO monospace font loaded. Theme E loads Inter but not a mono companion. Only B, D, and F correctly use JetBrains Mono for numeric values. This is the single most important typographic decision in a trading application. Columns of numbers must align vertically, and proportional fonts make this impossible.

**Recommendation:** Mandate Inter + JetBrains Mono as the standard pair. Every theme must use `font-variant-numeric: tabular-nums` on all numeric cells.

**2. No theme has loading, empty, or error states.**

Not a single page across all 6 themes shows what happens when: data is loading (skeleton screens), a section has no data (empty state illustration/message), or an API call fails (error state with retry). These are not optional for production -- they are the difference between a demo and a product.

**Recommendation:** Create a shared pattern library with skeleton card, empty state, and error banner components. Every widget must define all three states.

**3. Sidebar implementation is different in every theme.**

Six themes, six completely different sidebar architectures. Theme A uses a flex-col with `hidden md:flex`. Theme B uses a fixed sidebar with hover-expand animation. Theme D uses a shell.js-driven approach. Theme E uses a fixed sidebar with mobile transform. Theme F has the most complete collapsible sidebar. None share code.

**Recommendation:** Standardise on Theme F's sidebar pattern (collapsible, with accordion sub-menus and notification badges). Extract to a shared component.

**4. The "Back to All Themes" link is identical inline CSS across all 10 pages.**

Every single page has a fixed-position, inline-styled link at the bottom-right that says "All Themes". This is 8 lines of identical inline CSS pasted 60+ times across the library. Beyond being a maintenance nightmare, it occupies the toast/notification zone.

**Recommendation:** Remove from all pages. If needed for development, inject via a shared script that checks `location.search` for a `?gallery=true` parameter.

**5. Dark mode quality varies wildly.**

Theme D has the best dark mode -- purpose-built with CSS custom properties, every surface and text level deliberately chosen. Theme B has the worst -- a brittle pile of `html:not(.dark)` override selectors that will break with any change. Theme C's glassmorphism is attractive in light mode but the dark mode glass effect (`rgba(38,38,38,0.5)`) creates contrast ratio issues.

**Recommendation:** Adopt Theme D's CSS custom property architecture as the standard for light/dark theming. All surface, text, and border tokens should be defined as variables with light and dark values.

**6. Accessibility is not addressed by any theme.**

No theme defines:
- `aria-labels` on icon-only buttons
- `aria-current="page"` on active sidebar links
- `role="alert"` on alert/notification components
- Skip-to-content links
- Focus management for modals and command palettes
- Colour contrast ratios (the 9px labels in Theme D are likely below WCAG AA at 0.5625rem)

**Recommendation:** This is a compliance requirement, not a nice-to-have. Add an accessibility audit pass before any theme goes to production.

---

## Final Rankings

| Rank | Theme | Suitability for LNG ETRM | Key Strength | Key Weakness |
|------|-------|--------------------------|--------------|--------------|
| 1 | **Theme F** | Production-ready | Role-based views, command palette, AG Grid blotter, position impact preview | Form validation timing, no loading/error states |
| 2 | **Theme D** | Near-production | Best CSS architecture, highest information density, monospace throughout | Extremely small font, no sub-page templates yet |
| 3 | **Theme E** | Production-ready for back-office | Task-oriented dashboard, reconciliation view is excellent, command palette | No monospace, no sidebar collapse, light-mode default |
| 4 | **Theme B** | Good foundation | Terminal aesthetic fits trading, position heatmap is well-designed | Brittle light mode, no shared CSS architecture |
| 5 | **Theme A** | Generic template only | Clean, professional baseline | No domain awareness, no monospace, no density |
| 6 | **Theme C** | Wrong direction | Attractive visual design | Glassmorphism + scale animations + no monospace = anti-pattern for trading |

---

## Recommended Hybrid Approach

Take **Theme F** as the base and incorporate:

1. **Theme D's CSS custom property system** for light/dark mode theming
2. **Theme D's information density** and 0.75rem-base typography (bumped to 0.8125rem)
3. **Theme E's reconciliation and back-office pages** directly (they are already consistent enough to integrate)
4. **Theme B's position heatmap** colour encoding approach (graduated opacity backgrounds)

Discard Themes A and C entirely. They add nothing that the recommended hybrid does not already provide.
