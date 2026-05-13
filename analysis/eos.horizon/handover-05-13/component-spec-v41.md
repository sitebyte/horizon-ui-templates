# Component Spec — v41 → EOS.Horizon Primitive Mapping

**Version:** v41
**Date:** 2026-05-13
**Purpose:** Exact measurements from v41 templates, keyed to EOS.Horizon component names. Apply these values directly — no interpretation needed.

This spec is the contract between the design authority and EOS.Horizon. Future template versions will ship an updated spec in this format. Apply the delta, re-screenshot, done.

---

## How to read this spec

Each section maps one EOS.Horizon primitive to its v41 design values. Properties marked `TOKEN` should bind to a CSS variable. Properties marked `FIXED` are hardcoded values. Properties marked `DENSITY` should bind to the density token system.

Token names use EOS.Horizon's `--rag-*` convention (not the template's `--green`/`--red` names).

---

## 1. KpiStrip / KpiCell

**EOS component:** `<KpiStrip>` wrapping `<KpiCell>` children
**v41 pattern:** `.hz-kpi` inside `.kpis` flex container

### KpiStrip (container)
| Property | Value | Binding |
|---|---|---|
| Background | `var(--card-bg)` | TOKEN |
| Border | `1px solid var(--border)` | TOKEN |
| Border radius | `var(--radius-sm)` = 4px | TOKEN |
| Layout | `display: flex` (no grid needed) | FIXED |
| Cell separator | `1px solid var(--border-subtle)` on right edge | TOKEN |
| Gap | 0 (cells are flush, separated by border) | FIXED |

**Note:** Your strip-with-hairlines approach is correct and cleaner than v41's individual cards. Keep it.

### KpiCell
| Property | Value | Binding |
|---|---|---|
| Padding | `8px 12px` (`var(--sp-2) var(--sp-3)`) | TOKEN |
| Label font-size | `8px` (`0.5rem`) | FIXED |
| Label weight | `600` | FIXED |
| Label color | `var(--text-muted)` | TOKEN |
| Label transform | `uppercase`, `letter-spacing: 0.06em` | FIXED |
| Value font-family | `var(--font-mono)` | TOKEN |
| Value font-size | `14px` (`var(--text-base)`) | TOKEN |
| Value weight | `700` | FIXED |
| Value color | primary by default; severity tone when tone is set | TOKEN |
| Value line-height | `1.2` | FIXED |
| Value numeric | `tabular-nums` | FIXED |
| Status dot | `6px` circle (`0.375rem`) | FIXED |
| Delta font-size | `var(--text-xs)` | TOKEN |
| Delta weight | `500` | FIXED |

### Changes needed in KpiCell.tsx
```
size="xl"   →  size="base" (or size="md" if 14px maps to md in your scale)
weight={600} →  weight={700}
```
Label: `tone="muted"` instead of `tone="tertiary"` (muted is darker/quieter in v41).

---

## 2. CheckRow

**EOS component:** `<CheckRow>`
**v41 pattern:** `.check-row` in support-dashboard.html

| Property | Value | Binding |
|---|---|---|
| Padding vertical | `3px` each side (`0.1875rem`) | DENSITY (`--density-cell-padding-y`) |
| Padding horizontal | `8px` (`var(--sp-2)`) | DENSITY (`--density-cell-padding-x`) |
| Font-size | `var(--text-xs)` (11px in v41, 10px in your scale) | TOKEN |
| Title weight | `400` (normal body text — NOT semibold) | FIXED |
| Title color | `var(--text-secondary)` | TOKEN |
| Detail font-size | `9px` (`0.5625rem`) | FIXED |
| Detail color | `var(--text-muted)` | TOKEN |
| Detail style | `italic` | FIXED |
| Border bottom | `1px solid var(--border-subtle)` | TOKEN |
| Last child border | `none` | FIXED |
| Hover background | `var(--hover)` | TOKEN |
| Hover radius | `var(--radius-sm)` | TOKEN |
| Status dot | `6px` (`0.375rem`), colored by severity | FIXED |
| Severity highlight bg | `var(--rag-amber-dim)` / `var(--rag-red-dim)` on row when check fails | TOKEN |
| Severity highlight radius | `var(--radius-sm)` on highlighted rows | TOKEN |

### Changes needed in CheckRow.tsx
```
py-1.5           →  bind to var(--density-cell-padding-y)
px-3             →  bind to var(--density-cell-padding-x)
weight={600}     →  weight={400}
tone="primary"   →  tone="secondary"
```
Add: hover → `rounded-sm` (via Tailwind `hover:rounded-sm`).
Add: when severity is warn/fail, apply `bg-[var(--rag-amber-dim)]` or `bg-[var(--rag-red-dim)]` on the whole row (not just the pill).

---

## 3. AlertRow

**EOS component:** `<AlertRow>`
**v41 pattern:** `.alert-row` in support-dashboard.html

| Property | Value | Binding |
|---|---|---|
| Padding vertical | `4px` (`var(--sp-1)`) | DENSITY (`--density-cell-padding-y`, compact value works) |
| Padding horizontal | `8px` (`var(--sp-2)`) | DENSITY (`--density-cell-padding-x`) |
| Background (fail) | `var(--rag-red-dim)` = `rgba(239, 68, 68, 0.15)` | TOKEN |
| Background (warn) | `var(--rag-amber-dim)` = `rgba(245, 158, 11, 0.15)` | TOKEN |
| Background (info) | `var(--rag-info-dim)` = `rgba(59, 130, 246, 0.15)` | TOKEN |
| Left border width | `2px` (`0.125rem`) | FIXED |
| Left border color (fail) | `var(--rag-red)` | TOKEN |
| Left border color (warn) | `var(--rag-amber)` | TOKEN |
| Left border color (info) | `var(--rag-info)` | TOKEN |
| Border radius | `var(--radius-sm)` = 4px | TOKEN |
| Row separation | `margin-bottom: var(--sp-1)` (4px gap, NOT hairline border) | TOKEN |
| Title weight | `600` | FIXED |
| Title color | **SEVERITY COLOR** — `var(--rag-red)` / `var(--rag-amber)` / `var(--rag-info)` | TOKEN |
| Detail font-size | `8px` (`0.5rem`) | FIXED |
| Detail color | `var(--text-tertiary)` | TOKEN |

### Changes needed in AlertRow.tsx
```
bg-rag-red/20    →  bg-[var(--rag-red-dim)]  (or /15 instead of /20)
border-l-4       →  border-l-2
px-3             →  px-2  (or bind to density token)
py-1.5           →  py-1  (or bind to density token)
border-b ...     →  mb-1  (margin gap, not hairline border)
                 →  add rounded-sm
title tone       →  tone={LABEL_TONE[severity]}  (severity color, not primary)
```

---

## 4. StatusPill

**EOS component:** `<StatusPill>`
**v41 pattern:** `.hz-badge` in shell.css

| Property | Value | Binding |
|---|---|---|
| Padding | `2px 8px` (`0.125rem var(--sp-2)`) | FIXED |
| Border radius | `var(--radius-full)` (pill shape) | TOKEN |
| Font-size | `10px` (`0.625rem`) | FIXED |
| Font-weight | `600` | FIXED |
| Text-transform | `uppercase` | FIXED |
| Letter-spacing | `0.04em` | FIXED |

### Rendering modes

**v41 uses SUBTLE for everything on the support dashboard** (tinted bg + colored text):
| Tone | Background | Text color |
|---|---|---|
| pass/green | `var(--rag-green-dim)` | `var(--rag-green)` |
| fail/red | `var(--rag-red-dim)` | `var(--rag-red)` |
| warn/amber | `var(--rag-amber-dim)` | `var(--rag-amber)` |
| info/blue | `var(--rag-info-dim)` | `var(--rag-info)` |
| neutral | `var(--surface-elevated)` | `var(--text-tertiary)` |

**EOS's three-kind system is architecturally correct.** Keep it. Design authority recommendation:
- `severity` pills on the support dashboard: consider switching to **subtle** mode to match v41's calmer read
- `lifecycle` pills (settlements, trade workflow): keep **saturated** — the pill IS the regulatory signal
- `informational` pills: already subtle, correct

---

## 5. KvGrid

**EOS component:** `<KvGrid>`
**v41 pattern:** service-health and database/throughput inline grids

| Property | Value | Binding |
|---|---|---|
| Layout | `grid, grid-cols-[auto_1fr]` | FIXED |
| Column gap | `8px` (`var(--sp-2)`) | TOKEN |
| Row gap (sm density) | `2px` | DENSITY |
| Row gap (md density) | `4px` | DENSITY |
| Label font-size | `8px` (`0.5rem`) — service health context | FIXED (varies by context) |
| Label weight | `600` | FIXED |
| Label color | `var(--text-tertiary)` | TOKEN |
| Label transform | `uppercase`, `letter-spacing: 0.05em` | FIXED |
| Value font-family | `var(--font-mono)` | TOKEN |
| Value font-size | `var(--text-xs)` | TOKEN |
| Value weight | `600` | FIXED |
| Value alignment | right | FIXED |

### Changes needed
Minimal — KvGrid is close. Set `density="sm"` for dashboard panels.

---

## 6. StatusDot

**EOS component:** `<StatusDot>`
**v41 pattern:** `.hz-dot` in shell.css

| Property | Value | Binding |
|---|---|---|
| Size | `8px` (`0.5rem`) default | FIXED |
| Size (compact context) | `6px` (`0.375rem`) | FIXED |
| Border radius | `50%` | FIXED |
| Pulse animation | `box-shadow` keyframe, 2s infinite | FIXED |
| Colors | `var(--rag-green)`, `var(--rag-amber)`, `var(--rag-red)`, `var(--rag-info)` | TOKEN |

---

## 7. Tile / TileHeader / TileBody / TileFooter

**EOS component:** `<Tile>` compound component
**v41 pattern:** `.hz-card` + `.hz-card-header` + `.hz-card-title`

| Property | Value | Binding |
|---|---|---|
| Background | `var(--card-bg)` | TOKEN |
| Border | `1px solid var(--border)` | TOKEN |
| Border radius | `var(--radius-md)` = 6px | TOKEN |
| Padding | `8px 12px` (`var(--sp-2) var(--sp-3)`) | TOKEN |
| Header font-size | `var(--text-sm)` (13px in v41) | TOKEN |
| Header weight | `600` | FIXED |
| Header color | `var(--text-primary)` | TOKEN |
| Subtitle font-size | `var(--text-xs)` | TOKEN |
| Subtitle color | `var(--text-muted)` | TOKEN |
| Header margin-bottom | `var(--sp-2)` | TOKEN |

**Your Tile/Surface distinction is correct and more precise than our `.hz-card`. Keep it.**

---

## 8. DataTable (.tbl)

**EOS component:** `<DataTable>`
**v41 pattern:** `.tbl` in support-dashboard.html and shell.css

| Property | Value | Binding |
|---|---|---|
| Font-family | `var(--font-mono)` | TOKEN |
| Font-size | `var(--text-xs)` | TOKEN |
| Font-variant | `tabular-nums` | FIXED |
| Header font-family | `var(--font-ui)` (NOT mono) | TOKEN |
| Header font-size | `8px` (`0.5rem`) | FIXED |
| Header weight | `600` | FIXED |
| Header color | `var(--text-muted)` | TOKEN |
| Header transform | `uppercase`, `letter-spacing: 0.05em` | FIXED |
| Header padding | `2px 8px` (`0.125rem var(--sp-2)`) | DENSITY |
| Header border-bottom | `1px solid var(--border)` | TOKEN |
| Cell padding | `2px 8px` (`0.125rem var(--sp-2)`) | DENSITY |
| Cell height | `20px` (`1.25rem`) | DENSITY (`--density-row-height` at compact) |
| Cell border-bottom | `1px solid var(--border-subtle)` | TOKEN |
| Cell color | `var(--text-secondary)` | TOKEN |
| Row hover | `var(--hover)` on all cells | TOKEN |

---

## 9. ActivityRow / ActivityFeed

**EOS component:** `<ActivityRow>` / `<ActivityFeed>`
**v41 pattern:** `.feed-row` in support-dashboard.html

| Property | Value | Binding |
|---|---|---|
| Layout | `display: flex; align-items: center; gap: var(--sp-2)` | FIXED |
| Padding | `2px 0` | DENSITY |
| Timestamp font-family | `var(--font-mono)` | TOKEN |
| Timestamp font-size | `7px` (`0.4375rem`) | FIXED |
| Timestamp color | `var(--text-muted)` | TOKEN |
| Timestamp width | `2rem` fixed | FIXED |
| Body font-size | `var(--text-xs)` | TOKEN |
| Body color | `var(--text-secondary)` | TOKEN |

---

## 10. Density Token Spec (canonical)

Add to `_semantic.css`. This is the density contract — all components bind to these.

```css
:root {
  --density-row-height:     36px;
  --density-cell-padding-y: 0.375rem;
  --density-cell-padding-x: 0.75rem;
  --density-font-size:      var(--text-xs);
}

:root[data-density="compact"],
[data-density="compact"] {
  --density-row-height:     24px;
  --density-cell-padding-y: 0.125rem;
  --density-cell-padding-x: 0.5rem;
  --density-font-size:      var(--text-xs);
}

:root[data-density="trader"],
[data-density="trader"] {
  --density-row-height:     20px;
  --density-cell-padding-y: 0.0625rem;
  --density-cell-padding-x: 0.5rem;
  --density-font-size:      0.5625rem;
}
```

**Support dashboard default:** `<div data-density="compact">` on the page root.

---

## Future versions

When v42 ships, this spec will be updated with a **delta section** listing only what changed:

```
## v42 delta (example format)
- KpiCell value weight: 700 → 600
- AlertRow left border: 2px → 3px
- NEW TOKEN: --phase-discharge-dim: rgba(16, 185, 129, 0.15)
- NEW COMPONENT: ScheduleRow (see section 11)
```

Apply the delta to your primitives. Re-screenshot. Done.
