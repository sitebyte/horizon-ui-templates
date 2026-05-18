import { useLocation } from 'react-router-dom';

export function PlaceholderPage() {
  const { pathname } = useLocation();

  const title = pathname
    .split('/')
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) ?? 'Page';

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-8 py-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h1 className="font-['DM_Serif_Display'] text-2xl" style={{ color: 'var(--color-text)' }}>
          {title}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Coming soon</p>
      </div>
    </div>
  );
}
