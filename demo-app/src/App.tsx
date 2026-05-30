/**
 * Horizon ETRM — React Shell
 * Replicates the v43 static prototype shell.js using the SAME CSS class
 * names from shell.css. No new CSS is created; everything is driven by
 * the existing hz-* classes and CSS custom properties.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { DemoSupportDashboard } from './pages/DemoSupportDashboard'
import { DataQualityPage } from './pages/DataQualityPage'
import { AuditSearchPage } from './pages/AuditSearchPage'
import { SqlChecksPage } from './pages/SqlChecksPage'
import { EnvironmentPage } from './pages/EnvironmentPage'
import { UserProfilePage } from './pages/UserProfilePage'
import { TradeEntryPage } from './pages/TradeEntryPage'
import { useLocalStorage } from './hooks/useLocalStorage'
import { CommandPalette } from './components/CommandPalette'

/* ================================================================
   SVG Icon helper — mirrors shell.js svg() function
   ================================================================ */
const ICON_PATHS: Record<string, string> = {
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
  'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
  'chevrons-left': '<polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/>',
  'chevrons-right': '<polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  maximize: '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>',
  minimize: '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  'external-link': '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
}

function Ico({ name, size = 16 }: { name: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] || '' }}
    />
  )
}

/* ================================================================
   LNG Carrier brand icon (same SVG as shell.js)
   ================================================================ */
function BrandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M1 16.5L2.5 14H21.5L23 16.5Z" fill="#fff" opacity=".95" />
      <path d="M2.5 14L1.5 12.5 4 14Z" fill="#fff" opacity=".95" />
      <path d="M5.5 14A2.2 2.2 0 0 1 9.5 14" fill="#fff" opacity=".9" />
      <path d="M10 14A2.2 2.2 0 0 1 14 14" fill="#fff" opacity=".9" />
      <path d="M14.5 14A2.2 2.2 0 0 1 18.5 14" fill="#fff" opacity=".9" />
      <rect x="19" y="9.5" width="3" height="4.5" rx=".4" fill="#fff" opacity=".95" />
      <rect x="19.5" y="10.2" width="2" height=".6" rx=".2" fill="#fff" opacity=".3" />
      <rect x="20.2" y="7.8" width="1.2" height="1.7" rx=".3" fill="#fff" opacity=".85" />
    </svg>
  )
}

/* ================================================================
   Navigation model
   ================================================================ */
interface NavItem {
  label: string
  href: string
  key: string
  icon: string
}

const TRADING_NAV: NavItem[] = [
  { label: 'Trade Entry', href: '/trade-entry', key: 'trade-entry', icon: 'file-text' },
]

const SUPPORT_NAV: NavItem[] = [
  { label: 'System Status', href: '/', key: 'support-dashboard', icon: 'activity' },
  { label: 'Environment', href: '/environment', key: 'support-environments', icon: 'settings' },
  { label: 'Audit Search', href: '/audit', key: 'support-audit', icon: 'search' },
  { label: 'Data Quality', href: '/data-quality', key: 'data-quality', icon: 'shield' },
  { label: 'SQL Checks', href: '/sql-checks', key: 'support-sql-checks', icon: 'clipboard' },
]

const NAV: NavItem[] = [...TRADING_NAV, ...SUPPORT_NAV]

/* ================================================================
   Placeholder page component
   ================================================================ */
function Placeholder({ title }: { title: string }) {
  return (
    <div className="hz-content-fill" style={{ padding: 'var(--sp-4)' }}>
      <span className="sec-title">{title}</span>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
        Page content will be ported from the v43 prototype.
      </p>
    </div>
  )
}


/* ================================================================
   Workspace Tab type
   ================================================================ */
interface WorkspaceTab {
  key: string
  title: string
  url: string
}

/* ================================================================
   Shell component — the main layout
   ================================================================ */
function Shell() {
  const location = useLocation()
  const navigate = useNavigate()

  /* ---- Derive active page from current route ---- */
  const activePage = NAV.find(n => n.href === location.pathname) ?? NAV[0]
  const activeKey = activePage.key

  /* ---- Persisted state ---- */
  const [sidebarExpanded, setSidebarExpanded] = useLocalStorage('hz-sidebar-expanded', true)
  const [theme, setTheme] = useLocalStorage('hz-theme', 'dark')
  const [workspaceTabs, setWorkspaceTabs] = useLocalStorage<WorkspaceTab[]>('hz-workspace-tabs', [])

  /* ---- Transient state ---- */
  const [cmdkOpen, setCmdkOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [tradingGroupOpen, setTradingGroupOpen] = useState(true) // TRADING group
  const [menuGroupOpen, setMenuGroupOpen] = useState(true) // SUPPORT group
  const [versionsOpen, setVersionsOpen] = useState(false)

  /* ---- Refs ---- */
  const userMenuRef = useRef<HTMLDivElement>(null)

  /* ---- Theme management ---- */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  }, [setTheme])

  /* ---- Sidebar toggle ---- */
  const toggleSidebar = useCallback(() => {
    setSidebarExpanded(e => !e)
  }, [setSidebarExpanded])

  /* ---- Fullscreen ---- */
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(f => {
      if (!f) {
        document.body.classList.add('hz-app-fullscreen')
      } else {
        document.body.classList.remove('hz-app-fullscreen')
        // remove floating exit btn if present
        document.getElementById('hz-fullscreen-exit')?.remove()
      }
      return !f
    })
  }, [])

  /* ---- Workspace tabs: add current page on navigation ---- */
  useEffect(() => {
    setWorkspaceTabs(prev => {
      const existing = prev.find(t => t.key === activeKey)
      if (existing) {
        // Update title/url
        return prev.map(t =>
          t.key === activeKey ? { ...t, title: activePage.label, url: activePage.href } : t,
        )
      }
      const next = [...prev, { key: activeKey, title: activePage.label, url: activePage.href }]
      // Max 10 tabs
      return next.length > 10 ? next.slice(next.length - 10) : next
    })
  }, [activeKey, activePage.label, activePage.href, setWorkspaceTabs])

  const closeTab = useCallback(
    (key: string, e: React.MouseEvent) => {
      e.stopPropagation()
      setWorkspaceTabs(prev => {
        const next = prev.filter(t => t.key !== key)
        // If closing the active tab, navigate to last remaining
        if (key === activeKey && next.length > 0) {
          navigate(next[next.length - 1].url)
        }
        return next
      })
    },
    [activeKey, navigate, setWorkspaceTabs],
  )

  const navigateTab = useCallback(
    (tab: WorkspaceTab) => {
      navigate(tab.url)
    },
    [navigate],
  )




  /* ---- Close user menu on outside click ---- */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  /* ---- Global keyboard shortcuts ---- */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdkOpen(o => !o)
      }
      // Cmd+B / Ctrl+B
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
      // Escape
      if (e.key === 'Escape') {
        setCmdkOpen(false)
        setUserMenuOpen(false)
        if (isFullscreen) toggleFullscreen()
      }
      // F11
      if (e.key === 'F11') {
        e.preventDefault()
        toggleFullscreen()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isFullscreen, toggleFullscreen, toggleSidebar])

  /* ---- Timestamp for status bar ---- */
  const [timestamp, setTimestamp] = useState(
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  )
  useEffect(() => {
    const id = setInterval(
      () =>
        setTimestamp(
          new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        ),
      1000,
    )
    return () => clearInterval(id)
  }, [])

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div id="hz-app" className={`hz-has-workspace-tabs${sidebarExpanded ? '' : ' hz-sidebar-collapsed'}`}>
      {/* ---- HEADER ---- */}
      <header className="hz-header" data-component="header" role="banner">
        <div className="hz-header-left">
          <div className="hz-header-brand">
            <div className="hz-header-brand-icon">
              <BrandIcon />
            </div>
            <span className="hz-header-brand-text">Horizon</span>
          </div>
          <span className="hz-breadcrumb-page">{activePage.label}</span>
        </div>

        <div className="hz-header-right">
          {/* Cmd+K button */}
          <button
            className="hz-cmd-k-btn"
            onClick={() => setCmdkOpen(true)}
            title="Cmd+K"
            tabIndex={0}
          >
            <Ico name="search" size={14} />
            <span className="hz-kbd">&#8984;K</span>
          </button>

          {/* Env badge */}
          <span className="hz-env-badge prod">PROD</span>

          {/* Theme toggle */}
          <button
            className="hz-theme-btn"
            onClick={toggleTheme}
            title="Toggle theme"
            tabIndex={0}
          >
            <span className="hz-theme-icon-header">
              <Ico name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
            </span>
          </button>

          {/* Fullscreen */}
          <button
            className="hz-theme-btn"
            onClick={toggleFullscreen}
            title="Toggle fullscreen (F11)"
            id="hz-fullscreen-toggle"
          >
            <Ico name={isFullscreen ? 'minimize' : 'maximize'} size={14} />
          </button>

          {/* Avatar + User menu */}
          <div className="hz-avatar-wrap" ref={userMenuRef}>
            <div
              className="hz-avatar"
              title="A. Morgan"
              tabIndex={0}
              role="button"
              aria-label="User menu"
              onClick={e => {
                e.stopPropagation()
                setUserMenuOpen(o => !o)
              }}
            >
              AM
            </div>
            <div
              id="hz-user-menu"
              className={`hz-user-menu${userMenuOpen ? ' open' : ''}`}
              data-component="user-menu"
              style={{ display: userMenuOpen ? 'block' : 'none' }}
            >
              <div className="hz-user-menu-header">
                <div className="hz-user-menu-avatar">AM</div>
                <div className="hz-user-menu-identity">
                  <div className="hz-user-menu-name">Alex Morgan</div>
                  <div className="hz-user-menu-email">a.morgan@acmecorp.com</div>
                </div>
              </div>
              <div className="hz-user-menu-meta">
                <div className="hz-user-menu-meta-row">
                  <Ico name="briefcase" size={12} />
                  <span>Senior Trader</span>
                </div>
                <div className="hz-user-menu-meta-row">
                  <Ico name="users" size={12} />
                  <span>Commodities Desk</span>
                </div>
                <div className="hz-user-menu-meta-row">
                  <Ico name="shield" size={12} />
                  <span>Trader, Admin</span>
                </div>
              </div>
              <div className="hz-user-menu-divider" />
              <Link className="hz-user-menu-item" to="/profile" onClick={() => setUserMenuOpen(false)}>
                <Ico name="user" size={14} />
                <span>View Profile</span>
              </Link>
              <div className="hz-user-menu-divider" />
              <a className="hz-user-menu-item hz-user-menu-item-danger" href="#">
                <Ico name="log-out" size={14} />
                <span>Sign Out</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ---- WORKSPACE TABS ---- */}
      <div className="hz-workspace-tabs" data-component="workspace-tabs">
        {workspaceTabs.map(tab => (
          <div
            key={tab.key}
            className={`hz-ws-tab${tab.key === activeKey ? ' active' : ''}`}
            data-key={tab.key}
            title={tab.title}
            onClick={() => navigateTab(tab)}
          >
            <span className="hz-ws-tab-title">{tab.title}</span>
            <button
              className="hz-ws-tab-close"
              onClick={e => closeTab(tab.key, e)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* ---- SIDEBAR ---- */}
      <aside
        id="hz-sidebar"
        className={`hz-sidebar${sidebarExpanded ? '' : ' collapsed'}`}
        data-expanded={sidebarExpanded}
        data-component="sidebar"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Nav — at the top, no search, maximise content area */}
        <nav className="hz-sidebar-nav">
          {/* TRADING group */}
          <div className="hz-menu-group" data-group="TRADING" data-menu-group="TRADING">
            <button
              className={`hz-menu-group-btn active`}
              onClick={() => setTradingGroupOpen(o => !o)}
              tabIndex={0}
              aria-expanded={tradingGroupOpen}
            >
              <span className="hz-menu-icon">
                <Ico name="file-text" size={14} />
              </span>
              <span className="hz-menu-group-label">TRADING</span>
              <span
                className={`hz-menu-group-arrow${tradingGroupOpen ? ' open' : ''}`}
                style={{ marginLeft: 'auto' }}
              >
                <Ico name="chevron-right" size={10} />
              </span>
            </button>
            <div className={`hz-menu-group-items${tradingGroupOpen ? ' open' : ''}`}>
              {TRADING_NAV.map(item => {
                const isActive = item.key === activeKey
                return (
                  <Link
                    key={item.key}
                    to={item.href}
                    className={`hz-menu-item${isActive ? ' active' : ''}`}
                    data-tooltip={item.label}
                    data-menu-item={item.key}
                    tabIndex={0}
                  >
                    <span className="hz-menu-icon">
                      <Ico name={item.icon} size={16} />
                    </span>
                    <span className="hz-menu-label">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* SUPPORT group */}
          <div className="hz-menu-group" data-group="SUPPORT" data-menu-group="SUPPORT">
            <button
              className={`hz-menu-group-btn active`}
              onClick={() => setMenuGroupOpen(o => !o)}
              tabIndex={0}
              aria-expanded={menuGroupOpen}
            >
              <span className="hz-menu-icon">
                <Ico name="activity" size={14} />
              </span>
              <span className="hz-menu-group-label">SUPPORT</span>
              <span
                className={`hz-menu-group-arrow${menuGroupOpen ? ' open' : ''}`}
                style={{ marginLeft: 'auto' }}
              >
                <Ico name="chevron-right" size={10} />
              </span>
            </button>
            <div className={`hz-menu-group-items${menuGroupOpen ? ' open' : ''}`}>
              {SUPPORT_NAV.map(item => {
                const isActive = item.key === activeKey
                return (
                  <Link
                    key={item.key}
                    to={item.href}
                    className={`hz-menu-item${isActive ? ' active' : ''}`}
                    data-tooltip={item.label}
                    data-menu-item={item.key}
                    tabIndex={0}
                  >
                    <span className="hz-menu-icon">
                      <Ico name={item.icon} size={16} />
                    </span>
                    <span className="hz-menu-label">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Footer — versions + collapse */}
        <div className="hz-sidebar-footer">
          <button
            className="hz-sidebar-footer-link"
            onClick={() => setVersionsOpen(v => !v)}
            tabIndex={0}
          >
            <span className="hz-menu-icon"><Ico name="info" size={14} /></span>
            <span className="hz-menu-label">Versions</span>
          </button>
          {versionsOpen && (
            <div className="hz-sidebar-panel" style={{ display: 'block' }}>
              <div className="hz-sidebar-panel-content">
                <div className="hz-sidebar-version-row"><span>EOS</span><span className="font-mono">4.2.1</span></div>
                <div className="hz-sidebar-version-row"><span>EOS.Horizon</span><span className="font-mono">1.0.17</span></div>
                <div className="hz-sidebar-version-row"><span>EOS.Database</span><span className="font-mono">4.2.1.3847</span></div>
                <div className="hz-sidebar-version-row"><span>AG Grid</span><span className="font-mono">31.3.2</span></div>
                <div className="hz-sidebar-version-row"><span>Environment</span><span className="font-mono" style={{ color: 'var(--green)' }}>PROD</span></div>
                <div className="hz-sidebar-version-row"><span>Region</span><span className="font-mono">SGP</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Collapse */}
        <button
          className="hz-sidebar-collapse-btn"
          id="hz-sidebar-toggle"
          onClick={toggleSidebar}
          title="Cmd+B"
          tabIndex={0}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.5rem' }}
        >
          <Ico name={sidebarExpanded ? 'chevrons-left' : 'chevrons-right'} size={12} />
          <span className="hz-menu-label" style={{ fontSize: '0.5rem' }}>
            {sidebarExpanded ? 'Collapse' : ''}
          </span>
        </button>
      </aside>

      {/* ---- MAIN CONTENT ---- */}
      <div className="hz-main" data-component="main-content">
        <main className="hz-content" role="main">
          <div className="fade-in">
            <Routes>
              <Route path="/trade-entry" element={<TradeEntryPage />} />
              <Route path="/" element={<DemoSupportDashboard />} />
              <Route path="/environment" element={<EnvironmentPage />} />
              <Route path="/audit" element={<AuditSearchPage />} />
              <Route path="/data-quality" element={<DataQualityPage />} />
              <Route path="/sql-checks" element={<SqlChecksPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
            </Routes>
          </div>
        </main>

        {/* ---- STATUS BAR ---- */}
        <div className="hz-status-bar" data-component="status-bar">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span
              className="hz-dot green pulse"
              style={{ width: '0.375rem', height: '0.375rem' }}
            />
            Connected
          </span>
          <span>Last update: {timestamp}</span>
          <span style={{ marginLeft: 'auto' }}>Horizon ETRM v31.0</span>
        </div>
      </div>

      {/* ---- COMMAND PALETTE ---- */}
      <CommandPalette
        open={cmdkOpen}
        onClose={() => setCmdkOpen(false)}
        onToggleTheme={toggleTheme}
        onToggleSidebar={toggleSidebar}
      />

      {/* ---- FULLSCREEN EXIT BUTTON ---- */}
      {isFullscreen && (
        <button
          id="hz-fullscreen-exit"
          className="hz-fullscreen-exit-btn"
          onClick={toggleFullscreen}
          title="Exit fullscreen (Esc or F11)"
        >
          <Ico name="minimize" size={14} />
          <span>Exit Fullscreen</span>
        </button>
      )}
    </div>
  )
}

/* ================================================================
   App — root component (BrowserRouter provided by main.tsx)
   ================================================================ */
function App() {
  return <Shell />
}

export default App
