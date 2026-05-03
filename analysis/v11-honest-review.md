# v11 Honest Review — What's Failing, What's Close, What's Next

**Date:** 3 May 2026

---

## The Honest Assessment

v11 is **foundationally close but visually inconsistent**. It has the right data, the right menu scale, and the right component library — but the pages don't feel like one cohesive product. Here's what's wrong:

### 1. Pages Are From Different Eras
- **Dashboard (index.html)** = v7 grid-first design (AG Grid, EOS columns, dense)
- **Positions** = v3 heat-map design (cards, generous spacing)
- **Quick Entry** = v4 design (card wrappers, AG Grid with lots of empty space below 3 rows)
- **Lifecycle** = v7 trade detail (8 tabs, dense form)
- **Cargo Matching** = v6 design (HTML tables, not AG Grid, spacious)
- **Settings** = v5 design (comfortable spacing, cards)
- **Style Guide** = v10 (new, consistent)

**These pages were built across 11 versions and it shows.** The dashboard is dense with 20+ AG Grid columns. Quick Entry has 3 rows in a grid that fills 80% empty space. Positions is a standalone heat-map with no surrounding context. Cargo Matching uses HTML tables while the blotter uses AG Grid. The density, spacing, and interaction patterns are inconsistent.

### 2. Sidebar Still Doesn't Feel Right
- The double chevron toggle is better but the sidebar itself is still basic — flat list of items with minimal hierarchy visualisation
- When collapsed, it's just dots — no useful information
- The expanded state shows text labels but no hover previews, no search within the menu
- shadcn/ui's sidebar pattern (SidebarHeader + SidebarContent + SidebarFooter with user info) is the current standard — we don't have this structure
- **Missing:** User info at bottom of sidebar (avatar, name, role, logout)
- **Missing:** Search/filter within the sidebar menu

### 3. Inconsistent Component Usage
- Some pages use `.hz-card` wrappers, others are borderless
- Some tables use `.hz-table`, others use `.tbl`, others use AG Grid
- KPIs appear as cards on some pages, as strips on others, as inline stats on others
- Form inputs vary between pages — some use `.hz-input`, others use `.tf-input`, others use inline styles
- Entity links (`hz-entity-link`) are on some pages but not others

### 4. The "Pleasure to Use" Factor Is Missing
- No micro-interactions beyond toast notifications
- No transition animations between states
- No hover effects that reveal additional information
- Numbers don't feel big — $47,200,000 renders the same size as a trade ID
- No progressive disclosure — everything is shown at once or hidden behind tabs
- The Quick Entry page has 3 trade rows and a vast empty void below them

### 5. Tailwind Is Added But Not Used
- v10 added Tailwind CDN but existing pages still use the old custom utility classes
- The Tailwind config is added to each page's `<head>` but layout still uses shell.css utilities
- No pages have been rewritten to use Tailwind-first layout

---

## What's Close (Don't Throw Away)

1. **Shell architecture** — `initShell()` pattern is solid. Header + context strip + sidebar + content + status bar + command palette all work.
2. **Design tokens** — CSS custom properties for colors, spacing, fonts are well-structured and skinnable.
3. **AG Grid integration** — Blotter and dashboard grids with EOS-accurate columns, sorting, grouping are excellent.
4. **Trade detail page** — 8 tabs with 67 attributes is the right depth.
5. **Style guide** — Living component reference is a real asset.
6. **Menu structure** — 55+ items across 7 groups represents EOS's full scope.
7. **Support pages** — System status, data quality, SQL checks are differentiated and useful.

---

## What v12 Needs To Fix

### Priority 1: Visual Consistency Across ALL Pages
Every page must use the same density level, the same spacing, the same component patterns. Pick ONE approach and apply it everywhere:
- AG Grid for ALL tabular data (not HTML tables on some pages, AG Grid on others)
- Consistent KPI presentation (strip on grid pages, cards on form pages)
- Consistent card vs borderless treatment
- Consistent form input styling

### Priority 2: Sidebar Redesign (shadcn-inspired)
Following 2026 best practices:
- **Header section:** Horizon brand + version
- **User section at bottom:** Avatar, name, role, logout link (like shadcn SidebarFooter)
- **Search within menu:** Filter menu items by typing
- **Collapsible groups with smooth transitions**
- **Icon-only collapsed state with tooltips** (not just dots)
- **Active item highlighted with accent background**
- **Badge counts visible in both expanded and collapsed states**

### Priority 3: Rewrite Pages to Use Tailwind
Every page's layout should use Tailwind utility classes (not shell.css utilities). shell.css should ONLY contain:
- CSS custom property definitions
- Custom component styles (hz-kpi, hz-badge, etc.)
- AG Grid theme overrides
- Animations

### Priority 4: Make Numbers Feel Big
- $47,200,000 → Use `text-2xl font-bold tracking-tight tabular-nums` — it should dominate
- P&L values → Larger font, bolder weight, background tint (green-dim/red-dim) on significant values
- Volume (3,200,000 MMBtu) → Monospace, right-aligned, with unit label de-emphasised
- Percentages (78%) → Large with colour context

### Priority 5: Keyboard-First Forms
- All `<select>` elements → searchable combobox with type-ahead
- Date inputs → accept typed text (YYYY-MM-DD or DD/MM/YYYY), not date-picker-only
- Tab order → logical left-to-right, top-to-bottom flow
- Enter → submits the current action
- Escape → cancels/closes
- Auto-focus → first editable field when a page/modal opens
- Visual focus indicators → clear outline on focused elements

### Priority 6: Micro-Interactions
- Row hover → subtle highlight + available actions revealed
- Entity link hover → tooltip with key details
- Status change → smooth badge colour transition
- Tab switch → content crossfade (not instant swap)
- Grid row selected → subtle elevation + border accent
- Toast → slide-in from right with progress bar for auto-dismiss

---

## Sources

- [Enterprise UI Design 2026 — Hashbyt](https://hashbyt.com/blog/enterprise-ui-design)
- [shadcn/ui Sidebar Blocks](https://ui.shadcn.com/blocks/sidebar)
- [shadcn/ui Sidebar Component](https://ui.shadcn.com/docs/components/radix/sidebar)
- [Dark Mode Best Practices 2026](https://natebal.com/best-practices-for-dark-mode/)
- [Sidebar Design Best Practices 2026](https://www.navbar.gallery/blog/best-side-bar-navigation-menu-design-examples)
- [Enterprise UX Design Guide 2026](https://fuselabcreative.com/enterprise-ux-design-guide-2026-best-practices/)
