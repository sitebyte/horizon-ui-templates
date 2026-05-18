# Appendix — Per-page visible gaps

Side-by-side comparison of each Support page: v41 template (your design)
vs. live TST2 Horizon (our implementation). All shots at 1440 × 900,
full-page. Light-mode Horizon captures only exist for the dashboard
because the SPA's light theme isn't actually flipping the visuals (the
load-bearing point this whole bundle is about) — see [Ask 1](./asks/ask-1-complete-light-theme.md).

## 1. Support Dashboard

[`screenshots/dashboard-dark/`](./screenshots/dashboard-dark/) and
[`screenshots/dashboard-light/`](./screenshots/dashboard-light/).

**Matches structurally**: 6-cell KPI strip; 3-column body grid; EOD Run
Status (left) + Integrity Checks & Service Health (middle) + Alerts &
Recent Activity & Database & Throughput (right); bottom status bar.

**Visible gaps**:

- EOD Run Status column body is sparse — header reads "scheduler · 9
  job groups · next…" but rows aren't visible at viewport scale.
  Likely a row-height / table-layout issue; may resolve via [Ask 2](./asks/ask-2-compact-density.md).
- Density ~25% looser than template (covered by Ask 2).
- Integrity Checks rows have no inline expanded-detail row (template's
  `Missing Settlement Prices · 2 cargoes (BRN Nov-26, TTF Dec-26)`
  pattern). Our `CheckRow` primitive supports a `detail` prop already;
  we'll wire it once the row-height question is settled.
- Alerts banding lighter than template (covered by [Ask 3a](./asks/ask-3-alerts-and-eod.md)).
- **Light mode**: template flips cleanly; ours doesn't (the whole point
  of [Ask 1](./asks/ask-1-complete-light-theme.md)).

**Intentional differences (do NOT change)**:

- No market-data ticker / Hedge-TES tabs / env badge in header — we
  intentionally dropped these per `horizon-ui-theme-port.md` ("Drop the
  demo-only ticker").
- Sidebar shows only SUPPORT + SECURITY top-level sections — the other
  TRADING / CONTRACTS / etc. sections in your template don't yet exist
  in our app.
- KPI cell values reflect real TST2 data ("OFFLINE", "488 trades", "17
  open alerts") — not the polished mockup values.

## 2. Audit Search

[`screenshots/audit-dark/`](./screenshots/audit-dark/) (dark only).

**Matches structurally**: page heading, search bar with date filters +
dropdowns, results table, pagination strip.

**Visible gaps**:

- Template shows 7 columns (Timestamp / Entity / ID / Action chip /
  User / Field / Old / New). Ours shows 4 (Id / Date / Person /
  Function). The Entity column and inline field-level Old/New diff are
  the biggest missing pieces — they're data-source-bound (we'd need to
  surface the per-field change rows from `t_LOG_*Actions` tables in
  the list response).
- Template uses **colour-coded action chips** (Update orange, Approve
  green, Create blue, Reject red, Login grey); ours renders the action
  as plain text. Pure styling — `actionTone.ts` already classifies
  severities; we just don't render a coloured pill yet.
- Pagination summary text — template: "Showing 15 of 2,847 — Page 1
  of 190"; ours: First / Prev / Next / Last + count.

**Intentional differences**: query-string-driven URL state in the
filter bar (ours). Bookmarkable search URLs.

## 3. Environments

[`screenshots/environments-dark/`](./screenshots/environments-dark/) (dark only).

**Big shape difference**: your v41 template renders a **topology
diagram** (~15 nodes, colour-coded edges, message explorer below).
Ours renders a **probe-result grid** (2×2 cards: EOS DB / Keycloak /
Scheduler / WCF, plus the new RabbitMQ + Key Vault cards we just
added). Different metaphor.

The probe data is already API-owned and exposes a topology endpoint
(`GET /api/support/environment/topology`); the topology rebuild is
scoped as a follow-up.

**Gap not blocking this handover** because the topology-vs-grid
decision is upstream of CSS. The CSS work you do for the probe grid
will still apply once the rebuild lands.

## 4. Data Quality

[`screenshots/data-quality-dark/`](./screenshots/data-quality-dark/) (dark only).

**Matches structurally**: page header, KPI strip, two cards (Curve
Quality + Trade Integrity).

**Visible gaps**:

- Template KPI strip has 6 tiles; ours has 5 (Position Breaks dropped
  pending position-recon work — flagged in the originating brief).
- Three of our trade-integrity rows render as `STUB` (`curve.monotonicity`,
  `trade.price-tolerance`, `trade.volume-validation`) because the
  data wiring isn't done. Template shows them as if implemented.
- Curve Quality benchmark table rows similar density to template, but
  pill-treatment differs (template has saturated PASS / STALE pills,
  ours uses informational tone).

**Intentional**: we use a `STUB` severity (neutral pill) for
not-yet-implemented checks rather than rendering them as FAIL — your
template predates this severity class.

## 5. SQL Checks

[`screenshots/sql-checks-dark/`](./screenshots/sql-checks-dark/) (dark only).

**Matches structurally**: catalogue list (left), preview pane (right),
Run button, parameter inputs.

**Visible gaps**:

- Template has **filter presets** above the catalogue (Environment /
  Book / Benchmark); ours doesn't. Easy add — UI work, no data
  question.
- Template ships ~10 example snippets; ours ships zero pending the
  seed work on `t_RPT_Report` (ReportTypeId=9). UI on the right pane
  reads "Select a snippet from the catalogue to view its SQL" until
  someone seeds.
- Template has Copy Results / Copy SQL buttons; ours has Copy SQL
  only (verify if Results copy also lands).

**Intentional**: we have 7 category tabs (ALL / AUDIT / TRADE / CURVE
/ SETTLEMENT / VALUATION / ENV) that your template doesn't show —
they may be redundant once filter presets land.

---

## Cross-page patterns to address

These appear on every page; fixing one place fixes all five:

1. **Row density** — every panel reads ~25% looser than your template.
   Single token / density-class change cascades. [Ask 2](./asks/ask-2-compact-density.md).
2. **Light mode** — flat-out doesn't work. [Ask 1](./asks/ask-1-complete-light-theme.md).
3. **Pill saturation** — template pills are heavier (filled, higher
   contrast); ours are lighter (mostly outline / soft fill). Token
   adjustment to `--status-pill-*-bg` etc.
4. **Typography weight on labels** — template uppercase labels at
   ~500 weight; ours at ~600. Probably a `--text-label-weight` token
   we don't have.

If you address the four cross-page patterns plus the three asks, every
visible difference above lands together.
