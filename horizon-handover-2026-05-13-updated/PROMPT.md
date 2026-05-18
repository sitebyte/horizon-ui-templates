# EOS.Horizon — Apply Design Authority v41 Changes

Paste this prompt into a Claude Code session running in the EOS.Horizon repo.

---

## What this is

The design authority has taken your 05-13 handover bundle (React components, tokens, screenshots), applied all v41 design changes directly to your source files, and shipped them back. This directory contains your code with the changes pre-applied.

You do NOT need to interpret a spec or eyeball screenshots. The changes are done. Your job is to merge them into your repo.

## How to apply

The changed files are in `horizon-handover-2026-05-13-updated/markup/`. Compare them against your current source using diff, then copy the updated files into your repo.

### Files to replace (11 changed files)

**Tokens:**
1. `tokens/_semantic.css` — Root defaults aligned to horizon-ui dark + density token system added

**Primitives:**
2. `primitives/data/KpiCell.tsx` — Value 14px/700, label muted, 8px label font
3. `primitives/data/CheckRow.tsx` — Weight 400, secondary tone, density padding, severity row bg, subtlePills prop
4. `primitives/data/AlertRow.tsx` — 2px border, rounded-sm, severity-tone title, margin gap, 15% opacity
5. `primitives/data/StatusPill.tsx` — `subtle` prop on severity kind, pill shape rounded-full, exact sizing
6. `primitives/data/DataTable.tsx` — 8px headers, mono+tabular cells, density row height
7. `primitives/data/ActivityRow.tsx` — 7px timestamps, 2rem width, compact padding
8. `primitives/data/KvGrid.tsx` — 8px labels, 8px column gap

**Pages:**
9. `pages/dashboard/SupportDashboardPage.tsx` — `data-density="compact"` on root
10. `pages/dashboard/tiles/SchedulerJobsTile.tsx` — 4-column table with thead, density-bound cells/buttons
11. `pages/dashboard/integrity/IntegrityChecksPanel.tsx` — `subtlePills` prop on CheckRow

### Files NOT changed (verify these still work)
- `layout/ThemeContext.tsx` — Already correct
- `tokens/theme-horizon-ui.css` — Already correct
- `tokens/index.css` — Already correct
- `primitives/data/StatusDot.tsx` — Already correct
- `primitives/data/ActivityFeed.tsx` — No changes needed

## After copying the files

### 1. Build check
```bash
npm run build
```
Fix any TypeScript errors. The most likely issue: the `subtle` prop on StatusPill's SeverityProps type. If your barrel export or consuming components reference the old type shape, update them.

### 2. Check Tailwind JIT arbitrary values
Several components now use `bg-[var(--rag-red-dim)]` syntax (Tailwind arbitrary values). If your Tailwind config doesn't support JIT arbitrary values, replace these with inline styles:
```tsx
// Instead of: className="bg-[var(--rag-red-dim)]"
// Use: style={{ backgroundColor: 'var(--rag-red-dim)' }}
```

### 3. Light theme check
If light mode still doesn't activate after these changes, the issue is one of:
- `ThemeContext.tsx` writes `data-theme="horizon-ui-light"` but CSS expects a different selector
- `_semantic.css` `:root` specificity beats `[data-theme]` — the root defaults are now aligned to horizon-ui dark, which should help
- Vite is reordering CSS imports — theme file must load last

### 4. Visual check — Support Dashboard
Open the Support Dashboard and verify:
- [ ] KPI values are compact (14px bold), not hero-sized (20px)
- [ ] Check rows have normal-weight (400) titles, not semibold
- [ ] Alert rows have severity-coloured title text (red/amber/blue), 2px left border, rounded corners
- [ ] Alert rows are separated by margin gaps, not hairline borders
- [ ] Severity pills on checks use subtle mode (tinted bg, coloured text)
- [ ] EOD tile has a visible table header row (Job | Last Run | Status | action)
- [ ] Overall density feels tighter — rows should be ~24px tall, not ~28-36px

### 5. Visual check — Light theme (if working)
Toggle to light mode and verify the same components render correctly with light token values.

### 6. Screenshot and send back
Take screenshots of the Support Dashboard in dark mode (and light if working). Send back to the design authority for review. We'll either approve or ship a small delta.

## Full changelog
See `CHANGES.md` in this directory for detailed rationale on every change.
