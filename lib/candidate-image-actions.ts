"use server";

import { isDirectImageUrl } from "@/lib/image-url-utils";
import {
  CANDIDATE_PHOTOS_BUCKET,
  CANDIDATE_PHOTOS_SIGNED_URL_TTL_SECONDS,
  createSignedUrlMapForStoragePaths,
} from "@/lib/storage-signed-urls";
import { createClient } from "@/lib/supabase/server";

const DASHBOARD_IMAGE_PATHS_MAX = 500;

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

  const supabase = await createClient();
  if (!supabase) return Object.fromEntries(uniqueIds.map((id) => [id, null]));

  const { data, error } = await supabase
    .from("cupid_candidates")
    .select("id, image_url")
    .in("id", uniqueIds);

  if (error || !data) return Object.fromEntries(uniqueIds.map((id) => [id, null]));

  const rowsById = new Map(data.map((row) => [row.id, row]));
  const storagePaths = [
    ...new Set(
      data
        .map((row) => row.image_url)
        .filter((url): url is string => Boolean(url) && !isDirectImageUrl(url)),
    ),
  ];

  const signedByPath =
    storagePaths.length > 0
      ? await createSignedUrlMapForStoragePaths(
          supabase,
          CANDIDATE_PHOTOS_BUCKET,
          storagePaths,
          CANDIDATE_PHOTOS_SIGNED_URL_TTL_SECONDS,
        )
      : new Map<string, string | null>();

  return Object.fromEntries(
    uniqueIds.map((id) => {
      const row = rowsById.get(id);
      if (!row?.image_url) return [id, null] as const;
      if (isDirectImageUrl(row.image_url)) return [id, row.image_url] as const;
      return [id, signedByPath.get(row.image_url) ?? null] as const;
    }),
  );
}
