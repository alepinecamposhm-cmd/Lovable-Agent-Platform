import { animate, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

type Options = {
  durationMs?: number;
  round?: boolean;
};

export function useAnimatedNumber(value: number | null | undefined, options?: Options) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState<number | null>(value ?? null);
  const hasValueRef = useRef(false);
  const prevRef = useRef<number | null>(null);

  useEffect(() => {
    if (value == null || Number.isNaN(value)) {
      setDisplay(null);
      return;
    }

    // Do not animate the first real value to avoid "bouncy" first paint.
    if (!hasValueRef.current) {
      hasValueRef.current = true;
      prevRef.current = value;
      setDisplay(value);
      return;
    }

    const from = prevRef.current ?? value;
    const to = value;
    prevRef.current = to;

    if (reduceMotion) {
      setDisplay(to);
      return;
    }

    const duration = (options?.durationMs ?? 600) / 1000;
    const round = options?.round ?? true;

    const controls = animate(from, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplay(round ? Math.round(latest) : latest);
      },
    });

    return () => controls.stop();
  }, [value, reduceMotion, options?.durationMs, options?.round]);

  return display;
}

