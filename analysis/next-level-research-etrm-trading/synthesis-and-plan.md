# Synthesis: Next-Level ETRM Trading UI

**Author:** Jon Ive (Design Director) with full panel
**Date:** 3 May 2026

---

## Executive Summary

After three rounds of competitive research, UX audit, and design direction analysis, our recommendation is clear: **Horizon v2 has the right architecture and the right data, but needs tighter composition, stronger visual hierarchy, and connected navigation to feel like a production trading system.**

The gap is not features — it's *spatial discipline*.

---

## What We Learned

### From the Market
| System | Strength | What Horizon Should Adopt |
|--------|----------|--------------------------|
| **Bloomberg** | Zero-latency density | Data IS the interface — remove wrappers around primary content |
| **Trayport Joule** | Market matrix aggregation | Price matrix pattern — benchmark x month with depth |
| **Molecule** | Modern ease-of-use | Natural language search, AI assistant, customizable views |
| **TradingView** | Workspace layouts | Multi-panel arrangements, saved layouts, persistent state |

### From Jony Ive's Principles
1. **"Simplicity is about bringing order to complexity"** — Don't add more, organize better
2. **"Intentional reduction"** — Every pixel of padding must justify its existence
3. **"Care communicates"** — When users sense a product was designed for them specifically, they trust it
4. **"Joy as feedback"** — Good interactions should feel good, not just work

### From the UX Audit
- **Average page score: 7.9/10** — Good baseline, but not exceptional
- **Top scoring:** Blotter (9/10), Positions (9/10) — data-dense pages work best
- **Lowest scoring:** Curves (7/10), Audit Log (7/10) — pages that need more content structure
- **Universal issue:** Spacing is too generous for a trading interface

---

## UI/UX Approach: "Disciplined Density"

### The Five Principles

**1. Data Is the Interface**
Remove visual chrome (card borders, excessive padding, decorative spacing) from primary data panels. The position ladder IS the dashboard. The AG Grid IS the blotter page. Don't wrap them in cards — let them breathe on their own.

**2. Numbers Are Sacred**
Financial values deserve special treatment: right-aligned, monospace with tabular-nums, weighted by importance. P&L values get `font-weight: 600`. Hero numbers are the dominant visual element.

**3. Hierarchy Through Density Variation**
Not everything at the same density. Primary panels (position ladder, blotter) are dense. Secondary panels (alerts, activity) are comfortable. Tertiary elements (breadcrumbs, status bar) are minimal.

**4. Connected, Not Isolated**
Every entity (trade, cargo, invoice, nomination) is clickable and navigates to its detail page. A context strip below the header shows persistent portfolio state. Pages flow into each other.

**5. Motion Is Feedback**
No decorative animation. Every motion communicates state: trade submitted (row slides in), P&L changed (number transitions), page loaded (content fades 150ms).

---

## Clear Views on UI/UX Approaches

### What To Do
- **Tighten all spacing by ~25%.** Content padding 1rem -> 0.75rem. Card padding 0.75rem -> 0.5rem. Table rows 1.75rem -> 1.5rem.
- **Add `tabular-nums`** to all monospace numbers for perfect column alignment.
- **Add a context strip** below the header showing Net Position, P&L, Hedge Ratio, Credit — persistent across all pages.
- **Make entities clickable.** Trade IDs in blotter -> lifecycle. Cargo names -> cargo-board. Invoice IDs -> reconciliation.
- **Add toolbar KPIs** to data-heavy pages (blotter, invoices) — compact inline stats, not full KPI cards.
- **Use borderless cards** for primary content panels — position ladder, AG Grid, Gantt chart don't need card wrappers.

### What NOT To Do
- **Don't add workspace customization yet.** It's a significant engineering effort and the templates are static HTML. Note it as a future capability.
- **Don't add real-time data.** The templates are static demos. But design as if data will be live — leave space for update indicators, use the pulse dot pattern.
- **Don't change the visual identity.** The indigo-to-violet gradient, Inter + JetBrains Mono, and 5-tier surface system are excellent. Keep them.
- **Don't redesign components.** The buttons, badges, inputs, and tables work well. Tighten their spacing, don't redesign their appearance.

---

## Implementation Plan: Horizon v3

### Versioning
```
/horizon/    — v1 (original with showcases) — PRESERVED
/horizon-v2/ — v2 (production shell, stripped showcases) — PRESERVED  
/horizon-v3/ — v3 (disciplined density) — NEW
```

### Phase 1: Shell (1 session)
**Files:** `shell.css`, `shell.js`
- Global spacing tightening (content, cards, tables)
- `tabular-nums` on mono class
- `.hz-card.borderless` utility
- `.hz-context-strip` component (below header, persistent portfolio stats)
- `.hz-link-entity` style (clickable IDs with accent color + hover)
- Compact KPI variant (`.hz-kpi.compact`)
- Reduce base font sizes by 1 step on compact pages

### Phase 2: Core 3 Pages (1 session)
**Files:** `index.html`, `blotter.html`, `positions.html`
- Dashboard: context strip, borderless position ladder, clickable mini-blotter
- Blotter: borderless grid, toolbar KPIs, clickable trade IDs
- Positions: summary strip, tighter cells, clickable benchmark+month

### Phase 3: Trading Pages (1 session)
**Files:** `quick-entry.html`, `trade-form.html`, `lifecycle.html`
- Quick entry: tighter strip, inline position impact
- Trade form: tighter sections, market context
- Lifecycle: 2-column layout (timeline left, details right)

### Phase 4: All Remaining Pages (1 session)
**Files:** All other 9 pages
- Apply tightened spacing
- Add cross-entity links where relevant
- Borderless primary panels
- Toolbar KPIs on invoices

### Phase 5: Verification
- Playwright screenshots of all v3 pages
- Side-by-side comparison: v1 vs v2 vs v3
- Validate div balance, no showcase, no All Themes, no skeleton

---

## Success Criteria

When v3 is complete, these should be true:

1. **No page requires scrolling** to see primary content on a 1440x900 display (except trade form and settings)
2. **Every financial number** is right-aligned, monospace, tabular-nums
3. **Every entity ID** (trade, invoice, cargo, nomination, contract) is a clickable link
4. **The context strip** shows Net Position + P&L + Hedge Ratio on every page
5. **Primary panels have no card borders** — data fills the viewport without wrappers
6. **A trader's first impression** is "this is dense, fast, and professional" — not "where's the UI?"

---

## Appendix: Sources

### Competitive Research
- [Bloomberg Terminal UX](https://www.bloomberg.com/company/stories/how-bloomberg-terminal-ux-designers-conceal-complexity/)
- [Trayport Joule](https://trayport.com/products/joule/)
- [Molecule ETRM](https://molecule.io/)
- [ION Allegro](https://iongroup.com/products/commodities/allegro/)
- [ION Openlink V25](https://www.prnewswire.com/news-releases/ions-openlink-v25-advancing-treasury-and-commodity-management-302367784.html)
- [10 Best Trading Platform Designs 2026](https://merge.rocks/blog/the-10-best-trading-platform-design-examples-in-2024)
- [CTRM Software Market](https://www.ctrmcenter.com/resources-category/energy-trading-and-risk-management-software-etrm/)

### Design Principles
- [UI Density — Matt Ström-Awn](https://mattstromawn.com/writing/ui-density/)
- [Jony Ive: From Minimalism to Meaning](https://www.designative.info/2025/05/21/jony-ives-design-reckoning-from-minimalism-to-meaning/)
- [Jony Ive Principles and Philosophy](https://www.playforthoughts.com/blog/jonathan-ive-power-of-great-design)
- [Enterprise Data Tables Design](https://medium.com/pulsar/modern-enterprise-ui-design-part-1-tables-ad8ee1b9feb)
- [Fintech Dashboard Best Practices 2026](https://www.onething.design/post/top-10-fintech-ux-design-practices-2026)
- [Designing for Information Density](https://uxdesign.cc/designing-for-information-density-69775165a18e)

### Technical Reference
- [Enterprise UX Design 2026](https://www.wearetenet.com/blog/enterprise-ux-design)
- [SaaS Navigation UX](https://merge.rocks/blog/saas-navigation-ux-best-practices-for-your-saas-ux)
- [Infragistics Dock Manager](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/dock-manager)
