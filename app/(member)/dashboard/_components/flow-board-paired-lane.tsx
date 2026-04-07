"use client";

import type { AppRole } from "@/lib/types";
import type { DashboardBoardCandidate } from "./dashboard-flow-board";
import { FlowBoardPairCard } from "./flow-board-pair-card";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PairedLaneRow = {
  male: DashboardBoardCandidate | null;
  female: DashboardBoardCandidate | null;
};

type FlowBoardPairedLaneContentProps = {
  items: DashboardBoardCandidate[];
  role: AppRole;
  canOperate: boolean;
  pendingCandidateIds: ReadonlySet<string>;
  draggingId: string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function candidateCreatedAt(candidate: DashboardBoardCandidate): string {
  return candidate.created_at ?? "1970-01-01T00:00:00.000Z";
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

// ── Component ─────────────────────────────────────────────────────────────────

export function FlowBoardPairedLaneContent({
  items,
  role,
  canOperate,
  pendingCandidateIds,
  draggingId,
}: FlowBoardPairedLaneContentProps) {
  const pairedRows = buildPairedLaneRows(items);

  return (
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
  );
}
