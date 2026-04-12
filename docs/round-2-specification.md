# Phase 2 — Round 2: Detailed Specification

**Panel:** Sasha (UI Lead), Marcus (UX Lead), Ravi (LNG BA)
**Date:** 12 April 2026

---

## 1. Theme D: "Front Office Workspace" — Page Specifications

### Visual Identity
- **Palette:** Dark-first, cyan/teal accent (#06b6d4), neutral-950 backgrounds
- **Font:** JetBrains Mono for everything (monospace = trader identity)
- **Cards:** Border-only (no shadow), rounded-lg, very tight padding (0.75rem)
- **Sidebar:** Icon-only (3rem) default, expands to 13rem on hover or pin
- **Header:** Slim (2.5rem), price ticker always visible
- **Density:** Ultra-compact — 1.75rem row heights in grids, 0.5rem gaps

### Pages

| # | Page | Key Demonstration |
|---|------|-------------------|
| 1 | index.html (Dashboard) | Price ticker + mini position ladder + P&L summary + alerts. All monospace. |
| 2 | quick-entry.html | Quick trade strip at top + AG Grid blotter below. **Working**: B/S toggle, Tab between fields, Enter submits, trade appears in grid. |
| 3 | positions.html | Full position ladder (benchmark × month). **Working**: click cell → popover shows underlying trades. Monospace everywhere. |
| 4 | curves.html | Forward curve display + spread monitor. CSS-based chart with data points. |
| 5 | hedges.html | Paper trades grid + hedge ratio gauges per quarter. |
| 6 | blotter.html | Full-page AG Grid blotter. **Working**: sort, filter, row selection, context menu, export. Dense rows. Keyboard: arrow nav, F2 to edit. |
| 7 | settings.html | Compact settings. Keyboard shortcuts reference section showing all hotkeys. |
| 8 | signin.html | Dark, terminal-style sign in. |
| 9 | error-404.html | Monospace 404. |

### Key Interactions to Implement
- **Quick entry form:** B/S buttons toggle on keyboard press. Tab moves between fields. Enter submits (shows success toast). Form clears and refocuses.
- **AG Grid blotter:** Real AG Grid with sorting, filtering, 20+ rows. Custom cell renderers for status, direction, price. F2 to start cell edit. Escape to cancel.
- **Position ladder drill-down:** Click a cell → small popover/panel shows the trades comprising that position.
- **Cmd+K palette:** Opens with keyboard shortcut. Navigate to any page. "New Trade" action focuses the quick entry form.
- **Keyboard shortcuts visible:** Every action button shows its shortcut hint (e.g., "New Trade (N)").

---

## 2. Theme E: "Back Office Operations Hub" — Page Specifications

### Visual Identity
- **Palette:** Light-first, blue accent (#2563eb), slate-50 backgrounds, white cards
- **Font:** Inter for everything, generous line height
- **Cards:** White bg, subtle shadow-sm, rounded-xl, comfortable padding (1.25rem)
- **Sidebar:** Full 16rem, hierarchical with accordion sub-menus, section labels
- **Header:** Standard (4rem) with breadcrumb trail
- **Density:** Comfortable — 2.5rem row heights, clear spacing between sections

### Pages

| # | Page | Key Demonstration |
|---|------|-------------------|
| 1 | index.html (Dashboard) | Approval queue summary: pending invoices, nominations needing action, trade validations. Task-oriented, not data-oriented. |
| 2 | invoices.html | AG Grid invoice queue. **Working**: checkbox selection, inline status dropdown, filter by status/type, bulk "Approve Selected" button, export CSV. |
| 3 | reconciliation.html | Side-by-side provisional vs final comparison. Highlight differences. Auto-approve within tolerance. |
| 4 | trade-entry.html | Full multi-section form with all fields. Searchable combobox for counterparty + ports. Conditional pricing sections. Inline validation (red borders + error text on blur). Position impact preview panel. |
| 5 | nominations.html | Nomination form with cascading lookups: select contract → filters cargoes → select vessel → auto-calculates ETA. Plus a nomination schedule grid below. |
| 6 | contracts.html | Multi-step wizard: Step 1 (Type & Parties) → Step 2 (Pricing) → Step 3 (Volume & ACQ) → Step 4 (Review & Submit). Back button preserves state. |
| 7 | audit-log.html | Filterable read-only table of all system events. Columns: Timestamp, User, Action, Entity, Details. Filter by entity type, date range. |
| 8 | settings.html | Full settings with account, notifications, security sections. |
| 9 | signin.html | Clean, professional sign-in card. |
| 10 | error-404.html | Friendly error page. |

### Key Interactions to Implement
- **Invoice queue inline editing:** Status dropdown in AG Grid that changes on selection (no separate form needed). Checkbox + bulk approve button.
- **Reconciliation side-by-side:** Two-column layout with field-by-field comparison. Differences highlighted in amber. Tolerance check shown.
- **Cascading nomination form:** Selecting a contract populates a filtered list of available cargoes. Selecting a cargo pre-fills volume and dates. Selecting a vessel triggers ETA calculation display.
- **Multi-step contract wizard:** Step indicators at top. Validation per step. Can't proceed until current step validates. Review step shows summary.
- **Breadcrumb navigation:** Shows current location (e.g., "Settlement > Invoices > INV-2026-0042").
- **Hierarchical sidebar:** Accordion sub-menus with expand/collapse. Badge counts on Invoice Queue and Nominations.

---

## 3. Theme F: "Unified ETRM" — Page Specifications

### Visual Identity
- **Palette:** Adaptive — trading views use dark bg, admin views use light bg. Indigo primary (#4f46e5) with violet (#7c3aed) gradient accents.
- **Font:** Inter for UI, JetBrains Mono for numbers (both loaded)
- **Cards:** Context-dependent — border-only in dark views, shadow in light views
- **Sidebar:** Full-featured: role selector at top ("Trader" / "Operations"), collapsible, accordion sub-menus, favorites section, badge counts
- **Header:** Medium (3rem) with price ticker (collapsible) + breadcrumb
- **Density:** Adaptive — compact for trading grids, comfortable for forms/admin

### Pages

| # | Page | Key Demonstration |
|---|------|-------------------|
| 1 | index.html (Dashboard) | Role-aware: Trader sees P&L + positions + curves mini. Operations sees approval queue + deadline countdown + cargo pipeline. Toggle between roles. |
| 2 | quick-entry.html | Quick trade strip + blotter below. **Working** keyboard-driven entry. Dark bg. |
| 3 | blotter.html | Full AG Grid with all features. Dense dark view. Context menu. Keyboard nav. |
| 4 | positions.html | Position ladder with drill-down. Dark bg for data density. |
| 5 | trade-form.html | Full trade entry form. Light bg. All fields, validation, comboboxes, preview. |
| 6 | invoices.html | AG Grid with inline editing. Light bg. Bulk operations. Export. |
| 7 | nominations.html | Cascading form + schedule grid. Accordion sub-nav for ADP/Cargo/Vessel noms. |
| 8 | reconciliation.html | Side-by-side comparison view. Light bg. |
| 9 | settings.html | Role selector, keyboard shortcuts config, full settings. |
| 10 | signin.html | Gradient background, glass card (from Theme C inspiration). |
| 11 | error-404.html | Clean error page. |

### Key Interactions to Implement
- **Role selector:** Dropdown in sidebar header: "Trader" / "Operations" / "Manager". Changes: which menu sections are expanded by default, which dashboard widgets show, density preference.
- **Quick entry + full form co-exist:** Quick entry available from blotter view. Full form available from sidebar "New Trade" or via Cmd+K.
- **Both AG Grid patterns:** Blotter (read + context menu, dark) AND invoice queue (inline edit + bulk approve, light) in the same theme.
- **Adaptive backgrounds:** Trading pages (blotter, positions, curves) render on dark surface. Admin pages (forms, invoices, settings) render on light surface. Both respect the global theme toggle.
- **Command palette with role-aware actions:** "Trader" role shows "New Trade", "Check P&L". "Operations" role shows "Process Invoice", "Create Nomination".
- **Keyboard shortcut system:** Global shortcuts shown in settings page. Hints visible on hover for all action buttons.

---

## 4. Shared Patterns Across All Three Themes

### 4.1 Collapsible Sidebar
All three themes must implement:
- Toggle button (hamburger icon or Cmd+B)
- Collapsed state = icon-only (3-3.5rem)
- Expanded state = icons + labels (13-16rem)
- Smooth transition animation
- State persisted to localStorage
- Keyboard: Cmd+B to toggle
- On mobile: hidden by default, hamburger opens overlay

### 4.2 Multi-Level Menu
All three themes must have at least some sub-menus:
- Theme D: minimal (Curves has sub-items)
- Theme E: extensive (Invoices, Nominations, Reports have sub-items)
- Theme F: full hierarchy as specified in Round 1

Accordion behavior: click parent to expand/collapse. Arrow icon rotates. Keyboard: Right to expand, Left to collapse.

### 4.3 AG Grid Integration
All three themes include AG Grid (CDN) with:
- Theme-aware: quartz for light, quartz-dark for dark
- Toolbar: search, column visibility, export, row count
- Working: sorting (click headers), filtering (column menu), row selection (checkboxes)
- Custom cell renderers: status badges, direction, monospace numbers
- Keyboard: Arrow keys navigate cells, F2/Enter to edit, Tab between cells

### 4.4 Form Controls
All themes demonstrate:
- Standard inputs with focus ring
- Select dropdowns
- Searchable combobox (type to filter, keyboard select)
- Toggle switches
- Checkbox groups
- Date inputs
- Inline validation (error state + message)
- Conditional visibility (show/hide sections based on selection)

### 4.5 Keyboard System
All themes must have:
- Cmd+K: command palette
- Cmd+B: toggle sidebar
- N: new trade (when no input focused)
- ?: show shortcuts overlay
- Escape: close modal/palette/panel
- Tab: move between form fields in logical order
- Focus rings visible on all interactive elements

---

## 5. Round 2 Scorecard

| Criterion | Score | Notes |
|-----------|-------|-------|
| Theme differentiation (D vs E vs F) | 9/10 | Each has clear functional identity |
| Page coverage | 9/10 | D:9, E:10, F:11 pages cover all required patterns |
| Menu specification | 9/10 | Hierarchical, collapsible, badges, keyboard |
| Form variation | 9/10 | Quick entry, full form, wizard, cascading, inline grid |
| Grid specification | 9/10 | Read-only blotter, inline-edit queue, drill-down ladder |
| Keyboard design | 8/10 | Full shortcut map, AG Grid keyboard, tab order |
| Front/back office differentiation | 9/10 | D=front, E=back, F=both with role switching |
| Feasibility for single developer | 7/10 | Ambitious — 30 pages total. Prioritize working interactions over page count. |

**Proceeding to Round 3: Final analysis and build plan.**
