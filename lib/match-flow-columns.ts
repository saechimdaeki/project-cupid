import type { MatchOutcome, MatchRecord } from "@/lib/types";

/** 칸반 '진행 중' 컬럼에 해당하는 outcome (단일 진실: DB·UI 모두 동일 기준) */
export const ONGOING_MATCH_OUTCOMES: MatchOutcome[] = ["intro_sent", "first_meeting", "dating"];

export type MatchFlowColumnKey = "progress" | "completed" | "terminated";

/** 현재 매칭 관계 한 쌍 (정렬된 후보 id 쌍). 1:N 매칭 레인 렌더의 단일 진실 소스 */
export type ActiveMatchPair = { aId: string; bId: string };

/**
 * closed가 아닌 매칭 레코드(진행중 + 커플)에서 현재 매칭 관계 쌍을 도출한다.
 * 같은 관계가 양쪽 후보에 각각 저장되므로 정렬된 쌍 기준으로 1건만 남긴다.
 */
export function buildActiveMatchPairs(records: MatchRecord[]): ActiveMatchPair[] {
  const seen = new Set<string>();
  const pairs: ActiveMatchPair[] = [];
  for (const record of records) {
    if (record.outcome === "closed") continue;
    const partnerId = record.counterpart_candidate_id;
    if (!partnerId) continue;
    const [aId, bId] = [record.candidate_id, partnerId].sort();
    const key = `${aId}:${bId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pairs.push({ aId, bId });
  }
  return pairs;
}

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
