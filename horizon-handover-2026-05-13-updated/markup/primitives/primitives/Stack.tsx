import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type StackGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12;
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  direction?: 'row' | 'column';
  /** Gap as a token step (0 → 0px, 2 → 8px, …, 12 → 48px). Maps 1:1 to
   *  Tailwind's spacing scale. */
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/* Full-literal class lookups so the Tailwind content scanner picks them
   up. Never compose with template literals (`gap-${gap}`) — that breaks
   purging. */
const GAP_CLASS: Record<StackGap, string> = {
  0:  'gap-0',
  1:  'gap-1',
  2:  'gap-2',
  3:  'gap-3',
  4:  'gap-4',
  5:  'gap-5',
  6:  'gap-6',
  7:  'gap-7',
  8:  'gap-8',
  10: 'gap-10',
  12: 'gap-12',
};

const ALIGN_CLASS: Record<StackAlign, string> = {
  start:    'items-start',
  center:   'items-center',
  end:      'items-end',
  stretch:  'items-stretch',
  baseline: 'items-baseline',
};

const JUSTIFY_CLASS: Record<StackJustify, string> = {
  start:   'justify-start',
  center:  'justify-center',
  end:     'justify-end',
  between: 'justify-between',
  around:  'justify-around',
};

/**
 * Flex container with token-driven gap. Replaces ad-hoc
 *   <div className="flex flex-col gap-3" style={{...}}>
 * patterns scattered across feature folders.
 */
export function Stack({
  direction = 'column',
  gap = 0,
  align,
  justify,
  wrap,
  className,
  style,
  children,
  ...rest
}: Props) {
  const classes = [
    'flex',
    direction === 'row' ? 'flex-row' : 'flex-col',
    GAP_CLASS[gap],
    align ? ALIGN_CLASS[align] : '',
    justify ? JUSTIFY_CLASS[justify] : '',
    wrap ? 'flex-wrap' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      data-testid="stack"
      data-direction={direction}
      className={classes}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}
