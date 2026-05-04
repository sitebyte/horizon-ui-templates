# Horizon v23 Navigation Test Results

**Date**: 2026-05-04
**Total Assertions**: 168
**Passed**: 153
**Failed**: 15
**Warnings**: 0
**Pass Rate**: 91.1%

## Test 1: Menu Structure Audit

| Page | Issues |
|------|--------|
| counterparties.html | Expected 1 open group, got 2 (CONTRACTS, ADMINISTRATION) |
| audit-log.html | Expected 1 open group, got 0 () |
| nominations.html | Expected 1 open group, got 0 () |
| invoices.html | Expected 1 open group, got 0 () |
| positions.html | Expected 1 open group, got 0 () |
| curves.html | Expected 1 open group, got 0 () |

### Per-Page Summary

| Page | Groups | Open | Active Group | Active Items |
|------|--------|------|-------------|-------------|
| index.html | 7 | 1 (TRADING) | TRADING | Trades View |
| trade-form.html | 7 | 1 (TRADING) | TRADING | Trade Capture |
| charges.html | 7 | 1 (TRADING) | TRADING | Charge Capture |
| vessel-charters.html | 7 | 1 (TRADING) | TRADING | Vessel Charter |
| master-agreements.html | 7 | 1 (CONTRACTS) | CONTRACTS | Master Agreements |
| contracts.html | 7 | 1 (CONTRACTS) | CONTRACTS | Contracts |
| counterparties.html | 7 | 2 (CONTRACTS, ADMINISTRATION) | CONTRACTS, ADMINISTRATION | Contact Counterparties, Static Data, Companies, Manage Companies |
| cargo-board.html | 7 | 1 (OPERATIONS) | OPERATIONS | Cargo View |
| cargo-matching.html | 7 | 1 (OPERATIONS) | OPERATIONS | Matching |
| manage-schedule.html | 7 | 1 (OPERATIONS) | OPERATIONS | Manage Schedule |
| audit-log.html | 7 | 0 () |  | Cargo Audit Summary |
| nominations.html | 7 | 0 () |  | Shipments |
| valuations.html | 7 | 1 (FINANCE) | FINANCE | Valuations |
| invoices.html | 7 | 0 () |  | Statements |
| positions.html | 7 | 0 () |  | Portfolio |
| curves.html | 7 | 0 () |  | Prices |
| settings.html | 7 | 1 (ADMINISTRATION) | ADMINISTRATION | Settings |
| reminders.html | 7 | 1 (SYSTEM) | SYSTEM | Reminder Dashboard |
| support-dashboard.html | 7 | 1 (SUPPORT) | SUPPORT | System Status |
| support-audit.html | 7 | 1 (SUPPORT) | SUPPORT | Logs, Audit Search |
| support-data-quality.html | 7 | 1 (SUPPORT) | SUPPORT | Data Quality |
| support-sql-checks.html | 7 | 1 (SUPPORT) | SUPPORT | SQL Checks |
| blotter.html | 7 | 0 () |  |  |
| quick-entry.html | 7 | 0 () |  |  |
| lifecycle.html | 7 | 0 () |  |  |
| hedges.html | 7 | 0 () |  |  |
| reconciliation.html | 7 | 0 () |  |  |
| style-guide.html | 7 | 0 () |  |  |
| curve-management.html | 7 | 1 (ADMINISTRATION) | ADMINISTRATION | Static Data, Prices, Manage Curve Definitions |
| index-builder.html | 7 | 1 (ADMINISTRATION) | ADMINISTRATION | Static Data, Prices, Manage Price Basis |

## Test 2: Accordion Behavior

| Step | Open Groups | Expected | Pass |
|------|-------------|----------|------|
| Initial state - index.html | TRADING | TRADING | PASS |
| After clicking CONTRACTS | CONTRACTS | CONTRACTS | PASS |
| After clicking OPERATIONS | OPERATIONS | OPERATIONS | PASS |
| After clicking OPERATIONS again (toggle close) |  |  | PASS |

## Test 3: Navigation Links

5 of 21 navigation links had issues:

| Menu Item | Target | Page Loaded | Correct Group | Active Item | Only 1 Open | Pass |
|-----------|--------|-------------|---------------|-------------|-------------|------|
| Trades View | index.html | Yes | Yes | Yes | Yes | PASS |
| Trade Capture | trade-form.html | Yes | Yes | Yes | Yes | PASS |
| Charge Capture | charges.html | Yes | Yes | Yes | Yes | PASS |
| Vessel Charter | vessel-charters.html | Yes | Yes | Yes | Yes | PASS |
| Master Agreements | master-agreements.html | Yes | Yes | Yes | Yes | PASS |
| Contracts | contracts.html | Yes | Yes | Yes | Yes | PASS |
| Contact Counterparties | counterparties.html | Yes | Yes | Yes | No (2) | FAIL |
| Cargo View | cargo-board.html | Yes | Yes | Yes | Yes | PASS |
| Matching | cargo-matching.html | Yes | Yes | Yes | Yes | PASS |
| Manage Schedule | manage-schedule.html | Yes | Yes | Yes | Yes | PASS |
| Shipments | nominations.html | Yes | No () | Yes | No (0) | FAIL |
| Valuations | valuations.html | Yes | Yes | Yes | Yes | PASS |
| Statements | invoices.html | Yes | No () | Yes | No (0) | FAIL |
| Portfolio | positions.html | Yes | No () | Yes | No (0) | FAIL |
| Prices | curves.html | Yes | No () | Yes | No (0) | FAIL |
| Settings | settings.html | Yes | Yes | Yes | Yes | PASS |
| Reminder Dashboard | reminders.html | Yes | Yes | Yes | Yes | PASS |
| System Status | support-dashboard.html | Yes | Yes | Yes | Yes | PASS |
| Audit Search | support-audit.html | Yes | Yes | Yes | Yes | PASS |
| Data Quality | support-data-quality.html | Yes | Yes | Yes | Yes | PASS |
| SQL Checks | support-sql-checks.html | Yes | Yes | Yes | Yes | PASS |

## Test 4: Sidebar Collapse

| Step | Collapsed Class | Width | Pass |
|------|----------------|-------|------|
| Initial state - sidebar expanded | false | 248px | PASS |
| After collapse click | true | 56px | PASS |
| After expand click | false | 248px | PASS |

## Test 5: Fullscreen Toggle

| Step | Fullscreen | Header | Sidebar | Status Bar | Pass |
|------|-----------|--------|---------|-----------|------|
| Normal state | false | Visible | Visible | Visible | PASS |
| Fullscreen mode | true | Hidden | Hidden | Hidden | PASS |
| Restored from fullscreen | false | Visible | Visible | Visible | PASS |

## Key Findings

- **6 pages have no active menu item highlighted**: blotter.html, quick-entry.html, lifecycle.html, hedges.html, reconciliation.html, style-guide.html
- **1 pages have multiple groups open**: counterparties.html (CONTRACTS, ADMINISTRATION)
- **5 navigation links had issues**: Contact Counterparties, Shipments, Statements, Portfolio, Prices

---
*Generated by Playwright test suite on 2026-05-04T08:27:14.776Z*
