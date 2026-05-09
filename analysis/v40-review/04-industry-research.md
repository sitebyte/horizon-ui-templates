# Industry Research: Best-in-Class Design Systems & Financial UI

## 1. Leading Dark-Theme Design Systems (2025-2026)

### Token Architecture Comparison

| System | Surface Tiers | Token Tiers | Status Colour Approach |
|--------|--------------|-------------|----------------------|
| **Radix Colors** | 12-step per colour | 3-tier (primitive → semantic → component) | Pre-computed light/dark scales per hue |
| **shadcn/ui** | 5 (background, card, popover, muted, accent) | 2-tier (semantic pairs: bg + foreground) | Destructive + muted variants |
| **IBM Carbon** | 4 named themes (White, G10, G90, G100) | 3-tier with layer tokens | Contextual token sets per layer |
| **Atlassian** | 5 elevation levels (surface + shadow pairs) | 3-tier | Transparent neutral tokens that auto-adjust |
| **Linear** | 3 base vars (base, accent, contrast) | Minimal (LCH-computed) | Dark-first, light is adaptation |
| **Vercel Geist** | Pure black/white + semantic | 2-tier | Colour only when meaningful |
| **Horizon v40** | 5 (canvas, base, raised, elevated, overlay) | 2-tier (universal + theme) | 4 colours × 3 variants (raw, dim, text) |

### Key Patterns Worth Adopting

**shadcn/ui's foreground pairing:** Every surface token gets a matching `*-foreground`. This eliminates contrast guessing — if you use `--card`, the readable text colour is always `--card-foreground`. Our system lacks this; we rely on `--text-primary/secondary/tertiary/muted` to work across all surfaces (which is why the light theme overlay/muted collision happened).

**Radix's 12-step scale:** Steps 1-2 backgrounds, 3-5 interactive, 6-8 borders, 9-10 solids, 11-12 text. The step-to-purpose mapping prevents misuse. Our system is simpler (which is appropriate for a template library) but could benefit from documenting which text tiers are safe on which surfaces.

**Atlassian's transparent neutrals:** Using `rgba` tokens that auto-darken on light and auto-lighten on dark. Our `--hover` and `--active` tokens already do this (`rgba(255,255,255,0.04)` dark / `rgba(0,0,0,0.04)` light).

## 2. Responsive Patterns for Data-Dense UIs

### Industry Consensus: Desktop-First, Not Desktop-Only

Professional trading platforms use a **hybrid model**: full-featured desktop + purpose-built mobile companion. Nobody makes 20-column grids responsive to 375px.

| Platform | Desktop | Mobile |
|----------|---------|--------|
| Bloomberg Terminal | Chromium-based, full density | Bloomberg Anywhere (separate app) |
| Refinitiv Eikon | Desktop-first web | Simplified companion |
| TradingView | Full charts + grids | Responsive charts, simplified grids |
| Schwab/thinkorswim | Full power desktop | Three distinct platforms |
| ION | Desktop-only trading | No mobile grid views |

**AG Grid best practices:** Use `gridSizeChanged` event + `columnApi.setColumnsVisible()` for dynamic column hiding. Container sizing with `calc(100vh - Xrem)` is correct. Column widths in px are normal AG Grid API.

### Correct Targets for Horizon

- **1280px+:** Full experience, all features
- **1024-1279px:** Graceful degradation (fewer columns, collapsed panels)
- **<1024px:** "Desktop recommended" message, summary views only

## 3. Accessibility Standards (WCAG 2.2)

### Requirements

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| SC 1.4.3 (Text Contrast) | AA | 4.5:1 normal text, 3:1 large text |
| SC 1.4.11 (Non-Text Contrast) | AA | 3:1 for UI components and meaningful graphics |
| SC 2.4.11 (Focus Appearance) | AA (new in 2.2) | 2px perimeter, 3:1 focused/unfocused contrast |

### Dark Mode Pitfalls

- Avoid pure white (#FFF) on pure black (#000) — causes halation. Use off-white on dark grey.
- Muted text must still meet 4.5:1 for normal size.
- Status colours (green/red) that pass on white often fail on dark surfaces.
- Overlay surfaces need independent contrast testing.

### Our Compliance

- **Dark theme:** WCAG AAA across all combinations. Excellent.
- **Light theme:** FAILS at muted-on-elevated (2.1:1) and muted-on-overlay (1:1). Critical fix needed.
- **Focus ring:** 2px solid accent with offset. Meets SC 2.4.11.

## 4. Token Architecture Best Practices

### W3C Design Tokens Format Module (2025.10 — First Stable Release)

- JSON format with `$` prefix properties (`$value`, `$type`, `$description`)
- Alias syntax: `{token.name}` enables three-tier chains
- Composite types for shadows, gradients, typography
- `$extends` for theme inheritance
- Full CSS Color Module 4 support (P3, Oklch)

### Three-Tier Standard

| Tier | Name | Example | Purpose |
|------|------|---------|---------|
| 1 | Primitive/Reference | `color.blue.600 = #1A73E8` | Raw palette |
| 2 | Semantic/System | `color.primary = {color.blue.600}` | Intent-based, theme-switchable |
| 3 | Component | `button.bg.primary = {color.primary}` | Per-component overrides |

Our system is effectively 2-tier (universal + theme). EOS.Horizon has 2-tier (palette + semantic). Together they form a 3-tier chain: our `tokens.css` values → their `_semantic.css` bindings → their component consumption. This is architecturally sound.

## 5. Relevant Open-Source References

### Palantir Blueprint (blueprintjs.com)

The closest open-source precedent. React-based, explicitly optimised for "complex, data-dense web interfaces for desktop applications." Built-in dark mode, Sass-driven theming, components designed for high information density.

**Worth studying for:** Component API patterns, density controls, keyboard-first interactions.

### Sources

- Radix Colors: radix-ui.com/colors
- shadcn/ui Theming: ui.shadcn.com/docs/theming
- IBM Carbon Themes: carbondesignsystem.com/elements/themes
- Atlassian Elevation: atlassian.design/foundations/elevation
- Linear UI: linear.app/now/how-we-redesigned-the-linear-ui
- W3C Design Tokens: designtokens.org/tr/drafts/format
- Palantir Blueprint: blueprintjs.com/docs
- AG Grid Sizing: ag-grid.com/javascript-data-grid/grid-size
- WCAG 2.2: w3.org/TR/WCAG22
