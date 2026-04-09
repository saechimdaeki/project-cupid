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
import { canEditCandidates, canManageRoles } from "@/lib/role-utils";
import type { AppRole, Candidate, CandidateStatus } from "@/lib/types";
import { PairMatchDialog } from "./pair-match-dialog";
import { FlowBoardCardBody } from "./flow-board-card";
import { FlowBoardPairCardOverlay } from "./flow-board-pair-card";
import { FlowBoardMobileView } from "./flow-board-mobile-view";
import { FlowBoardDesktopView } from "./flow-board-desktop-view";

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
  const canOperate = canEditCandidates(role);
  const canReopenCouple = canManageRoles(role);

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

  const executePairMove = (
    candidateId: string,
    counterpartId: string,
    targetStatus: "matched" | "couple",
  ) => {
    const previousItems = items;
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

  const confirmPairMove = () => {
    if (!pairComposer?.counterpartId) {
      setNotice("상대 후보를 선택해야 합니다.");
      return;
    }
    executePairMove(pairComposer.candidateId, pairComposer.counterpartId, pairComposer.targetStatus);
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
    if (candidate.status === "couple" && !canReopenCouple) return;
    if (candidate.status === targetStatus) return;

    if (targetStatus === "matched" || targetStatus === "couple") {
      const options = getEligiblePairOptions(candidate, allCandidates, targetStatus);
      const existingCounterpartId =
        candidate.paired_candidate_id &&
        options.some((option) => option.id === candidate.paired_candidate_id)
          ? candidate.paired_candidate_id
          : null;

      // 커플완성으로 이동 시 이미 페어가 있으면 다이얼로그 없이 바로 이동
      if (targetStatus === "couple" && existingCounterpartId) {
        executePairMove(candidateId, existingCounterpartId, targetStatus);
        return;
      }

      setPairComposer({ candidateId, targetStatus, counterpartId: existingCounterpartId ?? "" });
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
        <PairMatchDialog
          open={Boolean(pairComposer)}
          onClose={() => setPairComposer(null)}
          targetStatus={pairComposer?.targetStatus ?? "matched"}
          candidateName={
            pairComposer
              ? (candidateDirectory.get(pairComposer.candidateId)
                  ? formatCandidateBrief(candidateDirectory.get(pairComposer.candidateId)!)
                  : "")
              : ""
          }
          counterpartId={pairComposer?.counterpartId ?? ""}
          onCounterpartChange={(id) =>
            setPairComposer((current) => (current ? { ...current, counterpartId: id ?? "" } : current))
          }
          pairOptions={pairOptions}
          isPending={isPending}
          onConfirm={confirmPairMove}
        />
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
              pendingCandidateIds={pendingCandidateIds}
              isOverlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
