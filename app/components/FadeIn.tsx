"use client";

import { useEffect, useRef, useState } from "react";

interface FadeInProps {
  children: React.ReactNode;
  /** Delay before fade in (ms). */
  delay?: number;
  className?: string;
}

/**
 * Wraps a section and fades it in (opacity + small translateY) when it
 * enters the viewport. The CSS lives in globals.css (.fade-in /
 * .fade-in.is-visible) so it can be killed wholesale via
 * prefers-reduced-motion.
 *
 * Fires once per element — once shown, stays shown.
 */
export function FadeIn({
  children,
  delay = 0,
  className = "",
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (reduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setVisible(true), delay);
          } else {
            setVisible(true);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`fade-in ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
