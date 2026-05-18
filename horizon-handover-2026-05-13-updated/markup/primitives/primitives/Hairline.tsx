interface Props {
  /** Direction of the hairline. */
  direction?: 'horizontal' | 'vertical';
  /** Token-driven colour: 'subtle' is the default for inner-card separators;
   *  'default' for outer card edges. */
  tone?: 'subtle' | 'default' | 'strong';
}

/* Tone → Tailwind class (resolves through the @theme bridge to
   var(--border-subtle/default/strong)). Full literal strings so the
   Tailwind content-scanner picks them up. */
const HORIZONTAL_TONE_CLASS = {
  subtle:  'border-t border-border-subtle w-full',
  default: 'border-t border-border w-full',
  strong:  'border-t border-border-strong w-full',
} as const;

const VERTICAL_TONE_CLASS = {
  subtle:  'border-l border-border-subtle h-full',
  default: 'border-l border-border h-full',
  strong:  'border-l border-border-strong h-full',
} as const;

/**
 * 1px themed divider. Replaces the recurring
 *   <div style={{ borderTop: '1px solid var(--color-border)' }} />
 * pattern. Composes with `Stack` for grouped layouts.
 */
export function Hairline({ direction = 'horizontal', tone = 'subtle' }: Props) {
  const className = direction === 'horizontal'
    ? HORIZONTAL_TONE_CLASS[tone]
    : VERTICAL_TONE_CLASS[tone];
  return <div data-testid="hairline" data-direction={direction} data-tone={tone} className={className} aria-hidden />;
}
