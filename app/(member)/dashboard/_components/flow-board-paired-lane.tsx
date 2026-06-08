"use client";

import type { ActiveMatchPair } from "@/lib/match-flow-columns";
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
  activeMatchPairs: ActiveMatchPair[];
  role: AppRole;
  canOperate: boolean;
  pendingCandidateIds: ReadonlySet<string>;
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

function toLaneRow(
  first: DashboardBoardCandidate,
  second: DashboardBoardCandidate,
): PairedLaneRow {
  const members = [first, second];
  const male = members.find((member) => member.gender === "남") ?? null;
  const female = members.find((member) => member.gender === "여") ?? null;
  return male || female ? { male, female } : { male: first, female: second };
}

// 현재 매칭 관계(activeMatchPairs) 기준으로 페어 행을 만든다.
// 1:N에서는 한 후보가 여러 관계에 속할 수 있어 같은 후보가 여러 행에 등장한다.
function buildPairedLaneRows(
  laneItems: DashboardBoardCandidate[],
  activeMatchPairs: ActiveMatchPair[],
): PairedLaneRow[] {
  const byId = new Map(laneItems.map((candidate) => [candidate.id, candidate]));
  const rows: PairedLaneRow[] = [];
  const seenPairKeys = new Set<string>();
  const pairedCandidateIds = new Set<string>();

  for (const pair of activeMatchPairs) {
    const first = byId.get(pair.aId);
    const second = byId.get(pair.bId);
    if (!first || !second) continue;

    const key = [pair.aId, pair.bId].sort().join(":");
    if (seenPairKeys.has(key)) continue;
    seenPairKeys.add(key);

    pairedCandidateIds.add(first.id);
    pairedCandidateIds.add(second.id);
    rows.push(toLaneRow(first, second));
  }

  // 관계 쌍이 잡히지 않은 잔여 후보(레코드 누락 등)는 한쪽만 채운 행으로 표시
  for (const candidate of laneItems) {
    if (pairedCandidateIds.has(candidate.id)) continue;
    if (candidate.gender === "여") {
      rows.push({ male: null, female: candidate });
    } else {
      rows.push({ male: candidate, female: null });
    }
  }

  rows.sort((a, b) => newestCreatedAtInPair(b).localeCompare(newestCreatedAtInPair(a)));
  return rows;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FlowBoardPairedLaneContent({
  items,
  activeMatchPairs,
  role,
  canOperate,
  pendingCandidateIds,
}: FlowBoardPairedLaneContentProps) {
  const pairedRows = buildPairedLaneRows(items, activeMatchPairs);

  return (
    <div className="mt-4 flex flex-col gap-3">
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
          />
        ))
      )}
    </div>
  );
}
