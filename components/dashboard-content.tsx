"use client";

import { type DashboardBoardCandidate } from "@/components/dashboard-flow-board";
import { DashboardFlowView } from "@/components/dashboard-flow-view";
import { DashboardInventoryView } from "@/components/dashboard-inventory-view";
import { canEditCandidates } from "@/lib/role-utils";
import { DashboardViewMode } from "@/lib/types";
import type { AppRole, Candidate, TimelineEvent } from "@/lib/types";

type DashboardContentProps = {
  view: DashboardViewMode;
  filteredCandidates: Candidate[];
  boardCandidates: DashboardBoardCandidate[];
  visibleBoardCandidates: DashboardBoardCandidate[];
  timelineEvents: TimelineEvent[];
  role: AppRole;
  onSelectTimelineEvent: (event: TimelineEvent) => void;
  onOpenHistoryList: () => void;
};

export function DashboardContent({
  view,
  filteredCandidates,
  boardCandidates,
  visibleBoardCandidates,
  timelineEvents,
  role,
  onSelectTimelineEvent,
  onOpenHistoryList,
}: DashboardContentProps) {
  return (
    <>
      {view === DashboardViewMode.FLOW ? (
        <DashboardFlowView
          visibleCandidates={visibleBoardCandidates}
          allCandidates={boardCandidates}
          role={role}
        />
      ) : null}

      {view === DashboardViewMode.INVENTORY ? (
        <DashboardInventoryView
          candidates={filteredCandidates}
          timelineEvents={timelineEvents}
          role={role}
          onSelectTimelineEvent={onSelectTimelineEvent}
          onOpenHistoryList={onOpenHistoryList}
        />
      ) : null}

      {!canEditCandidates(role) ? (
        <div className="rounded-[24px] border border-white/60 bg-white/70 px-5 py-4 text-sm text-slate-600 shadow-[0_8px_30px_rgb(244,114,182,0.08)] backdrop-blur-md">
          현재 권한은 보기 전용입니다. 상세 이동과 상태 변경은 어드민 이상 권한에서 가능합니다.
        </div>
      ) : null}
    </>
  );
}
