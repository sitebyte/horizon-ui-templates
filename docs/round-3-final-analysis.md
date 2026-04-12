# Phase 2 — Round 3: Final Analysis & Build Plan

**Panel:** Sasha (UI Lead), Marcus (UX Lead), Ravi (LNG BA)
**Date:** 12 April 2026
**Status:** Final — ready for build

---

## 1. Final Recommendations

After three rounds of review, the panel agreed on the following:

### What Themes D, E, F add that A, B, C didn't have:

| Capability | Themes A-C | Themes D-F |
|-----------|-----------|-----------|
| Menu system | Single-level sidebar | Multi-level accordion with sub-items, badges, favorites |
| Collapse behavior | Basic hide/show | Smooth icon-only collapse with hover-expand, localStorage persistence |
| Form variation | One form style per theme | Quick entry strip, full form, wizard, cascading, inline grid edit |
| AG Grid depth | Display + sort/filter | Inline cell editing, full-row edit, bulk approve, context menu |
| Keyboard support | Theme toggle only | Cmd+K palette, shortcut keys, Tab order, AG Grid F2/Escape, focus rings |
| Persona awareness | Generic | Front office (D), Back office (E), Combined with role switch (F) |
| Working interactions | Sort, filter, theme toggle | Form submission, cascading lookups, inline edit, bulk approve, drill-down |

### Priority: Working Interactions Over Visual Polish

**Ravi's guidance:** "The existing themes proved the visual design. These new themes must prove the INTERACTION design. A grid that sorts is nice. A grid where I can change an invoice status without opening a form — that's what makes back-office users adopt the system. A form where I can Tab through 6 fields and hit Enter — that's what makes traders stop using Excel."

**Sasha agrees:** "I'd rather ship 8 pages with truly working AG Grid keyboard navigation than 11 pages with static mockups."

**Marcus agrees:** "The quick-entry form and the cascading nomination form are the two patterns that will differentiate this system. Get those right."

### Final Build Order

Build Theme F (Unified ETRM) first — it demonstrates everything. Then Theme D (subset focused on front office) and Theme E (subset focused on back office) can be built by selecting pages from F and applying their specific visual identity.

---

## 2. Key Interactions That Must Actually Work (JavaScript Required)

### 2.1 Quick Trade Entry (Theme D + F)
```javascript
// B/S direction toggle with keyboard
document.addEventListener('keydown', (e) => {
  if (focused on quick entry) {
    if (e.key === 'b') setDirection('buy');
    if (e.key === 's') setDirection('sell');
  }
});
// Tab order: Direction → Counterparty → Volume → Benchmark → Price → Month → Submit
// Enter key on any field: submit the form
// After submit: clear form, show success toast, refocus first field
```

### 2.2 Searchable Combobox (All Themes)
```javascript
// On input keystroke (debounced):
//   Filter the dropdown list
//   Highlight first match
//   Arrow Down to move through results
//   Enter to select
//   Escape to close dropdown
//   Tab to select and move to next field
// Show: name, country, credit indicator (green/amber/red dot)
```

### 2.3 AG Grid Inline Edit (Theme E + F)
```javascript
// Invoice queue grid:
//   Status column = select cell editor
//   Click status cell → shows dropdown
//   Select new status → cell updates, row color changes
//   Checkbox column → select multiple rows
//   "Bulk Approve" button → changes all selected to "Approved"
```

### 2.4 Cascading Form (Theme E + F)
```javascript
// Select contract → filters cargo dropdown to only cargoes under that contract
// Select cargo → pre-fills volume, delivery month, load/discharge ports
// Select vessel → shows compatibility check, auto-calculates ETA
// Each selection triggers the next field's options to update
```

### 2.5 Conditional Form Sections (All Themes)
```javascript
// Pricing basis selection:
//   "Fixed" → show price input only
//   "Hub Indexed" → show benchmark dropdown + premium + averaging period
//   "Oil Indexed" → show slope + constant
//   Smooth animate show/hide of sections
//   Formula preview updates live
```

### 2.6 Position Drill-Down (Theme D + F)
```javascript
// Click cell in position ladder
// Show popover/panel with:
//   List of trades making up that position
//   Each trade: reference, direction, volume, price, counterparty
//   Total = the cell's value
//   "View Trade" link on each row
```

### 2.7 Command Palette (All Themes)
```javascript
// Cmd+K opens overlay
// Type to fuzzy-filter items
// Arrow keys navigate
// Enter selects
// Escape closes
// Items: all nav pages + "New Trade" + "Export" + "Toggle Theme"
// Recent items section
```

### 2.8 Multi-Step Wizard (Theme E + F)
```javascript
// Step indicators at top (1/4, 2/4, etc.)
// "Next" button validates current step fields
// If validation fails: show errors, don't advance
// If passes: animate to next step
// "Back" button: return to previous step, state preserved
// Final step: review summary of all entered data
// "Submit" creates the entity
```

---

## 3. Menu Structure Implementation

### Sidebar HTML Pattern (shared across themes, styled per theme)
```html
<nav>
  <!-- Top-level group -->
  <div class="menu-group">
    <button class="menu-group-header" onclick="toggleGroup(this)">
      <span class="icon">📊</span>
      <span class="label">Trading</span>
      <span class="arrow">▸</span> <!-- rotates to ▾ when expanded -->
    </button>
    <div class="menu-group-items" data-expanded="true">
      <a href="..." class="menu-item active">Dashboard</a>
      <a href="..." class="menu-item">Quick Entry</a>
      <a href="..." class="menu-item">Blotter</a>
      <a href="..." class="menu-item">Positions</a>
      <!-- Sub-group -->
      <div class="menu-subgroup">
        <button class="menu-item" onclick="toggleGroup(this)">
          Curves & Pricing <span class="arrow">▸</span>
        </button>
        <div class="menu-group-items" data-expanded="false">
          <a href="..." class="menu-subitem">Forward Curves</a>
          <a href="..." class="menu-subitem">Spread Monitor</a>
          <a href="..." class="menu-subitem">Arb Calculator</a>
        </div>
      </div>
    </div>
  </div>

  <!-- Badge example -->
  <a href="invoices.html" class="menu-item">
    Invoice Queue
    <span class="menu-badge">3</span>
  </a>
</nav>
```

### Keyboard Navigation for Menu
```javascript
// Arrow Down: move to next visible item
// Arrow Up: move to previous visible item
// Arrow Right: expand group (if on group header)
// Arrow Left: collapse group (if on group header) or move to parent
// Enter: navigate to page (if on leaf item) or toggle group (if on header)
// Escape: collapse current group
// Home: move to first item
// End: move to last item
```

---

## 4. Responsive Strategy

All themes must work from laptop (1280px) to ultra-wide (2560px+):

### Breakpoints
- **< 768px (mobile):** Sidebar hidden, hamburger menu, single column, stacked cards
- **768-1024px (tablet):** Sidebar collapsible, 2-column grids, tables scroll horizontally
- **1024-1440px (laptop):** Sidebar visible, 3-4 column grids, full tables
- **1440px+ (desktop):** Full layout, position ladder shows 12 months, multi-panel option
- **2560px+ (ultra-wide):** Split-panel workspaces (blotter + curves side by side)

### AG Grid Responsive
- Container uses `flex: 1` to fill available width
- Column autoSize on window resize
- On mobile: hide less important columns, show key 4-5 columns only
- Pinned column (reference) stays visible at all widths

---

## 5. Final Scorecard

| Criterion | Score | Notes |
|-----------|-------|-------|
| Interaction depth | 9/10 | 8 distinct working interaction patterns specified |
| Menu system | 9/10 | Multi-level accordion with keyboard nav, badges, collapse |
| Form variation | 10/10 | 5 form patterns, each distinct, keyboard-capable |
| Front/back office split | 9/10 | Clear personas, D=front, E=back, F=unified |
| Keyboard-first design | 9/10 | Full shortcut map, AG Grid keyboard, tab order, focus rings |
| AG Grid depth | 9/10 | Sort, filter, inline edit, full-row edit, bulk approve |
| Responsive strategy | 8/10 | Mobile to ultra-wide specified |
| Build feasibility | 8/10 | Prioritize interactions. 30 pages ambitious but each builds on shared shell. |
| **Overall** | **8.9/10** | |

---

## 6. Ravi's Final Word

> "The difference between themes A-C and themes D-F is the difference between 'looks like a trading system' and 'works like a trading system'. A-C proved we can make beautiful pages. D-F must prove we can make productive pages.
>
> The three patterns I'll judge success on:
> 1. Can I enter a trade in 15 seconds using only the keyboard? (Quick entry)
> 2. Can I approve 5 invoices in 30 seconds without opening any forms? (Inline grid edit)
> 3. Can I create a nomination by just selecting a contract and the system fills in the rest? (Cascading form)
>
> If those three work, we have something real."
