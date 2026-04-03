"use server";

import { createClient } from "@/lib/supabase/server";

const CANDIDATE_PHOTOS_BUCKET = "sogaeting";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

function isDirectImageUrl(value: string | null | undefined) {
  return Boolean(
    value &&
      (value.startsWith("/") ||
        value.startsWith("http://") ||
        value.startsWith("https://")),
  );
}

async function signStoragePath(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  path: string,
): Promise<string | null> {
  if (isDirectImageUrl(path)) return path;

  const { data, error } = await supabase.storage
    .from(CANDIDATE_PHOTOS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS, {
      transform: { height: 960, quality: 80, resize: "cover", width: 720 },
    });

  return error || !data?.signedUrl ? null : data.signedUrl;
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

  const resolved = await Promise.all(
    data.map(async (row) => {
      if (!row.image_url) return [row.id, null] as const;
      const signed = await signStoragePath(supabase, row.image_url);
      return [row.id, signed] as const;
    }),
  );

  return Object.fromEntries(resolved);
}
