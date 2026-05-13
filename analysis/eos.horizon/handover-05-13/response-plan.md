# Design Authority Response -- EOS.Horizon Handover 2026-05-13

**From:** horizon-ui-templates design authority
**To:** EOS.Horizon team (`features/24593-initial-go-live`)
**Date:** 2026-05-13

---

## Executive Summary

We reviewed your five-page handover bundle, screenshots, markup, and token files. Three evaluation sessions (token audit, visual gap analysis, design decisions) produced the findings below. The headline: **your token values are correct and complete -- including light mode.** The gaps are integration wiring, density tuning, and six small component tweaks. Here are your three asks answered, plus the design decisions you asked us to make.

---

## Ask 1: Complete Light Theme -- ALREADY COMPLETE

**Surprise finding:** Your `theme-horizon-ui.css` light block (lines 104-171) is fully populated. Every token has a correct `[data-theme="horizon-ui-light"]` override matching our v41 light theme, including both v41 fixes (`--surface-overlay` and `--text-muted`).

**If light mode isn't flipping, the bug is one of these:**

1. **`data-theme` attribute not being set to `"horizon-ui-light"`** on `<html>`. Check your ThemeContext.tsx -- is it writing `data-theme="horizon-ui-light"` or just `data-theme="light"`? The CSS selector is `[data-theme="horizon-ui-light"]` specifically.

2. **`_semantic.css` `:root` defaults bleeding through.** Your `:root` block in `_semantic.css` declares warm-stone/amber values (the old pre-horizon theme). If any component renders before the `[data-theme]` attribute is set, or if specificity allows `:root` to win over `[data-theme]`, you'll see warm-stone colors. Consider adding `!important` or raising specificity on the theme selectors, OR -- better -- change the `:root` defaults in `_semantic.css` to match the horizon-ui dark values so the fallback is correct.

3. **CSS load order.** `index.css` imports `_palette.css` -> `_semantic.css` -> `theme-horizon-ui.css`. The theme file MUST load last so its overrides win. Verify Vite isn't reordering.

**Action:** Debug the attribute wiring. The CSS file is ready as-is. We do not need to ship a replacement.

---

## Ask 2: Compact Density -- `data-density` attribute (your Option C)

### The canonical form

Use `data-density` attribute on container elements. Your KvGrid.tsx already emits `data-density` (line 53) -- extend this pattern to all primitives.

### Tokens to add to `_semantic.css`

```css
/* Density axis -- set via data-density on any container (typically :root).
   Default is "comfortable" -- no attribute needed, values fall through. */

:root {
  --density-row-height:     36px;
  --density-cell-padding-y: 0.375rem;  /* 6px */
  --density-cell-padding-x: 0.75rem;   /* 12px */
  --density-font-size:      var(--text-xs);
}

:root[data-density="compact"],
[data-density="compact"] {
  --density-row-height:     24px;
  --density-cell-padding-y: 0.125rem;  /* 2px */
  --density-cell-padding-x: 0.5rem;    /* 8px */
  --density-font-size:      var(--text-xs);
}

:root[data-density="trader"],
[data-density="trader"] {
  --density-row-height:     20px;
  --density-cell-padding-y: 0.0625rem; /* 1px */
  --density-cell-padding-x: 0.5rem;    /* 8px */
  --density-font-size:      0.5625rem; /* 9px */
}
```

**Replace your current `--density-row-comfortable/compact/trader` tokens with these four tokens per tier.** Your current `--density-row-compact: 28px` is still too tall -- v41 integrity-check rows measure ~22px. The 24px compact value is the right target.

### Primitive migration

| Component | Current | Change to |
|---|---|---|
| CheckRow | `py-1.5` | `style={{ paddingBlock: 'var(--density-cell-padding-y)', paddingInline: 'var(--density-cell-padding-x)' }}` |
| AlertRow | `py-1.5 px-3` | Same pattern |
| KpiCell | `px-3 py-1.5` | Same pattern |
| KvGrid | `gap-y-0.5` / `gap-y-1` | Bind to density-aware gap token or keep `sm`/`md` prop |

### Default for the support dashboard

Set `data-density="compact"` on the dashboard page root. The v41 dashboard IS compact -- that's the baseline, not a special mode. Use "comfortable" for narrative pages (audit detail, environment topology).

### AG Grid integration

```css
[data-density="compact"] .ag-theme-quartz,
[data-density="compact"] .ag-theme-quartz-dark {
  --ag-row-height: var(--density-row-height);
  --ag-header-height: calc(var(--density-row-height) + 4px);
  --ag-font-size: var(--density-font-size);
}
```

---

## Ask 3a: Alert Banding -- CONFIRMED INTENTIONAL

**Yes, the banded background is the design intent.** Alerts need to interrupt the visual scan. Pill-only is not enough for FAIL severity.

**You've already implemented this correctly** in AlertRow.tsx. Six micro-tweaks to match v41 exactly:

| Fix | Current | Target |
|---|---|---|
| Background opacity | `/20` (20%) | `/15` (15%) or use `bg-[var(--rag-red-dim)]` directly |
| Left border width | `border-l-4` (4px) | `border-l-2` (2px) |
| Horizontal padding | `px-3` (12px) | `px-2` (8px) |
| Vertical padding | `py-1.5` (6px) | `py-1` (4px) -- or bind to density token |
| Border radius | none | `rounded-sm` |
| **Title text color** | `tone="primary"` (white) | **Use severity tone** (`tone={LABEL_TONE[severity]}`) |

The title text color is the most impactful single fix. Template makes the entire title line red/amber/blue -- the row screams its severity. Your current primary-tone title reads neutral.

**No new tokens needed.** Use existing `--rag-*-dim` tokens. If you want explicit aliases:
```css
--alert-bg-fail: var(--rag-red-dim);
--alert-bg-warn: var(--rag-amber-dim);
--alert-bg-info: var(--rag-info-dim);
```
But these are pure aliases -- skip them and use `--rag-*-dim` directly.

---

## Ask 3b: EOD Run Status -- Decisions

### Run/Cancel buttons: **YES, keep them.**

The v41 mockup didn't show them because it's static HTML. They're operationally necessary. Refine: bind button sizing to density tokens instead of hardcoded `text-[10px] px-1.5 py-px`.

### Duration column: **DROP IT.**

The v41 "Duration" was aspirational. Your scheduler API doesn't expose step-level timing. Do not synthesize "time since LastRun" -- that's wall-clock time since completion, not execution duration, and would be misleading.

### Canonical EOD row shape:

| Column | Render |
|---|---|
| `#id Name` | Mono ID, semibold name |
| LastRun | Relative time (`3m ago`) with ISO tooltip |
| Status | Severity pill |
| Action | Run or Cancel button |

**Your current shape is correct.** One addition: add a header row (`Job | Last Run | Status | `) for scanability. The v41 template has `<thead>` headers; your implementation omits them.

If/when the scheduler API adds a `duration` or `elapsedMs` field, add the column back then.

---

## Additional Fixes (from visual gap analysis)

### CheckRow label weight
**Current:** `weight={600}` (semibold)
**Target:** `weight={400}` or `weight={500}`

The template's check-row labels are normal-weight body text, not bold headers. Only the section title and severity pill should be semibold.

### KPI value font size
**Current:** `size="xl"` (20px in your scale)
**Target:** `size="base"` or `size="md"` (13-14px)

The template's KPI values are compact -- they render at `--text-base` (14px), not the `--text-xl` the component defaults to. The KPI strip should feel informational, not hero-sized.

### KPI value weight
**Current:** `weight={600}`
**Target:** `weight={700}`

Template uses 700 (bold) for KPI values.

---

## What You Got Right -- Acknowledged

These are good engineering decisions we want to explicitly validate:

1. **Token architecture (two-tier: semantic shape + theme bindings)** -- exactly right and durable
2. **Consuming tokens, not markup** -- correct decision for a React SPA
3. **StatusPill three-kind taxonomy** -- architecturally superior to our single `.hz-badge`
4. **KpiCell discriminated kind union** -- proper typing we don't have
5. **Tile vs Surface distinction** -- more precise than our generic `.hz-card`; we're adopting this naming back into the template vocabulary
6. **`STUB` severity** -- correct operational choice
7. **`--pnl-*` tokens** -- well-reasoned finance-tuned colors
8. **`--env-accent` + `[data-env]`** -- excellent pure-CSS environment tinting
9. **`--density-*` tokens** (concept, not values) -- enterprise need we lacked
10. **AlertRow link handling** -- internal vs external routing
11. **Surface ramp, RAG colors, accent values** -- byte-for-byte correct

---

## Cargo Phase Tokens -- Ship When Ready

When you port cargo-board/lifecycle pages, you'll need these six tokens. Add to `_semantic.css` `:root`:

```css
--phase-planning:   #64748b;
--phase-nomination: #3b82f6;
--phase-loading:    #f59e0b;
--phase-transit:    #6366f1;
--phase-discharge:  #10b981;
--phase-settlement: #22c55e;
```

Not blocking for the support area. Ship when the cargo pages land.

---

## Implementation Priority

| # | Change | Scope | Impact |
|---|---|---|---|
| 1 | Debug light-mode attribute wiring | ThemeContext.tsx | Unblocks light mode entirely |
| 2 | Add density tokens + set `data-density="compact"` on dashboard | _semantic.css + page root | Fixes all row-height gaps at once |
| 3 | Bind primitives to density tokens (replace `py-1.5` etc.) | CheckRow, AlertRow, KpiCell | Density actually takes effect |
| 4 | AlertRow: severity-tone title, `border-l-2`, `/15` opacity, `rounded-sm` | AlertRow.tsx | Alert urgency matches template |
| 5 | KpiCell: value size down to `base`/`md`, weight up to 700 | KpiCell.tsx | KPI strip matches template |
| 6 | CheckRow: label weight down to 400-500 | CheckRow.tsx | Check rows read as body, not headers |
| 7 | EOD tile: add table header row | SchedulerJobsTile.tsx | Scanability improvement |

Steps 1-3 are structural. Steps 4-7 are polish. Do 1-3 first, re-screenshot, then assess whether 4-7 are still needed or if density alone closed the visual gap enough.

---

## Next Cycle

After applying these changes, send us a second handover bundle in the same shape (screenshots + markup). We'll close any remaining gaps in a single round. The cycle stays short because the architecture is right -- we're tuning values, not rebuilding structure.
