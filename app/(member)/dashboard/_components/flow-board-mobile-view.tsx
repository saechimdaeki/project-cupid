"use client";

import { cn } from "@/lib/cn";
import { getStatusBadgeClass } from "@/lib/status-ui";
import { Button } from "@/components/ui/button";
import type { AppRole, CandidateStatus } from "@/lib/types";
import type { DashboardBoardCandidate } from "./dashboard-flow-board";
import { PRIMARY_LANES } from "./dashboard-flow-board";
import { FlowBoardLane, groupCandidatesByStatus } from "./flow-board-lane";

// ── Types ─────────────────────────────────────────────────────────────────────

type FlowBoardMobileViewProps = {
  items: DashboardBoardCandidate[];
  mobileLane: CandidateStatus;
  onMobileLaneChange: (lane: CandidateStatus) => void;
  dropTarget: CandidateStatus | null;
  role: AppRole;
  canOperate: boolean;
  pendingCandidateIds: ReadonlySet<string>;
  candidateDirectory: ReadonlyMap<string, DashboardBoardCandidate>;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function FlowBoardMobileView({
  items,
  mobileLane,
  onMobileLaneChange,
  dropTarget,
  role,
  canOperate,
  pendingCandidateIds,
  candidateDirectory,
}: FlowBoardMobileViewProps) {
  return (
    <div className="grid gap-4 lg:hidden">
      {/* 레인 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PRIMARY_LANES.map((lane) => {
          const count = groupCandidatesByStatus(items, lane.key).length;

          return (
            <Button
              key={lane.key}
              variant="outline"
              onClick={() => onMobileLaneChange(lane.key)}
              className={cn(
                "shrink-0 gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                mobileLane === lane.key
                  ? cn(getStatusBadgeClass(lane.key), "border")
                  : "border border-slate-200 bg-white text-slate-600",
              )}
            >
              <span>{lane.title}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  mobileLane === lane.key ? "bg-white/15" : "bg-slate-100",
                )}
              >
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      {/* 선택된 레인 */}
      <FlowBoardLane
        status={mobileLane}
        title={PRIMARY_LANES.find((lane) => lane.key === mobileLane)?.title ?? ""}
        description={PRIMARY_LANES.find((lane) => lane.key === mobileLane)?.description ?? ""}
        compact
        items={groupCandidatesByStatus(items, mobileLane)}
        isDropTarget={dropTarget === mobileLane}
        role={role}
        canOperate={canOperate}
        pendingCandidateIds={pendingCandidateIds}
        candidateDirectory={candidateDirectory}
      />
    </div>
  );
}
