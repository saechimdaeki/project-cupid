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

// 현재 매칭 관계로 페어 행을 만든다. 관계 소스는 두 가지의 합집합:
//  (1) activeMatchPairs — 매칭 레코드 기반 (1:N 관계)
//  (2) paired_candidate_id — 신뢰 가능한 대표 페어 (레코드 없는 레거시 커플/매칭 보강)
// 한 후보가 여러 관계에 속하면 같은 후보가 여러 행에 등장한다.
function buildPairedLaneRows(
  laneItems: DashboardBoardCandidate[],
  activeMatchPairs: ActiveMatchPair[],
): PairedLaneRow[] {
  const byId = new Map(laneItems.map((candidate) => [candidate.id, candidate]));
  const rows: PairedLaneRow[] = [];
  const seenPairKeys = new Set<string>();
  const pairedCandidateIds = new Set<string>();

  const addPair = (aId: string, bId: string) => {
    const first = byId.get(aId);
    const second = byId.get(bId);
    if (!first || !second) return;

    const key = [aId, bId].sort().join(":");
    if (seenPairKeys.has(key)) return;
    seenPairKeys.add(key);

    pairedCandidateIds.add(first.id);
    pairedCandidateIds.add(second.id);
    rows.push(toLaneRow(first, second));
  };

  // (1) 매칭 레코드 기반 관계
  for (const pair of activeMatchPairs) {
    addPair(pair.aId, pair.bId);
  }

  // (2) paired_candidate_id 기반 관계 (레거시·대표 페어 보강)
  for (const candidate of laneItems) {
    if (candidate.paired_candidate_id) {
      addPair(candidate.id, candidate.paired_candidate_id);
    }
  }

  // 어느 관계에도 잡히지 않은 잔여 후보만 한쪽만 채운 행으로 표시
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
