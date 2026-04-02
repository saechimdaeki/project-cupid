"use client";

import type { DragEvent } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { moveCandidatePairStatus, moveCandidateStatus } from "@/lib/admin-actions";
import type { AppRole, Candidate, CandidateStatus } from "@/lib/types";

const statusToneMap = {
  active: "default",
  matched: "warning",
  couple: "success",
  graduated: "success",
  archived: "muted",
} as const;

const PRIMARY_LANES = [
  {
    key: "active",
    title: "적극매물",
    description: "지금 바로 소개를 검토하고 첫 연결을 넣을 수 있는 후보",
  },
  {
    key: "matched",
    title: "매칭진행중",
    description: "누구와 진행 중인지 확정된 상태의 후보",
  },
  {
    key: "couple",
    title: "커플완성",
    description: "실제 커플로 확정되어 함께 이동한 후보",
  },
] as const satisfies Array<{
  key: CandidateStatus;
  title: string;
  description: string;
}>;

const AUXILIARY_LANES = [
  {
    key: "graduated",
    title: "졸업 보드",
    description: "성공적으로 마무리되어 운영 메인 흐름에서 분리된 후보",
  },
  {
    key: "archived",
    title: "보관함",
    description: "지금은 멈췄거나 추후 검토용으로 넘겨둔 후보",
  },
] as const satisfies Array<{
  key: CandidateStatus;
  title: string;
  description: string;
}>;

type PairComposerState = {
  candidateId: string;
  targetStatus: "matched" | "couple";
  counterpartId: string;
};

type DashboardFlowBoardProps = {
  candidates: Candidate[];
  allCandidates: Candidate[];
  role: AppRole;
};

const surfaceClass =
  "rounded-[28px] border border-[#ead8cf] bg-white/88 shadow-[0_18px_40px_rgba(143,95,89,0.08)] backdrop-blur-sm";
const ghostButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-4 text-sm font-semibold text-[#2d1e24] transition hover:-translate-y-0.5";
const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8b28a] bg-gradient-to-r from-[#f2c98d] to-[#c78662] px-4 text-sm font-semibold text-[#2b1b11] shadow-[0_10px_24px_rgba(198,132,99,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60";

function canAccessCandidateDetail(role: AppRole) {
  return role === "admin" || role === "super_admin";
}

function canEditCandidates(role: AppRole) {
  return canAccessCandidateDetail(role);
}

function getRoleLabel(role: AppRole) {
  switch (role) {
    case "super_admin":
      return "슈퍼어드민";
    case "admin":
      return "어드민";
    case "viewer":
      return "뷰어";
  }
}

function groupCandidatesByStatus(candidates: Candidate[], status: CandidateStatus) {
  return candidates.filter((candidate) => candidate.status === status);
}

function getEligiblePairOptions(
  source: Candidate | undefined,
  allCandidates: Candidate[],
  targetStatus: "matched" | "couple",
) {
  if (!source) {
    return [];
  }

  return allCandidates.filter((candidate) => {
    if (candidate.id === source.id) {
      return false;
    }

    if (candidate.gender === source.gender) {
      return false;
    }

    if (candidate.status === "graduated" || candidate.status === "archived") {
      return false;
    }

    if (candidate.paired_candidate_id && candidate.paired_candidate_id !== source.id) {
      return false;
    }

    if (targetStatus === "couple" && source.paired_candidate_id) {
      return candidate.id === source.paired_candidate_id;
    }

    return true;
  });
}

function getLaneTone(status: CandidateStatus, isTarget: boolean) {
  const base =
    status === "active"
      ? "border-[#ecdcc8] bg-gradient-to-b from-white to-[#fff8ef]"
      : status === "matched"
        ? "border-[#f0d8dd] bg-gradient-to-b from-white to-[#fff7f8]"
        : status === "couple"
          ? "border-[#dbe7dd] bg-gradient-to-b from-white to-[#f7fbf5]"
          : status === "graduated"
            ? "border-[#dce6d7] bg-gradient-to-b from-white to-[#f8fbf3]"
            : "border-[#e5dede] bg-gradient-to-b from-white to-[#fbf8f8]";

  return `${base}${isTarget ? " ring-2 ring-[#d59d7f] ring-offset-2 ring-offset-transparent" : ""}`;
}

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
  const [isPending, startTransition] = useTransition();
  const canOperate = canEditCandidates(role);
  const candidateDirectory = useMemo(
    () => new Map(allCandidates.map((candidate) => [candidate.id, candidate])),
    [allCandidates],
  );

  useEffect(() => {
    setItems(candidates);
  }, [candidates]);

  const pairOptions = useMemo(() => {
    if (!pairComposer) {
      return [];
    }

    return getEligiblePairOptions(
      candidateDirectory.get(pairComposer.candidateId),
      allCandidates,
      pairComposer.targetStatus,
    );
  }, [allCandidates, candidateDirectory, pairComposer]);

  const moveSingleItem = (candidateId: string, nextStatus: CandidateStatus) => {
    const previousItems = items;
    const current = previousItems.find((candidate) => candidate.id === candidateId);

    if (!current || current.status === nextStatus) {
      return;
    }

    const affectedIds = current.paired_candidate_id
      ? new Set([candidateId, current.paired_candidate_id])
      : new Set([candidateId]);

    setItems((existing) =>
      existing.map((candidate) => {
        if (!affectedIds.has(candidate.id)) {
          return candidate;
        }

        if (nextStatus === "active") {
          return { ...candidate, status: nextStatus, paired_candidate_id: null };
        }

        return { ...candidate, status: nextStatus };
      }),
    );
    setNotice(null);
    setDraggingId(null);
    setDropTarget(null);

    startTransition(async () => {
      const result = await moveCandidateStatus(candidateId, nextStatus);

      if (!result.ok) {
        setItems(previousItems);
        setNotice(result.message ?? "상태 변경에 실패했습니다.");
        return;
      }

      router.refresh();
    });
  };

  const confirmPairMove = () => {
    if (!pairComposer || !pairComposer.counterpartId) {
      setNotice("상대 후보를 선택해야 합니다.");
      return;
    }

    const previousItems = items;
    const candidateId = pairComposer.candidateId;
    const counterpartId = pairComposer.counterpartId;
    const nextStatus = pairComposer.targetStatus;
    const affectedIds = new Set([candidateId, counterpartId]);

    setItems((existing) =>
      existing.map((candidate) =>
        affectedIds.has(candidate.id)
          ? {
              ...candidate,
              status: nextStatus,
              paired_candidate_id:
                candidate.id === candidateId ? counterpartId : candidateId,
            }
          : candidate,
      ),
    );
    setNotice(null);
    setPairComposer(null);
    setDraggingId(null);
    setDropTarget(null);

    startTransition(async () => {
      const result = await moveCandidatePairStatus(candidateId, counterpartId, nextStatus);

      if (!result.ok) {
        setItems(previousItems);
        setNotice(result.message ?? "연결 저장에 실패했습니다.");
        return;
      }

      router.refresh();
    });
  };

  const renderCandidateCard = (candidate: Candidate) => {
    const metaItems = [
      candidate.birth_year ? `${candidate.birth_year}년생` : null,
      candidate.gender || null,
      candidate.occupation || null,
    ].filter(Boolean);
    const pairedCandidate = candidate.paired_candidate_id
      ? candidateDirectory.get(candidate.paired_candidate_id)
      : null;
    const statusLabel =
      candidate.status === "graduated"
        ? "졸업"
        : candidate.status === "matched"
          ? "매칭진행중"
          : candidate.status === "couple"
            ? "커플완성"
            : candidate.status;

    const cardBody = (
      <article
        className={`rounded-[24px] border border-[#ead8cf] bg-white/96 p-4 shadow-[0_12px_28px_rgba(143,95,89,0.08)] transition ${
          draggingId === candidate.id ? "scale-[0.985] opacity-70" : ""
        } ${isPending ? "opacity-70" : ""}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b46d59]">
              {candidate.region || "지역 미정"}
            </div>
            <h3 className="mt-2 text-[clamp(1.4rem,4vw,2rem)] font-semibold tracking-[-0.05em] text-[#24161c]">
              {candidate.full_name}
            </h3>
          </div>
          <StatusBadge tone={statusToneMap[candidate.status]}>{statusLabel}</StatusBadge>
        </div>

        <p className="mt-3 text-sm leading-7 text-[#6d5961]">
          {metaItems.length ? metaItems.join(" · ") : "기본 정보는 상세 화면에서 확인합니다"}
        </p>

        <p className="mt-3 text-sm leading-7 text-[#6d5961]">
          {candidate.personality_summary || "소개 메모는 아직 입력되지 않았습니다."}
        </p>

        {pairedCandidate ? (
          <div className="mt-4 rounded-[18px] border border-[#ead8cf] bg-[#fffaf6] px-4 py-3 text-sm text-[#6d5961]">
            현재 연결 상대: <strong className="text-[#24161c]">{pairedCandidate.full_name}</strong>
          </div>
        ) : null}

        {candidate.highlight_tags.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {candidate.highlight_tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex min-h-8 items-center rounded-full border border-[#ead8cf] bg-[#fff8f3] px-3 text-xs font-semibold text-[#8b6a63]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {canOperate ? (
          <div className="mt-4 text-xs font-medium leading-6 text-[#b46d59]">
            {candidate.status === "active"
              ? "매칭진행중/커플완성으로 드래그하면 상대 후보 선택이 열립니다"
              : "드래그해서 다른 레인으로 이동"}
          </div>
        ) : null}

        {!canAccessCandidateDetail(role) ? (
          <div className="mt-4 rounded-[18px] border border-[#ead8cf] bg-[#fffaf6] px-4 py-3 text-xs leading-6 text-[#8b6a63]">
            {getRoleLabel(role)} 권한은 목록만 열람할 수 있습니다
          </div>
        ) : null}
      </article>
    );

    const wrapperProps = {
      draggable: canOperate,
      onDragStart: (event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData("text/plain", candidate.id);
        event.dataTransfer.effectAllowed = "move";
        setDraggingId(candidate.id);
      },
      onDragEnd: () => {
        setDraggingId(null);
        setDropTarget(null);
      },
    };

    if (!canAccessCandidateDetail(role)) {
      return (
        <div key={candidate.id} {...wrapperProps}>
          {cardBody}
        </div>
      );
    }

    return (
      <div key={candidate.id} {...wrapperProps}>
        <Link href={`/profiles/${candidate.id}`} className="block">
          {cardBody}
        </Link>
      </div>
    );
  };

  const renderLane = (
    status: CandidateStatus,
    title: string,
    description: string,
    auxiliary = false,
  ) => {
    const laneItems = groupCandidatesByStatus(items, status);

    return (
      <article
        key={status}
        className={`${surfaceClass} ${getLaneTone(status, dropTarget === status)} p-4 sm:p-5`}
        onDragOver={(event) => {
          if (!canOperate) {
            return;
          }

          event.preventDefault();
          setDropTarget(status);
        }}
        onDragLeave={() => {
          if (dropTarget === status) {
            setDropTarget(null);
          }
        }}
        onDrop={(event) => {
          if (!canOperate) {
            return;
          }

          event.preventDefault();
          const droppedCandidateId = event.dataTransfer.getData("text/plain") || draggingId;
          const candidate = droppedCandidateId ? candidateDirectory.get(droppedCandidateId) : null;

          if (!candidate) {
            return;
          }

          if (status === "matched" || status === "couple") {
            const options = getEligiblePairOptions(candidate, allCandidates, status);
            const defaultCounterpartId =
              candidate.paired_candidate_id &&
              options.some((option) => option.id === candidate.paired_candidate_id)
                ? candidate.paired_candidate_id
                : "";

            setPairComposer({
              candidateId: candidate.id,
              targetStatus: status,
              counterpartId: defaultCounterpartId,
            });
            setDraggingId(null);
            setDropTarget(null);
            return;
          }

          moveSingleItem(candidate.id, status);
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#b46d59]">
              {title}
            </p>
            <h3 className="mt-3 text-5xl font-semibold leading-none tracking-[-0.07em] text-[#24161c]">
              {laneItems.length}명
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#6d5961]">{description}</p>
          </div>
          {auxiliary ? (
            <StatusBadge tone={status === "archived" ? "muted" : "success"}>
              {status === "graduated" ? "보조 레인" : "보관 레인"}
            </StatusBadge>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4">
          {laneItems.length ? (
            laneItems.map(renderCandidateCard)
          ) : (
            <div className="rounded-[22px] border border-dashed border-[#e6d5ca] bg-[#fffaf6] px-4 py-10 text-center text-sm leading-7 text-[#8b6a63]">
              현재 이 단계에 있는 후보가 없습니다.
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="grid gap-5">
      {notice ? (
        <div className={`${surfaceClass} px-5 py-4 text-sm font-medium text-[#6d5961]`}>
          {notice}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {PRIMARY_LANES.map((lane) => renderLane(lane.key, lane.title, lane.description))}
      </div>

      <details
        className={`${surfaceClass} overflow-hidden`}
        open={items.some(
          (candidate) => candidate.status === "graduated" || candidate.status === "archived",
        )}
      >
        <summary className="flex cursor-pointer list-none flex-col gap-2 px-5 py-4 text-left sm:flex-row sm:items-center sm:justify-between">
          <span className="text-base font-semibold tracking-[-0.04em] text-[#24161c]">
            보조 레인 열기
          </span>
          <span className="text-sm leading-7 text-[#8b6a63]">
            졸업 {groupCandidatesByStatus(items, "graduated").length}명 · 보관{" "}
            {groupCandidatesByStatus(items, "archived").length}명
          </span>
        </summary>
        <div className="grid gap-4 border-t border-[#f0e2d8] px-4 py-4 xl:grid-cols-2">
          {AUXILIARY_LANES.map((lane) =>
            renderLane(lane.key, lane.title, lane.description, true),
          )}
        </div>
      </details>

      {pairComposer ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(35,24,28,0.3)] px-4 py-4 backdrop-blur-[2px] sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-[32px] border border-[#ead8cf] bg-white p-6 shadow-[0_28px_80px_rgba(35,24,28,0.18)] sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">
              {pairComposer.targetStatus === "matched" ? "매칭 시작" : "커플 확정"}
            </p>
            <h3 className="mt-3 text-[clamp(1.8rem,7vw,2.6rem)] font-semibold tracking-[-0.07em] text-[#24161c]">
              {candidateDirectory.get(pairComposer.candidateId)?.full_name}와 누구를 연결할지 선택해주세요
            </h3>
            <p className="mt-4 text-sm leading-7 text-[#6d5961]">
              상대 후보를 선택해야만{" "}
              {pairComposer.targetStatus === "matched" ? "매칭진행중" : "커플완성"}으로 이동합니다.
              저장하면 두 후보의 상태가 함께 이동하고 타임라인도 양쪽에 남습니다.
            </p>

            <label className="mt-6 grid gap-2">
              <span className="text-sm font-semibold text-[#7b626a]">상대 후보 선택</span>
              <select
                value={pairComposer.counterpartId}
                onChange={(event) =>
                  setPairComposer((current) =>
                    current ? { ...current, counterpartId: event.target.value } : current,
                  )
                }
                className="min-h-12 rounded-[18px] border border-[#ead8cf] bg-white px-4 text-sm font-medium text-[#2d1e24] outline-none ring-0"
              >
                <option value="">후보를 선택하세요</option>
                {pairOptions.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.full_name} · {candidate.gender} · {candidate.birth_year}년생 ·{" "}
                    {candidate.occupation}
                  </option>
                ))}
              </select>
            </label>

            {!pairOptions.length ? (
              <div className="mt-4 rounded-[20px] border border-dashed border-[#e6d5ca] bg-[#fffaf6] px-4 py-4 text-sm leading-7 text-[#8b6a63]">
                현재 이 후보와 연결 가능한 반대 성별 후보가 없습니다.
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                className={ghostButtonClass}
                type="button"
                onClick={() => {
                  setPairComposer(null);
                  setDraggingId(null);
                  setDropTarget(null);
                }}
              >
                취소
              </button>
              <button
                className={primaryButtonClass}
                type="button"
                disabled={isPending || !pairComposer.counterpartId}
                onClick={confirmPairMove}
              >
                {pairComposer.targetStatus === "matched"
                  ? "매칭진행중으로 이동"
                  : "커플완성으로 확정"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
