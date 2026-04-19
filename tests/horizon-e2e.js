/**
 * Horizon UI Templates — End-to-End Test Suite
 *
 * Tests all key features of the consolidated Horizon theme:
 * - Navigation: sidebar groups, sub-menus, third-level, active state, split click
 * - Command palette: Ctrl+K opens, entity lookup, arrow nav, Enter executes
 * - Quick entry: B/S toggle, combobox, confirmation bar, undo
 * - AG Grid: renders rows, P&L columns, sorting, context menu
 * - Forms: conditional sections, validation, combobox keyboard
 * - Dashboard: role selector, quick action links
 * - Theme: dark/light toggle works on every page
 * - All pages: load without JS errors, have back button
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = '/Users/jonathancobley/projects/horizon-ui-templates';
const SHOTS = path.join(BASE, 'screenshots', 'tests');

let browser, passed = 0, failed = 0, errors = [];

function log(status, name, detail) {
  const icon = status === 'PASS' ? '  ✓' : '  ✗';
  console.log(`${icon} ${name}${detail ? ' — ' + detail : ''}`);
  if (status === 'PASS') passed++;
  else { failed++; errors.push(name + (detail ? ': ' + detail : '')); }
}

async function newPage(file) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  const jsErrors = [];
  pg.on('pageerror', e => jsErrors.push(e.message));
  const url = file.startsWith('http') ? file : 'file://' + path.join(BASE, file);
  await pg.goto(url, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await pg.waitForTimeout(2000);
  return { pg, ctx, jsErrors };
}

async function screenshot(pg, name) {
  await pg.screenshot({ path: path.join(SHOTS, name + '.png') });
}

(async () => {
  if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });
  browser = await chromium.launch();

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log(' HORIZON UI — E2E TEST SUITE');
  console.log('═══════════════════════════════════════════');

  // ─── TEST 1: All pages load without JS errors ───
  console.log('\n── All Pages Load ──');
  const horizonPages = fs.readdirSync(path.join(BASE, 'horizon')).filter(f => f.endsWith('.html'));
  for (const file of horizonPages) {
    const { pg, ctx, jsErrors } = await newPage('horizon/' + file);
    const bodyText = await pg.locator('body').innerText().catch(() => '');
    if (jsErrors.length > 0) {
      log('FAIL', file, 'JS error: ' + jsErrors[0].substring(0, 80));
    } else if (bodyText.length < 30) {
      log('FAIL', file, 'Page appears empty (' + bodyText.length + ' chars)');
    } else {
      log('PASS', file);
    }
    await ctx.close();
  }

  // ─── TEST 2: Sidebar navigation ───
  console.log('\n── Sidebar Navigation ──');
  {
    const { pg, ctx, jsErrors } = await newPage('horizon/index.html');

    // Sidebar exists
    const sidebar = await pg.locator('#hz-sidebar').count();
    log(sidebar > 0 ? 'PASS' : 'FAIL', 'Sidebar renders');

    // Menu groups exist
    const groups = await pg.locator('.hz-menu-group').count();
    log(groups >= 4 ? 'PASS' : 'FAIL', 'Menu groups (' + groups + ' found, need 4+)');

    // TRADING group is expanded
    const tradingItems = await pg.locator('.hz-menu-group[data-group="TRADING"] .hz-menu-group-items.open').count();
    log(tradingItems > 0 ? 'PASS' : 'FAIL', 'TRADING group auto-expanded');

    // Dashboard is active
    const activeItem = await pg.locator('.hz-menu-item.active').count();
    log(activeItem > 0 ? 'PASS' : 'FAIL', 'Active menu item highlighted');

    // Expand ADMIN group
    const adminBtn = pg.locator('.hz-menu-group-btn').filter({ hasText: 'ADMIN' });
    if (await adminBtn.count() > 0) {
      await adminBtn.click();
      await pg.waitForTimeout(300);
    }

    // Check for sub-menus with children
    const subMenus = await pg.locator('.hz-menu-sub').count();
    log(subMenus >= 2 ? 'PASS' : 'FAIL', 'Sub-menus with children (' + subMenus + ' found, need 2+)');

    // Try expanding a sub-menu (Contracts or Curves)
    const subToggle = pg.locator('.hz-menu-sub-toggle').first();
    if (await subToggle.count() > 0) {
      await subToggle.click();
      await pg.waitForTimeout(300);
      const subItems = await pg.locator('.hz-menu-sub-items.open').count();
      log(subItems > 0 ? 'PASS' : 'FAIL', 'Sub-menu expands on arrow click');
    } else {
      log('FAIL', 'No sub-menu toggle found');
    }

    // Check for third-level items
    const deepItems = await pg.locator('.hz-menu-item.sub-deep').count();
    log(deepItems > 0 ? 'PASS' : 'FAIL', 'Third-level menu items (' + deepItems + ' found)');

    await screenshot(pg, 'nav-sidebar');

    // Check sidebar collapse
    const collapseBtn = pg.locator('.hz-sidebar-toggle');
    if (await collapseBtn.count() > 0) {
      await collapseBtn.click();
      await pg.waitForTimeout(300);
      const collapsed = await pg.locator('#hz-sidebar:not(.expanded)').count();
      log(collapsed > 0 ? 'PASS' : 'FAIL', 'Sidebar collapses');
      await collapseBtn.click(); // restore
      await pg.waitForTimeout(300);
    }

    log(jsErrors.length === 0 ? 'PASS' : 'FAIL', 'No JS errors during nav tests', jsErrors.length ? jsErrors[0] : '');
    await ctx.close();
  }

  // ─── TEST 2b: Sub-menu active highlighting ───
  console.log('\n── Sub-Menu Active Highlighting ──');
  {
    // Without hash: parent is active, children are NOT (correct — no hash means no specific sub-section)
    const { pg, ctx } = await newPage('horizon/curves.html');
    const parentActive = await pg.locator('.hz-menu-item.active:not(.sub)').count();
    const childActive = await pg.locator('.hz-menu-item.sub.active').count();
    log(parentActive > 0 ? 'PASS' : 'FAIL', 'Curves parent highlighted on curves.html');
    log(childActive === 0 ? 'PASS' : 'FAIL', 'No sub-item highlighted without hash (correct)');
    await ctx.close();
  }
  {
    // WITH hash: specific child highlights
    const { pg, ctx } = await newPage('horizon/curves.html#spread-monitor');
    const childActive = await pg.locator('.hz-menu-item.sub.active').evaluateAll(els => els.map(e => e.textContent.trim()));
    log(childActive.includes('Spread Monitor') ? 'PASS' : 'FAIL', 'Spread Monitor highlights with #spread-monitor hash (' + childActive.join(',') + ')');
    await ctx.close();
  }
  {
    const { pg, ctx } = await newPage('horizon/invoices.html');
    const settlementOpen = await pg.locator('.hz-menu-group[data-group="SETTLEMENT"] .hz-menu-group-items.open').count();
    log(settlementOpen > 0 ? 'PASS' : 'FAIL', 'SETTLEMENT group auto-expanded for invoices');
    await ctx.close();
  }
  {
    const { pg, ctx } = await newPage('horizon/contracts.html');
    const adminOpen = await pg.locator('.hz-menu-group[data-group="ADMIN"] .hz-menu-group-items.open').count();
    log(adminOpen > 0 ? 'PASS' : 'FAIL', 'ADMIN group auto-expanded for contracts');
    await ctx.close();
  }

  // ─── TEST 3: Command palette ───
  console.log('\n── Command Palette ──');
  {
    const { pg, ctx, jsErrors } = await newPage('horizon/index.html');

    // Try Ctrl+K
    await pg.keyboard.press('Control+k');
    await pg.waitForTimeout(500);
    const overlayVisible = await pg.locator('#hz-cmdk-overlay').evaluate(el => el.style.display !== 'none').catch(() => false);
    log(overlayVisible ? 'PASS' : 'FAIL', 'Ctrl+K opens command palette');

    if (overlayVisible) {
      // Check entity lookup hints visible
      const hintsVisible = await pg.locator('text=trade 1003').count() > 0 ||
                           await pg.locator('text=Entity Lookup').count() > 0;
      log(hintsVisible ? 'PASS' : 'FAIL', 'Entity lookup hints shown');

      // Type entity command
      await pg.keyboard.type('trade shell');
      await pg.waitForTimeout(500);
      const results = await pg.locator('.hz-cmdk-item').count();
      log(results > 0 ? 'PASS' : 'FAIL', 'Entity search returns results (' + results + ')');
      await screenshot(pg, 'cmdk-trade-lookup');

      // Clear and try navigation command
      const cmdInput = pg.locator('#hz-cmdk-input');
      await cmdInput.fill('');
      await cmdInput.type('blotter');
      await pg.waitForTimeout(300);
      const navResults = await pg.locator('.hz-cmdk-item').count();
      log(navResults > 0 ? 'PASS' : 'FAIL', 'Navigation search works (' + navResults + ' results)');

      // Escape closes
      await pg.keyboard.press('Escape');
      await pg.waitForTimeout(300);
      const closed = await pg.locator('#hz-cmdk-overlay').evaluate(el => el.style.display === 'none').catch(() => false);
      log(closed ? 'PASS' : 'FAIL', 'Escape closes palette');
    }

    log(jsErrors.length === 0 ? 'PASS' : 'FAIL', 'No JS errors', jsErrors.length ? jsErrors[0] : '');
    await ctx.close();
  }

  // ─── TEST 4: Quick Entry ───
  console.log('\n── Quick Entry ──');
  {
    const { pg, ctx, jsErrors } = await newPage('horizon/quick-entry.html');

    // AG Grid renders
    const agRows = await pg.locator('.ag-row').count();
    log(agRows > 0 ? 'PASS' : 'FAIL', 'AG Grid renders (' + agRows + ' rows)');

    // B/S toggle exists
    const buyBtn = pg.locator('button').filter({ hasText: /^BUY$|^B$/ }).first();
    const sellBtn = pg.locator('button').filter({ hasText: /^SELL$|^S$/ }).first();
    const hasBuySell = (await buyBtn.count()) + (await sellBtn.count()) > 0;
    log(hasBuySell ? 'PASS' : 'FAIL', 'Buy/Sell toggle exists');

    // Delivery terms (FOB/DES) exists
    const incoterm = pg.locator('select').filter({ hasText: /DES|FOB/ }).first();
    log(await incoterm.count() > 0 ? 'PASS' : 'FAIL', 'Delivery terms dropdown exists');

    await screenshot(pg, 'quick-entry');
    log(jsErrors.length === 0 ? 'PASS' : 'FAIL', 'No JS errors', jsErrors.length ? jsErrors[0] : '');
    await ctx.close();
  }

  // ─── TEST 5: Blotter AG Grid ───
  console.log('\n── Blotter ──');
  {
    const { pg, ctx, jsErrors } = await newPage('horizon/blotter.html');

    const rows = await pg.locator('.ag-row').count();
    log(rows >= 20 ? 'PASS' : 'FAIL', 'AG Grid rows (' + rows + ', need 20+)');

    // MTM column exists
    const mtmHeader = await pg.locator('.ag-header-cell-text').filter({ hasText: 'MTM' }).count();
    log(mtmHeader > 0 ? 'PASS' : 'FAIL', 'MTM column present');

    // Unrealized P&L column exists
    const pnlHeader = await pg.locator('.ag-header-cell-text').filter({ hasText: /Unreal|P&L|PnL/ }).count();
    log(pnlHeader > 0 ? 'PASS' : 'FAIL', 'Unrealized P&L column present');

    // Status filter pills exist
    const filterPills = await pg.locator('button').filter({ hasText: /Confirmed|Pending|Cancelled/ }).count();
    log(filterPills >= 2 ? 'PASS' : 'FAIL', 'Status filter pills (' + filterPills + ')');

    // Export CSV button
    const exportBtn = await pg.locator('button').filter({ hasText: /Export|CSV/ }).count();
    log(exportBtn > 0 ? 'PASS' : 'FAIL', 'Export CSV button');

    // Context menu (right-click)
    const firstRow = pg.locator('.ag-row').first();
    if (await firstRow.count() > 0) {
      await firstRow.click({ button: 'right' });
      await pg.waitForTimeout(500);
      // Check if any context menu appeared — look for individual menu item text or the popup element
      const ctxView = await pg.locator('button:has-text("View")').count();
      const ctxAmend = await pg.locator('button:has-text("Amend")').count();
      const ctxAny = await pg.evaluate(() => {
        // Check for any fixed-position element that appeared (the context menu div)
        var els = document.querySelectorAll('[style*="position: fixed"][style*="z-index"]');
        return els.length;
      });
      log((ctxView > 0 || ctxAmend > 0 || ctxAny > 0) ? 'PASS' : 'FAIL', 'Right-click context menu appears (buttons:' + (ctxView+ctxAmend) + ' popups:' + ctxAny + ')');
    }

    await screenshot(pg, 'blotter');
    log(jsErrors.length === 0 ? 'PASS' : 'FAIL', 'No JS errors', jsErrors.length ? jsErrors[0] : '');
    await ctx.close();
  }

  // ─── TEST 6: Position Ladder ───
  console.log('\n── Position Ladder ──');
  {
    const { pg, ctx, jsErrors } = await newPage('horizon/positions.html');

    // Position cells exist with green/red coloring
    const bodyText = await pg.locator('body').innerText();
    const hasWACOG = bodyText.includes('WACOG') || bodyText.includes('wacog');
    log(hasWACOG ? 'PASS' : 'FAIL', 'WACOG displayed in position ladder');

    const hasPH = bodyText.includes('P:') || bodyText.includes('Physical') || bodyText.includes('Hedge');
    log(hasPH ? 'PASS' : 'FAIL', 'Physical/Hedge split shown');

    await screenshot(pg, 'positions');
    log(jsErrors.length === 0 ? 'PASS' : 'FAIL', 'No JS errors', jsErrors.length ? jsErrors[0] : '');
    await ctx.close();
  }

  // ─── TEST 7: Trade Form ───
  console.log('\n── Trade Form ──');
  {
    const { pg, ctx, jsErrors } = await newPage('horizon/trade-form.html');

    // Direction toggle
    const directionBtns = await pg.locator('button').filter({ hasText: /BUY|SELL/ }).count();
    log(directionBtns >= 2 ? 'PASS' : 'FAIL', 'BUY/SELL direction toggle');

    // Pricing conditional sections
    const pricingBtns = await pg.locator('button').filter({ hasText: /Fixed|Hub|Oil/ }).count();
    log(pricingBtns >= 2 ? 'PASS' : 'FAIL', 'Pricing basis toggle buttons (' + pricingBtns + ')');

    // Position impact preview — check for any of the common text patterns
    const bodyText = await pg.locator('body').innerText();
    const hasPreview = bodyText.includes('Position') || bodyText.includes('Impact') || bodyText.includes('Net') || bodyText.includes('Hedge');
    log(hasPreview ? 'PASS' : 'FAIL', 'Position impact preview panel');

    await screenshot(pg, 'trade-form');
    log(jsErrors.length === 0 ? 'PASS' : 'FAIL', 'No JS errors', jsErrors.length ? jsErrors[0] : '');
    await ctx.close();
  }

  // ─── TEST 8: Contracts Wizard ───
  console.log('\n── Contracts Wizard ──');
  {
    const { pg, ctx, jsErrors } = await newPage('horizon/contracts.html');

    // Step indicator
    const steps = await pg.locator('.wiz-step-circle, .wiz-step-item, [data-step]').count();
    log(steps >= 4 ? 'PASS' : 'FAIL', 'Step indicator (' + steps + ' steps)');

    // Contract type cards visible
    const radioCards = await pg.locator('.radio-card').count();
    const cardsVisible = radioCards > 0 ? await pg.locator('.radio-card').first().isVisible() : false;
    log(cardsVisible ? 'PASS' : 'FAIL', 'Contract type radio cards visible (' + radioCards + ')');

    await screenshot(pg, 'contracts');
    log(jsErrors.length === 0 ? 'PASS' : 'FAIL', 'No JS errors', jsErrors.length ? jsErrors[0] : '');
    await ctx.close();
  }

  // ─── TEST 9: Nominations Cascade ───
  console.log('\n── Nominations ──');
  {
    const { pg, ctx, jsErrors } = await newPage('horizon/nominations.html');

    // Cascade steps visible
    const bodyText = await pg.locator('body').innerText();
    const hasCascade = bodyText.includes('Contract') && bodyText.includes('Cargo') && bodyText.includes('Vessel');
    log(hasCascade ? 'PASS' : 'FAIL', 'Cascading form steps present');

    // Schedule table
    const scheduleRows = bodyText.includes('NOM-') || bodyText.includes('Confirmed') || bodyText.includes('Submitted');
    log(scheduleRows ? 'PASS' : 'FAIL', 'Nomination schedule table present');

    await screenshot(pg, 'nominations');
    log(jsErrors.length === 0 ? 'PASS' : 'FAIL', 'No JS errors', jsErrors.length ? jsErrors[0] : '');
    await ctx.close();
  }

  // ─── TEST 10: Lifecycle Golden Path ───
  console.log('\n── Lifecycle ──');
  {
    const { pg, ctx, jsErrors } = await newPage('horizon/lifecycle.html');

    const bodyText = await pg.locator('body').innerText();
    const stages = ['Capture', 'Approv', 'Nominat', 'Load', 'Voyage', 'Discharg', 'Settlement', 'P&L'].filter(s => bodyText.includes(s));
    log(stages.length >= 6 ? 'PASS' : 'FAIL', 'Lifecycle stages (' + stages.length + '/8 found)');

    await screenshot(pg, 'lifecycle');
    log(jsErrors.length === 0 ? 'PASS' : 'FAIL', 'No JS errors', jsErrors.length ? jsErrors[0] : '');
    await ctx.close();
  }

  // ─── TEST 11: Dashboard Role Selector ───
  console.log('\n── Dashboard Roles ──');
  {
    const { pg, ctx, jsErrors } = await newPage('horizon/index.html');

    // Role selector exists
    const roleSelect = await pg.locator('#hz-role-select, .hz-role-select').count();
    log(roleSelect > 0 ? 'PASS' : 'FAIL', 'Role selector exists');

    // Quick action links exist
    const quickLinks = await pg.locator('a[href="quick-entry.html"], a[href="blotter.html"], a[href="positions.html"]').count();
    log(quickLinks >= 3 ? 'PASS' : 'FAIL', 'Quick action links (' + quickLinks + ')');

    await screenshot(pg, 'dashboard-roles');
    log(jsErrors.length === 0 ? 'PASS' : 'FAIL', 'No JS errors', jsErrors.length ? jsErrors[0] : '');
    await ctx.close();
  }

  // ─── TEST 12: Theme Toggle ───
  console.log('\n── Theme Toggle ──');
  {
    const { pg, ctx, jsErrors } = await newPage('horizon/blotter.html');

    // Get initial theme
    const initialTheme = await pg.evaluate(() => document.documentElement.getAttribute('data-theme') || 'unknown');

    // Find and click theme toggle
    const themeBtn = pg.locator('text=Theme').first();
    if (await themeBtn.count() > 0) {
      await themeBtn.click();
      await pg.waitForTimeout(500);
      const newTheme = await pg.evaluate(() => document.documentElement.getAttribute('data-theme') || 'unknown');
      log(newTheme !== initialTheme ? 'PASS' : 'FAIL', 'Theme toggle changes theme (' + initialTheme + ' → ' + newTheme + ')');
    } else {
      log('FAIL', 'Theme toggle button not found');
    }

    await ctx.close();
  }

  // ─── TEST 13: Back buttons on all pages ───
  console.log('\n── Back Buttons ──');
  {
    let backCount = 0;
    for (const file of horizonPages) {
      const content = fs.readFileSync(path.join(BASE, 'horizon', file), 'utf8');
      if (content.includes('All Themes') || content.includes('../index.html')) backCount++;
    }
    log(backCount === horizonPages.length ? 'PASS' : 'FAIL',
        'Back button on all pages (' + backCount + '/' + horizonPages.length + ')');
  }

  // ─── TEST 14: Invoices Inline Edit ───
  console.log('\n── Invoices ──');
  {
    const { pg, ctx, jsErrors } = await newPage('horizon/invoices.html');

    const rows = await pg.locator('.ag-row').count();
    log(rows >= 10 ? 'PASS' : 'FAIL', 'AG Grid invoice rows (' + rows + ')');

    // Bulk approve button
    const bulkBtn = await pg.locator('button').filter({ hasText: /Bulk|Approve/ }).count();
    log(bulkBtn > 0 ? 'PASS' : 'FAIL', 'Bulk approve button exists');

    await screenshot(pg, 'invoices');
    log(jsErrors.length === 0 ? 'PASS' : 'FAIL', 'No JS errors', jsErrors.length ? jsErrors[0] : '');
    await ctx.close();
  }

  // ─── TEST 15: Reconciliation ───
  console.log('\n── Reconciliation ──');
  {
    const { pg, ctx, jsErrors } = await newPage('horizon/reconciliation.html');

    const bodyText = await pg.locator('body').innerText();
    const hasSideBySide = bodyText.includes('Provisional') && bodyText.includes('Final');
    log(hasSideBySide ? 'PASS' : 'FAIL', 'Side-by-side comparison present');

    const hasTolerance = bodyText.includes('Tolerance') || bodyText.includes('tolerance');
    log(hasTolerance ? 'PASS' : 'FAIL', 'Tolerance check shown');

    await screenshot(pg, 'reconciliation');
    log(jsErrors.length === 0 ? 'PASS' : 'FAIL', 'No JS errors', jsErrors.length ? jsErrors[0] : '');
    await ctx.close();
  }

  // ═══ SUMMARY ═══
  console.log('\n═══════════════════════════════════════════');
  console.log(` RESULTS: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════');
  if (errors.length > 0) {
    console.log('\nFailed tests:');
    errors.forEach(e => console.log('  ✗ ' + e));
  }
  console.log('\nScreenshots: ' + SHOTS);
  console.log('');

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
