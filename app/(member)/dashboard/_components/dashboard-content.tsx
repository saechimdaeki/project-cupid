"use client";

import {
  DashboardFlowBoard,
  type DashboardBoardCandidate,
} from "./dashboard-flow-board";
import { DashboardInventoryView } from "./dashboard-inventory-view";
import { DashboardViewMode } from "@/lib/types";
import type { AppRole, Candidate, TimelineEvent } from "@/lib/types";

type DashboardContentProps = {
  view: DashboardViewMode;
  filteredCandidates: Candidate[];
  boardCandidates: DashboardBoardCandidate[];
  visibleBoardCandidates: DashboardBoardCandidate[];
  timelineEvents: TimelineEvent[];
  role: AppRole;
};

export function DashboardContent({
  view,
  filteredCandidates,
  boardCandidates,
  visibleBoardCandidates,
  timelineEvents,
  role,
}: DashboardContentProps) {
  return (
    <>
      {view === DashboardViewMode.FLOW ? (
        <section className="rounded-[28px] border border-white/50 bg-transparent p-1">
          <DashboardFlowBoard
            candidates={visibleBoardCandidates}
            allCandidates={boardCandidates}
            role={role}
          />
        </section>
      ) : null}

      {view === DashboardViewMode.INVENTORY ? (
        <DashboardInventoryView
          candidates={filteredCandidates}
          timelineEvents={timelineEvents}
          role={role}
        />
      ) : null}

    </>
  );
}
