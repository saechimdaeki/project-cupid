"use client";

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
      <article className={`candidateCard boardCandidateCard${draggingId === candidate.id ? " dragging" : ""}`}>
        <div className="cardTop">
          <div>
            <div className="cardRegion">{candidate.region || "지역 미정"}</div>
            <h3 className="cardName">{candidate.full_name}</h3>
          </div>
          <StatusBadge tone={statusToneMap[candidate.status]}>{statusLabel}</StatusBadge>
        </div>

        <p className="candidateMeta">
          {metaItems.length ? metaItems.join(" · ") : "기본 정보는 상세 화면에서 확인합니다"}
        </p>

        <p className="cardHeadline">
          {candidate.personality_summary || "소개 메모는 아직 입력되지 않았습니다."}
        </p>

        {pairedCandidate ? (
          <div className="boardPairMeta">
            현재 연결 상대: <strong>{pairedCandidate.full_name}</strong>
          </div>
        ) : null}

        <div className="tagRow">
          {candidate.highlight_tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>

        {canOperate ? (
          <div className="boardDragHint">
            {candidate.status === "active"
              ? "매칭진행중/커플완성으로 드래그하면 상대 후보 선택이 열립니다"
              : "드래그해서 다른 레인으로 이동"}
          </div>
        ) : null}

        {!canAccessCandidateDetail(role) ? (
          <div className="viewerHint">{getRoleLabel(role)} 권한은 목록만 열람할 수 있습니다</div>
        ) : null}
      </article>
    );

    const shellClassName = `dashboardBoardCardWrap${isPending ? " pending" : ""}`;

    if (!canAccessCandidateDetail(role)) {
      return (
        <div
          key={candidate.id}
          className={shellClassName}
          draggable={canOperate}
          onDragStart={(event) => {
            event.dataTransfer.setData("text/plain", candidate.id);
            event.dataTransfer.effectAllowed = "move";
            setDraggingId(candidate.id);
          }}
          onDragEnd={() => {
            setDraggingId(null);
            setDropTarget(null);
          }}
        >
          <div className="cardLink disabled">{cardBody}</div>
        </div>
      );
    }

    return (
      <div
        key={candidate.id}
        className={shellClassName}
        draggable={canOperate}
        onDragStart={(event) => {
          event.dataTransfer.setData("text/plain", candidate.id);
          event.dataTransfer.effectAllowed = "move";
          setDraggingId(candidate.id);
        }}
        onDragEnd={() => {
          setDraggingId(null);
          setDropTarget(null);
        }}
      >
        <Link href={`/profiles/${candidate.id}`} className="cardLink">
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
    const laneClassName = `dashboardLane status-${status}${dropTarget === status ? " is-target" : ""}`;

    return (
      <article
        key={status}
        className={laneClassName}
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
          const candidate = droppedCandidateId
            ? candidateDirectory.get(droppedCandidateId)
            : null;

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
        <div className="dashboardLaneHeader">
          <div>
            <p className="eyebrow">{title}</p>
            <h3>{laneItems.length}명</h3>
            <p>{description}</p>
          </div>
          {auxiliary ? (
            <StatusBadge tone={status === "archived" ? "muted" : "success"}>
              {status === "graduated" ? "보조 레인" : "보관 레인"}
            </StatusBadge>
          ) : null}
        </div>

        <div className="dashboardLaneBody">
          {laneItems.length ? (
            laneItems.map(renderCandidateCard)
          ) : (
            <div className="emptyState matchEmptyState">
              현재 이 단계에 있는 후보가 없습니다.
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="dashboardBoardSection">
      {notice ? <div className="notice">{notice}</div> : null}

      <div className="dashboardBoard">
        {PRIMARY_LANES.map((lane) =>
          renderLane(lane.key, lane.title, lane.description),
        )}
      </div>

      <details
        className="auxBoardSection"
        open={items.some((candidate) =>
          candidate.status === "graduated" || candidate.status === "archived",
        )}
      >
        <summary>
          보조 레인 열기
          <span>
            졸업 {groupCandidatesByStatus(items, "graduated").length}명 · 보관{" "}
            {groupCandidatesByStatus(items, "archived").length}명
          </span>
        </summary>

        <div className="dashboardBoard auxiliary">
          {AUXILIARY_LANES.map((lane) =>
            renderLane(lane.key, lane.title, lane.description, true),
          )}
        </div>
      </details>

      {pairComposer ? (
        <div className="pairComposerOverlay" role="dialog" aria-modal="true">
          <div className="pairComposerCard">
            <p className="eyebrow">
              {pairComposer.targetStatus === "matched" ? "매칭 시작" : "커플 확정"}
            </p>
            <h3>
              {candidateDirectory.get(pairComposer.candidateId)?.full_name}와 누구를 연결할지
              선택해주세요
            </h3>
            <p className="pageMeta">
              상대 후보를 선택해야만{" "}
              {pairComposer.targetStatus === "matched" ? "매칭진행중" : "커플완성"}으로
              이동합니다. 저장하면 두 후보의 상태가 함께 이동하고 타임라인도 양쪽에 남습니다.
            </p>

            <label className="filterField">
              <span>상대 후보 선택</span>
              <select
                value={pairComposer.counterpartId}
                onChange={(event) =>
                  setPairComposer((current) =>
                    current
                      ? { ...current, counterpartId: event.target.value }
                      : current,
                  )
                }
              >
                <option value="">후보를 선택하세요</option>
                {pairOptions.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.full_name} · {candidate.gender} · {candidate.birth_year}년생 · {candidate.occupation}
                  </option>
                ))}
              </select>
            </label>

            {!pairOptions.length ? (
              <div className="viewerHint">
                현재 이 후보와 연결 가능한 반대 성별 후보가 없습니다.
              </div>
            ) : null}

            <div className="pairComposerActions">
              <button
                className="ghostButton"
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
                className="primaryButton"
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
