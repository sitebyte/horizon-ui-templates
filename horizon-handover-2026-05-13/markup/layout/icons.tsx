import type { SVGProps } from 'react';

/**
 * Inline outline icons used by the sidebar and other shell chrome.
 * Heroicons-style geometry (24x24 viewBox, fill="none", stroke="currentColor").
 * No icon-library dependency — these are small enough to ship inline.
 *
 * Pattern intentionally mirrors the existing inline SVGs in Header.tsx /
 * Sidebar.tsx so the visual style is consistent across the shell.
 */

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children' | 'viewBox' | 'fill' | 'stroke'> & {
  size?: number;
};

function Svg({ size = 16, className, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...rest}
    />
  );
}

export function ChevronRightIcon(p: IconProps) {
  return <Svg {...p}><polyline points="9 18 15 12 9 6" /></Svg>;
}

export function ChevronLeftIcon(p: IconProps) {
  return <Svg {...p}><polyline points="15 18 9 12 15 6" /></Svg>;
}

/** Trade Capture — trending-up arrow. */
export function TrendingUpIcon(p: IconProps) {
  return <Svg {...p}><polyline points="3 17 9 11 13 15 21 7" /><polyline points="14 7 21 7 21 14" /></Svg>;
}

/** Settlement — receipt with currency line. */
export function ReceiptIcon(p: IconProps) {
  return <Svg {...p}><path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-2z" /><line x1="9" y1="9" x2="15" y2="9" /><line x1="9" y1="13" x2="15" y2="13" /></Svg>;
}

/** Static Data — cube. */
export function CubeIcon(p: IconProps) {
  return <Svg {...p}><path d="M12 3l9 5v8l-9 5-9-5V8z" /><polyline points="3 8 12 13 21 8" /><line x1="12" y1="13" x2="12" y2="21" /></Svg>;
}

/** Support (group) — life buoy. */
export function LifeBuoyIcon(p: IconProps) {
  return <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.5" /><line x1="4.5" y1="4.5" x2="9.6" y2="9.6" /><line x1="14.4" y1="14.4" x2="19.5" y2="19.5" /><line x1="14.4" y1="9.6" x2="19.5" y2="4.5" /><line x1="4.5" y1="19.5" x2="9.6" y2="14.4" /></Svg>;
}

/** Support → Dashboard — 4 squares. */
export function DashboardIcon(p: IconProps) {
  return <Svg {...p}><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></Svg>;
}

/** Support → Audit — clipboard with check. */
export function ClipboardCheckIcon(p: IconProps) {
  return <Svg {...p}><rect x="6" y="4" width="12" height="17" rx="1" /><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" /><polyline points="9 12 11 14 15 10" /></Svg>;
}

/** Support → Environment — server stack. */
export function ServerStackIcon(p: IconProps) {
  return <Svg {...p}><rect x="3" y="3" width="18" height="6" rx="1" /><rect x="3" y="15" width="18" height="6" rx="1" /><line x1="7" y1="6" x2="7" y2="6" /><line x1="7" y1="18" x2="7" y2="18" /></Svg>;
}

/** Support → Integrity Checks — shield with check. */
export function ShieldCheckIcon(p: IconProps) {
  return <Svg {...p}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z" /><polyline points="9 12 11 14 15 10" /></Svg>;
}

/** Support → Investigation SQL — magnifying glass over rows. */
export function MagnifierIcon(p: IconProps) {
  return <Svg {...p}><circle cx="11" cy="11" r="6" /><line x1="20" y1="20" x2="16.2" y2="16.2" /></Svg>;
}

/** Security (group) — users. */
export function UsersIcon(p: IconProps) {
  return <Svg {...p}><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 11a3 3 0 0 0 0-6" /><path d="M21 20a4 4 0 0 0-3-3.87" /></Svg>;
}

/** Singular user — for "My Profile" and other self-context entries. */
export function UserIcon(p: IconProps) {
  return <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></Svg>;
}

/** Header — enter fullscreen (corners-out). */
export function MaximizeIcon(p: IconProps) {
  return <Svg {...p}><polyline points="4 9 4 4 9 4" /><polyline points="20 9 20 4 15 4" /><polyline points="4 15 4 20 9 20" /><polyline points="20 15 20 20 15 20" /></Svg>;
}

/** Header — exit fullscreen (corners-in). */
export function MinimizeIcon(p: IconProps) {
  return <Svg {...p}><polyline points="9 4 9 9 4 9" /><polyline points="15 4 15 9 20 9" /><polyline points="9 20 9 15 4 15" /><polyline points="15 20 15 15 20 15" /></Svg>;
}

/** Sidebar footer — Settings link (cog). */
export function SettingsIcon(p: IconProps) {
  return <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></Svg>;
}

/** Sidebar footer — Versions / about (info). */
export function InfoIcon(p: IconProps) {
  return <Svg {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></Svg>;
}
