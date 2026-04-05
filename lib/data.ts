import { formatCandidateBrief } from "@/lib/candidate-display";
import {
  candidateProfileTag,
  TAG_DASHBOARD_CANDIDATES,
  TAG_DASHBOARD_TIMELINE,
} from "@/lib/cache-tags";
import { unstable_cache } from "next/cache";
import { mockCandidates, mockMatchRecords, mockMemberships } from "@/lib/mock-data";
import { dashboardPreviewMatchRecords } from "@/lib/preview-scene";
import {
  CANDIDATE_PHOTOS_BUCKET,
  CANDIDATE_PHOTOS_SIGNED_URL_TTL_SECONDS,
  createSignedUrlMapForStoragePaths,
} from "@/lib/storage-signed-urls";
import { createClient } from "@/lib/supabase/server";
import type {
  Candidate,
  CandidatePhoto,
  MatchRecord,
  Membership,
  TimelineEvent,
} from "@/lib/types";

const DASHBOARD_TIMELINE_FETCH_LIMIT = 80;
const IMAGE_TRANSFORMS = {
  card: {
    height: 720,
    quality: 68,
    resize: "cover" as const,
    width: 560,
  },
  detail: {
    height: 1600,
    quality: 76,
    resize: "cover" as const,
    width: 1200,
  },
  gallery: {
    height: 960,
    quality: 72,
    resize: "cover" as const,
    width: 720,
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

function previewMatchRecordsForCandidate(candidateId?: string): MatchRecord[] {
  if (!candidateId) return [];
  return dashboardPreviewMatchRecords.filter((record) => record.candidate_id === candidateId);
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

function isDirectImageUrl(value: string | null | undefined) {
  return Boolean(
    value &&
      (value.startsWith("/") ||
        value.startsWith("http://") ||
        value.startsWith("https://")),
  );
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

async function resolveSignedImageMap(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  values: Array<string | null | undefined>,
) {
  const paths = Array.from(
    new Set(values.filter((value): value is string => Boolean(value) && !isDirectImageUrl(value))),
  );

  if (!paths.length) {
    return new Map<string, string | null>();
  }

  return createSignedUrlMapForStoragePaths(
    supabase,
    CANDIDATE_PHOTOS_BUCKET,
    paths,
    CANDIDATE_PHOTOS_SIGNED_URL_TTL_SECONDS,
  );
}

async function attachBatchSignedImageUrlsToCandidates(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  candidates: Candidate[],
): Promise<Candidate[]> {
  const signedMap = await resolveSignedImageMap(
    supabase,
    candidates.map((c) => c.image_url),
  );

  return candidates.map((candidate) => ({
    ...candidate,
    image_url: candidate.image_url
      ? isDirectImageUrl(candidate.image_url)
        ? candidate.image_url
        : signedMap.get(candidate.image_url) ?? null
      : null,
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
  const includeImages = typeof options === "string" ? true : options?.includeImages ?? true;
  const supabase = await createClient();

  if (!supabase) {
    return filter ? mockCandidates.filter((candidate) => candidate.status === filter) : mockCandidates;
  }

  let query = supabase.from("cupid_candidates").select("*").order("created_at", { ascending: false });

  if (filter) {
    query = query.eq("status", filter);
  }

  const { data, error } = await query;

  if (error || !data) {
    return filter ? mockCandidates.filter((candidate) => candidate.status === filter) : mockCandidates;
  }

  if (!includeImages) {
    return data.map((row) => mapCandidate(row));
  }

  const candidates = data.map((row) => mapCandidate(row));
  const signedImageMap = await resolveSignedImageMap(
    supabase,
    candidates.map((candidate) => candidate.image_url),
  );

  const resolvedCandidates = candidates.map((candidate) => ({
    ...candidate,
    image_url: candidate.image_url
      ? isDirectImageUrl(candidate.image_url)
        ? candidate.image_url
        : signedImageMap.get(candidate.image_url) ?? null
      : null,
  }));

  return mergeCandidates(
    resolvedCandidates,
    filter ? mockCandidates.filter((candidate) => candidate.status === filter) : mockCandidates,
  );
}

async function loadDashboardCandidatesUncached(): Promise<Candidate[]> {
  const supabase = await createClient();

  if (!supabase) {
    return mockCandidates;
  }

  const { data, error } = await supabase
    .from("cupid_candidates")
    .select(
      "id, full_name, birth_year, height_text, gender, region, occupation, work_summary, religion, personality_summary, status, highlight_tags, paired_candidate_id, created_at, image_url",
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    return mockCandidates;
  }

  const mapped = data.map((row) => mapDashboardCandidate(row));
  const signedMap = await resolveSignedImageMap(
    supabase,
    mapped.map((c) => c.image_url),
  );
  const resolved = mapped.map((candidate) => ({
    ...candidate,
    image_url: candidate.image_url
      ? isDirectImageUrl(candidate.image_url)
        ? candidate.image_url
        : signedMap.get(candidate.image_url) ?? null
      : null,
  }));

  return mergeCandidates(resolved, mockCandidates);
}

export async function getDashboardCandidates(): Promise<Candidate[]> {
  return unstable_cache(loadDashboardCandidatesUncached, ["cupid-dashboard-candidates-data"], {
    tags: [TAG_DASHBOARD_CANDIDATES],
    revalidate: 45,
  })();
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
  return unstable_cache(
    async () => loadCandidateByIdUncached(id),
    ["cupid-candidate-detail", id],
    { tags: [candidateProfileTag(id)], revalidate: 45 },
  )();
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
    return ids
      .map((id) => mockCandidates.find((c) => c.id === id))
      .filter(Boolean) as Candidate[];
  }

  const { data, error } = await supabase
    .from("cupid_candidates")
    .select(
      "id, full_name, birth_year, height_text, gender, region, occupation, work_summary, education, religion, mbti, personality_summary, ideal_type, notes_private, status, highlight_tags, image_url, paired_candidate_id, created_at",
    )
    .in("id", ids);

  if (error || !data) {
    return ids
      .map((id) => mockCandidates.find((c) => c.id === id))
      .filter(Boolean) as Candidate[];
  }

  // image_url은 Storage path 그대로 유지 (Signed URL 발급 생략)
  // 과거 이력 표시에는 텍스트 정보만 필요하므로 API 왕복 N번 절감
  return data.map(mapCandidate);
}

/**
 * `getCandidatesBasicByIds` + Storage 배치 서명 1회(청크당).
 * 상세 페이지의 페어/과거 상대 카드처럼 이미지가 필요할 때 사용합니다.
 */
export async function getCandidatesBasicByIdsWithSignedImages(
  ids: string[],
): Promise<Candidate[]> {
  const basic = await getCandidatesBasicByIds(ids);
  const supabase = await createClient();
  if (!supabase || !basic.length) {
    return basic;
  }
  return attachBatchSignedImageUrlsToCandidates(supabase, basic);
}

async function loadMatchRecordsForCandidateUncached(candidateId: string): Promise<MatchRecord[]> {
  const supabase = await createClient();
  const preview = previewMatchRecordsForCandidate(candidateId);

  if (!supabase) {
    const base = mockMatchRecords.filter((record) => record.candidate_id === candidateId);
    return mergeMatchRecords(base, preview);
  }

  const { data, error } = await supabase
    .from("cupid_match_records")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("happened_on", { ascending: false });

  if (error || !data) {
    const base = mockMatchRecords.filter((record) => record.candidate_id === candidateId);
    return mergeMatchRecords(base, preview);
  }

  return mergeMatchRecords(
    mergeMatchRecords(
      data.map(mapMatchRecord),
      mockMatchRecords.filter((record) => record.candidate_id === candidateId),
    ),
    preview,
  );
}

async function loadMatchRecordsAllUncached(): Promise<MatchRecord[]> {
  const supabase = await createClient();
  const preview = previewMatchRecordsForCandidate(undefined);

  if (!supabase) {
    return mergeMatchRecords(mockMatchRecords, preview);
  }

  const { data, error } = await supabase
    .from("cupid_match_records")
    .select("*")
    .order("happened_on", { ascending: false });

  if (error || !data) {
    return mergeMatchRecords(mockMatchRecords, preview);
  }

  return mergeMatchRecords(mergeMatchRecords(data.map(mapMatchRecord), mockMatchRecords), preview);
}

export async function getMatchRecords(candidateId?: string) {
  if (candidateId) {
    return unstable_cache(
      async () => loadMatchRecordsForCandidateUncached(candidateId),
      ["cupid-match-records-candidate", candidateId],
      { tags: [candidateProfileTag(candidateId)], revalidate: 45 },
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

  const [countResult, recordsResult] = await Promise.all([
    supabase
      .from("cupid_match_records")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("cupid_match_records")
      .select(
        "id, candidate_id, counterpart_label, counterpart_candidate_id, matchmaker_name, outcome, summary, happened_on",
      )
      .order("happened_on", { ascending: false })
      .limit(DASHBOARD_TIMELINE_FETCH_LIMIT),
  ]);

  const { count, error: countError } = countResult;
  const { data, error } = recordsResult;

  if (error || !data) {
    return {
      records: mockMatchRecords,
      totalCount: mockMatchRecords.length,
    };
  }

  const mergedRecords = mergeMatchRecords(data.map(mapMatchRecord), mockMatchRecords);

  return {
    records: mergedRecords,
    totalCount:
      countError || typeof count !== "number"
        ? mergedRecords.length
        : Math.max(count, mergedRecords.length),
  };
}

export async function getDashboardTimelineData(): Promise<{
  records: MatchRecord[];
  totalCount: number;
}> {
  return unstable_cache(loadDashboardTimelineDataUncached, ["cupid-dashboard-timeline-data"], {
    tags: [TAG_DASHBOARD_TIMELINE],
    revalidate: 45,
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

export async function getTimelineEvents() {
  const [records, candidates] = await Promise.all([
    getMatchRecords(),
    getCandidates({ includeImages: false }),
  ]);
  const candidateDirectory = new Map(candidates.map((candidate) => [candidate.id, candidate]));

  return buildTimelineEvents(records, candidateDirectory);
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
  const signedImageMap = await resolveSignedImageMap(
    supabase,
    photos.map((photo) => photo.image_url),
  );

  return photos.map((photo) => ({
    ...photo,
    image_url: isDirectImageUrl(photo.image_url)
      ? photo.image_url
      : signedImageMap.get(photo.image_url) ?? photo.image_url,
  }));
}

export async function getCandidatePhotos(candidateId: string) {
  return unstable_cache(
    async () => loadCandidatePhotosUncached(candidateId),
    ["cupid-candidate-photos", candidateId],
    { tags: [candidateProfileTag(candidateId)], revalidate: 45 },
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
