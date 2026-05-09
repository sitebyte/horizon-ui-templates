# Review Pass 3: EOS.Horizon Production Sync Audit

> **Rating: LOW RISK** — Well-architected sync with 70+ stable tokens

## Token Shape Comparison

### Their System (EOS.Horizon Production)

```
client/src/horizon/tokens/
  _palette.css           ← Raw colour scales
  _semantic.css          ← Semantic bindings (--surface-*, --text-*, --rag-*, --sp-*, --radius-*, --font-*)
  theme-horizon-dark.css ← Dark: semantic → palette
  theme-horizon-light.css← Light: semantic → palette
  theme-horizon-ui.css   ← NEW: binds our token values (the theme port)
  index.css              ← Barrel import
```

- Components read ONLY semantic tokens via `var(--*)` (Gate G3 enforces)
- Theme switching: `<html data-theme="...">`
- React primitives: `Tile`, `Stack`, `Text`, `Mono`, `StatusPill`, `KpiCell`, `DataTable`, `ActivityFeed`
- No colour/spacing baked into JSX — all via `style={{ color: 'var(--rag-green)' }}`

### Our System (Horizon UI Templates)

```
horizon-v40/
  tokens.css      ← Standalone: :root + [data-theme="dark"] + [data-theme="light"]
  demo-fonts.css  ← Google Fonts (demo only, production ignores)
  shell.css       ← @imports both, then reset + .hz-* components
```

### Naming Mismatches (Bridged by Their Side)

| Their Token | Our Token | Bridge |
|------------|-----------|--------|
| `--rag-green` | `--green` | Their `theme-horizon-ui.css` aliases |
| `--rag-red` | `--red` | Same |
| `--rag-amber` | `--amber` | Same |
| `--rag-info` | `--blue` | Same |

**No action needed from us.** They handle the bridge.

### Tokens They Need to Add (Confirmed in Our Reply)

| Token Category | Count | Status |
|---------------|-------|--------|
| `--surface-canvas` (5th tier) | 1 | Confirmed durable |
| `--accent-violet` | 1 | Confirmed general-purpose |
| `--gradient`, `--gradient-subtle` | 2 | Confirmed, documented usage |
| `--*-dim` variants (4 colours) | 4 | Confirmed stable since v6 |
| `--*-text` variants (4 colours) | 4 | Confirmed stable since v6 |
| Component surfaces (`--card-bg`, `--input-bg`, etc.) | 4 | Documented |
| Borders (3-tier) | 3 | Documented |
| Interactive (`--hover`, `--active`, etc.) | 4 | Documented |
| Skeleton (`--skeleton-base`, `--skeleton-shine`) | 2 | Documented |
| `--accent-bg`, `--accent-bg2` | 2 | Documented |

## Constraints on Our Token Design

| Constraint | Implication | Compliance |
|-----------|-------------|------------|
| No external font loads | `tokens.css` must have no `@import` | v40 DONE |
| All colour via CSS vars | No hardcoded hex in token file | OK |
| No token renames without flagging | Token names are the API contract | Planned |
| Additive tokens documented in header | New tokens need header comment | Planned |
| Wholesale re-pull versioning | Values change, names don't | Confirmed |

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|-----------|
| Token rename breaks their bridge | HIGH | Never rename; flag in advance |
| Font dependency leaks back in | HIGH | `demo-fonts.css` is separate; never add to `tokens.css` |
| Spacing values shift (layout reflow) | MEDIUM | Treat `--sp-*` as immutable |
| New tokens not documented | MEDIUM | Always update `tokens.css` header |
| Type scale changes | LOW | They evaluate independently |

## Impact of v41 Changes on Sync

If we implement the planned fixes:

| Change | Type | Sync Impact |
|--------|------|-------------|
| `--text-muted` light value change | VALUE CHANGE | Auto-consumed on re-pull |
| `--surface-overlay` light value change | VALUE CHANGE | Auto-consumed on re-pull |
| `--text-inverse` new token | ADDITIVE | Must document; they choose to consume or not |
| `--shadow-*` new tokens | ADDITIVE | Must document; optional |
| `--blur-overlay` new token | ADDITIVE | Must document; optional |
| Shell.css responsive changes | NONE | They don't consume shell.css |

**No breaking changes. No renames. No removals.**

## Feedback Loop

Their protocol after landing the port on TST2:
```
analysis/eos-ui-horizon-comparison/theme-port-shipped-{date}.md
```
Contains: iteration ported, what lifted vs deferred, before/after screenshots, token mismatches.

We read their report and incorporate feedback into the next iteration.
