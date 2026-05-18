# Horizon-UI ↔ EOS.Horizon — Support-area handover bundle

**From:** the EOS.Horizon team (production app, `features/24593-initial-go-live`).
**To:** the `sitebyte/horizon-ui-templates` author / team.
**Date:** 2026-05-13.

---

## TL;DR

We've ported your **horizon-v40 tokens** + **v41 deltas** into our app and shipped a working five-page Support area against real EOS data. Functionally it's done. Visually it's clearly behind your templates — most starkly when we flip our `data-theme="horizon-ui-light"` variant on and almost nothing changes.

We'd like to **stop reinventing your design** and instead give you our React markup so you can produce one round of refined CSS that we drop in. Section [§ The ask](#the-ask) is the operative bit; everything else is supporting material.

We've matched the structure of every page to the v41 mockups; what's missing is the polish only you can put on it.

---

## What's in this bundle

| Path | Contents |
|---|---|
| [`asks/`](./asks/) | The specific deliverables we'd like back (one file per ask, so you can divide the work). |
| [`screenshots/`](./screenshots/) | Side-by-side captures: v41 template vs. live TST2 Horizon, each in dark **and** light mode, for all five Support pages. |
| [`markup/pages/`](./markup/pages/) | The page-level React components for each Support page. |
| [`markup/primitives/`](./markup/primitives/) | The shared horizon-namespace primitives (Tile, KpiCell, KpiStrip, StatusPill, AlertRow, CheckRow, KvGrid, Stack, Text, Mono, Surface, Hairline, DataTable). Roughly the equivalent of your `shell.css` components but expressed as React components consuming CSS-variable tokens. |
| [`markup/tokens/`](./markup/tokens/) | Our current `theme-horizon-ui.css`, `_semantic.css`, and `index.css`. The whole token surface in one place. |
| [`appendix-gaps.md`](./appendix-gaps.md) | Page-by-page diff of what visibly differs between your v41 mockup and our TST2 deploy. |
| [`appendix-architecture.md`](./appendix-architecture.md) | Brief explanation of how we consume your design language (React primitives + CSS variables, not raw `.hz-*` class adoption). |

---

## The ask

We need three things back, in priority order:

### 1. A complete `theme-horizon-ui.css` for both variants

Our current file declares the right selectors (`[data-theme="horizon-ui"]` and `[data-theme="horizon-ui-light"]`), but the light variant has been a one-line stub since the v40 port. **Light-mode toggling in our app currently has no visual effect** because most surfaces / primitives bind to colour tokens whose `[data-theme="horizon-ui-light"]` overrides aren't there. We need the full set.

Concretely: please send back a replacement `theme-horizon-ui.css` covering every token we already declare under `[data-theme="horizon-ui"]`, with a corresponding `[data-theme="horizon-ui-light"]` block that produces your template's light-mode appearance. **Same token names**, just both variants populated. Our `_semantic.css` declares the full surface; mirror that.

The four screenshots in [`screenshots/dashboard-{dark,light}/`](./screenshots/) make the gap obvious: yours flips cleanly, ours doesn't flip at all.

### 2. A compact-density treatment

Your v41 mockup's row heights are ~25% tighter than ours across every panel:

| Surface | Yours | Ours |
|---|---|---|
| Integrity-check row | ~22 px | ~32 px |
| Service-health row | ~18 px | ~26 px |
| Database & Throughput KV row | ~18 px | ~24 px |
| EOD step row | ~16 px | not visible (see appendix) |

We'd prefer not to invent compact-row tokens unilaterally. **Please tell us how you'd express this** — a `--row-height-compact` token? A `.hz-density-compact` class? A `data-density` attribute? Whatever the canonical form, we adopt it.

### 3. The alert-banding rule + EOD step-row spec

Your alerts panel has full-width tinted backgrounds per severity (heavier than just a pill). Your EOD step table has start time + duration + status pill. **We need the token bindings for the alert backgrounds** (`--alert-bg-fail`, `--alert-bg-warn`, `--alert-bg-info` or whatever you'd name them), and **a yes/no on whether the EOD panel should carry our Run/Cancel action buttons** (you didn't have them in v41; we added them because operators need them). Both decisions one-liners; both decisions ours to ship once you've called them.

---

## What we promise back

- Drop your new CSS in **as-is** under `client/src/horizon/tokens/`.
- No bikeshedding token names — yours win.
- A fresh Playwright capture set after applying the changes, in the same shape as this bundle.
- A second handover if visual gaps remain, with the same structure (so the cycle stays short).

---

## Architectural note

We're consuming your **tokens**, not your **markup**. Our app uses a React-primitive library (`client/src/horizon/`) that consumes CSS custom properties from your token files. We are not lifting `.hz-sidebar`, `.hz-tile`, etc. directly. See [`appendix-architecture.md`](./appendix-architecture.md) for the why — it's intentional and load-bearing for our React app structure.

The implication for you: please assume your replacement `theme-horizon-ui.css` will be applied to our existing React markup. Where your treatment requires a markup change (e.g. a `<div class="hz-alert-row">` you'd expect), tell us in the cover note for your response and we'll add the testid / wrapper class. We won't refuse markup changes; we just won't replace components wholesale.
