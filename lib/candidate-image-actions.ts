"use server";

import {
  CANDIDATE_PHOTOS_BUCKET,
  CANDIDATE_PHOTOS_SIGNED_URL_TTL_SECONDS,
  createSignedUrlMapForStoragePaths,
} from "@/lib/storage-signed-urls";
import { createClient } from "@/lib/supabase/server";

function isDirectImageUrl(value: string | null | undefined) {
  return Boolean(
    value &&
      (value.startsWith("/") ||
        value.startsWith("http://") ||
        value.startsWith("https://")),
  );
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
