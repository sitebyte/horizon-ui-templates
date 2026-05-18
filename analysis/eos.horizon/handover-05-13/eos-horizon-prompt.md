# EOS.Horizon — Design Authority Response (2026-05-13)

Paste this entire document as a prompt into a Claude Code session running in the EOS.Horizon repo. It contains everything needed to update your look and feel to match v41. No other documents are required.

---

## Context

You are working in the EOS.Horizon production app (.NET 10 + React 19 SPA). The design authority (horizon-ui-templates) has reviewed your handover bundle — screenshots, markup, and token files — and produced this response. Your token VALUES are correct and complete, including light mode. The gaps are: attribute wiring (light theme), density tuning, and component measurement tweaks.

## Rules

1. **This is UI-only.** Layout, spacing, typography, color. Do not modify API calls, data fetching, or state management.
2. **Do not change component architecture.** Your primitives (Tile, Stack, Text, Mono, StatusPill, KpiCell, etc.) are correct. We're adjusting measurements, not structure.
3. **Use the px values** where provided. The design templates use a 12px effective root font-size; your app uses 16px. Px values are ground truth.
4. **Follow the implementation priority** at the bottom. Steps 1-3 are structural (do them first, re-screenshot). Steps 4-7 are polish.

---

## STEP 1: Debug Light Theme Attribute Wiring

Your `theme-horizon-ui.css` light block (lines 104-171) is fully populated. Every token has a correct `[data-theme="horizon-ui-light"]` override matching v41, including both v41 fixes (`--surface-overlay` and `--text-muted`).

**The CSS is ready. If light mode isn't flipping, the bug is one of these:**

### Check A: data-theme attribute value
Is `ThemeContext.tsx` writing `data-theme="horizon-ui-light"` on `<html>`? Or is it writing `data-theme="light"`? The CSS selector is `[data-theme="horizon-ui-light"]` specifically. A mismatch here means the light block never activates.

### Check B: _semantic.css :root defaults bleeding through
Your `:root` block in `_semantic.css` declares warm-stone/amber values (the old pre-horizon theme). If any component renders before the `[data-theme]` attribute is set, or if specificity allows `:root` to win over `[data-theme]`, you'll see warm-stone colors.

Fix options:
- Raise specificity on theme selectors (add `!important` if needed)
- OR change the `:root` defaults in `_semantic.css` to match horizon-ui dark values so the fallback is correct (preferred)

### Check C: CSS load order
`index.css` imports `_palette.css` → `_semantic.css` → `theme-horizon-ui.css`. The theme file MUST load last so its overrides win. Verify Vite isn't reordering imports.

**Action:** Find and fix the attribute wiring. Do not rewrite the CSS — the file is ready as-is.

---

## STEP 2: Add Density Token System

Add these tokens to `_semantic.css`. This is the density contract — all components bind to these.

```css
/* Density axis — set via data-density on any container (typically :root).
   Default is "comfortable" — no attribute needed, values fall through. */

:root {
  --density-row-height:     36px;
  --density-cell-padding-y: 6px;
  --density-cell-padding-x: 12px;
  --density-font-size:      var(--text-xs);
}

:root[data-density="compact"],
[data-density="compact"] {
  --density-row-height:     24px;
  --density-cell-padding-y: 2px;
  --density-cell-padding-x: 8px;
  --density-font-size:      var(--text-xs);
}

:root[data-density="trader"],
[data-density="trader"] {
  --density-row-height:     20px;
  --density-cell-padding-y: 1px;
  --density-cell-padding-x: 8px;
  --density-font-size:      9px;
}
```

**Replace your current `--density-row-comfortable/compact/trader` tokens with these four tokens per tier.** Your current `--density-row-compact: 28px` is still too tall — v41 integrity-check rows measure ~22px. The 24px compact value is the right target.

### Set the support dashboard default
Set `data-density="compact"` on the support dashboard page root element. The v41 dashboard IS compact — that's the baseline, not a special mode. Use "comfortable" for narrative pages (audit detail, environment topology).

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

## STEP 3: Bind Primitives to Density Tokens

Replace hardcoded Tailwind padding with density token bindings:

| Component | Current | Change to |
|---|---|---|
| CheckRow | `py-1.5` | `style={{ paddingBlock: 'var(--density-cell-padding-y)', paddingInline: 'var(--density-cell-padding-x)' }}` |
| AlertRow | `py-1.5 px-3` | Same pattern |
| KpiCell | `px-3 py-1.5` | Same pattern — or keep `8px 12px` fixed since KPI strip doesn't change with density |
| KvGrid | `gap-y-0.5` / `gap-y-1` | Bind to density-aware gap token or keep `sm`/`md` prop (already close) |

---

## STEP 4: Fix AlertRow (6 micro-tweaks)

Alert banding (tinted background) IS the design intent. Alerts need to interrupt the visual scan. Your AlertRow already implements this correctly — six tweaks to match v41 exactly:

| Fix | Current | Target |
|---|---|---|
| Background opacity | `/20` (20%) | `/15` (15%) — or use `bg-[var(--rag-red-dim)]` directly |
| Left border width | `border-l-4` (4px) | `border-l-2` (2px) |
| Horizontal padding | `px-3` (12px) | `px-2` (8px) — or bind to density token |
| Vertical padding | `py-1.5` (6px) | `py-1` (4px) — or bind to density token |
| Border radius | none | `rounded-sm` (add it) |
| **Title text color** | `tone="primary"` (white) | **Use severity tone**: `tone={LABEL_TONE[severity]}` — red/amber/blue |

**The title text color is the single most impactful fix.** The template makes the entire title line red/amber/blue — the row screams its severity. Your current primary-tone title reads neutral.

### Row separation
Change from hairline border (`border-b`) to margin gap (`mb-1` = 4px). AlertRows are spaced, not divided.

### No new tokens needed
Use existing `--rag-*-dim` tokens directly. Skip creating aliases like `--alert-bg-fail`.

---

## STEP 5: Fix KpiCell (3 tweaks)

| Fix | Current | Target |
|---|---|---|
| Value font-size | `size="xl"` (20px) | `size="base"` or `size="md"` (14px) |
| Value weight | `weight={600}` | `weight={700}` |
| Label tone | `tone="tertiary"` | `tone="muted"` (darker/quieter) |

The template's KPI values are compact and informational, not hero-sized. 14px bold mono with tabular-nums.

### Full KpiCell spec
| Property | Value |
|---|---|
| Padding | `8px 12px` |
| Label font-size | `8px` |
| Label weight | `600` |
| Label color | `var(--text-muted)` |
| Label transform | `uppercase`, `letter-spacing: 0.06em` |
| Value font-family | `var(--font-mono)` |
| Value font-size | `14px` |
| Value weight | `700` |
| Value line-height | `1.2` |
| Value numeric | `tabular-nums` |
| Status dot | `6px` circle |

---

## STEP 6: Fix CheckRow

| Fix | Current | Target |
|---|---|---|
| Title weight | `weight={600}` (semibold) | `weight={400}` (normal body text) |
| Title tone | `tone="primary"` | `tone="secondary"` |
| Hover | — | Add `hover:rounded-sm` |
| Severity highlight | — | When severity is warn/fail, apply `bg-[var(--rag-amber-dim)]` or `bg-[var(--rag-red-dim)]` on the whole row |

### Full CheckRow spec
| Property | Value |
|---|---|
| Padding vertical | `3px` (bind to `--density-cell-padding-y`) |
| Padding horizontal | `8px` (bind to `--density-cell-padding-x`) |
| Font-size | `var(--text-xs)` |
| Title weight | `400` |
| Title color | `var(--text-secondary)` |
| Detail font-size | `9px` |
| Detail color | `var(--text-muted)` |
| Detail style | `italic` |
| Border bottom | `1px solid var(--border-subtle)` |
| Last child border | `none` |
| Status dot | `6px`, colored by severity |

---

## STEP 7: Fix EOD Tile (SchedulerJobsTile)

### Run/Cancel buttons: keep them
Operationally necessary. Refine: bind button sizing to density tokens instead of hardcoded `text-[10px] px-1.5 py-px`.

### Duration column: drop it
The "Duration" in v41 was aspirational. If your scheduler API doesn't expose step-level timing, do not synthesize "time since LastRun" — that's wall-clock time since completion, not execution duration, and would be misleading.

### Add a table header row
Your current implementation omits `<thead>` headers. Add them for scanability:

| Column | Render |
|---|---|
| Job | Mono ID + semibold name |
| Last Run | Relative time (`3m ago`) with ISO tooltip |
| Status | Severity pill |
| Action | Run or Cancel button |

### When duration becomes available
If/when the scheduler API adds a `duration` or `elapsedMs` field, add the column back then.

---

## StatusPill — Design Authority Recommendation

Your three-kind system (severity / lifecycle / informational) is architecturally correct and superior to our single badge class. Keep it.

One change: on the **support dashboard**, switch `severity` pills to **subtle** mode (tinted bg + colored text) to match v41's calmer read:

| Tone | Background | Text color |
|---|---|---|
| pass/green | `var(--rag-green-dim)` | `var(--rag-green)` |
| fail/red | `var(--rag-red-dim)` | `var(--rag-red)` |
| warn/amber | `var(--rag-amber-dim)` | `var(--rag-amber)` |
| info/blue | `var(--rag-info-dim)` | `var(--rag-info)` |
| neutral | `var(--surface-elevated)` | `var(--text-tertiary)` |

Keep `lifecycle` pills (settlements, trade workflow) **saturated** — the pill IS the regulatory signal. `informational` pills are already subtle, correct.

---

## Additional Component Specs (reference)

These components are close and need minimal changes. Included for completeness.

### Tile / TileHeader / TileBody / TileFooter
| Property | Value |
|---|---|
| Background | `var(--card-bg)` |
| Border | `1px solid var(--border)` |
| Border radius | 6px (`var(--radius-md)`) |
| Padding | `8px 12px` |
| Header font-size | 13px (`var(--text-sm)`) |
| Header weight | `600` |
| Header color | `var(--text-primary)` |
| Subtitle font-size | `var(--text-xs)` |
| Subtitle color | `var(--text-muted)` |
| Header margin-bottom | 8px |

Your Tile/Surface distinction is more precise than our `.hz-card`. Keep it.

### KvGrid
Minimal changes — set `density="sm"` for dashboard panels. Full spec:
| Property | Value |
|---|---|
| Layout | `grid, grid-cols-[auto_1fr]` |
| Column gap | `8px` |
| Row gap (sm) | `2px` |
| Row gap (md) | `4px` |
| Label font-size | `8px` (service health context) |
| Label weight | `600` |
| Label color | `var(--text-tertiary)` |
| Label transform | `uppercase`, `letter-spacing: 0.05em` |
| Value font-family | `var(--font-mono)` |
| Value font-size | `var(--text-xs)` |
| Value weight | `600` |
| Value alignment | right |

### StatusDot
| Property | Value |
|---|---|
| Size (default) | `8px` |
| Size (compact) | `6px` |
| Pulse | `box-shadow` keyframe, 2s infinite |
| Colors | `var(--rag-green)`, `var(--rag-amber)`, `var(--rag-red)`, `var(--rag-info)` |

### DataTable
| Property | Value |
|---|---|
| Font-family | `var(--font-mono)` |
| Font-size | `var(--text-xs)` |
| Font-variant | `tabular-nums` |
| Header font-family | `var(--font-ui)` (NOT mono) |
| Header font-size | `8px` |
| Header weight | `600` |
| Header color | `var(--text-muted)` |
| Header transform | `uppercase`, `letter-spacing: 0.05em` |
| Header padding | `2px 8px` |
| Header border-bottom | `1px solid var(--border)` |
| Cell padding | `2px 8px` |
| Cell height | `20px` (at compact density) |
| Cell border-bottom | `1px solid var(--border-subtle)` |
| Cell color | `var(--text-secondary)` |
| Row hover | `var(--hover)` |

### ActivityRow / ActivityFeed
| Property | Value |
|---|---|
| Layout | `flex, align-items: center, gap: 8px` |
| Padding | `2px 0` |
| Timestamp font-family | `var(--font-mono)` |
| Timestamp font-size | `7px` |
| Timestamp color | `var(--text-muted)` |
| Timestamp width | `2rem` fixed |
| Body font-size | `var(--text-xs)` |
| Body color | `var(--text-secondary)` |

---

## Cargo Phase Tokens — Ship When Ready

Not blocking. Add to `_semantic.css` `:root` when you port cargo-board/lifecycle pages:

```css
--phase-planning:   #64748b;
--phase-nomination: #3b82f6;
--phase-loading:    #f59e0b;
--phase-transit:    #6366f1;
--phase-discharge:  #10b981;
--phase-settlement: #22c55e;
```

---

## What You Got Right — Acknowledged

Explicitly validated — do not change these:

1. Token architecture (two-tier: semantic shape + theme bindings)
2. Consuming tokens, not markup
3. StatusPill three-kind taxonomy (severity/lifecycle/informational)
4. KpiCell discriminated kind union (proper typing)
5. Tile vs Surface distinction
6. `STUB` severity
7. `--pnl-*` tokens (finance-tuned)
8. `--env-accent` + `[data-env]` (pure-CSS environment tinting)
9. `--density-*` tokens (concept — values updated above)
10. AlertRow link handling (internal vs external routing)
11. Surface ramp, RAG colors, accent values (byte-for-byte correct)

---

## Implementation Priority

| # | Change | Scope | Impact |
|---|---|---|---|
| 1 | Debug light-mode attribute wiring | ThemeContext.tsx | Unblocks light mode entirely |
| 2 | Add density tokens + set `data-density="compact"` on dashboard | _semantic.css + page root | Fixes all row-height gaps at once |
| 3 | Bind primitives to density tokens (replace `py-1.5` etc.) | CheckRow, AlertRow, KpiCell | Density actually takes effect |
| 4 | AlertRow: severity-tone title, border-l-2, /15 opacity, rounded-sm | AlertRow.tsx | Alert urgency matches v41 |
| 5 | KpiCell: value size down to base/md, weight up to 700 | KpiCell.tsx | KPI strip matches v41 |
| 6 | CheckRow: label weight down to 400, tone to secondary | CheckRow.tsx | Check rows read as body, not headers |
| 7 | EOD tile: add table header row | SchedulerJobsTile.tsx | Scanability improvement |

**Do steps 1-3 first, then screenshot.** Density alone may close enough of the visual gap that steps 4-7 feel minor. Send screenshots back for design authority review.

---

## Verification Checklist

After applying, verify:
- [ ] Light theme activates when toggled (check `data-theme` attribute on `<html>`)
- [ ] Density tokens are defined in `_semantic.css`
- [ ] Support dashboard has `data-density="compact"` on page root
- [ ] KpiCell values are bold (700) and 14px, not 20px
- [ ] CheckRow titles are normal weight (400), not semibold
- [ ] AlertRow uses 2px left border (not 4px) with rounded-sm corners
- [ ] AlertRow title text uses severity color (red/amber/blue), not white
- [ ] AlertRow rows separated by margin gap, not hairline border
- [ ] StatusPill on support dashboard uses subtle mode (tinted bg)
- [ ] All severity backgrounds use `--rag-*-dim` tokens (15% opacity tints)
- [ ] EOD tile has table header row

Then screenshot the Support Dashboard (both themes if light mode is fixed) and send back for design authority review.
