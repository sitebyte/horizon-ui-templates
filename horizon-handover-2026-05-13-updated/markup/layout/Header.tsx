import { useEffect, useState } from 'react';
import { config } from '../../config';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from './ThemeContext';
import { envThemeFor, envBadgeGlow } from './envTheme';
import { MagnifierIcon, MaximizeIcon, MinimizeIcon } from './icons';
import { AvatarMenu } from './AvatarMenu';
import { isCmdK } from './cmdK';

/**
 * Track and toggle browser fullscreen for the document. Fullscreen API
 * is desktop-grade — Safari iOS isn't a target. Listens for
 * `fullscreenchange` so the icon flips when the user exits via Esc.
 */
function useFullscreen(): { isFullscreen: boolean; toggle: () => void } {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(
    typeof document !== 'undefined' ? !!document.fullscreenElement : false,
  );

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  };

  return { isFullscreen, toggle };
}

/**
 * Cmd+K shortcut. Click the button OR press Cmd+K / Ctrl+K to focus the
 * sidebar search input. Real, light: matches the v40 visual treatment
 * (icon + Cmd+K hint) without needing a command-palette implementation.
 * The sidebar search has data-testid="sidebar-search"; we focus it on
 * trigger.
 */
function focusSidebarSearch() {
  const el = document.querySelector<HTMLInputElement>('[data-testid="sidebar-search"]');
  if (el) {
    el.focus();
    el.select();
  }
}

function useGlobalCmdK() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isCmdK(e)) {
        e.preventDefault();
        focusSidebarSearch();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

export function Header() {
  const { user, currentLegalEntityId, setLegalEntity } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  useGlobalCmdK();

  const envTheme = envThemeFor(config.APP_CONFIG_ENV_CODE);
  // Theme strings since the horizon-ui port: 'horizon-ui' (dark default)
  // and 'horizon-ui-light'.
  const isDark = !theme.endsWith('-light');
  const badgeBg = isDark ? envTheme.badgeBgDark : envTheme.badgeBgLight;
  const badgeText = isDark ? envTheme.badgeTextDark : envTheme.badgeTextLight;
  const badgeGlow = isDark ? envBadgeGlow(envTheme.glowRgb) : 'none';

  // The right-cluster Cmd+K hint shows the platform-appropriate modifier.
  const isMac =
    typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent || '');
  const cmdKLabel = isMac ? '⌘K' : 'Ctrl+K';

  return (
    <header
      className="flex items-center justify-between px-4 shrink-0"
      style={{
        height: 40,
        background: 'var(--header-bg)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
      data-testid="app-header"
    >
      {/* Left — brand. v40 has a brand block + breadcrumb-page; we keep
          this minimal — just the product name as a flat string. */}
      <div className="flex items-center gap-3">
        <span
          className="text-sm font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
          data-testid="header-brand"
        >
          EOS.Horizon
        </span>
      </div>

      {/* Right — control cluster, in v40's order:
            [legal-entity selector] [Cmd+K] [env badge] [theme] [fullscreen] [avatar]
          The LE selector isn't in v40 (no multi-tenant in their demo);
          we tuck it in front of the cluster so its placement is stable. */}
      <div className="flex items-center gap-3">
        {user && user.legalEntities.length > 0 && (
          <select
            value={currentLegalEntityId ?? ''}
            onChange={(e) => {
              const id = Number(e.target.value);
              if (id) setLegalEntity(id);
            }}
            className="rounded text-xs font-medium"
            style={{
              height: 26,
              padding: '0 6px',
              background: 'var(--surface-raised)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
            title="Select legal entity"
            data-testid="header-legal-entity"
          >
            {user.legalEntities.map((le) => (
              <option key={le.id} value={le.id} style={{ color: '#000', background: '#fff' }}>
                {le.shortCode ?? le.name ?? `LE ${le.id}`}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={focusSidebarSearch}
          title={`Focus sidebar search (${cmdKLabel})`}
          aria-label="Focus sidebar search"
          data-testid="header-cmd-k"
          className="flex items-center gap-1.5 rounded transition-colors text-[10px] font-medium"
          style={{
            height: 26,
            padding: '0 8px',
            color: 'var(--text-tertiary)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-subtle)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          <MagnifierIcon size={12} />
          <span className="font-mono opacity-80">{cmdKLabel}</span>
        </button>

        {config.APP_CONFIG_ENV_CODE && (
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: badgeBg,
              color: badgeText,
              boxShadow: badgeGlow,
            }}
            data-testid="header-env-badge"
          >
            {config.APP_CONFIG_ENV_CODE}
          </span>
        )}

        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          className="flex items-center justify-center rounded-md transition-colors"
          style={{
            width: 28,
            height: 28,
            color: 'var(--text-tertiary)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          data-testid="header-theme-toggle"
        >
          {isDark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit full screen' : 'Full screen'}
          aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          data-testid="header-fullscreen-toggle"
          className="flex items-center justify-center rounded-md transition-colors"
          style={{
            width: 28,
            height: 28,
            color: 'var(--text-tertiary)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          {isFullscreen ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
        </button>

        <AvatarMenu />
      </div>
    </header>
  );
}
