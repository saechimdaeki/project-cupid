import { mockCandidates, mockMatchRecords, mockMemberships } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import type { Candidate, CandidatePhoto, MatchRecord, Membership } from "@/lib/types";

function mapCandidate(row: any): Candidate {
  return {
    id: row.id,
    full_name: row.full_name,
    birth_year: row.birth_year,
    gender: row.gender,
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
    created_at: row.created_at,
    created_by_name: row.created_by_name,
  };
}

function mapMatchRecord(row: any): MatchRecord {
  return {
    id: row.id,
    candidate_id: row.candidate_id,
    counterpart_label: row.counterpart_label,
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

export async function getCandidates(filter?: string) {
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

  return data.map(mapCandidate);
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

  return mapCandidate(data);
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

  return data.map(mapMatchRecord);
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

  return data.map(mapPhoto);
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
