"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Final value to count up to. */
  to: number;
  /** Decimal places. */
  decimals?: number;
  /** Animation duration in ms. */
  duration?: number;
  /** Animate once and stay (default true) or re-trigger on re-entry. */
  once?: boolean;
  /** Static text appended after the number (e.g. "–2" for a record). */
  suffix?: string;
  /** Static text prepended before the number. */
  prefix?: string;
  className?: string;
}

/**
 * Counts a number up from 0 to `to` when it scrolls into view, using
 * cubic ease-out for a "lands on the value" feel.
 *
 * Server-component-safe: takes only primitive props (numbers + strings),
 * no function props — Next's server→client serialization rejects fns.
 *
 * Reduced-motion users see the final value immediately — no animation.
 */
export function CountUp({
  to,
  decimals = 0,
  duration = 1200,
  once = true,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (reduced) {
      setValue(to);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !started.current)) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            // Cubic ease-out — fast at start, slows landing on value
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(to * eased);
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          if (once) observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [to, duration, once]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
