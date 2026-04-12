# MERIDIAN DESIGN CO.
## Project Horizon — Round 2: Design System & Pattern Library Definition

**Client:** Jonathan Cobley, Project Horizon
**Date:** 11 April 2026

---

## 1. Design Token System

### 1.1 Color Tokens (CSS Custom Properties)

```
/* ─── Semantic Surface Colors ─── */
--canvas:          Dark: #09090b    Light: #f8fafc
--surface:         Dark: #18181b    Light: #ffffff
--surface-raised:  Dark: #27272a    Light: #f4f4f5
--overlay:         Dark: #18181bF0  Light: #ffffffF0

/* ─── Border & Divider ─── */
--border:          Dark: #27272a    Light: #e4e4e7
--border-subtle:   Dark: #1e1e22    Light: #f0f0f2
--ring-focus:      Dark: #3b82f680  Light: #3b82f640

/* ─── Text ─── */
--text-primary:    Dark: #fafafa    Light: #09090b
--text-secondary:  Dark: #a1a1aa    Light: #52525b
--text-muted:      Dark: #71717a    Light: #a1a1aa
--text-inverse:    Dark: #09090b    Light: #fafafa

/* ─── Semantic Action Colors ─── */
--accent:          #3b82f6  (blue-500)
--accent-hover:    #2563eb  (blue-600)
--destructive:     #ef4444  (red-500)
--success:         #22c55e  (green-500)
--warning:         #f59e0b  (amber-500)

/* ─── Trading Semantics ─── */
--buy:             #22c55e
--buy-bg:          Dark: #22c55e15  Light: #22c55e10
--sell:            #ef4444
--sell-bg:         Dark: #ef444415  Light: #ef444410
--pnl-positive:    #22c55e
--pnl-negative:    #ef4444

/* ─── Status Palette ─── */
--status-draft:    #71717a (gray)
--status-pending:  #3b82f6 (blue)
--status-active:   #22c55e (green)
--status-warning:  #f59e0b (amber)
--status-error:    #ef4444 (red)
--status-closed:   #52525b (dark gray)
```

### 1.2 Spacing Scale

```
--space-0:   0px
--space-1:   4px     (gap between inline items)
--space-2:   8px     (compact padding, grid gap)
--space-3:   12px    (standard inner padding)
--space-4:   16px    (card padding, section gap)
--space-5:   20px    (generous padding)
--space-6:   24px    (section separation)
--space-8:   32px    (major section separation)
--space-12:  48px    (page-level spacing)
```

### 1.3 Typography Scale

```
--font-sans:     'Inter', -apple-system, sans-serif
--font-mono:     'JetBrains Mono', 'Fira Code', monospace

--text-xs:       11px / 1.45   (labels, captions, grid headers)
--text-sm:       13px / 1.5    (compact body, grid cells)
--text-base:     14px / 1.6    (standard body)
--text-lg:       16px / 1.5    (section headers)
--text-xl:       20px / 1.4    (page titles)
--text-2xl:      24px / 1.3    (hero metrics)
--text-3xl:      30px / 1.2    (dashboard KPI values)
```

### 1.4 Elevation (Shadow + Backdrop)

```
--shadow-sm:     0 1px 2px rgba(0,0,0,0.05)
--shadow-md:     0 4px 12px rgba(0,0,0,0.1)
--shadow-lg:     0 8px 24px rgba(0,0,0,0.15)
--shadow-xl:     0 16px 48px rgba(0,0,0,0.2)
```

---

## 2. Atomic Component Inventory

### Sasha (UI Lead) — Component Specifications

| # | Component | States | Dark/Light | AG Grid? |
|---|-----------|--------|-----------|----------|
| 1 | **Button** | default, hover, active, disabled, loading | Yes | No |
| 2 | **Input** | default, focus, error, disabled, with-icon, with-addon | Yes | No |
| 3 | **Select** | default, open, disabled | Yes | No |
| 4 | **Combobox** | closed, searching, results, empty, loading, selected | Yes | No |
| 5 | **Textarea** | default, focus, error, disabled | Yes | No |
| 6 | **Checkbox** | unchecked, checked, indeterminate, disabled | Yes | No |
| 7 | **Toggle** | off, on, disabled | Yes | No |
| 8 | **Badge** | variants: default, success, warning, error, info, outline | Yes | No |
| 9 | **StatusBadge** | maps status string → color automatically | Yes | No |
| 10 | **MetricCard** | with value, delta, sparkline, loading, empty | Yes | No |
| 11 | **Toast** | info, success, warning, error, with-action | Yes | No |
| 12 | **Dialog** | with title, description, actions, destructive variant | Yes | No |
| 13 | **Sheet** (slide-over) | left, right, with-header, scrollable body | Yes | No |
| 14 | **DropdownMenu** | items, separators, sub-menus, destructive items | Yes | No |
| 15 | **ContextMenu** | right-click triggered, same structure as DropdownMenu | Yes | No |
| 16 | **Tabs** | horizontal, with counts, with icons | Yes | No |
| 17 | **CommandPalette** | search, navigation, actions, recent, keyboard nav | Yes | No |
| 18 | **DataTable** | wraps AG Grid with standard toolbar, theme, export | Yes | **Yes** |
| 19 | **Skeleton** | line, circle, card, table-row variants | Yes | No |
| 20 | **EmptyState** | icon, title, description, action button | Yes | No |
| 21 | **AlertBanner** | info, warning, error, success, dismissible | Yes | No |
| 22 | **Breadcrumb** | items, separator, current page | Yes | No |
| 23 | **Avatar** | image, initials, status indicator | Yes | No |
| 24 | **Tooltip** | text, rich content, delayed show | Yes | No |
| 25 | **ThemeToggle** | dark/light/system, persists to localStorage | Yes | No |

### Component Variant: Button

```
Variants:     primary, secondary, outline, ghost, destructive, link
Sizes:        sm (28px), md (36px), lg (44px)
With:         icon-left, icon-right, icon-only, loading spinner
```

### Component Variant: Combobox

```
Trigger:      input field with search icon + chevron
Popover:      list of results, grouped optional
Result item:  primary text, secondary text, metadata slot, status indicator
Search:       debounced 300ms, async backend query
Selection:    single-select, with clear button
States:       empty results, loading spinner, error
Keyboard:     arrow up/down, enter to select, escape to close
```

---

## 3. Template Layout Specifications

### Marcus (UX Lead) — Template Architecture

### T1: Dashboard Template

```
┌────────────────────────────────────────────────────────┐
│ [Theme Toggle]                           [Quick Actions]│
├──────────────────┬─────────────────────────────────────┤
│                  │                                     │
│   SIDEBAR NAV    │  ┌─ KPI ROW (3-4 MetricCards) ───┐ │
│                  │  └───────────────────────────────┘ │
│   - Grouped      │  ┌─ CONTENT ROW ─────────────────┐ │
│   - Collapsible   │  │ Chart/Narrative   │ AlertFeed │ │
│   - Badge counts  │  │ (2/3)            │ (1/3)     │ │
│                  │  └───────────────────────────────┘ │
│                  │  ┌─ DATA ROW ─────────────────────┐ │
│                  │  │ DataTable or secondary content   │ │
│                  │  └───────────────────────────────┘ │
│   [Cmd+K]        │                                     │
└──────────────────┴─────────────────────────────────────┘
```

**Key patterns demonstrated:** MetricCard with sparkline, grouped sidebar nav, theme toggle, responsive grid, alert feed, command palette.

### T2: Master-Detail Template

```
┌──────────────────┬──────────────────────────────────────┐
│   SIDEBAR NAV    │  HEADER: Title + Actions             │
│                  ├──────────────┬───────────────────────┤
│                  │              │                       │
│                  │  LIST PANEL  │  DETAIL PANEL         │
│                  │  (AG Grid)   │                       │
│                  │              │  [Entity Header]      │
│                  │  Sortable    │  [Tab Navigation]     │
│                  │  Filterable  │  [Content Sections]   │
│                  │  Searchable  │  [Related Entities]   │
│                  │              │  [Lifecycle Actions]  │
│                  │  Click row → │  [Audit Trail]        │
│                  │  loads right │                       │
│                  │              │                       │
└──────────────────┴──────────────┴───────────────────────┘
```

**Key patterns:** AG Grid in list mode, resizable split, entity detail with tabs, status badges, lifecycle action buttons, cross-links to related entities.

### T3: Full Data Grid Template

```
┌──────────────────┬──────────────────────────────────────┐
│   SIDEBAR NAV    │  HEADER: Title + [+ New] + [Export]  │
│                  ├──────────────────────────────────────┤
│                  │  TOOLBAR: [Filter] [Search] [Columns]│
│                  ├──────────────────────────────────────┤
│                  │                                      │
│                  │           AG GRID                    │
│                  │   Full width, all features:          │
│                  │   - Column sort (multi)              │
│                  │   - Column filter (text/set/date)    │
│                  │   - Column resize + reorder          │
│                  │   - Row selection (checkbox)         │
│                  │   - Right-click context menu         │
│                  │   - Pinned columns                   │
│                  │   - Cell renderers (status, price)   │
│                  │                                      │
│                  ├──────────────────────────────────────┤
│                  │  FOOTER: Row count │ Selected │ Export│
└──────────────────┴──────────────────────────────────────┘
```

**Key patterns:** AG Grid with full Community features, custom cell renderers, toolbar, bulk actions, context menu, CSV export, column visibility toggle.

### T4: Complex Data Entry Form Template

```
┌──────────────────┬──────────────────────────────────────┐
│   SIDEBAR NAV    │  FORM HEADER: Title + [Save] [Cancel]│
│                  ├──────────────────────────────────────┤
│                  │  ┌─ FORM ────────┐ ┌─ PREVIEW ────┐ │
│                  │  │               │ │              │ │
│                  │  │ Section 1     │ │ Live preview │ │
│                  │  │ [Combobox]    │ │ of impact    │ │
│                  │  │ [Select]      │ │              │ │
│                  │  │               │ │ Warnings     │ │
│                  │  │ Section 2     │ │              │ │
│                  │  │ (conditional) │ │ Validation   │ │
│                  │  │ [Input+valid] │ │ summary      │ │
│                  │  │ [DateRange]   │ │              │ │
│                  │  │               │ │              │ │
│                  │  │ Section 3     │ │              │ │
│                  │  │ [Grouped]     │ │              │ │
│                  │  │               │ │              │ │
│                  │  └───────────────┘ └──────────────┘ │
│                  ├──────────────────────────────────────┤
│                  │  FORM ACTIONS: [Submit] [Draft] [X]  │
└──────────────────┴──────────────────────────────────────┘
```

**Key patterns:** Conditional form sections, searchable combobox, inline validation, live preview panel, form groups with headers, auto-generated reference, date range picker.

### T5: Timeline/Gantt Template

```
┌──────────────────┬──────────────────────────────────────┐
│   SIDEBAR NAV    │  HEADER: Title + Filter + Legend     │
│                  ├──────────────────────────────────────┤
│                  │  SUMMARY STRIP: counts per phase     │
│                  ├───────────┬──────────────────────────┤
│                  │ LABEL COL │ TIMELINE GRID            │
│                  │           │ [Month columns]          │
│                  │ Row 1     │ ████████                 │
│                  │ Row 2     │     ████████████         │
│                  │ Row 3     │         ████             │
│                  ├───────────┴──────────────────────────┤
│                  │  DETAIL PANEL (expandable below)     │
└──────────────────┴──────────────────────────────────────┘
```

### T6: Settings/Configuration Template

```
┌──────────────────┬──────────────────────────────────────┐
│   SIDEBAR NAV    │  HEADER: Settings                    │
│                  ├──────────────────────────────────────┤
│                  │  ┌─ Section: General ─────────────┐  │
│                  │  │ Setting 1    [Toggle]    desc   │  │
│                  │  │ Setting 2    [Select ▼]  desc   │  │
│                  │  │ Setting 3    [Input]     desc   │  │
│                  │  └────────────────────────────────┘  │
│                  │  ┌─ Section: Appearance ──────────┐  │
│                  │  │ Theme        [Dark/Light/Sys]   │  │
│                  │  │ Density      [Compact/Standard] │  │
│                  │  │ Font Size    [Slider]           │  │
│                  │  └────────────────────────────────┘  │
│                  │  ┌─ Section: Danger Zone ─────────┐  │
│                  │  │ Reset        [Destructive btn]  │  │
│                  │  └────────────────────────────────┘  │
└──────────────────┴──────────────────────────────────────┘
```

---

## 4. AG Grid Configuration Specification

### 4.1 Theme

AG Grid will use the **Quartz** built-in theme with custom color overrides to match our design tokens. Dark and light modes will be controlled via `data-ag-theme-mode` attribute, switching when the page theme changes.

### 4.2 Standard Column Configurations

| Column Type | Features | Cell Renderer |
|-------------|----------|---------------|
| Text | Sort, filter (text) | Default |
| Number | Sort, filter (number), right-align | Monospace font, thousands separator |
| Currency | Sort, filter (number), right-align | $ prefix, monospace, green/red for P&L |
| Date | Sort, filter (date) | Formatted: "12 Apr 2026" |
| Status | Sort, filter (set) | StatusBadge component |
| Direction | Sort, filter (set) | Buy=green, Sell=red badge |
| Actions | No sort/filter | Icon buttons or "..." menu |

### 4.3 Standard Grid Toolbar

Every DataTable template gets:
- Search box (filters all columns)
- Column visibility toggle
- Density toggle (compact / standard)
- Export CSV button
- Row count display
- Selected count (when rows selected)

---

## 5. Round 2 Evaluation Scorecard

| Criterion | Sasha (UI) | Marcus (UX) | Agreed |
|-----------|-----------|-------------|--------|
| Token system completeness | 9/10 | 8/10 | 8.5 |
| Component inventory coverage | 9/10 | 9/10 | 9 |
| Template taxonomy | 7/10 | 9/10 | 8 |
| AG Grid integration plan | 8/10 | 8/10 | 8 |
| Dark/light theme approach | 9/10 | 8/10 | 8.5 |
| Form pattern completeness | 7/10 | 9/10 | 8 |
| Interaction specification depth | 7/10 | 8/10 | 7.5 |

**Discussion points resolved:**
- Sasha wanted 7 elevation levels; Marcus argued 4 is sufficient for this project. Elena sided with Marcus — keep it simple for a single developer.
- Marcus wanted a 7th template (Kanban Board); Sasha argued it's a variant of Timeline. Elena: defer to Phase 2 if client needs it.
- Both agreed AG Grid Community is sufficient. Enterprise features (row grouping, pivoting) would be nice but are not blocking.

---

## 6. Agreed Actions for Round 3

1. Build the functioning prototypes for all 6 templates
2. Each prototype must demonstrate dark/light toggle
3. AG Grid must be integrated in T2, T3 with real sorting/filtering
4. Form controls in T4 must show validation states and conditional sections
5. Consolidate into a single index page with navigation between templates
6. Write the client-facing delivery plan
