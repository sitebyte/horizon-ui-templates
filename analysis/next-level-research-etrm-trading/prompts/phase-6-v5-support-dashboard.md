# Phase 6: v5 — Support Area & System Dashboard

## Context
The user wants to add a support area to the ETRM system with pages for system administration, monitoring, and data quality. This is framed to support multiple dashboard types per user role — the first being a system/support dashboard focused on EOD run state, integrity checks, curve quality, and SQL validations.

## Prompt Process

### Step 1: Research (4 parallel web searches + 2 page fetches)

**Searches:**
1. `ETRM system administration dashboard end of day processing monitoring` — Found: EOD batch processes (market data load, curve bootstrap, position calc, VaR, settlement, regulatory), data integrity validation, pre/post EOD workflows
2. `operations dashboard design real-time system monitoring health checks 2026` — Found: PatternFly and Carbon design system patterns, aggregate status cards, trend cards, event/alert cards, data quality dashboards
3. `energy trading EOD batch processing curve bootstrap validation data integrity CTRM` — Found: 10M+ daily settle prices, curve validation, trade-position reconciliation workflows
4. `system admin dashboard UI design patterns status indicators health checks job monitoring` — Found: Carbon status indicators (running/complete/failed), PatternFly dashboard card types, aggregate status patterns

**Page fetches:**
- PatternFly dashboard guidelines — 5 card types (aggregate status, health check, trend, events/alerts, utilization), 6-step layout approach
- Carbon status indicator patterns — Icon indicators with shape + color + label, semantic colors (green=success, red=error, amber=warning, blue=info)

### Step 2: Architecture Decision
Created a SUPPORT menu group in shell.js with 4 pages:
- **System Status** (`support-dashboard.html`) — EOD run monitoring, integrity checks, alerts
- **Audit Search** (`support-audit.html`) — Enhanced searchable audit log
- **Data Quality** (`support-data-quality.html`) — Curve quality, trade integrity, position checks
- **SQL Checks** (`support-sql-checks.html`) — Predefined SQL validation queries with results

### Step 3: Page Design

**Support Dashboard** — 3-column layout mirroring the trader dashboard pattern:
- Col 1: EOD batch step table (8 steps with status: Complete/Running/Queued)
- Col 2: Integrity check results (8 checks with PASS/WARN/FAIL indicators)
- Col 3: Alerts + recent activity feed

**Audit Search** — Search toolbar + results table:
- Comprehensive filter bar: text search, date range, entity type, action type, user
- Results table showing field-level diffs (old/new values in red/green)
- Pagination controls

**Data Quality** — 3 anchored sections:
- #curves: Curve staleness + bootstrap validation results
- #trades: Duplicate detection, field validation, price tolerance, settlement readiness
- #positions: Trade-position recon, limit monitoring, WACOG validation

**SQL Checks** — Runnable check catalog:
- 12 predefined validation queries across Curves/Trades/Settlement/Risk/Operations/System
- Each with Run/View SQL buttons
- Expandable SQL panel with syntax-highlighted query

### Step 4: Design Patterns Used

**Status indicators:** Following Carbon/PatternFly patterns:
- Green dot + "PASS" badge for successful checks
- Amber dot + "WARNING" badge for non-critical issues
- Red dot + "FAIL" badge for failures requiring action
- Blue dot + pulse for running processes
- Grey/neutral badge for queued/pending items

**EOD batch table:** Inspired by CI/CD pipeline visualizations:
- Step name, start time, duration, status badge
- Running step shows pulse animation
- Queued steps show muted dash

**SQL panel:** Dark code block with monospace font, syntax coloring:
- Keywords in accent color
- Strings in green
- Comments in muted
- Background: surface-canvas (darkest tier)

## Key Design Decisions

### Why a separate SUPPORT menu group?
Support/admin pages serve a different user (system admin, tech lead) than trading pages. Putting them in their own sidebar group keeps the trading workflow clean while making admin tools discoverable.

### Why mirror the trader dashboard layout?
The 3-column dense layout proved effective for the trader dashboard. Reusing the same pattern for system status creates consistency — admins recognize the layout language immediately.

### Why predefined SQL checks instead of a query runner?
A free-form SQL runner is a security risk in static templates. Predefined checks with "Run" buttons demonstrate the pattern without implying arbitrary SQL execution. Each check shows its SQL so developers understand what's validated.

## Outcome
4 new pages added to v5, SUPPORT menu group in sidebar. All pages follow v4 density standards with the same shell (context strip, header, status bar).
