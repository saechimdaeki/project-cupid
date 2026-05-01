"use client";

import { useMemo, useState } from "react";
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
  const candidatesKey = useMemo(
    () => candidates.map((candidate) => candidate.id).join("|"),
    [candidates],
  );
  const [pagination, setPagination] = useState({
    candidatesKey: "",
    visibleCount: INVENTORY_PAGE_SIZE,
  });
  const visibleCount =
    pagination.candidatesKey === candidatesKey ? pagination.visibleCount : INVENTORY_PAGE_SIZE;
  const visibleCandidates = useMemo(
    () => candidates.slice(0, visibleCount),
    [candidates, visibleCount],
  );
  const hasMore = visibleCandidates.length < candidates.length;

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] xl:items-start">
      <div className="grid auto-rows-max gap-5">
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
              onClick={() =>
                setPagination({
                  candidatesKey,
                  visibleCount: visibleCount + INVENTORY_PAGE_SIZE,
                })
              }
            >
              후보 더 보기
            </Button>
          </div>
        ) : null}
      </div>

      <DashboardTimelinePanel
        events={timelineEvents}
        candidates={candidates}
        className="xl:sticky xl:top-[calc(4.25rem+1rem)] xl:max-h-[calc(100dvh-4.25rem-2rem)] xl:overflow-y-auto xl:[&::-webkit-scrollbar]:w-1 xl:[&::-webkit-scrollbar-track]:bg-transparent xl:[&::-webkit-scrollbar-thumb]:rounded-full xl:[&::-webkit-scrollbar-thumb]:bg-rose-200/60"
      />
    </section>
  );
}
