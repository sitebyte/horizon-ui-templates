# Horizon v41 — Handover Summary

> **Date:** 2026-05-09
> **Iteration:** v41
> **Live:** https://sitebyte.github.io/horizon-ui-templates/horizon-v41/
> **Previous:** v40 (token split)

## What Changed

Major theme hardening, reactive design, accessibility fixes, workspace tabs, state persistence, and LNG carrier branding.

---

## 1. Critical Accessibility Fix (Light Theme)

`--text-muted` and `--surface-overlay` were both `#94a3b8` in the light theme — text was **invisible** on overlay surfaces (dropdowns, popovers, command palette).

| Token | v40 (light) | v41 (light) | Reason |
|-------|-------------|-------------|--------|
| `--text-muted` | `#94a3b8` | `#78859b` | WCAG contrast fix |
| `--surface-overlay` | `#94a3b8` | `#b4bdca` | Was identical to text-muted |

## 2. New Tokens

| Token | Value | Purpose |
|-------|-------|---------|
| `--text-inverse` | `#ffffff` | White text on coloured backgrounds |
| `--shadow-sm/md/lg/xl` | Theme-aware | Elevation shadows (softer in light theme) |
| `--blur-overlay` | `0.5rem` | Backdrop blur for modals |
| `--phase-planning` | `#64748b` | Cargo phase: planning |
| `--phase-nomination` | `#3b82f6` | Cargo phase: nomination |
| `--phase-loading` | `#f59e0b` | Cargo phase: loading |
| `--phase-transit` | `#6366f1` | Cargo phase: transit |
| `--phase-discharge` | `#10b981` | Cargo phase: discharge |
| `--phase-settlement` | `#22c55e` | Cargo phase: settlement |

**No tokens renamed. No tokens removed.**

## 3. Hardcoded Values Eliminated

- All `color: #fff` / `#ffffff` → `var(--text-inverse)` (8 instances in shell.css)
- All `color: #000` on active pills → `var(--text-inverse)` (5 HTML pages)
- AG Grid light theme: 8 hardcoded hex values → token references
- SVG dropdown arrow: light theme override added
- Menu badge backgrounds: hardcoded RGBA → `-dim` token references
- Cargo board: 18 hardcoded phase colours → `var(--phase-*)` tokens
- Box shadows: 5 hardcoded values → `var(--shadow-*)` tokens
- Backdrop blur: hardcoded → `var(--blur-overlay)`

## 4. Reactive Design (Zero px)

- **AG Grid columns:** All converted from `width: N` (px) to `flex` proportional sizing with `minWidth` constraints and `autoSizeStrategy: { type: 'fitGridWidth' }`
- **64rem breakpoint added:** Dense forms → 2-col, KPI strips wrap, header compresses, ticker caps
- **48rem breakpoint enhanced:** Sidebar backdrop, mobile banner, user menu max-width
- **New utilities:** `.hz-layout-collapse`, `.hz-mobile-banner`, `.hz-sidebar-backdrop`
- **`--active` and `--backdrop` tokens wired** to interactive states

## 5. LNG Carrier Branding

- **Header brand icon:** White Moss-type LNG carrier silhouette (3 domes, aft superstructure, funnel) — replaces lightning bolt
- **Favicon:** Same silhouette on indigo→violet gradient circle
- PNG versions at 16/32/48/192px, SVG sources preserved
- Wired into all 34 HTML pages

## 6. Workspace Tabs

Tab bar below the header showing visited pages — like Bloomberg's workspace panels.

- Persisted to `localStorage` (`hz-workspace-tabs`)
- Active tab highlighted, × close button on hover
- Max 10 tabs, click to navigate
- Hidden on mobile (<48rem), fullscreen, and print

## 7. Page State Persistence

State saved to `localStorage` on page leave, restored on return.

- Scroll position of `.hz-content`
- Active pills/filters (`.hz-pill.active`, etc.)
- Active tab selections
- AG Grid column state, filter model, sort state (via `hzRegisterGrid(api)` hook)
- Keyed by page: `hz-page-state-{pageKey}`

---

## EOS.Horizon Sync Impact

```
VALUE CHANGES (light theme only):
  --text-muted:       #94a3b8 → #78859b
  --surface-overlay:  #94a3b8 → #b4bdca

NEW TOKENS (additive):
  --text-inverse, --shadow-sm/md/lg/xl, --blur-overlay, --phase-* (6)

NO RENAMES. NO REMOVALS.
```

Production team: re-pull `tokens.css` from `horizon-v41/tokens.css` for the updated values and new tokens. All documented in the tokens.css header comment.

---

## Review Documents

Full 4-agent review (token audit, responsiveness, sync, industry research) at `analysis/v40-review/`.

## Pages

38 pages — unchanged count from v40. All now have favicon, workspace tabs, and state persistence.
