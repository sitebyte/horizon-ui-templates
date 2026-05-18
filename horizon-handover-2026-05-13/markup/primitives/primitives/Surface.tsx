import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type SurfaceTone = 'base' | 'raised' | 'elevated' | 'overlay';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  /** Surface tone — drives the background colour from the semantic ramp. */
  tone?: SurfaceTone;
  /** Adds a 1px subtle border. Use when the surface needs to read as a card. */
  bordered?: boolean;
  /** Optional extra Tailwind classes. */
  className?: string;
  /** Inline style escape hatch. Token-driven values only please. */
  style?: CSSProperties;
  children?: ReactNode;
}

/* Tone → Tailwind utility class. Resolves through the @theme bridge in
   client/src/index.css to var(--surface-*), so theme/skin overrides flow
   through. `overlay` is the only one that still uses an inline rgba,
   because there's no semantic-named overlay utility — kept as a special
   case. */
const TONE_TO_CLASS: Record<SurfaceTone, string> = {
  base:     'bg-background',
  raised:   'bg-card',
  elevated: 'bg-muted',
  overlay:  '',
};

const TONE_TO_INLINE: Partial<Record<SurfaceTone, CSSProperties>> = {
  overlay: { background: 'var(--surface-overlay)' },
};

export function Surface({
  tone = 'raised',
  bordered = true,
  className,
  style,
  children,
  ...rest
}: Props) {
  const toneClass = TONE_TO_CLASS[tone];
  const borderClass = bordered ? 'border border-border-subtle' : '';
  const merged = [toneClass, borderClass, className].filter(Boolean).join(' ');

  return (
    <div
      data-testid="surface"
      data-tone={tone}
      className={merged}
      style={{ ...TONE_TO_INLINE[tone], ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
