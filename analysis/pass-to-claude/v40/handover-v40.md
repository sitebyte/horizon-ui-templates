# Horizon v40 — Handover Summary

> **Date:** 2026-05-09
> **Iteration:** v40
> **Live:** https://sitebyte.github.io/horizon-ui-templates/horizon-v40/

## What Changed

**Structural split of `shell.css` for production theme porting.**

v40 is a zero-change iteration in terms of visual output — token values are identical to v39. The change is architectural: `shell.css` was split into three files so the production EOS.Horizon team can consume design tokens cleanly.

### New File Architecture

| File | Lines | Purpose | Who Consumes |
|------|-------|---------|-------------|
| `tokens.css` | 185 | Standalone design tokens + dark/light theme bindings | **Production team** |
| `demo-fonts.css` | 12 | Google Fonts `@import` for Inter + JetBrains Mono | Demo pages only |
| `shell.css` | 1837 | `@import`s both above, then reset + `.hz-*` component CSS | Demo pages only |

### Why

The production EOS.Horizon session (`features/24606-support-area-v1`, .NET 10 + React 19) requested a tokens-only port. Their brief is at `analysis/theme-builder/theme-port-brief-for-theme-builder.md`. Our reply is at `analysis/pass-to-claude/answers-to-builder-theme-port.md`.

### EOS.Horizon Sync

- Reply document published answering all 7 theme port questions
- Confirmed: 5-tier surface ramp is durable, `-dim`/`-text` status variants are durable
- Confirmed: wholesale re-pull versioning (token names stable, values evolve)
- Confirmed: `--accent-violet` is general-purpose, gradients documented
- No font `@import` in `tokens.css` (production constraint)

### Pages

38 pages — unchanged from v39.
