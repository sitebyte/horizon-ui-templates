# Competitor Review: Horizon UI Template Library
## Round 1 -- Systems-Level Evaluation

**Reviewer:** James Okonkwo, Principal UX Architect, Blackthorn Digital
**Background:** 15 years UX architecture. 4 years UX Lead on Bloomberg Terminal redesign (2019-2023). 3 years leading design system at Macquarie Commodities. Currently advising 3 LNG trading houses on front-office platform selection.
**Date:** 11 April 2026
**Artifacts reviewed:** 10 files across Theme D, E, F and hub page. 63 pages total across 6 themes.

---

## Executive Summary

This is the most thoughtfully structured ETRM template library I have evaluated in the last 5 years. The role-adaptive dashboard in Theme F is genuinely novel -- I have not seen this pattern in Bloomberg, Allegro, or Endur. However, the library has a fundamental architectural split that would create real problems at enterprise scale: Theme D has a proper shared shell architecture (`shell.js`/`shell.css`) with a design token system, while Theme F -- the recommended production direction -- has 230+ lines of duplicated boilerplate per page with no token system and no extractable component library. The design INTENT is enterprise-grade. The design IMPLEMENTATION is still prototype-grade.

**Overall Score: 7.2/10** -- Strong enough to base a production system on. Not yet ready to hand to a 5-person dev team without significant architectural rework.

---

## 1. Design System Coherence

### Score: 5.5/10

### What exists

Theme D has a genuine design system:
- `shell.css` defines 40+ CSS custom properties across 5 background tiers (`--bg-0` through `--bg-4`), 4 text tiers (`--text-0` through `--text-3`), semantic colors (`--accent`, `--red`, `--green`, `--amber`), and component tokens for sidebar, header, card, input backgrounds.
- `shell.js` provides a shared sidebar builder, header builder, command palette, toast system, context menu, and theme toggle -- all driven from a single `MENU` data structure.
- Dark and light themes are fully tokenized with clean separation.
- AG Grid is overridden via `--ag-*` custom properties that reference the shell tokens.

Theme F has NO design system:
- Each page reinlines the full Tailwind configuration with identical `tailwind.config` blocks.
- Colors are hardcoded as Tailwind classes (`bg-slate-50 dark:bg-slate-900`, `text-emerald-600 dark:text-emerald-400`) throughout.
- The sidebar is copy-pasted across all 11 pages with identical ~150 lines of HTML.
- Shared functions (`initTheme`, `toggleSidebar`, `toggleAccordion`, `toggleTicker`, `openCmdK`, `closeCmdK`, `filterCmdK`, `setRole`, `showToast`) are reimplemented identically in every page.

Theme E has its own distinct conventions: different sidebar structure, `accent` defined as a Tailwind color (`#2563eb`), its own submenu toggle pattern. It is not compatible with either Theme D or Theme F without significant reconciliation.

### Issues

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 1.1 | **Critical** | Theme F has no shared shell -- 230+ lines duplicated per page. Any sidebar change requires editing 11 files. | Adopt Theme D's `shell.js`/`shell.css` architecture for Theme F immediately. This is the single highest-impact architectural improvement. |
| 1.2 | **High** | No design token system in Theme F. Colors are scattered Tailwind classes. A brand change (e.g., client wants blue instead of indigo) requires find-and-replace across every file. | Extract a token layer. Either use CSS custom properties (like Theme D) or a Tailwind theme config that is externalized. |
| 1.3 | **High** | Three incompatible component conventions across D, E, F. Button classes, card classes, status badge classes are all different between themes. | Consolidate into a single component vocabulary. Theme D's BEM-like naming (`hz-btn`, `hz-card`, `hz-input`) is the cleanest. |
| 1.4 | **Medium** | AG Grid is configured differently across themes -- Theme D uses `ag-theme-quartz`/`ag-theme-quartz-dark`, Theme E uses `ag-theme-alpine`. | Standardize on one AG Grid theme with token overrides. Quartz is the better choice for new projects. |
| 1.5 | **Medium** | Icon approach is inconsistent. Theme D uses inline SVG paths in a JS dictionary. Theme F uses inline SVGs directly in HTML. Theme E uses inline SVGs with different path sets. | Standardize. For vanilla JS templates, Theme D's dictionary approach is the most maintainable. For React conversion, use a proper icon library. |
| 1.6 | **Low** | Font inconsistency. Theme D uses JetBrains Mono everywhere (monospace-first). Theme E/F use Inter for UI, JetBrains Mono for data. | The E/F approach (Inter for chrome, mono for data) is correct for ETRM. Standardize on this. |

### Verdict

There IS a system trying to emerge -- Theme D's `shell.js`/`shell.css` is genuinely well-architected. But the recommended production theme (F) did not adopt it. A team of 5 developers handed these templates today would waste their first 2 weeks just reconciling the three architectures. The resume.md acknowledges this ("Week 3 Fixes: Shared shell architecture -- adopt Theme D's shell.js/shell.css pattern for Theme F"), which is a good sign, but it should have been done before declaring Theme F "recommended."

---

## 2. Scalability Patterns

### Score: 7.5/10

### What works well

**AG Grid integration is production-ready.** The blotter in Theme F demonstrates:
- `getRowId` for stable row identity (critical for real-time updates)
- Null-safe `valueFormatters` with fallback to en-dash
- XSS prevention via `escapeHtml()` in cell renderers
- External filtering (`isExternalFilterPresent`/`doesExternalFilterPass`) for status pills
- Context menu on right-click with proper positioning and off-screen adjustment
- CSV export
- Column visibility toggle panel
- Quick filter search

These are not toy patterns. This is how a real trading blotter works.

**MTM and P&L calculations are correctly positioned.** The blotter calculates MTM as `(spot - price)` for buys and `(price - spot)` for sells, with a running total in the header. The `formatPnlSuffix` function handles M/K abbreviations. This is the correct approach for a mark-to-market blotter.

**The cascading nomination form (Theme F) demonstrates real domain understanding.** Contract selection populates cargo options, which populates volume/dates, which enables vessel selection, which populates ETA based on loading port. This is exactly how nominations work in LNG trading. The data structure is correct (SPA contracts have multiple cargoes, spot contracts have one).

### Issues

| # | Severity | Issue | Recommendation |
|---|----------|-------|---|
| 2.1 | **High** | Blotter has 24 hardcoded rows. No virtualization testing. AG Grid handles this natively, but the column definitions include `cellRenderer` functions that create DOM elements -- these need to be tested at 500-1000 rows to verify scroll performance. | Add a "load 500 trades" button for performance testing. Verify that the custom cell renderers (Buy/Sell badges, status pills, P&L coloring) do not cause jank at scale. |
| 2.2 | **High** | The counterparty combobox in quick entry is a simple filter-as-you-type dropdown with 15 hardcoded entries. At 50+ counterparties with legal entity names, this pattern needs: virtualized list, keyboard navigation (arrow up/down, enter to select), grouping by parent entity, and type-ahead match highlighting. | Replace with a proper combobox component. The resume acknowledges this as a Week 2 fix. |
| 2.3 | **Medium** | Position ladder in the dashboard shows 3 benchmarks x 4 months = 12 cells. A real desk has 3-5 benchmarks x 12-24 months = 36-120 cells. The current table layout will not hold. | Switch to AG Grid or a purpose-built matrix component for the position ladder. Add horizontal scrolling with sticky benchmark column. |
| 2.4 | **Medium** | The command palette (`Cmd+K`) uses simple string matching (`includes`). At scale with 50+ pages, 200+ entities, and search-by-trade-ID, this needs fuzzy matching, result ranking, and entity-type grouping. | Implement fuzzy search (e.g., Fuse.js) with result categories: Pages, Trades, Counterparties, Cargoes. |
| 2.5 | **Medium** | No pagination or infinite scroll on any list view. The nomination schedule table appends DOM rows with `innerHTML`. At 100+ nominations this will be slow and inaccessible. | Use AG Grid for the nomination schedule, consistent with the blotter and invoice pages. |
| 2.6 | **Low** | The price ticker scrolls via CSS animation at a fixed rate. Real ticker data arrives at variable rates. The current implementation duplicates the ticker content for seamless looping -- this is the correct technique but needs a data-driven approach for production. | Acceptable for templates. Will need WebSocket integration for production. |

### Verdict

The scalability patterns are sound in concept. AG Grid is the right choice, and it is used correctly where it appears. The concern is that some views (position ladder, nomination table) use hand-rolled HTML tables that will not scale. The templates correctly identify where the scaling pain will occur -- the resume's Week 2/3 fix list addresses most of these.

---

## 3. Information Architecture

### Score: 7.0/10

### What works well

**The three-tier menu structure in Theme F is excellent:**
- Trading: Dashboard, Quick Entry, Blotter, Positions, Curves (with sub-items), Hedge Book
- Operations: Cargo Board, Nominations (with sub-items: ADP Schedule, Cargo Nominations, Vessel Nominations)
- Settlement: Invoice Queue (with badge count), Reconciliation
- Admin: Contracts, Settings

This maps correctly to LNG ETRM workflows. The grouping reflects how real trading operations are organized: front-office (Trading), middle-office (Operations), back-office (Settlement), and administration.

**The role selector in Theme F is the standout IA innovation.** Switching between Trader/Operations/Manager changes the dashboard content without changing the navigation structure. This is the right pattern -- the navigation is stable (everyone can access everything within their permissions), but the landing experience is tailored to the role.

**Notification badges on menu items** (Nominations: 2 pending, Invoice Queue: 3 pending) provide at-a-glance workflow awareness without requiring the user to navigate into each section.

### Issues

| # | Severity | Issue | Recommendation |
|---|----------|-------|---|
| 3.1 | **High** | No deep linking or URL-based state. The role selector, accordion states, and filter states are all JavaScript-managed with no URL reflection. A user cannot bookmark "Blotter filtered to Pending trades" or share a link to "Manager dashboard." | Every view state change should update the URL hash or query parameters. This is essential for multi-screen workflows and team collaboration. |
| 3.2 | **High** | The Favorites section is always empty ("No pinned items"). If this feature is not implemented, remove it -- empty states in navigation are confusing. If it IS the plan, define the interaction for pinning items. | Either implement drag-to-pin or right-click-to-pin, or remove the section until it works. |
| 3.3 | **Medium** | Theme E's menu hierarchy (Settlement > Invoice Queue > Provisional/Final/Disputed) shows sub-items that all link to the same page. This is filtering pretending to be navigation. | Use a single "Invoice Queue" link and handle Provisional/Final/Disputed as filter tabs within the page (which the page already does with filter pills). Sub-menu items should only exist when they lead to genuinely different views. |
| 3.4 | **Medium** | No breadcrumb trail in Theme D. Theme E and F have breadcrumbs but they are static HTML, not generated from navigation state. | Breadcrumbs should be auto-generated from the menu hierarchy and current page. This is straightforward with Theme D's `MENU` data structure. |
| 3.5 | **Medium** | The hub page (`index.html`) uses a completely different technology stack (Tailwind CDN with `dark` class toggle) from Theme D (CSS custom properties with `data-theme`). The hub will need to be reconciled when the system ships. | Minor issue -- the hub is a development tool, not a production page. But it should use the same theme mechanism for consistency during demos. |
| 3.6 | **Low** | 5x feature growth test: Could this menu hold 60+ items (the ETRM menu hierarchy mentioned in the resume)? The current sidebar is 15rem wide and uses single-level accordions. At 60 items with 2-3 levels of nesting, the sidebar would need to scroll significantly. | Consider a two-panel navigation pattern: persistent top-level categories in a narrow rail, with a flyout panel for sub-items. This is what Bloomberg BQL uses and it scales to 200+ functions. |

### Multi-screen assessment

The current templates assume a single-browser-window workflow. For traders who routinely use 2-6 monitors:
- There is no mechanism to pop out views into separate windows
- The sidebar consumes 15rem on every screen (wasteful when you have 6 monitors)
- No tab system for opening multiple trades/cargoes side by side
- No workspace save/restore functionality

This is expected for HTML templates but should be flagged as a critical feature gap for the React implementation.

---

## 4. Accessibility and Inclusivity

### Score: 4.5/10

### What works

- `lang="en"` is set on all HTML roots
- `<meta name="viewport">` is present everywhere
- `:focus-visible` is styled in Theme D's shell.css with a cyan outline
- Responsive breakpoints exist at 48rem (768px) with sidebar collapse
- All font sizes use rem units (no px anywhere -- this is excellent and unusual)

### Issues

| # | Severity | Issue | Recommendation |
|---|----------|-------|---|
| 4.1 | **Critical** | No ARIA landmarks. Sidebars are `<aside>` (correct) but have no `role="navigation"` or `aria-label`. Main content areas are `<main>` (correct). Headers are `<header>` (correct). But interactive widgets (command palette, dropdown menus, accordions) have no ARIA attributes at all. | Add `role="dialog"` and `aria-modal="true"` to command palette. Add `aria-expanded` to accordion buttons. Add `role="listbox"` and `aria-selected` to combobox dropdown. Add `role="menu"` and `role="menuitem"` to context menus. |
| 4.2 | **Critical** | No keyboard navigation for the command palette results. Theme D's `shell.js` correctly implements arrow key navigation in the command palette (lines 355-357), but Theme F's command palette has NO keyboard navigation -- only mouse click on results. | Implement arrow-key result navigation, Enter to select, Escape to close in Theme F's command palette. Copy from Theme D's implementation. |
| 4.3 | **Critical** | The counterparty combobox dropdown uses `onmousedown` for selection. There is no keyboard support -- no arrow keys, no Enter, no Escape to close. A keyboard-only user cannot select a counterparty. | This is a blocker for accessibility audit. Implement full combobox ARIA pattern (WAI-ARIA Combobox). |
| 4.4 | **High** | Color contrast concerns. The muted text colors (`text-slate-400`, `text-slate-500`) on both light and dark backgrounds may fail WCAG AA (4.5:1 ratio). `text-[0.625rem]` (10px equivalent) on many labels is below WCAG minimum of 12px for body text. | Audit all text colors against backgrounds using a contrast checker. Increase minimum font size to 0.75rem (12px) for all readable text. 0.625rem is acceptable only for decorative labels. |
| 4.5 | **High** | Toggle switches in settings.html use custom `div.toggle-track` with `onclick`. These have no `role="switch"`, no `aria-checked`, no keyboard operability (cannot Tab to them, cannot press Space/Enter to toggle). | Replace with `<button role="switch" aria-checked="true/false">` pattern. |
| 4.6 | **High** | Status badges in AG Grid cells use color alone to convey meaning (green = Confirmed, amber = Pending, red = Cancelled). Users with color vision deficiency cannot distinguish these. | Add text labels (which exist) AND ensure the text itself differs. Currently this IS done with text ("Confirmed", "Pending", "Cancelled") so severity is medium, but the Buy/Sell badges (green "B", red "S") rely on color alone. Add "Buy"/"Sell" as screen-reader text. |
| 4.7 | **Medium** | No skip-to-content link. Users navigating with screen readers or keyboard must Tab through the entire sidebar on every page load. | Add a visually hidden skip link as the first focusable element. |
| 4.8 | **Medium** | The ticker bar uses CSS animation (`ticker-scroll`) with no `prefers-reduced-motion` media query. Users with vestibular disorders may find the constant scrolling motion disorienting. | Add `@media (prefers-reduced-motion: reduce) { .ticker-scroll { animation: none; } }` |
| 4.9 | **Low** | No high-contrast mode support. Theme D's dark theme is good for low-light environments but does not address users who need maximum contrast. | Consider a "High Contrast" option alongside Dark/Light. |

### Procurement audit prediction

This template library would **fail** a standard enterprise procurement accessibility audit (Section 508, EN 301 549, WCAG 2.1 AA). The missing ARIA attributes on interactive widgets (4.1-4.3) are the primary blockers. The color contrast issues (4.4) and non-keyboard-operable controls (4.5) are secondary blockers. Estimated remediation: 2-3 weeks of focused accessibility work, primarily on interactive components.

---

## 5. Developer Experience

### Score: 6.5/10

### What works

- **Pure HTML/CSS/JS with no build step.** Any developer can open these files in a browser and start working immediately. This is a genuine advantage for rapid prototyping and stakeholder review.
- **Tailwind CDN.** Zero configuration. Fast iteration.
- **AG Grid Community CDN.** Working grids with sort, filter, selection, and export in minutes.
- **Consistent file naming** across themes (`index.html`, `blotter.html`, `quick-entry.html`, `settings.html`, `nominations.html`, `invoices.html`).
- **The resume.md is excellent.** It is the best project resume I have seen for a template library -- it describes current state, review history, fix status, next steps, and technology choices clearly.

### Issues

| # | Severity | Issue | Recommendation |
|---|----------|-------|---|
| 5.1 | **High** | React translation cost is significant. Theme F's pages are monolithic HTML files with inline scripts. The sidebar, header, ticker, command palette, toast, and theme toggle would each need to become React components. Tailwind classes would largely carry over, but all the interactive logic (combobox, cascading forms, role switching, confirmation bar) needs to be rewritten in React idioms (hooks, state, effects). | Estimate 3-4 weeks of React conversion for Theme F's 11 pages. Recommend starting with the shell (sidebar, header, command palette) as shared components, then converting pages one at a time. |
| 5.2 | **High** | No component documentation. The patterns (cascading form, confirmation bar, role-adaptive dashboard, inline grid editing) are demonstrated by example only. There is no explanation of WHEN to use each pattern, WHAT the variants are, or HOW they compose. | Create a pattern catalog page within the template library itself. Each pattern should show: when to use, anatomy diagram, states (loading, empty, error, populated), keyboard interactions. |
| 5.3 | **Medium** | No error/loading/empty states. Every page shows the "happy path" with fully populated data. A developer implementing these templates has no guidance on what to show when: API call is in flight, API returns an error, data set is empty, user has no permissions. | The resume acknowledges this. It is the most important template gap after the shared shell. |
| 5.4 | **Medium** | AG Grid configuration is not abstracted. Each page defines its own `columnDefs`, `gridOptions`, theme swap logic, and event handlers from scratch. Common patterns (status pill renderer, amount formatter, date formatter) are reimplemented. | Extract AG Grid helpers: `createStatusRenderer(colorMap)`, `currencyFormatter(field)`, `createBlotterGrid(el, columns, data, options)`. |
| 5.5 | **Medium** | The CSS architecture is not translatable to CSS Modules or styled-components without effort. Theme D's shell.css uses BEM-like naming which works well. Theme F uses Tailwind utility classes exclusively, which translate cleanly to React + Tailwind but not to other CSS architectures. | Not a blocker if the React stack uses Tailwind. Would be a problem if the team prefers CSS Modules. |
| 5.6 | **Low** | No TypeScript types for the data models. The `tradeData`, `invoiceData`, `contractData`, and `vessels` arrays define implicit schemas that would need to be formalized. | Create TypeScript interfaces for Trade, Invoice, Nomination, Vessel, etc. during React conversion. |

### Verdict

A competent React team could convert Theme F into a working application in 4-6 weeks. The templates are clear enough that a developer can understand the intent without calling the designer back every day -- with one exception: the role-adaptive dashboard is subtle enough that it needs documentation. The biggest DX win would be adopting Theme D's shell architecture, which would cut the conversion scope by 30%.

---

## 6. Bloomberg Comparison

### What Bloomberg does better

I spent 4 years on the Terminal redesign. Here is what Bloomberg has that these templates do not:

| # | Bloomberg Advantage | Specific Gap |
|---|---|---|
| 6.1 | **Keyboard-everything.** Bloomberg users NEVER touch a mouse for routine operations. Every function, every field, every navigation action has a keyboard shortcut. The Horizon templates have Cmd+K and B/S for buy/sell, but the nomination form, contract wizard, invoice approval -- none of these are keyboard-operable beyond basic Tab. | The quick entry strip is the only keyboard-first interface. Everything else is mouse-first with keyboard as afterthought. |
| 6.2 | **Function chaining.** Bloomberg lets you type `JERA <Corp> DES <Go>` to navigate directly to a specific counterparty's delivery schedule. Horizon's Cmd+K is page-level navigation only -- you cannot navigate to "Shell's June cargoes" or "T-1024 trade detail." | The command palette needs entity-aware search: type "Shell" and see Shell's trades, cargoes, invoices, credit utilization. |
| 6.3 | **Multi-window workspace management.** Bloomberg lets you save window layouts across 4-6 monitors and restore them on login. Each function runs in its own panel. Traders customize their workspace over months. | No multi-window, no workspace save, no panel-based layout. This is expected for a web app but is the #1 feature traders will ask for. |
| 6.4 | **Real-time data streaming.** Bloomberg grids update in real-time via WebSocket. Rows flash on change. Prices tick up/down with color indication. The Horizon blotter is static -- data is loaded once and never refreshes. | The ticker bar simulates this with CSS animation. Real implementation needs WebSocket + AG Grid transaction API (which the blotter is already set up for via `applyTransaction`). |
| 6.5 | **Audit trail on everything.** Every field change in Bloomberg is logged with who/when/why. The Horizon templates have no audit trail UI (Theme E has an audit log page, but it is a separate view, not inline on every entity). | Need a "History" tab or panel on every trade, invoice, and nomination that shows field-level change history. |
| 6.6 | **Alert system.** Bloomberg ALRT lets you set price alerts, volume alerts, deadline alerts with push notifications across all devices. Horizon's settings page shows notification toggles but there is no alert creation or delivery mechanism. | Alerts should be a first-class entity with creation UI, trigger conditions, and delivery channel selection. |

### What Horizon does better than Bloomberg

| # | Horizon Advantage | Why It Matters |
|---|---|---|
| 6.7 | **Modern visual design.** Bloomberg is brutally ugly -- even the 2019-2023 redesign only brought it to "tolerable." Horizon's Theme F is genuinely attractive with proper spacing, rounded corners, gradient accents, and clean typography. Enterprise trading software does not have to look like a 1990s DOS application. | Younger traders (under 35) increasingly reject Bloomberg's aesthetic. A modern UI is a competitive differentiator for ETRM vendors. |
| 6.8 | **Role-adaptive dashboard.** Bloomberg has no concept of role-based UI adaptation. Every user sees the same interface. Horizon's Trader/Operations/Manager toggle is a pattern I have never seen in any ETRM -- it acknowledges that different roles need different information architectures. | This is genuinely novel and should be expanded. The sidebar could also adapt (show/hide sections based on role). |
| 6.9 | **Dark/light theme toggle.** Bloomberg is dark-only. The 2019 redesign attempted a light mode but it was abandoned. Horizon supports both modes across all 63 pages with consistent token mapping. | Traders in bright offices or with visual impairments benefit from a light mode. This is a real accessibility win. |
| 6.10 | **Cascading form pattern.** Bloomberg's forms are flat -- you fill in every field independently. Horizon's nomination form cascades from contract to cargo to vessel, pre-filling downstream fields and calculating ETA. This reduces errors and speeds data entry. | The cascading pattern should be applied to trade entry, invoice creation, and cargo booking as well. |
| 6.11 | **Confirmation step with undo.** Bloomberg has no undo for trade entry. Once you hit Enter, the trade is submitted. Horizon's quick entry shows a confirmation bar with a 5-second undo window. This is a significant accuracy improvement. | Extend this pattern to all destructive actions: cancellations, status changes, bulk approvals. |
| 6.12 | **Command palette.** Bloomberg has no Cmd+K equivalent. Navigation is via function codes (DES, BQ, ALRT) typed into a command line. Horizon's searchable command palette is more discoverable while still supporting keyboard-first users. | The command palette should become the primary power-user interface. Add entity search, recent items, and contextual actions. |

---

## 7. System-Level Risks

### Risk 1: Architecture Divergence (Severity: Critical)

The recommended path is to "merge best of D/E into F." But D and F have fundamentally different CSS architectures (custom properties vs. Tailwind utilities), different JavaScript patterns (shared shell module vs. inline scripts), and different AG Grid themes (Quartz vs. Alpine vs. Quartz). Merging these is not a styling exercise -- it is an architecture decision. If done poorly, the result will be a Frankenstein system that inherits the worst of each approach.

**Recommendation:** Pick ONE architecture. Theme D's shell approach is better for long-term maintenance. Rewrite Theme F's pages to use it. Do not attempt to "merge."

### Risk 2: Tailwind CDN Dependency (Severity: High)

Every page loads Tailwind from `cdn.tailwindcss.com`. This is acceptable for templates but creates three production risks:
1. **Performance:** The CDN JIT compiler processes the entire page's class list on load. On complex pages this causes a visible flash of unstyled content.
2. **Reliability:** A CDN outage makes the entire application unusable.
3. **Security:** Loading external JavaScript from a CDN is a supply-chain attack vector that most enterprise security teams will flag.

**Recommendation:** Move to a local Tailwind build during React conversion. This is standard practice and not controversial, but it means the templates cannot be used as-is in production.

### Risk 3: No State Management Pattern (Severity: High)

The templates use vanilla JavaScript with DOM manipulation. There is no state management -- the role selector toggles CSS classes, the confirmation bar uses a global `pendingTrade` variable, the grid state is managed by AG Grid's internal API. When this converts to React, every interactive pattern needs to be rethought in terms of component state, props, and hooks. The current JavaScript is not refactorable -- it must be rewritten.

**Recommendation:** Accept this cost. The templates serve their purpose as visual and interaction specifications. The React implementation should use TanStack Query for server state and local component state (or Zustand) for UI state.

### Risk 4: No Error Boundary Patterns (Severity: High)

There are no loading states, error states, empty states, or error boundaries anywhere in the templates. When the first API call fails in production, developers will have to invent these patterns on the fly, leading to inconsistency.

**Recommendation:** Create a "states" page in the template library showing: skeleton loading, error banner with retry, empty state with call-to-action, and stale-data indicator. This is the most impactful single addition to the template library.

### Risk 5: AG Grid License Model (Severity: Medium)

The templates use AG Grid Community. Several features that LNG trading desks will require are Enterprise-only:
- Column grouping (essential for position ladders with physical/paper split)
- Row grouping (essential for blotter grouped by benchmark or counterparty)
- Clipboard operations (traders live in copy-paste workflows)
- Excel export (back-office standard)
- Server-side row model (required at 10,000+ rows)

**Recommendation:** Budget for AG Grid Enterprise license ($1,495/developer/year). The templates correctly use Community features only, so the upgrade path is clean.

### Risk 6: No Internationalization Foundation (Severity: Low, but systemic)

All text is hardcoded in English. Number formats use `toLocaleString()` (which is correct) but date formats are inconsistent (some use `2026-04-11`, some use `12 Apr 26`). Currency is always USD with `$` prefix. An LNG trading desk in Tokyo or Geneva will need localization.

**Recommendation:** Not a blocker for initial deployment. But establish i18n patterns (date format tokens, currency format utilities, translatable string extraction) during React conversion.

---

## Scorecard Summary

| Dimension | Score | Weight | Weighted |
|---|---|---|---|
| Design System Coherence | 5.5/10 | 20% | 1.10 |
| Scalability Patterns | 7.5/10 | 20% | 1.50 |
| Information Architecture | 7.0/10 | 20% | 1.40 |
| Accessibility & Inclusivity | 4.5/10 | 15% | 0.68 |
| Developer Experience | 6.5/10 | 15% | 0.98 |
| Bloomberg Comparison (net) | 8.0/10 | 10% | 0.80 |
| **Overall** | | | **6.45/10** |

Adjusted for trajectory (the team is moving in the right direction, the resume shows self-awareness of gaps): **7.2/10**

---

## Top 5 Recommendations (Priority Order)

1. **Adopt Theme D's shared shell for Theme F.** This is the single most impactful change. It eliminates duplication, establishes a token system, and makes the template library feel like a system rather than a collection of pages. Estimated effort: 1 week.

2. **Add loading/empty/error state templates.** Create a "states" page showing skeleton loaders, error banners, empty states, and stale-data indicators for every component type (card, grid, form, chart). Estimated effort: 3 days.

3. **Fix accessibility blockers.** Add ARIA attributes to interactive widgets (command palette, combobox, accordions, toggle switches). Add keyboard navigation to command palette results and counterparty dropdown. Add skip-to-content link. Add `prefers-reduced-motion` for ticker. Estimated effort: 1 week.

4. **Create a pattern documentation page.** Document when to use quick entry vs. full form vs. wizard vs. cascading form vs. inline grid edit. Show the decision tree. Include keyboard interaction specifications. Estimated effort: 2 days.

5. **Implement deep linking.** All view states (role, filters, accordion states, active tab) should be reflected in the URL. This enables bookmarking, sharing, and multi-window workflows. Estimated effort: 3 days.

---

## Conclusion

The Horizon template library demonstrates genuine domain expertise and design ambition. The role-adaptive dashboard, cascading nomination form, confirmation-with-undo pattern, and AG Grid integration are all patterns I would recommend to my clients. The visual quality surpasses every ETRM I have evaluated except Amphora (which costs $2M to implement).

The gap is architectural, not visual. Theme D has the right architecture with inferior aesthetics. Theme F has the right aesthetics with no architecture. The merge path is clear and the team appears to understand this. My recommendation to our clients: **proceed to a structured evaluation with the Horizon team, conditional on seeing the shared shell adoption and accessibility remediation completed.** If those two items ship within 4 weeks, this template library moves from "interesting" to "investable."

---

*James Okonkwo*
*Principal UX Architect, Blackthorn Digital*
*j.okonkwo@blackthorndigital.com*
