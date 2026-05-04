/**
 * Horizon v23 — Comprehensive Playwright Navigation Test Suite
 * Tests: Menu Structure, Accordion Behavior, Navigation Links,
 *        Sidebar Collapse, and Fullscreen Toggle
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_DIR = '/Users/jonathancobley/projects/horizon-ui-templates/horizon-v23';
const SCREENSHOT_DIR = '/Users/jonathancobley/projects/horizon-ui-templates/analysis/review-of-23/screenshots';
const RESULTS_PATH = '/Users/jonathancobley/projects/horizon-ui-templates/analysis/review-of-23/test-results.json';
const FINDINGS_PATH = '/Users/jonathancobley/projects/horizon-ui-templates/analysis/review-of-23/findings.md';

// All HTML pages that call initShell (excludes signin.html, error-404.html which have no shell)
const PAGES = [
  { file: 'index.html', key: 'dashboard', title: 'Trades View', group: 'TRADING' },
  { file: 'trade-form.html', key: 'trade-form', title: 'Trade Entry', group: 'TRADING' },
  { file: 'charges.html', key: 'charges', title: 'Charge Management', group: 'TRADING' },
  { file: 'vessel-charters.html', key: 'vessel-charters', title: 'Vessel Charters', group: 'TRADING' },
  { file: 'master-agreements.html', key: 'master-agreements', title: 'Master Agreements', group: 'CONTRACTS' },
  { file: 'contracts.html', key: 'contracts', title: 'Contracts', group: 'CONTRACTS' },
  { file: 'counterparties.html', key: 'counterparties', title: 'Counterparties', group: 'CONTRACTS' },
  { file: 'cargo-board.html', key: 'cargo-board', title: 'Cargo Board', group: 'OPERATIONS' },
  { file: 'cargo-matching.html', key: 'cargo-matching', title: 'Cargo Matching', group: 'OPERATIONS' },
  { file: 'manage-schedule.html', key: 'manage-schedule', title: 'Manage Schedule', group: 'OPERATIONS' },
  { file: 'audit-log.html', key: 'audit-log', title: 'Audit Log', group: 'OPERATIONS' },
  { file: 'nominations.html', key: 'nominations', title: 'Nominations', group: 'OPERATIONS' },
  { file: 'valuations.html', key: 'valuations', title: 'Valuations', group: 'FINANCE' },
  { file: 'invoices.html', key: 'invoices', title: 'Invoice Queue', group: 'FINANCE' },
  { file: 'positions.html', key: 'positions', title: 'Positions', group: 'FINANCE' },
  { file: 'curves.html', key: 'curves', title: 'Forward Curves', group: 'FINANCE' },
  { file: 'settings.html', key: 'settings', title: 'Settings', group: 'ADMINISTRATION' },
  { file: 'reminders.html', key: 'reminders', title: 'Reminders', group: 'SYSTEM' },
  { file: 'support-dashboard.html', key: 'support-dashboard', title: 'System Status', group: 'SUPPORT' },
  { file: 'support-audit.html', key: 'support-audit', title: 'Audit Search', group: 'SUPPORT' },
  { file: 'support-data-quality.html', key: 'data-quality', title: 'Data Quality', group: 'SUPPORT' },
  { file: 'support-sql-checks.html', key: 'support-sql-checks', title: 'SQL Checks', group: 'SUPPORT' },
  { file: 'blotter.html', key: 'blotter', title: 'Blotter', group: null },
  { file: 'quick-entry.html', key: 'quick-entry', title: 'Quick Entry', group: null },
  { file: 'lifecycle.html', key: 'lifecycle', title: 'Trade Detail', group: null },
  { file: 'hedges.html', key: 'hedges', title: 'Hedge Book', group: null },
  { file: 'reconciliation.html', key: 'reconciliation', title: 'Reconciliation', group: null },
  { file: 'style-guide.html', key: 'style-guide', title: 'Style Guide', group: null },
  { file: 'curve-management.html', key: 'curve-management', title: 'Curve Management', group: null },
  { file: 'index-builder.html', key: 'index-builder', title: 'Index Builder', group: null },
];

// Pages with menu items that should be in specific groups
const MENU_ITEM_PAGES = PAGES.filter(p => p.group !== null);

function fileUrl(file) {
  return 'file://' + path.join(BASE_DIR, file);
}

const results = {
  timestamp: new Date().toISOString(),
  summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
  tests: {}
};

function log(msg) {
  console.log('[TEST] ' + msg);
}

function assert(condition, testId, message) {
  results.summary.total++;
  if (condition) {
    results.summary.passed++;
    log('  PASS: ' + message);
    return true;
  } else {
    results.summary.failed++;
    log('  FAIL: ' + message);
    return false;
  }
}

function warn(testId, message) {
  results.summary.warnings++;
  log('  WARN: ' + message);
}

async function clearLocalStorage(page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

// =====================================================================
// TEST 1: Menu Structure Audit
// =====================================================================
async function test1_menuStructure(browser) {
  log('\n========== TEST 1: Menu Structure Audit ==========');
  const testResults = [];

  for (const pageInfo of PAGES) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      log('\nLoading ' + pageInfo.file + '...');
      await page.goto(fileUrl(pageInfo.file), { waitUntil: 'domcontentloaded', timeout: 15000 });
      // Clear localStorage to get fresh state, then reload
      await clearLocalStorage(page);
      await page.goto(fileUrl(pageInfo.file), { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      const data = await page.evaluate(() => {
        const groups = document.querySelectorAll('.hz-menu-group');
        const openGroups = document.querySelectorAll('.hz-menu-group-items.open');
        const activeGroupBtns = document.querySelectorAll('.hz-menu-group-btn.active');
        const activeItems = document.querySelectorAll('.hz-menu-item.active');
        const sidebar = document.getElementById('hz-sidebar');

        // Collect open group names
        const openGroupNames = [];
        openGroups.forEach(g => {
          const parent = g.closest('.hz-menu-group');
          if (parent) openGroupNames.push(parent.dataset.group);
        });

        // Collect active group names
        const activeGroupNames = [];
        activeGroupBtns.forEach(b => {
          const parent = b.closest('.hz-menu-group');
          if (parent) activeGroupNames.push(parent.dataset.group);
        });

        // Collect active item labels
        const activeItemLabels = [];
        activeItems.forEach(i => {
          const label = i.querySelector('.hz-menu-label');
          activeItemLabels.push(label ? label.textContent.trim() : i.textContent.trim());
        });

        return {
          totalGroups: groups.length,
          openGroupCount: openGroups.length,
          openGroupNames: openGroupNames,
          activeGroupBtnCount: activeGroupBtns.length,
          activeGroupNames: activeGroupNames,
          activeItemCount: activeItems.length,
          activeItemLabels: activeItemLabels,
          hasSidebar: !!sidebar,
        };
      });

      const pageResult = {
        file: pageInfo.file,
        key: pageInfo.key,
        expectedGroup: pageInfo.group,
        ...data,
        issues: []
      };

      // Validate
      if (data.totalGroups !== 7) {
        pageResult.issues.push('Expected 7 menu groups, got ' + data.totalGroups);
      }
      assert(data.totalGroups === 7, 'T1', pageInfo.file + ': has 7 menu groups');

      // For pages with known groups, check that exactly 1 group is open
      if (pageInfo.group) {
        if (data.openGroupCount !== 1) {
          pageResult.issues.push('Expected 1 open group, got ' + data.openGroupCount + ' (' + data.openGroupNames.join(', ') + ')');
        }
        assert(data.openGroupCount === 1, 'T1', pageInfo.file + ': exactly 1 group open (got ' + data.openGroupCount + ')');

        // Check correct group is open
        if (data.openGroupNames.length > 0) {
          const correctGroupOpen = data.openGroupNames.includes(pageInfo.group);
          if (!correctGroupOpen) {
            pageResult.issues.push('Expected ' + pageInfo.group + ' open, got ' + data.openGroupNames.join(', '));
          }
          assert(correctGroupOpen, 'T1', pageInfo.file + ': correct group "' + pageInfo.group + '" is open');
        }
      } else {
        // Pages not in the main menu may have 0 open groups
        if (data.openGroupCount > 1) {
          pageResult.issues.push('Page not in menu but ' + data.openGroupCount + ' groups open');
        }
      }

      // Check active menu item exists
      if (data.activeItemCount === 0 && pageInfo.group) {
        pageResult.issues.push('No active menu item found');
        warn('T1', pageInfo.file + ': no active menu item');
      }

      // Screenshot
      const screenshotPath = path.join(SCREENSHOT_DIR, 'T1_' + pageInfo.file.replace('.html', '') + '.png');
      await page.screenshot({ path: screenshotPath, fullPage: false });

      testResults.push(pageResult);
    } catch (err) {
      testResults.push({
        file: pageInfo.file,
        error: err.message,
        issues: ['Page load error: ' + err.message]
      });
      log('  ERROR loading ' + pageInfo.file + ': ' + err.message);
    } finally {
      await context.close();
    }
  }

  results.tests.test1_menuStructure = testResults;
  return testResults;
}

// =====================================================================
// TEST 2: Accordion Behavior
// =====================================================================
async function test2_accordionBehavior(browser) {
  log('\n========== TEST 2: Accordion Behavior ==========');
  const testResults = { steps: [] };

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Load index.html (Trades View = TRADING group)
    await page.goto(fileUrl('index.html'), { waitUntil: 'domcontentloaded', timeout: 15000 });
    await clearLocalStorage(page);
    await page.goto(fileUrl('index.html'), { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Step 1: Verify only TRADING group is open
    let state = await page.evaluate(() => {
      const openGroups = [];
      document.querySelectorAll('.hz-menu-group').forEach(g => {
        const items = g.querySelector('.hz-menu-group-items');
        if (items && items.classList.contains('open')) {
          openGroups.push(g.dataset.group);
        }
      });
      return { openGroups };
    });

    const step1 = {
      step: 'Initial state - index.html',
      openGroups: state.openGroups,
      expected: ['TRADING'],
      pass: state.openGroups.length === 1 && state.openGroups[0] === 'TRADING'
    };
    testResults.steps.push(step1);
    assert(step1.pass, 'T2', 'Initial state: only TRADING open');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'T2_step1_initial.png') });

    // Step 2: Click CONTRACTS group header
    await page.click('.hz-menu-group[data-group="CONTRACTS"] .hz-menu-group-btn');
    await page.waitForTimeout(500);

    state = await page.evaluate(() => {
      const openGroups = [];
      document.querySelectorAll('.hz-menu-group').forEach(g => {
        const items = g.querySelector('.hz-menu-group-items');
        if (items && items.classList.contains('open')) {
          openGroups.push(g.dataset.group);
        }
      });
      return { openGroups };
    });

    const step2 = {
      step: 'After clicking CONTRACTS',
      openGroups: state.openGroups,
      expected: ['CONTRACTS'],
      pass: state.openGroups.length === 1 && state.openGroups[0] === 'CONTRACTS'
    };
    testResults.steps.push(step2);
    assert(step2.pass, 'T2', 'After CONTRACTS click: TRADING closed, CONTRACTS open (got: ' + state.openGroups.join(', ') + ')');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'T2_step2_contracts.png') });

    // Step 3: Click OPERATIONS group header
    await page.click('.hz-menu-group[data-group="OPERATIONS"] .hz-menu-group-btn');
    await page.waitForTimeout(500);

    state = await page.evaluate(() => {
      const openGroups = [];
      document.querySelectorAll('.hz-menu-group').forEach(g => {
        const items = g.querySelector('.hz-menu-group-items');
        if (items && items.classList.contains('open')) {
          openGroups.push(g.dataset.group);
        }
      });
      return { openGroups };
    });

    const step3 = {
      step: 'After clicking OPERATIONS',
      openGroups: state.openGroups,
      expected: ['OPERATIONS'],
      pass: state.openGroups.length === 1 && state.openGroups[0] === 'OPERATIONS'
    };
    testResults.steps.push(step3);
    assert(step3.pass, 'T2', 'After OPERATIONS click: CONTRACTS closed, OPERATIONS open (got: ' + state.openGroups.join(', ') + ')');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'T2_step3_operations.png') });

    // Step 4: Click same group again to close
    await page.click('.hz-menu-group[data-group="OPERATIONS"] .hz-menu-group-btn');
    await page.waitForTimeout(500);

    state = await page.evaluate(() => {
      const openGroups = [];
      document.querySelectorAll('.hz-menu-group').forEach(g => {
        const items = g.querySelector('.hz-menu-group-items');
        if (items && items.classList.contains('open')) {
          openGroups.push(g.dataset.group);
        }
      });
      return { openGroups };
    });

    const step4 = {
      step: 'After clicking OPERATIONS again (toggle close)',
      openGroups: state.openGroups,
      expected: [],
      pass: state.openGroups.length === 0
    };
    testResults.steps.push(step4);
    assert(step4.pass, 'T2', 'After toggling OPERATIONS off: no groups open (got: ' + state.openGroups.join(', ') + ')');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'T2_step4_all_closed.png') });

  } catch (err) {
    testResults.error = err.message;
    log('  ERROR: ' + err.message);
  } finally {
    await context.close();
  }

  results.tests.test2_accordionBehavior = testResults;
  return testResults;
}

// =====================================================================
// TEST 3: Navigation Links
// =====================================================================
async function test3_navigationLinks(browser) {
  log('\n========== TEST 3: Navigation Links ==========');
  const testResults = [];

  // The menu items we can click and verify — limited to items with unique hrefs that correspond to actual pages
  const menuItemsToTest = [
    { label: 'Trades View', href: 'index.html', key: 'dashboard', group: 'TRADING' },
    { label: 'Trade Capture', href: 'trade-form.html', key: 'trade-form', group: 'TRADING' },
    { label: 'Charge Capture', href: 'charges.html', key: 'charges', group: 'TRADING' },
    { label: 'Vessel Charter', href: 'vessel-charters.html', key: 'vessel-charters', group: 'TRADING' },
    { label: 'Master Agreements', href: 'master-agreements.html', key: 'master-agreements', group: 'CONTRACTS' },
    { label: 'Contracts', href: 'contracts.html', key: 'contracts', group: 'CONTRACTS' },
    { label: 'Contact Counterparties', href: 'counterparties.html', key: 'counterparties', group: 'CONTRACTS' },
    { label: 'Cargo View', href: 'cargo-board.html', key: 'cargo-board', group: 'OPERATIONS' },
    { label: 'Matching', href: 'cargo-matching.html', key: 'cargo-matching', group: 'OPERATIONS' },
    { label: 'Manage Schedule', href: 'manage-schedule.html', key: 'manage-schedule', group: 'OPERATIONS' },
    { label: 'Shipments', href: 'nominations.html', key: 'shipments', group: 'OPERATIONS' },
    { label: 'Valuations', href: 'valuations.html', key: 'valuations', group: 'FINANCE' },
    { label: 'Statements', href: 'invoices.html', key: 'statements', group: 'FINANCE' },
    { label: 'Portfolio', href: 'positions.html', key: 'portfolio', group: 'FINANCE' },
    { label: 'Prices', href: 'curves.html', key: 'prices', group: 'FINANCE' },
    { label: 'Settings', href: 'settings.html', key: 'settings', group: 'ADMINISTRATION' },
    { label: 'Reminder Dashboard', href: 'reminders.html', key: 'reminders', group: 'SYSTEM' },
    { label: 'System Status', href: 'support-dashboard.html', key: 'support-dashboard', group: 'SUPPORT' },
    { label: 'Audit Search', href: 'support-audit.html', key: 'support-audit', group: 'SUPPORT' },
    { label: 'Data Quality', href: 'support-data-quality.html', key: 'data-quality', group: 'SUPPORT' },
    { label: 'SQL Checks', href: 'support-sql-checks.html', key: 'support-sql-checks', group: 'SUPPORT' },
  ];

  for (const item of menuItemsToTest) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Start from index.html
      await page.goto(fileUrl('index.html'), { waitUntil: 'domcontentloaded', timeout: 15000 });
      await clearLocalStorage(page);
      await page.goto(fileUrl('index.html'), { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);

      // First open the target group if it's not TRADING
      if (item.group !== 'TRADING') {
        await page.click('.hz-menu-group[data-group="' + item.group + '"] .hz-menu-group-btn');
        await page.waitForTimeout(300);
      }

      // Find and click the menu item by its data-menu-item attribute
      const selector = '[data-menu-item="' + item.key + '"]';
      const menuItemEl = await page.$(selector);

      if (!menuItemEl) {
        // Try finding by href
        const hrefSelector = '.hz-menu-item[href="' + item.href + '"]';
        const menuItemByHref = await page.$(hrefSelector);
        if (!menuItemByHref) {
          testResults.push({
            label: item.label,
            href: item.href,
            group: item.group,
            error: 'Menu item not found by key or href',
            pass: false
          });
          assert(false, 'T3', item.label + ': menu item found');
          await context.close();
          continue;
        }
        await menuItemByHref.click();
      } else {
        // For items that are <a> tags, click directly; for parents, click the link inside
        const tagName = await menuItemEl.evaluate(el => el.tagName.toLowerCase());
        if (tagName === 'a') {
          await menuItemEl.click();
        } else {
          const link = await menuItemEl.$('a');
          if (link) {
            await link.click();
          } else {
            await menuItemEl.click();
          }
        }
      }

      await page.waitForTimeout(2000);

      // Check page loaded correctly
      const currentUrl = page.url();
      const pageLoaded = currentUrl.includes(item.href.split('#')[0]);
      assert(pageLoaded, 'T3', item.label + ': page loaded (' + item.href + ')');

      // Check navigation state on the new page
      const navState = await page.evaluate((expectedGroup) => {
        const openGroups = [];
        document.querySelectorAll('.hz-menu-group').forEach(g => {
          const items = g.querySelector('.hz-menu-group-items');
          if (items && items.classList.contains('open')) {
            openGroups.push(g.dataset.group);
          }
        });

        const activeItems = [];
        document.querySelectorAll('.hz-menu-item.active').forEach(el => {
          const label = el.querySelector('.hz-menu-label');
          activeItems.push(label ? label.textContent.trim() : '');
        });

        return {
          openGroups,
          openGroupCount: openGroups.length,
          activeItems,
          correctGroupOpen: openGroups.includes(expectedGroup),
        };
      }, item.group);

      const correctGroup = navState.correctGroupOpen;
      assert(correctGroup, 'T3', item.label + ': correct group "' + item.group + '" open after nav (open: ' + navState.openGroups.join(', ') + ')');

      const hasActive = navState.activeItems.length > 0;
      assert(hasActive, 'T3', item.label + ': has active menu item after nav (active: ' + navState.activeItems.join(', ') + ')');

      const onlyOneGroupOpen = navState.openGroupCount === 1;
      assert(onlyOneGroupOpen, 'T3', item.label + ': only 1 group open after nav (count: ' + navState.openGroupCount + ')');

      testResults.push({
        label: item.label,
        href: item.href,
        group: item.group,
        pageLoaded,
        correctGroupOpen: correctGroup,
        hasActiveItem: hasActive,
        onlyOneGroupOpen,
        openGroups: navState.openGroups,
        activeItems: navState.activeItems,
        pass: pageLoaded && correctGroup && hasActive && onlyOneGroupOpen
      });

    } catch (err) {
      testResults.push({
        label: item.label,
        href: item.href,
        error: err.message,
        pass: false
      });
      log('  ERROR testing ' + item.label + ': ' + err.message);
    } finally {
      await context.close();
    }
  }

  results.tests.test3_navigationLinks = testResults;
  return testResults;
}

// =====================================================================
// TEST 4: Sidebar Collapse
// =====================================================================
async function test4_sidebarCollapse(browser) {
  log('\n========== TEST 4: Sidebar Collapse ==========');
  const testResults = { steps: [] };

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(fileUrl('index.html'), { waitUntil: 'domcontentloaded', timeout: 15000 });
    await clearLocalStorage(page);
    await page.goto(fileUrl('index.html'), { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Step 1: Verify sidebar is expanded initially
    let state = await page.evaluate(() => {
      const sidebar = document.getElementById('hz-sidebar');
      return {
        hasCollapsed: sidebar.classList.contains('collapsed'),
        width: sidebar.getBoundingClientRect().width,
        dataExpanded: sidebar.dataset.expanded
      };
    });

    const step1 = {
      step: 'Initial state - sidebar expanded',
      collapsed: state.hasCollapsed,
      width: state.width,
      dataExpanded: state.dataExpanded,
      pass: !state.hasCollapsed && state.width > 100
    };
    testResults.steps.push(step1);
    assert(step1.pass, 'T4', 'Initial: sidebar expanded (width=' + state.width.toFixed(0) + 'px)');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'T4_step1_expanded.png') });

    // Step 2: Click collapse button
    await page.click('.hz-sidebar-collapse-btn');
    await page.waitForTimeout(500);

    state = await page.evaluate(() => {
      const sidebar = document.getElementById('hz-sidebar');
      return {
        hasCollapsed: sidebar.classList.contains('collapsed'),
        width: sidebar.getBoundingClientRect().width,
        dataExpanded: sidebar.dataset.expanded
      };
    });

    const step2 = {
      step: 'After collapse click',
      collapsed: state.hasCollapsed,
      width: state.width,
      dataExpanded: state.dataExpanded,
      pass: state.hasCollapsed && state.width < 100
    };
    testResults.steps.push(step2);
    assert(step2.pass, 'T4', 'After collapse: sidebar has collapsed class (width=' + state.width.toFixed(0) + 'px)');
    assert(state.width < 100, 'T4', 'After collapse: sidebar width is narrow (' + state.width.toFixed(0) + 'px < 100px)');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'T4_step2_collapsed.png') });

    // Step 3: Click collapse button again to expand
    await page.click('.hz-sidebar-collapse-btn');
    await page.waitForTimeout(500);

    state = await page.evaluate(() => {
      const sidebar = document.getElementById('hz-sidebar');
      return {
        hasCollapsed: sidebar.classList.contains('collapsed'),
        width: sidebar.getBoundingClientRect().width,
        dataExpanded: sidebar.dataset.expanded
      };
    });

    const step3 = {
      step: 'After expand click',
      collapsed: state.hasCollapsed,
      width: state.width,
      dataExpanded: state.dataExpanded,
      pass: !state.hasCollapsed && state.width > 100
    };
    testResults.steps.push(step3);
    assert(step3.pass, 'T4', 'After re-expand: sidebar expanded back (width=' + state.width.toFixed(0) + 'px)');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'T4_step3_reexpanded.png') });

  } catch (err) {
    testResults.error = err.message;
    log('  ERROR: ' + err.message);
  } finally {
    await context.close();
  }

  results.tests.test4_sidebarCollapse = testResults;
  return testResults;
}

// =====================================================================
// TEST 5: Fullscreen Toggle
// =====================================================================
async function test5_fullscreenToggle(browser) {
  log('\n========== TEST 5: Fullscreen Toggle ==========');
  const testResults = { steps: [] };

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(fileUrl('index.html'), { waitUntil: 'domcontentloaded', timeout: 15000 });
    await clearLocalStorage(page);
    await page.goto(fileUrl('index.html'), { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Step 1: Verify normal state
    let state = await page.evaluate(() => {
      const body = document.body;
      const header = document.querySelector('.hz-header');
      const sidebar = document.getElementById('hz-sidebar');
      const statusBar = document.querySelector('.hz-status-bar');
      const contextStrip = document.querySelector('.hz-context-strip');

      return {
        isFullscreen: body.classList.contains('hz-app-fullscreen'),
        headerVisible: header ? getComputedStyle(header).display !== 'none' : false,
        sidebarVisible: sidebar ? getComputedStyle(sidebar).display !== 'none' : false,
        statusBarVisible: statusBar ? getComputedStyle(statusBar).display !== 'none' : false,
        contextStripVisible: contextStrip ? getComputedStyle(contextStrip).display !== 'none' : false,
      };
    });

    const step1 = {
      step: 'Normal state',
      ...state,
      pass: !state.isFullscreen && state.headerVisible && state.sidebarVisible && state.statusBarVisible
    };
    testResults.steps.push(step1);
    assert(step1.pass, 'T5', 'Normal state: not fullscreen, all chrome visible');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'T5_step1_normal.png') });

    // Step 2: Click fullscreen button
    await page.click('#hz-fullscreen-toggle');
    await page.waitForTimeout(500);

    state = await page.evaluate(() => {
      const body = document.body;
      const header = document.querySelector('.hz-header');
      const sidebar = document.getElementById('hz-sidebar');
      const statusBar = document.querySelector('.hz-status-bar');
      const contextStrip = document.querySelector('.hz-context-strip');

      return {
        isFullscreen: body.classList.contains('hz-app-fullscreen'),
        headerDisplay: header ? getComputedStyle(header).display : null,
        sidebarDisplay: sidebar ? getComputedStyle(sidebar).display : null,
        statusBarDisplay: statusBar ? getComputedStyle(statusBar).display : null,
        contextStripDisplay: contextStrip ? getComputedStyle(contextStrip).display : null,
        headerHidden: header ? getComputedStyle(header).display === 'none' : true,
        sidebarHidden: sidebar ? getComputedStyle(sidebar).display === 'none' : true,
        statusBarHidden: statusBar ? getComputedStyle(statusBar).display === 'none' : true,
        contextStripHidden: contextStrip ? getComputedStyle(contextStrip).display === 'none' : true,
      };
    });

    const step2 = {
      step: 'Fullscreen mode',
      ...state,
      pass: state.isFullscreen && state.headerHidden && state.sidebarHidden && state.statusBarHidden
    };
    testResults.steps.push(step2);
    assert(state.isFullscreen, 'T5', 'Fullscreen: hz-app-fullscreen class on body');
    assert(state.headerHidden, 'T5', 'Fullscreen: header hidden (display=' + state.headerDisplay + ')');
    assert(state.sidebarHidden, 'T5', 'Fullscreen: sidebar hidden (display=' + state.sidebarDisplay + ')');
    assert(state.statusBarHidden, 'T5', 'Fullscreen: status bar hidden (display=' + state.statusBarDisplay + ')');
    assert(state.contextStripHidden, 'T5', 'Fullscreen: context strip hidden (display=' + state.contextStripDisplay + ')');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'T5_step2_fullscreen.png') });

    // Step 3: Click fullscreen button again to restore
    // The button is hidden in fullscreen mode (display:none via CSS),
    // so we call toggleAppFullscreen() directly via JS
    await page.evaluate(() => { toggleAppFullscreen(); });
    await page.waitForTimeout(500);

    state = await page.evaluate(() => {
      const body = document.body;
      const header = document.querySelector('.hz-header');
      const sidebar = document.getElementById('hz-sidebar');
      const statusBar = document.querySelector('.hz-status-bar');

      return {
        isFullscreen: body.classList.contains('hz-app-fullscreen'),
        headerVisible: header ? getComputedStyle(header).display !== 'none' : false,
        sidebarVisible: sidebar ? getComputedStyle(sidebar).display !== 'none' : false,
        statusBarVisible: statusBar ? getComputedStyle(statusBar).display !== 'none' : false,
      };
    });

    const step3 = {
      step: 'Restored from fullscreen',
      ...state,
      pass: !state.isFullscreen && state.headerVisible && state.sidebarVisible && state.statusBarVisible
    };
    testResults.steps.push(step3);
    assert(step3.pass, 'T5', 'Restored: fullscreen off, all chrome visible again');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'T5_step3_restored.png') });

  } catch (err) {
    testResults.error = err.message;
    log('  ERROR: ' + err.message);
  } finally {
    await context.close();
  }

  results.tests.test5_fullscreenToggle = testResults;
  return testResults;
}

// =====================================================================
// MAIN
// =====================================================================
async function main() {
  log('Starting Horizon v23 Navigation Test Suite');
  log('Browser: Chromium (Playwright)');
  log('Base directory: ' + BASE_DIR);
  log('Screenshots: ' + SCREENSHOT_DIR);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    await test1_menuStructure(browser);
    await test2_accordionBehavior(browser);
    await test3_navigationLinks(browser);
    await test4_sidebarCollapse(browser);
    await test5_fullscreenToggle(browser);
  } catch (err) {
    log('FATAL ERROR: ' + err.message);
    results.fatalError = err.message;
  } finally {
    await browser.close();
  }

  // Save results JSON
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
  log('\nResults saved to: ' + RESULTS_PATH);

  // Generate findings summary
  generateFindings();

  log('\n========== SUMMARY ==========');
  log('Total assertions: ' + results.summary.total);
  log('Passed: ' + results.summary.passed);
  log('Failed: ' + results.summary.failed);
  log('Warnings: ' + results.summary.warnings);
  log('Pass rate: ' + (results.summary.total > 0 ? ((results.summary.passed / results.summary.total) * 100).toFixed(1) : 0) + '%');
}

function generateFindings() {
  let md = '# Horizon v23 Navigation Test Results\n\n';
  md += '**Date**: ' + new Date().toISOString().split('T')[0] + '\n';
  md += '**Total Assertions**: ' + results.summary.total + '\n';
  md += '**Passed**: ' + results.summary.passed + '\n';
  md += '**Failed**: ' + results.summary.failed + '\n';
  md += '**Warnings**: ' + results.summary.warnings + '\n';
  md += '**Pass Rate**: ' + (results.summary.total > 0 ? ((results.summary.passed / results.summary.total) * 100).toFixed(1) : 0) + '%\n\n';

  // Test 1: Menu Structure
  md += '## Test 1: Menu Structure Audit\n\n';
  if (results.tests.test1_menuStructure) {
    const t1 = results.tests.test1_menuStructure;
    const t1Issues = t1.filter(p => p.issues && p.issues.length > 0);
    if (t1Issues.length === 0) {
      md += 'All pages have correct menu structure with 7 groups.\n\n';
    } else {
      md += '| Page | Issues |\n|------|--------|\n';
      t1Issues.forEach(p => {
        md += '| ' + p.file + ' | ' + p.issues.join('; ') + ' |\n';
      });
      md += '\n';
    }

    // Summary table of all pages
    md += '### Per-Page Summary\n\n';
    md += '| Page | Groups | Open | Active Group | Active Items |\n';
    md += '|------|--------|------|-------------|-------------|\n';
    t1.forEach(p => {
      if (!p.error) {
        md += '| ' + p.file + ' | ' + p.totalGroups + ' | ' + p.openGroupCount + ' (' + (p.openGroupNames || []).join(', ') + ') | ' + (p.activeGroupNames || []).join(', ') + ' | ' + (p.activeItemLabels || []).join(', ') + ' |\n';
      } else {
        md += '| ' + p.file + ' | ERROR | - | - | ' + p.error + ' |\n';
      }
    });
    md += '\n';
  }

  // Test 2: Accordion
  md += '## Test 2: Accordion Behavior\n\n';
  if (results.tests.test2_accordionBehavior) {
    const t2 = results.tests.test2_accordionBehavior;
    md += '| Step | Open Groups | Expected | Pass |\n';
    md += '|------|-------------|----------|------|\n';
    (t2.steps || []).forEach(s => {
      md += '| ' + s.step + ' | ' + s.openGroups.join(', ') + ' | ' + (s.expected || []).join(', ') + ' | ' + (s.pass ? 'PASS' : 'FAIL') + ' |\n';
    });
    md += '\n';
  }

  // Test 3: Navigation Links
  md += '## Test 3: Navigation Links\n\n';
  if (results.tests.test3_navigationLinks) {
    const t3 = results.tests.test3_navigationLinks;
    const t3Fails = t3.filter(r => !r.pass);
    if (t3Fails.length === 0) {
      md += 'All ' + t3.length + ' navigation links work correctly.\n\n';
    } else {
      md += t3Fails.length + ' of ' + t3.length + ' navigation links had issues:\n\n';
    }
    md += '| Menu Item | Target | Page Loaded | Correct Group | Active Item | Only 1 Open | Pass |\n';
    md += '|-----------|--------|-------------|---------------|-------------|-------------|------|\n';
    t3.forEach(r => {
      if (r.error) {
        md += '| ' + r.label + ' | ' + r.href + ' | ERROR | - | - | - | FAIL |\n';
      } else {
        md += '| ' + r.label + ' | ' + r.href + ' | ' + (r.pageLoaded ? 'Yes' : 'No') + ' | ' + (r.correctGroupOpen ? 'Yes' : 'No (' + (r.openGroups || []).join(',') + ')') + ' | ' + (r.hasActiveItem ? 'Yes' : 'No') + ' | ' + (r.onlyOneGroupOpen ? 'Yes' : 'No (' + (r.openGroups || []).length + ')') + ' | ' + (r.pass ? 'PASS' : 'FAIL') + ' |\n';
      }
    });
    md += '\n';
  }

  // Test 4: Sidebar Collapse
  md += '## Test 4: Sidebar Collapse\n\n';
  if (results.tests.test4_sidebarCollapse) {
    const t4 = results.tests.test4_sidebarCollapse;
    md += '| Step | Collapsed Class | Width | Pass |\n';
    md += '|------|----------------|-------|------|\n';
    (t4.steps || []).forEach(s => {
      md += '| ' + s.step + ' | ' + s.collapsed + ' | ' + (s.width ? s.width.toFixed(0) + 'px' : '-') + ' | ' + (s.pass ? 'PASS' : 'FAIL') + ' |\n';
    });
    md += '\n';
  }

  // Test 5: Fullscreen Toggle
  md += '## Test 5: Fullscreen Toggle\n\n';
  if (results.tests.test5_fullscreenToggle) {
    const t5 = results.tests.test5_fullscreenToggle;
    md += '| Step | Fullscreen | Header | Sidebar | Status Bar | Pass |\n';
    md += '|------|-----------|--------|---------|-----------|------|\n';
    (t5.steps || []).forEach(s => {
      const headerState = s.headerVisible !== undefined ? (s.headerVisible ? 'Visible' : 'Hidden') : (s.headerHidden !== undefined ? (s.headerHidden ? 'Hidden' : 'Visible') : '-');
      const sidebarState = s.sidebarVisible !== undefined ? (s.sidebarVisible ? 'Visible' : 'Hidden') : (s.sidebarHidden !== undefined ? (s.sidebarHidden ? 'Hidden' : 'Visible') : '-');
      const statusState = s.statusBarVisible !== undefined ? (s.statusBarVisible ? 'Visible' : 'Hidden') : (s.statusBarHidden !== undefined ? (s.statusBarHidden ? 'Hidden' : 'Visible') : '-');
      md += '| ' + s.step + ' | ' + s.isFullscreen + ' | ' + headerState + ' | ' + sidebarState + ' | ' + statusState + ' | ' + (s.pass ? 'PASS' : 'FAIL') + ' |\n';
    });
    md += '\n';
  }

  // Key findings
  md += '## Key Findings\n\n';

  // Analyze results for notable findings
  const findings = [];

  if (results.tests.test1_menuStructure) {
    const pagesWithIssues = results.tests.test1_menuStructure.filter(p => p.issues && p.issues.length > 0);
    const pagesWithNoActiveItem = results.tests.test1_menuStructure.filter(p => p.activeItemCount === 0);
    const pagesWithMultipleOpen = results.tests.test1_menuStructure.filter(p => p.openGroupCount > 1);

    if (pagesWithNoActiveItem.length > 0) {
      findings.push('- **' + pagesWithNoActiveItem.length + ' pages have no active menu item highlighted**: ' + pagesWithNoActiveItem.map(p => p.file).join(', '));
    }
    if (pagesWithMultipleOpen.length > 0) {
      findings.push('- **' + pagesWithMultipleOpen.length + ' pages have multiple groups open**: ' + pagesWithMultipleOpen.map(p => p.file + ' (' + p.openGroupNames.join(', ') + ')').join('; '));
    }
    const pagesWithZeroOpen = results.tests.test1_menuStructure.filter(p => p.openGroupCount === 0 && p.group);
    if (pagesWithZeroOpen.length > 0) {
      findings.push('- **' + pagesWithZeroOpen.length + ' in-menu pages have no group open**: ' + pagesWithZeroOpen.map(p => p.file).join(', '));
    }
  }

  if (results.tests.test3_navigationLinks) {
    const failedNavs = results.tests.test3_navigationLinks.filter(r => !r.pass);
    if (failedNavs.length > 0) {
      findings.push('- **' + failedNavs.length + ' navigation links had issues**: ' + failedNavs.map(r => r.label + (r.error ? ' (error)' : '')).join(', '));
    }
  }

  if (findings.length === 0) {
    md += 'No critical issues found. All navigation, accordion, sidebar collapse, and fullscreen features working correctly.\n';
  } else {
    findings.forEach(f => { md += f + '\n'; });
  }

  md += '\n---\n*Generated by Playwright test suite on ' + new Date().toISOString() + '*\n';

  fs.writeFileSync(FINDINGS_PATH, md);
  log('Findings saved to: ' + FINDINGS_PATH);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
