# Ask 2 — Compact-density treatment

## Background

Your v41 mockup's row heights are roughly **25% tighter** than ours across every panel. Side-by-side measurements (taken from the comparison screenshots at 1440×900):

| Surface | v41 template | Our Horizon |
|---|---|---|
| Integrity-check row | ~22 px | ~32 px |
| Service-health row | ~18 px | ~26 px |
| Database & Throughput KV row | ~18 px | ~24 px |
| EOD step row | ~16 px | (rendering issue separately — see appendix-gaps.md) |

At the same vertical budget, your dashboard reads ~8 integrity rows where ours reads ~6. The whole page reads less informationally rich.

## What we'd like

**Decide the canonical form of "compact density" and tell us how to consume it.** Options we can see:

| Option | What it'd look like | Pros | Cons |
|---|---|---|---|
| A. Density tokens | `--row-height-default: 32px; --row-height-compact: 22px;` ; primitives read whichever via a `density` prop | Easy for us to thread through React primitives; one source of truth | Two heights, opinionated |
| B. CSS class | `.hz-density-compact { line-height: 1; padding: 0.25rem 0.5rem; ... }` | Mirrors your `.hz-*` class style; granular | We have to attach it manually on every row |
| C. `data-density` attribute | `<table data-density="compact">` ; CSS targets it | Cascades from container; cleanest binding | Newer pattern; you'd have to design the selectors |

Or whatever you'd prefer — we don't have a horse in the race. **Just tell us what to do.**

## What we provide

The current row-height values are visible in:

- [`../markup/pages/SupportDashboardPage.tsx`](../markup/pages/SupportDashboardPage.tsx) — page composition.
- [`../markup/primitives/CheckRow.tsx`](../markup/primitives/CheckRow.tsx), [`AlertRow.tsx`](../markup/primitives/AlertRow.tsx), [`KvGrid.tsx`](../markup/primitives/KvGrid.tsx), [`KpiStrip.tsx`](../markup/primitives/KpiStrip.tsx) — the components that render the rows.

These primitives currently bake their own padding/line-height via Tailwind utilities (e.g. `py-1.5` on `CheckRow`). If you want a token-driven approach, we'll switch them to `var(--row-padding-y)` and bind whichever value you provide.

## Definition of done

You send back either:
1. A small CSS block introducing the new tokens / class / attribute, **plus** a 2-line note on which primitives we should bind it on, OR
2. A patch to specific primitive(s) in our markup with the density treatment baked in.

We then ship and re-screenshot.
