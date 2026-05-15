// Skeleton primitives. Used when API data is missing or loading — keeps
// the layout shape so the page doesn't jump when data lands.
//
// Reduced-motion users get a static muted block (no shimmer).

import type { ReactNode } from "react";

export function SkeletonBox({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-sm bg-[var(--lions-silver-light)]/40 ${className}`}
    >
      <div className="shimmer absolute inset-0" />
      {children}
    </div>
  );
}

export function SkeletonText({
  width = "8ch",
  className = "",
}: {
  width?: string | number;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-block h-3.5 rounded-sm bg-[var(--lions-silver-light)]/55 align-middle ${className}`}
      style={{ width }}
    >
      <span className="shimmer absolute inset-0" />
    </span>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <SkeletonText width="3ch" />
      <SkeletonText width="14ch" />
      <SkeletonText width="3ch" />
      <SkeletonText width="3ch" />
      <SkeletonText width="3ch" />
      <SkeletonText width="3ch" />
      <SkeletonText width="4ch" />
      <SkeletonText width="3ch" />
      <SkeletonBox className="h-7 w-24" />
    </div>
  );
}
