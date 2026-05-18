import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type TextRole = 'heading' | 'body' | 'caption' | 'label' | 'mono';
export type TextSize = 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'hero';
export type TextWeight = 400 | 500 | 600 | 700;
export type TextTone =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'muted'
  | 'accent'
  | 'pos'
  | 'neg'
  | 'rag-red'
  | 'rag-amber'
  | 'rag-green'
  | 'rag-info';

interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  role?: TextRole;
  size?: TextSize;
  weight?: TextWeight;
  tone?: TextTone;
  /** Render uppercase with letter-spacing — for label-style overlines. */
  uppercase?: boolean;
  /** Truncate with ellipsis (single line). */
  truncate?: boolean;
  /** Tabular numerics — use for any number-bearing text. */
  tabular?: boolean;
  /** Render as a different element (defaults to span). */
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'label';
  style?: CSSProperties;
  children?: ReactNode;
}

const TONE_TO_TOKEN: Record<TextTone, string> = {
  primary:   'var(--text-primary)',
  secondary: 'var(--text-secondary)',
  tertiary:  'var(--text-tertiary)',
  muted:     'var(--text-muted)',
  accent:    'var(--accent)',
  pos:       'var(--pnl-positive)',
  neg:       'var(--pnl-negative)',
  'rag-red':   'var(--rag-red)',
  'rag-amber': 'var(--rag-amber)',
  'rag-green': 'var(--rag-green)',
  'rag-info':  'var(--rag-info)',
};

const SIZE_TO_TOKEN: Record<TextSize, string> = {
  xs:    'var(--text-xs)',
  sm:    'var(--text-sm)',
  base:  'var(--text-base)',
  md:    'var(--text-md)',
  lg:    'var(--text-lg)',
  xl:    'var(--text-xl)',
  '2xl': 'var(--text-2xl)',
  '3xl': 'var(--text-3xl)',
  hero:  'var(--text-hero)',
};

const ROLE_TO_FAMILY: Record<TextRole, string | undefined> = {
  heading: 'var(--font-ui)',
  body:    'var(--font-ui)',
  caption: 'var(--font-ui)',
  label:   'var(--font-ui)',
  mono:    'var(--font-mono)',
};

/**
 * Typographic primitive. Replaces inline `style={{ color: 'var(--color-text-tertiary)', fontSize: 11 }}`
 * patterns across the codebase. Drives type, weight, colour from semantic tokens.
 */
export function Text({
  role = 'body',
  size = 'base',
  weight,
  tone = 'primary',
  uppercase,
  truncate,
  tabular,
  as = 'span',
  style,
  children,
  ...rest
}: Props) {
  const Element = as as 'span';
  return (
    <Element
      data-testid="text"
      data-role={role}
      data-size={size}
      data-tone={tone}
      style={{
        fontFamily: ROLE_TO_FAMILY[role],
        fontSize: SIZE_TO_TOKEN[size],
        fontWeight: weight,
        color: TONE_TO_TOKEN[tone],
        textTransform: uppercase ? 'uppercase' : undefined,
        letterSpacing: uppercase ? '0.08em' : undefined,
        whiteSpace: truncate ? 'nowrap' : undefined,
        overflow: truncate ? 'hidden' : undefined,
        textOverflow: truncate ? 'ellipsis' : undefined,
        fontVariantNumeric: tabular ? 'tabular-nums' : undefined,
        lineHeight: 1.4,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Element>
  );
}
