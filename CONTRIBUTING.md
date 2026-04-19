# How to Give Feedback

## Live Site
Browse the templates at: **https://sitebyte.github.io/horizon-ui-templates/**

Start with the **Horizon** theme (the big purple card at the top) — that's the production direction.

## Ways to Comment

### 1. GitHub Issues (preferred)
Go to: https://github.com/sitebyte/horizon-ui-templates/issues/new/choose

Select "UI Feedback" and fill in:
- Which page you're looking at
- What works / what doesn't
- Your perspective (trader, ops, risk, developer)

### 2. Inline Comments on Code
- Navigate to any file in the repo (e.g., `horizon/blotter.html`)
- Click a line number → "Start a conversation"
- Leave your comment on that specific line

### 3. Quick Reactions
- Open an issue or PR
- Use emoji reactions (👍 👎 🎉 😕) for quick votes

## What to Look At

### Key Pages (start here)
| Page | URL | What to Evaluate |
|------|-----|-----------------|
| Dashboard | [horizon/](https://sitebyte.github.io/horizon-ui-templates/horizon/) | Role toggle (Trader/Ops/Manager), KPIs, position ladder |
| Quick Entry | [quick-entry](https://sitebyte.github.io/horizon-ui-templates/horizon/quick-entry.html) | Trade capture speed, keyboard flow, confirmation step |
| Blotter | [blotter](https://sitebyte.github.io/horizon-ui-templates/horizon/blotter.html) | AG Grid, P&L columns, sorting, context menu |
| Positions | [positions](https://sitebyte.github.io/horizon-ui-templates/horizon/positions.html) | WACOG, physical/hedge split, drill-down |
| Trade Lifecycle | [lifecycle](https://sitebyte.github.io/horizon-ui-templates/horizon/lifecycle.html) | Full trade journey, 8 stages |
| Trade Form | [trade-form](https://sitebyte.github.io/horizon-ui-templates/horizon/trade-form.html) | Form sections, combobox, validation, impact preview |
| Invoices | [invoices](https://sitebyte.github.io/horizon-ui-templates/horizon/invoices.html) | Inline editing, bulk approve |
| Nominations | [nominations](https://sitebyte.github.io/horizon-ui-templates/horizon/nominations.html) | Cascading form (contract → cargo → vessel → ETA) |
| Reconciliation | [reconciliation](https://sitebyte.github.io/horizon-ui-templates/horizon/reconciliation.html) | Side-by-side diff, tolerance check |

### Variations (experimental)
| Page | URL | What to Evaluate |
|------|-----|-----------------|
| Trader Speed | [trader-speed](https://sitebyte.github.io/horizon-ui-templates/variations/trader-speed.html) | 8-keystroke capture, keystroke counter |
| Ops Accuracy | [ops-accuracy](https://sitebyte.github.io/horizon-ui-templates/variations/ops-accuracy.html) | Locked invoice fields, source tracing |
| Demo Narrative | [demo-narrative](https://sitebyte.github.io/horizon-ui-templates/variations/demo-narrative.html) | Marketing pitch page |
| Color Feedback | [color-feedback](https://sitebyte.github.io/horizon-ui-templates/variants-v2/color-feedback.html) | Status colors, freshness indicators, toast gallery |
| Guided Tour | [guided-tour](https://sitebyte.github.io/horizon-ui-templates/variants-v2/guided-tour.html) | 7-step onboarding tour |

## Tips
- Use **Cmd+K** (or Ctrl+K) on any Horizon page to open the command palette
- Try typing `trade 1003` or `cargo Q2` in the command palette
- Toggle dark/light theme with the gear icon in the sidebar
- Try collapsing the sidebar (hamburger menu)
- All pages are responsive — try resizing your browser
