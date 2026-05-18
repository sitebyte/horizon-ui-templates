import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { DemoSupportDashboard } from './pages/DemoSupportDashboard'

const NAV = [
  { label: 'System Status', href: '/', key: 'dashboard' },
  { label: 'Environment', href: '/environment', key: 'environment' },
  { label: 'Audit Search', href: '/audit', key: 'audit' },
  { label: 'Data Quality', href: '/data-quality', key: 'data-quality' },
  { label: 'SQL Checks', href: '/sql-checks', key: 'sql-checks' },
]

function Shell() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const sideW = collapsed ? '3.5rem' : '15.5rem'

  const activePage = NAV.find(n => n.href === location.pathname) ?? NAV[0]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: 'var(--surface-canvas)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-sm)',
    }}>
      {/* Header */}
      <header style={{
        height: '3rem',
        backgroundColor: 'var(--header-bg, var(--surface-base))',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1rem',
        gap: '1rem',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            background: 'var(--gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Horizon</span>
        </div>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          {activePage.label}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{
          fontSize: '0.5rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full, 9999px)',
          backgroundColor: 'var(--red-dim, rgba(239,68,68,0.15))',
          color: 'var(--red, #ef4444)',
        }}>PROD</span>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <nav style={{
          width: sideW,
          backgroundColor: 'var(--sidebar-bg, var(--surface-base))',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.2s ease',
        }}>
          <div style={{ padding: '0.75rem 0.75rem 0.5rem', overflow: 'hidden' }}>
            {!collapsed && (
              <div style={{
                fontSize: '0.5rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginBottom: '0.375rem',
              }}>SUPPORT</div>
            )}
            {NAV.map(item => {
              const active = location.pathname === item.href
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.3rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    backgroundColor: active ? 'var(--hover)' : 'transparent',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: active ? 'var(--accent)' : 'var(--text-muted)',
                  }} />
                  {!collapsed && item.label}
                </Link>
              )
            })}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            padding: '0.5rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}>
            {!collapsed && <>
              <span style={{ fontSize: '0.5rem', color: 'var(--text-muted)', padding: '0.25rem 0.5rem' }}>Settings</span>
              <span style={{ fontSize: '0.5rem', color: 'var(--text-muted)', padding: '0.25rem 0.5rem' }}>Permissions</span>
              <span style={{ fontSize: '0.5rem', color: 'var(--text-muted)', padding: '0.25rem 0.5rem' }}>Versions</span>
            </>}
            <button
              onClick={() => setCollapsed(c => !c)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
                padding: '0.25rem 0.5rem', textAlign: 'left',
              }}
            >{collapsed ? '→' : '← Collapse'}</button>
          </div>
        </nav>

        {/* Main content */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<DemoSupportDashboard />} />
            <Route path="/environment" element={<Placeholder title="Environment" />} />
            <Route path="/audit" element={<Placeholder title="Audit Search" />} />
            <Route path="/data-quality" element={<Placeholder title="Data Quality" />} />
            <Route path="/sql-checks" element={<Placeholder title="SQL Checks" />} />
          </Routes>
        </main>
      </div>

      {/* Status bar */}
      <div style={{
        height: '1.5rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        fontSize: '0.5625rem',
        color: 'var(--text-muted)',
        backgroundColor: 'var(--surface-base)',
        flexShrink: 0,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--green, #22c55e)' }} />
          Connected
        </span>
        <span>Last update: {new Date().toLocaleTimeString('en-GB')}</span>
      </div>
    </div>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: '2rem', color: 'var(--text-tertiary)', fontSize: 'var(--text-lg)' }}>
      {title} — placeholder
    </div>
  )
}

function App() {
  return <Shell />
}

export default App
