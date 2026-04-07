"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/cn";
import { getLaneSurfaceClass } from "@/lib/status-ui";
import { Badge } from "@/components/ui/badge";
import type { AppRole, CandidateStatus } from "@/lib/types";
import type { DashboardBoardCandidate } from "./dashboard-flow-board";
import { FlowBoardCard } from "./flow-board-card";
import { FlowBoardPairCard } from "./flow-board-pair-card";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PairedLaneRow = {
  male: DashboardBoardCandidate | null;
  female: DashboardBoardCandidate | null;
};

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
  draggingId: string | null;
  candidateDirectory: ReadonlyMap<string, DashboardBoardCandidate>;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function groupCandidatesByStatus(
  candidates: DashboardBoardCandidate[],
  status: CandidateStatus,
) {
  return candidates.filter((candidate) => candidate.status === status);
}

function candidateCreatedAt(candidate: DashboardBoardCandidate): string {
  return candidate.created_at ?? "1970-01-01T00:00:00.000Z";
}

function sortByCreatedAtDesc(list: DashboardBoardCandidate[]): DashboardBoardCandidate[] {
  return [...list].sort((a, b) => candidateCreatedAt(b).localeCompare(candidateCreatedAt(a)));
}

function newestCreatedAtInPair(row: PairedLaneRow): string {
  const times = [row.male, row.female].filter(Boolean).map((c) => candidateCreatedAt(c!));
  if (!times.length) return "1970-01-01T00:00:00.000Z";
  return times.reduce((best, t) => (t > best ? t : best), times[0]);
}

function buildPairedLaneRows(laneItems: DashboardBoardCandidate[]): PairedLaneRow[] {
  const byId = new Map(laneItems.map((c) => [c.id, c]));
  const visited = new Set<string>();
  const rows: PairedLaneRow[] = [];

  for (const c of laneItems) {
    if (visited.has(c.id)) continue;

    const partner = c.paired_candidate_id ? byId.get(c.paired_candidate_id) : undefined;

    if (partner) {
      visited.add(c.id);
      visited.add(partner.id);
      const members = [c, partner];
      const male = members.find((m) => m.gender === "남") ?? null;
      const female = members.find((m) => m.gender === "여") ?? null;
      rows.push(male || female ? { male, female } : { male: c, female: partner });
    } else {
      visited.add(c.id);
      if (c.gender === "남") {
        rows.push({ male: c, female: null });
      } else if (c.gender === "여") {
        rows.push({ male: null, female: c });
      } else {
        rows.push({ male: c, female: null });
      }
    }
  }

  rows.sort((a, b) => newestCreatedAtInPair(b).localeCompare(newestCreatedAtInPair(a)));
  return rows;
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
  draggingId,
  candidateDirectory,
}: FlowBoardLaneProps) {
  const usePairedRows = status === "matched" || status === "couple";
  const pairedRows = usePairedRows ? buildPairedLaneRows(items) : [];
  const males = usePairedRows
    ? []
    : sortByCreatedAtDesc(items.filter((c) => c.gender === "남"));
  const females = usePairedRows
    ? []
    : sortByCreatedAtDesc(items.filter((c) => c.gender === "여"));

  const emptySlot = (gender: "남" | "여") => (
    <div className="rounded-2xl border border-dashed border-rose-200/60 bg-white/50 px-3 py-8 text-center text-xs text-slate-400">
      {gender === "남" ? "남성 후보 없음" : "여성 후보 없음"}
    </div>
  );

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

      {usePairedRows ? (
        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto -mx-5 px-5 -mb-5 pb-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-rose-200/60">
          {pairedRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-rose-200/60 bg-white/50 px-3 py-8 text-center text-xs text-slate-400">
              매칭된 후보가 없습니다
            </div>
          ) : (
            pairedRows.map((row) => (
              <FlowBoardPairCard
                key={`pair-${row.male?.id ?? "none"}-${row.female?.id ?? "none"}`}
                row={row}
                role={role}
                canOperate={canOperate}
                pendingCandidateIds={pendingCandidateIds}
                draggingId={draggingId}
              />
            ))
          )}
        </div>
      ) : (
        <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto -mx-5 px-5 -mb-5 pb-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-rose-200/60 sm:grid-cols-2 sm:gap-x-3">
          <div className="min-w-0">
            <p className="mb-2 flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-400/80">
              <span>🤵</span> 남성
            </p>
            <div className="grid min-w-0 gap-3">
              {males.length
                ? males.map((candidate) => (
                    <FlowBoardCard
                      key={candidate.id}
                      candidate={candidate}
                      candidateDirectory={candidateDirectory}
                      role={role}
                      canOperate={canOperate}
                      pendingCandidateIds={pendingCandidateIds}
                    />
                  ))
                : emptySlot("남")}
            </div>
          </div>
          <div className="min-w-0">
            <p className="mb-2 flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-400/80">
              <span>👰</span> 여성
            </p>
            <div className="grid min-w-0 gap-3">
              {females.length
                ? females.map((candidate) => (
                    <FlowBoardCard
                      key={candidate.id}
                      candidate={candidate}
                      candidateDirectory={candidateDirectory}
                      role={role}
                      canOperate={canOperate}
                      pendingCandidateIds={pendingCandidateIds}
                    />
                  ))
                : emptySlot("여")}
            </div>
          </div>
        </div>
      )}
    </DroppableLane>
  );
}
