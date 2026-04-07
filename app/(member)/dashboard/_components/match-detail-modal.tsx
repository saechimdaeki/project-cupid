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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── 헬퍼 ──────────────────────────────────────────────────────────────────────

function matchOutcomeLabel(outcome: MatchOutcome) {
  switch (outcome) {
    case "intro_sent":   return "소개 시작";
    case "first_meeting": return "첫 만남";
    case "dating":       return "후속 진행";
    case "couple":       return "커플완성";
    case "closed":       return "종료";
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

// ── PersonBlock ───────────────────────────────────────────────────────────────

type PersonBlockProps = {
  person: Candidate | null;
  sideLabel: string;
  resolvedImageUrl: string | null | undefined;
};

function PersonBlock({ person, sideLabel, resolvedImageUrl }: PersonBlockProps) {
  const chips = person ? [
    person.gender,
    person.birth_year ? `${person.birth_year}년생` : null,
    person.height_text && person.height_text !== "모름" ? person.height_text : null,
    person.occupation,
    person.region,
    person.religion,
    person.mbti,
  ].filter(Boolean) as string[] : [];

  const imageUrl = resolvedImageUrl !== undefined ? resolvedImageUrl : person?.image_url;
  const isValidUrl = Boolean(
    imageUrl &&
      (imageUrl.startsWith("/") ||
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")),
  );

  return (
    <div className="flex flex-1 flex-col items-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {sideLabel}
      </p>

      <div className="h-72 w-full max-w-[14rem] overflow-hidden rounded-3xl border bg-muted shadow-sm">
        {person && isValidUrl ? (
          <img
            src={imageUrl!}
            alt={`${getCandidateGalleryLabel(person)} 프로필 사진`}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            {person ? "사진 미등록" : "프로필 미연결"}
          </div>
        )}
      </div>

      {person ? (
        <>
          <div className="mt-3 text-center">
            <p className="text-sm text-muted-foreground">{person.region}</p>
            <p className="mt-0.5 text-base font-semibold text-foreground">
              {getCandidateGalleryLabel(person)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                ({new Date().getFullYear() - person.birth_year + 1}세)
              </span>
            </p>
          </div>
          {chips.length > 0 ? (
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {chips.map((label) => (
                <Badge key={label} variant="secondary" className="rounded-full text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>
            <span className="mr-2">{event.happened_on}</span>
            <Badge
              variant="outline"
              className={cn("rounded-full text-xs font-medium", outcomeBadgeClass(event.outcome))}
            >
              {matchOutcomeLabel(event.outcome)}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-center">
          <PersonBlock
            person={userA}
            sideLabel="상대방 A"
            resolvedImageUrl={userA ? resolvedImages[userA.id] : undefined}
          />
          <div className="flex shrink-0 items-center justify-center py-2 text-4xl md:mt-24 md:py-0" aria-hidden>
            <span className="animate-pulse">❤️</span>
          </div>
          <PersonBlock
            person={userB}
            sideLabel="상대방 B"
            resolvedImageUrl={userB ? resolvedImages[userB.id] : undefined}
          />
        </div>

        {event.summary ? (
          <div className="rounded-xl border bg-muted/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">매칭 요약</p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground">{event.summary}</p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
