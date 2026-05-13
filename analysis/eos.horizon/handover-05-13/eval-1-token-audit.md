# Evaluation 1 -- Token & Theme Audit

**Date:** 2026-05-13
**Auditor:** Senior Designer (Design Authority)
**Comparing:** v41 tokens.css (source of truth) vs EOS.Horizon theme-horizon-ui.css + _semantic.css

---

## 1. Dark Theme Accuracy

**Verdict: Perfect parity.** Every hex value, rgba, gradient, and shadow in EOS's `[data-theme="horizon-ui"]` matches our `[data-theme="dark"]` exactly. All 5 surface tiers, 4 text tiers, component surfaces, borders, accent family, gradients, interactive states, shadows, skeleton, RAG colors -- all identical.

Extra tokens they added (benign, not conflicts):
- `--text-on-accent: #ffffff` -- equivalent to our `--text-inverse`
- `--border-default: var(--border)` -- alias for existing consumers
- `--accent-on: #ffffff` -- no equivalent in our dark block

**Zero value conflicts in the dark theme.**

---

## 2. Light Theme Completeness

**Verdict: Fully complete -- NOT broken at the CSS level.**

Contrary to EOS's self-report that light mode "has no visual effect," their `[data-theme="horizon-ui-light"]` block (lines 104-171) is fully populated. Every value matches our v41 light theme, including the v41 fixes:
- `--surface-overlay: #b4bdca` (v41 fix: was identical to `--text-muted`)
- `--text-muted: #78859b` (v41 fix: WCAG contrast lift)

All token groups present and matching:
- Surface ramp (5 tiers), text ramp (4 tiers), component surfaces (4), borders (3), accent family (all), gradients, interactive states, shadows (light-specific softer values), skeleton, RAG colors, blur-overlay, color-scheme.

**If light mode doesn't work, the bug is upstream:** likely a CSS load-order issue, a missing `data-theme="horizon-ui-light"` attribute on `<html>`, or their `_semantic.css` `:root` defaults (warm-stone theme, not ours) bleeding through as fallback.

---

## 3. Token Naming Differences (Complete Map)

EOS renamed status colors from bare names to `rag-` prefix:

| Our v41 name | EOS name | Values match? |
|---|---|---|
| `--green` | `--rag-green` | Yes (#22c55e) |
| `--green-dim` | `--rag-green-dim` | Yes |
| `--green-text` | `--rag-green-text` | Yes |
| `--red` | `--rag-red` | Yes (#ef4444) |
| `--red-dim` | `--rag-red-dim` | Yes |
| `--red-text` | `--rag-red-text` | Yes |
| `--amber` | `--rag-amber` | Yes (#f59e0b) |
| `--amber-dim` | `--rag-amber-dim` | Yes |
| `--amber-text` | `--rag-amber-text` | Yes |
| `--blue` | `--rag-info` | Yes in theme file (#3b82f6); semantic default differs (#60a5fa) |
| `--blue-dim` | `--rag-info-dim` | Yes in theme file |
| `--blue-text` | `--rag-info-text` | Yes (#2563eb) |

**Note:** `--rag-info` default in `_semantic.css` is `#60a5fa` (blue-400, lighter) vs our `#3b82f6` (blue-500). Theme override corrects this, but components rendered outside `[data-theme]` context get the wrong blue.

---

## 4. Missing Tokens

### 4a. Cargo Phase Colors -- ALL MISSING
Six `--phase-*` tokens not declared anywhere in EOS:

| Token | Our v41 value |
|---|---|
| `--phase-planning` | #64748b |
| `--phase-nomination` | #3b82f6 |
| `--phase-loading` | #f59e0b |
| `--phase-transit` | #6366f1 |
| `--phase-discharge` | #10b981 |
| `--phase-settlement` | #22c55e |

Needed when they port cargo-board/lifecycle pages.

### 4b. Font Families -- Intentional Divergence
Ours: Inter + JetBrains Mono. Theirs: DM Sans + system mono.
Documented and deliberate. Their theme file does NOT override fonts, so DM Sans persists. Acceptable.

---

## 5. Semantic Layer Extras (EOS additions we don't have)

| Addition | Assessment |
|---|---|
| `--pnl-positive/negative/neutral` | **GOOD** -- finance-tuned muted green/red for blotter cells. Consider adopting upstream. |
| `--status-pass/warn/fail/info/running/neutral` | **GOOD** -- pure aliases to RAG, zero new values. Clean semantic layer. |
| `--density-row-comfortable/compact/trader` | **GOOD** -- enterprise density control we lack. Values need tuning (see eval-3). |
| `--env-accent` + `[data-env]` selectors | **EXCELLENT** -- pure CSS environment tinting. Zero JS. Superior to our approach. |
| `--icon-xs/sm/md/lg/xl` | **NEUTRAL** -- reasonable constraint. No conflict. |
| `--weight-regular/medium/semibold/bold` | **NEUTRAL** -- standard values, no conflict. |

---

## 6. Type Scale Differences

**Most significant divergence.** EOS runs everything 1-4px smaller:

| Step | Our v41 (px) | EOS (px) | Delta |
|---|---|---|---|
| `--text-xs` | 11px | 10px | -1px |
| `--text-sm` | 13px | 12px | -1px |
| `--text-base` | 14px | 13px | -1px |
| `--text-md` | (none) | 14px | EOS extra step |
| `--text-lg` | 18px | 16px | -2px |
| `--text-xl` | 24px | 20px | -4px |
| `--text-2xl` | (none) | 24px | EOS extra step |
| `--text-3xl` | (none) | 30px | EOS extra step |
| `--text-hero` | 32px | 36px | +4px |

Their theme file does NOT override type scale tokens -- intentionally left as a product concern, not a theme concern. **This is the correct architectural decision.** Do not override.

---

## Risk Summary

| Area | Status | Risk |
|---|---|---|
| Dark theme values | MATCH | None |
| Light theme values | MATCH (fully populated) | None (integration bug, not CSS) |
| Token renames (rag-*) | Clean mapping | Low |
| Cargo phase tokens | MISSING | Medium (blocks cargo port) |
| Font families | Intentional divergence | Low |
| Type scale | Significant divergence | **HIGH** (do not override -- product concern) |
| Semantic extras | Good additions | None (consider adoption) |
