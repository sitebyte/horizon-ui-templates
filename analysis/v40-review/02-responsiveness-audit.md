# Review Pass 2: Responsiveness & Screen Size Audit

> **Rating: CRITICAL GAPS** — Desktop-only template with minimal mobile treatment

## Executive Summary

Horizon v40 has **one media query** at 48rem (768px) and sparse responsive treatment. Core trading pages (blotter, positions, dashboard) use zero Tailwind responsive classes. AG Grid column widths are hardcoded in px. This violates the CLAUDE.md "NO FIXED WIDTHS" rule.

**However:** After researching industry practice, full mobile responsiveness is NOT the correct goal for an enterprise ETRM. Bloomberg, Refinitiv, ION, and all professional trading tools are desktop-first. The correct target is:

- **Primary:** 1280px+ (laptop and up) — must work flawlessly
- **Secondary:** 1024px-1279px (tablet landscape) — graceful degradation
- **Tertiary:** Below 1024px — "desktop recommended" message

## Current Responsive Coverage

### Media Queries in shell.css

| Breakpoint | What It Does | Gaps |
|-----------|-------------|------|
| `@media (max-width: 48rem)` (768px) | Sidebar off-screen, mobile menu, ticker hidden, grid min-height | No backdrop on sidebar, no animation, no tablet treatment |
| `@media print` | Hides shell chrome | Fine |
| **Missing: 64rem** (1024px) | — | No tablet landscape breakpoint |
| **Missing: 80rem+** | — | No ultrawide constraints |
| **Missing: < 32rem** | — | No small mobile |

### Per-Page Responsive Treatment

| Page | Has @media? | Breakpoint | Quality |
|------|-----------|-----------|---------|
| lifecycle.html | Yes | 64rem | Good (2-col → 1-col) |
| support-dashboard.html | Yes | 48rem, 64rem | Acceptable |
| user-profile.html | Yes | 64rem | Good (uses auto-fill minmax) |
| valuations.html | Yes | 64rem | Good |
| contracts.html | Yes | 36rem, 48rem | Good |
| **index.html** | **No** | — | Desktop-only |
| **blotter.html** | **No** | — | Desktop-only |
| **positions.html** | **No** | — | Desktop-only |
| **cargo-board.html** | **No** | — | Desktop-only |

### Hardcoded Dimensions (CLAUDE.md Violations)

| Element | Value | Location |
|---------|-------|----------|
| AG Grid columns | 85px, 65px, 45px, 100px, etc. | index.html, blotter.html (JS) |
| User menu | `width: 16rem` | shell.css:686 |
| Command palette | `width: 32rem` | shell.css:798 (has max-width:90vw fallback — OK) |
| Dense form | `grid-template-columns: repeat(4, 1fr)` | shell.css:1657 |
| Button heights | 2rem, 1.75rem, 2.5rem | shell.css:1067-1122 |
| AG Grid rows | `--ag-row-height: 2rem` | shell.css:1715 |

### AG Grid Note

AG Grid column widths in px are **normal for AG Grid** — the library's API expects px for `width` in column definitions. This is not a CSS layout violation; it's AG Grid's API. The CLAUDE.md rule applies to CSS layout, not JS grid config. AG Grid handles its own horizontal scrolling.

## Industry Research Findings

### What Trading Platforms Do

| Platform | Mobile Approach |
|----------|----------------|
| Bloomberg Terminal | Separate mobile app (Bloomberg Anywhere), not responsive |
| Refinitiv Eikon | Desktop-first, simplified mobile companion |
| TradingView | Responsive charts, but grid views remain desktop |
| ION | Desktop-only trading, no mobile grid views |
| Schwab/thinkorswim | Three distinct platforms: desktop, web, mobile |

**Consensus:** Enterprise data-dense UIs are desktop-first with purpose-built mobile companions. Nobody makes a 20-column AG Grid responsive to 375px.

### AG Grid Recommendations

AG Grid's own docs recommend:
1. Use `gridSizeChanged` event to detect available width
2. Dynamically show/hide columns with `columnApi.setColumnsVisible()`
3. Use `autoSizeStrategy: { type: 'fitGridWidth' }` for auto-sizing
4. Container sizing: `calc(100vh - Xrem)` is correct (not flexbox)

## What Actually Needs Fixing

### Must-Do (for the desktop experience)

1. **Dense form collapse:** `repeat(4, 1fr)` needs `repeat(2, 1fr)` at 64rem
2. **KPI strip wrapping:** Add `flex-wrap: wrap` to `.hz-kpi-strip` containers
3. **User menu overflow:** Add `max-width: calc(100vw - 2rem)` fallback
4. **Sidebar backdrop:** Add dimmed overlay when sidebar is open at narrow widths
5. **Consolidate per-page @media into shell.css:** Several pages duplicate the same 64rem collapse pattern

### Should-Do (graceful degradation)

6. **Add 64rem breakpoint to shell.css** for tablet landscape
7. **Header compression** at narrow widths (reduce padding, smaller buttons)
8. **Mobile banner** below 48rem: "Optimised for desktop"
9. **Context strip** font size reduction at narrow widths

### Won't-Do (correct decision)

- Full mobile responsiveness for AG Grid pages
- Card-based layouts for grid data on mobile
- Touch gesture support for sidebar
- Landscape mobile detection
