import type { ComponentProps } from 'react';
import { Text } from './Text';

type Props = Omit<ComponentProps<typeof Text>, 'role' | 'tabular'>;

/**
 * Monospace + tabular-nums shortcut for `Text`. Use for every number, code,
 * timestamp, identifier, or anything where column alignment matters.
 *
 * `<Mono size="lg">42.5%</Mono>`  is equivalent to
 * `<Text role="mono" size="lg" tabular>42.5%</Text>`.
 */
export function Mono(props: Props) {
  return <Text role="mono" tabular {...props} />;
}
