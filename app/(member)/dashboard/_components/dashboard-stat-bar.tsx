"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import type { Candidate, TimelineEvent } from "@/lib/types";

type DashboardStatBarProps = {
  candidates: Candidate[];
  timelineEvents: TimelineEvent[];
};

const STATS_CONFIG = [
  { key: "active", label: "적극검토" },
  { key: "matched", label: "매칭중" },
  { key: "couple", label: "커플" },
  { key: "record", label: "매칭기록" },
] as const;

export function DashboardStatBar({ candidates, timelineEvents }: DashboardStatBarProps) {
  const values = useMemo(
    () => ({
      active: candidates.filter((candidate) => candidate.status === "active").length,
      matched: candidates.filter((candidate) => candidate.status === "matched").length,
      couple: candidates.filter((candidate) => candidate.status === "couple").length,
      record: timelineEvents.length,
    }),
    [candidates, timelineEvents.length],
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4">
      {STATS_CONFIG.map((stat, index) => (
        <div
          key={stat.key}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 px-3 py-2.5 sm:gap-2.5 sm:px-4 sm:py-3.5",
            index < 2 && "border-b border-slate-100 sm:border-b-0",
            index % 2 === 0 && "border-r border-slate-100",
            index === 1 && "sm:border-r sm:border-slate-100",
          )}
        >
          <span className="text-sm font-medium text-slate-500">{stat.label}</span>
          <strong className="text-sm font-semibold tabular-nums text-primary">
            {values[stat.key]}
          </strong>
        </div>
      ))}
    </div>
  );
}
