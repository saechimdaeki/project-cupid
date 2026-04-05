import type { Candidate } from "@/lib/types";

export type CandidateTitleFields = Pick<Candidate, "birth_year" | "occupation" | "full_name">;

/** 대시보드 카드 메인 타이틀: NN년생 + 직업 우선, 없으면 실명, 없으면 안내 */
export function getCandidateCardTitle(candidate: CandidateTitleFields): string {
  const parts = [
    candidate.birth_year ? `${String(candidate.birth_year).slice(-2)}년생` : null,
    candidate.occupation?.trim() || null,
  ].filter(Boolean);
  if (parts.length) return parts.join(" ");
  const name = candidate.full_name?.trim();
  if (name) return name;
  return "출생연도·직업으로 구분";
}

/** 토스트·에러 등 짧은 식별 문자열 */
export function formatCandidateBrief(candidate: CandidateTitleFields): string {
  const name = candidate.full_name?.trim();
  const title = getCandidateCardTitle(candidate);
  if (name && title !== name) return `${name} (${title})`;
  return title;
}

/** 갤러리 상단 등: 실명이 있으면 이름, 없으면 NN년생 직업 타이틀 */
export function getCandidateGalleryLabel(candidate: CandidateTitleFields): string {
  const name = candidate.full_name?.trim();
  if (name) return name;
  return getCandidateCardTitle(candidate);
}
