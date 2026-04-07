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

  const ageLabel = candidate.birth_year ? `${String(candidate.birth_year).slice(-2)}년생` : null;
  const extraMeta = [
    candidate.gender || null,
    candidate.height_text ?? null,
    candidate.religion ? `종교 ${candidate.religion}` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex h-full min-h-0 flex-col p-4 transition-colors hover:bg-white/40">
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
        isCoupled ? "border-emerald-100/70" : "border-blue-100/60",
        className,
      )}
    >
      <div className="overflow-hidden rounded-l-[26px]">{left}</div>
      <div
        className={cn(
          "overflow-hidden rounded-r-[26px] border-l",
          isCoupled ? "border-l-emerald-100" : "border-l-blue-100",
        )}
      >
        {right}
      </div>
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

// ── FlowBoardPairCard — 드래그 가능한 페어 카드 ───────────────────────────────

export function FlowBoardPairCard({ row, role, canOperate, pendingCandidateIds }: FlowBoardPairCardProps) {
  const isCoupled = (row.male ?? row.female)?.status === "couple";
  const primaryCandidate = row.male ?? row.female;
  const isPending =
    (row.male ? pendingCandidateIds.has(row.male.id) : false) ||
    (row.female ? pendingCandidateIds.has(row.female.id) : false);
  const draggableDisabled = !canOperate || isCoupled || isPending || !primaryCandidate;

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
