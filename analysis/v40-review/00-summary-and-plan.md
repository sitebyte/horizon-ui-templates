# v40 Theme Review: Summary & Implementation Plan

> **Date:** 2026-05-09
> **Reviewed by:** 4-agent team (token audit, responsiveness audit, sync audit, industry research)
> **Iteration:** horizon-v40
> **Verdict:** Professional-grade foundation with **one critical accessibility bug** and opportunities for hardening

---

## Overall Assessment

| Area | Score | Verdict |
|------|-------|---------|
| Token Architecture | 8/10 | Well-structured, clean v40 split |
| Dark Theme | 9/10 | WCAG AAA compliant, excellent surface ramp |
| Light Theme | 4/10 | **Critical:** muted text invisible on overlay |
| Responsiveness | 5/10 | Desktop-only, but that's correct for ETRM |
| EOS.Horizon Sync | 9/10 | Low risk, 70+ stable tokens, clean protocol |
| Industry Alignment | 7/10 | Good; could adopt foreground-pairing pattern |

---

## Three Things That Must Be Fixed

### 1. Light theme `--text-muted` = `--surface-overlay` (CRITICAL)

Both are `#94a3b8`. Text is invisible on overlay surfaces in light mode. Affects dropdowns, popovers, command palette hints.

**Fix:** Change `--surface-overlay` to `#b4bdca` (L* ~77) and `--text-muted` to `#78859b` (L* ~56). Validate with contrast checker.

### 2. Hardcoded `#fff` throughout shell.css

8+ instances of white text on coloured backgrounds without a token. Breaks theme flexibility.

**Fix:** Add `--text-inverse: #ffffff` to `:root` in tokens.css. Replace all hardcoded `#fff`/`#ffffff` in shell.css.

### 3. AG Grid light theme hardcodes all colours

`.ag-theme-quartz` uses 8 hardcoded hex values instead of token vars. Dark theme (`.ag-theme-quartz-dark`) already uses tokens correctly.

**Fix:** Mirror the dark theme pattern — reference `var(--card-bg)`, `var(--surface-raised)`, etc.

---

## Implementation Plan: v41

All work goes into `horizon-v41/` (copied from v40). v40 is frozen.

### Phase 1: Critical Fixes (MUST DO)

| Task | File | Sync Impact |
|------|------|------------|
| Fix `--text-muted` and `--surface-overlay` light values | tokens.css | Value change only — auto-consumed on re-pull |
| Add `--text-inverse` token | tokens.css | New token — document in header |
| Replace all `#fff`/`#ffffff` with `var(--text-inverse)` | shell.css | None (shell.css not consumed) |
| Tokenize AG Grid light theme | shell.css | None |
| Fix SVG dropdown arrow for light theme | shell.css | None |
| Fix `color:#000` on active pills (5 HTML files) | *.html | None |

### Phase 2: Reactive Design — Zero px Anywhere (MUST DO)

**Principle:** Desktop-first does NOT mean pixel-pinned. Every element must scale fluidly with viewport and base font size. Zoom to 200%, shrink to 1024px, expand to 3440px ultrawide — everything breathes. The CLAUDE.md rule is absolute: **no px values**.

- **1280px+:** Full experience (current)
- **1024-1279px:** Graceful degradation (add 64rem breakpoint)
- **<1024px:** "Desktop recommended" banner

| Task | File | Detail |
|------|------|--------|
| Convert AG Grid columns from px to flex | All HTML with AG Grid | Replace `width: 85` with `flex: 1`/`flex: 2` proportional sizing. Use `minWidth` in rem-equivalent. Add `autoSizeStrategy: { type: 'fitGridWidth' }` |
| Add 64rem (1024px) tablet breakpoint | shell.css | Dense form → 2-col, KPI strips wrap, header compress |
| Enhance 48rem (768px) mobile breakpoint | shell.css | Sidebar backdrop, user menu max-width, mobile banner |
| Consolidate per-page @media into shell.css | shell.css + HTML | Move duplicate 64rem collapse patterns into `.hz-layout-collapse` utility |
| Audit and eliminate all remaining px | shell.css + HTML | Every dimension must be rem, em, %, vh/vw, or Tailwind |

### Phase 3: Token Hardening (NICE TO HAVE)

| Task | File | Sync Impact |
|------|------|------------|
| Add `--shadow-sm/md/lg/xl` tokens (theme-aware) | tokens.css | New tokens — document |
| Add `--blur-overlay` token | tokens.css | New token — document |
| Wire `--active` token (currently unused) | shell.css | None |
| Wire `--backdrop` token (currently unused) | shell.css | None |
| Tokenize cargo phase colours (6 tokens) | tokens.css + cargo-board.html | New tokens — optional for production |
| Replace hardcoded badge colours with `-dim` tokens | shell.css | None |

### Phase 4: Documentation

| Task | File |
|------|------|
| Update tokens.css header with all new tokens | tokens.css |
| Update CLAUDE-SESSION-CONTEXT.md for v41 | CLAUDE-SESSION-CONTEXT.md |
| Create v41 changelog for EOS.Horizon team | analysis/pass-to-claude/ |
| Update style-guide.html with new tokens and responsive docs | style-guide.html |

---

## Token Changes Summary for EOS.Horizon

```
VALUE CHANGES (light theme only):
  --text-muted:      #94a3b8 → #78859b  (WCAG fix)
  --surface-overlay:  #94a3b8 → #b4bdca  (WCAG fix, was identical to text-muted)

NEW TOKENS (additive, all optional):
  --text-inverse:     #ffffff
  --shadow-sm:        0 0.25rem 0.75rem rgba(0,0,0,0.3)  [dark]
  --shadow-md:        0 0.5rem 1.5rem rgba(0,0,0,0.2)    [dark]
  --shadow-lg:        0 1rem 2.5rem rgba(0,0,0,0.35)     [dark]
  --shadow-xl:        0 1.5rem 3rem rgba(0,0,0,0.4)      [dark]
  --blur-overlay:     0.5rem
  --phase-planning:   #64748b
  --phase-nomination: #3b82f6
  --phase-loading:    #f59e0b
  --phase-transit:    #6366f1
  --phase-discharge:  #10b981
  --phase-settlement: #22c55e

NO TOKEN NAMES CHANGED
NO TOKENS REMOVED
```

---

## Implementation Sequence

```
Phase 1 (critical):     Copy v40 → v41
                         Fix light theme tokens (tokens.css)
                         Add --text-inverse (tokens.css)
                         Replace hardcoded #fff (shell.css)
                         Tokenize AG Grid light (shell.css)
                         Fix SVG arrow + pill colours

Phase 2 (responsive):   Add 64rem breakpoint (shell.css)
                         Enhance 48rem breakpoint (shell.css)
                         Consolidate per-page @media

Phase 3 (hardening):    Add shadow/blur tokens (tokens.css)
                         Wire unused tokens (shell.css)
                         Tokenize cargo phases

Phase 4 (docs):         Update all documentation
```

Phases 1-3 can partially parallelise. Phase 4 depends on all others.

---

## Review Documents

| File | Contents |
|------|----------|
| `01-token-theme-audit.md` | Full token inventory, contrast analysis, hardcoded values |
| `02-responsiveness-audit.md` | Media queries, fixed widths, AG Grid, industry comparison |
| `03-eos-horizon-sync-audit.md` | Token shape comparison, naming bridges, risk assessment |
| `04-industry-research.md` | Radix, shadcn, Carbon, Atlassian, Linear, Bloomberg, WCAG 2.2, W3C tokens |
