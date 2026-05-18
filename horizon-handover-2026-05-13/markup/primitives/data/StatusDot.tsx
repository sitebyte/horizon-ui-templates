export type StatusDotTone = 'pass' | 'warn' | 'fail' | 'info' | 'neutral' | 'running';

interface Props {
  tone?: StatusDotTone;
  /** Bigger dot for status badges that aren't paired with a label. */
  size?: 'xs' | 'sm' | 'md';
  /** Animate a slow pulse (`running` tone gets it by default). */
  pulse?: boolean;
  /** Glow shadow — automatic on `fail` tone. */
  glow?: boolean;
  /** ARIA label override; defaults to the tone name. */
  label?: string;
}

const TONE_BG_CLASS: Record<StatusDotTone, string> = {
  pass:    'bg-rag-green',
  warn:    'bg-rag-amber',
  fail:    'bg-rag-red',
  info:    'bg-rag-info',
  neutral: 'bg-fg-tertiary',
  running: 'bg-rag-info',
};

const TONE_GLOW_CLASS: Record<StatusDotTone, string> = {
  pass:    'shadow-[0_0_6px_var(--rag-green)]',
  warn:    'shadow-[0_0_6px_var(--rag-amber)]',
  fail:    'shadow-[0_0_6px_var(--rag-red)]',
  info:    'shadow-[0_0_6px_var(--rag-info)]',
  neutral: 'shadow-[0_0_6px_var(--text-tertiary)]',
  running: 'shadow-[0_0_6px_var(--rag-info)]',
};

const SIZE_CLASS: Record<NonNullable<Props['size']>, string> = {
  xs: 'w-1 h-1',
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
};

/**
 * A small coloured status dot. The tiny, atomic indicator that sits next
 * to a label or counter to carry the RAG signal.
 */
export function StatusDot({ tone = 'neutral', size = 'sm', pulse, glow, label }: Props) {
  const showGlow = glow ?? tone === 'fail';
  const showPulse = pulse ?? tone === 'running';

  const classes = [
    'inline-block rounded-full shrink-0',
    SIZE_CLASS[size],
    TONE_BG_CLASS[tone],
    showGlow ? TONE_GLOW_CLASS[tone] : '',
    showPulse ? 'animate-[horizon-pulse_1.6s_ease-in-out_infinite]' : '',
  ].filter(Boolean).join(' ');

  return (
    <span
      data-testid="status-dot"
      data-tone={tone}
      role="img"
      aria-label={label ?? tone}
      className={classes}
    />
  );
}
