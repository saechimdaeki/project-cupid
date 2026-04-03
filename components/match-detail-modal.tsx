"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { resolveProfileImages } from "@/lib/candidate-image-actions";
import type { Candidate, MatchOutcome, TimelineEvent } from "@/lib/types";

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
      return "border-slate-200 bg-slate-100 text-slate-600";
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
        <span key={label} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
          {label}
        </span>
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
  const [mounted, setMounted] = useState(false);
  const [resolvedImages, setResolvedImages] = useState<Record<string, string | null | undefined>>({});
  const pendingKeyRef = useRef<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!event) return;
    const ids = event.candidate_ids.filter(Boolean);
    if (!ids.length) return;

    const key = [...ids].sort().join(",");
    if (pendingKeyRef.current === key) return;
    pendingKeyRef.current = key;

    // 로딩 중임을 undefined로 표시 (null = 사진 없음, string = URL)
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

  useEffect(() => {
    if (!event) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [event]);

  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [event, onClose]);

  if (!event || !mounted) return null;

  const [userA, userB] = orderPair(event.candidate_ids, candidateById);

  const modal = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      {/* 닫기 버튼 */}
      <button
        type="button"
        aria-label="닫기"
        className="absolute right-6 top-6 z-[100000] flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/20 text-2xl font-light text-white backdrop-blur-sm transition hover:bg-white/30 hover:text-rose-300"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        ×
      </button>

      <div
        className="relative mx-4 flex max-h-[90vh] w-full max-w-5xl flex-col items-center overflow-y-auto rounded-[2.5rem] bg-white/90 p-8 shadow-2xl backdrop-blur-md sm:p-12"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-detail-title"
      >
        {/* 헤더 */}
        <div className="mb-8 w-full text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-400/90">
            Match Detail · 매칭 상세
          </p>
          <h2
            id="match-detail-title"
            className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800 sm:text-3xl"
          >
            {event.title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-medium text-slate-400">{event.happened_on}</span>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${outcomeBadgeClass(event.outcome)}`}
            >
              {matchOutcomeLabel(event.outcome)}
            </span>
          </div>
        </div>

        {/* 두 사람 + 하트 */}
        <div className="flex w-full flex-col items-center gap-8 md:flex-row md:items-start md:justify-center">
          <PersonBlock
            person={userA}
            sideLabel="상대방 A"
            resolvedImageUrl={userA ? resolvedImages[userA.id] : undefined}
          />

          <div className="flex shrink-0 items-center justify-center py-4 text-6xl text-rose-500 md:mt-28 md:py-0" aria-hidden>
            <span className="animate-pulse">❤️</span>
          </div>

          <PersonBlock
            person={userB}
            sideLabel="상대방 B"
            resolvedImageUrl={userB ? resolvedImages[userB.id] : undefined}
          />
        </div>

        {/* 요약 */}
        {event.summary ? (
          <div className="mt-8 w-full rounded-2xl border border-rose-100/60 bg-rose-50/50 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-400/90">
              매칭 요약
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-600">{event.summary}</p>
          </div>
        ) : null}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
