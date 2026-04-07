"use client";

import { CandidateCard } from "@/components/candidate-card";
import { DashboardTimelinePanel } from "./dashboard-timeline-panel";
import type { AppRole, Candidate, TimelineEvent } from "@/lib/types";

type DashboardInventoryViewProps = {
  candidates: Candidate[];
  timelineEvents: TimelineEvent[];
  role: AppRole;
};

export function DashboardInventoryView({
  candidates,
  timelineEvents,
  role,
}: DashboardInventoryViewProps) {
  return (
    <section className="grid gap-6 xl:h-[calc(100dvh-22rem)] xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
      <div className="grid auto-rows-max gap-5 xl:overflow-y-auto xl:[&::-webkit-scrollbar]:w-1 xl:[&::-webkit-scrollbar-track]:bg-transparent xl:[&::-webkit-scrollbar-thumb]:rounded-full xl:[&::-webkit-scrollbar-thumb]:bg-rose-200/60">
        {candidates.length ? (
          candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} role={role} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-rose-200/70 bg-white/60 px-6 py-14 text-center text-sm text-slate-500 backdrop-blur-sm">
            조건에 맞는 후보가 없습니다.
          </div>
        )}
      </div>

      <DashboardTimelinePanel
        events={timelineEvents}
        candidates={candidates}
        className="xl:overflow-y-auto xl:[&::-webkit-scrollbar]:w-1 xl:[&::-webkit-scrollbar-track]:bg-transparent xl:[&::-webkit-scrollbar-thumb]:rounded-full xl:[&::-webkit-scrollbar-thumb]:bg-rose-200/60"
      />
    </section>
  );
}
