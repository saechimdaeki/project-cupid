"use client";

import { useEffect, useRef, useState } from "react";
import { resolveProfileImages } from "@/lib/candidate-image-actions";
import type { Candidate, MatchOutcome, TimelineEvent } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function matchOutcomeLabel(outcome: MatchOutcome) {
  switch (outcome) {
    case "intro_sent":
      return "소개 시작";
    case "first_meeting":
      return "첫 만남";
    case "dating":
      return "후속 진행";
    case "couple":
      return "커플완성";
    case "closed":
      return "종료";
  }
}

function outcomeBadgeClass(outcome: MatchOutcome) {
  switch (outcome) {
    case "couple":
      return "border-orange-200/80 bg-orange-50 text-orange-700";
    case "closed":
      return "border-border bg-muted text-muted-foreground";
    default:
      return "border-rose-200/80 bg-rose-50 text-rose-600";
  }
}

function orderPair(
  ids: string[],
  directory: Map<string, Candidate>,
): [Candidate | null, Candidate | null] {
  if (!ids.length) return [null, null];
  const a = ids[0] ? directory.get(ids[0]) ?? null : null;
  const b = ids.length > 1 && ids[1] ? directory.get(ids[1]) ?? null : null;
  if (a && !b) return [a, null];
  if (!a && b) return [b, null];
  if (!a && !b) return [null, null];
  const isMale = (c: Candidate) => c.gender?.includes("남");
  if (isMale(a!) && !isMale(b!)) return [a, b];
  if (isMale(b!) && !isMale(a!)) return [b, a];
  return [a, b];
}

function ProfileChips({ person }: { person: Candidate }) {
  const chips = [
    person.gender,
    person.birth_year ? `${person.birth_year}년생` : null,
    person.height_text && person.height_text !== "모름" ? person.height_text : null,
    person.occupation,
    person.region,
    person.religion,
    person.mbti,
  ].filter(Boolean) as string[];

  return (
    <div className="mt-3 flex flex-wrap justify-center gap-1.5">
      {chips.map((label) => (
        <Badge key={label} variant="secondary" className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
          {label}
        </Badge>
      ))}
    </div>
  );
}

type PersonBlockProps = {
  person: Candidate | null;
  sideLabel: string;
  /** resolveProfileImages로 가져온 실제 signed URL. undefined면 아직 로딩 중 */
  resolvedImageUrl: string | null | undefined;
};

function PersonBlock({ person, sideLabel, resolvedImageUrl }: PersonBlockProps) {
  if (!person) {
    return (
      <div className="flex flex-1 flex-col items-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-rose-400/90">
          {sideLabel}
        </p>
        {/* 회색 박스 절대 없음 — img 태그 사용, 없을 경우 핑크 fallback */}
        <div className="w-full max-w-[16rem] h-80 overflow-hidden rounded-3xl bg-rose-50 border border-rose-100 shadow-sm">
          <img
            src=""
            alt="프로필 없음"
            className="w-full h-full object-cover object-center"
            style={{ display: "none" }}
          />
          <div className="flex h-full w-full items-center justify-center text-sm text-rose-300">
            프로필 미연결
          </div>
        </div>
      </div>
    );
  }

  // resolvedImageUrl: 서버 액션 결과 (string: 실제 URL, null: 사진 없음, undefined: 로딩 중)
  // person.image_url: 혹시 직접 URL이 있을 경우 fallback
  const imageUrl =
    resolvedImageUrl !== undefined
      ? resolvedImageUrl
      : person.image_url;

  const isValidUrl = Boolean(
    imageUrl &&
      (imageUrl.startsWith("/") ||
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")),
  );

  const age = new Date().getFullYear() - person.birth_year + 1;

  return (
    <div className="flex flex-1 flex-col items-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-rose-400/90">
        {sideLabel}
      </p>

      {/* ❗ 무조건 img 태그 사용 — 회색 div 플레이스홀더 없음 */}
      <div className="w-full max-w-[16rem] h-80 overflow-hidden rounded-3xl border border-slate-100 shadow-md bg-rose-50">
        {isValidUrl ? (
          <img
            src={imageUrl!}
            alt={`${person.full_name} 프로필 사진`}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <img
            src={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='320' viewBox='0 0 256 320'><rect width='256' height='320' fill='%23fff1f2'/><circle cx='128' cy='108' r='52' fill='%23fecdd3'/><ellipse cx='128' cy='262' rx='80' ry='64' fill='%23fecdd3'/><text x='128' y='310' text-anchor='middle' font-size='13' fill='%23fda4af'>사진 미등록</text></svg>`}
            alt={`${person.full_name} 사진 미등록`}
            className="w-full h-full object-cover object-center"
          />
        )}
      </div>

      <div className="mt-4 text-center">
        <div className="text-sm text-slate-500">{person.region}</div>
        <div className="mt-0.5 text-xl font-bold text-slate-800">
          {person.full_name}
          <span className="ml-1.5 text-base font-normal text-slate-400">({age}세)</span>
        </div>
      </div>

      <ProfileChips person={person} />
    </div>
  );
}

type MatchDetailModalProps = {
  event: TimelineEvent | null;
  candidateById: Map<string, Candidate>;
  onClose: () => void;
};

export function MatchDetailModal({ event, candidateById, onClose }: MatchDetailModalProps) {
  const [resolvedImages, setResolvedImages] = useState<Record<string, string | null | undefined>>({});
  const pendingKeyRef = useRef<string>("");

  useEffect(() => {
    if (!event) return;
    const ids = event.candidate_ids.filter(Boolean);
    if (!ids.length) return;

    const key = [...ids].sort().join(",");
    if (pendingKeyRef.current === key) return;
    pendingKeyRef.current = key;

    setResolvedImages((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        if (next[id] === undefined) next[id] = undefined;
      }
      return next;
    });

    resolveProfileImages(ids)
      .then((images) => {
        setResolvedImages((prev) => ({ ...prev, ...images }));
      })
      .catch(() => {
        setResolvedImages((prev) => {
          const fallback: Record<string, null> = {};
          for (const id of ids) fallback[id] = null;
          return { ...prev, ...fallback };
        });
      });
  }, [event]);

  if (!event) return null;

  const [userA, userB] = orderPair(event.candidate_ids, candidateById);

  return (
    <Dialog open={Boolean(event)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-5xl rounded-[2.5rem] bg-card/90 p-8 backdrop-blur-md sm:p-12">
        <DialogHeader className="mb-8 w-full text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-400/90">
            Match Detail · 매칭 상세
          </p>
          <DialogTitle className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
            {event.title}
          </DialogTitle>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">{event.happened_on}</span>
            <Badge
              variant="outline"
              className={cn("rounded-full px-3 py-1 text-xs font-semibold", outcomeBadgeClass(event.outcome))}
            >
              {matchOutcomeLabel(event.outcome)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex w-full flex-col items-center gap-8 md:flex-row md:items-start md:justify-center">
          <PersonBlock
            person={userA}
            sideLabel="상대방 A"
            resolvedImageUrl={userA ? resolvedImages[userA.id] : undefined}
          />

          <div className="flex shrink-0 items-center justify-center py-4 text-6xl text-rose-500 md:mt-28 md:py-0" aria-hidden>
            <span className="animate-pulse">&#10084;&#65039;</span>
          </div>

          <PersonBlock
            person={userB}
            sideLabel="상대방 B"
            resolvedImageUrl={userB ? resolvedImages[userB.id] : undefined}
          />
        </div>

        {event.summary ? (
          <div className="mt-8 w-full rounded-2xl border border-rose-100/60 bg-rose-50/50 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-400/90">
              매칭 요약
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{event.summary}</p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
