"use client";

import { useEffect, useRef, useState } from "react";
import { getCandidateGalleryLabel } from "@/lib/candidate-display";
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

// ── 헬퍼 ──────────────────────────────────────────────────────────────────────

function matchOutcomeLabel(outcome: MatchOutcome) {
  switch (outcome) {
    case "intro_sent":    return "소개 시작";
    case "first_meeting": return "첫 만남";
    case "dating":        return "후속 진행";
    case "couple":        return "커플완성";
    case "closed":        return "종료";
  }
}

function outcomeBadgeClass(outcome: MatchOutcome) {
  switch (outcome) {
    case "couple": return "border-orange-200/80 bg-orange-50 text-orange-700";
    case "closed": return "border-border bg-muted text-muted-foreground";
    default:       return "border-rose-200/80 bg-rose-50 text-rose-600";
  }
}

function orderPair(
  ids: string[],
  directory: Map<string, Candidate>,
): [Candidate | null, Candidate | null] {
  if (!ids.length) return [null, null];
  const a = ids[0] ? directory.get(ids[0]) ?? null : null;
  const b = ids.length > 1 && ids[1] ? directory.get(ids[1]) ?? null : null;
  if (!a && !b) return [null, null];
  if (a && !b) return [a, null];
  if (!a && b) return [b, null];
  const isMale = (c: Candidate) => c.gender?.includes("남");
  if (isMale(a!) && !isMale(b!)) return [a, b];
  if (isMale(b!) && !isMale(a!)) return [b, a];
  return [a, b];
}

// ── PersonChip ────────────────────────────────────────────────────────────────

type PersonChipProps = {
  person: Candidate | null;
  resolvedImageUrl: string | null | undefined;
};

function PersonChip({ person, resolvedImageUrl }: PersonChipProps) {
  const imageUrl = resolvedImageUrl !== undefined ? resolvedImageUrl : person?.image_url;
  const isValidUrl = Boolean(
    imageUrl &&
      (imageUrl.startsWith("/") ||
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")),
  );

  const age = person?.birth_year
    ? new Date().getFullYear() - person.birth_year + 1
    : null;

  const meta = [
    age ? `${age}세` : null,
    person?.region,
    person?.occupation,
  ].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-1 flex-col items-center gap-3">
      {/* 프로필 이미지 */}
      <div className="size-20 overflow-hidden rounded-2xl border bg-muted shadow-sm">
        {person && isValidUrl ? (
          <img
            src={imageUrl!}
            alt={`${getCandidateGalleryLabel(person)} 프로필`}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            {person ? "사진 없음" : "미연결"}
          </div>
        )}
      </div>

      {/* 이름 + 메타 */}
      {person ? (
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {getCandidateGalleryLabel(person)}
          </p>
          {meta ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>
          ) : null}
          {person.mbti ? (
            <p className="mt-1">
              <Badge variant="secondary" className="rounded-full text-xs">
                {person.mbti}
              </Badge>
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">프로필 미연결</p>
      )}
    </div>
  );
}

// ── MatchDetailModal ──────────────────────────────────────────────────────────

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

    resolveProfileImages(ids)
      .then((images) => setResolvedImages((prev) => ({ ...prev, ...images })))
      .catch(() => {
        const fallback: Record<string, null> = {};
        for (const id of ids) fallback[id] = null;
        setResolvedImages((prev) => ({ ...prev, ...fallback }));
      });
  }, [event]);

  if (!event) return null;

  const [userA, userB] = orderPair(event.candidate_ids, candidateById);

  return (
    <Dialog open={Boolean(event)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-base">{event.title}</DialogTitle>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-xs text-muted-foreground">{event.happened_on}</span>
            <Badge
              variant="outline"
              className={cn("rounded-full text-xs font-medium", outcomeBadgeClass(event.outcome))}
            >
              {matchOutcomeLabel(event.outcome)}
            </Badge>
          </div>
        </DialogHeader>

        {/* 인물 카드 */}
        <div className="flex items-start justify-center gap-4">
          <PersonChip
            person={userA}
            resolvedImageUrl={userA ? resolvedImages[userA.id] : undefined}
          />
          <div className="mt-8 shrink-0 text-rose-300 text-lg" aria-hidden>♥</div>
          <PersonChip
            person={userB}
            resolvedImageUrl={userB ? resolvedImages[userB.id] : undefined}
          />
        </div>

        {/* 요약 */}
        {event.summary ? (
          <p className="rounded-xl border bg-muted/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            {event.summary}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
