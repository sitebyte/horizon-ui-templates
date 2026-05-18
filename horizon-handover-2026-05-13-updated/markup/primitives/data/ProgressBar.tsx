export type ProgressBarTone = 'pass' | 'warn' | 'fail' | 'info' | 'neutral';

interface Props {
  /** Current value. Clamped to [0, max]. */
  value: number;
  /** Max value. Defaults to 100 (so a percentage). */
  max?: number;
  /** Fill colour tone. */
  tone?: ProgressBarTone;
  /** Optional gradient — fades from `tone` to `info` (used for "running"
   *  states like an EOD progress bar). */
  gradient?: boolean;
  /** ARIA label. Required — progress bars without labels fail a11y. */
  ariaLabel: string;
  /** Bar height in pixels. Defaults to 4. */
  height?: number;
  /** Test hook. */
  testId?: string;
}

/* Tone → Tailwind class for the fill. Solid backgrounds when not in
   gradient mode; gradients use a custom CSS gradient since they need
   the dynamic tone-colour-to-info fade. */
const TONE_BG_CLASS: Record<ProgressBarTone, string> = {
  pass:    'bg-rag-green',
  warn:    'bg-rag-amber',
  fail:    'bg-rag-red',
  info:    'bg-rag-info',
  neutral: 'bg-fg-tertiary',
};

const TONE_GRADIENT_VAR: Record<ProgressBarTone, string> = {
  pass:    'var(--rag-green)',
  warn:    'var(--rag-amber)',
  fail:    'var(--rag-red)',
  info:    'var(--rag-info)',
  neutral: 'var(--text-tertiary)',
};

/**
 * Horizontal progress bar — 1px-tall coloured fill on a neutral track.
 * Pure visual primitive; the value/threshold semantics are the caller's
 * concern. Use `gradient` for "running" / "EOD progress" cases where a
 * visible-progress feel matters.
 */
export function ProgressBar({
  value,
  max = 100,
  tone = 'info',
  gradient,
  ariaLabel,
  height = 4,
  testId = 'progress-bar',
}: Props) {
  const clamped = Math.max(0, Math.min(value, max));
  const pct = (clamped / max) * 100;

  return (
    <div
      data-testid={testId}
      data-tone={tone}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      className="w-full rounded-full bg-border-subtle overflow-hidden"
      style={{ height }}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${gradient ? '' : TONE_BG_CLASS[tone]}`}
        style={{
          width: `${pct}%`,
          background: gradient
            ? `linear-gradient(90deg, ${TONE_GRADIENT_VAR[tone]} 0%, var(--rag-info) 100%)`
            : undefined,
        }}
      />
    </div>
  );
}
