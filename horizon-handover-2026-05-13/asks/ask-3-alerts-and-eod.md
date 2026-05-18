# Ask 3 — Alert banding + EOD-row spec

Two smaller asks, grouped because they're both single-decision.

---

## 3a — Alert banding

Your v41 alerts panel uses **full-width tinted backgrounds per severity** — pink for FAIL, yellow for WARN, blue for INFO. Visually heavier than just a pill.

Our `AlertRow` primitive currently puts the tint only on a small severity pill at the leading edge of the row. The row background itself is `var(--card-bg)` regardless of severity.

### What we need

- **Confirm the banded background is intentional** (vs. our pill-only treatment). If yes:
- Token bindings: `--alert-bg-fail`, `--alert-bg-warn`, `--alert-bg-info` — what values for both `[data-theme="horizon-ui"]` and `[data-theme="horizon-ui-light"]`?
- We'll update [`../markup/primitives/AlertRow.tsx`](../markup/primitives/AlertRow.tsx) to bind the row background to `var(--alert-bg-{severity})` and ship.

---

## 3b — EOD Run Status row shape

Your v41 mockup's EOD column shows columns `Step | Started | Duration | Status` for each step. We ship `#ID Name | NextRun-relative | Status pill | Run/Cancel buttons` — different shape because:

1. **The Run/Cancel buttons are operationally useful**. Operators need them to retry / kill a stuck job from the dashboard, not by tabbing to the legacy scheduler IIS UI.
2. **The Duration column isn't in our data**. The EOS Scheduler's `rawDataSet` exposes `LastRun` and `NextRun` per group, but not run-duration. We could compute "time since LastRun" but that's not what you've shown.

### What we need

A yes/no on:

- **Keep the Run/Cancel buttons** even though they're not in your mockup? (We think yes; operators need them.)
- **Drop the Duration column** (since we can't fill it) and instead show `Started` (LastRunUtc, relative or absolute) + `Status`?

If you're flexible on either, just say "yes whatever". If you'd prefer a different framing, propose one and we'll wire it.

### What we provide

The full source for the EOD column lives in [`../markup/primitives/SchedulerJobsTile.tsx`](../markup/primitives/SchedulerJobsTile.tsx). It's mounted in [`../markup/pages/SupportDashboardPage.tsx`](../markup/pages/SupportDashboardPage.tsx) under the comment `Column 1 — EOD Run Status`.

---

## Definition of done (both)

- Alert banding: drop your new tokens in `theme-horizon-ui.css` (covered by Ask 1's deliverable if it's bundled), and we wire `AlertRow.tsx` to consume them.
- EOD rows: a 1-line yes/no on each question; we re-shape the markup and re-screenshot.
