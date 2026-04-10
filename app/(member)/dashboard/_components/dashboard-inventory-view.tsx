"use client";

import { useEffect, useMemo, useState } from "react";
import { CandidateCard } from "@/components/candidate-card";
import { DashboardTimelinePanel } from "./dashboard-timeline-panel";
import { Button } from "@/components/ui/button";
import type { AppRole, Candidate, TimelineEvent } from "@/lib/types";

const INVENTORY_PAGE_SIZE = 24;

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
  const [visibleCount, setVisibleCount] = useState(INVENTORY_PAGE_SIZE);
  const visibleCandidates = useMemo(
    () => candidates.slice(0, visibleCount),
    [candidates, visibleCount],
  );
  const hasMore = visibleCandidates.length < candidates.length;

  useEffect(() => {
    setVisibleCount(INVENTORY_PAGE_SIZE);
  }, [candidates]);

  return (
    <section className="grid gap-6 xl:h-[calc(100dvh-22rem)] xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
      <div className="grid auto-rows-max gap-5 xl:overflow-y-auto xl:[&::-webkit-scrollbar]:w-1 xl:[&::-webkit-scrollbar-track]:bg-transparent xl:[&::-webkit-scrollbar-thumb]:rounded-full xl:[&::-webkit-scrollbar-thumb]:bg-rose-200/60">
        {visibleCandidates.length ? (
          visibleCandidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} role={role} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-rose-200/70 bg-white/60 px-6 py-14 text-center text-sm text-slate-500 backdrop-blur-sm">
            조건에 맞는 후보가 없습니다.
          </div>
        )}

        {hasMore ? (
          <div className="flex justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-rose-200/80 bg-white/80 px-5"
              onClick={() => setVisibleCount((count) => count + INVENTORY_PAGE_SIZE)}
            >
              후보 더 보기
            </Button>
          </div>
        ) : null}
      </div>

      <DashboardTimelinePanel
        events={timelineEvents}
        candidates={candidates}
        className="xl:overflow-y-auto xl:[&::-webkit-scrollbar]:w-1 xl:[&::-webkit-scrollbar-track]:bg-transparent xl:[&::-webkit-scrollbar-thumb]:rounded-full xl:[&::-webkit-scrollbar-thumb]:bg-rose-200/60"
      />
    </section>
  );
}
