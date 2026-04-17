# Round 1: Frontend Craft Review -- Horizon UI Templates (theme-f + theme-d shell)

**Reviewer:** Senior Front-End Engineer (6 yrs Citadel trading UIs, 3 yrs commodities)
**Date:** 2026-04-11
**Scope:** JavaScript quality, AG Grid config, form controls, CSS architecture, performance, accessibility
**Files reviewed:** blotter.html, quick-entry.html, invoices.html, trade-form.html, positions.html, nominations.html, shell.js, shell.css

---

## Executive Summary

These templates demonstrate strong domain knowledge -- the data models, column definitions, and workflows are clearly from someone who understands LNG ETRM. The AG Grid configs are sensible, the combobox and cascading-form patterns are correct in the happy path, and theme-d's shell.js/shell.css represents a genuine architectural improvement over theme-f's copy-paste approach. However, there are material gaps in edge-case handling, accessibility, memory management, and production hardening that would need to be addressed before shipping to a trading desk. The biggest systemic issue is that theme-f duplicates ~200 lines of boilerplate (sidebar, header, theme, CMD+K, toast) across every page -- theme-d solves this correctly.

---

## Per-Page Scores

| Page | Code Quality | Production-Readiness | React-Translatable | Edge Cases |
|------|:---:|:---:|:---:|:---:|
| blotter.html | 7 | 5 | 7 | 5 |
| quick-entry.html | 6 | 5 | 7 | 4 |
| invoices.html | 7 | 5 | 7 | 5 |
| trade-form.html | 7 | 5 | 8 | 5 |
| positions.html | 7 | 6 | 8 | 6 |
| nominations.html | 6 | 5 | 7 | 4 |
| shell.js | 8 | 7 | 9 | 7 |
| shell.css | 9 | 8 | 9 | 8 |

---

## Section 1: AG Grid Quality

### What works well
- Column definitions are realistic for LNG trading: tradeId, side, counterparty, volume, benchmark, price, delivery, incoterm, portfolio, status, trader, timestamp. These map cleanly to the domain model in `backend/horizon/domain/trade/`.
- `ag-grid-community@31.3.2` is a recent stable version. Using the Quartz theme (the modern one) rather than the legacy Alpine is the right call.
- `rowHeight: 30-36` and `headerHeight: 32-36` are correct for data-dense trading screens -- compact enough for scanning, tall enough for the status pill renderers.
- External filter pattern (`isExternalFilterPresent` / `doesExternalFilterPass`) for status tabs is correct AG Grid usage.
- `applyTransaction` for adding/updating rows (quick-entry, cancel action) is the performant path -- not resetting rowData.
- Quick filter (`setGridOption('quickFilterText', ...)`) is correctly used on the blotter search input.
- CSV export via `exportDataAsCsv` is correct.
- Theme switching (`ag-theme-quartz` / `ag-theme-quartz-dark`) is done by toggling CSS classes, which is the documented approach.

### Issues

**1. Cell renderers return raw HTML strings -- not components** [Severity: Medium]

Every cell renderer (side badge, status pill) returns an HTML string:
```js
cellRenderer: p => p.value === 'B'
  ? '<span class="inline-flex items-center...">'
  : '<span class="inline-flex items-center...">'
```
This works in AG Grid Community but (a) prevents AG Grid from efficiently reusing DOM nodes on scroll, (b) means no event binding inside cells, and (c) in a React translation, these would need to become `cellRendererFramework` components. Not a bug, but it sets a performance ceiling around ~5,000 rows before the HTML parsing overhead becomes noticeable.

**Fix:** When translating to React, convert all `cellRenderer` functions to proper React components using `cellRenderer: SideBadge`. For the template stage, this is acceptable.

**2. No `getRowId` configured** [Severity: High]

None of the grids define `getRowId`. AG Grid needs this to efficiently reconcile rows during `applyTransaction`. Without it, AG Grid falls back to object reference identity, which breaks when row data objects are mutated in place (which `ctxAction('cancel')` does -- it mutates `selectedRow.status` directly).

```js
// Missing from all gridOptions:
getRowId: params => params.data.tradeId  // or invoiceId, etc.
```

**Fix:** Add `getRowId` to every grid. Use the natural business key (tradeId, invoiceId).

**3. Direct row data mutation in ctxAction** [Severity: High]

```js
if (action === 'cancel') {
  selectedRow.status = 'Cancelled';
  gridApi.applyTransaction({ update: [selectedRow] });
}
```

The code mutates the data object directly, then passes it to `applyTransaction`. This works by accident because without `getRowId`, AG Grid uses reference identity. But it violates AG Grid's data contract (rows should be treated as immutable) and will break if `getRowId` is added, because the update relies on the same object reference. In a React translation, this would cause stale-closure bugs.

**Fix:** Clone the row before mutation: `const updated = { ...selectedRow, status: 'Cancelled' };`

**4. `animateRows: true` is deprecated in AG Grid 31+** [Severity: Low]

In AG Grid 31, row animations are on by default. Setting `animateRows: true` is harmless but generates a console warning.

**Fix:** Remove `animateRows: true` from all gridOptions.

**5. `rowSelection: 'single'` / `'multiple'` string syntax** [Severity: Low]

AG Grid 31 prefers the object syntax `rowSelection: { mode: 'singleRow' }`. The string form still works but is deprecated.

**Fix:** Update to `rowSelection: { mode: 'singleRow' }` or `{ mode: 'multiRow', checkboxes: true }` for invoices.

**6. No column state persistence** [Severity: Medium]

Traders customize column widths, order, and sort constantly. There is no save/restore of column state to localStorage. On page refresh, everything resets.

**Fix:** Add `onColumnResized`, `onSortChanged`, `onColumnMoved` handlers that save state to localStorage, and restore on grid init via `columnApi.applyColumnState()`.

**7. Price valueFormatter will crash on null/undefined** [Severity: Medium]

```js
valueFormatter: p => '$' + p.value.toFixed(2)
```

If any row has a null or undefined price (which happens in real data -- pending trades, draft entries), this throws `Cannot read property 'toFixed' of null/undefined`.

**Fix:** Guard all formatters: `valueFormatter: p => p.value != null ? '$' + p.value.toFixed(2) : ''`

**8. Volume formatter same issue** [Severity: Medium]

```js
valueFormatter: p => p.value ? p.value.toLocaleString() : ''
```

This is almost right but `p.value === 0` would produce empty string because `0` is falsy. Volumes of zero are valid in ETRM (netted positions, cancelled).

**Fix:** `valueFormatter: p => p.value != null ? p.value.toLocaleString() : ''`

---

## Section 2: Form Controls

### Combobox Implementation (counterparty, port search)

**9. Dropdown close uses `setTimeout(150)` race condition** [Severity: High]

```js
onblur="setTimeout(() => document.getElementById('cpty-dropdown').classList.add('hidden'), 150)"
```

The 150ms timeout is meant to let `onmousedown` fire on dropdown items before the blur hides them. This is a classic hack that fails when:
- The user is on a slow machine (mousedown fires after 150ms)
- Touch devices (touchstart/touchend timing differs)
- The user tabs away (dropdown stays visible for 150ms for no reason)

**Fix:** Use `pointerdown` with `event.preventDefault()` on the dropdown container to prevent the input from losing focus, then close explicitly after selection. Or use a `mousedown` handler that sets a flag checked by the blur handler.

**10. No keyboard navigation in dropdown** [Severity: High]

The counterparty and port comboboxes have zero keyboard navigation. No ArrowUp/ArrowDown to move through items, no Enter to select, no Escape to close. A trader at a desk uses keyboard exclusively -- reaching for the mouse to pick a counterparty from a dropdown is unacceptable in a trading UI.

**Fix:** Add `keydown` listener on the input that tracks `activeIndex`, scrolls the dropdown, highlights the active item, and selects on Enter.

**11. Combobox does not handle empty results gracefully** [Severity: Medium]

```js
dd.classList.toggle('hidden', filtered.length === 0 || !q);
```

When the user types a non-matching string, the dropdown hides silently. No "No results" message. The user has no feedback about whether the system is searching, found nothing, or is broken.

**Fix:** Show a disabled "No matches found" item when filtered list is empty.

**12. No debounce on combobox filtering** [Severity: Low]

`oninput="filterCpty(this.value)"` fires on every keystroke. With a 15-item list this is fine. With a real counterparty list (hundreds of entities with legal names), this needs debouncing.

**Fix:** Add 150ms debounce for production use. Not needed for template stage with static data.

**13. XSS in counterparty dropdown via `onmousedown` template literal** [Severity: Medium]

```js
dd.innerHTML = filtered.map(c =>
  `<div ... onmousedown="selectCpty('${c}')">${c}</div>`
).join('');
```

If a counterparty name contains a single quote (e.g., "O'Brien Energy"), this breaks the JavaScript and opens XSS. The port dropdown has the same issue.

**Fix:** Escape single quotes in the template literal, or better: create DOM elements programmatically and attach event listeners.

**14. Quick Entry form: no numeric input formatting** [Severity: Medium]

Volume field placeholder says "65,000" but if the user types "65000" the comma formatting is not applied. The `submitQuickTrade` function does `parseInt(vol.replace(/,/g, ''))` which handles commas on submit, but there is no live formatting. Traders expect to see "65,000" as they type.

**Fix:** Add an `oninput` handler that formats the number with commas as the user types, preserving cursor position.

**15. Trade form validation is onblur only** [Severity: Medium]

Price and volume validation only fires on `onblur`. The user can submit the form with invalid values because `submitTrade` only checks counterparty presence, not price or volume validity.

**Fix:** Run all validators in `submitTrade` before submission. Add `novalidate` to the form and implement comprehensive JS validation.

**16. B/S keyboard shortcut fires when typing in CMD+K search** [Severity: Medium]

```js
document.addEventListener('keydown', e => {
  if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
  if (e.key === 'b' || e.key === 'B') setSide('B');
  if (e.key === 's' || e.key === 'S') setSide('S');
});
```

The guard checks `activeElement.tagName` but the CMD+K overlay input is also an INPUT. So pressing 'b' or 's' in the CMD+K search will correctly skip. However, if focus is on a `<button>`, `<select>`, or the AG Grid (which uses `<div>` cells), pressing 'b' or 's' will toggle the Buy/Sell while the user thinks they are interacting with something else.

**Fix:** Add `contentEditable` check and limit the shortcut to when the quick-entry form section is visible/focused, or use a modifier key.

**17. Nomination cascading form: no loading states** [Severity: Low]

When contract changes, cargo dropdown repopulates synchronously. In production with API calls, there would be a delay. The form has no loading indicators or disabled-during-load states.

**Fix:** Add a loading spinner or "Loading..." option in cascading selects. The template correctly disables dependent dropdowns when no parent is selected, which is good.

---

## Section 3: CSS Architecture

### theme-f (Tailwind CDN + inline config)

**18. Using `tailwindcss.com` CDN in production** [Severity: High]

```html
<script src="https://cdn.tailwindcss.com"></script>
```

The Tailwind CDN Play script is explicitly not for production. It parses the entire DOM at runtime to generate CSS, adds ~100KB of JS, blocks rendering, and has no tree-shaking. Every page load pays this cost.

**Fix:** For templates/prototypes this is fine. For production, use Tailwind CLI or PostCSS to generate a purged CSS file. Note: this is correctly understood as a template, not production code.

**19. Massive sidebar/header duplication across pages** [Severity: High]

Every theme-f page contains ~150 lines of identical sidebar HTML, header HTML, CMD+K modal, toast, and associated JS (~80 lines of toggleSidebar, toggleTheme, openCmdK, etc.). This is the single biggest code quality issue in theme-f.

**Fix:** Theme-d's `shell.js` + `shell.css` solves this correctly with `initShell(activePage, pageTitle)`. The theme-f pages should adopt the same pattern.

**20. Inline styles on sidebar and main-wrapper** [Severity: Medium]

```html
<aside id="sidebar" ... style="width:15rem;">
<div id="main-wrapper" ... style="margin-left:15rem;">
```

The sidebar toggle then imperatively sets `style.width` and `style.marginLeft`. This mixes declarative (Tailwind classes) and imperative (inline styles) layout, making it hard to reason about and impossible to animate via CSS alone.

**Fix:** Theme-d does this correctly with CSS classes (`expanded` toggle) and CSS variables for sidebar width.

**21. Responsive breakpoints** [Severity: Medium]

Theme-f has no responsive breakpoints. The sidebar is a fixed 15rem on all screens. On a standard trading monitor (2-3 ultrawide screens), this is fine. On a laptop in a meeting room, the sidebar eats too much space.

Theme-d has a single breakpoint at `48rem` (768px) that hides the sidebar and shows a mobile menu button. This is reasonable but could use a second breakpoint for tablet-sized screens.

### theme-d shell.css

**22. Excellent CSS custom properties architecture** [Severity: N/A -- positive]

The `shell.css` uses a clean two-theme system with CSS custom properties. The variable naming (`--bg-0` through `--bg-4`, `--text-0` through `--text-3`, `--border`, `--border-2`) is systematic and well-layered. The dark sidebar in light mode (`--sidebar-bg: #0f172a`) matches how Bloomberg and Refinitiv do it -- professional choice.

**23. AG Grid CSS variable overrides are comprehensive** [Severity: N/A -- positive]

```css
.ag-theme-quartz-dark {
  --ag-background-color: #141414;
  --ag-header-background-color: #1a1a1a;
  --ag-odd-row-background-color: #161616;
  --ag-row-hover-color: rgba(6, 182, 212, 0.06);
  ...
}
```

This is exactly how you theme AG Grid in production -- override CSS variables, not classes. The hover color using the accent cyan at 6% opacity is subtle and professional.

**24. Font size set to 0.75rem on html root** [Severity: Low]

```css
html { font-size: 0.75rem; }
```

This redefines `1rem = 12px` globally, which means all `rem` values throughout the stylesheet are relative to 12px not 16px. This is intentional for data-density but breaks any third-party component that assumes `1rem = 16px`. AG Grid handles this because it uses its own CSS variables, but any future library integration would need to account for this.

**Fix:** Document this choice prominently. Consider using a scoped font-size on the app container rather than html root to avoid third-party conflicts.

**25. Hardcoded colors on menu items** [Severity: Low]

```css
.hz-menu-item { color: #a3a3a3; }
.hz-menu-item:hover { background: rgba(255,255,255,0.05); color: #e5e5e5; }
```

These should use `var(--text-2)` and `var(--text-0)` instead of hardcoded values to stay consistent with the theme system. Currently, in light mode the sidebar has a dark background but these specific values are not theme-aware.

**Fix:** Replace hardcoded colors with CSS variable references.

---

## Section 4: JavaScript Quality

### Event Listeners and Memory

**26. Global `gridApi` variable with no cleanup** [Severity: Medium]

Every page declares `let gridApi;` at module scope. There is no `destroyGrid` or cleanup on page unload. In a single-page application (React), if these grids are mounted/unmounted, the AG Grid instance would leak memory (event listeners, DOM nodes, row model cache).

**Fix:** For multi-page templates this is fine. For React translation, ensure `gridApi.destroy()` is called in the component's cleanup (useEffect return). The shell.js has the same pattern -- no cleanup for the MutationObserver.

**27. `document.addEventListener` on every page with no removal** [Severity: Medium]

Each page adds global keydown listeners for CMD+K, B/S toggle, etc. In a React SPA, these would accumulate on each navigation if not cleaned up.

**Fix:** Store references and remove in cleanup. For template stage, not an issue since each HTML page is a fresh document.

**28. Context menu uses `e.event.clientX/Y` for positioning** [Severity: Medium]

```js
menu.style.left = e.event.clientX + 'px';
menu.style.top = e.event.clientY + 'px';
```

`clientX/Y` is relative to the viewport, but the menu is positioned `fixed`. This works when the page is not scrolled, but if the blotter grid is scrolled within a container, the menu appears at the wrong position. Theme-d's `showContextMenu` uses `e.pageX/Y` which accounts for scroll -- better, but still has issues with nested scroll containers.

**Fix:** Use `pageX/Y` and ensure the menu container has `position: fixed` (not `absolute`), or calculate position relative to the grid's scroll container.

### State Management

**29. Scattered state across global variables** [Severity: Medium]

State is spread across: `gridApi`, `selectedRow`, `activeStatusFilter`, `activeFilter`, `sidebarCollapsed`, `currentSide`, `tradeIdCounter`, `nomIdCounter`, `currentPort`, `cmdkIdx`, `cmdkFiltered`. None of these are encapsulated.

**Fix:** For templates this is fine. For React translation, each becomes either component state (useState), context, or a store slice. The naming and separation are clear enough to translate mechanically.

### React-Translatability

**30. The code is highly translatable to React** [Severity: N/A -- positive]

Despite being vanilla JS, the patterns map cleanly:
- Each page = a React route component
- `gridApi` = a `useRef` holding the AG Grid API
- `activeStatusFilter` = `useState`
- `filterCpty()` = a controlled input with filtered state
- `updateImpact()` = `useMemo` or `useEffect` derived from form values
- `shell.js` `initShell()` = a `<Shell>` layout component with `<Outlet/>`
- The cascading nominations form = controlled selects with derived options

The data structures (column defs, trade data, counterparty lists) would become constants or API response shapes with zero changes.

---

## Section 5: Performance

**31. Tailwind CDN blocks first paint** [Severity: High -- but expected for template]

The `<script src="https://cdn.tailwindcss.com">` is render-blocking. On a slow network this adds 200-400ms to first paint. For templates this is accepted; for production, use pre-compiled CSS.

**32. AG Grid + Tailwind CDN + Google Fonts = 3 external dependencies at load** [Severity: Medium]

Each page loads:
- `cdn.tailwindcss.com` (~100KB JS)
- AG Grid CSS (2 files) + JS (~300KB)
- Google Fonts (Inter + JetBrains Mono, 2 requests with font files)

Total blocking resources: ~500KB+ before first render. Theme-d does better by not using Tailwind CDN and keeping fonts minimal.

**33. Position ladder rebuilds entire DOM on every render** [Severity: Medium]

```js
function renderLadder() {
  const tbody = document.getElementById('pos-tbody');
  tbody.innerHTML = '';
  // ... rebuilds all rows
}
```

For a 3-benchmark x 6-month grid (18 cells), this is imperceptible. But a real position ladder with 20+ benchmarks and 36+ months (3-year forward) would benefit from incremental DOM updates.

**Fix:** In React, this becomes a keyed list that React diffs efficiently. For the template, not an issue at this scale.

**34. Nominations table uses `innerHTML +=` in a loop** [Severity: Medium]

```js
data.forEach(d => {
  tbody.innerHTML += `<tr>...</tr>`;
});
```

Each `+=` parses the existing HTML, discards the DOM, rebuilds it, and parses the new HTML. For 6 rows this is invisible. For 100+ nominations, this would be noticeably slow. Should use `DocumentFragment` or build the entire string first, then assign once.

**Fix:** Build the HTML string in an array, join, and assign once: `tbody.innerHTML = data.map(d => ...).join('');`

---

## Section 6: Accessibility

**35. No ARIA roles on any interactive custom widgets** [Severity: High]

The comboboxes (counterparty search, port search) have no ARIA attributes:
- No `role="combobox"` on the input
- No `role="listbox"` on the dropdown
- No `role="option"` on items
- No `aria-expanded`, `aria-activedescendant`, `aria-autocomplete`

A screen reader user cannot interact with these controls. More practically, trading desk compliance audits increasingly require WCAG 2.1 AA.

**Fix:** Add the WAI-ARIA combobox pattern (https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

**36. Status pills and side badges have no semantic meaning** [Severity: Medium]

The Buy/Sell badges and status pills use `<span>` with color-only differentiation. Color-blind users (8% of male traders) cannot distinguish Buy from Sell.

**Fix:** The B/S text content helps, but the status pills should also have an icon or `aria-label`. Consider adding a small icon (checkmark for Confirmed, clock for Pending, X for Cancelled).

**37. Context menu is not keyboard accessible** [Severity: High]

The right-click context menu on the blotter has no keyboard trigger (e.g., Shift+F10 or dedicated key), no focus trap, no arrow-key navigation between items. Theme-d's `showContextMenu` is better (it creates DOM dynamically and handles click-outside) but still has no keyboard support.

**Fix:** Add keyboard trigger, focus management, and arrow-key navigation to context menu.

**38. CMD+K palette: theme-d has keyboard nav, theme-f does not** [Severity: Medium]

Theme-f's CMD+K only does text filtering. Theme-d's version has full ArrowUp/Down/Enter navigation. This is a significant difference -- theme-d is clearly the more production-ready implementation.

**39. Focus trap missing in modal overlays** [Severity: Medium]

When CMD+K opens, pressing Tab can move focus to elements behind the overlay. There is no focus trap to keep the user within the modal.

**Fix:** Add focus-trap logic (or use a library like `focus-trap`) to all modal overlays.

**40. "Back to All Themes" link uses inline styles with hover handlers** [Severity: Low]

```html
<a href="../index.html" 
   style="position:fixed;bottom:1rem;right:1rem;..."
   onmouseover="this.style.background='rgba(79,70,229,1)'"
   onmouseout="this.style.background='rgba(99,102,241,0.9)'"
>
```

Inline styles with JS hover handlers. This is template-only UI chrome and should be removed for production.

---

## Section 7: theme-d shell.js/shell.css -- Specific Assessment

### Strengths

- **Single initialization point:** `initShell(activePage, pageTitle)` injects sidebar, header, and CMD+K in one call. This is the right pattern for a multi-page app shell.
- **LocalStorage persistence for sidebar state:** Group open/close, sub-menu open/close, sidebar expanded/collapsed, and theme are all persisted. This is a thoughtful touch that traders expect (Bloomberg remembers every panel state).
- **Data-driven menu:** The `MENU` array is easily extensible and could be driven by a permissions API.
- **MutationObserver for theme icon updates:** Watching `data-theme` attribute changes is more robust than calling `updateThemeIcons()` manually everywhere.
- **Context menu with viewport-boundary correction:** `showContextMenu` checks if the menu would overflow the viewport and repositions. This is professional-grade.
- **Toast system supports multiple concurrent toasts:** The toast container allows stacking, with timed removal and CSS transitions. Better than theme-f's single-toast approach.

### Issues specific to shell.js

**41. `buildSidebar` generates HTML via string concatenation** [Severity: Low]

This works but is fragile. A menu item label containing `<` or `&` would break. Not an issue with the current static labels.

**42. `onclick` handlers in generated HTML use inline JS strings** [Severity: Medium]

```js
`<button class="hz-ctx-item" onclick="closeContextMenu();${it.action || ''}">`
```

The `action` string is interpolated directly into an onclick attribute. This is an XSS vector if `action` comes from user input. In the current code, actions are hardcoded, so this is safe but architecturally fragile.

**Fix:** Create elements with `addEventListener` instead of inline onclick strings.

**43. No `removeEventListener` on keydown handler** [Severity: Low]

The global keydown handler for CMD+K, CMD+B, and arrow navigation is added in `initShell` but never removed. If `initShell` were called twice (e.g., hot-module-reload), handlers would duplicate.

**Fix:** Guard against double-init, or store and remove previous listener.

---

## Consolidated Priority Issues

### Must-Fix Before First Customer Demo (Critical)

| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| 2 | Add `getRowId` to all grids | blotter, quick-entry, invoices | 10 min |
| 3 | Stop mutating row data directly | blotter (ctxAction) | 5 min |
| 7-8 | Guard all valueFormatters against null | blotter, quick-entry, invoices | 15 min |
| 10 | Add keyboard navigation to comboboxes | quick-entry, trade-form, nominations | 2 hrs |
| 13 | Fix XSS in dropdown template literals | quick-entry, trade-form | 30 min |

### Should-Fix Before Production (High)

| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| 9 | Replace setTimeout blur hack with proper focus management | all comboboxes | 1 hr |
| 15 | Run all validators on form submit | trade-form | 30 min |
| 19 | Adopt shell.js pattern for theme-f pages | all theme-f | 2 hrs |
| 35 | Add ARIA combobox pattern | all comboboxes | 2 hrs |
| 37 | Make context menu keyboard accessible | blotter | 1 hr |
| 6 | Add column state persistence | blotter, invoices | 1 hr |

### Nice-to-Have (Medium/Low)

| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| 4 | Remove deprecated animateRows | all grids | 5 min |
| 5 | Update rowSelection to object syntax | all grids | 10 min |
| 11 | Add "No results" state to comboboxes | all comboboxes | 15 min |
| 14 | Add live number formatting to volume fields | quick-entry, trade-form | 30 min |
| 24 | Document or scope the 12px root font-size | shell.css | 10 min |
| 25 | Replace hardcoded colors with CSS vars in shell.css | shell.css | 15 min |
| 34 | Fix innerHTML += in nomination table loop | nominations | 10 min |
| 39 | Add focus trap to CMD+K overlay | all pages | 30 min |

---

## Overall Assessment

**For a prototype/template codebase**, this is strong work. The domain modeling is accurate, the visual design is professional, and the code structure is clear enough that a React translation would be largely mechanical. Theme-d's shell architecture is genuinely good -- it solves the right problems (shared chrome, theme persistence, keyboard shortcuts, responsive layout) in the right way.

**For production deployment to a trading desk**, the gaps in keyboard navigation, accessibility, and null-safety would be blockers. Trading UIs live and die by keyboard ergonomics -- a trader who has to reach for the mouse to pick a counterparty from a dropdown will reject the system on day one.

**The React translation path is clean.** Each page becomes a route, the shell becomes a layout component, AG Grid cell renderers become React components, and the global state fragments map to hooks/context naturally. The biggest translation risk is the combobox implementations -- these should be replaced with a proper headless combobox library (Radix, Downshift, or react-select) rather than porting the vanilla JS.

**Strongest file:** `shell.css` -- systematic, theme-aware, well-structured CSS variables with good AG Grid integration.
**Weakest file:** `nominations.html` -- cascading form with no loading states, innerHTML concatenation, and no validation beyond presence checks.
