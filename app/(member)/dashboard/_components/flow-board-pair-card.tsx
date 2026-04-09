"use client";

import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import { Heart, Link2 } from "lucide-react";
import { CandidateAvatarThumb } from "@/components/candidate-avatar-thumb";
import { cn } from "@/lib/cn";
import { canAccessCandidateDetail, canManageRoles } from "@/lib/role-utils";
import { Badge } from "@/components/ui/badge";
import type { AppRole } from "@/lib/types";
import type { DashboardBoardCandidate } from "./dashboard-flow-board";
import type { PairedLaneRow } from "./flow-board-paired-lane";

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

// ── PairHalfContent — 시각적 렌더링만 (인터랙션 없음) ──────────────────────

type PairHalfContentProps = {
  candidate: DashboardBoardCandidate | null;
  genderPlaceholder: "남" | "여";
  isCoupled: boolean;
};

function PairHalfContent({ candidate, genderPlaceholder, isCoupled }: PairHalfContentProps) {
  if (!candidate) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center px-4 text-center text-xs text-slate-400">
        {genderPlaceholder === "남" ? "남성 페어 없음" : "여성 페어 없음"}
      </div>
    );
  }

  const birthYearText = candidate.birth_year ? `${String(candidate.birth_year).slice(-2)}년생` : null;
  const specLine = [
    candidate.height_text ?? null,
    candidate.religion || null,
  ].filter(Boolean).join(" · ");

  return (
    <div className="flex h-full min-h-0 flex-col p-3.5 transition-colors hover:bg-white/40">
      <div className="flex items-start gap-2.5">
        <CandidateAvatarThumb imageUrl={candidate.image_url} gender={candidate.gender} className="h-14 w-14 shrink-0" />
        <div className="min-w-0 flex-1">
          {candidate.full_name.trim() ? (
            <p className="text-base font-bold text-rose-500">
              {candidate.full_name.trim()}
            </p>
          ) : null}
          {birthYearText ? (
            <p className="mt-0.5 text-xs text-slate-400">{birthYearText}</p>
          ) : null}
          {candidate.region ? (
            <p className="mt-0.5 text-xs text-slate-400">{candidate.region}</p>
          ) : null}
          {candidate.occupation ? (
            <p className="mt-0.5 text-xs font-medium text-slate-600">{candidate.occupation}</p>
          ) : null}
        </div>
      </div>

      {candidate.work_summary ? (
        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {candidate.work_summary}
        </p>
      ) : null}

      {specLine ? (
        <p className="mt-1.5 text-xs text-slate-400">{specLine}</p>
      ) : null}

      {candidate.highlight_tags.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {candidate.highlight_tags.slice(0, 2).map((tag) => (
            <Badge
              key={`${candidate.id}-${tag}`}
              className="rounded-full border border-rose-200/60 bg-white/80 px-2 py-0.5 text-xs font-medium text-rose-600"
            >
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      {candidate.notes_private ? (
        <div className="mt-2.5 rounded-xl border border-rose-100/50 bg-rose-50/50 px-2.5 py-2">
          <p className="line-clamp-2 text-xs leading-5 text-slate-500">
            {candidate.notes_private}
          </p>
        </div>
      ) : null}
    </div>
  );
}

// ── FlowBoardPairHalf — 링크 래퍼 ────────────────────────────────────────────

type FlowBoardPairHalfProps = {
  candidate: DashboardBoardCandidate | null;
  genderPlaceholder: "남" | "여";
  isCoupled: boolean;
  role: AppRole;
};

function FlowBoardPairHalf({ candidate, genderPlaceholder, isCoupled, role }: FlowBoardPairHalfProps) {
  const content = <PairHalfContent candidate={candidate} genderPlaceholder={genderPlaceholder} isCoupled={isCoupled} />;

  if (candidate && canAccessCandidateDetail(role)) {
    return <Link href={`/profiles/${candidate.id}`} className="block h-full">{content}</Link>;
  }
  return content;
}

export type FlowBoardPairCardProps = {
  row: PairedLaneRow;
  role: AppRole;
  canOperate: boolean;
  pendingCandidateIds: ReadonlySet<string>;
};

// ── PairCardShell — 공통 외곽 레이아웃 ───────────────────────────────────────

type PairCardShellProps = {
  isCoupled: boolean;
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
};

function PairCardShell({ isCoupled, left, right, className }: PairCardShellProps) {
  return (
    <article
      className={cn(
        "relative grid grid-cols-2 rounded-[26px] border bg-white/90 shadow-[0_8px_32px_rgb(244,114,182,0.08)] backdrop-blur-sm",
        isCoupled ? "border-rose-200" : "border-blue-200",
        className,
      )}
    >
      <div className="overflow-hidden rounded-l-[26px]">{left}</div>
      <div
        className={cn(
          "overflow-hidden rounded-r-[26px] border-l",
          isCoupled ? "border-l-rose-200" : "border-l-blue-200",
        )}
      >
        {right}
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div
          className={cn(
            "flex size-7 items-center justify-center rounded-full border-2 bg-white shadow-md",
            isCoupled ? "border-rose-400" : "border-blue-300",
          )}
        >
          {isCoupled ? (
            <Heart className="size-3.5 fill-rose-500 text-rose-500" />
          ) : (
            <Link2 className="size-3.5 text-blue-400" />
          )}
        </div>
      </div>
    </article>
  );
}

// ── FlowBoardPairCard — 드래그 가능한 페어 카드 ───────────────────────────────

export function FlowBoardPairCard({ row, role, canOperate, pendingCandidateIds }: FlowBoardPairCardProps) {
  const isCoupled = (row.male ?? row.female)?.status === "couple";
  const primaryCandidate = row.male ?? row.female;
  const isPending =
    (row.male ? pendingCandidateIds.has(row.male.id) : false) ||
    (row.female ? pendingCandidateIds.has(row.female.id) : false);
  const isCoupleLocked = isCoupled && !canManageRoles(role);
  const draggableDisabled = !canOperate || isCoupleLocked || isPending || !primaryCandidate;

  return (
    <DraggableWrapper
      id={primaryCandidate?.id ?? "pair-placeholder"}
      disabled={draggableDisabled}
      className={cn(isPending && "pointer-events-none opacity-60")}
    >
      <PairCardShell
        isCoupled={isCoupled}
        left={<FlowBoardPairHalf candidate={row.male} genderPlaceholder="남" isCoupled={isCoupled} role={role} />}
        right={<FlowBoardPairHalf candidate={row.female} genderPlaceholder="여" isCoupled={isCoupled} role={role} />}
      />
    </DraggableWrapper>
  );
}

// ── FlowBoardPairCardOverlay — 드래그 오버레이용 정적 페어 카드 ───────────────

export type FlowBoardPairCardOverlayProps = {
  male: DashboardBoardCandidate | null;
  female: DashboardBoardCandidate | null;
};

export function FlowBoardPairCardOverlay({ male, female }: FlowBoardPairCardOverlayProps) {
  const isCoupled = (male ?? female)?.status === "couple";

  return (
    <PairCardShell
      isCoupled={isCoupled}
      className="rotate-1 shadow-[0_24px_60px_rgb(244,114,182,0.22)]"
      left={
        <PairHalfContent candidate={male} genderPlaceholder="남" isCoupled={isCoupled} />
      }
      right={
        <PairHalfContent candidate={female} genderPlaceholder="여" isCoupled={isCoupled} />
      }
    />
  );
}
