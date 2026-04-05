import { revalidateTag } from "next/cache";

/** `getDashboardCandidates` unstable_cache 태그 */
export const TAG_DASHBOARD_CANDIDATES = "cupid-dashboard-candidates";

/** `getDashboardTimelineData` unstable_cache 태그 */
export const TAG_DASHBOARD_TIMELINE = "cupid-dashboard-timeline";

/** 후보 상세: getCandidateById / getCandidatePhotos / getMatchRecords(id) 공통 무효화 */
export function candidateProfileTag(candidateId: string) {
  return `cupid-candidate-profile-${candidateId}`;
}

/**
 * 대시보드 캐시 무효화 + (선택) 해당 후보들의 프로필 상세 캐시 무효화
 */
export function revalidateDashboardCaches(profileCandidateIds?: Iterable<string>) {
  revalidateTag(TAG_DASHBOARD_CANDIDATES);
  revalidateTag(TAG_DASHBOARD_TIMELINE);
  if (profileCandidateIds) {
    const seen = new Set<string>();
    for (const raw of profileCandidateIds) {
      const id = typeof raw === "string" ? raw.trim() : "";
      if (id && !seen.has(id)) {
        seen.add(id);
        revalidateTag(candidateProfileTag(id));
      }
    }
  }
}
