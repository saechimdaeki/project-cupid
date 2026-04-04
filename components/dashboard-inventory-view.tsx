"use client";

import { useState } from "react";
import { CandidateCard } from "@/components/candidate-card";
import { DashboardTimelinePanel, TimelineIcon } from "@/components/dashboard-timeline-panel";
import { Button } from "@/components/ui/button";
import type { AppRole, Candidate, TimelineEvent } from "@/lib/types";

type DashboardInventoryViewProps = {
  candidates: Candidate[];
  timelineEvents: TimelineEvent[];
  role: AppRole;
  onSelectTimelineEvent: (event: TimelineEvent) => void;
  onOpenHistoryList: () => void;
};

export function DashboardInventoryView({
  candidates,
  timelineEvents,
  role,
  onSelectTimelineEvent,
  onOpenHistoryList,
}: DashboardInventoryViewProps) {
  const [timelineOpen, setTimelineOpen] = useState(false);

  return (
    <>
      <section className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)]">
        <div className="grid gap-6">
          {candidates.length ? (
            candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} role={role} />
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-rose-200/70 bg-white/60 px-6 py-14 text-center text-sm text-slate-500 shadow-[0_8px_32px_rgb(244,114,182,0.08)] backdrop-blur-sm">
              조건에 맞는 후보가 없습니다. 필터를 조금 넓혀 다시 확인해보세요.
            </div>
          )}
        </div>

        <div className="hidden xl:block">
          <DashboardTimelinePanel
            events={timelineEvents}
            className="sticky top-28 w-full min-w-[18rem]"
            onSelectEvent={onSelectTimelineEvent}
            onViewAll={onOpenHistoryList}
          />
        </div>
      </section>

      <Button
        onClick={() => setTimelineOpen(true)}
        className="fixed bottom-24 right-6 z-30 size-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-[0_12px_40px_rgb(244,114,182,0.45)] transition hover:scale-[1.03] md:bottom-6 xl:hidden"
        aria-label="최근 매칭 기록 열기"
      >
        <TimelineIcon />
      </Button>

      {timelineOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-900/30 backdrop-blur-[2px] xl:hidden">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0 cursor-pointer"
            onClick={() => setTimelineOpen(false)}
          />
          <div className="relative w-full rounded-t-[32px] border border-white/60 bg-gradient-to-b from-rose-50/95 to-pink-50/90 p-5 shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-rose-200/80" />
            <div className="mb-4 flex justify-end">
              <Button
                variant="ghost"
                onClick={() => setTimelineOpen(false)}
                className="text-sm font-medium text-rose-500 hover:bg-transparent hover:text-rose-700"
              >
                닫기
              </Button>
            </div>
            <DashboardTimelinePanel
              embedInSheet
              events={timelineEvents}
              onSelectEvent={(event) => {
                setTimelineOpen(false);
                onSelectTimelineEvent(event);
              }}
              onViewAll={() => {
                setTimelineOpen(false);
                onOpenHistoryList();
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
