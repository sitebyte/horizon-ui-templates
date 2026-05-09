# CLAUDE.md — Project Rules

## Versioning Rule (MANDATORY)
- **ALWAYS version work.** Create a new directory (horizon-v7, horizon-v8, etc.) for each iteration.
- **NEVER modify existing versions.** horizon-v1 through horizon-v6 are frozen. Do not edit files in those directories.
- Copy the previous version as a starting point, then apply changes to the new copy.
- Commit and push each version as a complete, self-contained snapshot.

## Session Context
- Feed `CLAUDE-SESSION-CONTEXT.md` at the start of any new session for full project context.
- Update `CLAUDE-SESSION-CONTEXT.md` when adding new versions.

## Design Rules (MANDATORY)
- **USE TAILWIND CSS** — Include Tailwind CDN. Use Tailwind utility classes for layout, spacing, typography. shell.css is for design tokens and custom components only.
- **NO FIXED WIDTHS** — No px values. Use rem, em, %, vh/vw, or Tailwind's responsive classes. Design must be scalable.
- **MAKE IT A PLEASURE** — Right data, right time. LNG numbers are HUGE ($47M cargoes, 3.2M MMBtu volumes). Big numbers should feel big and important. The UI should be functional, easy, and cool.
- **SCALABLE** — Everything responsive. Works on laptop to ultrawide. No breakage at any viewport.
- **KEYBOARD-FIRST** — Users don't want to spend time in this system. Every form must support type-and-tab flow. Date fields accept typed input (not date-picker-only). Selects are searchable/typeable. Tab order is logical. Enter submits. Escape cancels. No mouse required for core workflows. Auto-focus on first field when a form opens.

## AI-Aware Design (MANDATORY)
- **SEMANTIC HTML** — Use data attributes, aria labels, and clear class naming so an AI can understand what every component does and how to modify it.
- **SKINNABLE** — Themes via CSS custom properties. Changing a skin = changing variable values, not rewriting components. An AI should be able to reskin the entire app by modifying the `:root` block.
- **COMPONENT STYLE GUIDE** — Each component type (card, table, KPI, badge, form, grid) must have a documented pattern. Publish as a living style guide page within the template set.
- **COPY-PASTE COMPONENTS** — Every component should be self-contained HTML that an AI can copy into a new page and it just works. No hidden dependencies, no magic JS init beyond `initShell()`.
- **CLEAR NAMING** — Class names describe function: `hz-kpi`, `hz-entity-link`, `pnl-positive`. An AI reading the class name should understand the component's purpose.

## Technical Rules
- AG Grid containers: use `height:calc(100vh - Xrem)` not flexbox (flex chain breaks when initShell restructures DOM)
- Grid init: use `setTimeout(function(){...}, 100)` not `DOMContentLoaded`
- No skeleton loading: content renders immediately with CSS fade-in
- Sidebar menus: all groups `defaultOpen: false`
- All pages call `initShell(key, title)` for shell integration

## Version Handover Rule (MANDATORY)
- **Every version iteration must include a handover summary** at `analysis/pass-to-claude/v{N}/handover-v{N}.md`.
- The handover summarises: what changed, new/changed tokens, EOS.Horizon sync impact, page count, and any breaking changes.
- This is the primary document the production EOS.Horizon session reads to stay in sync.
- Update this on every version commit — do not batch.

## Handover Documents for Production Build (EOS.Horizon)

These documents are written for the Claude session working in the production `EOS.Horizon` repo (.NET 10 + React 19). They translate the prototype's design intent into specs the production stack can consume.

### AI Handover Spec (`analysis/ai-handover-spec.md`)
Complete page-by-page component spec mapping every prototype pattern to the production component vocabulary (`Tile`, `StatusPill`, `Stack`, `Text`, `Mono`). Covers:
- **Global design system mapping** — token-to-Tailwind table, component mapping, layout patterns
- **7 page specs** — Dashboard, Blotter, Trade Detail/Lifecycle, Positions, Support Dashboard, SQL Checks, Environments
- **Universal interaction patterns** — toasts, entity links, number formatting, keyboard-first, density tiers
- **What to copy vs what not to copy** — visual ratios and data models yes, shell.js and CDN scripts no

### Environments Handover (`analysis/pass-to-claude/`)
- `handover.md` — Full project context, architecture, design philosophy
- `answers-to-builder.md` — Answers to the production builder's 6 design questions
- `implementation-guide-environments.md` — Detailed implementation guide for the `/support/environment` page
- `eos-topology-seed.json` — Seed topology data (nodes + edges) for the environments page
