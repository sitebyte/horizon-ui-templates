import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { systemApi, type SystemInfo } from '../../api/system';
import { useFeatureFlag, type FeatureFlag } from '../../hooks/useFeatureFlag';
import { useAuth } from '../auth/AuthContext';
import { config } from '../../config';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  CubeIcon,
  DashboardIcon,
  InfoIcon,
  LifeBuoyIcon,
  MagnifierIcon,
  ReceiptIcon,
  ServerStackIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  UserIcon,
  UsersIcon,
} from './icons';

interface NavItem {
  label: string;
  path: string;
  testId?: string;
  icon: (p: { size?: number; className?: string }) => ReactNode;
}

interface NavSection {
  heading: string;
  icon: (p: { size?: number; className?: string }) => ReactNode;
  items: NavItem[];
  flag?: FeatureFlag;
}

/* The nav catalogue. Sections are filtered by feature flag (the
   permission boundary on the server side); items within a section are
   currently shown to anyone who can see the section. When per-item
   permission gating is needed (e.g. Investigation SQL requires an
   admin claim), wire it on `NavItem` and filter inside `Sidebar`. */
const navigation: NavSection[] = [
  {
    heading: 'Trade Capture',
    icon: TrendingUpIcon,
    flag: 'trades',
    items: [
      { label: 'Trades & Charges', path: '/trading/blotter', testId: 'sidebar-trades-item', icon: TrendingUpIcon },
    ],
  },
  {
    heading: 'Settlement',
    icon: ReceiptIcon,
    flag: 'settlements',
    items: [
      { label: 'Statements', path: '/settlements/statements', testId: 'sidebar-settlements-item', icon: ReceiptIcon },
    ],
  },
  {
    heading: 'Static Data',
    icon: CubeIcon,
    flag: 'staticData',
    items: [
      { label: 'Manage Products', path: '/static-data/products', testId: 'sidebar-products-item', icon: CubeIcon },
    ],
  },
  {
    heading: 'Support',
    icon: LifeBuoyIcon,
    items: [
      { label: 'Dashboard', path: '/support/dashboard', testId: 'sidebar-support-dashboard-item', icon: DashboardIcon },
      { label: 'Audit', path: '/support/audit/actions', testId: 'sidebar-audit-item', icon: ClipboardCheckIcon },
      { label: 'Environments', path: '/support/environment', testId: 'sidebar-environment-item', icon: ServerStackIcon },
      { label: 'Data Quality', path: '/support/integrity', testId: 'sidebar-integrity-item', icon: ShieldCheckIcon },
      { label: 'Investigation SQL', path: '/support/sql', testId: 'sidebar-sql-item', icon: MagnifierIcon },
    ],
  },
  {
    heading: 'Security',
    icon: UsersIcon,
    items: [
      { label: 'My Profile', path: '/admin/profile', testId: 'sidebar-my-profile-item', icon: UserIcon },
      { label: 'People', path: '/admin/users', testId: 'sidebar-users-item', icon: UsersIcon },
    ],
  },
];

const COLLAPSED_KEY = 'sidebar.collapsed';
const SIDEBAR_WIDTH_EXPANDED = 240;
const SIDEBAR_WIDTH_COLLAPSED = 56;

/* Active-link className. Active state needs to be visibly distinct from
   hover (the previous version used `bg-muted` for both, so the active
   item read as "currently being hovered" rather than "this is where you
   are"). Now: active uses a tinted-accent background + sharper foreground
   text — the colour-is-information rule applied to navigation. */
function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'flex items-center gap-2 pl-2 pr-2 py-1 ml-2 rounded text-[13px] leading-none transition-all duration-150',
    'border-l-2',
    isActive
      ? 'bg-accent/15 text-foreground border-l-accent font-semibold'
      : 'border-l-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50',
  ].join(' ');
}

/**
 * Filter nav sections by a free-text search query. A section is kept
 * when:
 *   - its heading matches the query (in which case all its items show), OR
 *   - at least one of its items matches the query (only matching items show).
 *
 * Empty query → the unfiltered nav.
 */
function filterNavigation(navigation: NavSection[], query: string): NavSection[] {
  const q = query.trim().toLowerCase();
  if (!q) return navigation;

  return navigation
    .map((section) => {
      const headingMatches = section.heading.toLowerCase().includes(q);
      if (headingMatches) return section;

      const items = section.items.filter((it) => it.label.toLowerCase().includes(q));
      if (items.length === 0) return null;
      return { ...section, items };
    })
    .filter((s): s is NavSection => s !== null);
}

function CollapsibleSection({ section, defaultOpen }: { section: NavSection; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const SectionIcon = section.icon;

  return (
    <div className="mb-0.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors text-muted-foreground hover:text-foreground"
      >
        <SectionIcon size={12} className="shrink-0 opacity-70" />
        <span className="flex-1 text-left">{section.heading}</span>
        <ChevronRightIcon
          size={10}
          className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        />
      </button>
      {open && (
        <div className="mt-0.5 space-y-px">
          {section.items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                data-testid={item.testId}
                end
                className={navLinkClass}
              >
                <ItemIcon size={13} className="shrink-0 opacity-80" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Icon-only nav rail used when the sidebar is collapsed.
 */
function CollapsedNav({ navigation }: { navigation: NavSection[] }) {
  return (
    <nav className="flex-1 py-2 overflow-y-auto flex flex-col items-center gap-2" data-testid="sidebar-collapsed-nav">
      {navigation.map((section) => {
        const SectionIcon = section.icon;
        return (
          <div key={section.heading} className="flex flex-col items-center gap-1 w-full">
            <div className="w-9 h-px my-1 bg-border-subtle" aria-hidden />
            <div className="opacity-60 text-muted-foreground" title={section.heading}>
              <SectionIcon size={12} />
            </div>
            {section.items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  data-testid={item.testId}
                  end
                  title={item.label}
                  aria-label={item.label}
                  className={({ isActive }) =>
                    `flex items-center justify-center w-9 h-9 rounded-md transition-colors ${
                      isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
                    }`
                  }
                >
                  <ItemIcon size={16} />
                </NavLink>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

function readCollapsedFromStorage(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

function FooterLine({
  label,
  value,
  tooltip,
  testId,
}: {
  label: string;
  value: string;
  tooltip: string;
  testId?: string;
}) {
  return (
    <div
      className="flex items-baseline gap-2 text-[10px] tracking-wide text-muted-foreground"
      title={tooltip}
      data-testid={testId}
    >
      <span className="opacity-60 shrink-0">{label}</span>
      <span className="truncate font-medium font-mono">{value}</span>
    </div>
  );
}

function SidebarFooter({ systemInfo }: { systemInfo: SystemInfo | undefined }) {
  return (
    <div
      className="border-t border-border-subtle"
      data-testid="sidebar-footer"
    >
      <SettingsLink />
      <PermissionsPanel />
      <VersionsPanel systemInfo={systemInfo} />
    </div>
  );
}

/**
 * Footer entry: Settings. Aliased to `/admin/profile` for now — the
 * page already carries account-level preferences (theme, granted
 * permissions, LE access), which is what most "Settings" entries
 * surface. When app-level preferences emerge that don't belong on a
 * profile page, retarget this at a dedicated `/settings` route.
 *
 * Visual weight matches the Permissions / Versions disclosure
 * triggers above, so the four-entry footer (Settings → Permissions →
 * Versions → Collapse) reads as one block.
 */
function SettingsLink() {
  return (
    <NavLink
      to="/admin/profile"
      data-testid="sidebar-settings-link"
      className={({ isActive }) =>
        [
          'w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors',
          isActive
            ? 'bg-accent/15 text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
        ].join(' ')
      }
    >
      <SettingsIcon size={13} className="shrink-0 opacity-70" />
      <span className="flex-1 text-left">Settings</span>
    </NavLink>
  );
}

/**
 * Expandable disclosure listing the three versions Horizon surfaces:
 * the SPA itself (`EOS.Horizon`), the EOS schema version
 * (`EOS.Database`) and the EOS application-server build (`EOS`). Same
 * inline-disclosure pattern as PermissionsPanel — closed by default so
 * the footer stays tall-by-the-content not tall-by-default.
 */
function VersionsPanel({ systemInfo }: { systemInfo: SystemInfo | undefined }) {
  const [open, setOpen] = useState(false);

  const horizonVersion = config.APP_CONFIG_VERSION ? `v${config.APP_CONFIG_VERSION}` : '—';

  const dbConnection = systemInfo?.database
    ? systemInfo.server
      ? `${systemInfo.server} / ${systemInfo.database}`
      : systemInfo.database
    : null;
  const dbVersionRaw = systemInfo?.databaseVersion ?? null;
  const dbVersion = dbVersionRaw ? `v${dbVersionRaw}` : '—';
  const dbTooltip = dbConnection
    ? `EOS.Database ${dbVersion} — connected to ${dbConnection}.`
    : `EOS.Database ${dbVersion} — connection details unavailable.`;

  const wcfVersionRaw = systemInfo?.wcfVersion ?? null;
  const wcfVersion = wcfVersionRaw ? `v${wcfVersionRaw}` : '—';
  const wcfTooltip = wcfVersionRaw
    ? `EOS ${wcfVersion} — application server build version.`
    : 'EOS — WCF version unavailable. See Support → Environment.';

  // Trigger label echoes the Horizon version on the closed state so the
  // most-relevant of the three is always visible without expanding.
  const triggerSummary = horizonVersion;

  return (
    <div data-testid="sidebar-versions">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <InfoIcon size={13} className="shrink-0 opacity-70" />
        <span className="flex-1 text-left">Versions</span>
        <span className="font-mono text-[9px] opacity-60">{triggerSummary}</span>
        <ChevronRightIcon
          size={9}
          className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        />
      </button>
      <div
        className="overflow-hidden transition-[max-height] duration-200 ease-out"
        style={{ maxHeight: open ? '8rem' : '0' }}
        aria-hidden={!open}
      >
        <div className="px-3 pt-1 pb-2 space-y-0.5">
          <FooterLine
            label="EOS.Horizon"
            value={horizonVersion}
            tooltip={`EOS.Horizon ${horizonVersion === '—' ? '(version unknown)' : horizonVersion}`}
            testId="footer-horizon-version"
          />
          <FooterLine
            label="EOS.Database"
            value={dbVersion}
            tooltip={dbTooltip}
            testId="footer-database-version"
          />
          <FooterLine
            label="EOS"
            value={wcfVersion}
            tooltip={wcfTooltip}
            testId="footer-wcf-version"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Inline-disclosure panel listing the current user's granted permissions.
 * Pattern lifted from horizon-v40's `hz-sidebar-panel` (durable inline-
 * panel: max-height transition, pushes content above; no popover/drawer).
 *
 * Today the API only surfaces granted permissions (`/api/auth/me` returns
 * a `permissions: string[]`). We render those as green-dotted rows. A
 * future enhancement would join this with a global permission catalogue
 * to show denied entries too — left as a follow-up because it requires a
 * new endpoint, not just UI work.
 */
function PermissionsPanel() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const grants = user?.permissions ?? [];

  // Roll-up label — avoid putting a number on the trigger when we have
  // none (e.g. unauthenticated render); prefer a calm em-dash.
  const countLabel = grants.length === 0 ? '—' : grants.length.toString();

  return (
    <div data-testid="sidebar-permissions">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <ShieldCheckIcon size={13} className="shrink-0 opacity-70" />
        <span className="flex-1 text-left">Permissions</span>
        <span className="font-mono text-[9px] opacity-60">{countLabel}</span>
        <ChevronRightIcon
          size={9}
          className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        />
      </button>
      <div
        className="overflow-hidden transition-[max-height] duration-200 ease-out"
        style={{ maxHeight: open ? '14rem' : '0' }}
        aria-hidden={!open}
      >
        <div className="px-3 pb-2 max-h-56 overflow-y-auto space-y-1" data-testid="sidebar-permissions-list">
          {grants.length === 0 && (
            <p className="text-[10px] italic text-muted-foreground m-0 py-1">
              No permissions surfaced for this user yet.
            </p>
          )}
          {grants.map((p) => (
            <div
              key={p}
              className="flex items-center gap-2 text-[10px] text-muted-foreground"
              data-testid="sidebar-permissions-row"
              data-grant="granted"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rag-green shrink-0" aria-hidden />
              <span className="truncate">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Search input at the top of the sidebar. Wired to a query-string state
 * in the parent — drives both nav-item filtering and (in future) global
 * page search. Kept as a real <input type="search"> so browser-native
 * clear-button + autocomplete work.
 */
function SidebarSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="px-3 pt-2 pb-2">
      <div className="relative">
        <MagnifierIcon
          size={13}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search menu…"
          aria-label="Search menu"
          data-testid="sidebar-search"
          className="w-full pl-7 pr-2 py-1 text-xs bg-muted border border-border-subtle rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}

export function Sidebar() {
  const tradesEnabled = useFeatureFlag('trades');
  const settlementsEnabled = useFeatureFlag('settlements');
  const staticDataEnabled = useFeatureFlag('staticData');

  const flagState: Record<FeatureFlag, boolean> = {
    trades: tradesEnabled,
    settlements: settlementsEnabled,
    staticData: staticDataEnabled,
  };

  const visibleNavigation = useMemo(
    () => navigation.filter((section) => section.flag === undefined || flagState[section.flag]),
    [flagState],
  );

  const [collapsed, setCollapsed] = useState<boolean>(readCollapsedFromStorage);
  const [query, setQuery] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, String(collapsed));
    } catch {
      /* localStorage unavailable; fail silently */
    }
  }, [collapsed]);

  const filteredNavigation = useMemo(
    () => filterNavigation(visibleNavigation, query),
    [visibleNavigation, query],
  );

  const { data: systemInfo } = useQuery({
    queryKey: ['system', 'info'],
    queryFn: () => systemApi.info(),
    staleTime: Infinity,
  });

  return (
    <aside
      className="flex flex-col shrink-0 bg-card border-r border-border-subtle overflow-hidden transition-[width] duration-200"
      data-testid="sidebar"
      data-collapsed={collapsed}
      style={{
        width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
      }}
    >
      {collapsed ? (
        <CollapsedNav navigation={visibleNavigation} />
      ) : (
        <>
          <SidebarSearch value={query} onChange={setQuery} />
          <nav className="flex-1 pb-1.5 overflow-y-auto px-2" data-testid="sidebar-expanded-nav">
            {filteredNavigation.length === 0 ? (
              <p className="px-2 py-1 text-[11px] text-muted-foreground" data-testid="sidebar-no-matches">
                No matches.
              </p>
            ) : (
              filteredNavigation.map((section) => (
                <CollapsibleSection
                  key={section.heading}
                  section={section}
                  defaultOpen={true}
                />
              ))
            )}
          </nav>

          <SidebarFooter systemInfo={systemInfo} />
        </>
      )}

      <CollapseToggle collapsed={collapsed} onClick={() => setCollapsed((c) => !c)} />
    </aside>
  );
}

/**
 * Collapse / expand toggle pinned to the bottom of the sidebar. When
 * expanded, shows icon + "Collapse" label so the affordance is obvious;
 * when collapsed it's a centered chevron-right (the only way back, so
 * the icon must stay visible).
 */
function CollapseToggle({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = collapsed ? ChevronRightIcon : ChevronLeftIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={!collapsed}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      data-testid="sidebar-toggle"
      className={`flex items-center gap-2 px-3 py-2 border-t border-border-subtle text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ${
        collapsed ? 'justify-center' : ''
      }`}
    >
      <Icon size={14} className="shrink-0 opacity-80" />
      {!collapsed && (
        <span className="text-[10px] uppercase tracking-[0.1em] font-semibold">
          Collapse
        </span>
      )}
    </button>
  );
}
