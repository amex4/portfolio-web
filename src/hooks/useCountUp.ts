import { useEffect, useState } from 'react';

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Animates 0 → target once `start` is true. Jumps straight to target if `instant`. */
export function useCountUp(target: number, start: boolean, instant: boolean, durationMs = 1400) {
  const [value, setValue] = useState(instant ? target : 0);

  useEffect(() => {
    if (!start) return;
    if (instant) {
      setValue(target);
      return;
    }
    let frame = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      setValue(Math.round(target * easeOutCubic(p)));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, start, instant, durationMs]);

  return value;
}
