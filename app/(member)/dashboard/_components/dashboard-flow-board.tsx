"use client";

import { useEffect, useId, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { moveCandidatePairStatus, moveCandidateStatus, unmatchPair } from "@/lib/admin-actions";
import { formatCandidateBrief } from "@/lib/candidate-display";
import { canEditCandidates, canManageRoles } from "@/lib/role-utils";
import { parsePairDraggableId } from "./flow-board-pair-card";
import type { ActiveMatchPair } from "@/lib/match-flow-columns";
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
  activeMatchPairs: ActiveMatchPair[];
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

    // 1:N 매칭 허용 — 이미 다른 상대와 진행 중인 후보도 새 상대로 선택할 수 있다.
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
  activeMatchPairs,
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

  // 관계 단위 매칭 종료 (1:N — 한 페어 카드만 적극검토로 되돌릴 때).
  // 남은 매칭 여부에 따른 status 재계산은 서버가 처리하므로 새로고침으로 반영한다.
  const executeUnmatch = (candidateAId: string, candidateBId: string) => {
    const affectedIds = new Set([candidateAId, candidateBId]);
    setNotice(null);
    setPendingCandidateIds(affectedIds);

    startTransition(async () => {
      const result = await unmatchPair(candidateAId, candidateBId);
      setPendingCandidateIds(new Set());

      if (!result.ok) {
        setNotice(result.message ?? "매칭 종료에 실패했습니다.");
        return;
      }

      router.refresh();
    });
  };

  const handleSingleCardDrag = (
    candidate: DashboardBoardCandidate,
    targetStatus: CandidateStatus,
  ) => {
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
        executePairMove(candidate.id, existingCounterpartId, targetStatus);
        return;
      }

      setPairComposer({
        candidateId: candidate.id,
        targetStatus,
        counterpartId: existingCounterpartId ?? "",
      });
      return;
    }

    moveSingleItem(candidate.id, targetStatus);
  };

  const confirmPairMove = () => {
    if (!pairComposer?.counterpartId) {
      setNotice("상대 후보를 선택해야 합니다.");
      return;
    }
    executePairMove(
      pairComposer.candidateId,
      pairComposer.counterpartId,
      pairComposer.targetStatus,
    );
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

    const targetStatus = over.id as CandidateStatus;
    if (!PRIMARY_LANES.some((lane) => lane.key === targetStatus)) return;

    // 페어 카드(매칭진행중/커플완성)는 관계(양쪽 id)를 인코딩한 draggable id를 갖는다.
    const pairInfo = parsePairDraggableId(active.id as string);

    if (pairInfo) {
      const primary = candidateDirectory.get(pairInfo.primaryId);
      if (!primary) return;
      if (primary.status === "couple" && !canReopenCouple) return;
      if (primary.status === targetStatus) return;

      // 짝이 있는 관계 → 관계 단위로 처리 (1:N에서 해당 관계만 종료/커플 확정)
      if (pairInfo.partnerId) {
        if (targetStatus === "active") {
          executeUnmatch(pairInfo.primaryId, pairInfo.partnerId);
          return;
        }
        if (targetStatus === "couple") {
          executePairMove(pairInfo.primaryId, pairInfo.partnerId, "couple");
          return;
        }
      }

      // 짝 없는 잔여 반쪽·기타(커플 재오픈 등)는 단일 후보 흐름으로 위임
      handleSingleCardDrag(primary, targetStatus);
      return;
    }

    const candidate = candidateDirectory.get(active.id as string);
    if (!candidate) return;
    handleSingleCardDrag(candidate, targetStatus);
  };

  const handleDragCancel = () => {
    setDraggingId(null);
    setDropTarget(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const draggingPairInfo = draggingId ? parsePairDraggableId(draggingId) : null;
  const draggingPrimaryId = draggingPairInfo ? draggingPairInfo.primaryId : draggingId;
  const draggingCandidate = draggingPrimaryId
    ? (candidateDirectory.get(draggingPrimaryId) ?? null)
    : null;
  const draggingPartner = draggingPairInfo?.partnerId
    ? (candidateDirectory.get(draggingPairInfo.partnerId) ?? null)
    : null;

  const sharedLaneProps = {
    role,
    canOperate,
    pendingCandidateIds,
    candidateDirectory,
    activeMatchPairs,
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

        <FlowBoardDesktopView items={items} dropTarget={dropTarget} {...sharedLaneProps} />

        {/* 페어 매칭 다이얼로그 */}
        <PairMatchDialog
          open={Boolean(pairComposer)}
          onClose={() => setPairComposer(null)}
          targetStatus={pairComposer?.targetStatus ?? "matched"}
          candidateName={
            pairComposer
              ? candidateDirectory.get(pairComposer.candidateId)
                ? formatCandidateBrief(candidateDirectory.get(pairComposer.candidateId)!)
                : ""
              : ""
          }
          counterpartId={pairComposer?.counterpartId ?? ""}
          onCounterpartChange={(id) =>
            setPairComposer((current) =>
              current ? { ...current, counterpartId: id ?? "" } : current,
            )
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
