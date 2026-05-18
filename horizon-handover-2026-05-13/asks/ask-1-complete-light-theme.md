# Ask 1 — A complete `theme-horizon-ui.css` for both variants

## Background

Our current `client/src/horizon/tokens/theme-horizon-ui.css`:
- Has a fully-populated `[data-theme="horizon-ui"]` block (dark variant — ported wholesale from your v40).
- Has a **stub** `[data-theme="horizon-ui-light"]` block — only the surface ramp got light-mode values during the v40 port; most other tokens are still binding their dark values, so flipping the attribute changes almost nothing.

See [`../screenshots/dashboard-dark/`](../screenshots/dashboard-dark/) vs [`../screenshots/dashboard-light/`](../screenshots/dashboard-light/) — your template flips cleanly, ours doesn't budge.

## What we'd like

A drop-in replacement for `theme-horizon-ui.css` where:

1. Every token currently declared under `[data-theme="horizon-ui"]` has a corresponding override under `[data-theme="horizon-ui-light"]` such that the latter renders our markup the way your template renders in light mode.
2. Token names **stay the same** — we don't want to chase rename churn through 30 components. If you need a new token (e.g. a new semantic surface our markup doesn't yet bind), name it and tell us; we'll wire the binding.
3. Both variants should produce the visual you've already shipped for v41 (your dashboard mockup at `https://sitebyte.github.io/horizon-ui-templates/horizon-v41/support-dashboard.html` is the ground truth).

## What we provide

| File | Purpose |
|---|---|
| [`../markup/tokens/theme-horizon-ui.css`](../markup/tokens/theme-horizon-ui.css) | Our current file. Source of token NAMES. Replace wholesale or edit in place. |
| [`../markup/tokens/_semantic.css`](../markup/tokens/_semantic.css) | The semantic token catalogue — `--text-primary`, `--surface-canvas`, `--border-subtle`, etc. Tells you which token names every primitive expects to consume. |
| [`../markup/tokens/index.css`](../markup/tokens/index.css) | Aggregator — shows the import order. |

## Constraints we won't bend

- **No font `@import`.** We use the system font stack (DM Sans + system mono). v40 imports Inter + JetBrains Mono — we can't take that dependency.
- **No external CSS dependencies** (CDN-loaded Bootstrap, etc.).
- **CSS custom properties only.** No SCSS, no PostCSS-specific syntax outside what Vite ships with.

## Definition of done

We swap the file in, redeploy TST2, take a fresh screenshot pair (dark + light, on the dashboard page), and the visual is indistinguishable from your template at 1440×900. If we're close-but-not-there, we'll send a second-cycle bundle with the diff highlighted.
