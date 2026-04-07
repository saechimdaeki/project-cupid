"use client";

import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import { Heart, Link2 } from "lucide-react";
import { CandidateAvatarThumb } from "@/components/candidate-avatar-thumb";
import { getCandidateCardTitle } from "@/lib/candidate-display";
import { cn } from "@/lib/cn";
import { canAccessCandidateDetail, getRoleLabel } from "@/lib/role-utils";
import { Badge } from "@/components/ui/badge";
import type { AppRole } from "@/lib/types";
import type { DashboardBoardCandidate } from "./dashboard-flow-board";
import type { PairedLaneRow } from "./flow-board-lane";

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

type FlowBoardPairHalfProps = {
  candidate: DashboardBoardCandidate | null;
  genderPlaceholder: "남" | "여";
  isCoupled: boolean;
  role: AppRole;
  canOperate: boolean;
  pendingCandidateIds: ReadonlySet<string>;
  draggingId: string | null;
};

function FlowBoardPairHalf({
  candidate,
  genderPlaceholder,
  isCoupled,
  role,
  canOperate,
  pendingCandidateIds,
  draggingId,
}: FlowBoardPairHalfProps) {
  if (!candidate) {
    return (
      <div className="flex h-full min-h-[18rem] items-center justify-center px-4 text-center text-xs text-slate-400">
        {genderPlaceholder === "남" ? "남성 페어 없음" : "여성 페어 없음"}
      </div>
    );
  }

  const ageLabel = candidate.birth_year ? `${String(candidate.birth_year).slice(-2)}년생` : null;
  const extraMeta = [
    candidate.gender || null,
    candidate.height_text ?? null,
    candidate.religion ? `종교 ${candidate.religion}` : null,
  ].filter(Boolean) as string[];

  const isPending = pendingCandidateIds.has(candidate.id);
  const isThisDragging = draggingId === candidate.id;
  const draggableDisabled = !canOperate || isCoupled || isPending;

  const content = (
    <div
      className={cn(
        "flex h-full min-h-[18rem] flex-col p-4 transition-colors",
        isPending && "pointer-events-none opacity-60",
        !isPending && "hover:bg-white/40",
        isThisDragging && "opacity-0",
      )}
    >
      <div className="flex items-start gap-2.5">
        <CandidateAvatarThumb imageUrl={candidate.image_url} gender={candidate.gender} />
        <div className="min-w-0 flex-1">
          {candidate.full_name.trim() ? (
            <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-rose-400/90">
              {candidate.full_name.trim()}
            </p>
          ) : null}
          <h3
            className={cn(
              "line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug tracking-[-0.02em] text-slate-800",
              candidate.full_name.trim() ? "mt-0.5" : "",
            )}
          >
            {getCandidateCardTitle(candidate)}
          </h3>
          {candidate.work_summary ? (
            <p className="mt-1 line-clamp-2 text-xs leading-snug text-slate-500">
              {candidate.work_summary}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {ageLabel ? (
          <Badge className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600">
            {ageLabel}
          </Badge>
        ) : null}
        {candidate.occupation ? (
          <Badge className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
            {candidate.occupation}
          </Badge>
        ) : null}
        {candidate.region ? (
          <Badge className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600">
            {candidate.region}
          </Badge>
        ) : null}
        {extraMeta.map((item, i) => (
          <Badge
            key={`${candidate.id}-${item}`}
            className={cn(
              "rounded-full px-2 py-0.5 text-xs",
              i % 2 === 0 ? "bg-orange-100 text-orange-600" : "bg-rose-100 text-rose-600",
            )}
          >
            {item}
          </Badge>
        ))}
        {candidate.highlight_tags.slice(0, 2).map((tag) => (
          <Badge
            key={`${candidate.id}-${tag}`}
            className="rounded-full border border-rose-200/60 bg-white/80 px-2 py-0.5 text-xs font-semibold text-rose-600"
          >
            {tag}
          </Badge>
        ))}
      </div>

      {candidate.notes_private ? (
        <div className="mt-3 rounded-xl border border-rose-100/50 bg-rose-50/50 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-400">
            Manager Note
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-600">
            {candidate.notes_private}
          </p>
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-between border-t border-rose-100/50 pt-3">
        <span className="text-xs font-medium text-slate-500">
          {canAccessCandidateDetail(role) ? "상세 확인" : getRoleLabel(role)}
        </span>
        {canOperate ? (
          isCoupled ? (
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-400">
              🔒
            </span>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-300">
              drag
            </span>
          )
        ) : null}
      </div>
    </div>
  );

  const inner = canAccessCandidateDetail(role) ? (
    <Link href={`/profiles/${candidate.id}`} className="block h-full">
      {content}
    </Link>
  ) : content;

  return (
    <DraggableWrapper id={candidate.id} disabled={draggableDisabled} className="h-full">
      {inner}
    </DraggableWrapper>
  );
}

export type FlowBoardPairCardProps = {
  row: PairedLaneRow;
  role: AppRole;
  canOperate: boolean;
  pendingCandidateIds: ReadonlySet<string>;
  draggingId: string | null;
};

export function FlowBoardPairCard({
  row,
  role,
  canOperate,
  pendingCandidateIds,
  draggingId,
}: FlowBoardPairCardProps) {
  const isCoupled = (row.male ?? row.female)?.status === "couple";

  return (
    <article
      className={cn(
        "relative grid grid-cols-2 rounded-[26px] border bg-white/90 shadow-[0_8px_32px_rgb(244,114,182,0.08)] backdrop-blur-sm",
        isCoupled ? "border-emerald-100/70" : "border-blue-100/60",
      )}
    >
      <div className="overflow-hidden rounded-l-[26px]">
        <FlowBoardPairHalf
          candidate={row.male}
          genderPlaceholder="남"
          isCoupled={isCoupled}
          role={role}
          canOperate={canOperate}
          pendingCandidateIds={pendingCandidateIds}
          draggingId={draggingId}
        />
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-r-[26px] border-l",
          isCoupled ? "border-l-emerald-100" : "border-l-blue-100",
        )}
      >
        <FlowBoardPairHalf
          candidate={row.female}
          genderPlaceholder="여"
          isCoupled={isCoupled}
          role={role}
          canOperate={canOperate}
          pendingCandidateIds={pendingCandidateIds}
          draggingId={draggingId}
        />
      </div>

      {/* 구분선 위 중앙 아이콘 */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div
          className={cn(
            "flex size-6 items-center justify-center rounded-full border bg-white shadow-sm",
            isCoupled ? "border-emerald-200" : "border-blue-200",
          )}
        >
          {isCoupled ? (
            <Heart className="size-3 fill-emerald-300 text-emerald-300" />
          ) : (
            <Link2 className="size-3 text-blue-300" />
          )}
        </div>
      </div>
    </article>
  );
}
