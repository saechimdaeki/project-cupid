"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/cn";
import { getLaneSurfaceClass } from "@/lib/status-ui";
import { Badge } from "@/components/ui/badge";
import type { AppRole, CandidateStatus } from "@/lib/types";
import type { DashboardBoardCandidate } from "./dashboard-flow-board";
import { FlowBoardActiveLaneContent } from "./flow-board-active-lane";
import { FlowBoardPairedLaneContent } from "./flow-board-paired-lane";

// ── Types ─────────────────────────────────────────────────────────────────────

export type FlowBoardLaneProps = {
  status: CandidateStatus;
  title: string;
  description: string;
  compact?: boolean;
  items: DashboardBoardCandidate[];
  isDropTarget: boolean;
  role: AppRole;
  canOperate: boolean;
  pendingCandidateIds: ReadonlySet<string>;
  candidateDirectory: ReadonlyMap<string, DashboardBoardCandidate>;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function groupCandidatesByStatus(
  candidates: DashboardBoardCandidate[],
  status: CandidateStatus,
) {
  return candidates.filter((candidate) => candidate.status === status);
}

// ── DroppableLane ─────────────────────────────────────────────────────────────

type DroppableLaneProps = {
  id: string;
  isDropTarget: boolean;
  className?: string;
  children: React.ReactNode;
};

function DroppableLane({ id, isDropTarget, className, children }: DroppableLaneProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <article
      ref={setNodeRef}
      className={cn(
        className,
        isDropTarget && "ring-2 ring-rose-400/60 ring-offset-2 ring-offset-rose-50/80",
      )}
    >
      {children}
    </article>
  );
}

// ── FlowBoardLane ─────────────────────────────────────────────────────────────

export function FlowBoardLane({
  status,
  title,
  description,
  compact = false,
  items,
  isDropTarget,
  role,
  canOperate,
  pendingCandidateIds,
  candidateDirectory,
}: FlowBoardLaneProps) {
  const isPairedLane = status === "matched" || status === "couple";

  return (
    <DroppableLane
      id={status}
      isDropTarget={isDropTarget}
      className={cn(
        "flex min-h-0 flex-col rounded-[26px] border border-white/70 p-5 shadow-[0_10px_40px_rgb(244,114,182,0.08)] backdrop-blur-sm",
        getLaneSurfaceClass(status),
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {!compact ? (
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
          ) : null}
        </div>
        <Badge className="rounded-full border border-rose-100/60 bg-white/90 px-3.5 py-1 text-sm font-semibold text-rose-600 shadow-sm">
          {items.length}
        </Badge>
      </div>

      {isPairedLane ? (
        <FlowBoardPairedLaneContent
          items={items}
          role={role}
          canOperate={canOperate}
          pendingCandidateIds={pendingCandidateIds}
        />
      ) : (
        <FlowBoardActiveLaneContent
          items={items}
          role={role}
          canOperate={canOperate}
          pendingCandidateIds={pendingCandidateIds}
          candidateDirectory={candidateDirectory}
        />
      )}
    </DroppableLane>
  );
}
