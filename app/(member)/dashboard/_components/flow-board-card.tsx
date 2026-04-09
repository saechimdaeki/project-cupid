"use client";

import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import { CandidateAvatarThumb } from "@/components/candidate-avatar-thumb";
import { formatCandidateBrief } from "@/lib/candidate-display";
import { cn } from "@/lib/cn";
import { canAccessCandidateDetail, canManageRoles } from "@/lib/role-utils";
import { getStatusTopBorderClass } from "@/lib/status-ui";
import { Badge } from "@/components/ui/badge";
import type { AppRole } from "@/lib/types";
import type { DashboardBoardCandidate } from "./dashboard-flow-board";

type DraggableWrapperProps = {
  id: string;
  disabled: boolean;
  className?: string;
  children: React.ReactNode;
};

function DraggableWrapper({ id, disabled, className, children }: DraggableWrapperProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      {...(!disabled ? listeners : {})}
      {...attributes}
      style={{ touchAction: "none" }}
      className={cn(
        isDragging ? "opacity-0" : "",
        !disabled ? "cursor-grab active:cursor-grabbing" : "",
        className,
      )}
    >
      {children}
    </div>
  );
}

export type FlowBoardCardBodyProps = {
  candidate: DashboardBoardCandidate;
  candidateDirectory: ReadonlyMap<string, DashboardBoardCandidate>;
  pendingCandidateIds: ReadonlySet<string>;
  fillRowHeight?: boolean;
  isOverlay?: boolean;
};

export function FlowBoardCardBody({
  candidate,
  candidateDirectory,
  pendingCandidateIds,
  fillRowHeight = false,
  isOverlay = false,
}: FlowBoardCardBodyProps) {
  const pairedCandidate = candidate.paired_candidate_id
    ? candidateDirectory.get(candidate.paired_candidate_id)
    : null;

  const birthYearText = candidate.birth_year
    ? `${String(candidate.birth_year).slice(-2)}년생`
    : null;

  const specLine = [candidate.height_text ?? null, candidate.religion || null]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={cn(
        "group flex max-w-full flex-col overflow-x-hidden overflow-y-visible rounded-2xl border border-rose-100/50 border-t-4 bg-white/90 p-3.5 shadow-[0_8px_32px_rgb(244,114,182,0.08)] backdrop-blur-sm transition",
        fillRowHeight ? "h-full" : "",
        getStatusTopBorderClass(candidate.status),
        !isOverlay && pendingCandidateIds.has(candidate.id) && "pointer-events-none opacity-60",
        !isOverlay &&
          !pendingCandidateIds.has(candidate.id) &&
          "hover:shadow-[0_14px_44px_rgb(244,114,182,0.12)]",
        isOverlay && "rotate-1 shadow-[0_24px_60px_rgb(244,114,182,0.22)]",
      )}
    >
      {/* 헤더: 아바타 + 이름·나이·지역·직업 */}
      <div className="flex items-start gap-2.5">
        <CandidateAvatarThumb
          imageUrl={candidate.image_url}
          gender={candidate.gender}
          className="h-14 w-14 shrink-0"
        />
        <div className="min-w-0 flex-1">
          {candidate.full_name.trim() ? (
            <p className="truncate text-base font-bold text-rose-500">
              {candidate.full_name.trim()}
            </p>
          ) : null}
          {birthYearText ? <p className="mt-0.5 text-xs text-slate-400">{birthYearText}</p> : null}
          {candidate.region ? (
            <p className="mt-0.5 text-xs text-slate-400">{candidate.region}</p>
          ) : null}
          {candidate.occupation ? (
            <p className="mt-0.5 text-xs font-medium text-slate-600">{candidate.occupation}</p>
          ) : null}
        </div>
      </div>

      {/* 직장 소개 */}
      {candidate.work_summary ? (
        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {candidate.work_summary}
        </p>
      ) : null}

      {/* 키 · 종교 */}
      {specLine ? <p className="mt-1.5 text-xs text-slate-400">{specLine}</p> : null}

      {/* 태그 */}
      {candidate.highlight_tags.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {candidate.highlight_tags.slice(0, 3).map((tag) => (
            <Badge
              key={`${candidate.id}-${tag}`}
              className="rounded-full border border-rose-200/60 bg-white/80 px-2 py-0.5 text-xs font-medium text-rose-600"
            >
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      {/* Manager Note */}
      {candidate.notes_private ? (
        <div className="mt-2.5 rounded-xl border border-rose-100/50 bg-rose-50/50 px-2.5 py-2">
          <p className="line-clamp-2 text-xs leading-5 text-slate-500">{candidate.notes_private}</p>
        </div>
      ) : null}

      {/* Current Pair */}
      {pairedCandidate ? (
        <div className="mt-2 rounded-xl border border-orange-100/60 bg-orange-50/40 px-2.5 py-1.5">
          <p className="truncate text-xs font-medium text-orange-600">
            🔗 {formatCandidateBrief(pairedCandidate)}
          </p>
        </div>
      ) : null}
    </article>
  );
}

export type FlowBoardCardProps = {
  candidate: DashboardBoardCandidate;
  candidateDirectory: ReadonlyMap<string, DashboardBoardCandidate>;
  role: AppRole;
  canOperate: boolean;
  pendingCandidateIds: ReadonlySet<string>;
  fillRowHeight?: boolean;
};

export function FlowBoardCard({
  candidate,
  candidateDirectory,
  role,
  canOperate,
  pendingCandidateIds,
  fillRowHeight = false,
}: FlowBoardCardProps) {
  const isCoupleLocked = candidate.status === "couple" && !canManageRoles(role);
  const draggableDisabled = !canOperate || isCoupleLocked || pendingCandidateIds.has(candidate.id);

  const body = (
    <FlowBoardCardBody
      candidate={candidate}
      candidateDirectory={candidateDirectory}
      pendingCandidateIds={pendingCandidateIds}
      fillRowHeight={fillRowHeight}
    />
  );

  const inner = canAccessCandidateDetail(role) ? (
    <Link
      href={`/profiles/${candidate.id}`}
      className={cn("block", fillRowHeight && "flex h-full flex-col")}
    >
      {body}
    </Link>
  ) : (
    body
  );

  return (
    <DraggableWrapper
      key={candidate.id}
      id={candidate.id}
      disabled={draggableDisabled}
      className={cn("min-w-0", fillRowHeight && "flex h-full flex-col")}
    >
      {inner}
    </DraggableWrapper>
  );
}
