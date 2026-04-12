import { formatCandidateBrief } from "@/lib/candidate-display";
import {
  candidateProfileTag,
  TAG_DASHBOARD_CANDIDATES,
  TAG_DASHBOARD_TIMELINE,
} from "@/lib/cache-tags";
import { isDirectImageUrl } from "@/lib/image-url-utils";
import { unstable_cache } from "next/cache";
import { mockCandidates, mockMatchRecords, mockMemberships } from "@/lib/mock-data";
import {
  CANDIDATE_PHOTOS_BUCKET,
  CANDIDATE_PHOTOS_SIGNED_URL_TTL_SECONDS,
} from "@/lib/storage-signed-urls";
import { createClient } from "@/lib/supabase/server";
import type {
  Candidate,
  CandidateGalleryImage,
  CandidatePhoto,
  MatchRecord,
  Membership,
  TimelineEvent,
} from "@/lib/types";

const DASHBOARD_TIMELINE_FETCH_LIMIT = 40;
const TIMELINE_PAGE_SIZE = 40;
const DASHBOARD_CANDIDATES_CACHE_SECONDS = 60 * 15;
const PROFILE_CONTENT_CACHE_SECONDS = 60 * 60 * 6;
const IMAGE_TRANSFORMS = {
  thumb: {
    height: 160,
    quality: 40,
    resize: "cover" as const,
    width: 160,
  },
  card: {
    height: 480,
    quality: 48,
    resize: "cover" as const,
    width: 360,
  },
  detail: {
    height: 960,
    quality: 58,
    resize: "cover" as const,
    width: 720,
  },
  gallery: {
    height: 640,
    quality: 52,
    resize: "cover" as const,
    width: 480,
  },
  galleryThumb: {
    height: 120,
    quality: 36,
    resize: "cover" as const,
    width: 96,
  },
  editorThumb: {
    height: 320,
    quality: 42,
    resize: "cover" as const,
    width: 240,
  },
};

function mergeCandidates(primary: Candidate[], secondary: Candidate[]) {
  const merged = new Map<string, Candidate>();

  for (const candidate of [...primary, ...secondary]) {
    if (!merged.has(candidate.id)) {
      merged.set(candidate.id, candidate);
    }
  }

  return Array.from(merged.values()).sort((left, right) =>
    right.created_at.localeCompare(left.created_at),
  );
}

function mergeMatchRecords(primary: MatchRecord[], secondary: MatchRecord[]) {
  const merged = new Map<string, MatchRecord>();

  for (const record of [...primary, ...secondary]) {
    if (!merged.has(record.id)) {
      merged.set(record.id, record);
    }
  }

  return Array.from(merged.values()).sort((left, right) =>
    right.happened_on.localeCompare(left.happened_on),
  );
}

function normalizeGender(value: string | null | undefined) {
  if (value === "남" || value === "남성") {
    return "남";
  }

  if (value === "여" || value === "여성") {
    return "여";
  }

  return value ?? "";
}

function normalizeHeightText(value: unknown) {
  const text = String(value ?? "").trim();
  return text || "모름";
}

async function resolveCandidateImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  value: string | null,
  variant: keyof typeof IMAGE_TRANSFORMS = "card",
) {
  if (!value) {
    return null;
  }

  if (isDirectImageUrl(value) || !supabase) {
    return value;
  }

  const { data, error } = await supabase.storage
    .from(CANDIDATE_PHOTOS_BUCKET)
    .createSignedUrl(value, CANDIDATE_PHOTOS_SIGNED_URL_TTL_SECONDS, {
      transform: IMAGE_TRANSFORMS[variant],
    });

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

async function attachTransformedImageUrlsToCandidates(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  candidates: Candidate[],
  variant: keyof typeof IMAGE_TRANSFORMS,
): Promise<Candidate[]> {
  const resolvedEntries = await Promise.all(
    candidates.map(async (candidate) => [
      candidate.id,
      await resolveCandidateImage(supabase, candidate.image_url, variant),
    ] as const),
  );

  const resolvedById = new Map(resolvedEntries);

  return candidates.map((candidate) => ({
    ...candidate,
    image_url: resolvedById.get(candidate.id) ?? null,
  }));
}

function mapCandidate(row: any): Candidate {
  return {
    id: row.id,
    full_name: row.full_name,
    birth_year: row.birth_year,
    height_text: normalizeHeightText(row.height_text),
    gender: normalizeGender(row.gender),
    region: row.region,
    occupation: row.occupation,
    work_summary: row.work_summary,
    education: row.education,
    religion: row.religion,
    mbti: row.mbti,
    personality_summary: row.personality_summary,
    ideal_type: row.ideal_type,
    notes_private: row.notes_private,
    status: row.status,
    highlight_tags: row.highlight_tags ?? [],
    image_url: row.image_url,
    paired_candidate_id: row.paired_candidate_id ?? null,
    created_at: row.created_at,
    created_by: row.created_by ?? null,
    created_by_name: row.created_by_name ?? undefined,
  };
}

async function getMembershipFullNameByUserId(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  userId: string | null | undefined,
): Promise<string | undefined> {
  if (!userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from("cupid_memberships")
    .select("full_name")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.full_name) {
    return undefined;
  }

  return data.full_name;
}

function mapMatchRecord(row: any): MatchRecord {
  return {
    id: row.id,
    candidate_id: row.candidate_id,
    counterpart_label: row.counterpart_label,
    counterpart_candidate_id: row.counterpart_candidate_id ?? null,
    matchmaker_name: row.matchmaker_name,
    outcome: row.outcome,
    summary: row.summary,
    happened_on: row.happened_on,
  };
}

function mapMembership(row: any): Membership {
  return {
    user_id: row.user_id,
    username: row.username,
    full_name: row.full_name,
    role: row.role,
    status: row.status,
    approved_by: row.approved_by,
    approved_at: row.approved_at,
    created_at: row.created_at,
  };
}

function mapPhoto(row: any): CandidatePhoto {
  return {
    id: row.id,
    candidate_id: row.candidate_id,
    image_url: row.image_url,
    sort_order: row.sort_order,
    is_primary: row.is_primary,
    created_at: row.created_at,
  };
}

function mapDashboardCandidate(row: any): Candidate {
  return {
    id: row.id,
    full_name: row.full_name,
    birth_year: row.birth_year,
    height_text: normalizeHeightText(row.height_text),
    gender: normalizeGender(row.gender),
    region: row.region ?? "",
    occupation: row.occupation ?? "",
    work_summary: row.work_summary ?? "",
    education: "",
    religion: row.religion ?? "",
    mbti: null,
    personality_summary: row.personality_summary ?? "",
    ideal_type: "",
    notes_private: "",
    status: row.status,
    highlight_tags: row.highlight_tags ?? [],
    image_url: row.image_url ?? null,
    paired_candidate_id: row.paired_candidate_id ?? null,
    created_at: row.created_at,
    created_by: row.created_by ?? null,
    created_by_name: row.created_by_name,
  };
}

type GetCandidatesOptions =
  | string
  | {
      filter?: string;
      includeImages?: boolean;
    };

export async function getCandidates(options?: GetCandidatesOptions) {
  const filter = typeof options === "string" ? options : options?.filter;
  const includeImages = typeof options === "string" ? true : (options?.includeImages ?? true);
  const supabase = await createClient();

  if (!supabase) {
    return filter
      ? mockCandidates.filter((candidate) => candidate.status === filter)
      : mockCandidates;
  }

  let query = supabase
    .from("cupid_candidates")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter) {
    query = query.eq("status", filter);
  }

  const { data, error } = await query;

  if (error || !data) {
    return filter
      ? mockCandidates.filter((candidate) => candidate.status === filter)
      : mockCandidates;
  }

  if (!includeImages) {
    return data.map((row) => mapCandidate(row));
  }

  const candidates = data.map((row) => mapCandidate(row));
  const resolvedCandidates = await attachTransformedImageUrlsToCandidates(
    supabase,
    candidates,
    "card",
  );

  return mergeCandidates(
    resolvedCandidates,
    filter ? mockCandidates.filter((candidate) => candidate.status === filter) : mockCandidates,
  );
}

async function loadDashboardCandidatesUncached(): Promise<Candidate[]> {
  const supabase = await createClient();

  if (!supabase) {
    return mockCandidates.filter((candidate) => candidate.status !== "archived");
  }

  const { data, error } = await supabase
    .from("cupid_candidates")
    .select(
      "id, full_name, birth_year, height_text, gender, region, occupation, work_summary, religion, personality_summary, status, highlight_tags, paired_candidate_id, created_at, image_url, created_by",
    )
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return mockCandidates.filter((candidate) => candidate.status !== "archived");
  }

  const mapped = data.map((row) => mapDashboardCandidate(row));
  const withThumbs = await attachTransformedImageUrlsToCandidates(
    supabase,
    mapped,
    "thumb",
  );

  return mergeCandidates(
    withThumbs,
    mockCandidates.filter((candidate) => candidate.status !== "archived"),
  );
}

export async function getDashboardCandidates(): Promise<Candidate[]> {
  return unstable_cache(loadDashboardCandidatesUncached, ["cupid-dashboard-candidates-data"], {
    tags: [TAG_DASHBOARD_CANDIDATES],
    revalidate: DASHBOARD_CANDIDATES_CACHE_SECONDS,
  })();
}

export async function getManagedCandidates(
  membership: Membership,
  scope: "mine" | "all" = "mine",
): Promise<Candidate[]> {
  const supabase = await createClient();
  const isSuperAll = membership.role === "super_admin" && scope === "all";

  if (!supabase) {
    return isSuperAll
      ? mockCandidates
      : mockCandidates.filter((candidate) => candidate.created_by === membership.user_id);
  }

  let query = supabase
    .from("cupid_candidates")
    .select(
      "id, full_name, birth_year, height_text, gender, region, occupation, work_summary, religion, personality_summary, status, highlight_tags, paired_candidate_id, created_at, image_url, created_by",
    )
    .order("created_at", { ascending: false });

  if (!isSuperAll) {
    query = query.eq("created_by", membership.user_id);
  }

  const { data, error } = await query;

  if (error || !data) {
    return isSuperAll
      ? mockCandidates
      : mockCandidates.filter((candidate) => candidate.created_by === membership.user_id);
  }

  const candidates = data.map((row) => mapDashboardCandidate(row));
  return attachTransformedImageUrlsToCandidates(supabase, candidates, "thumb");
}

async function loadCandidateByIdUncached(id: string) {
  const supabase = await createClient();

  if (!supabase) {
    return mockCandidates.find((candidate) => candidate.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("cupid_candidates")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return mockCandidates.find((candidate) => candidate.id === id) ?? null;
  }

  const candidate = mapCandidate(data);

  const [image_url, creatorName] = await Promise.all([
    resolveCandidateImage(supabase, candidate.image_url, "detail"),
    getMembershipFullNameByUserId(supabase, data.created_by),
  ]);

  return {
    ...candidate,
    image_url,
    created_by_name: creatorName ?? candidate.created_by_name,
  };
}

export async function getCandidateById(id: string) {
  return unstable_cache(async () => loadCandidateByIdUncached(id), ["cupid-candidate-detail", id], {
    tags: [candidateProfileTag(id)],
    revalidate: PROFILE_CONTENT_CACHE_SECONDS,
  })();
}

/**
 * 여러 후보의 기본 정보를 단 1번의 DB 쿼리로 가져옵니다.
 * getCandidateById를 N번 호출하는 대신 이 함수를 씁니다.
 * Signed URL은 발급하지 않습니다 — 이름/나이/직업/지역 텍스트 표시용.
 */
export async function getCandidatesBasicByIds(ids: string[]): Promise<Candidate[]> {
  if (!ids.length) return [];

  const supabase = await createClient();

  if (!supabase) {
    return ids.map((id) => mockCandidates.find((c) => c.id === id)).filter(Boolean) as Candidate[];
  }

  const { data, error } = await supabase
    .from("cupid_candidates")
    .select(
      "id, full_name, birth_year, height_text, gender, region, occupation, work_summary, education, religion, mbti, personality_summary, ideal_type, notes_private, status, highlight_tags, image_url, paired_candidate_id, created_at",
    )
    .in("id", ids);

  if (error || !data) {
    return ids.map((id) => mockCandidates.find((c) => c.id === id)).filter(Boolean) as Candidate[];
  }

  // image_url은 Storage path 그대로 유지 (Signed URL 발급 생략)
  // 과거 이력 표시에는 텍스트 정보만 필요하므로 API 왕복 N번 절감
  return data.map(mapCandidate);
}

/**
 * `getCandidatesBasicByIds` + Storage 배치 서명 1회(청크당).
 * 상세 페이지의 페어/과거 상대 카드처럼 이미지가 필요할 때 사용합니다.
 */
export async function getCandidatesBasicByIdsWithSignedImages(ids: string[]): Promise<Candidate[]> {
  const basic = await getCandidatesBasicByIds(ids);
  const supabase = await createClient();
  if (!supabase || !basic.length) {
    return basic;
  }
  return attachTransformedImageUrlsToCandidates(supabase, basic, "thumb");
}

async function loadMatchRecordsForCandidateUncached(candidateId: string): Promise<MatchRecord[]> {
  const supabase = await createClient();

  if (!supabase) {
    return mockMatchRecords.filter((record) => record.candidate_id === candidateId);
  }

  const { data, error } = await supabase
    .from("cupid_match_records")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("happened_on", { ascending: false });

  if (error || !data) {
    return mockMatchRecords.filter((record) => record.candidate_id === candidateId);
  }

  return mergeMatchRecords(
    data.map(mapMatchRecord),
    mockMatchRecords.filter((record) => record.candidate_id === candidateId),
  );
}

async function loadMatchRecordsAllUncached(): Promise<MatchRecord[]> {
  const supabase = await createClient();

  if (!supabase) {
    return mockMatchRecords;
  }

  const { data, error } = await supabase
    .from("cupid_match_records")
    .select("*")
    .order("happened_on", { ascending: false });

  if (error || !data) {
    return mockMatchRecords;
  }

  return mergeMatchRecords(data.map(mapMatchRecord), mockMatchRecords);
}

export async function getMatchRecords(candidateId?: string) {
  if (candidateId) {
    return unstable_cache(
      async () => loadMatchRecordsForCandidateUncached(candidateId),
      ["cupid-match-records-candidate", candidateId],
      { tags: [candidateProfileTag(candidateId)], revalidate: PROFILE_CONTENT_CACHE_SECONDS },
    )();
  }
  return loadMatchRecordsAllUncached();
}

export async function getDashboardMatchRecords() {
  const supabase = await createClient();

  if (!supabase) {
    return mockMatchRecords;
  }

  const { data, error } = await supabase
    .from("cupid_match_records")
    .select(
      "id, candidate_id, counterpart_label, counterpart_candidate_id, matchmaker_name, outcome, summary, happened_on",
    )
    .order("happened_on", { ascending: false });

  if (error || !data) {
    return mockMatchRecords;
  }

  return mergeMatchRecords(data.map(mapMatchRecord), mockMatchRecords);
}

async function loadDashboardTimelineDataUncached(): Promise<{
  records: MatchRecord[];
  totalCount: number;
}> {
  const supabase = await createClient();

  if (!supabase) {
    return {
      records: mockMatchRecords,
      totalCount: mockMatchRecords.length,
    };
  }

  const { data, error } = await supabase
    .from("cupid_match_records")
    .select(
      "id, candidate_id, counterpart_label, counterpart_candidate_id, matchmaker_name, outcome, summary, happened_on",
    )
    .order("happened_on", { ascending: false })
    .limit(DASHBOARD_TIMELINE_FETCH_LIMIT);

  if (error || !data) {
    return {
      records: mockMatchRecords,
      totalCount: mockMatchRecords.length,
    };
  }

  const mergedRecords = mergeMatchRecords(data.map(mapMatchRecord), mockMatchRecords);

  return {
    records: mergedRecords,
    totalCount: mergedRecords.length,
  };
}

export async function getDashboardTimelineData(): Promise<{
  records: MatchRecord[];
  totalCount: number;
}> {
  return unstable_cache(loadDashboardTimelineDataUncached, ["cupid-dashboard-timeline-data"], {
    tags: [TAG_DASHBOARD_TIMELINE],
    revalidate: 90,
  })();
}

export function buildTimelineEvents(
  records: MatchRecord[],
  candidateDirectory: Map<string, Candidate>,
) {
  const seen = new Set<string>();
  const events: TimelineEvent[] = [];

  for (const record of records) {
    const pairIds = record.counterpart_candidate_id
      ? [record.candidate_id, record.counterpart_candidate_id].sort()
      : [record.candidate_id];
    const dedupeKey = [
      pairIds.join(":"),
      record.outcome,
      record.happened_on,
      record.summary.trim(),
    ].join("|");

    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);

    const sourceCandidate = candidateDirectory.get(record.candidate_id);
    const counterpartCandidate = record.counterpart_candidate_id
      ? candidateDirectory.get(record.counterpart_candidate_id)
      : null;

    const title =
      sourceCandidate && counterpartCandidate
        ? `${formatCandidateBrief(sourceCandidate)} × ${formatCandidateBrief(counterpartCandidate)}`
        : sourceCandidate
          ? formatCandidateBrief(sourceCandidate)
          : record.counterpart_label;

    events.push({
      id: dedupeKey,
      title,
      summary: record.summary,
      happened_on: record.happened_on,
      outcome: record.outcome,
      candidate_ids: pairIds,
    });
  }

  return events;
}

async function loadTimelineEventsUncached(): Promise<TimelineEvent[]> {
  const records = await getMatchRecords();
  const candidateIds = Array.from(
    new Set(
      records.flatMap((record) =>
        [record.candidate_id, record.counterpart_candidate_id].filter(
          (candidateId): candidateId is string => Boolean(candidateId),
        ),
      ),
    ),
  );
  const candidates = await getCandidatesBasicByIds(candidateIds);
  const candidateDirectory = new Map(candidates.map((candidate) => [candidate.id, candidate]));

  return buildTimelineEvents(records, candidateDirectory);
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  return unstable_cache(loadTimelineEventsUncached, ["cupid-timeline-events"], {
    revalidate: 120,
    tags: [TAG_DASHBOARD_TIMELINE, TAG_DASHBOARD_CANDIDATES],
  })();
}

async function loadTimelinePageDataUncached(page: number): Promise<{
  events: TimelineEvent[];
  totalCount: number;
  page: number;
  pageSize: number;
}> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const from = (safePage - 1) * TIMELINE_PAGE_SIZE;
  const to = from + TIMELINE_PAGE_SIZE - 1;
  const supabase = await createClient();

  if (!supabase) {
    const records = mockMatchRecords.slice(from, from + TIMELINE_PAGE_SIZE);
    const candidateIds = Array.from(
      new Set(
        records.flatMap((record) =>
          [record.candidate_id, record.counterpart_candidate_id].filter(
            (candidateId): candidateId is string => Boolean(candidateId),
          ),
        ),
      ),
    );
    const candidates = mockCandidates.filter((candidate) => candidateIds.includes(candidate.id));
    const candidateDirectory = new Map(candidates.map((candidate) => [candidate.id, candidate]));

    return {
      events: buildTimelineEvents(records, candidateDirectory),
      totalCount: mockMatchRecords.length,
      page: safePage,
      pageSize: TIMELINE_PAGE_SIZE,
    };
  }

  const { data, error, count } = await supabase
    .from("cupid_match_records")
    .select(
      "id, candidate_id, counterpart_label, counterpart_candidate_id, matchmaker_name, outcome, summary, happened_on",
      { count: "exact" },
    )
    .order("happened_on", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return {
      events: [],
      totalCount: 0,
      page: safePage,
      pageSize: TIMELINE_PAGE_SIZE,
    };
  }

  const records = data.map(mapMatchRecord);
  const candidateIds = Array.from(
    new Set(
      records.flatMap((record) =>
        [record.candidate_id, record.counterpart_candidate_id].filter(
          (candidateId): candidateId is string => Boolean(candidateId),
        ),
      ),
    ),
  );
  const candidates = await getCandidatesBasicByIds(candidateIds);
  const candidateDirectory = new Map(candidates.map((candidate) => [candidate.id, candidate]));

  return {
    events: buildTimelineEvents(records, candidateDirectory),
    totalCount: count ?? records.length,
    page: safePage,
    pageSize: TIMELINE_PAGE_SIZE,
  };
}

export async function getTimelinePageData(page: number) {
  return unstable_cache(
    async () => loadTimelinePageDataUncached(page),
    ["cupid-timeline-page", String(page)],
    {
      revalidate: 120,
      tags: [TAG_DASHBOARD_TIMELINE, TAG_DASHBOARD_CANDIDATES],
    },
  )();
}

async function loadCandidatePhotosUncached(candidateId: string): Promise<CandidatePhoto[]> {
  const supabase = await createClient();

  if (!supabase) {
    const fallback = mockCandidates.find((candidate) => candidate.id === candidateId)?.image_url;
    return fallback
      ? [
          {
            id: `${candidateId}-primary`,
            candidate_id: candidateId,
            image_url: fallback,
            sort_order: 0,
            is_primary: true,
            created_at: new Date().toISOString(),
          } satisfies CandidatePhoto,
        ]
      : [];
  }

  const { data, error } = await supabase
    .from("cupid_candidate_photos")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error || !data) {
    const fallback = mockCandidates.find((candidate) => candidate.id === candidateId)?.image_url;
    return fallback
      ? [
          {
            id: `${candidateId}-primary`,
            candidate_id: candidateId,
            image_url: fallback,
            sort_order: 0,
            is_primary: true,
            created_at: new Date().toISOString(),
          } satisfies CandidatePhoto,
        ]
      : [];
  }

  const photos = data.map((row) => mapPhoto(row));
  const resolvedEntries = await Promise.all(
    photos.map(async (photo) => [
      photo.id,
      isDirectImageUrl(photo.image_url)
        ? photo.image_url
        : await resolveCandidateImage(supabase, photo.image_url, "editorThumb"),
    ] as const),
  );
  const resolvedById = new Map(resolvedEntries);

  return photos.map((photo) => ({
    ...photo,
    image_url: resolvedById.get(photo.id) ?? photo.image_url,
  }));
}

export async function getCandidatePhotos(candidateId: string) {
  return unstable_cache(
    async () => loadCandidatePhotosUncached(candidateId),
    ["cupid-candidate-photos", candidateId],
    { tags: [candidateProfileTag(candidateId)], revalidate: PROFILE_CONTENT_CACHE_SECONDS },
  )();
}

/**
 * 프로필 상세 갤러리용 이미지 URL (순서 유지 + Storage 경로 기준 중복 제거).
 *
 * `getCandidateById`의 메인 사진은 변환(transform)이 붙은 서명 URL이고,
 * `getCandidatePhotos`의 동일 파일은 배치 서명 URL이라 문자열이 달라 Set으로는 중복이 안 잡힙니다.
 * 여기서는 DB의 원본 경로를 기준으로 한 번만 넣은 뒤, 배치 서명으로 통일합니다.
 */
async function loadProfileGalleryImagesUncached(candidateId: string): Promise<CandidateGalleryImage[]> {
  const supabase = await createClient();

  if (!supabase) {
    const mock = mockCandidates.find((c) => c.id === candidateId);
    const u = mock?.image_url;
    return u && isDirectImageUrl(u)
      ? [{ id: `${candidateId}-primary`, main_url: u, thumb_url: u }]
      : [];
  }

  const [{ data: candidateRow, error: candidateError }, { data: photoRows, error: photosError }] =
    await Promise.all([
      supabase.from("cupid_candidates").select("image_url").eq("id", candidateId).maybeSingle(),
      supabase
        .from("cupid_candidate_photos")
        .select("*")
        .eq("candidate_id", candidateId)
        .order("is_primary", { ascending: false })
        .order("sort_order", { ascending: true }),
    ]);

  const mockFallback = mockCandidates.find((c) => c.id === candidateId);

  const photos = !photosError && photoRows?.length ? photoRows.map((row) => mapPhoto(row)) : [];

  const orderedPaths: string[] = [];
  const seenPath = new Set<string>();

  const addPath = (raw: string | null | undefined) => {
    if (raw == null) return;
    const key = String(raw).trim();
    if (!key || seenPath.has(key)) return;
    seenPath.add(key);
    orderedPaths.push(key);
  };

  if (!candidateError && candidateRow) {
    addPath(candidateRow.image_url);
  } else if (mockFallback?.image_url) {
    addPath(mockFallback.image_url);
  }

  for (const photo of photos) {
    addPath(photo.image_url);
  }

  if (!orderedPaths.length) {
    const m = mockFallback?.image_url;
    return m && isDirectImageUrl(m)
      ? [{ id: `${candidateId}-fallback`, main_url: m, thumb_url: m }]
      : [];
  }

  const resolved = await Promise.all(
    orderedPaths.map(async (path, index) => {
      if (isDirectImageUrl(path)) {
        return {
          id: `${candidateId}-gallery-${index}`,
          main_url: path,
          thumb_url: path,
        } satisfies CandidateGalleryImage;
      }

      const [mainUrl, thumbUrl] = await Promise.all([
        resolveCandidateImage(supabase, path, "gallery"),
        resolveCandidateImage(supabase, path, "galleryThumb"),
      ]);

      if (!mainUrl || !thumbUrl) {
        return null;
      }

      return {
        id: `${candidateId}-gallery-${index}`,
        main_url: mainUrl,
        thumb_url: thumbUrl,
      } satisfies CandidateGalleryImage;
    }),
  );

  return resolved.filter((image): image is CandidateGalleryImage => image != null);
}

export async function getProfileGalleryImages(candidateId: string): Promise<CandidateGalleryImage[]> {
  return unstable_cache(
    async () => loadProfileGalleryImagesUncached(candidateId),
    ["cupid-profile-gallery-images", candidateId],
    { tags: [candidateProfileTag(candidateId)], revalidate: PROFILE_CONTENT_CACHE_SECONDS },
  )();
}

export async function getPendingMemberships() {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("cupid_memberships")
    .select("user_id, username, full_name, role, status, approved_by, approved_at, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(mapMembership);
}

export async function getMembershipDirectory() {
  const supabase = await createClient();

  if (!supabase) {
    return mockMemberships;
  }

  const { data, error } = await supabase
    .from("cupid_memberships")
    .select("user_id, username, full_name, role, status, approved_by, approved_at, created_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return mockMemberships;
  }

  return data.map(mapMembership);
}

export async function getApprovedMemberships() {
  const supabase = await createClient();

  if (!supabase) {
    return mockMemberships.filter((membership) => membership.status === "approved");
  }

  const { data, error } = await supabase
    .from("cupid_memberships")
    .select("user_id, username, full_name, role, status, approved_by, approved_at, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return mockMemberships.filter((membership) => membership.status === "approved");
  }

  return data.map(mapMembership);
}
