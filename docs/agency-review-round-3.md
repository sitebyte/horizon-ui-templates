# MERIDIAN DESIGN CO.
## Project Horizon — Round 3: Final Specification & Client Delivery Plan

**Client:** Jonathan Cobley, Project Horizon
**Date:** 11 April 2026
**Status:** Final — Ready for Client Presentation

---

## Dear Jonathan,

Thank you for engaging Meridian Design Co. for the Horizon UI design system. After three rounds of internal review between our Lead UI Designer (Sasha), Lead UX Designer (Marcus), and Design BA (Elena), we're presenting our final specification and delivery plan.

What follows is what we're building for you and why.

---

## 1. What We're Delivering

### 6 Functioning Template Prototypes

Each is a standalone HTML page using Tailwind CSS and AG Grid (where applicable). Each includes working dark/light theme toggle, realistic mock data, and interactive elements. They are **reference implementations** — your developers can inspect the HTML/CSS and replicate the patterns in React.

| # | Template | What It Demonstrates | Reusable Beyond Trading? |
|---|----------|---------------------|--------------------------|
| T1 | **Dashboard** | KPI cards with deltas + sparklines, alert feed, chart area, quick actions, sidebar nav, command palette | Yes — any data-intensive app |
| T2 | **Master-Detail** | AG Grid list with sorting/filtering + detail panel with tabs, status lifecycle, related entity links | Yes — CRM, inventory, any entity management |
| T3 | **Data Grid** | Full AG Grid: multi-sort, column filters, cell renderers, row selection, context menu, toolbar, export | Yes — any tabular data display |
| T4 | **Complex Form** | Conditional sections, searchable combobox, inline validation, live preview, grouped fields | Yes — any multi-step data entry |
| T5 | **Timeline** | Gantt-style with phase-colored bars, summary strip, click-to-expand detail | Yes — project management, scheduling |
| T6 | **Settings** | Grouped settings with toggles, selects, inputs, danger zone | Yes — any application settings page |

### Shared Infrastructure Across All Templates

- **Sidebar Navigation** — Collapsible, grouped, with badge counts and active highlighting
- **Command Palette** — Cmd+K activated, with navigation, search, and actions
- **Theme Toggle** — Dark/light with CSS custom properties, persisted to localStorage
- **Price Ticker** — Header bar with live-updating values (trading-specific but removable)
- **Status Bar** — Footer with system info and keyboard shortcut hints

---

## 2. Design Decisions We Made For You

These are opinionated choices. We're explaining our reasoning so you can push back if you disagree.

### 2.1 Dark Mode First
**Decision:** Dark mode is the default. Light mode is the alternative.
**Why:** Your primary users (traders) work 10+ hour days staring at screens. Every trading platform they use (Bloomberg, Refinitiv, Ice) is dark. Dark mode reduces eye strain and makes colored data (green/red P&L, status badges) more visually prominent.
**Pushback?** If your user base includes significant non-trader users (management, ops), consider defaulting to system preference.

### 2.2 AG Grid Community, Not Enterprise
**Decision:** All grid templates use AG Grid Community Edition (MIT license, free).
**Why:** Community gives you sorting, filtering, column pinning, row selection, CSV export, and theming — which covers 90% of your needs. Enterprise adds row grouping, pivoting, Excel export, and clipboard — nice to have, not blocking. You can upgrade later without changing your templates.
**What you'd lose:** The trade blotter can't group by counterparty or pivot by month without Enterprise. Workaround: use TanStack Table's grouping for those specific cases.

### 2.3 CSS Custom Properties, Not Tailwind Config
**Decision:** All theme colors are CSS custom properties (`:root` / `.dark`), not Tailwind config values.
**Why:** This lets the theme toggle work with a single class change on `<html>`. Tailwind's `dark:` prefix requires `darkMode: 'class'` config and per-element dark classes scattered through every component. CSS properties are simpler, more maintainable, and the industry standard for design systems.
**Practical effect:** Instead of `bg-gray-900 dark:bg-white`, you write `bg-[var(--surface)]`. One declaration, works in both themes.

### 2.4 Single-Page Templates, Not a React App
**Decision:** Each template is a standalone HTML file with inline JavaScript, not a React component.
**Why:** These are **reference implementations**, not production code. Your developers will translate them into React components using shadcn/ui patterns. Standalone HTML means: no build step, opens in any browser, easy to inspect, no framework opinions. The patterns transfer directly — every `class=""` becomes a `className=""`, every `<select>` becomes a shadcn `<Select>`.

### 2.5 Inter + JetBrains Mono
**Decision:** Inter for UI text, JetBrains Mono for all numeric data.
**Why:** Inter was designed for computer screens at small sizes — it has clear letterforms at 11-14px, which is where your grid data lives. JetBrains Mono ensures numbers are tabular-aligned (every digit is the same width), which is critical for price columns and volumes. Both are free, both are Google Fonts available.

---

## 3. Component Quick Reference

Every template assembles from these building blocks. Here's the fast reference your developers need:

### Buttons
```
Primary:     bg-[var(--accent)] text-white
Secondary:   bg-[var(--surface-raised)] text-[var(--text-primary)] border
Ghost:       bg-transparent hover:bg-[var(--surface-raised)]
Destructive: bg-red-600 text-white
Sizes:       h-7 text-xs px-2 (sm) | h-9 text-sm px-4 (md) | h-11 text-base px-6 (lg)
Loading:     spinner icon + "Loading..." text, pointer-events-none
```

### Form Inputs
```
Default:     bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2
Focus:       ring-2 ring-[var(--ring-focus)] border-[var(--accent)]
Error:       border-red-500 + red text below
Disabled:    opacity-50 pointer-events-none
With icon:   pl-9 + absolute icon left
With addon:  rounded-l-none + button/text right
```

### Status Badges
```
Draft:     bg-gray-500/15 text-gray-400
Pending:   bg-blue-500/15 text-blue-400
Active:    bg-green-500/15 text-green-400
Warning:   bg-amber-500/15 text-amber-400
Error:     bg-red-500/15 text-red-400
Closed:    bg-gray-500/10 text-gray-500
Shape:     rounded-full px-2 py-0.5 text-xs font-medium
```

### Metric Cards
```
┌──────────────────────┐
│ LABEL          [▲ 5%]│   Label: text-xs uppercase tracking-wider text-muted
│ $2.14M               │   Value: text-2xl font-bold font-mono
│ ▲ $0.35M today       │   Delta: text-xs + green/red color
│ ═══════              │   Sparkline: SVG 80x24, stroke only
└──────────────────────┘
```

---

## 4. Client Delivery Plan

### What We're Building Now

| Deliverable | Contents | Format |
|-------------|----------|--------|
| `index.html` | Hub page linking all templates + summary | HTML |
| `demo-dashboard.html` | T1: Dashboard with KPIs, alerts, charts | HTML + AG Grid |
| `demo-master-detail.html` | T2: List + Detail with AG Grid, tabs, lifecycle | HTML + AG Grid |
| `demo-data-grid.html` | T3: Full AG Grid with all features | HTML + AG Grid |
| `demo-form.html` | T4: Complex form with combobox, validation, preview | HTML |
| `demo-timeline.html` | T5: Gantt timeline with phases | HTML |
| `demo-settings.html` | T6: Settings/config page | HTML |

**Every page includes:**
- Working dark/light theme toggle (top-right, persists to localStorage)
- Collapsible sidebar navigation
- Command palette (Cmd+K)
- Realistic mock data (LNG trading domain where relevant, generic elsewhere)
- AG Grid with sorting/filtering where applicable
- Mobile-responsive (desktop-first, graceful tablet)
- Footer with keyboard shortcut hints

### How To Use These Deliverables

1. **Review** — Open each template in your browser, toggle dark/light, try the interactions
2. **Inspect** — View Source or DevTools to see the exact HTML/CSS patterns
3. **Translate** — Your React developers replicate each template as React components using shadcn/ui primitives, replacing mock data with TanStack Query hooks
4. **Extend** — New screens should be assemblable from the template patterns. If a new screen doesn't fit any template, it's time for a design conversation.

### Timeline

This is a fixed-scope engagement. All 6 templates delivered today. Implementation support available on request.

---

## 5. Round 3 Evaluation — Final Sign-Off

### Sasha (UI Lead) Final Assessment
> "The token system is solid. Six templates cover the screen types well. I'm satisfied with the AG Grid theming approach — Quartz with our CSS custom properties gives consistent styling. The one risk is that AG Grid's internal styles may fight with Tailwind's reset in edge cases — developers should test early. Overall: ready to build."

### Marcus (UX Lead) Final Assessment
> "The interaction patterns are well-specified. The form template is the most complex — the conditional sections and combobox with async search need careful implementation. I want to call out that the timeline template doesn't include drag-and-drop yet — that's a Phase 2 item. The command palette is the single highest-impact UX improvement we're proposing. Overall: ready to build."

### Elena (Design BA) Final Assessment
> "The client asked for templates that work for trading AND general implementation. All 6 templates are domain-agnostic in structure — the trading data is just the mock content. Template T3 (Data Grid) and T4 (Complex Form) are especially reusable. The deliverable is correctly scoped: not a design system library, not production React components, but reference implementations that bridge the gap between 'what should it look like' and 'how do I build it'. Ready to deliver."

### Final Scorecard

| Criterion | Score | Notes |
|-----------|-------|-------|
| Template coverage | 9/10 | 6 templates cover ~95% of enterprise screen types |
| Component specification | 8/10 | 25 components defined, AG Grid configs specified |
| Dark/light theme | 9/10 | CSS custom property approach is clean |
| AG Grid integration | 8/10 | Community Edition, Quartz theme, custom renderers |
| Form patterns | 8/10 | Combobox, validation, conditional, preview |
| Reusability beyond trading | 9/10 | Templates are domain-agnostic structures |
| Client-readiness | 9/10 | Clear deliverables, usage instructions, no ambiguity |
| **Overall** | **8.6/10** | |

---

## 6. Post-Delivery Recommendations

Once you've reviewed the templates, we recommend this implementation sequence:

1. **Week 1-2:** Install shadcn/ui, set up CSS custom properties and theme toggle
2. **Week 3-4:** Build the sidebar + command palette as the app shell
3. **Week 5-6:** Implement the DataGrid wrapper around AG Grid
4. **Week 7-8:** Convert the trade entry form to use combobox + validation patterns
5. **Week 9-10:** Apply master-detail template to Contracts and Trades views
6. **Week 11-12:** Apply dashboard template to home page

This sequence means every phase delivers visible progress. Your users see improvements every two weeks.

---

**Meridian Design Co.**
*Sasha Koval, Lead UI Designer*
*Marcus Chen, Lead UX Designer*
*Elena Torres, Design BA*
