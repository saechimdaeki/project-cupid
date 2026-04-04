"use client";

import {
  DashboardFlowBoard,
  type DashboardBoardCandidate,
} from "@/components/dashboard-flow-board";
import type { AppRole } from "@/lib/types";

type DashboardFlowViewProps = {
  visibleCandidates: DashboardBoardCandidate[];
  allCandidates: DashboardBoardCandidate[];
  role: AppRole;
};

export function DashboardFlowView({
  visibleCandidates,
  allCandidates,
  role,
}: DashboardFlowViewProps) {
  return (
    <section className="rounded-[28px] border border-white/50 bg-transparent p-1">
      <DashboardFlowBoard
        candidates={visibleCandidates}
        allCandidates={allCandidates}
        role={role}
      />
    </section>
  );
}
