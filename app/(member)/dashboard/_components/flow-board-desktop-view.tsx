"use client";

import type { AppRole, CandidateStatus } from "@/lib/types";
import type { DashboardBoardCandidate } from "./dashboard-flow-board";
import { PRIMARY_LANES } from "./dashboard-flow-board";
import { FlowBoardLane, groupCandidatesByStatus } from "./flow-board-lane";

// ── Types ─────────────────────────────────────────────────────────────────────

type FlowBoardDesktopViewProps = {
  items: DashboardBoardCandidate[];
  dropTarget: CandidateStatus | null;
  role: AppRole;
  canOperate: boolean;
  pendingCandidateIds: ReadonlySet<string>;
  draggingId: string | null;
  candidateDirectory: ReadonlyMap<string, DashboardBoardCandidate>;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function FlowBoardDesktopView({
  items,
  dropTarget,
  role,
  canOperate,
  pendingCandidateIds,
  draggingId,
  candidateDirectory,
}: FlowBoardDesktopViewProps) {
  return (
    <div className="hidden gap-5 lg:grid lg:grid-cols-3 lg:h-[calc(100dvh-22rem)] xl:gap-6">
      {PRIMARY_LANES.map((lane) => (
        <FlowBoardLane
          key={lane.key}
          status={lane.key}
          title={lane.title}
          description={lane.description}
          items={groupCandidatesByStatus(items, lane.key)}
          isDropTarget={dropTarget === lane.key}
          role={role}
          canOperate={canOperate}
          pendingCandidateIds={pendingCandidateIds}
          draggingId={draggingId}
          candidateDirectory={candidateDirectory}
        />
      ))}
    </div>
  );
}
