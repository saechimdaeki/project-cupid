import { mockCandidates, mockMatchRecords, mockMemberships } from "@/lib/mock-data";
import { unstable_cache } from "next/cache";
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
) {
  if (!value) {
    return null;
  }

  if (isDirectImageUrl(value) || !supabase) {
    return value;
  }

  const { data, error } = await supabase.storage
    .from(CANDIDATE_PHOTOS_BUCKET)
    .createSignedUrl(value, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
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

type GetCandidatesOptions =
  | string
  | {
      filter?: string;
      includeImages?: boolean;
    };

const getCachedCandidateRows = unstable_cache(
  async (filter?: string) => {
    const supabase = await createClient();

    if (!supabase) {
      return null;
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
      return null;
    }

    return data;
  },
  ["cupid-candidates"],
  { tags: ["candidates"], revalidate: 30 },
);

const getCachedMatchRecordRows = unstable_cache(
  async (candidateId?: string) => {
    const supabase = await createClient();

    if (!supabase) {
      return null;
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
      return null;
    }

    return data;
  },
  ["cupid-match-records"],
  { tags: ["match-records"], revalidate: 30 },
);

export async function getCandidates(options?: GetCandidatesOptions) {
  const filter = typeof options === "string" ? options : options?.filter;
  const includeImages = typeof options === "string" ? true : options?.includeImages ?? true;
  const supabase = await createClient();

  if (!supabase) {
    return filter ? mockCandidates.filter((candidate) => candidate.status === filter) : mockCandidates;
  }

  const data = await getCachedCandidateRows(filter);

  if (!data) {
    return filter ? mockCandidates.filter((candidate) => candidate.status === filter) : mockCandidates;
  }

  if (!includeImages) {
    return data.map((row) => mapCandidate(row));
  }

  return Promise.all(
    data.map(async (row) => {
      const candidate = mapCandidate(row);
      return {
        ...candidate,
        image_url: await resolveCandidateImage(supabase, candidate.image_url),
      };
    }),
  );
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
    image_url: await resolveCandidateImage(supabase, candidate.image_url),
  };
}

export async function getMatchRecords(candidateId?: string) {
  const supabase = await createClient();

  if (!supabase) {
    return candidateId
      ? mockMatchRecords.filter((record) => record.candidate_id === candidateId)
      : mockMatchRecords;
  }

  const data = await getCachedMatchRecordRows(candidateId);

  if (!data) {
    return candidateId
      ? mockMatchRecords.filter((record) => record.candidate_id === candidateId)
      : mockMatchRecords;
  }

  return data.map(mapMatchRecord);
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

  return Promise.all(
    data.map(async (row) => {
      const photo = mapPhoto(row);
      return {
        ...photo,
        image_url: (await resolveCandidateImage(supabase, photo.image_url)) ?? photo.image_url,
      };
    }),
  );
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

export async function getCurrentMembershipWithFallback() {
  const supabase = await createClient();

  if (!supabase) {
    return mockMemberships[0] ?? null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("cupid_memberships")
    .select("user_id, username, full_name, role, status, approved_by, approved_at, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return data ? mapMembership(data) : mockMemberships[0] ?? null;
}
