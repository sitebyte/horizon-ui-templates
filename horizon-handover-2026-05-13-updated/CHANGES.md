# Changes Applied — Design Authority v41 Spec

**Source:** `horizon-handover-2026-05-13/` (original EOS.Horizon handover bundle)
**Output:** `horizon-handover-2026-05-13-updated/` (this directory)
**Date:** 2026-05-18
**Spec:** `analysis/eos.horizon/handover-05-13/component-spec-v41.md`

All changes are UI-only. No API, data, or state management changes.

---

## 1. _semantic.css — Root defaults aligned to horizon-ui dark

**What changed:** `:root` fallback values updated from warm-stone (old pre-horizon theme) to match `theme-horizon-ui.css` dark variant values.

**Why:** The `:root` block in `_semantic.css` is the fallback when no `[data-theme]` attribute is set (e.g. during hydration, or if the attribute hasn't been applied yet). With warm-stone defaults (#1c1917 surfaces, #f59e0b amber accent), any component that renders before `data-theme` is set shows the wrong theme. Aligning `:root` to horizon-ui dark (#09090b surfaces, #4f46e5 indigo accent) makes the fallback correct.

**Specific values changed:**
- Surface ramp: warm-stone → zinc (e.g. `#1c1917` → `#0f0f12`)
- Text ramp: stone → zinc greys
- Borders: stone → zinc
- Accent: amber (#f59e0b) → indigo (#4f46e5)
- RAG info: #60a5fa → #3b82f6 (matches theme file)
- Skeleton: stone → zinc

---

## 2. _semantic.css — Density token system

**What changed:** Replaced `--density-row-comfortable: 36px / --density-row-compact: 28px / --density-row-trader: 20px` with a four-token-per-tier system driven by `[data-density]` attribute.

**Why:** The old tokens only controlled row height. The v41 density system controls four properties per tier (row height, vertical padding, horizontal padding, font size) so all components tighten uniformly. The old `--density-row-compact: 28px` was too tall — v41 integrity-check rows measure ~22px. The new compact tier uses 24px.

**New tokens:**
```
--density-row-height     (36 → 24 → 20 px)
--density-cell-padding-y (6 → 2 → 1 px)
--density-cell-padding-x (12 → 8 → 8 px)
--density-font-size      (var(--text-xs) across tiers, 9px at trader)
```

**AG Grid integration added:** `[data-density] .ag-theme-quartz` selectors bind `--ag-row-height`, `--ag-header-height`, and `--ag-font-size` to the density tokens so AG Grid rows shrink with the same axis.

---

## 3. SupportDashboardPage.tsx — `data-density="compact"`

**What changed:** Added `data-density="compact"` to the page root div.

**Why:** The v41 support dashboard IS compact — that's its baseline density, not a special mode. This single attribute activates the compact tier for all child components that bind to density tokens. Without it, the density tokens defined in step 2 have no effect on this page.

---

## 4. KpiCell.tsx — Value size, weight, label tone

**What changed:**
- Value `size="xl"` (20px) → `size="md"` (14px)
- Value `weight={600}` → `weight={700}`
- Label `tone="tertiary"` → `tone="muted"`
- Label font-size → 8px with 0.06em letter-spacing
- Value line-height → 1.2
- Delta weight → 500
- Padding → fixed 8px 12px

**Why:** The template's KPI values are compact and informational (14px bold mono), not hero-sized (20px semibold). At xl, the KPI strip dominates the page. At md, it reads as a status summary row. The label tone change from tertiary to muted makes labels quieter — muted is darker/less saturated than tertiary, pushing the label further into the background so the value pops.

---

## 5. CheckRow.tsx — Weight, tone, density binding, severity highlight

**What changed:**
- Title `weight={600}` → `weight={400}` (normal body text)
- Title `tone="primary"` → `tone="secondary"`
- Detail font-size → 9px, italic, tone → muted
- Padding → bound to `var(--density-cell-padding-y/x)` tokens
- Added hover `rounded-sm`
- Added severity background highlight: warn/fail rows get `--rag-amber-dim` / `--rag-red-dim` background
- Added `subtlePills` prop to use subtle StatusPill rendering
- Hover state → `var(--hover)` with rounded-sm

**Why:** The template's check rows are body text, not bold headers. Semibold titles across 20+ check rows created a wall of bold text where nothing stood out. Normal weight lets the severity pills carry the visual signal. The severity background highlight (faint amber/red wash on failing rows) lets the eye find problems without reading every label — colour-as-information at the row level. Detail text is italic at 9px to create clear hierarchy separation.

---

## 6. AlertRow.tsx — 6 micro-tweaks

**What changed:**
- Background opacity: `/20` (20%) → `var(--rag-*-dim)` (15%)
- Left border: `border-l-4` → `border-l-2`
- Padding: `px-3 py-1.5` → density-token-bound
- Added `rounded-sm` border radius
- Row separation: `border-b border-border-subtle` → `mb-1` (margin gap)
- Title text tone: `tone="primary"` (white) → `tone={LABEL_TONE[severity]}` (severity colour)
- Detail font-size → 8px

**Why:** The title tone change is the most impactful. The template makes alert title text red/amber/blue — the row screams its severity. The old primary (white) tone was neutral against the tinted background. The border-l-4 → border-l-2 change reduces the visual weight of the left accent stripe. The 20% → 15% opacity change calms the background tint. Margin gap instead of hairline border makes alert blocks visually discrete — they're separate events, not table rows.

---

## 7. StatusPill.tsx — Subtle mode for severity, pill shape update

**What changed:**
- Added `subtle?: boolean` prop to severity kind
- Pill padding → 2px 8px (exact)
- Font size → 10px
- Letter-spacing → 0.04em
- Border radius → `rounded-full` (pill shape, not rounded-sm rectangle)

**Why:** The design authority recommends subtle mode for severity pills on the support dashboard (calmer read for monitoring) while keeping saturated mode for lifecycle pills (trade workflow where the pill IS the regulatory signal). The `subtle` prop lets consumers opt in per-context. Pill sizing matches v41 exactly — smaller and tighter than the previous rounded-sm rectangle.

---

## 8. IntegrityChecksPanel.tsx — Subtle pills

**What changed:** Added `subtlePills` prop to each `<CheckRow>` in the dashboard panel.

**Why:** Integrity check pills on the support dashboard should use subtle mode (tinted background + coloured text) per the design authority recommendation. This matches v41's calmer monitoring aesthetic. The same CheckRow used on the dedicated integrity page can keep saturated pills by omitting the prop.

---

## 9. SchedulerJobsTile.tsx — Table header row, density binding

**What changed:**
- Added `<thead>` with header row (Job | Last Run | Status | action column)
- Row padding → bound to density tokens
- ActionButton sizing → bound to density tokens (`--density-font-size`, `--density-cell-padding-y/x`)

**Why:** The v41 template has visible table headers for scanability. The original implementation omitted `<thead>`, making it harder to parse which column is which at a glance. Button sizing was hardcoded at `text-[10px] px-1.5 py-px` — binding to density tokens means buttons scale with the page's density setting.

---

## 10. KvGrid.tsx — Label sizing, gap

**What changed:**
- Column gap → 8px (exact)
- Label font-size → 8px with 0.05em letter-spacing

**Why:** Matches the v41 service-health KvGrid spec exactly. The previous gap-x-3 (12px) was slightly loose for the compact dashboard context. Label sizing at 8px with tracking creates the micro-label look that separates labels from values visually.

---

## 11. ActivityRow.tsx — Timestamp sizing, padding

**What changed:**
- Timestamp font-size → 7px (from var(--text-xs) = 10px)
- Timestamp width → 2rem (from 5rem)
- Timestamp tone → muted (from tertiary)
- What text tone → secondary (from tertiary)
- Row padding → 2px 0

**Why:** The v41 activity feed has very compact timestamps — they're reference marks, not primary content. 7px at 2rem width is just enough for HH:MM format. The "what" text moved from tertiary to secondary for better readability alongside the primary "who" text.

---

## 12. DataTable.tsx — Header and cell sizing

**What changed:**
- Header font-size → 8px (from 10px), letter-spacing → 0.05em
- Header padding → 2px 8px
- Header font-family → var(--font-ui) (explicit)
- Header color → var(--text-muted)
- Header border → border-border (from border-border-subtle)
- Cell padding → 2px 8px
- Cell font-family → var(--font-mono)
- Cell font-variant → tabular-nums
- Cell color → var(--text-secondary)
- Cell height → var(--density-row-height)
- Row hover → var(--hover) token

**Why:** The table headers in v41 are micro-labels (8px uppercase) that stay out of the way — the data IS the interface. Cell sizing binds to density tokens so tables respond to the page's density axis. Font-mono + tabular-nums ensures number columns align vertically. Row hover uses the semantic `--hover` token for consistency across the app.

---

## Files not changed

- **ThemeContext.tsx** — Already correct. Writes `data-theme="horizon-ui"` / `data-theme="horizon-ui-light"` on `<html>`, matching the CSS selectors in `theme-horizon-ui.css`. If light mode isn't working, check CSS load order (theme file must load last) or `:root` specificity.
- **theme-horizon-ui.css** — Already correct. All token values match v41 for both dark and light variants.
- **StatusDot.tsx** — Already close. Sizes (xs=4px, sm=6px, md=8px) match v41 spec. No changes needed.
- **ActivityFeed.tsx** — Container component, no measurement changes needed.
- **tokens/index.css** — Import order already correct (palette → semantic → theme).
- **All page components** (AlertsPanel, ServiceHealthSection, etc.) — No changes needed beyond what flows through the updated primitives.
