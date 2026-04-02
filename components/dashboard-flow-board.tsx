"use client";

import type { DragEvent } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveCandidatePairStatus, moveCandidateStatus } from "@/lib/admin-actions";
import {
  canAccessCandidateDetail,
  canEditCandidates,
  getRoleLabel,
} from "@/lib/role-utils";
import {
  getLaneSurfaceClass,
  getStatusBadgeClass,
  getStatusTopBorderClass,
} from "@/lib/status-ui";
import type { AppRole, Candidate, CandidateStatus } from "@/lib/types";

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

const PRIMARY_LANES = [
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
  {
    key: "archived",
    title: "보류함",
    description: "지금은 멈췄지만 다시 꺼내 검토할 수 있는 후보",
  },
] as const satisfies Array<{
  key: CandidateStatus;
  title: string;
  description: string;
}>;

function groupCandidatesByStatus(
  candidates: DashboardBoardCandidate[],
  status: CandidateStatus,
) {
  return candidates.filter((candidate) => candidate.status === status);
}

function getHeadline(candidate: DashboardBoardCandidate) {
  const parts = [
    candidate.birth_year ? `${String(candidate.birth_year).slice(-2)}년생` : null,
    candidate.occupation || null,
  ].filter(Boolean);

  return parts.length ? parts.join(" ") : candidate.full_name;
}

function getAvatarEmoji(gender: string) {
  if (gender === "남") return "🤵";
  if (gender === "여") return "👰";
  return "💌";
}

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
  const canOperate = canEditCandidates(role);

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
    setDraggingId(null);
    setDropTarget(null);

    startTransition(async () => {
      const result = await moveCandidatePairStatus(candidateId, counterpartId, targetStatus);

      if (!result.ok) {
        setItems(previousItems);
        setNotice(result.message ?? "연결 저장에 실패했습니다.");
        return;
      }

      router.refresh();
    });
  };

  const renderCandidateCard = (candidate: DashboardBoardCandidate) => {
    const metaItems = [
      candidate.gender || null,
      candidate.height_text ? `${candidate.height_text}` : null,
      candidate.region || null,
      candidate.religion ? `종교 ${candidate.religion}` : null,
    ].filter(Boolean);
    const pairedCandidate = candidate.paired_candidate_id
      ? candidateDirectory.get(candidate.paired_candidate_id)
      : null;

    const body = (
      <article
        className={`group overflow-hidden rounded-xl border border-slate-200 border-t-4 bg-white p-4 shadow-sm transition ${getStatusTopBorderClass(candidate.status)} ${
          draggingId === candidate.id ? "scale-[0.99] opacity-70" : ""
        } ${isPending ? "opacity-70" : "hover:-translate-y-0.5 hover:shadow-md"}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
            {getAvatarEmoji(candidate.gender)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {candidate.full_name}
            </p>
            <h3 className="mt-1 text-base font-semibold tracking-[-0.02em] text-slate-800">
              {getHeadline(candidate)}
            </h3>
            {candidate.work_summary ? (
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{candidate.work_summary}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {metaItems.map((item) => (
            <span
              key={`${candidate.id}-${item}`}
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
            >
              {item}
            </span>
          ))}
          {candidate.highlight_tags.slice(0, 2).map((tag) => (
            <span
              key={`${candidate.id}-${tag}`}
              className="inline-flex items-center rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {candidate.notes_private ? (
          <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Manager Note
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600 line-clamp-2">
              {candidate.notes_private}
            </p>
          </div>
        ) : null}

        {pairedCandidate ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Current Pair
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {pairedCandidate.full_name} · {getHeadline(pairedCandidate)}
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs font-medium text-slate-500">
            {canAccessCandidateDetail(role)
              ? "카드를 눌러 상세 확인"
              : `${getRoleLabel(role)} 권한은 목록만 확인`}
          </span>
          {canOperate ? (
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              drag
            </span>
          ) : null}
        </div>
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
          {body}
        </div>
      );
    }

    return (
      <div key={candidate.id} {...wrapperProps}>
        <Link href={`/profiles/${candidate.id}`} className="block">
          {body}
        </Link>
      </div>
    );
  };

  const renderLane = (
    status: CandidateStatus,
    title: string,
    description: string,
    compact = false,
  ) => {
    const laneItems = groupCandidatesByStatus(items, status);

    return (
      <article
        key={status}
        className={`rounded-2xl border p-4 shadow-sm ${getLaneSurfaceClass(status)} ${
          dropTarget === status ? "ring-2 ring-rose-300 ring-offset-2 ring-offset-slate-50" : ""
        }`}
        onDragOver={(event) => {
          if (!canOperate) return;
          event.preventDefault();
          setDropTarget(status);
        }}
        onDragLeave={() => {
          if (dropTarget === status) setDropTarget(null);
        }}
        onDrop={(event) => {
          if (!canOperate) return;

          event.preventDefault();
          const droppedCandidateId = event.dataTransfer.getData("text/plain") || draggingId;
          const candidate = droppedCandidateId ? candidateDirectory.get(droppedCandidateId) : null;

          if (!candidate) return;

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
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            <p className={`mt-1 text-sm text-slate-500 ${compact ? "max-w-none" : "max-w-xs"}`}>
              {description}
            </p>
          </div>
          <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">
            {laneItems.length}
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {laneItems.length ? (
            laneItems.map(renderCandidateCard)
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-8 text-sm text-slate-500">
              현재 이 단계에 후보가 없습니다.
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="grid gap-4">
      {notice ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 shadow-sm">
          {notice}
        </div>
      ) : null}

      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {PRIMARY_LANES.map((lane) => {
          const count = groupCandidatesByStatus(items, lane.key).length;

          return (
            <button
              key={lane.key}
              type="button"
              onClick={() => setMobileLane(lane.key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                mobileLane === lane.key
                  ? `${getStatusBadgeClass(lane.key)} border`
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              <span>{lane.title}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${mobileLane === lane.key ? "bg-white/15" : "bg-slate-100"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:hidden">
        {renderLane(
          mobileLane,
          PRIMARY_LANES.find((lane) => lane.key === mobileLane)?.title ?? "",
          PRIMARY_LANES.find((lane) => lane.key === mobileLane)?.description ?? "",
          true,
        )}
      </div>

      <div className="hidden gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-4">
        {PRIMARY_LANES.map((lane) => renderLane(lane.key, lane.title, lane.description))}
      </div>

      {pairComposer ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/35 px-4 py-4 backdrop-blur-[2px] sm:items-center">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-5 shadow-2xl sm:p-6">
            <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${
              pairComposer.targetStatus === "matched" ? "text-blue-500" : "text-emerald-500"
            }`}>
              {pairComposer.targetStatus === "matched" ? "Pair Match" : "Couple Confirm"}
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-800">
              {candidateDirectory.get(pairComposer.candidateId)?.full_name}와 연결할 후보를 선택하세요
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              상대 후보를 선택하면 두 후보의 상태가 함께 이동합니다.
            </p>

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
                    {candidate.full_name} · {candidate.gender} · {getHeadline(candidate)}
                  </option>
                ))}
              </select>
            </label>

            {!pairOptions.length ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                현재 연결 가능한 반대 성별 후보가 없습니다.
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setPairComposer(null);
                  setDraggingId(null);
                  setDropTarget(null);
                }}
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-600"
              >
                취소
              </button>
              <button
                type="button"
                disabled={isPending || !pairComposer.counterpartId}
                onClick={confirmPairMove}
                className="inline-flex h-11 items-center justify-center rounded-full bg-rose-500 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pairComposer.targetStatus === "matched" ? "매칭진행중으로 이동" : "커플완성으로 확정"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
