# Migrating to EOS.Horizon

This demo app proves the approach: same CSS, same class names, React just renders the HTML. Replace static strings with your API data.

## Architecture

```
index.html          ← Tailwind v3 CDN + Google Fonts
src/tokens/
  tokens-v43.css    ← Design tokens (from horizon-v43/tokens.css)
  shell.css         ← Component CSS (from horizon-v43/shell.css, @imports stripped)
  dashboard.css     ← Page-level layout classes (.kpis, .dash, .check-row, etc.)
  index.css         ← Barrel: imports tokens → shell → dashboard
src/App.tsx         ← Shell (header, sidebar, status bar, routing)
src/pages/
  DemoSupportDashboard.tsx  ← Dashboard using shell.css class names directly
```

## What EOS.Horizon needs to do

### 1. Replace your token system
Delete `_semantic.css`, `theme-horizon-ui.css`, and any bridge/mapping files. Replace with:
- `tokens-v43.css` (this file, as-is)
- `shell.css` (this file, with the two `@import` lines commented out)

These are the source of truth. Do not rename tokens. Do not create aliases.

### 2. Add Tailwind v3 CDN to your index.html
```html
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:["selector","[data-theme=\"dark\"]"],theme:{extend:{fontFamily:{sans:["Inter","sans-serif"],mono:["JetBrains Mono","monospace"]}}}}</script>
```
Remove `@tailwindcss/vite` or any Tailwind v4 npm packages.

### 3. Add page-level CSS per page
Each prototype page has a `<style>` block with layout classes. Extract these into `.css` files alongside your page components. The dashboard's classes are in `dashboard.css`.

### 4. Use the prototype's class names in JSX
```tsx
// YES — use the class names directly
<div className="hz-kpi">
  <span className="hz-kpi-label">System Health</span>
  <span className="hz-kpi-value" style={{color:'var(--green)'}}>HEALTHY</span>
</div>

// NO — don't wrap in React primitives
<KpiCell kind="status" title="System Health" value="HEALTHY" tone="pass" />
```

The prototype's class names ARE the component API. `hz-kpi`, `hz-badge`, `hz-dot`, `check-row`, `alert-row`, `feed-row`, `tbl` — these are documented in the style guide and carry all the styling.

### 5. Set data-theme="dark" on <html>
```tsx
document.documentElement.setAttribute('data-theme', 'dark');
```
The prototype uses `data-theme="dark"` and `data-theme="light"`. Not `horizon-ui` / `horizon-ui-light`.

### 6. Replace static data with API calls
Every static string in `DemoSupportDashboard.tsx` maps to a backend value. The JSX structure stays the same — just replace the hardcoded text:

```tsx
// Static (demo)
<td style={{color:'var(--text-primary)'}}>Market Data Load</td>

// Dynamic (production)
<td style={{color:'var(--text-primary)'}}>{step.name}</td>
```

### 7. Add Google Fonts
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
```
Or use your system font stack — but the token values (`--font-ui`, `--font-mono`) expect Inter and JetBrains Mono for the sizing to match exactly.

## What NOT to do

- Don't create a `Text`, `Mono`, `Stack`, `Tile`, `Surface` component library. The CSS classes do the job.
- Don't rename tokens (`--green` → `--rag-green`). Use them as-is.
- Don't use Tailwind v4. The shell.css was written for v3.
- Don't create a density token system. The prototype's sizing is already dense. It's baked into the class values.
- Don't write component specs. The CSS IS the spec.

## Files to copy to EOS.Horizon

1. `src/tokens/tokens-v43.css` → your token directory
2. `src/tokens/shell.css` → your token directory
3. `src/tokens/dashboard.css` → alongside your dashboard page
4. `src/App.tsx` → reference for shell layout
5. `src/pages/DemoSupportDashboard.tsx` → reference for page structure
