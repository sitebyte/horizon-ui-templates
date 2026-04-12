# Horizon UI Templates

3 visually distinct design themes, each with 11 page types — a reference library for building enterprise trading UIs with Tailwind CSS and AG Grid.

**Live site:** [https://sitebyte.github.io/horizon-ui-templates/](https://sitebyte.github.io/horizon-ui-templates/)

## Themes

| Theme | Design Language | Accent | Font | Density |
|-------|----------------|--------|------|---------|
| **A: Horizon Pro** | Clean enterprise (Linear/Vercel) | Indigo | System/Inter | Comfortable |
| **B: Trading Terminal** | Dense data-first (Bloomberg) | Emerald | JetBrains Mono | Compact |
| **C: Meridian Glass** | Premium glassmorphism (Raycast/Arc) | Violet | Plus Jakarta Sans | Spacious |

## Page Types (per theme)

- Dashboard — KPIs, charts, alerts, activity feed
- AG Grid Data Tables — sorting, filtering, cell renderers, export
- Basic Tables — striped, bordered, compact variants
- Forms — inputs, selects, searchable combobox, conditional sections, validation
- Cards & Lists — stat cards, content cards, user cards, pricing tables
- Charts — bar, horizontal bar, donut, sparklines, progress bars
- Profile — cover, avatar, stats, tabbed content, timeline
- Settings — grouped sections, toggles, selects, danger zone
- Invoice — print-friendly layout, line items, totals
- Sign In — standalone centered form (no sidebar)
- Error 404 — standalone error page

## Features

- Dark/light theme toggle on every page (persisted to localStorage)
- Fully responsive (rem-based, no fixed pixels)
- AG Grid Community with theme-aware styling (quartz/quartz-dark)
- Tailwind CSS only — no other CSS frameworks
- Standalone HTML files — no build step, works with file:// or any server

## Tech

- Tailwind CSS (CDN)
- AG Grid Community v31.3 (CDN)
- Google Fonts (Inter, JetBrains Mono, Plus Jakarta Sans)
- Vanilla JS for interactions

## Local Development

Just open any HTML file in a browser:

```bash
open index.html
# or
open theme-a/index.html
```

## Docs

See `docs/` for the design review process:
- Agency Round 1: Discovery & UX Audit
- Agency Round 2: Design System & Pattern Library
- Agency Round 3: Final Specification & Client Plan
- Implementation Plan (7-phase roadmap)
