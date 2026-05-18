import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

/**
 * Active theme string. Maps 1:1 onto a `[data-theme="..."]` selector
 * declared in `client/src/horizon/tokens/theme-horizon-{dark,light,ui}.css`.
 *
 * `horizon-ui` is the default — the port of horizon-v40's design tokens.
 * `horizon-ui-light` is its light variant. The legacy `dark` / `light`
 * names remain consumable so any persisted preference (`eos-theme`
 * localStorage entry) keeps working: we map them through to the
 * horizon-ui variants below.
 */
type Theme = 'horizon-ui' | 'horizon-ui-light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Map any persisted value (including the legacy 'dark' / 'light')
 *  forward to a current Theme. Anything we don't recognise → default. */
function normaliseStored(value: string | null): Theme {
  if (value === 'horizon-ui' || value === 'dark') return 'horizon-ui';
  if (value === 'horizon-ui-light' || value === 'light') return 'horizon-ui-light';
  return 'horizon-ui';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    normaliseStored(typeof localStorage !== 'undefined' ? localStorage.getItem('eos-theme') : null),
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('eos-theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === 'horizon-ui' ? 'horizon-ui-light' : 'horizon-ui'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
