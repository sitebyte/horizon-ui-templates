# Implementation Guide: SQL Checks Page

> For the Claude session building the production EOS.Horizon app (.NET 10 + React 19).
> This document translates the prototype at `horizon-v36/support-sql-checks.html` into a production spec.

---

## 1. Overview

The SQL Checks page is a support operations tool that lets support analysts run pre-defined SQL validation checks against the EOS database. It answers the question: "Is the data healthy right now?"

**Workflow:**
1. Support analyst opens the page (usually during or after EOD processing)
2. Selects a preset (e.g. "EOD PROD") or manually sets global parameters (COB date, environment, book, benchmark)
3. Runs all checks, a selected subset, or individual checks
4. Reviews results: PASS/WARN/FAIL status, row-level detail, the actual SQL executed
5. Adjusts per-check parameters if needed (e.g. staleness threshold, lookback days) and re-runs
6. Exports results to CSV for audit trail

**Where it fits:** This is one of three pages in the Support section alongside the Support Dashboard (system health overview) and the Environments page (topology viewer). It is the primary data quality assurance tool.

---

## 2. Architecture

### API Endpoints

#### `GET /api/support/sql-checks`
Returns the full list of check definitions with their metadata, parameters, SQL templates, and result column specs.

**Response shape:** See `sql-checks-schema.json` in `horizon-v36/`. The response includes:
- `globalParameters[]` — the shared parameters (COB, Environment, Book, Benchmark)
- `presets[]` — named parameter combinations for quick setup
- `checks[]` — each check definition with its per-check parameters and SQL template

**Caching:** Check definitions change rarely. Cache at the BFF layer with a 5-minute TTL, or use React Query's `staleTime`.

#### `POST /api/support/sql-checks/{id}/run`
Executes a single check with the provided parameters. The server substitutes `@paramName` tokens in the SQL template, executes against the target environment's database, and returns typed results.

**Request body:**
```json
{
  "globalParams": {
    "cob": "2026-05-07",
    "environment": "PROD",
    "book": "ALL",
    "benchmark": "ALL"
  },
  "checkParams": {
    "staleness_threshold_hours": 24
  }
}
```

**Response:**
```json
{
  "checkId": 3,
  "status": "WARN",
  "detail": "6 prices >24h old",
  "duration": "0.8s",
  "executedAt": "2026-05-07T17:32:14Z",
  "executedSql": "SELECT ... WHERE ...",
  "columns": [
    { "id": "benchmark", "label": "Benchmark", "type": "text" },
    { "id": "hours_stale", "label": "Hours Stale", "type": "number", "align": "right" }
  ],
  "rows": [
    { "benchmark": "NBP", "tenor": "Q3-26", "price": 8.42, "last_updated": "2026-05-04T09:15:00Z", "hours_stale": 55 }
  ],
  "rowCount": 6
}
```

**Status determination:** The server evaluates `passCondition` and `warnCondition` from the check definition against the result set to determine PASS/WARN/FAIL.

#### `POST /api/support/sql-checks/run-batch`
Runs multiple checks in parallel. Accepts an array of check IDs plus global parameters.

```json
{
  "checkIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  "globalParams": { "cob": "2026-05-07", "environment": "PROD", "book": "ALL", "benchmark": "ALL" }
}
```

Returns results as a stream (Server-Sent Events) or as a batch response with all results.

### Database Storage

Check definitions are stored in database tables, not hardcoded:

```
sql_check_definitions
  id              INT PRIMARY KEY
  name            NVARCHAR(200)
  category        NVARCHAR(50)
  description     NVARCHAR(MAX)
  severity        NVARCHAR(20)     -- 'error' | 'warning'
  sql_template    NVARCHAR(MAX)
  pass_condition  NVARCHAR(500)
  warn_condition  NVARCHAR(500)
  schedule_cron   NVARCHAR(50)
  schedule_desc   NVARCHAR(200)
  is_active       BIT
  sort_order      INT
  created_at      DATETIME2
  updated_at      DATETIME2

sql_check_parameters
  id              INT PRIMARY KEY
  check_id        INT FK -> sql_check_definitions.id
  param_id        NVARCHAR(100)
  label           NVARCHAR(200)
  param_type      NVARCHAR(20)     -- 'number' | 'text' | 'select' | 'date'
  default_value   NVARCHAR(500)
  min_value       NVARCHAR(50)
  max_value       NVARCHAR(50)
  step_value      NVARCHAR(50)
  options_json    NVARCHAR(MAX)    -- JSON array for select type
  description     NVARCHAR(500)
  sort_order      INT

sql_check_result_columns
  id              INT PRIMARY KEY
  check_id        INT FK -> sql_check_definitions.id
  column_id       NVARCHAR(100)
  label           NVARCHAR(200)
  column_type     NVARCHAR(20)     -- 'text' | 'number' | 'date' | 'datetime' | 'status'
  align           NVARCHAR(10)     -- 'left' | 'right' | 'center'
  sort_order      INT

sql_check_run_log
  id              BIGINT PRIMARY KEY
  check_id        INT FK -> sql_check_definitions.id
  run_by          NVARCHAR(100)
  run_at          DATETIME2
  environment     NVARCHAR(20)
  params_json     NVARCHAR(MAX)
  status          NVARCHAR(10)     -- 'PASS' | 'WARN' | 'FAIL'
  detail          NVARCHAR(500)
  duration_ms     INT
  row_count       INT
  results_json    NVARCHAR(MAX)    -- stored for audit trail
```

### Security

- The API should validate that the requesting user has the `support:sql-checks` permission
- SQL templates contain `@param` placeholders that the server substitutes via parameterised queries — never string concatenation
- Environment selection determines which connection string is used (PROD, UAT, TST1, TST2)
- All check executions are logged in `sql_check_run_log` for audit

---

## 3. Data Model

The canonical data model is defined in `horizon-v36/sql-checks-schema.json`. This JSON file serves as the contract between the API and the UI. Key design decisions:

- **Global parameters** (COB, Environment, Book, Benchmark) are shared across all checks and sent in the URL/query state
- **Per-check parameters** are specific to each check (e.g. `staleness_threshold_hours` for Stale Price Detection) and sent in the POST body
- **SQL templates** use `@paramName` syntax for all parameters (both global and per-check)
- **Result columns** are strongly typed with alignment hints so the UI can render them correctly without special-casing
- **Pass/warn conditions** are evaluated server-side against the result set

### The 12 Checks

| # | Name | Category | Per-Check Params |
|---|------|----------|------------------|
| 1 | Bootstrap Curve Validation | Curves | `max_delta_pct` (default 5) |
| 2 | Forward Curve Monotonicity | Curves | `tenor_start` (1), `tenor_end` (60) |
| 3 | Stale Price Detection | Curves | `staleness_threshold_hours` (24) |
| 4 | Trade Duplicate Check | Trades | `lookback_days` (7) |
| 5 | Missing Settlement Prices | Settlement | `lookback_days` (5), `lookahead_days` (3) |
| 6 | Position-Trade Reconciliation | Positions | `variance_threshold` (0.01) |
| 7 | Credit Limit Validation | Risk | `utilisation_warning_pct` (80) |
| 8 | Counterparty Master Check | Reference | `kyc_warning_days` (30) |
| 9 | Unmatched Nominations | Operations | `forward_days` (30) |
| 10 | Invoice Amount Validation | Settlement | `tolerance_pct` (0.1) |
| 11 | Orphaned Cargo Check | Physical | `forward_days` (90) |
| 12 | EOD Completeness | System | `max_step_duration_sec` (300) |

---

## 4. UI Component Spec

### Page Layout

```
<Stack direction="column" className="h-full">
  <Toolbar />           -- Run All, Run Selected, Export, last-run time, summary dots
  <PresetBar />         -- Quick-select buttons for common parameter combos
  <GlobalParamBar />    -- COB, Environment, Book, Benchmark
  <ChecksTable />       -- Scrollable table of all 12 checks
  <DetailPanel />       -- Resizable bottom panel with Results | SQL tabs
</Stack>
```

The outer layout is a vertical flex column. The `ChecksTable` takes `flex: 1` to fill available space. The `DetailPanel` is `flex-shrink: 0` with a configurable `max-height` (default 45vh) and a drag-to-resize handle.

### Toolbar

```
<Stack direction="row" align="center" gap={2} wrap>
  <Button variant="primary" size="sm" onClick={runAllChecks}>Run All Checks</Button>
  <Button size="sm" onClick={runSelected}>Run Selected</Button>
  <Button variant="ghost" size="sm" onClick={exportResults}>Export Results</Button>
  <Spacer />
  <Text size="xs" mono muted>Last run: {lastRunTime}</Text>
  <StatusSummary pass={passCount} warn={warnCount} fail={failCount} />
</Stack>
```

### Preset Bar

```
<Stack direction="row" align="center" gap={1} wrap>
  <Text size="2xs" weight={600} uppercase muted>Presets</Text>
  {presets.map(p => (
    <Button
      key={p.id}
      variant="ghost"
      size="2xs"
      className={cn("rounded-full border", activePreset === p.id && "border-accent bg-accent/10 text-accent")}
      onClick={() => applyPreset(p.id)}
    >
      {p.label}
    </Button>
  ))}
</Stack>
```

Preset buttons are pill-shaped ghost buttons. Active preset gets the accent border and background treatment.

### Global Parameter Bar

```
<Tile variant="raised" className="flex items-center gap-3 flex-wrap">
  <ParamGroup label="COB Date">
    <DateInput value={cob} onChange={setCob} />
  </ParamGroup>
  <ParamGroup label="Environment">
    <Select value={env} options={["PROD","UAT","TST1","TST2"]} onChange={setEnv} />
  </ParamGroup>
  <ParamGroup label="Book">
    <Select value={book} options={bookOptions} onChange={setBook} />
  </ParamGroup>
  <ParamGroup label="Benchmark">
    <Select value={benchmark} options={benchmarkOptions} onChange={setBenchmark} />
  </ParamGroup>
</Tile>
```

Each `ParamGroup` is a flex row: a tiny uppercase label + an input. Inputs use mono font.

### Checks Table

A standard HTML `<table>` (not AG Grid — this is a small, fixed-size dataset). Columns:

| Column | Width | Notes |
|--------|-------|-------|
| Checkbox | 1.25rem | Multi-select for batch run |
| # | 1.5rem | Mono, muted |
| Check Name | flex | Bold, primary text. Gear icon if check has per-check params |
| Category | auto | Tiny, tertiary |
| Last Run | auto | Mono timestamp HH:MM:SS |
| Duration | auto | Mono, e.g. "2.4s" |
| Result | auto | `StatusPill` — green PASS, amber WARN, red FAIL |
| Details | max 14rem | Ellipsized, tertiary |
| Actions | auto | Three small buttons: Run (primary), Results (ghost), SQL (ghost) |

**Row click** = select check, show SQL in detail panel.
**Run button click** = run ONLY that check (must not trigger row selection or interfere with other checks).
**Active row** gets `accent-bg2` background highlight.
**Running state** shows animated spinner in the Result column.

Event handling uses delegation on the `<tbody>` element rather than per-button inline handlers. The Run button handler calls `runSingleCheck(id)` which is isolated from `selectCheck(id)`.

### Detail Panel

The panel sits below the table, separated by a border-top. It has:

1. **Resize handle** — a thin drag bar at the top
2. **Per-check parameters bar** (conditional) — shown only when a single check with parameters is selected
3. **Tab bar** — title + Results tab + SQL tab + action buttons (Copy Results, Copy SQL, Close)
4. **Body** — scrollable content area showing either results table or highlighted SQL

#### Per-Check Parameters Bar

```
<Stack direction="row" align="center" gap={3} wrap className="bg-surface-elevated border-b px-3 py-2">
  <Text size="2xs" weight={600} uppercase className="text-accent">Check Params</Text>
  {check.parameters.map(p => (
    <ParamGroup key={p.id} label={p.label}>
      <NumberInput
        value={paramValues[p.id]}
        min={p.min} max={p.max} step={p.step}
        title={p.description}
        onChange={v => setCheckParam(check.id, p.id, v)}
      />
    </ParamGroup>
  ))}
</Stack>
```

This bar appears between the resize handle and the tab row. It uses a slightly elevated background (`surface-elevated`) and the label is accent-colored to distinguish it from the global param bar. When a per-check parameter changes, the SQL pane updates immediately to show the new substituted SQL.

**Keyboard:** pressing Enter while focused on a per-check param field triggers a run of the active check.

#### Results Tab

When a check has been run:
```
<Stack direction="column" gap={1}>
  <ResultsHeader status="PASS" detail="4 curves validated" rowCount={8} duration="2.4s" />
  <Table size="xs">
    {/* Columns from check.resultColumns with type-based formatting */}
    {/* Status cells render as StatusPill */}
    {/* Number cells right-aligned, mono font */}
  </Table>
</Stack>
```

When not yet run:
```
<EmptyState>Check has not been run yet. Click Run to execute with the current parameters.</EmptyState>
```

When zero rows returned (pass):
```
<EmptyState className="text-green">No issues found — all records pass validation.</EmptyState>
```

#### SQL Tab

```
<CodeBlock language="sql" className="mx-2">
  {highlightedSql}
</CodeBlock>
```

SQL syntax highlighting classes: `.sql-kw` (accent), `.sql-fn` (violet), `.sql-str` (green), `.sql-comment` (muted italic), `.sql-num` (amber), `.sql-param` (amber bold).

In the prototype, `@param` tokens are shown in amber bold. After parameter substitution, the actual values are shown as string/number literals.

#### Multi-Select Summary

When multiple checks are selected via checkboxes, the Results tab shows a summary table:

| # | Check Name | Category | Result | Details | Duration |
|---|------------|----------|--------|---------|----------|

Clicking a row in the summary drills into that individual check's detail view.

---

## 5. Parameter Handling

### Two-tier parameter model

**Global parameters** are always visible in the param bar and apply to every check:
- `cob` (date) — COB date, defaults to today
- `environment` (select) — PROD/UAT/TST1/TST2
- `book` (select) — ALL/GLNG/GLNG-SPOT/GLNG-TERM
- `benchmark` (select) — ALL/JKM/TTF/HH/Brent/NBP/JCC

These should be reflected in the URL as query parameters: `?cob=2026-05-07&env=PROD&book=ALL&benchmark=ALL`. Changing them updates the URL without a page reload.

**Per-check parameters** are specific to each check definition and shown inline in the detail panel when that check is selected. They have typed defaults, min/max constraints, and descriptions. Examples:
- Check #3 (Stale Price Detection): `staleness_threshold_hours` = 24
- Check #7 (Credit Limit Validation): `utilisation_warning_pct` = 80
- Check #12 (EOD Completeness): `max_step_duration_sec` = 300

Per-check parameters are NOT in the URL. They are sent in the POST body when running a check and stored in React component state.

### Presets

Presets are named global parameter combinations. Clicking a preset populates all global parameter fields. Presets do not affect per-check parameters.

### Parameter flow when running a check

```
POST /api/support/sql-checks/3/run
{
  "globalParams": {
    "cob": "2026-05-07",          // from URL / param bar
    "environment": "PROD",         // from URL / param bar
    "book": "ALL",                 // from URL / param bar
    "benchmark": "ALL"             // from URL / param bar
  },
  "checkParams": {
    "staleness_threshold_hours": 48  // from per-check param UI (user changed from default 24)
  }
}
```

The server merges global + check params, substitutes all `@paramName` tokens in the SQL template using parameterised queries, and executes.

---

## 6. Real-Time Behaviour

### Single Check Run

1. User clicks "Run" button on check row (or presses Enter in per-check param field)
2. **Immediately:** The Result cell for that row shows an animated spinner with "Running" text. No other rows are affected.
3. **API call:** `POST /api/support/sql-checks/{id}/run` with current global + per-check params
4. **On response:**
   - Spinner is replaced with a `StatusPill` showing PASS/WARN/FAIL
   - Last Run time updates to current HH:MM:SS
   - Duration column shows the execution time
   - Details column shows the summary text
   - Detail panel opens to the Results tab for this check
   - Summary bar updates (X pass, Y warn, Z fail)
   - A toast notification appears: "#3 Stale Price Detection: WARN"

### Batch Run (Run All / Run Selected)

1. User clicks "Run All Checks" or "Run Selected"
2. **Immediately:** All affected rows show spinners simultaneously
3. **API call:** `POST /api/support/sql-checks/run-batch` or individual calls in parallel
4. **As each check completes:**
   - Its row updates from spinner to status badge
   - Summary bar updates progressively
5. **When all complete:**
   - Detail panel shows the multi-select summary table
   - A final toast or summary notification
   - Last Run timestamp updates

### SQL Preview Updates

When the user changes a global parameter (COB, Book, etc.) or a per-check parameter while the SQL tab is visible:
- The SQL pane updates immediately to show the new substituted SQL
- No API call is made — this is client-side template substitution for preview only
- The actual execution uses server-side parameterised queries

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Ctrl/Cmd + Enter | Run all checks |
| Escape | Close detail panel |
| Enter (in per-check param field) | Run the active check |
| Tab | Navigate through form fields and buttons |

---

## 7. Implementation Notes

### Do copy from the prototype
- The visual layout and density (compact rows, tiny labels, mono fonts for data)
- The two-tier parameter model (global bar + per-check inline)
- The preset bar pattern
- The detail panel with Results | SQL tabs and resize handle
- The event delegation pattern on the tbody for clean button handling
- The SQL syntax highlighting approach (keyword/function/string/comment/param classes)
- The status badge colour mapping (green=PASS, amber=WARN, red=FAIL)

### Do NOT copy from the prototype
- `shell.js` / `initShell()` — the production app has its own shell
- Tailwind CDN — production uses a build pipeline
- Mock data / `mockResult()` functions — production hits real APIs
- Inline `onclick` handlers — use React event handlers
- The `sql()` function approach — production uses `sqlTemplate` strings with `@param` substitution server-side
- `setTimeout` for simulating network delay

### State management
- Global params: URL search params (synced via React Router)
- Per-check param overrides: `useState` or Zustand slice, keyed by check ID
- Check results: React Query cache, keyed by `[checkId, globalParams, checkParams]`
- Active check / selected checks: local component state
- Running checks: derived from React Query's `isFetching` state per check
