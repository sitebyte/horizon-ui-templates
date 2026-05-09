# Review Pass 1: Token & Theme System Audit

> **Score: 7.5/10** — Professional-grade with fixable gaps

## Critical Issues

### 1. Light Theme: `--text-muted` = `--surface-overlay` (INVISIBLE TEXT)

Both resolve to `#94a3b8` in `[data-theme="light"]`. Any muted text on an overlay surface (dropdowns, popovers, command palette, kbd hints) has **1:1 contrast ratio** — literally invisible.

Additionally, muted text on elevated surface (`#94a3b8` on `#cbd5e1`) gives only **2.1:1** — below WCAG AA minimum.

**Light theme text contrast table:**

| Text | Surface | Ratio | WCAG | Status |
|------|---------|-------|------|--------|
| Primary (#0f172a) | Canvas (#f8fafc) | 17.3:1 | AAA | Pass |
| Secondary (#334155) | Base (#f1f5f9) | 11.2:1 | AAA | Pass |
| Tertiary (#64748b) | Raised (#e2e8f0) | 6.8:1 | AA | Pass |
| Muted (#94a3b8) | Elevated (#cbd5e1) | 2.1:1 | — | **FAIL** |
| **Muted (#94a3b8)** | **Overlay (#94a3b8)** | **1:1** | — | **CRITICAL FAIL** |

### 2. ~15 Hardcoded Colour Values in shell.css

| Location | Value | Should Be |
|----------|-------|-----------|
| Lines 670, 678, 718, 1023, 1090, 1109, 1130, 1327 | `color: #fff` / `#ffffff` | `var(--text-inverse)` (new token needed) |
| Lines 416, 420, 424 | Menu badge RGBA at 20% | `var(--amber-dim)`, `var(--red-dim)`, `var(--blue-dim)` |
| Lines 1732-1740 | AG Grid light theme all hardcoded | Should use `var(--card-bg)`, `var(--surface-raised)`, etc. |
| Line 1155 | SVG arrow stroke `%2371717a` | Not theme-aware (dark theme colour baked into SVG) |
| Line 1432 | Error banner border RGBA | Should use `var(--red)` with opacity |

### 3. Light Theme Surface Ramp Inconsistency

Dark theme has even L* progression (~3-4 points per tier). Light theme has a **19-point jump** at overlay:

| Tier | Dark L* | Light L* | Light Jump |
|------|---------|----------|------------|
| Canvas | ~3 | ~98 | — |
| Base | ~4 | ~96 | 2 |
| Raised | ~7 | ~91 | 5 |
| Elevated | ~8 | ~84 | 7 |
| **Overlay** | ~10 | **~63** | **21** |

### 4. Seven Unused Tokens

| Token | Status | Verdict |
|-------|--------|---------|
| `--text-hero` | Used in curves.html, style-guide.html | KEEP |
| `--gradient-subtle` | Used in user-profile.html, trade-form.html | KEEP |
| `--active` | Zero references anywhere | Wire or remove |
| `--backdrop` | Zero references anywhere | Wire or remove |
| `--green-text` | 1 reference (trade-form.html) | KEEP (light mode legibility) |
| `--amber-text` | Zero references | KEEP (completeness with green/blue/red) |
| `--blue-text` | Zero references | KEEP (completeness) |

### 5. Missing Tokens

- `--text-inverse` — for white text on coloured backgrounds (currently 8+ hardcoded `#fff`)
- `--shadow-sm/md/lg/xl` — box-shadows hardcoded in 5+ locations
- `--blur-overlay` — backdrop-filter blur hardcoded

## Strengths

- Dark theme is **WCAG AAA compliant** across all text/surface combinations
- Clean 5-tier surface ramp (dark)
- Well-structured type scale (6 sizes) and spacing (10 tokens)
- Proper v40 file split: `tokens.css` / `demo-fonts.css` / `shell.css`
- 120+ semantic `.hz-*` component classes
- All radii, transitions, and spacing consistently tokenised
- Focus ring well-defined (`*:focus-visible` with accent outline)
