import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { signoutRedirect, isOidcEnabled } from '../../auth/oidc';

function getInitials(firstName: string | null | undefined, lastName: string | null | undefined, fallback: string): string {
  const f = firstName?.trim()[0];
  const l = lastName?.trim()[0];
  if (f && l) return (f + l).toUpperCase();
  if (f) return f.toUpperCase();
  if (l) return l.toUpperCase();
  return fallback.trim().slice(0, 2).toUpperCase() || '?';
}

function displayNameFor(user: { firstName: string | null; lastName: string | null; name: string }): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return full || user.name;
}

/**
 * Avatar + dropdown menu in the shell header. Click opens; outside-click,
 * Escape, or navigation closes. Sign-out goes through Keycloak; if OIDC is
 * not enabled (local dev with no client id) the option is hidden because
 * there's no session to end.
 */
export function AvatarMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  if (!user) return null;

  const displayName = displayNameFor(user);
  const initials = getInitials(user.firstName, user.lastName, user.name);
  const roleSummary = `${user.legalEntities.length} legal ${user.legalEntities.length === 1 ? 'entity' : 'entities'} · ${user.permissions.length} permissions`;

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`User menu for ${displayName}`}
        title={`${displayName} — open menu`}
        data-testid="header-avatar"
        data-username={user.name}
        className="rounded-full transition-all duration-150"
        style={{
          outline: open ? '2px solid var(--color-header-text)' : '2px solid transparent',
          outlineOffset: 2,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full text-[11px] font-semibold select-none"
          style={{
            width: 28,
            height: 28,
            background: 'var(--color-header-avatar)',
            color: 'var(--color-header-text)',
            cursor: 'pointer',
          }}
        >
          {initials}
        </div>
      </button>

      {open && (
        <div
          role="menu"
          data-testid="header-avatar-menu"
          className="absolute right-0 top-full mt-2 z-50 rounded-xl shadow-xl overflow-hidden"
          style={{
            width: 256,
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-default)',
          }}
        >
          {/* Header: avatar + name + identity */}
          <div className="flex items-center gap-2.5 p-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div
              className="flex items-center justify-center rounded-full text-xs font-semibold shrink-0"
              style={{ width: 36, height: 36, background: 'var(--color-env, var(--accent))', color: '#fff' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{displayName}</div>
              <div className="text-[11px] font-mono truncate" style={{ color: 'var(--text-muted)' }}>{user.name}</div>
            </div>
          </div>

          {/* Meta */}
          <div className="px-3 py-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            {roleSummary}
          </div>

          <div className="border-t" style={{ borderColor: 'var(--border-subtle)' }} />

          {/* Links */}
          <Link
            to="/admin/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            data-testid="avatar-menu-profile"
            className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50 transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
            </svg>
            <span>View Profile</span>
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate('/admin/users');
            }}
            data-testid="avatar-menu-users"
            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50 transition-colors text-left"
            style={{ color: 'var(--text-primary)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="9" cy="8" r="3.5" />
              <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
              <path d="M16 11a3 3 0 0 0 0-6" />
              <path d="M21 20a4 4 0 0 0-3-3.87" />
            </svg>
            <span>Manage Users</span>
          </button>

          {isOidcEnabled() && (
            <>
              <div className="border-t" style={{ borderColor: 'var(--border-subtle)' }} />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  void signoutRedirect();
                }}
                data-testid="avatar-menu-signout"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50 transition-colors text-left"
                style={{ color: 'var(--rag-red)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
