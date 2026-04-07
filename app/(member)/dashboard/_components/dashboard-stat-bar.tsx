"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import type { Candidate, TimelineEvent } from "@/lib/types";

type DashboardStatBarProps = {
  candidates: Candidate[];
  timelineEvents: TimelineEvent[];
};

const STATS_CONFIG = [
  {
    key: "active",
    label: "적극검토",
    accentClass: "bg-rose-500",
    valueClass: "text-rose-500",
  },
  {
    key: "matched",
    label: "매칭중",
    accentClass: "bg-blue-500",
    valueClass: "text-blue-500",
  },
  {
    key: "couple",
    label: "커플",
    accentClass: "bg-emerald-500",
    valueClass: "text-emerald-500",
  },
  {
    key: "record",
    label: "기록",
    accentClass: "bg-amber-400",
    valueClass: "text-amber-500",
  },
] as const;

export function DashboardStatBar({ candidates, timelineEvents }: DashboardStatBarProps) {
  const values = useMemo(() => ({
    active:  candidates.filter((candidate) => candidate.status === "active").length,
    matched: candidates.filter((candidate) => candidate.status === "matched").length,
    couple:  candidates.filter((candidate) => candidate.status === "couple").length,
    record:  timelineEvents.length,
  }), [candidates, timelineEvents.length]);

  return (
    <div className="grid grid-cols-4 divide-x divide-rose-100/60 overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur-md">
      {STATS_CONFIG.map((stat) => (
        <div key={stat.key} className="flex flex-col items-center gap-1 px-2 py-4 sm:py-5">
          <span className={cn("mb-1 h-0.5 w-6 rounded-full", stat.accentClass)} />
          <strong className={cn("text-xl font-semibold tabular-nums sm:text-2xl", stat.valueClass)}>
            {values[stat.key]}
          </strong>
          <span className="text-[11px] font-medium text-slate-500">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
