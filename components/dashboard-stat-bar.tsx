"use client";

import { useMemo } from "react";
import type { Candidate, TimelineEvent } from "@/lib/types";

type DashboardStatBarProps = {
  candidates: Candidate[];
  timelineEvents: TimelineEvent[];
};

export function DashboardStatBar({ candidates, timelineEvents }: DashboardStatBarProps) {
  const stats = useMemo(() => [
    { label: "적극검토", value: candidates.filter((candidate) => candidate.status === "active").length },
    { label: "매칭중", value: candidates.filter((candidate) => candidate.status === "matched").length },
    { label: "커플", value: candidates.filter((candidate) => candidate.status === "couple").length },
    { label: "기록", value: timelineEvents.length },
  ], [candidates, timelineEvents.length]);

  return (
    <div className="flex rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur-md">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-1 flex-col items-center gap-1 border-rose-100/50 py-4 first:rounded-l-2xl last:rounded-r-2xl sm:py-5 [&:not(:last-child)]:border-r"
        >
          <strong className="text-2xl font-semibold tracking-[-0.03em] text-slate-800 sm:text-3xl">
            {stat.value}
          </strong>
          <span className="text-xs font-medium tracking-[0.04em] text-primary sm:text-sm">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
