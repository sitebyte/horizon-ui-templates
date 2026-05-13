# Evaluation 3 -- Density System & Design Decisions

**Date:** 2026-05-13
**Auditor:** Senior Designer (Design Authority)

---

## 1. DENSITY SYSTEM

### Current approaches

**v41 template:** Global root font-size knob. `setDensity()` changes `document.documentElement.style.fontSize` to compact (0.625rem/10px), default (0.75rem/12px), or relaxed (0.875rem/14px). Because everything is rem-based, the whole UI scales proportionally. Elegant for mockups, destructive for real apps.

**EOS.Horizon:** Three fixed-px tokens in `_semantic.css`:
- `--density-row-comfortable: 36px`
- `--density-row-compact: 28px`
- `--density-row-trader: 20px` (experimental)

KvGrid already emits `data-density` attribute. Components hardcode Tailwind padding utilities.

### Why NOT the root-font-size approach for production

The root-font-size trick breaks in a real React SPA:
- Changes meaning of every rem value globally
- Breaks third-party components (AG Grid, TanStack, datepickers)
- Overrides browser accessibility font-size settings
- Forces audit of every Tailwind utility in every component
- Was always a mockup convenience, not a production pattern

### RECOMMENDATION: Option C -- `data-density` attribute

**Canonical form:** `data-density` attribute on any container (typically `:root`)

Why:
- KvGrid.tsx already emits `data-density` -- partially adopted
- Cascades from container -- set on `<Tile>` or `<html>`, both work
- Targetable in CSS without JS
- Composes with `[data-theme]` and `[data-env]` -- consistent attribute pattern
- Per-panel control possible (e.g., EOD tile compact, narrative section comfortable)

### Token specification

```css
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

**Note:** Their current `--density-row-compact: 28px` is still too tall. v41 integrity-check rows measure ~22px, EOD table rows ~20px. Recommended compact at 24px is closer to what v41 renders.

### Default for dashboard

`data-density="compact"` -- the v41 dashboard IS compact. Comfortable is for narrative pages (audit detail, environment topology).

### AG Grid integration

```css
[data-density="compact"] .ag-theme-quartz {
  --ag-row-height: var(--density-row-height);
  --ag-header-height: calc(var(--density-row-height) + 4px);
  --ag-font-size: var(--density-font-size);
}
```

### Migration for primitives

Components should bind to density tokens instead of hardcoded Tailwind:
- CheckRow `py-1.5` -> `var(--density-cell-padding-y)`
- AlertRow `py-1.5` -> `var(--density-cell-padding-y)`
- KpiCell `px-3 py-1.5` -> `var(--density-cell-padding-x)` / `var(--density-cell-padding-y)`

---

## 2. EOD RUN STATUS

### 2a. Run/Cancel buttons: **YES -- keep them**

The v41 mockup didn't show them because it's static HTML with no backend. The buttons are operationally load-bearing -- operators retry stuck groups and cancel runaway jobs from the dashboard. Their SchedulerJobsTile.tsx implements these with confirmation dialogs and TanStack Query mutations. Well-engineered, necessary.

One refinement: buttons should use density tokens for sizing (currently hardcoded `text-[10px] px-1.5 py-px`).

### 2b. Duration column: **DROP IT**

v41's "Duration" was aspirational. EOS Scheduler API exposes `LastRun` and `NextRun` per group, not per-step run duration.

**Canonical EOD row shape:**

| Column | Source | Render |
|---|---|---|
| ID + Name | row.id, row.name | `#id Name` (mono ID, semibold name) |
| LastRun | row.lastRunUtc | Relative time (3m ago) with ISO tooltip |
| Status | row.status | Severity pill (PASS/WARN/FAIL/RUNNING) |
| Action | n/a | Run or Cancel button |

Their current shape is actually correct. Add a table header row for scanability (v41 has one; their implementation omits it).

If/when the scheduler API adds `duration`/`elapsedMs`, it can be added back. Do not synthesize "time since LastRun" -- it measures wall-clock time since completion, not execution duration, and would be misleading.

---

## 3. ALERT BANDING: **CONFIRMED INTENTIONAL**

The banded background is a deliberate design choice. Alerts need to interrupt the visual scan -- pill-only treatment doesn't create enough urgency for FAIL.

EOS has already adopted this correctly in AlertRow.tsx. Their `bg-rag-red/20 border-l-4` is close to our `background:var(--red-dim) border-left:0.125rem`.

**Token recommendation:** No new `--alert-bg-*` tokens needed. Use existing `--rag-*-dim` tokens directly:
- `--rag-red-dim` = `rgba(239, 68, 68, 0.15)` = alert-bg-fail
- `--rag-amber-dim` = `rgba(245, 158, 11, 0.15)` = alert-bg-warn
- `--rag-info-dim` = `rgba(59, 130, 246, 0.15)` = alert-bg-info

If they want explicit aliases for clarity, fine -- but they're pure aliases, not new values.

---

## 4. PANEL SEMANTICS

### Tile vs Surface -- canonized

**Tile:** Self-contained data widget. Has title, refreshes on cadence, shows status, links to detail view. Used for: EOD Run Status, Integrity Checks, Alerts, Service Health -- all dashboard panels.

**Surface:** Raw layout container with background color. No widget chrome. Used for: page sections, modal bodies, dropdown panels, sidebar regions.

**EOD Run Status = Tile.** Their current `SchedulerJobsTile.tsx` using `<Tile>` + `<TileHeader>` + `<TileBody>` + `<TileFooter>` is correct.

**Observation:** EOS's Tile/Surface distinction is more precise than our generic `.hz-card`. Their naming should be adopted back into template vocabulary.

---

## Decision Summary

| Decision | Recommendation |
|---|---|
| Density mechanism | `data-density` attribute (Option C) |
| Density tokens | 4 tokens x 3 tiers (comfortable/compact/trader) |
| Density values | comfortable: 36/6/12px; compact: 24/2/8px; trader: 20/1/8px |
| Default dashboard density | `data-density="compact"` |
| Run/Cancel buttons | Keep |
| Duration column | Drop (data not available) |
| EOD row shape | ID+Name / LastRun / Status / Action |
| Table header | Add to EOD tile |
| Alert banding | Confirmed intentional; already implemented |
| Alert tokens | Use existing `--rag-*-dim`; no new aliases needed |
| EOD panel type | Tile (not Surface) |
| Tile vs Surface | Canonize EOS's distinction; adopt back upstream |
