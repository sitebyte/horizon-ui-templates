import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/* ---- SVG icon helper (mirrors shell.js svg()) ---- */
function Svg({ name, size = 16 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
  }
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
      dangerouslySetInnerHTML={{ __html: paths[name] || '' }}
    />
  )
}

/* ---- Command definitions ---- */
interface CmdAction {
  label: string
  keys: string
  group: string
  route?: string
  action?: () => void
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onToggleTheme: () => void
  onToggleSidebar: () => void
}

export function CommandPalette({ open, onClose, onToggleTheme, onToggleSidebar }: CommandPaletteProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)

  const commands: CmdAction[] = [
    { label: 'Go to System Status', keys: 'G S', group: 'Navigate', route: '/' },
    { label: 'Go to Environment', keys: 'G E', group: 'Navigate', route: '/environment' },
    { label: 'Go to Audit Search', keys: 'G A', group: 'Navigate', route: '/audit' },
    { label: 'Go to Data Quality', keys: 'G D', group: 'Navigate', route: '/data-quality' },
    { label: 'Go to SQL Checks', keys: 'G Q', group: 'Navigate', route: '/sql-checks' },
    { label: 'Toggle Theme', keys: 'T', group: 'Actions', action: onToggleTheme },
    { label: 'Toggle Sidebar', keys: '\u2318B', group: 'Actions', action: onToggleSidebar },
  ]

  const filtered = query
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands

  const execute = useCallback(
    (idx: number) => {
      const cmd = filtered[idx]
      if (!cmd) return
      onClose()
      if (cmd.route) navigate(cmd.route)
      else if (cmd.action) cmd.action()
    },
    [filtered, navigate, onClose],
  )

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      // Small delay so the overlay renders first
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Reset active index when filtered list changes
  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx(i => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        execute(activeIdx)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [activeIdx, execute, filtered.length, onClose],
  )

  if (!open) return null

  // Group items for rendering
  let lastGroup = ''

  return (
    <div
      id="hz-cmdk-overlay"
      className="hz-cmdk-overlay"
      onClick={onClose}
      data-component="command-palette"
    >
      <div className="hz-cmdk" onClick={e => e.stopPropagation()} role="dialog" aria-label="Command palette">
        {/* Input */}
        <div className="hz-cmdk-input-wrap">
          <Svg name="search" size={16} />
          <input
            ref={inputRef}
            className="hz-cmdk-input"
            placeholder="Type a command or search..."
            autoComplete="off"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* List */}
        <div id="hz-cmdk-list" className="hz-cmdk-list" role="listbox">
          {filtered.length === 0 ? (
            <div className="hz-cmdk-empty">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((cmd, i) => {
              const showGroup = cmd.group !== lastGroup
              lastGroup = cmd.group
              return (
                <div key={cmd.label}>
                  {showGroup && (
                    <div className="hz-cmdk-group-label">{cmd.group}</div>
                  )}
                  <button
                    className={`hz-cmdk-item${i === activeIdx ? ' active' : ''}`}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => execute(i)}
                    role="option"
                    aria-selected={i === activeIdx}
                  >
                    <span>{cmd.label}</span>
                    <kbd>{cmd.keys}</kbd>
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="hz-cmdk-footer">
          <span><kbd>&uarr;&darr;</kbd> navigate</span>
          <span><kbd>Enter</kbd> select</span>
          <span><kbd>Esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
