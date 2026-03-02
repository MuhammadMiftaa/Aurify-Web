import { cn } from "@/lib/utils";
import type React from "react";

// ── Skeleton ──

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-(--muted)", className)}
      style={style}
    />
  );
}

// ── Skeleton variants ──

export function SkeletonKPICard() {
  return (
    <div className="flex flex-1 flex-col gap-2 overflow-hidden rounded-xl border border-(--border) bg-(--card) px-5 py-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function SkeletonChart({ height = 220 }: { height?: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-1" style={{ height }}>
        {[65, 45, 80, 55, 70, 40, 90, 60, 75, 50, 85, 45].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonCategoryList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-1 w-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonHealthBars({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-1 w-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDonut() {
  return (
    <div className="flex items-center gap-6">
      <Skeleton className="h-40 w-40 rounded-full shrink-0" />
      <div className="flex flex-1 flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

export function SkeletonNetWorth() {
  return (
    <div className="flex items-center gap-6">
      <Skeleton className="h-40 w-40 rounded-full shrink-0" />
      <div className="flex flex-1 flex-col gap-3">
        <div className="space-y-0.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-28" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton className="h-0.75 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonInvestmentSummary() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex justify-between border-b border-(--border) pb-2"
          >
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
