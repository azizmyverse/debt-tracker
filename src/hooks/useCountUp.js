import { useEffect, useRef, useState } from 'react';

/**
 * Smoothly animates a number from its previous value to the new target.
 */
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(target ?? 0);
  const fromRef = useRef(target ?? 0);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number(target) || 0;
    if (from === to) {
      setValue(to);
      return;
    }
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}
