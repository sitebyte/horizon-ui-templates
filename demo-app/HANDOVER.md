# EOS.Horizon Integration Handover

**From:** Design Authority (horizon-ui-templates)
**To:** EOS.Horizon production session
**Date:** 2026-05-18
**Repo:** https://github.com/sitebyte/horizon-ui-templates
**Demo app:** `demo-app/` directory

---

## What this is

A complete, working React 19 + Vite app that renders the 5 Support area pages pixel-identical to the v43 static prototype. Every page uses the prototype's own CSS directly — no abstraction layers, no renamed tokens, no custom React primitive components.

Your job: drop these files into EOS.Horizon, keep your existing pages and backend wiring, and migrate the visual layer to match.

---

## The root cause of prior integration failures

Playwright measurements confirmed these specific mismatches between the prototype and EOS.Horizon:

| Token | Prototype (correct) | EOS.Horizon _semantic.css (wrong) |
|---|---|---|
| `--text-xs` | 0.6875rem (11px) | 0.625rem (10px) |
| `--text-sm` | 0.8125rem (13px) | 0.75rem (12px) |
| `--text-base` | 0.875rem (14px) | 0.8125rem (13px) |
| `--text-lg` | 1.125rem (18px) | 1rem (16px) |
| `--text-xl` | 1.5rem (24px) | 1.25rem (20px) |
| `--font-ui` | Inter | DM Sans |
| `--font-mono` | JetBrains Mono | ui-monospace system stack |
| `--green/--red/--amber/--blue` | Defined | Renamed to `--rag-*` (left empty) |
| `data-theme` | `"dark"` / `"light"` | `"horizon-ui"` / `"horizon-ui-light"` |
| Tailwind | v3 CDN | v4 npm (breaks shell.css specificity) |

Every font size was 1px smaller. Every status colour was empty. Every component rendered slightly wrong. It compounded into a completely different-looking app.

---

## Integration approach: two phases

### Phase 1 — New Support pages (replace)

The 5 support pages in the demo app replace your existing support page components entirely. They use the prototype's CSS class names and don't depend on your primitive library.

### Phase 2 — Existing pages (migrate the design)

Your older pages (Trading, Settlements, Static Data, Profile, etc.) use the current primitive library (`Text`, `Mono`, `Stack`, `Tile`, `KpiCell`, `StatusPill`, etc.). These pages work — their mechanics are correct. Only the visual layer needs migrating.

The migration path: keep the primitive components but change what CSS they consume.

---

## Phase 1: Drop in the Support pages

### Files to copy

From `demo-app/src/` into your project:

```
tokens/tokens-v43.css        → client/src/horizon/tokens/tokens-v43.css
tokens/shell.css              → client/src/horizon/tokens/shell.css
tokens/dashboard.css          → client/src/horizon/tokens/dashboard.css
tokens/audit.css              → client/src/horizon/tokens/audit.css
tokens/data-quality.css       → client/src/horizon/tokens/data-quality.css
tokens/sql-checks.css         → client/src/horizon/tokens/sql-checks.css
tokens/environment.css        → client/src/horizon/tokens/environment.css

pages/DemoSupportDashboard.tsx → your support dashboard page
pages/AuditSearchPage.tsx      → your audit search page
pages/DataQualityPage.tsx      → your data quality page
pages/SqlChecksPage.tsx        → your SQL checks page
pages/EnvironmentPage.tsx      → your environment page

components/CommandPalette.tsx  → client/src/components/CommandPalette.tsx
hooks/useLocalStorage.ts       → client/src/hooks/useLocalStorage.ts
```

### CSS import setup

Replace your current token barrel (`client/src/horizon/tokens/index.css`) with:

```css
@import "./tokens-v43.css";
@import "./shell.css";
@import "./dashboard.css";
@import "./audit.css";
@import "./data-quality.css";
@import "./sql-checks.css";
@import "./environment.css";
```

Delete: `_semantic.css`, `_palette.css`, `theme-horizon-ui.css`

### index.html changes

Add to `<head>`:
```html
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:["selector","[data-theme=\"dark\"]"],theme:{extend:{fontFamily:{sans:["Inter","sans-serif"],mono:["JetBrains Mono","monospace"]}}}}</script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
```

Remove: `@tailwindcss/vite` or any Tailwind v4 npm package from your build.

### Theme attribute

In your `ThemeContext.tsx`, change the attribute values:
```
"horizon-ui"       →  "dark"
"horizon-ui-light"  →  "light"
```

Or simpler: in `_semantic.css` (before you delete it), the `[data-theme="horizon-ui"]` selector was doing the binding. Now `tokens-v43.css` uses `[data-theme="dark"]` and `[data-theme="light"]` directly. So just update `ThemeContext` to write `"dark"` / `"light"`.

### Wire up API data

Each page component has `{/* TODO: API */}` comments marking every static value. Replace with your existing hooks:

```tsx
// Before (static)
<span className="hz-kpi-value font-mono" style={{fontSize:'var(--text-base)'}}>1,247</span>

// After (live)
<span className="hz-kpi-value font-mono" style={{fontSize:'var(--text-base)'}}>{tradeCount.data?.total ?? '—'}</span>
```

Your `useQuery` hooks, `useAuth`, `useDashboardAlerts`, `tilesApi`, `systemStatusApi` etc. all stay unchanged. You're only changing what the JSX renders, not how data is fetched.

---

## Phase 2: Migrate existing pages to the new design

Your older pages (Blotter, Statements, Products, Profile, etc.) use primitives like `<Text>`, `<Mono>`, `<Tile>`, `<StatusPill>`, `<KpiCell>`, `<DataTable>`, etc. These components consume CSS variables via inline styles.

**Don't rewrite these pages.** Migrate the primitive components to read from the new token file instead of the old one.

### What to change in each primitive

The primitives read tokens via `var(--*)`. The token NAMES are mostly the same between your old `_semantic.css` and the new `tokens-v43.css`. What changed are the VALUES. By swapping the CSS file (Phase 1), most primitives will automatically pick up the correct values.

### Token name mismatches to fix

These names differ and need updating in your primitive source code:

| Your primitives reference | Prototype uses | Action |
|---|---|---|
| `var(--rag-green)` | `var(--green)` | Find-replace in primitive .tsx files |
| `var(--rag-red)` | `var(--red)` | Find-replace |
| `var(--rag-amber)` | `var(--amber)` | Find-replace |
| `var(--rag-info)` | `var(--blue)` | Find-replace |
| `var(--rag-green-dim)` | `var(--green-dim)` | Find-replace |
| `var(--rag-red-dim)` | `var(--red-dim)` | Find-replace |
| `var(--rag-amber-dim)` | `var(--amber-dim)` | Find-replace |
| `var(--rag-info-dim)` | `var(--blue-dim)` | Find-replace |

That's a mechanical find-replace across your primitives directory. After that, your existing pages will render with the correct colours.

### Alternatively: add a bridge

If find-replace across all primitives is risky, add this bridge CSS after `tokens-v43.css`:

```css
:root, [data-theme="dark"], [data-theme="light"] {
  --rag-green:      var(--green);
  --rag-green-dim:  var(--green-dim);
  --rag-green-text: var(--green-text);
  --rag-red:        var(--red);
  --rag-red-dim:    var(--red-dim);
  --rag-red-text:   var(--red-text);
  --rag-amber:      var(--amber);
  --rag-amber-dim:  var(--amber-dim);
  --rag-amber-text: var(--amber-text);
  --rag-info:       var(--blue);
  --rag-info-dim:   var(--blue-dim);
  --rag-info-text:  var(--blue-text);
}
```

This maps your old names to the prototype's names so existing primitives work without code changes. Remove the bridge later when you've completed the find-replace.

### Font handling

The prototype uses Inter + JetBrains Mono loaded via Google Fonts. If you want to keep your system font stack (DM Sans + ui-monospace) for production, that's fine — but the token VALUES in `tokens-v43.css` are tuned for Inter's metrics. Font sizes may look slightly different with DM Sans.

Options:
- **Use Inter** (recommended) — add the Google Fonts link, pixel-identical to prototype
- **Keep DM Sans** — accept minor sizing differences, override `--font-ui` and `--font-mono` in a bridge CSS block

### Tailwind class usage in existing pages

Your existing pages may use Tailwind v4 utility classes. With v3 CDN, most classes are the same. The main differences:
- v4's `@layer` system is gone — class specificity is simpler in v3
- v4's `@theme` directive doesn't exist in v3 — use `tailwind.config` in the CDN script tag
- Arbitrary value classes like `bg-[var(--rag-red-dim)]` work in both v3 and v4

If any v4-specific class syntax breaks, replace with the equivalent inline style.

---

## Shell integration

The demo app's `App.tsx` contains the full shell (header, sidebar, workspace tabs, command palette, status bar). You have two options:

### Option A: Replace your shell entirely
Copy `App.tsx` and adapt it to your routing setup. This gives you the exact prototype shell.

### Option B: Keep your shell, adopt the CSS
Your `AppShell.tsx`, `Header.tsx`, `Sidebar.tsx`, `StatusBar.tsx` already work. Just ensure they use `shell.css` class names (`hz-header`, `hz-sidebar`, `hz-status-bar`, etc.) instead of custom Tailwind classes. The CSS does the heavy lifting.

Option B is lower risk if your shell has auth, feature flags, and other logic baked in.

---

## What NOT to do

1. **Don't rename tokens.** `--green` stays `--green`. Don't create `--rag-green` aliases.
2. **Don't create React wrappers around CSS classes.** `<div className="hz-kpi">` is the component. Not `<KpiCell kind="status">`.
3. **Don't use Tailwind v4 npm.** Its layer system breaks shell.css specificity.
4. **Don't create component specs.** The CSS IS the spec. If it looks wrong, the CSS is wrong.
5. **Don't create a density token system.** The prototype's sizing is already dense. It's baked into the class values.

---

## File inventory

### New files (from demo-app/src/)
| File | Lines | Purpose |
|---|---|---|
| `tokens/tokens-v43.css` | 222 | Design tokens + theme bindings |
| `tokens/shell.css` | 1949 | Component CSS (hz-* classes) |
| `tokens/dashboard.css` | 23 | Dashboard page layout |
| `tokens/audit.css` | ~80 | Audit page layout |
| `tokens/data-quality.css` | ~100 | Data quality page layout |
| `tokens/sql-checks.css` | ~380 | SQL checks page layout |
| `tokens/environment.css` | ~1017 | Environment/topology page layout |
| `pages/DemoSupportDashboard.tsx` | ~300 | Support dashboard |
| `pages/AuditSearchPage.tsx` | ~250 | Audit search |
| `pages/DataQualityPage.tsx` | ~200 | Data quality |
| `pages/SqlChecksPage.tsx` | ~1350 | SQL checks |
| `pages/EnvironmentPage.tsx` | ~1144 | Environment topology |
| `components/CommandPalette.tsx` | ~150 | Cmd+K palette |
| `hooks/useLocalStorage.ts` | ~20 | localStorage hook |

### Files to delete
| File | Why |
|---|---|
| `tokens/_palette.css` | Replaced by tokens-v43.css |
| `tokens/_semantic.css` | Replaced by tokens-v43.css |
| `tokens/theme-horizon-ui.css` | Replaced by tokens-v43.css |
| `@tailwindcss/vite` (package) | Replaced by Tailwind v3 CDN |

### Files to keep (modify token references only)
| File | Change |
|---|---|
| `primitives/data/*.tsx` | Replace `--rag-*` with `--green/--red/--amber/--blue` (or use bridge CSS) |
| `primitives/primitives/*.tsx` | Same token reference updates |
| `layout/ThemeContext.tsx` | Change `"horizon-ui"` → `"dark"`, `"horizon-ui-light"` → `"light"` |
| All existing page components | No changes needed — primitives handle the token mapping |

---

## Verification

After integration:

1. Open each support page — should match the prototype at https://sitebyte.github.io/horizon-ui-templates/horizon-v43/
2. Toggle dark/light theme — both should work
3. Open an existing page (Blotter, Statements, etc.) — should render with updated colours/sizes via the new tokens
4. Check the browser console — no CSS variable resolution errors (undefined variables show as empty)

If a page looks wrong, check:
- Are the CSS files loading? (DevTools → Sources → check tokens-v43.css is present)
- Is `data-theme="dark"` set on `<html>`? (Not `"horizon-ui"`)
- Is Tailwind v3 CDN loading? (Check for the `<script>` tag, not npm)
- Are any `--rag-*` references returning empty? (Use bridge CSS or find-replace)

---

## Spacing matters — this is not cosmetic

The previous integration failed because of spacing differences that seemed minor in isolation. Playwright measurements proved they were the root cause:

| Token | Prototype (correct) | EOS.Horizon (wrong) | Difference |
|---|---|---|---|
| `--text-xs` | 0.6875rem (11px) | 0.625rem (10px) | 1px per label |
| `--text-sm` | 0.8125rem (13px) | 0.75rem (12px) | 1px per cell |
| `--text-base` | 0.875rem (14px) | 0.8125rem (13px) | 1px per value |
| `--text-lg` | 1.125rem (18px) | 1rem (16px) | 2px per title |
| `--text-xl` | 1.5rem (24px) | 1.25rem (20px) | 4px per heading |

Each difference is "only 1px." But a single page has ~200 text elements. 200 elements x 1px = the entire page reads differently. Labels are tighter, values are smaller, rows are shorter, cards are more compact. The cumulative effect is a completely different density — which is the entire design.

### The rule

When `tokens-v43.css` says `--text-xs: 0.6875rem`, use `0.6875rem`. Not `0.625rem`. Not "close enough." Not a rounded value. The exact value.

### How to verify

Run this Playwright script against your production app to compare computed styles with the prototype:

```javascript
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Measure your production app
  await page.goto('http://your-app-url/support/dashboard');
  await page.waitForTimeout(2000);
  const yours = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      textXs:   cs.getPropertyValue('--text-xs').trim(),
      textSm:   cs.getPropertyValue('--text-sm').trim(),
      textBase: cs.getPropertyValue('--text-base').trim(),
      textLg:   cs.getPropertyValue('--text-lg').trim(),
      green:    cs.getPropertyValue('--green').trim(),
      red:      cs.getPropertyValue('--red').trim(),
      fontUi:   cs.fontFamily.substring(0, 30),
      theme:    document.documentElement.getAttribute('data-theme'),
    };
  });

  // Expected values (from tokens-v43.css)
  const expected = {
    textXs:   '0.6875rem',
    textSm:   '0.8125rem',
    textBase: '0.875rem',
    textLg:   '1.125rem',
    green:    '#22c55e',
    red:      '#ef4444',
    fontUi:   "'Inter', system-ui",
    theme:    'dark',
  };

  // Compare
  for (const [key, exp] of Object.entries(expected)) {
    const got = yours[key];
    const match = got.includes(exp) || exp.includes(got);
    console.log(`${match ? '✓' : '✗'} ${key}: expected "${exp}", got "${got}"`);
  }

  await browser.close();
})();
```

Run this after every integration. If any value doesn't match, the CSS files didn't load correctly or something is overriding them.

### The density cascade

One wrong spacing token doesn't just affect one element — it affects every component that reads it:

- `--text-xs` is used by: labels, badges, table headers, check rows, feed rows, KPI labels, tooltips
- `--text-sm` is used by: table cells, body text, sidebar items, status bar
- `--sp-2` is used by: card padding, row gaps, section spacing, input padding

Change one value by 1px and dozens of components shift. This is why consuming the CSS file directly (instead of re-typing the values) is critical.

---

## Ongoing process

When the prototype updates (v44, v45...):
1. Design authority publishes new `tokens.css` + `shell.css`
2. EOS.Horizon drops them in as replacements
3. If page HTML structure changed, update the affected page JSX
4. Screenshot comparison to verify

No more component specs. No more token audits. CSS files in, CSS files out.
