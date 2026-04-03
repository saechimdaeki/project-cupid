import type { MatchOutcome, MatchRecord } from "@/lib/types";

/** 칸반 '진행 중' 컬럼에 해당하는 outcome (단일 진실: DB·UI 모두 동일 기준) */
export const ONGOING_MATCH_OUTCOMES: MatchOutcome[] = ["intro_sent", "first_meeting", "dating"];

export type MatchFlowColumnKey = "progress" | "completed" | "terminated";

export function buildPairMatchRecordsOrFilter(candidateAId: string, candidateBId: string) {
  return `and(candidate_id.eq.${candidateAId},counterpart_candidate_id.eq.${candidateBId}),and(candidate_id.eq.${candidateBId},counterpart_candidate_id.eq.${candidateAId})`;
}

export function filterMatchRecordsForColumn(
  records: MatchRecord[],
  column: MatchFlowColumnKey,
): MatchRecord[] {
  if (column === "progress") {
    return records.filter((r) => ONGOING_MATCH_OUTCOMES.includes(r.outcome));
  }
  if (column === "completed") {
    return records.filter((r) => r.outcome === "couple");
  }
  return records.filter((r) => r.outcome === "closed");
}
