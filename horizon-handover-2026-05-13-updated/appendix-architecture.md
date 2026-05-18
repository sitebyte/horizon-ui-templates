# Appendix — How we consume horizon-ui's design language

Quick context so you can size the markup-vs-tokens question correctly.

## Two readings of "adopt horizon-ui"

When this conversation started, the question was: do we lift your markup, or just your tokens?

### (a) Adopt the templates' design tokens — a skin
CSS custom properties only. Surface ramp, text ramp, accent, semantic colours, spacing, radii. Our React primitives keep working unchanged because they consume tokens via `var(--*)` rather than baking colour or spacing into JSX. **~½ day of work.**

### (b) Adopt the templates' markup — the `.hz-sidebar` / `.hz-tile` / `.hz-menu-group` class layer
~1,800 lines of bespoke component CSS bound to specific HTML structure, plus a `shell.js` that builds the markup string-by-string. Different paradigm to our React-primitives approach. **Weeks; effectively a rewrite.**

**We picked (a)**, intentionally. The handover bundle is built on that choice.

## What this means in practice

- `client/src/horizon/tokens/` is the entire surface where your design lands.
- `client/src/horizon/primitives/` (Text, Stack, Mono, Surface, Hairline) and `client/src/horizon/data/` (Tile, KpiStrip, KpiCell, StatusPill, AlertRow, CheckRow, KvGrid, DataTable) are the components every page mounts. They consume the tokens. They don't bake colour values.
- Each page (Support Dashboard, Audit Search, Environments, Data Quality, SQL Checks) is a composition of these primitives. **Page-level files don't define their own CSS** — they only compose primitives.

## Therefore

When you produce updated `theme-horizon-ui.css`, **don't worry about page-level styles**. If your tokens render the primitives correctly, every page renders correctly. The composition is already done.

The one place this falls down is when your design uses a treatment that no primitive supports yet. For example, your alert panel has full-width severity-tinted row backgrounds; our `AlertRow` primitive has a pill but no row-tint. In those cases, **tell us in your cover note** and we'll add the necessary tokens / data attributes / class hooks to the primitive — that's our work, not yours.

## What you can ignore

- React Router, TanStack Query, Vite — none of those touch your design.
- Page-level testids (`data-testid="..."`) — they're for our Playwright suite, not yours to honour.
- Backend handler files (`src/Eos.Horizon.Application/...`) — irrelevant.
- Tailwind utility classes in our markup — we use Tailwind for layout-only (flex, grid, padding, gap). Anywhere a colour or border appears, it's a CSS variable from your tokens (e.g. `bg-card`, `text-foreground`, `border-border` map to `var(--card-bg)`, `var(--text-primary)`, `var(--border)`).

## What we'd love (but don't need)

If you have spare cycles, a short note clarifying:
- **What's the canonical container for a "panel"?** v41 uses `.hz-panel` / `.hz-tile` interchangeably in places. Ours is `<Surface tone="raised">` for some panels and `<Tile>` for others. Which is which?
- **Should EOD Run Status be a `<Tile>` or a `<Panel>` semantically?** It's currently `<Tile>` because that came from the wave-A widget. The v41 mockup looks panel-shaped.
- **Is there a typography pattern we're missing?** Your label text is consistently lighter weight than ours.

These can wait for a follow-up.
