import { useEffect, useState } from 'react';

/**
 * True for `durationMs` after `trigger` last changed.
 *
 * The expiry is recorded rather than a boolean flag, so the effect never calls
 * `setState` synchronously — only the timer callback does. Setting state in an
 * effect body trips React Compiler's lint rules.
 */
export function useTransientFlag(
  trigger: number | null,
  durationMs: number,
): boolean {
  const [expired, setExpired] = useState<number | null>(null);

  useEffect(() => {
    if (trigger === null) return undefined;

    const timer = setTimeout(() => setExpired(trigger), durationMs);
    return () => clearTimeout(timer);
  }, [trigger, durationMs]);

  return trigger !== null && expired !== trigger;
}
