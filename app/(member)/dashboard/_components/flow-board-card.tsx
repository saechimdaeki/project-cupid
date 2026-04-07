"use client";

import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import { CandidateAvatarThumb } from "@/components/candidate-avatar-thumb";
import { formatCandidateBrief, getCandidateCardTitle } from "@/lib/candidate-display";
import { cn } from "@/lib/cn";
import { canAccessCandidateDetail, getRoleLabel } from "@/lib/role-utils";
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
  role: AppRole;
  canOperate: boolean;
  pendingCandidateIds: ReadonlySet<string>;
  fillRowHeight?: boolean;
  isOverlay?: boolean;
};

export function FlowBoardCardBody({
  candidate,
  candidateDirectory,
  role,
  canOperate,
  pendingCandidateIds,
  fillRowHeight = false,
  isOverlay = false,
}: FlowBoardCardBodyProps) {
  const ageLabel = candidate.birth_year ? `${String(candidate.birth_year).slice(-2)}년생` : null;
  const extraMeta = [
    candidate.gender || null,
    candidate.height_text ?? null,
    candidate.religion ? `종교 ${candidate.religion}` : null,
  ].filter(Boolean) as string[];
  const pairedCandidate = candidate.paired_candidate_id
    ? candidateDirectory.get(candidate.paired_candidate_id)
    : null;

  return (
    <article
      className={cn(
        "group flex max-w-full flex-col overflow-x-hidden overflow-y-visible rounded-2xl border border-rose-100/50 border-t-4 bg-white/90 p-4 shadow-[0_8px_32px_rgb(244,114,182,0.08)] backdrop-blur-sm transition",
        fillRowHeight ? "h-full min-h-[18rem]" : "min-h-[18rem]",
        getStatusTopBorderClass(candidate.status),
        !isOverlay && pendingCandidateIds.has(candidate.id) && "pointer-events-none opacity-60",
        !isOverlay && !pendingCandidateIds.has(candidate.id) &&
          "hover:shadow-[0_14px_44px_rgb(244,114,182,0.12)]",
        isOverlay && "rotate-1 shadow-[0_24px_60px_rgb(244,114,182,0.22)]",
      )}
    >
      <div className="flex items-start gap-3">
        <CandidateAvatarThumb imageUrl={candidate.image_url} gender={candidate.gender} />
        <div className="min-w-0 flex-1">
          {candidate.full_name.trim() ? (
            <p className="line-clamp-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-400/90">
              {candidate.full_name.trim()}
            </p>
          ) : null}
          <h3
            className={cn(
              "line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug tracking-[-0.02em] text-slate-800",
              candidate.full_name.trim() ? "mt-1" : "",
            )}
          >
            {getCandidateCardTitle(candidate)}
          </h3>
          {candidate.work_summary ? (
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-slate-500">
              {candidate.work_summary}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {ageLabel ? (
          <Badge className="rounded-full bg-rose-100 px-2.5 py-1 font-semibold text-rose-600">
            {ageLabel}
          </Badge>
        ) : null}
        {candidate.occupation ? (
          <Badge className="rounded-full bg-orange-100 px-2.5 py-1 font-semibold text-orange-600">
            {candidate.occupation}
          </Badge>
        ) : null}
        {candidate.region ? (
          <Badge className="rounded-full bg-rose-100 px-2.5 py-1 font-semibold text-rose-600">
            {candidate.region}
          </Badge>
        ) : null}
        {extraMeta.map((item, i) => (
          <Badge
            key={`${candidate.id}-${item}`}
            className={cn(
              "rounded-full px-2.5 py-1",
              i % 2 === 0 ? "bg-orange-100 text-orange-600" : "bg-rose-100 text-rose-600",
            )}
          >
            {item}
          </Badge>
        ))}
        {candidate.highlight_tags.slice(0, 2).map((tag) => (
          <Badge
            key={`${candidate.id}-${tag}`}
            className="rounded-full border border-rose-200/60 bg-white/80 px-2.5 py-1 font-semibold text-rose-600"
          >
            {tag}
          </Badge>
        ))}
      </div>

      {candidate.notes_private ? (
        <div className="mt-4 rounded-2xl border border-rose-100/50 bg-rose-50/50 px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-400">
            Manager Note
          </p>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
            {candidate.notes_private}
          </p>
        </div>
      ) : null}

      {pairedCandidate ? (
        <div className="mt-4 rounded-2xl border border-orange-100/60 bg-orange-50/40 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-500/90">
            Current Pair
          </p>
          <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-600">
            {formatCandidateBrief(pairedCandidate)}
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "mt-4 flex items-center justify-between border-t border-rose-100/50 pt-3",
          fillRowHeight && "mt-auto",
        )}
      >
        <span className="text-xs font-medium text-slate-500">
          {canAccessCandidateDetail(role)
            ? "카드를 눌러 상세 확인"
            : `${getRoleLabel(role)} 권한은 목록만 확인`}
        </span>
        {canOperate ? (
          candidate.status === "couple" ? (
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-400">
              🔒 locked
            </span>
          ) : (
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-300">
              drag
            </span>
          )
        ) : null}
      </div>
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
  const isCoupleLocked = candidate.status === "couple";
  const draggableDisabled = !canOperate || isCoupleLocked || pendingCandidateIds.has(candidate.id);

  const body = (
    <FlowBoardCardBody
      candidate={candidate}
      candidateDirectory={candidateDirectory}
      role={role}
      canOperate={canOperate}
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
  ) : body;

  return (
    <DraggableWrapper
      key={candidate.id}
      id={candidate.id}
      disabled={draggableDisabled}
      className={cn(fillRowHeight && "flex h-full flex-col")}
    >
      {inner}
    </DraggableWrapper>
  );
}
