import { mockCandidates, mockMatchRecords, mockMemberships } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import type {
  Candidate,
  CandidatePhoto,
  MatchRecord,
  Membership,
  TimelineEvent,
} from "@/lib/types";

const CANDIDATE_PHOTOS_BUCKET = "sogaeting";
const SIGNED_URL_TTL_SECONDS = 60 * 60;
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

function normalizeGender(value: string | null | undefined) {
  if (value === "남" || value === "남성") {
    return "남";
  }

  if (value === "여" || value === "여성") {
    return "여";
  }

  return value ?? "";
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
    .createSignedUrl(value, SIGNED_URL_TTL_SECONDS, {
      transform: IMAGE_TRANSFORMS[variant],
    });

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

async function resolveSignedImageMap(
  supabase: Awaited<ReturnType<typeof createClient>>,
  values: Array<string | null | undefined>,
  variant: keyof typeof IMAGE_TRANSFORMS = "card",
) {
  const paths = Array.from(
    new Set(values.filter((value): value is string => Boolean(value) && !isDirectImageUrl(value))),
  );

  if (!paths.length || !supabase) {
    return new Map<string, string | null>();
  }

  const signedEntries = await Promise.all(
    paths.map(async (path) => [path, await resolveCandidateImage(supabase, path, variant)] as const),
  );

  return new Map(signedEntries);
}

function mapCandidate(row: any): Candidate {
  return {
    id: row.id,
    full_name: row.full_name,
    birth_year: row.birth_year,
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
    created_by_name: row.created_by_name,
  };
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
    image_url: null,
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
    "card",
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

export async function getDashboardCandidates() {
  const supabase = await createClient();

  if (!supabase) {
    return mockCandidates;
  }

  const { data, error } = await supabase
    .from("cupid_candidates")
    .select(
      "id, full_name, birth_year, gender, region, occupation, work_summary, religion, personality_summary, status, highlight_tags, paired_candidate_id, created_at",
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    return mockCandidates;
  }

  return mergeCandidates(data.map((row) => mapDashboardCandidate(row)), mockCandidates);
}

export async function getCandidateById(id: string) {
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

  return {
    ...candidate,
    image_url: await resolveCandidateImage(supabase, candidate.image_url, "detail"),
  };
}

export async function getMatchRecords(candidateId?: string) {
  const supabase = await createClient();

  if (!supabase) {
    return candidateId
      ? mockMatchRecords.filter((record) => record.candidate_id === candidateId)
      : mockMatchRecords;
  }

  let query = supabase
    .from("cupid_match_records")
    .select("*")
    .order("happened_on", { ascending: false });

  if (candidateId) {
    query = query.eq("candidate_id", candidateId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return candidateId
      ? mockMatchRecords.filter((record) => record.candidate_id === candidateId)
      : mockMatchRecords;
  }

  return mergeMatchRecords(
    data.map(mapMatchRecord),
    candidateId
      ? mockMatchRecords.filter((record) => record.candidate_id === candidateId)
      : mockMatchRecords,
  );
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
        ? `${sourceCandidate.full_name} × ${counterpartCandidate.full_name}`
        : sourceCandidate
          ? `${sourceCandidate.full_name} · ${sourceCandidate.birth_year}년생 · ${sourceCandidate.occupation}`
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

export async function getCandidatePhotos(candidateId: string) {
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
    "gallery",
  );

  return photos.map((photo) => ({
    ...photo,
    image_url: isDirectImageUrl(photo.image_url)
      ? photo.image_url
      : signedImageMap.get(photo.image_url) ?? photo.image_url,
  }));
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
