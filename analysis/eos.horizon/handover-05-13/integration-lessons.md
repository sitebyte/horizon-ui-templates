# Why Integrating HTML Prototypes into a React App Is Hard

**Date:** 2026-05-14
**Context:** Lessons learned from integrating horizon-ui-templates (v40/v41 static HTML prototypes) into EOS.Horizon (production .NET 10 + React 19 SPA).

---

## The core problem

A static HTML prototype is a design exploration tool, not an integration artifact. We were using it as both. That's why every handover cycle felt harder than it should have been.

---

## Five reasons integration was difficult

### 1. The prototype is the wrong artifact for a React consumer

Our `support-dashboard.html` is 300 lines of inline-styled HTML with embedded CSS classes, demo data, and layout logic all interleaved. The EOS.Horizon session has to untangle "what is the design intent" from "what is demo markup" from "what is inline style." That's interpretation, not application. Interpretation drifts.

### 2. The spec was implicit

Before `component-spec-v41.md`, there was no document that said "CheckRow padding is exactly 3px vertical, title weight is 400." The EOS session had to eyeball screenshots, measure pixels, guess token mappings. An AI comparing two screenshots and trying to match padding by 2px is unreliable. That's why everything ended up ~25% too loose — the session approximated "looks about right" rather than applying exact values.

### 3. Different naming creates cognitive load on every property

Every single CSS property requires a mental mapping: `--green` to `--rag-green`, `.hz-badge` to `<StatusPill kind="severity">`, `.hz-card` to `<Tile>`, `padding: 0.1875rem` to "what Tailwind class is that?" The EOS session has to do this translation hundreds of times. Each one is a chance to drift.

### 4. Different sizing paradigm that isn't obvious

Our template renders at an effective 12px root font-size (via the density system in settings). Their app uses a 16px root. Everything we spec in rem is 33% larger in their app. This single invisible difference accounts for most of the density gap. Neither session knows about the other's root font-size unless someone explicitly says so.

### 5. The feedback loop is screenshots, which are lossy

"Compare this screenshot to that screenshot" is the weakest form of spec. Is that padding 3px or 6px? Is that weight 400 or 500? Is that opacity 15% or 20%? Screenshots can't answer these questions. The EOS session guesses, gets close, but "close" across 20 properties on 8 components compounds into a visibly different feel.

---

## What was happening vs what works

**The hard way (what we were doing):**

```
Template HTML → Screenshot → Prompt to EOS ("match this") → EOS interprets → Drift
```

**The right way:**

```
Template HTML → Component Spec (exact values) → Prompt to EOS ("apply these values") → Exact match
```

The component spec (`component-spec-v41.md`) eliminates interpretation by giving the EOS session exact property-value pairs keyed to their own component names. "Change `weight={600}` to `weight={400}` on CheckRow" leaves nothing to interpret.

---

## What to change going forward

### 1. Stop asking EOS to "match the template"
Instead, hand it the component spec and say "apply these values to these components."

### 2. When iterating the template (v42, v43), write the delta spec first, not the HTML
The HTML is for exploring design ideas. The spec is what crosses the boundary. Treat them as two separate outputs. The delta format:

```
## v42 delta
- KpiCell value weight: 700 → 600
- AlertRow left border: 2px → 3px
- NEW TOKEN: --phase-discharge-dim: rgba(16, 185, 129, 0.15)
```

### 3. The token layer is done — stop touching it
The tokens work. The light theme works (it was an attribute wiring bug, not a CSS bug). Future iterations should rarely need token changes — it's component measurements that drift.

### 4. Consider skipping the prototype for incremental changes
Now that EOS.Horizon has a working component library with correct tokens, you could skip the HTML prototype for polish iterations on existing pages and update the component spec directly. Reserve the prototype for exploring new pages (cargo board, position management) where you need to figure out the layout.

---

## The token layer vs the component layer

| Layer | Status | Future work |
|---|---|---|
| **Tokens** (colors, surfaces, borders, shadows) | Done. Both dark and light fully ported and correct. | Token value changes are copy-paste. Near-zero friction. |
| **Components** (padding, weight, font-size, layout) | Now spec'd in `component-spec-v41.md`. | Apply delta per version. Low friction if spec is maintained. |
| **Page composition** (which components go where, grid layout) | EOS matches v41 structurally. | New pages need new specs. Existing pages are stable. |

---

## Summary

The difficulty was never about prompts or approach to the EOS session. It was that a static HTML prototype is a design exploration tool being used as an integration spec. The component spec bridges that gap. Future updates: update the spec, hand it to EOS, done.
