"use client";

import { useEffect, useId, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { moveCandidatePairStatus, moveCandidateStatus } from "@/lib/admin-actions";
import { formatCandidateBrief } from "@/lib/candidate-display";
import { cn } from "@/lib/cn";
import { canEditCandidates } from "@/lib/role-utils";
import type { AppRole, Candidate, CandidateStatus } from "@/lib/types";
import { DashboardPairMatchDialog } from "./dashboard-pair-match-dialog";
import { FlowBoardCardBody } from "./flow-board-card";
import { FlowBoardPairCardOverlay } from "./flow-board-pair-card";
import { FlowBoardMobileView } from "./flow-board-mobile-view";
import { FlowBoardDesktopView } from "./flow-board-desktop-view";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DashboardBoardCandidate = Pick<
  Candidate,
  | "id"
  | "full_name"
  | "birth_year"
  | "height_text"
  | "gender"
  | "region"
  | "occupation"
  | "work_summary"
  | "religion"
  | "personality_summary"
  | "highlight_tags"
  | "notes_private"
  | "status"
  | "paired_candidate_id"
  | "image_url"
  | "created_at"
>;

type PairComposerState = {
  candidateId: string;
  counterpartId: string;
  targetStatus: "matched" | "couple";
};

type DashboardFlowBoardProps = {
  candidates: DashboardBoardCandidate[];
  allCandidates: DashboardBoardCandidate[];
  role: AppRole;
};

// ── Constants ─────────────────────────────────────────────────────────────────

export const PRIMARY_LANES = [
  {
    key: "active",
    title: "적극검토",
    description: "첫 추천 후보를 고르고 소개 준비를 시작하는 단계",
  },
  {
    key: "matched",
    title: "매칭진행중",
    description: "상대가 정해졌고 조율과 후속 액션이 이어지는 단계",
  },
  {
    key: "couple",
    title: "커플완성",
    description: "상호 호감과 후속 확인이 안정적으로 이어지는 단계",
  },
] as const satisfies Array<{
  key: CandidateStatus;
  title: string;
  description: string;
}>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getEligiblePairOptions(
  source: DashboardBoardCandidate | undefined,
  allCandidates: DashboardBoardCandidate[],
  targetStatus: "matched" | "couple",
) {
  if (!source) return [];

  return allCandidates.filter((candidate) => {
    if (candidate.id === source.id) return false;
    if (candidate.gender === source.gender) return false;
    if (candidate.status === "graduated" || candidate.status === "archived") return false;
    if (candidate.paired_candidate_id && candidate.paired_candidate_id !== source.id) return false;

    if (targetStatus === "couple" && source.paired_candidate_id) {
      return candidate.id === source.paired_candidate_id;
    }

    return true;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DashboardFlowBoard({
  candidates,
  allCandidates,
  role,
}: DashboardFlowBoardProps) {
  const router = useRouter();
  const [items, setItems] = useState(candidates);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<CandidateStatus | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pairComposer, setPairComposer] = useState<PairComposerState | null>(null);
  const [mobileLane, setMobileLane] = useState<CandidateStatus>("active");
  const [isPending, startTransition] = useTransition();
  const [pendingCandidateIds, setPendingCandidateIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const dndContextId = useId();
  const pairMatchTitleId = useId();
  const canOperate = canEditCandidates(role);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const candidateDirectory = useMemo(
    () => new Map(allCandidates.map((candidate) => [candidate.id, candidate])),
    [allCandidates],
  );

  useEffect(() => {
    setItems(candidates);
  }, [candidates]);

  useEffect(() => {
    if (!PRIMARY_LANES.some((lane) => lane.key === mobileLane)) {
      setMobileLane("active");
    }
  }, [mobileLane]);

  const pairOptions = useMemo(() => {
    if (!pairComposer) return [];

    return getEligiblePairOptions(
      candidateDirectory.get(pairComposer.candidateId),
      allCandidates,
      pairComposer.targetStatus,
    );
  }, [allCandidates, candidateDirectory, pairComposer]);

  // ── Business logic ──────────────────────────────────────────────────────────

  const moveSingleItem = (candidateId: string, nextStatus: CandidateStatus) => {
    const previousItems = items;
    const current = previousItems.find((candidate) => candidate.id === candidateId);
    if (!current || current.status === nextStatus) return;

    const affectedIds = current.paired_candidate_id
      ? new Set([candidateId, current.paired_candidate_id])
      : new Set([candidateId]);

    setItems((existing) =>
      existing.map((candidate) => {
        if (!affectedIds.has(candidate.id)) return candidate;
        if (nextStatus === "active") {
          return { ...candidate, status: nextStatus, paired_candidate_id: null };
        }
        return { ...candidate, status: nextStatus };
      }),
    );
    setNotice(null);
    setPendingCandidateIds(affectedIds);

    startTransition(async () => {
      const result = await moveCandidateStatus(candidateId, nextStatus);
      setPendingCandidateIds(new Set());

      if (!result.ok) {
        setItems(previousItems);
        setNotice(result.message ?? "상태 변경에 실패했습니다.");
        return;
      }

      router.refresh();
    });
  };

  const confirmPairMove = () => {
    if (!pairComposer?.counterpartId) {
      setNotice("상대 후보를 선택해야 합니다.");
      return;
    }

    const previousItems = items;
    const { candidateId, counterpartId, targetStatus } = pairComposer;
    const affectedIds = new Set([candidateId, counterpartId]);

    setItems((existing) =>
      existing.map((candidate) =>
        affectedIds.has(candidate.id)
          ? {
              ...candidate,
              status: targetStatus,
              paired_candidate_id: candidate.id === candidateId ? counterpartId : candidateId,
            }
          : candidate,
      ),
    );
    setNotice(null);
    setPairComposer(null);
    setPendingCandidateIds(affectedIds);

    startTransition(async () => {
      const result = await moveCandidatePairStatus(candidateId, counterpartId, targetStatus);
      setPendingCandidateIds(new Set());

      if (!result.ok) {
        setItems(previousItems);
        setNotice(result.message ?? "연결 저장에 실패했습니다.");
        return;
      }

      router.refresh();
    });
  };

  // ── DnD handlers ───────────────────────────────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id as string | undefined;
    if (overId && PRIMARY_LANES.some((lane) => lane.key === overId)) {
      setDropTarget(overId as CandidateStatus);
    } else {
      setDropTarget(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingId(null);
    setDropTarget(null);

    const { active, over } = event;
    if (!over || !canOperate) return;

    const candidateId = active.id as string;
    const targetStatus = over.id as CandidateStatus;

    if (!PRIMARY_LANES.some((lane) => lane.key === targetStatus)) return;

    const candidate = candidateDirectory.get(candidateId);
    if (!candidate) return;
    if (candidate.status === "couple") return;
    if (candidate.status === targetStatus) return;

    if (targetStatus === "matched" || targetStatus === "couple") {
      const options = getEligiblePairOptions(candidate, allCandidates, targetStatus);
      const defaultCounterpartId =
        candidate.paired_candidate_id &&
        options.some((option) => option.id === candidate.paired_candidate_id)
          ? candidate.paired_candidate_id
          : "";
      setPairComposer({ candidateId, targetStatus, counterpartId: defaultCounterpartId });
      return;
    }

    moveSingleItem(candidateId, targetStatus);
  };

  const handleDragCancel = () => {
    setDraggingId(null);
    setDropTarget(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const draggingCandidate = draggingId ? candidateDirectory.get(draggingId) : null;
  const draggingPartner = draggingCandidate?.paired_candidate_id
    ? candidateDirectory.get(draggingCandidate.paired_candidate_id) ?? null
    : null;

  const sharedLaneProps = {
    role,
    canOperate,
    pendingCandidateIds,
    candidateDirectory,
  };

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid gap-6">
        {notice ? (
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/90 px-4 py-3 text-sm text-amber-800 shadow-[0_8px_28px_rgb(251,191,36,0.15)] backdrop-blur-sm">
            {notice}
          </div>
        ) : null}

        <FlowBoardMobileView
          items={items}
          mobileLane={mobileLane}
          onMobileLaneChange={setMobileLane}
          dropTarget={dropTarget}
          {...sharedLaneProps}
        />

        <FlowBoardDesktopView
          items={items}
          dropTarget={dropTarget}
          {...sharedLaneProps}
        />

        {/* 페어 매칭 다이얼로그 */}
        <DashboardPairMatchDialog
          open={Boolean(pairComposer)}
          labelledBy={pairMatchTitleId}
          onClose={() => setPairComposer(null)}
        >
          {pairComposer ? (
            <>
              <header className="flex flex-col gap-2 text-left">
                <p
                  className={cn(
                    "text-xs font-semibold uppercase tracking-[0.24em]",
                    pairComposer.targetStatus === "matched" ? "text-blue-500" : "text-emerald-500",
                  )}
                >
                  {pairComposer.targetStatus === "matched" ? "Pair Match" : "Couple Confirm"}
                </p>
                <h2
                  id={pairMatchTitleId}
                  className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-800"
                >
                  {candidateDirectory.get(pairComposer.candidateId)
                    ? `${formatCandidateBrief(candidateDirectory.get(pairComposer.candidateId)!)}와 연결할 후보를 선택하세요`
                    : "연결할 후보를 선택하세요"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  상대 후보를 선택하면 두 후보의 상태가 함께 이동합니다.
                </p>
              </header>

              <label className="mt-5 grid gap-2">
                <span className="text-sm font-medium text-slate-700">상대 후보</span>
                <select
                  value={pairComposer.counterpartId}
                  onChange={(event) =>
                    setPairComposer((current) =>
                      current ? { ...current, counterpartId: event.target.value } : current,
                    )
                  }
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none"
                >
                  <option value="">후보를 선택하세요</option>
                  {pairOptions.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {formatCandidateBrief(candidate)} · {candidate.gender}
                    </option>
                  ))}
                </select>
              </label>

              {!pairOptions.length ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  현재 연결 가능한 반대 성별 후보가 없습니다.
                </div>
              ) : null}

              <footer className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setPairComposer(null)}
                  className="h-11 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-600"
                >
                  취소
                </Button>
                <Button
                  disabled={isPending || !pairComposer.counterpartId}
                  onClick={confirmPairMove}
                  className="h-11 rounded-full bg-rose-500 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pairComposer.targetStatus === "matched" ? "매칭진행중으로 이동" : "커플완성으로 확정"}
                </Button>
              </footer>
            </>
          ) : null}
        </DashboardPairMatchDialog>
      </div>

      {/* 드래그 중인 카드 오버레이 */}
      <DragOverlay dropAnimation={null}>
        {draggingCandidate && draggingPartner ? (
          <FlowBoardPairCardOverlay
            male={draggingCandidate.gender === "남" ? draggingCandidate : draggingPartner}
            female={draggingCandidate.gender === "여" ? draggingCandidate : draggingPartner}
          />
        ) : draggingCandidate ? (
          <div className="w-72">
            <FlowBoardCardBody
              candidate={draggingCandidate}
              candidateDirectory={candidateDirectory}
              role={role}
              canOperate={canOperate}
              pendingCandidateIds={pendingCandidateIds}
              isOverlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
