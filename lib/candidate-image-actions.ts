"use server";

import { unstable_cache } from "next/cache";
import { candidateProfileTag } from "@/lib/cache-tags";
import { isDirectImageUrl } from "@/lib/image-url-utils";
import {
  CANDIDATE_PHOTOS_BUCKET,
  CANDIDATE_PHOTOS_SIGNED_URL_TTL_SECONDS,
  createSignedUrlMapForStoragePaths,
} from "@/lib/storage-signed-urls";
import { createClient } from "@/lib/supabase/server";

const DASHBOARD_IMAGE_PATHS_MAX = 500;
const DASHBOARD_PROFILE_IMAGE_TRANSFORM = {
  width: 160,
  height: 160,
  quality: 40,
  resize: "cover" as const,
};
const PROFILE_IMAGE_CACHE_SECONDS = 60 * 60 * 6;

/**
 * 대시보드용: Storage path 목록을 서버 세션으로 배치 서명합니다.
 * (클라이언트에서 Supabase 호출 금지 규칙 — `lib/*-actions.ts`에서만 Storage 접근)
 */
export async function resolveDashboardCandidateImagePaths(
  paths: string[],
): Promise<Record<string, string | null>> {
  const unique = [
    ...new Set(
      paths
        .filter((path): path is string => typeof path === "string" && path.trim().length > 0)
        .map((path) => path.trim())
        .filter((path) => !isDirectImageUrl(path)),
    ),
  ].slice(0, DASHBOARD_IMAGE_PATHS_MAX);

  if (!unique.length) return {};

  const supabase = await createClient();
  if (!supabase) {
    return Object.fromEntries(unique.map((path) => [path, null] as const));
  }

  const signedByPath = await createSignedUrlMapForStoragePaths(
    supabase,
    CANDIDATE_PHOTOS_BUCKET,
    unique,
    CANDIDATE_PHOTOS_SIGNED_URL_TTL_SECONDS,
  );

  return Object.fromEntries(unique.map((path) => [path, signedByPath.get(path) ?? null] as const));
}

/**
 * 주어진 후보 ID 목록의 프로필 사진 signed URL을 반환합니다.
 * 대시보드 candidateById 맵에는 image_url이 없으므로, 모달 오픈 시 호출합니다.
 */
export async function resolveProfileImages(
  candidateIds: string[],
): Promise<Record<string, string | null>> {
  const uniqueIds = [...new Set(candidateIds.filter(Boolean))];
  if (!uniqueIds.length) return {};

  const resolvedEntries = await Promise.all(
    uniqueIds.map(async (candidateId) => [
      candidateId,
      await unstable_cache(
        async () => {
          const supabase = await createClient();
          if (!supabase) return null;

          const { data, error } = await supabase
            .from("cupid_candidates")
            .select("image_url")
            .eq("id", candidateId)
            .maybeSingle();

          if (error || !data?.image_url) {
            return null;
          }

          if (isDirectImageUrl(data.image_url)) {
            return data.image_url;
          }

          const { data: signed, error: signedError } = await supabase.storage
            .from(CANDIDATE_PHOTOS_BUCKET)
            .createSignedUrl(data.image_url, CANDIDATE_PHOTOS_SIGNED_URL_TTL_SECONDS, {
              transform: DASHBOARD_PROFILE_IMAGE_TRANSFORM,
            });

          if (signedError || !signed?.signedUrl) {
            return null;
          }

          return signed.signedUrl;
        },
        ["cupid-dashboard-profile-image", candidateId],
        {
          revalidate: PROFILE_IMAGE_CACHE_SECONDS,
          tags: [candidateProfileTag(candidateId)],
        },
      )(),
    ] as const),
  );

  return Object.fromEntries(resolvedEntries);
}
