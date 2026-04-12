/* ============================================================
   HORIZON — Front-Office Workspace Shell
   Shared sidebar, header, command palette, theme, keyboard
   ============================================================ */

/* ---------- Theme ---------- */
function initTheme() {
  const saved = localStorage.getItem('hz-theme') || 'dark';
  applyTheme(saved);
}
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('hz-theme', t);
  // AG Grid theme swap
  document.querySelectorAll('.ag-theme-quartz, .ag-theme-quartz-dark').forEach(el => {
    el.classList.remove('ag-theme-quartz', 'ag-theme-quartz-dark');
    el.classList.add(t === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz');
  });
}
function toggleTheme() {
  const cur = localStorage.getItem('hz-theme') || 'dark';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}

/* ---------- Sidebar ---------- */
const MENU = [
  {
    group: 'TRADING', defaultOpen: true, items: [
      { label: 'Dashboard', icon: 'grid', href: 'index.html', key: 'dashboard' },
      { label: 'Quick Entry', icon: 'zap', href: 'quick-entry.html', key: 'quick-entry' },
      { label: 'Blotter', icon: 'list', href: 'blotter.html', key: 'blotter' },
      { label: 'Positions', icon: 'bar-chart-2', href: 'positions.html', key: 'positions' },
      {
        label: 'Curves', icon: 'trending-up', key: 'curves', children: [
          { label: 'Forward Curves', href: '#forward-curves' },
          { label: 'Spread Monitor', href: '#spread-monitor' },
        ]
      },
      { label: 'Hedges', icon: 'shield', href: '#hedges', key: 'hedges' },
    ]
  },
  {
    group: 'PHYSICAL', defaultOpen: false, items: [
      { label: 'Cargo Board', icon: 'truck', href: '#cargo-board', key: 'cargo-board' },
      { label: 'Nominations', icon: 'file-text', href: '#nominations', key: 'nominations' },
    ]
  },
  {
    group: 'SETTINGS', defaultOpen: false, items: [
      { label: 'Preferences', icon: 'settings', href: 'settings.html', key: 'preferences' },
    ]
  }
];

const ICONS = {
  grid: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  'bar-chart-2': '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  'trending-up': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
  'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  command: '<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>',
  menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
};

function svg(name, size) {
  size = size || 16;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
}

/* Build sidebar HTML */
function buildSidebar(activePage) {
  const sidebarState = JSON.parse(localStorage.getItem('hz-sidebar-groups') || '{}');
  const subState = JSON.parse(localStorage.getItem('hz-sidebar-subs') || '{}');
  const expanded = localStorage.getItem('hz-sidebar-expanded') !== 'false';

  let html = `
  <div id="hz-sidebar" class="hz-sidebar ${expanded ? 'expanded' : ''}" data-expanded="${expanded}">
    <div class="hz-sidebar-top">
      <button class="hz-sidebar-toggle" onclick="toggleSidebar()" title="Toggle sidebar (Cmd+B)">
        ${svg('menu', 18)}
      </button>
      <span class="hz-sidebar-logo">HORIZON</span>
    </div>
    <nav class="hz-sidebar-nav">`;

  MENU.forEach(group => {
    const gKey = group.group;
    const gOpen = sidebarState[gKey] !== undefined ? sidebarState[gKey] : group.defaultOpen;
    html += `
      <div class="hz-menu-group" data-group="${gKey}">
        <button class="hz-menu-group-btn" onclick="toggleMenuGroup('${gKey}')">
          <span class="hz-menu-group-arrow ${gOpen ? 'open' : ''}">${svg('chevron-right', 12)}</span>
          <span class="hz-menu-group-label">${gKey}</span>
        </button>
        <div class="hz-menu-group-items ${gOpen ? 'open' : ''}">`;

    group.items.forEach(item => {
      const isActive = item.key === activePage;
      if (item.children) {
        const sOpen = subState[item.key] || false;
        html += `
          <div class="hz-menu-sub" data-sub="${item.key}">
            <button class="hz-menu-item ${isActive ? 'active' : ''}" onclick="toggleSubMenu('${item.key}')" data-tooltip="${item.label}">
              <span class="hz-menu-icon">${svg(item.icon, 16)}</span>
              <span class="hz-menu-label">${item.label}</span>
              <span class="hz-menu-sub-arrow ${sOpen ? 'open' : ''}">${svg('chevron-right', 12)}</span>
            </button>
            <div class="hz-menu-sub-items ${sOpen ? 'open' : ''}">`;
        item.children.forEach(child => {
          html += `
              <a class="hz-menu-item sub" href="${child.href}" data-tooltip="${child.label}">
                <span class="hz-menu-icon"></span>
                <span class="hz-menu-label">${child.label}</span>
              </a>`;
        });
        html += `
            </div>
          </div>`;
      } else {
        html += `
          <a class="hz-menu-item ${isActive ? 'active' : ''}" href="${item.href}" data-tooltip="${item.label}">
            <span class="hz-menu-icon">${svg(item.icon, 16)}</span>
            <span class="hz-menu-label">${item.label}</span>
          </a>`;
      }
    });
    html += `
        </div>
      </div>`;
  });

  html += `
    </nav>
    <div class="hz-sidebar-bottom">
      <button class="hz-menu-item" onclick="toggleTheme()" data-tooltip="Theme">
        <span class="hz-menu-icon hz-theme-icon">${svg('moon', 16)}</span>
        <span class="hz-menu-label">Theme</span>
      </button>
    </div>
  </div>`;
  return html;
}

function toggleSidebar() {
  const sb = document.getElementById('hz-sidebar');
  const exp = sb.dataset.expanded === 'true';
  sb.dataset.expanded = !exp;
  sb.classList.toggle('expanded', !exp);
  localStorage.setItem('hz-sidebar-expanded', !exp);
}

function toggleMenuGroup(key) {
  const state = JSON.parse(localStorage.getItem('hz-sidebar-groups') || '{}');
  const group = document.querySelector(`.hz-menu-group[data-group="${key}"]`);
  const items = group.querySelector('.hz-menu-group-items');
  const arrow = group.querySelector('.hz-menu-group-arrow');
  const isOpen = items.classList.contains('open');
  items.classList.toggle('open', !isOpen);
  arrow.classList.toggle('open', !isOpen);
  state[key] = !isOpen;
  localStorage.setItem('hz-sidebar-groups', JSON.stringify(state));
}

function toggleSubMenu(key) {
  const state = JSON.parse(localStorage.getItem('hz-sidebar-subs') || '{}');
  const sub = document.querySelector(`.hz-menu-sub[data-sub="${key}"]`);
  const items = sub.querySelector('.hz-menu-sub-items');
  const arrow = sub.querySelector('.hz-menu-sub-arrow');
  const isOpen = items.classList.contains('open');
  items.classList.toggle('open', !isOpen);
  arrow.classList.toggle('open', !isOpen);
  state[key] = !isOpen;
  localStorage.setItem('hz-sidebar-subs', JSON.stringify(state));
}

/* ---------- Header ---------- */
function buildHeader(title) {
  return `
  <header class="hz-header">
    <div class="hz-header-left">
      <button class="hz-mobile-menu" onclick="toggleSidebar()">${svg('menu', 16)}</button>
      <span class="hz-header-title">${title || ''}</span>
    </div>
    <div class="hz-ticker">
      <span class="hz-tick up">JKM <b>$14.25</b> <span class="arrow">&#9650;</span>0.35</span>
      <span class="hz-tick-sep">|</span>
      <span class="hz-tick down">TTF <b>$12.80</b> <span class="arrow">&#9660;</span>0.15</span>
      <span class="hz-tick-sep">|</span>
      <span class="hz-tick up">HH <b>$3.42</b> <span class="arrow">&#9650;</span>0.02</span>
    </div>
    <div class="hz-header-right">
      <button class="hz-cmd-k-btn" onclick="openCmdK()" title="Cmd+K">
        ${svg('search', 14)}
        <span class="hz-kbd">&#8984;K</span>
      </button>
      <button class="hz-theme-btn" onclick="toggleTheme()" title="Toggle theme">
        <span class="hz-theme-icon-header">${svg('moon', 14)}</span>
      </button>
    </div>
  </header>`;
}

/* ---------- Command Palette ---------- */
const CMD_ACTIONS = [
  { label: 'Go to Dashboard', keys: 'G D', action: () => location.href = 'index.html' },
  { label: 'Go to Quick Entry', keys: 'G Q', action: () => location.href = 'quick-entry.html' },
  { label: 'Go to Blotter', keys: 'G B', action: () => location.href = 'blotter.html' },
  { label: 'Go to Positions', keys: 'G P', action: () => location.href = 'positions.html' },
  { label: 'Go to Settings', keys: 'G S', action: () => location.href = 'settings.html' },
  { label: 'Toggle Theme', keys: 'T', action: () => toggleTheme() },
  { label: 'Toggle Sidebar', keys: '&#8984;B', action: () => toggleSidebar() },
  { label: 'New Trade', keys: 'N', action: () => location.href = 'quick-entry.html' },
  { label: 'Show Shortcuts', keys: '?', action: () => location.href = 'settings.html' },
];

function buildCmdK() {
  return `
  <div id="hz-cmdk-overlay" class="hz-cmdk-overlay" onclick="closeCmdK()" style="display:none">
    <div class="hz-cmdk" onclick="event.stopPropagation()">
      <div class="hz-cmdk-input-wrap">
        ${svg('search', 14)}
        <input id="hz-cmdk-input" class="hz-cmdk-input" placeholder="Type a command..." autocomplete="off" />
      </div>
      <div id="hz-cmdk-list" class="hz-cmdk-list"></div>
      <div class="hz-cmdk-footer">
        <span><kbd>&#8593;&#8595;</kbd> navigate</span>
        <span><kbd>Enter</kbd> select</span>
        <span><kbd>Esc</kbd> close</span>
      </div>
    </div>
  </div>`;
}

let cmdkIdx = 0;
let cmdkFiltered = [];

function openCmdK() {
  const overlay = document.getElementById('hz-cmdk-overlay');
  overlay.style.display = 'flex';
  const input = document.getElementById('hz-cmdk-input');
  input.value = '';
  input.focus();
  cmdkIdx = 0;
  renderCmdKList('');
}

function closeCmdK() {
  document.getElementById('hz-cmdk-overlay').style.display = 'none';
}

function renderCmdKList(q) {
  const list = document.getElementById('hz-cmdk-list');
  cmdkFiltered = CMD_ACTIONS.filter(a => a.label.toLowerCase().includes(q.toLowerCase()));
  if (cmdkIdx >= cmdkFiltered.length) cmdkIdx = 0;
  list.innerHTML = cmdkFiltered.map((a, i) => `
    <button class="hz-cmdk-item ${i === cmdkIdx ? 'active' : ''}" onclick="cmdkExec(${i})">
      <span>${a.label}</span>
      <kbd>${a.keys}</kbd>
    </button>
  `).join('');
}

function cmdkExec(i) {
  closeCmdK();
  if (cmdkFiltered[i]) cmdkFiltered[i].action();
}

/* ---------- Toast ---------- */
function showToast(msg, type) {
  type = type || 'success';
  let container = document.getElementById('hz-toasts');
  if (!container) {
    container = document.createElement('div');
    container.id = 'hz-toasts';
    container.className = 'hz-toasts';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = `hz-toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2400);
}

/* ---------- Context Menu ---------- */
function showContextMenu(e, items) {
  e.preventDefault();
  closeContextMenu();
  const menu = document.createElement('div');
  menu.id = 'hz-ctx-menu';
  menu.className = 'hz-ctx-menu';
  menu.innerHTML = items.map(it =>
    `<button class="hz-ctx-item" onclick="closeContextMenu();${it.action || ''}">${it.label}</button>`
  ).join('');
  menu.style.left = e.pageX + 'px';
  menu.style.top = e.pageY + 'px';
  document.body.appendChild(menu);
  // adjust if off-screen
  const rect = menu.getBoundingClientRect();
  if (rect.right > window.innerWidth) menu.style.left = (e.pageX - rect.width) + 'px';
  if (rect.bottom > window.innerHeight) menu.style.top = (e.pageY - rect.height) + 'px';
  setTimeout(() => document.addEventListener('click', closeContextMenu, { once: true }), 0);
}

function closeContextMenu() {
  const m = document.getElementById('hz-ctx-menu');
  if (m) m.remove();
}

/* ---------- Init Shell ---------- */
function initShell(activePage, pageTitle) {
  initTheme();

  // Inject sidebar + header + cmdK
  const wrapper = document.getElementById('hz-app');
  const content = wrapper.innerHTML;
  wrapper.innerHTML = buildSidebar(activePage) + `
    <div class="hz-main">
      ${buildHeader(pageTitle)}
      <main class="hz-content">${content}</main>
    </div>` + buildCmdK();

  // Global keyboard shortcuts
  document.addEventListener('keydown', e => {
    // Cmd+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const overlay = document.getElementById('hz-cmdk-overlay');
      overlay.style.display === 'none' ? openCmdK() : closeCmdK();
    }
    // Cmd+B
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      toggleSidebar();
    }
    // Escape
    if (e.key === 'Escape') closeCmdK();

    // CmdK navigation
    if (document.getElementById('hz-cmdk-overlay').style.display !== 'none') {
      if (e.key === 'ArrowDown') { e.preventDefault(); cmdkIdx = Math.min(cmdkIdx + 1, cmdkFiltered.length - 1); renderCmdKList(document.getElementById('hz-cmdk-input').value); }
      if (e.key === 'ArrowUp') { e.preventDefault(); cmdkIdx = Math.max(cmdkIdx - 1, 0); renderCmdKList(document.getElementById('hz-cmdk-input').value); }
      if (e.key === 'Enter') { e.preventDefault(); cmdkExec(cmdkIdx); }
    }
  });

  // CmdK input filtering
  document.getElementById('hz-cmdk-input').addEventListener('input', e => {
    cmdkIdx = 0;
    renderCmdKList(e.target.value);
  });

  // Update theme icon
  updateThemeIcons();
  const observer = new MutationObserver(updateThemeIcons);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

function updateThemeIcons() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.querySelectorAll('.hz-theme-icon, .hz-theme-icon-header').forEach(el => {
    el.innerHTML = isDark ? svg('sun', 14) : svg('moon', 14);
  });
}
