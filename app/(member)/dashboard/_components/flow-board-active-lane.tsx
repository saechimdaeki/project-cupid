"use client";

import { cn } from "@/lib/cn";
import type { AppRole } from "@/lib/types";
import type { DashboardBoardCandidate } from "./dashboard-flow-board";
import { FlowBoardCard } from "./flow-board-card";

// ── Types ─────────────────────────────────────────────────────────────────────

type FlowBoardActiveLaneContentProps = {
  items: DashboardBoardCandidate[];
  role: AppRole;
  canOperate: boolean;
  pendingCandidateIds: ReadonlySet<string>;
  candidateDirectory: ReadonlyMap<string, DashboardBoardCandidate>;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function sortByCreatedAtDesc(list: DashboardBoardCandidate[]): DashboardBoardCandidate[] {
  return [...list].sort((a, b) =>
    (b.created_at ?? "1970-01-01T00:00:00.000Z").localeCompare(
      a.created_at ?? "1970-01-01T00:00:00.000Z",
    ),
  );
}

function buildActiveLaneRows(
  males: DashboardBoardCandidate[],
  females: DashboardBoardCandidate[],
) {
  const rowCount = Math.max(males.length, females.length);

  return Array.from({ length: rowCount }, (_, index) => ({
    male: males[index] ?? null,
    female: females[index] ?? null,
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FlowBoardActiveLaneContent({
  items,
  role,
  canOperate,
  pendingCandidateIds,
  candidateDirectory,
}: FlowBoardActiveLaneContentProps) {
  const males = sortByCreatedAtDesc(items.filter((candidate) => candidate.gender === "남"));
  const females = sortByCreatedAtDesc(items.filter((candidate) => candidate.gender === "여"));
  const rows = buildActiveLaneRows(males, females);

  const emptySlot = (gender: "남" | "여") => (
    <div className="flex h-full min-h-[176px] items-center justify-center rounded-2xl border border-dashed border-rose-200/60 bg-white/50 px-3 py-8 text-center text-xs text-slate-400">
      {gender === "남" ? "남성 후보 없음" : "여성 후보 없음"}
    </div>
  );

  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto -mx-5 px-5 -mb-5 pb-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-rose-200/60">
      <div className="grid grid-cols-2 gap-x-3">
        <p
          className={cn(
            "mb-2 flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-400/80",
          )}
        >
          <span>🤵</span> 남성
        </p>
        <p className="mb-2 flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-400/80">
          <span>👰</span> 여성
        </p>
      </div>

      <div className="grid min-w-0 gap-3">
        {rows.length ? (
          rows.map((row, index) => (
            <div key={`active-row-${index}`} className="grid grid-cols-2 items-stretch gap-3">
              <div className="min-w-0">
                {row.male ? (
                  <FlowBoardCard
                    key={row.male.id}
                    candidate={row.male}
                    candidateDirectory={candidateDirectory}
                    role={role}
                    canOperate={canOperate}
                    pendingCandidateIds={pendingCandidateIds}
                    fillRowHeight
                  />
                ) : (
                  emptySlot("남")
                )}
              </div>

              <div className="min-w-0">
                {row.female ? (
                  <FlowBoardCard
                    key={row.female.id}
                    candidate={row.female}
                    candidateDirectory={candidateDirectory}
                    role={role}
                    canOperate={canOperate}
                    pendingCandidateIds={pendingCandidateIds}
                    fillRowHeight
                  />
                ) : (
                  emptySlot("여")
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">{emptySlot("남")}</div>
            <div className="min-w-0">{emptySlot("여")}</div>
          </div>
        )}
      </div>
    </div>
  );
}
