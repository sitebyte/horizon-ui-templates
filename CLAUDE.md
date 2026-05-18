# CLAUDE.md — Project Rules

## Role: Design Authority (MANDATORY)
This session is the **design authority** for the Horizon ETRM UI. Everything related to visual design, component patterns, layout, tokens, density, and interaction design is decided here. A separate production session (EOS.Horizon, running on a Windows instance) implements these designs in a .NET 10 + React 19 SPA.

### No Backend Authority (MANDATORY)
- **NEVER include API endpoints, DTOs, data shapes, query patterns, or backend suggestions in specs or handover documents.**
- The EOS.Horizon session is 100% in charge of backend architecture. We have no visibility into their .NET backend, EOS database schema, or API design.
- If a spec needs to reference data, describe the UI: "this cell displays a volume value" — NOT "the API returns `{ volume: number }` from `GET /api/positions`".

## Versioning Rule (MANDATORY)
- **ALWAYS version work.** Create a new directory (horizon-v7, horizon-v8, etc.) for each iteration.
- **NEVER modify existing versions.** horizon-v1 through horizon-v43 are frozen. Do not edit files in those directories.
- Copy the previous version as a starting point, then apply changes to the new copy.
- Commit and push each version as a complete, self-contained snapshot.

## Session Context
- Feed `CLAUDE-SESSION-CONTEXT.md` at the start of any new session for full project context.
- Update `CLAUDE-SESSION-CONTEXT.md` when adding new versions.

## Design Rules (MANDATORY)
- **USE TAILWIND v3 CDN** — `<script src="https://cdn.tailwindcss.com"></script>`. NOT Tailwind v4 npm. v4's layer system breaks shell.css specificity.
- **NO FIXED WIDTHS** — No px values in layout. Use rem, em, %, vh/vw, or Tailwind's responsive classes. Design must be scalable.
- **MAKE IT A PLEASURE** — Right data, right time. LNG numbers are HUGE ($47M cargoes, 3.2M MMBtu volumes). Big numbers should feel big and important. The UI should be functional, easy, and cool.
- **SCALABLE** — Everything responsive. Works on laptop to ultrawide. No breakage at any viewport.
- **KEYBOARD-FIRST** — Users don't want to spend time in this system. Every form must support type-and-tab flow. Date fields accept typed input (not date-picker-only). Selects are searchable/typeable. Tab order is logical. Enter submits. Escape cancels. No mouse required for core workflows. Auto-focus on first field when a form opens.

## AI-Aware Design (MANDATORY)
- **SEMANTIC HTML** — Use data attributes, aria labels, and clear class naming so an AI can understand what every component does and how to modify it.
- **SKINNABLE** — Themes via CSS custom properties. Changing a skin = changing variable values, not rewriting components. An AI should be able to reskin the entire app by modifying the `:root` block.
- **COPY-PASTE COMPONENTS** — Every component should be self-contained HTML that an AI can copy into a new page and it just works. No hidden dependencies, no magic JS init beyond `initShell()`.
- **CLEAR NAMING** — Class names describe function: `hz-kpi`, `hz-entity-link`, `pnl-positive`. An AI reading the class name should understand the component's purpose.

## Technical Rules
- AG Grid containers: use `height:calc(100vh - Xrem)` not flexbox (flex chain breaks when initShell restructures DOM)
- Grid init: use `setTimeout(function(){...}, 100)` not `DOMContentLoaded`
- No skeleton loading: content renders immediately with CSS fade-in
- Sidebar menus: all groups `defaultOpen: false`
- All pages call `initShell(key, title)` for shell integration

## Feature Flags
- `ENABLED_MENU_GROUPS` in `shell.js` controls which sidebar sections are visible
- Currently `['SUPPORT']` — only the Support area is active
- Set to `[]` to show all groups when other areas go live

---

## EOS.Horizon Handover — CSS-Direct Integration (MANDATORY)

**This replaces all previous handover approaches** (component specs, token audits, measurement tables). Those failed because abstraction layers caused the designs to diverge.

### The Rule
**The prototype's CSS files ARE the integration artifact.** EOS.Horizon consumes `tokens.css` + `shell.css` + per-page CSS files directly. No renaming, no re-mapping, no React primitive wrappers around CSS classes. The moment someone creates a mapping layer, the designs diverge.

### What We Deliver
A working React app in `demo-app/` with:
- `src/tokens/tokens-v43.css` — design tokens (colours, surfaces, text scale, spacing, radii)
- `src/tokens/shell.css` — component CSS (all `hz-*` classes)
- `src/tokens/{page}.css` — per-page layout classes (dashboard.css, audit.css, etc.)
- `src/pages/*.tsx` — all support pages using the prototype's class names directly
- `src/App.tsx` — full shell (header, sidebar, workspace tabs, Cmd+K, status bar)
- `HANDOVER.md` — step-by-step integration guide
- Static data inline with `{/* TODO: API */}` markers for backend wiring

### Root Cause of Prior Failures
Playwright measurements confirmed these specific mismatches between the prototype and EOS.Horizon's `_semantic.css`:

| What | Prototype (correct) | EOS.Horizon (wrong) |
|---|---|---|
| `--text-xs` | 0.6875rem (11px) | 0.625rem (10px) |
| `--text-sm` | 0.8125rem (13px) | 0.75rem (12px) |
| `--text-base` | 0.875rem (14px) | 0.8125rem (13px) |
| Font | Inter | DM Sans |
| Mono font | JetBrains Mono | ui-monospace system stack |
| Status colours | `--green`, `--red`, `--amber`, `--blue` | Renamed to `--rag-*` (left empty) |
| Theme attribute | `data-theme="dark"` | `data-theme="horizon-ui"` |
| Tailwind | v3 CDN | v4 npm (broke shell.css) |

Every font was 1px smaller. Every status colour was empty. It compounded into a completely different-looking app.

### Integration: Two Phases

**Phase 1 — New Support Pages (replace):**
1. Copy CSS files from `demo-app/src/tokens/` into EOS.Horizon's token directory
2. Delete `_semantic.css`, `_palette.css`, `theme-horizon-ui.css`
3. Copy page components from `demo-app/src/pages/`
4. Add Tailwind v3 CDN + Google Fonts to `index.html`
5. Change ThemeContext to write `data-theme="dark"` / `"light"` (not `"horizon-ui"`)
6. Wire up API data by replacing static strings with existing `useQuery` hooks

**Phase 2 — Existing Pages (migrate visual layer):**
Older pages (Trading, Settlements, etc.) use React primitive components (`Text`, `Mono`, `Tile`, `StatusPill`, etc.). Keep these — their mechanics work. The token swap from Phase 1 updates their values automatically. The only code change: find-replace `--rag-green` → `--green`, `--rag-red` → `--red`, `--rag-amber` → `--amber`, `--rag-info` → `--blue` across the primitive .tsx files. Or use the bridge CSS in `HANDOVER.md`.

### What NOT To Do
1. **Don't rename tokens.** `--green` stays `--green`. Don't create `--rag-green` aliases.
2. **Don't create React wrappers around CSS classes.** `<div className="hz-kpi">` IS the component.
3. **Don't use Tailwind v4 npm.** Its layer system breaks shell.css specificity.
4. **Don't create component specs.** The CSS IS the spec.
5. **Don't create a density token system.** The prototype's sizing is already dense.

### Ongoing Handshake
When the prototype updates (v44, v45...):
1. Design authority publishes new `tokens.css` + `shell.css`
2. EOS.Horizon drops them in as replacements
3. If page HTML structure changed, update the affected page JSX
4. Screenshot comparison to verify

**No more component specs. No more token audits. CSS files in, CSS files out.**

### Key Files
- `demo-app/HANDOVER.md` — Full step-by-step integration guide with file lists
- `demo-app/MIGRATION.md` — Technical migration reference
- `demo-app/src/` — Complete working React app (Vite + React 19 + TypeScript)
- Current prototype: `horizon-v43/` (live at https://sitebyte.github.io/horizon-ui-templates/horizon-v43/)
