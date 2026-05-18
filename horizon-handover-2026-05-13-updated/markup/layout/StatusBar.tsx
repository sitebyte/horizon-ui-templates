import { useEffect, useState } from 'react';
import { config } from '../../config';

/**
 * App-wide thin status bar across the bottom of the SPA. Distinct from
 * the dashboard's per-page DashboardStatusBar (which surfaces tile-
 * health for that page). This one shows ambient process-level state:
 *
 *   ● Connected   ·  Last update: 14:30:45  ·  Horizon ETRM v1.2.3
 *
 * Visual treatment from horizon-v40's `.hz-status-bar`. The "connected"
 * dot tracks `navigator.onLine` — a cheap browser-side signal that the
 * user has *some* network. It does not assert that the API is reachable
 * (that signal lives on the dashboard's status bar). Conservative on
 * purpose; a green dot here means "browser thinks we have network".
 */
export function StatusBar() {
  const [online, setOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const onUp = () => setOnline(true);
    const onDown = () => setOnline(false);
    window.addEventListener('online', onUp);
    window.addEventListener('offline', onDown);
    return () => {
      window.removeEventListener('online', onUp);
      window.removeEventListener('offline', onDown);
    };
  }, []);

  useEffect(() => {
    // Tick every second so "Last update" reads as a live clock. Cheap;
    // the bar is a few text nodes and React diffs nothing else.
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const version = config.APP_CONFIG_VERSION ? `v${config.APP_CONFIG_VERSION}` : null;

  return (
    <div
      data-testid="app-status-bar"
      className="flex items-center gap-4 px-4 shrink-0 text-[10px] text-muted-foreground border-t border-border-subtle bg-background"
      style={{ height: '1.5rem' }}
    >
      <span className="flex items-center gap-1">
        <span
          aria-hidden
          className={`inline-block w-1.5 h-1.5 rounded-full ${online ? 'bg-rag-green' : 'bg-rag-red'}`}
        />
        <span>{online ? 'Connected' : 'Offline'}</span>
      </span>
      <span className="font-mono">Last update: {time}</span>
      {version && <span className="ml-auto font-mono">Horizon ETRM {version}</span>}
    </div>
  );
}
