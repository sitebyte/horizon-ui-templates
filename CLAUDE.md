# CLAUDE.md — Project Rules

## Role: Design Authority (MANDATORY)
This session is the **design authority** for the Horizon ETRM UI. Everything related to visual design, component patterns, layout, tokens, density, and interaction design is decided here. A separate production session (EOS.Horizon, running on a Windows instance) implements these designs in a .NET 10 + React 19 SPA.

### Spec-Led Handover
- **The prototype drives.** We build HTML/CSS prototypes to explore and refine designs.
- **The spec is the integration artifact.** After prototyping, generate a component spec (`analysis/eos.horizon/component-spec-vN.md`) with exact pixel-level measurements keyed to EOS.Horizon's React component names.
- **Future updates use deltas.** When a new version ships, write only what changed vs the previous spec.
- **The handover cycle:** iterate prototype → generate spec → hand spec to EOS.Horizon → they apply values and re-screenshot.
- Component specs live in `analysis/eos.horizon/`. The current spec is `handover-05-13/component-spec-v41.md`.

### No Backend Authority (MANDATORY)
- **NEVER include API endpoints, DTOs, data shapes, query patterns, or backend suggestions in specs or handover documents.**
- The EOS.Horizon session is 100% in charge of backend architecture. We have no visibility into their .NET backend, EOS database schema, or API design.
- If a spec needs to reference data, describe the UI: "this cell displays a volume value" — NOT "the API returns `{ volume: number }` from `GET /api/positions`".
- Backend hallucinations in specs cause confusion and waste time. Omit entirely.

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

These documents are written for the Claude session working in the production `EOS.Horizon` repo (.NET 10 + React 19). They describe **UI-only** specs — layout, composition, component measurements, visual states. No backend.

### Component Spec (primary handover artifact)
- `analysis/eos.horizon/handover-05-13/component-spec-v41.md` — Exact measurements from v41, keyed to EOS.Horizon's React component names. Every property marked TOKEN/FIXED/DENSITY.
- Future versions ship a delta section listing only what changed. EOS applies the delta, re-screenshots, done.

### Page-Level UI Spec (`analysis/ai-handover-spec.md`)
- Page-by-page layout and composition spec (UI only, no backend)
- Component mapping, layout patterns, interaction patterns
- 8 pages: Dashboard, Blotter, Trade Detail, Positions, Support Dashboard, SQL Checks, Environments, Security Profile

### Supporting Documents (`analysis/eos.horizon/handover-05-13/`)
- `response-plan.md` — Design authority answers to EOS.Horizon's 3 asks
- `integration-lessons.md` — Why HTML prototypes are hard to integrate, and the spec-led approach
- `eval-1/2/3-*.md` — Detailed evaluation reports (token audit, visual gaps, design decisions)

### Legacy Handover (`analysis/pass-to-claude/`)
- `handover.md` — Full project context, architecture, design philosophy
- `answers-to-builder.md` — Answers to the production builder's design questions
