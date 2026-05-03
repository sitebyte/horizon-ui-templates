/* ============================================================
   HORIZON ETRM v20.0 — AI-Aware Shared Shell Builder
   Single import: initShell(activeKey, pageTitle)
   Builds: sidebar, header, cmd-k, toast, theme toggle, status bar

   IMPORTANT: Each HTML page must include the Tailwind CDN in <head>:
   <script src="https://cdn.tailwindcss.com"></script>

   Architecture:
   - Tailwind CSS handles: layout, spacing, typography, responsive
   - shell.css handles: design tokens, themes, custom components
   - All shell elements carry data-component attributes for AI parsing
   - All colors via CSS custom properties in :root (skinnable)
   ============================================================ */

/* ========== THEME ========== */
function initTheme() {
  var saved = localStorage.getItem('hz-theme') || 'dark';
  applyTheme(saved);
}
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('hz-theme', t);
  document.querySelectorAll('.ag-theme-quartz, .ag-theme-quartz-dark').forEach(function(el) {
    el.classList.remove('ag-theme-quartz', 'ag-theme-quartz-dark');
    el.classList.add(t === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz');
  });
}
function toggleTheme() {
  var cur = localStorage.getItem('hz-theme') || 'dark';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
  updateThemeIcons();
}

/* ========== ICONS ========== */
var ICONS = {
  // Navigation
  grid: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  'bar-chart-2': '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  'trending-up': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
  dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  'refresh-cw': '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  'git-merge': '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>',
  clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  // UI
  'chevron-left': '<polyline points="15 18 9 12 15 6"/>',
  'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
  'chevrons-left': '<polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/>',
  'chevrons-right': '<polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>',
  'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  'alert-triangle': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  'arrow-up': '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
  'arrow-down': '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  'plus': '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  anchor: '<circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>',
  navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  maximize: '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>',
  minimize: '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>',
};

function svg(name, size) {
  size = size || 16;
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
}

/* ========== EOS MENU (v20 — exact EOS production, zero additions) ========== */
var MENU = [
  { group: 'MASTER AGREEMENTS', defaultOpen: false, items: [
    { label: 'Master Agreements', icon: 'file-text', href: 'master-agreements.html', key: 'master-agreements' },
  ]},
  { group: 'CONTRACTS', defaultOpen: false, items: [
    { label: 'Contracts', icon: 'clipboard', href: 'contracts.html', key: 'contracts' },
  ]},
  { group: 'CONTACT COUNTERPARTIES', defaultOpen: false, items: [
    { label: 'Contact Counterparties', icon: 'users', href: 'counterparties.html', key: 'counterparties' },
  ]},
  { group: 'TRADE CAPTURE', defaultOpen: false, items: [
    { label: 'Trade Capture', icon: 'file-text', href: 'trade-form.html', key: 'trade-form' },
    { label: 'Vessel Charter', icon: 'anchor', href: 'vessel-charters.html', key: 'vessel-charters' },
  ]},
  { group: 'CHARGE CAPTURE', defaultOpen: false, items: [
    { label: 'Charge Capture', icon: 'dollar', href: 'charges.html', key: 'charges' },
  ]},
  { group: 'TRADES VIEW', defaultOpen: true, items: [
    { label: 'Trades View', icon: 'list', href: 'index.html', key: 'dashboard' },
  ]},
  { group: 'CARGO OPERATIONS', defaultOpen: false, items: [
    { label: 'Cargo View', icon: 'truck', href: 'cargo-board.html', key: 'cargo-board' },
    { label: 'Cargo Operations View', icon: 'truck', href: 'cargo-board.html#operations', key: 'cargo-ops' },
    { label: 'Matching', icon: 'git-merge', href: 'cargo-matching.html', key: 'cargo-matching', badge: { count: 4, color: 'amber' } },
    { label: 'Manage Schedule', icon: 'clock', href: 'manage-schedule.html', key: 'manage-schedule' },
    { label: 'Bunker Actualisation', icon: 'truck', href: 'vessel-charters.html#bunkers', key: 'bunkers' },
    { label: 'Vessel Usage', icon: 'anchor', href: 'vessel-charters.html#usage', key: 'vessel-usage' },
    { label: 'Cargo Audit Summary', icon: 'clock', href: 'audit-log.html', key: 'cargo-audit' },
  ]},
  { group: 'SHIPMENTS', defaultOpen: false, items: [
    { label: 'Shipments', icon: 'navigation', href: 'nominations.html', key: 'shipments' },
  ]},
  { group: 'VALUATIONS', defaultOpen: false, items: [
    { label: 'Valuations', icon: 'trending-up', href: 'valuations.html', key: 'valuations' },
  ]},
  { group: 'STATEMENTS', defaultOpen: false, items: [
    { label: 'Statements', icon: 'file-text', href: 'invoices.html', key: 'statements' },
  ]},
  { group: 'PORTFOLIO', defaultOpen: false, items: [
    { label: 'Portfolio', icon: 'bar-chart-2', href: 'positions.html', key: 'portfolio' },
  ]},
  { group: 'PRICES', defaultOpen: false, items: [
    { label: 'Prices', icon: 'trending-up', href: 'curves.html', key: 'prices' },
  ]},
  { group: 'STATIC DATA', defaultOpen: false, items: [
    {
      label: 'General', icon: 'settings', key: 'static-general', children: [
        { label: 'Manage User Tables', href: 'settings.html#user-tables', key: 'ref-user-tables' },
        { label: 'Manage Regression Reason', href: 'settings.html#regression-reason', key: 'ref-regression-reason' },
        { label: 'Manage Late Contract Reason', href: 'settings.html#late-contract', key: 'ref-late-contract' },
        { label: 'Manage Not Remit Reports', href: 'settings.html#not-remit', key: 'ref-not-remit' },
        { label: 'Manage Lookups', href: 'settings.html#lookups', key: 'ref-lookups' },
        { label: 'Manage Attributes', href: 'settings.html#attributes', key: 'ref-attributes' },
      ]
    },
    {
      label: 'Companies', icon: 'users', key: 'static-companies', children: [
        { label: 'Manage Companies', href: 'counterparties.html', key: 'ref-companies' },
        { label: 'Manage Addresses', href: 'settings.html#addresses', key: 'ref-addresses' },
        { label: 'Manage Contacts', href: 'settings.html#contacts', key: 'ref-contacts' },
        { label: 'Manage Payment Terms', href: 'settings.html#payment-terms', key: 'ref-payment-terms' },
        { label: 'Manage Bank Accounts', href: 'settings.html#bank-accounts', key: 'ref-bank-accounts' },
      ]
    },
    {
      label: 'Tax', icon: 'dollar', key: 'static-tax', children: [
        { label: 'Manage Tax Rates', href: 'settings.html#tax-rates', key: 'ref-tax-rates' },
      ]
    },
    {
      label: 'Products', icon: 'clipboard', key: 'static-products', children: [
        { label: 'Manage Products', href: 'settings.html#products', key: 'ref-products' },
        { label: 'Manage Chains', href: 'settings.html#chains', key: 'ref-chains' },
        { label: 'Manage Charge Product', href: 'settings.html#charge-products', key: 'ref-charge-products' },
      ]
    },
    {
      label: 'Prices', icon: 'trending-up', key: 'static-prices', children: [
        { label: 'Manage Curve Definitions', href: 'curve-management.html', key: 'ref-curves' },
        { label: 'Manage Price Basis', href: 'index-builder.html', key: 'ref-price-basis' },
      ]
    },
    {
      label: 'Reports', icon: 'file-text', key: 'static-reports', children: [
        { label: 'Manage Reports', href: 'settings.html#manage-reports', key: 'ref-manage-reports' },
      ]
    },
    {
      label: 'Security', icon: 'shield', key: 'static-security', children: [
        { label: 'Manage Users', href: 'settings.html#users', key: 'manage-users' },
        { label: 'Manage Roles', href: 'settings.html#roles', key: 'manage-roles' },
        { label: 'Manage Groups', href: 'settings.html#groups', key: 'manage-groups' },
      ]
    },
  ]},
  { group: 'REPORTS', defaultOpen: false, items: [
    { label: 'Reports', icon: 'file-text', href: 'settings.html#reports', key: 'reports' },
  ]},
  { group: 'DATA IMPORT', defaultOpen: false, items: [
    { label: 'Data Import', icon: 'arrow-up', href: 'settings.html#import', key: 'data-import' },
  ]},
  { group: 'SETTINGS', defaultOpen: false, items: [
    { label: 'Settings', icon: 'settings', href: 'settings.html', key: 'settings' },
  ]},
  { group: 'HELP', defaultOpen: false, items: [
    { label: 'Help', icon: 'info', href: 'settings.html#help', key: 'help' },
  ]},
  { group: 'LOGS', defaultOpen: false, items: [
    { label: 'Logs', icon: 'file-text', href: 'support-audit.html', key: 'logs' },
  ]},
  { group: 'REGULATIONS', defaultOpen: false, items: [
    { label: 'Regulations', icon: 'shield', href: 'settings.html#regulations', key: 'regulations' },
  ]},
  { group: 'REMINDERS', defaultOpen: false, items: [
    { label: 'Reminder Dashboard', icon: 'alert-circle', href: 'reminders.html', key: 'reminders' },
    { label: 'Reminder Rules', icon: 'settings', href: 'reminders.html#rules', key: 'reminder-rules' },
  ]},
  { group: 'FAQS', defaultOpen: false, items: [
    { label: 'FAQs / Documentation', icon: 'info', href: 'settings.html#faqs', key: 'faqs' },
  ]},
];

/* ========== BUILD SIDEBAR ========== */

/* Check if an item matches the active page — by key OR by href matching current URL */
function isItemActive(item, activePage) {
  if (item.key === activePage) return true;
  if (item.href) {
    var currentFile = location.pathname.split('/').pop() || 'index.html';
    var currentHash = location.hash || '';
    var itemFile = item.href.split('#')[0];
    var itemHash = item.href.includes('#') ? '#' + item.href.split('#')[1] : '';
    if (itemFile === currentFile) {
      if (itemHash) return itemHash === currentHash;
      if (!currentHash) return true;
      return true;
    }
  }
  return false;
}

/* Check if any descendant of an item matches the activePage key */
function hasActiveDescendant(item, activePage) {
  if (!item.children) return false;
  for (var i = 0; i < item.children.length; i++) {
    if (isItemActive(item.children[i], activePage)) return true;
    if (hasActiveDescendant(item.children[i], activePage)) return true;
  }
  return false;
}

/*
 * Render a single menu item recursively.
 * depth 0: icon + label + badge + arrow
 * depth 1: indented label (no icon) + arrow (if children)
 * depth 2+: double+ indented label
 * If item has children AND href: label click navigates, arrow click toggles
 * If item has children but NO href: label click toggles
 */
function renderMenuItem(item, depth, activePage, subState) {
  var html = '';
  var isActive = isItemActive(item, activePage);
  var childActive = hasActiveDescendant(item, activePage);
  var hasKids = item.children && item.children.length > 0;
  var menuItemKey = item.key || item.label.toLowerCase().replace(/\s+/g, '-');

  if (hasKids) {
    var sOpen = childActive || isActive || (subState[item.key] || false);
    var subKey = item.key || item.label.toLowerCase().replace(/\s+/g, '-');

    html += '<div class="hz-menu-sub" data-sub="' + subKey + '">';

    if (depth === 0) {
      if (item.href) {
        html += '<div class="hz-menu-item hz-menu-parent ' + (isActive || childActive ? 'active' : '') + '" data-tooltip="' + item.label + '" data-menu-item="' + menuItemKey + '">';
        html += '  <a class="hz-menu-parent-link" href="' + item.href + '" tabindex="0">';
        html += '    <span class="hz-menu-icon">' + svg(item.icon, 16) + '</span>';
        html += '    <span class="hz-menu-label">' + item.label + '</span>';
        html += '  </a>';
        if (item.badge) {
          html += '  <span class="hz-menu-badge ' + item.badge.color + '">' + item.badge.count + '</span>';
        }
        html += '  <button class="hz-menu-sub-toggle" onclick="toggleSubMenu(\'' + subKey + '\')" title="Expand ' + item.label + '" tabindex="0">';
        html += '    <span class="hz-menu-sub-arrow ' + (sOpen ? 'open' : '') + '">' + svg('chevron-right', 12) + '</span>';
        html += '  </button>';
        html += '</div>';
      } else {
        html += '<button class="hz-menu-item ' + (isActive || childActive ? 'active' : '') + '" onclick="toggleSubMenu(\'' + subKey + '\')" data-tooltip="' + item.label + '" data-menu-item="' + menuItemKey + '" tabindex="0">';
        html += '  <span class="hz-menu-icon">' + svg(item.icon, 16) + '</span>';
        html += '  <span class="hz-menu-label">' + item.label + '</span>';
        if (item.badge) {
          html += '  <span class="hz-menu-badge ' + item.badge.color + '">' + item.badge.count + '</span>';
        }
        html += '  <span class="hz-menu-sub-arrow ' + (sOpen ? 'open' : '') + '">' + svg('chevron-right', 12) + '</span>';
        html += '</button>';
      }
    } else {
      var depthClass = depth === 1 ? 'sub' : 'sub-deep';
      if (item.href) {
        html += '<div class="hz-menu-item hz-menu-parent ' + depthClass + ' ' + (isActive || childActive ? 'active' : '') + '" data-tooltip="' + item.label + '" data-menu-item="' + menuItemKey + '">';
        html += '  <a class="hz-menu-parent-link" href="' + item.href + '" tabindex="0">';
        html += '    <span class="hz-menu-icon"></span>';
        html += '    <span class="hz-menu-label">' + item.label + '</span>';
        html += '  </a>';
        if (item.badge) {
          html += '  <span class="hz-menu-badge ' + item.badge.color + '">' + item.badge.count + '</span>';
        }
        html += '  <button class="hz-menu-sub-toggle" onclick="toggleSubMenu(\'' + subKey + '\')" title="Expand ' + item.label + '" tabindex="0">';
        html += '    <span class="hz-menu-sub-arrow ' + (sOpen ? 'open' : '') + '">' + svg('chevron-right', 12) + '</span>';
        html += '  </button>';
        html += '</div>';
      } else {
        html += '<button class="hz-menu-item ' + depthClass + ' ' + (isActive || childActive ? 'active' : '') + '" onclick="toggleSubMenu(\'' + subKey + '\')" data-tooltip="' + item.label + '" data-menu-item="' + menuItemKey + '" tabindex="0">';
        html += '  <span class="hz-menu-icon"></span>';
        html += '  <span class="hz-menu-label">' + item.label + '</span>';
        if (item.badge) {
          html += '  <span class="hz-menu-badge ' + item.badge.color + '">' + item.badge.count + '</span>';
        }
        html += '  <span class="hz-menu-sub-arrow ' + (sOpen ? 'open' : '') + '">' + svg('chevron-right', 12) + '</span>';
        html += '</button>';
      }
    }

    html += '<div class="hz-menu-sub-items ' + (sOpen ? 'open' : '') + '">';
    item.children.forEach(function(child) {
      html += renderMenuItem(child, depth + 1, activePage, subState);
    });
    html += '</div>';
    html += '</div>';
  } else {
    if (depth === 0) {
      html += '<a class="hz-menu-item ' + (isActive ? 'active' : '') + '" href="' + item.href + '" data-tooltip="' + item.label + '" data-menu-item="' + menuItemKey + '" tabindex="0">';
      html += '  <span class="hz-menu-icon">' + svg(item.icon, 16) + '</span>';
      html += '  <span class="hz-menu-label">' + item.label + '</span>';
      if (item.badge) {
        html += '  <span class="hz-menu-badge ' + item.badge.color + '">' + item.badge.count + '</span>';
      }
      html += '</a>';
    } else {
      var leafClass = depth === 1 ? 'sub' : 'sub-deep';
      html += '<a class="hz-menu-item ' + leafClass + ' ' + (isActive ? 'active' : '') + '" href="' + item.href + '" data-tooltip="' + item.label + '" data-menu-item="' + menuItemKey + '" tabindex="0">';
      html += '  <span class="hz-menu-icon"></span>';
      html += '  <span class="hz-menu-label">' + item.label + '</span>';
      html += '</a>';
    }
  }

  return html;
}

function buildSidebar(activePage) {
  var sidebarState = JSON.parse(localStorage.getItem('hz-sidebar-groups') || '{}');
  var subState = JSON.parse(localStorage.getItem('hz-sidebar-subs') || '{}');
  var expanded = localStorage.getItem('hz-sidebar-expanded') !== 'false'; // default true

  var html = '<aside id="hz-sidebar" class="hz-sidebar' + (expanded ? '' : ' collapsed') + '" data-expanded="' + expanded + '" data-component="sidebar" role="navigation" aria-label="Main navigation">';

  // Sidebar Search
  html += '<div class="hz-sidebar-search">';
  html += '  <input id="hz-sidebar-search-input" placeholder="Search menu..." />';
  html += '</div>';

  // Group icon lookup (EOS-accurate)
  var GROUP_ICONS = {
    'MASTER AGREEMENTS': 'file-text', 'CONTRACTS': 'clipboard', 'COUNTERPARTIES': 'users',
    'TRADE CAPTURE': 'zap', 'CHARGE CAPTURE': 'dollar', 'TRADES VIEW': 'list',
    'CARGO OPERATIONS': 'truck', 'SHIPMENTS': 'navigation', 'VALUATIONS': 'trending-up',
    'STATEMENTS': 'dollar', 'PRICES': 'bar-chart-2', 'STATIC DATA': 'settings',
    'REPORTS': 'file-text', 'DATA IMPORT': 'arrow-up', 'SETTINGS': 'settings',
    'REMINDERS': 'alert-circle', 'SUPPORT': 'activity'
  };

  // Sidebar Nav (scrollable)
  html += '<nav class="hz-sidebar-nav">';
  MENU.forEach(function(group) {
    var gKey = group.group;
    var gOpen = sidebarState[gKey] !== undefined ? sidebarState[gKey] : group.defaultOpen;

    var groupHasActive = group.items.some(function(item) {
      return item.key === activePage || hasActiveDescendant(item, activePage);
    });
    if (groupHasActive) gOpen = true;

    var gIcon = GROUP_ICONS[gKey] || 'grid';
    html += '<div class="hz-menu-group" data-group="' + gKey + '" data-menu-group="' + gKey + '">';
    html += '  <button class="hz-menu-group-btn' + (groupHasActive ? ' active' : '') + '" onclick="toggleMenuGroup(\'' + gKey + '\')" tabindex="0" aria-expanded="' + gOpen + '">';
    html += '    <span class="hz-menu-icon">' + svg(gIcon, 14) + '</span>';
    html += '    <span class="hz-menu-group-label">' + gKey + '</span>';
    html += '    <span class="hz-menu-group-arrow ' + (gOpen ? 'open' : '') + '" style="margin-left:auto;">' + svg('chevron-right', 10) + '</span>';
    html += '  </button>';
    html += '  <div class="hz-menu-group-items ' + (gOpen ? 'open' : '') + '">';

    group.items.forEach(function(item) {
      html += renderMenuItem(item, 0, activePage, subState);
    });
    html += '  </div></div>';
  });
  html += '</nav>';

  // Sidebar Footer: User capabilities + settings + versions + collapse
  html += '<div class="hz-sidebar-footer">';

  // Settings link
  html += '  <a href="settings.html" class="hz-sidebar-footer-link">';
  html += '    <span class="hz-menu-icon">' + svg('settings', 14) + '</span>';
  html += '    <span class="hz-menu-label">Settings</span>';
  html += '  </a>';

  // User permissions summary (expandable)
  html += '  <button class="hz-sidebar-footer-link" onclick="toggleSidebarPanel(\'perms\')">';
  html += '    <span class="hz-menu-icon">' + svg('shield', 14) + '</span>';
  html += '    <span class="hz-menu-label">Permissions</span>';
  html += '    <span class="hz-menu-label" style="margin-left:auto;opacity:0.5;font-size:0.5rem;">Trader</span>';
  html += '  </button>';
  html += '  <div class="hz-sidebar-panel" id="hz-panel-perms" style="display:none;">';
  html += '    <div class="hz-sidebar-panel-content">';
  html += '      <div class="hz-sidebar-perm-item granted">Trade Capture</div>';
  html += '      <div class="hz-sidebar-perm-item granted">Trade Amendment</div>';
  html += '      <div class="hz-sidebar-perm-item granted">Position View</div>';
  html += '      <div class="hz-sidebar-perm-item granted">Curve View</div>';
  html += '      <div class="hz-sidebar-perm-item granted">Cargo Matching</div>';
  html += '      <div class="hz-sidebar-perm-item denied">Trade Cancellation</div>';
  html += '      <div class="hz-sidebar-perm-item denied">Invoice Approval</div>';
  html += '      <div class="hz-sidebar-perm-item denied">Credit Override</div>';
  html += '      <div class="hz-sidebar-perm-item denied">User Admin</div>';
  html += '    </div>';
  html += '  </div>';

  // Version info (expandable)
  html += '  <button class="hz-sidebar-footer-link" onclick="toggleSidebarPanel(\'versions\')">';
  html += '    <span class="hz-menu-icon">' + svg('info', 14) + '</span>';
  html += '    <span class="hz-menu-label">Versions</span>';
  html += '  </button>';
  html += '  <div class="hz-sidebar-panel" id="hz-panel-versions" style="display:none;">';
  html += '    <div class="hz-sidebar-panel-content">';
  html += '      <div class="hz-sidebar-version-row"><span>EOS</span><span class="font-mono">4.2.1</span></div>';
  html += '      <div class="hz-sidebar-version-row"><span>EOS.Horizon</span><span class="font-mono">1.0.17</span></div>';
  html += '      <div class="hz-sidebar-version-row"><span>EOS.Database</span><span class="font-mono">4.2.1.3847</span></div>';
  html += '      <div class="hz-sidebar-version-row"><span>AG Grid</span><span class="font-mono">31.3.2</span></div>';
  html += '      <div class="hz-sidebar-version-row"><span>Environment</span><span class="font-mono" style="color:var(--green);">PROD</span></div>';
  html += '      <div class="hz-sidebar-version-row"><span>Region</span><span class="font-mono">SGP</span></div>';
  html += '    </div>';
  html += '  </div>';

  html += '</div>'; // end footer

  // Collapse button
  html += '<button class="hz-sidebar-collapse-btn" id="hz-sidebar-toggle" onclick="toggleSidebar()" title="Cmd+B" tabindex="0">';
  html += svg(expanded ? 'chevrons-left' : 'chevrons-right', 14);
  html += '<span class="hz-menu-label" style="font-size:0.625rem;">' + (expanded ? 'Collapse' : '') + '</span>';
  html += '</button>';

  html += '</aside>';

  return html;
}

/* ========== SIDEBAR PANEL TOGGLE ========== */
function toggleSidebarPanel(id) {
  var panel = document.getElementById('hz-panel-' + id);
  if (!panel) return;
  // Close other panels
  document.querySelectorAll('.hz-sidebar-panel').forEach(function(p) {
    if (p.id !== 'hz-panel-' + id) p.style.display = 'none';
  });
  panel.style.display = panel.style.display === 'none' ? '' : 'none';
}

/* ========== SIDEBAR INTERACTIONS ========== */
function toggleSidebar() {
  var sb = document.getElementById('hz-sidebar');
  var exp = sb.dataset.expanded === 'true';
  sb.dataset.expanded = !exp;
  sb.classList.toggle('collapsed', exp);
  localStorage.setItem('hz-sidebar-expanded', !exp);
  var toggleBtn = document.getElementById('hz-sidebar-toggle');
  if (toggleBtn) {
    toggleBtn.innerHTML = svg(!exp ? 'chevrons-left' : 'chevrons-right', 16);
    toggleBtn.setAttribute('aria-label', !exp ? 'Collapse sidebar' : 'Expand sidebar');
  }
}

function toggleMenuGroup(key) {
  var state = JSON.parse(localStorage.getItem('hz-sidebar-groups') || '{}');
  var group = document.querySelector('.hz-menu-group[data-group="' + key + '"]');
  var items = group.querySelector('.hz-menu-group-items');
  var arrow = group.querySelector('.hz-menu-group-arrow');
  var btn = group.querySelector('.hz-menu-group-btn');
  var isOpen = items.classList.contains('open');
  items.classList.toggle('open', !isOpen);
  arrow.classList.toggle('open', !isOpen);
  if (btn) btn.setAttribute('aria-expanded', !isOpen);
  state[key] = !isOpen;
  localStorage.setItem('hz-sidebar-groups', JSON.stringify(state));
}

function toggleSubMenu(key) {
  var state = JSON.parse(localStorage.getItem('hz-sidebar-subs') || '{}');
  var sub = document.querySelector('.hz-menu-sub[data-sub="' + key + '"]');
  var items = sub.querySelector('.hz-menu-sub-items');
  var arrow = sub.querySelector('.hz-menu-sub-arrow');
  var isOpen = items.classList.contains('open');
  items.classList.toggle('open', !isOpen);
  arrow.classList.toggle('open', !isOpen);
  state[key] = !isOpen;
  localStorage.setItem('hz-sidebar-subs', JSON.stringify(state));
}

/* ========== SIDEBAR SEARCH FILTER ========== */
function initSidebarSearch() {
  var input = document.getElementById('hz-sidebar-search-input');
  if (!input) return;
  input.addEventListener('input', function() {
    var q = input.value.trim().toLowerCase();
    var nav = document.querySelector('.hz-sidebar-nav');
    if (!nav) return;

    // Get all menu items
    var allItems = nav.querySelectorAll('[data-menu-item]');
    var allGroups = nav.querySelectorAll('.hz-menu-group');
    var allSubs = nav.querySelectorAll('.hz-menu-sub');

    if (!q) {
      // Reset: show everything, restore original open/closed state
      allItems.forEach(function(el) { el.style.display = ''; });
      allGroups.forEach(function(g) { g.style.display = ''; });
      allSubs.forEach(function(s) { s.style.display = ''; });
      // Also show group buttons
      nav.querySelectorAll('.hz-menu-group-btn').forEach(function(b) { b.style.display = ''; });
      return;
    }

    // Filter: show matching items, hide non-matching
    allItems.forEach(function(el) {
      var label = (el.querySelector('.hz-menu-label') || el).textContent.toLowerCase();
      if (label.indexOf(q) >= 0) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // For sub-menus: show if any child item is visible
    allSubs.forEach(function(s) {
      var visibleItems = s.querySelectorAll('[data-menu-item]');
      var anyVisible = false;
      visibleItems.forEach(function(it) {
        if (it.style.display !== 'none') anyVisible = true;
      });
      s.style.display = anyVisible ? '' : 'none';
      // Open sub-items if searching
      var subItems = s.querySelector('.hz-menu-sub-items');
      if (subItems && anyVisible) subItems.classList.add('open');
    });

    // For groups: show if any child item is visible
    allGroups.forEach(function(g) {
      var visibleItems = g.querySelectorAll('[data-menu-item]');
      var anyVisible = false;
      visibleItems.forEach(function(it) {
        if (it.style.display !== 'none') anyVisible = true;
      });
      g.style.display = anyVisible ? '' : 'none';
      // Open group items if searching
      var groupItems = g.querySelector('.hz-menu-group-items');
      if (groupItems && anyVisible) groupItems.classList.add('open');
    });
  });
}

/* ========== ROLE ========== */
function setRole(role) {
  localStorage.setItem('hz-role', role);
  if (typeof onRoleChange === 'function') onRoleChange(role);
}

function getRole() {
  return localStorage.getItem('hz-role') || 'trader';
}

/* ========== HEADER ========== */
function buildHeader(pageTitle) {
  var html = '<header class="hz-header" data-component="header" role="banner">';
  html += '<div class="hz-header-left">';
  html += '  <div class="hz-header-brand">';
  html += '    <div class="hz-header-brand-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg></div>';
  html += '    <span class="hz-header-brand-text">Horizon</span>';
  html += '  </div>';
  html += '  <span class="hz-breadcrumb-page">' + (pageTitle || '') + '</span>';
  html += '</div>';
  // Ticker
  html += '<div class="hz-ticker">';
  html += '  <span class="hz-tick up"><span class="hz-tick-label">JKM</span> <span class="hz-tick-price">$14.25</span> <span class="hz-tick-delta">&#9650; 0.35</span></span>';
  html += '  <span class="hz-tick-sep">|</span>';
  html += '  <span class="hz-tick down"><span class="hz-tick-label">TTF</span> <span class="hz-tick-price">$12.80</span> <span class="hz-tick-delta">&#9660; 0.15</span></span>';
  html += '  <span class="hz-tick-sep">|</span>';
  html += '  <span class="hz-tick up"><span class="hz-tick-label">HH</span> <span class="hz-tick-price">$3.42</span> <span class="hz-tick-delta">&#9650; 0.02</span></span>';
  html += '  <span class="hz-tick-sep">|</span>';
  html += '  <span class="hz-tick up"><span class="hz-tick-label">Brent</span> <span class="hz-tick-price">$82.40</span> <span class="hz-tick-delta">&#9650; 1.20</span></span>';
  html += '</div>';
  // Right
  html += '<div class="hz-header-right">';
  html += '  <button class="hz-cmd-k-btn" onclick="openCmdK()" title="Cmd+K" tabindex="0">' + svg('search', 14) + ' <span class="hz-kbd">&#8984;K</span></button>';
  html += '  <button class="hz-notif-btn" title="Notifications" tabindex="0">' + svg('alert-circle', 14) + '<span class="hz-notif-badge">3</span></button>';
  html += '  <span class="hz-env-badge prod">PROD</span>';
  html += '  <button class="hz-theme-btn" onclick="toggleTheme()" title="Toggle theme" tabindex="0"><span class="hz-theme-icon-header">' + svg('moon', 14) + '</span></button>';
  html += '  <button class="hz-theme-btn" onclick="toggleAppFullscreen()" title="Toggle fullscreen (F11)" id="hz-fullscreen-toggle">' + svg('maximize', 14) + '</button>';
  html += '  <div class="hz-avatar" title="J. Cobley" tabindex="0" role="button" aria-label="User menu">JC</div>';
  html += '</div>';
  html += '</header>';
  return html;
}

/* ========== COMMAND PALETTE ========== */
/* ========== MOCK ENTITY DATABASE (for command-line lookup) ========== */
var MOCK_ENTITIES = {
  trades: [
    { id: 'T-1001', ref: 'BUY-2026-0411-A3F', cp: 'Shell Trading', bm: 'JKM', vol: '3,200,000', status: 'Confirmed' },
    { id: 'T-1002', ref: 'SELL-2026-0410-B7K', cp: 'JERA Co.', bm: 'TTF', vol: '2,800,000', status: 'Confirmed' },
    { id: 'T-1003', ref: 'BUY-2026-0409-C2P', cp: 'QatarEnergy', bm: 'JKM', vol: '3,200,000', status: 'Pending' },
    { id: 'T-1004', ref: 'SELL-2026-0408-D9M', cp: 'TotalEnergies', bm: 'HH', vol: '2,500,000', status: 'Confirmed' },
    { id: 'T-1005', ref: 'BUY-2026-0407-E1L', cp: 'Cheniere', bm: 'HH', vol: '5,000,000', status: 'Confirmed' },
    { id: 'T-1006', ref: 'BUY-2026-0405-F4R', cp: 'Woodside', bm: 'JKM', vol: '3,200,000', status: 'Draft' },
    { id: 'T-1007', ref: 'SELL-2026-0404-G8T', cp: 'KOGAS', bm: 'TTF', vol: '2,800,000', status: 'Confirmed' },
  ],
  invoices: [
    { id: 'INV-2026-0042', cp: 'Shell Trading', amount: '$45.6M', status: 'Pending' },
    { id: 'INV-2026-0041', cp: 'JERA Co.', amount: '$33.2M', status: 'Approved' },
    { id: 'INV-2026-0040', cp: 'QatarEnergy', amount: '$42.1M', status: 'Paid' },
    { id: 'INV-2026-0039', cp: 'TotalEnergies', amount: '$8.5M', status: 'Draft' },
  ],
  cargoes: [
    { id: 'CARGO-Q2-01', vessel: 'Al Dafna', route: 'Ras Laffan → Sodegaura', status: 'In Transit' },
    { id: 'CARGO-Q2-02', vessel: 'Seri Begawan', route: 'Ras Laffan → Incheon', status: 'Loading' },
    { id: 'CARGO-Q2-03', vessel: 'Arctic Spirit', route: 'Sabine Pass → Gate Rotterdam', status: 'Nominated' },
    { id: 'CARGO-Q3-01', vessel: 'TBN', route: 'Bonny Island → Dahej', status: 'Planning' },
  ],
  contracts: [
    { id: 'SPA-QATAR-2026', cp: 'QatarEnergy', type: 'SPA', acq: '12.8M MMBtu' },
    { id: 'SPA-SHELL-2026', cp: 'Shell Trading', type: 'SPA', acq: '9.6M MMBtu' },
    { id: 'MSA-JERA-2025', cp: 'JERA Co.', type: 'MSA', acq: '6.4M MMBtu' },
    { id: 'SPOT-TOTAL-Q2', cp: 'TotalEnergies', type: 'Spot', acq: '3.2M MMBtu' },
  ],
  nominations: [
    { id: 'NOM-2026-Q2-001', contract: 'SPA-QATAR-2026', vessel: 'Al Dafna', status: 'Confirmed' },
    { id: 'NOM-2026-Q2-002', contract: 'SPA-SHELL-2026', vessel: 'Seri Begawan', status: 'Submitted' },
    { id: 'NOM-2026-Q2-003', contract: 'SPOT-TOTAL-Q2', vessel: 'TBN', status: 'Draft' },
  ],
};

/* Parse command-line style input */
function parseEntityCommand(q) {
  q = q.trim();
  var patterns = [
    { regex: /^trade\s+(.+)/i, type: 'trades', page: 'lifecycle.html', label: 'Trade' },
    { regex: /^inv(?:oice)?\s+(.+)/i, type: 'invoices', page: 'invoices.html', label: 'Invoice' },
    { regex: /^cargo\s+(.+)/i, type: 'cargoes', page: 'cargo-board.html', label: 'Cargo' },
    { regex: /^contract\s+(.+)/i, type: 'contracts', page: 'contracts.html', label: 'Contract' },
    { regex: /^nom(?:ination)?\s+(.+)/i, type: 'nominations', page: 'nominations.html', label: 'Nomination' },
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = q.match(patterns[i].regex);
    if (m) {
      var search = m[1].toUpperCase();
      var entities = MOCK_ENTITIES[patterns[i].type];
      var results = entities.filter(function(e) {
        return e.id.toUpperCase().indexOf(search) >= 0 ||
               (e.ref && e.ref.toUpperCase().indexOf(search) >= 0) ||
               (e.cp && e.cp.toUpperCase().indexOf(search) >= 0);
      });
      return { type: patterns[i].type, label: patterns[i].label, page: patterns[i].page, search: m[1], results: results };
    }
  }
  return null;
}

var CMD_ACTIONS = [
  { label: 'Go to Dashboard', keys: 'G D', group: 'Navigate', action: function() { location.href = 'index.html'; } },
  { label: 'Go to Quick Entry', keys: 'G Q', group: 'Navigate', action: function() { location.href = 'quick-entry.html'; } },
  { label: 'Go to Trade Lifecycle', keys: 'G L', group: 'Navigate', action: function() { location.href = 'lifecycle.html'; } },
  { label: 'Go to Blotter', keys: 'G B', group: 'Navigate', action: function() { location.href = 'blotter.html'; } },
  { label: 'Go to Positions', keys: 'G P', group: 'Navigate', action: function() { location.href = 'positions.html'; } },
  { label: 'Go to Trade Form', keys: 'G T', group: 'Navigate', action: function() { location.href = 'trade-form.html'; } },
  { label: 'Go to Invoices', keys: 'G I', group: 'Navigate', action: function() { location.href = 'invoices.html'; } },
  { label: 'Go to Nominations', keys: 'G N', group: 'Navigate', action: function() { location.href = 'nominations.html'; } },
  { label: 'Go to Reconciliation', keys: 'G R', group: 'Navigate', action: function() { location.href = 'reconciliation.html'; } },
  { label: 'Go to Contracts', keys: 'G C', group: 'Navigate', action: function() { location.href = 'contracts.html'; } },
  { label: 'Go to Audit Log', keys: 'G A', group: 'Navigate', action: function() { location.href = 'audit-log.html'; } },
  { label: 'Go to Forward Curves', keys: 'G F', group: 'Navigate', action: function() { location.href = 'curves.html'; } },
  { label: 'Go to Hedge Book', keys: 'G H', group: 'Navigate', action: function() { location.href = 'hedges.html'; } },
  { label: 'Go to Cargo Board', keys: 'G G', group: 'Navigate', action: function() { location.href = 'cargo-board.html'; } },
  { label: 'Go to Settings', keys: 'G S', group: 'Navigate', action: function() { location.href = 'settings.html'; } },
  { label: 'Go to Style Guide', keys: 'G Y', group: 'Navigate', action: function() { location.href = 'style-guide.html'; } },
  { label: 'Toggle Theme', keys: 'T', group: 'Actions', action: function() { toggleTheme(); } },
  { label: 'Toggle Sidebar', keys: '\u2318B', group: 'Actions', action: function() { toggleSidebar(); } },
  { label: 'New Trade', keys: 'N', group: 'Actions', action: function() { location.href = 'quick-entry.html'; } },
  { label: 'Show Shortcuts', keys: '?', group: 'Help', action: function() { location.href = 'settings.html'; } },
];

function buildCmdK() {
  var html = '<div id="hz-cmdk-overlay" class="hz-cmdk-overlay" onclick="closeCmdK()" style="display:none" data-component="command-palette">';
  html += '  <div class="hz-cmdk" onclick="event.stopPropagation()" role="dialog" aria-label="Command palette">';
  html += '    <div class="hz-cmdk-input-wrap">';
  html += '      ' + svg('search', 16);
  html += '      <input id="hz-cmdk-input" class="hz-cmdk-input" placeholder="Type a command or search..." autocomplete="off" tabindex="0" />';
  html += '    </div>';
  html += '    <div id="hz-cmdk-list" class="hz-cmdk-list" role="listbox"></div>';
  html += '    <div class="hz-cmdk-footer">';
  html += '      <span><kbd>&#8593;&#8595;</kbd> navigate</span>';
  html += '      <span><kbd>Enter</kbd> select</span>';
  html += '      <span><kbd>Esc</kbd> close</span>';
  html += '    </div>';
  html += '  </div>';
  html += '</div>';
  return html;
}

var cmdkIdx = 0;
var cmdkFiltered = [];

function openCmdK() {
  var overlay = document.getElementById('hz-cmdk-overlay');
  overlay.style.display = 'flex';
  var input = document.getElementById('hz-cmdk-input');
  input.value = '';
  input.focus();
  cmdkIdx = 0;
  renderCmdKList('');
}

function closeCmdK() {
  document.getElementById('hz-cmdk-overlay').style.display = 'none';
}

function renderCmdKList(q) {
  var list = document.getElementById('hz-cmdk-list');

  /* --- Check for entity command --- */
  var entityResult = parseEntityCommand(q);
  if (entityResult) {
    cmdkFiltered = [];
    var html = '<div class="hz-cmdk-group-label">' + entityResult.label + ' Lookup: "' + entityResult.search.replace(/</g, '&lt;') + '"</div>';
    if (entityResult.results.length === 0) {
      html += '<div class="hz-cmdk-empty">No ' + entityResult.label.toLowerCase() + ' matching "' + entityResult.search.replace(/</g, '&lt;') + '"</div>';
      html += '<button class="hz-cmdk-item" onmouseenter="cmdkHover(0)" onclick="closeCmdK();location.href=\'' + entityResult.page + '\'" role="option"><span>Go to ' + entityResult.label + ' list instead</span><kbd>\u21B5</kbd></button>';
      cmdkFiltered.push({ label: 'Go to list', action: function() { location.href = entityResult.page; } });
    } else {
      entityResult.results.forEach(function(e, i) {
        var detail = e.ref ? e.ref : e.id;
        var sub = [];
        if (e.cp) sub.push(e.cp);
        if (e.bm) sub.push(e.bm);
        if (e.vol) sub.push(e.vol + ' MMBtu');
        if (e.amount) sub.push(e.amount);
        if (e.vessel) sub.push(e.vessel);
        if (e.route) sub.push(e.route);
        if (e.type) sub.push(e.type);
        if (e.acq) sub.push(e.acq);
        var statusCls = '';
        if (e.status === 'Confirmed' || e.status === 'Approved' || e.status === 'Paid') statusCls = 'color:var(--green)';
        else if (e.status === 'Pending' || e.status === 'Submitted' || e.status === 'In Transit' || e.status === 'Loading') statusCls = 'color:var(--accent)';
        else if (e.status === 'Draft' || e.status === 'Planning') statusCls = 'color:var(--text-muted)';

        var page = entityResult.page;
        if (entityResult.type === 'trades') page = 'lifecycle.html';

        cmdkFiltered.push({ label: detail, action: (function(p) { return function() { location.href = p; }; })(page) });

        html += '<button class="hz-cmdk-item ' + (i === cmdkIdx ? 'active' : '') + '" onmouseenter="cmdkHover(' + i + ')" onclick="cmdkExec(' + i + ')" role="option">';
        html += '<div style="display:flex;flex-direction:column;gap:0.125rem;flex:1;min-width:0">';
        html += '<div style="display:flex;align-items:center;gap:0.5rem">';
        html += '<span style="font-family:var(--font-mono);font-weight:600">' + e.id + '</span>';
        if (e.status) html += '<span style="font-size:0.6875rem;' + statusCls + '">' + e.status + '</span>';
        html += '</div>';
        html += '<span style="font-size:0.75rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + sub.join(' \u00B7 ') + '</span>';
        html += '</div>';
        html += '<kbd>\u21B5</kbd>';
        html += '</button>';
      });
    }
    var allIdx = cmdkFiltered.length;
    cmdkFiltered.push({ label: 'View all', action: function() { location.href = entityResult.page; } });
    html += '<button class="hz-cmdk-item ' + (allIdx === cmdkIdx ? 'active' : '') + '" onmouseenter="cmdkHover(' + allIdx + ')" onclick="cmdkExec(' + allIdx + ')" role="option"><span>View all ' + entityResult.label.toLowerCase() + 's</span><kbd>' + entityResult.label[0].toUpperCase() + '</kbd></button>';

    if (cmdkIdx >= cmdkFiltered.length) cmdkIdx = 0;
    list.innerHTML = html;
    return;
  }

  /* --- Standard command search --- */
  cmdkFiltered = CMD_ACTIONS.filter(function(a) {
    return a.label.toLowerCase().indexOf(q.toLowerCase()) >= 0;
  });
  if (cmdkIdx >= cmdkFiltered.length) cmdkIdx = Math.max(0, cmdkFiltered.length - 1);

  var hintsHtml = '';
  if (q === '') {
    hintsHtml = '<div class="hz-cmdk-group-label" style="padding-bottom:0.25rem">Entity Lookup</div>';
    hintsHtml += '<div style="padding:0.25rem 0.875rem 0.625rem;font-size:0.75rem;color:var(--text-muted);line-height:1.6">';
    hintsHtml += 'Type <kbd style="font-family:var(--font-mono);padding:0.125rem 0.375rem;border-radius:0.25rem;background:var(--surface-raised);font-size:0.6875rem">trade 1003</kbd> ';
    hintsHtml += '<kbd style="font-family:var(--font-mono);padding:0.125rem 0.375rem;border-radius:0.25rem;background:var(--surface-raised);font-size:0.6875rem">invoice 0042</kbd> ';
    hintsHtml += '<kbd style="font-family:var(--font-mono);padding:0.125rem 0.375rem;border-radius:0.25rem;background:var(--surface-raised);font-size:0.6875rem">cargo Q2</kbd> ';
    hintsHtml += '<kbd style="font-family:var(--font-mono);padding:0.125rem 0.375rem;border-radius:0.25rem;background:var(--surface-raised);font-size:0.6875rem">contract QATAR</kbd> ';
    hintsHtml += '<kbd style="font-family:var(--font-mono);padding:0.125rem 0.375rem;border-radius:0.25rem;background:var(--surface-raised);font-size:0.6875rem">nom Q2</kbd>';
    hintsHtml += '</div>';
  }

  if (cmdkFiltered.length === 0) {
    list.innerHTML = '<div class="hz-cmdk-empty">No results for "' + q.replace(/</g, '&lt;') + '"</div>';
    return;
  }

  var html = hintsHtml;
  var lastGroup = '';
  cmdkFiltered.forEach(function(a, i) {
    if (a.group && a.group !== lastGroup) {
      html += '<div class="hz-cmdk-group-label">' + a.group + '</div>';
      lastGroup = a.group;
    }
    html += '<button class="hz-cmdk-item ' + (i === cmdkIdx ? 'active' : '') + '" onmouseenter="cmdkHover(' + i + ')" onclick="cmdkExec(' + i + ')" role="option">';
    html += '  <span>' + a.label + '</span>';
    html += '  <kbd>' + a.keys + '</kbd>';
    html += '</button>';
  });
  list.innerHTML = html;

  var active = list.querySelector('.hz-cmdk-item.active');
  if (active) active.scrollIntoView({ block: 'nearest' });
}

function cmdkHover(i) {
  cmdkIdx = i;
  renderCmdKList(document.getElementById('hz-cmdk-input').value);
}

function cmdkExec(i) {
  closeCmdK();
  if (cmdkFiltered[i]) cmdkFiltered[i].action();
}

/* ========== TOAST ========== */
function showToast(msg, type, undoFn) {
  type = type || 'success';
  var container = document.getElementById('hz-toasts');
  if (!container) {
    container = document.createElement('div');
    container.id = 'hz-toasts';
    container.className = 'hz-toasts';
    document.body.appendChild(container);
  }
  var el = document.createElement('div');
  el.className = 'hz-toast ' + type;

  var textSpan = document.createElement('span');
  textSpan.textContent = msg;
  el.appendChild(textSpan);

  if (undoFn) {
    var undoBtn = document.createElement('button');
    undoBtn.className = 'hz-toast-undo';
    undoBtn.textContent = 'Undo';
    undoBtn.onclick = function() {
      undoFn();
      el.classList.remove('show');
      setTimeout(function() { el.remove(); }, 200);
    };
    el.appendChild(undoBtn);
  }

  container.appendChild(el);
  setTimeout(function() { el.classList.add('show'); }, 10);
  setTimeout(function() {
    el.classList.remove('show');
    setTimeout(function() { el.remove(); }, 300);
  }, 3500);
}

/* ========== COMBOBOX ========== */
function initCombobox(el, options) {
  var input = el.querySelector('.hz-combobox-input');
  var dropdown = el.querySelector('.hz-combobox-dropdown');
  var contextEl = el.querySelector('.hz-combobox-context');
  var highlightIdx = -1;
  var filteredOptions = options.slice();
  var selectedValue = null;
  var previousValue = null;
  var isOpen = false;

  function renderDropdown() {
    var q = input.value.toLowerCase();
    filteredOptions = options.filter(function(opt) {
      var label = typeof opt === 'string' ? opt : opt.label;
      return label.toLowerCase().indexOf(q) >= 0;
    });

    if (filteredOptions.length === 0) {
      dropdown.innerHTML = '<div class="hz-combobox-empty">No matches for "' + input.value.replace(/</g, '&lt;') + '"</div>';
      highlightIdx = -1;
      return;
    }

    if (highlightIdx >= filteredOptions.length) highlightIdx = filteredOptions.length - 1;
    if (highlightIdx < 0) highlightIdx = 0;

    var html = '';
    filteredOptions.forEach(function(opt, i) {
      var label = typeof opt === 'string' ? opt : opt.label;
      var isSel = selectedValue && (typeof opt === 'string' ? opt === selectedValue : opt.value === selectedValue);
      html += '<button class="hz-combobox-option' + (i === highlightIdx ? ' highlighted' : '') + (isSel ? ' selected' : '') + '" data-index="' + i + '" role="option">';
      html += label;
      html += '</button>';
    });
    dropdown.innerHTML = html;

    dropdown.querySelectorAll('.hz-combobox-option').forEach(function(btn) {
      btn.addEventListener('mousedown', function(e) {
        e.preventDefault();
        selectOption(parseInt(btn.dataset.index));
      });
      btn.addEventListener('mouseenter', function() {
        highlightIdx = parseInt(btn.dataset.index);
        renderDropdown();
      });
    });

    var highlighted = dropdown.querySelector('.highlighted');
    if (highlighted) highlighted.scrollIntoView({ block: 'nearest' });
  }

  function openDropdown() {
    if (isOpen) return;
    isOpen = true;
    dropdown.classList.add('open');
    previousValue = selectedValue;
    highlightIdx = 0;
    renderDropdown();
  }

  function closeDropdown() {
    isOpen = false;
    dropdown.classList.remove('open');
  }

  function selectOption(idx) {
    if (idx < 0 || idx >= filteredOptions.length) return;
    var opt = filteredOptions[idx];
    var label = typeof opt === 'string' ? opt : opt.label;
    var value = typeof opt === 'string' ? opt : opt.value;
    selectedValue = value;
    input.value = label;
    closeDropdown();

    if (contextEl && opt.context) {
      contextEl.textContent = opt.context;
      contextEl.style.display = 'block';
    }

    var event = new CustomEvent('combobox-change', { detail: { value: value, label: label, option: opt } });
    el.dispatchEvent(event);

    var focusable = document.querySelectorAll('input, select, button, [tabindex]');
    var arr = Array.prototype.slice.call(focusable);
    var currentIdx = arr.indexOf(input);
    if (currentIdx >= 0 && currentIdx < arr.length - 1) {
      arr[currentIdx + 1].focus();
    }
  }

  input.addEventListener('focus', function() {
    openDropdown();
  });

  input.addEventListener('input', function() {
    if (!isOpen) openDropdown();
    highlightIdx = 0;
    renderDropdown();
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) { openDropdown(); return; }
      highlightIdx = Math.min(highlightIdx + 1, filteredOptions.length - 1);
      renderDropdown();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightIdx = Math.max(highlightIdx - 1, 0);
      renderDropdown();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightIdx >= 0) {
        selectOption(highlightIdx);
      }
    } else if (e.key === 'Tab') {
      if (isOpen && highlightIdx >= 0) {
        selectOption(highlightIdx);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (previousValue !== null) {
        var prevOpt = options.find(function(o) {
          return (typeof o === 'string' ? o : o.value) === previousValue;
        });
        if (prevOpt) {
          input.value = typeof prevOpt === 'string' ? prevOpt : prevOpt.label;
        }
      } else {
        input.value = '';
      }
      closeDropdown();
    }
  });

  input.addEventListener('blur', function() {
    setTimeout(function() {
      if (isOpen) {
        if (previousValue !== null) {
          var prevOpt = options.find(function(o) {
            return (typeof o === 'string' ? o : o.value) === previousValue;
          });
          if (prevOpt) {
            input.value = typeof prevOpt === 'string' ? prevOpt : prevOpt.label;
          }
        } else if (!selectedValue) {
          input.value = '';
        }
        closeDropdown();
      }
    }, 150);
  });

  el.combobox = {
    getValue: function() { return selectedValue; },
    setValue: function(val) {
      var opt = options.find(function(o) {
        return (typeof o === 'string' ? o : o.value) === val;
      });
      if (opt) {
        selectedValue = val;
        input.value = typeof opt === 'string' ? opt : opt.label;
      }
    },
    clear: function() {
      selectedValue = null;
      input.value = '';
      if (contextEl) contextEl.style.display = 'none';
    }
  };
}

/* ========== CONTEXT STRIP (persistent portfolio state) ========== */
function buildContextStrip() {
  var html = '<div class="hz-context-strip" data-component="context-strip">';
  html += '<span class="ctx-label">Net Position</span> <span class="ctx-positive">+4.8M</span>';
  html += '<span class="ctx-sep">|</span>';
  html += '<span class="ctx-label">P&L</span> <span class="ctx-positive">+$2.11M</span>';
  html += '<span class="ctx-sep">|</span>';
  html += '<span class="ctx-label">Hedge</span> <span class="ctx-warn">78%</span>';
  html += '<span class="ctx-sep">|</span>';
  html += '<span class="ctx-label">Credit</span> <span class="ctx-value">62%</span>';
  html += '<span class="ctx-sep">|</span>';
  html += '<span class="ctx-label">Cargoes</span> <span class="ctx-value">7 active</span>';
  html += '<span class="ctx-sep">|</span>';
  html += '<span class="ctx-label">Invoices</span> <span class="ctx-negative">3 pending</span>';
  html += '</div>';
  return html;
}

/* ========== STATUS BAR ========== */
function buildStatusBar() {
  var html = '<div class="hz-status-bar" data-component="status-bar">';
  html += '<span style="display:flex;align-items:center;gap:0.25rem"><span class="hz-dot green pulse" style="width:0.375rem;height:0.375rem;"></span> Connected</span>';
  html += '<span>Last update: ' + new Date().toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit',second:'2-digit'}) + '</span>';
  html += '<span style="margin-left:auto;">Horizon ETRM v20.0</span>';
  html += '</div>';
  return html;
}

/* ========== FULLSCREEN TOGGLE ========== */
function toggleFullscreen(el) {
  // Find the closest card or grid container
  var panel = el.closest('.hz-card, [data-fullscreen]');
  if (!panel) return;

  if (panel.classList.contains('hz-fullscreen')) {
    // Exit fullscreen
    panel.classList.remove('hz-fullscreen');
    panel.style.cssText = panel.dataset.originalStyle || '';
    delete panel.dataset.originalStyle;
    document.body.style.overflow = '';
  } else {
    // Enter fullscreen
    panel.dataset.originalStyle = panel.style.cssText;
    panel.classList.add('hz-fullscreen');
    document.body.style.overflow = 'hidden';
  }
}

/* ========== APP FULLSCREEN (header button) ========== */
function toggleAppFullscreen() {
  var main = document.querySelector('.hz-main');
  var header = document.querySelector('.hz-header');
  var ctx = document.querySelector('.hz-context-strip');
  var sidebar = document.getElementById('hz-sidebar');
  var status = document.querySelector('.hz-status-bar');
  var btn = document.getElementById('hz-fullscreen-toggle');

  if (document.body.classList.contains('hz-app-fullscreen')) {
    document.body.classList.remove('hz-app-fullscreen');
    if (btn) {
      btn.innerHTML = svg('maximize', 14);
      btn.title = 'Toggle fullscreen (F11)';
    }
  } else {
    document.body.classList.add('hz-app-fullscreen');
    if (btn) {
      btn.innerHTML = svg('minimize', 14);
      btn.title = 'Exit fullscreen (F11)';
    }
  }
}

/* ========== INIT SHELL ========== */
function initShell(activePage, pageTitle) {
  initTheme();

  var wrapper = document.getElementById('hz-app');
  var pageContent = wrapper.innerHTML;

  // Build the shell — header + context strip + sidebar + content + status bar
  wrapper.innerHTML = buildHeader(pageTitle) +
    buildContextStrip() +
    buildSidebar(activePage) +
    '<div class="hz-main" data-component="main-content">' +
      '<main class="hz-content" role="main">' +
        '<div class="fade-in">' + pageContent + '</div>' +
      '</main>' +
      buildStatusBar() +
    '</div>' +
    buildCmdK();

  // ---- Sidebar search ----
  initSidebarSearch();

  // ---- Global keyboard shortcuts ----
  document.addEventListener('keydown', function(e) {
    // Cmd+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      var overlay = document.getElementById('hz-cmdk-overlay');
      overlay.style.display === 'none' ? openCmdK() : closeCmdK();
    }
    // Cmd+B
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      toggleSidebar();
    }
    // Escape
    if (e.key === 'Escape') closeCmdK();
    // F11
    if (e.key === 'F11') { e.preventDefault(); toggleAppFullscreen(); }

    // CmdK navigation
    var cmdkOverlay = document.getElementById('hz-cmdk-overlay');
    if (cmdkOverlay && cmdkOverlay.style.display !== 'none') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        cmdkIdx = Math.min(cmdkIdx + 1, cmdkFiltered.length - 1);
        renderCmdKList(document.getElementById('hz-cmdk-input').value);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        cmdkIdx = Math.max(cmdkIdx - 1, 0);
        renderCmdKList(document.getElementById('hz-cmdk-input').value);
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        cmdkExec(cmdkIdx);
      }
    }
  });

  // CmdK input filtering
  var cmdkInput = document.getElementById('hz-cmdk-input');
  if (cmdkInput) {
    cmdkInput.addEventListener('input', function(e) {
      cmdkIdx = 0;
      renderCmdKList(e.target.value);
    });
  }

  // Update theme icons
  updateThemeIcons();
  var observer = new MutationObserver(updateThemeIcons);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

}

function updateThemeIcons() {
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.querySelectorAll('.hz-theme-icon, .hz-theme-icon-header').forEach(function(el) {
    el.innerHTML = isDark ? svg('sun', 14) : svg('moon', 14);
  });
}

/* ========== AG GRID HELPERS ========== */
function getAgTheme() {
  return (localStorage.getItem('hz-theme') || 'dark') === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz';
}

function nullSafeFormatter(params, formatFn) {
  if (params.value == null || params.value === '') return '';
  return formatFn(params.value);
}

function currencyFormatter(params) {
  return nullSafeFormatter(params, function(v) {
    var num = typeof v === 'string' ? parseFloat(v) : v;
    if (isNaN(num)) return '';
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  });
}

function numberFormatter(params) {
  return nullSafeFormatter(params, function(v) {
    var num = typeof v === 'string' ? parseFloat(v) : v;
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');
  });
}

function pnlFormatter(params) {
  return nullSafeFormatter(params, function(v) {
    var num = typeof v === 'string' ? parseFloat(v) : v;
    if (isNaN(num)) return '';
    var prefix = num >= 0 ? '+' : '';
    return prefix + '$' + Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  });
}

function pnlCellStyle(params) {
  if (params.value == null) return null;
  var num = typeof params.value === 'string' ? parseFloat(params.value) : params.value;
  if (isNaN(num)) return null;
  if (num > 0) return { color: 'var(--green)' };
  if (num < 0) return { color: 'var(--red)' };
  return null;
}
