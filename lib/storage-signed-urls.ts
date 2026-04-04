import type { SupabaseClient } from "@supabase/supabase-js";

/** `lib/data.ts`, `lib/candidate-image-actions.ts` 와 동일 */
export const CANDIDATE_PHOTOS_BUCKET = "sogaeting";
export const CANDIDATE_PHOTOS_SIGNED_URL_TTL_SECONDS = 60 * 60;

const BATCH_CHUNK_SIZE = 100;

/**
 * Storage path 목록에 대해 `createSignedUrls`로 묶어 서명합니다.
 * (후보마다 `createSignedUrl` 호출하는 N회 왕복을 1회(청크당)로 줄임.)
 *
 * 배치 API는 이미지 transform 옵션을 지원하지 않습니다.
 */
export async function createSignedUrlMapForStoragePaths(
  supabase: SupabaseClient,
  bucketId: string,
  paths: string[],
  expiresIn: number,
): Promise<Map<string, string | null>> {
  const unique = [...new Set(paths.filter(Boolean))];
  const map = new Map<string, string | null>();

  if (!unique.length) {
    return map;
  }

  for (let i = 0; i < unique.length; i += BATCH_CHUNK_SIZE) {
    const chunk = unique.slice(i, i + BATCH_CHUNK_SIZE);
    const { data, error } = await supabase.storage.from(bucketId).createSignedUrls(chunk, expiresIn);

    if (error || !data) {
      for (const path of chunk) {
        map.set(path, null);
      }
      continue;
    }

    for (const row of data) {
      if (!row.path) {
        continue;
      }
      const signed = row.error || !row.signedUrl ? null : row.signedUrl;
      map.set(row.path, signed);
    }
  }

  return map;
}
