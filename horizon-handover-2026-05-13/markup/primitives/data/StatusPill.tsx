import type { ReactNode } from 'react';

/**
 * Three kinds of pill. Colour-is-information rule: severity and lifecycle
 * pills are SATURATED (solid bg, white text) so their signal carries at
 * glance distance. Informational pills are SUBTLE (15% bg, tone text)
 * because they're hints / filter chips / count badges, not status.
 *
 *  - `informational` — free-edit pills (filter chips, count badges,
 *    ad-hoc tags). Tone is a hint, not a signal. SUBTLE.
 *
 *  - `severity` — open severity for ad-hoc severity contexts (an
 *    integrity check's PASS/WARN/FAIL pill). SATURATED. Label defaults
 *    to the tone uppercase.
 *
 *  - `lifecycle` — closed union of settlement + trade lifecycle states.
 *    Tone is derived; pages can't override the colour for a given
 *    lifecycle state (regulator-defensible). SATURATED.
 *
 * The encoded text + glyph carries identity, not just the colour —
 * settlements has 7+ states, the four-colour palette can't carry all of
 * them.
 */

export type StatusPillTone = 'pass' | 'warn' | 'fail' | 'info' | 'running' | 'neutral';

/** Severity pills are restricted to 3 tones — severity is severity. */
export type SeverityTone = 'pass' | 'warn' | 'fail';

export type LifecycleState =
  // Settlements
  | 'draft'
  | 'submitted'
  | 'pending-review'
  | 'approved'
  | 'rejected'
  | 'posted'
  | 'reversed'
  // Trade lifecycle
  | 'fo-entered'
  | 'fo-validated'
  | 'trade-checked'
  | 'cancelled'
  // Account lifecycle (users / service accounts)
  | 'active'
  | 'inactive';

const LIFECYCLE_TO_TONE: Record<LifecycleState, StatusPillTone> = {
  draft:           'neutral',
  submitted:       'info',
  'pending-review': 'warn',
  approved:        'pass',
  rejected:        'fail',
  posted:          'pass',
  reversed:        'fail',
  'fo-entered':    'neutral',
  'fo-validated':  'info',
  'trade-checked': 'pass',
  cancelled:       'fail',
  active:          'pass',
  inactive:        'neutral',
};

const LIFECYCLE_TO_LABEL: Record<LifecycleState, string> = {
  draft:            'DRAFT',
  submitted:        'SUBMITTED',
  'pending-review': 'PENDING REVIEW',
  approved:         'APPROVED',
  rejected:         'REJECTED',
  posted:           'POSTED',
  reversed:         'REVERSED',
  'fo-entered':     'FO ENTERED',
  'fo-validated':   'FO VALIDATED',
  'trade-checked':  'TRADE CHECKED',
  cancelled:        'CANCELLED',
  active:           'ACTIVE',
  inactive:         'INACTIVE',
};

const SEVERITY_TO_LABEL: Record<SeverityTone, string> = {
  pass: 'PASS',
  warn: 'WARN',
  fail: 'FAIL',
};

/* Saturated — solid background, white text. Used for severity + lifecycle
   (high-signal state). The point is that scanning a table of these
   carries the RAG signal at glance distance. */
const TONE_CLASS_SATURATED: Record<StatusPillTone, string> = {
  pass:    'bg-rag-green text-white',
  warn:    'bg-rag-amber text-white',
  fail:    'bg-rag-red text-white',
  info:    'bg-rag-info text-white',
  running: 'bg-rag-info text-white',
  neutral: 'bg-fg-tertiary text-white',
};

/* Subtle — 15% bg + tone text. Used for informational chips (filter
   badges, ad-hoc tags where tone is a hint, not signal). */
const TONE_CLASS_SUBTLE: Record<StatusPillTone, string> = {
  pass:    'bg-rag-green/15 text-rag-green',
  warn:    'bg-rag-amber/15 text-rag-amber',
  fail:    'bg-rag-red/15 text-rag-red',
  info:    'bg-rag-info/15 text-rag-info',
  running: 'bg-rag-info/15 text-rag-info',
  neutral: 'bg-fg-tertiary/15 text-fg-tertiary',
};

type InformationalProps = {
  kind: 'informational';
  tone: StatusPillTone;
  label: string;
};

type SeverityProps = {
  kind: 'severity';
  tone: SeverityTone;
  /** Defaults to the tone uppercase ("PASS"/"WARN"/"FAIL"). */
  label?: string;
};

type LifecycleProps = {
  kind: 'lifecycle';
  /** One of the closed-union lifecycle states. Tone is derived. */
  lifecycle: LifecycleState;
};

type CommonProps = {
  /** Optional leading icon slot. */
  icon?: ReactNode;
  /** Click handler — when set, renders as a button (focusable, role=button). */
  onClick?: () => void;
};

export type StatusPillProps =
  (InformationalProps | SeverityProps | LifecycleProps) & CommonProps;

/**
 * `<StatusPill kind="severity"      tone="fail" />`            → "FAIL" red solid
 * `<StatusPill kind="severity"      tone="warn" label="STALE" />` → "STALE" amber
 * `<StatusPill kind="lifecycle"     lifecycle="approved" />`   → "APPROVED" green solid
 * `<StatusPill kind="informational" tone="info" label="EOD" />` → "EOD" subtle blue
 */
export function StatusPill(props: StatusPillProps) {
  const { icon, onClick } = props;

  let tone: StatusPillTone;
  let label: string;
  let saturated: boolean;

  switch (props.kind) {
    case 'informational':
      tone = props.tone;
      label = props.label;
      saturated = false;
      break;
    case 'severity':
      tone = props.tone;
      label = props.label ?? SEVERITY_TO_LABEL[props.tone];
      saturated = true;
      break;
    case 'lifecycle':
      tone = LIFECYCLE_TO_TONE[props.lifecycle];
      label = LIFECYCLE_TO_LABEL[props.lifecycle];
      saturated = true;
      break;
  }

  const toneClass = saturated ? TONE_CLASS_SATURATED[tone] : TONE_CLASS_SUBTLE[tone];
  const classes = `inline-flex items-center gap-1 px-2 py-px rounded-sm text-xs font-semibold uppercase tracking-wider font-ui leading-loose border-0 ${toneClass} ${onClick ? 'cursor-pointer' : ''}`.trim();

  if (onClick) {
    return (
      <button
        type="button"
        data-testid="status-pill"
        data-kind={props.kind}
        data-tone={tone}
        onClick={onClick}
        className={classes}
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <span
      data-testid="status-pill"
      data-kind={props.kind}
      data-tone={tone}
      className={classes}
    >
      {icon}
      {label}
    </span>
  );
}
